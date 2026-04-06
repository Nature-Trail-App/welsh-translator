// Types
export type {
  VocabularyEntry,
  MutationType,
  MutationLogEntry,
  CandidateResult,
  DebugLineType,
  DebugLine,
  LookupResult,
  TokenType,
  Token,
  WordToken,
  WhitespaceToken,
  PunctuationToken,
} from './types.js';

// Adapter interface
export type { VocabularyProvider } from './adapters/types.js';

// Core functions
export { getCandidates } from './mutations.js';
export { tokenise } from './tokeniser.js';
export { LookupEngine } from './lookup-engine.js';

// Adapters
export { StaticVocabularyProvider } from './adapters/static.js';
