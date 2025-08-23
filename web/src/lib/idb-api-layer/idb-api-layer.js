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
        if (resolveProps?.practiceTests) {
            studysets[0].practiceTests = await db.practiceTests.where("studysetId").equals(id).toArray();
        }

        return studysets[0];
    },
    getTermsByStudysetId: async function (studysetId, resolveProps) {
        const terms = await db.terms.where("studysetId").equals(studysetId).toArray();

        if (resolveProps?.progress) {
            await Promise.all(
                terms.map(async term => {
                    const progressArr = await db.termProgress.where("termId").equals(term.id).toArray();
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
    updateTermProgress: async function ({
        termId,
        termReviewedAt, defReviewedAt,
        termLeitnerSystemBox, defLeitnerSystemBox,
        termCorrectIncrease, termIncorrectIncrease,
        defCorrectIncrease, defIncorrectIncrease
    }) {
        if (termReviewedAt != null && !(
            termReviewedAt instanceof Date && !isNaN(termReviewedAt)
        )) {
            console.error("(idb-api-layer: updateTermProgress) termReviewedAt is not a valid Date object and not null")
            return false;
        }
        if (defReviewedAt != null && !(
            defReviewedAt instanceof Date && !isNaN(defReviewedAt)
        )) {
            console.error("(idb-api-layer: updateTermProgress) defReviewedAt is not a valid Date object and not null")
            return false;
        }

        existingProgress = await db.termProgress.where("termId").equals(termId);
        if (existingProgress?.length > 0) {
            await db.termProgress.update(
                existingProgress[0].id,
                {
                    termLastReviewedAt: termReviewedAt != null ?
                        termReviewedAt.toISOString() : existingProgress[0].termLastReviewedAt,
                    termReviewCount: termReviewedAt != null ?
                        (existingProgress[0]?.termReviewCount ?? 0) + 1 :
                        existingProgress[0]?.termReviewCount,
                    defLastReviewedAt: defReviewedAt != null ?
                        defReviewedAt.toISOString() : existingProgress[0].defLastReviewedAt,
                    defReviewCount: defReviewedAt != null ?
                        (existingProgress[0]?.defReviewCount ?? 0) + 1 :
                        existingProgress[0]?.defReviewCount,
                    termLeitnerSystemBox: termLeitnerSystemBox ?? existingProgress[0].termLeitnerSystemBox,
                    defLeitnerSystemBox: defLeitnerSystemBox ?? existingProgress[0].defLeitnerSystemBox,
                    termCorrectCount: (existingProgress[0].termCorrectCount) + (termCorrectIncrease ?? 0),
                    termIncorrectCount: (existingProgress[0].termIncorrectCount) + (termIncorrectIncrease ?? 0),
                    defCorrectCount: (existingProgress[0].defCorrectCount) + (defCorrectIncrease ?? 0),
                    defIncorrectCount: (existingProgress[0].defIncorrectCount) + (defIncorrectIncrease ?? 0)
                }
            );
            return existingProgress[0].id;
        } else {
            const newProgressId = await db.termProgress.add({
                termId: termId,
                termFirstReviewedAt: termReviewedAt?.toISOString(),
                termLastReviewedAt: termReviewedAt?.toISOString(),
                termReviewCount: termReviewedAt != null ?
                    1 : 0,
                defFirstReviewedAt: defReviewedAt?.toISOString(),
                defLastReviewedAt: defReviewedAt?.toISOString(),
                defReviewCount: defReviewedAt != null ?
                    1 : 0,
                termLeitnerSystemBox: termLeitnerSystemBox,
                defLeitnerSystemBox: defLeitnerSystemBox,
                termCorrectCount: termCorrectIncrease ?? 0,
                termIncorrectCount: termIncorrectIncrease ?? 0,
                defCorrectCount: defCorrectIncrease ?? 0,
                defIncorrectCount: defIncorrectIncrease ?? 0
            });
            return newProgressId;
        }
    }
}
