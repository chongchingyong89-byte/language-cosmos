// Linguistic features → claimed effects on thought, attitude and behaviour.
// Each feature becomes a leaf on every language core that carries it.
//
//   category  : branch it grows on (see taxonomy.CATEGORIES)
//   evidence  : strength of the evidence (see taxonomy.EVIDENCE). Be strict.
//   claim     : the effect on people, in one or two sentences
//   mechanism : why the language might cause it
//   refs      : key sources, including the critical ones
//   study     : a concrete way to test it yourself
//   ex        : optional per-language examples { langId: 'example' }

export const FEATURES = {
  // ── Perception ────────────────────────────────────────────────────────────
  blue_split: {
    title: 'Two basic "blues"', category: 'perception', evidence: 'strong',
    claim: 'Speakers tell light and dark blue apart faster when the two shades fall on different sides of their word boundary.',
    mechanism: 'An obligatory lexical boundary brings verbal categories into rapid perception. The advantage disappears when a verbal task is added at the same time, which shows the language is doing the work.',
    refs: [
      'Winawer et al. (2007). Russian blues reveal effects of language on color discrimination. PNAS 104(19).',
      'Thierry et al. (2009). Unconscious effects of language-specific terminology on preattentive color perception. PNAS 106(11).',
      'Paggetti, Menegaz & Paramei (2016). Color naming in Italian language. Color Research & Application.',
    ],
    study: 'Run speeded same/different blue discrimination, with and without a concurrent verbal-interference task.',
    ex: { ru: 'голубой (goluboy) / синий (siniy)', el: 'γαλάζιο (ghalazio) / μπλε (ble)', it: 'azzurro / blu' },
  },
  absolute_frame: {
    title: 'Cardinal-direction space (no "left/right")', category: 'perception', evidence: 'strong',
    claim: 'Speakers keep track of north, south, east and west at all times, even indoors and in unfamiliar places. They remember object layouts in world coordinates, not body coordinates.',
    mechanism: 'Ordinary speech requires cardinal terms ("the cup north of the plate"), so constant dead-reckoning becomes a habit.',
    refs: [
      'Levinson (2003). Space in Language and Cognition. CUP.',
      'Haviland (1998). Guugu Yimithirr cardinal directions. Ethos 26(1).',
      'Majid et al. (2004). Can language restructure cognition? The case for space. TiCS 8(3).',
      'Critique: Li & Gleitman (2002). Turning the tables. Cognition 83.',
    ],
    study: 'Use the rotation ("animals in a row") task: memorise a layout, turn 180°, then rebuild it.',
    ex: { gvn: 'gungga (north), jiba (south)', kuuk: 'Thaayorre speakers greet with "Where are you going?"; the answer uses cardinal directions' },
  },
  odor_lexicon: {
    title: 'Abstract smell vocabulary', category: 'perception', evidence: 'strong',
    claim: 'Speakers name odours as easily and consistently as colours. English speakers struggle and fall back on source words ("smells like banana").',
    mechanism: 'Dedicated abstract smell terms (like "red" for colour) give odours stable, shareable categories.',
    refs: [
      'Majid & Burenhult (2014). Odors are expressible in language, as long as you speak the right language. Cognition 130(2).',
    ],
    study: 'Do a Sniffin\'-Sticks naming task and compare naming agreement for odours and colours.',
    ex: { jhi: 'ltpɨt: fragrant smell of flowers and binturong; cŋɛs: stinging smell of petrol and bat droppings' },
  },
  tonal: {
    title: 'Lexical tone', category: 'perception', evidence: 'moderate',
    claim: 'Absolute pitch is more common among musicians who speak a tone language, and pitch discrimination is finer.',
    mechanism: 'Pitch carries word meaning from infancy, which trains early pitch encoding.',
    refs: [
      'Deutsch et al. (2006). Absolute pitch among American and Chinese conservatory students. JASA 119(2).',
      'Bidelman, Hutka & Moreno (2013). Tone language speakers and musicians share enhanced perceptual and cognitive abilities for musical pitch. PLoS ONE.',
    ],
    study: 'Compare pitch-discrimination thresholds of tone-language and non-tone-language speakers, matched on musical training.',
    ex: { zh: '4 tones: mā 妈 / má 麻 / mǎ 马 / mà 骂', yue: '6 tones (9 by traditional count)', th: '5 tones', vi: '6 tones', yo: '3 level tones' },
  },

  // ── Time & Future ─────────────────────────────────────────────────────────
  rtl_timeline: {
    title: 'Right-to-left script', category: 'time', evidence: 'strong',
    claim: 'The mental timeline runs right to left: earlier events are placed on the right.',
    mechanism: 'Driven by reading and writing direction rather than grammar. Habitual scanning direction maps onto time.',
    refs: [
      'Tversky, Kugelmass & Winter (1991). Cross-cultural and developmental trends in graphic productions. Cognitive Psychology 23.',
      'Fuhrman & Boroditsky (2010). Cross-cultural differences in mental representations of time. Cognitive Science 34.',
    ],
    study: 'Card-sequencing task: ask participants to lay out photos of an ageing face in order.',
  },
  vertical_time: {
    title: 'Vertical time metaphors', category: 'time', evidence: 'contested',
    claim: 'Speakers may picture time vertically (earlier = up) more readily than English speakers.',
    mechanism: '上个月 "up month" = last month; 下个月 "down month" = next month.',
    refs: [
      'Boroditsky (2001). Does language shape thought? Cognitive Psychology 43.',
      'Failed replications: Chen (2007), Cognition 104; January & Kako (2007), Cognition 104.',
      'Partial support: Fuhrman et al. (2011). English and Mandarin time in 3D. Cognitive Science 35.',
    ],
    study: 'Run implicit space–time congruency tasks with vertical and horizontal response keys.',
    ex: { zh: '上个月 / 下个月', yue: '上個月 / 下個月' },
  },
  weak_ftr: {
    title: 'No obligatory future tense (weak FTR)', category: 'time', evidence: 'contested',
    claim: 'Where the grammar does not separate the future from the present, speakers may save more, smoke less and plan more for retirement, because the future feels closer.',
    mechanism: '"It rains tomorrow" (German "morgen regnet es") grammatically fuses the future with the present.',
    refs: [
      'Chen (2013). The effect of language on economic behavior. American Economic Review 103(2).',
      'Weakened under phylogenetic control: Roberts, Winters & Chen (2015). PLoS ONE.',
      'Support: Sutter et al. (2018). Language group differences in time preferences. European Economic Review.',
    ],
    study: 'Run delay-discounting choices with bilinguals tested in each language, counterbalanced.',
    ex: { de: 'Morgen regnet es.', zh: '明天下雨。', fi: 'Huomenna sataa.', ms: 'Esok hujan.' },
  },
  strong_ftr: {
    title: 'Obligatory future marking (strong FTR)', category: 'time', evidence: 'contested',
    claim: 'The flip side of weak FTR: the grammar marks the future off from the present, which may make it feel more distant and lower savings behaviour.',
    mechanism: 'Mandatory "will / -rá / -acak" marks the future as a separate time region.',
    refs: [
      'Chen (2013). American Economic Review 103(2).',
      'Roberts, Winters & Chen (2015). PLoS ONE.',
    ],
    study: 'Collect savings intentions and temporal-distance ratings across matched strong- and weak-FTR groups.',
    ex: { en: 'It will rain tomorrow.', es: 'Mañana lloverá.', tr: 'Yarın yağmur yağacak.' },
  },
  duration_volume: {
    title: 'Time as quantity ("mucho tiempo")', category: 'time', evidence: 'moderate',
    claim: 'Duration judgements are swayed by how full a container is, not by line length.',
    mechanism: 'Duration is talked about as an amount ("much time", "a big time"), not a distance.',
    refs: [
      'Casasanto (2008). Who\'s afraid of the big bad Whorf? Language Learning 58.',
      'Bylund & Athanasopoulos (2017). The Whorfian time warp. J. Exp. Psych.: General 146(7).',
    ],
    study: 'Show a growing line or a filling container and ask for duration reproduction; measure spatial interference.',
    ex: { es: 'mucho tiempo ("much time")', el: 'πολύς χρόνος ("much time")' },
  },
  duration_length: {
    title: 'Time as distance ("a long time")', category: 'time', evidence: 'moderate',
    claim: 'Duration judgements are swayed by spatial length: longer lines feel like they lasted longer.',
    mechanism: 'Duration is talked about as length ("long", "short").',
    refs: [
      'Casasanto (2008). Language Learning 58.',
      'Bylund & Athanasopoulos (2017). J. Exp. Psych.: General 146(7).',
    ],
    study: 'Use the same paradigm as duration_volume and compare the two groups.',
  },
  absolute_time: {
    title: 'Time flows east → west', category: 'time', evidence: 'moderate',
    claim: 'Speakers lay out temporal sequences from east to west, whichever way they are facing.',
    mechanism: 'Absolute spatial frame (see Cardinal space) extended to time, following the sun\'s path.',
    refs: ['Boroditsky & Gaby (2010). Remembrances of times East. Psychological Science 21(11).'],
    study: 'Card-sequencing task with participants facing different compass directions.',
  },
  immediacy: {
    title: 'Immediacy of experience', category: 'time', evidence: 'contested',
    claim: 'It has been proposed that the culture restricts talk to directly experienced, present events, which would leave little abstract past or future talk.',
    mechanism: 'A proposed cultural constraint on grammar (no recursion, no numbers, few colour terms).',
    refs: [
      'Everett (2005). Cultural constraints on grammar and cognition in Pirahã. Current Anthropology 46(4).',
      'Rebuttal: Nevins, Pesetsky & Rodrigues (2009). Pirahã exceptionality: A reassessment. Language 85(2).',
    ],
    study: 'This needs fieldwork data. Treat it as a cautionary tale about strong claims made from a single source.',
  },

  // ── Cognition & Number ────────────────────────────────────────────────────
  transparent_numerals: {
    title: 'Transparent base-10 numerals', category: 'cognition', evidence: 'moderate',
    claim: 'Children learn to count past ten earlier and grasp place value sooner.',
    mechanism: '11 = "ten-one", 20 = "two-ten": the base-10 structure is spelled out in the words.',
    refs: [
      'Miller & Stigler (1987). Counting in Chinese. Cognitive Development 2.',
      'Miura et al. (1988). Effects of language characteristics on children\'s cognitive representation of number. Child Development 59.',
      'Miller et al. (1995). Preschool origins of cross-national differences in mathematical competence. Psychological Science 6.',
    ],
    study: 'Give preschoolers in each language a counting-range and base-10 block task. Control for schooling.',
    ex: { zh: '十一 shí-yī (ten-one)', ja: 'じゅういち jū-ichi', ko: '십일 sip-il', ms: 'dua puluh (two tens)', vi: 'mười một', th: 'สิบเอ็ด sip-et' },
  },
  short_digits: {
    title: 'Short digit words → larger digit span', category: 'cognition', evidence: 'moderate',
    claim: 'People can hold more digits in short-term memory when digit names are quick to say.',
    mechanism: 'The phonological loop holds about 2 seconds of speech, and shorter words fit more items.',
    refs: [
      'Ellis & Hennelly (1980). A bilingual word-length effect (Welsh vs English). British J. Psychology 71.',
      'Stigler, Lee & Stevenson (1986). Digit memory in Chinese and English. Cognition 23.',
    ],
    study: 'Measure forward digit span and articulation rate in both languages of each bilingual.',
  },
  numeral_inversion: {
    title: 'Inverted or irregular numerals', category: 'cognition', evidence: 'moderate',
    claim: 'Children make more transcoding errors (writing 42 for "four-and-twenty") and need more working memory.',
    mechanism: 'Units are spoken before tens (or counted in twenties), which clashes with the written digit order.',
    refs: [
      'Zuber et al. (2009). Transcoding in a language with inversion. J. Exp. Child Psychology 102.',
      'Seron & Fayol (1994). Number transcoding in children (French vs Belgian French). British J. Dev. Psychology 12.',
    ],
    study: 'Dictate two-digit numbers and count inversion errors.',
    ex: { de: 'vierundzwanzig = "four-and-twenty"', ar: 'أربعة وعشرون "four and twenty"', fr: 'quatre-vingt-dix = "four-twenty-ten" (90)' },
  },
  numeral_subtractive: {
    title: 'Subtractive base-20 numerals', category: 'cognition', evidence: 'speculative',
    claim: 'Counting by twenties and subtracting (15 = 20 − 5) may train mental arithmetic, or slow it.',
    mechanism: 'Number words contain arithmetic operations.',
    refs: ['Ekundayo (1977). Vigesimal numeral derivational morphology: Yoruba. Anthropological Linguistics 19(9).'],
    study: 'Not studied yet: compare arithmetic strategies of Yoruba–English bilingual children in each language.',
    ex: { yo: 'ẹ̀ẹ́dógún = 15 ("five less than twenty")' },
  },
  anumeric: {
    title: 'No exact number words', category: 'cognition', evidence: 'strong',
    claim: 'Without words for exact numbers, people can estimate quantities but cannot match exact quantities above about 3.',
    mechanism: 'Number words act as a cognitive technology for tracking exact quantity.',
    refs: [
      'Gordon (2004). Numerical cognition without words: Evidence from Amazonia. Science 306.',
      'Frank et al. (2008). Number as a cognitive technology. Cognition 108.',
      'Pica et al. (2004). Exact and approximate arithmetic in an Amazonian indigene group (Mundurukú). Science 306.',
    ],
    study: 'One-to-one matching tasks with and without memory demands.',
  },
  logographic: {
    title: 'Logographic script (汉字 / 漢字)', category: 'cognition', evidence: 'moderate',
    claim: 'Reading recruits extra visuospatial and left middle-frontal brain regions. Whether this transfers to general visuospatial skill is still open.',
    mechanism: 'Characters map onto meaning and syllables as visual wholes, not letter by letter.',
    refs: [
      'Tan et al. (2005). Neuroanatomical correlates of phonological processing of Chinese characters and alphabetic words. Human Brain Mapping 25.',
      'Siok et al. (2004). Biological abnormality of impaired reading is constrained by culture. Nature 431.',
    ],
    study: 'Compare mental rotation and visual memory in readers of logographic and alphabetic scripts, matched on education.',
  },
  endpoint_aspect: {
    title: 'No progressive aspect → endpoint focus', category: 'cognition', evidence: 'moderate',
    claim: 'Speakers attend to the goals and endpoints of events ("a man walks to a car") and judge them more holistically.',
    mechanism: 'No grammatical "-ing" to frame events as ongoing processes.',
    refs: [
      'von Stutterheim et al. (2012). How grammaticized concepts shape event conceptualization. Linguistics 50(4).',
      'Flecken et al. (2015). On the road to somewhere: Brain potentials reflect language effects on motion event perception. Cognition 141.',
      'Athanasopoulos et al. (2015). Two languages, two minds. Psychological Science 26(4).',
    ],
    study: 'Video triads (goal-oriented vs ambiguous motion) and similarity judgements.',
  },
  process_aspect: {
    title: 'Progressive/imperfective → process focus', category: 'cognition', evidence: 'moderate',
    claim: 'Speakers describe and attend to the ongoing phase of events and mention endpoints less often.',
    mechanism: 'Grammatical aspect ("is walking") foregrounds the process.',
    refs: [
      'von Stutterheim et al. (2012). Linguistics 50(4).',
      'Athanasopoulos & Bylund (2013). Does grammatical aspect affect motion event cognition? Cognitive Science 37.',
    ],
    study: 'Eye-tracking: measure how early and how long people look at event endpoints.',
  },
  agglutination: {
    title: 'Agglutinative morphology', category: 'cognition', evidence: 'speculative',
    claim: 'A single word can carry a whole proposition, so "number of words" stops meaning much. Any effect on thinking is unknown.',
    mechanism: 'Long chains of suffixes (Finnish talo-i-ssa-ni-kin = "also in my houses").',
    refs: ['Haspelmath & Sims (2010). Understanding Morphology. Routledge.'],
    study: 'Explore whether morphological complexity predicts analytic segmentation strategies.',
    ex: { fi: 'talo-i-ssa-ni-kin', tr: 'Avrupa-lı-laş-tır-a-ma-dık-lar-ımız-dan-mış-sınız', ko: '먹-으시-었-겠-습니다', sw: 'ha-tu-ta-ku-penda' },
  },

  // ── Social order & conservatism ───────────────────────────────────────────
  honorific_grammar: {
    title: 'Grammaticalised honorifics / speech levels', category: 'social', evidence: 'correlational',
    claim: 'Every sentence encodes the relative status of speaker and listener, which keeps attention on hierarchy and relational context. This goes with norms that respect hierarchy.',
    mechanism: 'Verb endings, pronouns and vocabulary must be chosen according to social rank. "Discernment" (wakimae) becomes automatic.',
    refs: [
      'Brown & Levinson (1987). Politeness: Some Universals in Language Usage. CUP.',
      'Ide (1989). Formal forms and discernment. Multilingua 8.',
      'Strauss & Eun (2005). Indexicality and honorific speech level choice in Korean. Linguistics 43(3).',
    ],
    study: 'Prime with honorific or plain register, then measure deference, conformity (Asch-type) or system-justification scores.',
    ex: { ja: '食べる → 召し上がる (honorific "eat")', ko: '7 speech levels: 해라체 … 하십시오체', th: 'ราชาศัพท์ royal register; particles ครับ/ค่ะ' },
  },
  tv_distinction: {
    title: 'Formal vs familiar "you" (T–V)', category: 'social', evidence: 'speculative',
    claim: 'Speakers must decide on intimacy and status for every addressee. This may sharpen sensitivity to social distance.',
    mechanism: 'Two or more second-person pronouns, chosen by power and solidarity.',
    refs: ['Brown & Gilman (1960). The pronouns of power and solidarity. In Style in Language.'],
    study: 'Survey when people switch from V to T and relate the switch point to collectivism and power-distance scores.',
    ex: { fr: 'tu / vous', de: 'du / Sie', es: 'tú / usted', ru: 'ты / вы', hi: 'तू / तुम / आप', ms: 'engkau / kamu / anda', tr: 'sen / siz', ta: 'நீ / நீங்கள்' },
  },
  kinship_lexicon: {
    title: 'Fine-grained kinship terms', category: 'social', evidence: 'speculative',
    claim: 'When kin terms encode lineage side, relative age and seniority, people may track family structure more closely and lean towards a relational, filial orientation.',
    mechanism: '"Uncle" splits into father\'s elder brother, father\'s younger brother, mother\'s brother, and so on. In some languages kin terms also replace "I/you".',
    refs: [
      'Kemp & Regier (2012). Kinship categories across languages reflect general communicative principles. Science 336.',
      'Luong (1990). Discursive Practices and Linguistic Meanings: The Vietnamese System of Person Reference.',
      'Trautmann (1981). Dravidian Kinship. CUP.',
    ],
    study: 'Test recall of family-tree details, and measure filial-piety scale scores against kin-term granularity.',
    ex: { zh: '伯伯 / 叔叔 / 舅舅 / 姑丈 / 姨丈', yue: '阿伯 / 阿叔 / 舅父', vi: 'anh / chị / em / cô / chú used as "I/you"', ms: 'abang / kakak / adik', ko: '형 / 오빠 / 누나 / 언니', ta: 'cross-cousin terms (murai)', hi: 'चाचा / ताऊ / मामा' },
  },
  gendered_nouns: {
    title: 'Grammatical gender on nouns', category: 'social', evidence: 'contested',
    claim: 'An early report said grammatical gender colours how objects are described (German die Brücke → "elegant"). Large replications find small or unreliable effects. Separately, countries with gendered languages show lower gender equality, but that link is only correlational.',
    mechanism: 'Every noun carries masculine or feminine agreement.',
    refs: [
      'Boroditsky, Schmidt & Phillips (2003). Sex, syntax and semantics. In Language in Mind.',
      'Failed replication: Mickan, Schiefke & Stefanowitsch (2014). Key is a llave is a Schlüssel.',
      'Review: Samuel, Cole & Eacott (2019). Grammatical gender and linguistic relativity. Psychonomic Bull. & Review 26.',
      'Prewitt-Freilino, Caswell & Laakso (2012). The gendering of language. Sex Roles 66.',
    ],
    study: 'Use a pre-registered adjective-generation task with English-language instructions and blind coding.',
    ex: { de: 'der Schlüssel (m) / die Brücke (f)', es: 'la llave (f) / el puente (m)', fr: 'la lune / le soleil' },
  },
  gendered_you: {
    title: 'Gender on "you" and on verbs', category: 'self', evidence: 'contested',
    claim: 'Children may reach a stable gender identity earlier when even "you" and verbs mark gender. A single classic study found Hebrew > English > Finnish.',
    mechanism: 'Gender is marked in nearly every sentence addressed to the child.',
    refs: ['Guiora et al. (1982). Language environment and gender identity attainment. Language Learning 32(2).'],
    study: 'Replicate with modern gender-constancy measures and larger samples.',
    ex: { he: 'אתה אוכל (m) / את אוכלת (f), "you eat"', ar: 'أنتَ / أنتِ' },
  },
  genderless_pronouns: {
    title: 'No he/she distinction', category: 'social', evidence: 'correlational',
    claim: 'Expected to lower the salience of gender, but the evidence is mixed: countries with genderless languages are not reliably more gender-equal than English-type countries.',
    mechanism: 'One third-person pronoun for everyone.',
    refs: [
      'Prewitt-Freilino, Caswell & Laakso (2012). Sex Roles 66.',
      'Guiora et al. (1982). Language Learning 32(2) (Finnish children were later on gender identity).',
    ],
    study: 'Measure how often gender is encoded in retellings of gender-ambiguous stories.',
    ex: { fi: 'hän', tr: 'o', ms: 'dia', sw: 'yeye', yo: 'ó', zh: 'tā (spoken: 他/她 sound identical)', yue: '佢 keoi5' },
  },
  neutral_pronoun: {
    title: 'Added gender-neutral pronoun ("hen")', category: 'social', evidence: 'moderate',
    claim: 'Using a gender-neutral pronoun reduced the mental default to "male" and made attitudes towards women and LGBT people more favourable.',
    mechanism: 'A deliberately coined pronoun (2015 official) breaks the habit of masculine-by-default reference.',
    refs: ['Tavits & Pérez (2019). Language influences mass opinion toward gender and LGBT equality. PNAS 116(34).'],
    study: 'Randomise pronoun use in a writing prompt, then measure gender-default imagery.',
    ex: { sv: 'han / hon / hen' },
  },
  noun_classes: {
    title: 'Noun-class system (16+ classes)', category: 'social', evidence: 'speculative',
    claim: 'Every noun sits in a class (people, trees, abstract things…), which may shape how speakers categorise the world.',
    mechanism: 'Class prefixes agree throughout the sentence: m-tu (person) / wa-tu (people) / ki-tu (thing).',
    refs: ['Lakoff (1987). Women, Fire, and Dangerous Things (on classifier systems).'],
    study: 'Card-sorting task: do speakers group novel objects along noun-class lines?',
    ex: { sw: 'mtu / watu (people), kitu / vitu (things), mti / miti (trees)' },
  },
  diglossia: {
    title: 'Diglossia (formal vs spoken variety)', category: 'social', evidence: 'speculative',
    claim: 'Growing up switching between a "high" written variety and a "low" spoken one may build register awareness and code-switching control.',
    mechanism: 'Two distinct grammars are used in different social domains.',
    refs: ['Ferguson (1959). Diglossia. Word 15.'],
    study: 'Compare executive-function tasks across diglossic speakers, monolinguals and bilinguals.',
    ex: { ar: 'Fuṣḥā (MSA) vs. ʿāmmiyya dialects', ta: 'செந்தமிழ் (literary) vs. கொடுந்தமிழ் (colloquial)', xml: 'BIM (natural Deaf language) vs. KTBM (signed Malay used in schools)' },
  },

  // ── Sign languages (modality: hands, face, space) ─────────────────────────
  spatial_grammar: {
    title: 'Grammar in space', category: 'perception', evidence: 'moderate',
    claim: 'Native signers show better mental rotation and spatial imagery, the skills their grammar exercises all day.',
    mechanism: 'Pronouns, verb agreement and "classifier" constructions are places and movements in the signing space.',
    refs: [
      'Emmorey, Kosslyn & Bellugi (1993). Visual imagery and visual-spatial language. Cognition 46.',
      'Emmorey (2002). Language, Cognition, and the Brain: Insights from Sign Language Research.',
    ],
    study: 'Compare mental-rotation speed of deaf native signers, hearing native signers (CODAs) and non-signers. This separates the effect of language from the effect of deafness.',
  },
  facial_grammar: {
    title: 'Grammar on the face', category: 'emotion', evidence: 'moderate',
    claim: 'Facial expressions mark questions, conditionals and adverbs, so signers learn to tell grammatical faces from emotional ones and become sharper at local facial details.',
    mechanism: 'The same muscles carry both syntax and feeling, and children acquire grammatical faces between 3 and 6.',
    refs: [
      'McCullough & Emmorey (1997). Face processing by deaf ASL signers. J. Deaf Studies & Deaf Education 2(4).',
      'Reilly, McIntire & Bellugi (1990). The acquisition of conditionals in ASL: grammaticized facial expressions. Applied Psycholinguistics 11.',
    ],
    study: 'Measure emotion-recognition accuracy and speed in native signers and non-signers using faces that carry grammatical markers.',
  },
  iconicity: {
    title: 'Iconic signs', category: 'creativity', evidence: 'moderate',
    claim: 'Many signs look like what they mean, which speeds word recognition and early vocabulary learning. It may also make visual metaphor feel natural, though that part is speculative.',
    mechanism: 'Form and meaning overlap (e.g. TREE shows a trunk and branches).',
    refs: [
      'Thompson, Vinson & Vigliocco (2009). The link between form and meaning in ASL. J. Exp. Psych.: LMC 35(2).',
      'Thompson et al. (2012). The road to language learning is iconic. Psychological Science 23(12).',
    ],
    study: 'Give a divergent-thinking task and a visual-metaphor task to native signers and matched non-signers.',
  },
  late_access: {
    title: 'Risk of a late first language', category: 'self', evidence: 'strong',
    claim: 'About 90–95% of deaf children are born to hearing parents. Without early signing they may have no full first language for years, which delays theory of mind and in severe cases causes lifelong language deprivation.',
    mechanism: 'The sign language is a complete language; the harm comes from being exposed to it late. That makes it the clearest proof that the timing of a first language shapes social cognition and personality.',
    refs: [
      'Mitchell & Karchmer (2004). Chasing the mythical ten percent. Sign Language Studies 4(2).',
      'Schick et al. (2007). Child Development 78(2).',
      'Mayberry, Lock & Kazmi (2002). Nature 417.',
      'Hall (2017). What you don\'t know can hurt you: language deprivation. Maternal & Child Health Journal 21(5).',
    ],
    study: 'Compare deaf native signers (deaf parents) with late signers on empathy, perspective-taking and Big Five self-reports.',
  },

  // ── Self & identity ───────────────────────────────────────────────────────
  pro_drop: {
    title: 'Pronoun drop ("I" is optional)', category: 'self', evidence: 'correlational',
    claim: 'Cultures whose languages let speakers drop "I/you" tend to be more collectivist: the self is less foregrounded.',
    mechanism: 'The speaking subject need not be named, so context and relationship carry the reference.',
    refs: ['Kashima & Kashima (1998). Culture and language: the case of cultural dimensions and personal pronoun use. J. Cross-Cultural Psych. 29(3).'],
    study: 'Measure self-construal (Singelis scale) after writing a paragraph in a pro-drop or non-pro-drop language (bilinguals).',
    ex: { ja: '（私は）行きます', es: '(Yo) voy', zh: '（我）去', ms: '(Saya) pergi' },
  },

  speaker_gender_marking: {
    title: 'Speaker marks own gender (ครับ / ค่ะ)', category: 'self', evidence: 'speculative',
    claim: 'Polite speech requires speakers to signal their own gender, so gender identity is performed out loud and chosen in almost every sentence. This may make gender expression more visible and socially legible. There is no evidence that it changes how many people are transgender.',
    mechanism: 'Gendered sentence-final particles and first-person pronouns are chosen by the speaker. Trans women (kathoey / sao praphet song) commonly adopt feminine forms, so a linguistic slot already exists for the identity.',
    refs: [
      'Saisuwan (2016). Kathoey and the linguistic construction of gender identity in Thailand. In Language, Sexuality, and Power. OUP.',
      'Jackson (2000). An explosion of Thai identities. Culture, Health & Sexuality 2(4).',
      'Winter (2006). Thai transgenders in focus: demographics, transitions and identities. Intl. J. Transgenderism 9(1).',
    ],
    study: 'Separate visibility from prevalence: compare survey-based prevalence of gender diversity in Thailand with neighbours that have gender-marked speech (Japan) and without it (Malaysia, Vietnam). Control for religion, law and tourism.',
    ex: { th: 'ครับ khráp (masc.) / ค่ะ khâ (fem.); ผม phǒm / ดิฉัน dichǎn "I"', ja: '僕 boku / 俺 ore / あたし atashi; sentence-final わ wa' },
  },

  // ── Morality & decisions ──────────────────────────────────────────────────
  evidentiality: {
    title: 'Grammatical evidentiality ("-mış")', category: 'decision', evidence: 'contested',
    claim: 'Speakers must mark how they know something (seen, heard, inferred). This has been predicted to sharpen source monitoring and epistemic caution, but experiments mostly find no non-linguistic memory advantage.',
    mechanism: 'A direct-past form for witnessed events and an inferential/reportative form for hearsay are both obligatory.',
    refs: [
      'Aksu-Koç (1988). The Acquisition of Aspect and Modality: The Case of Past Reference in Turkish. CUP.',
      'Papafragou, Li, Choi & Han (2007). Evidentiality in language and cognition (Korean). Cognition 103.',
      'Ünal & Papafragou (2016). Interactions between language and mental representations. Language Learning 66(3).',
    ],
    study: 'Test source memory (saw / told / inferred) and belief-updating with misinformation, comparing evidential and non-evidential speakers.',
    ex: { tr: 'geldi "came (I saw)" / gelmiş "came (apparently)"', ko: '-더라 (-deo-ra, witnessed report)' },
  },

  // ── Creativity & expression ───────────────────────────────────────────────
  motion_satellite: {
    title: 'Manner-rich motion verbs', category: 'creativity', evidence: 'moderate',
    claim: 'Speakers habitually encode how something moves (stumble, dart, zoom), which makes narratives vivid in manner. Effects on non-verbal memory are weak.',
    mechanism: 'Satellite-framed: manner goes in the verb, path in a particle ("ran out").',
    refs: [
      'Talmy (1985). Lexicalization patterns. In Language Typology and Syntactic Description.',
      'Slobin (1996). From "thought and language" to "thinking for speaking".',
      'Null on non-verbal tasks: Papafragou, Massey & Gleitman (2002). Cognition 84.',
    ],
    study: 'Use "Frog, where are you?" picture-book narratives and count manner verbs per event.',
    ex: { en: 'He staggered out.', de: 'Er torkelte hinaus.', ru: 'Он выбежал.', zh: '他跑出去了。' },
  },
  motion_verb_framed: {
    title: 'Path-in-verb motion', category: 'creativity', evidence: 'moderate',
    claim: 'Narratives emphasise path and scene-setting and leave manner out. Translations of English novels drop about half of the manner detail.',
    mechanism: 'Verb-framed: path goes in the verb ("salió"), manner is optional ("corriendo").',
    refs: [
      'Talmy (1985).',
      'Slobin (1996). Two ways to travel. In Grammatical Constructions.',
    ],
    study: 'Compare manner density in original and translated narrative passages.',
    ex: { es: 'Salió (corriendo).', fr: 'Il est sorti (en courant).', ja: '走って出た', tr: '(Koşarak) çıktı.' },
  },
  productive_compounding: {
    title: 'Free compounding', category: 'creativity', evidence: 'speculative',
    claim: 'Speakers can coin precise new concepts on the spot. This may support conceptual combination and the naming of new experiences.',
    mechanism: 'Any noun can be joined to another into a new word that every speaker understands.',
    refs: ['Wisniewski (1997). When concepts combine. Psychonomic Bull. & Review 4.'],
    study: 'Give a novel-compound interpretation task and a divergent-thinking (AUT) test in each language.',
    ex: { de: 'Fingerspitzengefühl, Torschlusspanik', fi: 'kalsarikännit', zh: '电脑 "electric brain" = computer', ja: '積ん読 tsundoku' },
  },
};

