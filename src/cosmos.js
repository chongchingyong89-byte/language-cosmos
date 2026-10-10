// The 3D universe: galaxy backdrop, language cores, branch trees and bilingual bridges.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CATEGORIES, EVIDENCE, FAMILIES, CLUSTER_ORDER } from './data/taxonomy.js';

const OVERVIEW = { cam: new THREE.Vector3(0, 120, 200), target: new THREE.Vector3(0, 0, 0) };
const CORE_MIN = 0.7, CORE_MAX = 3.4;
const TRUNK_LEN = 3.4, TWIG_LEN = 2.4;
// Phones/tablets: fewer particles, lower pixel ratio.
const LOW_POWER = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 600;

// Deterministic randomness so the universe looks the same every load.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.2, 'rgba(255,255,255,0.55)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.12)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const coreVertex = /* glsl */`
  varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }`;
const coreFragment = /* glsl */`
  uniform vec3 uColor; uniform float uTime; uniform float uHover;
  varying vec3 vNormal; varying vec3 vView; varying vec3 vPos;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
    float plasma = sin(vPos.x * 4.0 + uTime * 0.9) * sin(vPos.y * 4.3 - uTime * 0.7) * sin(vPos.z * 3.7 + uTime * 0.5);
    vec3 col = uColor * (0.45 + 0.25 * plasma) + uColor * fres * 1.8 + vec3(1.0) * pow(fres, 5.0) * 0.6;
    col *= 1.0 + uHover * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }`;

export class Cosmos {
  constructor(container, { languages, features, bridges, agency, shadows, traits, stageOf }) {
    this.container = container;
    this.languages = languages;
    this.features = features;
    this.bridgesData = bridges;
    this.agency = agency;
    this.shadows = shadows;
    this.traits = traits;
    this.stageOf = stageOf;
    this.byId = new Map(languages.map((l) => [l.id, l]));
    this.nodes = new Map();       // langId → { group, core, halo, label, tree, leaves, trunks, radius }
    this.bridges = [];
    this.handlers = { hover: () => {}, select: () => {} };
    this.state = {
      focus: null, sizeMode: 'lexicon', showAllTrees: true, showBridges: true,
      categories: new Set(Object.keys(CATEGORIES)), minEvidence: 0, showShadow: true, kidOnly: null,
    };
    this.clock = new THREE.Clock();
    this.tween = null;
    this.hovered = null;
    this.glow = glowTexture();
    this.viewOffset = { x: 0, y: 0, tx: 0, ty: 0 };

    this.#initRenderer();
    this.#buildBackdrop();
    this.#buildOrigin();
    this.#layout();
    this.#buildCores();
    this.#buildAllTrees();
    this.#buildBridges();
    this.#initPicking();
    this.applyFilters();
    this.renderer.setAnimationLoop(() => this.#frame());
  }

  on(evt, fn) { this.handlers[evt] = fn; }

  // ── Setup ────────────────────────────────────────────────────────────────
  #initRenderer() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#02030a');
    this.scene.fog = new THREE.FogExp2('#02030a', 0.0011);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 6000);
    this.camera.position.copy(this.#overviewCam());

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW_POWER ? 1.5 : 2));
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(w, h);
    this.labelRenderer.domElement.className = 'label-layer';
    this.container.appendChild(this.labelRenderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 900;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.25;
    this.controls.addEventListener('start', () => { this.tween = null; });

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 1.15, 0.55, 0.12);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    window.addEventListener('resize', () => this.#resize());
  }

  // Portrait screens see less horizontally, so pull the camera back.
  #fit(power = 0.75) {
    return this.camera.aspect < 1 ? (1 / this.camera.aspect) ** power : 1;
  }

  #overviewCam() {
    return OVERVIEW.cam.clone().multiplyScalar(this.#fit());
  }

  // Keep the scene centred in the area not covered by panels (px on each side).
  setViewInset({ left = 0, right = 0, top = 0, bottom = 0 } = {}) {
    this.viewOffset.tx = (right - left) / 2;
    this.viewOffset.ty = (bottom - top) / 2;
  }

  #applyViewOffset(dt) {
    const v = this.viewOffset;
    const k = Math.min(dt * 5, 1);
    v.x += (v.tx - v.x) * k;
    v.y += (v.ty - v.y) * k;
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (Math.abs(v.x) < 0.5 && Math.abs(v.y) < 0.5) {
      if (this.camera.view?.enabled) this.camera.clearViewOffset();
    } else {
      this.camera.setViewOffset(w, h, v.x, v.y, w, h);
    }
  }

  #resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  #buildBackdrop() {
    const rnd = mulberry32(7);

    // Distant stars on a shell.
    const starCount = LOW_POWER ? 4000 : 7000;
    const pos = new Float32Array(starCount * 3), col = new Float32Array(starCount * 3);
    const tint = [new THREE.Color('#ffffff'), new THREE.Color('#a9c8ff'), new THREE.Color('#ffe2b8'), new THREE.Color('#c9b8ff')];
    for (let i = 0; i < starCount; i++) {
      const r = 900 + rnd() * 1600, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
      const c = tint[Math.floor(rnd() * tint.length)].clone().multiplyScalar(0.4 + rnd() * 0.6);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
      size: 2.2, sizeAttenuation: false, map: this.glow, vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    })));

    // Spiral galaxy dust in the disk the cores live in.
    const dustCount = LOW_POWER ? 13000 : 26000, arms = 2;
    const dp = new Float32Array(dustCount * 3), dc = new Float32Array(dustCount * 3);
    const inner = new THREE.Color('#ffd9a8'), outer = new THREE.Color('#5a7dff'), pink = new THREE.Color('#ff7ad9');
    for (let i = 0; i < dustCount; i++) {
      const t = Math.pow(rnd(), 0.7);
      const radius = 6 + t * 230;
      const arm = (i % arms) * (Math.PI * 2 / arms);
      const angle = arm + radius * 0.028 + (rnd() - 0.5) * (0.9 - t * 0.4);
      const spread = (rnd() - 0.5) * (8 + radius * 0.12);
      dp.set([
        Math.cos(angle) * radius + spread,
        (rnd() - 0.5) * (14 - t * 9) * (rnd() < 0.1 ? 3 : 1),
        Math.sin(angle) * radius + (rnd() - 0.5) * (8 + radius * 0.12),
      ], i * 3);
      const c = inner.clone().lerp(outer, t).lerp(pink, rnd() < 0.08 ? 0.6 : 0).multiplyScalar(0.35 + rnd() * 0.4);
      dc.set([c.r, c.g, c.b], i * 3);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    dg.setAttribute('color', new THREE.BufferAttribute(dc, 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({
      size: 1.1, map: this.glow, vertexColors: true, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(this.dust);

    // Galactic bulge.
    const bulge = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glow, color: '#ffcf9a', transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    bulge.scale.set(46, 46, 1);
    this.scene.add(bulge);
  }

  // The galactic core is the "Mother tongue" origin: click it for the
  // from-birth timeline. A fat invisible sphere makes it easy to hit.
  #buildOrigin() {
    this.origin = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 16), new THREE.MeshBasicMaterial({ visible: false }));
    this.origin.userData = { kind: 'origin' };
    this.scene.add(this.origin);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(13, 0.07, 8, 128),
      new THREE.MeshBasicMaterial({ color: '#ffd9a8', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    ring.rotation.x = Math.PI / 2;
    this.originRing = ring;
    this.scene.add(ring);
    const el = document.createElement('div');
    el.className = 'origin-label';
    el.innerHTML = '<span class="zh">母语</span><span class="en">Mother tongue · from birth</span>';
    el.addEventListener('click', () => this.handlers.select({ kind: 'origin' }));
    const label = new CSS2DObject(el);
    label.position.set(0, 9, 0);
    this.scene.add(label);
  }

  // Personality lens: tint and swell each star by its tilt on one trait.
  setLens(trait, profiles) {
    this.lens = trait;
    const up = new THREE.Color('#ffd27a'), down = new THREE.Color('#5b7dff');
    for (const [id, n] of this.nodes) {
      const el = n.label.element.querySelector('.lens');
      if (!trait) {
        n.halo.material.color.copy(n.color);
        n.lensScale = 1;
        el.textContent = '';
        continue;
      }
      const v = profiles.get(id)?.[trait]?.norm ?? 0;
      n.halo.material.color.copy(n.color).lerp(v >= 0 ? up : down, Math.min(Math.abs(v) * 1.2, 1));
      n.lensScale = 0.6 + Math.abs(v) * 1.2;
      el.textContent = Math.abs(v) < 0.05 ? '·' : `${v > 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(2)}`;
      el.dataset.dir = v > 0.05 ? 'up' : v < -0.05 ? 'down' : '';
    }
  }

  // Families sit as clusters along the spiral arms; members ring their cluster centre.
  #layout() {
    const clusters = new Map();
    for (const l of this.languages) {
      if (!clusters.has(l.cluster)) clusters.set(l.cluster, []);
      clusters.get(l.cluster).push(l);
    }
    const order = [...CLUSTER_ORDER, ...[...clusters.keys()].filter((k) => !CLUSTER_ORDER.includes(k))]
      .filter((k) => clusters.has(k));
    this.clusterCenters = new Map();
    this.familyLabels = [];
    order.forEach((key, i) => {
      const t = i / Math.max(order.length - 1, 1);
      const radius = 55 + t * 160;
      const arm = (i % 2) * Math.PI;
      const angle = arm + radius * 0.028;
      const rnd = mulberry32(hashStr(key));
      const center = new THREE.Vector3(Math.cos(angle) * radius, (rnd() - 0.5) * 18, Math.sin(angle) * radius);
      this.clusterCenters.set(key, center);
      const members = clusters.get(key);
      const ring = members.length === 1 ? 0 : 10 + members.length * 2.6;
      members.forEach((l, j) => {
        const a = (j / members.length) * Math.PI * 2 + rnd() * 0.5;
        l._pos = center.clone().add(new THREE.Vector3(Math.cos(a) * ring, (rnd() - 0.5) * 8, Math.sin(a) * ring));
      });
      // Faint nebula behind each family cluster.
      const fam = FAMILIES[members[0].family];
      const neb = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glow, color: fam?.color ?? '#ffffff', transparent: true, opacity: 0.16,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const s = 30 + ring * 2.4;
      neb.scale.set(s, s, 1);
      neb.position.copy(center);
      this.scene.add(neb);

      // Family name floating under the cluster, shown from afar for orientation.
      const fl = document.createElement('div');
      fl.className = 'family-label';
      fl.style.setProperty('--c', fam?.color ?? '#fff');
      fl.textContent = members[0].family === 'indo-european' ? members[0].branch : (fam?.label ?? key);
      const flObj = new CSS2DObject(fl);
      flObj.position.copy(center).add(new THREE.Vector3(0, -(ring * 0.5 + 8), 0));
      this.scene.add(flObj);
      this.familyLabels.push(flObj);
    });
  }

  #radiusFor(lang, mode = this.state.sizeMode) {
    // Cube root: core VOLUME is proportional to the metric.
    const val = mode === 'speakers' ? lang.speakers : lang.lexicon.n;
    const all = this.languages.map((l) => (mode === 'speakers' ? l.speakers : l.lexicon.n));
    const max = Math.cbrt(Math.max(...all));
    return CORE_MIN + (CORE_MAX - CORE_MIN) * (Math.cbrt(val) / max);
  }

  #buildCores() {
    const geo = new THREE.IcosahedronGeometry(1, 5);
    for (const lang of this.languages) {
      const color = new THREE.Color(FAMILIES[lang.family]?.color ?? '#ffffff');
      const group = new THREE.Group();
      group.position.copy(lang._pos);

      const core = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        uniforms: { uColor: { value: color }, uTime: { value: 0 }, uHover: { value: 0 } },
        vertexShader: coreVertex, fragmentShader: coreFragment,
      }));
      core.userData = { kind: 'core', langId: lang.id };
      group.add(core);

      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glow, color, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      group.add(halo);

      const el = document.createElement('div');
      el.className = 'core-label';
      el.innerHTML = `<span class="name">${lang.name}</span><span class="native">${lang.native !== lang.name ? lang.native : ''}</span><span class="lens"></span>`;
      el.addEventListener('click', () => this.handlers.select({ kind: 'core', langId: lang.id }));
      const label = new CSS2DObject(el);
      group.add(label);

      const tree = new THREE.Group();
      group.add(tree);
      this.scene.add(group);

      const node = { lang, group, core, halo, label, tree, leaves: [], trunks: [], radius: 1, targetRadius: 1, color, lensScale: 1 };
      this.nodes.set(lang.id, node);
      this.#setRadius(node, this.#radiusFor(lang), true);
    }
  }

  #setRadius(node, r, immediate = false) {
    node.targetRadius = r;
    if (immediate) node.radius = r;
    node.core.scale.setScalar(node.radius);
    node.halo.scale.setScalar(node.radius * 6);
    node.label.position.set(0, node.radius + 1.4, 0);
  }

  // Each language's items = features + agency contrast + culture-key concepts.
  itemsFor(lang) {
    const items = [];
    for (const fid of lang.features) {
      const f = this.features[fid];
      if (f) items.push({ ...f, id: fid, type: 'feature', example: f.ex?.[lang.id], shadow: this.shadows.features[fid], traits: this.traits.features[fid], stage: this.stageOf[fid] });
    }
    for (const k of ['agentive', 'nonagentive']) {
      if (lang[k]) items.push({ ...this.agency[k], id: k, type: 'feature', shadow: this.shadows.features[k], traits: this.traits.features[k], stage: this.stageOf[k] });
    }
    for (const c of lang.concepts ?? []) {
      items.push({
        id: `concept:${c.term}`, type: 'concept', title: c.term, category: c.category, shadow: this.shadows.concepts[c.term], traits: this.traits.concepts[c.term],
        evidence: c.evidence ?? 'speculative', claim: c.gloss, refs: c.ref ? [c.ref] : [],
        mechanism: 'A culture-key word: having a word may make a concept easier to notice, remember and talk about. A word is not the same as a feeling or a value, so treat this as a prompt for study.',
        study: 'Free-listing and scenario-rating tasks: do speakers recognise and use this concept more, and faster, than translation-equivalent groups?',
      });
    }
    return items;
  }

  #buildAllTrees() {
    for (const node of this.nodes.values()) this.#buildTree(node);
  }

  #disposeTree(node) {
    node.tree.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
      if (o.isCSS2DObject) o.element.remove();
    });
    node.tree.clear();
    node.leaves = [];
    node.trunks = [];
  }

  #buildTree(node) {
    this.#disposeTree(node);
    const R = node.radius;
    const rnd = mulberry32(hashStr(node.lang.id));
    const byCat = new Map();
    for (const it of this.itemsFor(node.lang)) {
      if (!byCat.has(it.category)) byCat.set(it.category, []);
      byCat.get(it.category).push(it);
    }

    for (const [cat, items] of byCat) {
      const meta = CATEGORIES[cat];
      if (!meta) continue;
      const catColor = new THREE.Color(meta.color);
      const dir = new THREE.Vector3(...meta.dir).normalize();
      dir.applyEuler(new THREE.Euler((rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3, 0)).normalize();
      const u = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
      const v = new THREE.Vector3().crossVectors(dir, u).normalize();

      // Trunk: core surface → hub, with a gentle curve.
      const start = dir.clone().multiplyScalar(R * 0.9);
      const hub = dir.clone().multiplyScalar(R + TRUNK_LEN);
      const ctrl = dir.clone().multiplyScalar(R + TRUNK_LEN * 0.5).add(u.clone().multiplyScalar(0.9));
      const trunkCurve = new THREE.QuadraticBezierCurve3(start, ctrl, hub);
      const trunk = new THREE.Mesh(
        new THREE.TubeGeometry(trunkCurve, 24, 0.045 + 0.012 * items.length, 6, false),
        new THREE.MeshBasicMaterial({ color: catColor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      node.tree.add(trunk);
      const hubDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 12, 12),
        new THREE.MeshBasicMaterial({ color: catColor, transparent: true }),
      );
      hubDot.position.copy(hub);
      node.tree.add(hubDot);
      node.trunks.push({ category: cat, mesh: trunk, hub: hubDot });

      // Twigs + leaves fanned out in a cone around the branch direction.
      items.forEach((item, i) => {
        const n = items.length;
        const phi = (i / n) * Math.PI * 2 + rnd() * 0.6;
        const tilt = n === 1 ? 0.15 : 0.5 + 0.12 * (i % 2);
        const leafDir = dir.clone().multiplyScalar(Math.cos(tilt))
          .add(u.clone().multiplyScalar(Math.cos(phi) * Math.sin(tilt)))
          .add(v.clone().multiplyScalar(Math.sin(phi) * Math.sin(tilt))).normalize();
        const leafPos = hub.clone().add(leafDir.multiplyScalar(TWIG_LEN + (i % 3) * 0.7));
        const twigCtrl = hub.clone().add(dir.clone().multiplyScalar(1.0));
        const twigGeo = new THREE.BufferGeometry().setFromPoints(
          new THREE.QuadraticBezierCurve3(hub, twigCtrl, leafPos).getPoints(16));
        const twig = new THREE.Line(twigGeo, new THREE.LineBasicMaterial({
          color: catColor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        node.tree.add(twig);

        const ev = EVIDENCE[item.evidence] ?? EVIDENCE.speculative;
        const size = 0.16 + 0.26 * ev.w;
        const leafGeo = item.type === 'concept' ? new THREE.OctahedronGeometry(size * 1.15) : new THREE.IcosahedronGeometry(size, 2);
        const leaf = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({
          color: catColor.clone().lerp(new THREE.Color('#ffffff'), 0.25 * ev.w),
          wireframe: item.evidence === 'speculative', transparent: true,
        }));
        leaf.position.copy(leafPos);
        leaf.userData = { kind: 'leaf', langId: node.lang.id, item };
        node.tree.add(leaf);

        const el = document.createElement('div');
        el.className = 'leaf-label';
        el.style.setProperty('--c', meta.color);
        el.textContent = this.leafLabeler?.(item) ?? item.title;
        el.addEventListener('click', () => this.handlers.select({ kind: 'leaf', langId: node.lang.id, item }));
        const label = new CSS2DObject(el);
        label.position.copy(leafPos).add(new THREE.Vector3(0, size + 0.35, 0));
        node.tree.add(label);

        // Red thorn pointing outward = this leaf has a shadow side.
        let thorn = null;
        if (item.shadow?.length) {
          const out = leafPos.clone().sub(hub).normalize();
          thorn = new THREE.Mesh(
            new THREE.ConeGeometry(0.15 + 0.04 * item.shadow.length, 0.95, 6),
            new THREE.MeshBasicMaterial({ color: '#ff3b5c', transparent: true }),
          );
          thorn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), out);
          thorn.position.copy(leafPos).add(out.multiplyScalar(size + 0.55));
          thorn.userData = leaf.userData;
          node.tree.add(thorn);
        }

        node.leaves.push({ item, mesh: leaf, twig, label, category: cat, ev, thorn });
      });
    }
  }

  #buildBridges() {
    const rnd = mulberry32(99);
    for (const b of this.bridgesData) {
      const A = this.nodes.get(b.a), B = this.nodes.get(b.b);
      if (!A || !B) continue;
      const pa = A.group.position, pb = B.group.position;
      const mid = pa.clone().add(pb).multiplyScalar(0.5);
      const dist = pa.distanceTo(pb);
      mid.y += dist * 0.28 + 6;
      const curve = new THREE.QuadraticBezierCurve3(pa.clone(), mid, pb.clone());
      const color = new THREE.Color(CATEGORIES[b.category]?.color ?? '#ffffff');

      const line = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 80, 0.06, 6, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      const hit = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 1.2, 6, false),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.userData = { kind: 'bridge', bridge: b };
      const sparks = [];
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({
          map: this.glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        s.scale.setScalar(1.6);
        s.userData.offset = i / 4 + rnd() * 0.1;
        sparks.push(s);
      }
      const group = new THREE.Group();
      group.add(line, hit, ...sparks);
      this.scene.add(group);
      this.bridges.push({ data: b, group, line, hit, sparks, curve });
    }
  }

  // ── Picking ──────────────────────────────────────────────────────────────
  #initPicking() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    let downAt = null;
    const el = this.renderer.domElement;
    const track = (e) => {
      const r = el.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.pointerScreen = { x: e.clientX, y: e.clientY };
    };
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return; // no hover on touch screens
      track(e);
      this.#updateHover();
    });
    el.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, multi: !e.isPrimary }; });
    el.addEventListener('pointerup', (e) => {
      const touch = e.pointerType === 'touch';
      if (!downAt || downAt.multi || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > (touch ? 10 : 5)) return;
      track(e);
      const hit = this.#pick(touch ? 30 : 12);
      if (hit) this.handlers.select(hit.object.userData);
    });
    el.addEventListener('pointerleave', () => this.#setHover(null));
  }

  #isShown(o) {
    for (let p = o; p; p = p.parent) if (!p.visible) return false;
    return true;
  }

  // Exact ray hit first; otherwise the nearest core/leaf on screen within
  // `slop` px, so small leaves are still easy to tap with a finger.
  #pick(slop = 0) {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = [];
    for (const n of this.nodes.values()) {
      targets.push(n.core);
      for (const l of n.leaves) if (this.#isShown(l.mesh) && l.mesh.material.opacity > 0.3) targets.push(l.mesh);
    }
    const hits = this.raycaster.intersectObjects(targets, false);
    if (hits.length) return hits[0];

    if (slop && this.pointerScreen) {
      const r = this.renderer.domElement.getBoundingClientRect();
      const v = new THREE.Vector3();
      let best = null, bestD = slop;
      for (const obj of targets) {
        obj.getWorldPosition(v).project(this.camera);
        if (v.z > 1) continue;
        const d = Math.hypot(r.left + (v.x + 1) / 2 * r.width - this.pointerScreen.x, r.top + (1 - v.y) / 2 * r.height - this.pointerScreen.y);
        if (d < bestD) { bestD = d; best = obj; }
      }
      if (best) return { object: best };
    }
    const bridgeHit = this.state.showBridges
      ? this.raycaster.intersectObjects(this.bridges.filter((b) => b.group.visible).map((b) => b.hit), false)[0]
      : null;
    return bridgeHit ?? this.raycaster.intersectObject(this.origin, false)[0] ?? null;
  }

  #updateHover() {
    const hit = this.#pick();
    this.#setHover(hit ? hit.object.userData : null);
  }

  #setHover(data) {
    const prev = this.hovered;
    if (prev?.kind === 'core') this.nodes.get(prev.langId).core.material.uniforms.uHover.value = 0;
    if (prev?.kind === 'bridge') this.bridges.find((b) => b.data === prev.bridge).line.material.opacity = 0.45;
    this.hovered = data;
    if (data?.kind === 'core') this.nodes.get(data.langId).core.material.uniforms.uHover.value = 1;
    if (data?.kind === 'bridge') this.bridges.find((b) => b.data === data.bridge).line.material.opacity = 1;
    this.renderer.domElement.style.cursor = data ? 'pointer' : 'grab';
    this.handlers.hover(data, this.pointerScreen);
  }

  // ── Public API ───────────────────────────────────────────────────────────
  focusLanguage(id, { fly = true, instant = false } = {}) {
    this.state.focus = id;
    this.applyFilters();
    if (!fly || !id) return;
    const node = this.nodes.get(id);
    const target = node.group.position.clone();
    const away = this.camera.position.clone().sub(this.controls.target).normalize();
    if (away.y < 0.15) away.y = 0.35;
    away.normalize();
    const cam = target.clone().add(away.multiplyScalar((node.radius * 2 + 26) * this.#fit(0.5)));
    if (instant) {
      this.tween = null;
      this.camera.position.copy(cam);
      this.controls.target.copy(target);
    } else this.#flyTo(cam, target);
  }

  focusLeaf(langId, item) {
    if (this.state.focus !== langId) this.focusLanguage(langId, { fly: false });
    const node = this.nodes.get(langId);
    const leaf = node.leaves.find((l) => l.item.id === item.id);
    if (!leaf) return;
    const target = leaf.mesh.getWorldPosition(new THREE.Vector3());
    const away = target.clone().sub(node.group.position).normalize();
    this.#flyTo(target.clone().add(away.multiplyScalar(9 * this.#fit(0.5))).add(new THREE.Vector3(0, 2, 0)), target);
  }

  focusBridge(bridge) {
    const b = this.bridges.find((x) => x.data === bridge);
    if (!b) return;
    const mid = b.curve.getPoint(0.5);
    const span = b.curve.v0.distanceTo(b.curve.v2);
    this.#flyTo(mid.clone().add(new THREE.Vector3(0, span * 0.35, span * 0.9 + 15).multiplyScalar(this.#fit())), mid);
  }

  focusOrigin({ instant = false } = {}) {
    this.state.focus = null;
    this.applyFilters();
    const cam = new THREE.Vector3(0, 38, 62).multiplyScalar(this.#fit(0.6)), target = new THREE.Vector3(0, 0, 0);
    if (instant) {
      this.tween = null;
      this.camera.position.copy(cam);
      this.controls.target.copy(target);
    } else this.#flyTo(cam, target);
  }

  overview() {
    this.state.focus = null;
    this.applyFilters();
    this.#flyTo(this.#overviewCam(), OVERVIEW.target.clone());
  }

  setSizeMode(mode) {
    this.state.sizeMode = mode;
    for (const n of this.nodes.values()) n.targetRadius = this.#radiusFor(n.lang, mode);
  }

  setAutoRotate(on) { this.controls.autoRotate = on; }

  setLeafLabeler(fn) {
    this.leafLabeler = fn;
    for (const n of this.nodes.values()) {
      for (const l of n.leaves) l.label.element.textContent = fn?.(l.item) ?? l.item.title;
    }
  }

  // Cinematic opening: dive in from deep space to the overview.
  playIntro() {
    const end = this.#overviewCam();
    this.camera.position.copy(end.clone().multiplyScalar(6).add(new THREE.Vector3(0, 900, 0)));
    this.controls.target.set(0, 0, 0);
    this.#flyTo(end, new THREE.Vector3(0, 0, 0), 5.5);
  }

  set(patch) {
    Object.assign(this.state, patch);
    this.applyFilters();
  }

  applyFilters() {
    const { focus, showAllTrees, categories, minEvidence, showBridges } = this.state;
    for (const [id, n] of this.nodes) {
      const isFocus = id === focus;
      const dim = focus && !isFocus;
      const treeOpacity = isFocus ? 1 : showAllTrees ? (focus ? 0.08 : 0.38) : 0;
      n.tree.visible = treeOpacity > 0;
      n.label.element.classList.toggle('dim', !!dim);
      n.label.element.classList.toggle('focus', isFocus);
      n.halo.material.opacity = isFocus ? 0.3 : dim ? 0.45 : 0.85;

      const shownCats = new Set();
      for (const l of n.leaves) {
        const ok = categories.has(l.category) && l.ev.rank >= minEvidence && (!this.state.kidOnly || this.state.kidOnly.has(l.item.id));
        if (ok) shownCats.add(l.category);
        l.mesh.visible = l.twig.visible = ok && n.tree.visible;
        l.mesh.material.opacity = treeOpacity * (l.item.evidence === 'contested' ? 0.75 : 1);
        l.twig.material.opacity = treeOpacity * 0.7;
        l.label.visible = ok && isFocus;
        if (l.thorn) {
          l.thorn.visible = l.mesh.visible && this.state.showShadow;
          l.thorn.material.opacity = treeOpacity;
        }
      }
      for (const t of n.trunks) {
        t.mesh.visible = t.hub.visible = shownCats.has(t.category) && n.tree.visible;
        t.mesh.material.opacity = treeOpacity * 0.85;
        t.hub.material.opacity = treeOpacity;
      }
    }
    for (const b of this.bridges) {
      const touches = !focus || b.data.a === focus || b.data.b === focus;
      b.group.visible = showBridges && categories.has(b.data.category) && touches;
    }
  }

  // ── Animation ────────────────────────────────────────────────────────────
  #flyTo(camPos, target, dur = 1.6) {
    this.tween = {
      fromCam: this.camera.position.clone(), toCam: camPos,
      fromTarget: this.controls.target.clone(), toTarget: target,
      t: 0, dur,
    };
  }

  #frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(tw.t + dt / tw.dur, 1);
      const k = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(tw.fromCam, tw.toCam, k);
      this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
      if (tw.t >= 1) this.tween = null;
    }

    this.dust.rotation.y += dt * 0.004;
    this.originRing.rotation.z += dt * 0.05;
    this.originRing.scale.setScalar(1 + Math.sin(time * 0.8) * 0.04);

    for (const n of this.nodes.values()) {
      n.core.material.uniforms.uTime.value = time;
      n.core.rotation.y += dt * 0.15;
      if (Math.abs(n.radius - n.targetRadius) > 0.002) {
        n.radius += (n.targetRadius - n.radius) * Math.min(dt * 4, 1);
        this.#setRadius(n, n.radius);
        if (Math.abs(n.radius - n.targetRadius) <= 0.002) {
          this.#buildTree(n);
          this.applyFilters();
        }
      }
      const pulse = 1 + Math.sin(time * 1.3 + n.group.position.x) * 0.06;
      n.halo.scale.setScalar(n.radius * 6 * pulse * n.lensScale);
      // Fade distant labels so the overview stays readable.
      const d = this.camera.position.distanceTo(n.group.position);
      n.label.element.style.opacity = Math.max(0.15, Math.min(1, 1.6 - d / 260));
    }

    const camDist = this.camera.position.distanceTo(this.controls.target);
    for (const fl of this.familyLabels) {
      // Visible from mid-distance; fades out again during the deep-space intro.
      fl.element.style.opacity = Math.max(0, Math.min(0.6, (camDist - 110) / 140) * Math.min(1, (900 - camDist) / 300));
    }

    for (const b of this.bridges) {
      if (!b.group.visible) continue;
      for (const s of b.sparks) s.position.copy(b.curve.getPoint((s.userData.offset + time * 0.08) % 1));
    }

    this.#applyViewOffset(dt);
    this.controls.update();
    this.composer.render();
    this.labelRenderer.render(this.scene, this.camera);
  }
}
