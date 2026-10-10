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
};

// Galaxy placement order: related clusters sit next to each other on the arms.
// A cluster is a family, except Indo-European, which is split by branch.
export const CLUSTER_ORDER = [
  'germanic', 'romance', 'hellenic', 'slavic', 'indo-aryan', 'dravidian',
  'afro-asiatic', 'turkic', 'uralic', 'niger-congo',
  'sino-tibetan', 'koreanic', 'japonic', 'kra-dai', 'austroasiatic', 'austronesian',
  'pama-nyungan', 'mura',
];
