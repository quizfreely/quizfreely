import { Term, TermConfusionPair } from "./db";
type StudysetResolveProps = {
    terms?: boolean | TermResolveProps;
    practiceTests?: boolean;
};
type TermResolveProps = {
    progress?: boolean;
    progressHistory?: boolean;
    topConfusionPairs?: boolean;
    topReverseConfusionPairs?: boolean;
    termImageUrl?: boolean;
    defImageUrl?: boolean;
};
export * from "./db";
export * from "./images";
export declare const idbApiLayer: {
    getStudysetById: (id: number, resolveProps?: StudysetResolveProps) => Promise<import("./db").Studyset | null>;
    getTermsByStudysetId: (studysetId: number, resolveProps?: TermResolveProps) => Promise<Term[]>;
    getTermById: (termId: number, resolveProps?: TermResolveProps) => Promise<Term>;
    createStudyset: ({ title, draft }: {
        title: string;
        draft: boolean;
    }) => Promise<number>;
    updateStudyset: ({ id, title, draft }: {
        id: number;
        title: string;
        draft: boolean;
    }) => Promise<void>;
    createTerms: (studysetId: number, newTerms: Omit<Term, "id">[]) => Promise<number>;
    updateTerms: (terms: Term[]) => Promise<void>;
    deleteTerms: (deleteTermIDs: number[]) => Promise<void>;
    deleteStudyset: (id: number) => Promise<void>;
    updateTermProgress: (termProgressArray: any) => Promise<void>;
    getTopConfusionPairs: (termId: any, resolveProps?: any) => Promise<TermConfusionPair[]>;
    getTopReverseConfusionPairs: (confusedTermId: any, resolveProps?: any) => Promise<TermConfusionPair[]>;
    recordConfusionPairs: (confusionPairs: any) => Promise<boolean>;
    recordPracticeTest: (practiceTest: any) => Promise<number>;
};
