// A walkable rainy evening on Jalan Budi, Kuala Lumpur: a row of old
// shophouses with a covered five-foot way, an open drain, motorbikes,
// sodium street lamps, the twin towers over the rooftops, and a mamak
// that leads to the counter game. Malay signs make up the word hunt.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { World3D, LOW } from './base.js';
import * as T from './textures.js';

const BOUNDS = { x0: -21, x1: 21, z0: -5.7, z1: 8.6 };
const ARCADE = { front: -3.4, back: -6, roof: 3.2 };   // the five-foot way
const DOOR = { x: 0, half: 2.4 };                      // the mamak's open front
const UNIT = 6.6;
const COLUMNS = [-16.5, -9.9, -3.3, 3.3, 9.9, 16.5].map((x) => [x, -3.65]);
const TABLES = [[-2.1, -4.7], [2.1, -4.7], [-2.2, -1.9]];
const BIKES = [[-7.6, -2.3], [-6.6, -2.3], [5.6, -2.3], [14.6, -2.3]];

export const KL_READABLES = [
  { id: 'budimaju', pos: [0, 3.75, -3.3], jp: 'Restoran Budi Maju', romaji: 'res-to-RAN BOO-dee MAH-joo', en: 'Budi Maju Restaurant', note: 'Budi = kindness, maju = moving forward. So many mamak shops are called "Maju" that it is almost a joke!' },
  { id: 'selamat', pos: [0, 2.6, -5.9], jp: 'Selamat Datang', romaji: 'se-LAH-mat DAH-tang', en: 'Welcome', note: 'Selamat = safe, datang = arrive: "safely arrived". Selamat pagi is good morning, selamat malam good night.' },
  { id: 'kakilima', pos: [-5, 2.2, -4.7], jp: 'kaki lima', romaji: 'KAH-kee LEE-mah', en: 'five-foot way', note: 'Literally "five feet". Since the 1800s shophouses here must leave a covered walkway this wide, so you can walk the whole street without getting wet.' },
  { id: 'tehtarik', pos: [3.0, 2.0, -5.9], jp: 'Teh Tarik', romaji: 'tay TAH-rick', en: 'pulled tea', note: 'Tarik = pull. The tea is poured between two mugs from high up, again and again, until it is foamy.' },
  { id: 'farmasi', pos: [-6.6, 3.75, -3.3], jp: 'Farmasi', romaji: 'far-MAH-see', en: 'pharmacy', note: 'Malay spells borrowed words the way they sound: "ph" becomes f. Teksi, bas, polis, sekolah too.' },
  { id: 'kopitiam', pos: [-13.2, 3.75, -3.3], jp: 'Kedai Kopi', romaji: 'ke-DIE KO-pee', en: 'coffee shop', note: 'Also called a kopitiam: Malay "kopi" + Hokkien "tiam" (shop). One word, two languages, which is very Malaysian.' },
  { id: 'dobi', pos: [-19.8, 3.75, -3.3], jp: 'Dobi', romaji: 'DOH-bee', en: 'laundry', note: 'From the Hindi "dhobi", a washerman. Malay has borrowed from Sanskrit, Arabic, Tamil, Chinese, Portuguese and English.' },
  { id: 'emas', pos: [6.6, 3.75, -3.3], jp: 'Kedai Emas', romaji: 'ke-DIE eh-MAS', en: 'gold shop', note: 'Emas = gold. Kedai = shop: kedai runcit, kedai kopi, kedai emas.' },
  { id: 'gunting', pos: [13.2, 3.75, -3.3], jp: 'Gunting Rambut', romaji: 'GOON-ting RAM-boot', en: 'barber', note: 'Literally "scissors hair". Gunting is scissors, and also the verb "to cut".' },
  { id: 'jahit', pos: [19.8, 3.75, -3.3], jp: 'Tukang Jahit', romaji: 'TOO-kang JAH-hit', en: 'tailor', note: 'Tukang = a skilled worker. Tukang masak = cook, tukang kayu = carpenter, tukang jahit = "sewing worker".' },
  { id: 'awas', pos: [-1.6, 1.0, -3.9], jp: 'Awas! Lantai Licin', romaji: 'AH-was, LUN-tie LEE-chin', en: 'Careful! Slippery floor', note: 'You need this sign every afternoon in the rainy season. Awas = watch out, licin = slippery.' },
  { id: 'merokok', pos: [8.7, 2.2, -5.9], jp: 'Dilarang Merokok', romaji: 'dee-LAH-rang me-RO-kok', en: 'No smoking', note: 'di- makes a passive: larang = forbid, dilarang = is forbidden. Merokok = smoking, from rokok (cigarette).' },
  { id: 'longkang', pos: [-11, 0.6, -3.1], jp: 'longkang', romaji: 'LONG-kang', en: 'monsoon drain', note: 'Deep open drains carry away tropical downpours. Watch your step!' },
  { id: 'motosikal', pos: [-7.1, 1.3, -2.3], jp: 'motosikal', romaji: 'mo-to-SEE-kal', en: 'motorbike', note: 'English "motorcycle" spelt the Malay way. Small kapcai bikes are everywhere, rain or shine.' },
  { id: 'hentian', pos: [8, 2.6, 7.6], jp: 'Hentian Bas', romaji: 'hen-TEE-an bas', en: 'bus stop', note: 'Henti = stop, + -an makes a noun: hentian = "stopping place".' },
  { id: 'jalan', pos: [-14.5, 2.9, -2.6], jp: 'Jalan Budi', romaji: 'JAH-lan BOO-dee', en: 'Budi Road', note: 'Jalan = road, and also "to walk". Jalan-jalan (say it twice) means going for a stroll.' },
];

