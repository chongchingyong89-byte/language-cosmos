// Inside Restoran Budi Maju: a mamak that is also a kedai runcit.
// Roti canai griddle, teh tarik station, kuih and nasi lemak, sundry
// shelves, steel tables with plastic stools, ceiling fans, football on TV.
// Room: x −6…6, z −5…5; the whole front (z = 5) is open to the rain.
import * as THREE from 'three';
import { World3D, LOW, CROWD } from './base.js';
import * as T from './textures.js';
import { chibiSvg } from '../shops/chibi.js';
import { loadVrmHeroine } from './heroineVrm.js';
import { Shopper } from './interior.js';

const ROOM = { x0: -5.65, x1: 5.65, z0: -4.55, z1: 4.75 };
const OPEN = 4.4;   // |x| < OPEN is the open front

export const MAMAK_WORDS = [
  { id: 'kaunter', pos: [4.4, 2.5, 2.0], jp: 'Kaunter Bayaran', romaji: 'KOWN-ter bah-YAH-ran', en: 'pay counter', note: 'Bayar = to pay, + -an makes a noun: bayaran = payment. Kaunter is English "counter" spelt the Malay way.' },
  { id: 'canai', pos: [-2.0, 2.4, -4.4], jp: 'Roti Canai', romaji: 'RO-tee cha-NIGH', en: 'flaky flatbread', note: 'Roti = bread. Canai may mean "to knead and roll", or come from Chennai in India, where the mamak story starts.' },
  { id: 'kurangmanis', pos: [2.0, 2.4, -4.4], jp: 'Kurang Manis', romaji: 'KOO-rang MAH-nis', en: 'less sweet', note: 'Kurang = less, manis = sweet. Say it after any drink order. "Kurang ais" = less ice!' },
  { id: 'tehoais', pos: [0.2, 1.7, -4.4], jp: 'Teh O Ais', romaji: 'tay oh ICE', en: 'iced tea, no milk', note: 'The mamak code: Teh = tea with milk, Teh O = no milk, Teh O Ais = no milk with ice, Teh C = with evaporated milk.' },
  { id: 'nasilemak', pos: [-5.0, 1.8, -0.8], jp: 'Nasi Lemak', romaji: 'NAH-see le-MAHK', en: 'coconut rice', note: 'Nasi = cooked rice, lemak = rich and creamy, from the coconut milk. Wrapped in a banana leaf pyramid.' },
  { id: 'kuihmuih', pos: [-5.0, 1.8, 0.95], jp: 'Kuih-muih', romaji: 'KOO-ee MOO-ee', en: 'all kinds of cakes', note: 'Doubling with a sound change means "all sorts of": kuih-muih (cakes), sayur-mayur (vegetables), lauk-pauk (side dishes).' },
  { id: 'suratkhabar', pos: [-5.0, 1.9, 3.3], jp: 'Surat Khabar', romaji: 'SOO-rat KHAH-bar', en: 'newspaper', note: 'Surat = letter, khabar = news (from Arabic). Apa khabar? = "What news?" = How are you?' },
  { id: 'payung', pos: [-2.9, 1.3, 4.6], jp: 'Payung', romaji: 'PAH-yoong', en: 'umbrella', note: 'Counted with kaki ("leg"), because of its long handle: sekaki payung.' },
  { id: 'aiskrim', pos: [5.2, 1.6, -3.3], jp: 'Aiskrim', romaji: 'ICE-krim', en: 'ice cream', note: 'Say "ice cream" fast and write what you hear. Malay spelling is that friendly.' },
  { id: 'runcit', pos: [5.4, 2.4, -1.0], jp: 'Barang Runcit', romaji: 'BAH-rang ROON-chit', en: 'sundry goods', note: 'Runcit means "retail, in small amounts". A kedai runcit sells a bit of everything, one piece at a time.' },
  { id: 'tapau', pos: [3.6, 2.2, 3.9], jp: 'Bungkus / Tapau', romaji: 'BOONG-koos / TAH-pow', en: 'takeaway', note: 'Bungkus is Malay for "wrap up". Tapau comes from Cantonese 打包. Everyone in Malaysia uses both!' },
  { id: 'halal', pos: [-0.8, 2.6, -4.6], jp: 'Halal', romaji: 'hah-LAHL', en: 'permitted (for Muslims)', note: 'Mamak shops are run by Indian Muslims, so their food is halal and people of every race and religion can eat at the same table.' },
  { id: '24jam', pos: [0, 2.7, 4.6], jp: 'Buka 24 Jam', romaji: 'BOO-kah dua puluh empat jam', en: 'open 24 hours', note: 'Jam means both "hour" and "clock". Many mamak never close: people watch football here at 3 a.m.' },
];

