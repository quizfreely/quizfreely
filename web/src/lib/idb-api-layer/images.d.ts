export declare const idbLayerImg: {
    processImage: (file: any, maxWidth: any, maxHeight: any, quality: any) => Promise<unknown>;
    processAndUpdateTermImage: (termId: any, defSide: any, file: any) => Promise<any>;
    removeTermImage: (termId: any, defSide: any) => Promise<boolean>;
    getImageObjectUrl: (key: any) => Promise<string>;
    deleteImages: (keys: any) => Promise<void>;
};
