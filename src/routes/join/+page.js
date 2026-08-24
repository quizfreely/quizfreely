export function load({ url }) {
    return {
        header: {
            hideHeader: true
        },
        prefilledCode: url.searchParams.get("code") ?? ""
    }
}
