import { describe, it, expect } from 'vitest';
import { tokenise } from '../src/core/tokeniser.js';

describe('tokenise', () => {
  it('tokenises plain words separated by spaces', () => {
    const tokens = tokenise('mae bwthyn bach');
    const words = tokens.filter((t) => t.type === 'word');
    expect(words).toHaveLength(3);
    expect(words.map((w) => w.word)).toEqual(['mae', 'bwthyn', 'bach']);
  });

  it('preserves whitespace as tokens', () => {
    const tokens = tokenise('mae  bwthyn');
    const ws = tokens.filter((t) => t.type === 'whitespace');
    expect(ws).toHaveLength(1);
    expect(ws[0].raw).toBe('  ');
  });

  it('extracts leading punctuation', () => {
    const tokens = tokenise('"Mae');
    const word = tokens.find((t) => t.type === 'word');
    expect(word).toBeDefined();
    if (word?.type === 'word') {
      expect(word.pre).toBe('"');
      expect(word.word).toBe('Mae');
      expect(word.post).toBe('');
    }
  });

  it('extracts trailing punctuation', () => {
    const tokens = tokenise('bach,');
    const word = tokens.find((t) => t.type === 'word');
    expect(word).toBeDefined();
    if (word?.type === 'word') {
      expect(word.pre).toBe('');
      expect(word.word).toBe('bach');
      expect(word.post).toBe(',');
    }
  });

  it('extracts both leading and trailing punctuation', () => {
    const tokens = tokenise('(bwthyn)');
    const word = tokens.find((t) => t.type === 'word');
    if (word?.type === 'word') {
      expect(word.pre).toBe('(');
      expect(word.word).toBe('bwthyn');
      expect(word.post).toBe(')');
    }
  });

  it('handles Welsh-specific characters', () => {
    const tokens = tokenise('ŵyn ŷd ỳn');
    const words = tokens.filter((t) => t.type === 'word');
    expect(words.map((w) => w.word)).toEqual(['ŵyn', 'ŷd', 'ỳn']);
  });

  it('keeps apostrophes within words', () => {
    const tokens = tokenise("dyw'r");
    const words = tokens.filter((t) => t.type === 'word');
    expect(words).toHaveLength(1);
    expect(words[0].word).toBe("dyw'r");
  });

  it('handles hyphens within words', () => {
    const tokens = tokenise('nant-gwrtheyrn');
    const words = tokens.filter((t) => t.type === 'word');
    expect(words).toHaveLength(1);
    expect(words[0].word).toBe('nant-gwrtheyrn');
  });

  it('reconstructs original text from token raws', () => {
    const original = 'Ar lan y môr, mae bwthyn bach — hen a thawel.';
    const tokens = tokenise(original);
    const reconstructed = tokens.map((t) => t.raw).join('');
    expect(reconstructed).toBe(original);
  });

  it('classifies pure punctuation tokens', () => {
    const tokens = tokenise('— hello');
    expect(tokens[0].type).toBe('punctuation');
    expect(tokens[0].raw).toBe('—');
  });

  it('handles empty input', () => {
    const tokens = tokenise('');
    expect(tokens).toHaveLength(0);
  });

  it('handles whitespace-only input', () => {
    const tokens = tokenise('   ');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe('whitespace');
  });
});
