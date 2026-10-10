// The heroine as a real VRM anime avatar (pixiv sample, VRM Public License:
// avatar use by everyone, redistribution and modification allowed).
// Same interface as the placeholder Heroine: root, update(dt, speed) → footfall.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export const HEROINE_URL = 'assets/heroine.vrm';
export const HEROINE_CREDIT = 'Heroine: "VRM1_Constraint_Twist_Sample" © 2022 pixiv Inc., VRM Public License 1.0';

export async function loadVrmHeroine(onProgress) {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(HEROINE_URL, (e) => e.total && onProgress?.(e.loaded / e.total));
  const vrm = gltf.userData.vrm;
  VRMUtils.rotateVRM0(vrm);
  vrm.scene.traverse((o) => { o.frustumCulled = false; });
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

  // speed: 0 idle, ~2 walk, ~3.6 run. Returns true on each footfall.
  update(dt, speed) {
    this.speed += (speed - this.speed) * Math.min(dt * 8, 1);
    const s = this.speed;
    const prev = Math.sin(this.phase);
    this.phase += dt * (s > 0.1 ? 4 + s * 1.6 : 0);
    const sw = Math.sin(this.phase);
    const amp = Math.min(s / 2.2, 1.3);
    const t = performance.now() / 1000;
    const B = this.bone;

    // Legs
    B('leftUpperLeg').rotation.x = -sw * 0.5 * amp;
    B('rightUpperLeg').rotation.x = sw * 0.5 * amp;
    B('leftLowerLeg').rotation.x = Math.max(0, sw) * 0.75 * amp;
    B('rightLowerLeg').rotation.x = Math.max(0, -sw) * 0.75 * amp;
    // Body: bob, slight lean when running, idle breathing
    B('hips').position.y = this.hipsY + Math.abs(Math.cos(this.phase)) * 0.025 * Math.min(s, 1.5) + (s < 0.1 ? Math.sin(t * 2) * 0.004 : 0);
    B('spine').rotation.x = s * 0.04 + Math.sin(t * 2) * 0.01;
    B('spine').rotation.y = sw * 0.08 * amp;
    B('neck').rotation.y = -sw * 0.05 * amp;
    // Left arm relaxed at her side, swinging; right arm holds the umbrella in front.
    B('leftUpperArm').rotation.set(sw * 0.35 * amp, 0, -1.2);
    B('leftLowerArm').rotation.set(0, 0.25 + Math.max(0, -sw) * 0.25 * amp, 0);
    B('rightUpperArm').rotation.set(0, 0.55, 1.12);
    B('rightLowerArm').rotation.set(0, 1.75, 0);
    B('rightHand').rotation.set(0, 0, -0.3);

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

    return s > 0.3 && Math.sign(prev) !== Math.sign(sw);
  }
}
