// 🇯🇵 Phase 1: あまやどり Amayadori, a rainy-night konbini.
// Teaches: staff greetings & politeness, counter words (助数詞), prices read
// in Japanese, katakana loanwords, konbini service questions, rain words.
import { catSvg } from './chibi.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// ── Numbers & prices ──────────────────────────────────────────────────────
const K = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const D = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const DR = ['', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū'];
const HUN = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
const HUNR = ['', 'hyaku', 'nihyaku', 'sanbyaku', 'yonhyaku', 'gohyaku', 'roppyaku', 'nanahyaku', 'happyaku', 'kyūhyaku'];
const THO = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];
const THOR = ['', 'sen', 'nisen', 'sanzen', 'yonsen', 'gosen', 'rokusen', 'nanasen', 'hassen', 'kyūsen'];

export function yen(n) {
  const th = Math.floor(n / 1000) % 10, h = Math.floor(n / 100) % 10, t = Math.floor(n / 10) % 10, u = n % 10;
  const kanji = (th ? `${th > 1 ? K[th] : ''}千` : '') + (h ? `${h > 1 ? K[h] : ''}百` : '') + (t ? `${t > 1 ? K[t] : ''}十` : '') + (u ? K[u] : '') + '円';
  const kana = THO[th] + HUN[h] + (t ? `${t > 1 ? D[t] : ''}じゅう` : '') + (u ? (u === 4 ? 'よ' : D[u]) : '') + 'えん';
  const romaji = [THOR[th], HUNR[h], t ? `${t > 1 ? DR[t] : ''}jū` : '', u ? (u === 4 ? 'yo' : DR[u]) : ''].filter(Boolean).join(' ') + ' en';
  return { kanji, kana, romaji };
}

// ── Counter words ─────────────────────────────────────────────────────────
export const COUNTERS = {
  hon:   { kanji: '本', name: 'hon',   rule: 'long, thin things: bottles, umbrellas, bananas', read: ['いっぽん', 'にほん', 'さんぼん', 'よんほん'], rom: ['ippon', 'nihon', 'sanbon', 'yonhon'] },
  ko:    { kanji: '個', name: 'ko',    rule: 'small, roundish or general things: rice balls, buns, ice cream', read: ['いっこ', 'にこ', 'さんこ', 'よんこ'], rom: ['ikko', 'niko', 'sanko', 'yonko'] },
  mai:   { kanji: '枚', name: 'mai',   rule: 'flat, thin things: stamps, masks, chocolate bars', read: ['いちまい', 'にまい', 'さんまい', 'よんまい'], rom: ['ichimai', 'nimai', 'sanmai', 'yonmai'] },
  satsu: { kanji: '冊', name: 'satsu', rule: 'books and magazines', read: ['いっさつ', 'にさつ', 'さんさつ', 'よんさつ'], rom: ['issatsu', 'nisatsu', 'sansatsu', 'yonsatsu'] },
  hiki:  { kanji: '匹', name: 'hiki',  rule: 'small animals: cats, dogs, fish', read: ['いっぴき', 'にひき', 'さんびき', 'よんひき'], rom: ['ippiki', 'nihiki', 'sanbiki', 'yonhiki'] },
};
export const counted = (c, q) => ({ jp: `${K[q]}${COUNTERS[c].kanji}`, kana: COUNTERS[c].read[q - 1], romaji: COUNTERS[c].rom[q - 1] });

