<script lang="ts">
  interface Props {
    /** The word as it appears in the text. */
    word: string;
    /** Whether this word has a translation in the vocabulary. */
    hasTranslation: boolean;
    /** Whether this word is currently active (popover open). */
    active?: boolean;
    /** Called when the user taps/clicks the word. Receives the button element. */
    onclick?: (event: MouseEvent, el: HTMLButtonElement) => void;
  }

  let { word, hasTranslation, active = false, onclick }: Props = $props();

  let buttonEl: HTMLButtonElement | undefined = $state();

  function handleClick(event: MouseEvent) {
    if (buttonEl && onclick) {
      onclick(event, buttonEl);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      buttonEl?.click();
    }
  }
</script>

{#if hasTranslation}
  <button
    bind:this={buttonEl}
    type="button"
    class="translatable-word"
    class:translatable-word--active={active}
    aria-label="Translate: {word}"
    aria-expanded={active}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    {word}
  </button>
{:else}
  <span class="word">{word}</span>
{/if}

<style>
  .translatable-word {
    all: unset;
    cursor: pointer;
    border-bottom: 1px solid var(--wt-word-border-color, rgba(201, 168, 76, 0.45));
    transition: var(--wt-word-transition, border-color 0.15s, background-color 0.15s);
    border-radius: var(--wt-word-border-radius, 2px);
    padding: var(--wt-word-padding, 0 1px);
    line-height: inherit;
    font: inherit;
    color: inherit;
  }

  .translatable-word:hover,
  .translatable-word:focus-visible {
    background: var(--wt-word-hover-bg, rgba(201, 168, 76, 0.12));
    border-bottom-color: var(--wt-word-hover-border-color, rgba(201, 168, 76, 1));
    outline: var(--wt-word-focus-outline, 2px solid rgba(201, 168, 76, 0.4));
    outline-offset: 1px;
  }

  .translatable-word--active {
    background: var(--wt-word-active-bg, rgba(201, 168, 76, 0.18));
    border-bottom-color: var(--wt-word-active-border-color, rgba(201, 168, 76, 1));
  }

  .word {
    padding: var(--wt-word-padding, 0 1px);
  }
</style>
