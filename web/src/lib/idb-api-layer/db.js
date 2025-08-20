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
})
export default db;