// ── Items ─────────────────────────────────────────────────────────────────
export const ITEMS = {
  onigiri:   { emoji: '🍙', jp: 'おにぎり', romaji: 'onigiri', en: 'rice ball', counter: 'ko', price: 150, fav: true,
    snack: 'The #1 konbini food! A clever wrapper keeps the seaweed crispy until you pull the tabs: 1, 2, 3.' },
  bento:     { emoji: '🍱', jp: 'お弁当', kana: 'おべんとう', romaji: 'obentō', en: 'lunch box', counter: 'ko', price: 480, service: 'heat' },
  nikuman:   { emoji: '🥟', jp: '肉まん', kana: 'にくまん', romaji: 'nikuman', en: 'steamed meat bun', counter: 'ko', price: 180, fav: true,
    snack: 'Kept warm in a steamer next to the till. A favourite on cold, rainy nights.' },
  karaage:   { emoji: '🍗', jp: 'からあげ', romaji: 'karaage', en: 'piece of fried chicken', counter: 'ko', price: 80, fav: true,
    snack: 'Japanese fried chicken: crunchy, juicy and a top konbini hot snack.' },
  dango:     { emoji: '🍡', jp: 'だんご', romaji: 'dango', en: 'stick of rice dumplings', counter: 'hon', price: 120, fav: true,
    snack: 'Chewy rice dumplings on a stick. Because they come on a long skewer, you count them with 本!' },
  senbei:    { emoji: '🍘', jp: 'せんべい', romaji: 'senbei', en: 'rice cracker', counter: 'mai', price: 60, fav: true,
    snack: 'Crunchy rice crackers brushed with soy sauce. They\'re flat, so you count them with 枚.' },
  melonpan:  { emoji: '🍞', jp: 'メロンパン', romaji: 'meronpan', en: 'melon bread', counter: 'ko', price: 150, kata: true, fav: true,
    snack: 'A sweet bun with a crunchy cookie top that looks like a melon, but usually tastes of no melon at all!' },
  icecream:  { emoji: '🍨', jp: 'アイス', romaji: 'aisu', en: 'ice cream', counter: 'ko', price: 160, service: 'spoon', kata: true },
  cupnoodle: { emoji: '🍜', jp: 'カップラーメン', romaji: 'kappu rāmen', en: 'cup noodles', counter: 'ko', price: 210, service: 'chopsticks', kata: true },
  tea:       { emoji: '🍵', jp: 'お茶', kana: 'おちゃ', romaji: 'ocha', en: 'bottle of green tea', counter: 'hon', price: 140 },
  coffee:    { emoji: '☕', jp: 'コーヒー', romaji: 'kōhī', en: 'canned coffee', counter: 'hon', price: 130, kata: true },
  umbrella:  { emoji: '☂️', jp: '傘', kana: 'かさ', romaji: 'kasa', en: 'umbrella', counter: 'hon', price: 550, max: 1 },
  banana:    { emoji: '🍌', jp: 'バナナ', romaji: 'banana', en: 'banana', counter: 'hon', price: 60, kata: true },
  choco:     { emoji: '🍫', jp: '板チョコ', kana: 'いたチョコ', romaji: 'ita choko', en: 'chocolate bar', counter: 'mai', price: 120 },
  stamp:     { emoji: '✉️', jp: '切手', kana: 'きって', romaji: 'kitte', en: 'postage stamp', counter: 'mai', price: 110 },
  mask:      { emoji: '😷', jp: 'マスク', romaji: 'masuku', en: 'face mask', counter: 'mai', price: 100, kata: true },
  manga:     { emoji: '📕', jp: 'マンガ', romaji: 'manga', en: 'comic book', counter: 'satsu', price: 500, max: 2 },
  magazine:  { emoji: '📰', jp: '雑誌', kana: 'ざっし', romaji: 'zasshi', en: 'magazine', counter: 'satsu', price: 450, max: 2 },
};

const SERVICE = {
  heat:       { jp: '温めますか？', kana: 'あたためますか', romaji: 'Atatamemasu ka?', en: 'Shall I heat it up?', casual: '温める？' },
  spoon:      { jp: 'スプーンをおつけしますか？', romaji: 'Supūn o otsuke shimasu ka?', en: 'Shall I add a spoon?', casual: 'スプーンいる？' },
  chopsticks: { jp: 'お箸をおつけしますか？', kana: 'おはしをおつけしますか', romaji: 'Ohashi o otsuke shimasu ka?', en: 'Shall I add chopsticks?', casual: 'お箸いる？' },
};

