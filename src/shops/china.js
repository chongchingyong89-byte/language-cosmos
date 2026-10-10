// 🇨🇳 Phase 3: 小卖部 (xiǎomàibù), a tiny corner shop by an apartment gate
// on a stormy summer night. Teaches: measure words (个 瓶 张 包 根 把…),
// 两 vs 二, prices in 块 and 毛, tones (四 sì vs 十 shí, 买 mǎi vs 卖 mài),
// addressing people (叔叔 阿姨 大爷 老板), 扫码, 不用了, 慢走.
import { catSvg } from './chibi.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

// ── Numbers & prices ──────────────────────────────────────────────────────
const D = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const P = ['líng', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];
export function zhNum(n) {
  if (n < 10) return { zh: D[n], py: P[n] };
  const t = Math.floor(n / 10), u = n % 10;
  // Pinyin puts an apostrophe before a syllable starting with a vowel: shí'èr.
  const up = u ? `${u === 2 ? "'" : ''}${P[u]}` : '';
  if (n < 20) return { zh: `十${u ? D[u] : ''}`, py: `shí${up}` };
  return { zh: `${D[t]}十${u ? D[u] : ''}`, py: `${P[t]}shí${up}` };
}

// Prices are stored in 毛 (jiao): 10 毛 = 1 块 (yuan). Said the everyday way:
// 3.5元 = 三块五, 2元 = 两块, 0.5元 = 五毛.
export function yuan(j) {
  const y = Math.floor(j / 10), m = j % 10;
  let zh = '', py = '';
  if (y) {
    const n = y === 2 ? { zh: '两', py: 'liǎng' } : y === 1 ? { zh: '一', py: 'yí' } : zhNum(y);
    zh = `${n.zh}块`;
    py = `${n.py} kuài`;
    if (m) { zh += D[m]; py += ` ${P[m]}`; }
  } else {
    const n = m === 2 ? { zh: '两', py: 'liǎng' } : m === 1 ? { zh: '一', py: 'yì' } : { zh: D[m], py: P[m] };
    zh = `${n.zh}毛`;
    py = `${n.py} máo`;
  }
  return { zh, py, short: `${(j / 10).toFixed(1).replace(/\.0$/, '')}元` };
}

// ── Measure words (量词): every noun needs one when you count it ─────────
// tone4: the measure word has a falling tone, so 一 is said yí before it.
export const COUNTERS = {
  ge:    { word: '个', py: 'ge', tone4: true, rule: 'all-purpose: buns, eggs, people' },
  ping:  { word: '瓶', py: 'píng', rule: 'bottles' },
  zhang: { word: '张', py: 'zhāng', rule: 'flat things: stickers, paper, tickets, tables' },
  bao:   { word: '包', py: 'bāo', rule: 'packets and bags' },
  gen:   { word: '根', py: 'gēn', rule: 'long thin things: ice lollies, bananas, noodles' },
  ben:   { word: '本', py: 'běn', rule: 'books and notebooks' },
  ba:    { word: '把', py: 'bǎ', rule: 'things you hold by a handle: umbrellas, chairs, knives' },
  chuan: { word: '串', py: 'chuàn', tone4: true, rule: 'things on a string or skewer' },
  tong:  { word: '桶', py: 'tǒng', rule: 'tubs and buckets' },
  fen:   { word: '份', py: 'fèn', tone4: true, rule: 'portions and copies (newspapers)' },
  zhi:   { word: '只', py: 'zhī', rule: 'animals' },
};
export function counted(c, q) {
  const C = COUNTERS[c];
  const n = q === 1 ? { zh: '一', py: C.tone4 ? 'yí' : 'yì' } : q === 2 ? { zh: '两', py: 'liǎng' } : zhNum(q);
  return { zh: `${n.zh}${C.word}`, py: `${n.py} ${C.py}` };
}

