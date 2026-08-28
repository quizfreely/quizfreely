import { SvelteSet } from 'svelte/reactivity';
import { browser } from "$app/environment";

class StudysetSelection {
    cloudIds = new SvelteSet();
    localIds = new SvelteSet();
    
    toggleSelect({ cloudId, localId }) {
        if (cloudId != null && this.cloudIds.has(cloudId)) {
            this.cloudIds.delete(cloudId);
        } else if (cloudId != null) {
            this.cloudIds.add(cloudId);
        }
        if (localId != null && this.localIds.has(localId)) {
            this.localIds.delete(localId);
        } else if (localId != null) {
            this.localIds.add(localId);
        }
    }

    select({ cloudId, localId }) {
        if (cloudId != null) {
            this.cloudIds.add(cloudId);
        }
        if (localId != null) {
            this.localIds.add(localId);
        }
    }
    
    deselect({ cloudId, localId }) {
        if (cloudId != null) {
            this.cloudIds.delete(cloudId);
        }
        if (localId != null) {
            this.localIds.delete(localId);
        }
    }

    writeSessionStorage() {
        if (browser) {
            try {
                sessionStorage.setItem(
                    "quizfreely:selected_cloud_studyset_ids",
                    JSON.stringify([...this.cloudIds]),
                );
                sessionStorage.setItem(
                    "quizfreely:selected_local_studyset_ids",
                    JSON.stringify([...this.localIds]),
                );
            } catch (err) {
                console.error("StudysetSelection.writeSessionStorage errored even though browser is true. Err:", err);
            }
        }
    }

    readSessionStorage() {
        if (browser) {
            try {
                const cloudIds = sessionStorage.getItem(
                    "quizfreely:selected_cloud_studyset_ids",
                );
                if (cloudIds) {
                    this.cloudIds = new SvelteSet(JSON.parse(cloudIds));
                }
                const localIds = sessionStorage.getItem(
                    "quizfreely:selected_local_studyset_ids",
                );
                if (localIds) {
                    this.localIds = new SvelteSet(JSON.parse(localIds));
                }
            } catch (err) {
                console.error("StudysetSelection.readSessionStorage errored. (although browser is true) Err:", err);
            }
        } else {
            console.error("StudysetSelection.readSessionStorage called when browser is false")
        }
    }
}

export const studysetSelection = new StudysetSelection();