// ── Customers ─────────────────────────────────────────────────────────────
export const PEOPLE = {
  kid: {
    jp: '小学生', en: 'Schoolkid', look: { hair: '#2b1d14', style: 'bob', outfit: '#ffd34d', legs: '#2c4a8a', acc: ['randoseru'] },
    line: { jp: 'これください！', romaji: 'Kore kudasai!', en: 'This, please!' }, items: ['icecream', 'choco', 'dango', 'melonpan', 'onigiri'],
    attitude: { emoji: '😄', label: 'Excited & casual', note: 'Kids talk in plain, casual Japanese. You still answer politely, because you\'re the shop staff.' },
  },
  worker: {
    jp: '会社員', en: 'Office worker', look: { hair: '#15151a', style: 'short', outfit: '#2b3a55', legs: '#1f2433', acc: ['tie', 'glasses'] },
    line: { jp: 'これ、お願いします。', romaji: 'Kore, onegai shimasu.', en: 'This, please.' }, items: ['coffee', 'onigiri', 'bento', 'karaage', 'umbrella', 'tea', 'magazine'],
    attitude: { emoji: '⏱️', label: 'Quiet & in a hurry', note: 'A quick, quiet exchange is normal and polite at a konbini. No small talk needed, but don\'t keep them waiting!' },
    hurry: true,
  },
  grandma: {
    jp: 'おばあちゃん', en: 'Grandma', look: { hair: '#dcdcdc', style: 'bun', outfit: '#8c6bb1', legs: '#3d2f4f', acc: ['cane'] },
    line: { jp: 'これをいただけますか。', romaji: 'Kore o itadakemasu ka.', en: 'May I have this?' }, items: ['banana', 'nikuman', 'senbei', 'dango', 'tea', 'stamp'],
    attitude: { emoji: '🙇', label: 'Very polite', note: 'She uses humble keigo (いただけますか, "may I humbly receive") and thanks you with すみません.' },
  },
  student: {
    jp: '大学生', en: 'University student', look: { hair: '#6b4428', style: 'long', outfit: '#f4f4f4', legs: '#1b1b22', acc: ['umbrella'] },
    line: { jp: 'これください。', romaji: 'Kore kudasai.', en: 'This, please.' }, items: ['cupnoodle', 'manga', 'karaage', 'melonpan', 'umbrella'],
    attitude: { emoji: '🤫', label: 'Indirect', note: 'Says "no" softly, without the word "no". You have to read the air (空気を読む).' },
  },
  tourist: {
    jp: '観光客', en: 'Tourist', look: { hair: '#e8c15a', style: 'spiky', outfit: '#3fa36b', legs: '#34495e', acc: ['backpack', 'cap'] },
    line: { jp: null, romaji: '', en: 'Hi! Um… this one, please?' }, items: ['coffee', 'icecream', 'melonpan', 'mask', 'cupnoodle'],
    attitude: { emoji: '🧳', label: 'Unsure but friendly', note: 'Can\'t read Japanese labels yet. Help with katakana, the alphabet used for foreign words.' },
  },
};

const WEATHER = [
  { word: 'ぽつぽつ', romaji: 'potsu-potsu', en: 'drip, drop: rain is just starting', level: 0.22 },
  { word: 'しとしと', romaji: 'shito-shito', en: 'soft, steady rain', level: 0.5 },
  { word: 'ざあざあ', romaji: 'zā-zā', en: 'pouring rain!', level: 1 },
];

const L = {
  welcome: { jp: 'いらっしゃいませ', romaji: 'irasshaimase', en: 'Welcome! (said by shop staff)' },
  thanks: { jp: 'ありがとうございました', romaji: 'arigatō gozaimashita', en: 'Thank you very much (said as the customer leaves)' },
  amayadori: { jp: '雨宿り', kana: 'あまやどり', romaji: 'amayadori', en: 'sheltering from the rain' },
};

