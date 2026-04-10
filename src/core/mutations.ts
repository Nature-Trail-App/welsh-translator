import type { CandidateResult, MutationLogEntry } from './types.js';

/**
 * Welsh character class for cleaning input.
 * Matches standard Latin plus Welsh-specific characters: ŵ, ŷ, ỳ, middle dot,
 * and common accented vowels found in literary Welsh.
 */
const WELSH_LETTER = /[^a-zàáâãäåæçèéêëìíîïðñòóôõöùúûüýÿŵŷỳ·]/gi;

/**
 * Welsh vowel pattern for detecting soft mutation g-deletion.
 * When soft mutation removes an initial `g` before a vowel, the word appears
 * to start with that vowel. We try prepending `g` to recover the radical.
 * In Welsh, `w` and `y` also function as vowels (e.g. gwahanol → wahanol).
 */
const WELSH_VOWEL_START = /^[aeiouwyàáâèéêìíîòóôùúûŵŷ]/i;

/**
 * Generate candidate radical (dictionary) forms for a potentially mutated Welsh word.
 *
 * Welsh has three systems of initial consonant mutation:
 * - **Soft mutation** (treiglad meddal) — the most common
 * - **Nasal mutation** (treiglad trwynol)
 * - **Aspirate mutation** (treiglad llaes)
 *
 * A word in running text may have its initial consonant(s) changed by one of these
 * systems. This function reverses all plausible mutations to produce a list of
 * candidate radical forms, which can then be checked against a vocabulary index.
 *
 * The first candidate is always the cleaned word as-is (for direct matches).
 * Subsequent candidates are ordered by mutation distinctiveness: aspirate first
 * (most unambiguous), then nasal, then soft.
 *
 * @param word - A single Welsh word, possibly mutated. May contain punctuation.
 * @returns An object with deduplicated candidate radicals and a log of reversals tried.
 */
export function getCandidates(word: string): CandidateResult {
  const w = word.toLowerCase().replace(WELSH_LETTER, '');
  const candidates: string[] = [w];
  const mutationLog: MutationLogEntry[] = [];

  // ── Aspirate mutation reversals (most distinctive — check first)
  // ch → c,  ph → p,  th → t
  if (w.startsWith('ch')) {
    candidates.push('c' + w.slice(2));
    mutationLog.push({ type: 'aspirate', from: 'ch', to: 'c' });
  }
  if (w.startsWith('ph')) {
    candidates.push('p' + w.slice(2));
    mutationLog.push({ type: 'aspirate', from: 'ph', to: 'p' });
  }
  if (w.startsWith('th')) {
    candidates.push('t' + w.slice(2));
    mutationLog.push({ type: 'aspirate', from: 'th', to: 't' });
  }

  // ── Nasal mutation reversals
  // ngh → c,  nh → t,  mh → p,  ng → g
  if (w.startsWith('ngh')) {
    candidates.push('c' + w.slice(3));
    mutationLog.push({ type: 'nasal', from: 'ngh', to: 'c' });
  } else if (w.startsWith('nh')) {
    candidates.push('t' + w.slice(2));
    mutationLog.push({ type: 'nasal', from: 'nh', to: 't' });
  } else if (w.startsWith('mh')) {
    candidates.push('p' + w.slice(2));
    mutationLog.push({ type: 'nasal', from: 'mh', to: 'p' });
  } else if (w.startsWith('ng')) {
    candidates.push('g' + w.slice(2));
    mutationLog.push({ type: 'nasal', from: 'ng', to: 'g' });
  }

  // ── Soft mutation reversals
  // b → p,  d → t,  g → c,  f → b or m,  dd → d,  l → ll,  r → rh
  // Guard: don't re-interpret digraphs (dd, th, ch, ph) as soft mutations
  if (w.startsWith('dd')) {
    candidates.push('d' + w.slice(2));
    mutationLog.push({ type: 'soft', from: 'dd', to: 'd' });
  }

  const isDigraphStart =
    w.startsWith('dd') || w.startsWith('th') || w.startsWith('ch') || w.startsWith('ph');

  if (!isDigraphStart) {
    if (w.startsWith('b')) {
      candidates.push('p' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'b', to: 'p' });
    }
    if (w.startsWith('d')) {
      candidates.push('t' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'd', to: 't' });
    }
    if (w.startsWith('g') && w.length > 2) {
      candidates.push('c' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'g', to: 'c' });
    }
    if (w.startsWith('f')) {
      candidates.push('b' + w.slice(1));
      candidates.push('m' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'f', to: 'b or m' });
    }
    if (w.startsWith('l') && !w.startsWith('ll')) {
      candidates.push('ll' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'l', to: 'll' });
    }
    if (w.startsWith('r') && !w.startsWith('rh')) {
      candidates.push('rh' + w.slice(1));
      mutationLog.push({ type: 'soft', from: 'r', to: 'rh' });
    }
  }

  // ── Soft mutation: g-deletion
  // If a word starts with a vowel, the radical might have had an initial `g`
  // that was deleted by soft mutation (e.g. "ardd" → "gardd").
  if (WELSH_VOWEL_START.test(w)) {
    candidates.push('g' + w);
    mutationLog.push({ type: 'soft-g-deletion', from: '(vowel)', to: 'g' + w });
  }

  // Deduplicate while preserving priority order
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });

  return { candidates: unique, mutationLog };
}
