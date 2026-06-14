/** @typedef {import('@sveltejs/kit').BeforeNavigate} BeforeNavigate */

/**
 * Called before the root layout's beforeNavigate logic
 * return `true` if navigation.cancel() is called to stop the root layout's beforeNavigate
 * 
 * @type {((nav: BeforeNavigate) => boolean | undefined) | undefined}
 */
const cancelBeforeNavigateFunc = undefined;

/**
 * Set func to call before root layout's BeforeNavigate logic
 * return `true` if navigation.cancel() is called to stop the root layout's beforeNavigate
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

