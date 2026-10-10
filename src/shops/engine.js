// World Shops engine: runs any shop definition from registry.js.
// A night = a queue of customers; each customer = a few language "steps"
// (multiple choice with an explanation). The scene, rain and sound set the mood.
import { SHOPS } from './registry.js';
import { chibi, chibiSvg } from './chibi.js';
import { Rain } from './rain.js';
import { StreetWorld, READABLES } from '../world/street.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(`language-cosmos.${k}`)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`language-cosmos.${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export class ShopGame {
  constructor(sound, { onFinish, onOpen, onClose, onWords }) {
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
          <span class="hud-pill">💴 <b class="hud-yen">¥0</b></span>
        </div>
      </div>
      <div class="shop-counter"><div class="counter-body"></div></div>`);
    this.#startRain(0.2);
    this.sound.shopMusic(shop.music);
    for (let i = 0; i < run.customers.length; i++) {
      if (this.run !== run) return;
      await this.#serve(run, run.customers[i], i);
    }
    if (this.run === run) this.#results(run);
  }

  #hud(run, i, weather) {
    const h = 22 + Math.floor((i * 40) / 60), m = (i * 40) % 60;
    $('.hud-clock', this.root).textContent = `🕙 ${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    $('.hud-weather', this.root).innerHTML = `☔ <b>${weather.word}</b> <small>${esc(weather.en)}</small>`;
    $('.hud-stars', this.root).textContent = run.stars;
    $('.hud-yen', this.root).textContent = `¥${run.yen.toLocaleString('en')}`;
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

  // ── The walkable 3D street ───────────────────────────────────────────────
  openWorld(shop) {
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
        <div class="joy" aria-label="Move"><i></i></div>
        <div class="world-hint"><span class="only-mouse">WASD / arrows to walk · Shift to run · drag to look</span><span class="only-touch">Joystick to walk · drag to look</span> · <button class="link-btn" data-skip>Skip to the counter ▶</button></div>
        <div class="world-title">
          <div class="wt-inner">
            <div class="wt-jp">あまやどり</div>
            <div class="wt-sub">A rainy night in Tokyo</div>
            <p>Walk the wet street and find <b>${total} Japanese words</b> on signs, shops and the road. Then step through the glowing door to start your shift at the konbini.</p>
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
      onDiscover: (r, n) => this.#discover(r, n, total),
      onEnter: () => this.#enterShop(),
    });
    this.world.onAvatarProgress = (p) => {
      const el = $('.wt-loading', wrap);
      if (el) el.textContent = p >= 1 ? '' : `Loading the heroine… ${Math.round(p * 100)}%`;
    };
    this.world.start();
    window.__world = this.world; // handy for debugging from the console
    this.sound.setRain(0.85);
    this.sound.shopMusic(shop.music);
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
      this.#closeWorld();
      this.startNight();
    }, 700);
  }

  #discover(r, n, total) {
    store.set(`words-${this.shop.id}`, [...this.found]);
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
        <p>${run.stars} of ${run.total} right · ${run.happy} of ${run.customers.length} customers left happy 😊 · ¥${run.yen.toLocaleString('en')} in the till</p>
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
