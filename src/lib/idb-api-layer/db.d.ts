/*!
 * Quizfreely IDB API Layer, licensed under GPL-3.0-or-later.
 * Copyright (c) 2025-2026 Ehan Ahamed and contributors
 *
 * https://codeberg.org/quizfreely/idb-api-layer
 * https://github.com/quizfreely/idb-api-layer
 */
import { Dexie, type EntityTable } from "dexie";
interface Studyset {
    id: number;
    title: string;
    draft: boolean;
    createdAt: string;
    updatedAt: string;
    terms?: Term[];
    practiceTests?: PracticeTest[];
    matchActivities?: MatchActivity[];
}
interface Term {
    id: number;
    term: string;
    def: string;
    termImageUrl?: string | null;
    defImageUrl?: string | null;
    termImageKey?: number;
    defImageKey?: number;
    sortOrder: number;
    studysetId: number;
    createdAt: string;
    updatedAt: string;
    progress?: TermProgress;
}
interface TermAtp {
    id: number | string;
    term: string;
    def: string;
}
interface PracticeTest {
    id: number;
    studysetIds: (number | string)[];
    timestamp: string;
    questionsCorrect: number;
    questionsTotal: number;
    questions?: Question[];
}
interface PracticeTestQuestion {
    id: number;
    practiceTestId: number;
    termId: number | string;
    term: string;
    def: string;
    type: "mcq" | "tfq" | "frq";
    position: number;
    correct: boolean;
    answerWith: string;
    data: MCQData | TFQData | FRQData;
}
interface MCQData {
    distractors: TermAtp[];
    correctChoiceIndex: number;
    answeredIndex: number | null;
}
interface TFQData {
    distractor?: TermAtp | null;
    answeredBool: boolean;
}
interface FRQData {
    answeredString: string;
    userMarkedCorrect?: boolean;
}
interface Question {
    id?: number;
    mcq?: MCQ;
    tfq?: TFQ;
    frq?: FRQ;
}
interface MCQ {
    answerWith: string;
    term: TermAtp;
    correct: boolean;
    correctChoiceIndex: number;
    answeredIndex: number | null;
    distractors: TermAtp[];
}
interface TFQ {
    answerWith: string;
    term: TermAtp;
    correct: boolean;
    answeredBool: boolean;
    distractor?: TermAtp;
}
interface FRQ {
    answerWith: string;
    term: TermAtp;
    correct: boolean;
    userMarkedCorrect?: boolean;
    answeredString: string;
}
interface TermProgress {
    id: number;
    termId: number | string;
    termCorrectCount: number;
    termIncorrectCount: number;
    termReviewCount: number;
    defCorrectCount: number;
    defIncorrectCount: number;
    defReviewCount: number;
    termFirstReviewedAt?: string;
    termLastReviewedAt?: string;
    defFirstReviewedAt?: string;
    defLastReviewedAt?: string;
}
type PracticeTestQuestionType = "mcq" | "tfq" | "frq";
type ReviewActivityType = "PRACTICE_TEST" | "MATCH";
interface MatchActivity {
    id: number;
    durationMs: number;
    endTimestamp: string;
    studysetIds: (number | string)[];
    termIds?: (number | string)[];
    incorrectPairIds?: (number | string)[][];
}
interface ReviewEvent {
    id: number;
    termId: number | string;
    practiceTestQuestionId: number | null;
    matchActivityId: number | null;
    correct: boolean;
    answerWith: string | null;
    timestamp: string;
    answeredTermId: number | string | null;
    practiceTestQuestionType: PracticeTestQuestionType | null;
    reviewActivityType: ReviewActivityType;
    answeredString: string | null;
}
interface Image {
    key: number;
    blob: Blob;
}
declare const db: Dexie & {
    studysets: EntityTable<Studyset, "id">;
    terms: EntityTable<Term, "id">;
    practiceTests: EntityTable<PracticeTest, "id">;
    practiceTestQuestions: EntityTable<PracticeTestQuestion, "id">;
    termProgress: EntityTable<TermProgress, "id">;
    reviewEvents: EntityTable<ReviewEvent, "id">;
    matchActivities: EntityTable<MatchActivity, "id">;
    images: EntityTable<Image, "key">;
};
export type { Studyset, Term, TermAtp, PracticeTest, PracticeTestQuestion, MCQData, TFQData, FRQData, Question, MCQ, TFQ, FRQ, TermProgress, ReviewEvent, MatchActivity, PracticeTestQuestionType, ReviewActivityType };
export { db };
