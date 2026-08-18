import { Studyset, Term, MatchActivity, Question, ReviewEventStats } from "./db";
type StudysetResolveProps = {
    terms?: boolean | TermResolveProps;
    practiceTests?: boolean;
    matchActivities?: boolean;
    reviewEventStatsByDay?: boolean | number;
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
type ActivityHistoryPracticeTest = {
    id: number;
    timestamp: string;
    questionsCorrect: number;
    questionsTotal: number;
    studysets: Studyset[];
};
type ActivityHistoryMatchActivity = {
    id: number;
    endTimestamp: string;
    durationMs: number;
    incorrectPairIds: (number | string)[][];
    studysets: Studyset[];
};
type ActivityHistoryEntry = ActivityHistoryPracticeTest | ActivityHistoryMatchActivity;
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
    getReviewEventStatsByDay: ({ studysetId, termIds, last }?: {
        studysetId?: number | string;
        termIds?: (number | string)[];
        last?: number;
    }) => Promise<ReviewEventStats[]>;
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
    activityHistory: ({ last, getCloudStudysets }: {
        last: number;
        getCloudStudysets?: (ids: (number | string)[]) => Promise<(Studyset | null)[]>;
    }) => Promise<ActivityHistoryEntry[]>;
    recordMatchActivity: (input: any, getCloudStudysetIds?: (cloudTermIds: string[]) => Promise<(number | string)[]>) => Promise<MatchActivity | null>;
    getRecentActivityStudysets: ({ skipCloudStudysets, getCloudStudysets }?: {
        skipCloudStudysets?: boolean;
        getCloudStudysets?: (uuids: string[]) => Promise<(Studyset | null)[]>;
    }) => Promise<Studyset[]>;
    getRecentActivityStudysetCount: ({ skipCloudStudysets, getCloudStudysets }?: {
        skipCloudStudysets?: boolean;
        getCloudStudysets?: (uuids: string[]) => Promise<(Studyset | null)[]>;
    }) => Promise<number>;
};
