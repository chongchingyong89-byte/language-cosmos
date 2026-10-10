// The heroine as a real VRM anime avatar (pixiv sample, VRM Public License:
// avatar use by everyone, redistribution and modification allowed).
// Same interface as the placeholder Heroine: root, update(dt, speed) → footfall.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export const HEROINE_URL = 'assets/heroine.vrm';
export const HEROINE_CREDIT = 'Heroine: "VRM1_Constraint_Twist_Sample" © 2022 pixiv Inc., VRM Public License 1.0';

// The scene's camera, so ink outlines can stay ~1.3 px wide at any distance
// (the model's own 0.8 mm outline turns into broken dots on phone screens).
const view = { camera: null, px: 1000 };
export function setOutlineView(camera, pxHeight) { view.camera = camera; view.px = pxHeight; }
const _head = new THREE.Vector3();

// One heroine for the whole session, carried between the street and the shop.
let shared = null;
export function getHeroine(onProgress) {
  shared ??= loadVrmHeroine(onProgress);
  return shared;
}

// The file is read once (THREE.Cache keeps the bytes); every extra person
// (clerk, shoppers) also reuses the first model's textures on the GPU, so a
// shop full of people costs little more memory than the heroine alone.
THREE.Cache.enabled = true;
let textureSource = null;

export async function loadVrmHeroine(onProgress) {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(HEROINE_URL, (e) => e.total && onProgress?.(e.loaded / e.total));
  const vrm = gltf.userData.vrm;
  VRMUtils.rotateVRM0(vrm);
  const mats = new Map();
  vrm.scene.traverse((o) => {
    o.frustumCulled = false;
    for (const m of [o.material].flat()) {
      if (!m) continue;
      // Ink outlines show through the hair strands as dark streaks: drop them on hair only.
      if (/hair/i.test(m.name ?? '') && 'outlineWidthFactor' in m) m.outlineWidthFactor = 0;
      mats.set(`${m.name}|${m.isOutline ? 1 : 0}`, m);
    }
  });
  if (!textureSource) textureSource = mats;
  else shareTextures(mats, textureSource);
  const heroine = new VrmHeroine(vrm);
  heroine.settle();
  return heroine;
}

function shareTextures(mats, source) {
  for (const [key, m] of mats) {
    const src = source.get(key);
    if (!src) continue;
    // MToon keeps its textures in shader uniforms; standard materials as properties.
    const slots = m.uniforms
      ? Object.keys(m.uniforms).map((k) => [m.uniforms[k], src.uniforms?.[k], 'value'])
      : Object.keys(m).map((k) => [m, src, k]);
    for (const [own, theirs, prop] of slots) {
      const t = own?.[prop], u = theirs?.[prop];
      if (!t?.isTexture || !u?.isTexture || t === u) continue;
      t.dispose();
      own[prop] = u;
    }
  }
}

export class VrmHeroine {
  constructor(vrm) {
    this.vrm = vrm;
    this.root = new THREE.Group();
    this.root.add(vrm.scene);
    this.bone = (name) => vrm.humanoid.getNormalizedBoneNode(name);
    this.phase = 0;
    this.speed = 0;
    this.blinkAt = 1.5;
    this.smileT = 0;
    this.#buildUmbrella();
    this.#buildShadow();
    this.handPos = new THREE.Vector3();
    this.hipsY = this.bone('hips').position.y;
    this.outlines = [];
    vrm.scene.traverse((o) => {
      for (const m of [o.material].flat()) if (m && m.outlineWidthFactor > 0) this.outlines.push(m);
    });
    this.#setupHair();
  }

