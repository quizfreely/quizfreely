import { Studyset, Term, MatchActivity, Question } from "./db";
type StudysetResolveProps = {
    terms?: boolean | TermResolveProps;
    practiceTests?: boolean;
    matchActivities?: boolean;
};
type TermResolveProps = {
    progress?: boolean;
    termImageUrl?: boolean;
    defImageUrl?: boolean;
};
type MatchActivityResolveProps = {
    termIds?: boolean;
    incorrectPairIds?: boolean;
};
export * from "./db";
export * from "./images";
export declare const idbApiLayer: {
    getStudysetById: (id: number, resolveProps?: StudysetResolveProps) => Promise<Studyset | null>;
    getTermsByStudysetId: (studysetId: number, resolveProps?: TermResolveProps) => Promise<Term[]>;
    getTermById: (termId: number, resolveProps?: TermResolveProps) => Promise<Term>;
    getTermsByIds: (termIds: number[], resolveProps?: TermResolveProps) => Promise<(Term | null)[]>;
    getStudysetsByIds: (ids: number[], resolveProps?: {
        terms?: boolean | TermResolveProps;
        termsCount?: boolean;
    }) => Promise<(Studyset | undefined)[]>;
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
    recordPracticeTest: (practiceTest: any, getCloudStudysetIds?: (cloudTermIds: string[]) => Promise<(number | string)[]>) => Promise<import("./db").PracticeTest | null>;
    getPracticeTestWithQuestions: (ptId: number) => Promise<import("./db").PracticeTest | null>;
    updatePracticeTestQuestion: (id: number, correct: boolean, userMarkedCorrect?: boolean) => Promise<Question | undefined>;
    getPracticeTestsByTermId: (termId: number | string) => Promise<import("./db").PracticeTest[]>;
    getMatchActivityById: (id: number, resolveProps?: MatchActivityResolveProps) => Promise<MatchActivity | null>;
    getMatchActivitiesByStudysetId: (studysetId: number | string, resolveProps?: MatchActivityResolveProps) => Promise<MatchActivity[]>;
    recordMatchActivity: (input: any, getCloudStudysetIds?: (cloudTermIds: string[]) => Promise<(number | string)[]>) => Promise<MatchActivity | null>;
    getRecentActivityStudysets: ({ first, after, last, before, skipCloudStudysets, getCloudStudysets }?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
        skipCloudStudysets?: boolean;
        getCloudStudysets?: (uuids: string[]) => Promise<(Studyset | null)[]>;
    }) => Promise<{
        edges: {
            node: Studyset;
            cursor: string;
        }[];
        pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
            endCursor: string | null;
        };
    }>;
    getRecentActivityStudysetCount: ({ skipCloudStudysets, getCloudStudysets }?: {
        skipCloudStudysets?: boolean;
        getCloudStudysets?: (uuids: string[]) => Promise<(Studyset | null)[]>;
    }) => Promise<number>;
};
