# @naturetrail/welsh-translator

A framework-agnostic, offline-first Welsh word translation library with built-in mutation normalization and optional Svelte 5 components.

Designed for the **Nant Gwrtheyrn heritage trail app**, this package enables tap-to-translate functionality for Welsh prose, ensuring that users can understand content even when they are offline in remote areas.

---

## 🌟 Key Features

- **Initial Mutation Normalisation**: Recovers the radical (root) form of mutated Welsh words (Soft, Nasal, and Aspirate mutations).
- **Offline-First**: Designed to work with local vocabulary data (e.g., synced via Zero-Sync or Payload CMS).
- **Framework Agnostic**: Core TypeScript logic can be used in React, React Native, Vue, or vanilla JS.
- **Svelte 5 Components**: Ready-to-use components for interactive text, built with Svelte 5 runes and `bits-ui` popovers.
- **Smart Tokenisation**: Automatically splits prose into individually interactive word spans.

---

## 📦 Installation

```bash
# npm
npm install @naturetrail/welsh-translator

# pnpm
pnpm add @naturetrail/welsh-translator

# yarn
yarn add @naturetrail/welsh-translator
```

> [!NOTE]
> If you are using the Svelte 5 components, you will also need to install `bits-ui` as a peer dependency.

---

## 🚀 Core Usage (Framework Agnostic)

The core logic is exported under `@naturetrail/welsh-translator/core`. This can be used in any environment (including React Native, Node.js, or standard web apps).

### 1. Basic Lookup

```typescript
import { LookupEngine } from '@naturetrail/welsh-translator/core';

// 1. Prepare your vocabulary data (usually synced from CMS)
const vocabulary = [
  { id: '1', welsh: 'bwthyn', english: 'cottage', site: 'nant-gwrtheyrn' },
  { id: '2', welsh: 'carreg', english: 'stone', site: 'nant-gwrtheyrn' },
];

// 2. Initialize the engine
const engine = LookupEngine.fromEntries(vocabulary);

// 3. Perform lookups (handles mutations automatically!)
const result = engine.lookup('fwthyn'); // "fwthyn" is a soft mutation of "bwthyn"

if (result.entry) {
  console.log(`Matched: ${result.entry.welsh} (${result.entry.english})`);
  // Output: Matched: bwthyn (cottage)
  
  if (result.radical) {
    console.log(`Recovered radical: ${result.radical}`);
    // Output: Recovered radical: bwthyn
  }
}
```

### 2. Tokenising Prose

The tokeniser splits text into interactive word spans while preserving punctuation and whitespace.

```typescript
import { tokenise } from '@naturetrail/welsh-translator/core';

const text = 'Ymwelwch â’r fwthyn hanesyddol.';
const tokens = tokenise(text);

tokens.forEach(token => {
  if (token.type === 'word') {
    // Check if the word is in the dictionary
    const hasTranslation = engine.hasTranslation(token.word);
    console.log(`Word: ${token.word}, Translatable: ${hasTranslation}`);
  }
});
```

---

## 🧩 Svelte 5 Integration

The package includes Svelte 5 components for rapid UI development. These components use `bits-ui` for accessible popovers.

### Usage in Svelte

```svelte
<script lang="ts">
  import { LookupEngine } from '@naturetrail/welsh-translator/core';
  import { TranslatableText } from '@naturetrail/welsh-translator/svelte';

  let { welshText, vocabulary } = $props();

  // Initialize engine (can be done in a separate module or context)
  const engine = LookupEngine.fromEntries(vocabulary);
</script>

<div class="prose">
  <TranslatableText text={welshText} {engine} />
</div>

<style>
  /* Optional: Custom styling for the popover content */
  :global(.translation-popover) {
    background: #2c2f3a;
    color: white;
    border-radius: 8px;
    padding: 0.75rem;
  }
</style>
```

---

## 📱 React Native / Framework Agnostic Example

For React Native, you can use the core logic to build your own interactive word component.

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LookupEngine, tokenise } from '@naturetrail/welsh-translator/core';

const WelshText = ({ text, engine }) => {
  const tokens = React.useMemo(() => tokenise(text), [text]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {tokens.map((token, i) => {
        if (token.type === 'word') {
          const entry = engine.lookup(token.word).entry;
          
          return (
            <TouchableOpacity key={i} onPress={() => entry && alert(entry.english)}>
              <Text style={{ textDecorationLine: entry ? 'underline' : 'none' }}>
                {token.word}
              </Text>
            </TouchableOpacity>
          );
        }
        return <Text key={i}>{token.raw}</Text>;
      })}
    </View>
  );
};
```

---

## 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Why Mutation Normalisation?

Welsh uses **initial consonant mutations**, where the first letter of a word changes based on grammatical context.

For example, the word **carreg** (stone) can appear as:
- **garreg** (Soft mutation)
- **ngharreg** (Nasal mutation)
- **charreg** (Aspirate mutation)

Without a normaliser, a simple dictionary lookup for `garreg` would fail. This library generates prioritized candidate radicals for any given word, allowing it to correctly identify `carreg` as the root form.

---

## 🛠️ Payload CMS Integration

This package is designed to consume data from a Payload CMS collection structured like this:

| Field | Type | Notes |
|-------|------|-------|
| `welsh` | Text | The **radical** (root) form only |
| `english` | Text | English translation |
| `site` | Select | Scopes the word to a specific heritage site |
| `note` | Textarea | Optional usage notes or gender info |

The vocabulary is synced to the device as a simple JSON array and passed to the `LookupEngine`.

---

## 📚 Background & Research

For a deep dive into the linguistic research, initial design decisions, and Welsh mutation rules that informed this package, see the [Background & Research](./BACKGROUND.md) guide.

---

## 🤝 Contributing & License

This project is part of the **Nant Gwrtheyrn** initiative. 

GPLv3 License 2026 Tinkr.
