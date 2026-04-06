import type { Token } from './types.js';

/**
 * Pattern to extract a word from a token that may include surrounding punctuation.
 *
 * Group 1: leading non-letter characters (quotes, brackets, etc.)
 * Group 2: the word itself (Welsh letters, apostrophes, hyphens, middle dots)
 * Group 3: trailing non-letter characters (commas, full stops, etc.)
 */
const WORD_PATTERN = /^([^a-zA-ZÀ-ÿŵŷỳ]*)([a-zA-ZÀ-ÿŵŷỳ'·-]+)([^a-zA-ZÀ-ÿŵŷỳ]*)$/;

/**
 * Tokenise Welsh prose into a sequence of structured tokens.
 *
 * Splits text on whitespace boundaries (preserving whitespace as tokens),
 * then classifies each non-whitespace segment as either a word token
 * (with extracted word and surrounding punctuation) or a pure punctuation token.
 *
 * @param text - The Welsh prose text to tokenise.
 * @returns An array of tokens preserving the original text exactly when concatenated.
 */
export function tokenise(text: string): Token[] {
  const segments = text.split(/(\s+)/);
  const tokens: Token[] = [];

  for (const segment of segments) {
    if (segment === '') continue;

    if (/^\s+$/.test(segment)) {
      tokens.push({ type: 'whitespace', raw: segment });
      continue;
    }

    const match = segment.match(WORD_PATTERN);
    if (!match) {
      tokens.push({ type: 'punctuation', raw: segment });
      continue;
    }

    const [, pre, word, post] = match;
    tokens.push({
      type: 'word',
      raw: segment,
      word,
      pre,
      post,
    });
  }

  return tokens;
}
