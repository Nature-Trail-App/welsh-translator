# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # Build library with svelte-package (src → dist)
npm test               # Run all tests (vitest)
npm run test:watch     # Run tests in watch mode
npm run check          # Type-check with svelte-check
npm run demo           # Serve the demo gallery at localhost:5173
```

Run a single test file: `npx vitest run tests/mutations.test.ts`

## Architecture

This is a Welsh word translation library with two export paths:

- **`@naturetrail/welsh-translator/core`** — framework-agnostic TypeScript (works in any JS environment)
- **`@naturetrail/welsh-translator/svelte`** — optional Svelte 5 components (requires `bits-ui` peer dependency)

### Core (`src/core/`)

The lookup pipeline: **tokenise → getCandidates → LookupEngine.lookup**

- **LookupEngine** — two in-memory indexes: a `Map<lowercase-welsh, VocabularyEntry>` for O(1) single-word lookups, and a `phraseIndex` (keyed by first word) for multi-word phrase lookups. `lookup(word)` handles single words; `lookupPhrase(tokens, startIndex)` walks forward through tokens to match multi-word vocabulary entries. `hasTranslation(word)` and `hasPhrase(tokens, startIndex)` are lightweight boolean checks. All lookups are synchronous after initial load.
- **mutations (`getCandidates`)** — reverses Welsh initial consonant mutations (soft, nasal, aspirate, soft-g-deletion) to recover the radical (dictionary) form. Returns candidates in priority order: as-is → aspirate → nasal → soft. For phrases, mutation reversal is applied independently per word.
- **tokeniser** — splits Welsh prose on whitespace boundaries into `Token[]` (word/whitespace/punctuation). Word tokens extract `pre` punctuation, the `word` itself, and `post` punctuation. Concatenating all `token.raw` values reproduces the original text exactly.
- **adapters** — `VocabularyProvider` interface for async vocabulary loading. `StaticVocabularyProvider` is the reference implementation.

`VocabularyEntry.welsh` can contain space-separated radicals for multi-word phrases (e.g. `"taith cerdded"`). These are automatically routed to the phrase index during engine construction.

### Svelte Components (`src/svelte/`)

- **TranslatableText** — takes a plain text string, tokenises it, renders each word as a `TranslatableWord`. Manages a single shared popover (bits-ui) anchored to the clicked word via `customAnchor`.
- **TranslatableHTML** — takes an HTML string, renders with `{@html}`, then a `use:action` walks the DOM with `TreeWalker` to replace text nodes with interactive buttons. Skips `<script>`, `<style>`, `<code>`, `<pre>`, `<noscript>`.
- **TranslatableWord** — atomic button/span for a single word. Translatable words render as `<button>` with underline styling.
- **TranslationPopover** — standalone popover component (not currently used by TranslatableText/HTML which inline the popover).

### Build

`svelte-package` (from `@sveltejs/package`) compiles `src/` to `dist/`, generating `.d.ts` for both `.ts` and `.svelte` files. The `package.json` exports map maps `./core` and `./svelte` to their respective `dist/` subdirectories.

### Release

`npm version minor && git push && git push --tags` — the GitHub Actions publish workflow triggers on new tags pushed to `main`.

## Testing

Tests are in `tests/` using Vitest with globals enabled (no need to import `describe`/`it`/`expect`). Four test files cover mutations, tokeniser, lookup-engine, and demo data (80 tests total). There are no component tests currently.
