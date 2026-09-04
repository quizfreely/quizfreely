/** @typedef {import('@sveltejs/kit').BeforeNavigate} BeforeNavigate */

/**
 * Called before the root layout's beforeNavigate logic
 * return `true` if navigation.cancel() is called to stop the root layout's beforeNavigate
 * 
 * @type {((nav: BeforeNavigate) => boolean | undefined) | undefined}
 */
let cancelBeforeNavigateFunc = undefined;

/**
 * Set func to call before root layout's BeforeNavigate logic
 * return `true` from callback func if navigation.cancel() is called to stop the root layout's beforeNavigate
 *
 * ALWAYS run cleanUpCancelBeforeNavigate to clean up (usually in onMount's cleanup func)
 *
 * @param {((nav: BeforeNavigate) => boolean | undefined) | undefined} cancelBeforeNavigate - Func called before layout BeforeNavigate logic
 * @returns {void}
 */
export function setCancelBeforeNavigate(cancelBeforeNavigate) {
    cancelBeforeNavigateFunc = cancelBeforeNavigate;
}

/**
 * Gets func to call before root layout's beforeNavigate logic
 * func will return `true` if navigation.cancel() was called and the layout should stop its beforeNavigate logic
 *
 * @returns {((nav: BeforeNavigate) => boolean | undefined) | undefined} Returns func accepting BeforeNavigate param returning bool OR undefined OR returns undefined
 */
export function getCancelBeforeNavigate() {
    return cancelBeforeNavigateFunc;
}

/**
 * Clear cancelBeforeNav function for clean up
 * Pass same function instance as parameter from setCancelBeforeNavigate call
 *
 * @param {((nav: BeforeNavigate) => boolean | undefined) | undefined} func
 * @returns {void}
 */
export function cleanUpCancelBeforeNavigate(func) {
    if (cancelBeforeNavigateFunc == func) {
        cancelBeforeNavigateFunc = undefined;
    }
}
