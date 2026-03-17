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
interface PracticeTest {
    id: number;
    studysetId: number | string;
    timestamp: string;
    questionsCorrect: number;
    questionsTotal: number;
    questions: Question[];
}
interface Question {
    questionType: string;
    mcq?: MCQ;
    trueFalseQuestion?: TrueFalseQuestion;
}
interface MCQ {
    answerWith: string;
    answeredTerm: Term;
    correct: boolean;
    correctChoiceIndex: number;
    distractors: Term[];
    term: Term;
}
interface TrueFalseQuestion {
    answerWith: string;
    answeredBool: boolean;
    correct: boolean;
    distractor: Term;
    term: Term;
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
export type { Studyset, Term, PracticeTest, Question, MCQ, TrueFalseQuestion, TermProgress, TermProgressHistory, TermConfusionPair };
export { db };
