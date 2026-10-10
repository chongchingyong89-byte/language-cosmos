// 🇲🇾 Phase 2: Kedai Runcit & Mamak "Budi", a shophouse on a rainy evening.
// Teaches: penjodoh bilangan (counter words), kinship words for strangers,
// prices in ringgit, Manglish "lah" and "tapau", "tak apa", "makan sini atau
// bungkus?", reduplication (renyai-renyai), budi bahasa (courtesy).
import { catSvg } from './chibi.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// ── Numbers & prices ──────────────────────────────────────────────────────
const MS = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];
export function malayNum(n) {
  if (n === 0) return 'kosong';
  const parts = [];
  const h = Math.floor(n / 100), rest = n % 100, t = Math.floor(rest / 10), u = rest % 10;
  if (h) parts.push(h === 1 ? 'seratus' : `${MS[h]} ratus`);
  if (rest) {
    if (rest < 10) parts.push(MS[rest]);
    else if (rest === 10) parts.push('sepuluh');
    else if (rest === 11) parts.push('sebelas');
    else if (rest < 20) parts.push(`${MS[u]} belas`);
    else parts.push(`${MS[t]} puluh${u ? ` ${MS[u]}` : ''}`);
  }
  return parts.join(' ');
}
export function ringgit(cents) {
  const r = Math.floor(cents / 100), s = cents % 100;
  return {
    say: [r ? `${malayNum(r)} ringgit` : '', s ? `${malayNum(s)} sen` : ''].filter(Boolean).join(' '),
    short: `RM${(cents / 100).toFixed(2)}`,
  };
}

// ── Penjodoh bilangan (counter words): "se-" for one, else number + word ──
export const COUNTERS = {
  biji:    { word: 'biji', rule: 'small round things: eggs, kuih, fruit' },
  batang:  { word: 'batang', rule: 'long thin things: pens, ice lollies, trees' },
  keping:  { word: 'keping', rule: 'flat pieces: roti canai, slices, biscuits, banknotes' },
  bungkus: { word: 'bungkus', rule: 'wrapped packets: nasi lemak, kerepek' },
  cawan:   { word: 'cawan', rule: 'cups of hot drinks' },
  gelas:   { word: 'gelas', rule: 'glasses of cold drinks' },
  naskhah: { word: 'naskhah', rule: 'copies of newspapers and documents' },
  buku:    { word: 'buku', rule: 'whole loaves of bread (and bars of soap!)' },
  kaki:    { word: 'kaki', rule: 'umbrellas! ("one leg of umbrella")' },
  ekor:    { word: 'ekor', rule: 'animals ("tail")' },
};
export const counted = (c, q) => ({ ms: q === 1 ? `se${COUNTERS[c].word}` : `${malayNum(q)} ${COUNTERS[c].word}` });

