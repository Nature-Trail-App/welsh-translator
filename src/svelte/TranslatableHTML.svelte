<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult } from '../core/types.js';
  import { tokenise } from '../core/tokeniser.js';
  import { LookupEngine } from '../core/lookup-engine.js';

  interface Props {
    /** The HTML string to render with translatable Welsh words. */
    html: string;
    /** A loaded LookupEngine instance for vocabulary lookups. */
    engine: LookupEngine;
    /** Optional CSS class for the container. */
    class?: string;
  }

  let { html, engine, class: className = '' }: Props = $props();

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

    const result = engine.lookup(word);
    if (!result.entry) return;

    // Remove active class from previous anchor
    anchorEl?.classList.remove('translatable-word--active');

    activeWord = word;
    lookupResult = result;
    anchorEl = btn;
    popoverOpen = true;

    btn.classList.add('translatable-word--active');
  }

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

  function makeTranslatable(container: HTMLElement) {
    function process() {
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
        const hasAnyTranslatable = tokens.some(
          (t) => t.type === 'word' && engine.hasTranslation(t.word),
        );
        if (!hasAnyTranslatable) continue;

        const fragment = document.createDocumentFragment();

        for (const token of tokens) {
          if (token.type === 'word') {
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

<style>
  .translatable-html {
    display: inline;
    line-height: 1.8;
  }

  /* Button styles must be :global() because buttons are created imperatively */
  :global(.translatable-html .translatable-word) {
    all: unset;
    cursor: pointer;
    border-bottom: 1px solid rgba(201, 168, 76, 0.45);
    transition: border-color 0.15s, background-color 0.15s;
    border-radius: 2px;
    padding: 0 1px;
    line-height: inherit;
    font: inherit;
    color: inherit;
  }

  :global(.translatable-html .translatable-word:hover),
  :global(.translatable-html .translatable-word:focus-visible) {
    background: rgba(201, 168, 76, 0.12);
    border-bottom-color: rgba(201, 168, 76, 1);
    outline: 2px solid rgba(201, 168, 76, 0.4);
    outline-offset: 1px;
  }

  :global(.translatable-html .translatable-word--active) {
    background: rgba(201, 168, 76, 0.18);
    border-bottom-color: rgba(201, 168, 76, 1);
  }

  :global(.translatable-html .word) {
    padding: 0 1px;
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
