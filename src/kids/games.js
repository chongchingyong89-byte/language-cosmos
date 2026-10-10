// Three mini-games, each a small version of a real experiment.
//   tone   : Tone Detective, Mandarin lexical tone (mā / má / mǎ / mà)
//   number : Number Ninja, transparent base-10 numerals in Chinese and Malay
//   blue   : Blue Spotter, odd-one-out colour task modelled on Winawer et al. (2007)

const $ = (sel, root = document) => root.querySelector(sel);
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(([, v]) => v);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const TONES = [
  { n: 1, char: '妈', py: 'mā', emoji: '👩', en: 'mother', dur: 0.45, hz: [[0, 255], [1, 255]], name: 'high & flat' },
  { n: 2, char: '麻', py: 'má', emoji: '🌿', en: 'hemp',   dur: 0.45, hz: [[0, 175], [0.2, 178], [1, 265]], name: 'rising' },
  { n: 3, char: '马', py: 'mǎ', emoji: '🐴', en: 'horse',  dur: 0.6,  hz: [[0, 190], [0.45, 138], [0.62, 140], [1, 215]], name: 'dip & rise' },
  { n: 4, char: '骂', py: 'mà', emoji: '😠', en: 'scold',  dur: 0.4,  hz: [[0, 275], [1, 150]], name: 'falling' },
];

const contourSvg = (t) => `<svg viewBox="0 0 64 40" class="contour"><polyline points="${t.hz.map(([x, hz]) => `${4 + x * 56},${36 - ((hz - 130) / 150) * 32}`).join(' ')}"/></svg>`;

const ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const ZH_PY = ['', 'yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ'];
const EN = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const MS = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];

function chinese(n) {
  const t = Math.floor(n / 10), u = n % 10;
  return {
    say: `${t > 1 ? ZH[t] : ''}十${ZH[u]}`,
    roman: [t > 1 ? ZH_PY[t] : '', 'shí', ZH_PY[u]].filter(Boolean).join('-'),
    literal: [t > 1 ? EN[t] : '', 'ten', EN[u]].filter(Boolean).join('-'),
    lang: 'Chinese',
  };
}
function malay(n) {
  const t = Math.floor(n / 10), u = n % 10;
  if (t === 1) {
    return { say: u === 1 ? 'sebelas' : `${MS[u]} belas`, roman: '', literal: `${EN[u]}-teen`, lang: 'Malay' };
  }
  return { say: `${MS[t]} puluh${u ? ` ${MS[u]}` : ''}`, roman: '', literal: `${EN[t]} tens${u ? ` ${EN[u]}` : ''}`, lang: 'Malay' };
}

