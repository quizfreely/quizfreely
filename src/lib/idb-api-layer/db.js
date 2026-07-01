/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025-2026 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
import { Dexie } from "dexie";
const db = new Dexie("quizfreelydata");
db.version(5).stores({
    studysets: '++id, title',
    studysetprogress: 'studyset_id',
    studysetsettings: 'studyset_id'
});
db.version(6).stores({
    studysets: '++id, updated_at',
    terms: "++id, studyset_id, sort_order, created_at, updated_at",
    term_progress: "++id, term_id, term_first_reviewed_at, term_last_reviewed_at, " +
        "term_review_count, def_first_reviewed_at, def_last_reviewed_at, " +
        "def_review_count, term_leitner_system_box, def_leitner_system_box",
    studysetprogress: null,
    studysetsettings: null
}).upgrade(async (tx) => {
    const oldStudysets = await tx.table("studysets").toArray();
    for (const studyset of oldStudysets) {
        if (studyset?.data?.terms != null && studyset.data.terms.length > 0) {
            let sortOrder = 0;
            for (const [term, def] of studyset.data.terms) {
                await tx.table("terms").add({
                    term: term,
                    def: def,
                    studyset_id: studyset.id,
                    sort_order: sortOrder,
                    created_at: studyset.updated_at,
                    updated_at: studyset.updated_at
                });
                sortOrder++;
            }
            delete studyset.data;
            await tx.table("studysets").put(studyset);
        }
    }
});
db.version(7).stores({
    studysets: '++id, title, updated_at',
    term_progress: "++id, term_id, term_first_reviewed_at, term_last_reviewed_at, " +
        "term_review_count, def_first_reviewed_at, def_last_reviewed_at, " +
        "def_review_count, term_leitner_system_box, def_leitner_system_box, " +
        "term_correct_count, term_incorrect_count, def_correct_count, def_incorrect_count",
}).upgrade((tx) => {
    return tx.table("term_progress").toCollection().modify(row => {
        if (row.term_correct_count == null) {
            row.term_correct_count = 0;
        }
        if (row.term_incorrect_count == null) {
            row.term_incorrect_count = 0;
        }
        if (row.def_correct_count == null) {
            row.def_correct_count = 0;
        }
        if (row.def_incorrect_count == null) {
            row.def_incorrect_count = 0;
        }
    });
});
db.version(8).stores({
    term_confusion_pairs: "++id, term_id, confused_term_id, answered_with, confused_count, last_confused_at",
    practice_tests: "++id, timestamp, studyset_id, questions_correct, questions_total, questions"
});
db.version(9).stores({
    studysets: '++id, title, updatedAt',
    terms: "++id, studysetId, sortOrder, createdAt, updatedAt",
    termProgress: "++id, termId, termFirstReviewedAt, termLastReviewedAt, " +
        "termReviewCount, defFirstReviewedAt, defLastReviewedAt, " +
        "defReviewCount, termLeitnerSystemBox, defLeitnerSystemBox, " +
        "termCorrectCount, termIncorrectCount, defCorrectCount, defIncorrectCount",
    termConfusionPairs: "++id, termId, confusedTermId, answeredWith, confusedCount, lastConfusedAt",
    practiceTests: "++id, timestamp, studysetId, questionsCorrect, questionsTotal"
}).upgrade(async (tx) => {
    await tx.table("studysets").toCollection().modify(studyset => {
        studyset.updatedAt = studyset.updated_at;
        studyset.updated_at = undefined;
    });
    await tx.table("terms").toCollection().modify(term => {
        term.studysetId = term.studyset_id;
        term.studyset_id = undefined;
        term.sortOrder = term.sort_order;
        term.sort_order = undefined;
        term.createdAt = term.created_at;
        term.created_at = undefined;
        term.updatedAt = term.updated_at;
        term.updated_at = undefined;
    });
    const oldTermProgress = await tx.table("term_progress").toArray();
    for (const row of oldTermProgress) {
        await tx.table("termProgress").add({
            id: row.id,
            studysetId: row.studyset_id,
            termFirstReviewedAt: row.term_first_reviewed_at,
            termLastReviewedAt: row.term_last_reviewed_at,
            termReviewCount: row.term_review_count,
            defFirstReviewedAt: row.def_first_reviewed_at,
            defLastReviewedAt: row.def_last_reviewed_at,
            defReviewCount: row.def_review_count,
            termCorrectCount: row.term_correct_count,
            termIncorrectCount: row.term_incorrect_count,
            defCorrectCount: row.def_correct_count,
            defIncorrectCount: row.def_incorrect_count
        });
    }
    const oldTermConfusionPairs = await tx.table("term_confusion_pairs").toArray();
    for (const row of oldTermConfusionPairs) {
        await tx.table("termConfusionPairs").add({
            id: row.id,
            termId: row.term_id,
            confusedTermId: row.confused_term_id,
            answeredWith: row.answered_with,
            confusedCount: row.confused_count,
            lastConfusedAt: row.last_confused_at
        });
    }
    const oldPracticeTests = await tx.table("practice_tests").toArray();
    for (const row of oldPracticeTests) {
        await tx.table("practiceTests").add({
            id: row.id,
            timestamp: row.timestamp,
            studysetId: row.studyset_id,
            questionsCorrect: row.questions_correct,
            questionsTotal: row.questions_total,
            questions: row.questions
        });
    }
});
db.version(10).stores({
    term_progress: null,
    term_confusion_pairs: null,
    practice_tests: null
});
db.version(11).stores({
    termConfusionPairs: "++id, termId, confusedTermId, [termId+confusedTermId], answeredWith, confusedCount, lastConfusedAt"
});
db.version(12).stores({
    termConfusionPairs: "++id, termId, confusedTermId, [termId+confusedTermId], " +
        "answeredWith, confusedCount, [termId+confusedCount], [confusedTermId+confusedCount], lastConfusedAt"
});
db.version(13).stores({
    terms: "++id, studysetId, sortOrder, [studysetId+sortOrder], createdAt, updatedAt"
});
db.version(14).stores({
    termProgressHistory: "++id, timestamp, termId, termCorrectCount, termIncorrectCount, defCorrectCount, defIncorrectCount"
});
db.version(15).stores({
    images: "++key"
}).upgrade(async (tx) => {
    await tx.table("studysets").toCollection().modify(studyset => {
        studyset.draft = false;
    });
});
db.version(16).stores({
    practiceTests: "++id, timestamp, *studysetIds, *questionTermIds, *distractorTermIds, questionsCorrect, questionsTotal"
}).upgrade(async (tx) => {
    await tx.table("practiceTests").toCollection().each(async (pt) => {
        const studysetIds = new Set();
        const questionTermIds = new Set();
        const distractorTermIds = new Set();
        if (pt.studysetId) {
            studysetIds.add(pt.studysetId);
            delete pt.studysetId;
        }
        let isInvalid = false;
        if (pt.questions && Array.isArray(pt.questions)) {
            const newQuestions = [];
            for (let q of pt.questions) {
                // Strip questionType
                delete q.questionType;
                // Rename trueFalseQuestion -> tfq
                if (q.trueFalseQuestion) {
                    q.tfq = q.trueFalseQuestion;
                    delete q.trueFalseQuestion;
                }
                // Helper to check if term is valid
                const isTermValid = (t) => t && (t.id != null);
                // Helper to convert Term to TermAtp and track IDs
                const toTermAtp = (t, isQuestion) => {
                    if (!t)
                        return { id: 0, term: '', def: '' };
                    if (t.id) {
                        if (isQuestion)
                            questionTermIds.add(t.id);
                        else
                            distractorTermIds.add(t.id);
                    }
                    if (t.studysetId)
                        studysetIds.add(t.studysetId);
                    return {
                        id: t.id,
                        term: t.term || t.termSnapshot || '',
                        def: t.def || t.defSnapshot || ''
                    };
                };
                if (q.mcq) {
                    const mcq = q.mcq;
                    if (!isTermValid(mcq.term)) {
                        isInvalid = true;
                        break;
                    }
                    let answeredIndex = null;
                    const correctChoiceIndex = mcq.correctChoiceIndex ?? 0;
                    if (mcq.correct) {
                        answeredIndex = correctChoiceIndex;
                    }
                    else if (mcq.answeredTerm && isTermValid(mcq.answeredTerm) && Array.isArray(mcq.distractors)) {
                        const idx = mcq.distractors.findIndex((d) => d.id === mcq.answeredTerm.id);
                        if (idx !== -1) {
                            answeredIndex = idx >= correctChoiceIndex ? idx + 1 : idx;
                        }
                    }
                    q.mcq = {
                        answerWith: mcq.answerWith,
                        term: toTermAtp(mcq.term, true),
                        correct: !!mcq.correct,
                        correctChoiceIndex: correctChoiceIndex,
                        answeredIndex: answeredIndex,
                        distractors: (mcq.distractors || []).map((d) => toTermAtp(d, false))
                    };
                }
                else if (q.tfq) {
                    const tfq = q.tfq;
                    if (!isTermValid(tfq.term)) {
                        isInvalid = true;
                        break;
                    }
                    q.tfq = {
                        answerWith: tfq.answerWith,
                        term: toTermAtp(tfq.term, true),
                        correct: !!tfq.correct,
                        answeredBool: !!tfq.answeredBool,
                        distractor: tfq.distractor ? toTermAtp(tfq.distractor, false) : undefined
                    };
                }
                else if (q.frq) {
                    const frq = q.frq;
                    if (!isTermValid(frq.term)) {
                        isInvalid = true;
                        break;
                    }
                    q.frq = {
                        answerWith: frq.answerWith,
                        term: toTermAtp(frq.term, true),
                        correct: !!frq.correct,
                        userMarkedCorrect: frq.userMarkedCorrect,
                        answeredString: frq.answeredString || ""
                    };
                }
                newQuestions.push(q);
            }
            pt.questions = newQuestions;
        }
        if (isInvalid) {
            await tx.table("practiceTests").delete(pt.id);
        }
        else {
            pt.studysetIds = Array.from(studysetIds);
            pt.questionTermIds = Array.from(questionTermIds);
            pt.distractorTermIds = Array.from(distractorTermIds);
            // termIds was used in the previous (messed up) version 16 attempt,
            // if it exists on the object we should remove it.
            delete pt.termIds;
            await tx.table("practiceTests").put(pt);
        }
    });
});
db.version(17).stores({
    practiceTests: "++id, timestamp, *studysetIds, questionsCorrect, questionsTotal",
    practiceTestQuestions: "++id, practiceTestId, termId, [practiceTestId+position]",
    termProgress: "++id, termId, termFirstReviewedAt, termLastReviewedAt, " +
        "termReviewCount, defFirstReviewedAt, defLastReviewedAt, " +
        "defReviewCount, termCorrectCount, termIncorrectCount, defCorrectCount, defIncorrectCount",
    termProgressHistory: null
}).upgrade(async (tx) => {
    await tx.table("termProgress").toCollection().modify(tp => {
        delete tp.termLeitnerSystemBox;
        delete tp.defLeitnerSystemBox;
    });
    await tx.table("practiceTests").toCollection().each(async (pt) => {
        if (pt.questions && Array.isArray(pt.questions)) {
            for (let i = 0; i < pt.questions.length; i++) {
                const q = pt.questions[i];
                let type = "mcq";
                let qData = {};
                let termAtp = null;
                let correct = false;
                let answerWith = "";
                if (q.mcq) {
                    type = "mcq";
                    termAtp = q.mcq.term;
                    correct = q.mcq.correct;
                    answerWith = q.mcq.answerWith;
                    qData = {
                        distractors: (q.mcq.distractors || []).map((d) => ({
                            id: d.id,
                            term: d.term || d.termSnapshot || "",
                            def: d.def || d.defSnapshot || ""
                        })),
                        correctChoiceIndex: q.mcq.correctChoiceIndex,
                        answeredIndex: q.mcq.answeredIndex
                    };
                }
                else if (q.tfq) {
                    type = "tfq";
                    termAtp = q.tfq.term;
                    correct = q.tfq.correct;
                    answerWith = q.tfq.answerWith;
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
                    termAtp = q.frq.term;
                    correct = q.frq.correct;
                    answerWith = q.frq.answerWith;
                    let userMarkedCorrect = q.frq.userMarkedCorrect;
                    if (!correct && userMarkedCorrect) {
                        correct = true;
                        userMarkedCorrect = true;
                    }
                    qData = {
                        answeredString: q.frq.answeredString,
                        userMarkedCorrect: userMarkedCorrect
                    };
                }
                if (termAtp) {
                    await tx.table("practiceTestQuestions").add({
                        practiceTestId: pt.id,
                        termId: termAtp.id,
                        term: termAtp.term || termAtp.termSnapshot || "",
                        def: termAtp.def || termAtp.defSnapshot || "",
                        type: type,
                        position: i,
                        correct: correct,
                        answerWith: answerWith,
                        data: qData
                    });
                }
            }
        }
        delete pt.questions;
        delete pt.questionTermIds;
        delete pt.distractorTermIds;
        await tx.table("practiceTests").put(pt);
    });
});
db.version(18).stores({}).upgrade(async (tx) => {
    await tx.table("practiceTestQuestions").toCollection().modify(q => {
        if (q.termSnapshot !== undefined || q.defSnapshot !== undefined) {
            q.term = q.termSnapshot ?? q.term ?? "";
            q.def = q.defSnapshot ?? q.def ?? "";
            delete q.termSnapshot;
            delete q.defSnapshot;
        }
        if (q.data) {
            if (q.data.distractors && Array.isArray(q.data.distractors)) {
                for (const d of q.data.distractors) {
                    if (d.termSnapshot !== undefined || d.defSnapshot !== undefined) {
                        d.term = d.termSnapshot ?? d.term ?? "";
                        d.def = d.defSnapshot ?? d.def ?? "";
                        delete d.termSnapshot;
                        delete d.defSnapshot;
                    }
                }
            }
            if (q.data.distractor) {
                const d = q.data.distractor;
                if (d.termSnapshot !== undefined || d.defSnapshot !== undefined) {
                    d.term = d.termSnapshot ?? d.term ?? "";
                    d.def = d.defSnapshot ?? d.def ?? "";
                    delete d.termSnapshot;
                    delete d.defSnapshot;
                }
            }
        }
    });
});
db.version(19).stores({
    termConfusionPairs: null,
    reviewEvents: "++id, termId, practiceTestQuestionId, timestamp, answeredTermId, practiceTestQuestionType, reviewActivityType"
});
db.version(20).stores({
    matchActivities: "++id, *studysetIds, endTimestamp",
    reviewEvents: "++id, termId, practiceTestQuestionId, matchActivityId, timestamp, answeredTermId, practiceTestQuestionType, reviewActivityType"
});
export { db };
