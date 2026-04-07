<script lang="ts">
  import { Popover } from 'bits-ui';
  import type { LookupResult } from '../core/types.js';
  import './welsh-translator.css';

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
