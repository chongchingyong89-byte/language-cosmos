# 语言宇宙 · Language Cosmos

> **Core question:** how does the language you are born into (your mother tongue) shape your personality?

A 3D universe for studying how each language may shape attitude, creativity, conservatism and personality.

- **Cores** are languages. Core **volume ∝ vocabulary** (dictionary headwords); you can switch it to speakers.
- **Clusters and nebulae** are language families, laid out on the arms of a spiral galaxy.
- **Branches** grow in 8 fixed directions, one per trait domain, so the same direction means the same domain on every core.
- **Leaves**: ● a linguistic feature, ◆ a culture-key word. Leaf size = strength of evidence; wireframe = speculative.
- **Bridges** (arcs between cores) are bilingual studies where the *same person* changes when switching language.
- **母语 · Mother tongue origin** (the glowing galactic core) opens a from-birth timeline: womb → infancy → childhood → adulthood, showing when a first language starts shaping the mind.
- **Personality radar** on every language: its leaves add up to a hypothesised tilt on the Big Five plus interdependence, hierarchy and conservatism, weighted by evidence. The **Personality lens** (Filters) recolours the whole universe by one trait.
- **Red thorns** mark the shadow side: evidence-graded negative effects.
- **Sign languages** (ASL, BSL, BIM, CSL) are included. Deaf children's late access to a first language gives the strongest evidence that *timing* matters.

## Two modes

- **🧑‍🚀 Explorer (kids):** stars say hello in their own language (device speech voice), leaves become "brain superpowers" with a ★ rating of how sure scientists are, a 10-stop **Space Mission** with a quiz, a **Language Passport** with stamps and badges, and three mini-games based on real experiments: **Tone Detective** (Mandarin tones), **Number Ninja** (Chinese and Malay counting) and **Blue Spotter** (the Russian-blues reaction-time task). The shadow side and personality scores are hidden in this mode.
- **🔬 Research:** evidence grades, sources, an "at a glance" infographic per language (rank bars, domain donut, evidence strip, life-stage dots), the personality radar and lens, the shadow side, and the from-birth timeline.

First-time visitors choose a mode on the welcome screen; the ⇄ pill switches anytime.

## 🏪 World Shops

Learn a language, its everyday attitudes and its favourite snacks at a shop counter. Phase 1 is open: **🇯🇵 あまやどり**, a rainy night in Tokyo.

- **The street (3D):** walk an anime heroine with a clear umbrella through a wet, reflective street (WASD/arrows, or a joystick on phones). Find 13 Japanese words on signs, shops and the road (止まれ, 横断歩道, 自動販売機, 点字ブロック…), each with a reading, meaning and culture note.
- **Inside the konbini (3D):** do Mum's shopping. Her list is written with counter words (おにぎり 二個, お茶 一本, せんべい 三枚), so you must read 本・個・枚・冊 to take the right number from the shelves. 11 more words hang over the aisles (飲み物, お菓子, パン, 雑誌, レジ…).
- **The till:** the clerk asks 温めますか？, 袋はご利用ですか？ and ポイントカードは？. Answer in Japanese (say 大丈夫です for "no thanks"), hear the price (八百六十円です), pay with yen coins and notes, and get お返し (change), or ぴったり for the exact amount. Your basket is then checked against the list.
- **The night shift:** switch roles and serve customers with different attitudes (hurried, indirect, very polite…): counter words, polite shop phrases, prices, katakana.
- Generated koto lo-fi music in the Japanese *in* scale, rain, door chime and footsteps.
- Coming phases: Malaysia, China, Korea, Thailand, India, France, Mexico.

Direct links: `#shop` (all shops), `#shop-jp` (the street), `#shop-jp/inside` (the 3D shop), `#shop-jp/play` (the night shift).

## Credits

