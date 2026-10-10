# Research framework & brainstorm

The question: **Does the language a person speaks shape their attitude, creativity, conservatism and personality, and how could we tell?**

## 1. The causal chain we map

```
Language feature  →  habitual attention  →  cognition / emotion  →  attitude & personality  →  behaviour
(grammar, lexicon,     ("thinking for         (memory, perception,   (openness, conservatism,  (saving, blame,
 script, sound)         speaking")             categories)            collectivism)             creativity)
```

Each step weakens the effect. Perception effects (Russian blues) are well established. Personality and attitude effects are mostly correlational or come from bilingual studies. The cosmos keeps this visible with evidence levels.

## 2. Trait domains (the 8 branch directions)

| Domain | Example questions | Strongest current lead |
|---|---|---|
| Perception 感知 | Do words carve up colour, space, smell? | Russian/Greek blues, Jahai odours, cardinal directions |
| Time & Future 时间与未来 | Is the future "near"? Does that change prudence? | Writing direction → timeline; future-tense ↔ saving (contested) |
| Cognition & Number 认知与数字 | Do number words change maths? | Transparent numerals, Pirahã number |
| Social Order & Conservatism 社会秩序与保守 | Does grammar keep hierarchy in view? | Honorifics, T–V, kinship (correlational), Swedish *hen* (experimental) |
| Self & Identity 自我与身份 | How prominent is "I"? Is the self different in each language? | Bilingual personality frame-switching |
| Emotion 情感 | Do emotion words change felt emotion? | Emotion semantics vary across 2,474 languages (Jackson 2019) |
| Creativity & Expression 创造力与表达 | Does a language make novelty easier to express? | Manner-rich motion verbs; bilingual creativity advantage |
| Morality & Decisions 道德与决策 | Does language change blame and risk? | Foreign-language effect, agentive accident descriptions |

## 3. Study designs, best to weakest

1. **Within-person bilingual switching**: the same person answers a Big Five (BFI-2) or attitude scale in language A and language B, counterbalanced, with a few weeks between sessions. This controls genes, upbringing and culture. *This is the gold-standard bridge.*
2. **Language-priming experiments**: randomise the language of instructions and measure a non-verbal outcome (risk choice, blame rating, divergent-thinking score).
3. **Matched cross-language groups**: two groups matched on country, education and religion, differing in L1 (e.g. Malay- vs Chinese- vs Tamil-dominant Malaysians, who share one country).
4. **Country-level correlation** (WALS features × Hofstede/GLOBE/World Values Survey). Use it to generate hypotheses only, and always add phylogenetic and geographic controls (Roberts et al. 2015).

> **Malaysia is a natural laboratory.** Malay, Mandarin, Cantonese, Hokkien, Tamil and English coexist, and many people are trilingual. Designs 1 and 3 are unusually feasible here.

## 4. Open hypotheses to explore (the speculative leaves)

- **Thai gender-marked speech and gender visibility.** Thai speakers mark their own gender in polite particles (ครับ/ค่ะ) and pronouns. *Hypothesis:* this makes gender expression a visible, chosen act, which raises the *visibility* of trans women (kathoey). It does not raise *prevalence*. *Test:* compare prevalence estimates with visibility measures across Thailand, Japan (also gendered speech), Malaysia and Vietnam (not gendered), controlling for Buddhism, law and tourism.
- **Compounding and creativity**: do German, Finnish and Chinese speakers score higher on conceptual-combination tasks?
- **Kinship granularity and filial attitude**: does a richer kin vocabulary (伯/叔/舅) predict filial-piety scores within Chinese dialect groups?
- **Honorific load and conformity**: does priming Japanese or Korean honorific register raise Asch-type conformity compared with a plain register?
- **Evidentiality and misinformation resistance**: are Turkish speakers less swayed by hearsay in a misinformation paradigm?
- **Subtractive numerals**: do Yoruba numerals change mental-arithmetic strategy?
- **Culture-key words**: does knowing *malu*, *budi*, *面子* or *정* change how quickly people recognise those situations in vignettes?

## 5. The shadow side (negative impacts)

Every feature that can help can also hurt. The red thorns in the app collect the downsides that have been documented or proposed, graded on the same evidence scale ([src/data/shadows.js](../src/data/shadows.js)).

**Best-supported downsides:**
- **Machine translation bias from genderless pronouns** (strong): Turkish/Finnish/Malay "o/hän/dia" becomes "he is a doctor" and "she is a nurse".
- **Masculine generics** (moderate): "der Arzt" for any doctor lowers girls' confidence for male-typed jobs; pair forms fix it.
- **Agentive vs non-agentive accident language** (moderate): one inflates blame, the other blurs accountability.
- **Diglossia** (moderate): reading in a variety nobody speaks at home slows early literacy.
- **Inverted numerals** (moderate): extra working-memory load and number-writing errors in children.

**Mostly correlational or speculative:** future tense and saving, grammatical gender and women's employment, honorifics and safety culture (the "Korean Air" story is disputed), pronoun drop and conformity, and the shadows of culture-key words (面子, 空気を読む, malu, kreng jai, jugaad, avos').

**Ethics for this part of the study**
1. Attach harms to *features*, never to *peoples*. "Honorific grammar may suppress dissent" is a testable hypothesis; "Koreans don't speak up" is a stereotype.
2. Ask the reverse question too: the same feature usually has an upside (honorifics also signal respect and care).
3. Count with care: more thorns means more research, not a worse language.
4. Look for natural experiments: language reforms such as Swedish *hen*, flattened Korean job titles and German pair forms let you watch an effect change.

## 6. Roadmap for the app

- [ ] **Compare mode**: pick 2–3 cores and show their shared and unique leaves side by side.
- [ ] **WALS import**: generate features automatically from the World Atlas of Language Structures (wals.info) for 2,600 languages.
- [ ] **Glottolog tree**: replace hand-placed clusters with the real family tree (sub-branches as nested orbits).
- [ ] **Culture overlay**: tint cores by Hofstede/GLOBE or World Values Survey scores to look for correlation with features.
- [ ] **Personality layer**: per-language Big Five shifts from bilingual studies, shown as moons around the core.
- [ ] **More cores**: Hokkien, Hakka, Javanese, Tagalog, Bengali, Persian, Quechua (evidentials), Dyirbal (noun classes), Himba (colour).
- [ ] **Shared notes**: move study notes from browser storage to a shared database so a research group can annotate together.
- [ ] **Verify lexicon figures**: anything marked `verify: true`.

## 7. Pitfalls to remember

- **"Eskimo words for snow"**: counting words does not measure how people think. The way the words are *used* matters more.
- **Confounds**: language, religion, climate, economics and colonial history all travel together.
- **WEIRD samples**: most of the evidence comes from university students.
- **Publication bias**: striking Whorfian findings get published, and failed replications get buried. Look for pre-registered replications.
