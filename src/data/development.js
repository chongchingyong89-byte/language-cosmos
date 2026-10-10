// "From birth": how a first language gets into the mind, stage by stage.
// Shown when you open the Mother tongue origin at the centre of the galaxy.
//
//   why : what this means for the app's core question
//         (mother tongue from birth → personality)

export const TIMELINE = [
  // ── Before birth ──
  {
    stage: 'womb', evidence: 'strong',
    title: 'Learning the melody in the womb',
    claim: 'Newborns prefer the rhythm of their mother\'s language and recognise its vowels hours after birth. One study found that newborn cries already follow the native melody: French cries rise, German cries fall.',
    why: 'The first language starts shaping the brain before the first breath, long before any culture is deliberately taught.',
    refs: [
      'Mehler et al. (1988). A precursor of language acquisition in young infants. Cognition 29.',
      'Moon, Lagercrantz & Kuhl (2013). Language experienced in utero affects vowel perception after birth. Acta Paediatrica 102(2).',
      'Single study: Mampe et al. (2009). Newborns\' cry melody is shaped by their native language. Current Biology 19(23).',
    ],
  },
  // ── Infancy ──
  {
    stage: 'infancy', evidence: 'strong',
    title: 'Perceptual narrowing',
    claim: 'By 10–12 months infants lose the ability to hear sound contrasts their language does not use (e.g. Hindi dental vs retroflex for English babies). Tone sensitivity also narrows in non-tone homes.',
    why: 'The mother tongue tunes perception itself, laying down a template before the child can speak.',
    refs: [
      'Werker & Tees (1984). Cross-language speech perception. Infant Behavior & Development 7.',
      'Kuhl (2004). Early language acquisition: cracking the speech code. Nature Reviews Neuroscience 5.',
      'Mattock & Burnham (2006). Chinese and English infants\' tone perception. Infancy 10(3).',
    ],
  },
  {
    stage: 'infancy', evidence: 'moderate',
    title: 'Concepts kept or dropped',
    claim: 'Five-month-olds notice "tight vs loose fit" (Korean 끼다 kkita). English-learning children stop attending to it because English does not mark it.',
    why: 'Infants start with universal categories, and the first language decides which ones stay salient.',
    refs: [
      'Choi & Bowerman (1991). Learning to express motion events in English and Korean. Cognition 41.',
      'Hespos & Spelke (2004). Conceptual precursors to language. Nature 430.',
      'McDonough, Choi & Mandler (2003). Understanding spatial relations. Cognitive Psychology 46.',
    ],
  },
  // ── Toddler ──
  {
    stage: 'toddler', evidence: 'moderate',
    title: 'Colour words move colour to the language hemisphere',
    claim: 'Before learning colour words, toddlers show categorical colour perception in the right hemisphere. After learning them, it shifts to the left (language) hemisphere.',
    why: 'Words reorganise perception once they are learned.',
    refs: ['Franklin et al. (2008). Lateralization of categorical perception of color changes with color term acquisition. PNAS 105(9).'],
  },
  {
    stage: 'toddler', evidence: 'moderate',
    title: 'Verb-first vs noun-first vocabularies',
    claim: 'Mandarin and Korean toddlers learn proportionally more verbs early, while English toddlers start noun-heavy.',
    why: 'Hypothesis: an action-rich early vocabulary may orient attention to relations and context rather than objects (cf. holistic vs analytic thinking).',
    refs: [
      'Tardif (1996). Nouns are not always learned before verbs. Developmental Psychology 32(3).',
      'Choi & Gopnik (1995). Early acquisition of verbs in Korean. J. Child Language 22.',
    ],
  },
  // ── Early childhood ──
  {
    stage: 'early', evidence: 'strong',
    title: 'Understanding other minds needs early language',
    claim: 'Deaf children of hearing parents, who often get no full language early, pass false-belief tests years later than deaf children of signing parents, who are on time.',
    why: 'Empathy and social personality rest on theory of mind, and theory of mind depends on having *a* first language early, whichever language it is.',
    refs: [
      'Peterson & Siegal (1995). Deafness, conversation and theory of mind. J. Child Psychology & Psychiatry 36(3).',
      'Schick, de Villiers, de Villiers & Hoffmeister (2007). Language and theory of mind: a study of deaf children. Child Development 78(2).',
    ],
  },
  {
    stage: 'early', evidence: 'moderate',
    title: 'Talking about thinking',
    claim: 'Mastering complement sentences ("she thinks that…") predicts when children understand false beliefs.',
    why: 'The grammar of reported thought gives children a tool for representing other people\'s minds.',
    refs: ['de Villiers & Pyers (2002). Complements to cognition. Cognitive Development 17.'],
  },
  // ── School age ──
  {
    stage: 'school', evidence: 'moderate',
    title: 'Habits of "thinking for speaking" settle',
    claim: 'By around age 9, children\'s storytelling follows the adult patterns of their language: manner vs path for motion, process vs endpoint for events.',
    why: 'Habitual attention patterns become stable at the age when personality traits also start to stabilise.',
    refs: ['Berman & Slobin (1994). Relating Events in Narrative: A Crosslinguistic Developmental Study.'],
  },
  {
    stage: 'school', evidence: 'correlational',
    title: 'Same city, different mother tongue',
    claim: 'In Meran (Italy), German-speaking children were more patient in delay-of-reward choices than Italian-speaking children at the same schools, consistent with the future-tense hypothesis.',
    why: 'A natural experiment: the town, economy and schooling are the same and the first language differs. This is the best design for separating language from culture.',
    refs: ['Sutter, Angerer, Glätzle-Rützler & Lergetporer (2018). Language group differences in time preferences. European Economic Review 106.'],
  },
  // ── Adulthood ──
  {
    stage: 'adult', evidence: 'moderate',
    title: 'The mother tongue stays the language of emotion',
    claim: 'Taboo words and childhood reprimands trigger stronger skin-conductance responses in the first language than in a second. Many bilinguals find "I love you" easier to say in their second language.',
    why: 'Emotional life stays anchored in the first language. This is also why decisions made in a foreign language feel "cooler".',
    refs: [
      'Harris, Ayçiçeği & Gleason (2003). Taboo words and reprimands elicit greater autonomic reactivity in a first language. Applied Psycholinguistics 24.',
      'Pavlenko (2005). Emotions and Multilingualism. CUP.',
    ],
  },
  {
    stage: 'adult', evidence: 'moderate',
    title: 'The self speaks its first language',
    claim: 'Chinese-born bicultural students who described themselves in Chinese gave more collective self-statements and endorsed more Chinese values than when they wrote in English.',
    why: 'Self-concept, the core of personality, shifts with the language it is expressed in.',
    refs: ['Ross, Xun & Wilson (2002). Language and the bicultural self. PSPB 28(8).'],
  },
  {
    stage: 'adult', evidence: 'strong',
    title: 'A sensitive period for the first language',
    claim: 'Deaf adults who acquired their first language late have lifelong deficits in grammar. They also learn a second language worse than people who had any early first language.',
    why: 'The timing of the first language matters more than which language it is. An early mother tongue builds the scaffolding for everything learned later.',
    refs: ['Mayberry, Lock & Kazmi (2002). Linguistic ability and early language exposure. Nature 417.'],
  },
  {
    stage: 'adult', evidence: 'strong',
    title: 'A lost mother tongue leaves traces',
    claim: 'Chinese-born children adopted into French families, who no longer know any Chinese, still process tones like Chinese speakers. Korean-born adoptees relearn Korean sounds faster than controls.',
    why: 'Even a forgotten first language keeps its imprint in the brain.',
    refs: [
      'Pierce et al. (2014). Mapping the unconscious maintenance of a lost first language. PNAS 111(48).',
      'Choi, Cutler & Broersma (2017). Early development of abstract language knowledge. Royal Society Open Science 4.',
    ],
  },
];

// When each feature's effect is first observed (where known).
export const FEATURE_STAGE = {
  tonal: 'infancy', late_access: 'infancy', sound_symbolism: 'toddler', numeral_classifiers: 'early',
  blue_split: 'toddler', gendered_you: 'toddler', genderless_pronouns: 'toddler', pro_drop: 'toddler',
  agglutination: 'toddler', noun_classes: 'toddler', iconicity: 'toddler',
  absolute_frame: 'early', transparent_numerals: 'early', kinship_lexicon: 'early', gendered_nouns: 'early',
  evidentiality: 'early', motion_satellite: 'early', motion_verb_framed: 'early', productive_compounding: 'early',
  speaker_gender_marking: 'early', spatial_grammar: 'early', facial_grammar: 'early',
  rtl_timeline: 'school', weak_ftr: 'school', strong_ftr: 'school', short_digits: 'school', numeral_inversion: 'school',
  logographic: 'school', endpoint_aspect: 'school', process_aspect: 'school', honorific_grammar: 'school',
  tv_distinction: 'school', diglossia: 'school',
  neutral_pronoun: 'adult', agentive: 'adult', nonagentive: 'adult',
};
