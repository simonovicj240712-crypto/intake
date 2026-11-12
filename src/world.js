import * as THREE from "three";

const C = {
  black: 0x050606,
  ink: 0x090d0d,
  deep: 0x0d1514,
  teal: 0x17302d,
  teal2: 0x21443d,
  rust: 0x6e3522,
  rust2: 0x9e4a2a,
  orange: 0xc57a35,
  sodium: 0xd6a14a,
  metal: 0x3a4644,
  metal2: 0x55615b,
  pale: 0xb9b6a6,
  paper: 0xd8d2c0,
  wood: 0x3a2618,
  wood2: 0x533522,
  flesh: 0x9a7b61,
  cloth: 0x2a3532,
  green: 0x85a66a,
  red: 0x7d1f16,
};

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + "|" + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
  matCache.set(key, m);
  return m;
}
export function basic(color, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, ...opts });
}

export function box(w, h, d, color, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.material || mat(color, opts.mat || {}));
  m.position.set(x, y, z);
  if (opts.rotX) m.rotation.x = opts.rotX;
  if (opts.rotY) m.rotation.y = opts.rotY;
  if (opts.rotZ) m.rotation.z = opts.rotZ;
  if (opts.name) m.name = opts.name;
  (parent || null)?.add(m);
  return m;
}

export function cyl(rt, rb, h, seg, color, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), opts.material || mat(color, opts.mat || {}));
  m.position.set(x, y, z);
  if (opts.rotX) m.rotation.x = opts.rotX;
  if (opts.rotY) m.rotation.y = opts.rotY;
  if (opts.rotZ) m.rotation.z = opts.rotZ;
  (parent || null)?.add(m);
  return m;
}

export function sphere(r, ws, hs, color, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), opts.material || mat(color, opts.mat || {}));
  m.position.set(x, y, z);
  if (opts.sx) m.scale.x = opts.sx;
  if (opts.sy) m.scale.y = opts.sy;
  if (opts.sz) m.scale.z = opts.sz;
  (parent || null)?.add(m);
  return m;
}

export function plane(w, h, color, x, y, z, parent, opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), opts.material || mat(color, opts.mat || {}));
  m.position.set(x, y, z);
  if (opts.rotX) m.rotation.x = opts.rotX;
  if (opts.rotY) m.rotation.y = opts.rotY;
  if (opts.rotZ) m.rotation.z = opts.rotZ;
  (parent || null)?.add(m);
  return m;
}

export function pointLight(color, intensity, distance, x, y, z, parent, opts = {}) {
  const l = new THREE.PointLight(color, intensity, distance, opts.decay ?? 1.6);
  l.position.set(x, y, z);
  (parent || null)?.add(l);
  return l;
}

export function makeHumanoid({ skin = C.flesh, coat = C.cloth, pants = 0x1a211f, hair = 0x241a13, child = false, shoes = 0x14100c } = {}) {
  const g = new THREE.Group();
  const s = child ? 0.66 : 1;
  const torsoH = 0.62 * s;
  const torsoY = 1.02 * s;
  box(0.38 * s, torsoH, 0.22 * s, coat, 0, torsoY, 0, g);
  box(0.42 * s, 0.11 * s, 0.24 * s, coat, 0, torsoY - torsoH * 0.47, 0, g);
  sphere(0.125 * s, 8, 6, skin, 0, 1.43 * s, 0, g, { sy: 1.1 });
  box(0.22 * s, 0.1 * s, 0.22 * s, hair, 0, 1.52 * s, -0.01 * s, g);
  // eyes (tiny, blank)
  sphere(0.018 * s, 6, 4, 0x0a0808, -0.045 * s, 1.44 * s, 0.116 * s, g);
  sphere(0.018 * s, 6, 4, 0x0a0808, 0.045 * s, 1.44 * s, 0.116 * s, g);
  // arms
  for (const side of [-1, 1]) {
    box(0.11 * s, 0.48 * s, 0.12 * s, coat, side * 0.27 * s, 1.03 * s, 0, g, { rotZ: side * 0.06 });
    box(0.09 * s, 0.16 * s, 0.1 * s, skin, side * 0.29 * s, 0.76 * s, 0.01 * s, g);
    box(0.13 * s, 0.48 * s, 0.15 * s, pants, side * 0.12 * s, 0.48 * s, 0, g);
    box(0.14 * s, 0.09 * s, 0.24 * s, shoes, side * 0.12 * s, 0.18 * s, 0.04 * s, g);
  }
  return g;
}

