import plaintextToProseMirrorJson from "$lib/plaintextToProseMirrorJson.js";

export function openIndexedDB(callback) {
    var dbReq = window.indexedDB.open("quizfreelydata", 5);
    dbReq.onerror = function (event) {
        console.error("IndexedDB no worky");
        alert("IndexedDB no worky :(");
        console.error(dbReq.error);
    };
    dbReq.onupgradeneeded = function (event) {
        var db = event.target.result;
        const trans = event.target.transaction;
        if (db.objectStoreNames.contains("studysets") == false) {
          var studysetsObjectStore = db.createObjectStore("studysets", { keyPath: "id", autoIncrement: true });
          studysetsObjectStore.createIndex("title_idx", "title");
        }
        if (db.objectStoreNames.contains("studysetprogress") == false) {
            /* autoincrement is false, so we give the id for each record ourselves, because that id corresponds with the studyset id */
            var scoresObjectStore = db.createObjectStore("studysetprogress", { keyPath: "studyset_id", autoIncrement: false });
        }
        if (db.objectStoreNames.contains("studysetsettings") == false) {
            var settingsObjectStore = db.createObjectStore("studysetsettings", { keyPath: "studyset_id", autoIncrement: false })
        }
        /*if (db.objectStoreNames.contains("scores") == false) {
            var scoresObjectStore = db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
            scoresObjectStore.createIndex("studyset_id_idx", "studyset_id")
        }*/
        if (event.oldVersion <= 4) {
            /*
                convert old plaintext terms to new prosemirror json
            */
            const studysetsObjectStore = trans.objectStore("studysets");

            studysetsObjectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const studysetRecord = cursor.value;

                    if (studysetRecord && studysetRecord?.data?.terms?.length > 0) {
                        studysetRecord.data.terms_json = [];
                        for (
                            let term = 0;
                            term < studysetRecord.data.terms.length;
                            term++
                        ) {
                            studysetRecord.data.terms_json[term] = [];
                            studysetRecord.data.terms_json[term][0] = plaintextToProseMirrorJson(
                                studysetRecord.data.terms[term][0]
                            );
                            studysetRecord.data.terms_json[term][1] = plaintextToProseMirrorJson(
                                studysetRecord.data.terms[term][1]
                            );
                        }

                        cursor.update(studysetRecord);
                    }

                    cursor.continue();
                }
            }
        }
    };
    dbReq.onsuccess = function (event) {
        callback(event.target.result);
    };
}
