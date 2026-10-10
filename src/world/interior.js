// Inside the あまやどり konbini: aisles to shop in, a till to pay at.
// Room: x −6…6, z −5…5 (front wall with the door at z = 5).
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { World3D, LOW } from './base.js';
import * as T from './textures.js';
import { chibiSvg } from '../shops/chibi.js';
import { loadVrmHeroine } from './heroineVrm.js';

// Walkways between the shelves: shoppers only travel along these edges.
const NODES = {
  A: [-4.2, -3.6], B: [-1.4, -3.6], C: [1.6, -3.6],
  G: [-4.2, -0.5], H: [-1.4, -0.5], I: [1.6, -0.5],
  D: [-4.2, 2.6], E: [-1.4, 2.6], F: [1.6, 2.6],
};
const EDGES = { A: 'BG', B: 'ACH', C: 'BI', G: 'AD', H: 'BE', I: 'CF', D: 'GE', E: 'DFH', F: 'EI' };
// Which way to face when browsing at a node (towards the nearest shelf).
const BROWSE = { G: -Math.PI / 2, H: -Math.PI / 2, I: -Math.PI / 2, A: Math.PI, B: Math.PI, C: Math.PI };

// A shopper wandering the aisles, pausing to browse.
class Shopper {
  constructor(hero, start) {
    this.hero = hero;
    this.node = start;
    this.target = start;
    this.wait = 1 + Math.random() * 3;
    hero.setUmbrella(false);
    hero.placeAt(new THREE.Vector3(NODES[start][0], 0, NODES[start][1]), new THREE.Euler(0, Math.random() * 6, 0));
  }

  update(dt, avoid) {
    const p = this.hero.root.position;
    let speed = 0;
    if (this.wait > 0) {
      this.wait -= dt;
      const face = BROWSE[this.node];
      if (face != null) this.#turn(face, dt);
      if (this.wait <= 0) {
        const opts = EDGES[this.node];
        this.target = opts[Math.floor(Math.random() * opts.length)];
      }
    } else {
      const [tx, tz] = NODES[this.target];
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      const blocked = avoid.some((o) => o !== p && Math.hypot(o.x - (p.x + dx / d * 0.7), o.z - (p.z + dz / d * 0.7)) < 0.75);
      if (d < 0.08) {
        this.node = this.target;
        this.wait = BROWSE[this.node] != null ? 2 + Math.random() * 4 : 0.2;
      } else if (!blocked) {
        speed = 1.05;
        p.x += (dx / d) * speed * dt;
        p.z += (dz / d) * speed * dt;
        this.#turn(Math.atan2(dx, dz), dt);
      }
    }
    this.hero.update(dt, speed);
  }

  #turn(angle, dt) {
    const r = this.hero.root.rotation;
    const diff = Math.atan2(Math.sin(angle - r.y), Math.cos(angle - r.y));
    r.y += diff * Math.min(dt * 6, 1);
  }
}

const ROOM = { x0: -5.65, x1: 5.65, z0: -4.55, z1: 4.75 };
const DOOR = { x: 1.6, half: 0.75 };

