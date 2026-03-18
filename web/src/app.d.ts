// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Sdk, AuthDataQuery } from "$lib/graphql/generated";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            sdk: Sdk;
            theme: string;
            hasAuthCookie: boolean;
        }
        interface PageData {
            header?: {
                activePage?: string;
                searchQuery?: string;
                hideHeader?: boolean;
                showSignUpLink?: boolean;
            };
            footer?: {
                hideFooter?: boolean;
            };
            authed: boolean;
            authedUser?: AuthDataQuery["authedUser"];
            settingsSection?: string;
            explorePage?: string;
            dashboardPage?: string;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
