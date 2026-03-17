import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";

type Fetch = typeof fetch;

export function getClientSdk({
    url = "/api/graphql",
    fetch,
    headers,
}: {
    url?: string;
    fetch?: Fetch;
    headers?: Record<string, string>;
} = {}) {
    return getSdk(
        new GraphQLClient(url, {
            fetch,
            headers,
        })
    );
}