// ── Steps (generic format understood by the engine) ───────────────────────
function greetStep() {
  return {
    prompt: 'A customer walks in, shaking off the rain. What do you say?',
    options: shuffle([
      { main: 'いらっしゃいませ！', sub: 'irasshaimase', ok: true },
      { main: 'おはよう！', sub: 'ohayō: "morning!" (to friends)' },
      { main: 'さようなら', sub: 'sayōnara: "goodbye"' },
    ]),
    explain: '<b>いらっしゃいませ</b> means "Welcome!". Japanese shop staff say it to <i>every</i> customer who walks in, even kids.',
    learn: [L.welcome],
  };
}

function counterStep(item, q) {
  const it = ITEMS[item];
  const right = counted(it.counter, q);
  const others = shuffle(Object.keys(COUNTERS).filter((c) => c !== it.counter && c !== 'hiki')).slice(0, 2);
  return {
    show: { item, q },
    prompt: `How do you count <b>${q} ${it.en}${q > 1 ? 's' : ''}</b> in Japanese?`,
    options: shuffle([
      { main: right.jp, sub: right.kana, ok: true },
      ...others.map((c) => { const w = counted(c, q); return { main: w.jp, sub: w.kana }; }),
    ]),
    explain: `<b>${right.jp}</b> (${right.kana}, ${right.romaji}). Japanese counts with special words by <b>shape</b>: ${COUNTERS[it.counter].kanji} is for ${COUNTERS[it.counter].rule}.`,
    learn: [{ jp: `${it.jp} ${right.jp}`, kana: `${it.kana ?? it.jp} ${right.kana}`, romaji: `${it.romaji} ${right.romaji}`, en: `${q} ${it.en}${q > 1 ? 's' : ''}` }],
    tag: 'counter',
    snack: it.snack,
  };
}

function serviceStep(item) {
  const it = ITEMS[item];
  const s = SERVICE[it.service];
  const other = SERVICE[pick(Object.keys(SERVICE).filter((k) => k !== it.service))];
  return {
    show: { item, q: 1 },
    prompt: `They're buying ${it.emoji} <b>${it.en}</b>. What do you ask, politely?`,
    options: shuffle([
      { main: s.jp, sub: s.en, ok: true },
      { main: s.casual, sub: 'same question, but casual (friends only)' },
      { main: other.jp, sub: other.en },
    ]),
    explain: `<b>${s.jp}</b> (${s.romaji}) means "${s.en}". Konbini staff always use the polite <b>-masu</b> form with customers, never the casual "${s.casual}". Politeness is built into Japanese grammar!`,
    learn: [{ jp: s.jp, kana: s.kana, romaji: s.romaji, en: s.en }],
    tag: 'polite',
  };
}

function priceStep(total, digitsToJapanese) {
  const right = yen(total);
  const pool = [...new Set([total + 100, total - 100, total + 10, total - 10, total + 50, total * 2]
    .filter((v) => v > 0 && v !== total && v < 10000))];
  const wrong = shuffle(pool).slice(0, 3);
  if (digitsToJapanese) {
    return {
      prompt: `The register shows <b class="big-num">¥${total}</b>. How do you say the price?`,
      options: shuffle([{ main: right.kanji, sub: right.kana, ok: true }, ...wrong.slice(0, 2).map((v) => ({ main: yen(v).kanji, sub: yen(v).kana }))]),
      explain: `<b>${right.kanji}</b> = ${right.kana} (${right.romaji}). Japanese numbers explain themselves: 三百五十 is literally "three-hundred five-ten".`,
      learn: [{ jp: right.kanji, kana: right.kana, romaji: right.romaji, en: `¥${total}` }],
      yen: total,
      tag: 'number',
    };
  }
  return {
    prompt: `The customer asks: <b class="jp-big">${right.kanji}ですか？</b><br><span class="muted">${right.kana} desu ka? (Is it … ?)</span> Which price is it?`,
    options: shuffle([{ main: `¥${total}`, ok: true }, ...wrong.map((v) => ({ main: `¥${v}` }))]),
    explain: `${right.kanji} = <b>¥${total}</b>. Read it piece by piece: ${right.romaji}.`,
    learn: [{ jp: right.kanji, kana: right.kana, romaji: right.romaji, en: `¥${total}` }],
    yen: total,
    tag: 'number',
  };
}

