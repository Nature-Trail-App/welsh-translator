import { describe, it, expect } from 'vitest';
import { LookupEngine } from '../src/core/lookup-engine.js';
import { StaticVocabularyProvider } from '../src/core/adapters/static.js';
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