// ── Items: mamak favourites and kedai runcit basics (prices in sen) ──────
export const ITEMS = {
  nasilemak:  { emoji: '🍛', ms: 'nasi lemak', en: 'coconut rice with sambal', counter: 'bungkus', price: 300, fav: true, max: 3,
    snack: 'Malaysia\'s favourite breakfast: coconut rice, sambal, egg, peanuts and ikan bilis, wrapped in a banana leaf.' },
  roticanai:  { emoji: '🫓', ms: 'roti canai', en: 'flaky flatbread', counter: 'keping', price: 150, fav: true,
    snack: 'Stretched, flipped and fried on a hot griddle, then dipped in dhal or curry. A mamak classic!' },
  tehtarik:   { emoji: '🧋', ms: 'teh tarik', en: 'pulled milk tea', counter: 'cawan', price: 220, fav: true,
    snack: '"Pulled tea": poured from cup to cup from a great height to make it frothy.' },
  sirap:      { emoji: '🥤', ms: 'sirap bandung', en: 'rose syrup with milk', counter: 'gelas', price: 250, fav: true,
    snack: 'The famous pink drink: rose syrup and evaporated milk over ice.' },
  kuih:       { emoji: '🍡', ms: 'kuih', en: 'traditional cake', counter: 'biji', price: 80, fav: true,
    snack: 'Small colourful cakes like kuih lapis and onde-onde. You buy them by the biji.' },
  telur:      { emoji: '🥚', ms: 'telur', en: 'egg', counter: 'biji', price: 50 },
  aiskrim:    { emoji: '🍦', ms: 'aiskrim batang', en: 'ice lolly', counter: 'batang', price: 120,
    snack: 'Ice cream on a stick: long, so it\'s counted with batang.' },
  pen:        { emoji: '🖊️', ms: 'pen', en: 'pen', counter: 'batang', price: 100 },
  suratkhabar:{ emoji: '📰', ms: 'surat khabar', en: 'newspaper', counter: 'naskhah', price: 150, max: 2 },
  roti:       { emoji: '🍞', ms: 'roti', en: 'loaf of bread', counter: 'buku', price: 320, max: 2,
    snack: 'A whole loaf is "sebuku roti", but one slice is "sekeping roti".' },
  payung:     { emoji: '☂️', ms: 'payung', en: 'umbrella', counter: 'kaki', price: 1500, max: 1 },
  kerepek:    { emoji: '🍟', ms: 'kerepek', en: 'crisps', counter: 'bungkus', price: 200, fav: true,
    snack: 'Crunchy chips made from cassava, banana or tapioca, hanging in packets over the counter.' },
};

// ── Customers and their attitudes ────────────────────────────────────────
// `call` is the right kinship word to address them with.
export const PEOPLE = {
  pakcik: {
    ms: 'Pak cik', en: 'Uncle', call: 'Pak cik',
    look: { hair: '#2b2b2b', style: 'short', outfit: '#2f7d6d', legs: '#3b3b48', acc: ['cap'] },
    line: { ms: 'Assalamualaikum. Teh tarik satu, kurang manis.', en: 'Peace be upon you. One teh tarik, less sweet.' },
    items: ['tehtarik', 'roticanai', 'suratkhabar'],
    attitude: { emoji: '🙏', label: 'Gentle & courteous', note: 'Budi bahasa (courtesy) is a Malay ideal: soft words, greetings first, and "kurang manis" (less sweet) said with a smile.' },
    greet: true,
  },
  makcik: {
    ms: 'Mak cik', en: 'Auntie', call: 'Mak cik',
    look: { hair: '#8c6bb1', style: 'bob', outfit: '#d9567c', legs: '#6d3a52', acc: [] },
    line: { ms: 'Nak, mak cik nak nasi lemak, ya.', en: 'Dear (my child), auntie would like nasi lemak, OK?' },
    items: ['nasilemak', 'kuih', 'roti', 'telur'],
    attitude: { emoji: '🤗', label: 'Warm & motherly', note: 'She calls you "nak" (my child) even though you\'re strangers, and calls herself "mak cik". Malay places everyone in a big family.' },
    takeaway: true,
  },
  uncle: {
    ms: 'Uncle', en: 'Uncle (Manglish)', call: 'Uncle',
    look: { hair: '#5a5a5a', style: 'short', outfit: '#3a6fb0', legs: '#2b2f3a', acc: ['glasses'] },
    line: { ms: 'Boss, roti canai two piece, can ah?', en: 'Boss, two roti canai, can or not?' },
    items: ['roticanai', 'kerepek', 'sirap'],
    attitude: { emoji: '😎', label: 'Relaxed Manglish', note: 'Malaysian English mixes English, Malay, Hokkien, Cantonese and Tamil, and "lah" makes everything friendlier.' },
    manglish: true,
  },
  kakak: {
    ms: 'Kakak', en: 'Young woman', call: 'Kak',
    look: { hair: '#2b1d14', style: 'long', outfit: '#f2b134', legs: '#2c3e66', acc: [] },
    line: { ms: 'Kak nak kuih, ya. Cepat sikit, nak kejar bas!', en: 'I\'d like some kuih, please. Quick, I\'ve got a bus to catch!' },
    items: ['kuih', 'aiskrim', 'sirap'],
    attitude: { emoji: '⏱️', label: 'In a rush, still polite', note: 'Even in a hurry she softens her words with "ya". And if you\'re slow? "Tak apa": no worries.' },
    hurry: true,
    takApa: true,
  },
  adik: {
    ms: 'Adik', en: 'Schoolkid', call: 'Adik',
    look: { hair: '#1b1b1b', style: 'spiky', outfit: '#ffffff', legs: '#1f4fa0', acc: ['randoseru'] },
    line: { ms: 'Kak, nak aiskrim!', en: 'Big sister, I want an ice lolly!' },
    items: ['aiskrim', 'kerepek', 'pen', 'kuih'],
    attitude: { emoji: '😄', label: 'Excited & respectful', note: 'He calls you "Kak" (big sister) or "Bang" (big brother): respect for anyone older, even the shop helper.' },
  },
  tourist: {
    ms: 'Pelancong', en: 'Tourist', call: null,
    look: { hair: '#e8c15a', style: 'spiky', outfit: '#3fa36b', legs: '#34495e', acc: ['backpack', 'cap'] },
    line: { ms: null, en: 'Hi! It\'s raining… do you sell umbrellas?' },
    items: ['payung'],
    attitude: { emoji: '🧳', label: 'Curious visitor', note: 'Teach them the funniest counter word: an umbrella has a "leg" (kaki)!' },
  },
};

