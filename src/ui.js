// DOM side: language list, detail panel, legend/filters, tooltip and study notes.
import { CATEGORIES, EVIDENCE, FAMILIES, TRAITS, STAGES } from './data/taxonomy.js';
import { buildProfiles } from './profile.js';
import { Explorer } from './kids/explorer.js';

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
const MOBILE_Q = matchMedia('(max-width: 980px), (max-height: 520px)');
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

const TRAIT_IDS = Object.keys(TRAITS);

// Radar: dashed ring = neutral; outward = tilts up, inward = tilts down.
function radarSvg(p, color) {
  const n = TRAIT_IDS.length, R = 80, cx = 130, cy = 110;
  const at = (i, r) => {
    const a = (i / n) * Math.PI * 2;
    return [+(cx + r * Math.sin(a)).toFixed(1), +(cy - r * Math.cos(a)).toFixed(1)];
  };
  const ring = (f, cls) => `<polygon class="${cls}" points="${TRAIT_IDS.map((_, i) => at(i, R * f).join(',')).join(' ')}"/>`;
  const axes = TRAIT_IDS.map((_, i) => { const [x, y] = at(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; }).join('');
  const pts = TRAIT_IDS.map((t, i) => at(i, R * (0.5 + 0.5 * p[t].norm)));
  const labels = TRAIT_IDS.map((t, i) => {
    const [x, y] = at(i, R + 17);
    const v = p[t].norm;
    return `<text x="${x}" y="${y}" class="${v > 0.05 ? 'up' : v < -0.05 ? 'down' : ''}">${TRAITS[t].short}</text>`;
  }).join('');
  return `<svg class="radar" viewBox="0 0 260 222" role="img" aria-label="Hypothesised personality tilt">
    <g class="grid">${ring(1, 'r')}${ring(0.75, 'r')}${ring(0.25, 'r')}${axes}</g>
    ${ring(0.5, 'neutral')}
    <polygon class="shape" style="--c:${color}" points="${pts.map((q) => q.join(',')).join(' ')}"/>
    ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" style="fill:${color}"/>`).join('')}
    <g class="labels">${labels}</g>
  </svg>`;
}

// Donut of leaf counts per trait domain, coloured like the 3D branches.
function donutSvg(counts, total) {
  const r = 34, C = 2 * Math.PI * r;
  let off = 0;
  const segs = Object.entries(counts).filter(([, n]) => n).map(([cat, n]) => {
    const len = (n / total) * C;
    const seg = `<circle r="${r}" cx="48" cy="48" fill="none" stroke="${CATEGORIES[cat].color}" stroke-width="13"
      stroke-dasharray="${Math.max(len - 1.5, 0.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 48 48)"><title>${CATEGORIES[cat].label}: ${n}</title></circle>`;
    off += len;
    return seg;
  }).join('');
  return `<svg class="donut" viewBox="0 0 96 96">${segs}<text x="48" y="45" class="dn">${total}</text><text x="48" y="60" class="dl">leaves</text></svg>`;
}

// Tiny icons for the visual map key.
const KEY = [
  ['<circle cx="14" cy="14" r="7" fill="#9fc4ff"/><circle cx="14" cy="14" r="12" fill="#9fc4ff" opacity=".18"/>', 'Star size', 'vocabulary (volume ∝ dictionary words)'],
  ['<circle cx="14" cy="14" r="11" fill="#ff8a5c" opacity=".35"/><circle cx="10" cy="12" r="3" fill="#ff8a5c"/><circle cx="18" cy="16" r="2.5" fill="#ff8a5c"/>', 'Colour & cloud', 'language family'],
  ['<path d="M14 14 L24 4 M14 14 L24 24 M14 14 L4 6 M14 14 L5 23" stroke="#4fd1ff" stroke-width="1.6"/><path d="M14 14 L24 24" stroke="#ff7ac6" stroke-width="1.6"/><path d="M14 14 L4 6" stroke="#ffb547" stroke-width="1.6"/>', 'Branch direction', 'one of 8 trait domains'],
  ['<circle cx="9" cy="14" r="3" fill="#6ee7a8"/><circle cx="20" cy="14" r="6" fill="#6ee7a8"/>', 'Leaf size', 'strength of evidence'],
  ['<circle cx="14" cy="14" r="6" fill="none" stroke="#c9a7ff" stroke-dasharray="2 2"/>', 'Wireframe leaf', 'speculative: an idea to test'],
  ['<path d="M14 6 L21 14 L14 22 L7 14Z" fill="#ffe066"/>', 'Diamond', 'culture-key word (面子, malu…)'],
  ['<path d="M8 22 L14 4 L20 22Z" fill="#ff3b5c"/>', 'Red thorn', 'shadow side: a possible harm'],
  ['<path d="M3 22 Q14 -2 25 22" fill="none" stroke="#ffd27a" stroke-width="1.6"/><circle cx="3" cy="22" r="2.5" fill="#ffd27a"/><circle cx="25" cy="22" r="2.5" fill="#ffd27a"/>', 'Golden arc', 'bilingual study: same person, two languages'],
  ['<ellipse cx="14" cy="16" rx="11" ry="4" fill="none" stroke="#ffd9a8"/><circle cx="14" cy="14" r="4" fill="#ffd9a8"/>', '母语 core', 'the mother tongue, from birth'],
];
const keyHtml = () => `<div class="map-key">${KEY.map(([svg, t, d]) => `<div><svg viewBox="0 0 28 28">${svg}</svg><span><b>${t}</b> ${d}</span></div>`).join('')}</div>`;

const tiltBar = (v) => {
  const w = Math.abs(v) * 50;
  return `<span class="tilt"><i class="${v >= 0 ? 'up' : 'down'}" style="left:${v >= 0 ? 50 : 50 - w}%;width:${w}%"></i></span>`;
};

const SHADOW_NOTE = 'A downside linked to a feature or a word, not a verdict on its speakers. Culture, history and economics usually matter more than grammar.';

export class UI {
  constructor(cosmos, { languages, features, bridges, shadows, timeline, shifts, stageOf, agency }, sound) {
    this.cosmos = cosmos;
    this.shadows = shadows;
    this.timeline = timeline;
    this.shifts = shifts;
    this.stageOf = stageOf;
    this.agency = agency;
    this.profiles = buildProfiles(languages, (l) => cosmos.itemsFor(l));
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
    this.explorer = new Explorer(this, { languages, timeline });
    this.showIntro();

    cosmos.on('hover', (data, at) => this.#tooltip(data, at));
    cosmos.on('select', (data) => this.select(data));

    // Deep link: index.html#ja opens straight onto a language.
    const fromHash = (instant) => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id === 'origin') {
        this.cosmos.focusOrigin({ instant });
        this.showOrigin();
        if (this.sheetState === 'peek') this.setSheet('half', { silent: true });
        return;
      }
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
    this.explorer?.interrupt();
    this.#setHash(data.langId ?? (data.kind === 'origin' ? 'origin' : ''));
    this.closeOverlays();
    if (data.kind === 'origin') {
      this.sound.overview();
      this.cosmos.focusOrigin();
      this.showOrigin();
      if (this.sheetState === 'peek') this.setSheet('half');
      return;
    }
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

    const lens = $('#lens');
    lens.innerHTML = '<option value="">None</option>' + TRAIT_IDS.map((t) => `<option value="${t}">${TRAITS[t].label} ${TRAITS[t].zh}</option>`).join('');
    lens.addEventListener('change', () => this.setLens(lens.value));
    $('#lens-key').addEventListener('click', () => { lens.value = ''; this.setLens(''); });

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

  setLens(trait) {
    this.sound.sweep();
    this.cosmos.setLens(trait || null, this.profiles);
    document.body.classList.toggle('lens-on', !!trait);
    const key = $('#lens-key');
    key.hidden = !trait;
    if (trait) key.innerHTML = `<b>Lens: ${TRAITS[trait].label} ${TRAITS[trait].zh}</b><span class="up">▲ gold tilts up</span><span class="down">▼ blue tilts down</span><span class="x">✕</span>`;
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
    } else if (data.kind === 'origin') {
      html = '<b>母语 · Mother tongue</b><br><span class="muted">How a first language shapes you, from before birth to adulthood</span>';
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
    for (const el of p.querySelectorAll('[data-origin]')) {
      el.addEventListener('click', () => this.select({ kind: 'origin' }));
    }
    for (const el of p.querySelectorAll('[data-tour]')) {
      el.addEventListener('click', () => this.explorer.startTour());
    }
    this.#renderList();
  }

  renderPanel(html, after) {
    this.#panel(html);
    after?.();
  }

  showIntro() {
    if (this.explorer?.active) return this.explorer.showIntro();
    const nLeaves = this.languages.reduce((s, l) => s + this.cosmos.itemsFor(l).length, 0);
    this.#panel(`
      <h2>Explore the language universe</h2>
      <p class="lead"><span class="only-mouse">Click a star · drag to orbit · scroll to zoom</span><span class="only-touch">Tap a star · drag to orbit · pinch to zoom</span></p>
      <button class="start-btn" data-origin>Start here: <b>母语 · how a mother tongue shapes you, from birth</b> →</button>
      <button class="start-btn tour" data-tour>▶ <b>Guided tour</b>: 10 stops through the cosmos</button>
      <h3>Map key</h3>
      ${keyHtml()}
      <h3>How to read it</h3>
      <p>Each glowing <b>core</b> is a language. Its <b>volume</b> is proportional to its vocabulary (dictionary headwords), or to its speakers if you switch the size mode.
      Cores cluster by <b>family</b>, and the coloured nebula behind a cluster marks the family.</p>
      <p>Every core grows <b>branches</b> in eight fixed directions, one per trait domain. The leaves are linguistic features (●) or culture-key words (◆) with a claimed effect on how speakers think, feel or act.</p>
      <ul class="howto">
        <li><b>Leaf size</b> shows strength of evidence. A <b>wireframe</b> leaf is speculative.</li>
        <li>Each language has a <b>personality radar</b>: its leaves add up to a hypothesised tilt on the Big Five and on interdependence, hierarchy and conservatism. Use the <b>Personality lens</b> under Filters to light up the whole universe by one trait.</li>
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
      <p class="stat">${this.languages.length} cores · ${nLeaves} leaves · ${this.bridges.length} bridges · ${this.timeline.length} from-birth findings</p>
    `);
  }

  showLanguage(id) {
    if (this.explorer?.active) return this.explorer.showLanguage(id);
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
      ${this.#glance(l, items)}
      ${this.#personality(id, fam?.color ?? '#ffffff')}
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
    if (this.explorer?.active) return this.explorer.showItem(langId, item);
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
      ${item.stage || item.traits ? `<div class="meta-row">
        ${item.stage ? `<span class="meta stage">Emerges: <b>${STAGES[item.stage].label}</b> (${STAGES[item.stage].age})</span>` : ''}
        ${Object.entries(item.traits ?? {}).map(([t, d]) => `<span class="meta trait ${d > 0 ? 'up' : 'down'}" title="Hypothesised direction">${d > 0 ? '▲' : '▼'} ${TRAITS[t].label}</span>`).join('')}
      </div>` : ''}
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
    if (this.explorer?.active) return this.explorer.showBridge(b);
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
      ${this.shifts[b.title] ? `<div class="measured">${this.#shiftText(this.shifts[b.title], this.shifts[b.title].lang)}</div>` : ''}
      <h3>Sources</h3><ul class="refs">${b.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
      ${this.shadows.bridges[b.title] ? `<section class="shadow-sec"><h3>▲ Shadow side</h3>${shadowList(this.shadows.bridges[b.title])}</section>` : ''}
      <p class="muted">Why bridges matter: the same people are compared with themselves, so culture, upbringing and genes are held constant, and the language of testing is the only thing that changes.</p>
      <div class="chips">
        <button class="chip on" data-lang="${A.id}" style="--c:${FAMILIES[A.family]?.color}"><i></i>${esc(A.name)}</button>
        <button class="chip on" data-lang="${B.id}" style="--c:${FAMILIES[B.family]?.color}"><i></i>${esc(B.name)}</button>
      </div>
    `);
  }

  // "At a glance" infographic: ranks, domain donut, evidence strip, life stages.
  #glance(l, items) {
    const N = this.languages.length;
    const lexSorted = [...this.languages].sort((a, b) => b.lexicon.n - a.lexicon.n);
    const spSorted = [...this.languages].sort((a, b) => b.speakers - a.speakers);
    const lexW = (Math.cbrt(l.lexicon.n) / Math.cbrt(lexSorted[0].lexicon.n)) * 100;
    const spW = (Math.log10(l.speakers * 1e6) / Math.log10(spSorted[0].speakers * 1e6)) * 100;
    const counts = Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, items.filter((i) => i.category === c).length]));
    const evOrder = ['strong', 'moderate', 'correlational', 'contested', 'speculative'];
    const evCounts = evOrder.map((e) => [e, items.filter((i) => i.evidence === e).length]).filter(([, n]) => n);
    const stageCounts = Object.keys(STAGES).map((s) => [s, items.filter((i) => i.stage === s).length]);
    return `<section class="glance">
      <div class="rank-bars">
        <div class="rb">
          <span class="rb-l">Vocabulary</span><b>${fmt(l.lexicon.n)}</b><small>#${lexSorted.indexOf(l) + 1} of ${N}</small>
          <div class="bar"><i style="width:${lexW}%"></i></div>
          <span class="rb-src">${esc(l.lexicon.source)}${l.lexicon.verify ? ' · <span class="warnc">rough, verify</span>' : ''}</span>
        </div>
        <div class="rb">
          <span class="rb-l">Speakers</span><b>${fmtSpeakers(l.speakers)}</b><small>#${spSorted.indexOf(l) + 1} of ${N}</small>
          <div class="bar sp"><i style="width:${spW}%"></i></div>
          <span class="rb-src">L1 + L2, log scale</span>
        </div>
      </div>
      <div class="typo">${[['Order', l.typology.order], ['Morphology', l.typology.morphology], ['Script', l.typology.script], ['Tone', l.typology.tone ? 'Tonal' : 'No tone']]
        .map(([k, v]) => `<span><small>${k}</small>${esc(v)}</span>`).join('')}</div>
      ${items.length ? `<div class="glance-row">
        ${donutSvg(counts, items.length)}
        <div class="glance-side">
          <small>Evidence behind its leaves</small>
          <div class="ev-strip">${evCounts.map(([e, n]) => `<i style="flex:${n};background:${EVIDENCE[e].color}" title="${EVIDENCE[e].label}: ${n}"></i>`).join('')}</div>
          <div class="ev-legend">${evCounts.map(([e, n]) => `<span><i style="background:${EVIDENCE[e].color}"></i>${EVIDENCE[e].label} ${n}</span>`).join('')}</div>
          <small>When its effects appear in life</small>
          <div class="stage-dots">${stageCounts.map(([s, n]) => `<div class="${n ? 'on' : ''}" title="${STAGES[s].label}: ${n}"><i>${n || ''}</i><span>${STAGES[s].label.split(' ')[0]}</span></div>`).join('')}</div>
        </div>
      </div>` : ''}
    </section>`;
  }

  #personality(id, color) {
    const p = this.profiles.get(id);
    const active = TRAIT_IDS.filter((t) => p[t].from.length);
    const nLeaves = new Set(active.flatMap((t) => p[t].from.map((f) => f.item.id))).size;
    const measured = Object.entries(this.shifts).filter(([, s]) => s.lang === id || s.vs === id);
    return `<section class="persona">
      <h3>Personality tilt (hypothesised) <small>人格倾向</small></h3>
      ${active.length ? `
        ${radarSvg(p, color)}
        <p class="muted small">Built from ${nLeaves} leaves, each weighted by its evidence. The dashed ring is neutral. This describes possible pressures from the language, not any actual person.</p>
        <div class="traits">${active.sort((a, b) => Math.abs(p[b].norm) - Math.abs(p[a].norm)).map((t) => `
          <div class="trait-row">
            <span class="tn">${TRAITS[t].label} <small>${TRAITS[t].zh}</small></span>
            ${tiltBar(p[t].norm)}
            <span class="from">${p[t].from.map((f) => `${f.dir > 0 ? '+' : '−'} ${esc(f.item.title)}`).join(' · ')}</span>
          </div>`).join('')}
        </div>`
      : '<p class="muted small">No personality-linked leaves yet. The effects found so far for this language are perceptual or cognitive.</p>'}
      ${measured.map(([title, s]) => `<div class="measured">${this.#shiftText(s, id)} <span class="muted">(${esc(title)})</span></div>`).join('')}
    </section>`;
  }

  // "In English, the same bilinguals scored higher on …"
  #shiftText(s, viewpoint) {
    const flip = viewpoint !== s.lang;
    const me = this.byId.get(flip ? s.vs : s.lang).name, other = this.byId.get(flip ? s.lang : s.vs).name;
    const parts = Object.entries(s.shifts).map(([t, d]) => {
      const dir = flip ? -d : d;
      return `<span class="${dir > 0 ? 'up' : 'down'}">${dir > 0 ? '▲ higher' : '▼ lower'} ${TRAITS[t].label}</span>`;
    });
    return `<b>Measured in bilinguals:</b> in ${esc(me)}, the same people scored ${parts.join(', ')} than in ${esc(other)}.`;
  }

  showOrigin() {
    if (this.explorer?.active) return this.explorer.showOrigin();
    const featTitle = (fid) => this.features[fid]?.title ?? this.agency?.[fid]?.title ?? fid;
    this.#panel(`
      <div class="lang-head origin-head" style="--c:#ffd9a8">
        <div class="native-big">母语</div>
        <h2>Mother tongue: from birth</h2>
        <div class="muted">How a first language gets into the mind, stage by stage</div>
      </div>
      <p class="lead">This app's core question: how does the language you are born into shape your personality?</p>
      <div class="lessons">
        <div><b>1 · Timing matters most.</b> An early first language, whichever one, builds understanding of other minds. A late first language leaves lifelong gaps.</div>
        <div><b>2 · Which language steers.</b> The branches show the directions: attention, emotion, self and values.</div>
        <div><b>3 · Imprints persist.</b> Even a forgotten mother tongue leaves traces, and emotion stays rooted in it.</div>
      </div>
      <div class="timeline">
        ${Object.entries(STAGES).map(([sid, st]) => {
          const entries = this.timeline.filter((e) => e.stage === sid);
          const feats = Object.entries(this.stageOf).filter(([, s]) => s === sid).map(([fid]) => fid);
          if (!entries.length && !feats.length) return '';
          return `<section class="tl-stage">
            <h3><i></i>${st.label} <small>${st.age} · ${st.zh}</small></h3>
            ${entries.map((e) => `<div class="tl-item">
              <div class="tl-title"><b>${esc(e.title)}</b> ${badge(e.evidence)}</div>
              <p>${esc(e.claim)}</p>
              <p class="why">→ ${esc(e.why)}</p>
              <ul class="refs">${e.refs.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
            </div>`).join('')}
            ${feats.length ? `<div class="tl-feats"><small>Language effects that emerge here:</small><div class="chips">${feats.map((fid) => `<button class="chip on" data-feature="${fid}" style="--c:${CATEGORIES[(this.features[fid] ?? this.agency?.[fid])?.category]?.color ?? '#fff'}"><i></i>${esc(featTitle(fid))}</button>`).join('')}</div></div>` : ''}
          </section>`;
        }).join('')}
      </div>
    `);
    for (const btn of document.querySelectorAll('[data-feature]')) {
      btn.addEventListener('click', () => {
        const fid = btn.dataset.feature;
        const lang = this.languages.find((l) => l.features.includes(fid) || l[fid]);
        const item = lang && this.cosmos.itemsFor(lang).find((i) => i.id === fid);
        if (item) this.select({ kind: 'leaf', langId: lang.id, item });
      });
    }
  }

  #exportNotes() {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), notes: this.notes }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'language-cosmos-notes.json' });
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
