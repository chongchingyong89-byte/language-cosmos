// World Shops engine: runs any shop definition from registry.js.
// A night = a queue of customers; each customer = a few language "steps"
// (multiple choice with an explanation). The scene, rain and sound set the mood.
import { SHOPS } from './registry.js';
import { chibi, chibiSvg } from './chibi.js';
import { Rain } from './rain.js';
import { StreetWorld, READABLES } from '../world/street.js';
import { InteriorWorld, SHOP_WORDS } from '../world/interior.js';
import { Checkout } from './checkout.js';
import { RECORDINGS } from './music.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(`language-cosmos.${k}`)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`language-cosmos.${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export class ShopGame {
  constructor(sound, { onFinish, onOpen, onClose, onWords, onShopped }) {
    this.onShopped = onShopped;
    this.sound = sound;
    this.onFinish = onFinish;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onWords = onWords;
    this.root = $('#shop');
    this.best = store.get('shops', {});
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.root.hidden) { e.stopImmediatePropagation(); this.close(); }
    }, true);
  }

  // ── Open / close ─────────────────────────────────────────────────────────
  #show(html) {
    this.root.innerHTML = `<div class="shop-frame">${html}</div>`;
    if (this.root.hidden) {
      this.root.hidden = false;
      requestAnimationFrame(() => this.root.classList.add('show'));
      this.sound.duck(true);
      this.onOpen?.();
    }
    for (const b of this.root.querySelectorAll('[data-close]')) b.addEventListener('click', () => this.close());
  }

  close() {
    this.run = null;
    this.#closeWorld();
    this.onClose?.();
    this.sound.shopMusic(null);
    this.sound.stopRecording();
    this.rain?.destroy();
    this.rain = null;
    this.sound.setRain(0);
    this.sound.duck(false);
    this.root.classList.remove('show');
    setTimeout(() => { this.root.hidden = true; this.root.innerHTML = ''; }, 300);
  }

  openPicker() {
    this.sound.click();
    this.sound.shopMusic(null);
    this.rain?.destroy();
    this.rain = null;
    this.sound.setRain(0);
    this.#show(`
      <div class="shop-picker">
        <button class="shop-x" data-close aria-label="Close">✕</button>
        <div class="picker-head"><span>🏪</span><h2>World Shops</h2>
        <p>Every country shops in its own language. Work the counter, and learn how people really talk.</p></div>
        <div class="shop-cards">${SHOPS.map((s) => `
          <button class="shop-card ${s.ready ? 'ready' : ''}" data-shop="${s.id}" ${s.ready ? '' : 'disabled'}>
            <span class="sc-flag">${s.flag}</span>
            <span class="sc-native">${esc(s.native)}</span>
            <b>${esc(s.name)}</b>
            <small>${esc(s.country)} · Phase ${s.phase}</small>
            <span class="sc-teach">${esc(s.ready ? s.tagline : s.teaches)}</span>
            ${s.snacks ? `<span class="sc-snacks" title="Favourite snacks">${s.snacks.map((n) => `<i title="${esc(n.native)}">${n.emoji}</i>`).join('')}</span>` : ''}
            <span class="sc-cta">${s.ready ? `${this.best[s.id] ? '★'.repeat(this.best[s.id]) + ' · ' : ''}Play ▶` : 'Coming soon'}</span>
          </button>`).join('')}
        </div>
      </div>`);
    for (const b of this.root.querySelectorAll('.shop-card.ready')) {
      b.addEventListener('click', () => this.intro(SHOPS.find((s) => s.id === b.dataset.shop)));
    }
  }

  introById(id) {
    const shop = SHOPS.find((s) => s.id === id && s.ready);
    if (shop) this.intro(shop); else this.openPicker();
  }

  insideById(id) {
    const shop = SHOPS.find((s) => s.id === id && s.ready);
    if (shop?.world) this.openInterior(shop); else this.openPicker();
  }

  play(id) {
    const shop = SHOPS.find((s) => s.id === id && s.ready);
    if (!shop) return this.openPicker();
    this.shop = shop;
    this.startNight();
  }

  intro(shop) {
    if (shop.world) return this.openWorld(shop);
    this.sound.click();
    this.shop = shop;
    this.#show(`
      <div class="shop-stage">${shop.scene()}<canvas class="shop-rain"></canvas></div>
      <div class="shop-counter intro">
        <button class="shop-x" data-close aria-label="Close">✕</button>
        <div class="intro-flag">${shop.flag}</div>
        <h2>${esc(shop.intro.title)}</h2>
        <p>${esc(shop.intro.text)}</p>
        <div class="intro-learn">${shop.intro.learn.map((l) => `<span>✦ ${esc(l)}</span>`).join('')}</div>
        ${shop.snacks ? `<h3 class="snack-h">Tonight's favourite snacks</h3><div class="snack-row">${shop.snacks.map((n) => `<span><i>${n.emoji}</i><b>${esc(n.native)}</b><small>${esc(n.en ?? '')}</small></span>`).join('')}</div>` : ''}
        <div class="row"><button class="kid-btn" data-start>Open the shop ▶</button><button class="kid-btn ghost" data-picker>All shops</button></div>
      </div>`);
    this.#startRain(0.3);
    this.sound.shopMusic(shop.music);
    $('[data-start]', this.root).addEventListener('click', () => this.startNight());
    $('[data-picker]', this.root).addEventListener('click', () => this.openPicker());
  }

  #startRain(level) {
    this.rain?.destroy();
    this.rain = new Rain($('.shop-rain', this.root), { ground: this.shop.ground });
    this.rain.set(level);
    this.rain.start();
    this.sound.setRain(level);
  }

  // ── A night at the counter ───────────────────────────────────────────────
  async startNight() {
    const shop = this.shop;
    const run = (this.run = { customers: shop.night(), stars: 0, total: 0, yen: 0, learned: new Map(), attitudes: new Map(), happy: 0, mood: 3 });
    this.#show(`
      <div class="shop-stage">${shop.scene()}<canvas class="shop-rain"></canvas>
        <div class="shop-hud">
          <button class="shop-x" data-close aria-label="Close">✕</button>
          <span class="hud-pill hud-clock">🕙 22:00</span>
          <span class="hud-pill hud-weather"></span>
          <span class="hud-pill">⭐ <b class="hud-stars">0</b></span>
          <span class="hud-pill">💴 <b class="hud-yen">${this.#money(0)}</b></span>
        </div>
      </div>
      <div class="shop-counter"><div class="counter-body"></div></div>
      <div class="music-chip night-chip"></div>`);
    this.#startRain(0.2);
    this.#music('shop');
    for (let i = 0; i < run.customers.length; i++) {
      if (this.run !== run) return;
      await this.#serve(run, run.customers[i], i);
    }
    if (this.run === run) this.#results(run);
  }

  #money(n) {
    return this.shop?.currency ? this.shop.currency(n) : `¥${n.toLocaleString('en')}`;
  }

  #hud(run, i, weather) {
    const h = 22 + Math.floor((i * 40) / 60), m = (i * 40) % 60;
    $('.hud-clock', this.root).textContent = `🕙 ${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    $('.hud-weather', this.root).innerHTML = `☔ <b>${weather.word}</b> <small>${esc(weather.en)}</small>`;
    $('.hud-stars', this.root).textContent = run.stars;
    $('.hud-yen', this.root).textContent = this.#money(run.yen);
  }

  async #serve(run, c, i) {
    this.#hud(run, i, c.weather);
    this.rain?.set(c.weather.level);
    this.sound.setRain(c.weather.level);
    const body = $('.counter-body', this.root);
    body.innerHTML = `<p class="waiting">${i === 0 ? 'The shop is open. Listen to the rain…' : 'Waiting for the next customer…'}</p>`;

    await this.#walk(c.person.look, 860, this.shop.door.x, 2200);
    if (this.run !== run) return;
    this.sound.chime();

    const line = c.person.line;
    body.innerHTML = `
      <div class="cust">
        <div class="cust-portrait">${chibiSvg(c.person.look)}</div>
        <div class="bubble">
          <span class="who">${esc(c.person.en)} <small>${esc(c.person.jp)}</small><span class="mood">😊</span></span>
          ${c.person.attitude ? `<span class="attitude" title="${esc(c.person.attitude.note)}">${c.person.attitude.emoji} ${esc(c.person.attitude.label)}</span>` : ''}
          ${line.jp ? `<b class="jp">${esc(line.jp)}</b><small>${esc(line.romaji)} · "${esc(line.en)}"</small>` : `<b>${esc(line.en)}</b>`}
        </div>
      </div>
      ${c.person.hurry ? '<div class="patience"><i></i></div>' : ''}
      ${c.person.attitude ? `<p class="attitude-note">${c.person.attitude.emoji} ${esc(c.person.attitude.note)}</p>` : ''}
      <div class="tray"></div>
      <div class="task"></div>`;
    if (c.person.attitude) run.attitudes.set(c.person.en, c.person.attitude);
    run.mood = 3;
    if (line.jp) run.learned.set(line.jp, { jp: line.jp, romaji: line.romaji, en: line.en });

    for (const step of c.steps) {
      if (this.run !== run) return;
      await this.#step(run, step, body, c);
      this.#hud(run, i, c.weather);
    }
    if (this.run !== run) return;
    if (run.mood >= 2) run.happy++;

    const bye = this.shop.staffSays;
    run.learned.set(bye.jp, bye);
    $('.task', body).innerHTML = `<div class="staff-line">You: <b class="jp">${esc(bye.jp)}！</b><small>${esc(bye.romaji)} · "${esc(bye.en)}"</small></div>`;
    this.sound.register();
    await wait(1400);
    if (this.run !== run) return;
    this.#walk({ ...c.person.look, acc: [...new Set([...(c.person.look.acc ?? []), 'umbrella'])] }, this.shop.door.x, -80, 2000);

    if (c.catAfter) {
      if (c.weather.level >= 1) this.sound.thunder();
      this.#placeCat();
      body.innerHTML = '<div class="task"></div>';
      await this.#step(run, c.catAfter, body);
    }
  }

  #setMood(run, c, body) {
    const face = ['😟', '😟', '😐', '😊'][Math.max(0, run.mood)];
    const m = $('.mood', body);
    if (m) m.textContent = face;
    const p = $('.cust-portrait', body);
    if (p && c) p.innerHTML = chibiSvg(c.person.look, { mood: run.mood >= 3 ? 'smile' : run.mood === 2 ? 'wow' : 'sad' });
  }

  #step(run, step, body, c) {
    return new Promise((resolve) => {
      const tray = $('.tray', body);
      if (tray) {
        tray.innerHTML = step.show
          ? `<span class="tray-items">${step.show.item ? this.#emoji(step.show.item).repeat(step.show.q) : ''}</span>${step.snack ? `<p class="snack-fact">${this.#emoji(step.show.item)} <b>Snack fact:</b> ${esc(step.snack)}</p>` : ''}`
          : '';
      }
      const task = $('.task', body);
      task.innerHTML = `
        ${step.staff ? `<div class="staff-line">You: <b class="jp">${esc(step.staff.jp)}</b><small>${esc(step.staff.romaji)} · "${esc(step.staff.en)}"</small></div>` : ''}
        ${step.reply ? `<div class="reply-line">${c ? esc(c.person.en) : 'Customer'}: <b class="jp">${esc(step.reply.jp)}</b><small>${esc(step.reply.romaji)}</small></div>` : ''}
        <p class="prompt">${step.prompt}</p>
        <div class="opts">${step.options.map((o, k) => `<button class="opt" data-k="${k}"><b>${esc(o.main)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('')}</div>
        <div class="explain" hidden></div>`;
      // Customers in a hurry lose patience while you think.
      let slow = false, timer = null;
      const bar = $('.patience i', body);
      if (bar && c?.person.hurry) {
        bar.style.transition = 'none';
        bar.style.width = '100%';
        requestAnimationFrame(() => { bar.style.transition = 'width 9s linear'; bar.style.width = '0%'; });
        timer = setTimeout(() => { slow = true; run.mood--; this.#setMood(run, c, body); this.sound.oops(); }, 9000);
      }
      for (const b of task.querySelectorAll('.opt')) {
        b.addEventListener('click', () => {
          clearTimeout(timer);
          if (bar) { const w = getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = w; }
          const ok = !!step.options[b.dataset.k].ok;
          if (!ok) run.mood--;
          if (c) this.#setMood(run, c, body);
          for (const x of task.querySelectorAll('.opt')) {
            x.disabled = true;
            if (step.options[x.dataset.k].ok) x.classList.add('right');
          }
          if (!ok) b.classList.add('wrong');
          run.total++;
          if (ok) run.stars++;
          if (step.yen) run.yen += step.yen;
          for (const l of step.learn ?? []) run.learned.set(l.jp, l);
          this.sound.toggle(ok, ok ? 4 : 1);
          if (ok && step.yen) this.sound.register();
          const ex = $('.explain', task);
          ex.hidden = false;
          ex.innerHTML = `<p>${ok ? '✅ ' : '💡 '}${step.explain}${slow ? ' <i>(They were in a hurry: a little faster next time!)</i>' : ''}</p><button class="kid-btn small" data-next>Next ▶</button>`;
          $('[data-next]', ex).addEventListener('click', () => { this.sound.click(); resolve(); });
          ex.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
        });
      }
    });
  }

  // ── Music: a real recording (default) or the generated lo-fi ────────────
  #music(scene) {
    const rec = RECORDINGS[this.shop?.id]?.[scene];
    const useRec = rec && store.get('music-mode', 'recording') === 'recording';
    if (useRec) { this.sound.shopMusic(null); this.sound.playRecording(rec); } else { this.sound.stopRecording(); this.sound.shopMusic(this.shop?.music); }
    const chip = $('.music-chip', this.root);
    if (!chip) return;
    chip.innerHTML = useRec
      ? `🎵 <b>${esc(rec.title)}</b> <small>${esc(rec.what)} · ${esc(rec.by)} · <a href="${rec.page}" target="_blank" rel="noopener">${esc(rec.license)}</a></small> <button data-mswap title="Switch to the generated lo-fi">⇄</button>`
      : `🎵 <b>Generated lo-fi</b> <small>composed live in a traditional scale</small>${rec ? ' <button data-mswap title="Switch to the recording">⇄</button>' : ''}`;
    chip.querySelector('[data-mswap]')?.addEventListener('click', () => {
      store.set('music-mode', useRec ? 'generated' : 'recording');
      this.sound.click();
      this.#music(scene);
    });
    // Browsers may block the first play: retry on the next tap anywhere.
    this.root.addEventListener('pointerup', () => this.sound.resumeRecording(), { once: true });
  }

  // ── The walkable 3D street ───────────────────────────────────────────────
  openWorld(shop, { spawn = 'start' } = {}) {
    this.sound.click();
    this.#closeWorld();
    this.shop = shop;
    this.found ??= new Set(store.get(`words-${shop.id}`, []));
    const total = READABLES.length;
    this.#show(`
      <div class="world">
        <div class="world-canvas"></div>
        <div class="world-hud">
          <span class="hud-pill">📖 <b class="w-found">${this.found.size}</b>/${total} words</span>
          <span class="hud-pill hud-weather">☔ <b>ざあざあ</b> <small>pouring rain</small></span>
        </div>
        <button class="shop-x" data-close aria-label="Close">✕</button>
        <div class="read-card" hidden></div>
        <div class="world-toast" hidden></div>
        <div class="music-chip"></div>
        <div class="joy" aria-label="Move"><i></i></div>
        <div class="world-hint"><span class="only-mouse">WASD / arrows to walk · Shift to run · drag to look</span><span class="only-touch">Joystick to walk · drag to look</span> · <button class="link-btn" data-skip>Skip into the shop ▶</button></div>
        <div class="world-title ${spawn === 'start' ? '' : 'gone'}">
          <div class="wt-inner">
            <div class="wt-jp">あまやどり</div>
            <div class="wt-sub">A rainy night in Tokyo</div>
            <p>Walk the wet street and find <b>${total} Japanese words</b> on signs, shops and the road. Then step through the glowing door to do Mum's shopping at the konbini.</p>
            <button class="kid-btn" data-go>Start walking ▶</button>
            <div class="wt-loading"></div>
            <div class="wt-credit">Heroine: VRM sample model © 2022 pixiv Inc. (VRM Public License 1.0)</div>
          </div>
        </div>
      </div>`);
    const wrap = $('.world', this.root);
    this.world = new StreetWorld($('.world-canvas', wrap), {
      sound: this.sound,
      found: this.found,
      onDiscover: (r, n) => this.#discover(r, n, total, 'words'),
      onEnter: () => this.#enterShop(),
      spawn,
    });
    this.world.onAvatarProgress = (p) => {
      const el = $('.wt-loading', wrap);
      if (el) el.textContent = p >= 1 ? '' : `Loading the heroine… ${Math.round(p * 100)}%`;
    };
    this.world.start();
    window.__world = this.world; // handy for debugging from the console
    this.sound.setRain(0.85);
    this.#music('street');
    $('[data-go]', wrap).addEventListener('click', () => { this.sound.click(); $('.world-title', wrap).classList.add('gone'); });
    $('[data-skip]', wrap).addEventListener('click', () => this.#enterShop());
    this.#bindJoystick($('.joy', wrap));
    this.#cardLoop(wrap);
  }

  #closeWorld() {
    cancelAnimationFrame(this.cardRaf);
    this.world?.dispose();
    this.world = null;
  }

  #enterShop() {
    if (this.entering) return;
    this.entering = true;
    this.sound.chime();
    this.root.querySelector('.world')?.classList.add('fade-out');
    setTimeout(() => {
      this.entering = false;
      this.openInterior(this.shop);
    }, 700);
  }

  // ── Inside the konbini (3D): shop from Mum's list, pay at the till ──────
  openInterior(shop) {
    this.#closeWorld();
    this.shop = shop;
    this.shopFound ??= new Set(store.get(`shopwords-${shop.id}`, []));
    this.list = shop.shoppingList();
    this.basket = new Map();
    const total = SHOP_WORDS.length;
    this.#show(`
      <div class="world interior">
        <div class="world-canvas"></div>
        <div class="world-hud">
          <span class="hud-pill">📖 <b class="w-found">${this.shopFound.size}</b>/${total} shop words</span>
          <span class="hud-pill">🧺 <b class="w-basket">0</b> · ¥<b class="w-total">0</b></span>
        </div>
        <button class="shop-x" data-close aria-label="Close">✕</button>
        <div class="shop-list"></div>
        <div class="zone-prompt" hidden></div>
        <div class="read-card" hidden></div>
        <div class="world-toast" hidden></div>
        <div class="music-chip"></div>
        <div class="joy" aria-label="Move"><i></i></div>
        <div class="world-hint"><span class="only-mouse">Walk to a shelf · <kbd>E</kbd> take · <kbd>Q</kbd> put back</span><span class="only-touch">Walk to a shelf and tap Take</span> · <button class="link-btn" data-night>👔 Work the night shift</button></div>
      </div>`);
    const wrap = $('.world', this.root);
    this.#renderList();
    this.world = new InteriorWorld($('.world-canvas', wrap), {
      sound: this.sound,
      found: this.shopFound,
      items: shop.items,
      onDiscover: (r, n) => this.#discover(r, n, total, 'shopwords'),
      onZone: (z) => this.#zonePrompt(z),
      onExit: () => this.#leaveShop(),
    });
    this.world.onKeyAction = (k) => {
      if (k === 'e') this.#useZone(1);
      if (k === 'q') this.#useZone(-1);
    };
    this.world.start();
    window.__world = this.world;
    this.sound.setRain(0.25); // the rain, muffled through the glass
    this.sound.chime();
    this.#music('shop');
    $('[data-night]', wrap).addEventListener('click', () => { this.#closeWorld(); this.startNight(); });
    $('.shop-list', wrap).addEventListener('click', (e) => {
      if (e.target.closest('[data-en]')) $('.shop-list', wrap).classList.toggle('show-en');
    });
    this.#bindJoystick($('.joy', wrap));
    this.#cardLoop(wrap);
  }

  #renderList() {
    const el = $('.shop-list', this.root);
    if (!el) return;
    const C = this.shop.counters;
    el.innerHTML = `<div class="sl-head">📝 お母さんのメモ <small>Mum's list</small><button class="sl-en" data-en title="Show meanings">EN</button></div>
      ${this.list.map((l) => {
        const it = this.shop.items[l.item];
        const got = this.basket.get(l.item) ?? 0;
        return `<div class="sl-line ${got === l.q ? 'done' : got > l.q ? 'over' : ''}">
          <span class="sl-check">${got === l.q ? '✓' : got > l.q ? '!' : '○'}</span>
          <span class="sl-text"><b>${esc(l.text)}</b><small>${esc(l.reading)}</small><i class="sl-mean">${l.q} × ${esc(it.en)} · ${C[it.counter].kanji} = ${esc(C[it.counter].rule.split(':')[0])}</i></span>
          <span class="sl-got">${got}/${l.q}</span>
        </div>`;
      }).join('')}`;
    const n = [...this.basket.values()].reduce((a, b) => a + b, 0);
    const yen = [...this.basket].reduce((a, [id, q]) => a + this.shop.items[id].price * q, 0);
    const b = $('.w-basket', this.root), t = $('.w-total', this.root);
    if (b) b.textContent = n;
    if (t) t.textContent = yen;
  }

  #zonePrompt(z) {
    const el = $('.zone-prompt', this.root);
    if (!el) return;
    this.zone = z;
    if (!z) { el.hidden = true; return; }
    el.hidden = false;
    if (z.type === 'till') {
      const empty = !this.basket.size;
      el.innerHTML = `<span class="zp-label">🛎️ <b>レジ</b> <small>reji · the till</small></span>
        <button class="kid-btn" data-pay ${empty ? 'disabled' : ''}>${empty ? 'Your basket is empty' : 'Pay at the till ▶'}</button>`;
      $('[data-pay]', el)?.addEventListener('click', () => this.#openCheckout());
      return;
    }
    const it = this.shop.items[z.item];
    const got = this.basket.get(z.item) ?? 0;
    el.innerHTML = `<span class="zp-label"><i>${it.emoji}</i> <b>${esc(it.jp)}</b> <small>${esc(it.romaji)} · ${esc(it.en)} · ¥${it.price}</small></span>
      <button class="kid-btn ghost" data-take="-1" ${got ? '' : 'disabled'}>－ Put back</button>
      <button class="kid-btn" data-take="1">＋ Take${got ? ` (${got})` : ''}</button>`;
    for (const b of el.querySelectorAll('[data-take]')) b.addEventListener('click', () => this.#useZone(+b.dataset.take));
  }

  #useZone(d) {
    const z = this.zone;
    if (!z) return;
    if (z.type === 'till') { if (d > 0 && this.basket.size) this.#openCheckout(); return; }
    const got = (this.basket.get(z.item) ?? 0) + d;
    if (got < 0 || got > 5) return;
    if (got === 0) this.basket.delete(z.item); else this.basket.set(z.item, got);
    this.sound.toggle(d > 0, d > 0 ? 3 : 1);
    this.#renderList();
    this.#zonePrompt(z);
  }

  #openCheckout() {
    if (this.checkout || !this.basket.size) return;
    this.world.frozen = true;
    $('.zone-prompt', this.root).hidden = true;
    const shop = this.shop;
    this.checkout = new Checkout($('.world', this.root), {
      items: shop.items, yen: shop.yen, counted: shop.counted, list: this.list, basket: this.basket, sound: this.sound,
      onDone: (r) => { this.checkout = null; this.#shopResult(r); },
    });
  }

  #shopResult(r) {
    const wrap = $('.world', this.root);
    const C = this.shop.counters;
    const el = document.createElement('div');
    el.className = 'shop-result';
    el.innerHTML = `
      <div class="big-stars">${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</div>
      <h2>${r.stars === 3 ? 'Perfect shopping trip!' : r.stars === 2 ? 'Mum will be happy!' : 'Oops, check Mum\'s list!'}</h2>
      <div class="sr-lines">${r.lines.map((l) => `<div class="${l.ok ? 'ok' : 'bad'}">
        <span>${l.ok ? '✅' : '❌'}</span>
        <div><b>${esc(l.it.jp)} ${esc(l.c.jp)}</b> <small>${esc(l.c.kana)} · ${esc(l.c.romaji)}</small>
        <p>${l.ok ? `Right! ${C[l.it.counter].kanji} counts ${esc(C[l.it.counter].rule.split(':')[0])}.` : `It meant <b>${l.q}</b>, and you took ${l.got}. ${C[l.it.counter].kanji} counts ${esc(C[l.it.counter].rule.split(':')[0])}.`}</p></div>
      </div>`).join('')}
      ${r.extras.length ? `<div class="bad"><span>🛒</span><div><p>Extra things not on the list: ${r.extras.map((id) => this.shop.items[id].emoji).join(' ')}</p></div></div>` : ''}</div>
      ${r.exact ? '<p class="co-tip">🎯 ぴったり! You paid the exact amount.</p>' : ''}
      <h3>Phrases from the till</h3>
      <div class="learned">${r.learned.slice(0, 10).map((l) => `<div><b class="jp">${esc(l.jp)}</b><span>${esc(l.romaji ?? '')}</span><small>${esc(l.en ?? '')}</small></div>`).join('')}</div>
      <div class="row">
        <button class="kid-btn" data-out>🚪 Walk back outside</button>
        <button class="kid-btn ghost" data-again>🧺 Shop again</button>
        <button class="kid-btn ghost" data-night>👔 Work the night shift</button>
      </div>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    if (r.stars === 3) this.sound.cheer();
    this.onShopped?.(this.shop.id, r);
    const done = () => { el.remove(); this.world.frozen = false; };
    $('[data-out]', el).addEventListener('click', () => { el.remove(); this.#leaveShop(); });
    $('[data-again]', el).addEventListener('click', () => {
      done();
      this.list = this.shop.shoppingList();
      this.basket = new Map();
      this.#renderList();
      this.sound.chime();
    });
    $('[data-night]', el).addEventListener('click', () => { this.#closeWorld(); this.startNight(); });
  }

  #leaveShop() {
    if (this.leaving) return;
    this.leaving = true;
    this.sound.chime();
    this.root.querySelector('.world')?.classList.add('fade-out');
    setTimeout(() => {
      this.leaving = false;
      this.openWorld(this.shop, { spawn: 'door' });
    }, 600);
  }

  #discover(r, n, total, key) {
    store.set(`${key}-${this.shop.id}`, [...(key === 'words' ? this.found : this.shopFound)]);
    const el = $('.w-found', this.root);
    if (el) el.textContent = n;
    const toast = $('.world-toast', this.root);
    if (toast) {
      toast.innerHTML = `📖 New word! <b class="jp">${esc(r.jp)}</b> <span>${esc(r.romaji)}</span> = ${esc(r.en)}`;
      toast.hidden = false;
      toast.classList.remove('show');
      void toast.offsetWidth;
      toast.classList.add('show');
    }
    this.sound.toggle(true, n % 5);
    if (n === total) { this.sound.cheer(); this.onWords?.(this.shop.id); }
  }

  // Floating card above the nearest sign, following it on screen.
  #cardLoop(wrap) {
    const card = $('.read-card', wrap);
    let shown = null;
    const tick = () => {
      const rc = this.world?.readCard;
      if (!rc || !rc.visible) {
        card.hidden = true;
        shown = null;
      } else {
        if (shown !== rc.r.id) {
          shown = rc.r.id;
          card.innerHTML = `<b class="jp">${esc(rc.r.jp)}</b><span class="rom">${esc(rc.r.romaji)}</span><span class="en">${esc(rc.r.en)}</span><p>${esc(rc.r.note)}</p><button class="say" aria-label="Hear it">🔊</button>`;
          card.querySelector('.say').addEventListener('click', () => this.#sayJa(rc.r.jp));
        }
        card.hidden = false;
        const W = wrap.clientWidth;
        card.style.transform = `translate(${Math.min(Math.max(rc.x, 140), W - 140)}px, ${Math.max(rc.y, 120)}px) translate(-50%, -105%)`;
      }
      this.cardRaf = requestAnimationFrame(tick);
    };
    tick();
  }

  #sayJa(text) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('ja'));
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang ?? 'ja-JP';
    if (voice) u.voice = voice;
    u.rate = 0.85;
    synth.cancel();
    synth.speak(u);
  }

  #bindJoystick(pad) {
    const knob = pad.querySelector('i');
    let id = null;
    const move = (e) => {
      const r = pad.getBoundingClientRect();
      let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      knob.style.transform = `translate(${x * 34}px, ${y * 34}px)`;
      this.world?.setJoystick(x, y);
    };
    pad.addEventListener('pointerdown', (e) => { id = e.pointerId; pad.setPointerCapture(id); move(e); });
    pad.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    const end = () => { id = null; knob.style.transform = ''; this.world?.setJoystick(0, 0); };
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
  }

  #emoji(item) {
    return this.shop.items?.[item]?.emoji ?? '';
  }

  // Animate a chibi walking along the pavement (SVG units).
  #walk(look, from, to, ms) {
    const g = $('#walkers', this.root);
    if (!g) return Promise.resolve();
    const s = 0.62;
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.innerHTML = chibi(look);
    g.appendChild(node);
    const y = this.shop.walkY - 134 * s;
    const t0 = performance.now();
    return new Promise((resolve) => {
      const tick = (now) => {
        const k = Math.min((now - t0) / ms, 1);
        const x = from + (to - from) * k;
        const bob = Math.abs(Math.sin(k * ms / 140)) * 3;
        const flip = to < from ? -1 : 1;
        node.setAttribute('transform', `translate(${x + (flip < 0 ? 31 : -31)} ${y - bob}) scale(${s * flip} ${s})`);
        if (k < 1 && node.isConnected) requestAnimationFrame(tick);
        else { node.remove(); resolve(); }
      };
      requestAnimationFrame(tick);
    });
  }

  #placeCat() {
    const g = $('#walkers', this.root);
    if (!g) return;
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.setAttribute('class', 'scene-cat');
    node.setAttribute('transform', `translate(${this.shop.door.x + 60} ${this.shop.walkY - 38}) scale(0.5)`);
    node.innerHTML = this.shop.catSvg().replace(/<\/?svg[^>]*>/g, '');
    g.appendChild(node);
  }

  #results(run) {
    const pct = run.total ? run.stars / run.total : 0;
    const rating = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    if (rating > (this.best[this.shop.id] ?? 0)) {
      this.best[this.shop.id] = rating;
      store.set('shops', this.best);
    }
    this.sound.cheer();
    this.rain?.set(0.15);
    this.sound.setRain(0.15);
    const learned = [...run.learned.values()];
    $('.shop-counter', this.root).innerHTML = `
      <div class="counter-body results">
        <button class="shop-x" data-close aria-label="Close">✕</button>
        <div class="big-stars">${'★'.repeat(rating)}${'☆'.repeat(3 - rating)}</div>
        <h2>The rain stops. Night shift done!</h2>
        <p>${run.stars} of ${run.total} right · ${run.happy} of ${run.customers.length} customers left happy 😊 · ${this.#money(run.yen)} in the till</p>
        <h3>Attitudes you met tonight</h3>
        <div class="attitudes">${[...run.attitudes.entries()].map(([who, a]) => `<div><span>${a.emoji}</span><div><b>${esc(who)}: ${esc(a.label)}</b><small>${esc(a.note)}</small></div></div>`).join('')}</div>
        <p class="muted small">These are common shop habits, not rules: every person is different.</p>
        <h3>Words you used tonight (${learned.length})</h3>
        <div class="learned">${learned.map((l) => `<div><b class="jp">${esc(l.jp)}</b><span>${esc(l.kana && l.kana !== l.jp ? `${l.kana} · ` : '')}${esc(l.romaji)}</span><small>${esc(l.en)}</small></div>`).join('')}</div>
        <h3>How this language shapes the mind</h3>
        ${this.shop.facts.map((f) => `<div class="fact"><span>${f.emoji}</span><div><b>${esc(f.title)}</b><p>${esc(f.text)}</p>${f.sure ? `<small>${esc(f.sure)}${f.ref ? ` · ${esc(f.ref)}` : ''}</small>` : ''}</div></div>`).join('')}
        <div class="row">${this.shop.world ? '<button class="kid-btn" data-street>🌧️ Back to the street</button>' : ''}<button class="kid-btn ${this.shop.world ? 'ghost' : ''}" data-again>Another night ▶</button><button class="kid-btn ghost" data-picker>All shops</button></div>
      </div>`;
    $('[data-street]', this.root)?.addEventListener('click', () => this.openWorld(this.shop));
    for (const b of this.root.querySelectorAll('[data-close]')) b.addEventListener('click', () => this.close());
    $('[data-again]', this.root).addEventListener('click', () => this.startNight());
    $('[data-picker]', this.root).addEventListener('click', () => this.openPicker());
    this.onFinish(this.shop.id, rating);
  }
}