function katakanaStep(item) {
  const it = ITEMS[item];
  const decoys = shuffle(Object.values(ITEMS).filter((x) => x.kata && x !== it)).slice(0, 2);
  return {
    show: { item, q: 1 },
    prompt: `The tourist points at ${it.emoji} and asks what the label says. Which katakana word is it?`,
    options: shuffle([{ main: it.jp, sub: it.romaji, ok: true }, ...decoys.map((d) => ({ main: d.jp, sub: d.romaji }))]),
    explain: `<b>${it.jp}</b> (${it.romaji}) = "${it.en}". Words borrowed from other languages are written in <b>katakana</b>, the sharp-angled alphabet.`,
    learn: [{ jp: it.jp, romaji: it.romaji, en: it.en }],
    tag: 'kana',
    snack: it.snack,
  };
}

function catStep() {
  return {
    special: 'cat',
    prompt: 'A soaked cat dashes under the shop roof to escape the rain. How do you count <b>one cat</b>?',
    options: shuffle([
      { main: '一匹', sub: 'いっぴき', ok: true },
      { main: '一本', sub: 'いっぽん' },
      { main: '一個', sub: 'いっこ' },
    ]),
    explain: '<b>一匹</b> (ippiki): 匹 counts small animals. The cat is doing <b>雨宿り</b> (amayadori), "sheltering from the rain", which is the name of our shop! 🐈',
    learn: [{ jp: '猫 一匹', kana: 'ねこ いっぴき', romaji: 'neko ippiki', en: 'one cat' }, L.amayadori],
    tag: 'counter',
  };
}

// Attitude: the indirect "no". 大丈夫です literally means "I'm fine / it's OK".
function indirectStep() {
  return {
    staff: { jp: '袋はご利用ですか？', romaji: 'Fukuro wa go-riyō desu ka?', en: 'Would you like a bag?' },
    reply: { jp: 'あ、大丈夫です。', romaji: 'A, daijōbu desu.', en: '(literally) "Ah, it\'s fine."' },
    prompt: 'You asked if they want a bag. They smile and say <b class="jp-big">あ、大丈夫です。</b> What do they mean?',
    options: shuffle([
      { main: 'No thanks, I don\'t need one', ok: true },
      { main: 'Yes, a bag would be fine', sub: 'the literal meaning, but not what they mean' },
      { main: 'I\'m feeling OK today' },
    ]),
    explain: '<b>大丈夫です</b> ("it\'s fine") is a polite way to say <b>no thanks</b>. Many Japanese speakers avoid a blunt いいえ ("no") to keep things smooth: you read the meaning from the situation.',
    learn: [{ jp: '袋はご利用ですか？', romaji: 'fukuro wa go-riyō desu ka', en: 'Would you like a bag?' }, { jp: '大丈夫です', kana: 'だいじょうぶです', romaji: 'daijōbu desu', en: '"It\'s fine": a polite "no thanks"' }],
    tag: 'attitude',
  };
}

// Attitude: すみません = sorry / excuse me / thank you, all in one.
function sumimasenStep() {
  return {
    reply: { jp: 'すみませんねえ。', romaji: 'Sumimasen nē.', en: '(literally) "I\'m sorry."' },
    prompt: 'You hand over her bag. She bows and says <b class="jp-big">すみませんねえ。</b> Why is she saying "sorry"?',
    options: shuffle([
      { main: 'It\'s her polite way of saying thank you', ok: true },
      { main: 'She is upset with you' },
      { main: 'She forgot her wallet' },
    ]),
    explain: '<b>すみません</b> means "sorry", "excuse me" <i>and</i> "thank you". Thanking someone by apologising for the trouble you caused them is a very Japanese kind of politeness.',
    learn: [{ jp: 'すみません', romaji: 'sumimasen', en: 'sorry / excuse me / thank you' }],
    tag: 'attitude',
  };
}

