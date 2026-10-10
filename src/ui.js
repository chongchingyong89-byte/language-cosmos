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

const badge = (evId) => {
  const ev = EVIDENCE[evId] ?? EVIDENCE.speculative;
  return `<span class="badge" style="--c:${ev.color}" title="${esc(ev.desc)}">${ev.label}</span>`;
};

export class UI {
  constructor(cosmos, { languages, features, bridges }) {
    this.cosmos = cosmos;
    this.languages = languages;
    this.features = features;
    this.bridges = bridges;
    this.byId = new Map(languages.map((l) => [l.id, l]));
    this.notes = loadNotes();
    this.sortKey = 'lexicon';

    this.#buildList();
    this.#buildLegend();
    this.#bindKeys();
    this.showIntro();

    cosmos.on('hover', (data, at) => this.#tooltip(data, at));
    cosmos.on('select', (data) => this.select(data));

    // Deep link: index.html#ja opens straight onto a language.
    const fromHash = (instant) => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!this.byId.has(id) || id === this.cosmos.state.focus) return;
      this.cosmos.focusLanguage(id, { instant });
      this.showLanguage(id);
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
      if (e.shiftKey) { // solo this category
        set.clear(); set.add(btn.dataset.cat);
      } else if (set.has(btn.dataset.cat)) set.delete(btn.dataset.cat); else set.add(btn.dataset.cat);
      for (const b of cats.querySelectorAll('[data-cat]')) b.classList.toggle('on', set.has(b.dataset.cat));
      this.cosmos.set({ categories: set });
    });

    const evSel = $('#ev-filter');
    evSel.innerHTML = Object.entries(EVIDENCE).map(([id, e]) => `<option value="${e.rank}">${e.label}${e.rank ? ' and stronger' : ' (show all)'}</option>`).join('');
    evSel.addEventListener('change', () => this.cosmos.set({ minEvidence: Number(evSel.value) }));

    $('#size-mode').addEventListener('change', (e) => this.cosmos.setSizeMode(e.target.value));
    $('#toggle-trees').addEventListener('change', (e) => this.cosmos.set({ showAllTrees: e.target.checked }));
    $('#toggle-bridges').addEventListener('change', (e) => this.cosmos.set({ showBridges: e.target.checked }));
    $('#toggle-rotate').addEventListener('change', (e) => this.cosmos.setAutoRotate(e.target.checked));
    $('#btn-overview').addEventListener('click', () => this.home());
    $('#btn-export').addEventListener('click', () => this.#exportNotes());
  }

  home() {
    this.#setHash('');
    this.cosmos.overview();
    this.showIntro();
    this.#renderList();
  }

  #bindKeys() {
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, select')) {
        if (e.key === 'Escape') e.target.blur();
        return;
      }
      if (e.key === 'Escape') this.home();
      if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    });
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────
  #tooltip(data, at) {
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
    const p = $('#panel');
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
      <h2>How to read this universe</h2>
      <p>Each glowing <b>core</b> is a language. Its <b>volume</b> is proportional to its vocabulary (dictionary headwords), or to its speakers if you switch the size mode.
      Cores cluster by <b>family</b>, and the coloured nebula behind a cluster marks the family.</p>
      <p>Every core grows <b>branches</b> in eight fixed directions, one per trait domain. The leaves are linguistic features (●) or culture-key words (◆) with a claimed effect on how speakers think, feel or act.</p>
      <ul class="howto">
        <li><b>Leaf size</b> shows strength of evidence. A <b>wireframe</b> leaf is speculative.</li>
        <li><b>Gold arcs</b> between cores are <b>bilingual studies</b>, where the <em>same person</em> shifts when switching language. This is the cleanest evidence that language and personality are linked.</li>
        <li>Click a core or leaf, or a name on the left. Press <kbd>Esc</kbd> to return to the overview and <kbd>/</kbd> to search. Shift-click a domain to show only that one.</li>
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
              <span class="t">${it.type === 'concept' ? '◆' : '●'} ${esc(it.title)}</span>${badge(it.evidence)}
              ${it.example ? `<span class="ex">${esc(it.example)}</span>` : ''}
            </button>`).join('')}
        </section>`).join('')}
      ${myBridges.length ? `<h3>Bilingual bridges</h3>${myBridges.map((b) => `
        <button class="bridge-row" data-bridge="${this.bridges.indexOf(b)}">
          ⇄ ${esc(this.byId.get(b.a === id ? b.b : b.a).name)}: ${esc(b.title)} ${badge(b.evidence)}
        </button>`).join('')}` : ''}
      <h3>My study notes</h3>
      <textarea id="notes" placeholder="Hypotheses, observations from speakers you know, papers to read… (saved in this browser)">${esc(this.notes[id] ?? '')}</textarea>
    `);

    for (const btn of document.querySelectorAll('.leaf-row')) {
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
