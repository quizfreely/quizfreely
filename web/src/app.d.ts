// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { getSdk } from "$lib/graphql/generated";

type Sdk = ReturnType<typeof getSdk>;

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			sdk: Sdk;
			theme: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
