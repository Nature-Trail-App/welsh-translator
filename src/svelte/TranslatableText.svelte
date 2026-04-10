<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult, Token, WordToken } from '../core/types.js';
  import { tokenise } from '../core/tokeniser.js';
  import { LookupEngine } from '../core/lookup-engine.js';
  import TranslatableWord from './TranslatableWord.svelte';
  import './welsh-translator.css';

  interface Props {
    /** The Welsh prose text to render with translatable words. */
    text: string;
    /** A loaded LookupEngine instance for vocabulary lookups. */
    engine: LookupEngine;
    /**
     * Whether translation is enabled. Defaults to `engine.enabled`.
     * When false, renders the text as-is with no tokenisation or popover overhead.
     */
    enabled?: boolean;
    /** Optional CSS class for the container. */
    class?: string;
  }

  let { text, engine, enabled: enabledProp = undefined, class: className = '' }: Props = $props();
  let isEnabled = $derived(enabledProp ?? engine.enabled);

  // Close any open popover when translation is disabled
  $effect(() => {
    if (!isEnabled) closePopover();
  });

  type ProcessedItem =
    | { kind: 'phrase'; tokens: Token[]; startIndex: number; tokenSpan: number; pre: string; post: string }
    | { kind: 'word'; token: WordToken; tokenIndex: number; hasTranslation: boolean }
    | { kind: 'raw'; raw: string };

  // Tokenise the text, detect phrases, and pre-compute which words have translations
  let rawTokens: Token[] = $derived(tokenise(text));

  let processedItems: ProcessedItem[] = $derived.by(() => {
    const tokens = rawTokens;
    const items: ProcessedItem[] = [];
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token.type === 'word') {
        const phrase = engine.hasPhrase(tokens, i);
        if (phrase.match) {
          const phraseTokens = tokens.slice(i, i + phrase.tokenSpan);
          const firstWord = phraseTokens[0] as WordToken;
          const lastWord = [...phraseTokens].reverse().find((t): t is WordToken => t.type === 'word')!;
          items.push({
            kind: 'phrase',
            tokens: phraseTokens,
            startIndex: i,
            tokenSpan: phrase.tokenSpan,
            pre: firstWord.pre,
            post: lastWord.post,
          });
          i += phrase.tokenSpan;
          continue;
        }
        items.push({ kind: 'word', token, tokenIndex: i, hasTranslation: engine.hasTranslation(token.word) });
      } else {
        items.push({ kind: 'raw', raw: token.raw });
      }
      i++;
    }
    return items;
  });

  // Shared popover state
  let popoverOpen = $state(false);
  let activeWord = $state<string | null>(null);
  let lookupResult = $state<LookupResult | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let activeItemIndex = $state<number | null>(null);

  function handleWordClick(_event: MouseEvent, buttonEl: HTMLButtonElement, itemIndex: number) {
    const word = buttonEl.textContent ?? '';

    // Toggle off if tapping the same word
    if (popoverOpen && anchorEl === buttonEl) {
      closePopover();
      return;
    }

    const result = engine.lookup(word);
    if (!result.entry) return;

    activeWord = word;
    lookupResult = result;
    anchorEl = buttonEl;
    activeItemIndex = itemIndex;
    popoverOpen = true;
  }

  function handlePhraseClick(event: MouseEvent, itemIndex: number) {
    const btn = event.currentTarget as HTMLButtonElement;

    // Toggle off if tapping the same phrase
    if (popoverOpen && anchorEl === btn) {
      closePopover();
      return;
    }

    const item = processedItems[itemIndex];
    if (item.kind !== 'phrase') return;

    const phraseResult = engine.lookupPhrase(rawTokens, item.startIndex);
    if (!phraseResult.entry) return;

    // Build a display word from the phrase tokens (words joined by spaces)
    const phraseText = item.tokens
      .filter((t): t is WordToken => t.type === 'word')
      .map((t) => t.word)
      .join(' ');

    activeWord = phraseText;
    lookupResult = {
      entry: phraseResult.entry,
      radical: phraseResult.radicals?.some((r) => r !== null) ? phraseResult.entry.welsh : null,
      debugLines: phraseResult.debugLines,
    };
    anchorEl = btn;
    activeItemIndex = itemIndex;
    popoverOpen = true;
  }

  function closePopover() {
    popoverOpen = false;
    activeWord = null;
    lookupResult = null;
    anchorEl = null;
    activeItemIndex = null;
  }

  /** Extract the display text for words inside a phrase button (no leading/trailing punctuation). */
  function phraseInnerText(tokens: Token[]): string {
    return tokens.map((t) => {
      if (t.type === 'word') return t.word;
      return t.raw;
    }).join('');
  }
</script>

{#if isEnabled}
  <span class="translatable-text {className}" lang="cy">
    {#each processedItems as item, i (i)}
      {#if item.kind === 'phrase'}
        {#if item.pre}{item.pre}{/if}
        <button
          type="button"
          class="translatable-word"
          class:translatable-word--active={popoverOpen && activeItemIndex === i}
          aria-label="Translate: {phraseInnerText(item.tokens)}"
          aria-expanded={popoverOpen && activeItemIndex === i}
          onclick={(event) => handlePhraseClick(event, i)}
        >
          {phraseInnerText(item.tokens)}
        </button>
        {#if item.post}{item.post}{/if}
      {:else if item.kind === 'word'}
        {#if item.token.pre}{item.token.pre}{/if}
        <TranslatableWord
          word={item.token.word}
          hasTranslation={item.hasTranslation}
          active={popoverOpen && activeItemIndex === i}
          onclick={(event, el) => handleWordClick(event, el, i)}
        />
        {#if item.token.post}{item.token.post}{/if}
      {:else}
        {item.raw}
      {/if}
    {/each}
  </span>

  <!-- Single shared popover, anchored to whichever word was tapped -->
  <Popover.Root bind:open={popoverOpen} onOpenChange={(o) => { if (!o) closePopover(); }}>
    {#if anchorEl}
      <Popover.Content
        class="translation-popover"
        side="top"
        sideOffset={8}
        avoidCollisions={true}
        trapFocus={false}
        preventScroll={false}
        customAnchor={anchorEl}
        onEscapeKeydown={() => closePopover()}
        onInteractOutside={() => closePopover()}
      >
        {#if lookupResult?.entry}
          <div role="status" aria-live="polite">
            <p class="translation-popover__welsh" lang="cy">
              {activeWord}
            </p>

            {#if lookupResult.radical}
              <p class="translation-popover__radical" lang="cy">
                radical: {lookupResult.radical}
              </p>
            {/if}

            <p class="translation-popover__english" lang="en">
              {lookupResult.entry.english}
            </p>

            {#if lookupResult.entry.note}
              <p class="translation-popover__note">
                {lookupResult.entry.note}
              </p>
            {/if}
          </div>
        {/if}

        <Popover.Arrow class="translation-popover__arrow" />
      </Popover.Content>
    {/if}
  </Popover.Root>
{:else}
  <span class="translatable-text {className}" lang="cy">{text}</span>
{/if}

<style>
  .translatable-text {
    display: inline;
    line-height: var(--wt-line-height, 1.8);
  }
</style>
