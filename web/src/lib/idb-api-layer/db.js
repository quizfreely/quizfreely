/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */

import Dexie from 'dexie';

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
}).upgrade(async tx => {
    await tx.studysets.toCollection().modify(studyset => {
        studyset.updatedAt = studyset.updated_at;
        studyset.updated_at = undefined;
    });
    await tx.terms.toCollection().modify(term => {
        term.studysetId = term.studyset_id;
        term.studyset_id = undefined;
        term.sortOrder = term.sort_order;
        term.sort_order = undefined;
        term.createdAt = term.created_at;
        term.created_at = undefined;
        term.updatedAt = term.updated_at;
        term.updated_at = undefined;
    });
    const oldTermProgress = await tx.term_progress.toArray();
    for (const row of oldTermProgress) {
        await tx.termProgress.add({
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
    const oldTermConfusionPairs = await tx.term_confusion_pairs.toArray();
    for (const row of oldTermConfusionPairs) {
        await tx.termConfusionPairs.add({
            id: row.id,
            termId: row.term_id,
            confusedTermId: row.confused_term_id,
            answeredWith: row.answered_with,
            confusedCount: row.confused_count,
            lastConfusedAt: row.last_confused_at
        });
    }
    const oldPracticeTests = await tx.practice_tests.toArray();
    for (const row of oldPracticeTests) {
        await tx.practiceTests.add({
            id: row.id,
            timestamp: row.timestamp,
            studysetId: row.studyset_id,
            questionsCorrect: row.questions_correct,
            questionsTotal: row.questions_total,
            questions: row.questions
        });
    }
})
db.version(10).stores({
    term_progress: null,
    term_confusion_pairs: null,
    practice_tests: null
})
db.version(11).stores({
    termConfusionPairs: "++id, termId, confusedTermId, [termId+confusedTermId], answeredWith, confusedCount, lastConfusedAt"
})
db.version(12).stores({
    termConfusionPairs: "++id, termId, confusedTermId, [termId+confusedTermId], " +
        "answeredWith, confusedCount, [termId+confusedCount], [confusedTermId+confusedCount], lastConfusedAt"
})
db.version(13).stores({
    terms: "++id, studysetId, sortOrder, [studysetId+sortOrder], createdAt, updatedAt"
})
db.version(14).stores({
    termProgressHistory: "++id, timestamp, termId, termCorrectCount, termIncorrectCount, defCorrectCount, defIncorrectCount"
})
export default db;