export const SHOP_WORDS = [
  { id: 'reji', pos: [4.6, 2.6, 0.6], jp: 'レジ', romaji: 'reji', en: 'cash register / checkout', note: 'From the English word "register". Pay here!' },
  { id: 'nomimono', pos: [-2.3, 2.6, -4.5], jp: '飲み物', romaji: 'nomimono', en: 'drinks', note: '飲む (nomu) = to drink + 物 (mono) = thing: "drinking things".' },
  { id: 'okashi', pos: [-3.3, 2.0, -0.6], jp: 'お菓子', romaji: 'okashi', en: 'snacks & sweets', note: 'The お (o) at the front makes it sound polite and friendly.' },
  { id: 'pan', pos: [-1.5, 2.0, -0.6], jp: 'パン', romaji: 'pan', en: 'bread', note: 'Borrowed from Portuguese "pão" in the 1500s, one of Japan\'s oldest foreign words!' },
  { id: 'onigiri', pos: [-5.3, 2.2, -0.4], jp: 'おにぎり', romaji: 'onigiri', en: 'rice balls', note: 'From にぎる (nigiru), "to squeeze": rice squeezed into shape by hand.' },
  { id: 'zasshi', pos: [-3.9, 2.0, 4.4], jp: '雑誌', romaji: 'zasshi', en: 'magazines', note: 'People often stand reading them by the window: 立ち読み (tachiyomi), "standing reading"!' },
  { id: 'nichiyo', pos: [1.1, 2.0, -0.6], jp: '日用品', romaji: 'nichiyōhin', en: 'everyday goods', note: '日 (day) + 用 (use) + 品 (goods): things you use every day.' },
  { id: 'aisu', pos: [2.8, 1.6, 1.6], jp: 'アイス', romaji: 'aisu', en: 'ice cream', note: 'Short for アイスクリーム. Japanese loves shortening long loanwords!' },
  { id: 'hot', pos: [4.6, 1.8, 2.1], jp: 'ホットスナック', romaji: 'hotto sunakku', en: 'hot snacks', note: 'からあげ, 肉まん and おでん kept warm by the till.' },
  { id: 'shinshohin', pos: [0.6, 1.9, 1.7], jp: '新商品', romaji: 'shinshōhin', en: 'new product', note: '新 (new) + 商品 (product). Konbini launch new snacks every week!' },
  { id: 'otearai', pos: [5.4, 2.4, -4.2], jp: 'お手洗い', romaji: 'otearai', en: 'restroom', note: 'Literally "hand-washing". Many konbini let anyone use the toilet; buying something small is a nice thank-you.' },
];

// Shelf spots where items can be taken. pos = where she stands.
export const ZONES = [
  { item: 'tea', pos: [-3.8, -3.85] },
  { item: 'coffee', pos: [-1.0, -3.85] },
  { item: 'onigiri', pos: [-4.75, -1.9] },
  { item: 'bento', pos: [-4.75, -0.4] },
  { item: 'dango', pos: [-4.75, 1.0] },
  { item: 'senbei', pos: [-3.45, -1.7] },
  { item: 'choco', pos: [-3.45, 0.5] },
  { item: 'melonpan', pos: [-1.35, -0.6] },
  { item: 'cupnoodle', pos: [0.05, -0.6] },
  { item: 'mask', pos: [1.2, -1.6] },
  { item: 'umbrella', pos: [1.2, 0.6] },
  { item: 'manga', pos: [-4.6, 3.75] },
  { item: 'magazine', pos: [-3.0, 3.75] },
  { item: 'icecream', pos: [2.8, 2.65] },
  { type: 'till', pos: [3.65, 0.6] },
];

// Solid furniture (axis-aligned, x0 x1 z0 z1) for collision.
const SOLIDS = [
  [-6, 1.3, -5, -4.25],        // drink fridges
  [-6, -5.05, -3.2, 1.9],      // chilled case
  [-2.9, -1.9, -2.9, 1.7],     // gondola A
  [0.1, 1.1, -2.9, 1.7],       // gondola B
  [-5.6, -2.3, 4.15, 5],       // magazine rack
  [1.95, 3.65, 1.1, 2.1],      // ice freezer
  [4.15, 6, -2.1, 3.2],        // counter
  [-6, -4.9, 2.9, 4.0],        // ATM
];

export class InteriorWorld extends World3D {
  constructor(container, { sound, onDiscover, found = new Set(), items, onZone, onExit, onSay }) {
    super(container, {
      sound, onDiscover, found, readables: SHOP_WORDS,
      background: '#f4f1e8', bloom: [0.18, 0.35, 1.35], exposure: 0.85,
      cam: { yaw: 0, pitch: 1.75, dist: 3.4, height: 1.2 },
    });
    this.items = items;
    this.onZone = onZone;
    this.onExit = onExit;
    this.onSay = onSay;
    this.shoppers = [];
    this.readRange = 2.2;
    this.walkSpeed = 1.3;
    this.runSpeed = 2.6;
    this.zone = null;
    this.#build();
    this.spawnHero(new THREE.Vector3(DOOR.x, 0, 3.0), Math.PI, { umbrella: false }); // left in the stand outside
    if (!LOW) this.#spawnPeople(); // phones keep the 2D clerk and no extra shoppers
  }

