<script lang="ts">
  import './welsh-translator.css';

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