const WEATHER = [
  { word: 'renyai-renyai', romaji: '', en: 'drizzling (said twice!)', level: 0.25 },
  { word: 'hujan', romaji: '', en: 'raining', level: 0.55 },
  { word: 'hujan lebat', romaji: '', en: 'pouring rain', level: 1 },
];

const L = {
  thanks: { jp: 'Terima kasih, datang lagi!', romaji: '', en: 'Thank you, come again!' },
};

// ── Steps ─────────────────────────────────────────────────────────────────
const t = (ms, en) => ({ jp: ms, romaji: '', en });

function salamStep() {
  return {
    prompt: 'Pak cik greets you with <b class="jp-big">Assalamualaikum</b>. How do you answer?',
    options: shuffle([
      { main: 'Waalaikumsalam', sub: '"and peace be upon you too"', ok: true },
      { main: 'Selamat tinggal', sub: '"goodbye"' },
      { main: 'Apa?', sub: '"What?"' },
    ]),
    explain: '<b>Waalaikumsalam</b> is the reply to <b>Assalamualaikum</b> ("peace be upon you"). Greeting before business is good <i>budi bahasa</i>.',
    learn: [t('Assalamualaikum', 'peace be upon you (greeting)'), t('Waalaikumsalam', 'and upon you be peace (reply)')],
    tag: 'attitude',
  };
}

function callStep(p) {
  const all = ['Pak cik', 'Mak cik', 'Kak', 'Abang', 'Adik', 'Uncle'];
  const wrong = shuffle(all.filter((c) => c !== p.call)).slice(0, 2);
  return {
    prompt: `How do you politely call this customer? <span class="muted">(${p.en})</span>`,
    options: shuffle([{ main: `Ya, ${p.call}?`, ok: true }, ...wrong.map((c) => ({ main: `Ya, ${c}?` }))]),
    explain: `<b>${p.call}</b>. In Malaysia you call strangers by <b>family words</b>: Pak cik (uncle), Mak cik (auntie), Abang/Kak (big brother / sister), Adik (little one). Age decides the word, which keeps respect built into every sentence.`,
    learn: [t(p.call, `how to address: ${p.en.toLowerCase()}`)],
    tag: 'attitude',
  };
}

