// A walkable rainy Japanese street at night, outside the あまやどり konbini.
// Third-person heroine, wet mirror road, rain + ripples, readable signs
// (a 13-word hunt), and a sliding door that leads to the counter game.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { World3D, LOW } from './base.js';
import * as T from './textures.js';

const BOUNDS = { x0: -21, x1: 21, z0: -5.55, z1: 8.6 };
const DOOR = { x: 0, half: 0.75, z: -5.35 };

// Things to read: the word hunt. pos = where the label floats.
export const READABLES = [
  { id: 'amayadori', pos: [0, 3.9, -5.8], jp: 'あまやどり', romaji: 'amayadori', en: 'sheltering from the rain', note: 'The shop\'s name! People duck in here to escape the rain.' },
  { id: 'irasshai', pos: [0, 1.5, -5.8], jp: 'いらっしゃいませ', romaji: 'irasshaimase', en: 'Welcome!', note: 'Shop staff call this out every time someone walks in.' },
  { id: 'ame', pos: [-4.2, 2.6, -5.8], jp: '雨の日ポイント2倍', romaji: 'ame no hi pointo nibai', en: 'double points on rainy days', note: '雨 (ame) = rain, 日 (hi) = day, 2倍 (nibai) = double.' },
  { id: 'oden', pos: [-6.2, 1.6, -5.8], jp: 'おでん', romaji: 'oden', en: 'oden stew', note: 'Eggs, radish and fish cakes simmering in broth: a konbini favourite on cold nights.' },
  { id: 'karaage', pos: [4.4, 2.6, -5.8], jp: 'からあげ', romaji: 'karaage', en: 'fried chicken', note: 'Crispy Japanese fried chicken from the hot-snack case by the till.' },
  { id: 'jihanki', pos: [8.7, 2.1, -5.2], jp: '自動販売機', romaji: 'jidō hanbaiki', en: 'vending machine', note: 'Japan has millions of them. Blue labels mean cold drinks and red labels mean hot ones: つめた〜い means "ice cold!"' },
  { id: 'tomare', pos: [7.4, 3.0, -1.8], jp: '止まれ', romaji: 'tomare', en: 'Stop!', note: 'Japan\'s stop sign is an upside-down red triangle, not an octagon. It\'s also painted on the road.' },
  { id: 'odan', pos: [11.8, 3.0, -1.8], jp: '横断歩道', romaji: 'ōdan hodō', en: 'pedestrian crossing', note: '横断 = crossing over, 歩道 = walking path.' },
  { id: 'tenji', pos: [-2.5, 0.6, -2.4], jp: '点字ブロック', romaji: 'tenji burokku', en: 'tactile paving', note: 'Invented in Japan in 1967 to guide blind people with their feet and cane.' },
  { id: 'jitensha', pos: [10.9, 1.4, -4.6], jp: '自転車', romaji: 'jitensha', en: 'bicycle', note: '自 (self) + 転 (turn) + 車 (vehicle): a "self-turning vehicle".' },
  { id: 'kasatate', pos: [1.6, 1.2, -5.2], jp: '傘立て', romaji: 'kasatate', en: 'umbrella stand', note: 'Leave your wet umbrella here so the shop floor stays dry.' },
  { id: 'yakitori', pos: [-11.4, 3.0, -5.6], jp: '焼き鳥', romaji: 'yakitori', en: 'grilled chicken skewers', note: 'A red paper lantern (赤ちょうちん) marks a small izakaya restaurant.' },
  { id: 'shingo', pos: [11.8, 3.0, 6.9], jp: '信号', romaji: 'shingō', en: 'traffic light', note: 'In Japanese the "go" light is called 青 (ao, blue), even though it looks green!' },
];

