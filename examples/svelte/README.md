# Svelte 5 Example: Welsh Translator

This example demonstrates how to integrate the `@naturetrail/welsh-translator` package into a Svelte 5 application using the provided `TranslatableText` component.

## Setup

1.  **Dependencies**: Ensure you have `bits-ui` installed, as the Svelte components rely on it for accessible popovers.
    ```bash
    npm install bits-ui
    ```

2.  **Usage**:
    Import the `LookupEngine` and `TranslatableText` component into your Svelte file.

    ```svelte
    <script lang="ts">
      import { LookupEngine } from '@naturetrail/welsh-translator/core';
      import { TranslatableText } from '@naturetrail/welsh-translator/svelte';
      import { vocabulary, pois } from '../data.js';

      const engine = LookupEngine.fromEntries(vocabulary);
    </script>

    <TranslatableText text={pois[0].body} {engine} />
    ```

3.  **Styling**:
    The example includes some basic CSS variables to match the "Nant Gwrtheyrn" aesthetic. You can customize the popover styling by targeting the `.translation-popover` class in your global CSS.

## Key Runes Used
- `$props()`: To handle incoming data.
- `$state()`: For internal component state (handled within the package components).
- `$derived()`: For reactive computation of tokens and translations.
