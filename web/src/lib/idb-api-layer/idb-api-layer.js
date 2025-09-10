/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
import Dexie from 'dexie';
import db from "./db.js";

function isTitleValid(newTitle) {
    return (
      newTitle.length > 0 &&
      newTitle.length < 9000 &&
      /*
          use regex to make sure title is not just a bunch of spaces
          (if removing all spaces makes it equal to an empty string, it's all spaces)
          notice the exclamation mark for negation
      */
      !(newTitle.replace(/[\s\p{C}]+/gu, "") == "")
    );
}

export default {
    getStudysetById: async function (id, resolveProps) {
        const studysets = await db.studysets.where("id").equals(id).toArray();
        if (studysets.length == 0) {
            return null;
        }
        
        if (resolveProps?.terms) {
            studysets[0].terms = await this.getTermsByStudysetId(
                id,
                resolveProps.terms
            );
        }
        if (resolveProps?.practiceTests) {
            studysets[0].practiceTests = await db.practiceTests.where("studysetId").equals(id).toArray();

            /* local timestamps are ISO strings in UTC, so alphanumeric/lexical sorting is the same as chronological sorting */
            studysets[0].practiceTests?.sort(
                (a, b) => b.timestamp.localeCompare(a.timestamp)
            );
        }

        return studysets[0];
    },
    getTermsByStudysetId: async function (studysetId, resolveProps) {
        const terms = await db.terms
            .where("[studysetId+sortOrder]")
            .between(
                [studysetId, Dexie.minKey],
                [studysetId, Dexie.maxKey],
                true,
                true
            ).toArray();
        if (resolveProps?.progress ||
            resolveProps?.progressHistory ||
            resolveProps?.topConfusionPairs ||
            resolveProps?.topReverseConfusionPairs
        ) {
            await Promise.all(
                terms.map(async term => {
                    let indicies = {};
                    let promises = [];
                    if (resolveProps?.progress) {
                        indicies.progress = promises.length;
                        promises.push(
                            db.termProgress.where("termId").equals(term.id).toArray()
                        );
                    }
                    if (resolveProps?.progressHistory) {
                        indicies.progressHistory = promises.length;
                        promises.push(
                            db.termProgressHistory.where("termId").equals(term.id).toArray()
                        );
                    }
                    if (resolveProps?.topConfusionPairs) {
                        indicies.topConfusionPairs = promises.length;
                        promises.push(
                            this.getTopConfusionPairs(term.id)
                        );
                    }
                    if (resolveProps?.topReverseConfusionPairs) {
                        indicies.topReverseConfusionPairs = promises.length;
                        promises.push(
                            this.getTopReverseConfusionPairs(term.id)
                        );
                    }
                    const results = await Promise.all(promises);
                    if (resolveProps?.progress) {
                        term.progress = results[indicies.progress]?.[0] ?? null;
                    }
                    if (resolveProps?.progressHistory) {
                        term.progressHistory = results[indicies.progressHistory];
                    }
                    if (resolveProps?.topConfusionPairs) {
                        term.topConfusionPairs = results[indicies.topConfusionPairs];
                    }
                    if (resolveProps?.topReverseConfusionPairs) {
                        term.topReverseConfusionPairs = results[indicies.topReverseConfusionPairs];
                    }
                })
            );
        }

        return terms;
    },
    getTermById: async function (termId, resolveProps) {
        let term = await db.terms.where("id").equals(termId).toArray()?.[0];
        if (term == null) {
            console.log("(idbApiLayer.getTermById) term not found")
            return term;
        }

        if (resolveProps?.progress) {
            term.progress = await db.termProgress.where("termId").equals(termId).toArray()?.[0];
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

        return term;
    },
    createStudyset: async function ({ title }, terms) {
        const rnISOString = (new Date()).toISOString();
        const newId = await db.studysets.add({
            title: isTitleValid(title) ?
                title : "Untitled Studyset",
            createdAt: rnISOString,
            updatedAt: rnISOString
        });
        
        let newTerms = [];
        terms.forEach(term => {
            newTerms.push({
                term: term.term,
                def: term.def,
                studysetId: newId,
                sortOrder: term.sortOrder,
                createdAt: rnISOString,
                updatedAt: rnISOString,
            })
        })
        await db.terms.bulkAdd(newTerms);
        return newId;
    },
    updateStudyset: async function ({ id, title }, terms, newTerms, deleteTermIDs) {
        const rnISOString = (new Date()).toISOString();
        await db.studysets.update(id, {
            title: isTitleValid(title) ?
                title : "Untitled Studyset",
            updatedAt: rnISOString
        });

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
        })
        if (bulkUpdateTerms.length > 0) {
            await db.terms.bulkUpdate(bulkUpdateTerms);
        }

        let bulkAddNewTerms = [];
        newTerms.forEach(term => {
            bulkAddNewTerms.push({
                term: term.term,
                def: term.def,
                studysetId: id,
                sortOrder: term.sortOrder,
                createdAt: rnISOString,
                updatedAt: rnISOString,
            })
        })
        await db.terms.bulkAdd(bulkAddNewTerms);

        await db.terms.bulkDelete(deleteTermIDs);
    },
    deleteStudyset: async function (id) {
        const termIds = await db.terms.where("studysetId").equals(id).primaryKeys(); /* get term IDs using studyset ID */
        await db.termProgress.where("termId").anyOf(termIds).delete(); /* delete progress using term IDs */
        await db.terms.where("studysetId").equals(id).delete(); /* delete terms using studyset ID */
        await db.studysets.delete(id); /* delete studyset */
    },
    updateTermProgress: async function (termProgressArray) {
        for (const {
            termId,
            termReviewedAt, defReviewedAt,
            termLeitnerSystemBox, defLeitnerSystemBox,
            termCorrectIncrease, termIncorrectIncrease,
            defCorrectIncrease, defIncorrectIncrease
        } of termProgressArray) {
            const existingProgress = await db.termProgress.where("termId").equals(termId);
            if (existingProgress?.length > 0) {
                const termCorrectCount = (existingProgress[0].termCorrectCount) + (termCorrectIncrease ?? 0);
                const termIncorrectCount = (existingProgress[0].termIncorrectCount) + (termIncorrectIncrease ?? 0);
                const defCorrectCount = (existingProgress[0].defCorrectCount) + (defCorrectIncrease ?? 0);
                const defIncorrectCount = (existingProgress[0].defIncorrectCount) + (defIncorrectIncrease ?? 0);

                await db.termProgress.update(
                    existingProgress[0].id,
                    {
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
                    }
                );

                await db.termProgressHistory.add({
                    termId: termId,
                    timestamp: (new Date()).toISOString(),
                    termCorrectCount: termCorrectCount,
                    termIncorrectCount: termIncorrectCount,
                    defCorrectCount: defCorrectCount,
                    defIncorrectCount: defIncorrectCount
                })
            } else {
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
        const confusionPairs = db.termConfusionPairs
            .where("[termId+confusedCount]")
            .between(
                [termId, Dexie.minKey],
                [termId, Dexie.maxKey],
                true,
                true
            ).reverse()
            .limit(3)
            .toArray();
        if (resolveProps?.confusedTerm) {
            await Promise.all(
                confusionPairs.map(async confusionPair => {
                    const confusedTerm = await db.terms.where("id").equals(confusionPair.confusedTermId);
                    confusionPair.confusedTerm = confusedTerm?.[0] ?? null;
                })
            );
        }
        return confusionPairs;
    },
    getTopReverseConfusionPairs: async function (confusedTermId, resolveProps) {
        const confusionPairs = db.termConfusionPairs
            .where("[confusedTermId+confusedCount]")
            .between(
                [confusedTermId, Dexie.minKey],
                [confusedTermId, Dexie.maxKey],
                true,
                true
            ).reverse()
            .limit(3)
            .toArray();
        if (resolveProps?.term) {
            await Promise.all(
                confusionPairs.map(async confusionPair => {
                    const term = await db.terms.where("id").equals(confusionPair.termId);
                    confusionPair.term = term?.[0] ?? null;
                })
            );
        }
        return confusionPairs;
    },
    recordConfusionPairs: async function (confusionPairs) {
        for (const confusionPairInput of confusionPairs) {
            const existingRow = await db.termConfusionPairs.where(
                "[termId+confusedTermId]"
            ).equals([
                confusionPairInput.termId,
                confusionPairInput.confusedTermId,
            ]).filter(
                row => row.answeredWith == confusionPairInput.answeredWith
            ).toArray();
            if (existingRow.length > 0) {
                db.termConfusionPairs.update(
                    existingRow[0].id,
                    {
                        confusedCount: existingRow[0].confusedCount + confusionPairInput.confusedCountIncrease,
                        lastConfusedAt: confusionPairInput.confusedAt
                    }
                );
            } else {
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
}