export function makeTenant(height = 2.45) {
  const g = new THREE.Group();
  const blackMat = mat(0x020202);
  box(0.4, height * 0.52, 0.24, 0x020202, 0, height * 0.56, 0, g, { material: blackMat });
  box(0.34, height * 0.14, 0.22, 0x020202, 0, height * 0.3, 0, g, { material: blackMat });
  const head = sphere(0.155, 8, 6, 0x020202, 0, height * 0.82, 0, g, { material: blackMat, sy: 1.25 });
  head.name = "head";
  for (const side of [-1, 1]) {
    box(0.1, height * 0.48, 0.1, 0x020202, side * 0.27, height * 0.55, 0, g, { material: blackMat, rotZ: side * 0.035 });
    box(0.11, height * 0.46, 0.12, 0x020202, side * 0.1, height * 0.2, 0, g, { material: blackMat });
  }
  // no face, no reflection; intentionally a hole
  return g;
}

export function makeRat({ scale = 1, brood = false } = {}) {
  const g = new THREE.Group();
  const bodyColor = brood ? 0x4f4033 : 0x4a3a2c;
  const body = sphere(0.38, 8, 6, bodyColor, 0, 0.42, 0, g, { sx: 1.5, sy: 0.85, sz: 0.85 });
  body.name = "body";
  const head = sphere(0.24, 8, 6, brood ? 0x604e3e : 0x5a4838, 0.52, 0.46, 0, g, { sx: 1.15, sy: 0.9, sz: 0.9 });
  head.name = "head";
  // ears
  for (const side of [-1, 1]) {
    cyl(0.1, 0.12, 0.03, 6, 0x2b211a, 0.56, 0.67, side * 0.14, g, { rotX: Math.PI / 2 });
  }
  // snout + teeth
  box(0.18, 0.12, 0.14, 0x2a1f18, 0.73, 0.43, 0, g);
  for (const side of [-1, 1]) {
    cyl(0.01, 0.025, 0.09, 5, 0xd9d0b0, 0.8, 0.36, side * 0.045, g, { rotX: Math.PI });
  }
  // eye
  sphere(0.025, 6, 4, 0x120d0a, 0.68, 0.5, 0.11, g);
  sphere(0.025, 6, 4, 0x120d0a, 0.68, 0.5, -0.11, g);
  // tail
  cyl(0.025, 0.01, 0.9, 5, 0x2a1f18, -0.7, 0.33, 0, g, { rotZ: -0.3, rotX: 0.1 });
  // legs
  for (const side of [-1, 1]) {
    for (const front of [-0.2, 0.28]) {
      box(0.09, 0.3, 0.09, 0x2a1f18, front, 0.15, side * 0.18, g);
    }
  }
  g.scale.setScalar(scale);
  return g;
}

export function makeCrawler() {
  const g = new THREE.Group();
  const pale = 0xa9a590;
  const pale2 = 0x8e8a75;
  // low, long body
  box(0.5, 0.32, 1.0, pale2, 0, 0.6, 0, g);
  sphere(0.24, 8, 6, pale, 0, 0.73, 0.48, g, { sx: 1.2, sy: 0.95, sz: 0.9 });
  // no face; black mouth
  box(0.2, 0.08, 0.08, 0x0a0807, 0, 0.67, 0.63, g);
  // long arms
  for (const side of [-1, 1]) {
    box(0.09, 0.75, 0.09, pale, side * 0.28, 0.38, 0.22, g, { rotX: -0.7, rotZ: side * 0.18 });
    box(0.1, 0.22, 0.1, pale2, side * 0.33, 0.08, 0.52, g);
  }
  // legs
  for (const side of [-1, 1]) {
    box(0.12, 0.5, 0.12, pale2, side * 0.18, 0.38, -0.38, g, { rotX: 0.7 });
    box(0.16, 0.1, 0.3, pale2, side * 0.18, 0.06, -0.58, g);
  }
  // too many joints: extra shoulders/spines
  for (const side of [-1, 1]) {
    box(0.13, 0.13, 0.13, pale, side * 0.24, 0.64, 0.34, g);
  }
  box(0.14, 0.2, 0.14, pale, 0, 0.62, -0.3, g, { rotX: 0.2 });
  g.rotation.x = -0.08;
  return g;
}

