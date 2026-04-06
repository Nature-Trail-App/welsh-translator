<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult } from '../core/types.js';

  interface Props {
    /** Whether the popover is open. */
    open: boolean;
    /** The lookup result to display. */
    result: LookupResult | null;
    /** The original word as it appears in the text. */
    displayWord?: string;
    /** Callback when the popover requests to close. */
    onclose?: () => void;
  }

  let { open = $bindable(), result, displayWord = '', onclose }: Props = $props();

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && onclose) {
      onclose();
    }
    open = isOpen;
  }
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
  <!--
    We don't render Popover.Trigger here — the anchor is set via
    the TranslatableText parent using a virtual anchor element.
    BitsUI Popover supports customAnchor for this pattern.
  -->
  <Popover.Content
    class="translation-popover"
    side="top"
    sideOffset={8}
    avoidCollisions={true}
    onEscapeKeydown={() => handleOpenChange(false)}
    onInteractOutside={() => handleOpenChange(false)}
  >
    {#if result?.entry}
      <div class="translation-popover__content" role="status" aria-live="polite">
        <p class="translation-popover__welsh" lang="cy">
          {displayWord}
        </p>

        {#if result.radical}
          <p class="translation-popover__radical" lang="cy">
            radical: {result.radical}
          </p>
        {/if}

        <p class="translation-popover__english" lang="en">
          {result.entry.english}
        </p>

        {#if result.entry.note}
          <p class="translation-popover__note">
            {result.entry.note}
          </p>
        {/if}
      </div>
    {/if}

    <Popover.Arrow class="translation-popover__arrow" />
  </Popover.Content>
</Popover.Root>

<style>
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

  .translation-popover__welsh {
    font-weight: 700;
    font-size: 1.1rem;
    color: #e8d4a0;
    margin: 0 0 0.25rem;
  }

  .translation-popover__radical {
    font-size: 0.75rem;
    color: #8a9bb0;
    font-style: italic;
    margin: 0 0 0.5rem;
  }

  .translation-popover__english {
    font-size: 1rem;
    color: #e8e0d0;
    margin: 0;
  }

  .translation-popover__note {
    font-size: 0.8rem;
    color: #8a9bb0;
    font-style: italic;
    margin: 0.4rem 0 0;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(138, 155, 176, 0.2);
  }
</style>