// Where she stands to take each item.
export const MAMAK_ZONES = [
  { item: 'telur', pos: [-4.0, -3.4] },
  { item: 'roticanai', pos: [-2.0, -3.4] },
  { item: 'tehtarik', pos: [0.9, -3.4] },
  { item: 'sirap', pos: [2.7, -3.4] },
  { item: 'aiskrim', pos: [4.25, -3.2] },
  { item: 'roti', pos: [4.75, -1.6] },
  { item: 'pen', pos: [4.75, -0.3] },
  { item: 'nasilemak', pos: [-4.55, -0.85] },
  { item: 'kuih', pos: [-4.55, 0.95] },
  { item: 'suratkhabar', pos: [-4.55, 3.2] },
  { item: 'payung', pos: [-2.9, 3.75] },
  { item: 'kerepek', pos: [3.7, 4.05] },
  { type: 'till', pos: [3.75, 1.6] },
];

const SOLIDS = [
  [-6, 3.9, -5, -3.85],      // griddle + drink station along the back
  [4.9, 6, -4.4, -2.3],      // ice cream freezer
  [5.25, 6, -2.2, 0.25],     // sundry shelf
  [4.3, 6, 0.55, 3.4],       // cashier counter
  [4.85, 6, 3.75, 4.9],      // kerepek rack
  [-6, -5.0, -1.6, -0.1],    // nasi lemak table
  [-6, -5.0, 0.2, 1.7],      // kuih display
  [-6, -5.0, 2.5, 4.0],      // newspaper rack
  [-3.2, -2.6, 4.3, 4.9],    // umbrella bucket
];
const TABLES = [[-2.4, -0.4], [1.9, -0.6], [-1.5, 2.1]];

const GRAPH = {
  nodes: { A: [-3.3, -3.0], B: [0.0, -3.0], C: [3.2, -2.6], D: [0.0, -1.4], E: [0.1, 1.0], F: [-3.9, 1.0], G: [0.6, 3.6] },
  edges: { A: 'B', B: 'ACD', C: 'BD', D: 'BCE', E: 'DFG', F: 'E', G: 'E' },
  browse: { A: Math.PI, B: Math.PI, C: Math.PI / 2, F: -Math.PI / 2 },
};

export class MamakInterior extends World3D {
  constructor(container, { sound, onDiscover, found = new Set(), items, onZone, onExit, onSay }) {
    super(container, {
      sound, onDiscover, found, readables: MAMAK_WORDS,
      background: '#1b1a33', bloom: [0.22, 0.4, 1.25], exposure: 0.9,
      cam: { yaw: 0, pitch: 1.75, dist: 3.4, height: 1.2 },
    });
    this.items = items;
    this.onZone = onZone;
    this.onExit = onExit;
    this.onSay = onSay;
    this.shoppers = [];
    this.fans = [];
    this.readRange = 2.2;
    this.walkSpeed = 1.3;
    this.runSpeed = 2.6;
    this.zone = null;
    this.#build();
    this.#outsideRain();
    this.spawnHero(new THREE.Vector3(0.4, 0, 4.0), Math.PI, { umbrella: false });
    if (CROWD) this.#spawnPeople(); // small phones keep the 2D cashier
  }

  // ── Scene ────────────────────────────────────────────────────────────────
  #build() {
    const S = this.scene;
    S.add(new THREE.AmbientLight('#fff4e0', 0.6));
    S.add(new THREE.HemisphereLight('#ffffff', '#8a7f6a', 0.45));
    for (const [x, z] of LOW ? [[-2, -1.5], [2, 1.5]] : [[-3, -2], [2, -2], [-3, 2.5], [2, 2.5]]) {
      const l = new THREE.PointLight('#f4fbff', LOW ? 5 : 4.5, 8, 1.7);
      l.position.set(x, 2.9, z);
      S.add(l);
    }
    const griddleGlow = new THREE.PointLight('#ff8a3d', 3, 4, 2);
    griddleGlow.position.set(-2.4, 1.4, -3.7);
    S.add(griddleGlow);
    this.griddleGlow = griddleGlow;