export function makePistol() {
  const g = new THREE.Group();
  box(0.1, 0.12, 0.28, 0x2b3332, 0, 0, 0, g);
  box(0.06, 0.16, 0.09, 0x1b2221, 0, -0.12, 0.03, g, { rotX: -0.22 });
  box(0.035, 0.035, 0.14, 0x171d1c, 0, 0.015, -0.19, g);
  box(0.04, 0.04, 0.04, 0x6b5b3e, 0, 0.03, -0.28, g);
  return g;
}

export function makeShotgun() {
  const g = new THREE.Group();
  box(0.09, 0.1, 0.5, 0x3a2c21, 0, 0, -0.08, g);
  cyl(0.032, 0.032, 0.58, 6, 0x222a28, 0, 0.035, -0.27, g, { rotX: Math.PI / 2 });
  cyl(0.028, 0.028, 0.56, 6, 0x1b2220, -0.045, 0.005, -0.26, g, { rotX: Math.PI / 2 });
  box(0.1, 0.13, 0.2, 0x4a3626, 0, -0.03, 0.2, g, { rotX: -0.12 });
  box(0.06, 0.08, 0.16, 0x2a1f17, 0, -0.12, 0.27, g);
  return g;
}

export function makeRifle() {
  const g = new THREE.Group();
  box(0.08, 0.09, 0.72, 0x2b322d, 0, 0, -0.16, g);
  cyl(0.025, 0.025, 0.8, 6, 0x1b211f, 0, 0.02, -0.46, g, { rotX: Math.PI / 2 });
  box(0.11, 0.15, 0.22, 0x3b2c20, 0, -0.02, 0.2, g, { rotX: -0.1 });
  box(0.07, 0.07, 0.2, 0x1d2421, 0, 0.11, -0.1, g);
  cyl(0.035, 0.035, 0.16, 6, 0x0d1210, 0, 0.19, -0.12, g, { rotX: Math.PI / 2 });
  return g;
}

export function makeScavenger({ coat = 0x2a2b25, gun = true } = {}) {
  const g = makeHumanoid({ coat, pants: 0x181d1a, hair: 0x1e1711 });
  if (gun) {
    const rifle = makeRifle();
    rifle.scale.set(0.9, 0.9, 0.9);
    rifle.position.set(0.25, 1.03, 0.12);
    rifle.rotation.set(0.12, -0.12, -0.3);
    g.add(rifle);
  }
  return g;
}

function addDust(parent, count = 40, area = 6, color = 0x7c8b7e) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * area;
    arr[i * 3 + 1] = Math.random() * 2.4 + 0.2;
    arr[i * 3 + 2] = (Math.random() - 0.5) * area;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.017, transparent: true, opacity: 0.45, depthWrite: false }));
  parent.add(p);
  return p;
}

function addChair(parent, x, z, rotY = 0) {
  const g = new THREE.Group();
  box(0.5, 0.07, 0.5, C.wood2, 0, 0.45, 0, g);
  box(0.5, 0.58, 0.07, C.wood, 0, 0.72, -0.22, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.06, 0.45, 0.06, C.wood, sx * 0.2, 0.22, sz * 0.2, g);
  }
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  parent.add(g);
  return g;
}

