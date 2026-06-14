/** @typedef {import('@sveltejs/kit').BeforeNavigate} BeforeNavigate */
/**
 * Called before the root layout's beforeNavigate logic
 * return `true` if navigation.cancel() is called to stop the root layout's beforeNavigate
 * 
 * @type {((nav: BeforeNavigate) => boolean | undefined) | undefined}
 * */
export const cancelBeforeNavigate = $state(undefined);