export const ITEMS = {
  hongcha:  { emoji: '🧃', zh: '冰红茶', py: 'bīng hóngchá', en: 'iced tea', counter: 'ping', price: 30, fav: true,
    snack: 'Bottled iced lemon tea: on every shelf in China, and the drink of choice on a sticky summer night.' },
  shui:     { emoji: '💧', zh: '矿泉水', py: 'kuàngquánshuǐ', en: 'bottled water', counter: 'ping', price: 20 },
  baozi:    { emoji: '🥟', zh: '包子', py: 'bāozi', en: 'steamed bun', counter: 'ge', price: 15, fav: true,
    snack: 'Fluffy steamed buns stuffed with pork or vegetables, kept warm in a bamboo steamer by the till.' },
  chayedan: { emoji: '🥚', zh: '茶叶蛋', py: 'cháyèdàn', en: 'tea egg', counter: 'ge', price: 15, fav: true,
    snack: 'Eggs simmered for hours in tea, soy sauce and star anise. Cracking the shell first makes a marble pattern!' },
  latiao:   { emoji: '🌶️', zh: '辣条', py: 'làtiáo', en: 'spicy strips', counter: 'bao', price: 10, fav: true,
    snack: 'Chewy, fiery wheat-gluten strips: the most famous school-gate snack in China, about one 块 a packet.' },
  guazi:    { emoji: '🌻', zh: '瓜子', py: 'guāzǐ', en: 'sunflower seeds', counter: 'bao', price: 50, fav: true,
    snack: 'Cracked open with your front teeth while chatting. Families get through mountains of them at New Year.' },
  binggun:  { emoji: '🍡', zh: '冰棍', py: 'bīnggùn', en: 'ice lolly', counter: 'gen', price: 10, fav: true,
    snack: 'Long and thin, so it takes 根. On hot nights kids queue at the freezer chest outside.' },
  tanghulu: { emoji: '🍢', zh: '糖葫芦', py: 'tánghúlu', en: 'candied haws', counter: 'chuan', price: 50, fav: true, max: 2,
    snack: 'Hawthorn berries on a stick in a crunchy shell of hard sugar. Counted with 串, "a string of".' },
  mian:     { emoji: '🍜', zh: '方便面', py: 'fāngbiànmiàn', en: 'cup noodles', counter: 'tong', price: 45,
    snack: '"Convenient noodles". The big cup kind is counted with 桶 (bucket)!' },
  tiezhi:   { emoji: '⭐', zh: '贴纸', py: 'tiēzhǐ', en: 'sticker', counter: 'zhang', price: 5 },
  benzi:    { emoji: '📓', zh: '本子', py: 'běnzi', en: 'notebook', counter: 'ben', price: 30, max: 2 },
  baozhi:   { emoji: '📰', zh: '报纸', py: 'bàozhǐ', en: 'newspaper', counter: 'fen', price: 20, max: 1 },
  san:      { emoji: '☂️', zh: '雨伞', py: 'yǔsǎn', en: 'umbrella', counter: 'ba', price: 250, max: 1 },
};

// ── Customers and their attitudes ─────────────────────────────────────────
// `call` is how a child shop helper would address them.
export const PEOPLE = {
  daye: {
    zh: '大爷', py: 'dàye', en: 'Grandpa next door', call: '大爷', callPy: 'dàye',
    look: { hair: '#d9d9d9', style: 'short', outfit: '#f4f4f4', legs: '#3b3b48', acc: ['glasses'] },
    items: ['hongcha', 'shui', 'baozhi', 'guazi'],
    attitude: { emoji: '👍', label: 'Direct & warm', note: 'He says 来 ("come") instead of "please may I have". Short, direct requests are normal and friendly in Mandarin. The warmth comes from calling you 小朋友, "little friend".' },
  },
  ayi: {
    zh: '阿姨', py: 'āyí', en: 'Auntie', call: '阿姨', callPy: 'āyí',
    look: { hair: '#2b1d14', style: 'bob', outfit: '#d9567c', legs: '#4a3a5a', acc: [] },
    items: ['chayedan', 'baozi', 'mian', 'guazi'],
    attitude: { emoji: '🧮', label: 'Careful with money', note: 'She checks every price: 精打细算, "calculating finely". Asking 多少钱? (how much?) before buying is just good sense, not rude.' },
  },
  xuesheng: {
    zh: '小学生', py: 'xiǎoxuéshēng', en: 'Schoolkid', call: '小朋友', callPy: 'xiǎopéngyǒu',
    look: { hair: '#1b1b1b', style: 'spiky', outfit: '#ffffff', legs: '#1f4fa0', acc: ['randoseru'] },
    items: ['latiao', 'binggun', 'tiezhi', 'tanghulu'],
    attitude: { emoji: '🤩', label: 'Excited', note: 'He calls you 老板 ("boss"), the way everyone talks to a shopkeeper, even a kid helping out.' },
  },
  xiaoge: {
    zh: '外卖小哥', py: 'wàimài xiǎogē', en: 'Delivery rider', call: '小哥', callPy: 'xiǎogē',
    look: { hair: '#1e1e1e', style: 'short', outfit: '#ffcc00', legs: '#2b2f3a', acc: ['cap'] },
    items: ['hongcha', 'mian', 'baozi', 'shui'],
    attitude: { emoji: '⚡', label: 'Racing the clock', note: 'Delivery riders have minutes per order. 快快快 ("quick quick quick") sounds urgent, but it is not meant rudely.' },
    hurry: true,
  },
  shushu: {
    zh: '叔叔', py: 'shūshu', en: 'Office worker', call: '叔叔', callPy: 'shūshu',
    look: { hair: '#2b2b2b', style: 'short', outfit: '#2b3a55', legs: '#1f2433', acc: ['tie'] },
    items: ['guazi', 'hongcha', 'benzi', 'latiao'],
    attitude: { emoji: '🙂', label: 'Polite & reserved', note: 'He turns down a bag with 不用了，谢谢 ("no need, thanks"): a soft no that keeps everyone comfortable.' },
  },
  tourist: {
    zh: '游客', py: 'yóukè', en: 'Tourist', call: null,
    look: { hair: '#e8c15a', style: 'spiky', outfit: '#3fa36b', legs: '#34495e', acc: ['backpack', 'cap'] },
    items: ['san'],
    attitude: { emoji: '🧳', label: 'Curious visitor', note: 'Teach them a handy measure word: an umbrella is held by its handle, so it takes 把.' },
  },
};

