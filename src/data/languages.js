// Language cores. Core size = vocabulary (volume ∝ headword count), or speakers.
//
//   speakers : total L1+L2 speakers in millions (approx., Ethnologue-style, 2023)
//   lexicon  : headwords in a major reference dictionary. Not comparable
//              across languages: dictionaries differ in scope, and agglutinative
//              or compounding languages have unbounded word forms.
//              `verify: true` = rough figure, check before citing.
//   features : ids from features.js (each becomes a leaf on its branch)
//   concepts : culture-key words, drawn as diamond leaves. A word is not an
//              emotion: these are prompts for study, not evidence.

export const LANGUAGES = [
  // ── Germanic ──
  {
    id: 'en', name: 'English', native: 'English', family: 'indo-european', cluster: 'germanic', branch: 'Germanic',
    speakers: 1456, lexicon: { n: 470000, source: "Webster's Third New International + Addenda" },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Analytic', tone: false },
    features: ['strong_ftr', 'duration_length', 'process_aspect', 'motion_satellite'],
    concepts: [
      { term: 'fair / reasonable', gloss: 'Impartial procedure as a moral ideal', category: 'social', ref: 'Wierzbicka (2006). English: Meaning and Culture. OUP.' },
      { term: 'privacy', gloss: 'A protected personal sphere', category: 'self', ref: 'Wierzbicka (2006).' },
    ],
    agentive: true,
  },
  {
    id: 'de', name: 'German', native: 'Deutsch', family: 'indo-european', cluster: 'germanic', branch: 'Germanic',
    speakers: 134, lexicon: { n: 148000, source: 'Duden, 28th ed. (compounding makes the true count unbounded)' },
    typology: { order: 'SOV/V2', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['weak_ftr', 'endpoint_aspect', 'numeral_inversion', 'gendered_nouns', 'tv_distinction', 'motion_satellite', 'productive_compounding'],
    concepts: [
      { term: 'Schadenfreude', gloss: 'Pleasure at another\'s misfortune', category: 'emotion', ref: 'Smith (2013). The Joy of Pain. OUP.' },
      { term: 'Feierabend', gloss: 'The protected end of the working day', category: 'social' },
      { term: 'Fremdscham', gloss: 'Vicarious embarrassment', category: 'emotion', ref: 'Krach et al. (2011). Your flaws are my pain. PLoS ONE.' },
    ],
  },
  {
    id: 'sv', name: 'Swedish', native: 'Svenska', family: 'indo-european', cluster: 'germanic', branch: 'Germanic',
    speakers: 13, lexicon: { n: 126000, source: 'SAOL, 14th ed.' },
    typology: { order: 'SVO/V2', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['weak_ftr', 'endpoint_aspect', 'duration_length', 'neutral_pronoun', 'motion_satellite', 'productive_compounding'],
    concepts: [
      { term: 'lagom', gloss: 'Just the right amount: moderation as a virtue', category: 'social' },
    ],
  },
  // ── Romance ──
  {
    id: 'es', name: 'Spanish', native: 'Español', family: 'indo-european', cluster: 'romance', branch: 'Romance',
    speakers: 559, lexicon: { n: 93000, source: 'Diccionario de la lengua española (RAE), 23rd ed.' },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['strong_ftr', 'duration_volume', 'process_aspect', 'motion_verb_framed', 'gendered_nouns', 'tv_distinction', 'pro_drop'],
    concepts: [
      { term: 'sobremesa', gloss: 'Lingering at the table to talk after a meal', category: 'social' },
      { term: 'vergüenza ajena', gloss: 'Embarrassment felt on someone else\'s behalf', category: 'emotion' },
    ],
    nonagentive: true,
  },
  {
    id: 'fr', name: 'French', native: 'Français', family: 'indo-european', cluster: 'romance', branch: 'Romance',
    speakers: 310, lexicon: { n: 100000, source: 'Trésor de la langue française informatisé (TLFi)' },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['strong_ftr', 'numeral_inversion', 'gendered_nouns', 'tv_distinction', 'motion_verb_framed'],
    concepts: [
      { term: 'dépaysement', gloss: 'The disorientation of being out of one\'s country', category: 'emotion' },
      { term: "l'esprit de l'escalier", gloss: 'Thinking of the perfect reply too late', category: 'creativity' },
    ],
  },
  {
    id: 'pt', name: 'Portuguese', native: 'Português', family: 'indo-european', cluster: 'romance', branch: 'Romance',
    speakers: 264, lexicon: { n: 228500, source: 'Dicionário Houaiss da Língua Portuguesa (2001)' },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['strong_ftr', 'gendered_nouns', 'tv_distinction', 'pro_drop', 'motion_verb_framed'],
    concepts: [
      { term: 'saudade', gloss: 'Longing for something absent that may never return', category: 'emotion', ref: 'King Duarte (c. 1438). Leal Conselheiro: earliest analysis.' },
    ],
  },
  {
    id: 'it', name: 'Italian', native: 'Italiano', family: 'indo-european', cluster: 'romance', branch: 'Romance',
    speakers: 68, lexicon: { n: 260000, source: 'GRADIT (De Mauro)' },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Fusional', tone: false },
    features: ['blue_split', 'strong_ftr', 'gendered_nouns', 'tv_distinction', 'pro_drop', 'motion_verb_framed'],
    concepts: [
      { term: 'sprezzatura', gloss: 'Studied effortlessness that hides the art', category: 'creativity', ref: 'Castiglione (1528). Il Cortegiano.' },
    ],
  },
  // ── Hellenic ──
  {
    id: 'el', name: 'Greek', native: 'Ελληνικά', family: 'indo-european', cluster: 'hellenic', branch: 'Hellenic',
    speakers: 13.5, lexicon: { n: 150000, source: 'Babiniotis, Λεξικό της Νέας Ελληνικής Γλώσσας', verify: true },
    typology: { order: 'SVO (free)', script: 'Greek', morphology: 'Fusional', tone: false },
    features: ['blue_split', 'duration_volume', 'strong_ftr', 'gendered_nouns', 'tv_distinction', 'pro_drop', 'motion_verb_framed'],
    concepts: [
      { term: 'φιλότιμο (philotimo)', gloss: 'Love of honour: duty and generosity towards the group', category: 'social', ref: 'Triandis (1972). The Analysis of Subjective Culture.' },
      { term: 'μεράκι (meraki)', gloss: 'Putting your soul into what you make', category: 'creativity' },
    ],
  },
  // ── Slavic ──
  {
    id: 'ru', name: 'Russian', native: 'Русский', family: 'indo-european', cluster: 'slavic', branch: 'Slavic',
    speakers: 255, lexicon: { n: 120480, source: 'Большой академический словарь (17 vols, 1950–65)' },
    typology: { order: 'SVO (free)', script: 'Cyrillic', morphology: 'Fusional', tone: false },
    features: ['blue_split', 'strong_ftr', 'process_aspect', 'gendered_nouns', 'tv_distinction', 'motion_satellite'],
    concepts: [
      { term: 'тоска (toska)', gloss: 'Spiritual anguish without a specific cause', category: 'emotion', ref: 'Nabokov, commentary on Eugene Onegin.' },
      { term: 'авось (avos\')', gloss: 'Trusting to luck rather than planning', category: 'decision', ref: 'Wierzbicka (1992). Semantics, Culture, and Cognition.' },
    ],
  },
  // ── Indo-Aryan ──
  {
    id: 'hi', name: 'Hindi', native: 'हिन्दी', family: 'indo-european', cluster: 'indo-aryan', branch: 'Indo-Aryan',
    speakers: 610, lexicon: { n: 100000, source: 'Hindi Shabdasagar', verify: true },
    typology: { order: 'SOV', script: 'Devanagari', morphology: 'Fusional', tone: false },
    features: ['strong_ftr', 'gendered_nouns', 'tv_distinction', 'kinship_lexicon', 'pro_drop'],
    concepts: [
      { term: 'जुगाड़ (jugaad)', gloss: 'Frugal, improvised ingenuity', category: 'creativity', ref: 'Radjou, Prabhu & Ahuja (2012). Jugaad Innovation.' },
    ],
  },
  // ── Dravidian ──
  {
    id: 'ta', name: 'Tamil', native: 'தமிழ்', family: 'dravidian', cluster: 'dravidian', branch: 'South Dravidian',
    speakers: 87, lexicon: { n: 124000, source: 'Tamil Lexicon, University of Madras (1924–36)' },
    typology: { order: 'SOV', script: 'Tamil', morphology: 'Agglutinative', tone: false },
    features: ['strong_ftr', 'tv_distinction', 'kinship_lexicon', 'agglutination', 'pro_drop', 'diglossia'],
    concepts: [
      { term: 'முறை (murai)', gloss: 'Kin "proper relation" that decides who may marry whom', category: 'social', ref: 'Trautmann (1981). Dravidian Kinship.' },
    ],
  },
  // ── Afro-Asiatic ──
  {
    id: 'ar', name: 'Arabic', native: 'العربية', family: 'afro-asiatic', cluster: 'afro-asiatic', branch: 'Semitic',
    speakers: 274, lexicon: { n: 80000, source: 'Lisān al-ʿArab (~80k entries). The "12 million words" claim is a myth' },
    typology: { order: 'VSO/SVO', script: 'Arabic (RTL)', morphology: 'Root-and-pattern', tone: false },
    features: ['rtl_timeline', 'strong_ftr', 'process_aspect', 'numeral_inversion', 'gendered_nouns', 'gendered_you', 'pro_drop', 'motion_verb_framed', 'diglossia'],
    concepts: [
      { term: 'طرب (ṭarab)', gloss: 'Ecstatic transport through music', category: 'creativity', ref: 'Racy (2003). Making Music in the Arab World.' },
      { term: 'إن شاء الله (in shāʾ Allāh)', gloss: 'The future framed as contingent', category: 'time' },
    ],
  },
  {
    id: 'he', name: 'Hebrew', native: 'עברית', family: 'afro-asiatic', cluster: 'afro-asiatic', branch: 'Semitic',
    speakers: 9, lexicon: { n: 70000, source: 'Even-Shoshan dictionary', verify: true },
    typology: { order: 'SVO', script: 'Hebrew (RTL)', morphology: 'Root-and-pattern', tone: false },
    features: ['rtl_timeline', 'strong_ftr', 'gendered_nouns', 'gendered_you', 'pro_drop', 'motion_verb_framed'],
    concepts: [
      { term: 'פרגון (firgun)', gloss: 'Wholehearted joy at another\'s success', category: 'emotion', ref: 'Katriel (1993). Lefargen: Israeli semantics of social relations. ROLSI 26(1).' },
      { term: 'חוצפה (chutzpah)', gloss: 'Audacity, both bold and brazen', category: 'self' },
    ],
  },
  // ── Turkic / Uralic ──
  {
    id: 'tr', name: 'Turkish', native: 'Türkçe', family: 'turkic', cluster: 'turkic', branch: 'Oghuz',
    speakers: 90, lexicon: { n: 100000, source: 'TDK Güncel Türkçe Sözlük', verify: true },
    typology: { order: 'SOV', script: 'Latin', morphology: 'Agglutinative', tone: false },
    features: ['evidentiality', 'strong_ftr', 'genderless_pronouns', 'pro_drop', 'tv_distinction', 'agglutination', 'motion_verb_framed'],
    concepts: [
      { term: 'hüzün', gloss: 'Shared, communal melancholy', category: 'emotion', ref: 'Pamuk (2005). Istanbul: Memories and the City.' },
      { term: 'keyif', gloss: 'Savoured, unhurried pleasure', category: 'emotion' },
    ],
  },
  {
    id: 'fi', name: 'Finnish', native: 'Suomi', family: 'uralic', cluster: 'uralic', branch: 'Finnic',
    speakers: 5.8, lexicon: { n: 100000, source: 'Kielitoimiston sanakirja (word forms are effectively unbounded)' },
    typology: { order: 'SVO (free)', script: 'Latin', morphology: 'Agglutinative', tone: false },
    features: ['weak_ftr', 'genderless_pronouns', 'agglutination', 'productive_compounding', 'pro_drop'],
    concepts: [
      { term: 'sisu', gloss: 'Stoic determination against the odds', category: 'self', ref: 'Lahti (2019). Embodied fortitude. Intl. J. Wellbeing 9(1).' },
    ],
  },
  // ── Niger–Congo ──
  {
    id: 'sw', name: 'Swahili', native: 'Kiswahili', family: 'niger-congo', cluster: 'niger-congo', branch: 'Bantu',
    speakers: 72, lexicon: { n: 50000, source: 'Kamusi ya Kiswahili Sanifu (TUKI)', verify: true },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Agglutinative', tone: false },
    features: ['strong_ftr', 'genderless_pronouns', 'noun_classes', 'agglutination', 'pro_drop'],
    concepts: [
      { term: 'ujamaa', gloss: 'Familyhood: community as extended family', category: 'social', ref: 'Nyerere (1962). Ujamaa: The Basis of African Socialism.' },
      { term: 'pole pole', gloss: '"Slowly, slowly": unhurried time', category: 'time' },
    ],
  },
  {
    id: 'yo', name: 'Yoruba', native: 'Èdè Yorùbá', family: 'niger-congo', cluster: 'niger-congo', branch: 'Volta–Niger',
    speakers: 46, lexicon: { n: 40000, source: 'rough estimate from bilingual dictionaries', verify: true },
    typology: { order: 'SVO', script: 'Latin', morphology: 'Isolating', tone: true },
    features: ['tonal', 'genderless_pronouns', 'numeral_subtractive'],
    concepts: [
      { term: 'àṣẹ', gloss: 'The power to make things happen', category: 'creativity', ref: 'Abiodun (2014). Yoruba Art and Language. CUP.' },
    ],
  },
  // ── Sino-Tibetan ──
  {
    id: 'zh', name: 'Mandarin', native: '普通话 · 汉语', family: 'sino-tibetan', cluster: 'sino-tibetan', branch: 'Sinitic',
    speakers: 1138, lexicon: { n: 370000, source: '汉语大词典 Hanyu Da Cidian' },
    typology: { order: 'SVO', script: 'Hanzi (logographic)', morphology: 'Isolating', tone: true },
    features: ['vertical_time', 'weak_ftr', 'tonal', 'transparent_numerals', 'short_digits', 'logographic', 'pro_drop', 'kinship_lexicon', 'genderless_pronouns', 'motion_satellite', 'productive_compounding'],
    concepts: [
      { term: '面子 (miànzi)', gloss: 'Face: social standing earned and given', category: 'social', ref: 'Hu (1944). The Chinese concepts of "face". American Anthropologist 46.' },
      { term: '缘分 (yuánfèn)', gloss: 'Fated affinity between people', category: 'emotion' },
    ],
  },
  {
    id: 'yue', name: 'Cantonese', native: '粵語 · 廣東話', family: 'sino-tibetan', cluster: 'sino-tibetan', branch: 'Sinitic',
    speakers: 86, lexicon: { n: 60000, source: 'words.hk Cantonese dictionary (shares the written Chinese lexicon)', verify: true },
    typology: { order: 'SVO', script: 'Hanzi (traditional)', morphology: 'Isolating', tone: true },
    features: ['vertical_time', 'weak_ftr', 'tonal', 'transparent_numerals', 'short_digits', 'logographic', 'pro_drop', 'kinship_lexicon', 'genderless_pronouns'],
    concepts: [
      { term: '人情 (jan4 cing4)', gloss: 'Reciprocal obligation of favours', category: 'social', ref: 'Hwang (1987). Face and favor. American J. Sociology 92(4).' },
    ],
  },
  // ── Koreanic / Japonic ──
  {
    id: 'ko', name: 'Korean', native: '한국어', family: 'koreanic', cluster: 'koreanic', branch: 'Koreanic',
    speakers: 82, lexicon: { n: 420000, source: '표준국어대사전 (Standard Korean Language Dictionary)', verify: true },
    typology: { order: 'SOV', script: 'Hangul', morphology: 'Agglutinative', tone: false },
    features: ['strong_ftr', 'honorific_grammar', 'evidentiality', 'pro_drop', 'transparent_numerals', 'short_digits', 'kinship_lexicon', 'agglutination', 'motion_verb_framed'],
    concepts: [
      { term: '정 (jeong)', gloss: 'Deep, sticky affection built over time', category: 'emotion' },
      { term: '한 (han)', gloss: 'Collective grief and unresolved resentment', category: 'emotion' },
      { term: '눈치 (nunchi)', gloss: 'Quickly reading the mood and others\' wishes', category: 'social' },
    ],
  },
  {
    id: 'ja', name: 'Japanese', native: '日本語', family: 'japonic', cluster: 'japonic', branch: 'Japonic',
    speakers: 123, lexicon: { n: 500000, source: '日本国語大辞典, 2nd ed.' },
    typology: { order: 'SOV', script: 'Kanji + kana', morphology: 'Agglutinative', tone: false },
    features: ['weak_ftr', 'honorific_grammar', 'pro_drop', 'speaker_gender_marking', 'motion_verb_framed', 'logographic', 'transparent_numerals', 'short_digits', 'agglutination', 'productive_compounding'],
    concepts: [
      { term: '甘え (amae)', gloss: 'Presuming on another\'s indulgent love', category: 'emotion', ref: 'Doi (1971). The Anatomy of Dependence.' },
      { term: '空気を読む', gloss: '"Reading the air": sensing unspoken expectations', category: 'social', ref: 'Ide (1989). Multilingua 8.' },
      { term: 'もののあはれ', gloss: 'Poignant awareness of impermanence', category: 'creativity' },
    ],
    nonagentive: true,
  },
  // ── Kra–Dai / Austroasiatic / Austronesian ──
  {
    id: 'th', name: 'Thai', native: 'ภาษาไทย', family: 'kra-dai', cluster: 'kra-dai', branch: 'Tai',
    speakers: 61, lexicon: { n: 40000, source: 'Royal Institute Dictionary', verify: true },
    typology: { order: 'SVO', script: 'Thai', morphology: 'Isolating', tone: true },
    features: ['tonal', 'transparent_numerals', 'honorific_grammar', 'pro_drop', 'speaker_gender_marking'],
    concepts: [
      { term: 'เกรงใจ (kreng jai)', gloss: 'Reluctance to impose on others', category: 'social', ref: 'Komin (1990). Psychology of the Thai People.' },
      { term: 'ใจเย็น (jai yen)', gloss: '"Cool heart": calm emotional restraint', category: 'emotion', ref: 'Komin (1990).' },
    ],
  },
  {
    id: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', family: 'austroasiatic', cluster: 'austroasiatic', branch: 'Vietic',
    speakers: 86, lexicon: { n: 40000, source: 'Từ điển tiếng Việt (Hoàng Phê)', verify: true },
    typology: { order: 'SVO', script: 'Latin (Quốc ngữ)', morphology: 'Isolating', tone: true },
    features: ['tonal', 'weak_ftr', 'transparent_numerals', 'kinship_lexicon', 'pro_drop'],
    concepts: [
      { term: 'anh / chị / em', gloss: 'Kin terms used as "I/you", so every sentence places you in a family', category: 'self', ref: 'Luong (1990).' },
    ],
  },
  {
    id: 'jhi', name: 'Jahai', native: 'Jahai', family: 'austroasiatic', cluster: 'austroasiatic', branch: 'Aslian',
    speakers: 0.0011, lexicon: { n: 3000, source: 'documented lexicon (fieldwork)', verify: true },
    typology: { order: 'SVO', script: 'none (oral)', morphology: 'Mixed', tone: false },
    region: 'Peninsular Malaysia (Perak, Kelantan) & southern Thailand',
    features: ['odor_lexicon'],
    concepts: [],
  },
  {
    id: 'ms', name: 'Malay', native: 'Bahasa Melayu', family: 'austronesian', cluster: 'austronesian', branch: 'Malayic',
    speakers: 290, lexicon: { n: 82000, source: 'Kamus Dewan, 4th ed. (Indonesian KBBI is larger)', verify: true },
    typology: { order: 'SVO', script: 'Latin (Rumi) / Jawi', morphology: 'Agglutinative-lite', tone: false },
    features: ['weak_ftr', 'transparent_numerals', 'genderless_pronouns', 'pro_drop', 'tv_distinction', 'kinship_lexicon'],
    concepts: [
      { term: 'malu', gloss: 'Shame and propriety as social virtues', category: 'emotion', ref: 'Goddard (1996). The "social emotions" of Malay. Ethos 24(3).' },
      { term: 'budi', gloss: 'Moral reciprocity; "hutang budi" is a debt of kindness', category: 'social', ref: 'Lim Kim Hui (2003). Budi as the Malay Mind.' },
      { term: 'rindu', gloss: 'Longing for someone absent', category: 'emotion' },
    ],
  },
  // ── Pama–Nyungan ──
  {
    id: 'gvn', name: 'Guugu Yimithirr', native: 'Guugu Yimithirr', family: 'pama-nyungan', cluster: 'pama-nyungan', branch: 'Pama–Nyungan',
    speakers: 0.0002, lexicon: { n: 2500, source: 'Haviland (fieldwork lexicon)', verify: true },
    typology: { order: 'Free', script: 'none (oral)', morphology: 'Agglutinative', tone: false },
    region: 'Hope Vale, Queensland, Australia',
    features: ['absolute_frame'],
    concepts: [
      { term: 'Brother-in-law language', gloss: 'A special avoidance vocabulary for taboo in-laws', category: 'social', ref: 'Haviland (1979). Language in Society 8.' },
    ],
  },
  {
    id: 'kuuk', name: 'Kuuk Thaayorre', native: 'Kuuk Thaayorre', family: 'pama-nyungan', cluster: 'pama-nyungan', branch: 'Pama–Nyungan',
    speakers: 0.0002, lexicon: { n: 2000, source: 'Gaby (2017) grammar & lexicon', verify: true },
    typology: { order: 'Free', script: 'none (oral)', morphology: 'Agglutinative', tone: false },
    region: 'Pormpuraaw, Cape York, Australia',
    features: ['absolute_frame', 'absolute_time'],
    concepts: [],
  },
  // ── Mura ──
  {
    id: 'myp', name: 'Pirahã', native: 'Xapaitíiso', family: 'mura', cluster: 'mura', branch: 'Mura',
    speakers: 0.0004, lexicon: { n: 2000, source: 'Everett (fieldwork)', verify: true },
    typology: { order: 'SOV', script: 'none (oral)', morphology: 'Agglutinative', tone: true },
    region: 'Maici River, Amazonas, Brazil',
    features: ['anumeric', 'immediacy', 'tonal'],
    concepts: [],
  },
];

// Accident-description pattern (Fausey & Boroditsky) is a contrast between
// languages, so it's attached here rather than as a standalone feature.
export const AGENCY = {
  agentive: {
    title: 'Agentive accident descriptions', category: 'decision', evidence: 'moderate',
    claim: 'Speakers remember who caused an accident better and assign more blame and financial liability ("she broke the vase").',
    mechanism: 'Transitive agentive frames are the default even for unintended events.',
    refs: [
      'Fausey & Boroditsky (2010). Subtle linguistic cues influence perceived blame and financial liability. Psychonomic Bull. & Review 17.',
      'Fausey & Boroditsky (2011). Who dunnit? Cross-linguistic differences in eye-witness memory. Psychonomic Bull. & Review 18.',
    ],
    study: 'Show videos of intentional and accidental events, then test memory for the agent and blame ratings.',
  },
  nonagentive: {
    title: 'Non-agentive accidents ("se rompió")', category: 'decision', evidence: 'moderate',
    claim: 'Speakers remember the agents of accidents less well than English speakers (memory for intentional events is equal), and may blame less.',
    mechanism: '"It broke itself" or intransitive frames are preferred for accidents.',
    refs: [
      'Fausey & Boroditsky (2011). Psychonomic Bull. & Review 18 (Spanish).',
      'Fausey et al. (2010). Constructing agency: the role of language. Frontiers in Psychology 1 (Japanese).',
    ],
    study: 'As for agentive descriptions; compare accidental and intentional events separately.',
  },
};
