import type { VocabularyEntry } from '../types.js';
import type { VocabularyProvider } from './types.js';

/**
 * A vocabulary provider backed by a static array of entries.
 * Useful for testing, PoC work, or when vocabulary is already loaded in memory.
 */
export class StaticVocabularyProvider implements VocabularyProvider {
  constructor(private entries: VocabularyEntry[]) {}

  async getVocabulary(siteSlug: string): Promise<VocabularyEntry[]> {
    return this.entries.filter((e) => e.site === siteSlug);
  }
}