// One shophouse unit: wall colour, shutter colour, signboard, ground floor.
const UNITS = [
  { x: -19.8, wall: '#9fd3c7', shutter: '#3d6b5c', sign: 'DOBI', sub: 'Dobi Layan Diri · 洗衣', bg: '#1d4ed8', fg: '#fff', front: 'lit' },
  { x: -13.2, wall: '#f2d7a0', shutter: '#7a4f2b', sign: 'KEDAI KOPI HENG', sub: '興記茶室 · Kopitiam', bg: '#fbf3df', fg: '#a4161a', front: 'kopitiam' },
  { x: -6.6, wall: '#e8b4b8', shutter: '#5a3d5c', sign: 'FARMASI', sub: 'Ubat-ubatan · Pharmacy', bg: '#0f9d58', fg: '#fff', front: 'lit' },
  { x: 0, wall: '#f7e7a1', shutter: '#2f6f7a', sign: 'RESTORAN BUDI MAJU', sub: 'Mamak · Kedai Runcit · 24 Jam', bg: '#c8102e', fg: '#ffd400', front: 'mamak' },
  { x: 6.6, wall: '#c3d5ef', shutter: '#38507a', sign: 'KEDAI EMAS', sub: '金铺 · Gold & Jewellery', bg: '#7a0010', fg: '#ffd700', front: 'shutter' },
  { x: 13.2, wall: '#d7c8ef', shutter: '#4c3d73', sign: 'GUNTING RAMBUT', sub: 'Barber · RM12', bg: '#ffffff', fg: '#1d3a8a', front: 'barber' },
  { x: 19.8, wall: '#f4c095', shutter: '#7a4a2b', sign: 'TUKANG JAHIT', sub: 'Baju Melayu · Kebaya', bg: '#2b2d42', fg: '#f4d35e', front: 'lit' },
];

export class KLStreetWorld extends World3D {
  constructor(container, { sound, onEnter, onDiscover, found = new Set(), spawn = 'start' }) {
    super(container, {
      sound, onDiscover, found, readables: KL_READABLES,
      background: '#151431', fog: ['#1b1a36', 0.03], bloom: [0.45, 0.5, 0.88], exposure: 1.0,
      cam: { yaw: spawn === 'door' ? 0.35 : Math.PI / 2 - 0.42, pitch: 1.8, dist: 5.0 },
    });
    this.onEnter = onEnter;
    this.entered = false;
    this.#buildWorld();
    this.addRain({ count: LOW ? 1300 : 2800, color: '#c9b9ff', groundAt: (z) => (z < ARCADE.front ? 0.1 : z > 7 ? 0.14 : 0.02) });
    if (spawn === 'door') this.spawnHero(new THREE.Vector3(0, 0, -5.1), 0, { umbrella: false });
    else this.spawnHero(new THREE.Vector3(11.5, 0, -0.6), -Math.PI / 2);
    this.underRoof = spawn === 'door';
  }