  // ── Scene ────────────────────────────────────────────────────────────────
  #build() {
    const S = this.scene;
    S.add(new THREE.AmbientLight('#fffaf0', 0.62));
    S.add(new THREE.HemisphereLight('#ffffff', '#b9b2a0', 0.45));
    for (const [x, z] of [[-3, -2], [2, -2], [-3, 2.5], [2, 2.5]]) {
      const l = new THREE.PointLight('#fff8ec', LOW ? 3.5 : 4.5, 8, 1.7);
      l.position.set(x, 2.9, z);
      S.add(l);
    }

    // Glossy floor: a faint mirror under semi-transparent tiles.
    if (!LOW) {
      const mirror = new Reflector(new THREE.PlaneGeometry(12, 10), { textureWidth: 1024, textureHeight: 1024, color: '#6f747c' });
      mirror.rotation.x = -Math.PI / 2;
      S.add(mirror);
      this.disposables.push(mirror);
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ map: T.floorTex(), roughness: 0.3, transparent: !LOW, opacity: LOW ? 1 : 0.8 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.003;
    S.add(floor);

    // Walls & ceiling
    const wall = (w, h, pos, rotY) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: '#e9e6df', roughness: 0.9 }));
      m.position.set(...pos);
      m.rotation.y = rotY;
      S.add(m);
    };
    wall(12, 3.2, [0, 1.6, -5], 0);
    wall(10, 3.2, [-6, 1.6, 0], Math.PI / 2);
    wall(10, 3.2, [6, 1.6, 0], -Math.PI / 2);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.2;
    S.add(ceil);
    for (const x of [-3.5, 0, 3.5]) {
      for (const z of [-3, 0, 3]) this.panel(T.ceilingLightTex(), 0.4, 1.6, [x, 3.19, z], { glow: 1.6, rotX: Math.PI / 2 });
    }
    // Teal & orange stripe around the walls, like the shop front
    this.box(12, 0.12, 0.02, '#22a387', [0, 2.75, -4.99]);
    this.box(12, 0.05, 0.02, '#f39a1e', [0, 2.66, -4.99]);

    // Front wall: windows onto the rainy street, the door, a door mat
    const night = T.nightWindowTex();
    this.panel(night, 4.7, 2.3, [-3.25, 1.55, 4.99], { glow: 0.7, rotY: Math.PI });
    this.panel(night, 3.45, 2.3, [4.27, 1.55, 4.99], { glow: 0.7, rotY: Math.PI });
    this.box(12, 0.4, 0.1, '#56636f', [0, 0.2, 5]);
    this.box(12, 0.5, 0.1, '#e9edf1', [0, 2.95, 5]);
    this.box(1.6, 0.03, 1.0, '#3d4652', [DOOR.x, 0.015, 4.4]);
    this.panel(T.doorTex(), 1.5, 2.5, [DOOR.x, 1.4, 4.98], { glow: 0.3, rotY: Math.PI, transparent: true });

    // Back wall: glowing drink fridges
    for (let i = 0; i < 6; i++) {
      this.box(1.2, 2.3, 0.7, '#d9dee4', [-5.35 + i * 1.2, 1.15, -4.62]);
      this.panel(T.fridgeTex(i + 3), 1.08, 2.05, [-5.35 + i * 1.2, 1.2, -4.26], { glow: 0.9 });
    }
    this.#hangSign('飲み物', 'DRINKS', [-2.3, 2.6, -4.45], 0, '#1f5fbf');

    // Left wall: chilled case for onigiri, bento, dango
    this.box(0.85, 1.9, 5.1, '#e3e8ee', [-5.55, 0.95, -0.65]);
    this.box(0.1, 0.4, 5.1, '#c9d2dc', [-5.15, 0.2, -0.65]);
    for (const y of [0.55, 0.95, 1.35]) this.box(0.6, 0.03, 5.0, '#ffffff', [-5.35, y, -0.65], { emissive: '#ffffff', glow: 0.4 });
    this.#hangSign('おにぎり', 'RICE BALLS', [-5.3, 2.2, -0.4], Math.PI / 2, '#2e9e6e');

    // Gondola shelves A (snacks | bread) and B (noodles | daily goods)
    this.#gondola(-2.4, -0.6);
    this.#gondola(0.6, -0.6);
    this.#hangSign('お菓子', 'SNACKS', [-3.3, 2.0, -0.6], Math.PI / 2, '#e85d75', 0.9);
    this.#hangSign('パン', 'BREAD', [-1.5, 2.0, -0.6], -Math.PI / 2, '#c77d2b', 0.9);
    this.#hangSign('カップめん', 'CUP NOODLES', [-0.25, 2.0, -0.6], Math.PI / 2, '#d14a3a', 0.9);
    this.#hangSign('日用品', 'DAILY GOODS', [1.45, 2.0, -0.6], -Math.PI / 2, '#5a67c7', 0.9);
    this.panel(T.signTex('新商品', { bg: '#e63946', fg: '#ffffff', w: 256, h: 128, size: 70 }), 0.5, 0.25, [0.6, 1.62, 1.72], { glow: 0.8 });
    this.panel(T.signTex('お買い得!', { bg: '#ffd400', fg: '#d00000', w: 256, h: 128, size: 58 }), 0.5, 0.25, [-2.4, 1.62, 1.72], { glow: 0.8 });

    // Magazine rack under the front-left window
    this.box(3.3, 0.9, 0.7, '#d4dae1', [-3.95, 0.45, 4.55]);
    for (let i = 0; i < 9; i++) {
      this.box(0.3, 0.42, 0.02, ['#e63946', '#3a86ff', '#ffd166', '#8ac926', '#c77dff'][i % 5], [-5.4 + i * 0.36, 1.05, 4.25], { rough: 0.5 });
    }
    this.#hangSign('雑誌', 'MAGAZINES', [-3.9, 2.0, 4.4], Math.PI, '#6b4fa3', 0.9);

    // Ice cream freezer (glass top)
    this.box(1.7, 0.85, 1.0, '#e8edf3', [2.8, 0.43, 1.6]);
    this.box(1.6, 0.04, 0.9, '#cfe9ff', [2.8, 0.87, 1.6], { opacity: 0.6, emissive: '#cfe9ff', glow: 0.4 });
    this.#hangSign('アイス', 'ICE CREAM', [2.8, 1.6, 1.6], 0, '#3aa0d8', 0.7);

    // ATM in the corner
    this.box(1.0, 1.8, 0.8, '#2d5fa8', [-5.4, 0.9, 3.45]);
    this.panel(T.signTex('ATM', { bg: '#2d5fa8', fg: '#ffffff', w: 256, h: 128, size: 80 }), 0.7, 0.35, [-4.89, 1.55, 3.45], { glow: 1, rotY: Math.PI / 2 });
    this.box(0.02, 0.4, 0.5, '#7ee8fa', [-4.89, 1.05, 3.45], { emissive: '#7ee8fa', glow: 0.8 });

    // The till: counter, register, hot-snack case, coffee machine, the clerk
    this.box(1.0, 1.0, 5.2, '#f2f3f5', [4.65, 0.5, 0.55]);
    this.box(1.06, 0.06, 5.26, '#22a387', [4.65, 1.02, 0.55]);
    this.box(0.4, 0.3, 0.35, '#3d4652', [4.75, 1.2, 0.3]);
    this.box(0.04, 0.18, 0.25, '#7ee8fa', [4.54, 1.3, 0.3], { emissive: '#7ee8fa', glow: 0.9 });
    this.box(0.7, 0.55, 1.0, '#fff3dc', [4.6, 1.33, 2.1], { emissive: '#ffcf8a', glow: 0.55, opacity: 0.85 });
    for (const [i, e] of ['🍗', '🥟', '🍢'].entries()) this.#quads(e, [[4.27, 1.25 + (i % 2) * 0.18, 1.75 + i * 0.32]], 0.22, -Math.PI / 2);
    this.box(0.45, 0.6, 0.4, '#2b2f3a', [4.7, 1.32, -1.4]);
    this.panel(T.signTex('レジ', { bg: '#22a387', fg: '#ffffff', w: 256, h: 128, size: 84 }), 0.9, 0.45, [4.6, 2.6, 0.6], { glow: 0.9, rotY: -Math.PI / 2 });
    this.panel(T.signTex('からあげ・中華まん・おでん', { bg: '#ff9f1c', fg: '#ffffff', w: 768, h: 128, size: 60, sub: 'HOT SNACKS' }), 1.6, 0.3, [5.97, 2.05, 2.1], { glow: 0.8, rotY: -Math.PI / 2 });
    this.#clerk([5.45, 0, 0.6]);
    this.panel(T.signTex('お手洗い', { bg: '#ffffff', fg: '#3a3f55', w: 256, h: 128, size: 60, sub: 'RESTROOM' }), 0.7, 0.35, [5.97, 2.3, -4.2], { glow: 0.5, rotY: -Math.PI / 2 });

    // Products: each shopping item shows up where it is sold.
    const I = (id) => this.items[id]?.emoji ?? '📦';
    this.#rows(I('tea'), -4.4, -3.2, -4.15, [0.55, 1.05, 1.55], 0);
    this.#rows(I('coffee'), -1.6, -0.4, -4.15, [0.55, 1.05, 1.55], 0);
    this.#rowsZ(I('onigiri'), -5.08, -2.6, -1.2, [0.62, 1.02, 1.42], Math.PI / 2);
    this.#rowsZ(I('bento'), -5.08, -1.0, 0.2, [0.62, 1.02], Math.PI / 2);
    this.#rowsZ(I('dango'), -5.08, 0.6, 1.6, [0.62, 1.02, 1.42], Math.PI / 2);
    this.#rowsZ(I('senbei'), -2.92, -2.6, -0.8, [0.42, 0.82, 1.22], -Math.PI / 2);
    this.#rowsZ(I('choco'), -2.92, -0.4, 1.5, [0.42, 0.82, 1.22], -Math.PI / 2);
    this.#rowsZ(I('melonpan'), -1.88, -2.6, 1.5, [0.42, 0.82, 1.22], Math.PI / 2);
    this.#rowsZ(I('cupnoodle'), 0.08, -2.6, 1.5, [0.42, 0.82, 1.22], -Math.PI / 2);
    this.#rowsZ(I('mask'), 1.12, -2.6, -0.6, [0.42, 0.82, 1.22], Math.PI / 2);
    this.#rowsZ(I('umbrella'), 1.12, -0.2, 1.5, [0.55, 1.1], Math.PI / 2, 0.34);
    this.#rows(I('icecream'), 2.2, 3.4, 1.6, [0.92], 0, 0.22, true);
    this.#rows(I('manga'), -5.3, -3.9, 4.15, [1.32], Math.PI);
    this.#rows(I('magazine'), -3.7, -2.5, 4.15, [1.32], Math.PI);
  }

  #hangSign(jp, en, pos, rotY, color, scale = 1) {
    const tex = T.signTex(jp, { bg: '#ffffff', fg: color, sub: en, w: 512, h: 180, size: jp.length > 4 ? 64 : 86, border: color });
    const m = this.panel(tex, 1.3 * scale, 0.46 * scale, pos, { glow: 0.65, rotY });
    m.material.side = THREE.DoubleSide;
    return m;
  }

  #gondola(x, z) {
    this.box(0.95, 0.12, 4.6, '#c9d0d8', [x, 0.06, z]);
    this.box(0.08, 1.45, 4.6, '#dfe4ea', [x, 0.78, z]);
    for (const y of [0.32, 0.72, 1.12]) {
      for (const side of [-1, 1]) this.box(0.42, 0.03, 4.5, '#ffffff', [x + side * 0.24, y, z]);
    }
  }

  // Emoji products as camera-facing-ish quads in rows (one InstancedMesh each).
  #quads(emoji, positions, size, rotY) {
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({ map: T.emojiTex(emoji), transparent: true, alphaTest: 0.15 });
    const mesh = new THREE.InstancedMesh(geo, mat, positions.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0));
    positions.forEach((p, i) => mesh.setMatrixAt(i, m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(1, 1, 1))));
    this.scene.add(mesh);
  }

  #rows(emoji, x0, x1, z, ys, rotY, size = 0.26, flat = false) {
    const pos = [];
    for (const y of ys) for (let x = x0; x <= x1 + 1e-6; x += size * 1.05) pos.push([x, y + size / 2, z]);
    if (flat) this.#quads(emoji, pos.map(([x, y]) => [x, 0.9, z + 0.3]), size, rotY);
    else this.#quads(emoji, pos, size, rotY);
  }

  #rowsZ(emoji, x, z0, z1, ys, rotY, size = 0.26) {
    const pos = [];
    for (const y of ys) for (let z = z0; z <= z1 + 1e-6; z += size * 1.05) pos.push([x, y + size / 2, z]);
    this.#quads(emoji, pos, size, rotY);
  }

  // The clerk: a friendly 2D chibi standee behind the till (uniform: teal).
  #clerk(pos) {
    const look = { hair: '#2b1d14', style: 'short', outfit: '#22a387', legs: '#2b2f3a', acc: [] };
    const svg = chibiSvg(look).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="304" ');
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 304;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    img.onload = () => { canvas.getContext('2d').drawImage(img, 0, 0, 200, 304); tex.needsUpdate = true; };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.45), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 }));
    m.position.set(pos[0], 0.95, pos[2]);
    m.rotation.y = -Math.PI / 2;
    this.scene.add(m);
    this.clerkMesh = m;
  }

  // A 3D clerk in uniform behind the till, and two shoppers in the aisles.
  // They reuse the anime model, recoloured into different people.
  async #spawnPeople() {
    try {
      const clerk = await loadVrmHeroine();
      if (this.disposed) return;
      clerk.tint({ hair: '#2a1a12', top: '#3bbf9a', bottoms: '#3a3f55' });
      clerk.setUmbrella(false);
      clerk.placeAt(new THREE.Vector3(5.35, 0, 0.6), new THREE.Euler(0, -Math.PI / 2, 0));
      this.scene.add(clerk.root);
      this.clerk = clerk;
      if (this.clerkMesh) this.clerkMesh.visible = false;
      clerk.bow();
      this.onSay?.('いらっしゃいませ！', 'irasshaimase', 'Welcome!');
      this.sound.chime();

      const looks = [
        { hair: '#151515', top: '#5b7dd6', bottoms: '#8a6a4a', start: 'A' },
        { hair: '#c9a46a', top: '#e98a9a', bottoms: '#2b2f3a', start: 'H' },
      ];
      for (const look of looks) {
        const npc = await loadVrmHeroine();
        if (this.disposed) return;
        npc.tint(look);
        this.scene.add(npc.root);
        this.shoppers.push(new Shopper(npc, look.start));
      }
    } catch (e) {
      console.warn('[interior] extra people failed to load', e);
    }
  }

  // ── Hooks ────────────────────────────────────────────────────────────────
  constrain(next) {
    const r = 0.28;
    const inDoor = Math.abs(next.x - DOOR.x) < DOOR.half;
    if (next.x < ROOM.x0 || next.x > ROOM.x1 || next.z < ROOM.z0 || next.z > (inDoor ? 5.4 : ROOM.z1)) return null;
    for (const [x0, x1, z0, z1] of SOLIDS) {
      if (next.x > x0 - r && next.x < x1 + r && next.z > z0 - r && next.z < z1 + r) return null;
    }
    for (const sh of this.shoppers) {
      if (Math.hypot(next.x - sh.hero.root.position.x, next.z - sh.hero.root.position.z) < 0.55) return null;
    }
    return next;
  }

  clampCamera(v) {
    v.x = Math.min(Math.max(v.x, -5.7), 5.7);
    v.z = Math.min(Math.max(v.z, -4.7), 4.85);
    v.y = Math.min(v.y, 2.9);
  }

  update(dt, t, hero) {
    // Nearest shelf spot or the till → tell the UI (shows Take / Pay buttons)
    let best = null, bestD = 1.25;
    for (const z of ZONES) {
      const d = Math.hypot(hero.position.x - z.pos[0], hero.position.z - z.pos[1]);
      if (d < bestD) { bestD = d; best = z; }
    }
    if (best !== this.zone) {
      this.zone = best;
      this.onZone?.(best);
      if (best?.type === 'till' && this.clerk) { this.clerk.bow(); this.onSay?.('いらっしゃいませ。お待たせしました。', 'irasshaimase. omatase shimashita.', 'Welcome. Sorry to keep you waiting.'); }
    }
    // The clerk breathes and blinks; shoppers wander and browse.
    this.clerk?.update(dt, 0);
    const others = [hero.position, ...this.shoppers.map((s) => s.hero.root.position)];
    for (const sh of this.shoppers) sh.update(dt, others);
    // Clerk bob, so he feels alive
    if (this.clerkMesh) this.clerkMesh.position.y = 0.95 + Math.sin(t * 2) * 0.01;
    // Leaving through the door
    if (!this.left && hero.position.z > 5.1) {
      this.left = true;
      this.frozen = true;
      this.onExit?.();
    }
  }
}
