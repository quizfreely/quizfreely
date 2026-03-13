export * from "./db";
export * from "./images";
export declare const idbApiLayer: {
    getStudysetById: (id: any, resolveProps: any) => Promise<import("./db").Studyset>;
    getTermsByStudysetId: (studysetId: any, resolveProps: any) => Promise<import("./db").Term[]>;
    getTermById: (termId: any, resolveProps: any) => Promise<import("./db").Term>;
    createStudyset: ({ title, draft }: {
        title: any;
        draft: any;
    }) => Promise<number>;
    updateStudyset: ({ id, title, draft }: {
        id: any;
        title: any;
        draft: any;
    }) => Promise<void>;
    createTerms: (studysetId: any, newTerms: any) => Promise<number>;
    updateTerms: (terms: any) => Promise<void>;
    deleteTerms: (deleteTermIDs: any) => Promise<void>;
    deleteStudyset: (id: any) => Promise<void>;
    updateTermProgress: (termProgressArray: any) => Promise<void>;
    getTopConfusionPairs: (termId: any, resolveProps: any) => Promise<import("./db").TermConfusionPair[]>;
    getTopReverseConfusionPairs: (confusedTermId: any, resolveProps: any) => Promise<import("./db").TermConfusionPair[]>;
    recordConfusionPairs: (confusionPairs: any) => Promise<boolean>;
    recordPracticeTest: (practiceTest: any) => Promise<number>;
};