export function buildDiningRoom({ flashback = false } = {}) {
  const group = new THREE.Group();
  const wall = flashback ? 0x2a3029 : 0x223430;
  const floor = flashback ? 0x2b2118 : 0x342518;
  const refs = {};

  box(8, 0.2, 7, floor, 0, -0.1, 0, group);
  box(8, 3.1, 0.2, wall, 0, 1.55, -3.5, group);
  box(8, 3.1, 0.2, 0x1b2825, 0, 1.55, 3.5, group);
  box(0.2, 3.1, 7, 0x1d2b27, -4, 1.55, 0, group);
  box(0.2, 3.1, 7, 0x1d2b27, 4, 1.55, 0, group);
  box(8, 0.15, 7, 0x19201e, 0, 3.05, 0, group);

  // baseboards / panels
  for (const x of [-3.1, -1.0, 1.1, 3.2]) box(1.65, 0.08, 0.06, 0x33413a, x, 0.1, -3.39, group);

  // table
  box(2.8, 0.12, 1.5, C.wood2, 0, 0.76, 0, group);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.12, 0.75, 0.12, C.wood, sx * 1.18, 0.37, sz * 0.58, group);
  }
  // plates and cups
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? -0.85 : 0.85;
    const z = i % 2 === 0 ? -0.45 : 0.45;
    cyl(0.2, 0.22, 0.025, 10, 0xb7ad93, x, 0.84, z, group);
    cyl(0.1, 0.12, 0.025, 10, 0x4b3a24, x, 0.86, z, group);
    cyl(0.055, 0.05, 0.12, 8, 0x9e9075, x + 0.25, 0.9, z + 0.05, group);
  }
  // food / pot
  cyl(0.28, 0.3, 0.22, 10, 0x5a4230, 0, 0.92, -0.05, group);
  sphere(0.12, 6, 5, 0x7b5a31, 0, 1.04, -0.05, group, { sy: 0.55 });
  box(0.32, 0.03, 0.24, 0x3b2a19, 0.8, 0.82, -0.35, group, { rotY: 0.2 });

  // chairs
  addChair(group, -1.15, -1.1, 0);
  addChair(group, 1.15, -1.1, 0);
  addChair(group, -1.15, 1.15, Math.PI);
  addChair(group, 1.15, 1.15, Math.PI);

  // fake window on back wall
  const frame = new THREE.Group();
  box(2.45, 1.55, 0.08, 0x171d1b, 2.0, 1.72, -3.39, frame);
  const winMat = new THREE.MeshBasicMaterial({ color: flashback ? 0x3a2018 : 0x1e3a36 });
  const win = plane(2.2, 1.32, 0xffffff, 2.0, 1.72, -3.34, frame, { material: winMat });
  win.name = "window";
  // city / surface silhouette lines
  box(0.05, 1.22, 0.02, 0x0b1514, 1.2, 1.72, -3.32, frame);
  box(0.05, 1.22, 0.02, 0x0b1514, 2.8, 1.72, -3.32, frame);
  box(1.9, 0.04, 0.02, 0x0b1514, 2.0, 1.72, -3.32, frame);
  group.add(frame);
  refs.window = win;
  refs.windowMat = winMat;

  // door on right
  box(0.12, 2.1, 1.05, 0x2a1a12, 3.92, 1.05, 1.3, group);
  box(0.06, 0.08, 0.08, 0xc8a24a, 3.84, 1.02, 1.0, group);

  // hanging lamp
  cyl(0.27, 0.38, 0.26, 8, 0x1e2421, 0, 2.48, 0, group);
  cyl(0.03, 0.03, 0.55, 6, 0x1d2220, 0, 2.8, 0, group);
  const lamp = pointLight(flashback ? 0xff7958 : 0xffc078, 2.8, 8, 0, 2.25, 0, group, { decay: 1.25 });
  refs.lamp = lamp;
  const tableLight = pointLight(flashback ? 0xff8a64 : 0xffb36a, 1.5, 5.5, 0, 1.7, 0.75, group, { decay: 1.4 });
  refs.tableLight = tableLight;

  // red alarm light (off)
  const alarm = pointLight(0xff1a0a, 0, 9, -1.8, 2.7, 0.4, group, { decay: 1.2 });
  refs.alarm = alarm;

  // red wall lamp / corner marker
  box(0.12, 0.28, 0.2, 0x281815, -3.88, 2.15, -2.55, group);
  box(0.07, 0.14, 0.07, 0xff6a3a, -3.82, 2.15, -2.55, group, { material: basic(0xff6a3a) });
  pointLight(0x7a3a28, 2.2, 4.2, -3.55, 1.7, -2.55, group, { decay: 1.4 });

  // family
  const mom = makeHumanoid({ coat: 0x7a3d28, pants: 0x26221c, hair: 0x2b1a12 });
  mom.position.set(-1.15, 0, -1.18);
  mom.rotation.y = 0;
  group.add(mom);
  refs.mom = mom;

  const dad = makeHumanoid({ coat: 0x2d423a, pants: 0x1b211e, hair: 0x2c2119 });
  dad.position.set(1.15, 0, -1.18);
  dad.rotation.y = 0;
  group.add(dad);
  refs.dad = dad;

  const sister = makeHumanoid({ child: true, coat: 0x8a7135, pants: 0x2d2a20, hair: 0x3b2418 });
  sister.position.set(-0.95, 0, 0.95);
  sister.rotation.y = Math.PI;
  group.add(sister);
  refs.sister = sister;

  const tenant = makeTenant(2.55);
  tenant.position.set(-3.35, 0, -3.0);
  tenant.rotation.y = Math.PI * 0.88;
  tenant.visible = false;
  group.add(tenant);
  refs.tenant = tenant;

  addDust(group, 34, 6.5, 0x9aa28f);
  group.userData.refs = refs;
  return { group, refs };
}