export class StreetWorld extends World3D {
  // spawn: 'start' (by the crossing) or 'door' (just leaving the konbini)
  constructor(container, { sound, onEnter, onDiscover, found = new Set(), spawn = 'start' }) {
    super(container, {
      sound, onDiscover, found, readables: READABLES,
      background: '#0a1130', fog: ['#0b1336', 0.032], bloom: [0.42, 0.45, 0.9], exposure: 0.95,
      cam: { yaw: spawn === 'door' ? 0.35 : Math.PI / 2 - 0.42, pitch: 2.0, dist: 5.2 },
    });
    this.onEnter = onEnter;
    this.entered = false;
    this.#buildWorld();
    this.#buildRain();
    if (spawn === 'door') this.spawnHero(new THREE.Vector3(0, 0, -4.2), 0);
    else this.spawnHero(new THREE.Vector3(13, 0, -3.4), -Math.PI / 2);
  }

  #buildWorld() {
    const S = this.scene;
    S.add(new THREE.AmbientLight('#3b4a80', 0.9));
    S.add(new THREE.HemisphereLight('#4a5aa0', '#0b0f20', 0.8));
    const moon = new THREE.DirectionalLight('#8fa6ff', 0.6);
    moon.position.set(-10, 20, 10);
    S.add(moon);

