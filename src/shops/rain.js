// Lightweight rain: slanted streaks plus small splashes on the ground line.
// intensity 0..1 sets how many drops fall; the canvas pauses when hidden.
export class Rain {
  constructor(canvas, { ground = 0.78 } = {}) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.ground = ground;
    this.intensity = 0;
    this.drops = [];
    this.splashes = [];
    this.running = false;
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const r = this.c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.c.width = r.width * dpr;
    this.c.height = r.height * dpr;
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  set(intensity) { this.intensity = intensity; }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      this.#step(Math.min((now - this.last) / 1000, 0.05));
      this.last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() { this.running = false; }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
  }

  #step(dt) {
    const { g, w, h } = this;
    const groundY = h * this.ground;
    const target = Math.round(40 + this.intensity * 520 * (w / 900 + 0.4));
    while (this.drops.length < target) this.drops.push(this.#drop(true));
    if (this.drops.length > target) this.drops.length = target;

    g.clearRect(0, 0, w, h);
    g.lineCap = 'round';
    const wind = 0.18 + this.intensity * 0.12;
    for (const d of this.drops) {
      d.y += d.v * dt;
      d.x += d.v * wind * dt;
      const floor = d.near ? h : groundY + d.z * (h - groundY);
      if (d.y > floor) {
        if (Math.random() < 0.5) this.splashes.push({ x: d.x, y: floor, r: 0, life: 1, near: d.near });
        Object.assign(d, this.#drop(false));
        continue;
      }
      g.strokeStyle = `rgba(200, 220, 255, ${d.a})`;
      g.lineWidth = d.near ? 1.6 : 1;
      g.beginPath();
      g.moveTo(d.x, d.y);
      g.lineTo(d.x - d.len * wind, d.y - d.len);
      g.stroke();
    }
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life -= dt * 3;
      s.r += dt * 26;
      if (s.life <= 0) { this.splashes.splice(i, 1); continue; }
      g.strokeStyle = `rgba(210, 228, 255, ${s.life * 0.45})`;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(s.x, s.y, s.r, s.r * 0.3, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }

  #drop(anywhere) {
    const near = Math.random() < 0.15;
    return {
      x: Math.random() * (this.w + 120) - 60,
      y: anywhere ? Math.random() * this.h : -20 - Math.random() * 60,
      z: Math.random(),
      v: (near ? 900 : 520) + Math.random() * 260,
      len: near ? 22 : 10 + Math.random() * 8,
      a: near ? 0.45 : 0.18 + Math.random() * 0.22,
      near,
    };
  }
}