export function buildCrawlspace() {
  const group = new THREE.Group();
  const refs = {};
  box(4.8, 0.2, 7, 0x1b1712, 0, -0.1, 0, group);
  box(4.8, 0.16, 7, 0x100d0a, 0, 1.28, 0, group);
  box(0.2, 1.4, 7, 0x211a13, -2.4, 0.7, 0, group);
  box(0.2, 1.4, 7, 0x211a13, 2.4, 0.7, 0, group);
  // floor joists
  for (let z = -3; z <= 3; z += 0.75) {
    box(4.6, 0.12, 0.18, 0x2e2319, 0, 1.18, z, group);
  }
  // crack of light above
  box(4.2, 0.03, 0.05, 0x4c3a23, 0, 1.1, 2.4, group);
  const crack = pointLight(0xe6c58a, 3.2, 6, 0, 1.0, 2.4, group, { decay: 1.25 });
  refs.crack = crack;
  pointLight(0xffa060, 2.6, 6, -0.8, 0.75, -1.6, group, { decay: 1.35 });
  pointLight(0x9a6a45, 1.6, 5, 1.1, 0.55, -1.0, group, { decay: 1.5 });
  pointLight(0xffb070, 5.0, 5.0, 0, 0.9, 1.3, group, { decay: 1.3 });

  // father, lying / dragged
  const father = makeHumanoid({ coat: 0x2d423a, pants: 0x1b211e, hair: 0x2c2119 });
  father.position.set(0.1, 0.02, -1.35);
  father.rotation.z = -1.45;
  father.rotation.y = 0.4;
  group.add(father);
  refs.father = father;

  // broodmother, hidden left
  const brood = makeRat({ scale: 2.1, brood: true });
  brood.position.set(-2.0, 0, -2.1);
  brood.rotation.y = 0.3;
  group.add(brood);
  refs.brood = brood;

  // mother/sister silhouettes beyond the gap (dark)
  const mother = makeHumanoid({ coat: 0x5c2f20, pants: 0x1d1915, hair: 0x24160f });
  mother.position.set(-1.15, 0, -3.0);
  mother.rotation.y = 0.2;
  mother.visible = false;
  group.add(mother);
  refs.mother = mother;

  const sister = makeHumanoid({ child: true, coat: 0x6d5a2a, pants: 0x26231b, hair: 0x2c1a12 });
  sister.position.set(-0.55, 0, -2.9);
  sister.rotation.y = 0.1;
  sister.visible = false;
  group.add(sister);
  refs.sister = sister;

  // Tokar, hidden right
  const tokar = makeHumanoid({ coat: 0x4a3a2a, pants: 0x1e211d, hair: 0x241b14 });
  tokar.position.set(2.1, 0, -1.2);
  tokar.rotation.y = -0.8;
  tokar.visible = false;
  group.add(tokar);
  refs.tokar = tokar;

  addDust(group, 24, 4, 0x8b7b60);
  group.userData.refs = refs;
  return { group, refs };
}

