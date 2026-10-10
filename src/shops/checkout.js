// Paying at the konbini till as a customer: the clerk's questions in
// polite Japanese, paying with yen coins, and checking Mum's shopping list.
import { chibiSvg } from './chibi.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CLERK = { hair: '#2b1d14', style: 'short', outfit: '#22a387', legs: '#2b2f3a', acc: [] };
const YES = { jp: 'はい、お願いします。', romaji: 'Hai, onegai shimasu.', en: 'Yes, please.' };
const NO = { jp: 'いいえ、大丈夫です。', romaji: 'Iie, daijōbu desu.', en: 'No, I\'m fine (= no thanks).' };
const COINS = [1000, 500, 100, 50, 10];

const SERVICE_Q = {
  heat: { jp: '温めますか？', romaji: 'Atatamemasu ka?', en: 'Shall I heat it up?' },
  chopsticks: { jp: 'お箸をおつけしますか？', romaji: 'Ohashi o otsuke shimasu ka?', en: 'Shall I add chopsticks?' },
  spoon: { jp: 'スプーンをおつけしますか？', romaji: 'Supūn o otsuke shimasu ka?', en: 'Shall I add a spoon?' },
};

export class Checkout {
  constructor(host, { items, yen, counted, list, basket, sound, onDone }) {
    this.host = host;
    this.items = items;
    this.yen = yen;
    this.counted = counted;
    this.list = list;
    this.basket = basket;
    this.sound = sound;
    this.onDone = onDone;
    this.learned = new Map();
    this.total = [...basket].reduce((s, [id, q]) => s + items[id].price * q, 0);
    this.paid = [];
    this.el = document.createElement('div');
    this.el.className = 'checkout';
    host.appendChild(this.el);
    requestAnimationFrame(() => this.el.classList.add('show'));
    this.#run();
  }

  close() {
    this.el.classList.remove('show');
    setTimeout(() => this.el.remove(), 300);
  }