const WEATHER = [
  { word: '毛毛雨', romaji: 'máomaoyǔ', en: 'drizzle ("hairy rain")', level: 0.25 },
  { word: '下雨了', romaji: 'xià yǔ le', en: "it's raining", level: 0.55 },
  { word: '雷阵雨', romaji: 'léizhènyǔ', en: 'thunderstorm', level: 1 },
];

// Learned lines use the shared shape { jp: text, romaji: reading, en }.
const t = (zh, py, en) => ({ jp: zh, romaji: py, en });
const L = { bye: t('慢走，欢迎再来', 'màn zǒu, huānyíng zài lái', 'Take care, come again!') };

// ── Steps ─────────────────────────────────────────────────────────────────
function callStep(p) {
  const all = [['叔叔', 'shūshu'], ['阿姨', 'āyí'], ['大爷', 'dàye'], ['小朋友', 'xiǎopéngyǒu'], ['小哥', 'xiǎogē']];
  const wrong = shuffle(all.filter(([c]) => c !== p.call)).slice(0, 2);
  return {
    prompt: `How do you politely call this customer? <span class="muted">(${p.en})</span>`,
    options: shuffle([{ main: `${p.call}，您好！`, sub: p.callPy, ok: true }, ...wrong.map(([c, py]) => ({ main: `${c}，您好！`, sub: py }))]),
    explain: `<b>${p.call}</b> (${p.callPy}). Children call grown-ups by family words: 叔叔 (uncle), 阿姨 (auntie), 大爷 (grandpa), and friendly young men are 小哥 ("little big brother"). <b>您</b> is the respectful "you".`,
    learn: [t(p.call, p.callPy, `how to address: ${p.en.toLowerCase()}`), t('您好', 'nín hǎo', 'hello (respectful)')],
    tag: 'attitude',
  };
}

function counterStep(item, q) {
  const it = ITEMS[item];
  const right = counted(it.counter, q);
  const others = shuffle(Object.keys(COUNTERS).filter((c) => c !== it.counter && c !== 'zhi')).slice(0, 2);
  return {
    show: { item, q },
    prompt: `They mumbled the measure word. How do you say <b>${q} ${it.en}${q > 1 ? 's' : ''}</b>?`,
    options: shuffle([
      { main: `${right.zh}${it.zh}`, sub: `${right.py} ${it.py}`, ok: true },
      ...others.map((c) => { const w = counted(c, q); return { main: `${w.zh}${it.zh}`, sub: `${w.py} ${it.py}` }; }),
    ]),
    explain: `<b>${right.zh}${it.zh}</b>. In Chinese every counted noun needs a <b>measure word</b> (量词): <b>${COUNTERS[it.counter].word}</b> is for ${COUNTERS[it.counter].rule}. 个 works for many things, but the right one sounds much more natural.`,
    learn: [t(`${right.zh}${it.zh}`, `${right.py} ${it.py}`, `${q} × ${it.en}`)],
    tag: 'counter',
    snack: it.snack,
  };
}

