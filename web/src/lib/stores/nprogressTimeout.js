import { writable } from "svelte/store";

export const nprogressTimeout = writable(null);
export function cancelNprogressTimeout() {
    nprogressTimeout.update(timeout => {
        if (timeout) {
            clearTimeout(timeout);
        }
        return null;
    })
}

