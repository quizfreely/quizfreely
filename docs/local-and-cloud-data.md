# Local and Cloud Data in Quizfreely

This project supports two types of studyset storage: **Cloud** (stored on the server and accessed via GraphQL) and **Local** (stored in the browser's IndexedDB). This document explains the differences in their implementation, loading, and saving processes.

## 1. Architectural Overview

| Feature | Cloud Studysets | Local Studysets |
| :--- | :--- | :--- |
| **Storage** | Remote Database (PostgreSQL) | Browser's IndexedDB |
| **Access Method** | GraphQL API | `idb-api-layer` (Dexie.js wrapper) |
| **Authentication** | Required for creation/editing | No account needed |
| **IDs** | Strings (UUIDs/HashIDs) | Integers (Auto-incrementing) |
| **Server-Side Rendering** | Supported | **Not Supported** (Browser-only API) |

## 2. Loading Implementation

### Cloud Studysets (Initial Render)
Cloud data is typically fetched on the server in `+page.server.ts` load functions. This allows the page to be pre-rendered (SSR), making the data available immediately upon the first render.

**Example: `src/routes/studysets/[id]/+page.server.ts`**
```typescript
export async function load({ params, locals }) {
    const data = await locals.sdk.PublicStudyset({ id: params.id });
    return { studyset: data.studyset };
}
```

### Local Studysets (Post-Mount Loading)
IndexedDB is a browser API and is not available during server-side rendering. Therefore, local data **cannot** be loaded in `+page.server.ts`.

Instead, the server load function only passes the ID from the URL, and the actual data is fetched on the client side within `onMount`. This results in a "loading state" or a slight delay where the data is populated after the initial page shell has loaded.

**Example: `src/routes/studyset/local/+page.server.ts`**
```typescript
export async function load({ url, locals }) {
    let localId = parseInt(url.searchParams.get("id") ?? "");
    return { localId: localId }; // Server only knows the ID
}
```

**Example: `src/routes/StudysetPage.svelte`**
```typescript
let title = $state(data?.studyset?.title); // Initialized immediately for Cloud
let terms = $state(data?.studyset?.terms);

onMount(function () {
    if (data.local) {
        (async () => {
            // Fetched after page load for Local
            const localStudyset = await idbApiLayer.getStudysetById(data.localId);
            title = localStudyset?.title;
            terms = localStudyset?.terms ?? [];
        })();
    }
});
```

## 3. Image Handling & Memory Management

Images are handled fundamentally differently between the two storage types.

### Cloud Images
Cloud images are served via standard URLs from the backend (e.g., `/api/term-images/[id]/[side]`). The browser handles caching and memory management for these URLs normally.

### Local Images (Object URLs)
Local images are stored as `Blob` objects in IndexedDB. To display them in an `<img>` tag, we must generate an **Object URL**.

1.  **Generation**: We use `URL.createObjectURL(blob)` (wrapped in `idbLayerImg.getImageObjectUrl`).
2.  **Cleanup**: Unlike standard URLs, Object URLs live in memory until the document is closed or they are manually revoked. **To prevent memory leaks, you must call `URL.revokeObjectURL(url)` when the component is destroyed.**

**Reference Implementation in `src/routes/StudysetPage.svelte`:**
```typescript
onMount(() => {
    let objectUrls: string[] = [];
    if (data.local) {
        (async () => {
            // ... fetch studyset ...
            terms.forEach((term: any) => {
                if (term.termImageUrl) objectUrls.push(term.termImageUrl);
                if (term.defImageUrl) objectUrls.push(term.defImageUrl);
            });
        })();
    }

    return () => {
        // CLEANUP: Revoke all generated Object URLs
        objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
    };
});
```

## 4. Saving & Updating

The project uses a "dual-path" approach in shared components like `Edit.svelte`.

-   **Cloud**: Uses the GraphQL SDK (e.g., `sdk.UpdateStudysetAndTerms`).
-   **Local**: Uses `idbApiLayer` (e.g., `idbApiLayer.updateStudyset`).

**Reference: `src/lib/components/Edit.svelte`**
```typescript
function saveButton() {
    if (data.local) {
        updateLocalStudyset(); // Uses idbApiLayer
    } else {
        updateCloudStudyset(); // Uses GraphQL SDK
    }
}
```

## 5. Key File References

-   **`src/lib/idb-api-layer/`**: The client-side API for IndexedDB storage.
    -   `db.js`: Database schema and migrations.
    -   `index.js`: Main API methods (`getStudysetById`, `createTerms`, etc.).
    -   `images.js`: Image processing and Object URL management.
-   **`src/lib/graphql/sdk.ts`**: The generated TypeScript SDK for cloud interactions.
-   **`src/routes/StudysetPage.svelte`**: A core component that abstracts the differences between local and cloud studysets for display.
-   **`src/lib/components/Edit.svelte`**: Handles the complex logic of editing and saving both local and cloud data.
-   **`src/routes/dashboard/+page.svelte`**: Manages the listing of both cloud (via GraphQL) and local (via IndexedDB) studysets.