function liangStep(item) {
  const it = ITEMS[item], C = COUNTERS[it.counter];
  return {
    prompt: `Grandpa holds up two fingers. Which is the right way to say <b>two</b> here?`,
    options: shuffle([
      { main: `两${C.word}${it.zh}`, sub: `liǎng ${C.py}`, ok: true },
      { main: `二${C.word}${it.zh}`, sub: `èr ${C.py}` },
      { main: `二个${it.zh}`, sub: 'èr ge' },
    ]),
    explain: `<b>两</b> (liǎng) is the "two" you use in front of a measure word: 两${C.word}, 两块. <b>二</b> (èr) is for counting and digits: 一、二、三, 十二, 第二 (second).`,
    learn: [t('两', 'liǎng', 'two (before a measure word)'), t('二', 'èr', 'two (counting, digits)')],
    tag: 'number',
  };
}

function priceStep(total, toChinese) {
  const right = yuan(total);
  const pool = [...new Set([total + 10, total - 10, total + 5, total - 5, total + 20, total * 2])].filter((v) => v > 0 && v !== total);
  const wrong = shuffle(pool).slice(0, 3);
  if (toChinese) {
    return {
      prompt: `The total is <b class="big-num">${right.short}</b>. How do you say it?`,
      options: shuffle([{ main: right.zh, sub: right.py, ok: true }, ...wrong.slice(0, 2).map((v) => ({ main: yuan(v).zh, sub: yuan(v).py }))]),
      explain: `<b>${right.zh}</b> (${right.py}). In shops people say <b>块</b> (kuài) for 元 and <b>毛</b> (máo) for 角, a tenth of a 块. The last 毛 is usually dropped: 三块五 = 3.5元.`,
      learn: [t(right.zh, right.py, right.short)],
      yen: total / 10, tag: 'number',
    };
  }
  return {
    prompt: `They ask <b class="jp-big">多少钱？</b> and you hear <b class="jp-big">${right.zh}</b> <span class="muted">${right.py}</span>. Which price is it?`,
    options: shuffle([{ main: right.short, ok: true }, ...wrong.map((v) => ({ main: yuan(v).short }))]),
    explain: `<b>${right.zh}</b> = ${right.short}. 多少钱 (duōshao qián) = "how much money?"`,
    learn: [t('多少钱？', 'duōshao qián?', 'How much is it?'), t(right.zh, right.py, right.short)],
    yen: total / 10, tag: 'number',
  };
}

// Tones change meaning: 四 sì (falling) vs 十 shí (rising).
function toneStep() {
  const [n, a, b] = pick([[4, '四块', '十块'], [10, '十块', '四块']]);
  const ok = n === 4 ? { main: '¥4', sub: 'sì: falling tone ↘' } : { main: '¥10', sub: 'shí: rising tone ↗' };
  const no = n === 4 ? { main: '¥10', sub: 'shí: rising tone ↗' } : { main: '¥4', sub: 'sì: falling tone ↘' };
  return {
    prompt: `Auntie checks: <b class="jp-big">${a}？</b> <span class="muted">(${n === 4 ? 'sì kuài, voice falling ↘' : 'shí kuài, voice rising ↗'})</span> Is that four or ten?`,
    options: shuffle([{ ...ok, ok: true }, no]),
    explain: `Mandarin has 4 tones, and they change the meaning: <b>四 sì</b> falls ↘ (four) but <b>十 shí</b> rises ↗ (ten). Get the tone wrong and ${a} becomes ${b}! Same with mā 妈 (mum) and mǎ 马 (horse).`,
    learn: [t('四', 'sì', 'four (falling tone)'), t('十', 'shí', 'ten (rising tone)')],
    tag: 'number',
  };
}

function laobanStep() {
  return {
    reply: t('老板！', 'lǎobǎn!', ''),
    prompt: 'The kid bursts in shouting <b class="jp-big">老板！</b> Who does he mean?',
    options: shuffle([{ main: 'You, the shopkeeper', sub: '"boss"', ok: true }, { main: 'His teacher' }, { main: 'An old man' }]),
    explain: '<b>老板</b> (lǎobǎn) means "boss", and it is how everyone calls out to the person running a shop or stall, even if it is a kid helping out. It is friendly, not formal.',
    learn: [t('老板', 'lǎobǎn', 'boss / shopkeeper')],
    tag: 'attitude',
  };
}

