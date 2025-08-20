/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
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

        return studysets[0];
    },
    getTermsByStudysetId: async function (studyset_id, resolveProps) {
        const terms = await db.terms.where("studyset_id").equals(studyset_id).toArray();

        if (resolveProps?.progress) {
            await Promise.all(
                terms.map(async term => {
                    const progressArr = await db.term_progress.where("term_id").equals(term.id).toArray();
                    term.progress = progressArr?.[0] ?? null;
                })
            );
        }

        return terms;
    },
    createStudyset: async function ({ title }, terms) {
        const rnISOString = (new Date()).toISOString();
        const newId = await db.studysets.add({
            title: isTitleValid(title) ?
                title : "Untitled Studyset",
            created_at: rnISOString,
            updated_at: rnISOString
        });
        
        let newTerms = [];
        terms.forEach(term => {
            newTerms.push({
                term: term.term,
                def: term.def,
                studyset_id: newId,
                sort_order: term.sort_order,
                created_at: rnISOString,
                updated_at: rnISOString,
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
            updated_at: rnISOString
        });

        let bulkUpdateTerms = [];
        terms.forEach(term => {
            bulkUpdateTerms.push({
                key: term.id,
                changes: {
                    term: term.term,
                    def: term.def,
                    sort_order: term.sort_order,
                    updated_at: rnISOString,
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
                studyset_id: id,
                sort_order: term.sort_order,
                created_at: rnISOString,
                updated_at: rnISOString,
            })
        })
        await db.terms.bulkAdd(bulkAddNewTerms);

        await db.terms.bulkDelete(deleteTermIDs);
    },
    deleteStudyset: async function (id) {
        const termIds = await db.terms.where("studyset_id").equals(id).primaryKeys(); /* get term IDs using studyset ID */
        await db.term_progress.where("term_id").anyOf(termIds).delete(); /* delete progress using term IDs */
        await db.terms.where("studyset_id").equals(id).delete(); /* delete terms using studyset ID */
        await db.studysets.delete(id); /* delete studyset */
    },
    updateTermProgress: async function ({
        term_id,
        term_reviewed_at, def_reviewed_at,
        term_leitner_system_box, def_leitner_system_box,
        term_correct_increase, term_incorrect_increase,
        def_correct_increase, def_incorrect_increase
    }) {
        if (term_reviewed_at != null && !(
            term_reviewed_at instanceof Date && !isNaN(term_reviewed_at)
        )) {
            console.error("(idb-api-layer: updateTermProgress) term_reviewed_at is not a valid Date object and not null")
            return false;
        }
        if (def_reviewed_at != null && !(
            def_reviewed_at instanceof Date && !isNaN(def_reviewed_at)
        )) {
            console.error("(idb-api-layer: updateTermProgress) def_reviewed_at is not a valid Date object and not null")
            return false;
        }

        existingProgress = await db.term_progress.where("term_id").equals(term_id);
        if (existingProgress?.length > 0) {
            await db.term_progress.update(
                existingProgress[0].id,
                {
                    term_last_reviewed_at: term_reviewed_at != null ?
                        term_reviewed_at.toISOString() : existingProgress[0].term_last_reviewed_at,
                    term_review_count: term_reviewed_at != null ?
                        (existingProgress[0]?.term_review_count ?? 0) + 1 :
                        existingProgress[0]?.term_review_count,
                    def_last_reviewed_at: def_reviewed_at != null ?
                        def_reviewed_at.toISOString() : existingProgress[0].def_last_reviewed_at,
                    def_review_count: def_reviewed_at != null ?
                        (existingProgress[0]?.def_review_count ?? 0) + 1 :
                        existingProgress[0]?.def_review_count,
                    term_leitner_system_box: term_leitner_system_box ?? existingProgress[0].term_leitner_system_box,
                    def_leitner_system_box: def_leitner_system_box ?? existingProgress[0].def_leitner_system_box,
                    term_correct_count: (existingProgress[0].term_correct_count) + (term_correct_increase ?? 0),
                    term_incorrect_count: (existingProgress[0].term_incorrect_count) + (term_incorrect_increase ?? 0),
                    def_correct_count: (existingProgress[0].def_correct_count) + (def_correct_increase ?? 0),
                    def_incorrect_count: (existingProgress[0].def_incorrect_count) + (def_incorrect_increase ?? 0)
                }
            );
            return existingProgress[0].id;
        } else {
            const newProgressId = await db.term_progress.add({
                term_id: term_id,
                term_first_reviewed_at: term_reviewed_at?.toISOString(),
                term_last_reviewed_at: term_reviewed_at?.toISOString(),
                term_review_count: term_reviewed_at != null ?
                    1 : 0,
                def_first_reviewed_at: def_reviewed_at?.toISOString(),
                def_last_reviewed_at: def_reviewed_at?.toISOString(),
                def_review_count: def_reviewed_at != null ?
                    1 : 0,
                term_leitner_system_box: term_leitner_system_box,
                def_leitner_system_box: def_leitner_system_box,
                term_correct_count: term_correct_increase ?? 0,
                term_incorrect_count: term_incorrect_increase ?? 0,
                def_correct_count: def_correct_increase ?? 0,
                def_incorrect_count: def_incorrect_increase ?? 0
            });
            return newProgressId;
        }
    }
}