// One night: 6 customers while the rain builds, plus the cat.
function night() {
  const order = ['worker', 'kid', 'grandma', 'tourist', 'student', pick(['worker', 'grandma', 'kid'])];
  return order.map((who, i) => {
    const p = PEOPLE[who];
    const item = pick(p.items);
    const it = ITEMS[item];
    const q = Math.min(1 + Math.floor(Math.random() * 3), it.max ?? 3);
    const steps = [];
    if (i === 0 || (i === 3 && Math.random() < 0.5)) steps.push(greetStep());
    steps.push(who === 'tourist' && it.kata ? katakanaStep(item) : counterStep(item, q));
    if (it.service && (who !== 'tourist' || Math.random() < 0.5)) steps.push(serviceStep(item));
    steps.push(priceStep(it.price * q, i % 2 === 0));
    if (who === 'student' || (who === 'worker' && Math.random() < 0.4)) steps.push(indirectStep());
    if (who === 'grandma') steps.push(sumimasenStep());
    return { who, person: p, item, q, weather: WEATHER[Math.min(Math.floor(i / 2), 2)], steps, catAfter: i === 4 ? catStep() : null };
  });
}

// Mum's shopping list for the 3D shop: 3 different things, read with counters.
const SHOPPABLE = ['onigiri', 'tea', 'coffee', 'senbei', 'choco', 'melonpan', 'cupnoodle', 'icecream', 'dango', 'bento', 'mask', 'manga', 'magazine'];
export function shoppingList() {
  return shuffle(SHOPPABLE).slice(0, 3).map((item) => {
    const it = ITEMS[item];
    const q = Math.min(1 + Math.floor(Math.random() * 3), it.max ?? 3);
    return { item, q, text: `${it.jp} ${counted(it.counter, q).jp}`, reading: `${it.romaji} ${counted(it.counter, q).romaji}` };
  });
}

// ── Scene: a glowing konbini on a rainy street (SVG, viewBox 800×400) ──────
function shelves(x0, y0, w, rows, seed) {
  let s = seed, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cols = ['#f25c54', '#f7b267', '#4ea8de', '#80ed99', '#ffd166', '#c77dff', '#ff8fab', '#ffffff'];
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * 24;
    out += `<rect x="${x0}" y="${y + 18}" width="${w}" height="3" fill="#c9d3dc"/>`;
    for (let x = x0 + 2; x < x0 + w - 6;) {
      const bw = 5 + rnd() * 7, bh = 8 + rnd() * 9;
      out += `<rect x="${x.toFixed(1)}" y="${(y + 18 - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1" fill="${cols[Math.floor(rnd() * cols.length)]}" opacity="0.9"/>`;
      x += bw + 1.5;
    }
  }
  return out;
}

function fridge(x0, y0, doors) {
  let out = '';
  for (let d = 0; d < doors; d++) {
    const x = x0 + d * 44;
    out += `<rect x="${x}" y="${y0}" width="42" height="120" fill="#eaf6ff" stroke="#9fb3c4" stroke-width="2"/>`;
    for (let r = 0; r < 5; r++) {
      for (let b = 0; b < 5; b++) {
        out += `<rect x="${x + 4 + b * 7.5}" y="${y0 + 6 + r * 23}" width="5" height="15" rx="2" fill="${['#2ec4b6', '#e71d36', '#ff9f1c', '#3a86ff', '#8ac926'][(b + r + d) % 5]}"/>`;
      }
      out += `<rect x="${x + 2}" y="${y0 + 22 + r * 23}" width="38" height="2" fill="#b8c6d3"/>`;
    }
  }
  return out;
}

