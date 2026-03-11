import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated";

type Fetch = typeof fetch

export function getClientSdk(url: string = "/api/graphql", config?: {
    fetch?: Fetch;
    headers?: Record<string, string>
}) {
    return getSdk(
        new GraphQLClient(url, {
            fetch: config?.fetch,
            headers: config?.headers
        })
    );
}
