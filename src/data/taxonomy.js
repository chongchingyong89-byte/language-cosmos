// Shared vocabulary for the cosmos: trait categories (branch colours/directions),
// evidence levels (leaf size/shape), and language families (core colours).

// Each category grows its branch along a fixed cube diagonal, so the same
// direction always means the same kind of effect on every language core.
export const CATEGORIES = {
  perception: {
    label: 'Perception', zh: '感知', color: '#4fd1ff', dir: [1, 1, 1],
    blurb: 'Colour, space, smell and pitch: what speakers notice and discriminate.',
  },
  time: {
    label: 'Time & Future', zh: '时间与未来', color: '#ffb547', dir: [-1, 1, 1],
    blurb: 'How time is laid out in the mind, and how near the future feels (saving, prudence).',
  },
  cognition: {
    label: 'Cognition & Number', zh: '认知与数字', color: '#6ee7a8', dir: [1, 1, -1],
    blurb: 'Counting, memory span, reading circuitry and how events are segmented.',
  },
  social: {
    label: 'Social Order & Conservatism', zh: '社会秩序与保守', color: '#b18cff', dir: [-1, 1, -1],
    blurb: 'Hierarchy, politeness, kinship and gender: how grammar keeps social structure in view.',
  },
  self: {
    label: 'Self & Identity', zh: '自我与身份', color: '#ff7ac6', dir: [1, -1, 1],
    blurb: 'How prominent the "I" is, autobiographical memory, and who we feel we are in each language.',
  },
  emotion: {
    label: 'Emotion', zh: '情感', color: '#ff6b6b', dir: [-1, -1, 1],
    blurb: 'Emotion concepts that a language names, bundles or keeps apart.',
  },
  creativity: {
    label: 'Creativity & Expression', zh: '创造力与表达', color: '#ffe066', dir: [1, -1, -1],
    blurb: 'Coining words, narrating motion, aesthetic ideals: the raw material for inspiration.',
  },
  decision: {
    label: 'Morality & Decisions', zh: '道德与决策', color: '#5b8cff', dir: [-1, -1, -1],
    blurb: 'Blame, risk, epistemic caution and moral judgement.',
  },
};

// Ordered weakest to strongest; `rank` drives the evidence filter.
export const EVIDENCE = {
  speculative:   { rank: 0, w: 0.30, label: 'Speculative',   color: '#c9a7ff', desc: 'A hypothesis worth studying. No direct experimental test yet.' },
  contested:     { rank: 1, w: 0.45, label: 'Contested',     color: '#ff9b6b', desc: 'An original finding that failed to replicate, or has a strong published rebuttal.' },
  correlational: { rank: 2, w: 0.60, label: 'Correlational', color: '#ffd66b', desc: 'An association across countries or groups. Culture, history and economics could explain it just as well.' },
  moderate:      { rank: 3, w: 0.80, label: 'Moderate',      color: '#9ad1ff', desc: 'Experimental evidence with some replication, though the size or scope is still debated.' },
  strong:        { rank: 4, w: 1.00, label: 'Strong',        color: '#5ef0a0', desc: 'Replicated experimental effect, measured on non-verbal tasks.' },
};

export const FAMILIES = {
  'indo-european':  { label: 'Indo-European',  color: '#7fb4ff' },
  'sino-tibetan':   { label: 'Sino-Tibetan',   color: '#ff8a5c' },
  'japonic':        { label: 'Japonic',        color: '#ff9fc8' },
  'koreanic':       { label: 'Koreanic',       color: '#9fe7ff' },
  'afro-asiatic':   { label: 'Afro-Asiatic',   color: '#f5d17a' },
  'dravidian':      { label: 'Dravidian',      color: '#ffb38a' },
  'austronesian':   { label: 'Austronesian',   color: '#5ee6c8' },
  'turkic':         { label: 'Turkic',         color: '#7ae0ff' },
  'uralic':         { label: 'Uralic',         color: '#b8c8ff' },
  'niger-congo':    { label: 'Niger–Congo',    color: '#e6a95e' },
  'kra-dai':        { label: 'Kra–Dai',        color: '#d39bff' },
  'austroasiatic':  { label: 'Austroasiatic',  color: '#8cf08c' },
  'pama-nyungan':   { label: 'Pama–Nyungan',   color: '#ff7070' },
  'mura':           { label: 'Mura',           color: '#c0ff7a' },
  // Not a genetic family: grouped because modality (hands, face, space) is the shared trait.
  'sign':           { label: 'Sign languages', color: '#eef2ff' },
};

// Galaxy placement order: related clusters sit next to each other on the arms.
// A cluster is a family, except Indo-European, which is split by branch.
export const CLUSTER_ORDER = [
  'germanic', 'romance', 'hellenic', 'slavic', 'indo-aryan', 'dravidian',
  'afro-asiatic', 'turkic', 'uralic', 'niger-congo',
  'sino-tibetan', 'koreanic', 'japonic', 'kra-dai', 'austroasiatic', 'austronesian',
  'pama-nyungan', 'mura', 'sign',
];

// Personality axes for the radar and the lens: Big Five plus three value
// dimensions that map onto the user's core interests (attitude, conservatism).
export const TRAITS = {
  openness:          { label: 'Openness',          short: 'Open',     zh: '开放性',   desc: 'Curiosity, imagination, creativity.' },
  conscientiousness: { label: 'Conscientiousness', short: 'Consc',    zh: '尽责性',   desc: 'Self-control, planning, future orientation.' },
  extraversion:      { label: 'Extraversion',      short: 'Extra',    zh: '外向性',   desc: 'Sociability, assertiveness, expressiveness.' },
  agreeableness:     { label: 'Agreeableness',     short: 'Agree',    zh: '宜人性',   desc: 'Warmth, harmony, avoiding conflict.' },
  neuroticism:       { label: 'Emotional sensitivity', short: 'Emot', zh: '情绪性',   desc: 'Big Five neuroticism: proneness to sadness, worry, longing.' },
  interdependence:   { label: 'Interdependence',   short: 'Interdep', zh: '互依自我', desc: 'Self defined through relationships and the group (collectivism).' },
  hierarchy:         { label: 'Hierarchy acceptance', short: 'Hier',  zh: '等级观',   desc: 'Respect for rank and seniority (power distance).' },
  conservatism:      { label: 'Conservatism',      short: 'Cons',     zh: '保守性',   desc: 'Tradition, caution, conformity to norms.' },
};

// When in life a language effect first shows up.
export const STAGES = {
  womb:    { label: 'Before birth',          zh: '出生前', age: 'last trimester' },
  infancy: { label: 'Infancy',               zh: '婴儿期', age: '0–1 yr' },
  toddler: { label: 'Toddler',               zh: '幼儿期', age: '1–3 yrs' },
  early:   { label: 'Early childhood',       zh: '学前期', age: '3–6 yrs' },
  school:  { label: 'School age',            zh: '学龄期', age: '6–12 yrs' },
  adult:   { label: 'Adolescence & adulthood', zh: '成年', age: '12+ yrs' },
};
