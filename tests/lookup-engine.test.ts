import { describe, it, expect } from 'vitest';
import { LookupEngine } from '../src/core/lookup-engine.js';
import { StaticVocabularyProvider } from '../src/core/adapters/static.js';
import { tokenise } from '../src/core/tokeniser.js';
import type { VocabularyEntry } from '../src/core/types.js';

const testVocabulary: VocabularyEntry[] = [
  { id: 'v01', welsh: 'nant', english: 'stream / valley', site: 'test-site', note: 'Also used in place names' },
  { id: 'v02', welsh: 'môr', english: 'sea', site: 'test-site' },
  { id: 'v03', welsh: 'mynydd', english: 'mountain', site: 'test-site' },
  { id: 'v04', welsh: 'bwthyn', english: 'cottage', site: 'test-site' },
  { id: 'v05', welsh: 'carreg', english: 'rock / stone', site: 'test-site' },
  { id: 'v06', welsh: 'tad', english: 'father', site: 'test-site' },
  { id: 'v07', welsh: 'pont', english: 'bridge', site: 'test-site' },
  { id: 'v08', welsh: 'gardd', english: 'garden', site: 'test-site' },
  { id: 'v09', welsh: 'llaw', english: 'hand', site: 'test-site' },
  { id: 'v10', welsh: 'rhyw', english: 'some / kind', site: 'test-site' },
  { id: 'v11', welsh: 'draig', english: 'dragon', site: 'test-site' },
  { id: 'v12', welsh: 'pen', english: 'head / top / end', site: 'test-site' },
];

function createEngine(): LookupEngine {
  return LookupEngine.fromEntries(testVocabulary);
}

