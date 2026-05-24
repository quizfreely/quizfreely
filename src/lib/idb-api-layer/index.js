/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025-2026 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
import Dexie from 'dexie';
import { db } from "./db";
import { idbLayerImg } from "./images";
function isTitleValid(newTitle) {
    return (newTitle.length > 0 &&
        newTitle.length < 9000 &&
        /*
            use regex to make sure title is not just a bunch of spaces
            (if removing all spaces makes it equal to an empty string, it's all spaces)
            notice the exclamation mark for negation
        */
        !(newTitle.replace(/[\s\p{C}]+/gu, "") == ""));
}
export * from "./db";
export * from "./images";
export const idbApiLayer = {
    getStudysetById: async function (id, resolveProps) {
        const studysets = await db.studysets.where("id").equals(id).toArray();
        if (studysets.length == 0) {
            return null;
        }
        if (resolveProps?.terms) {
            studysets[0].terms = await this.getTermsByStudysetId(id, resolveProps.terms === true ? undefined : resolveProps.terms);
        }
        if (resolveProps?.practiceTests) {
            studysets[0].practiceTests = await db.practiceTests.where("studysetId").equals(id).toArray();
            /* local timestamps are ISO strings in UTC, so alphanumeric/lexical sorting is the same as chronological sorting */
            studysets[0].practiceTests?.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        }
        return studysets[0];
    },
    getTermsByStudysetId: async function (studysetId, resolveProps) {
        const terms = await db.terms
            .where("[studysetId+sortOrder]")
            .between([studysetId, Dexie.minKey], [studysetId, Dexie.maxKey], true, true).toArray();
        if (resolveProps?.progress ||
            resolveProps?.progressHistory ||
            resolveProps?.topConfusionPairs ||
            resolveProps?.topReverseConfusionPairs ||
            resolveProps?.termImageUrl ||
            resolveProps?.defImageUrl) {
            await Promise.all(terms.map(async (term) => {
                const promises = {};
                if (resolveProps?.progress) {
                    promises.progress = db.termProgress.where("termId").equals(term.id).toArray();
                }
                if (resolveProps?.progressHistory) {
                    promises.progressHistory = db.termProgressHistory.where("termId").equals(term.id).toArray();
                }
                if (resolveProps?.topConfusionPairs) {
                    promises.topConfusionPairs = this.getTopConfusionPairs(term.id);
                }
                if (resolveProps?.topReverseConfusionPairs) {
                    promises.topReverseConfusionPairs = this.getTopReverseConfusionPairs(term.id);
                }
                if (resolveProps?.termImageUrl && term.termImageKey != null) {
                    promises.termImageUrl = idbLayerImg.getImageObjectUrl(term.termImageKey);
                }
                if (resolveProps?.defImageUrl && term.defImageKey != null) {
                    promises.defImageUrl = idbLayerImg.getImageObjectUrl(term.defImageKey);
                }
                const results = await Promise.all(Object.entries(promises).map(async ([k, p]) => [k, await p]));
                const resolved = Object.fromEntries(results);
                term.progress = resolved.progress?.[0] ?? undefined;
                term.progressHistory = resolved.progressHistory;
                term.topConfusionPairs = resolved.topConfusionPairs;
                term.topReverseConfusionPairs = resolved.topReverseConfusionPairs;
                term.termImageUrl = term.termImageKey == null ? null : resolved.termImageUrl;
                term.defImageUrl = term.defImageKey == null ? null : resolved.defImageUrl;
            }));
        }
        return terms;
    },
    getTermById: async function (termId, resolveProps) {
        let term = (await db.terms.where("id").equals(termId).toArray())?.[0];
        if (term == null) {
            console.log("(idbApiLayer.getTermById) term not found");
            return term;
        }
        if (resolveProps?.progress) {
            term.progress = (await db.termProgress.where("termId").equals(termId).toArray())?.[0];
        }
        if (resolveProps?.progressHistory) {
            term.progressHistory = await db.termProgressHistory.where("termId").equals(termId).toArray();
        }
        if (resolveProps?.topConfusionPairs) {
            term.topConfusionPairs = await this.getTopConfusionPairs(term.id);
        }
        if (resolveProps?.topReverseConfusionPairs) {
            term.topReverseConfusionPairs = await this.getTopReverseConfusionPairs(term.id);
        }
        if (resolveProps?.termImageUrl) {
            term.termImageUrl = term.termImageKey == null ? null : await idbLayerImg.getImageObjectUrl(term.termImageKey);
        }
        if (resolveProps?.defImageUrl) {
            term.defImageUrl = term.defImageKey == null ? null : await idbLayerImg.getImageObjectUrl(term.defImageKey);
        }
        return term;
    },
    createStudyset: async function ({ title, draft }) {
        const rnISOString = (new Date()).toISOString();
        const newId = await db.studysets.add({
            title: isTitleValid(title) || (draft && title == "") ?
                title : "Untitled Studyset",
            draft,
            createdAt: rnISOString,
            updatedAt: rnISOString
        });
        return newId;
    },
    updateStudyset: async function ({ id, title, draft }) {
        const rnISOString = (new Date()).toISOString();
        await db.studysets.update(id, {
            title: isTitleValid(title) || (draft && title == "") ?
                title : "Untitled Studyset",
            draft,
            updatedAt: rnISOString
        });
    },
    createTerms: async function (studysetId, newTerms) {
        const rnISOString = (new Date()).toISOString();
        let bulkAddNewTerms = [];
        newTerms.forEach(term => {
            bulkAddNewTerms.push({
                term: term.term,
                def: term.def,
                studysetId: studysetId,
                sortOrder: term.sortOrder,
                createdAt: rnISOString,
                updatedAt: rnISOString,
            });
        });
        return await db.terms.bulkAdd(bulkAddNewTerms);
    },
    updateTerms: async function (terms) {
        const rnISOString = (new Date()).toISOString();
        let bulkUpdateTerms = [];
        terms.forEach(term => {
            bulkUpdateTerms.push({
                key: term.id,
                changes: {
                    term: term.term,
                    def: term.def,
                    sortOrder: term.sortOrder,
                    updatedAt: rnISOString,
                }
            });
        });
        if (bulkUpdateTerms.length > 0) {
            await db.terms.bulkUpdate(bulkUpdateTerms);
        }
    },
    deleteTerms: async function (deleteTermIDs) {
        const terms = await db.terms.bulkGet(deleteTermIDs);
        let imageKeysToDelete = [];
        terms.forEach(t => {
            if (t?.termImageKey != null) {
                imageKeysToDelete.push(t.termImageKey);
            }
            if (t?.defImageKey != null) {
                imageKeysToDelete.push(t.defImageKey);
            }
        });
        await idbLayerImg.deleteImages(imageKeysToDelete);
        await db.termProgress.where("termId").anyOf(deleteTermIDs).delete();
        await db.terms.bulkDelete(deleteTermIDs);
    },
    deleteStudyset: async function (id) {
        await this.deleteTerms(await db.terms.where("studysetId").equals(id).primaryKeys());
        await db.studysets.delete(id);
    },
    updateTermProgress: async function (termProgressArray) {
        for (const { termId, termReviewedAt, defReviewedAt, termLeitnerSystemBox, defLeitnerSystemBox, termCorrectIncrease, termIncorrectIncrease, defCorrectIncrease, defIncorrectIncrease } of termProgressArray) {
            const existingProgress = await db.termProgress.where("termId").equals(termId).toArray();
            if (existingProgress?.length > 0) {
                const termCorrectCount = (existingProgress[0].termCorrectCount) + (termCorrectIncrease ?? 0);
                const termIncorrectCount = (existingProgress[0].termIncorrectCount) + (termIncorrectIncrease ?? 0);
                const defCorrectCount = (existingProgress[0].defCorrectCount) + (defCorrectIncrease ?? 0);
                const defIncorrectCount = (existingProgress[0].defIncorrectCount) + (defIncorrectIncrease ?? 0);
                await db.termProgress.update(existingProgress[0].id, {
                    termLastReviewedAt: termReviewedAt != null ?
                        termReviewedAt : existingProgress[0].termLastReviewedAt,
                    termReviewCount: termReviewedAt != null ?
                        (existingProgress[0]?.termReviewCount ?? 0) + 1 :
                        existingProgress[0]?.termReviewCount,
                    defLastReviewedAt: defReviewedAt != null ?
                        defReviewedAt : existingProgress[0].defLastReviewedAt,
                    defReviewCount: defReviewedAt != null ?
                        (existingProgress[0]?.defReviewCount ?? 0) + 1 :
                        existingProgress[0]?.defReviewCount,
                    termLeitnerSystemBox: termLeitnerSystemBox ?? existingProgress[0].termLeitnerSystemBox,
                    defLeitnerSystemBox: defLeitnerSystemBox ?? existingProgress[0].defLeitnerSystemBox,
                    termCorrectCount: termCorrectCount,
                    termIncorrectCount: termIncorrectCount,
                    defCorrectCount: defCorrectCount,
                    defIncorrectCount: defIncorrectCount
                });
                await db.termProgressHistory.add({
                    termId: termId,
                    timestamp: (new Date()).toISOString(),
                    termCorrectCount: termCorrectCount,
                    termIncorrectCount: termIncorrectCount,
                    defCorrectCount: defCorrectCount,
                    defIncorrectCount: defIncorrectCount
                });
            }
            else {
                const newProgressId = await db.termProgress.add({
                    termId: termId,
                    termFirstReviewedAt: termReviewedAt,
                    termLastReviewedAt: termReviewedAt,
                    termReviewCount: termReviewedAt != null ?
                        1 : 0,
                    defFirstReviewedAt: defReviewedAt,
                    defLastReviewedAt: defReviewedAt,
                    defReviewCount: defReviewedAt != null ?
                        1 : 0,
                    termLeitnerSystemBox: termLeitnerSystemBox,
                    defLeitnerSystemBox: defLeitnerSystemBox,
                    termCorrectCount: termCorrectIncrease ?? 0,
                    termIncorrectCount: termIncorrectIncrease ?? 0,
                    defCorrectCount: defCorrectIncrease ?? 0,
                    defIncorrectCount: defIncorrectIncrease ?? 0
                });
                await db.termProgressHistory.add({
                    termId: termId,
                    timestamp: (new Date()).toISOString(),
                    termCorrectCount: termCorrectIncrease ?? 0,
                    termIncorrectCount: termIncorrectIncrease ?? 0,
                    defCorrectCount: defCorrectIncrease ?? 0,
                    defIncorrectCount: defIncorrectIncrease ?? 0
                });
            }
        }
    },
    getTopConfusionPairs: async function (termId, resolveProps) {
        const confusionPairs = await db.termConfusionPairs
            .where("[termId+confusedCount]")
            .between([termId, Dexie.minKey], [termId, Dexie.maxKey], true, true).reverse()
            .limit(3)
            .toArray();
        if (resolveProps?.confusedTerm) {
            await Promise.all(confusionPairs.map(async (confusionPair) => {
                if (typeof confusionPair.confusedTermId === "string") {
                    console.error("getTopConfusionPairs: confusedTermId is a string (mabye a UUID), can't resolve confusedTerm");
                    return;
                }
                confusionPair.confusedTerm = await this.getTermById(confusionPair.confusedTermId, resolveProps?.confusedTerm);
            }));
        }
        return confusionPairs;
    },
    getTopReverseConfusionPairs: async function (confusedTermId, resolveProps) {
        const confusionPairs = await db.termConfusionPairs
            .where("[confusedTermId+confusedCount]")
            .between([confusedTermId, Dexie.minKey], [confusedTermId, Dexie.maxKey], true, true).reverse()
            .limit(3)
            .toArray();
        if (resolveProps?.term) {
            await Promise.all(confusionPairs.map(async (confusionPair) => {
                if (typeof confusionPair.termId === "string") {
                    console.error("getTopReverseConfusionPairs: termId is a string (mabye a UUID), can't resolve term");
                    return;
                }
                confusionPair.term = await this.getTermById(confusionPair.termId, resolveProps?.term);
            }));
        }
        return confusionPairs;
    },
    recordConfusionPairs: async function (confusionPairs) {
        for (const confusionPairInput of confusionPairs) {
            if (confusionPairInput.termId == confusionPairInput.confusedTermId) {
                console.log("Skipped confusion pair with same term & confused term ID when recording confusion pairs");
                continue;
            }
            const existingRow = await db.termConfusionPairs.where("[termId+confusedTermId]").equals([
                confusionPairInput.termId,
                confusionPairInput.confusedTermId,
            ]).filter(row => row.answeredWith == confusionPairInput.answeredWith).toArray();
            if (existingRow.length > 0) {
                db.termConfusionPairs.update(existingRow[0].id, {
                    confusedCount: existingRow[0].confusedCount + confusionPairInput.confusedCountIncrease,
                    lastConfusedAt: confusionPairInput.confusedAt
                });
            }
            else {
                db.termConfusionPairs.add({
                    termId: confusionPairInput.termId,
                    confusedTermId: confusionPairInput.confusedTermId,
                    answeredWith: confusionPairInput.answeredWith,
                    confusedCount: confusionPairInput.confusedCountIncrease,
                    lastConfusedAt: confusionPairInput.confusedAt
                });
            }
        }
        return true;
    },
    recordPracticeTest: async function (practiceTest) {
        /* returns id after inserting */
        return await db.practiceTests.add(practiceTest);
    }
};