function facade() {
  return `
    <rect x="250" y="70" width="560" height="236" fill="#dfe6ee"/>
    <rect x="250" y="70" width="560" height="10" fill="#f5f7fa"/>
    <rect x="250" y="80" width="560" height="8" fill="#22a387"/>
    <rect x="250" y="88" width="560" height="44" fill="#fbfdff"/>
    <rect x="250" y="132" width="560" height="6" fill="#f39a1e"/>
    <rect x="250" y="138" width="560" height="10" fill="#1d6f8c"/>
    <g filter="url(#glow)">
      <text x="452" y="122" font-size="30" font-weight="700" fill="#2e9e6e" text-anchor="middle" font-family="'Hiragino Maru Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif">あまやどり</text>
    </g>
    <text x="452" y="131" font-size="7" fill="#6aa58a" text-anchor="middle" letter-spacing="3">AMAYADORI · 24 HOURS</text>
    <circle cx="350" cy="110" r="14" fill="#2e9e6e"/><path d="M341 112 Q350 96 359 112Z" fill="#fff"/><line x1="350" y1="106" x2="350" y2="118" stroke="#fff" stroke-width="1.6"/>
    <rect x="700" y="92" width="44" height="36" rx="4" fill="#f39a1e"/><text x="722" y="119" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">24</text>
    <rect x="262" y="150" width="536" height="148" fill="#fffbe9"/>
    <g opacity="0.95">${shelves(268, 160, 150, 5, 7)}${shelves(526, 160, 90, 5, 31)}</g>
    <rect x="290" y="262" width="110" height="34" fill="#c7d0d9"/><rect x="300" y="250" width="34" height="14" rx="2" fill="#41505e"/><rect x="304" y="253" width="26" height="8" fill="#7ee8fa"/>
    <rect x="270" y="168" width="40" height="22" fill="#e63946"/><text x="290" y="184" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">おでん</text>
    ${fridge(624, 168, 4)}
    <g stroke="#7d8d9c" stroke-width="3" fill="none">
      <rect x="430" y="150" width="88" height="148"/><line x1="474" y1="150" x2="474" y2="298"/>
    </g>
    <rect x="432" y="152" width="84" height="144" fill="#ffffff" opacity="0.18"/>
    <line x1="262" y1="150" x2="798" y2="150" stroke="#8796a5" stroke-width="3"/>
    <rect x="440" y="290" width="68" height="8" fill="#4a5866"/>`;
}

