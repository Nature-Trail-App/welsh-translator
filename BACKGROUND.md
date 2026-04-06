# Background, Research & Design Decisions

This document preserves the original research and linguistic rationale behind the `@naturetrail/welsh-translator` package, initially developed as a proof of concept for the **Nant Gwrtheyrn** heritage trail app.

---

## 🏛️ Project Context

The **Nant Gwrtheyrn** app is a Tauri v2 frontend application that serves content from Payload CMS, synced offline via Zero (Rocicorp). 

The "Tap-to-Translate" feature allows users to tap any Welsh word in a point of interest (POI) description to see its English translation. The primary design constraint is that it must work **fully offline**, as users often walk trails with no cellular connectivity.

---

## 🧠 Design Decisions

### Why Single-Word Translation?
We chose single-word translation as the pragmatic starting point for several linguistic and UX reasons:

1.  **Word Order (VSO)**: Welsh uses Verb-Subject-Object order, which differs significantly from English. Naive phrase translation often results in grammatical nonsense without a full NLP pipeline.
2.  **Linguistic Complexity**: Features like preposition fusion (prepositions merging with pronouns) and adjectives following nouns make phrase-level translation unreliable without an active API.
3.  **Mobile UX**: Tapping a single word is a more natural interaction on a mobile device than dragging selection handles across phrases.

### Why a Local Dictionary?
The app is **offline-first**. Vocabulary data is synced to the device as part of the initial content load. 
- **Reliability**: No network is required at lookup time.
- **Curation**: Each heritage site can have its own specific word list relevant to its unique flora, fauna, and history, rather than attempting to be a general-purpose dictionary.

---

## 🏴󠁧󠁢󠁷󠁬󠁳󠁿 The Mutation Normaliser

Welsh is a Celtic language featuring **initial consonant mutations**, where the first letter(s) of a word change depending on the grammatical context. Without a normalizer, a dictionary lookup for a mutated word would fail.

### How it Works
The normaliser identifies mutated prefixes and generates a prioritised list of potential **radicals** (root forms) to check against the vocabulary index.

#### 1. Soft Mutation (Treiglad Meddal)
The most common mutation, triggered by feminine singular nouns, certain prepositions, and more.

| Radical | Mutated |
|---------|---------|
| p | b |
| t | d |
| c | g |
| b | f |
| d | dd |
| g | *(disappears)* |
| m | f |
| ll | l |
| rh | r |

*Note: When 'g' disappears, the normaliser attempts to prepend 'g' to vowel-starting words.*

#### 2. Nasal Mutation (Treiglad Trwynol)
Primarily triggered by `fy` (my) and the preposition `yn` (in).

| Radical | Mutated |
|---------|---------|
| p | mh |
| t | nh |
| c | ngh |
| b | m |
| d | n |
| g | ng |

#### 3. Aspirate Mutation (Treiglad Llaes)
Triggered by `a/ag` (and/with), `ei` (her), and the numerals three and six.

| Radical | Mutated |
|---------|---------|
| p | ph |
| t | th |
| c | ch |

---

## 🔬 Research & Reference Material

### Welsh Mutation Rules
- [Wiktionary — Welsh Mutations Appendix](https://en.wiktionary.org/wiki/Appendix:Welsh_mutations): Comprehensive tables and examples.
- [Wikibooks — Welsh Mutations](https://en.wikibooks.org/wiki/Welsh/Mutations): Accessible explanation with grammatical triggers.
- [WelshAntur Grammar Guides](https://welshantur.com/grammar_theory/mutations-in-welsh-types-and-triggers/): Clear breakdown by mutation type.

### Welsh NLP Tooling
- **Welsh Natural Language Toolkit (WNLT)**: A government-funded project using the GATE NLP framework. [User Guide](https://gate.ac.uk/gate/plugins/Lang_Welsh/doc/user-guide.pdf).
- **UniMorph Analysers**: Open-source morphological analysis tools for Welsh. [GitHub](https://github.com/unimorph/analyzers).
