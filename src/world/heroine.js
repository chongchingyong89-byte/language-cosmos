// The heroine: a stylised anime girl built from primitives, with cel shading,
// ink outlines, long brown hair and a clear umbrella. ~1.55 m tall.
import * as THREE from 'three';

const COLORS = { skin: '#f6d9c4', hair: '#6b4026', shirt: '#f7f7f4', shorts: '#1b1c24', shoe: '#2a2a33', eye: '#3a2418' };

// Three-step ramp for anime-style cel shading.
function toonRamp() {
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

export class Heroine {
  constructor() {
    this.ramp = toonRamp();
    this.mats = {};
    this.outline = new THREE.MeshBasicMaterial({ color: '#1a1420', side: THREE.BackSide });
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);
    this.phase = 0;
    this.speed = 0;
    this.#build();
  }

  #mat(name) {
    return (this.mats[name] ??= new THREE.MeshToonMaterial({ color: COLORS[name], gradientMap: this.ramp }));
  }

  // Mesh + slightly larger back-face copy = ink outline.
  #part(geo, mat, parent, { outline = true, pos, rot, scale } = {}) {
    const m = new THREE.Mesh(geo, this.#mat(mat));
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    if (scale) m.scale.set(...scale);
    m.castShadow = false;
    parent.add(m);
    if (outline) {
      const o = new THREE.Mesh(geo, this.outline);
      o.scale.setScalar(1.06);
      m.add(o);
    }
    return m;
  }

  #limb(parent, x, y, { upper, lower, color, lowerColor, len = 0.36, r = 0.05 }) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    parent.add(pivot);
    this.#part(new THREE.CapsuleGeometry(r * (upper ?? 1), len * 0.45, 4, 10), color, pivot, { pos: [0, -len * 0.25, 0] });
    const knee = new THREE.Group();
    knee.position.set(0, -len * 0.5, 0);
    pivot.add(knee);
    this.#part(new THREE.CapsuleGeometry(r * (lower ?? 0.9), len * 0.45, 4, 10), lowerColor ?? color, knee, { pos: [0, -len * 0.25, 0] });
    return { pivot, knee };
  }

  #build() {
    const b = this.body;
    // Legs (hips at 0.8 m)
    this.legL = this.#limb(b, -0.075, 0.8, { color: 'skin', len: 0.74, r: 0.06 });
    this.legR = this.#limb(b, 0.075, 0.8, { color: 'skin', len: 0.74, r: 0.06 });
    for (const leg of [this.legL, this.legR]) {
      this.#part(new THREE.BoxGeometry(0.1, 0.07, 0.2), 'shoe', leg.knee, { pos: [0, -0.39, 0.04] });
    }
    // Shorts and T-shirt
    this.#part(new THREE.CylinderGeometry(0.15, 0.17, 0.2, 14), 'shorts', b, { pos: [0, 0.78, 0] });
    this.#part(new THREE.CapsuleGeometry(0.155, 0.26, 6, 14), 'shirt', b, { pos: [0, 1.08, 0], scale: [1, 1, 0.78] });
    // Arms; the right one holds the umbrella up.
    this.armL = this.#limb(b, -0.2, 1.26, { color: 'shirt', lowerColor: 'skin', len: 0.56, r: 0.05, lower: 0.75 });
    this.armR = this.#limb(b, 0.2, 1.26, { color: 'shirt', lowerColor: 'skin', len: 0.56, r: 0.05, lower: 0.75 });
    this.armL.pivot.rotation.z = 0.12;
    this.armR.pivot.rotation.set(-0.5, 0, -0.15);
    this.armR.knee.rotation.x = -1.1;
    // Neck & head
    this.#part(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 10), 'skin', b, { pos: [0, 1.32, 0], outline: false });
    this.head = new THREE.Group();
    this.head.position.set(0, 1.45, 0);
    b.add(this.head);
    this.#part(new THREE.SphereGeometry(0.13, 24, 18), 'skin', this.head, { scale: [1, 1.08, 1] });
    // Eyes: big anime eyes with highlights
    for (const x of [-0.045, 0.045]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), new THREE.MeshBasicMaterial({ color: COLORS.eye }));
      eye.scale.set(0.8, 1.25, 0.4);
      eye.position.set(x, -0.005, 0.118);
      this.head.add(eye);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      glint.position.set(x + 0.008, 0.012, 0.128);
      this.head.add(glint);
    }
    const blush = new THREE.MeshBasicMaterial({ color: '#ff9aa8', transparent: true, opacity: 0.45 });
    for (const x of [-0.07, 0.07]) {
      const c = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), blush);
      c.position.set(x, -0.04, 0.112);
      c.rotation.y = x * 4;
      this.head.add(c);
    }
    // Hair: cap, fringe, and a long fall down the back that sways.
    this.#part(new THREE.SphereGeometry(0.145, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), 'hair', this.head, { pos: [0, 0.012, -0.008], scale: [1.02, 1.08, 1.04] });
    this.#part(new THREE.SphereGeometry(0.14, 20, 10, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.18, Math.PI * 0.22), 'hair', this.head, { pos: [0, 0.01, 0.012], outline: false });
    this.hairBack = new THREE.Group();
    this.hairBack.position.set(0, 0.02, -0.02);
    this.head.add(this.hairBack);
    this.#part(new THREE.CylinderGeometry(0.15, 0.2, 0.62, 18, 1, true, Math.PI * 0.55, Math.PI * 0.9), 'hair', this.hairBack, { pos: [0, -0.3, 0] });
    for (const x of [-0.13, 0.13]) {
      this.#part(new THREE.CapsuleGeometry(0.035, 0.3, 4, 8), 'hair', this.head, { pos: [x, -0.17, 0.02], rot: [0, 0, x * 0.4] });
    }
    this.#mat('hair').side = THREE.DoubleSide;
    // Clear umbrella in the right hand
    this.umbrella = new THREE.Group();
    this.umbrella.position.set(0, -0.28, 0.05);
    this.armR.knee.add(this.umbrella);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.9, 6), new THREE.MeshStandardMaterial({ color: '#d8e0ea', roughness: 0.3 }));
    handle.position.y = 0.45;
    this.umbrella.add(handle);
    const canopyGeo = new THREE.ConeGeometry(0.62, 0.24, 8, 1, true);
    const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshPhysicalMaterial({
      color: '#eaf4ff', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false,
    }));
    canopy.position.y = 0.95;
    this.umbrella.add(canopy);
    const ribs = new THREE.LineSegments(new THREE.EdgesGeometry(canopyGeo), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }));
    ribs.position.copy(canopy.position);
    this.umbrella.add(ribs);
    // Keep the canopy level whatever the arm is doing.
    this.umbrella.rotation.x = 1.6;
    // Soft contact shadow
    const sc = document.createElement('canvas');
    sc.width = sc.height = 64;
    const g = sc.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.012;
    this.root.add(shadow);
  }

  setUmbrella(open) { this.umbrella.visible = open; }

  // speed: 0 idle, ~2 walk, ~4 run. Returns true on each footfall.
  update(dt, speed) {
    this.speed += (speed - this.speed) * Math.min(dt * 8, 1);
    const s = this.speed;
    const prev = Math.sin(this.phase);
    this.phase += dt * (s > 0.1 ? 4 + s * 1.6 : 0);
    const sw = Math.sin(this.phase);
    const amp = Math.min(s / 2.2, 1.25) * 0.55;
    this.legL.pivot.rotation.x = sw * amp;
    this.legR.pivot.rotation.x = -sw * amp;
    this.legL.knee.rotation.x = Math.max(0, -sw) * amp * 1.2;
    this.legR.knee.rotation.x = Math.max(0, sw) * amp * 1.2;
    this.armL.pivot.rotation.x = -sw * amp * 0.8;
    this.body.position.y = Math.abs(sw) * 0.035 * Math.min(s, 1.5);
    this.body.rotation.x = s * 0.035;
    const t = performance.now() / 1000;
    this.hairBack.rotation.x = 0.12 + s * 0.06 + Math.sin(t * 2.2) * 0.03 + Math.abs(sw) * 0.04 * s;
    this.head.rotation.z = Math.sin(t * 0.9) * 0.025;
    // Idle breathing
    if (s < 0.1) this.body.position.y = Math.sin(t * 2) * 0.006;
    return s > 0.3 && Math.sign(prev) !== Math.sign(sw);
  }
}
