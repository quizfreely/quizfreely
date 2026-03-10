/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export enum AnswerWith {
  Def = 'DEF',
  Term = 'TERM'
}

export enum AuthType {
  OauthGoogle = 'OAUTH_GOOGLE',
  UsernamePassword = 'USERNAME_PASSWORD'
}

export type AuthedUser = {
  __typename?: 'AuthedUser';
  authType?: Maybe<AuthType>;
  displayName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  modPerms?: Maybe<Scalars['Boolean']['output']>;
  oauthGoogleEmail?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type Frq = {
  __typename?: 'FRQ';
  answerWith?: Maybe<AnswerWith>;
  answeredString?: Maybe<Scalars['String']['output']>;
  correct?: Maybe<Scalars['Boolean']['output']>;
  term?: Maybe<Term>;
  userMarkedCorrect?: Maybe<Scalars['Boolean']['output']>;
};

export type FrqInput = {
  answerWith?: InputMaybe<AnswerWith>;
  answeredString?: InputMaybe<Scalars['String']['input']>;
  correct?: InputMaybe<Scalars['Boolean']['input']>;
  term?: InputMaybe<TermInput>;
  userMarkedCorrect?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Folder = {
  __typename?: 'Folder';
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  studysetCount: Scalars['Int']['output'];
  studysetDrafts: StudysetConnection;
  studysets: StudysetConnection;
  user?: Maybe<User>;
};


export type FolderStudysetDraftsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type FolderStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type FolderConnection = {
  __typename?: 'FolderConnection';
  edges: Array<FolderEdge>;
  pageInfo: PageInfo;
};

export type FolderEdge = {
  __typename?: 'FolderEdge';
  cursor: Scalars['String']['output'];
  node: Folder;
};

export type Mcq = {
  __typename?: 'MCQ';
  answerWith?: Maybe<AnswerWith>;
  answeredTerm?: Maybe<Term>;
  correct?: Maybe<Scalars['Boolean']['output']>;
  correctChoiceIndex?: Maybe<Scalars['Int']['output']>;
  distractors?: Maybe<Array<Maybe<Term>>>;
  term?: Maybe<Term>;
};

export type McqInput = {
  answerWith?: InputMaybe<AnswerWith>;
  answeredTerm?: InputMaybe<TermInput>;
  correct?: InputMaybe<Scalars['Boolean']['input']>;
  correctChoiceIndex?: InputMaybe<Scalars['Int']['input']>;
  distractors?: InputMaybe<Array<InputMaybe<TermInput>>>;
  term?: InputMaybe<TermInput>;
};

export type MatchQuestion = {
  __typename?: 'MatchQuestion';
  answerWith?: Maybe<AnswerWith>;
  answeredTerm?: Maybe<Term>;
  correct?: Maybe<Scalars['Boolean']['output']>;
  group?: Maybe<Scalars['Int']['output']>;
  term?: Maybe<Term>;
};

export type MatchQuestionInput = {
  answerWith?: InputMaybe<AnswerWith>;
  answeredTerm?: InputMaybe<TermInput>;
  correct?: InputMaybe<Scalars['Boolean']['input']>;
  group?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<TermInput>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createFolder?: Maybe<Folder>;
  createStudyset?: Maybe<Studyset>;
  createTerms?: Maybe<Array<Maybe<Term>>>;
  deleteFolder?: Maybe<Scalars['ID']['output']>;
  deleteStudyset?: Maybe<Scalars['ID']['output']>;
  deleteTerms?: Maybe<Array<Scalars['ID']['output']>>;
  recordConfusedTerms?: Maybe<Scalars['Boolean']['output']>;
  recordPracticeTest?: Maybe<PracticeTest>;
  removeStudysetFromFolder?: Maybe<Scalars['Boolean']['output']>;
  renameFolder?: Maybe<Folder>;
  saveStudyset?: Maybe<Scalars['Boolean']['output']>;
  setStudysetFolder?: Maybe<Scalars['Boolean']['output']>;
  unsaveStudyset?: Maybe<Scalars['Boolean']['output']>;
  updatePracticeTest?: Maybe<PracticeTest>;
  updateStudyset?: Maybe<Studyset>;
  updateTermProgress?: Maybe<Array<Maybe<TermProgress>>>;
  updateTerms?: Maybe<Array<Maybe<Term>>>;
  updateUser?: Maybe<AuthedUser>;
};


export type MutationCreateFolderArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateStudysetArgs = {
  draft: Scalars['Boolean']['input'];
  folderId?: InputMaybe<Scalars['ID']['input']>;
  studyset: StudysetInput;
};


export type MutationCreateTermsArgs = {
  studysetId: Scalars['ID']['input'];
  terms: Array<NewTermInput>;
};


export type MutationDeleteFolderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteStudysetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTermsArgs = {
  ids: Array<Scalars['ID']['input']>;
  studysetId: Scalars['ID']['input'];
};


export type MutationRecordConfusedTermsArgs = {
  confusedTerms?: InputMaybe<Array<InputMaybe<TermConfusionPairInput>>>;
};


export type MutationRecordPracticeTestArgs = {
  input?: InputMaybe<PracticeTestInput>;
};


export type MutationRemoveStudysetFromFolderArgs = {
  studysetId: Scalars['ID']['input'];
};


export type MutationRenameFolderArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationSaveStudysetArgs = {
  studysetId: Scalars['ID']['input'];
};


export type MutationSetStudysetFolderArgs = {
  folderId: Scalars['ID']['input'];
  studysetId: Scalars['ID']['input'];
};


export type MutationUnsaveStudysetArgs = {
  studysetId: Scalars['ID']['input'];
};


export type MutationUpdatePracticeTestArgs = {
  input?: InputMaybe<PracticeTestInput>;
};


export type MutationUpdateStudysetArgs = {
  draft: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
  studyset?: InputMaybe<StudysetInput>;
};


export type MutationUpdateTermProgressArgs = {
  termProgress: Array<TermProgressInput>;
};


export type MutationUpdateTermsArgs = {
  studysetId: Scalars['ID']['input'];
  terms: Array<TermInput>;
};


export type MutationUpdateUserArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type NewTermInput = {
  def?: InputMaybe<Scalars['String']['input']>;
  sortOrder: Scalars['Int']['input'];
  term?: InputMaybe<Scalars['String']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PracticeTest = {
  __typename?: 'PracticeTest';
  id?: Maybe<Scalars['ID']['output']>;
  questions?: Maybe<Array<Maybe<Question>>>;
  questionsCorrect?: Maybe<Scalars['Int']['output']>;
  questionsTotal?: Maybe<Scalars['Int']['output']>;
  studysetId?: Maybe<Scalars['ID']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
};

export type PracticeTestInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  questions?: InputMaybe<Array<InputMaybe<QuestionInput>>>;
  questionsCorrect?: InputMaybe<Scalars['Int']['input']>;
  questionsTotal?: InputMaybe<Scalars['Int']['input']>;
  studysetId?: InputMaybe<Scalars['ID']['input']>;
  timestamp?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  allSubjects?: Maybe<Array<Maybe<Subject>>>;
  authed?: Maybe<Scalars['Boolean']['output']>;
  authedUser?: Maybe<AuthedUser>;
  folder?: Maybe<Folder>;
  myFolders: FolderConnection;
  mySavedStudysetCount: Scalars['Int']['output'];
  mySavedStudysets: StudysetConnection;
  myStudysetCount: Scalars['Int']['output'];
  myStudysetDrafts: StudysetConnection;
  myStudysets: StudysetConnection;
  practiceTest?: Maybe<PracticeTest>;
  recentlyCreatedStudysets: StudysetConnection;
  recentlyUpdatedStudysets: StudysetConnection;
  searchStudysetCount: Scalars['Int']['output'];
  searchStudysets: StudysetConnection;
  studyset?: Maybe<Studyset>;
  studysetCount: Scalars['Int']['output'];
  studysetUpdateCount: Scalars['Int']['output'];
  subject?: Maybe<Subject>;
  subjectsByCategory?: Maybe<Array<Maybe<Subject>>>;
  subjectsByKeyword?: Maybe<Array<Maybe<Subject>>>;
  term?: Maybe<Term>;
  user?: Maybe<User>;
};


export type QueryFolderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMyFoldersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMySavedStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyStudysetCountArgs = {
  hideFoldered?: InputMaybe<Scalars['Boolean']['input']>;
  includeDrafts?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyStudysetDraftsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hideFoldered?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hideFoldered?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPracticeTestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRecentlyCreatedStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRecentlyUpdatedStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySearchStudysetCountArgs = {
  q: Scalars['String']['input'];
};


export type QuerySearchStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  q: Scalars['String']['input'];
};


export type QueryStudysetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStudysetCountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  includeDrafts?: InputMaybe<Scalars['Boolean']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryStudysetUpdateCountArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  includeDrafts?: InputMaybe<Scalars['Boolean']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySubjectArgs = {
  id: Scalars['String']['input'];
};


export type QuerySubjectsByCategoryArgs = {
  category?: InputMaybe<SubjectCategory>;
};


export type QuerySubjectsByKeywordArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTermArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  frq?: Maybe<Frq>;
  matchQuestionInput?: Maybe<MatchQuestion>;
  mcq?: Maybe<Mcq>;
  questionType?: Maybe<QuestionType>;
  trueFalseQuestion?: Maybe<TrueFalseQuestion>;
};

export type QuestionInput = {
  frq?: InputMaybe<FrqInput>;
  matchQuestion?: InputMaybe<MatchQuestionInput>;
  mcq?: InputMaybe<McqInput>;
  questionType?: InputMaybe<QuestionType>;
  trueFalseQuestion?: InputMaybe<TrueFalseQuestionInput>;
};

export enum QuestionType {
  Frq = 'FRQ',
  Match = 'MATCH',
  Mcq = 'MCQ',
  TrueFalse = 'TRUE_FALSE'
}

export type Studyset = {
  __typename?: 'Studyset';
  createdAt?: Maybe<Scalars['String']['output']>;
  draft?: Maybe<Scalars['Boolean']['output']>;
  folder?: Maybe<Folder>;
  id?: Maybe<Scalars['ID']['output']>;
  practiceTests?: Maybe<Array<Maybe<PracticeTest>>>;
  private?: Maybe<Scalars['Boolean']['output']>;
  saved?: Maybe<Scalars['Boolean']['output']>;
  subject?: Maybe<Subject>;
  terms?: Maybe<Array<Maybe<Term>>>;
  termsCount?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type StudysetConnection = {
  __typename?: 'StudysetConnection';
  edges: Array<StudysetEdge>;
  pageInfo: PageInfo;
};

export type StudysetEdge = {
  __typename?: 'StudysetEdge';
  cursor: Scalars['String']['output'];
  node: Studyset;
};

export type StudysetInput = {
  private: Scalars['Boolean']['input'];
  subjectId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type Subject = {
  __typename?: 'Subject';
  category?: Maybe<SubjectCategory>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  studysetCount: Scalars['Int']['output'];
  studysets: StudysetConnection;
};


export type SubjectStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export enum SubjectCategory {
  La = 'LA',
  Lang = 'LANG',
  Math = 'MATH',
  SocialStudies = 'SOCIAL_STUDIES',
  Stem = 'STEM'
}

export type Term = {
  __typename?: 'Term';
  createdAt?: Maybe<Scalars['String']['output']>;
  def?: Maybe<Scalars['String']['output']>;
  defImageUrl?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  progress?: Maybe<TermProgress>;
  progressHistory?: Maybe<Array<Maybe<TermProgressHistory>>>;
  sortOrder?: Maybe<Scalars['Int']['output']>;
  term?: Maybe<Scalars['String']['output']>;
  termImageUrl?: Maybe<Scalars['String']['output']>;
  topConfusionPairs?: Maybe<Array<Maybe<TermConfusionPair>>>;
  topReverseConfusionPairs?: Maybe<Array<Maybe<TermConfusionPair>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type TermConfusionPair = {
  __typename?: 'TermConfusionPair';
  answeredWith?: Maybe<AnswerWith>;
  confusedCount?: Maybe<Scalars['Int']['output']>;
  confusedTerm?: Maybe<Term>;
  id?: Maybe<Scalars['ID']['output']>;
  lastConfusedAt?: Maybe<Scalars['String']['output']>;
  term?: Maybe<Term>;
};

export type TermConfusionPairInput = {
  answeredWith?: InputMaybe<AnswerWith>;
  confusedAt?: InputMaybe<Scalars['String']['input']>;
  confusedCountIncrease?: InputMaybe<Scalars['Int']['input']>;
  confusedTermId?: InputMaybe<Scalars['ID']['input']>;
  termId?: InputMaybe<Scalars['ID']['input']>;
};

export type TermInput = {
  def?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};

export type TermProgress = {
  __typename?: 'TermProgress';
  defCorrectCount?: Maybe<Scalars['Int']['output']>;
  defFirstReviewedAt?: Maybe<Scalars['String']['output']>;
  defIncorrectCount?: Maybe<Scalars['Int']['output']>;
  defLastReviewedAt?: Maybe<Scalars['String']['output']>;
  defLeitnerSystemBox?: Maybe<Scalars['Int']['output']>;
  defReviewCount?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  termCorrectCount?: Maybe<Scalars['Int']['output']>;
  termFirstReviewedAt?: Maybe<Scalars['String']['output']>;
  termIncorrectCount?: Maybe<Scalars['Int']['output']>;
  termLastReviewedAt?: Maybe<Scalars['String']['output']>;
  termLeitnerSystemBox?: Maybe<Scalars['Int']['output']>;
  termReviewCount?: Maybe<Scalars['Int']['output']>;
};

export type TermProgressHistory = {
  __typename?: 'TermProgressHistory';
  defCorrectCount?: Maybe<Scalars['Int']['output']>;
  defIncorrectCount?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  termCorrectCount?: Maybe<Scalars['Int']['output']>;
  termIncorrectCount?: Maybe<Scalars['Int']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
};

export type TermProgressInput = {
  defCorrectIncrease?: InputMaybe<Scalars['Int']['input']>;
  defIncorrectIncrease?: InputMaybe<Scalars['Int']['input']>;
  defLeitnerSystemBox?: InputMaybe<Scalars['Int']['input']>;
  defReviewedAt?: InputMaybe<Scalars['String']['input']>;
  termCorrectIncrease?: InputMaybe<Scalars['Int']['input']>;
  termId: Scalars['ID']['input'];
  termIncorrectIncrease?: InputMaybe<Scalars['Int']['input']>;
  termLeitnerSystemBox?: InputMaybe<Scalars['Int']['input']>;
  termReviewedAt?: InputMaybe<Scalars['String']['input']>;
};

export type TrueFalseQuestion = {
  __typename?: 'TrueFalseQuestion';
  answerWith?: Maybe<AnswerWith>;
  answeredBool?: Maybe<Scalars['Boolean']['output']>;
  correct?: Maybe<Scalars['Boolean']['output']>;
  distractor?: Maybe<Term>;
  term?: Maybe<Term>;
};

export type TrueFalseQuestionInput = {
  answerWith?: InputMaybe<AnswerWith>;
  answeredBool?: InputMaybe<Scalars['Boolean']['input']>;
  correct?: InputMaybe<Scalars['Boolean']['input']>;
  distractor?: InputMaybe<TermInput>;
  term?: InputMaybe<TermInput>;
};

export type User = {
  __typename?: 'User';
  displayName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  studysetCount: Scalars['Int']['output'];
  studysets: StudysetConnection;
  username?: Maybe<Scalars['String']['output']>;
};


export type UserStudysetCountArgs = {
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type UserStudysetsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
