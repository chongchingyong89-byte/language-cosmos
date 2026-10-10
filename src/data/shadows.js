// The shadow side: documented or hypothesised NEGATIVE effects linked to a
// feature or culture-key word. Drawn as red thorns on the matching leaves.
//
// Ground rules for adding entries (it's a study, not a stereotype list):
//  - Attach the harm to a linguistic feature or a word, never to a people.
//  - Grade evidence as strictly as the upside (see taxonomy.EVIDENCE).
//  - Most "language → social harm" links are correlational. Culture, history,
//    economics and religion travel with language and are usually the bigger cause.
//
// Each entry is a list, so a feature can have several distinct downsides.

export const FEATURE_SHADOWS = {
  strong_ftr: [{
    claim: 'Linked with lower saving, more smoking, less exercise and less safe sex at country and household level. If the future feels distant, present temptations win.',
    evidence: 'contested',
    refs: ['Chen (2013). American Economic Review 103(2).', 'Weakened under phylogenetic controls: Roberts, Winters & Chen (2015). PLoS ONE.'],
  }],
  gendered_nouns: [
    {
      claim: 'Masculine generics ("der Arzt" for any doctor) make people picture men, and they lower girls\' confidence that they could do male-typed jobs. Pair forms ("Ärztinnen und Ärzte") reduce this.',
      evidence: 'moderate',
      refs: ['Vervecken & Hannover (2015). Yes I can! Effects of gender fair job descriptions on children\'s perceptions. Social Psychology 46(2).'],
    },
    {
      claim: 'Countries and ethnic groups whose languages mark gender grammatically show lower female labour-force participation and more traditional gender norms.',
      evidence: 'correlational',
      refs: ['Prewitt-Freilino, Caswell & Laakso (2012). Sex Roles 66.', 'Jakiela & Ozier (2018). Gendered language. World Bank Policy Research WP 8464.'],
    },
  ],
  gendered_you: [{
    claim: 'Because every "you" and every verb has to pick a gender, there is no neutral way to address someone. Non-binary people are misgendered in nearly every sentence, which has prompted grassroots grammar workarounds.',
    evidence: 'speculative',
    refs: ['e.g. the Nonbinary Hebrew Project (Gross, 2018–), which proposes merged endings.'],
  }],
  genderless_pronouns: [
    {
      claim: 'Gender bias is hidden rather than removed. Machine translation turns Turkish "o bir doktor" into "he is a doctor" and "o bir hemşire" into "she is a nurse", spreading stereotypes at scale.',
      evidence: 'strong',
      refs: ['Prates, Avelar & Lamb (2020). Assessing gender bias in machine translation. Neural Computing & Applications 32.'],
    },
    {
      claim: 'Countries with genderless languages are not reliably more gender-equal than English-type countries, so a neutral pronoun alone does not fix attitudes.',
      evidence: 'correlational',
      refs: ['Prewitt-Freilino, Caswell & Laakso (2012). Sex Roles 66.'],
    },
  ],
  honorific_grammar: [
    {
      claim: 'When status is built into every verb, juniors may find it harder to contradict seniors. This has been implicated in aviation and hospital safety cultures, where junior staff soften warnings. The popular "Korean Air cockpit" story is disputed.',
      evidence: 'contested',
      refs: ['Helmreich & Merritt (1998). Culture at Work in Aviation and Medicine.', 'Popular, disputed claim: Gladwell (2008). Outliers.'],
    },
    {
      claim: 'Several Korean and Japanese firms replaced rank titles with flat forms (-님, -さん, English names) to encourage people to speak up. This is a natural experiment that has not yet been properly measured.',
      evidence: 'speculative',
    },
  ],
  tv_distinction: [{
    claim: 'The choice can be used as a weapon. Using the familiar "you" uninvited towards a stranger or a lower-status person signals contempt, as in complaints of police addressing minorities with "tu".',
    evidence: 'speculative',
  }],
  kinship_lexicon: [{
    claim: 'Seniority encoded in every address term can entrench age hierarchy and filial obligation. It may make it harder to refuse elders, and it piles caregiving duty on particular kin, often daughters-in-law.',
    evidence: 'speculative',
  }],
  pro_drop: [{
    claim: 'Pronoun drop goes with collectivism, and collectivism goes with higher conformity in Asch-type experiments. The possible shadow is pressure to go along with the group, plus stronger in-group favouritism.',
    evidence: 'correlational',
    refs: ['Kashima & Kashima (1998). JCCP 29(3).', 'Bond & Smith (1996). Culture and conformity: a meta-analysis. Psychological Bulletin 119(1).'],
  }],
  agentive: [{
    claim: 'Agentive phrasing ("she broke it") makes listeners assign more blame and higher financial penalties for accidents. A link to punitive, litigation-heavy culture is a hypothesis.',
    evidence: 'moderate',
    refs: ['Fausey & Boroditsky (2010). Psychonomic Bull. & Review 17.'],
  }],
  nonagentive: [{
    claim: 'Weaker memory for who caused accidental harm can blur accountability. English speakers use the same trick on purpose ("mistakes were made").',
    evidence: 'moderate',
    refs: ['Fausey & Boroditsky (2011). Psychonomic Bull. & Review 18.'],
  }],
  anumeric: [{
    claim: 'Without exact numbers, trading with a numerate market economy leaves people open to being short-changed. Pirahã speakers asked to be taught counting for this reason. The harm comes from contact with outsiders, not from the language.',
    evidence: 'speculative',
    refs: ['Everett (2005). Current Anthropology 46(4).', 'Frank et al. (2008). Cognition 108.'],
  }],
  numeral_inversion: [{
    claim: 'Inverted numbers lead to extra working-memory load and early number-writing errors. A German campaign ("Zwanzigeins") pushes for optional non-inverted counting.',
    evidence: 'moderate',
    refs: ['Zuber et al. (2009). J. Exp. Child Psychology 102.'],
  }],
  logographic: [{
    claim: 'Full literacy takes longer to reach. Heavy reliance on pinyin typing goes with "character amnesia" (提笔忘字) and weaker reading in children.',
    evidence: 'correlational',
    refs: ['Tan, Xu, Chang & Siok (2013). China\'s language input system in the digital age affects children\'s reading development. PNAS 110(3).'],
  }],
  diglossia: [{
    claim: 'Children learn to read in a variety nobody speaks at home, which is linked to slower early reading. Formal public discourse can shut out people with less schooling.',
    evidence: 'moderate',
    refs: ['Saiegh-Haddad (2003). Linguistic distance and initial reading acquisition: the case of Arabic diglossia. Applied Psycholinguistics 24.'],
  }],
  speaker_gender_marking: [{
    claim: 'Speakers must declare their gender in almost every polite sentence. That makes misgendering easy and puts pressure on anyone who does not fit the binary.',
    evidence: 'speculative',
  }],
  evidentiality: [{
    claim: 'Hypothesis: marking gossip as "reportedly" may let speakers spread rumours while feeling less personally responsible for them.',
    evidence: 'speculative',
  }],
};