    // Terrazzo-ish floor (no mirror here: the mamak floor is matte)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ map: T.floorTex(), color: '#e8dcc4', roughness: 0.45 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.003;
    S.add(floor);
    // Walls: pale green tiles below, cream above; ceiling
    const wall = (w, h, pos, rotY, color) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
      m.position.set(...pos);
      m.rotation.y = rotY;
      S.add(m);
    };
    wall(12, 3.4, [0, 1.7, -5], 0, '#f1e6c8');
    wall(10, 3.4, [-6, 1.7, 0], Math.PI / 2, '#f1e6c8');
    wall(10, 3.4, [6, 1.7, 0], -Math.PI / 2, '#f1e6c8');
    wall(12, 1.2, [0, 0.6, -4.99], 0, '#7fc4a4');
    wall(10, 1.2, [-5.99, 0.6, 0], Math.PI / 2, '#7fc4a4');
    wall(10, 1.2, [5.99, 0.6, 0], -Math.PI / 2, '#7fc4a4');
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: '#f6f2e8', roughness: 1 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.4;
    S.add(ceil);
    for (const x of [-3.5, 0, 3.5]) for (const z of [-3, 0.5]) this.panel(T.ceilingLightTex(), 0.25, 1.4, [x, 3.39, z], { glow: 1.5, rotX: Math.PI / 2 });
    for (const [x, z] of [[-1.8, -1.2], [1.6, -1.2], [-1.8, 2.4], [1.6, 2.4]]) this.#fan(x, z);

    // Open front: shutter rolled up, the rainy street beyond
    this.box(12, 0.5, 0.25, '#8d939c', [0, 3.15, 5]);
    for (const x of [-OPEN - 0.8, OPEN + 0.8]) this.box(1.6, 3.4, 0.25, '#f1e6c8', [x, 1.7, 5]);
    const street = this.panel(T.nightWindowTex(), 14, 4.2, [0, 1.9, 8.5], { glow: 0.6, rotY: Math.PI });
    street.material.fog = false;
    this.box(14, 0.05, 4, '#2a2b3a', [0, -0.03, 7], { rough: 0.2, metal: 0.4 });
    this.panel(T.signTex('BUKA 24 JAM', { bg: '#c8102e', fg: '#ffd400', w: 512, h: 110, size: 64 }), 1.8, 0.38, [0, 2.7, 4.85], { glow: 1.0, rotY: Math.PI });

    // Back wall: roti canai griddle (left) and the teh tarik station (right)
    this.box(4.0, 0.95, 0.65, '#c9ced6', [-2.6, 0.48, -4.08], { rough: 0.3, metal: 0.6 });
    const griddle = this.box(2.2, 0.04, 0.55, '#2b2420', [-2.0, 0.97, -4.08], { emissive: '#ff6a1a', glow: 0.25, rough: 0.3 });
    this.griddle = griddle;
    this.#quads(this.#emoji('roticanai'), [[-2.6, 1.08, -4.2], [-2.2, 1.08, -4.25], [-1.8, 1.08, -4.2], [-1.4, 1.08, -4.25]], 0.3, 0);
    this.#quads(this.#emoji('telur'), [[-4.3, 1.04, -4.0], [-4.1, 1.04, -4.05], [-3.9, 1.04, -4.0], [-4.2, 1.18, -4.08], [-4.0, 1.18, -4.08]], 0.18, 0);
    this.box(4.6, 0.95, 0.65, '#c9ced6', [1.6, 0.48, -4.08], { rough: 0.3, metal: 0.6 });
    for (const x of [0.2, 0.6]) {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 16), new THREE.MeshStandardMaterial({ color: '#d7dbe2', metalness: 0.9, roughness: 0.2 }));
      urn.position.set(x, 1.22, -4.15);
      S.add(urn);
    }
    // Two mugs and a stream of tea being "pulled" between them
    const mugMat = new THREE.MeshStandardMaterial({ color: '#d7dbe2', metalness: 0.9, roughness: 0.2 });
    this.mugLow = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.16, 12), mugMat);
    this.mugLow.position.set(1.6, 1.04, -3.95);
    this.mugHigh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.16, 12), mugMat);
    this.mugHigh.position.set(1.6, 1.7, -3.95);
    this.stream = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), new THREE.MeshStandardMaterial({ color: '#c58a4a', emissive: '#6b3a12', emissiveIntensity: 0.4, transparent: true, opacity: 0.85 }));
    S.add(this.mugLow, this.mugHigh, this.stream);
    this.#quads(this.#emoji('tehtarik'), [[0.9, 1.08, -4.0], [1.15, 1.08, -4.0], [2.0, 1.08, -4.0]], 0.24, 0);
    this.#quads(this.#emoji('sirap'), [[2.5, 1.08, -4.0], [2.75, 1.08, -4.0], [3.0, 1.08, -4.0]], 0.24, 0);
    // Menu boards above the stations
    this.panel(T.menuBoardTex([['Roti Canai', '1.50'], ['Roti Telur', '2.50'], ['Nasi Lemak', '3.00'], ['Mee Goreng', '6.00'], ['Maggi Goreng', '6.50']]), 1.2, 1.5, [-3.6, 2.3, -4.98], { glow: 0.7 });
    this.panel(T.menuBoardTex([['Teh Tarik', '2.20'], ['Teh O Ais', '2.00'], ['Kopi O', '1.80'], ['Milo Ais', '3.00'], ['Sirap Bandung', '2.50']]), 1.2, 1.5, [3.0, 2.3, -4.98], { glow: 0.7 });
    this.#hang('ROTI CANAI', 'flatbread', [-2.0, 2.4, -4.5], 0, '#c8102e');
    this.#hang('KURANG MANIS?', 'less sweet?', [2.0, 2.4, -4.5], 0, '#0b6e4f');
    this.panel(T.signTex('TEH O AIS', { bg: '#fff3c4', fg: '#7a3e00', w: 512, h: 110, size: 56 }), 0.8, 0.18, [0.2, 1.7, -4.95], { glow: 0.6 });
    this.panel(T.signTex('حلال', { bg: '#0b6e4f', fg: '#fff', sub: 'HALAL', w: 256, h: 256, size: 96 }), 0.45, 0.45, [-0.8, 2.6, -4.97], { glow: 0.7 });

    // TV on a bracket, showing football
    this.tv = this.panel(T.footballTex(), 1.2, 0.68, [-0.8, 2.55, -4.73], { glow: 1.0 });
    this.tv.position.set(4.2, 2.65, -4.6);
    this.tv.rotation.y = -0.5;
    this.box(1.3, 0.78, 0.06, '#111', [4.23, 2.65, -4.64], { rotY: -0.5 });

    // Right wall: freezer, sundry shelves, the cashier counter, kerepek rack
    this.box(1.1, 0.9, 2.1, '#e8edf3', [5.45, 0.45, -3.35]);
    this.box(1.0, 0.04, 2.0, '#cfe9ff', [5.45, 0.92, -3.35], { opacity: 0.6, emissive: '#cfe9ff', glow: 0.4 });
    this.#quads(this.#emoji('aiskrim'), [-3.9, -3.55, -3.2, -2.85].map((z) => [5.2, 0.95, z]), 0.22, -Math.PI / 2);
    this.box(0.7, 2.2, 2.4, '#b08a5a', [5.65, 1.1, -0.95]);
    for (const y of [0.5, 1.0, 1.5, 2.0]) this.box(0.72, 0.03, 2.4, '#d9b88a', [5.62, y, -0.95]);
    const rows = (emoji, z0, z1, ys, size = 0.24) => {
      const pos = [];
      for (const y of ys) for (let z = z0; z <= z1 + 1e-6; z += size * 1.05) pos.push([5.27, y + size / 2, z]);
      this.#quads(emoji, pos, size, -Math.PI / 2);
    };
    rows(this.#emoji('roti'), -2.1, -1.2, [1.0, 1.5]);
    rows(this.#emoji('pen'), -0.7, 0.15, [1.0, 1.5], 0.18);
    rows('🧴', -2.1, 0.15, [0.5]);
    rows('🧻', -2.1, 0.15, [2.0]);
    this.#hang('BARANG RUNCIT', 'sundry goods', [5.4, 2.4, -1.0], -Math.PI / 2, '#5a3d8a');
    // Counter with register, sweets jars, the cashier
    this.box(1.6, 1.0, 2.85, '#9b6b3e', [5.15, 0.5, 1.98]);
    this.box(1.66, 0.05, 2.9, '#e9e1cf', [5.15, 1.02, 1.98]);
    this.box(0.4, 0.3, 0.35, '#3d4652', [4.85, 1.2, 1.5]);
    this.box(0.04, 0.18, 0.25, '#7ee8fa', [4.64, 1.3, 1.5], { emissive: '#7ee8fa', glow: 0.9 });
    for (const [i, c] of ['#ff6b6b', '#ffd166', '#06d6a0'].entries()) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.26, 12), new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.7, roughness: 0.1 }));
      jar.position.set(4.7, 1.18, 2.3 + i * 0.25);
      S.add(jar);
    }
    this.panel(T.signTex('KAUNTER BAYARAN', { bg: '#1d3a8a', fg: '#ffffff', sub: 'PAY HERE', w: 768, h: 160, size: 70 }), 1.4, 0.3, [4.4, 2.5, 2.0], { glow: 0.9, rotY: -Math.PI / 2 });
    this.#clerk([5.55, 0, 1.7]);
    // Kerepek packets hanging on a rack by the entrance
    this.box(0.08, 2.2, 0.08, '#777', [5.0, 1.1, 4.3]);
    this.box(0.08, 0.08, 1.0, '#777', [5.0, 2.15, 4.3]);
    this.#quads(this.#emoji('kerepek'), [[4.94, 1.85, 3.95], [4.94, 1.85, 4.3], [4.94, 1.85, 4.65], [4.94, 1.45, 3.95], [4.94, 1.45, 4.3], [4.94, 1.45, 4.65]], 0.3, -Math.PI / 2);
    this.panel(T.signTex('BUNGKUS / TAPAU', { bg: '#ff9f1c', fg: '#fff', w: 768, h: 128, size: 64 }), 1.2, 0.2, [4.4, 2.2, 3.9], { glow: 0.8, rotY: -Math.PI / 2 });

    // Left wall: nasi lemak table, kuih display, newspaper rack
    this.box(1.0, 0.85, 1.5, '#9b6b3e', [-5.5, 0.43, -0.85]);
    this.#quads(this.#emoji('nasilemak'), [[-5.6, 1.0, -1.3], [-5.6, 1.0, -0.95], [-5.6, 1.0, -0.6], [-5.75, 1.18, -1.1], [-5.75, 1.18, -0.75]], 0.3, Math.PI / 2);
    this.box(1.0, 0.85, 1.5, '#9b6b3e', [-5.5, 0.43, 0.95]);
    this.box(0.95, 0.5, 1.45, '#e8f6ff', [-5.5, 1.1, 0.95], { opacity: 0.35, emissive: '#fff0d8', glow: 0.3 });
    this.#quads(this.#emoji('kuih'), [[-5.3, 1.0, 0.45], [-5.3, 1.0, 0.75], [-5.3, 1.0, 1.05], [-5.3, 1.0, 1.35], [-5.4, 1.2, 0.6], [-5.4, 1.2, 0.9], [-5.4, 1.2, 1.2]], 0.24, Math.PI / 2);
    this.#hang('NASI LEMAK', 'coconut rice', [-5.0, 1.8, -0.8], Math.PI / 2, '#0b6e4f', 0.8);
    this.#hang('KUIH-MUIH', 'cakes', [-5.0, 1.8, 0.95], Math.PI / 2, '#e85d75', 0.8);
    this.box(0.7, 1.2, 1.4, '#6b4a2a', [-5.6, 0.6, 3.25]);
    for (let i = 0; i < 4; i++) this.box(0.02, 0.42, 0.3, ['#f4f1ea', '#e9e4d8'][i % 2], [-5.24, 1.05, 2.75 + i * 0.33], { rough: 0.9 });
    this.#quads(this.#emoji('suratkhabar'), [[-5.22, 1.4, 2.8], [-5.22, 1.4, 3.15], [-5.22, 1.4, 3.5]], 0.28, Math.PI / 2);
    this.#hang('SURAT KHABAR', 'newspapers', [-5.0, 1.9, 3.3], Math.PI / 2, '#3a3f55', 0.8);
    // Umbrella bucket by the door
    this.box(0.45, 0.6, 0.45, '#2f6f7a', [-2.9, 0.3, 4.6]);
    for (let i = 0; i < 3; i++) {
      const u = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.9, 6), new THREE.MeshStandardMaterial({ color: ['#c23b3b', '#2b4a8a', '#f2c14e'][i] }));
      u.position.set(-3.05 + i * 0.15, 0.75, 4.6);
      u.rotation.z = (i - 1) * 0.15;
      S.add(u);
    }

    for (const [x, z] of TABLES) this.#table(x, z);
  }

  #emoji(id) { return this.items[id]?.emoji ?? '📦'; }

  #hang(text, sub, pos, rotY, color, scale = 1) {
    const tex = T.signTex(text, { bg: '#ffffff', fg: color, sub, w: 640, h: 180, size: text.length > 10 ? 58 : 76, border: color });
    const m = this.panel(tex, 1.5 * scale, 0.42 * scale, pos, { glow: 0.65, rotY });
    m.material.side = THREE.DoubleSide;
    return m;
  }

  #quads(emoji, positions, size, rotY) {
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({ map: T.emojiTex(emoji), transparent: true, alphaTest: 0.15 });
    const mesh = new THREE.InstancedMesh(geo, mat, positions.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0));
    positions.forEach((p, i) => mesh.setMatrixAt(i, m.compose(new THREE.Vector3(...p), q, new THREE.Vector3(1, 1, 1))));
    this.scene.add(mesh);
  }

  #table(x, z) {
    const g = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: '#c9ced6', roughness: 0.25, metalness: 0.8 });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 20), steel);
    top.position.y = 0.74;
    g.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8), steel);
    leg.position.y = 0.37;
    g.add(leg);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.13, 10), new THREE.MeshStandardMaterial({ color: '#d9a066', transparent: true, opacity: 0.85, roughness: 0.1 }));
    glass.position.set(0.12, 0.83, 0.05);
    g.add(glass);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.45, 12), new THREE.MeshStandardMaterial({ color: i % 2 ? '#1d4ed8' : '#d62828', roughness: 0.5 }));
      stool.position.set(Math.cos(a) * 0.66, 0.23, Math.sin(a) * 0.66);
      g.add(stool);
    }
    g.position.set(x, 0, z);
    this.scene.add(g);
  }

  #fan(x, z) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: 0.5 });
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), m);
    rod.position.y = 0.2;
    g.add(rod);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 12), m));
    for (let i = 0; i < 3; i++) {
      const arm = new THREE.Group();
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.012, 0.13), m);
      b.position.x = 0.42;
      arm.rotation.y = i * Math.PI * 2 / 3;
      arm.add(b);
      g.add(arm);
    }
    g.position.set(x, 3.0, z);
    this.scene.add(g);
    this.fans.push(g);
  }

  // Rain falling just outside the open front (a small box of streaks).
  #outsideRain() {
    const n = LOW ? 260 : 520;
    this.outDrops = Array.from({ length: n }, () => [(Math.random() - 0.5) * 14, Math.random() * 4, 5.3 + Math.random() * 2.5, 6 + Math.random() * 3]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.outRain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#bcc8ff', transparent: true, opacity: 0.5, depthWrite: false }));
    this.outRain.frustumCulled = false;
    this.scene.add(this.outRain);
  }

  // The 2D standee, used on phones and while the 3D cashier loads.
  #clerk(pos) {
    const look = { hair: '#1a1a1a', style: 'short', outfit: '#f4f4f4', legs: '#2b2f3a', acc: ['cap'] };
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

  // The cashier, the tea maker, and a customer: the anime model recoloured.
  async #spawnPeople() {
    try {
      const cashier = await loadVrmHeroine();
      if (this.disposed) return;
      cashier.tint({ hair: '#141414', top: '#f2f2f2', bottoms: '#2b2f3a' });
      cashier.setUmbrella(false);
      cashier.placeAt(new THREE.Vector3(5.45, 0, 1.7), new THREE.Euler(0, -Math.PI / 2, 0));
      this.scene.add(cashier.root);
      this.clerk = cashier;
      if (this.clerkMesh) this.clerkMesh.visible = false;
      this.onSay?.('Masuk, masuk! Duduk mana-mana.', 'MAH-sook, DOO-dook mah-nah MAH-nah', 'Come in, come in! Sit anywhere.');
      this.sound.chime();

      if (CROWD < 2) return;
      const customer = await loadVrmHeroine();
      if (this.disposed) return;
      customer.tint({ hair: '#2a1a12', top: '#7cb342', bottoms: '#5d4037' });
      this.scene.add(customer.root);
      this.shoppers.push(new Shopper(customer, 'A', GRAPH));

      if (CROWD < 3) return;
      const tea = await loadVrmHeroine();
      if (this.disposed) return;
      tea.tint({ hair: '#1e1e1e', top: '#e07a3a', bottoms: '#2b2f3a' });
      tea.setUmbrella(false);
      tea.placeAt(new THREE.Vector3(1.6, 0, -4.68), new THREE.Euler(0, 0, 0));
      this.scene.add(tea.root);
      this.teaMaker = tea;
    } catch (e) {
      console.warn('[mamak] extra people failed to load', e);
    }
  }

  // ── Hooks ────────────────────────────────────────────────────────────────
  constrain(next) {
    const r = 0.28;
    const open = Math.abs(next.x) < OPEN;
    if (next.x < ROOM.x0 || next.x > ROOM.x1 || next.z < ROOM.z0 || next.z > (open ? 5.4 : ROOM.z1)) return null;
    for (const [x0, x1, z0, z1] of SOLIDS) {
      if (next.x > x0 - r && next.x < x1 + r && next.z > z0 - r && next.z < z1 + r) return null;
    }
    for (const [x, z] of TABLES) if (Math.hypot(next.x - x, next.z - z) < 1.15) return null;
    for (const sh of this.shoppers) {
      if (Math.hypot(next.x - sh.hero.root.position.x, next.z - sh.hero.root.position.z) < 0.55) return null;
    }
    return next;
  }

  clampCamera(v) {
    v.x = Math.min(Math.max(v.x, -5.7), 5.7);
    v.z = Math.min(Math.max(v.z, -4.7), 6.2);
    v.y = Math.min(v.y, 3.1);
  }

  update(dt, t, hero) {
    let best = null, bestD = 1.25;
    for (const z of MAMAK_ZONES) {
      const d = Math.hypot(hero.position.x - z.pos[0], hero.position.z - z.pos[1]);
      if (d < bestD) { bestD = d; best = z; }
    }
    if (best !== this.zone) {
      this.zone = best;
      this.onZone?.(best);
      if (best?.type === 'till') {
        this.clerk?.bow();
        this.onSay?.('Ya, adik. Nak bayar?', 'yah, AH-dik. nak BAH-yar?', 'Yes, little one. Ready to pay?');
      }
    }
    this.clerk?.update(dt, 0);
    this.teaMaker?.update(dt, 0);
    const others = [hero.position, ...this.shoppers.map((s) => s.hero.root.position)];
    for (const sh of this.shoppers) sh.update(dt, others);
    if (this.clerkMesh) this.clerkMesh.position.y = 0.95 + Math.sin(t * 2) * 0.01;

    // Teh tarik: the top mug rises and falls, the tea stream stretches.
    const lift = 0.45 + Math.sin(t * 2.4) * 0.25;
    this.mugHigh.position.y = 1.04 + lift;
    this.stream.scale.y = Math.max(lift - 0.12, 0.01);
    this.stream.position.set(1.6, 1.04 + 0.08 + (lift - 0.12) / 2, -3.95);
    for (const f of this.fans) f.rotation.y += dt * 6;
    this.griddle.material.emissiveIntensity = 0.25 + Math.sin(t * 3) * 0.06;
    this.griddleGlow.intensity = 3 + Math.sin(t * 3) * 0.4;

    // Rain outside the open front
    const arr = this.outRain.geometry.attributes.position.array;
    this.outDrops.forEach((d, i) => {
      d[1] -= d[3] * dt;
      if (d[1] < 0) d[1] = 4;
      arr.set([d[0], d[1], d[2], d[0] - 0.02, d[1] + 0.3, d[2]], i * 6);
    });
    this.outRain.geometry.attributes.position.needsUpdate = true;

    if (!this.left && hero.position.z > 5.1) {
      this.left = true;
      this.frozen = true;
      this.onExit?.();
    }
  }
}