// 买 mǎi (buy) and 卖 mài (sell): same sound, opposite meaning, different tone.
function maimaiStep() {
  return {
    prompt: 'The sign says <b class="jp-big">小卖部</b> <span class="muted">xiǎo mài bù</span>. Does 卖 (mài, falling ↘) mean buy or sell?',
    options: shuffle([{ main: 'Sell', sub: '卖 mài ↘', ok: true }, { main: 'Buy', sub: '买 mǎi ↘↗' }]),
    explain: '<b>卖 mài</b> (falling tone) = to sell, so 小卖部 is a "little selling place". <b>买 mǎi</b> (dipping tone) = to buy. Only the tone tells them apart. Customers 买, shops 卖!',
    learn: [t('卖', 'mài', 'to sell'), t('买', 'mǎi', 'to buy'), t('小卖部', 'xiǎomàibù', 'corner shop')],
    tag: 'attitude',
  };
}

function scanStep() {
  return {
    staff: t('扫码还是现金？', 'sǎo mǎ háishi xiànjīn?', 'Scan or cash?'),
    reply: t('扫码！', 'sǎo mǎ!', ''),
    prompt: 'He says <b class="jp-big">扫码！</b> and holds up his phone. How does he want to pay?',
    options: shuffle([{ main: 'Scan the QR code with his phone', ok: true }, { main: 'Cash, exact change' }, { main: 'Pay tomorrow' }]),
    explain: '<b>扫码</b> (sǎo mǎ) = "scan the code". In Chinese cities most people pay by scanning a QR code with their phone, even for a 1-块 ice lolly. Many 小卖部 have the code taped to the counter.',
    learn: [t('扫码', 'sǎo mǎ', 'scan the QR code (to pay)'), t('现金', 'xiànjīn', 'cash')],
    tag: 'attitude',
  };
}

function buyongStep() {
  return {
    staff: t('要袋子吗？', 'yào dàizi ma?', 'Do you want a bag?'),
    reply: t('不用了，谢谢。', 'bú yòng le, xièxie.', ''),
    prompt: 'You ask <b>要袋子吗？</b> He answers <b class="jp-big">不用了，谢谢。</b> What does he mean?',
    options: shuffle([{ main: 'No need, thanks', ok: true }, { main: 'Yes, two bags' }, { main: "I don't have money" }]),
    explain: '<b>不用了</b> (bú yòng le) = "no need". It is the soft, polite no. Also notice 不 bù turns into <b>bú</b> before a falling tone: bú yòng, bú yào.',
    learn: [t('要袋子吗？', 'yào dàizi ma?', 'Want a bag?'), t('不用了，谢谢', 'bú yòng le, xièxie', 'No need, thanks')],
    tag: 'attitude',
  };
}

function manzouStep() {
  return {
    prompt: 'He is heading back out into the storm. What do you call after him?',
    options: shuffle([{ main: '慢走！', sub: 'màn zǒu: "walk slowly"', ok: true }, { main: '快走！', sub: 'kuài zǒu: "go quickly"' }, { main: '走吧！', sub: 'zǒu ba: "off you go"' }]),
    explain: '<b>慢走</b> (màn zǒu), literally "walk slowly", means "take care on your way". Hosts say it to guests at the door. 快走 would sound like you want them gone!',
    learn: [t('慢走', 'màn zǒu', 'take care (lit. walk slowly)')],
    tag: 'attitude',
  };
}

function baStep() {
  return {
    show: { item: 'san', q: 1 },
    prompt: 'The tourist wants <b>one umbrella</b>. Which measure word does an umbrella take?',
    options: shuffle([{ main: '一把伞', sub: 'yì bǎ sǎn', ok: true }, { main: '一个伞', sub: 'yí ge sǎn' }, { main: '一张伞', sub: 'yì zhāng sǎn' }]),
    explain: '<b>一把伞</b>: 把 is for things you hold by a handle: 一把伞 (umbrella), 一把椅子 (chair), 一把刀 (knife). It comes from the verb 把, "to grip".',
    learn: [t('一把伞', 'yì bǎ sǎn', 'one umbrella')],
    tag: 'counter',
    snack: ITEMS.san.snack,
  };
}

