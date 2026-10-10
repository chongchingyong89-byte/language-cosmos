// Explorer mode (kids) + the guided Space Mission (both modes).
import { FAMILIES, STAGES } from '../data/taxonomy.js';
import { GREETINGS, POWERS, SURE, TOUR, QUIZ, BADGES } from './data.js';
import { Games } from './games.js';
import { VOICES } from './voices.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(`language-cosmos.${k}`)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`language-cosmos.${k}`, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const people = (m) => (m >= 1 ? `${Math.round(m).toLocaleString('en')} million` : `about ${Math.round(m * 1e6).toLocaleString('en')}`);

const KID_STAGES = {
  womb: 'You hear your mum\'s language through her tummy, and you remember it on your birthday!',
  infancy: 'Your ears tune in to the sounds of your language and stop noticing sounds it doesn\'t use.',
  toddler: 'Learning words like "blue" changes how your brain sorts colours!',
  early: 'Talking with people helps you understand that others think different things from you.',
  school: 'Your language\'s habits settle in, like how you tell stories and count.',
  adult: 'Your first language stays your "feelings language", even when you learn more languages!',
};

export class Explorer {
  constructor(ui, { languages, timeline }) {
    this.ui = ui;
    this.cosmos = ui.cosmos;
    this.sound = ui.sound;
    this.languages = languages;
    this.timeline = timeline;
    this.byId = new Map(languages.map((l) => [l.id, l]));
    this.mode = store.get('mode', null);
    this.passport = new Set(store.get('passport', []));
    this.badges = new Set(store.get('badges', []));
    this.tourIndex = null;
    window.speechSynthesis?.getVoices(); // start loading voices early
    this.games = new Games(this.sound, { onFinish: (g, score, total) => this.#gameDone(g, score, total) });

    $('#mode-toggle').addEventListener('click', () => this.setMode(this.active ? 'research' : 'kids'));
    $('#mode-toggle-2').addEventListener('click', () => this.setMode(this.active ? 'research' : 'kids'));
    this.#applyMode();
  }

  get active() { return this.mode === 'kids'; }

  // First visit: ask who is exploring. Deep links skip straight in.
  welcome() {
    const w = $('#welcome');
    if (this.mode || location.hash) { w.remove(); return; }
    w.hidden = false;
    requestAnimationFrame(() => w.classList.add('show'));
    for (const b of w.querySelectorAll('[data-mode]')) {
      b.addEventListener('click', () => {
        w.classList.remove('show');
        setTimeout(() => w.remove(), 600);
        this.setMode(b.dataset.mode);
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
    store.set('mode', mode);
    this.sound.sweep();
    this.#applyMode();
    this.ui.home();
  }

  #applyMode() {
    const kids = this.active;
    document.body.classList.toggle('kids', kids);
    for (const el of document.querySelectorAll('.mode-label')) el.textContent = kids ? '🧑‍🚀 Explorer' : '🔬 Research';
    this.cosmos.set({
      showShadow: !kids && $('#toggle-shadow').checked,
      kidOnly: kids ? new Set(Object.keys(POWERS)) : null,
    });
    this.cosmos.setLeafLabeler(kids ? (item) => (POWERS[item.id] ? `${POWERS[item.id].emoji} ${POWERS[item.id].name}` : null) : null);
    if (kids) { $('#lens').value = ''; this.ui.setLens(''); }
  }

  // Selecting something by hand ends a running tour.
  interrupt() { this.tourIndex = null; }

  // ── Panels (Explorer mode) ───────────────────────────────────────────────
  showIntro() {
    this.ui.renderPanel(`
      <div class="kid-intro">
        <div class="kid-big-emoji">🚀</div>
        <h2>Welcome, Space Explorer!</h2>
        <p>Every glowing star is a <b>language</b>. Tap one to hear it say hello and discover the <b>brain superpowers</b> it gives the people who speak it.</p>
        <button class="kid-btn wide" data-tour>▶ Start the Space Mission</button>
        <div class="kid-row">
          <button class="kid-btn ghost" data-game="tone">🎵 Tone Detective</button>
          <button class="kid-btn ghost" data-game="number">🔢 Number Ninja</button>
          <button class="kid-btn ghost" data-game="blue">🔵 Blue Spotter</button>
        </div>
        <button class="kid-btn ghost wide" data-passport>🛂 My Passport · ${this.passport.size}/${this.languages.length} stamps · ${this.badges.size} badges</button>
        <button class="kid-btn ghost wide" data-origin>👶 How your first language grows with you</button>
      </div>`, () => this.#wire());
  }

  showLanguage(id) {
    const l = this.byId.get(id);
    const g = GREETINGS[id] ?? {};
    const fam = FAMILIES[l.family];
    const powers = this.cosmos.itemsFor(l).filter((it) => POWERS[it.id]);
    const isNew = this.#stamp(id);
    this.ui.renderPanel(`
      <div class="kid-hero" style="--c:${fam?.color}">
        ${g.text ? `<div class="kid-greet">${esc(g.text)}</div>${g.roman ? `<div class="kid-roman">${esc(g.roman)}</div>` : ''}` : ''}
        ${g.sign ? `<div class="kid-greet">👋</div><p class="kid-sign">${esc(g.sign)}</p>` : ''}
        ${g.note ? `<div class="kid-greet">🌿</div><p class="kid-sign">${esc(g.note)}</p>` : ''}
        ${g.speak || VOICES[id] ? '<button class="kid-btn" data-speak>🔊 Say hello</button>' : ''}
        ${VOICES[id] ? `<div class="voice-credit">🎙️ Real voice: ${esc(VOICES[id].by)} · <a href="${VOICES[id].page}" target="_blank" rel="noopener">${esc(VOICES[id].license)}, Wikimedia Commons</a></div>` : ''}
        <h2>${esc(l.name)}</h2>
        <div class="muted">${esc(l.native !== l.name ? `${l.native} · ` : '')}${esc(fam?.label)} family</div>
        <div class="stamp ${isNew ? 'new' : ''}">🛂 ${isNew ? 'New stamp!' : 'Stamped'}</div>
      </div>
      <div class="kid-facts">
        <div><b>${people(l.speakers)}</b><span>people ${l.family === 'sign' ? 'sign' : 'speak'} it</span></div>
        <div><b>${l.lexicon.n.toLocaleString('en')}</b><span>words in its big dictionary</span></div>
      </div>
      <h3>Brain superpowers</h3>
      ${powers.length ? powers.map((it) => this.#powerCard(it)).join('') : '<p class="muted">Scientists are still discovering this language\'s superpowers!</p>'}
    `, () => this.#wire(id));
  }

  showItem(langId, item) {
    const p = POWERS[item.id];
    if (!p) return this.showLanguage(langId);
    const also = this.languages.filter((x) => x.id !== langId && (x.features.includes(item.id) || x[item.id]));
    this.ui.renderPanel(`
      <button class="back" data-lang="${langId}">← ${esc(this.byId.get(langId).name)}</button>
      ${this.#powerCard(item, true)}
      ${also.length ? `<h3>Other languages with this superpower</h3><div class="chips">${also.map((x) => `<button class="chip on" data-lang="${x.id}" style="--c:${FAMILIES[x.family]?.color}"><i></i>${esc(x.name)}</button>`).join('')}</div>` : ''}
    `, () => this.#wire(langId));
  }

  showBridge(b) {
    const A = this.byId.get(b.a), B = this.byId.get(b.b);
    this.ui.renderPanel(`
      <div class="kid-intro">
        <div class="kid-big-emoji">🌉</div>
        <h2>${esc(A.name)} + ${esc(B.name)}</h2>
        <p>Scientists studied people who speak <b>both</b> ${esc(A.name)} and ${esc(B.name)}. They acted a little differently depending on which language they were using, like having two outfits for your brain!</p>
        <div class="chips">
          <button class="chip on" data-lang="${A.id}" style="--c:${FAMILIES[A.family]?.color}"><i></i>${esc(A.name)}</button>
          <button class="chip on" data-lang="${B.id}" style="--c:${FAMILIES[B.family]?.color}"><i></i>${esc(B.name)}</button>
        </div>
      </div>`, () => this.#wire());
  }

  showOrigin() {
    this.ui.renderPanel(`
      <div class="kid-intro">
        <div class="kid-big-emoji">👶</div>
        <h2>Your first language grows with you</h2>
        <p>The language you hear first is called your <b>mother tongue</b> (母语). Here's how it shapes your brain as you grow up:</p>
      </div>
      <div class="kid-timeline">${Object.entries(STAGES).map(([sid, st]) => {
        const sure = this.timeline.filter((t) => t.stage === sid).map((t) => SURE[t.evidence]?.stars).sort().pop() ?? '';
        return `<div class="kt-step"><div class="kt-dot"></div><div><b>${st.label}</b> <span class="muted">${st.age}</span><p>${KID_STAGES[sid]}</p>${sure ? `<span class="sure">${sure}</span>` : ''}</div></div>`;
      }).join('')}</div>
    `, () => this.#wire());
  }

  #powerCard(item, big = false) {
    const p = POWERS[item.id];
    const sure = SURE[item.evidence] ?? SURE.speculative;
    return `<div class="power ${big ? 'big' : ''}" data-item="${esc(item.id)}">
      <div class="power-emoji">${p.emoji}</div>
      <div class="power-body">
        <b>${esc(p.name)}</b>
        <p>${esc(p.fact)}</p>
        <span class="sure" title="${esc(sure.text)}">${sure.stars} ${esc(sure.text)}</span>
        ${p.game ? `<button class="kid-btn small" data-game="${p.game}">🎮 Play the game</button>` : ''}
      </div>
    </div>`;
  }

  #wire(langId) {
    const body = $('#panel-body');
    body.querySelector('[data-tour]')?.addEventListener('click', () => this.startTour());
    body.querySelector('[data-passport]')?.addEventListener('click', () => this.showPassport());
    body.querySelector('[data-speak]')?.addEventListener('click', () => this.speak(langId));
    for (const b of body.querySelectorAll('[data-game]')) b.addEventListener('click', (e) => { e.stopPropagation(); this.games.open(b.dataset.game); });
    for (const card of body.querySelectorAll('.power:not(.big)')) {
      card.addEventListener('click', () => {
        const item = this.cosmos.itemsFor(this.byId.get(langId)).find((i) => i.id === card.dataset.item);
        if (item) this.ui.select({ kind: 'leaf', langId, item });
      });
    }
  }

  // ── Speech ───────────────────────────────────────────────────────────────
  // Voices load asynchronously (Android Chrome often returns an empty list at
  // first), and Android still reports some languages under legacy codes.
  #voices() {
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now.length) return Promise.resolve(now);
    return new Promise((resolve) => {
      const done = () => resolve(synth.getVoices());
      synth.addEventListener('voiceschanged', done, { once: true });
      setTimeout(done, 1500);
    });
  }

  // A native speaker's recording first: it works on every device. The
  // device's own text-to-speech voice is only the fallback.
  async speak(id) {
    const btn = $('#panel-body [data-speak]');
    btn?.classList.add('speaking');
    const rec = VOICES[id];
    if (rec) {
      try {
        this.audio?.pause();
        const a = (this.audio = new Audio(rec.src));
        a.onended = () => btn?.classList.remove('speaking');
        await a.play();
        return;
      } catch { /* blocked or offline: try the device voice */ }
    }
    return this.#speakTts(id, btn);
  }

  async #speakTts(id, btn) {
    const g = GREETINGS[id];
    const synth = window.speechSynthesis;
    if (!g?.speak || !synth) {
      btn?.classList.remove('speaking');
      return this.toast('🔇 This browser can\'t speak. Try reading it out loud!');
    }

    const voices = await this.#voices();
    const ALIAS = { he: ['iw'], id: ['in'], 'zh-hk': ['yue-hk', 'yue', 'zh-yue'] };
    const codes = [g.speak, g.fallback].filter(Boolean).flatMap((c) => {
      const lc = c.toLowerCase(), base = lc.split('-')[0];
      return [lc, ...(ALIAS[lc] ?? []), ...(ALIAS[base] ?? []).map((a) => lc.replace(base, a)), base, ...(ALIAS[base] ?? [])];
    });
    const norm = (v) => v.lang.toLowerCase().replace('_', '-');
    let voice = null;
    for (const c of codes) {
      voice = voices.find((v) => norm(v) === c) ?? voices.find((v) => norm(v).startsWith(`${c}-`));
      if (voice) break;
    }
    // Skip voices of a different language, e.g. a Mandarin voice for Cantonese.
    if (id === 'yue' && voice && !/hk|yue/.test(norm(voice))) voice = null;

    synth.cancel();
    const u = new SpeechSynthesisUtterance(g.text);
    u.lang = voice?.lang ?? g.speak; // no listed voice: let the engine try (Android often can)
    if (voice) u.voice = voice;
    u.rate = 0.85;
    let started = false;
    const fail = () => {
      btn?.classList.remove('speaking');
      if (!started) this.toast(`🔇 No ${this.byId.get(id).name} voice on this device yet. You can add one in your phone's Text-to-speech settings.`);
    };
    u.onstart = () => { started = true; };
    u.onend = () => btn?.classList.remove('speaking');
    u.onerror = fail;
    synth.speak(u);
    setTimeout(() => { if (!started && !synth.speaking) { synth.cancel(); fail(); } }, 3000);
  }

  // ── Passport & badges ────────────────────────────────────────────────────
  #stamp(id) {
    if (this.passport.has(id)) return false;
    this.passport.add(id);
    store.set('passport', [...this.passport]);
    const n = this.passport.size;
    if (n >= 1) this.award('first');
    if (n >= 5) this.award('five');
    if (n >= 15) this.award('fifteen');
    if (n >= this.languages.length) this.award('all');
    if (new Set([...this.passport].map((x) => this.byId.get(x)?.family)).size >= 8) this.award('families');
    if (this.byId.get(id)?.family === 'sign') this.award('sign');
    return true;
  }

  award(id) {
    if (this.badges.has(id)) return;
    this.badges.add(id);
    store.set('badges', [...this.badges]);
    const b = BADGES.find((x) => x.id === id);
    this.sound.cheer();
    this.toast(`${b.emoji} New badge: <b>${b.name}</b>`);
  }

  showPassport() {
    this.sound.click();
    this.ui.renderPanel(`
      <div class="kid-intro"><div class="kid-big-emoji">🛂</div><h2>My Language Passport</h2>
      <p>${this.passport.size} of ${this.languages.length} languages visited</p>
      <div class="pp-bar"><i style="width:${(this.passport.size / this.languages.length) * 100}%"></i></div></div>
      <h3>Badges</h3>
      <div class="badge-grid">${BADGES.map((b) => `<div class="kbadge ${this.badges.has(b.id) ? 'got' : ''}" title="${esc(b.desc)}"><span>${b.emoji}</span><b>${esc(b.name)}</b><small>${esc(b.desc)}</small></div>`).join('')}</div>
      <h3>Stamps</h3>
      <div class="stamp-grid">${this.languages.map((l) => {
        const got = this.passport.has(l.id);
        const g = GREETINGS[l.id];
        return `<button class="pp-stamp ${got ? 'got' : ''}" data-lang="${l.id}" style="--c:${FAMILIES[l.family]?.color}">
          <span class="pp-g">${got ? esc(g?.text ?? (g?.sign ? '👋' : '🌿')) : '?'}</span><small>${esc(l.name)}</small></button>`;
      }).join('')}</div>`, () => this.#wire());
  }

  toast(html) {
    const t = $('#toast');
    t.innerHTML = html;
    t.hidden = false;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  #gameDone(game, score, total) {
    if (game === 'blue' || score >= total * 0.6) this.award(game);
  }

  // ── Space Mission ────────────────────────────────────────────────────────
  startTour() {
    this.sound.sweep();
    this.tourIndex = 0;
    this.#tourStep();
  }

  #tourStep() {
    const i = this.tourIndex;
    const s = TOUR[i];
    if (s.to === 'overview') this.cosmos.overview();
    else if (s.to === 'origin') this.cosmos.focusOrigin();
    else { this.cosmos.focusLanguage(s.to); this.#stamp(s.to); this.sound.selectCore(this.byId.get(s.to).lexicon.n); }
    const last = i === TOUR.length - 1;
    this.ui.renderPanel(`
      <div class="tour-card">
        <div class="tour-progress">${TOUR.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>
        <div class="kid-big-emoji">${s.emoji}</div>
        <small class="tour-step">Stop ${i + 1} of ${TOUR.length}</small>
        <h2>${esc(s.title)}</h2>
        <p>${esc(s.text)}</p>
        ${s.game ? `<button class="kid-btn ghost wide" data-game="${s.game}">🎮 Try it: ${{ tone: 'Tone Detective', number: 'Number Ninja', blue: 'Blue Spotter' }[s.game]}</button>` : ''}
        ${s.to !== 'overview' && s.to !== 'origin' && (GREETINGS[s.to]?.speak || VOICES[s.to]) ? `<button class="kid-btn ghost wide" data-speak>🔊 Hear "${esc(GREETINGS[s.to].text)}"</button>` : ''}
        <div class="tour-nav">
          <button class="kid-btn ghost" data-prev ${i === 0 ? 'disabled' : ''}>← Back</button>
          <button class="kid-btn" data-next>${last ? 'Take the quiz 🎓' : 'Next →'}</button>
        </div>
        <button class="link-btn" data-exit>Exit mission</button>
      </div>`, () => {
      const body = $('#panel-body');
      this.#wire(s.to);
      body.querySelector('[data-prev]').addEventListener('click', () => { this.tourIndex--; this.sound.click(); this.#tourStep(); });
      body.querySelector('[data-next]').addEventListener('click', () => {
        if (last) { this.award('tour'); this.tourIndex = null; this.quiz(); return; }
        this.tourIndex++;
        this.#tourStep();
      });
      body.querySelector('[data-exit]').addEventListener('click', () => { this.tourIndex = null; this.ui.home(); });
    });
    this.ui.setSheet('half', { silent: true });
  }

  quiz(i = 0, score = 0) {
    if (i === QUIZ.length) {
      if (score >= 5) this.award('quiz'); else this.sound.oops();
      this.ui.renderPanel(`<div class="kid-intro"><div class="kid-big-emoji">${score >= 5 ? '🎓' : '🌱'}</div>
        <h2>You scored ${score} / ${QUIZ.length}</h2>
        <p>${score >= 5 ? 'Amazing! You\'re a certified Cosmos Graduate!' : 'Great try! Fly around the stars and try again.'}</p>
        <button class="kid-btn wide" data-again>Try the quiz again</button>
        <button class="kid-btn ghost wide" data-passport>🛂 See my passport</button></div>`, () => {
        this.#wire();
        $('#panel-body [data-again]').addEventListener('click', () => this.quiz());
      });
      return;
    }
    const q = QUIZ[i];
    this.ui.renderPanel(`
      <div class="tour-card">
        <div class="tour-progress">${QUIZ.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>
        <small class="tour-step">Question ${i + 1} of ${QUIZ.length}</small>
        <h2>${esc(q.q)}</h2>
        <div class="quiz-opts">${q.options.map((o, k) => `<button class="kid-btn ghost wide" data-k="${k}">${esc(o)}</button>`).join('')}</div>
        <p class="quiz-why" hidden></p>
      </div>`, () => {
      const body = $('#panel-body');
      for (const b of body.querySelectorAll('[data-k]')) {
        b.addEventListener('click', () => {
          const ok = Number(b.dataset.k) === q.answer;
          for (const x of body.querySelectorAll('[data-k]')) {
            x.disabled = true;
            if (Number(x.dataset.k) === q.answer) x.classList.add('right');
          }
          if (!ok) b.classList.add('wrong');
          if (ok) this.sound.toggle(true, 4); else this.sound.toggle(false, 1);
          const why = body.querySelector('.quiz-why');
          why.hidden = false;
          why.innerHTML = `${ok ? '✅ Correct!' : '💡 Not quite.'} ${esc(q.why)} <button class="kid-btn small" data-n>Next →</button>`;
          why.querySelector('[data-n]').addEventListener('click', () => this.quiz(i + 1, score + (ok ? 1 : 0)));
        });
      }
    });
  }
}