function counterStep(item, q) {
  const it = ITEMS[item];
  const right = counted(it.counter, q);
  const others = shuffle(Object.keys(COUNTERS).filter((c) => c !== it.counter && c !== 'ekor')).slice(0, 2);
  return {
    show: { item, q },
    prompt: `How do you say <b>${q} ${it.en}${q > 1 ? 's' : ''}</b> in Malay?`,
    options: shuffle([
      { main: `${right.ms} ${it.ms}`, ok: true },
      ...others.map((c) => ({ main: `${counted(c, q).ms} ${it.ms}` })),
    ]),
    explain: `<b>${right.ms} ${it.ms}</b>. Malay counts with <b>penjodoh bilangan</b> (counter words), like Japanese: <b>${COUNTERS[it.counter].word}</b> is for ${COUNTERS[it.counter].rule}. For one, add "se-": se${COUNTERS[it.counter].word}.`,
    learn: [t(`${right.ms} ${it.ms}`, `${q} × ${it.en}`)],
    tag: 'counter',
    snack: it.snack,
  };
}

function priceStep(total, toMalay) {
  const right = ringgit(total);
  const pool = [...new Set([total + 100, total - 100, total + 10, total - 10, total + 50, total + 20])].filter((v) => v > 0 && v !== total);
  const wrong = shuffle(pool).slice(0, 3);
  if (toMalay) {
    return {
      prompt: `The total is <b class="big-num">${right.short}</b>. How do you say it?`,
      options: shuffle([{ main: right.say, ok: true }, ...wrong.slice(0, 2).map((v) => ({ main: ringgit(v).say }))]),
      explain: `<b>${right.say}</b>. Ringgit first, then sen (100 sen = 1 ringgit).`,
      learn: [t(right.say, right.short)],
      yen: total / 100, tag: 'number',
    };
  }
  return {
    prompt: `The customer asks: <b class="jp-big">${right.say}?</b> Which price is it?`,
    options: shuffle([{ main: right.short, ok: true }, ...wrong.map((v) => ({ main: ringgit(v).short }))]),
    explain: `<b>${right.say}</b> = ${right.short}. "Puluh" = tens, "belas" = teens, "sen" = cents.`,
    learn: [t(right.say, right.short)],
    yen: total / 100, tag: 'number',
  };
}

function bungkusStep() {
  return {
    staff: t('Makan sini atau bungkus?', 'Eat here or take away?'),
    reply: t('Bungkus, ya.', '(literally) "Wrap it, OK."'),
    prompt: 'You asked <b>Makan sini atau bungkus?</b> She says <b class="jp-big">Bungkus, ya.</b> What does she want?',
    options: shuffle([{ main: 'To take it away', ok: true }, { main: 'To eat here' }, { main: 'A bigger portion' }]),
    explain: '<b>Bungkus</b> = wrap it up, i.e. takeaway. It\'s the most-asked question at every mamak stall! The "ya" softens it, like "please".',
    learn: [t('Makan sini atau bungkus?', 'Eat here or takeaway?'), t('bungkus', 'wrap / takeaway')],
    tag: 'attitude',
  };
}

function lahStep() {
  return {
    prompt: 'Uncle asks <b class="jp-big">"Boss, can ah?"</b> What\'s the friendliest Manglish answer?',
    options: shuffle([{ main: 'Can lah!', sub: 'friendly, relaxed', ok: true }, { main: 'Can.', sub: 'correct, but sounds curt' }, { main: 'Yes, it is possible.', sub: 'too formal for a mamak!' }]),
    explain: '<b>Can lah!</b> The little word <b>lah</b> (from Malay) softens and warms the sentence. Manglish mixes English, Malay, Hokkien, Cantonese and Tamil, a very Malaysian kind of creativity.',
    learn: [t('Can lah!', 'Sure! (friendly Manglish)'), t('lah', 'softening, friendly particle')],
    tag: 'attitude',
  };
}