// Bilingual studies where the SAME person shifts when switching language.
// These are drawn as glowing bridges between cores. They are the strongest
// within-person evidence for a language–personality link.
export const BRIDGES = [
  {
    a: 'en', b: 'es', category: 'self', evidence: 'moderate',
    title: 'Personality frame-switching',
    claim: 'Spanish–English bilinguals scored higher on Extraversion, Agreeableness and Conscientiousness when tested in English, matching cultural norms for each language.',
    refs: ['Ramírez-Esparza et al. (2006). Do bilinguals have two personalities? J. Research in Personality 40.'],
  },
  {
    a: 'en', b: 'yue', category: 'self', evidence: 'moderate',
    title: 'Two languages, two personalities?',
    claim: 'Hong Kong bilinguals came across as more extraverted, open and assertive in English. Part of the shift came from cues given by the interlocutor.',
    refs: ['Chen & Bond (2010). Two languages, two personalities? PSPB 36(11).'],
  },
  {
    a: 'en', b: 'zh', category: 'decision', evidence: 'moderate',
    title: 'Cultural frame-switching',
    claim: 'Chinese–English biculturals primed with Chinese or American cues shifted their causal attributions between situational and dispositional explanations.',
    refs: ['Hong, Morris, Chiu & Benet-Martínez (2000). Multicultural minds. American Psychologist 55(7).'],
  },
  {
    a: 'en', b: 'ja', category: 'emotion', evidence: 'moderate',
    title: 'Different sentence completions',
    claim: 'Japanese–English bilingual women completed the same sentence stems with more family-duty themes in Japanese and more individual themes in English.',
    refs: ['Ervin-Tripp (1964). An analysis of the interaction of language, topic, and listener. American Anthropologist 66(6).'],
  },
  {
    a: 'zh', b: 'en', category: 'self', evidence: 'moderate',
    title: 'The bicultural self',
    claim: 'Chinese-born students in Canada described themselves with more collective, relational statements and endorsed more Chinese values when they wrote in Chinese than in English.',
    refs: ['Ross, Xun & Wilson (2002). Language and the bicultural self. PSPB 28(8).'],
  },
  {
    a: 'en', b: 'ko', category: 'decision', evidence: 'moderate',
    title: 'Foreign-language effect',
    claim: 'Decisions made in a foreign language show smaller framing effects and less loss aversion: people think more "coolly".',
    refs: [
      'Keysar, Hayakawa & An (2012). The foreign-language effect. Psychological Science 23(6).',
      'Meta-analysis: Circi et al. (2021). Psychonomic Bull. & Review 28.',
    ],
  },
  {
    a: 'en', b: 'fr', category: 'decision', evidence: 'moderate',
    title: 'Foreign-language moral dilemmas',
    claim: 'More people make the utilitarian choice in the footbridge dilemma when it is posed in their foreign language.',
    refs: ['Costa et al. (2014). Your morals depend on language. PLoS ONE 9(4).'],
  },
  {
    a: 'ru', b: 'en', category: 'self', evidence: 'moderate',
    title: 'Language-dependent memory',
    claim: 'Russian–English immigrants recalled more memories from their Russian-speaking years when interviewed in Russian.',
    refs: ['Marian & Neisser (2000). Language-dependent recall of autobiographical memories. J. Exp. Psych.: General 129(3).'],
  },
  {
    a: 'el', b: 'en', category: 'perception', evidence: 'moderate',
    title: 'Blues fade with immersion',
    claim: 'Greek speakers living in the UK lost part of their light/dark-blue distinction as their time in the UK grew.',
    refs: ['Athanasopoulos (2009). Cognitive representation of colour in bilinguals: The case of Greek blues. Bilingualism: L&C 12(1).'],
  },
  {
    a: 'de', b: 'en', category: 'cognition', evidence: 'moderate',
    title: 'Two languages, two minds',
    claim: 'German–English bilinguals switched between endpoint focus and process focus depending on which language was active, even during verbal interference.',
    refs: ['Athanasopoulos et al. (2015). Two languages, two minds. Psychological Science 26(4).'],
  },
  {
    a: 'es', b: 'sv', category: 'time', evidence: 'moderate',
    title: 'Duration: volume vs length',
    claim: 'Spanish–Swedish bilinguals estimated duration from volume or from length depending on whether the Spanish or the Swedish label was used.',
    refs: ['Bylund & Athanasopoulos (2017). The Whorfian time warp. J. Exp. Psych.: General 146(7).'],
  },
];