- Heroine: **VRM1_Constraint_Twist_Sample** © 2022 pixiv Inc., [VRM Public License 1.0](https://vrm.dev/licenses/1.0/) (avatar use by everyone, redistribution and modification allowed). Loaded with [three-vrm](https://github.com/pixiv/three-vrm) (MIT).
- Voice recordings: Wikimedia Commons contributors (see below).

## Run

```bash
npm start            # → http://localhost:5173
```

In VS Code you can also run **Terminal → Run Task → Serve Language Cosmos**. There is no build step and nothing to install. Three.js loads from jsDelivr, so you need to be online.

Deep links: `http://localhost:5173/#th` opens directly on Thai. Use any language `id`.

Controls: drag to orbit, scroll to zoom, click a core or leaf. <kbd>Esc</kbd> returns to the overview, <kbd>/</kbd> searches, and Shift-click on a domain chip shows only that domain.

**Mobile**: on phones the layout switches to a top bar (search, filters, sound, overview), a draggable bottom sheet for details (peek, half, full), and slide-up sheets for Languages and Filters. Tap a star or leaf; small targets have a finger-sized tap radius. Landscape phones dock the details panel to the right.

**Sound** is generated live with the Web Audio API (no audio files): a gliding ambient pad, cosmic wind and star twinkles, plus pentatonic cues on every interaction. Each language rings its own note (bigger vocabulary → deeper), and each trait domain has its own bell. It starts on your first click; toggle it with <kbd>M</kbd> or the Sound switch, which is remembered per browser.

## Structure

```
index.html              page shell + import map (three@0.160.0)
css/style.css           glass UI, labels, panel
src/
  main.js               entry: data sanity checks, boots Cosmos + UI
  cosmos.js             Three.js world: galaxy, cores, trees, bridges, picking, camera
  ui.js                 list, detail panel, legend filters, tooltip, study notes
  audio.js              procedural soundscape: ambient pad, wind, twinkles, interaction cues
  profile.js            builds each language's hypothesised personality tilt from its leaves
  kids/                 Explorer mode: data.js (greetings, powers, tour, quiz, badges), explorer.js, games.js, voices.js
  shops/                World Shops: engine.js (flow + counter game), checkout.js (paying at the till), japan.js (shop data), registry.js, chibi.js, rain.js
  world/                3D scenes: base.js (renderer, camera, controls, signs), street.js, interior.js, heroineVrm.js (anime avatar), heroine.js (fallback), textures.js
assets/heroine.vrm      the anime heroine (pixiv VRM sample)
  data/
    taxonomy.js         8 trait domains, 5 evidence levels, families, galaxy order
    features.js         linguistic features → claimed effects (+ refs, how to test), bilingual bridges
    languages.js        32 language cores (incl. 4 sign languages): lexicon, speakers, typology, features, concepts
    traits.js           leaf → personality-trait directions; measured bilingual personality shifts
    development.js      from-birth timeline; when each feature's effect emerges
    shadows.js          negative impacts (red thorns)
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

## Voice recordings

"Say hello" plays real native-speaker recordings from **Wikimedia Commons** (Wiktionary and Lingua Libre contributors) for 19 languages, streamed from upload.wikimedia.org. Each recording's speaker and licence (public domain, CC0, CC BY, CC BY-SA or GFDL) is credited under the button and listed in [src/kids/voices.js](src/kids/voices.js). Languages without a recording (Turkish, Thai, Vietnamese, Malay, Yoruba) fall back to the device's text-to-speech voice.

## Caveats that the visual can hide

1. **Vocabulary size is not comparable across languages.** Dictionaries differ in scope, and agglutinative or compounding languages (Finnish, Turkish, German) have effectively unbounded word forms. Core size shows how much is *documented*, not how expressive a language is.
2. **Correlation ≠ causation.** Country-level links (future tense ↔ saving, pronoun-drop ↔ collectivism) can't separate language from culture, history or religion.
3. The **strong Sapir–Whorf hypothesis** (language *determines* thought) is not supported. The evidence supports a **weak** version: language nudges attention, memory and habits, usually by a modest amount.