export function scene() {
  return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" class="shop-scene">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1130"/><stop offset="1" stop-color="#28305c"/></linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9805e"/><stop offset="1" stop-color="#e6aa82"/></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4466"/><stop offset="1" stop-color="#1b2140"/></linearGradient>
    <radialGradient id="spill" cx="0.5" cy="0" r="0.8"><stop offset="0" stop-color="#fff6d0" stop-opacity="0.55"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
    <radialGradient id="lanternGlow"><stop offset="0" stop-color="#ffb066" stop-opacity="0.8"/><stop offset="1" stop-color="#ffb066" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="4"/></filter>
    <clipPath id="below"><rect x="0" y="306" width="800" height="94"/></clipPath>
    <g id="facade">${facade()}</g>
  </defs>
  <rect width="800" height="400" fill="url(#sky)"/>
  <rect x="0" y="40" width="260" height="266" fill="url(#wall)"/>
  <rect x="40" y="70" width="42" height="56" fill="#16264a" stroke="#6b4a36" stroke-width="3"/><rect x="48" y="80" width="10" height="16" fill="#fff4c2" opacity="0.8"/>
  <rect x="120" y="150" width="70" height="150" fill="#3a2a1e"/><rect x="124" y="156" width="62" height="58" fill="#1f3c88"/>
  <text x="155" y="196" font-size="18" fill="#fff" text-anchor="middle" font-family="'Yu Gothic','Noto Sans JP',sans-serif">とりや</text>
  <circle cx="102" cy="176" r="40" fill="url(#lanternGlow)"/><ellipse cx="102" cy="176" rx="14" ry="19" fill="#e2502f"/><text x="102" y="182" font-size="13" fill="#2b0f08" text-anchor="middle" font-weight="700">焼</text>
  <rect x="10" y="150" width="60" height="44" fill="#eef1f4"/><rect x="14" y="154" width="24" height="16" fill="#9fb8d6"/><rect x="40" y="154" width="26" height="36" fill="#d9e0e8"/>
  <rect x="200" y="258" width="18" height="42" fill="#2f6fb0"/><rect x="219" y="258" width="18" height="42" fill="#2f6fb0"/><rect x="238" y="258" width="18" height="42" fill="#f08a24"/>
  <use href="#facade"/>
  <ellipse cx="530" cy="306" rx="330" ry="40" fill="url(#spill)"/>
  <rect x="0" y="306" width="800" height="94" fill="url(#road)"/>
  <rect x="0" y="306" width="800" height="5" fill="#e3c84a" opacity="0.85"/>
  <g clip-path="url(#below)" opacity="0.28" filter="url(#soft)"><use href="#facade" transform="translate(0 612) scale(1 -1)"/></g>
  <g id="walkers"></g>
  <rect x="610" y="40" width="14" height="300" fill="#7f8ea0"/>
  <g class="fence" fill="#aab8d6">
    <rect x="0" y="330" width="800" height="6"/><rect x="0" y="372" width="800" height="6"/>
    ${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 20 + 6}" y="336" width="3.5" height="36"/>`).join('')}
    ${[60, 300, 540, 760].map((x) => `<rect x="${x}" y="322" width="10" height="66" rx="3"/><circle cx="${x + 5}" cy="321" r="7"/>`).join('')}
  </g>
</svg>`;
}

export const JAPAN = {
  id: 'jp', flag: '🇯🇵', country: 'Japan', name: 'Amayadori Konbini', native: 'あまやどり', lang: 'ja',
  tagline: 'Night shift at a rainy convenience store',
  door: { x: 474, y: 300 }, walkY: 300, ground: 0.765,
  staffSays: L.thanks,
  items: ITEMS,
  music: 'jp',
  world: true,
  shoppingList, counted, yen, counters: COUNTERS,
  snacks: Object.values(ITEMS).filter((i) => i.fav).map((i) => ({ emoji: i.emoji, native: i.jp, en: i.en })),
  scene, night, catSvg,
  intro: {
    title: 'あまやどり Night Shift',
    text: 'It\'s a rainy night in Japan, and people keep ducking into your konbini (convenience store) to escape the rain. Serve them in real Japanese!',
    learn: ['Counter words that sort things by shape', 'Polite shop Japanese', 'Prices in Japanese', 'Katakana words', 'Rain sounds: ぽつぽつ, ざあざあ'],
  },
  facts: [
    { emoji: '🧩', title: 'Counting by shape', text: 'Japanese (like Chinese, Korean, Thai and Malay) counts with counter words: 本 for long things, 枚 for flat things, 個 for round-ish things, and it has no "a / some" grammar for nouns. In a famous study, Japanese speakers grouped simple new things more by what they were made of, while English speakers grouped them more by shape.', sure: '★★☆ Scientists are pretty sure', ref: 'Imai & Gentner (1997). Cognition 62.' },
    { emoji: '🌧️', title: 'Sound words', text: 'Japanese has hundreds of sound-symbolic words like ぽつぽつ (drip-drop) and ざあざあ (pouring). They help Japanese toddlers learn new action words faster.', sure: '★★☆ Scientists are pretty sure', ref: 'Imai et al. (2008). Cognition 109.' },
    { emoji: '🙇', title: 'Polite shop Japanese', text: 'Staff use the most polite Japanese with every customer, and say ありがとうございました in the past tense as you leave. Grammar that forces you to choose a politeness level keeps everyone thinking about respect.', sure: '★☆☆ Scientists are still checking', ref: 'Ide (1989). Multilingua 8.' },
    { emoji: '🤫', title: 'Saying "no" without "no"', text: 'In Japanese, a lot of meaning is left unsaid and read from the situation (大丈夫です = "no thanks"). This "high-context" style goes with valuing harmony. It\'s a common habit, not a rule: every person is different!', sure: '★☆☆ Scientists are still checking', ref: 'Hall (1976). Beyond Culture.' },
  ],
};