function tapauStep() {
  return {
    reply: t('Tapau ah, boss.', '(Manglish)'),
    prompt: 'Uncle adds <b class="jp-big">"Tapau ah, boss."</b> What does "tapau" mean?',
    options: shuffle([{ main: 'Takeaway', ok: true }, { main: 'Extra spicy' }, { main: 'Pay later' }]),
    explain: '<b>Tapau</b> = takeaway. It comes from Cantonese 打包 (daa2 baau1, "pack it"), now used by every Malaysian. Words travel between communities!',
    learn: [t('tapau', 'takeaway (from Cantonese 打包)')],
    tag: 'attitude',
  };
}

function takApaStep() {
  return {
    reply: t('Tak apa, tak apa.', '(literally) "Not what, not what."'),
    prompt: 'You\'re a bit slow and say sorry. She smiles: <b class="jp-big">"Tak apa, tak apa."</b> What does she mean?',
    options: shuffle([{ main: 'No worries, it\'s fine', ok: true }, { main: 'What did you say?' }, { main: 'I don\'t want it' }]),
    explain: '<b>Tak apa</b> = "never mind / no worries". It sums up a relaxed, forgiving Malaysian attitude, though some say it can also mean "can\'t be bothered"!',
    learn: [t('Tak apa', 'no worries / never mind')],
    tag: 'attitude',
  };
}

function kakiStep() {
  return {
    show: { item: 'payung', q: 1 },
    prompt: 'The tourist wants <b>one umbrella</b>. How do you say it in Malay?',
    options: shuffle([{ main: 'sekaki payung', sub: '"one leg of umbrella"', ok: true }, { main: 'sebiji payung' }, { main: 'sehelai payung' }]),
    explain: '<b>sekaki payung</b>: umbrellas are counted with <b>kaki</b> ("leg"), maybe because of the long handle. Counter words are full of surprises!',
    learn: [t('sekaki payung', 'one umbrella')],
    tag: 'counter',
  };
}

function catStep() {
  return {
    special: 'cat',
    prompt: 'A wet stray cat curls up under a mamak table to wait out the rain. How do you count <b>one cat</b>?',
    options: shuffle([{ main: 'seekor kucing', ok: true }, { main: 'sebiji kucing' }, { main: 'sebatang kucing' }]),
    explain: '<b>seekor kucing</b>: animals are counted with <b>ekor</b> ("tail"). Mamak cats are famous: they know where the fish curry is!',
    learn: [t('seekor kucing', 'one cat')],
    tag: 'counter',
  };
}

// What each customer says, built from what they're actually ordering.
// Mamak style puts the number after the item ("teh tarik satu") and leaves
// out the counter word, which is the puzzle.
const cap = (x) => x[0].toUpperCase() + x.slice(1);
const ORDER = {
  pakcik: (it, q) => ({ ms: `Assalamualaikum. ${cap(it.ms)} ${malayNum(q)}${it.ms === 'teh tarik' ? ', kurang manis' : ''}, ya.`, en: `Peace be upon you. ${q} ${it.en}${it.ms === 'teh tarik' ? ', less sweet' : ''}, please.` }),
  makcik: (it, q) => ({ ms: `Nak, mak cik nak ${it.ms} ${malayNum(q)}, ya.`, en: `Dear (my child), auntie would like ${q} ${it.en}, OK?` }),
  uncle: (it, q) => ({ ms: `Boss, ${it.ms} ${q} ${q > 1 ? 'piece' : 'piece'}, can ah?`, en: `Boss, ${q} ${it.en}, can or not?` }),
  kakak: (it, q) => ({ ms: `Nak ${it.ms} ${malayNum(q)}, ya. Cepat sikit, nak kejar bas!`, en: `${q} ${it.en}, please. Quick, I've got a bus to catch!` }),
  adik: (it, q) => ({ ms: `Kak, nak ${it.ms} ${malayNum(q)}!`, en: `Big sister, I want ${q} ${it.en}!` }),
  tourist: () => ({ ms: null, en: "Hi! It's raining… do you sell umbrellas?" }),
};

