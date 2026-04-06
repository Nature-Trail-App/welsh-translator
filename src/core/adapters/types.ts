import type { VocabularyEntry } from '../types.js';

/**
 * Abstract interface for loading vocabulary data.
 *
 * Implementations might fetch from a static array, Zero-Sync, PayloadCMS REST API,
 * or any other data source. The async boundary is at load time only — once vocabulary
 * is loaded into the LookupEngine, all per-word lookups are synchronous.
 */
export interface VocabularyProvider {
  getVocabulary(siteSlug: string): Promise<VocabularyEntry[]>;
}
