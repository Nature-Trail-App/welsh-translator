<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult } from '../core/types.js';
  import { tokenise } from '../core/tokeniser.js';
  import { LookupEngine } from '../core/lookup-engine.js';
  import TranslatableWord from './TranslatableWord.svelte';

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

  // Tokenise the text and pre-compute which words have translations
  let processedTokens = $derived.by(() => {
    const tokens = tokenise(text);
    return tokens.map((token) => {
      if (token.type === 'word') {
        return {
          ...token,
          hasTranslation: engine.hasTranslation(token.word),
        };
      }
      return { ...token, hasTranslation: false };
    });
  });

  // Shared popover state
  let popoverOpen = $state(false);
  let activeWord = $state<string | null>(null);
  let lookupResult = $state<LookupResult | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let activeTokenIndex = $state<number | null>(null);

  function handleWordClick(_event: MouseEvent, buttonEl: HTMLButtonElement, tokenIndex: number) {
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
    activeTokenIndex = tokenIndex;
    popoverOpen = true;
  }

  function closePopover() {
    popoverOpen = false;
    activeWord = null;
    lookupResult = null;
    anchorEl = null;
    activeTokenIndex = null;
  }
</script>

{#if isEnabled}
  <span class="translatable-text {className}" lang="cy">
    {#each processedTokens as token, i (i)}
      {#if token.type === 'word'}
        {#if token.pre}{token.pre}{/if}
        <TranslatableWord
          word={token.word}
          hasTranslation={token.hasTranslation}
          active={popoverOpen && activeWord === token.word && activeTokenIndex === i}
          onclick={(event, el) => handleWordClick(event, el, i)}
        />
        {#if token.post}{token.post}{/if}
      {:else}
        {token.raw}
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
    line-height: 1.8;
  }

  :global(.translation-popover) {
    background: #2c2f3a;
    border: 1px solid rgba(201, 168, 76, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    min-width: 160px;
    max-width: 280px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }

  :global(.translation-popover__arrow) {
    fill: #2c2f3a;
    stroke: rgba(201, 168, 76, 0.3);
    stroke-width: 1px;
  }

  :global(.translation-popover__welsh) {
    font-weight: 700;
    font-size: 1.1rem;
    color: #e8d4a0;
    margin: 0 0 0.25rem;
  }

  :global(.translation-popover__radical) {
    font-size: 0.75rem;
    color: #8a9bb0;
    font-style: italic;
    margin: 0 0 0.5rem;
  }

  :global(.translation-popover__english) {
    font-size: 1rem;
    color: #e8e0d0;
    margin: 0;
  }

  :global(.translation-popover__note) {
    font-size: 0.8rem;
    color: #8a9bb0;
    font-style: italic;
    margin: 0.4rem 0 0;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(138, 155, 176, 0.2);
  }
</style>