describe('LookupEngine', () => {
  describe('construction', () => {
    it('creates from entries', () => {
      const engine = createEngine();
      expect(engine.size).toBe(testVocabulary.length);
    });

    it('creates from a VocabularyProvider', async () => {
      const provider = new StaticVocabularyProvider(testVocabulary);
      const engine = await LookupEngine.create(provider, 'test-site');
      expect(engine.size).toBe(testVocabulary.length);
    });

    it('filters by site when using a provider', async () => {
      const mixed = [
        ...testVocabulary,
        { id: 'other', welsh: 'ci', english: 'dog', site: 'other-site' },
      ];
      const provider = new StaticVocabularyProvider(mixed);
      const engine = await LookupEngine.create(provider, 'test-site');
      expect(engine.size).toBe(testVocabulary.length);
    });

    it('includes phrase entries in size count', () => {
      const vocab: VocabularyEntry[] = [
        { id: '1', welsh: 'taith', english: 'journey', site: 'test-site' },
        { id: '2', welsh: 'taith cerdded', english: 'a walk', site: 'test-site' },
        { id: '3', welsh: 'rydych chi', english: 'you are', site: 'test-site' },
      ];
      const engine = LookupEngine.fromEntries(vocab);
      expect(engine.size).toBe(3);
    });

    it('reports correct size with only phrase entries', () => {
      const vocab: VocabularyEntry[] = [
        { id: '1', welsh: 'taith cerdded', english: 'a walk', site: 'test-site' },
        { id: '2', welsh: 'rydych chi', english: 'you are', site: 'test-site' },
      ];
      const engine = LookupEngine.fromEntries(vocab);
      expect(engine.size).toBe(2);
    });
  });

  describe('direct lookups', () => {
    it('finds an exact match', () => {
      const engine = createEngine();
      const result = engine.lookup('nant');
      expect(result.entry).not.toBeNull();
      expect(result.entry?.english).toBe('stream / valley');
      expect(result.radical).toBeNull();
    });

    it('is case-insensitive', () => {
      const engine = createEngine();
      const result = engine.lookup('Môr');
      expect(result.entry?.english).toBe('sea');
    });

    it('returns null for unknown words', () => {
      const engine = createEngine();
      const result = engine.lookup('xyz');
      expect(result.entry).toBeNull();
    });

    it('returns the note when present', () => {
      const engine = createEngine();
      const result = engine.lookup('nant');
      expect(result.entry?.note).toBe('Also used in place names');
    });
  });

  describe('mutation lookups', () => {
    it('finds "fwthyn" via soft mutation (f → b = bwthyn)', () => {
      const engine = createEngine();
      const result = engine.lookup('fwthyn');
      expect(result.entry?.welsh).toBe('bwthyn');
      expect(result.radical).toBe('bwthyn');
    });

    it('finds "garreg" via soft mutation (g → c = carreg)', () => {
      const engine = createEngine();
      const result = engine.lookup('garreg');
      expect(result.entry?.welsh).toBe('carreg');
      expect(result.radical).toBe('carreg');
    });

    it('finds "nhad" via nasal mutation (nh → t = tad)', () => {
      const engine = createEngine();
      const result = engine.lookup('nhad');
      expect(result.entry?.welsh).toBe('tad');
      expect(result.radical).toBe('tad');
    });

    it('finds "phont" via aspirate mutation (ph → p = pont)', () => {
      const engine = createEngine();
      const result = engine.lookup('phont');
      expect(result.entry?.welsh).toBe('pont');
      expect(result.radical).toBe('pont');
    });

    it('finds "ardd" via g-deletion (→ gardd)', () => {
      const engine = createEngine();
      const result = engine.lookup('ardd');
      expect(result.entry?.welsh).toBe('gardd');
      expect(result.radical).toBe('gardd');
    });

    it('finds "law" via soft mutation (l → ll = llaw)', () => {
      const engine = createEngine();
      const result = engine.lookup('law');
      expect(result.entry?.welsh).toBe('llaw');
      expect(result.radical).toBe('llaw');
    });

    it('finds "ryw" via soft mutation (r → rh = rhyw)', () => {
      const engine = createEngine();
      const result = engine.lookup('ryw');
      expect(result.entry?.welsh).toBe('rhyw');
      expect(result.radical).toBe('rhyw');
    });

    it('finds "ddraig" via soft mutation (dd → d = draig)', () => {
      const engine = createEngine();
      const result = engine.lookup('ddraig');
      expect(result.entry?.welsh).toBe('draig');
      expect(result.radical).toBe('draig');
    });

    it('finds "phen" via aspirate mutation (ph → p = pen)', () => {
      const engine = createEngine();
      const result = engine.lookup('phen');
      expect(result.entry?.welsh).toBe('pen');
      expect(result.radical).toBe('pen');
    });
  });

  describe('debug trace', () => {
    it('produces a "hit" trace for direct matches', () => {
      const engine = createEngine();
      const result = engine.lookup('nant');
      expect(result.debugLines.some((l) => l.type === 'hit')).toBe(true);
    });

    it('produces a "mutated" trace for mutation matches', () => {
      const engine = createEngine();
      const result = engine.lookup('fwthyn');
      expect(result.debugLines.some((l) => l.type === 'mutated')).toBe(true);
    });

    it('produces only "miss" traces for no match', () => {
      const engine = createEngine();
      const result = engine.lookup('xyz');
      expect(result.debugLines.every((l) => l.type === 'miss')).toBe(true);
    });
  });

  describe('hasTranslation', () => {
    it('returns true for direct matches', () => {
      const engine = createEngine();
      expect(engine.hasTranslation('nant')).toBe(true);
    });

    it('returns true for mutated matches', () => {
      const engine = createEngine();
      expect(engine.hasTranslation('fwthyn')).toBe(true);
    });

    it('returns false for unknown words', () => {
      const engine = createEngine();
      expect(engine.hasTranslation('xyz')).toBe(false);
    });

    it('returns false for empty string', () => {
      const engine = createEngine();
      expect(engine.hasTranslation('')).toBe(false);
    });

    it('handles punctuation gracefully', () => {
      const engine = createEngine();
      expect(engine.hasTranslation('nant,')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Phrase lookups
// ---------------------------------------------------------------------------

const phraseVocabulary: VocabularyEntry[] = [
  // Single-word entries
  { id: 'v01', welsh: 'taith', english: 'journey', site: 'test-site' },
  { id: 'v02', welsh: 'cerdded', english: 'walked', site: 'test-site' },
  { id: 'v03', welsh: 'nant', english: 'stream / valley', site: 'test-site' },
  // Two-word phrase entries
  { id: 'p01', welsh: 'taith cerdded', english: 'a walk', site: 'test-site' },
  { id: 'p02', welsh: 'rydych chi', english: 'you are', site: 'test-site' },
  // Three-word phrase entry
  { id: 'p03', welsh: 'bore da iawn', english: 'very good morning', site: 'test-site' },
  // Competing phrase: same first word, longer phrase wins
  { id: 'p04', welsh: 'taith cerdded hir', english: 'a long walk', site: 'test-site' },
];

function createPhraseEngine(): LookupEngine {
  return LookupEngine.fromEntries(phraseVocabulary);
}

describe('Phrase lookups', () => {
  describe('lookupPhrase', () => {
    it('matches a two-word phrase with no mutations', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('rydych chi');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry).not.toBeNull();
      expect(result.entry?.english).toBe('you are');
      expect(result.wordCount).toBe(2);
      expect(result.tokenSpan).toBe(3); // word + whitespace + word
      expect(result.radicals).toEqual([null, null]);
    });

    it('matches a two-word phrase with mutations on both words', () => {
      const engine = createPhraseEngine();
      // daith = soft mutation of taith (t → d)
      // gerdded = soft mutation of cerdded (c → g)
      const tokens = tokenise('daith gerdded');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry).not.toBeNull();
      expect(result.entry?.english).toBe('a walk');
      expect(result.wordCount).toBe(2);
      expect(result.radicals).toEqual(['taith', 'cerdded']);
    });

    it('matches a phrase with mutation on the first word only', () => {
      const engine = createPhraseEngine();
      // daith = soft mutation of taith; cerdded is not mutated
      const tokens = tokenise('daith cerdded');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry?.english).toBe('a walk');
      expect(result.radicals).toEqual(['taith', null]);
    });

    it('matches a phrase with trailing punctuation on the final word', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('rydych chi,');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry?.english).toBe('you are');
      expect(result.wordCount).toBe(2);
    });

    it('returns no match when no phrase exists', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('nant nant');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry).toBeNull();
      expect(result.wordCount).toBe(0);
      expect(result.tokenSpan).toBe(0);
    });

    it('matches a three-word phrase', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('bore da iawn');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry?.english).toBe('very good morning');
      expect(result.wordCount).toBe(3);
      expect(result.tokenSpan).toBe(5); // 3 words + 2 whitespace
    });

    it('prefers longest matching phrase (greedy)', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('taith cerdded hir');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry?.english).toBe('a long walk');
      expect(result.wordCount).toBe(3);
    });

    it('falls back to shorter phrase when longer does not match', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('taith cerdded byr');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry?.english).toBe('a walk');
      expect(result.wordCount).toBe(2);
    });

    it('matches a phrase starting at a non-zero index', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('y daith gerdded');
      // tokens: [y, ws, daith, ws, gerdded] — phrase starts at index 2
      const result = engine.lookupPhrase(tokens, 2);
      expect(result.entry?.english).toBe('a walk');
    });

    it('returns no match when engine is disabled', () => {
      const engine = createPhraseEngine();
      engine.enabled = false;
      const tokens = tokenise('rydych chi');
      const result = engine.lookupPhrase(tokens, 0);
      expect(result.entry).toBeNull();
    });
  });

  describe('hasPhrase', () => {
    it('returns match and tokenSpan for a known phrase', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('rydych chi');
      const result = engine.hasPhrase(tokens, 0);
      expect(result.match).toBe(true);
      expect(result.tokenSpan).toBe(3);
    });

    it('returns no match for unknown phrases', () => {
      const engine = createPhraseEngine();
      const tokens = tokenise('nant nant');
      const result = engine.hasPhrase(tokens, 0);
      expect(result.match).toBe(false);
      expect(result.tokenSpan).toBe(0);
    });

    it('returns no match when engine is disabled', () => {
      const engine = createPhraseEngine();
      engine.enabled = false;
      const tokens = tokenise('rydych chi');
      const result = engine.hasPhrase(tokens, 0);
      expect(result.match).toBe(false);
    });
  });

  describe('phrase and single-word isolation', () => {
    it('single-word lookup does not return phrase entries', () => {
      const engine = createPhraseEngine();
      // "taith" exists as both a single-word entry and the start of a phrase.
      // lookup() should return the single-word entry, not the phrase.
      const result = engine.lookup('taith');
      expect(result.entry?.english).toBe('journey');
    });

    it('phrase entries do not appear in single-word hasTranslation', () => {
      const engine = createPhraseEngine();
      // "rydych" only exists as part of the phrase "rydych chi",
      // not as a standalone entry.
      expect(engine.hasTranslation('rydych')).toBe(false);
    });
  });
});