  #buildWorld() {
    const S = this.scene;
    S.add(new THREE.AmbientLight('#4a3f78', 0.85));
    S.add(new THREE.HemisphereLight('#6a5aa8', '#120e1c', 0.75));
    const moon = new THREE.DirectionalLight('#a99cff', 0.45);
    moon.position.set(10, 20, 12);
    S.add(moon);

    // Wet road: mirror under semi-transparent asphalt.
    const mirror = new Reflector(new THREE.PlaneGeometry(80, 30), {
      textureWidth: LOW ? 512 : 1024, textureHeight: LOW ? 512 : 1024, color: '#8a8094',
    });
    mirror.rotation.x = -Math.PI / 2;
    mirror.position.set(0, 0, 3);
    S.add(mirror);
    this.disposables.push(mirror);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(80, 10), new THREE.MeshBasicMaterial({ map: T.asphaltTex(), transparent: true, depthWrite: false }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.004, 2.2);
    S.add(road);
    const paint = new THREE.MeshBasicMaterial({ color: '#f1e9c8', transparent: true, opacity: 0.85 });
    for (let x = -38; x < 38; x += 4) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.14), paint);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.01, 2.6);
      S.add(m);
    }
    // Yellow kerb line (no parking)
    const kerbLine = new THREE.Mesh(new THREE.PlaneGeometry(80, 0.1), new THREE.MeshBasicMaterial({ color: '#f2c14e' }));
    kerbLine.rotation.x = -Math.PI / 2;
    kerbLine.position.set(0, 0.011, -2.6);
    S.add(kerbLine);

    // Five-foot way: Peranakan tiles, a step down to the drain.
    const tiles = new THREE.Mesh(new THREE.PlaneGeometry(80, 2.6), new THREE.MeshStandardMaterial({ map: T.peranakanTileTex(), roughness: 0.25, metalness: 0.1 }));
    tiles.rotation.x = -Math.PI / 2;
    tiles.position.set(0, 0.1, -4.7);
    S.add(tiles);
    this.box(80, 0.2, 0.18, '#9a9488', [0, 0, -3.36]);
    // Longkang: open drain with a grille
    this.box(80, 0.05, 0.62, '#07090e', [0, -0.02, -3.0]);
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(80, 0.6), new THREE.MeshStandardMaterial({ map: T.grilleTex(), roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.85 }));
    grille.rotation.x = -Math.PI / 2;
    grille.position.set(0, 0.012, -3.0);
    S.add(grille);
    this.box(80, 0.12, 0.08, '#8a8478', [0, 0.04, -2.68]);

    // ── The shophouse row ──
    // Upper floors overhang the five-foot way; columns hold them up.
    for (const u of UNITS) this.#unit(u);
    this.box(80, 0.22, 3.0, '#d9cdb4', [0, ARCADE.roof + 0.11, -4.7]);   // arcade ceiling
    const colMat = new THREE.MeshStandardMaterial({ color: '#efe4cc', roughness: 0.6 });
    for (const [x, z] of COLUMNS) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.42, ARCADE.roof, 0.42), colMat);
      c.position.set(x, ARCADE.roof / 2, z);
      S.add(c);
    }
    // Arched openings between the columns
    const arch = T.archTex();
    for (const u of UNITS) {
      const a = new THREE.Mesh(new THREE.PlaneGeometry(UNIT, 1.4), new THREE.MeshStandardMaterial({ map: arch, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 }));
      a.position.set(u.x, ARCADE.roof - 0.6, -3.42);
      S.add(a);
    }
    // Fluorescent tubes under the arcade
    const tube = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f4fbff', emissiveIntensity: 2.2 });
    for (const u of UNITS) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.08), tube);
      m.position.set(u.x, ARCADE.roof - 0.04, -4.9);
      S.add(m);
    }
    for (const x of LOW ? [-9.9, 0, 9.9] : [-16.5, -6.6, 0, 6.6, 16.5]) {
      const l = new THREE.PointLight(x === 0 ? '#fff4dc' : '#e8f1ff', x === 0 ? 9 : 5, 8, 1.6);
      l.position.set(x, 2.8, -4.6);
      S.add(l);
    }
    // Light pouring out of the mamak onto the wet road
    const spill = new THREE.PointLight('#ffe2b0', LOW ? 7 : 10, 11, 1.6);
    spill.position.set(0, 2.2, -2.5);
    S.add(spill);

    // Mamak furniture spilling onto the five-foot way (and the road edge)
    for (const [x, z] of TABLES) this.#table(x, z);
    this.box(1.0, 1.25, 0.6, '#c0c6cf', [3.0, 0.72, -5.55]);   // teh tarik stall
    this.panel(T.menuBoardTex([['Teh Tarik', '2.20'], ['Roti Canai', '1.50'], ['Milo Ais', '3.00'], ['Nasi Lemak', '3.50'], ['Mee Goreng', '6.00']]), 0.9, 1.12, [3.0, 2.0, -5.94], { glow: 0.7 });
    this.box(0.36, 0.5, 0.36, '#ffd400', [-1.6, 0.35, -3.9]);   // wet floor cone
    this.panel(T.signTex('AWAS!', { bg: '#ffd400', fg: '#111', sub: 'LANTAI LICIN', w: 256, h: 200, size: 70 }), 0.36, 0.28, [-1.6, 0.5, -3.71], { glow: 0.6 });
    this.panel(T.signTex('SELAMAT DATANG', { bg: '#0b6e4f', fg: '#fff', w: 512, h: 96, size: 48 }), 2.6, 0.48, [0, 2.6, -5.98], { glow: 1.0 });
    this.panel(T.signTex('🚭', { bg: '#fff', fg: '#c00', sub: 'DILARANG MEROKOK', w: 256, h: 256, size: 120 }), 0.5, 0.5, [8.7, 2.2, -5.96], { glow: 0.6 });

    // Motorbikes by the kerb
    for (const [x, z] of BIKES) this.#bike(x, z);

    // Sodium street lamps on the kerb
    for (const x of [-14.5, 12.2]) this.#lamp(x);
    this.panel(T.signTex('JALAN BUDI', { bg: '#1e40af', fg: '#fff', w: 512, h: 128, size: 72, border: '#fff' }), 1.3, 0.32, [-14.5, 2.9, -2.52], { glow: 0.8 });

    // Across the road: another row of shophouses, a bus stop
    this.box(70, 8.6, 2, '#2c2440', [0, 4.3, 12.5]);
    const far = this.panel(T.shophouseTex('#6a5a7a', '#3a2f48', 7), 70, 4.6, [0, 5.9, 11.48], { glow: 0.35, rotY: Math.PI });
    far.material.map.wrapS = THREE.RepeatWrapping;
    far.material.map.repeat.set(11, 1);
    const farShops = this.panel(T.shopWindowTex(77), 70, 2.8, [0, 1.6, 11.48], { glow: 0.6, rotY: Math.PI });
    farShops.material.map.wrapS = THREE.RepeatWrapping;
    farShops.material.map.repeat.set(7, 1);
    const farWalk = new THREE.Mesh(new THREE.PlaneGeometry(80, 4.5), new THREE.MeshStandardMaterial({ map: T.sidewalkTex(), transparent: true, opacity: 0.8, roughness: 0.35, depthWrite: false }));
    farWalk.rotation.x = -Math.PI / 2;
    farWalk.position.set(0, 0.14, 9.3);
    S.add(farWalk);
    this.box(80, 0.16, 0.22, '#8a90a4', [0, 0.07, 7.05]);
    this.#busStop(8, 8.3);

    // The twin towers glowing above the rooftops (unaffected by fog)
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshBasicMaterial({ map: T.skylineTex(), transparent: true, fog: false, depthWrite: false }));
    sky.position.set(18, 26, -70);
    sky.renderOrder = -1;
    S.add(sky);
  }

  #unit(u) {
    const S = this.scene;
    const back = ARCADE.back;
    // Upper floors: a box from the arcade roof to the parapet
    this.box(UNIT - 0.04, 5.0, 6.6, u.wall, [u.x, ARCADE.roof + 2.5, -6.7]);
    this.panel(T.shophouseTex(u.wall, u.shutter, Math.round(u.x)), UNIT - 0.04, 3.6, [u.x, 6.1, -3.39], { glow: 0.42 });
    this.box(UNIT, 0.3, 0.3, '#f6efe0', [u.x, 8.0, -3.45]);   // cornice
    // Signboard above the arches
    const sign = this.panel(T.signTex(u.sign, { bg: u.bg, fg: u.fg, sub: u.sub, w: 1024, h: 180, size: 92 }), UNIT - 0.5, 0.95, [u.x, 3.75, -3.36], { glow: 1.0 });
    sign.userData.sign = u.sign;
    // Ground floor back wall
    if (u.front === 'mamak') {
      // Open shopfront: side walls only, a bright room seen behind
      for (const dx of [-2.95, 2.95]) this.box(0.7, ARCADE.roof, 0.3, u.wall, [u.x + dx, ARCADE.roof / 2, back - 0.15]);
      this.box(UNIT, 0.6, 0.3, u.wall, [u.x, ARCADE.roof - 0.3, back - 0.15]);
      this.panel(T.shopWindowTex(41, { posters: [
        { text: 'ROTI CANAI', bg: '#c8102e', fg: '#ffd400', x: 40, y: 18, w: 300, h: 70, size: 44 },
        { text: 'NASI LEMAK', bg: '#0b6e4f', fg: '#fff', x: 660, y: 18, w: 320, h: 70, size: 44 },
      ] }), 4.8, 2.6, [u.x, 1.45, back - 0.4], { glow: 0.9 });
      this.box(4.9, 0.2, 0.9, '#3a3a3a', [u.x, 2.95, back - 0.5]);
      // Rolled-up shutter
      this.box(4.9, 0.3, 0.3, '#8d939c', [u.x, 2.95, back + 0.05]);
      this.#fan(u.x - 1.2, -4.7);
      this.#fan(u.x + 1.2, -4.7);
      return;
    }
    this.box(UNIT, ARCADE.roof, 0.3, u.wall, [u.x, ARCADE.roof / 2, back - 0.15]);
    if (u.front === 'shutter') {
      this.panel(T.shutterTex(), 4.9, 2.9, [u.x, 1.45, back + 0.01], { glow: 0.12 });
    } else if (u.front === 'barber') {
      this.panel(T.shopWindowTex(19), 4.4, 2.4, [u.x + 0.4, 1.5, back + 0.01], { glow: 0.65 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 16), new THREE.MeshStandardMaterial({ map: T.barberPoleTex(), emissive: '#ffffff', emissiveMap: T.barberPoleTex(), emissiveIntensity: 0.9 }));
      pole.position.set(u.x - 2.6, 1.7, back + 0.2);
      S.add(pole);
      this.barberPole = pole;
    } else if (u.front === 'kopitiam') {
      this.panel(T.shopWindowTex(5, { posters: [{ text: 'KOPI-O', bg: '#4a2c1a', fg: '#ffe8c2', x: 360, y: 18, w: 300, h: 70, size: 46 }] }), 4.6, 2.5, [u.x, 1.45, back + 0.01], { glow: 0.55 });
      this.#table(u.x - 1.5, -4.6);
    } else {
      this.panel(T.shopWindowTex(Math.abs(Math.round(u.x * 3)) + 2), 4.6, 2.5, [u.x, 1.45, back + 0.01], { glow: 0.7 });
    }
  }

  // Round steel table with plastic stools: the mamak classic.
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
    const colours = ['#d62828', '#1d4ed8', '#d62828', '#1d4ed8'];
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.45, 12), new THREE.MeshStandardMaterial({ color: colours[i], roughness: 0.5 }));
      stool.position.set(Math.cos(a) * 0.72, 0.23 + 0.1, Math.sin(a) * 0.72);
      g.add(stool);
    }
    g.position.set(x, z > ARCADE.front ? 0 : 0.1, z);
    this.scene.add(g);
  }

  #fan(x, z) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: '#e6e1d6', roughness: 0.5 });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 10), m));
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.012, 0.12), m);
      b.position.x = 0.38;
      const arm = new THREE.Group();
      arm.rotation.y = i * Math.PI * 2 / 3;
      arm.add(b);
      g.add(arm);
    }
    g.position.set(x, ARCADE.roof - 0.25, z);
    this.scene.add(g);
    (this.fans ??= []).push(g);
  }

  #bike(x, z) {
    const g = new THREE.Group();
    const tyre = new THREE.MeshStandardMaterial({ color: '#15161a', roughness: 0.8 });
    for (const dx of [-0.55, 0.55]) {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 8, 18), tyre);
      w.position.set(dx, 0.3, 0);
      g.add(w);
    }
    const col = ['#d62828', '#1d4ed8', '#f4f4f4', '#2a9d8f'][Math.abs(Math.round(x)) % 4];
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.4 }));
    body.position.set(0, 0.55, 0);
    g.add(body);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.26), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.6 }));
    seat.position.set(-0.15, 0.74, 0);
    g.add(seat);
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.8, roughness: 0.3 }));
    fork.position.set(0.5, 0.65, 0);
    fork.rotation.z = 0.35;
    g.add(fork);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), fork.material);
    bar.position.set(0.38, 0.98, 0);
    bar.rotation.x = Math.PI / 2;
    g.add(bar);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffe9a8', emissiveIntensity: 0.6 }));
    light.position.set(0.56, 0.9, 0);
    g.add(light);
    g.position.set(x, 0, z);
    g.rotation.y = Math.PI / 2 + 0.25;
    this.scene.add(g);
  }

  #lamp(x) {
    this.pole(x, -2.45, 6.2);
    this.box(0.07, 0.07, 1.6, '#9aa3b5', [x, 6.15, -1.7]);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.45), new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb347', emissiveIntensity: 2.6 }));
    head.position.set(x, 6.08, -0.95);
    this.scene.add(head);
    const l = new THREE.PointLight('#ffb35c', LOW ? 16 : 22, 17, 1.5);
    l.position.set(x, 5.8, -0.95);
    this.scene.add(l);
  }

  #busStop(x, z) {
    for (const dx of [-1.4, 1.4]) this.box(0.08, 2.4, 0.08, '#7d8597', [x + dx, 1.32, z + 0.6]);
    this.box(3.2, 0.08, 1.5, '#3b82f6', [x, 2.52, z + 0.1], { opacity: 0.7 });
    this.box(2.6, 0.08, 0.4, '#9aa3b5', [x, 0.6, z + 0.6]);
    this.panel(T.signTex('HENTIAN BAS', { bg: '#1e40af', fg: '#fff', sub: 'BUS STOP', w: 512, h: 160, size: 64 }), 1.4, 0.44, [x, 2.85, z - 0.5], { glow: 0.85, rotY: 0 });
  }

  // ── Hooks ───────────────────────────────────────────────────────────────
  constrain(next) {
    const inDoor = Math.abs(next.x - DOOR.x) < DOOR.half;
    if (next.x < BOUNDS.x0 || next.x > BOUNDS.x1 || next.z > BOUNDS.z1) return null;
    if (next.z < (inDoor ? -6.4 : BOUNDS.z0)) return null;
    for (const [x, z] of COLUMNS) if (Math.abs(next.x - x) < 0.5 && Math.abs(next.z - z) < 0.5) return null;
    for (const [x, z] of TABLES) if (Math.hypot(next.x - x, next.z - z) < 1.05) return null;
    for (const [x, z] of BIKES) if (Math.abs(next.x - x) < 0.45 && Math.abs(next.z - z) < 0.75) return null;
    if (Math.abs(next.x - 3.0) < 0.75 && next.z < -5.0) return null;   // teh tarik stall
    if (Math.abs(next.x - 8) < 1.7 && Math.abs(next.z - 8.9) < 0.25) return null;   // bus stop bench
    return next;
  }

  clampCamera(p) {
    p.x = Math.min(Math.max(p.x, -24), 24);
    p.z = Math.min(p.z, 10.5);
    if (p.z < ARCADE.front + 0.2) { p.z = Math.max(p.z, ARCADE.back + 0.35); p.y = Math.min(p.y, ARCADE.roof - 0.3); }
  }

  update(dt, t, hero) {
    // Close the umbrella under the five-foot way, open it in the rain.
    const covered = hero.position.z < ARCADE.front - 0.15;
    if (covered !== this.underRoof) {
      this.underRoof = covered;
      this.hero.setUmbrella?.(!covered);
    }
    // Step into the mamak
    if (!this.entered && Math.abs(hero.position.x - DOOR.x) < DOOR.half && hero.position.z < -6.15) {
      this.entered = true;
      this.frozen = true;
      this.sound.chime();
      this.onEnter?.();
    }
    for (const f of this.fans ?? []) f.rotation.y += dt * 7;
    if (this.barberPole) this.barberPole.material.map.offset.y = this.barberPole.material.emissiveMap.offset.y = (t * 0.4) % 1;
    this.updateRain(dt, hero, (x, z) => z < ARCADE.front);
  }
}