export function buildKryl() {
  const group = new THREE.Group();
  const refs = {};
  const colliders = [];
  const W = 12, D = 14, H = 4;
  box(W, 0.2, D, 0x211d18, 0, -0.1, 0, group);
  box(W, H, 0.2, 0x1c2a26, 0, H / 2, -D / 2, group);
  box(W, H, 0.2, 0x182420, 0, H / 2, D / 2, group);
  box(0.2, H, D, 0x1b2824, -W / 2, H / 2, 0, group);
  box(0.2, H, D, 0x1b2824, W / 2, H / 2, 0, group);
  box(W, 0.2, D, 0x121918, 0, H, 0, group);
  colliders.push({ minX: -W / 2 - 0.2, maxX: -W / 2 + 0.2, minZ: -D / 2, maxZ: D / 2 });
  colliders.push({ minX: W / 2 - 0.2, maxX: W / 2 + 0.2, minZ: -D / 2, maxZ: D / 2 });
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: -D / 2 - 0.2, maxZ: -D / 2 + 0.2 });
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: D / 2 - 0.2, maxZ: D / 2 + 0.2 });

  // market stalls / tarps
  for (let i = 0; i < 3; i++) {
    const x = -3.8 + i * 3.4;
    const z = -3.2;
    box(2.3, 0.9, 1.2, 0x3b2b1e, x, 0.45, z, group);
    box(2.6, 0.08, 1.5, 0x6b2f21, x, 1.45, z, group, { rotZ: 0.03 });
    cyl(0.035, 0.035, 2.4, 5, 0x2d241b, x - 1.0, 1.2, z + 0.3, group);
    cyl(0.035, 0.035, 2.4, 5, 0x2d241b, x + 1.0, 1.2, z + 0.3, group);
    for (let j = 0; j < 5; j++) {
      cyl(0.08, 0.08, 0.16, 6, j % 2 ? 0x7d6a3f : 0x4c6045, x - 0.7 + j * 0.35, 0.98, z + 0.15, group);
    }
  }

  // hanging bulbs
  for (let i = 0; i < 4; i++) {
    const x = -3.5 + i * 2.3;
    cyl(0.02, 0.02, 0.7, 5, 0x191d1a, x, 3.45, -0.7, group);
    const b = sphere(0.09, 6, 5, 0xffb765, x, 3.1, -0.7, group, { material: basic(0xffb765) });
    pointLight(0xff9a4a, 1.35, 6.0, x, 3.0, -0.7, group, { decay: 1.5 });
  }
  // main warm wash — the station is poor, but it is alive
  pointLight(0xffb070, 10.5, 18, 0, 3.6, 0, group, { decay: 1.15 });
  // foreground warmth so the market is readable
  pointLight(0xffa860, 4.5, 9.0, 0, 2.7, 2.8, group, { decay: 1.35 });
  pointLight(0xffc078, 5.0, 6.0, 0, 2.0, 0.5, group, { decay: 1.25 });
  pointLight(0xffc078, 2.8, 5.5, 0, 2.0, -0.8, group, { decay: 1.55 });
  for (const x of [-2.4, 2.4]) {
    cyl(0.02, 0.02, 0.7, 5, 0x191d1a, x, 3.45, 2.8, group);
    sphere(0.09, 6, 5, 0xffb765, x, 3.1, 2.8, group, { material: basic(0xffb765) });
    pointLight(0xff9a4a, 1.8, 6.0, x, 3.0, 2.8, group, { decay: 1.5 });
  }

  // counter / Tokar's shop
  box(3.2, 0.9, 0.7, 0x3f2e20, 0, 0.45, 1.2, group);
  box(3.4, 0.1, 0.9, 0x5b4029, 0, 0.92, 1.2, group);
  // tools / parts
  for (let i = 0; i < 6; i++) {
    box(0.12, 0.08, 0.3, i % 2 ? 0x4c554d : 0x2a302c, -1.2 + i * 0.45, 1.02, 1.15, group);
  }
  colliders.push({ minX: -1.7, maxX: 1.7, minZ: 0.8, maxZ: 1.6 });

  const tokar = makeHumanoid({ coat: 0x4b3a2b, pants: 0x20231f, hair: 0x2a2119 });
  tokar.position.set(0, 0, 1.95);
  tokar.rotation.y = 0;
  group.add(tokar);
  pointLight(0xffc078, 5.0, 4.5, 0, 1.8, 1.9, group, { decay: 1.2 });
  // goggles
  box(0.17, 0.045, 0.035, 0x1b1c18, 0, 1.44, 0.11, tokar);
  box(0.05, 0.05, 0.02, 0x8caa76, -0.05, 1.44, 0.13, tokar, { material: basic(0x8caa76) });
  box(0.05, 0.05, 0.02, 0x8caa76, 0.05, 1.44, 0.13, tokar, { material: basic(0x8caa76) });
  refs.tokar = tokar;

  // vent entrance at far end
  box(2.2, 2.2, 0.12, 0x2c332f, 0, 1.1, -6.8, group);
  for (let i = 0; i < 7; i++) {
    box(1.9, 0.06, 0.05, 0x111614, 0, 0.25 + i * 0.25, -6.72, group);
  }
  const ventGlow = pointLight(0x7ea06a, 0.55, 4, 0, 0.9, -6.2, group, { decay: 1.8 });
  refs.ventGlow = ventGlow;
  refs.ventDoor = new THREE.Vector3(0, 0, -6.2);

  // wall decoration / family memorial
  box(2.2, 1.15, 0.04, 0x2b3029, -4.15, 2.1, -1.5, group, { rotY: Math.PI / 2 });
  for (let i = 0; i < 4; i++) {
    box(0.28, 0.34, 0.02, 0x8b7b5d, -4.11, 1.85 + (i % 2) * 0.35, -2.1 + Math.floor(i / 2) * 0.5, group, { rotY: Math.PI / 2 });
  }

  // pipes / cables
  for (let i = 0; i < 3; i++) {
    cyl(0.06, 0.06, 10, 6, 0x2b322e, -5.4 + i * 0.3, 3.3, 0, group, { rotX: Math.PI / 2 });
  }

  // clutter
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() - 0.5) * 8;
    const z = (Math.random() - 0.5) * 8;
    box(0.25 + Math.random() * 0.4, 0.2 + Math.random() * 0.3, 0.25 + Math.random() * 0.4, 0x3a2c20, x, 0.1, z, group, { rotY: Math.random() * Math.PI });
  }

  addDust(group, 50, 9, 0xa08d6b);
  group.userData.refs = refs;
  return { group, refs, colliders, spawn: new THREE.Vector3(0, 1.7, 4.8), bounds: { minX: -5.5, maxX: 5.5, minZ: -6.4, maxZ: 6.2 } };
}

