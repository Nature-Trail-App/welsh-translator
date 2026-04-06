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

### Usage with HTML Content

If your content contains HTML formatting (e.g. from a CMS rich text field), use `TranslatableHTML` instead. It preserves the HTML structure while making Welsh words interactive.

```svelte
<script lang="ts">
  import { LookupEngine } from '@naturetrail/welsh-translator/core';
  import { TranslatableHTML } from '@naturetrail/welsh-translator/svelte';

  let { vocabulary } = $props();

  const engine = LookupEngine.fromEntries(vocabulary);
  const html = '<p>Mae <strong>carreg</strong> yn y <em>bwthyn</em>.</p>';
</script>

<TranslatableHTML {html} {engine} />
```

> [!NOTE]
> `TranslatableHTML` uses Svelte's `{@html}` internally. You are responsible for sanitising the HTML input if it comes from an untrusted source.

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

## 📖 Examples

You can find complete, runnable examples in the [examples/](./examples) directory:

- **[Svelte 5 Example](./examples/svelte)**: Uses the `<TranslatableText />` component with Svelte 5 runes and `bits-ui`.
- **[Svelte 5 HTML Example](./examples/svelte-html)**: Uses the `<TranslatableHTML />` component with rich HTML content (bold, italic, paragraphs).
- **[Vanilla TS Example](./examples/vanilla)**: Demonstrates manual usage of the `core` library and `LookupEngine`.

Both examples use real vocabulary and prose data extracted from the initial Nant Gwrtheyrn project.

### Running the Demos

You can launch an interactive demo gallery to test these examples locally:

```bash
# 1. Start the Vite dev server
npm run demo

# 2. Open the URL provided in your terminal (usually http://localhost:5173)
```

The gallery will allow you to switch between the Svelte 5 and Vanilla TypeScript implementations.

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

## 🚢 Deployment & Versioning

This package is published to NPM automatically via GitHub Actions when a version tag is pushed.

### Releasing a new version

1. **Bump the version** using npm's built-in command. This updates `package.json` and creates a git tag in one step:

   ```bash
   npm version patch   # 0.1.0 → 0.1.1  (bug fixes)
   npm version minor   # 0.1.0 → 0.2.0  (new features, backwards compatible)
   npm version major   # 0.1.0 → 1.0.0  (breaking changes)
   ```

2. **Push the commit and tag:**

   ```bash
   git push && git push --tags
   ```

3. **GitHub Actions takes over** — the [publish workflow](./.github/workflows/publish.yml) runs type checking, tests, and build before publishing to NPM. You can monitor the run in the **Actions** tab of the repository.

### Versioning guidelines

This package follows [Semantic Versioning](https://semver.org/):

| Change type | Version bump | Examples |
|---|---|---|
| Bug fix, internal refactor | `patch` | Fix incorrect mutation candidate, fix tokeniser edge case |
| New feature, new export | `minor` | New component, new engine method, new mutation type |
| Breaking API change | `major` | Rename/remove exports, change `LookupResult` shape |

> [!NOTE]
> The package is currently at `v0.x.x`, meaning the API may still evolve. Pin to an exact version in production apps until `v1.0.0` is released.

### CI

Every push and pull request to `main` runs the [CI workflow](./.github/workflows/ci.yml): type checking, tests, and a full build. A passing CI badge indicates the package builds and all 60 tests pass.

---

## 🤝 Contributing & License

This project is part of the **Nant Gwrtheyrn** initiative. 

GPLv3 License 2026 Tinkr.