function night() {
  const order = ['pakcik', 'makcik', 'uncle', 'kakak', 'adik', 'tourist'];
  return order.map((who, i) => {
    const p = PEOPLE[who];
    const item = pick(p.items);
    const it = ITEMS[item];
    const q = Math.min(1 + Math.floor(Math.random() * 3), it.max ?? 3);
    const steps = [];
    if (p.greet) steps.push(salamStep());
    if (p.call) steps.push(callStep(p));
    if (who === 'tourist') steps.push(kakiStep());
    else steps.push(counterStep(item, q));
    if (p.manglish) { steps.push(lahStep()); steps.push(tapauStep()); }
    if (p.takeaway) steps.push(bungkusStep());
    if (p.takApa) steps.push(takApaStep());
    steps.push(priceStep(it.price * (who === 'tourist' ? 1 : q), i % 2 === 0));
    const line = ORDER[who](it, who === 'tourist' ? 1 : q);
    return { who, person: { ...p, jp: p.ms, line: { jp: line.ms, romaji: '', en: line.en } }, item, q, weather: WEATHER[Math.min(Math.floor(i / 2), 2)], steps, catAfter: i === 3 ? catStep() : null };
  });
}

// ── Scene: a shophouse kedai runcit & mamak on a rainy evening ───────────
function arch(x) {
  return `<path d="M${x} 300 L${x} 226 Q${x + 50} 186 ${x + 100} 226 L${x + 100} 300" fill="none" stroke="#e9dcc0" stroke-width="10"/>`;
}

