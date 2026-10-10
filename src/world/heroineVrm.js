// The heroine as a real VRM anime avatar (pixiv sample, VRM Public License:
// avatar use by everyone, redistribution and modification allowed).
// Same interface as the placeholder Heroine: root, update(dt, speed) → footfall.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export const HEROINE_URL = 'assets/heroine.vrm';
export const HEROINE_CREDIT = 'Heroine: "VRM1_Constraint_Twist_Sample" © 2022 pixiv Inc., VRM Public License 1.0';

// One heroine for the whole session, carried between the street and the shop.
let shared = null;
export function getHeroine(onProgress) {
  shared ??= loadVrmHeroine(onProgress);
  return shared;
}

export async function loadVrmHeroine(onProgress) {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(HEROINE_URL, (e) => e.total && onProgress?.(e.loaded / e.total));
  const vrm = gltf.userData.vrm;
  VRMUtils.rotateVRM0(vrm);
  vrm.scene.traverse((o) => {
    o.frustumCulled = false;
    // Ink outlines show through the hair strands as dark streaks: drop them on hair only.
    for (const m of [o.material].flat()) {
      if (m && /hair/i.test(m.name ?? '') && 'outlineWidthFactor' in m) m.outlineWidthFactor = 0;
    }
  });
  const heroine = new VrmHeroine(vrm);
  heroine.settle();
  return heroine;
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
    const canopyGeo = new THREE.ConeGeometry(0.62, 0.26, 8, 1, true);
    const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshPhysicalMaterial({
      color: '#eaf4ff', transparent: true, opacity: 0.25, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false,
    }));
    canopy.position.y = 0.98;
    this.umbrella.add(canopy);
    const ribs = new THREE.LineSegments(new THREE.EdgesGeometry(canopyGeo), new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }));
    ribs.position.copy(canopy.position);
    this.umbrella.add(ribs);
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
    this.umbrella.children[2].position.y = this.umbrella.children[3].position.y = len;

    return s > 0.3 && Math.floor((this.phase - Math.PI / 2) / Math.PI) !== prevStep;
  }
}