function catStep() {
  return {
    special: 'cat',
    prompt: 'A soaked kitten shelters under the freezer chest. How do you count <b>one cat</b>?',
    options: shuffle([{ main: '一只猫', sub: 'yì zhī māo', ok: true }, { main: '一根猫', sub: 'yì gēn māo' }, { main: '一本猫', sub: 'yì běn māo' }]),
    explain: '<b>一只猫</b>: animals take <b>只</b> (zhī). Cats say 喵 (miāo), and so does the word 猫 (māo), almost.',
    learn: [t('一只猫', 'yì zhī māo', 'one cat')],
    tag: 'counter',
  };
}

// What each customer says, built from what they're ordering. The measure
// word is mumbled ("…"), which is the puzzle.
const ORDER = {
  daye: (it, n) => ({ zh: `小朋友，来${n.zh}…${it.zh}。`, py: `xiǎopéngyǒu, lái ${n.py} … ${it.py}.`, en: `Kiddo, give me ${n.q} ${it.en}.` }),
  ayi: (it, n) => ({ zh: `老板，有${it.zh}吗？要${n.zh}…。`, py: `lǎobǎn, yǒu ${it.py} ma? yào ${n.py} ….`, en: `Boss, do you have ${it.en}? I want ${n.q}.` }),
  xuesheng: (it, n) => ({ zh: `老板！${n.zh}…${it.zh}！`, py: `lǎobǎn! ${n.py} … ${it.py}!`, en: `Boss! ${n.q} ${it.en}!` }),
  xiaoge: (it, n) => ({ zh: `${n.zh}…${it.zh}，快快快！`, py: `${n.py} … ${it.py}, kuài kuài kuài!`, en: `${n.q} ${it.en}, quick quick quick!` }),
  shushu: (it, n) => ({ zh: `你好，我要${n.zh}…${it.zh}。`, py: `nǐ hǎo, wǒ yào ${n.py} … ${it.py}.`, en: `Hello, I'd like ${n.q} ${it.en}.` }),
  tourist: () => ({ zh: null, py: '', en: "Hi! It's pouring… do you sell umbrellas?" }),
};
const spoken = (q) => (q === 1 ? { zh: '一', py: 'yī', q } : q === 2 ? { zh: '两', py: 'liǎng', q } : { ...zhNum(q), q });

function night() {
  const order = ['daye', 'ayi', 'xuesheng', 'xiaoge', 'shushu', 'tourist'];
  return order.map((who, i) => {
    const p = PEOPLE[who];
    const item = pick(p.items);
    const it = ITEMS[item];
    // Grandpa always buys two, so you can practise 两.
    const q = who === 'tourist' ? 1 : who === 'daye' ? Math.min(2, it.max ?? 3) : Math.min(1 + Math.floor(Math.random() * 3), it.max ?? 3);
    const steps = [];
    if (who === 'xuesheng') steps.push(laobanStep());
    if (p.call && who !== 'xuesheng') steps.push(callStep(p));
    if (who === 'tourist') steps.push(baStep());
    else steps.push(counterStep(item, q));
    if (who === 'daye' && q === 2) steps.push(liangStep(item));
    if (who === 'ayi') steps.push(toneStep());
    if (who === 'xuesheng') steps.push(maimaiStep());
    if (who === 'xiaoge') steps.push(scanStep());
    if (who === 'shushu') steps.push(buyongStep());
    steps.push(priceStep(it.price * q, i % 2 === 0));
    if (who === 'shushu') steps.push(manzouStep());
    const line = ORDER[who](it, spoken(q));
    return { who, person: { ...p, jp: p.zh, line: { jp: line.zh, romaji: line.py, en: line.en } }, item, q, weather: WEATHER[Math.min(Math.floor(i / 2), 2)], steps, catAfter: i === 3 ? catStep() : null };
  });
}

