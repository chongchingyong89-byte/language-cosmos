// Shared base for walkable 3D scenes (the street, the konbini interior):
// renderer + bloom, follow camera, keyboard / drag / joystick input,
// the heroine (placeholder first, then the shared VRM), readable signs.
// Subclasses build the scene and override the hooks at the bottom.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Heroine } from './heroine.js';
import { getHeroine } from './heroineVrm.js';

export const LOW = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 600;

export class World3D {
  constructor(container, {
    sound, onDiscover, found = new Set(), readables = [],
    background = '#0a1130', fog = null, bloom = [0.42, 0.45, 0.9], exposure = 0.95,
    cam = {},
  }) {
    this.container = container;
    this.sound = sound;
    this.onDiscover = onDiscover;
    this.found = found;
    this.readables = readables;
    this.keys = new Set();
    this.joy = { x: 0, y: 0 };
    this.cam = { dist: 5.2, yaw: 0, pitch: 2.0, height: 1.25, ...cam };
    this.yaw = this.cam.yaw;
    this.pitch = this.cam.pitch;
    this.frozen = false; // true while a dialogue is open
    this.clock = new THREE.Clock();
    this.disposables = [];

    const w = container.clientWidth, h = container.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW ? 1.25 : 1.75));
    this.renderer.setSize(w, h);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = exposure;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(background);
    if (fog) this.scene.fog = new THREE.FogExp2(fog[0], fog[1]);
    this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 200);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), ...bloom));
    this.composer.addPass(new OutputPass());

    this.onResize = () => {
      const W = container.clientWidth, H = container.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
      this.composer.setSize(W, H);
    };
    window.addEventListener('resize', this.onResize);
    this.#bindInput();
  }

  // ── Heroine ──────────────────────────────────────────────────────────────
  // Show the light placeholder at once; swap in the shared VRM when ready.
  spawnHero(position, rotY, { umbrella = true } = {}) {
    this.hero = new Heroine();
    this.hero.setUmbrella(umbrella);
    this.hero.root.position.copy(position);
    this.hero.root.rotation.y = rotY;
    this.scene.add(this.hero.root);
    getHeroine((p) => this.onAvatarProgress?.(p)).then((vrm) => {
      if (this.disposed) return;
      const old = this.hero.root;
      this.scene.remove(old);
      vrm.root.parent?.remove(vrm.root);
      this.scene.add(vrm.root);
      vrm.setUmbrella(umbrella);
      vrm.placeAt(old.position, old.rotation);
      this.hero = vrm;
      this.onAvatarProgress?.(1);
    }).catch((e) => {
      console.warn('[world] avatar failed to load, keeping placeholder', e);
      this.onAvatarProgress?.(1);
    });
  }

  // ── Building helpers ─────────────────────────────────────────────────────
  box(w, h, d, color, pos, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({
      color, roughness: opts.rough ?? 0.7, metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? '#000000', emissiveIntensity: opts.glow ?? 1,
      transparent: opts.opacity != null, opacity: opts.opacity ?? 1,
    }));
    m.position.set(...pos);
    if (opts.rotY) m.rotation.y = opts.rotY;
    this.scene.add(m);
    return m;
  }

  // Picture plane (signs, windows). glow > 1 blooms.
  panel(tex, w, h, pos, { glow = 1, rotY = 0, rotX = 0, transparent = false, basic = false } = {}) {
    const mat = basic
      ? new THREE.MeshBasicMaterial({ map: tex, transparent, depthWrite: !transparent })
      : new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: glow, roughness: 0.6, transparent, depthWrite: !transparent });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(...pos);
    m.rotation.set(rotX, rotY, 0);
    this.scene.add(m);
    return m;
  }

  pole(x, z, h) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, h, 8), new THREE.MeshStandardMaterial({ color: '#9aa3b5', roughness: 0.5, metalness: 0.4 }));
    p.position.set(x, h / 2, z);
    this.scene.add(p);
    return p;
  }

  // ── Input ────────────────────────────────────────────────────────────────
  #bindInput() {
    this.onKey = (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) {
        if (e.type === 'keydown') this.keys.add(k); else this.keys.delete(k);
        e.preventDefault();
      }
      if (e.type === 'keydown' && !e.repeat) this.onKeyAction?.(k);
    };
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);

    const el = this.renderer.domElement;
    el.style.touchAction = 'none';
    let drag = null;
    el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      this.yaw -= (e.clientX - drag.x) * 0.006;
      this.pitch = Math.min(Math.max(this.pitch + (e.clientY - drag.y) * 0.01, 0.8), 4);
      drag = { x: e.clientX, y: e.clientY };
    });
    const up = () => { drag = null; };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  setJoystick(x, y) { this.joy.x = x; this.joy.y = y; }

  // ── Loop ─────────────────────────────────────────────────────────────────
  start() { this.renderer.setAnimationLoop(() => this.#frame()); }

  #frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const hero = this.hero.root;

    let ix = this.joy.x, iy = -this.joy.y;
    const k = this.keys;
    if (k.has('w') || k.has('arrowup')) iy += 1;
    if (k.has('s') || k.has('arrowdown')) iy -= 1;
    if (k.has('a') || k.has('arrowleft')) ix -= 1;
    if (k.has('d') || k.has('arrowright')) ix += 1;
    const mag = Math.min(Math.hypot(ix, iy), 1);
    let speed = 0;
    if (mag > 0.08 && !this.frozen) {
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
      const dir = fwd.multiplyScalar(iy).add(right.multiplyScalar(ix)).normalize();
      speed = (k.has('shift') || mag > 0.97 ? this.runSpeed ?? 3.3 : this.walkSpeed ?? 1.55) * mag;
      // Try the full step, else slide along whichever axis is free.
      const p = hero.position, want = p.clone().addScaledVector(dir, speed * dt);
      const next = this.constrain(want, p)
        ?? this.constrain(new THREE.Vector3(want.x, p.y, p.z), p)
        ?? this.constrain(new THREE.Vector3(p.x, p.y, want.z), p);
      if (next) hero.position.copy(next); else speed *= 0.3;
      const target = Math.atan2(dir.x, dir.z);
      let diff = target - hero.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      hero.rotation.y += diff * Math.min(dt * 10, 1);
    }
    if (this.hero.update(dt, speed)) this.sound.step?.();

    // Follow camera (kept inside the walls by clampCamera)
    const target = hero.position.clone().add(new THREE.Vector3(0, this.cam.height, 0));
    const d = this.cam.dist;
    const want = new THREE.Vector3(target.x + Math.sin(this.yaw) * d, target.y + this.pitch - 0.9, target.z + Math.cos(this.yaw) * d);
    want.y = Math.max(want.y, 0.6);
    this.clampCamera(want);
    if (!this.camReady) { this.camera.position.copy(want); this.camReady = true; }
    this.camera.position.lerp(want, Math.min(dt * 5, 1));
    this.camera.lookAt(target);

    this.update(dt, t, hero);
    this.#readables();
    this.composer.render();
  }

  // Nearest readable within reach → floating card; first visit = discovery.
  #readables() {
    const h = this.hero.root.position;
    let best = null, bestD = this.readRange ?? 2.8;
    for (const r of this.readables) {
      const d = Math.hypot(h.x - r.pos[0], h.z - r.pos[2]);
      if (d < bestD) { bestD = d; best = r; }
    }
    if (best && !this.found.has(best.id)) {
      this.found.add(best.id);
      this.hero.smile?.();
      this.onDiscover?.(best, this.found.size);
    }
    if (best) {
      const p = new THREE.Vector3(...best.pos).project(this.camera);
      const W = this.container.clientWidth, H = this.container.clientHeight;
      this.readCard = { r: best, x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, visible: p.z < 1 };
    } else {
      this.readCard = null;
    }
  }

  // ── Hooks for subclasses ─────────────────────────────────────────────────
  constrain(next) { return next; }   // collision: return a position, or null to block
  clampCamera() {}                   // keep the camera inside walls
  update() {}                        // per-frame scene logic

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKey);
    // The VRM heroine is shared between scenes: detach her, don't dispose her.
    if (this.hero?.vrm) this.scene.remove(this.hero.root);
    this.scene.traverse((o) => {
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) { m.map?.dispose?.(); m.emissiveMap?.dispose?.(); m.dispose?.(); }
    });
    for (const d of this.disposables) d.dispose?.();
    this.composer.dispose?.();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
