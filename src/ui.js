// DOM side: language list, detail panel, legend/filters, tooltip and study notes.
import { CATEGORIES, EVIDENCE, FAMILIES } from './data/taxonomy.js';

const $ = (sel) => document.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => (n >= 1 ? n.toLocaleString('en') : n.toFixed(4).replace(/0+$/, ''));
const fmtSpeakers = (m) => (m >= 1 ? `${fmt(Math.round(m * 10) / 10)} M` : `~${Math.round(m * 1e6).toLocaleString('en')}`);

const NOTES_KEY = 'language-cosmos.notes';
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY)) ?? {}; } catch { return {}; }
}
function saveNotes(notes) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { /* storage unavailable */ }
}

const CAT_IDS = Object.keys(CATEGORIES);
// Keep in sync with the mobile breakpoints in style.css.
const MOBILE_Q = matchMedia('(max-width: 760px), (max-height: 520px)');
const LANDSCAPE_Q = matchMedia('(max-height: 520px) and (orientation: landscape)');
const PEEK_PX = 132;

const badge = (evId) => {
  const ev = EVIDENCE[evId] ?? EVIDENCE.speculative;
  return `<span class="badge" style="--c:${ev.color}" title="${esc(ev.desc)}">${ev.label}</span>`;
};

