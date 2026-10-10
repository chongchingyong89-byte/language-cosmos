# 语言宇宙 · Language Cosmos

A 3D universe for studying how each language may shape attitude, creativity, conservatism and personality.

- **Cores** are languages. Core **volume ∝ vocabulary** (dictionary headwords); you can switch it to speakers.
- **Clusters and nebulae** are language families, laid out on the arms of a spiral galaxy.
- **Branches** grow in 8 fixed directions, one per trait domain, so the same direction means the same domain on every core.
- **Leaves**: ● a linguistic feature, ◆ a culture-key word. Leaf size = strength of evidence; wireframe = speculative.
- **Bridges** (arcs between cores) are bilingual studies where the *same person* changes when switching language.

## Run

```bash
npm start            # → http://localhost:5173
```

In VS Code you can also run **Terminal → Run Task → Serve Language Cosmos**. There is no build step and nothing to install. Three.js loads from jsDelivr, so you need to be online.

Deep links: `http://localhost:5173/#th` opens directly on Thai. Use any language `id`.

Controls: drag to orbit, scroll to zoom, click a core or leaf. <kbd>Esc</kbd> returns to the overview, <kbd>/</kbd> searches, and Shift-click on a domain chip shows only that domain.

## Structure

```
index.html              page shell + import map (three@0.160.0)
css/style.css           glass UI, labels, panel
src/
  main.js               entry: data sanity checks, boots Cosmos + UI
  cosmos.js             Three.js world: galaxy, cores, trees, bridges, picking, camera
  ui.js                 list, detail panel, legend filters, tooltip, study notes
  data/
    taxonomy.js         8 trait domains, 5 evidence levels, families, galaxy order
    features.js         linguistic features → claimed effects (+ refs, how to test), bilingual bridges
    languages.js        28 language cores: lexicon, speakers, typology, features, concepts
scripts/serve.mjs       zero-dependency static server
docs/RESEARCH_FRAMEWORK.md   brainstorm, hypotheses, study designs, roadmap
```

## Adding to the universe

**A language**: append to `LANGUAGES` in [src/data/languages.js](src/data/languages.js). It needs a `family` from `FAMILIES` and a `cluster` from `CLUSTER_ORDER` in taxonomy.js. Mark rough vocabulary figures with `verify: true`.

**A feature/effect**: add an entry to `FEATURES` in [src/data/features.js](src/data/features.js), then list its id in each language's `features`. Be strict about `evidence`:

| level | use when |
|---|---|
| strong | replicated experiments on non-verbal tasks |
| moderate | experimental, with limited replication |
| correlational | country- or group-level association only |
| contested | failed replications or a published rebuttal |
| speculative | your hypothesis, not yet tested |

**A bridge**: add to `BRIDGES`. Only use within-person bilingual studies.

`main.js` logs a console warning for unknown feature ids or bridge endpoints.

## Caveats that the visual can hide

1. **Vocabulary size is not comparable across languages.** Dictionaries differ in scope, and agglutinative or compounding languages (Finnish, Turkish, German) have effectively unbounded word forms. Core size shows how much is *documented*, not how expressive a language is.
2. **Correlation ≠ causation.** Country-level links (future tense ↔ saving, pronoun-drop ↔ collectivism) can't separate language from culture, history or religion.
3. The **strong Sapir–Whorf hypothesis** (language *determines* thought) is not supported. The evidence supports a **weak** version: language nudges attention, memory and habits, usually by a modest amount.
