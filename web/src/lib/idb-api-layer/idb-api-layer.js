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

export const idbApiLayer = {
    getStudysetById: async function (id, resolveProps) {
        const studyset = await db.studysets.where("id").equals(id).toArray();
        
        if (resolveProps?.terms) {
            studyset.terms = await idbApiLayer.getTermsByStudysetId(
                id,
                resolveProps.terms
            );
        }

        return studyset;
    },
    getTermsByStudysetId: async function (studyset_id, resolveProps) {
        const terms = db.terms.where("studyset_id").equals(studyset_id).toArray();

        if (resolveProps?.progress) {
            await terms.forEach(async term => {
                term.progress = await db.progress.where("term_id").equals(term.id).toArray();
            });
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
        terms.forEach(term => {
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
    }
}