  // Hair physics. Simulating in her own space (center = root) stops the hair
  // being "left behind" when she moves, which lifted the crown off her head.
  // Instead a gentle wind, stronger towards the tips, streams it back as she
  // runs, and the joints at the scalp are stiffened so the top stays put.
  #setupHair() {
    this.hair = [];
    const mgr = this.vrm.springBoneManager;
    if (!mgr) return;
    for (const j of mgr.joints) {
      j.center = this.root;
      const m = j.bone.name.match(/Hair(\d)_/);
      if (!m) continue;
      const depth = +m[1];
      if (depth === 1) { j.settings.stiffness *= 5; j.settings.dragForce = Math.max(j.settings.dragForce, 0.6); }
      else if (depth === 2) j.settings.stiffness *= 2;
      this.hair.push({ j, k: Math.min(1, (depth - 1) / 3), pow: j.settings.gravityPower, dir: j.settings.gravityDir.clone() });
    }
    mgr.reset();
  }

  #hairWind(speed) {
    const ry = this.root.rotation.y;
    const wind = speed * 0.11;
    const g = this._g ??= new THREE.Vector3();
    for (const h of this.hair) {
      g.copy(h.dir).multiplyScalar(h.pow);
      g.x -= Math.sin(ry) * wind * h.k;
      g.z -= Math.cos(ry) * wind * h.k;
      g.y -= 0.04 * h.k * Math.min(speed, 1);
      const p = g.length();
      h.j.settings.gravityPower = p;
      if (p > 1e-5) h.j.settings.gravityDir.copy(g).divideScalar(p);
    }
  }

  #fitOutline() {
    const cam = view.camera;
    if (!cam || !this.outlines.length) return;
    this.root.getWorldPosition(_head);
    _head.y += 1.3;
    const d = cam.position.distanceTo(_head);
    const perPx = (2 * d * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)) / view.px;
    const w = Math.min(Math.max(perPx * 1.3, 0.0008), 0.012);
    if (Math.abs(w - (this.outlineW ?? 0)) < w * 0.05) return;
    this.outlineW = w;
    for (const m of this.outlines) m.outlineWidthFactor = w;
  }

  #buildUmbrella() {
    // Clear vinyl umbrella; follows the right hand but always stays upright.
    this.umbrella = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.95, 6), new THREE.MeshStandardMaterial({ color: '#d8e0ea', roughness: 0.3 }));
    handle.position.y = 0.47;
    this.umbrella.add(handle);
    const crook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12, Math.PI), handle.material);
    crook.rotation.z = Math.PI;
    crook.position.set(0.035, 0, 0);
    this.umbrella.add(crook);
    // Domed canopy (a spherical cap), with the vinyl sagging a little between
    // the 8 curved ribs and a gently scalloped rim, like a real clear umbrella.
    const R = 0.64, PHI = 0.9, RS = R / Math.sin(PHI), H = RS * (1 - Math.cos(PHI));
    const profile = [];
    for (let i = 0; i <= 12; i++) {
      const p = (i / 12) * PHI;
      profile.push(new THREE.Vector2(Math.max(RS * Math.sin(p), 0.001), RS * Math.cos(p) - RS));
    }
    const canopyGeo = new THREE.LatheGeometry(profile, 48);
    const P = canopyGeo.attributes.position;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const r = Math.hypot(x, z), a = Math.atan2(z, x);
      const sag = Math.abs(Math.sin(4 * a)) * (r / R) ** 2;   // 0 on a rib, 1 mid-panel at the rim
      const k = 1 - 0.05 * sag;
      P.setXYZ(i, x * k, y - 0.035 * sag, z * k);
    }
    canopyGeo.computeVertexNormals();
    const canopyGroup = new THREE.Group();
    canopyGroup.add(new THREE.Mesh(canopyGeo, new THREE.MeshPhysicalMaterial({
      color: '#eaf4ff', transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false,
    })));
    const ribMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 });
    const ribPts = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      for (let i = 0; i < profile.length - 1; i++) {
        for (const v of [profile[i], profile[i + 1]]) ribPts.push(new THREE.Vector3(Math.cos(a) * v.x, v.y, Math.sin(a) * v.x));
      }
    }
    canopyGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ribPts), ribMat));
    const rim = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2, sag = Math.abs(Math.sin(4 * a));
      rim.push(new THREE.Vector3(Math.cos(a) * R * (1 - 0.05 * sag), -H - 0.035 * sag, Math.sin(a) * R * (1 - 0.05 * sag)));
    }
    canopyGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rim), ribMat));
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.06, 6), handle.material);
    tip.position.y = 0.03;
    canopyGroup.add(tip);
    this.canopyLift = H - 0.12;   // the rim sits a little below the top of the shaft
    this.umbrella.add(canopyGroup);
    this.root.add(this.umbrella);
  }

  #buildShadow() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,0.55)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    s.rotation.x = -Math.PI / 2;
    s.position.y = 0.012;
    this.root.add(s);
  }

  smile(seconds = 1.6) { this.smileT = seconds; }

  // Recolour hair / top / bottoms (MToon colour multiplies the texture), so one
  // model can play several different people.
  tint({ hair, top, bottoms } = {}) {
    this.vrm.scene.traverse((o) => {
      for (const m of [o.material].flat()) {
        if (!m?.color) continue;
        const n = m.name ?? '';
        const c = /hair/i.test(n) ? hair : /tops/i.test(n) ? top : /bottoms/i.test(n) ? bottoms : null;
        if (!c) continue;
        m.color.set(c);
        m.shadeColorFactor?.set(c).multiplyScalar(0.7);
      }
    });
  }

  // お辞儀: a polite bow from the waist, ~1.4 s.
  bow() { this.bowT = 1.4; }

  #curl(side, amount) {
    const sign = side === 'left' ? -1 : 1;
    for (const finger of ['Index', 'Middle', 'Ring', 'Little']) {
      const spread = finger === 'Little' ? 1.15 : finger === 'Index' ? 0.85 : 1;
      this.bone(`${side}${finger}Proximal`)?.rotation.set(0, 0, sign * amount * spread);
      this.bone(`${side}${finger}Intermediate`)?.rotation.set(0, 0, sign * amount * 1.2 * spread);
      this.bone(`${side}${finger}Distal`)?.rotation.set(0, 0, sign * amount * 0.8 * spread);
    }
    this.bone(`${side}ThumbProximal`)?.rotation.set(0, sign * -amount * 0.4, 0);
  }

  // Umbrella open (outside, in the rain) or put away (inside the shop).
  setUmbrella(open) {
    this.umbrellaOpen = open;
    this.umbrella.visible = open;
  }

  // Run the pose + spring-bone physics for a second so sleeves and hair
  // fall naturally from the T-pose before she's shown.
  settle() {
    for (let i = 0; i < 90; i++) this.update(1 / 60, 0);
  }

  // Move her somewhere new without the hair "feeling" the teleport.
  placeAt(position, rotation) {
    this.root.position.copy(position);
    this.root.rotation.copy(rotation);
    this.root.updateMatrixWorld(true);
    this.vrm.springBoneManager?.reset();
    this.settle();
  }

  // A human gait cycle driven by one phase φ (left leg; right = φ + π).
  // Heel strike at φ = π/2, toe-off near φ = −π/2. Walk and run blend by speed.
  // speed in m/s: 0 idle, ~1.5 walk, ~3.3 run. Returns true on each footfall.
  update(dt, speed) {
    this.speed += (speed - this.speed) * Math.min(dt * 6, 1);
    const s = this.speed;
    const w = Math.min(s / 1.5, 1);                    // walk weight
    const r = Math.min(Math.max((s - 2.0) / 1.2, 0), 1); // run weight
    const stride = 1.45 + r * 0.95;                    // metres per full cycle
    const prevStep = Math.floor((this.phase - Math.PI / 2) / Math.PI);
    if (s > 0.05) this.phase += dt * (s / stride) * Math.PI * 2;
    const f = this.phase;
    const t = performance.now() / 1000;
    const B = this.bone;
    const pos = (x) => Math.max(0, x);

    const thigh = 0.38 * w + 0.1 * r;
    const kneeSwing = 0.9 * w + 0.6 * r;
    const leg = (side, ph) => {
      // Thigh: forward (−x) at heel strike, back at toe-off.
      B(`${side}UpperLeg`).rotation.set(-thigh * Math.sin(ph) - 0.05 * r, 0, 0);
      // Knee: big bend in early swing, small cushioning bend after heel strike.
      const swingBend = kneeSwing * pos(Math.cos(ph + 0.55)) ** 2;
      const loadBend = 0.18 * w * pos(Math.cos(ph - Math.PI / 2 - 0.45)) ** 8;
      B(`${side}LowerLeg`).rotation.set(swingBend + loadBend + 0.04 * w + 0.25 * r, 0, 0);
      // Foot: toe up at heel strike, push off with the toes before lifting.
      const pushOff = 0.35 * w * pos(-Math.sin(ph - 0.35)) ** 3;
      const heel = -0.22 * w * pos(Math.sin(ph)) ** 4;
      B(`${side}Foot`)?.rotation.set(pushOff + heel - swingBend * 0.25, 0, 0);
    };
    leg('left', f);
    leg('right', f + Math.PI);

    // Pelvis: dips at each heel strike, sways over the standing leg, twists.
    const hips = B('hips');
    hips.position.y = this.hipsY - (0.022 * w + 0.03 * r) * (1 - Math.cos(2 * f)) / 2 + (s < 0.05 ? Math.sin(t * 2) * 0.003 : 0);
    hips.position.x = -0.018 * w * Math.cos(f) + (s < 0.05 ? Math.sin(t * 0.7) * 0.008 : 0);
    const twist = (0.09 * w + 0.04 * r) * Math.sin(f);
    hips.rotation.set(0, -twist, 0.03 * w * Math.sin(2 * f));
    // Spine counter-twists; head stays level and looks where she's going.
    this.bowT = Math.max(0, (this.bowT ?? 0) - dt);
    const bowAngle = this.bowT > 0 ? Math.sin((1 - this.bowT / 1.4) * Math.PI) * 0.55 : 0;
    B('spine').rotation.set(0.03 * w + 0.16 * r + Math.sin(t * 2) * 0.008 + bowAngle, twist * 0.9, 0);
    B('chest')?.rotation.set(0.02 * r, twist * 0.4, 0);
    B('neck').rotation.set(-0.04 * r, -twist * 1.1, 0);
    B('head').rotation.set(-0.02 * r, 0, Math.sin(t * 0.9) * 0.015 * (1 - w));

    // Arms swing opposite to the legs; elbows bend more on the forward swing
    // (a lot more when running).
    // (Elbow bend axis is mirrored between arms: left bends forward with −y.)
    const swing = 0.28 * w + 0.12 * r;
    const elbow = 0.15 + 1.2 * r;
    B('leftUpperArm').rotation.set(swing * Math.sin(f), 0, -1.25 + 0.12 * r);
    B('leftLowerArm').rotation.set(0, -(elbow + 0.3 * w * pos(-Math.sin(f))), 0);
    B('leftHand')?.rotation.set(0, 0, 0.1);
    if (this.umbrellaOpen !== false) {
      B('rightUpperArm').rotation.set(0, 0.55, 1.12);
      B('rightLowerArm').rotation.set(0, 1.75, 0);
      B('rightHand').rotation.set(0, 0, -0.3);
    } else {
      B('rightUpperArm').rotation.set(-swing * Math.sin(f), 0, 1.25 - 0.12 * r);
      B('rightLowerArm').rotation.set(0, elbow + 0.3 * w * pos(Math.sin(f)), 0);
      B('rightHand').rotation.set(0, 0, -0.1);
    }

    // Fingers: relaxed curl, or a firm grip on the umbrella handle.
    // (Left fingers curl with −z, right with +z.)
    this.#curl('left', 0.45);
    this.#curl('right', this.umbrellaOpen !== false ? 1.15 : 0.45);

    // Face: blink every few seconds; smile when she finds a word.
    const em = this.vrm.expressionManager;
    if (em) {
      this.blinkAt -= dt;
      let blink = 0;
      if (this.blinkAt < 0.15) blink = Math.sin(Math.max(0, this.blinkAt) / 0.15 * Math.PI);
      if (this.blinkAt < 0) this.blinkAt = 2 + Math.random() * 3;
      this.smileT = Math.max(0, this.smileT - dt);
      em.setValue('happy', Math.min(1, this.smileT * 2));
      em.setValue('blink', this.smileT > 0 ? 0 : blink);
    }

    this.#hairWind(s);
    this.#fitOutline();
    this.vrm.update(dt); // also runs hair/skirt spring bones

    // Umbrella: shaft from her hand to a point above her head, so the canopy
    // always covers her; it leans forward a little when she runs.
    const hand = this.vrm.humanoid.getRawBoneNode('rightHand') ?? B('rightHand');
    const head = this.vrm.humanoid.getRawBoneNode('head') ?? B('head');
    hand.getWorldPosition(this.handPos);
    this.root.worldToLocal(this.handPos);
    head.getWorldPosition(this.aim ??= new THREE.Vector3());
    this.root.worldToLocal(this.aim);
    this.aim.add(new THREE.Vector3(-0.12, 0.62, 0.06 + s * 0.05)); // just to her right of centre
    const dir = this.aim.clone().sub(this.handPos);
    const len = dir.length();
    this.umbrella.position.copy(this.handPos);
    this.umbrella.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    this.umbrella.children[0].scale.y = len / 0.95;
    this.umbrella.children[0].position.y = len / 2;
    this.umbrella.children[2].position.y = len + this.canopyLift;

    return s > 0.3 && Math.floor((this.phase - Math.PI / 2) / Math.PI) !== prevStep;
  }
}
