import type { VocabularyEntry, LookupResult, PhraseLookupResult, DebugLine, Token } from './types.js';
import type { VocabularyProvider } from './adapters/types.js';
import { getCandidates } from './mutations.js';

/** Pattern to strip non-letter characters for lookup cleaning. */
const CLEAN_PATTERN = /[^a-zàáâãäåæçèéêëìíîïðñòóôõöùúûüýÿŵŷỳ·']/gi;

/**
 * The LookupEngine holds an in-memory index of vocabulary entries and provides
 * synchronous O(1) word lookups with Welsh mutation normalisation.
 *
 * Usage:
 * ```ts
 * const provider = new StaticVocabularyProvider(myVocabArray);
 * const engine = await LookupEngine.create(provider, 'nant-gwrtheyrn');
 * const result = engine.lookup('fwthyn'); // finds "bwthyn" via soft mutation
 * ```
 */
export class LookupEngine {
  private index: Map<string, VocabularyEntry>;
  private phraseIndex: Map<string, VocabularyEntry[]>;

  /**
   * When false, all lookups return empty results and hasTranslation returns false.
   * Useful as a framework-agnostic kill switch — set to false to disable translation
   * without changing any component props.
   */
  enabled: boolean = true;

  private constructor(vocabulary: VocabularyEntry[]) {
    this.index = new Map();
    this.phraseIndex = new Map();
    for (const entry of vocabulary) {
      const key = entry.welsh.toLowerCase();
      if (key.includes(' ')) {
        const firstWord = key.split(' ')[0];
        const existing = this.phraseIndex.get(firstWord) ?? [];
        existing.push(entry);
        this.phraseIndex.set(firstWord, existing);
      } else {
        this.index.set(key, entry);
      }
    }
    // Sort phrase entries by word count descending for greedy (longest) matching.
    for (const entries of this.phraseIndex.values()) {
      entries.sort((a, b) => b.welsh.split(' ').length - a.welsh.split(' ').length);
    }
  }

  /**
   * Create a LookupEngine by loading vocabulary from a provider.
   * This is the only async boundary — all subsequent lookups are synchronous.
   */
  static async create(
    provider: VocabularyProvider,
    siteSlug: string,
  ): Promise<LookupEngine> {
    const vocabulary = await provider.getVocabulary(siteSlug);
    return new LookupEngine(vocabulary);
  }

  /**
   * Create a LookupEngine directly from an array of vocabulary entries.
   * Useful when data is already available (e.g. from Zero-Sync local cache).
   */
  static fromEntries(vocabulary: VocabularyEntry[]): LookupEngine {
    return new LookupEngine(vocabulary);
  }

  /** The number of vocabulary entries in the index (single-word + phrase entries). */
  get size(): number {
    let phraseCount = 0;
    for (const entries of this.phraseIndex.values()) {
      phraseCount += entries.length;
    }
    return this.index.size + phraseCount;
  }

  /**
   * Look up a Welsh word, trying mutation reversals to find the radical form.
   *
   * @param rawWord - A word as it appears in text, possibly mutated, possibly with punctuation.
   * @returns A LookupResult with the matched entry (or null), the recovered radical, and a debug trace.
   */
  lookup(rawWord: string): LookupResult {
    if (!this.enabled) return { entry: null, radical: null, debugLines: [] };
    const clean = rawWord.replace(CLEAN_PATTERN, '').toLowerCase();
    if (clean === '') {
      return { entry: null, radical: null, debugLines: [] };
    }

    const { candidates, mutationLog } = getCandidates(clean);
    const debugLines: DebugLine[] = [];

    for (const candidate of candidates) {
      const entry = this.index.get(candidate);
      const isMutated = candidate !== clean;

      if (entry) {
        debugLines.push({
          type: isMutated ? 'mutated' : 'hit',
          msg: isMutated
            ? `"${rawWord}" → normalised to "${candidate}" (${mutationLog.map((l) => l.type).join(', ')}) → MATCH`
            : `"${rawWord}" → direct match`,
        });
        return { entry, radical: isMutated ? candidate : null, debugLines };
      }

      debugLines.push({
        type: 'miss',
        msg: `"${candidate}" — not in vocabulary`,
      });
    }

    return { entry: null, radical: null, debugLines };
  }

  /**
   * Lightweight check for whether a word has a translation.
   * Useful at render time to mark translatable words without building a full debug trace.
   */
  hasTranslation(rawWord: string): boolean {
    if (!this.enabled) return false;
    const clean = rawWord.replace(CLEAN_PATTERN, '').toLowerCase();
    if (clean === '') return false;

    const { candidates } = getCandidates(clean);
    return candidates.some((c) => this.index.has(c));
  }

  /**
   * Look up a multi-word phrase starting at the given token index.
   *
   * Walks forward through `tokens` from `startIndex`, applying mutation reversal
   * independently per word, and checks against phrase entries in the vocabulary.
   * Longest matching phrase wins (greedy).
   *
   * @param tokens - The full token array from `tokenise()`.
   * @param startIndex - Index of the first token to consider.
   * @returns A PhraseLookupResult with the matched entry, or null if no phrase found.
   */
  lookupPhrase(tokens: Token[], startIndex: number): PhraseLookupResult {
    const empty: PhraseLookupResult = { entry: null, radicals: null, wordCount: 0, tokenSpan: 0, debugLines: [] };
    if (!this.enabled) return empty;

    const startToken = tokens[startIndex];
    if (!startToken || startToken.type !== 'word') return empty;

    const firstClean = startToken.word.replace(CLEAN_PATTERN, '').toLowerCase();
    if (firstClean === '') return empty;

    const { candidates: firstCandidates } = getCandidates(firstClean);
    const debugLines: DebugLine[] = [];

    for (const firstCandidate of firstCandidates) {
      const phraseEntries = this.phraseIndex.get(firstCandidate);
      if (!phraseEntries) continue;

      for (const entry of phraseEntries) {
        const expectedRadicals = entry.welsh.toLowerCase().split(' ');
        const result = this.matchPhrase(tokens, startIndex, expectedRadicals);
        if (result) {
          const firstIsMutated = firstCandidate !== firstClean;
          debugLines.push({
            type: firstIsMutated ? 'mutated' : 'hit',
            msg: `phrase "${entry.welsh}" matched from token ${startIndex} (span ${result.tokenSpan})`,
          });
          return {
            entry,
            radicals: result.radicals,
            wordCount: expectedRadicals.length,
            tokenSpan: result.tokenSpan,
            debugLines,
          };
        }
      }
    }

    debugLines.push({ type: 'miss', msg: `no phrase match starting at token ${startIndex}` });
    return { ...empty, debugLines };
  }

  /**
   * Lightweight check for whether a phrase starts at the given token index.
   * Returns the token span if a phrase is found so the caller knows how many tokens to skip.
   */
  hasPhrase(tokens: Token[], startIndex: number): { match: boolean; tokenSpan: number } {
    if (!this.enabled) return { match: false, tokenSpan: 0 };

    const startToken = tokens[startIndex];
    if (!startToken || startToken.type !== 'word') return { match: false, tokenSpan: 0 };

    const firstClean = startToken.word.replace(CLEAN_PATTERN, '').toLowerCase();
    if (firstClean === '') return { match: false, tokenSpan: 0 };

    const { candidates: firstCandidates } = getCandidates(firstClean);

    for (const firstCandidate of firstCandidates) {
      const phraseEntries = this.phraseIndex.get(firstCandidate);
      if (!phraseEntries) continue;

      for (const entry of phraseEntries) {
        const expectedRadicals = entry.welsh.toLowerCase().split(' ');
        const result = this.matchPhrase(tokens, startIndex, expectedRadicals);
        if (result) return { match: true, tokenSpan: result.tokenSpan };
      }
    }

    return { match: false, tokenSpan: 0 };
  }

  /**
   * Try to match a sequence of expected radical forms against tokens starting at startIndex.
   * Returns radicals and tokenSpan on success, or null on failure.
   */
  private matchPhrase(
    tokens: Token[],
    startIndex: number,
    expectedRadicals: string[],
  ): { radicals: (string | null)[]; tokenSpan: number } | null {
    const radicals: (string | null)[] = [];
    let tokenPos = startIndex;
    let wordIndex = 0;

    while (wordIndex < expectedRadicals.length && tokenPos < tokens.length) {
      const token = tokens[tokenPos];

      if (token.type === 'whitespace') {
        tokenPos++;
        continue;
      }

      if (token.type === 'punctuation') return null;

      // It's a word token.
      const clean = token.word.replace(CLEAN_PATTERN, '').toLowerCase();
      if (clean === '') return null;

      const { candidates } = getCandidates(clean);
      const expected = expectedRadicals[wordIndex];
      const matchingCandidate = candidates.find((c) => c === expected);

      if (!matchingCandidate) return null;

      const isMutated = matchingCandidate !== clean;
      radicals.push(isMutated ? matchingCandidate : null);
      wordIndex++;
      tokenPos++;
    }

    if (wordIndex < expectedRadicals.length) return null;

    return { radicals, tokenSpan: tokenPos - startIndex };
  }
}
