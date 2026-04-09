<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult } from '../core/types.js';
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

  function makeTranslatable(container: HTMLElement, _html: string) {
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