const shadowList = (list) => list.map((s) => `
  <div class="shadow-item">
    <p>${esc(s.claim)} ${badge(s.evidence)}</p>
    ${s.refs?.length ? `<ul class="refs">${s.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
  </div>`).join('');

const SHADOW_NOTE = 'A downside linked to a feature or a word, not a verdict on its speakers. Culture, history and economics usually matter more than grammar.';

export class UI {
  constructor(cosmos, { languages, features, bridges, shadows }, sound) {
    this.cosmos = cosmos;
    this.shadows = shadows;
    this.sound = sound;
    const lex = languages.map((l) => l.lexicon.n);
    sound.setLexiconRange(Math.min(...lex), Math.max(...lex));
    this.languages = languages;
    this.features = features;
    this.bridges = bridges;
    this.byId = new Map(languages.map((l) => [l.id, l]));
    this.notes = loadNotes();
    this.sortKey = 'lexicon';

    this.#buildList();
    this.#buildLegend();
    this.#bindKeys();
    this.#initChrome();
    this.showIntro();

    cosmos.on('hover', (data, at) => this.#tooltip(data, at));
    cosmos.on('select', (data) => this.select(data));

    // Deep link: index.html#ja opens straight onto a language.
    const fromHash = (instant) => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!this.byId.has(id) || id === this.cosmos.state.focus) return;
      this.cosmos.focusLanguage(id, { instant });
      this.showLanguage(id);
      if (this.sheetState === 'peek') this.setSheet('half', { silent: true });
    };
    window.addEventListener('hashchange', () => fromHash(false));
    fromHash(true);
  }

  #setHash(id) {
    history.replaceState(null, '', id ? `#${id}` : location.pathname);
  }

  select(data) {
    if (!data) return;
    this.#setHash(data.langId ?? '');
    this.closeOverlays();
    if (data.kind === 'core') this.sound.selectCore(this.byId.get(data.langId).lexicon.n);
    else if (data.kind === 'leaf') this.sound.selectLeaf(CAT_IDS.indexOf(data.item.category), EVIDENCE[data.item.evidence]?.rank, data.item.type === 'concept');
    else if (data.kind === 'bridge') this.sound.bridge();
    if (data.kind === 'core') {
      this.cosmos.focusLanguage(data.langId);
      this.showLanguage(data.langId);
    } else if (data.kind === 'leaf') {
      this.cosmos.focusLeaf(data.langId, data.item);
      this.showItem(data.langId, data.item);
    } else if (data.kind === 'bridge') {
      this.cosmos.focusBridge(data.bridge);
      this.showBridge(data.bridge);
    }
    if (this.sheetState === 'peek') this.setSheet('half');
  }

  // ── Mobile chrome: top-bar buttons, overlays, bottom sheet, view insets ──
  get #sheetMode() { return MOBILE_Q.matches && !LANDSCAPE_Q.matches; }

  #initChrome() {
    $('#btn-list').addEventListener('click', () => this.openOverlay('#list'));
    $('#btn-filters').addEventListener('click', () => this.openOverlay('#legend'));
    $('#btn-home').addEventListener('click', () => { this.closeOverlays(); this.home(); });
    $('#btn-sound').addEventListener('click', () => this.toggleSound());
    $('#scrim').addEventListener('click', () => this.closeOverlays());
    for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', () => this.closeOverlays());
    this.#syncSoundButton();

    this.sheetState = 'peek';
    this.#initSheetDrag();
    const relayout = () => this.setSheet(this.sheetState, { silent: true });
    window.addEventListener('resize', relayout);
    MOBILE_Q.addEventListener('change', relayout);
    LANDSCAPE_Q.addEventListener('change', relayout);
    relayout();
  }

  openOverlay(sel) {
    this.sound.click();
    this.closeOverlays();
    $(sel).classList.add('open');
    const scrim = $('#scrim');
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('show'));
  }

  closeOverlays() {
    const open = document.querySelectorAll('.overlay.open');
    if (!open.length) return false;
    for (const o of open) o.classList.remove('open');
    const scrim = $('#scrim');
    scrim.classList.remove('show');
    setTimeout(() => { if (!scrim.classList.contains('show')) scrim.hidden = true; }, 300);
    document.activeElement?.blur?.();
    return true;
  }

  #sheetOffsets() {
    const h = $('#panel').offsetHeight;
    return { peek: Math.max(h - PEEK_PX, 0), half: Math.max(h - window.innerHeight * 0.52, 0), full: 0 };
  }

  setSheet(state, { silent = false } = {}) {
    const panel = $('#panel');
    this.sheetState = state;
    panel.dataset.state = state;
    if (this.#sheetMode) {
      panel.style.transform = `translateY(${this.#sheetOffsets()[state]}px)`;
      if (!silent) this.sound.click();
    } else {
      panel.style.transform = '';
    }
    this.#updateInsets();
  }

  #initSheetDrag() {
    const panel = $('#panel'), handle = panel.querySelector('.sheet-handle');
    let drag = null;
    handle.addEventListener('pointerdown', (e) => {
      if (!this.#sheetMode) return;
      drag = { y0: e.clientY, off0: this.#sheetOffsets()[this.sheetState], t0: performance.now(), y: e.clientY };
      panel.classList.add('dragging');
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', (e) => {
      if (!drag) return;
      drag.y = e.clientY;
      const off = Math.min(Math.max(drag.off0 + e.clientY - drag.y0, 0), this.#sheetOffsets().peek);
      panel.style.transform = `translateY(${off}px)`;
    });
    const end = () => {
      if (!drag) return;
      panel.classList.remove('dragging');
      const dy = drag.y - drag.y0;
      const offs = this.#sheetOffsets();
      const order = ['full', 'half', 'peek'];
      let next;
      if (Math.abs(dy) < 6) {
        next = this.sheetState === 'peek' ? 'half' : this.sheetState === 'half' ? 'full' : 'half';
      } else {
        // A quick flick moves one stop; a slow drag snaps to the nearest stop.
        const v = dy / Math.max(performance.now() - drag.t0, 1);
        const i = order.indexOf(this.sheetState);
        if (Math.abs(v) > 0.6) next = order[Math.min(Math.max(i + Math.sign(dy), 0), 2)];
        else {
          const off = drag.off0 + dy;
          next = order.reduce((a, b) => (Math.abs(offs[b] - off) < Math.abs(offs[a] - off) ? b : a));
        }
      }
      drag = null;
      this.setSheet(next);
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this.setSheet(this.sheetState === 'full' ? 'peek' : this.sheetState === 'peek' ? 'half' : 'full');
    });
  }

  // Tell the 3D view which screen edges are covered, so the focused star
  // is centred in the part you can actually see.
  #updateInsets() {
    const W = window.innerWidth, H = window.innerHeight;
    const rect = (sel) => $(sel).getBoundingClientRect();
    if (this.#sheetMode) {
      const visible = $('#panel').offsetHeight - this.#sheetOffsets()[this.sheetState];
      this.cosmos.setViewInset({ top: rect('#hud').bottom, bottom: visible });
    } else if (MOBILE_Q.matches) {
      this.cosmos.setViewInset({ right: W - rect('#panel').left });
    } else {
      this.cosmos.setViewInset({ left: rect('#list').right, right: W - rect('#panel').left, bottom: H - rect('#legend').top });
    }
  }

  #syncSoundButton() {
    $('#btn-sound').classList.toggle('off', !this.sound.enabled);
  }

  // ── Left: searchable language list ───────────────────────────────────────
  #buildList() {
    const input = $('#search');
    input.addEventListener('input', () => this.#renderList());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = $('#lang-list li');
        if (first) this.select({ kind: 'core', langId: first.dataset.id });
      }
    });
    $('#sort').addEventListener('change', (e) => { this.sortKey = e.target.value; this.#renderList(); });
    this.#renderList();
  }

  #renderList() {
    const q = $('#search').value.trim().toLowerCase();
    const key = this.sortKey;
    const sorted = [...this.languages]
      .filter((l) => !q || `${l.name} ${l.native} ${FAMILIES[l.family]?.label} ${l.branch}`.toLowerCase().includes(q))
      .sort((a, b) => key === 'name' ? a.name.localeCompare(b.name)
        : key === 'speakers' ? b.speakers - a.speakers
          : key === 'branches' ? this.cosmos.itemsFor(b).length - this.cosmos.itemsFor(a).length
            : b.lexicon.n - a.lexicon.n);
    $('#lang-list').innerHTML = sorted.map((l) => `
      <li data-id="${l.id}" class="${this.cosmos.state.focus === l.id ? 'active' : ''}">
        <i style="--c:${FAMILIES[l.family]?.color}"></i>
        <span class="n">${esc(l.name)}</span>
        <span class="nat">${esc(l.native !== l.name ? l.native : '')}</span>
        <span class="metric">${key === 'speakers' ? fmtSpeakers(l.speakers) : key === 'branches' ? this.cosmos.itemsFor(l).length : fmt(l.lexicon.n)}</span>
      </li>`).join('');
    for (const li of document.querySelectorAll('#lang-list li')) {
      li.addEventListener('click', () => this.select({ kind: 'core', langId: li.dataset.id }));
    }
  }

  // ── Bottom: legend doubles as category filter ────────────────────────────
  #buildLegend() {
    const cats = $('#cat-filter');
    cats.innerHTML = Object.entries(CATEGORIES).map(([id, c]) => `
      <button class="chip on" data-cat="${id}" style="--c:${c.color}" title="${esc(c.blurb)}">
        <i></i>${c.label} <small>${c.zh}</small>
      </button>`).join('');
    cats.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      const set = new Set(this.cosmos.state.categories);
      const idx = CAT_IDS.indexOf(btn.dataset.cat);
      if (e.shiftKey) { // solo this category
        set.clear(); set.add(btn.dataset.cat);
        this.sound.sweep();
      } else if (set.has(btn.dataset.cat)) {
        set.delete(btn.dataset.cat);
        this.sound.toggle(false, idx);
      } else {
        set.add(btn.dataset.cat);
        this.sound.toggle(true, idx);
      }
      for (const b of cats.querySelectorAll('[data-cat]')) b.classList.toggle('on', set.has(b.dataset.cat));
      this.cosmos.set({ categories: set });
    });

    const evSel = $('#ev-filter');
    evSel.innerHTML = Object.entries(EVIDENCE).map(([id, e]) => `<option value="${e.rank}">${e.label}${e.rank ? ' and stronger' : ' (show all)'}</option>`).join('');
    evSel.addEventListener('change', () => {
      this.sound.toggle(true, Number(evSel.value));
      this.cosmos.set({ minEvidence: Number(evSel.value) });
    });

    $('#size-mode').addEventListener('change', (e) => { this.sound.sweep(); this.cosmos.setSizeMode(e.target.value); });
    $('#toggle-trees').addEventListener('change', (e) => { this.sound.toggle(e.target.checked, 1); this.cosmos.set({ showAllTrees: e.target.checked }); });
    $('#toggle-bridges').addEventListener('change', (e) => { this.sound.toggle(e.target.checked, 3); this.cosmos.set({ showBridges: e.target.checked }); });
    $('#toggle-shadow').addEventListener('change', (e) => { this.sound.toggle(e.target.checked, 2); this.cosmos.set({ showShadow: e.target.checked }); });
    $('#toggle-rotate').addEventListener('change', (e) => { this.sound.toggle(e.target.checked, 4); this.cosmos.setAutoRotate(e.target.checked); });
    $('#sort').addEventListener('change', () => this.sound.click());
    $('#btn-overview').addEventListener('click', () => this.home());
    $('#btn-export').addEventListener('click', () => { this.sound.click(); this.#exportNotes(); });

    const soundBox = $('#toggle-sound'), vol = $('#volume');
    soundBox.checked = this.sound.enabled;
    vol.value = this.sound.volume;
    soundBox.addEventListener('change', () => { this.sound.setEnabled(soundBox.checked); this.#syncSoundButton(); });
    vol.addEventListener('input', () => this.sound.setVolume(Number(vol.value)));
  }

  toggleSound() {
    const box = $('#toggle-sound');
    box.checked = !box.checked;
    this.sound.setEnabled(box.checked);
    this.#syncSoundButton();
  }

  home() {
    this.sound.overview();
    this.#setHash('');
    this.cosmos.overview();
    this.showIntro();
    this.#renderList();
    this.setSheet('peek', { silent: true });
  }

  #bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      if (e.key === 'Escape' && !this.closeOverlays()) this.home();
      if (e.key === '/') {
        e.preventDefault();
        if (MOBILE_Q.matches) this.openOverlay('#list');
        $('#search').focus();
      }
      if (e.key === 'm' || e.key === 'M') this.toggleSound();
    });
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────
  #tooltip(data, at) {
    const key = data ? `${data.kind}:${data.langId ?? ''}:${data.item?.id ?? data.bridge?.title ?? ''}` : '';
    if (key && key !== this.hoverKey) this.sound.hover(data.kind, [...key].reduce((h, c) => h + c.charCodeAt(0), 0));
    this.hoverKey = key;
    const tip = $('#tooltip');
    if (!data || !at) { tip.hidden = true; return; }
    let html = '';
    if (data.kind === 'core') {
      const l = this.byId.get(data.langId);
      html = `<b>${esc(l.name)}</b> <span class="muted">${esc(l.native)}</span><br>
        <span class="muted">${esc(FAMILIES[l.family]?.label)} › ${esc(l.branch)}</span><br>
        Lexicon ≈ ${fmt(l.lexicon.n)}${l.lexicon.verify ? ' <span class="warn">(rough)</span>' : ''} · Speakers ${fmtSpeakers(l.speakers)}`;
    } else if (data.kind === 'leaf') {
      const c = CATEGORIES[data.item.category];
      html = `<span style="color:${c.color}">${c.label}</span> ${badge(data.item.evidence)}<br><b>${esc(data.item.title)}</b>`;
    } else if (data.kind === 'bridge') {
      const b = data.bridge;
      html = `<span class="muted">Bilingual bridge</span> ${badge(b.evidence)}<br><b>${esc(this.byId.get(b.a).name)} ⇄ ${esc(this.byId.get(b.b).name)}</b>: ${esc(b.title)}`;
    }
    tip.innerHTML = html;
    tip.hidden = false;
    const x = Math.min(at.x + 16, window.innerWidth - tip.offsetWidth - 12);
    tip.style.transform = `translate(${x}px, ${at.y + 16}px)`;
  }

  // ── Right panel views ────────────────────────────────────────────────────
  #panel(html) {
    const p = $('#panel-body');
    p.innerHTML = html;
    p.scrollTop = 0;
    for (const el of p.querySelectorAll('[data-lang]')) {
      el.addEventListener('click', () => this.select({ kind: 'core', langId: el.dataset.lang }));
    }
    this.#renderList();
  }

  showIntro() {
    const nLeaves = this.languages.reduce((s, l) => s + this.cosmos.itemsFor(l).length, 0);
    this.#panel(`
      <h2>Explore the language universe</h2>
      <p class="lead"><span class="only-mouse">Click a star · drag to orbit · scroll to zoom</span><span class="only-touch">Tap a star · drag to orbit · pinch to zoom</span></p>
      <h3>How to read it</h3>
      <p>Each glowing <b>core</b> is a language. Its <b>volume</b> is proportional to its vocabulary (dictionary headwords), or to its speakers if you switch the size mode.
      Cores cluster by <b>family</b>, and the coloured nebula behind a cluster marks the family.</p>
      <p>Every core grows <b>branches</b> in eight fixed directions, one per trait domain. The leaves are linguistic features (●) or culture-key words (◆) with a claimed effect on how speakers think, feel or act.</p>
      <ul class="howto">
        <li><b>Leaf size</b> shows strength of evidence. A <b>wireframe</b> leaf is speculative.</li>
        <li><b>Red thorns</b> mark the <b>shadow side</b>: a documented or hypothesised <em>negative</em> effect, graded on the same evidence scale. Toggle them under Filters.</li>
        <li><b>Gold arcs</b> between cores are <b>bilingual studies</b>, where the <em>same person</em> shifts when switching language. This is the cleanest evidence that language and personality are linked.</li>
        <li class="only-mouse">Click a core or leaf, or a name on the left. Press <kbd>Esc</kbd> to return to the overview, <kbd>/</kbd> to search and <kbd>M</kbd> to mute. Shift-click a domain to show only that one.</li>
        <li class="only-touch">Use the search button to find a language and the sliders button for filters. Drag this sheet up for details, or down to see more of the sky.</li>
      </ul>
      <h3>Evidence scale</h3>
      <div class="ev-scale">${Object.entries(EVIDENCE).reverse().map(([id, e]) => `<div>${badge(id)}<span>${esc(e.desc)}</span></div>`).join('')}</div>
      <h3>Two cautions before studying</h3>
      <p class="muted">1. <b>Language ≠ culture.</b> Most country-level links (future tense ↔ saving, pronoun-drop ↔ collectivism) are correlational. Within-person bilingual designs separate the two best.</p>
      <p class="muted">2. <b>Vocabulary counts are not comparable.</b> Dictionaries differ in scope, and agglutinative languages (Finnish, Turkish) have effectively unlimited word forms. Treat core size as "how much is documented", not "how expressive".</p>
      <p class="stat">${this.languages.length} cores · ${nLeaves} leaves · ${this.bridges.length} bridges</p>
    `);
  }

  showLanguage(id) {
    const l = this.byId.get(id);
    const items = this.cosmos.itemsFor(l);
    const byCat = Object.keys(CATEGORIES).map((c) => [c, items.filter((i) => i.category === c)]).filter(([, a]) => a.length);
    const myBridges = this.bridges.filter((b) => b.a === id || b.b === id);
    const fam = FAMILIES[l.family];

    this.#panel(`
      <div class="lang-head" style="--c:${fam?.color}">
        <div class="native-big">${esc(l.native)}</div>
        <h2>${esc(l.name)}</h2>
        <div class="muted">${esc(fam?.label)} › ${esc(l.branch)}${l.region ? ` · ${esc(l.region)}` : ''}</div>
      </div>
      <div class="stats">
        <div><small>Vocabulary core</small><b>${fmt(l.lexicon.n)}</b><span class="muted">${esc(l.lexicon.source)}</span>${l.lexicon.verify ? '<span class="warn">rough figure, verify before citing</span>' : ''}</div>
        <div><small>Speakers (L1+L2)</small><b>${fmtSpeakers(l.speakers)}</b></div>
        <div><small>Word order</small><b>${esc(l.typology.order)}</b></div>
        <div><small>Morphology</small><b>${esc(l.typology.morphology)}</b></div>
        <div><small>Script</small><b>${esc(l.typology.script)}</b></div>
        <div><small>Tone</small><b>${l.typology.tone ? 'Yes' : 'No'}</b></div>
      </div>
      ${byCat.map(([c, arr]) => `
        <section class="branch" style="--c:${CATEGORIES[c].color}">
          <h3><i></i>${CATEGORIES[c].label} <small>${CATEGORIES[c].zh}</small></h3>
          ${arr.map((it) => `
            <button class="leaf-row" data-item="${esc(it.id)}">
              <span class="t">${it.type === 'concept' ? '◆' : '●'} ${esc(it.title)}${it.shadow ? ' <span class="thorn" title="Has a shadow side">▲</span>' : ''}</span>${badge(it.evidence)}
              ${it.example ? `<span class="ex">${esc(it.example)}</span>` : ''}
            </button>`).join('')}
        </section>`).join('')}
      ${myBridges.length ? `<h3>Bilingual bridges</h3>${myBridges.map((b) => `
        <button class="bridge-row" data-bridge="${this.bridges.indexOf(b)}">
          ⇄ ${esc(this.byId.get(b.a === id ? b.b : b.a).name)}: ${esc(b.title)} ${badge(b.evidence)}
        </button>`).join('')}` : ''}
      ${(() => {
        const dark = items.filter((it) => it.shadow);
        if (!dark.length) return '';
        return `<section class="shadow-sec">
          <h3>▲ Shadow side: possible negative impacts (${dark.reduce((n, it) => n + it.shadow.length, 0)})</h3>
          <p class="muted small">${SHADOW_NOTE} More thorns means more studied features, not a "worse" language.</p>
          ${dark.map((it) => `<button class="shadow-row" data-item="${esc(it.id)}"><b>${esc(it.title)}</b>${shadowList(it.shadow)}</button>`).join('')}
        </section>`;
      })()}
      <h3>My study notes</h3>
      <textarea id="notes" placeholder="Hypotheses, observations from speakers you know, papers to read… (saved in this browser)">${esc(this.notes[id] ?? '')}</textarea>
    `);

    for (const btn of document.querySelectorAll('.leaf-row, .shadow-row')) {
      btn.addEventListener('click', () => {
        const item = items.find((i) => i.id === btn.dataset.item);
        this.select({ kind: 'leaf', langId: id, item });
      });
    }
    for (const btn of document.querySelectorAll('.bridge-row')) {
      btn.addEventListener('click', () => this.select({ kind: 'bridge', bridge: this.bridges[btn.dataset.bridge] }));
    }
    $('#notes').addEventListener('input', (e) => {
      this.notes[id] = e.target.value;
      saveNotes(this.notes);
    });
  }

  showItem(langId, item) {
    const l = this.byId.get(langId);
    const c = CATEGORIES[item.category];
    const shared = item.type === 'feature'
      ? this.languages.filter((x) => x.id !== langId && (x.features.includes(item.id) || x[item.id]))
      : [];
    this.#panel(`
      <button class="back" data-lang="${langId}">← ${esc(l.name)}</button>
      <div class="item-head" style="--c:${c.color}">
        <small>${c.label} · ${c.zh}</small>
        <h2>${item.type === 'concept' ? '◆' : '●'} ${esc(item.title)}</h2>
        ${badge(item.evidence)} <span class="muted">${esc(EVIDENCE[item.evidence]?.desc)}</span>
      </div>
      ${item.example ? `<p class="example">${esc(item.example)}</p>` : ''}
      <h3>Claimed effect</h3><p>${esc(item.claim)}</p>
      ${item.mechanism ? `<h3>Mechanism</h3><p>${esc(item.mechanism)}</p>` : ''}
      ${item.refs?.length ? `<h3>Sources</h3><ul class="refs">${item.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
      ${item.study ? `<h3>How to test it</h3><p class="study">${esc(item.study)}</p>` : ''}
      ${item.shadow ? `<section class="shadow-sec"><h3>▲ Shadow side</h3><p class="muted small">${SHADOW_NOTE}</p>${shadowList(item.shadow)}</section>` : ''}
      ${shared.length ? `<h3>Also found in</h3><div class="chips">${shared.map((x) => `
        <button class="chip on" data-lang="${x.id}" style="--c:${FAMILIES[x.family]?.color}"><i></i>${esc(x.name)}${item.ex?.[x.id] ? ` <small>${esc(item.ex[x.id])}</small>` : ''}</button>`).join('')}</div>` : ''}
    `);
  }

  showBridge(b) {
    const A = this.byId.get(b.a), B = this.byId.get(b.b);
    const c = CATEGORIES[b.category];
    this.#panel(`
      <div class="item-head" style="--c:${c.color}">
        <small>Bilingual bridge · ${c.label}</small>
        <h2>${esc(A.name)} ⇄ ${esc(B.name)}</h2>
        <h3 style="margin-top:4px">${esc(b.title)}</h3>
        ${badge(b.evidence)}
      </div>
      <p>${esc(b.claim)}</p>
      <h3>Sources</h3><ul class="refs">${b.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${this.shadows.bridges[b.title] ? `<section class="shadow-sec"><h3>▲ Shadow side</h3>${shadowList(this.shadows.bridges[b.title])}</section>` : ''}
      <p class="muted">Why bridges matter: the same people are compared with themselves, so culture, upbringing and genes are held constant, and the language of testing is the only thing that changes.</p>
      <div class="chips">
        <button class="chip on" data-lang="${A.id}" style="--c:${FAMILIES[A.family]?.color}"><i></i>${esc(A.name)}</button>
        <button class="chip on" data-lang="${B.id}" style="--c:${FAMILIES[B.family]?.color}"><i></i>${esc(B.name)}</button>
      </div>
    `);
  }

  #exportNotes() {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), notes: this.notes }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'language-cosmos-notes.json' });
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
