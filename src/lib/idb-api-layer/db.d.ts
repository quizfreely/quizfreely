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
    progressHistory?: TermProgressHistory[];
    topConfusionPairs?: TermConfusionPair[];
    topReverseConfusionPairs?: TermConfusionPair[];
}
interface TermAtp {
    id: number | string;
    term: string;
    def: string;
}
interface PracticeTest {
    id: number;
    studysetIds: (number | string)[];
    questionTermIds: (number | string)[];
    distractorTermIds: (number | string)[];
    timestamp: string;
    questionsCorrect: number;
    questionsTotal: number;
    questions: Question[];
}
interface Question {
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
    termLeitnerSystemBox?: number;
    defLeitnerSystemBox?: number;
}
interface TermProgressHistory {
    id: number;
    timestamp: string;
    termId: number | string;
    termCorrectCount: number;
    termIncorrectCount: number;
    defCorrectCount: number;
    defIncorrectCount: number;
}
interface TermConfusionPair {
    id: number;
    termId: number | string;
    confusedTermId: number | string;
    answeredWith: string;
    confusedCount: number;
    lastConfusedAt: string;
    term?: Omit<Term, "topConfusionPairs" | "topReverseConfusionPairs">;
    confusedTerm?: Omit<Term, "topConfusionPairs" | "topReverseConfusionPairs">;
}
interface Image {
    key: number;
    blob: Blob;
}
declare const db: Dexie & {
    studysets: EntityTable<Studyset, "id">;
    terms: EntityTable<Term, "id">;
    practiceTests: EntityTable<PracticeTest, "id">;
    termProgress: EntityTable<TermProgress, "id">;
    termProgressHistory: EntityTable<TermProgressHistory, "id">;
    termConfusionPairs: EntityTable<TermConfusionPair, "id">;
    images: EntityTable<Image, "key">;
};
export type { Studyset, Term, TermAtp, PracticeTest, Question, MCQ, TFQ, FRQ, TermProgress, TermProgressHistory, TermConfusionPair };
export { db };