// Keyed by the concept's exact `term` in languages.js.
export const CONCEPT_SHADOWS = {
  'fair / reasonable': [{ claim: 'Valuing a fair procedure can make unequal outcomes seem legitimate: "the process was fair, so the result is deserved".', evidence: 'speculative', refs: ['Wierzbicka (2006).'] }],
  'Schadenfreude': [{ claim: 'Envy predicts schadenfreude, and schadenfreude goes with less willingness to help. Having a word for it may make the feeling easier to admit, and perhaps to normalise.', evidence: 'speculative', refs: ['van Dijk et al. (2006). When people fall from grace: reconsidering the role of envy in schadenfreude. Emotion 6(1).'] }],
  'lagom': [{ claim: 'The ideal of "not too much" can slide into discouraging ambition or standing out (compare the Scandinavian "Jantelagen").', evidence: 'speculative' }],
  'sprezzatura': [{ claim: 'Hiding effort makes success look like innate talent, which may discourage learners who believe ability is fixed.', evidence: 'speculative' }],
  'φιλότιμο (philotimo)': [{ claim: 'Strong duties of honour and reciprocity can turn into obligations to return favours, which feeds clientelism.', evidence: 'speculative' }],
  'авось (avos\')': [{ claim: 'Russian self-commentary often blames trusting to luck for neglected safety and planning.', evidence: 'speculative', refs: ['Wierzbicka (1992).'] }],
  'जुगाड़ (jugaad)': [{ claim: 'Celebrating frugal improvisation can normalise unsafe shortcuts and low quality standards.', evidence: 'speculative', refs: ['Birtchnell (2011). Jugaad as systemic risk and disruptive innovation in India. Contemporary South Asia 19(4).'] }],
  'முறை (murai)': [{ claim: 'Prescribed marriage categories can narrow partner choice and reinforce kin and caste endogamy.', evidence: 'speculative', refs: ['Trautmann (1981).'] }],
  'إن شاء الله (in shāʾ Allāh)': [{ claim: 'Sometimes read as fatalism (the outcome is up to God), and health researchers have studied religious fatalism as a barrier to screening. In daily use it is just as often humility or a polite "maybe". Beware of stereotyping here.', evidence: 'speculative' }],
  'חוצפה (chutzpah)': [{ claim: 'Prized audacity can also excuse rudeness and rule-bending.', evidence: 'speculative' }],
  'sisu': [{ claim: '"Harmful sisu" means pushing on regardless: overexertion, burnout and not asking for help.', evidence: 'speculative', refs: ['Lahti (2019). Intl. J. Wellbeing 9(1).'] }],
  'ujamaa': [{ claim: 'When the ideal became state policy, forced villagisation (1973–76) uprooted millions and hurt farm output. The shadow is coercion in the name of community; the word itself did no harm.', evidence: 'strong', refs: ['Scott (1998). Seeing Like a State. Yale UP.'] }],
  '面子 (miànzi)': [{ claim: 'Saving face can hide mistakes, discourage admitting ignorance, and delay the reporting of problems.', evidence: 'speculative', refs: ['Ho (1976). On the concept of face. American J. Sociology 81(4).'] }],
  '缘分 (yuánfèn)': [{ claim: 'Believing that relationships are fated is linked to less effort spent repairing them. Studies show this for "destiny beliefs" generally; yuanfen itself has not been tested.', evidence: 'speculative', refs: ['Knee (1998). Implicit theories of relationships. JPSP 74(2).'] }],
  '人情 (jan4 cing4)': [{ claim: 'Networks of favour-obligation can slide into favouritism and corruption (guanxi).', evidence: 'speculative', refs: ['Hwang (1987). American J. Sociology 92(4).'] }],
  '한 (han)': [{ claim: 'A culturally named collective grief may be passed on across generations as a sense of grievance.', evidence: 'speculative' }],
  '눈치 (nunchi)': [{ claim: 'Constantly reading the mood can mean conformity pressure and held-back honest feedback.', evidence: 'speculative' }],
  '甘え (amae)': [{ claim: 'Doi himself linked unchecked amae to dependency and to difficulty taking individual responsibility.', evidence: 'speculative', refs: ['Doi (1971).'] }],
  '空気を読む': [{ claim: 'Pressure to "read the air" silences dissent. People who cannot are labelled KY (空気読めない) and can be ostracised.', evidence: 'speculative' }],
  'เกรงใจ (kreng jai)': [{ claim: 'Not wanting to impose means problems and needs go unspoken, for example staff not reporting issues to superiors.', evidence: 'speculative', refs: ['Komin (1990).'] }],
  'anh / chị / em': [{ claim: 'When every "I/you" encodes age rank, juniors find it harder to disagree openly.', evidence: 'speculative' }],
  'malu': [{ claim: 'Fear of shame can stop people seeking help, for example for mental health or debt, or from admitting illness.', evidence: 'speculative', refs: ['Goddard (1996). Ethos 24(3).'] }],
  'budi': [{ claim: 'A "debt of kindness" (hutang budi) can be used politically: favours that create loyalty become patronage.', evidence: 'speculative', refs: ['Lim Kim Hui (2003).'] }],
};

// Bilingual bridges can have a shadow too.
export const BRIDGE_SHADOWS = {
  'Foreign-language moral dilemmas': [{ claim: 'Deciding in a second language is "cooler": less biased, but also more willing to sacrifice one person to save five. Consider this when people decide about others in a foreign language (courts, medicine, aid work).', evidence: 'moderate', refs: ['Costa et al. (2014). PLoS ONE 9(4).'] }],
};
