export declare const idbLayerImg: {
    processImage: (file: Blob, maxWidth: number, maxHeight: number, quality?: number) => Promise<Blob>;
    processAndUpdateTermImage: (termId: number, defSide: boolean, file: Blob) => Promise<Blob | null>;
    removeTermImage: (termId: number, defSide: boolean) => Promise<boolean>;
    getImageObjectUrl: (key: number) => Promise<string | null>;
    deleteImages: (keys: number[]) => Promise<void>;
};
