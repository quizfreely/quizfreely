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
const RECENT_ACTIVITY_LIMIT = 100;
function toGraphQLQuestion(q) {
    const term = { id: q.termId, term: q.term, def: q.def };
    const result = { id: q.id };
    if (q.type === "mcq") {
        const data = q.data;
        result.mcq = {
            answerWith: q.answerWith,
            term,
            correct: q.correct,
            correctChoiceIndex: data.correctChoiceIndex,
            answeredIndex: data.answeredIndex,
            distractors: data.distractors
        };
    }
    else if (q.type === "tfq") {
        const data = q.data;
        result.tfq = {
            answerWith: q.answerWith,
            term,
            correct: q.correct,
            answeredBool: data.answeredBool,
            distractor: data.distractor ?? undefined
        };
    }
    else if (q.type === "frq") {
        const data = q.data;
        result.frq = {
            answerWith: q.answerWith,
            term,
            correct: q.correct,
            answeredString: data.answeredString,
            userMarkedCorrect: data.userMarkedCorrect
        };
    }
    return result;
}
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
async function ensureRecentActivityLimit(studysetId, timestamp) {
    await db.recentActivity.add({ studysetId, timestamp });
    /* keep at most RECENT_ACTIVITY_LIMIT entries: delete the oldest duplicate per studyset,
       then trim to the limit by removing the oldest records */
    const all = await db.recentActivity.orderBy("id").reverse().toArray();
    const seen = new Map();
    const toDelete = [];
    for (const row of all) {
        const existing = seen.get(row.studysetId);
        if (existing !== undefined) {
            toDelete.push(row.id);
        }
        else {
            seen.set(row.studysetId, row.id);
        }
    }
    if (toDelete.length > 0) {
        await db.recentActivity.bulkDelete(toDelete);
    }
    const remaining = await db.recentActivity.orderBy("id").toArray();
    if (remaining.length > RECENT_ACTIVITY_LIMIT) {
        const excessIds = remaining.slice(0, remaining.length - RECENT_ACTIVITY_LIMIT).map((r) => r.id);
        if (excessIds.length > 0) {
            await db.recentActivity.bulkDelete(excessIds);
        }
    }
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
            studysets[0].practiceTests = await db.practiceTests.where("studysetIds").equals(id).toArray();
            /* local timestamps are ISO strings in UTC, so alphanumeric/lexical sorting is the same as chronological sorting */
            studysets[0].practiceTests?.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            await Promise.all(studysets[0].practiceTests.map(async (pt) => {
                const rawQuestions = await db.practiceTestQuestions
                    .where("practiceTestId").equals(pt.id)
                    .sortBy("position");
                pt.questions = rawQuestions.map(toGraphQLQuestion);
            }));
        }
        if (resolveProps?.matchActivities) {
            studysets[0].matchActivities = await db.matchActivities.where("studysetIds").equals(id).toArray();
            /* local timestamps are ISO strings in UTC, so alphanumeric/lexical sorting is the same as chronological sorting */
            studysets[0].matchActivities?.sort((a, b) => b.endTimestamp.localeCompare(a.endTimestamp));
        }
        return studysets[0];
    },
    getTermsByStudysetId: async function (studysetId, resolveProps) {
        const terms = await db.terms
            .where("[studysetId+sortOrder]")
            .between([studysetId, Dexie.minKey], [studysetId, Dexie.maxKey], true, true).toArray();
        if (resolveProps?.progress ||
            resolveProps?.termImageUrl ||
            resolveProps?.defImageUrl) {
            await Promise.all(terms.map(async (term) => {
                const promises = {};
                if (resolveProps?.progress) {
                    promises.progress = db.termProgress.where("termId").equals(term.id).toArray();
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
        if (resolveProps?.termImageUrl) {
            term.termImageUrl = term.termImageKey == null ? null : await idbLayerImg.getImageObjectUrl(term.termImageKey);
        }
        if (resolveProps?.defImageUrl) {
            term.defImageUrl = term.defImageKey == null ? null : await idbLayerImg.getImageObjectUrl(term.defImageKey);
        }
        return term;
    },
    getTermsByIds: async function (termIds, resolveProps) {
        const rawTerms = await db.terms.bulkGet(termIds);
        const terms = rawTerms.map(t => t ?? null);
        if (resolveProps?.progress ||
            resolveProps?.termImageUrl ||
            resolveProps?.defImageUrl) {
            await Promise.all(terms.map(async (term) => {
                if (term == null)
                    return;
                const promises = {};
                if (resolveProps?.progress) {
                    promises.progress = db.termProgress.where("termId").equals(term.id).toArray();
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
                term.termImageUrl = term.termImageKey == null ? null : resolved.termImageUrl;
                term.defImageUrl = term.defImageKey == null ? null : resolved.defImageUrl;
            }));
        }
        return terms;
    },
    getStudysetsByIds: async function (ids, resolveProps) {
        const studysets = await db.studysets.bulkGet(ids);
        if (resolveProps?.terms) {
            const allTerms = await db.terms
                .where("studysetId")
                .anyOf(ids)
                .toArray();
            const termsByStudysetId = new Map();
            for (const term of allTerms) {
                let list = termsByStudysetId.get(term.studysetId);
                if (!list) {
                    list = [];
                    termsByStudysetId.set(term.studysetId, list);
                }
                list.push(term);
            }
            const termResolveProps = resolveProps.terms === true ? undefined : resolveProps.terms;
            for (const studyset of studysets) {
                if (studyset == null)
                    continue;
                const terms = termsByStudysetId.get(studyset.id) || [];
                terms.sort((a, b) => a.sortOrder - b.sortOrder);
                if (resolveProps.termsCount) {
                    studyset.termsCount = terms.length;
                }
                if (termResolveProps) {
                    await Promise.all(terms.map(async (term) => {
                        const promises = {};
                        if (termResolveProps.progress) {
                            promises.progress = db.termProgress.where("termId").equals(term.id).toArray();
                        }
                        if (termResolveProps.termImageUrl && term.termImageKey != null) {
                            promises.termImageUrl = idbLayerImg.getImageObjectUrl(term.termImageKey);
                        }
                        if (termResolveProps.defImageUrl && term.defImageKey != null) {
                            promises.defImageUrl = idbLayerImg.getImageObjectUrl(term.defImageKey);
                        }
                        const results = await Promise.all(Object.entries(promises).map(async ([k, p]) => [k, await p]));
                        const resolved = Object.fromEntries(results);
                        term.progress = resolved.progress?.[0] ?? undefined;
                        term.termImageUrl = term.termImageKey == null ? null : resolved.termImageUrl;
                        term.defImageUrl = term.defImageKey == null ? null : resolved.defImageUrl;
                    }));
                }
                studyset.terms = terms;
            }
        }
        else if (resolveProps?.termsCount) {
            const allTerms = await db.terms
                .where("studysetId")
                .anyOf(ids)
                .toArray();
            const countByStudysetId = new Map();
            for (const term of allTerms) {
                countByStudysetId.set(term.studysetId, (countByStudysetId.get(term.studysetId) ?? 0) + 1);
            }
            for (const studyset of studysets) {
                if (studyset == null)
                    continue;
                studyset.termsCount = countByStudysetId.get(studyset.id) ?? 0;
            }
        }
        return studysets;
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
        await db.reviewEvents.where("termId").anyOf(deleteTermIDs).delete();
        await db.terms.bulkDelete(deleteTermIDs);
    },
    deleteStudyset: async function (id) {
        await this.deleteTerms(await db.terms.where("studysetId").equals(id).primaryKeys());
        await db.studysets.delete(id);
    },
    updateTermProgress: async function (termProgressArray) {
        for (const { termId, termReviewedAt, defReviewedAt, termCorrectIncrease, termIncorrectIncrease, defCorrectIncrease, defIncorrectIncrease } of termProgressArray) {
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
                    termCorrectCount: termCorrectCount,
                    termIncorrectCount: termIncorrectCount,
                    defCorrectCount: defCorrectCount,
                    defIncorrectCount: defIncorrectCount
                });
            }
            else {
                await db.termProgress.add({
                    termId: termId,
                    termFirstReviewedAt: termReviewedAt,
                    termLastReviewedAt: termReviewedAt,
                    termReviewCount: termReviewedAt != null ?
                        1 : 0,
                    defFirstReviewedAt: defReviewedAt,
                    defLastReviewedAt: defReviewedAt,
                    defReviewCount: defReviewedAt != null ?
                        1 : 0,
                    termCorrectCount: termCorrectIncrease ?? 0,
                    termIncorrectCount: termIncorrectIncrease ?? 0,
                    defCorrectCount: defCorrectIncrease ?? 0,
                    defIncorrectCount: defIncorrectIncrease ?? 0
                });
            }
        }
    },
    recordPracticeTest: async function (practiceTest, getCloudStudysetIds) {
        return await db.transaction('rw', [db.practiceTests, db.practiceTestQuestions, db.termProgress, db.terms, db.reviewEvents, db.recentActivity], async () => {
            const rnISOString = (new Date()).toISOString();
            const termProgressMap = new Map();
            const studysetIds = new Set();
            const involvedTermIds = new Set();
            let questionsCorrect = 0;
            let questionsTotal = 0;
            const questionsToInsert = [];
            if (practiceTest.questions && Array.isArray(practiceTest.questions)) {
                questionsTotal = practiceTest.questions.length;
                for (let i = 0; i < practiceTest.questions.length; i++) {
                    const q = practiceTest.questions[i];
                    if (!q)
                        continue;
                    let termId = null;
                    let answerWith = null;
                    let correct = false;
                    let type = "mcq";
                    let term = "";
                    let def = "";
                    let qData = {};
                    if (q.mcq) {
                        type = "mcq";
                        if (!q.mcq.term)
                            throw new Error("MCQ question is missing term");
                        termId = q.mcq.term.id;
                        term = q.mcq.term.term || q.mcq.term.termSnapshot || "";
                        def = q.mcq.term.def || q.mcq.term.defSnapshot || "";
                        answerWith = q.mcq.answerWith;
                        correct = !!q.mcq.correct;
                        qData = {
                            distractors: (q.mcq.distractors || []).map((d) => {
                                if (d.id)
                                    involvedTermIds.add(d.id);
                                return {
                                    id: d.id,
                                    term: d.term || d.termSnapshot || "",
                                    def: d.def || d.defSnapshot || ""
                                };
                            }),
                            correctChoiceIndex: q.mcq.correctChoiceIndex,
                            answeredIndex: q.mcq.answeredIndex
                        };
                    }
                    else if (q.tfq) {
                        type = "tfq";
                        if (!q.tfq.term)
                            throw new Error("TFQ question is missing term");
                        termId = q.tfq.term.id;
                        term = q.tfq.term.term || q.tfq.term.termSnapshot || "";
                        def = q.tfq.term.def || q.tfq.term.defSnapshot || "";
                        answerWith = q.tfq.answerWith;
                        correct = !!q.tfq.correct;
                        if (q.tfq.distractor?.id)
                            involvedTermIds.add(q.tfq.distractor.id);
                        qData = {
                            distractor: q.tfq.distractor ? {
                                id: q.tfq.distractor.id,
                                term: q.tfq.distractor.term || q.tfq.distractor.termSnapshot || "",
                                def: q.tfq.distractor.def || q.tfq.distractor.defSnapshot || ""
                            } : null,
                            answeredBool: q.tfq.answeredBool
                        };
                    }
                    else if (q.frq) {
                        type = "frq";
                        if (!q.frq.term)
                            throw new Error("FRQ question is missing term");
                        termId = q.frq.term.id;
                        term = q.frq.term.term || q.frq.term.termSnapshot || "";
                        def = q.frq.term.def || q.frq.term.defSnapshot || "";
                        answerWith = q.frq.answerWith;
                        correct = !!q.frq.correct || !!q.frq.userMarkedCorrect;
                        qData = {
                            answeredString: q.frq.answeredString || "",
                            userMarkedCorrect: !!q.frq.userMarkedCorrect
                        };
                    }
                    if (correct)
                        questionsCorrect++;
                    if (termId == null)
                        continue;
                    involvedTermIds.add(termId);
                    let answeredTermId = null;
                    let answeredString = null;
                    if (type === "mcq") {
                        const correctChoiceIndex = q.mcq.correctChoiceIndex;
                        const answeredIndex = q.mcq.answeredIndex;
                        const distractors = q.mcq.distractors || [];
                        if (answeredIndex === correctChoiceIndex) {
                            answeredTermId = termId;
                        }
                        else if (answeredIndex != null) {
                            if (answeredIndex < correctChoiceIndex) {
                                answeredTermId = distractors[answeredIndex]?.id ?? null;
                            }
                            else {
                                answeredTermId = distractors[answeredIndex - 1]?.id ?? null;
                            }
                        }
                    }
                    else if (type === "tfq") {
                        const answeredBool = q.tfq.answeredBool;
                        const distractorTermId = q.tfq.distractor?.id;
                        if (correct) {
                            answeredTermId = termId;
                        }
                        else {
                            if (answeredBool === true) {
                                // user answered "true", but it was false, so they picked the distractor
                                answeredTermId = distractorTermId ?? null;
                            }
                            else {
                                // user answered "false", but it was true, so they didn't pick a distractor
                                answeredTermId = null;
                            }
                        }
                    }
                    else if (type === "frq") {
                        answeredString = q.frq.answeredString || "";
                        answeredTermId = null;
                    }
                    questionsToInsert.push({
                        termId,
                        term,
                        def,
                        type,
                        position: i,
                        correct,
                        answerWith,
                        data: qData,
                        reviewEventData: {
                            termId,
                            correct,
                            answerWith: answerWith || "",
                            timestamp: practiceTest.timestamp || rnISOString,
                            answeredTermId,
                            practiceTestQuestionType: type,
                            reviewActivityType: "PRACTICE_TEST",
                            answeredString
                        }
                    });
                    let tp = termProgressMap.get(termId);
                    if (!tp) {
                        tp = {
                            termId,
                            termReviewedAt: null,
                            defReviewedAt: null,
                            termCorrectIncrease: 0,
                            termIncorrectIncrease: 0,
                            defCorrectIncrease: 0,
                            defIncorrectIncrease: 0
                        };
                        termProgressMap.set(termId, tp);
                    }
                    if (correct) {
                        if (answerWith === "DEF") {
                            tp.defCorrectIncrease += 1;
                            tp.defReviewedAt = rnISOString;
                        }
                        else {
                            tp.termCorrectIncrease += 1;
                            tp.termReviewedAt = rnISOString;
                        }
                    }
                    else {
                        if (answerWith === "DEF") {
                            tp.defIncorrectIncrease += 1;
                            tp.defReviewedAt = rnISOString;
                        }
                        else {
                            tp.termIncorrectIncrease += 1;
                            tp.termReviewedAt = rnISOString;
                        }
                    }
                }
            }
            // Fetch studysetIds for all involved terms
            const localInvolvedTermIds = Array.from(involvedTermIds).filter(id => (typeof id === 'number') || (typeof id === 'string' && !id.includes('-')));
            if (localInvolvedTermIds.length > 0) {
                const termIdsForLookup = localInvolvedTermIds.map(id => Number(id));
                const termsForLookup = await db.terms.bulkGet(termIdsForLookup);
                termsForLookup.forEach(t => { if (t?.studysetId != null)
                    studysetIds.add(t.studysetId); });
            }
            const cloudInvolvedTermIds = Array.from(involvedTermIds).filter(id => typeof id === 'string' && id.includes('-'));
            if (cloudInvolvedTermIds.length > 0 && getCloudStudysetIds) {
                const cloudStudysetIds = await getCloudStudysetIds(cloudInvolvedTermIds);
                cloudStudysetIds.forEach(id => { if (id != null)
                    studysetIds.add(id); });
            }
            for (const tp of termProgressMap.values()) {
                const existingProgress = await db.termProgress.where("termId").equals(tp.termId).toArray();
                if (existingProgress?.length > 0) {
                    await db.termProgress.update(existingProgress[0].id, {
                        termLastReviewedAt: tp.termReviewedAt != null ?
                            tp.termReviewedAt : existingProgress[0].termLastReviewedAt,
                        termReviewCount: tp.termReviewedAt != null ?
                            (existingProgress[0]?.termReviewCount ?? 0) + 1 :
                            existingProgress[0]?.termReviewCount,
                        defLastReviewedAt: tp.defReviewedAt != null ?
                            tp.defReviewedAt : existingProgress[0].defLastReviewedAt,
                        defReviewCount: tp.defReviewedAt != null ?
                            (existingProgress[0]?.defReviewCount ?? 0) + 1 :
                            existingProgress[0]?.defReviewCount,
                        termCorrectCount: (existingProgress[0].termCorrectCount) + (tp.termCorrectIncrease),
                        termIncorrectCount: (existingProgress[0].termIncorrectCount) + (tp.termIncorrectIncrease),
                        defCorrectCount: (existingProgress[0].defCorrectCount) + (tp.defCorrectIncrease),
                        defIncorrectCount: (existingProgress[0].defIncorrectCount) + (tp.defIncorrectIncrease)
                    });
                }
                else {
                    await db.termProgress.add({
                        termId: tp.termId,
                        termFirstReviewedAt: tp.termReviewedAt,
                        termLastReviewedAt: tp.termReviewedAt,
                        termReviewCount: tp.termReviewedAt != null ? 1 : 0,
                        defFirstReviewedAt: tp.defReviewedAt,
                        defLastReviewedAt: tp.defReviewedAt,
                        defReviewCount: tp.defReviewedAt != null ? 1 : 0,
                        termCorrectCount: tp.termCorrectIncrease,
                        termIncorrectCount: tp.termIncorrectIncrease,
                        defCorrectCount: tp.defCorrectIncrease,
                        defIncorrectCount: tp.defIncorrectIncrease
                    });
                }
            }
            const ptRecord = {
                timestamp: practiceTest.timestamp || rnISOString,
                questionsCorrect,
                questionsTotal,
                studysetIds: Array.from(studysetIds)
            };
            const ptId = await db.practiceTests.add(ptRecord);
            for (const sid of studysetIds) {
                await ensureRecentActivityLimit(sid, ptRecord.timestamp);
            }
            for (const q of questionsToInsert) {
                q.practiceTestId = ptId;
                const reviewEventData = q.reviewEventData;
                delete q.reviewEventData;
                const questionId = await db.practiceTestQuestions.add(q);
                await db.reviewEvents.add({
                    ...reviewEventData,
                    practiceTestQuestionId: questionId
                });
            }
            return await this.getPracticeTestWithQuestions(ptId);
        });
    },
    getPracticeTestWithQuestions: async function (ptId) {
        const pt = await db.practiceTests.get(ptId);
        if (!pt)
            return null;
        const rawQuestions = await db.practiceTestQuestions
            .where("practiceTestId").equals(ptId)
            .sortBy("position");
        pt.questions = rawQuestions.map(toGraphQLQuestion);
        return pt;
    },
    updatePracticeTestQuestion: async function (id, correct, userMarkedCorrect) {
        return await db.transaction('rw', [db.practiceTests, db.practiceTestQuestions, db.termProgress, db.reviewEvents], async () => {
            const question = await db.practiceTestQuestions.get(id);
            if (!question)
                throw new Error("Question not found");
            const wasCorrect = question.correct;
            const isCorrect = correct;
            // FRQ overall correctness accounts for userMarkedCorrect (same logic as recordPracticeTest)
            let wasOverallCorrect = wasCorrect;
            let isOverallCorrect = isCorrect;
            if (question.type === "frq") {
                const existingUserMarkedCorrect = !!question.data.userMarkedCorrect;
                const newUserMarkedCorrect = userMarkedCorrect !== undefined ? !!userMarkedCorrect : existingUserMarkedCorrect;
                wasOverallCorrect = wasCorrect || existingUserMarkedCorrect;
                isOverallCorrect = isCorrect || newUserMarkedCorrect;
            }
            if (wasCorrect === isCorrect && question.type === "frq" && question.data.userMarkedCorrect === userMarkedCorrect) {
                return toGraphQLQuestion(question);
            }
            // Update question
            const newData = { ...question.data };
            if (question.type === "frq") {
                newData.userMarkedCorrect = userMarkedCorrect;
            }
            await db.practiceTestQuestions.update(id, {
                correct: isCorrect,
                data: newData
            });
            // Update review event
            const reviewEvents = await db.reviewEvents.where("practiceTestQuestionId").equals(id).toArray();
            if (reviewEvents.length > 1) {
                console.warn(`(idbApiLayer.updatePracticeTestQuestion) Multiple review events found for practiceTestQuestionId ${id}. Updating the first one.`);
            }
            if (reviewEvents.length > 0) {
                await db.reviewEvents.update(reviewEvents[0].id, {
                    correct: isCorrect
                });
            }
            // Update practice test accuracy
            if (wasOverallCorrect !== isOverallCorrect) {
                const pt = await db.practiceTests.get(question.practiceTestId);
                if (pt) {
                    await db.practiceTests.update(pt.id, {
                        questionsCorrect: pt.questionsCorrect + (isOverallCorrect ? 1 : -1)
                    });
                }
                // Update term progress (uses overall correctness, same logic as recordPracticeTest)
                const existingProgress = await db.termProgress.where("termId").equals(question.termId).toArray();
                if (existingProgress?.length > 0) {
                    const changes = {};
                    if (question.answerWith === "DEF") {
                        changes.defCorrectCount = existingProgress[0].defCorrectCount + (isOverallCorrect ? 1 : -1);
                        changes.defIncorrectCount = existingProgress[0].defIncorrectCount + (isOverallCorrect ? -1 : 1);
                    }
                    else {
                        changes.termCorrectCount = existingProgress[0].termCorrectCount + (isOverallCorrect ? 1 : -1);
                        changes.termIncorrectCount = existingProgress[0].termIncorrectCount + (isOverallCorrect ? -1 : 1);
                    }
                    await db.termProgress.update(existingProgress[0].id, changes);
                }
            }
            const updatedQuestion = await db.practiceTestQuestions.get(id);
            return updatedQuestion ? toGraphQLQuestion(updatedQuestion) : undefined;
        });
    },
    getPracticeTestsByTermId: async function (termId) {
        const questionIds = await db.practiceTestQuestions
            .where("termId").equals(termId)
            .primaryKeys();
        const questions = await db.practiceTestQuestions.bulkGet(questionIds);
        const ptIds = new Set();
        questions.forEach(q => { if (q)
            ptIds.add(q.practiceTestId); });
        const tests = await db.practiceTests.bulkGet(Array.from(ptIds));
        const filteredTests = tests.filter((t) => t !== undefined);
        await Promise.all(filteredTests.map(async (pt) => {
            const rawQuestions = await db.practiceTestQuestions
                .where("practiceTestId").equals(pt.id)
                .sortBy("position");
            pt.questions = rawQuestions.map(toGraphQLQuestion);
        }));
        filteredTests.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        return filteredTests;
    },
    getMatchActivityById: async function (id, resolveProps) {
        const activity = await db.matchActivities.get(id);
        if (!activity)
            return null;
        if (resolveProps?.termIds) {
            const reviewEvents = await db.reviewEvents
                .where("matchActivityId").equals(id)
                .and(re => re.correct === true)
                .toArray();
            activity.termIds = reviewEvents.map(re => re.termId);
        }
        if (resolveProps?.incorrectPairIds) {
            const reviewEvents = await db.reviewEvents
                .where("matchActivityId").equals(id)
                .and(re => re.correct === false)
                .toArray();
            activity.incorrectPairIds = reviewEvents.map(re => [re.termId, re.answeredTermId]);
        }
        return activity;
    },
    getMatchActivitiesByStudysetId: async function (studysetId, resolveProps) {
        const activities = await db.matchActivities.where("studysetIds").equals(studysetId).toArray();
        activities.sort((a, b) => b.endTimestamp.localeCompare(a.endTimestamp));
        for (const activity of activities) {
            if (resolveProps?.termIds) {
                const reviewEvents = await db.reviewEvents
                    .where("matchActivityId").equals(activity.id)
                    .and(re => re.correct === true)
                    .toArray();
                activity.termIds = reviewEvents.map(re => re.termId);
            }
            if (resolveProps?.incorrectPairIds) {
                const reviewEvents = await db.reviewEvents
                    .where("matchActivityId").equals(activity.id)
                    .and(re => re.correct === false)
                    .toArray();
                activity.incorrectPairIds = reviewEvents.map(re => [re.termId, re.answeredTermId]);
            }
        }
        return activities;
    },
    recordMatchActivity: async function (input, getCloudStudysetIds) {
        return await db.transaction('rw', [db.matchActivities, db.reviewEvents, db.termProgress, db.terms, db.recentActivity], async () => {
            const rnISOString = (new Date()).toISOString();
            const termIds = input.termIds || [];
            const incorrectPairIds = input.incorrectPairIds || [];
            const durationMs = input.durationMs;
            const studysetIds = new Set();
            // Derive studysetIds from local term IDs (numeric strings or numbers without a dash)
            const localTermIds = termIds.filter(id => (typeof id === 'number') || (typeof id === 'string' && !id.includes('-')));
            if (localTermIds.length > 0) {
                const termIdsForLookup = localTermIds.map(id => Number(id));
                const termsForLookup = await db.terms.bulkGet(termIdsForLookup);
                termsForLookup.forEach(t => { if (t?.studysetId != null)
                    studysetIds.add(t.studysetId); });
            }
            // Derive studysetIds from cloud term IDs (UUIDs contain a hyphen/dash)
            const cloudTermIds = termIds.filter(id => typeof id === 'string' && id.includes('-'));
            if (cloudTermIds.length > 0 && getCloudStudysetIds) {
                const cloudStudysetIds = await getCloudStudysetIds(cloudTermIds);
                cloudStudysetIds.forEach(id => { if (id != null)
                    studysetIds.add(id); });
            }
            const termProgressMap = new Map();
            const matchActivityRecord = {
                durationMs,
                endTimestamp: rnISOString,
                studysetIds: Array.from(studysetIds)
            };
            const matchId = await db.matchActivities.add(matchActivityRecord);
            for (const sid of studysetIds) {
                await ensureRecentActivityLimit(sid, matchActivityRecord.endTimestamp);
            }
            const reviewEventsToInsert = [];
            for (const termId of termIds) {
                reviewEventsToInsert.push({
                    termId,
                    matchActivityId: matchId,
                    correct: true,
                    answerWith: null,
                    timestamp: rnISOString,
                    answeredTermId: termId,
                    practiceTestQuestionType: null,
                    reviewActivityType: "MATCH",
                    answeredString: null
                });
                let tp = termProgressMap.get(termId);
                if (!tp) {
                    tp = {
                        termId,
                        termReviewedAt: rnISOString,
                        termCorrectIncrease: 1,
                        termIncorrectIncrease: 0,
                        defCorrectIncrease: 0,
                        defIncorrectIncrease: 0
                    };
                    termProgressMap.set(termId, tp);
                }
                else {
                    tp.termCorrectIncrease += 1;
                    tp.termReviewedAt = rnISOString;
                }
            }
            for (const pair of incorrectPairIds) {
                if (!Array.isArray(pair) || pair.length < 2) {
                    console.warn("(idbApiLayer.recordMatchActivity) invalid incorrect pair: expected at least 2 elements", pair);
                    continue;
                }
                const termId = pair[0];
                const answeredTermId = pair[1];
                reviewEventsToInsert.push({
                    termId,
                    matchActivityId: matchId,
                    correct: false,
                    answerWith: null,
                    timestamp: rnISOString,
                    answeredTermId: answeredTermId,
                    practiceTestQuestionType: null,
                    reviewActivityType: "MATCH",
                    answeredString: null
                });
                let tp = termProgressMap.get(termId);
                if (!tp) {
                    tp = {
                        termId,
                        termReviewedAt: rnISOString,
                        termCorrectIncrease: 0,
                        termIncorrectIncrease: 1,
                        defCorrectIncrease: 0,
                        defIncorrectIncrease: 0
                    };
                    termProgressMap.set(termId, tp);
                }
                else {
                    tp.termIncorrectIncrease += 1;
                    tp.termReviewedAt = rnISOString;
                }
            }
            if (reviewEventsToInsert.length > 0) {
                await db.reviewEvents.bulkAdd(reviewEventsToInsert);
            }
            // Update term progress
            for (const tp of termProgressMap.values()) {
                const existingProgress = await db.termProgress.where("termId").equals(tp.termId).toArray();
                if (existingProgress?.length > 0) {
                    await db.termProgress.update(existingProgress[0].id, {
                        termLastReviewedAt: tp.termReviewedAt,
                        termReviewCount: (existingProgress[0]?.termReviewCount ?? 0) + (tp.termCorrectIncrease + tp.termIncorrectIncrease),
                        termCorrectCount: (existingProgress[0].termCorrectCount) + (tp.termCorrectIncrease),
                        termIncorrectCount: (existingProgress[0].termIncorrectCount) + (tp.termIncorrectIncrease),
                    });
                }
                else {
                    await db.termProgress.add({
                        termId: tp.termId,
                        termFirstReviewedAt: tp.termReviewedAt,
                        termLastReviewedAt: tp.termReviewedAt,
                        termReviewCount: tp.termCorrectIncrease + tp.termIncorrectIncrease,
                        defReviewCount: 0,
                        termCorrectCount: tp.termCorrectIncrease,
                        termIncorrectCount: tp.termIncorrectIncrease,
                        defCorrectCount: 0,
                        defIncorrectCount: 0
                    });
                }
            }
            return await this.getMatchActivityById(matchId, { termIds: true, incorrectPairIds: true });
        });
    },
    getRecentActivityStudysets: async function ({ skipCloudStudysets, getCloudStudysets } = {}) {
        const rows = await db.recentActivity
            .orderBy("timestamp")
            .reverse()
            .toArray();
        const localIds = [];
        const cloudIds = [];
        for (const row of rows) {
            if (typeof row.studysetId === 'number') {
                localIds.push(row.studysetId);
            }
            else {
                cloudIds.push(row.studysetId);
            }
        }
        if (cloudIds.length > 0 && !getCloudStudysets && !skipCloudStudysets) {
            throw new Error("(idbApiLayer.getRecentActivityStudysets) cloud studyset UUIDs found but no getCloudStudysets callback provided. " +
                "Pass skipCloudStudysets: true to skip them, or provide a getCloudStudysets callback.");
        }
        const localStudysets = await this.getStudysetsByIds(localIds, { termsCount: true });
        let cloudStudysets = [];
        if (cloudIds.length > 0 && getCloudStudysets) {
            cloudStudysets = await getCloudStudysets(cloudIds);
        }
        const localMap = new Map();
        for (const s of localStudysets) {
            if (s && !s.draft) {
                localMap.set(s.id, s);
            }
        }
        const cloudMap = new Map();
        for (let i = 0; i < cloudIds.length; i++) {
            const s = cloudStudysets[i];
            if (s) {
                cloudMap.set(cloudIds[i], s);
            }
        }
        const result = [];
        for (const row of rows) {
            let studyset;
            if (typeof row.studysetId === 'number') {
                studyset = localMap.get(row.studysetId);
            }
            else {
                studyset = cloudMap.get(row.studysetId);
            }
            if (studyset) {
                result.push(studyset);
            }
        }
        return result;
    },
    getRecentActivityStudysetCount: async function ({ skipCloudStudysets, getCloudStudysets } = {}) {
        const rows = await db.recentActivity.toArray();
        const localIds = [];
        const cloudIds = [];
        for (const row of rows) {
            if (typeof row.studysetId === 'number') {
                localIds.push(row.studysetId);
            }
            else {
                cloudIds.push(row.studysetId);
            }
        }
        if (cloudIds.length > 0 && !getCloudStudysets && !skipCloudStudysets) {
            throw new Error("(idbApiLayer.getRecentActivityStudysetCount) cloud studyset UUIDs found but no getCloudStudysets callback provided. " +
                "Pass skipCloudStudysets: true to skip them, or provide a getCloudStudysets callback.");
        }
        const localStudysets = await this.getStudysetsByIds(localIds);
        let count = 0;
        for (const s of localStudysets) {
            if (s && !s.draft)
                count++;
        }
        if (cloudIds.length > 0 && getCloudStudysets) {
            const cloudStudysets = await getCloudStudysets(cloudIds);
            for (const s of cloudStudysets) {
                if (s && !s.draft)
                    count++;
            }
        }
        return count;
    }
};