    // Wet ground: a real mirror under semi-transparent asphalt and paving.
    const mirror = new Reflector(new THREE.PlaneGeometry(80, 30), {
      textureWidth: LOW ? 512 : 1024, textureHeight: LOW ? 512 : 1024, color: '#7c86a8',
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.set(0, 0, 2);
    S.add(mirror);
    this.disposables.push(mirror);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(80, 8), new THREE.MeshBasicMaterial({ map: T.asphaltTex(), transparent: true, depthWrite: false }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.004, 2.5);
    S.add(road);
    const walk = (z0, z1) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(80, z1 - z0), new THREE.MeshStandardMaterial({ map: T.sidewalkTex(), transparent: true, opacity: 0.8, roughness: 0.35, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(0, 0.12, (z0 + z1) / 2);
      S.add(m);
      return m;
    };
    walk(-6, -1.5);
    walk(6.6, 10);
    this.box(80, 0.15, 0.22, '#8a90a4', [0, 0.06, -1.5]);
    this.box(80, 0.15, 0.22, '#8a90a4', [0, 0.06, 6.6]);
    // Tactile paving strip + crossing patch
    const tactile = new THREE.Mesh(new THREE.PlaneGeometry(42, 0.32), new THREE.MeshStandardMaterial({ map: T.tactileTex(), roughness: 0.6 }));
    tactile.material.map.repeat.set(140, 1);
    tactile.rotation.x = -Math.PI / 2;
    tactile.position.set(-2, 0.125, -2.4);
    S.add(tactile);

    // Road paint: centre line, crosswalk, stop line, 止まれ
    const paint = new THREE.MeshBasicMaterial({ color: '#e9ecf2', transparent: true, opacity: 0.88 });
    for (let x = -38; x < 38; x += 4) {
      if (x > 7 && x < 13) continue;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.14), paint);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.01, 2.5);
      S.add(m);
    }
    for (let z = -1.1; z < 6.4; z += 0.9) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.45), paint);
      m.rotation.x = -Math.PI / 2;
      m.position.set(10, 0.011, z);
      S.add(m);
    }
    const stopLine = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 3.9), paint);
    stopLine.rotation.x = -Math.PI / 2;
    stopLine.position.set(7.6, 0.011, 0.5);
    S.add(stopLine);
    const tomare = this.panel(T.roadTextTex('止まれ'), 3.4, 1.7, [5.2, 0.012, 0.5], { basic: true, transparent: true, rotX: -Math.PI / 2 });
    tomare.rotation.z = Math.PI / 2;

    // ── The konbini ──
    this.box(14.4, 5.2, 8, '#dfe6ee', [0, 2.6, -10.05]);
    this.panel(T.shopSignTex(), 14.4, 1.25, [0, 3.95, -5.97], { glow: 1.05 });
    this.box(14.6, 0.26, 0.7, '#1d6f8c', [0, 3.2, -5.75]);
    this.box(14.6, 0.08, 0.72, '#f39a1e', [0, 3.05, -5.75]);
    this.panel(T.shopWindowTex(7, { posters: [
      { text: 'おでん', bg: '#e63946', fg: '#fff', x: 20, y: 20, w: 150, h: 80, size: 54 },
      { text: '雨の日ポイント2倍', bg: '#1f5fbf', fg: '#fff', x: 380, y: 14, w: 400, h: 70, size: 44 },
      { text: '中華まん', bg: '#ffd166', fg: '#7a2f00', x: 860, y: 20, w: 150, h: 80, size: 40 },
    ] }), 6.3, 2.65, [-3.95, 1.78, -5.98], { glow: 0.85 });
    this.panel(T.shopWindowTex(31, { posters: [
      { text: 'からあげ', bg: '#ff9f1c', fg: '#fff', x: 300, y: 14, w: 220, h: 76, size: 50 },
      { text: 'お買い得!', bg: '#ffd400', fg: '#d00000', x: 640, y: 14, w: 220, h: 76, size: 46 },
    ] }), 6.3, 2.65, [3.95, 1.78, -5.98], { glow: 0.85 });
    // Bright interior seen through the door
    this.panel(T.shopWindowTex(53), 1.7, 2.5, [0, 1.7, -6.35], { glow: 0.95 });
    this.doors = [-0.42, 0.42].map((x) => {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 2.5), new THREE.MeshStandardMaterial({ map: T.doorTex(), transparent: true, roughness: 0.1, emissive: '#ffffff', emissiveIntensity: 0.15 }));
      d.position.set(x, 1.7, -5.95);
      d.userData.home = x;
      S.add(d);
      return d;
    });
    for (const x of [-7.1, -0.82, 0.82, 7.1]) this.box(0.12, 2.8, 0.14, '#8796a5', [x, 1.85, -5.93]);
    this.box(14.4, 0.42, 0.2, '#56636f', [0, 0.21, -5.95]);
    this.box(1.8, 0.05, 0.9, '#3d4652', [0, 0.14, -5.5]); // door mat
    // Shop light spilling onto the wet pavement
    for (const x of [-3.6, 0, 3.6]) {
      const l = new THREE.PointLight('#fff1d6', LOW ? 6 : 8, 10, 1.7);
      l.position.set(x, 2.2, -4.6);
      S.add(l);
    }
    // Bins & umbrella stand
    ['#2f6fb0', '#2f6fb0', '#f08a24'].forEach((c, i) => this.box(0.5, 0.95, 0.5, c, [-8.7 + i * 0.56, 0.6, -5.5]));
    this.box(0.5, 0.55, 0.3, '#9aa6b2', [1.6, 0.4, -5.6]);
    for (let i = 0; i < 3; i++) {
      const u = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.9, 6), new THREE.MeshStandardMaterial({ color: ['#e9f2ff', '#2b4a8a', '#c23b3b'][i], transparent: true, opacity: 0.85 }));
      u.position.set(1.45 + i * 0.15, 0.85, -5.6);
      u.rotation.z = (i - 1) * 0.12;
      S.add(u);
    }

    // Vending machine (glows) + bicycles
    this.box(1.05, 1.9, 0.8, '#d9dde3', [8.7, 0.95 + 0.12, -5.45]);
    this.panel(T.vendingTex(), 0.92, 1.75, [8.7, 1.07, -5.04], { glow: 0.95 });
    const vl = new THREE.PointLight('#cfe3ff', 4, 4, 2);
    vl.position.set(8.7, 1.4, -4.3);
    S.add(vl);
    for (const bx of [10.5, 11.3]) this.#bike(bx, -4.7);

    // ── Izakaya next door (warm wall, noren, red lantern) ──
    this.box(10.4, 5.2, 8, '#c98c6a', [-12.4, 2.6, -10.05]);
    this.box(1.6, 2.4, 0.1, '#3a2a1e', [-10, 1.32, -6.02]);
    this.panel(T.norenTex(), 1.5, 1.1, [-10, 1.95, -5.94], { glow: 0.25 });
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.62, 16), new THREE.MeshStandardMaterial({ map: T.lanternTex(), emissiveMap: T.lanternTex(), emissive: '#ffffff', emissiveIntensity: 1.6 }));
    lantern.position.set(-11.4, 2.3, -5.6);
    S.add(lantern);
    const ll = new THREE.PointLight('#ff9a4a', 6, 6, 1.8);
    ll.position.set(-11.4, 2.2, -5);
    S.add(ll);
    this.box(0.5, 0.06, 0.06, '#222', [-11.4, 2.65, -5.6]);

    // Apartments: right, and across the street
    this.box(12.4, 9, 8, '#2a3048', [13.6, 4.5, -10.05]);
    this.panel(T.apartmentTex(5), 12.4, 9, [13.6, 4.5, -6.04], { glow: 0.55 });
    this.box(12, 7, 8, '#262b42', [-23.4, 3.5, -10.05]);
    this.panel(T.apartmentTex(17), 12, 7, [-23.4, 3.5, -6.04], { glow: 0.5 });
    this.box(70, 10, 2, '#20253b', [0, 5, 13]);
    const far = this.panel(T.apartmentTex(23), 70, 10, [0, 5, 11.98], { glow: 0.45, rotY: Math.PI });
    far.material.map.wrapS = THREE.RepeatWrapping;
    far.material.map.repeat.set(6, 1);

    // Guard rail along the far kerb (gap at the crossing)
    const railMat = new THREE.MeshStandardMaterial({ color: '#c3cde6', roughness: 0.4, metalness: 0.3 });
    const rail = (x0, x1, z) => {
      const len = x1 - x0, cx = (x0 + x1) / 2;
      for (const y of [0.55, 0.95]) {
        const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.05), railMat);
        r.position.set(cx, y, z);
        S.add(r);
      }
      for (let x = x0; x <= x1; x += 0.22) {
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.42, 0.025), railMat);
        v.position.set(x, 0.75, z);
        S.add(v);
      }
      for (let x = x0; x <= x1; x += 2.4) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.05, 8), railMat);
        p.position.set(x, 0.52, z);
        S.add(p);
      }
    };
    rail(-21, 8.2, 6.85);
    rail(11.8, 21, 6.85);
    rail(-21, -6.2, -1.72);
    rail(14.5, 21, -1.72);

    // Signs and lights
    this.pole(7.4, -1.8, 3.2);
    this.panel(T.stopSignTex(), 0.85, 0.85, [7.4, 2.85, -1.74], { glow: 0.9, transparent: true });
    this.pole(11.8, -1.8, 3.2);
    this.panel(T.crossingSignTex(), 0.75, 0.75, [11.8, 2.85, -1.74], { glow: 0.9 });
    this.pole(11.8, 6.95, 3.1);
    this.box(0.4, 0.75, 0.25, '#2b313f', [11.8, 2.55, 6.8]);
    const walkMan = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshBasicMaterial({ color: '#36e08a' }));
    walkMan.position.set(11.8, 2.4, 6.67);
    walkMan.rotation.y = Math.PI;
    S.add(walkMan);
    this.walkMan = walkMan;
    for (const x of [-15, 20.5]) this.#streetlight(x);
  }

  #streetlight(x) {
    this.pole(x, -1.9, 5.6);
    const arm = this.box(1.4, 0.07, 0.07, '#9aa3b5', [x, 5.55, -1.3], { rotY: Math.PI / 2 });
    arm.rotation.y = Math.PI / 2;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.25), new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#e8f0ff', emissiveIntensity: 2.4 }));
    head.position.set(x, 5.48, -0.65);
    this.scene.add(head);
    const l = new THREE.PointLight('#cfdcff', LOW ? 14 : 18, 16, 1.5);
    l.position.set(x, 5.2, -0.65);
    this.scene.add(l);
  }

  #bike(x, z) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: '#4a5a6a', roughness: 0.4, metalness: 0.5 });
    for (const dz of [-0.45, 0.45]) {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 20), m);
      w.position.set(0, 0.32, dz);
      w.rotation.y = Math.PI / 2;
      g.add(w);
    }
    const frame = (a, b) => {
      const v = new THREE.Vector3().subVectors(b, a);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, v.length(), 6), new THREE.MeshStandardMaterial({ color: '#7cc0a8', roughness: 0.4 }));
      c.position.copy(a).add(b).multiplyScalar(0.5);
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
      g.add(c);
    };
    const P = (y, z) => new THREE.Vector3(0, y, z);
    frame(P(0.32, -0.45), P(0.62, -0.05));
    frame(P(0.32, -0.45), P(0.34, 0));
    frame(P(0.34, 0), P(0.62, -0.05));
    frame(P(0.62, -0.05), P(0.68, 0.38));
    frame(P(0.34, 0), P(0.32, 0.45));
    frame(P(0.68, 0.38), P(0.32, 0.45));
    frame(P(0.68, 0.38), P(0.95, 0.42));
    frame(P(0.62, -0.05), P(0.82, -0.12));
    g.position.set(x, 0.12, z);
    g.rotation.y = 0.25;
    this.scene.add(g);
  }

  #buildRain() {
    const n = LOW ? 1100 : 2400;
    this.rainBox = { w: 26, h: 14, d: 22 };
    const pos = new Float32Array(n * 6);
    this.drops = Array.from({ length: n }, () => ({ x: (Math.random() - 0.5) * 26, y: Math.random() * 14, z: (Math.random() - 0.5) * 22, v: 14 + Math.random() * 6 }));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#a9bcff', transparent: true, opacity: 0.38, depthWrite: false }));
    this.rain.frustumCulled = false;
    this.scene.add(this.rain);

    // Ripples: a pool of rings that grow and fade on the wet ground.
    this.ripples = Array.from({ length: LOW ? 30 : 60 }, () => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 24), new THREE.MeshBasicMaterial({ color: '#cfdcff', transparent: true, opacity: 0, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      this.scene.add(m);
      return { m, life: Math.random() };
    });
  }

  // ── Hooks ───────────────────────────────────────────────────────────────
  constrain(next) {
    const inDoor = Math.abs(next.x - DOOR.x) < DOOR.half;
    next.x = Math.min(Math.max(next.x, BOUNDS.x0), BOUNDS.x1);
    next.z = Math.min(Math.max(next.z, inDoor ? -6.2 : BOUNDS.z0), BOUNDS.z1);
    return next;
  }

  update(dt, t, hero) {
    // Door: slide open as she approaches; stepping through enters the shop.
    const nearDoor = Math.abs(hero.position.x - DOOR.x) < 1.6 && hero.position.z < -3.6;
    for (const d of this.doors) {
      const open = nearDoor ? Math.sign(d.userData.home) * 0.82 : 0;
      d.position.x += (d.userData.home + open - d.position.x) * Math.min(dt * 6, 1);
    }
    if (nearDoor && !this.doorChimed) { this.doorChimed = true; this.sound.chime(); }
    if (!nearDoor) this.doorChimed = false;
    if (!this.entered && hero.position.z < -5.9) {
      this.entered = true;
      this.frozen = true;
      this.onEnter?.();
    }

    // Rain follows the camera
    const arr = this.rain.geometry.attributes.position.array;
    const c = this.camera.position, B = this.rainBox;
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      d.y -= d.v * dt;
      d.x += 1.2 * dt;
      if (d.y < 0) { d.y = B.h; d.x = (Math.random() - 0.5) * B.w; d.z = (Math.random() - 0.5) * B.d; }
      const x = c.x + d.x, z = hero.position.z + d.z;
      arr.set([x, d.y, z, x - 0.04, d.y + 0.35, z], i * 6);
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
    for (const r of this.ripples) {
      r.life += dt * 1.6;
      if (r.life >= 1) {
        r.life = 0;
        const z = hero.position.z + (Math.random() - 0.5) * 10;
        const onWalk = z < -1.5 || z > 6.6;
        r.m.position.set(hero.position.x + (Math.random() - 0.5) * 16, onWalk ? 0.13 : 0.02, z);
      }
      const sc = 0.04 + r.life * 0.32;
      r.m.scale.set(sc, sc, sc);
      r.m.material.opacity = (1 - r.life) * 0.55;
    }
    this.walkMan.material.color.set(Math.floor(t / 6) % 2 ? '#36e08a' : '#ff4d5a');
  }
}
