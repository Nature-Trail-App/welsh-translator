import type { VocabularyEntry, LookupResult, DebugLine } from './types.js';
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

  private constructor(vocabulary: VocabularyEntry[]) {
    this.index = new Map();
    for (const entry of vocabulary) {
      this.index.set(entry.welsh.toLowerCase(), entry);
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

  /** The number of vocabulary entries in the index. */
  get size(): number {
    return this.index.size;
  }

  /**
   * Look up a Welsh word, trying mutation reversals to find the radical form.
   *
   * @param rawWord - A word as it appears in text, possibly mutated, possibly with punctuation.
   * @returns A LookupResult with the matched entry (or null), the recovered radical, and a debug trace.
   */
  lookup(rawWord: string): LookupResult {
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
    const clean = rawWord.replace(CLEAN_PATTERN, '').toLowerCase();
    if (clean === '') return false;

    const { candidates } = getCandidates(clean);
    return candidates.some((c) => this.index.has(c));
  }
}