  // Show one clerk line; resolve with the chosen option (or nothing).
  #say(line, { choices, extra = '', next = 'Next ▶' } = {}) {
    if (line.jp) this.learned.set(line.jp, line);
    return new Promise((resolve) => {
      this.el.innerHTML = `
        <div class="co-row">
          <div class="co-clerk">${chibiSvg(CLERK)}</div>
          <div class="co-bubble">
            <span class="co-who">Clerk · 店員</span>
            <b class="jp">${esc(line.jp)}</b>
            <small>${esc(line.romaji)}</small>
            <span class="co-en">${esc(line.en)}</span>
          </div>
        </div>
        ${extra}
        <div class="co-actions">${choices
          ? choices.map((c, i) => `<button class="opt" data-i="${i}"><b>${esc(c.jp)}</b><small>${esc(c.romaji)} · ${esc(c.en)}</small></button>`).join('')
          : `<button class="kid-btn" data-next>${next}</button>`}</div>`;
      if (choices) {
        for (const b of this.el.querySelectorAll('[data-i]')) {
          b.addEventListener('click', () => {
            const c = choices[b.dataset.i];
            this.learned.set(c.jp, c);
            this.sound.click();
            resolve(c);
          });
        }
      } else {
        $('[data-next]', this.el).addEventListener('click', () => { this.sound.click(); resolve(); });
      }
    });
  }

  async #run() {
    await this.#say({ jp: 'いらっしゃいませ！', romaji: 'Irasshaimase!', en: 'Welcome!' }, {
      extra: `<div class="co-scan">${[...this.basket].map(([id, q]) => {
        const it = this.items[id];
        return `<span>${it.emoji.repeat(Math.min(q, 4))} ${esc(it.jp)} ×${q} <i>¥${it.price * q}</i></span>`;
      }).join('')}<b>Total ¥${this.total}</b></div>`,
      next: 'Hand over the basket ▶',
    });

    // One service question for the first item that needs it
    const svc = [...this.basket.keys()].map((id) => this.items[id].service).find(Boolean);
    if (svc) {
      const a = await this.#say(SERVICE_Q[svc], { choices: [YES, NO] });
      await this.#say(a === YES
        ? { jp: 'かしこまりました。', romaji: 'Kashikomarimashita.', en: 'Certainly. (very polite "OK")' }
        : { jp: 'はい、かしこまりました。', romaji: 'Hai, kashikomarimashita.', en: 'Yes, certainly.' });
    }
    const bag = await this.#say({ jp: '袋はご利用ですか？', romaji: 'Fukuro wa go-riyō desu ka?', en: 'Would you like a bag?' }, { choices: [YES, NO] });
    if (bag === NO) {
      await this.#say({ jp: 'はい、ありがとうございます。', romaji: 'Hai, arigatō gozaimasu.', en: 'OK, thank you.' }, {
        extra: '<p class="co-tip">💡 You just used <b>大丈夫です</b> ("I\'m fine") to say <b>no thanks</b>. That\'s the indirect, polite Japanese way to say no!</p>',
      });
    }
    await this.#say({ jp: 'ポイントカードはお持ちですか？', romaji: 'Pointo kādo wa omochi desu ka?', en: 'Do you have a point card?' }, {
      choices: [{ jp: 'いいえ、持っていません。', romaji: 'Iie, motte imasen.', en: 'No, I don\'t have one.' }, { jp: 'はい。', romaji: 'Hai.', en: 'Yes.' }],
    });

    await this.#pay();

    await this.#say({ jp: 'ありがとうございました！またお越しくださいませ。', romaji: 'Arigatō gozaimashita! Mata okoshi kudasaimase.', en: 'Thank you very much! Please come again.' }, { next: 'See how you did ▶' });
    this.close();
    this.onDone(this.#grade());
  }

  // Pay with coins and notes; the clerk answers in Japanese.
  #pay() {
    const p = this.yen(this.total);
    this.learned.set(`${p.kanji}です`, { jp: `${p.kanji}です`, kana: p.kana, romaji: `${p.romaji} desu`, en: `It's ¥${this.total}.` });
    return new Promise((resolve) => {
      const render = (msg) => {
        const sum = this.paid.reduce((s, c) => s + c, 0);
        this.el.innerHTML = `
          <div class="co-row">
            <div class="co-clerk">${chibiSvg(CLERK)}</div>
            <div class="co-bubble">
              <span class="co-who">Clerk · 店員</span>
              <b class="jp">${esc(msg?.jp ?? `${p.kanji}です。`)}</b>
              <small>${esc(msg?.romaji ?? `${p.romaji} desu.`)}</small>
              <span class="co-en">${esc(msg?.en ?? 'The price, in Japanese. How much is it? Pay with the coins!')}</span>
            </div>
          </div>
          <div class="co-tray">${COINS.map((c) => `<button class="coin ${c === 1000 ? 'note' : `c${c}`}" data-c="${c}"><b>${c}</b><small>円</small></button>`).join('')}</div>
          <div class="co-paid">On the tray: <b>¥${sum}</b> ${this.paid.length ? `<span class="muted">(${this.paid.join(' + ')})</span>` : ''}</div>
          <div class="co-actions"><button class="kid-btn ghost" data-undo ${this.paid.length ? '' : 'disabled'}>↩ Take back</button><button class="kid-btn" data-pay ${sum ? '' : 'disabled'}>Pay ▶</button></div>`;
        for (const b of this.el.querySelectorAll('[data-c]')) {
          b.addEventListener('click', () => { this.paid.push(+b.dataset.c); this.sound.blipCoin?.() ?? this.sound.click(); render(msg); });
        }
        $('[data-undo]', this.el).addEventListener('click', () => { this.paid.pop(); this.sound.click(); render(msg); });
        $('[data-pay]', this.el).addEventListener('click', async () => {
          const s = this.paid.reduce((a, c) => a + c, 0);
          if (s < this.total) {
            const more = this.yen(this.total - s);
            this.sound.oops();
            render({ jp: `あと${more.kanji}です。`, romaji: `Ato ${more.romaji} desu.`, en: `${this.total - s} yen more, please. (あと = "still / more")` });
            this.learned.set('あと…です', { jp: 'あと〜円です', romaji: 'ato … en desu', en: '… yen more, please' });
            return;
          }
          this.sound.register();
          const change = s - this.total;
          this.exact = change === 0;
          if (this.exact) {
            await this.#say({ jp: 'ちょうどお預かりします。', romaji: 'Chōdo oazukari shimasu.', en: 'Exactly right, thank you!' }, {
              extra: '<p class="co-tip">🎯 <b>ぴったり!</b> (pittari, "spot on!"): you paid the exact amount.</p>',
            });
          } else {
            const c = this.yen(change);
            await this.#say({ jp: `${c.kanji}のお返しです。`, romaji: `${c.romaji} no okaeshi desu.`, en: `Here's your change: ¥${change}.` }, {
              extra: '<p class="co-tip">💡 <b>お返し</b> (okaeshi) means "change", literally "giving back".</p>',
            });
          }
          resolve();
        });
      };
      render();
    });
  }

  #grade() {
    const lines = this.list.map(({ item, q }) => {
      const got = this.basket.get(item) ?? 0;
      const it = this.items[item];
      const c = this.counted(it.counter, q);
      return { item, q, got, ok: got === q, it, c };
    });
    const extras = [...this.basket.keys()].filter((id) => !this.list.some((l) => l.item === id));
    const listOk = lines.every((l) => l.ok) && !extras.length;
    const stars = listOk ? (this.exact ? 3 : 2) : 1;
    for (const l of lines) this.learned.set(`${l.it.jp} ${l.c.jp}`, { jp: `${l.it.jp} ${l.c.jp}`, kana: `${l.it.kana ?? l.it.jp} ${l.c.kana}`, romaji: `${l.it.romaji} ${l.c.romaji}`, en: `${l.q} × ${l.it.en}` });
    return { stars, lines, extras, exact: this.exact, total: this.total, learned: [...this.learned.values()] };
  }
}