// ── Scene: a 小卖部 by the gate of an apartment compound, summer storm ────
function shelves(x0, y0, w) {
  let s = 11, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cols = ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#ffffff', '#ff006e'];
  for (let r = 0; r < 4; r++) {
    const y = y0 + r * 22;
    out += `<rect x="${x0}" y="${y + 17}" width="${w}" height="3" fill="#8a7a5a"/>`;
    for (let x = x0 + 2; x < x0 + w - 6;) {
      const bw = 5 + rnd() * 7, bh = 8 + rnd() * 8;
      out += `<rect x="${x.toFixed(1)}" y="${(y + 17 - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
      x += bw + 1.5;
    }
  }
  return out;
}

function windows(x0, y0, cols, rows, seed) {
  let s = seed, out = '';
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const lit = rnd() > 0.45;
    out += `<rect x="${x0 + c * 26}" y="${y0 + r * 24}" width="16" height="14" fill="${lit ? (rnd() > 0.5 ? '#ffd98a' : '#cfe6ff') : '#1a2132'}" opacity="${lit ? 0.85 : 1}"/>`;
  }
  return out;
}

export function scene() {
  return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" class="shop-scene">
  <defs>
    <linearGradient id="cnsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120d24"/><stop offset="1" stop-color="#2d2347"/></linearGradient>
    <linearGradient id="cnroad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2c40"/><stop offset="1" stop-color="#15131f"/></linearGradient>
    <radialGradient id="cnlamp"><stop offset="0" stop-color="#ffe7a8" stop-opacity="0.65"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="cnspill" cx="0.5" cy="0" r="0.8"><stop offset="0" stop-color="#fff4d6" stop-opacity="0.5"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></radialGradient>
    <filter id="cnglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="800" height="400" fill="url(#cnsky)"/>
  <!-- apartment blocks behind -->
  <rect x="0" y="20" width="250" height="290" fill="#232038"/>${windows(14, 36, 9, 10, 3)}
  <rect x="560" y="0" width="240" height="310" fill="#262240"/>${windows(574, 14, 9, 11, 9)}
  <!-- overhead wires -->
  <path d="M0 70 Q400 110 800 64 M0 84 Q400 126 800 80" stroke="#0b0a14" stroke-width="2" fill="none"/>
  <!-- the 小卖部: a single-storey block with a red lightbox sign -->
  <rect x="250" y="130" width="330" height="176" fill="#d8d0bf"/>
  <rect x="244" y="122" width="342" height="12" fill="#8c8576"/>
  <rect x="262" y="140" width="306" height="44" rx="3" fill="#d2141f"/>
  <g filter="url(#cnglow)"><text x="415" y="175" font-size="32" font-weight="900" fill="#ffe14a" text-anchor="middle" letter-spacing="8">小卖部</text></g>
  <rect x="470" y="146" width="88" height="20" rx="3" fill="#ffe14a"/><text x="514" y="161" font-size="12" font-weight="800" fill="#d2141f" text-anchor="middle">冷饮 · 零食</text>
  <!-- bright interior through the doorway and window -->
  <rect x="268" y="196" width="150" height="110" fill="#fff8e6"/>
  <g opacity="0.95">${shelves(272, 204, 140)}</g>
  <rect x="430" y="196" width="134" height="110" fill="#fff3d6"/>
  <!-- strip-curtain doorway -->
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${436 + i * 14}" y="198" width="9" height="106" fill="#e8f4ff" opacity="0.35"/>`).join('')}
  <!-- QR code board by the door -->
  <rect x="270" y="252" width="34" height="42" rx="3" fill="#2aae67"/><rect x="275" y="257" width="24" height="24" fill="#fff"/>
  ${[[277, 259], [287, 259], [277, 269], [291, 271], [283, 265]].map(([x, y]) => `<rect x="${x}" y="${y}" width="6" height="6" fill="#111"/>`).join('')}
  <text x="287" y="290" font-size="7" font-weight="800" fill="#fff" text-anchor="middle">扫码</text>
  <!-- red lantern -->
  <line x1="590" y1="130" x2="590" y2="146" stroke="#333"/><ellipse cx="590" cy="160" rx="14" ry="16" fill="#e0242f" filter="url(#cnglow)"/><rect x="584" y="174" width="12" height="4" fill="#ffd34a"/>
  <!-- tin awning -->
  <path d="M244 190 L586 190 L600 204 L230 204Z" fill="#3a6fa8"/>
  ${Array.from({ length: 13 }, (_, i) => `<line x1="${246 + i * 27}" y1="190" x2="${236 + i * 28}" y2="204" stroke="#2c5686" stroke-width="2"/>`).join('')}
  <!-- freezer chest outside (ice lollies) -->
  <rect x="604" y="262" width="96" height="44" rx="6" fill="#f3f6fb"/><rect x="608" y="256" width="88" height="10" rx="4" fill="#bfe3ff" opacity="0.9"/>
  <text x="652" y="292" font-size="12" font-weight="800" fill="#1f5fbf" text-anchor="middle">冰棍 冰淇淋</text>
  <!-- street light (warm) -->
  <rect x="720" y="110" width="5" height="200" fill="#6b7682"/><circle cx="712" cy="112" r="48" fill="url(#cnlamp)"/><rect x="700" y="108" width="24" height="7" rx="3" fill="#fff0c2"/>
  <!-- plane tree trunk and leaves -->
  <rect x="200" y="160" width="14" height="150" fill="#6e6152"/><ellipse cx="190" cy="140" rx="70" ry="44" fill="#1d3b2c" opacity="0.95"/><ellipse cx="226" cy="120" rx="50" ry="34" fill="#24492f" opacity="0.9"/>
  <!-- street -->
  <ellipse cx="415" cy="306" rx="300" ry="34" fill="url(#cnspill)"/>
  <rect x="0" y="304" width="800" height="96" fill="url(#cnroad)"/>
  <rect x="0" y="304" width="800" height="7" fill="#7f8a96"/>
  <g id="walkers"></g>
  <!-- an e-bike parked in the rain -->
  <g transform="translate(130 330)"><circle cx="-24" cy="22" r="13" fill="none" stroke="#222" stroke-width="5"/><circle cx="24" cy="22" r="13" fill="none" stroke="#222" stroke-width="5"/><path d="M-24 22 L-6 8 L16 8 L24 22 M16 8 L20 -10 M-6 8 L-12 -2 L2 -2" stroke="#2a9d8f" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="-14" y="2" width="22" height="9" rx="4" fill="#222"/></g>
  <!-- folding stools outside -->
  <g transform="translate(740 330)"><rect x="-14" y="-2" width="28" height="5" fill="#1d70b8"/><path d="M-10 3 L10 22 M10 3 L-10 22" stroke="#1d70b8" stroke-width="3"/></g>
</svg>`;
}

export const CHINA = {
  id: 'cn', flag: '🇨🇳', country: 'China', name: 'Corner Shop', native: '小卖部', lang: 'zh',
  tagline: 'Summer-storm night at a corner shop',
  door: { x: 470, y: 300 }, walkY: 302, ground: 0.765,
  staffSays: L.bye,
  items: ITEMS,
  music: 'cn',
  scene, night, catSvg,
  snacks: Object.values(ITEMS).filter((i) => i.fav).map((i) => ({ emoji: i.emoji, native: i.zh, en: i.en })),
  currency: (n) => `¥${n.toFixed(2)}`,
  intro: {
    title: '小卖部 · Summer Storm Shift',
    text: 'Thunder rumbles over the apartment blocks, and neighbours dash into the tiny corner shop by the gate for ice lollies, tea eggs and spicy strips. Serve them in Mandarin!',
    learn: ['Measure words: 个, 瓶, 张, 包, 根, 把…', '两 or 二? Two ways to say "two"', 'Prices in 块 and 毛, and why tones matter', 'Calling people 叔叔, 阿姨, 大爷, 老板', '扫码, 不用了 and 慢走'],
  },
  facts: [
    { emoji: '🧩', title: 'Measure words', text: 'Chinese needs a measure word for every counted thing, and many sort by shape: 根 for long things, 张 for flat ones, 把 for things with handles. Studies find these words nudge which objects people see as similar, but only a little.', sure: '★☆☆ Small effects, still debated', ref: 'Saalbach & Imai (2007). Journal of Experimental Psychology: General 136(3).' },
    { emoji: '🎵', title: 'Tones and musical ears', text: 'In a tone language, pitch changes word meaning (四 sì vs 十 shí). Mandarin-speaking music students are much more likely to have perfect pitch, and tone-language speakers tend to hear pitch more finely.', sure: '★★☆ Scientists are pretty sure', ref: 'Deutsch et al. (2006). J. Acoustical Society of America 119(2); Bidelman et al. (2013). PLoS ONE 8(4).' },
    { emoji: '🔢', title: 'Tidy numbers', text: 'Chinese numbers follow the pattern exactly: 十一 is "ten-one", 二十 is "two-ten". Chinese-speaking preschoolers learn to count past ten earlier than English speakers, who must memorise eleven, twelve and the teens.', sure: '★★☆ Scientists are pretty sure', ref: 'Miller, Smith, Zhu & Zhang (1995). Psychological Science 6(1).' },
    { emoji: '👪', title: 'Direct words, family names', text: 'Requests are often short and direct (来两瓶水, "two waters"), and politeness lives in what you call people: 叔叔, 阿姨, 老板. The shadow side: titles keep age and rank always in view, which some think makes it harder to disagree with elders.', sure: '☆☆☆ Just an idea so far', ref: 'Lee-Wong (1994). Imperatives in requests: direct or impolite? Pragmatics 4(4).' },
  ],
};
