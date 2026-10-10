// Paying at the till as a customer, in any language. Each shop supplies a
// `till` script: greeting, questions, how prices are said, coins and notes,
// change, and thanks. The basket is then graded against the shopping list.
import { chibiSvg } from './chibi.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class Checkout {
  constructor(host, { till, items, list, basket, listLine, sound, onDone }) {
    this.till = till;
    this.items = items;
    this.list = list;
    this.basket = basket;
    this.listLine = listLine;
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

  #bubble(line) {
    return `<div class="co-row">
      <div class="co-clerk">${chibiSvg(this.till.clerk.look)}</div>
      <div class="co-bubble">
        <span class="co-who">${esc(this.till.clerk.name)}</span>
        <b class="jp">${esc(line.text)}</b>
        ${line.reading ? `<small>${esc(line.reading)}</small>` : ''}
        <span class="co-en">${esc(line.en)}</span>
      </div>
    </div>`;
  }

  // Show one clerk line; resolve with the chosen option (or nothing).
  #say(line, { choices, extra = '', next = 'Next ▶' } = {}) {
    if (line.text) this.learned.set(line.text, line);
    return new Promise((resolve) => {
      this.el.innerHTML = `${this.#bubble(line)}${extra}
        <div class="co-actions">${choices
          ? choices.map((c, i) => `<button class="opt" data-i="${i}"><b>${esc(c.text)}</b><small>${c.reading ? `${esc(c.reading)} · ` : ''}${esc(c.en)}</small></button>`).join('')
          : `<button class="kid-btn" data-next>${next}</button>`}</div>`;
      if (choices) {
        for (const b of this.el.querySelectorAll('[data-i]')) {
          b.addEventListener('click', () => {
            const c = choices[b.dataset.i];
            this.learned.set(c.text, c);
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
    const T = this.till;
    await this.#say(T.greet, {
      extra: `<div class="co-scan">${[...this.basket].map(([id, q]) => {
        const it = this.items[id];
        return `<span>${it.emoji.repeat(Math.min(q, 4))} ${esc(it.jp ?? it.ms ?? it.zh)} ×${q} <i>${T.short(it.price * q)}</i></span>`;
      }).join('')}<b>Total ${T.short(this.total)}</b></div>`,
      next: T.handOver ?? 'Hand over the basket ▶',
    });
    const ids = [...this.basket.keys()];
    for (const ask of T.questions) {
      const step = ask(ids, this.items);
      if (!step) continue;
      const choice = await this.#say(step.line, { choices: step.choices });
      const after = step.after?.(choice);
      if (after) await this.#say(after.line, { extra: after.tip ? `<p class="co-tip">${after.tip}</p>` : '' });
    }
    await this.#pay();
    await this.#say(T.thanks, { next: 'See how you did ▶' });
    this.close();
    this.onDone(this.#grade());
  }

  // Pay with coins and notes; the clerk answers in the shop's language.
  #pay() {
    const T = this.till;
    const price = T.price(this.total);
    this.learned.set(price.text, price);
    return new Promise((resolve) => {
      const render = (msg) => {
        const sum = this.paid.reduce((s, c) => s + c, 0);
        this.el.innerHTML = `${this.#bubble(msg ?? price)}
          <div class="co-tray">${T.coins.map((c) => `<button class="coin ${c.cls}" data-c="${c.v}"><b>${esc(c.label)}</b><small>${esc(c.unit ?? '')}</small></button>`).join('')}</div>
          <div class="co-paid">On the tray: <b>${T.short(sum)}</b></div>
          <div class="co-actions"><button class="kid-btn ghost" data-undo ${this.paid.length ? '' : 'disabled'}>↩ Take back</button><button class="kid-btn" data-pay ${sum ? '' : 'disabled'}>Pay ▶</button></div>`;
        for (const b of this.el.querySelectorAll('[data-c]')) {
          b.addEventListener('click', () => { this.paid.push(+b.dataset.c); this.sound.click(); render(msg); });
        }
        $('[data-undo]', this.el).addEventListener('click', () => { this.paid.pop(); this.sound.click(); render(msg); });
        $('[data-pay]', this.el).addEventListener('click', async () => {
          const s = this.paid.reduce((a, c) => a + c, 0);
          if (s < this.total) {
            this.sound.oops();
            const more = T.more(this.total - s);
            this.learned.set(more.text, more);
            render(more);
            return;
          }
          this.sound.register();
          const change = s - this.total;
          this.exact = change === 0;
          if (this.exact) await this.#say(T.exact.line, { extra: `<p class="co-tip">${T.exact.tip}</p>` });
          else {
            const c = T.change(change);
            await this.#say(c.line, { extra: c.tip ? `<p class="co-tip">${c.tip}</p>` : '' });
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
      return { item, q, got, ok: got === q, it: this.items[item], ...this.listLine(item, q) };
    });
    const extras = [...this.basket.keys()].filter((id) => !this.list.some((l) => l.item === id));
    const listOk = lines.every((l) => l.ok) && !extras.length;
    const stars = listOk ? (this.exact ? 3 : 2) : 1;
    for (const l of lines) this.learned.set(l.text, { text: l.text, reading: l.reading, en: `${l.q} × ${l.it.en}` });
    return { stars, lines, extras, exact: this.exact, total: this.total, learned: [...this.learned.values()] };
  }
}
