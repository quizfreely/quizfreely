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
        this.writeSessionStorage();
    }

    select({ cloudId, localId }) {
        if (cloudId != null) {
            this.cloudIds.add(cloudId);
        }
        if (localId != null) {
            this.localIds.add(localId);
        }
        this.writeSessionStorage();
    }
    
    deselect({ cloudId, localId }) {
        if (cloudId != null) {
            this.cloudIds.delete(cloudId);
        }
        if (localId != null) {
            this.localIds.delete(localId);
        }
        this.writeSessionStorage();
    }

    clearSelection() {
        this.cloudIds.clear();
        this.localIds.clear();
        this.writeSessionStorage();
    }

    replaceSelection({ cloudIds, localIds }) {
        this.cloudIds.clear();
        cloudIds?.forEach?.(id => { if (id != null) this.cloudIds.add(id); });
        this.localIds.clear();
        localIds?.forEach?.(id => { if (id != null) this.localIds.add(id); });
        this.writeSessionStorage();
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
                const cloudIdsStr = sessionStorage.getItem(
                    "quizfreely:selected_cloud_studyset_ids",
                );
                if (cloudIdsStr) {
                    const cloudIdsArr = JSON.parse(cloudIdsStr);
                    // NOTE: do NOT use `new SvelteSet(JSON.parse(str))`
                    // creating a new SvelteSet instance breaks everything
                    // because components will not reference the new instance
                    cloudIdsArr?.forEach?.(id => { if (id != null) this.cloudIds.add(id); });
                }
                const localIdsStr = sessionStorage.getItem(
                    "quizfreely:selected_local_studyset_ids",
                );
                if (localIdsStr) {
                    const localIdsArr = JSON.parse(localIdsStr);
                    // NOTE: do NOT use `new SvelteSet(JSON.parse(str))`
                    localIdsArr?.forEach?.(id => { if (id != null) this.localIds.add(id); });
                }
            } catch (err) {
                console.error("StudysetSelection.readSessionStorage errored. (although browser is true) Err:", err);
            }
        } else {
            console.error("StudysetSelection.readSessionStorage called when browser is false")
        }
    }
}

class SelectionUI {
    #cancelButtonCallback;
    getCancelButtonCallback() {
        return this.#cancelButtonCallback;
    }
    setCancelButtonCallback(callback) {
        this.#cancelButtonCallback = callback;
    }
    cleanUpCancelButtonCallback(callback) {
        if (this.#cancelButtonCallback == callback) {
            this.#cancelButtonCallback = undefined;
        }
    }
}

const studysetSelection = new StudysetSelection();
const selectionUI = new SelectionUI();
export { studysetSelection, selectionUI };