export class Games {
  constructor(sound, { onFinish }) {
    this.sound = sound;
    this.onFinish = onFinish;
    this.root = $('#game');
    this.body = $('.game-body', this.root);
    $('.game-x', this.root).addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => { if (e.target === this.root) this.close(); });
  }

  open(name) {
    this.sound.click();
    this.root.hidden = false;
    requestAnimationFrame(() => this.root.classList.add('show'));
    ({ tone: () => this.#toneIntro(), number: () => this.#number(), blue: () => this.#blueIntro() })[name]?.();
  }

  close() {
    this.root.classList.remove('show');
    clearTimeout(this.timer);
    setTimeout(() => { this.root.hidden = true; this.body.innerHTML = ''; }, 250);
  }

  #render(html) {
    this.body.innerHTML = html;
    this.body.scrollTop = 0;
  }

  #finish(game, score, total, extra = '') {
    const stars = score >= total ? '★★★' : score >= total * 0.6 ? '★★☆' : '★☆☆';
    if (score >= total * 0.6) this.sound.cheer(); else this.sound.oops();
    this.#render(`
      <div class="game-end">
        <div class="big-stars">${stars}</div>
        <h2>${score} / ${total}</h2>
        ${extra}
        <div class="game-actions"><button class="kid-btn" data-again>Play again</button><button class="kid-btn ghost" data-close>Back to space</button></div>
      </div>`);
    $('[data-again]', this.body).addEventListener('click', () => this.open(game));
    $('[data-close]', this.body).addEventListener('click', () => this.close());
    this.onFinish(game, score, total);
  }

  // ── Tone Detective ───────────────────────────────────────────────────────
  #toneIntro() {
    this.#render(`
      <div class="game-head"><span class="game-emoji">🎵</span><h2>Tone Detective</h2><p>In Mandarin, the <b>shape of your voice</b> changes the word. Tap each card to hear it, then start the challenge!</p></div>
      <div class="tone-grid">${TONES.map((t) => `
        <button class="tone-card" data-n="${t.n}">
          <span class="tone-emoji">${t.emoji}</span>
          <span class="tone-char">${t.char}</span>
          <span class="tone-py">${t.py}</span>
          ${contourSvg(t)}
          <span class="tone-en">${t.en} · <i>${t.name}</i></span>
        </button>`).join('')}
      </div>
      <p class="game-note">The voice here is a synthesiser drawing each pitch shape. Real speakers sound smoother, but the shapes are the same.</p>
      <div class="game-actions"><button class="kid-btn" data-start>Start the challenge ▶</button></div>`);
    for (const b of this.body.querySelectorAll('.tone-card')) b.addEventListener('click', () => this.#say(TONES[b.dataset.n - 1], b));
    $('[data-start]', this.body).addEventListener('click', () => this.#toneRound(0, 0));
  }

  #say(t, el) {
    this.sound.syllable(t.hz, t.dur);
    if (el) { el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping'); }
  }

  #toneRound(i, score) {
    const ROUNDS = 6;
    if (i === ROUNDS) {
      return this.#finish('tone', score, ROUNDS, '<p>Mandarin speakers do this in every sentence, which is why many are great at hearing musical pitch!</p>');
    }
    const target = pick(TONES);
    this.#render(`
      <div class="game-head"><span class="game-emoji">🎵</span><h2>Which word did you hear?</h2><p>Round ${i + 1} of ${ROUNDS}</p></div>
      <div class="game-actions"><button class="kid-btn ghost" data-replay>🔊 Hear it again</button></div>
      <div class="tone-grid">${TONES.map((t) => `
        <button class="tone-card answer" data-n="${t.n}"><span class="tone-emoji">${t.emoji}</span><span class="tone-py">${t.py}</span>${contourSvg(t)}<span class="tone-en">${t.en}</span></button>`).join('')}
      </div>`);
    setTimeout(() => this.#say(target), 350);
    $('[data-replay]', this.body).addEventListener('click', () => this.#say(target));
    for (const b of this.body.querySelectorAll('.answer')) {
      b.addEventListener('click', () => {
        const ok = Number(b.dataset.n) === target.n;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) this.body.querySelector(`.answer[data-n="${target.n}"]`).classList.add('right');
        if (ok) this.sound.toggle(true, 4); else this.sound.toggle(false, 1);
        for (const x of this.body.querySelectorAll('.answer')) x.disabled = true;
        this.timer = setTimeout(() => this.#toneRound(i + 1, score + (ok ? 1 : 0)), 1100);
      });
    }
  }

  // ── Number Ninja ─────────────────────────────────────────────────────────
  #number(i = 0, score = 0) {
    const ROUNDS = 6;
    if (i === ROUNDS) {
      return this.#finish('number', score, ROUNDS, `<p>In Chinese and Malay the number words <b>explain themselves</b>: "two-ten-three", "two tens three". English hides it inside "twenty-three". That's one reason children in these languages often learn place value sooner.</p>`);
    }
    const n = 11 + Math.floor(Math.random() * 89);
    const w = i % 2 ? malay(n) : chinese(n);
    const t = Math.floor(n / 10), u = n % 10;
    const opts = new Set([n]);
    // Tempting wrong answers: swapped digits (the classic slip), ±10, ±1.
    for (const c of shuffle([u * 10 + t, n + 10, n - 10, n + 1, n - 1])) {
      if (opts.size < 4 && c >= 10 && c <= 99) opts.add(c);
    }
    while (opts.size < 4) opts.add(11 + Math.floor(Math.random() * 89));
    this.#render(`
      <div class="game-head"><span class="game-emoji">🔢</span><h2>What number is this?</h2><p>Round ${i + 1} of ${ROUNDS} · ${w.lang}</p></div>
      <div class="number-card">
        <div class="number-say">${w.say}</div>
        ${w.roman ? `<div class="number-roman">${w.roman}</div>` : ''}
        <div class="number-literal">literally: "${w.literal}"</div>
      </div>
      <div class="num-options">${shuffle([...opts]).map((o) => `<button class="kid-btn num" data-v="${o}">${o}</button>`).join('')}</div>`);
    for (const b of this.body.querySelectorAll('.num')) {
      b.addEventListener('click', () => {
        const ok = Number(b.dataset.v) === n;
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) this.body.querySelector(`.num[data-v="${n}"]`).classList.add('right');
        if (ok) this.sound.toggle(true, 4); else this.sound.toggle(false, 1);
        for (const x of this.body.querySelectorAll('.num')) x.disabled = true;
        this.timer = setTimeout(() => this.#number(i + 1, score + (ok ? 1 : 0)), 1100);
      });
    }
  }

  // ── Blue Spotter ─────────────────────────────────────────────────────────
  #blueIntro() {
    this.#render(`
      <div class="game-head"><span class="game-emoji">🔵</span><h2>Blue Spotter</h2>
      <p>One square is a slightly different blue. Tap it <b>as fast as you can</b>! We'll time you, just like scientists timed Russian and English speakers.</p></div>
      <div class="blue-demo">
        <span style="background:hsl(212 80% 42%)"></span><span style="background:hsl(212 80% 70%)"></span>
        <p>Russian: <b>синий</b> (siniy, dark blue) vs <b>голубой</b> (goluboy, light blue). Two different colour words!</p>
      </div>
      <div class="game-actions"><button class="kid-btn" data-start>Start ▶</button></div>`);
    $('[data-start]', this.body).addEventListener('click', () => {
      // Cross = the two shades straddle the siniy/goluboy boundary.
      const plan = shuffle([
        ...Array(4).fill('cross'), ...Array(2).fill('dark'), ...Array(2).fill('light'),
      ]);
      this.#blueRound(plan, 0, []);
    });
  }

  #blueRound(plan, i, results) {
    if (i === plan.length) return this.#blueEnd(results);
    const L = { cross: [55, 63], dark: [36, 44], light: [72, 80] }[plan[i]];
    const [base, odd] = Math.random() < 0.5 ? L : [L[1], L[0]];
    const oddIdx = Math.floor(Math.random() * 9);
    this.#render(`
      <div class="game-head"><span class="game-emoji">🔵</span><h2>Find the odd blue!</h2><p>Round ${i + 1} of ${plan.length}</p></div>
      <div class="blue-grid">${Array.from({ length: 9 }, (_, k) => `<button class="blue-tile" data-k="${k}" style="background:hsl(212 80% ${k === oddIdx ? odd : base}%)"></button>`).join('')}</div>`);
    const t0 = performance.now();
    let misses = 0;
    for (const b of this.body.querySelectorAll('.blue-tile')) {
      b.addEventListener('click', () => {
        if (Number(b.dataset.k) !== oddIdx) {
          misses++;
          b.classList.add('wrong');
          this.sound.toggle(false, 1);
          return;
        }
        b.classList.add('right');
        this.sound.toggle(true, 4);
        results.push({ type: plan[i], ms: performance.now() - t0, misses });
        this.timer = setTimeout(() => this.#blueRound(plan, i + 1, results), 450);
      });
    }
  }

  #blueEnd(results) {
    const avg = (arr) => (arr.length ? arr.reduce((s, r) => s + r.ms, 0) / arr.length / 1000 : 0);
    const cross = avg(results.filter((r) => r.type === 'cross'));
    const within = avg(results.filter((r) => r.type !== 'cross'));
    const max = Math.max(cross, within, 0.1);
    const clean = results.filter((r) => !r.misses).length;
    this.#finish('blue', clean, results.length, `
      <div class="rt-chart">
        <div><span>Across the Russian boundary</span><i style="width:${(cross / max) * 100}%"></i><b>${cross.toFixed(2)} s</b></div>
        <div><span>Within one Russian blue</span><i style="width:${(within / max) * 100}%"></i><b>${within.toFixed(2)} s</b></div>
      </div>
      <p>Russian speakers are a little faster on the <b>"across"</b> rounds, because their language gives those two blues different names. English speakers usually show no difference. How did you do?</p>
      <p class="game-note">Based on Winawer et al. (2007), PNAS. The stars count rounds you solved with no wrong taps.</p>`);
  }
}