export function buildVent() {
  const group = new THREE.Group();
  const refs = {};
  const colliders = [];
  const startZ = 6.5;
  const endZ = -14;
  const spawn = new THREE.Vector3(0, 1.65, startZ);
  const width = 2.2;
  const chamberWidth = 4.6;
  const chamberStart = -5.5;

  // floor segments
  box(width, 0.2, 12, 0x242a27, 0, -0.1, 0.5, group); // start corridor z 6.5..-5.5
  box(chamberWidth, 0.2, 8.5, 0x1e2422, 0, -0.1, -9.75, group); // chamber z -5.5..-14
  // ceilings
  box(width, 0.15, 12, 0x111716, 0, 2.35, 0.5, group);
  box(chamberWidth, 0.15, 8.5, 0x0f1413, 0, 2.9, -9.75, group);
  // side walls corridor
  for (const side of [-1, 1]) {
    box(0.18, 2.5, 12, 0x28312d, side * (width / 2 + 0.09), 1.2, 0.5, group);
    colliders.push({ minX: side * (width / 2) - 0.15, maxX: side * (width / 2) + 0.15, minZ: -5.5, maxZ: 6.5 });
  }
  // chamber walls
  for (const side of [-1, 1]) {
    box(0.2, 3.0, 8.5, 0x242d29, side * (chamberWidth / 2 + 0.1), 1.45, -9.75, group);
    colliders.push({ minX: side * (chamberWidth / 2) - 0.15, maxX: side * (chamberWidth / 2) + 0.15, minZ: -14, maxZ: -5.5 });
  }
  // transition walls at chamber mouth
  for (const side of [-1, 1]) {
    box(1.3, 2.6, 0.2, 0x252d29, side * 1.75, 1.25, chamberStart, group);
    colliders.push({ minX: side * 1.75 - 0.65, maxX: side * 1.75 + 0.65, minZ: chamberStart - 0.15, maxZ: chamberStart + 0.15 });
  }
  // crawl section: lower ceiling, visual beam
  box(width, 0.14, 3.2, 0x171d1a, 0, 1.05, -3.8, group);
  refs.crawlZone = { minZ: -5.4, maxZ: -2.2 };
  // end wall with hatch
  box(chamberWidth, 3.0, 0.2, 0x1b2220, 0, 1.4, endZ, group);
  colliders.push({ minX: -chamberWidth / 2, maxX: chamberWidth / 2, minZ: endZ - 0.2, maxZ: endZ + 0.1 });
  // hatch
  box(1.5, 1.8, 0.12, 0x2f3833, 0, 0.9, endZ + 0.12, group);
  for (let i = 0; i < 5; i++) box(1.2, 0.05, 0.03, 0x121714, 0, 0.25 + i * 0.3, endZ + 0.2, group);
  const exitLight = pointLight(0x9bc17a, 0.8, 4, 0, 0.9, endZ + 0.8, group, { decay: 1.5 });
  refs.exit = new THREE.Vector3(0, 0, endZ + 1.0);
  refs.exitLight = exitLight;

  // pipes
  for (let i = 0; i < 4; i++) {
    cyl(0.055, 0.055, 11.5, 6, 0x3b4641, -0.95 + i * 0.06, 2.0 - (i % 2) * 0.14, 0.5, group, { rotX: Math.PI / 2 });
  }
  cyl(0.08, 0.08, 7.5, 6, 0x3a4641, 2.15, 2.3, -9.5, group, { rotX: Math.PI / 2 });

  // grates / vents on walls
  for (let i = 0; i < 5; i++) {
    const z = 4.5 - i * 2.6;
    box(0.9, 0.55, 0.06, 0x1a211f, -width / 2 + 0.2, 1.4, z, group);
    for (let j = 0; j < 4; j++) box(0.8, 0.04, 0.03, 0x0c100e, -width / 2 + 0.24, 1.2 + j * 0.12, z + 0.04, group);
  }

  // debris / cans
  for (let i = 0; i < 12; i++) {
    const z = 5 - Math.random() * 10;
    box(0.12 + Math.random() * 0.25, 0.08, 0.12 + Math.random() * 0.25, 0x3c3225, (Math.random() - 0.5) * 1.5, 0.08, z, group, { rotY: Math.random() * 3 });
  }

  // body against the wall, before the crawl
  const body = new THREE.Group();
  const torso = box(0.42, 0.6, 0.24, 0x3b4038, 0, 0.32, 0, body, { rotZ: 1.35, rotY: 0.3 });
  const head = sphere(0.13, 7, 5, 0x8f7d68, 0.52, 0.28, 0.05, body);
  const legs = [box(0.13, 0.6, 0.15, 0x282d28, -0.42, 0.24, 0.12, body, { rotZ: 0.5 }), box(0.13, 0.58, 0.15, 0x282d28, -0.35, 0.22, -0.18, body, { rotZ: 0.8 })];
  body.position.set(-0.72, 0, 1.4);
  body.rotation.y = -0.9;
  group.add(body);
  refs.body = body;
  refs.bodyPos = new THREE.Vector3(-0.72, 0, 1.4);
  refs.looted = false;

  // crawler, hidden
  const crawler = makeCrawler();
  crawler.position.set(1.1, 0, -8.0);
  crawler.rotation.y = -1.1;
  crawler.visible = true; // visible in the dark before it lunges
  group.add(crawler);
  refs.crawler = crawler;
  refs.crawlerStart = new THREE.Vector3(1.1, 0, -8.0);
  refs.crawlerTriggerZ = -6.6;

  // emergency lights
  const lights = [];
  for (let i = 0; i < 4; i++) {
    const z = 5 - i * 4.5;
    const l = pointLight(0x7fa36a, 0.32, 3.4, 0, 1.9, z, group, { decay: 2.0 });
    lights.push(l);
    box(0.18, 0.06, 0.3, 0x7fa36a, 0, 2.15, z, group, { material: basic(0x3d5a3d) });
  }
  refs.lights = lights;

  // side alcove / cover
  box(1.2, 0.1, 1.4, 0x1b221f, 1.8, 0.05, -9.8, group);
  for (let i = 0; i < 5; i++) {
    box(0.08, 0.8, 0.08, 0x323b35, 2.25, 0.5, -10.4 + i * 0.28, group);
  }

  addDust(group, 55, 7, 0x84907f);
  group.userData.refs = refs;
  return { group, refs, colliders, spawn, bounds: { minX: -chamberWidth / 2 + 0.3, maxX: chamberWidth / 2 - 0.3, minZ: endZ + 0.6, maxZ: 6.2 }, crawlZone: refs.crawlZone };
}

export function makeDustParticles() {}
