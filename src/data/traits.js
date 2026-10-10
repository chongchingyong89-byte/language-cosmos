// Personality layer: which traits (taxonomy.TRAITS) a feature or culture-key
// word might tilt, and in which direction (+1 up, −1 down, ±0.5 weaker).
//
// These are HYPOTHESISED directions. The radar multiplies each by the leaf's
// evidence weight, so speculative links count for little. Leaves with no
// plausible personality link (most perception/number effects) are left out.

export const FEATURE_TRAITS = {
  weak_ftr:             { conscientiousness: 1 },
  strong_ftr:           { conscientiousness: -1 },
  honorific_grammar:    { hierarchy: 1, agreeableness: 0.5, interdependence: 0.5, conservatism: 0.5 },
  tv_distinction:       { hierarchy: 0.5 },
  kinship_lexicon:      { interdependence: 1, hierarchy: 0.5 },
  gendered_nouns:       { conservatism: 0.5 },
  neutral_pronoun:      { conservatism: -1, openness: 0.5 },
  pro_drop:             { interdependence: 1 },
  evidentiality:        { conservatism: 0.5 },
  motion_satellite:     { openness: 0.5 },
  productive_compounding: { openness: 0.5 },
  diglossia:            { hierarchy: 0.5 },
  iconicity:            { openness: 0.5 },
  agentive:             { agreeableness: -0.5 },
  nonagentive:          { agreeableness: 0.5 },
};

// Keyed by the concept's exact `term` in languages.js.
export const CONCEPT_TRAITS = {
  'privacy':                 { interdependence: -1 },
  'Schadenfreude':           { agreeableness: -0.5 },
  'lagom':                   { conservatism: 0.5, extraversion: -0.5 },
  'sobremesa':               { extraversion: 0.5, interdependence: 0.5 },
  'vergüenza ajena':         { agreeableness: 0.5 },
  'dépaysement':             { openness: 0.5 },
  'saudade':                 { neuroticism: 0.5 },
  'sprezzatura':             { openness: 0.5 },
  'φιλότιμο (philotimo)':    { interdependence: 1, agreeableness: 0.5 },
  'μεράκι (meraki)':         { openness: 0.5, conscientiousness: 0.5 },
  'тоска (toska)':           { neuroticism: 1 },
  'авось (avos\')':          { conscientiousness: -1 },
  'जुगाड़ (jugaad)':          { openness: 1, conscientiousness: -0.5 },
  'முறை (murai)':            { conservatism: 1, interdependence: 0.5 },
  'طرب (ṭarab)':             { openness: 0.5 },
  'פרגון (firgun)':          { agreeableness: 1 },
  'חוצפה (chutzpah)':        { extraversion: 1, agreeableness: -0.5 },
  'hüzün':                   { neuroticism: 0.5 },
  'sisu':                    { conscientiousness: 1, neuroticism: -0.5 },
  'ujamaa':                  { interdependence: 1 },
  'àṣẹ':                     { openness: 0.5 },
  '面子 (miànzi)':           { hierarchy: 0.5, interdependence: 0.5 },
  '人情 (jan4 cing4)':       { interdependence: 1 },
  '정 (jeong)':              { interdependence: 1, agreeableness: 0.5 },
  '한 (han)':                { neuroticism: 0.5 },
  '눈치 (nunchi)':           { interdependence: 1, agreeableness: 0.5 },
  '甘え (amae)':             { interdependence: 1 },
  '空気を読む':              { interdependence: 1, conservatism: 0.5, extraversion: -0.5 },
  'もののあはれ':            { openness: 0.5 },
  'เกรงใจ (kreng jai)':      { agreeableness: 1, interdependence: 0.5 },
  'ใจเย็น (jai yen)':        { neuroticism: -1 },
  'anh / chị / em':          { hierarchy: 1, interdependence: 0.5 },
  'malu':                    { interdependence: 0.5, neuroticism: 0.5, conservatism: 0.5 },
  'budi':                    { interdependence: 1, agreeableness: 0.5 },
  'Brother-in-law language': { hierarchy: 0.5, conservatism: 0.5 },
  'Deaf gain':               { interdependence: 0.5, openness: 0.5 },
};

// MEASURED personality shifts in bilinguals: the same people scored
// differently depending on the test language. Keyed by bridge title.
// `lang` scored higher (+) or lower (−) than `vs` on each trait.
export const BRIDGE_SHIFTS = {
  'Personality frame-switching': { lang: 'en', vs: 'es', shifts: { extraversion: 1, agreeableness: 1, conscientiousness: 1 } },
  'Two languages, two personalities?': { lang: 'en', vs: 'yue', shifts: { extraversion: 1, openness: 1 } },
  'The bicultural self': { lang: 'zh', vs: 'en', shifts: { interdependence: 1 } },
};