function shelves(x0, y0, w) {
  let s = 7, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cols = ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#ffffff', '#c77dff'];
  for (let r = 0; r < 4; r++) {
    const y = y0 + r * 22;
    out += `<rect x="${x0}" y="${y + 17}" width="${w}" height="3" fill="#9a8a6a"/>`;
    for (let x = x0 + 2; x < x0 + w - 6;) {
      const bw = 5 + rnd() * 7, bh = 8 + rnd() * 8;
      out += `<rect x="${x.toFixed(1)}" y="${(y + 17 - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
      x += bw + 1.5;
    }
  }
  return out;
}

function stool(x, y, c) {
  return `<g transform="translate(${x} ${y})"><path d="M-12 0 L-15 22 M12 0 L15 22 M-6 0 L-8 22 M6 0 L8 22" stroke="${c}" stroke-width="3"/><ellipse cx="0" cy="0" rx="14" ry="5" fill="${c}"/></g>`;
}

function table(x, y) {
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="34" ry="9" fill="#cfd6dd" stroke="#9aa6b2" stroke-width="2"/><rect x="-3" y="0" width="6" height="34" fill="#8a96a3"/><ellipse cx="0" cy="34" rx="16" ry="4" fill="#6b7682"/></g>`;
}

export function scene() {
  return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" class="shop-scene">
  <defs>
    <linearGradient id="mysky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a2e"/><stop offset="1" stop-color="#1f3b57"/></linearGradient>
    <linearGradient id="myroad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3a4f"/><stop offset="1" stop-color="#141c2b"/></linearGradient>
    <radialGradient id="mylamp"><stop offset="0" stop-color="#ffb35c" stop-opacity="0.7"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <radialGradient id="myspill" cx="0.5" cy="0" r="0.8"><stop offset="0" stop-color="#eaffff" stop-opacity="0.45"/><stop offset="1" stop-color="#eaffff" stop-opacity="0"/></radialGradient>
    <filter id="myglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="800" height="400" fill="url(#mysky)"/>
  <!-- upper floor of the shophouse -->
  <rect x="120" y="40" width="680" height="120" fill="#efe1c4"/>
  <path d="M120 40 L460 10 L800 40Z" fill="#d9c7a1"/>
  ${[180, 330, 480, 630].map((x) => `<rect x="${x}" y="62" width="70" height="78" fill="#2f6b4f"/><g stroke="#24543d" stroke-width="3">${[0, 1, 2, 3, 4, 5].map((k) => `<line x1="${x}" y1="${70 + k * 12}" x2="${x + 70}" y2="${70 + k * 12}"/>`).join('')}</g><rect x="${x - 6}" y="56" width="82" height="6" fill="#c9b48a"/>`).join('')}
  <!-- signboard -->
  <rect x="120" y="160" width="680" height="34" fill="#c8102e"/>
  <g filter="url(#myglow)"><text x="400" y="185" font-size="22" font-weight="800" fill="#ffd400" text-anchor="middle" letter-spacing="2">KEDAI RUNCIT BUDI</text></g>
  <rect x="640" y="164" width="140" height="26" rx="4" fill="#ffd400"/><text x="710" y="182" font-size="13" font-weight="800" fill="#c8102e" text-anchor="middle">RESTORAN · 24 JAM</text>
  <!-- five-foot way: bright fluorescent interior behind the arches -->
  <rect x="120" y="194" width="680" height="110" fill="#eafcff"/>
  <rect x="140" y="200" width="200" height="4" fill="#ffffff" filter="url(#myglow)"/><rect x="520" y="200" width="200" height="4" fill="#ffffff" filter="url(#myglow)"/>
  <g opacity="0.95">${shelves(140, 212, 150)}${shelves(600, 212, 170)}</g>
  <!-- hanging kerepek packets -->
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${330 + i * 14}" y="206" width="10" height="16" rx="2" fill="${['#ffb703', '#fb8500', '#e63946', '#06d6a0'][i % 4]}"/>`).join('')}
  <!-- TV showing football -->
  <rect x="380" y="226" width="58" height="36" rx="3" fill="#1b1b22"/><rect x="383" y="229" width="52" height="30" fill="#2e9d4a"/><line x1="409" y1="229" x2="409" y2="259" stroke="#e8f5e9" stroke-width="1"/><circle cx="409" cy="244" r="6" fill="none" stroke="#e8f5e9" stroke-width="1"/>
  <!-- counter with kuih display -->
  <rect x="450" y="250" width="130" height="52" fill="#b5835a"/><rect x="456" y="236" width="118" height="18" fill="#e9fbff" stroke="#9fb3c4"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${460 + i * 14}" y="242" width="10" height="9" rx="2" fill="${['#ff8fab', '#80ed99', '#ffd166', '#c77dff'][i % 4]}"/>`).join('')}
  <!-- ceiling fans -->
  ${[230, 560].map((x) => `<g transform="translate(${x} 206)"><line x1="0" y1="-6" x2="0" y2="0" stroke="#555"/><ellipse cx="-14" cy="1" rx="14" ry="2.5" fill="#666"/><ellipse cx="14" cy="1" rx="14" ry="2.5" fill="#666"/></g>`).join('')}
  <!-- arches and pillars of the five-foot way -->
  ${[120, 230, 340, 560, 670].map(arch).join('')}
  <rect x="440" y="194" width="14" height="110" fill="#e9dcc0"/>
  <!-- neighbour shophouse (dark) -->
  <rect x="0" y="60" width="120" height="244" fill="#2a3346"/><rect x="20" y="90" width="34" height="40" fill="#ffd9a0" opacity="0.7"/><rect x="66" y="90" width="34" height="40" fill="#1a2132"/>
  <!-- street, drain, kerb -->
  <ellipse cx="460" cy="306" rx="340" ry="36" fill="url(#myspill)"/>
  <rect x="0" y="304" width="800" height="96" fill="url(#myroad)"/>
  <rect x="0" y="304" width="800" height="7" fill="#7f8a96"/><rect x="0" y="311" width="800" height="5" fill="#0b0f18"/>
  ${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 20 + 4}" y="311" width="10" height="5" fill="#3d4757"/>`).join('')}
  <g id="walkers"></g>
  <!-- plastic tables & stools, a kapcai -->
  ${table(150, 322)}${stool(112, 334, '#d62828')}${stool(188, 334, '#1d70b8')}
  ${table(690, 322)}${stool(652, 334, '#1d70b8')}${stool(728, 334, '#d62828')}
  <g transform="translate(560 330)"><circle cx="-26" cy="22" r="14" fill="none" stroke="#222" stroke-width="5"/><circle cx="26" cy="22" r="14" fill="none" stroke="#222" stroke-width="5"/><path d="M-26 22 L-4 6 L18 6 L26 22 M-4 6 L-10 -6 L4 -6 M18 6 L22 -10" stroke="#c0392b" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="-8" y="0" width="28" height="9" rx="4" fill="#2b2b2b"/></g>
  <!-- sodium street lamp -->
  <rect x="40" y="120" width="5" height="190" fill="#6b7682"/><circle cx="52" cy="122" r="44" fill="url(#mylamp)"/><rect x="40" y="117" width="22" height="7" rx="3" fill="#ffcf8a"/>
</svg>`;
}

export const MALAYSIA = {
  id: 'my', flag: '🇲🇾', country: 'Malaysia', name: 'Kedai Runcit & Mamak', native: 'Kedai Runcit Budi', lang: 'ms',
  tagline: 'Evening shift at a shophouse mamak',
  door: { x: 470, y: 300 }, walkY: 302, ground: 0.765,
  staffSays: L.thanks,
  items: ITEMS,
  music: 'my',
  scene, night, catSvg,
  snacks: Object.values(ITEMS).filter((i) => i.fav).map((i) => ({ emoji: i.emoji, native: i.ms, en: i.en })),
  currency: (n) => `RM${n.toFixed(2)}`,
  intro: {
    title: 'Kedai Runcit Budi · Evening Shift',
    text: 'Rain is falling on a Malaysian shophouse. Uncles, aunties and kids drop in for teh tarik, roti canai and nasi lemak. Serve them in Malay (and a little Manglish)!',
    learn: ['Penjodoh bilangan: sebiji, sebatang, sekeping, sekaki…', 'Calling strangers Pak cik, Mak cik, Kak, Adik', 'Prices in ringgit and sen', 'Manglish "lah" and "tapau"', '"Tak apa" and "Makan sini atau bungkus?"'],
  },
  facts: [
    { emoji: '🧩', title: 'Penjodoh bilangan', text: 'Like Japanese and Chinese, Malay counts with words that describe shape: biji (round), batang (long), keping (flat), even kaki ("leg") for umbrellas. Speakers of counter-word languages pay extra attention to what things are made of and their shape.', sure: '★★☆ Scientists are pretty sure', ref: 'Imai & Gentner (1997); Lucy (1992).' },
    { emoji: '👪', title: 'A family of strangers', text: 'Calling strangers Pak cik, Mak cik, Abang, Kak and Adik puts everyone into a family by age. Grammar like this may keep respect and closeness in view all the time.', sure: '☆☆☆ Just an idea so far', ref: '' },
    { emoji: '😎', title: 'Manglish & "lah"', text: '"lah" is a tiny word that makes a sentence friendlier or more persuasive. Malaysians mix languages so smoothly that words like "tapau" (from Cantonese) belong to everyone.', sure: '', ref: 'Goddard (1994). The meaning of lah. Oceanic Linguistics 33(1).' },
    { emoji: '🔁', title: 'Saying it twice', text: 'Malay doubles words to change their meaning: renyai-renyai (drizzling), kanak-kanak (children), rama-rama (butterfly). Doubling can mean "many", "kind of" or "keep doing".', sure: '', ref: '' },
  ],
};
