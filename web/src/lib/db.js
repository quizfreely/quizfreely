import Dexie from 'dexie';

export const db = new Dexie("quizfreelydata");
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
})
