/** A single vocabulary entry mapping a Welsh radical form to its English translation. */
export interface VocabularyEntry {
  id: string;
  /** The radical (root/dictionary) form of the Welsh word — never mutated. */
  welsh: string;
  /** English translation or gloss. */
  english: string;
  /** Site slug scoping this entry (e.g. "nant-gwrtheyrn"). */
  site: string;
  /** Optional editorial note (e.g. "plural: meini", "also used in place names"). */
  note?: string;
}

// ---------------------------------------------------------------------------
// Mutation types
// ---------------------------------------------------------------------------

export type MutationType = 'aspirate' | 'nasal' | 'soft' | 'soft-g-deletion';

export interface MutationLogEntry {
  type: MutationType;
  /** The mutated prefix found in the text (e.g. "ch", "f"). */
  from: string;
  /** The radical prefix it maps back to (e.g. "c", "b or m"). */
  to: string;
}

export interface CandidateResult {
  /** Candidate radical forms to try, in priority order. First element is always the word as-is. */
  candidates: string[];
  /** Log of which mutation reversals were attempted. */
  mutationLog: MutationLogEntry[];
}

// ---------------------------------------------------------------------------
// Lookup types
// ---------------------------------------------------------------------------

export type DebugLineType = 'hit' | 'mutated' | 'miss';

export interface DebugLine {
  type: DebugLineType;
  msg: string;
}

export interface LookupResult {
  /** The matched vocabulary entry, or null if no match found. */
  entry: VocabularyEntry | null;
  /** The recovered radical form, if the word was mutated. Null for direct matches. */
  radical: string | null;
  /** Trace of every candidate tried — useful for debugging. */
  debugLines: DebugLine[];
}

// ---------------------------------------------------------------------------
// Tokeniser types
// ---------------------------------------------------------------------------

export type TokenType = 'word' | 'whitespace' | 'punctuation';

export interface WordToken {
  type: 'word';
  /** The full original text of this token including surrounding punctuation. */
  raw: string;
  /** The extracted word (letters only). */
  word: string;
  /** Leading punctuation (e.g. opening quote). Empty string if none. */
  pre: string;
  /** Trailing punctuation (e.g. comma, full stop). Empty string if none. */
  post: string;
}

export interface WhitespaceToken {
  type: 'whitespace';
  raw: string;
}

export interface PunctuationToken {
  type: 'punctuation';
  raw: string;
}

export type Token = WordToken | WhitespaceToken | PunctuationToken;
