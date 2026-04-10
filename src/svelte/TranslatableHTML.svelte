<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult, WordToken } from '../core/types.js';
  import { tokenise } from '../core/tokeniser.js';
  import { LookupEngine } from '../core/lookup-engine.js';
  import './welsh-translator.css';

  interface Props {
    /** The HTML string to render with translatable Welsh words. */
    html: string;
    /** A loaded LookupEngine instance for vocabulary lookups. */
    engine: LookupEngine;
    /**
     * Whether translation is enabled. Defaults to `engine.enabled`.
     * When false, renders the HTML as-is with no DOM walking or popover overhead.
     */
    enabled?: boolean;
    /** Optional CSS class for the container. */
    class?: string;
  }

  let { html, engine, enabled: enabledProp = undefined, class: className = '' }: Props = $props();
  let isEnabled = $derived(enabledProp ?? engine.enabled);

  // Close any open popover when translation is disabled
  $effect(() => {
    if (!isEnabled) closePopover();
  });

  // Shared popover state
  let popoverOpen = $state(false);
  let activeWord = $state<string | null>(null);
  let lookupResult = $state<LookupResult | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE']);

  function handleWordClick(event: MouseEvent) {
    const btn = event.currentTarget as HTMLButtonElement;
    const word = btn.textContent ?? '';

    // Toggle off if tapping the same word
    if (popoverOpen && anchorEl === btn) {
      closePopover();
      return;
    }

    // Check if this is a phrase button
    const phraseKey = btn.dataset.phraseKey;
    const phraseData = phraseKey ? phraseRegistry.get(phraseKey) : null;

    let result: LookupResult;
    if (phraseData) {
      const phraseResult = engine.lookupPhrase(phraseData.tokens, phraseData.startIndex);
      if (!phraseResult.entry) return;
      result = {
        entry: phraseResult.entry,
        radical: phraseResult.radicals?.some((r) => r !== null) ? phraseResult.entry.welsh : null,
        debugLines: phraseResult.debugLines,
      };
    } else {
      result = engine.lookup(word);
      if (!result.entry) return;
    }

    // Remove active class from previous anchor
    anchorEl?.classList.remove('translatable-word--active');

    activeWord = word;
    lookupResult = result;
    anchorEl = btn;
    popoverOpen = true;

    btn.classList.add('translatable-word--active');
  }

  // Registry for phrase data, keyed by a unique ID per phrase button
  let phraseRegistry = new Map<string, { tokens: ReturnType<typeof tokenise>; startIndex: number }>();
  let phraseIdCounter = 0;

  function closePopover() {
    anchorEl?.classList.remove('translatable-word--active');
    popoverOpen = false;
    activeWord = null;
    lookupResult = null;
    anchorEl = null;
  }

  function isInSkippedElement(node: Node): boolean {
    let current = node.parentElement;
    while (current) {
      if (SKIP_TAGS.has(current.tagName)) return true;
      current = current.parentElement;
    }
    return false;
  }

  function makeTranslatable(container: HTMLElement, _html: string) {
    function process() {
      phraseRegistry.clear();
      phraseIdCounter = 0;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (!isInSkippedElement(node)) {
          textNodes.push(node);
        }
      }

      for (const textNode of textNodes) {
        const content = textNode.textContent ?? '';
        if (!content.trim()) continue;

        const tokens = tokenise(content);

        // Quick check: skip text nodes with no translatable single words.
        // Phrase detection happens in the main loop below — this is just
        // a fast path to avoid DOM replacement for purely non-translatable nodes.
        // A node that only contains phrase words (no single-word matches) will
        // still be processed by the main loop's hasPhrase check.
        const hasAnySingleWord = tokens.some(
          (t) => t.type === 'word' && engine.hasTranslation(t.word),
        );
        const hasAnyPhrase = !hasAnySingleWord && tokens.some(
          (t, idx) => t.type === 'word' && engine.hasPhrase(tokens, idx).match,
        );
        if (!hasAnySingleWord && !hasAnyPhrase) continue;

        const fragment = document.createDocumentFragment();

        let i = 0;
        while (i < tokens.length) {
          const token = tokens[i];

          if (token.type === 'word') {
            // Check for phrase match first
            const phrase = engine.hasPhrase(tokens, i);
            if (phrase.match) {
              const phraseTokens = tokens.slice(i, i + phrase.tokenSpan);
              const firstWord = phraseTokens[0] as WordToken;
              const lastWord = [...phraseTokens].reverse().find((t): t is WordToken => t.type === 'word')!;

              if (firstWord.pre) {
                fragment.appendChild(document.createTextNode(firstWord.pre));
              }

              const btn = document.createElement('button');
              btn.className = 'translatable-word';
              btn.type = 'button';
              // Inner text: words and whitespace, no leading/trailing punctuation
              btn.textContent = phraseTokens.map((t) => {
                if (t.type === 'word') return t.word;
                return t.raw;
              }).join('');
              btn.setAttribute('aria-label', `Translate: ${btn.textContent}`);

              // Register phrase data for the click handler
              const phraseKey = `phrase-${phraseIdCounter++}`;
              btn.dataset.phraseKey = phraseKey;
              phraseRegistry.set(phraseKey, { tokens, startIndex: i });

              btn.addEventListener('click', handleWordClick);
              fragment.appendChild(btn);

              if (lastWord.post) {
                fragment.appendChild(document.createTextNode(lastWord.post));
              }

              i += phrase.tokenSpan;
              continue;
            }

            // Single word handling (unchanged)
            const hasTranslation = engine.hasTranslation(token.word);

            if (token.pre) {
              fragment.appendChild(document.createTextNode(token.pre));
            }

            if (hasTranslation) {
              const btn = document.createElement('button');
              btn.className = 'translatable-word';
              btn.type = 'button';
              btn.textContent = token.word;
              btn.setAttribute('aria-label', `Translate: ${token.word}`);
              btn.addEventListener('click', handleWordClick);
              fragment.appendChild(btn);
            } else {
              const span = document.createElement('span');
              span.className = 'word';
              span.textContent = token.word;
              fragment.appendChild(span);
            }

            if (token.post) {
              fragment.appendChild(document.createTextNode(token.post));
            }
          } else {
            fragment.appendChild(document.createTextNode(token.raw));
          }

          i++;
        }

        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    }

    process();

    return {
      update() {
        // {@html} has already replaced the DOM content, just reprocess
        closePopover();
        process();
      },
      destroy() {
        closePopover();
      },
    };
  }
</script>

{#if isEnabled}
  <span
    class="translatable-html {className}"
    lang="cy"
    use:makeTranslatable={html}
  >
    {@html html}
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
  <span class="translatable-html {className}" lang="cy">{@html html}</span>
{/if}

<style>
  .translatable-html {
    display: inline;
    line-height: var(--wt-line-height, 1.8);
  }
</style>
