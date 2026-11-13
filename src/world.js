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
  flesh: 0x8a5c42,
  cloth: 0x2a3532,
  green: 0x85a66a,
  red: 0x7d1f16,
};

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + "|" + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = toonMat(color, opts);
  matCache.set(key, m);
  return m;
}
export function basic(color, opts = {}) {
  return new THREE.MeshBasicMaterial({ color, ...opts });
}

let _toonGradient = null;
export function toonGradient() {
  if (_toonGradient) return _toonGradient;
  const data = new Uint8Array([60, 150, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  _toonGradient = tex;
  return tex;
}

export function toonMat(color, opts = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient(),
    ...opts,
  });
}

const _outlineMat = new THREE.MeshBasicMaterial({
  color: 0x070b09,
  side: THREE.BackSide,
});

export function outlineGroup(group, thickness = 1.035) {
  if (!group) return group;
  const outline = group.clone(true);
  outline.scale.multiplyScalar(thickness);
  outline.traverse((obj) => {
    if (obj.isMesh) {
      obj.material = _outlineMat;
      obj.userData.outline = true;
    }
  });
  group.add(outline);
  return group;
}

const _surfaceCache = new Map();
export function surfaceTexture(kind = "metal", opts = {}) {
  const size = opts.size ?? 256;
  const repeat = opts.repeat ?? [1, 1];
  const key = `${kind}|${size}|${repeat[0]}x${repeat[1]}`;
  if (_surfaceCache.has(key)) return _surfaceCache.get(key);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rnd = (min, max) => min + Math.random() * (max - min);

  if (kind === "wood") {
    ctx.fillStyle = "#c9a878";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 5; i++) {
      const y = (i / 5) * size;
      ctx.fillStyle = i % 2 ? "rgba(90, 58, 30, 0.16)" : "rgba(255, 235, 200, 0.06)";
      ctx.fillRect(0, y, size, size / 5);
      ctx.strokeStyle = "rgba(60, 38, 20, 0.42)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    for (let i = 0; i < 70; i++) {
      ctx.strokeStyle = `rgba(80, 50, 24, ${rnd(0.04, 0.16)})`;
      ctx.lineWidth = rnd(0.5, 1.6);
      ctx.beginPath();
      const y = rnd(0, size);
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y + rnd(-8, 8), size * 0.7, y + rnd(-8, 8), size, y + rnd(-4, 4));
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "rgba(54, 34, 16, 0.28)";
      ctx.beginPath();
      ctx.ellipse(rnd(10, size - 10), rnd(10, size - 10), rnd(2, 5), rnd(4, 9), rnd(0, 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "concrete") {
    ctx.fillStyle = "#b9beb4";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2200; i++) {
      const g = Math.floor(rnd(70, 190));
      ctx.fillStyle = `rgba(${g},${g + 4},${g},${rnd(0.04, 0.16)})`;
      ctx.fillRect(rnd(0, size), rnd(0, size), rnd(1, 3), rnd(1, 3));
    }
    ctx.strokeStyle = "rgba(20, 26, 22, 0.62)";
    ctx.lineWidth = 5;
    for (let i = 0; i <= 2; i++) {
      const p = (i / 2) * size;
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = `rgba(40, 48, 38, ${rnd(0.04, 0.12)})`;
      ctx.beginPath();
      ctx.ellipse(rnd(0, size), rnd(0, size), rnd(6, 26), rnd(3, 14), rnd(0, 3), 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = `rgba(40, 44, 38, ${rnd(0.15, 0.35)})`;
      ctx.lineWidth = rnd(0.6, 1.3);
      ctx.beginPath();
      let x = rnd(0, size), y = rnd(0, size);
      ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += rnd(-26, 26); y += rnd(6, 22);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (kind === "tile") {
    ctx.fillStyle = "#b5bcb0";
    ctx.fillRect(0, 0, size, size);
    const step = size / 4;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        ctx.fillStyle = (x + y) % 2 ? "rgba(255,255,255,0.055)" : "rgba(50,60,52,0.08)";
        ctx.fillRect(x * step + 3, y * step + 3, step - 6, step - 6);
      }
    }
    ctx.strokeStyle = "rgba(18, 24, 20, 0.7)";
    ctx.lineWidth = 6;
    for (let i = 0; i <= 4; i++) {
      const p = i * step;
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    }
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(60, 54, 32, ${rnd(0.03, 0.1)})`;
      ctx.beginPath();
      ctx.ellipse(rnd(0, size), rnd(0, size), rnd(3, 18), rnd(2, 8), rnd(0, 3), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "plaster") {
    ctx.fillStyle = "#b7b2a4";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1600; i++) {
      const g = Math.floor(rnd(90, 190));
      ctx.fillStyle = `rgba(${g},${g - 4},${g - 12},${rnd(0.03, 0.12)})`;
      ctx.fillRect(rnd(0, size), rnd(0, size), rnd(1, 4), rnd(1, 4));
    }
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgba(70, 64, 52, ${rnd(0.12, 0.28)})`;
      ctx.lineWidth = rnd(0.6, 1.2);
      ctx.beginPath();
      let x = rnd(0, size), y = rnd(0, size);
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += rnd(-18, 18); y += rnd(8, 26);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else {
    // riveted metal panels
    ctx.fillStyle = "#c3c8bd";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1600; i++) {
      const g = Math.floor(rnd(80, 200));
      ctx.fillStyle = `rgba(${g},${g + 2},${g},${rnd(0.03, 0.13)})`;
      ctx.fillRect(rnd(0, size), rnd(0, size), rnd(1, 3), rnd(1, 3));
    }
    // large panel seams
    ctx.strokeStyle = "rgba(16, 24, 20, 0.88)";
    ctx.lineWidth = 9;
    for (let i = 1; i < 3; i++) {
      const p = (i / 3) * size;
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    }
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, size, size);
    // panel highlights
    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const p = (i / 3) * size + 3;
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
    }
    // rivets
    for (let i = 0; i < 70; i++) {
      const x = rnd(6, size - 6), y = rnd(6, size - 6);
      ctx.fillStyle = "rgba(50,58,52,0.55)";
      ctx.beginPath(); ctx.arc(x, y, rnd(1.2, 2.6), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath(); ctx.arc(x - 0.6, y - 0.6, 0.9, 0, Math.PI * 2); ctx.fill();
    }
    // rust streaks
    for (let i = 0; i < 9; i++) {
      const x = rnd(0, size), w = rnd(2, 7), h = rnd(18, 84);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(128, 66, 30, 0.24)");
      grad.addColorStop(1, "rgba(128, 66, 30, 0)");
      ctx.fillStyle = grad;
      ctx.save();
      ctx.translate(x, rnd(0, size));
      ctx.fillRect(-w / 2, 0, w, h);
      ctx.restore();
    }
    // scratches
    for (let i = 0; i < 24; i++) {
      ctx.strokeStyle = `rgba(40, 46, 42, ${rnd(0.08, 0.24)})`;
      ctx.lineWidth = rnd(0.4, 1.1);
      ctx.beginPath();
      ctx.moveTo(rnd(0, size), rnd(0, size));
      ctx.lineTo(rnd(0, size), rnd(0, size));
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  _surfaceCache.set(key, tex);
  return tex;
}

let _glowTex = null;
export function glowTexture() {
  if (_glowTex) return _glowTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  _glowTex = new THREE.CanvasTexture(canvas);
  _glowTex.colorSpace = THREE.SRGBColorSpace;
  return _glowTex;
}

const _glowMats = new Map();
export function addGlow(parent, color, x, y, z, scale = 1, opacity = 0.35) {
  const key = `${color}|${opacity}`;
  let material = _glowMats.get(key);
  if (!material) {
    material = new THREE.SpriteMaterial({
      map: glowTexture(),
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    _glowMats.set(key, material);
  }
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(scale, scale, 1);
  parent.add(sprite);
  return sprite;
}

export function addLightShaft(parent, color, x, y, z, height = 3, radius = 1.2, opacity = 0.05) {
  const geo = new THREE.CylinderGeometry(0.06, radius, height, 12, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y - height / 2, z);
  parent.add(mesh);
  return mesh;
}

const _stationSigns = new Map();
function stationSign(text, fg = "#ffe08a", bg = "#141a17") {
  const key = `${text}|${fg}|${bg}`;
  if (_stationSigns.has(key)) return _stationSigns.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = "#39443d";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 152);

  ctx.strokeStyle = fg;
  ctx.fillStyle = fg;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // station roof and columns
  ctx.beginPath();
  ctx.moveTo(150, 86);
  ctx.lineTo(256, 32);
  ctx.lineTo(362, 86);
  ctx.stroke();
  ctx.strokeRect(158, 90, 18, 46);
  ctx.strokeRect(336, 90, 18, 46);
  // central arched doorway
  ctx.beginPath();
  ctx.arc(256, 110, 28, Math.PI, Math.PI * 2);
  ctx.lineTo(284, 136);
  ctx.lineTo(228, 136);
  ctx.closePath();
  ctx.stroke();
  // small clock / lamp
  ctx.beginPath();
  ctx.arc(256, 62, 7, 0, Math.PI * 2);
  ctx.fill();
  // low city skyline at the edges
  for (const [x, h, w] of [[46, 34, 24], [76, 22, 18], [104, 44, 22], [390, 40, 22], [418, 26, 18], [444, 48, 24]]) {
    ctx.strokeRect(x, 136 - h, w, h);
  }
  // rail line and sleepers
  ctx.strokeStyle = fg;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(34, 142);
  ctx.lineTo(478, 142);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let x = 46; x < 470; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 134);
    ctx.lineTo(x + 10, 150);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  const m = new THREE.MeshBasicMaterial({ map: tex });
  _stationSigns.set(key, m);
  return m;
}

let _cityWindowMat = null;
function cityWindowMaterial() {
  if (_cityWindowMat) return _cityWindowMat;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, "#07101e");
  sky.addColorStop(0.55, "#123044");
  sky.addColorStop(1, "#1b4a55");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = "rgba(210,235,225,0.8)";
  ctx.beginPath();
  ctx.arc(390, 74, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(6, 12, 16, 0.95)";
  for (let i = 0; i < 18; i++) {
    const w = 18 + Math.random() * 34;
    const h = 45 + Math.random() * 160;
    const x = i * 30 - 10;
    ctx.fillRect(x, 320 - h, w, h);
    for (let k = 0; k < 4; k++) {
      if (Math.random() < 0.4) {
        ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,190,90,0.7)" : "rgba(110,210,190,0.6)";
        ctx.fillRect(x + 5 + Math.random() * (w - 10), 320 - h + 8 + Math.random() * (h - 20), 3, 5);
        ctx.fillStyle = "rgba(6, 12, 16, 0.95)";
      }
    }
  }
  for (let i = 0; i < 80; i++) {
    ctx.strokeStyle = `rgba(150, 200, 210, ${0.04 + Math.random() * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const x = Math.random() * 512;
    const y = Math.random() * 320;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y + 18);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  _cityWindowMat = new THREE.MeshBasicMaterial({ map: tex });
  return _cityWindowMat;
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

export function makeHumanoid({ skin = C.flesh, coat = C.cloth, pants = 0x1a211f, hair = 0x241a13, child = false, shoes = 0x14100c, outline = true } = {}) {
  const g = new THREE.Group();
  const s = child ? 0.66 : 1;
  const skinMat = mat(skin);
  const coatMat = mat(coat);
  const pantsMat = mat(pants);
  const hairMat = mat(hair);
  const shoeMat = mat(shoes);
  // rounded torso, coat skirt, collar
  sphere(0.3 * s, 10, 8, coat, 0, 1.04 * s, 0, g, { material: coatMat, sx: 0.76, sy: 1.02, sz: 0.6 });
  cyl(0.19 * s, 0.24 * s, 0.34 * s, 10, coat, 0, 0.78 * s, 0, g, { material: coatMat });
  cyl(0.205 * s, 0.205 * s, 0.07 * s, 10, 0x171b17, 0, 0.62 * s, 0, g);
  box(0.09 * s, 0.07 * s, 0.04 * s, 0xc9a04a, 0, 0.62 * s, 0.17 * s, g);
  cyl(0.11 * s, 0.2 * s, 0.11 * s, 10, 0x1a2420, 0, 1.3 * s, 0, g);
  cyl(0.06 * s, 0.07 * s, 0.12 * s, 8, skin, 0, 1.37 * s, 0, g, { material: skinMat });
  // organic low-poly head
  sphere(0.17 * s, 12, 10, skin, 0, 1.49 * s, 0.01 * s, g, { material: skinMat, sx: 0.95, sy: 1.05, sz: 0.95 });
  sphere(0.1 * s, 8, 6, skin, 0, 1.39 * s, 0.075 * s, g, { material: skinMat, sx: 1.05, sy: 0.65, sz: 0.8 });
  sphere(0.175 * s, 10, 6, hair, 0, 1.58 * s, -0.01 * s, g, { material: hairMat, sx: 1.02, sy: 0.55, sz: 1.0 });
  sphere(0.12 * s, 8, 5, hair, 0, 1.55 * s, 0.1 * s, g, { material: hairMat, sx: 1.1, sy: 0.4, sz: 0.5 });
  for (const side of [-1, 1]) {
    sphere(0.035 * s, 6, 5, skin, side * 0.16 * s, 1.49 * s, 0.01 * s, g, { material: skinMat });
    sphere(0.032 * s, 8, 6, 0xe9e1cd, side * 0.065 * s, 1.5 * s, 0.155 * s, g);
    sphere(0.014 * s, 6, 4, 0x101412, side * 0.065 * s, 1.5 * s, 0.185 * s, g);
    box(0.075 * s, 0.02 * s, 0.02 * s, hair, side * 0.066 * s, 1.56 * s, 0.155 * s, g, { material: hairMat, rotZ: side * 0.12 });
  }
  sphere(0.04 * s, 7, 5, skin, 0, 1.44 * s, 0.17 * s, g, { material: skinMat, sx: 1.0, sy: 0.85, sz: 1.2 });
  box(0.08 * s, 0.02 * s, 0.02 * s, 0x5c3a32, 0, 1.39 * s, 0.16 * s, g);
  // arms
  for (const side of [-1, 1]) {
    const sideX = side * 0.29 * s;
    sphere(0.085 * s, 7, 5, coat, sideX, 1.25 * s, 0, g, { material: coatMat });
    cyl(0.06 * s, 0.055 * s, 0.34 * s, 6, coat, sideX, 1.06 * s, 0, g, { material: coatMat, rotZ: side * 0.08 });
    cyl(0.052 * s, 0.05 * s, 0.3 * s, 6, coat, sideX + side * 0.025 * s, 0.79 * s, 0.01 * s, g, { material: coatMat, rotZ: side * 0.12 });
    sphere(0.062 * s, 6, 5, skin, sideX + side * 0.04 * s, 0.62 * s, 0.03 * s, g, { material: skinMat });
  }
  // legs and rounded boots
  for (const side of [-1, 1]) {
    const sideX = side * 0.12 * s;
    cyl(0.075 * s, 0.07 * s, 0.34 * s, 8, pants, sideX, 0.48 * s, 0, g, { material: pantsMat });
    cyl(0.065 * s, 0.06 * s, 0.3 * s, 8, pants, sideX, 0.24 * s, 0, g, { material: pantsMat });
    cyl(0.07 * s, 0.08 * s, 0.18 * s, 8, shoes, sideX, 0.12 * s, 0.01 * s, g, { material: shoeMat });
    sphere(0.075 * s, 8, 5, shoes, sideX, 0.07 * s, 0.14 * s, g, { material: shoeMat, sx: 1.0, sy: 0.7, sz: 1.3 });
  }
  if (outline) outlineGroup(g);
  return g;
}

export function makeTenant(height = 2.45) {
  const g = new THREE.Group();
  const blackMat = mat(0x020202);
  const torso = cyl(0.17, 0.24, height * 0.55, 8, 0x020202, 0, height * 0.52, 0, g, { material: blackMat });
  const neck = cyl(0.055, 0.07, height * 0.12, 6, 0x020202, 0, height * 0.76, 0, g, { material: blackMat });
  const head = sphere(0.19, 10, 8, 0x020202, 0, height * 0.86, 0, g, { material: blackMat, sy: 1.28 });
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.235, height * 0.69, 0);
    cyl(0.055, 0.043, height * 0.46, 6, 0x020202, 0, -height * 0.23, 0, arm, { material: blackMat });
    cyl(0.04, 0.035, height * 0.28, 6, 0x020202, side * 0.012, -height * 0.5, 0.035, arm, { material: blackMat, rotX: -0.12 });
    sphere(0.052, 7, 5, 0x020202, side * 0.015, -height * 0.65, 0.07, arm, { material: blackMat, sy: 1.1 });
    for (let i = 0; i < 3; i++) {
      cyl(0.006, 0.014, height * 0.09, 4, 0x020202, side * 0.015 - 0.03 + i * 0.03, -height * 0.72, 0.09, arm, { material: blackMat, rotX: 0.25 + i * 0.08 });
    }
    g.add(arm);
    arms.push(arm);
  }
  for (const side of [-1, 1]) {
    cyl(0.075, 0.06, height * 0.46, 6, 0x020202, side * 0.1, height * 0.23, 0, g, { material: blackMat, rotZ: side * 0.02 });
    sphere(0.08, 7, 5, 0x020202, side * 0.1, 0.03, 0.02, g, { material: blackMat, sx: 0.8, sy: 0.5, sz: 1.3 });
  }
  g.userData.tenant = {
    head,
    neck,
    torso,
    arms,
    baseY: null,
    phase: Math.random() * Math.PI * 2,
  };
  // no face, no reflection; intentionally a hole
  return g;
}

export function makeRat({ scale = 1, brood = false } = {}) {
  const g = new THREE.Group();
  const bodyColor = brood ? 0x4a3524 : 0x6b4a2c;
  const body = sphere(0.38, 8, 6, bodyColor, 0, 0.42, 0, g, { sx: 1.5, sy: 0.85, sz: 0.85 });
  body.name = "body";
  const head = sphere(0.24, 8, 6, brood ? 0x563e2a : 0x7a5638, 0.52, 0.46, 0, g, { sx: 1.15, sy: 0.9, sz: 0.9 });
  head.name = "head";
  // ears
  for (const side of [-1, 1]) {
    cyl(0.1, 0.12, 0.03, 6, 0x3a2818, 0.56, 0.67, side * 0.14, g, { rotX: Math.PI / 2 });
  }
  // snout + teeth
  box(0.18, 0.12, 0.14, 0x2f2116, 0.73, 0.43, 0, g);
  for (const side of [-1, 1]) {
    cyl(0.01, 0.025, 0.09, 5, 0xd9d0b0, 0.8, 0.36, side * 0.045, g, { rotX: Math.PI });
  }
  // eyes, catching the flashlight
  sphere(0.025, 6, 4, 0x120d0a, 0.68, 0.5, 0.11, g);
  sphere(0.025, 6, 4, 0x120d0a, 0.68, 0.5, -0.11, g);
  sphere(0.012, 5, 4, 0xd06a3a, 0.7, 0.51, 0.12, g, { material: basic(0xd06a3a) });
  sphere(0.012, 5, 4, 0xd06a3a, 0.7, 0.51, -0.12, g, { material: basic(0xd06a3a) });
  // exposed spine and ribs
  for (let i = 0; i < 4; i++) {
    box(0.05, 0.08, 0.08, 0x8a6a45, -0.18 + i * 0.14, 0.72, 0, g);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      box(0.03, 0.12, 0.03, 0x9a7a52, -0.06 + i * 0.16, 0.5, side * 0.3, g, { rotZ: side * 0.5 });
    }
  }
  // tail
  cyl(0.025, 0.01, 0.9, 5, 0x3a2818, -0.7, 0.33, 0, g, { rotZ: -0.3, rotX: 0.1 });
  // legs
  for (const side of [-1, 1]) {
    for (const front of [-0.2, 0.28]) {
      box(0.09, 0.3, 0.09, 0x3a2818, front, 0.15, side * 0.18, g);
    }
  }
  g.scale.setScalar(scale);
  outlineGroup(g, 1.05);
  return g;
}

export function makeCrawler() {
  const g = new THREE.Group();
  const pale = 0xb8b39d;
  const pale2 = 0x9c9782;
  const dark = 0x241d18;
  // low, long organic body
  sphere(0.32, 10, 7, pale2, 0, 0.64, 0, g, { sx: 0.9, sy: 0.62, sz: 1.7 });
  sphere(0.26, 8, 6, 0x8a8574, 0, 0.52, 0.05, g, { sx: 1.0, sy: 0.45, sz: 1.4 });
  // exposed spine ridges
  for (let i = 0; i < 5; i++) {
    cyl(0.015, 0.055, 0.15, 5, pale, 0, 0.83, -0.35 + i * 0.17, g, { rotX: -0.25 });
  }
  // ribs
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cyl(0.016, 0.016, 0.26, 5, 0x8c8774, side * 0.23, 0.6, -0.25 + i * 0.22, g, { rotZ: side * 0.7, rotX: 0.15 });
    }
  }
  // elongated head and snout
  sphere(0.26, 10, 7, pale, 0, 0.78, 0.55, g, { sx: 1.1, sy: 0.85, sz: 1.15 });
  sphere(0.14, 8, 6, pale2, 0, 0.7, 0.8, g, { sx: 1.0, sy: 0.72, sz: 1.2 });
  box(0.2, 0.07, 0.12, 0x0a0807, 0, 0.66, 0.87, g);
  // teeth
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cyl(0.008, 0.022, 0.09, 5, 0xd9d0b0, side * (0.025 + i * 0.03), 0.62, 0.9, g, { rotX: Math.PI });
    }
  }
  // black eye pits, no eyes
  sphere(0.035, 6, 4, 0x080605, 0.09, 0.82, 0.78, g);
  sphere(0.035, 6, 4, 0x080605, -0.09, 0.82, 0.78, g);
  // long arms with claws
  for (const side of [-1, 1]) {
    sphere(0.095, 7, 5, pale, side * 0.27, 0.7, 0.3, g);
    cyl(0.055, 0.045, 0.5, 6, pale, side * 0.33, 0.42, 0.4, g, { rotX: -0.55, rotZ: side * 0.15 });
    cyl(0.045, 0.035, 0.42, 6, pale2, side * 0.38, 0.1, 0.68, g, { rotX: -0.25, rotZ: side * 0.1 });
    for (let i = 0; i < 3; i++) {
      cyl(0.005, 0.016, 0.18, 5, 0x6b6556, side * (0.32 + i * 0.04), 0.02, 0.82, g, { rotX: 0.25 });
    }
  }
  // back legs
  for (const side of [-1, 1]) {
    sphere(0.09, 7, 5, pale2, side * 0.2, 0.5, -0.35, g);
    cyl(0.06, 0.05, 0.55, 6, pale2, side * 0.2, 0.32, -0.42, g, { rotX: 0.78 });
    cyl(0.05, 0.04, 0.4, 6, pale2, side * 0.2, 0.08, -0.68, g, { rotX: 0.25 });
    for (let i = 0; i < 3; i++) {
      cyl(0.005, 0.014, 0.14, 5, 0x6b6556, side * (0.13 + i * 0.04), 0.01, -0.82, g, { rotX: -0.2 });
    }
  }
  g.rotation.x = -0.08;
  outlineGroup(g, 1.045);
  return g;
}

let _gunMetalMat = null;
let _gunWoodMat = null;
function gunMetal() {
  if (!_gunMetalMat) {
    _gunMetalMat = toonMat(0x3a4a48);
  }
  return _gunMetalMat;
}
function gunWood() {
  if (!_gunWoodMat) {
    _gunWoodMat = toonMat(0x6b4426);
  }
  return _gunWoodMat;
}

export function makePistol() {
  const g = new THREE.Group();
  box(0.1, 0.12, 0.28, 0x2b3332, 0, 0, 0, g, { material: gunMetal() });
  box(0.045, 0.045, 0.26, 0x171d1c, 0, 0.02, -0.3, g, { material: gunMetal() });
  box(0.02, 0.03, 0.03, 0x101412, 0, 0.085, -0.2, g);
  box(0.06, 0.16, 0.09, 0x1b2221, 0, -0.12, 0.03, g, { rotX: -0.22, material: gunWood() });
  box(0.02, 0.032, 0.09, 0x2b3332, 0, -0.065, 0.0, g, { material: gunMetal() });
  box(0.04, 0.04, 0.04, 0x6b5b3e, 0, 0.03, -0.42, g);
  return g;
}

export function makeShotgun() {
  const g = new THREE.Group();
  box(0.09, 0.1, 0.5, 0x3a2c21, 0, 0, -0.08, g, { material: gunWood() });
  cyl(0.032, 0.032, 0.58, 6, 0x222a28, 0, 0.035, -0.27, g, { rotX: Math.PI / 2, material: gunMetal() });
  cyl(0.028, 0.028, 0.56, 6, 0x1b2220, -0.045, 0.005, -0.26, g, { rotX: Math.PI / 2, material: gunMetal() });
  box(0.1, 0.13, 0.2, 0x4a3626, 0, -0.03, 0.2, g, { rotX: -0.12, material: gunWood() });
  box(0.06, 0.08, 0.16, 0x2a1f17, 0, -0.12, 0.27, g, { material: gunWood() });
  return g;
}

export function makeRifle() {
  const g = new THREE.Group();
  box(0.08, 0.09, 0.72, 0x2b322d, 0, 0, -0.16, g, { material: gunMetal() });
  cyl(0.025, 0.025, 0.8, 6, 0x1b211f, 0, 0.02, -0.46, g, { rotX: Math.PI / 2, material: gunMetal() });
  box(0.11, 0.15, 0.22, 0x3b2c20, 0, -0.02, 0.2, g, { rotX: -0.1, material: gunWood() });
  box(0.07, 0.07, 0.2, 0x1d2421, 0, 0.11, -0.1, g, { material: gunMetal() });
  cyl(0.035, 0.035, 0.16, 6, 0x0d1210, 0, 0.19, -0.12, g, { rotX: Math.PI / 2, material: gunMetal() });
  return g;
}

export function makeScavenger({ coat = 0x2a2b25, gun = true } = {}) {
  const g = makeHumanoid({ coat, pants: 0x181d1a, hair: 0x1e1711, outline: false });
  // hood and shoulder rags
  box(0.3, 0.16, 0.28, 0x1f2420, 0, 1.58, -0.02, g);
  box(0.36, 0.12, 0.3, 0x232a25, 0.02, 1.5, -0.03, g, { rotZ: 0.04 });
  box(0.46, 0.08, 0.26, 0x20261f, 0, 1.26, 0, g);
  // rounded respirator mask
  sphere(0.12, 8, 6, 0x141a17, 0, 1.41, 0.12, g, { sx: 1.2, sy: 0.85, sz: 0.85 });
  for (const side of [-1, 1]) {
    cyl(0.052, 0.052, 0.1, 7, 0x2d3530, side * 0.075, 1.36, 0.2, g, { rotX: Math.PI / 2 });
    cyl(0.058, 0.058, 0.025, 7, 0x0c1110, side * 0.075, 1.36, 0.255, g, { rotX: Math.PI / 2 });
  }
  box(0.06, 0.03, 0.03, 0x0b0f0d, 0, 1.46, 0.2, g);
  // goggle lenses, sickly and reflective
  for (const side of [-1, 1]) {
    cyl(0.052, 0.052, 0.025, 8, 0x7d2a1a, side * 0.062, 1.51, 0.135, g, { rotX: Math.PI / 2, material: basic(0x8a3420) });
    cyl(0.064, 0.064, 0.018, 8, 0x2a211a, side * 0.062, 1.51, 0.12, g, { rotX: Math.PI / 2 });
  }
  // head strap and hose
  box(0.29, 0.035, 0.06, 0x181d1a, 0, 1.52, 0.02, g);
  cyl(0.022, 0.022, 0.36, 5, 0x171d1a, 0.14, 1.22, 0.14, g, { rotX: 0.25, rotZ: -0.5 });
  // air tank on the back
  cyl(0.08, 0.08, 0.46, 7, 0x37413b, -0.05, 1.08, -0.18, g);
  cyl(0.085, 0.085, 0.03, 7, 0x161c19, -0.05, 1.32, -0.18, g);
  cyl(0.085, 0.085, 0.03, 7, 0x161c19, -0.05, 0.84, -0.18, g);
  // belt kit
  box(0.28, 0.06, 0.1, 0x191f1b, 0, 0.78, 0.12, g);
  box(0.1, 0.16, 0.08, 0x2d352f, 0.18, 0.74, 0.12, g, { rotZ: 0.1 });
  if (gun) {
    const rifle = makeRifle();
    rifle.scale.set(0.9, 0.9, 0.9);
    rifle.position.set(0.25, 1.03, 0.12);
    rifle.rotation.set(0.12, -0.12, -0.3);
    g.add(rifle);
  }
  outlineGroup(g, 1.03);
  return g;
}

export function addDust(parent, count = 40, area = 6, color = 0x7c8b7e) {
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
  const floorMat = toonMat(floor, {
    map: surfaceTexture("wood", { repeat: [7, 6] }),
  });
  const wallMat = toonMat(wall, {
    map: surfaceTexture("plaster", { repeat: [4, 2] }),
  });
  const sideWallMat = toonMat(0x1d2b27, {
    map: surfaceTexture("plaster", { repeat: [4, 2] }),
  });
  const tableMat = toonMat(0x7a5230, {
    map: surfaceTexture("wood", { repeat: [3, 2] }),
  });

  box(8, 0.2, 7, floor, 0, -0.1, 0, group, { material: floorMat });
  box(8, 3.1, 0.2, wall, 0, 1.55, -3.5, group, { material: wallMat });
  box(8, 3.1, 0.2, 0x1b2825, 0, 1.55, 3.5, group, { material: sideWallMat });
  box(0.2, 3.1, 7, 0x1d2b27, -4, 1.55, 0, group, { material: sideWallMat });
  box(0.2, 3.1, 7, 0x1d2b27, 4, 1.55, 0, group, { material: sideWallMat });
  box(8, 0.15, 7, 0x19201e, 0, 3.05, 0, group);

  // baseboards / panels
  for (const x of [-3.1, -1.0, 1.1, 3.2]) box(1.65, 0.08, 0.06, 0x33413a, x, 0.1, -3.39, group);

  // table
  box(2.8, 0.12, 1.5, C.wood2, 0, 0.76, 0, group, { material: tableMat });
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
  addGlow(group, flashback ? 0xff7958 : 0xffc078, 0, 2.25, 0, 1.2, 0.28);
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

  // rug under the table
  plane(3.8, 2.7, 0xffffff, 0, 0.012, 0, group, { rotX: -Math.PI / 2, material: toonMat(0x5a241e) });
  plane(3.1, 2.1, 0xffffff, 0, 0.015, 0, group, { rotX: -Math.PI / 2, material: toonMat(0x7a4a2a) });

  // sideboard and shelf against the left wall
  box(0.55, 0.9, 2.0, 0x4a3322, -3.6, 0.45, 1.0, group);
  box(0.65, 0.08, 2.1, 0x6b4a2e, -3.58, 0.94, 1.0, group);
  for (const z of [0.2, 1.0, 1.8]) {
    box(0.55, 0.02, 0.02, 0x2a1c12, -3.32, 0.6, z, group);
    box(0.03, 0.06, 0.08, 0xc8a24a, -3.3, 0.75, z, group);
  }
  for (let i = 0; i < 4; i++) {
    cyl(0.07, 0.07, 0.06, 8, 0xb7ad93, -3.58, 1.02, 0.2 + i * 0.5, group);
    cyl(0.045, 0.045, 0.16, 8, 0x9e9075, -3.58, 1.09, 0.2 + i * 0.5, group);
  }
  box(0.5, 0.35, 0.4, 0x2a302c, -3.55, 1.18, 1.6, group);
  box(0.2, 0.1, 0.03, 0x8fbf7a, -3.55, 1.22, 1.82, group, { material: basic(0x8fbf7a) });

  // wainscot, wall ribs and ceiling beams
  for (const side of [-1, 1]) {
    box(0.06, 0.12, 7, 0x3a4a3e, side * 3.94, 1.0, 0, group);
    for (const z of [-2.6, -0.4, 1.8]) {
      box(0.07, 3.0, 0.1, 0x1d2b27, side * 3.92, 1.55, z, group);
    }
  }
  for (const x of [-2.6, 0, 2.6]) {
    box(0.12, 0.12, 7, 0x19201e, x, 3.0, 0, group);
  }

  // window curtains
  for (const x of [1.02, 2.98]) {
    plane(0.38, 1.55, 0xffffff, x, 1.72, -3.28, group, { material: toonMat(0x7a3226, { side: THREE.DoubleSide }) });
    box(0.07, 0.06, 0.07, 0xc8a24a, x - 0.18, 2.52, -3.28, group);
  }

  // framed pictures and a clock
  for (const [x, y, z, ry, color] of [[-3.9, 2.15, 0.2, Math.PI / 2, 0x3a4a3e], [-3.9, 1.8, -1.2, Math.PI / 2, 0x7a3a2a], [3.9, 2.1, -0.8, -Math.PI / 2, 0x2e5e56]]) {
    box(0.04, 0.5, 0.4, 0x2a1a12, x, y, z, group, { rotY: ry });
    plane(0.32, 0.42, 0xffffff, x + (ry > 0 ? 0.03 : -0.03), y, z, group, { rotY: ry, material: toonMat(color) });
  }
  cyl(0.2, 0.2, 0.04, 12, 0x2a1a12, -2.4, 2.3, -3.37, group, { rotX: Math.PI / 2 });
  cyl(0.16, 0.16, 0.05, 12, 0xc9c1aa, -2.4, 2.3, -3.34, group, { rotX: Math.PI / 2 });
  box(0.02, 0.11, 0.02, 0x1a1a14, -2.4, 2.35, -3.31, group);
  box(0.08, 0.02, 0.02, 0x1a1a14, -2.36, 2.3, -3.31, group);

  // coat rack and child's blocks
  cyl(0.04, 0.04, 1.7, 6, 0x3a2618, 3.55, 0.85, 2.9, group);
  for (const [dx, dz] of [[-0.18, 0], [0.18, 0], [0, -0.18]]) {
    cyl(0.02, 0.02, 0.25, 5, 0x3a2618, 3.55 + dx, 1.35, 2.9 + dz, group, { rotZ: dx ? 0.8 : 0, rotX: dz ? 0.8 : 0 });
  }
  box(0.35, 0.65, 0.18, 0x3a5a4a, 3.55, 1.0, 2.72, group);
  for (let i = 0; i < 4; i++) {
    box(0.14, 0.12, 0.14, [0xc9a04a, 0x7a3a2a, 0x2e5e56, 0xb7ad93][i], 1.75 + (i % 2) * 0.18, 0.06, 1.55 + Math.floor(i / 2) * 0.18, group, { rotY: i * 0.4 });
  }

  // bread basket
  cyl(0.2, 0.22, 0.1, 10, 0x6b4a2e, -0.7, 0.84, 0.3, group);
  sphere(0.09, 6, 5, 0x9a6a35, -0.7, 0.9, 0.3, group, { sy: 0.6 });
  addLightShaft(group, flashback ? 0xff7958 : 0xffc078, 0, 2.3, 0, 2.3, 1.0, 0.035);

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

export function buildPrologueBunker() {
  const group = new THREE.Group();
  const refs = {};
  const colliders = [];

  const concreteMat = toonMat(0x3a342b, { map: surfaceTexture("concrete", { repeat: [4, 2] }) });
  const metalMat = toonMat(0x2a332f, { map: surfaceTexture("metal", { repeat: [5, 2] }) });
  const floorMat = toonMat(0x2a241c, { map: surfaceTexture("concrete", { repeat: [5, 4] }) });

  // bunker shell
  box(10, 0.2, 8, 0x2a241c, 0, -0.1, 0, group, { material: floorMat });
  box(4.6, 3.2, 0.24, 0x3a342b, -2.7, 1.6, -4, group, { material: concreteMat });
  box(1.8, 3.2, 0.24, 0x3a342b, 4.1, 1.6, -4, group, { material: concreteMat });
  box(3.6, 0.35, 0.24, 0x3a342b, 1.4, 3.025, -4, group, { material: concreteMat });
  box(3.6, 0.85, 0.24, 0x3a342b, 1.4, 0.425, -4, group, { material: concreteMat });
  box(10, 3.2, 0.24, 0x2a332f, 0, 1.6, 4, group, { material: metalMat });
  for (const side of [-1, 1]) {
    box(0.24, 3.2, 8, 0x2a332f, side * 5, 1.6, 0, group, { material: metalMat });
    colliders.push({ minX: side * 5 - 0.2, maxX: side * 5 + 0.2, minZ: -4, maxZ: 4 });
  }
  colliders.push({ minX: -5, maxX: 5, minZ: -4.2, maxZ: -3.8 });
  colliders.push({ minX: -5, maxX: 5, minZ: 3.8, maxZ: 4.2 });
  box(10, 0.18, 8, 0x171b18, 0, 3.1, 0, group);

  // ribs, pipes, cables
  for (const x of [-3.8, -1.3, 1.3, 3.8]) {
    box(0.12, 3.0, 0.14, 0x202823, x, 1.5, -3.86, group);
  }
  for (const side of [-1, 1]) {
    cyl(0.06, 0.06, 7.4, 6, 0x3f5a50, side * 4.82, 2.56, 0, group, { rotX: Math.PI / 2 });
    cyl(0.045, 0.045, 7.4, 6, 0x8a4a2a, side * 4.68, 2.34, 0, group, { rotX: Math.PI / 2 });
  }
  for (const [x, y, z, len, rot] of [[-4.3, 2.2, 2.2, 2.8, 0.3], [4.1, 1.7, -1.4, 2.2, -0.2], [0.4, 2.94, 0.2, 3.3, Math.PI / 2]]) {
    cyl(0.018, 0.018, len, 4, 0x171b18, x, y, z, group, { rotZ: rot });
  }

  // table and family
  box(2.6, 0.12, 1.25, 0x6b4a2e, 0, 0.76, 0.55, group);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.11, 0.74, 0.11, 0x3a2618, sx * 1.12, 0.37, 0.55 + sz * 0.46, group);
  }
  for (let i = 0; i < 4; i++) {
    const x = i < 2 ? -0.85 : 0.85;
    const z = i % 2 === 0 ? 0.25 : 0.82;
    cyl(0.18, 0.2, 0.025, 10, 0xb7ad93, x, 0.84, z, group);
    cyl(0.09, 0.11, 0.02, 10, 0x4b3a24, x, 0.86, z, group);
  }
  cyl(0.26, 0.28, 0.2, 10, 0x5a4230, 0, 0.91, 0.5, group);
  sphere(0.11, 6, 5, 0x7b5a31, 0, 1.02, 0.5, group, { sy: 0.55 });
  // red ribbon: the personal totem
  box(0.36, 0.018, 0.06, 0x9e2f28, -0.72, 0.9, 0.72, group, { rotY: 0.35 });
  box(0.18, 0.018, 0.05, 0x9e2f28, -0.5, 0.91, 0.82, group, { rotY: -0.5 });
  refs.ribbon = group.children[group.children.length - 2];

  const mom = makeHumanoid({ coat: 0x7a3d28, pants: 0x26221c, hair: 0x2b1a12 });
  mom.position.set(-1.15, 0, 0.0);
  mom.rotation.y = 0;
  group.add(mom);
  refs.mom = mom;
  const dad = makeHumanoid({ coat: 0x2d423a, pants: 0x1b211e, hair: 0x2c2119 });
  dad.position.set(1.15, 0, 0.0);
  dad.rotation.y = 0;
  group.add(dad);
  refs.dad = dad;
  const sister = makeHumanoid({ child: true, coat: 0x8a7135, pants: 0x2d2a20, hair: 0x3b2418 });
  sister.position.set(-0.95, 0, 1.9);
  sister.rotation.y = Math.PI;
  group.add(sister);
  refs.sister = sister;

  // bunk beds on left
  box(1.0, 0.14, 2.4, 0x3f2e20, -4.05, 0.52, -1.2, group);
  box(1.0, 0.14, 2.4, 0x3f2e20, -4.05, 1.34, -1.2, group);
  for (const [x, z] of [[-4.4, -2.2], [-3.7, -2.2], [-4.4, -0.2], [-3.7, -0.2]]) {
    box(0.1, 1.35, 0.1, 0x2a1e14, x, 0.68, z, group);
  }
  box(0.9, 0.16, 1.0, 0x71745f, -4.05, 0.62, -1.8, group);
  box(0.9, 0.16, 1.0, 0x71745f, -4.05, 1.44, -0.7, group);
  box(0.9, 0.08, 0.7, 0x8a3a2a, -4.05, 0.7, -1.0, group);
  colliders.push({ minX: -4.65, maxX: -3.55, minZ: -2.5, maxZ: 0.1 });

  // shelves, radio, family photo, child's drawing, suitcase
  for (const y of [1.25, 1.9]) {
    box(2.6, 0.07, 0.35, 0x3a2c20, 3.5, y, -3.55, group);
    for (let i = 0; i < 7; i++) {
      const c = i % 3 === 0 ? 0x8a3a2a : i % 3 === 1 ? 0x2e5e56 : 0xc9a04a;
      cyl(0.06, 0.06, 0.16, 6, c, 2.5 + i * 0.3, y + 0.1, -3.55, group);
    }
  }
  box(0.5, 0.32, 0.35, 0x2a302c, 3.55, 1.12, -3.55, group);
  box(0.2, 0.1, 0.03, 0x8fbf7a, 3.55, 1.18, -3.36, group, { material: basic(0x8fbf7a) });
  cyl(0.018, 0.018, 0.45, 5, 0x1a211d, 3.72, 1.42, -3.55, group, { rotZ: -0.3 });
  // family photo
  box(0.5, 0.36, 0.03, 0x3a2618, 2.55, 2.02, -3.53, group);
  plane(0.4, 0.28, 0xffffff, 2.55, 2.02, -3.5, group, { material: toonMat(0x6b7a55) });
  // child's drawing of Sanctuary: city + big heart
  const draw = new THREE.Group();
  box(0.46, 0.34, 0.02, 0xd8c9a3, 0, 0, 0, draw);
  for (let i = 0; i < 4; i++) box(0.06, 0.1 + i * 0.02, 0.01, 0x2a3530, -0.14 + i * 0.09, 0.02, 0.02, draw);
  sphere(0.05, 6, 5, 0x9e2f28, 0.13, 0.08, 0.02, draw, { material: basic(0x9e2f28) });
  draw.position.set(-2.8, 2.0, -3.52);
  draw.rotation.z = -0.05;
  group.add(draw);
  refs.drawing = draw;
  // suitcase
  box(0.7, 0.42, 0.4, 0x4a3a2a, 4.0, 0.21, 2.8, group);
  box(0.72, 0.04, 0.42, 0x2a1e14, 4.0, 0.42, 2.8, group);
  box(0.12, 0.08, 0.04, 0xc8a24a, 4.0, 0.44, 2.58, group);

  // hanging lamp
  cyl(0.025, 0.025, 0.45, 5, 0x191d1a, 0, 2.78, 0.55, group);
  box(0.46, 0.12, 0.46, 0x2a302c, 0, 2.55, 0.55, group);
  box(0.36, 0.05, 0.36, 0xffc078, 0, 2.48, 0.55, group, { material: basic(0xffc078) });
  const roomLight = pointLight(0xffc078, 4.6, 8, 0, 2.35, 0.55, group, { decay: 1.25 });
  refs.roomLight = roomLight;
  addGlow(group, 0xffc078, 0, 2.48, 0.55, 1.1, 0.28);
  addLightShaft(group, 0xffc078, 0, 2.5, 0.55, 2.4, 1.1, 0.04);

  // ceiling alarm
  const alarm = new THREE.Group();
  cyl(0.22, 0.26, 0.16, 8, 0x1b2420, 0, 0, 0, alarm);
  const rotor = new THREE.Group();
  box(0.34, 0.08, 0.12, 0x8a2a1a, 0, 0.08, 0, rotor);
  box(0.12, 0.08, 0.34, 0x8a2a1a, 0, 0.08, 0, rotor);
  sphere(0.09, 6, 5, 0xff3a1a, 0, 0.12, 0.17, rotor, { material: basic(0xff3a1a) });
  const alarmLight = pointLight(0xff1a0a, 0, 9, 0, 0.1, 0.2, rotor, { decay: 1.2 });
  rotor.add(alarmLight);
  alarm.add(rotor);
  alarm.position.set(-1.8, 2.9, 0.9);
  alarm.scale.setScalar(1.25);
  group.add(alarm);
  refs.alarm = alarm;
  refs.alarmRotor = rotor;
  refs.alarmLight = alarmLight;
  refs.alarmGlow = addGlow(group, 0xff1a0a, -1.8, 2.9, 0.9, 2.2, 0.35);
  refs.alarmGlow.visible = false;

  // floor hatch
  const hatch = new THREE.Group();
  box(1.5, 0.07, 1.0, 0x4a3826, 0, 0, 0, hatch);
  for (const x of [-0.45, 0.45]) box(0.18, 0.02, 0.08, 0x1b2420, x, 0.05, 0, hatch);
  hatch.position.set(0.55, 0.02, 2.45);
  group.add(hatch);
  refs.hatch = hatch;
  addGlow(group, 0xffc078, 0.55, 0.12, 2.45, 0.65, 0.0);
  refs.hatchLight = pointLight(0xffc078, 0, 3.2, 0.55, 0.35, 2.45, group, { decay: 1.5 });

  // hidden Broodmother above the ceiling / behind hatch
  const brood = makeRat({ scale: 2.55, brood: true });
  brood.position.set(0.3, 2.25, 1.7);
  brood.rotation.y = -0.4;
  brood.rotation.z = Math.PI * 0.92;
  brood.visible = false;
  group.add(brood);
  refs.brood = brood;

  // Tokar waits outside the room
  const tokar = makeHumanoid({ coat: 0x4b3a2b, pants: 0x20231f, hair: 0x2a2119 });
  tokar.position.set(4.2, 0, 2.5);
  tokar.rotation.y = -1.7;
  tokar.visible = false;
  group.add(tokar);
  refs.tokar = tokar;

  // boarded-up opening to the old city — light and shapes only through the gaps
  box(3.7, 0.12, 0.14, 0x111614, 1.4, 2.84, -3.88, group);
  box(3.7, 0.12, 0.14, 0x111614, 1.4, 0.86, -3.88, group);
  box(0.12, 2.1, 0.14, 0x111614, -0.34, 1.85, -3.88, group);
  box(0.12, 2.1, 0.14, 0x111614, 3.14, 1.85, -3.88, group);
  const boardGroup = new THREE.Group();
  const boards = [];
  const boardMat = toonMat(0x4a3826, { map: surfaceTexture("wood", { repeat: [2, 1] }) });
  for (let i = 0; i < 7; i++) {
    const x = -0.12 + i * 0.5;
    const plank = box(0.44, 2.0, 0.07, 0x4a3826, x, 1.85, -3.78 + (i % 2) * 0.02, boardGroup, {
      material: boardMat,
      rotZ: (i % 3 - 1) * 0.012,
    });
    boards.push(plank);
  }
  for (const y of [1.18, 2.4]) {
    box(3.3, 0.14, 0.09, 0x3a2c1e, 1.4, y, -3.72, boardGroup, { material: boardMat, rotZ: y > 2 ? -0.01 : 0.012 });
  }
  for (let i = 0; i < 8; i++) {
    sphere(0.018, 5, 4, 0x2a2118, -0.08 + (i % 4) * 0.8, i < 4 ? 1.18 : 2.4, -3.66, boardGroup);
  }
  group.add(boardGroup);
  refs.boardGroup = boardGroup;
  refs.boards = boards;
  const windowGlow = pointLight(0x6fa0a0, 1.4, 6, 1.4, 1.8, -3.4, group, { decay: 1.5 });
  refs.windowGlow = windowGlow;

  // low timber supports, earthen walls, roots and sandbags
  for (const z of [-2.2, 0.2, 2.4]) {
    box(9.2, 0.16, 0.2, 0x2a1e14, 0, 2.45, z, group, { material: boardMat });
    for (const side of [-1, 1]) box(0.18, 2.4, 0.18, 0x2a1e14, side * 4.7, 1.2, z, group, { material: boardMat });
  }
  for (const side of [-1, 1]) {
    plane(7.4, 2.3, 0xffffff, side * 4.86, 1.2, 0, group, {
      rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
      material: toonMat(0x3a2a1c, { map: surfaceTexture("plaster", { repeat: [4, 2] }) }),
    });
  }
  for (const [x, z, len] of [[-4.5, -2.8, 0.6], [-4.2, 1.2, 0.4], [4.4, -1.8, 0.5], [4.2, 2.0, 0.35]]) {
    cyl(0.018, 0.018, len, 4, 0x2a2118, x, 2.95 - len / 2, z, group);
  }
  for (const [x, z] of [[-4.4, 3.2], [-3.6, 3.2], [4.3, -3.2], [3.6, -3.2]]) {
    box(0.65, 0.25, 0.42, 0x4a3a28, x, 0.13, z, group, { rotY: Math.random() * 0.4 });
    box(0.55, 0.18, 0.36, 0x3a2c1e, x, 0.34, z, group, { rotY: -0.1 });
  }
  // dark void under the floor hatch
  plane(1.25, 0.8, 0x000000, 0.55, 0.006, 2.45, group, { rotX: -Math.PI / 2, material: basic(0x000000) });

  // exterior diorama: a slice of Old Kryl visible through the window
  const exterior = new THREE.Group();
  exterior.position.set(0, 0, -5.6);
  const people = [];
  const extFloor = toonMat(0x22251f, { map: surfaceTexture("concrete", { repeat: [8, 8] }) });
  box(26, 0.2, 22, 0x22251f, 0, -0.1, -10, exterior, { material: extFloor });
  box(26, 4.2, 0.3, 0x1a2420, 0, 2.1, -21, exterior);
  for (const side of [-1, 1]) box(0.3, 4.2, 22, 0x1d2823, side * 13, 2.1, -10, exterior);
  // stacked bunker homes
  for (const [x, z, w, h, color] of [[-8, -8, 3.0, 2.4, 0x3a2a20], [-4.2, -10, 2.6, 2.0, 0x29332c], [6.5, -8.5, 3.2, 2.6, 0x3b2b22], [9.5, -12, 2.4, 2.2, 0x26342e], [-1.2, -14, 3.4, 2.8, 0x332a20]]) {
    box(w, h, 2.4, color, x, h / 2, z, exterior);
    box(w + 0.2, 0.12, 2.6, 0x151d19, x, h, z, exterior);
    for (let i = 0; i < 3; i++) {
      box(0.35, 0.45, 0.04, 0xffb765, x - w / 2 + 0.4 + i * 0.8, h * 0.58, z + 1.22, exterior, { material: basic(0xffb765) });
    }
  }
  // walkway and rail
  box(22, 0.12, 2.0, 0x3a4641, 0, 1.35, -5.5, exterior);
  for (let x = -10; x <= 10; x += 2.4) {
    box(0.08, 1.1, 0.08, 0x4a5a52, x, 1.95, -4.55, exterior);
  }
  box(22, 0.08, 0.08, 0x4a5a52, 0, 2.5, -4.55, exterior);
  // foreground homes directly outside the bunker window
  for (const [x, z, w, h, color] of [[-2.6, -2.8, 3.4, 2.9, 0x4a3828], [1.2, -3.0, 3.0, 2.5, 0x35433a], [4.6, -2.7, 2.6, 2.7, 0x3c3025]]) {
    box(w, h, 2.0, color, x, h / 2, z, exterior);
    box(w + 0.2, 0.12, 2.2, 0x151d19, x, h, z, exterior);
    for (let i = 0; i < 3; i++) {
      box(0.32, 0.4, 0.05, 0xffb765, x - w / 2 + 0.45 + i * 0.9, h * 0.6, z + 1.02, exterior, { material: basic(0xffb765) });
    }
    for (let i = 0; i < 2; i++) {
      box(0.6, 0.7, 0.05, 0x101613, x - w / 2 + 0.7 + i * 0.8, h * 0.25, z + 1.02, exterior);
    }
  }
  pointLight(0xffc078, 5.2, 12, 1.2, 2.6, -5.0, exterior, { decay: 1.25 });
  addGlow(exterior, 0xffc078, 1.2, 2.4, -5.0, 1.3, 0.24);
  addLightShaft(exterior, 0xffc078, 1.2, 2.4, -5.0, 2.4, 1.1, 0.035);
  // a few close silhouettes so the window reads as a living street
  for (const [x, z, ry] of [[-0.4, -1.9, 0.4], [2.2, -2.1, -0.6], [4.0, -1.8, 2.8], [1.3, -0.9, 2.9]]) {
    const p = makeHumanoid({ coat: 0x4a3a2a, pants: 0x1b211d, hair: 0x241a12 });
    p.position.set(x, 0, z);
    p.rotation.y = ry;
    exterior.add(p);
    people.push(p);
  }
  sphere(0.08, 6, 5, 0xffb765, 1.2, 2.55, -1.2, exterior, { material: basic(0xffb765) });
  pointLight(0xffb765, 3.4, 9, 1.2, 2.4, -1.2, exterior, { decay: 1.4 });
  addGlow(exterior, 0xffb765, 1.2, 2.5, -1.2, 0.8, 0.24);
  // market stalls / hanging cloth
  for (const [x, z, c] of [[-4, -6.2, 0x7a3a24], [3.6, -6.4, 0x2f6f66], [8, -5.8, 0xb8862a]]) {
    box(2.4, 0.7, 1.0, 0x3f2e20, x, 0.35, z, exterior);
    box(2.7, 0.08, 1.3, c, x, 1.35, z, exterior, { rotZ: 0.03 });
    cyl(0.025, 0.025, 2.1, 5, 0x2d241b, x - 1.0, 1.0, z + 0.4, exterior);
    cyl(0.025, 0.025, 2.1, 5, 0x2d241b, x + 1.0, 1.0, z + 0.4, exterior);
  }
  // warm lights over the settlement
  for (const [x, y, z, c] of [[-7, 3.0, -7.0, 0xffb765], [-1, 3.3, -9.0, 0xffd27a], [6, 3.0, -6.8, 0xff9a4a], [10, 3.2, -11, 0x8fe0c0]]) {
    sphere(0.08, 6, 5, c, x, y, z, exterior, { material: basic(c) });
    pointLight(c, 1.8, 8, x, y, z, exterior, { decay: 1.4 });
    addGlow(exterior, c, x, y, z, 0.6, 0.22);
    addLightShaft(exterior, c, x, y, z, y, 0.55, 0.03);
  }
  // people in the street
  const peopleSpots = [
    [-6.0, -5.8, 0.9], [-2.2, -7.0, -0.4], [2.8, -5.4, 2.2],
    [7.2, -7.4, -0.8], [-8.0, -11.5, 1.8], [4.2, -12.0, 0.2],
  ];
  for (const [x, z, ry] of peopleSpots) {
    const p = makeHumanoid({ coat: Math.random() < 0.5 ? 0x4a3a2a : 0x35443a, pants: 0x1b211d, hair: 0x241a12 });
    p.position.set(x, 0, z);
    p.rotation.y = ry;
    exterior.add(p);
    people.push(p);
  }
  refs.exteriorPeople = people;
  // monster running through the settlement
  const extMonster = makeRat({ scale: 1.3 });
  extMonster.position.set(-9, 0, -11);
  extMonster.rotation.y = 1.0;
  exterior.add(extMonster);
  refs.exteriorMonster = extMonster;
  // a tall Tenant stands still while the city runs
  const prologueTenant = makeTenant(2.8);
  prologueTenant.position.set(0.5, 0, -1.0);
  prologueTenant.rotation.y = Math.PI;
  prologueTenant.visible = false;
  exterior.add(prologueTenant);
  refs.prologueTenant = prologueTenant;
  group.add(exterior);
  refs.exterior = exterior;

  addDust(group, 40, 8, 0x9a8a70);
  addDust(exterior, 28, 20, 0x8a7a62);
  group.userData.refs = refs;
  return { group, refs };
}

export function buildCarRide() {
  const group = new THREE.Group();
  const refs = {};

  // cabin shell
  box(2.1, 0.12, 3.4, 0x1b1c19, 0, 0.0, 0, group);
  box(2.1, 0.1, 3.4, 0x121715, 0, 1.72, 0, group);
  box(2.1, 1.1, 0.16, 0x222b27, 0, 1.0, 1.7, group); // rear bulkhead
  for (const side of [-1, 1]) {
    box(0.16, 1.3, 3.2, 0x26312c, side * 1.05, 0.92, 0, group);
    box(0.1, 0.8, 0.1, 0x141a17, side * 0.95, 1.2, -1.55, group);
  }
  // dashboard and windshield
  box(2.0, 0.24, 0.45, 0x2a332e, 0, 0.85, -1.35, group);
  box(2.0, 0.06, 0.52, 0x1a211d, 0, 0.98, -1.34, group);
  for (let i = 0; i < 5; i++) {
    sphere(0.035, 6, 5, i % 2 ? 0xffb765 : 0xff3a1a, -0.62 + i * 0.31, 0.9, -1.1, group, { material: basic(i % 2 ? 0xffb765 : 0xff3a1a) });
  }
  box(2.0, 0.08, 0.08, 0x3a4a42, 0, 1.52, -1.55, group);
  box(0.08, 1.1, 0.08, 0x3a4a42, -0.98, 1.0, -1.55, group);
  box(0.08, 1.1, 0.08, 0x3a4a42, 0.98, 1.0, -1.55, group);
  // seats
  box(0.58, 0.1, 0.6, 0x3a2a1a, -0.48, 0.42, -0.2, group);
  box(0.58, 0.6, 0.12, 0x3a2a1a, -0.48, 0.68, 0.06, group);
  box(0.5, 0.08, 0.42, 0x3a2a1a, 0.48, 0.34, 0.24, group);
  // steering wheel
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 5, 14), toonMat(0x1b2420));
  wheel.position.set(-0.48, 0.82, -1.08);
  wheel.rotation.x = 0.28;
  group.add(wheel);
  // Tokar at the wheel
  const tokar = makeHumanoid({ coat: 0x4b3a2b, pants: 0x20231f, hair: 0x2a2119 });
  tokar.position.set(-0.52, 0.12, -0.98);
  tokar.rotation.y = 0.02;
  tokar.scale.setScalar(0.8);
  group.add(tokar);
  refs.tokar = tokar;
  // red cabin light + green dash glow
  const cabinLight = pointLight(0xff4a22, 2.6, 3.0, 0.2, 1.55, 0.4, group, { decay: 1.7 });
  refs.cabinLight = cabinLight;
  addGlow(group, 0xff4a22, 0.2, 1.55, 0.4, 0.7, 0.18);
  pointLight(0x8fe0c0, 0.8, 2.0, -0.3, 0.95, -1.15, group, { decay: 1.8 });
  // cold city light through the windshield
  pointLight(0x6f9aaa, 4.0, 34, 0, 3.0, -11, group, { decay: 1.35 });
  addGlow(group, 0x6f9aaa, 0, 2.0, -8, 2.4, 0.12);
  addLightShaft(group, 0x8fb8c8, 0, 3.0, -6, 3.0, 1.6, 0.025);

  // ruined city beyond the windshield
  const city = new THREE.Group();
  const ruins = new THREE.Group();
  city.add(ruins);
  // central ruined skyline / fires in the driving line
  for (const [x, z, w, h, color] of [[-2.4, -9.5, 2.0, 4.4, 0x2a302c], [2.4, -12.0, 2.2, 3.6, 0x3a2b22], [-1.8, -16.0, 2.6, 5.2, 0x26322d], [3.0, -19.0, 2.4, 4.2, 0x303a34]]) {
    box(w, h, 2.0, color, x, h / 2 - 0.3, z, ruins);
    box(w + 0.2, 0.1, 2.2, 0x111614, x, h - 0.3, z, ruins);
    for (let i = 0; i < 2; i++) box(0.28, 0.36, 0.05, 0xffb765, x - 0.3 + i * 0.6, h * 0.45, z + 1.02, ruins, { material: basic(0xffb765) });
  }
  pointLight(0xff5a2a, 5.5, 18, -1.0, 1.0, -10.0, group, { decay: 1.35 });
  addGlow(group, 0xff5a2a, -1.0, 1.0, -10.0, 1.8, 0.24);
  pointLight(0xffb765, 3.5, 18, 2.4, 3.6, -14.0, group, { decay: 1.4 });
  addGlow(group, 0xffb765, 2.4, 3.6, -14.0, 1.3, 0.2);
  const roadMat = toonMat(0x1a1d1a, { map: surfaceTexture("concrete", { repeat: [10, 10] }) });
  box(18, 0.12, 100, 0x1a1d1a, 0, -0.4, -52, city, { material: roadMat });
  const props = [];
  for (let i = 0; i < 22; i++) {
    const z = -8 - i * 4.6;
    const x = i % 2 === 0 ? -4.2 - Math.random() * 2.5 : 4.2 + Math.random() * 2.5;
    const w = 2.0 + Math.random() * 2.0;
    const h = 2.2 + Math.random() * 3.8;
    const color = i % 3 === 0 ? 0x2f3a34 : i % 3 === 1 ? 0x3b2b22 : 0x26322d;
    box(w, h, 2.2, color, x, h / 2 - 0.3, z, ruins);
    box(w + 0.2, 0.1, 2.4, 0x111614, x, h - 0.3, z, ruins);
    for (let k = 0; k < 2; k++) {
      if ((i + k) % 3 === 0) {
        box(0.28, 0.38, 0.04, 0xffb765, x - 0.3 + k * 0.6, h * 0.55, z + 1.12, ruins, { material: basic(0xffb765) });
      }
    }
    if (i % 4 === 0) {
      const heat = pointLight(0xff5a2a, 2.4, 9, x * 0.6, 1.2, z + 1.8, ruins, { decay: 1.5 });
      addGlow(ruins, 0xff5a2a, x * 0.6, 1.2, z + 1.8, 1.2, 0.2);
      props.push(heat);
    }
  }
  // overhead hanging cables / tunnel silhouettes
  for (let i = 0; i < 10; i++) {
    const z = -6 - i * 8;
    box(18, 0.06, 0.08, 0x2a3530, 0, 4.5, z, ruins);
  }
  city.position.z = 0;
  group.add(city);
  refs.city = city;
  refs.ruins = ruins;
  refs.cityProps = props;

  addDust(group, 18, 3, 0x8a7a62);
  group.userData.refs = refs;
  return { group, refs };
}

function buildKrylLegacy() {
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
    addGlow(group, 0xffb765, x, 3.1, -0.7, 0.75, 0.3);
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
    addGlow(group, 0xffb765, x, 3.1, 2.8, 0.75, 0.3);
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

  // station identity
  plane(5.2, 1.0, 0xffffff, 0, 3.3, -6.86, group, { material: stationSign("KRYL STATION", "#ffe08a") });
  addGlow(group, 0xffd27a, 0, 3.3, -6.6, 1.8, 0.18);

  // city window on the right wall
  plane(3.0, 1.8, 0xffffff, 5.87, 2.35, 0, group, { rotY: -Math.PI / 2, material: cityWindowMaterial() });
  box(0.1, 0.12, 3.2, 0x0e1512, 5.86, 1.35, 0, group);
  box(0.1, 0.12, 3.2, 0x0e1512, 5.86, 3.35, 0, group);
  box(0.1, 2.0, 0.12, 0x0e1512, 5.86, 2.35, -1.6, group);
  box(0.1, 2.0, 0.12, 0x0e1512, 5.86, 2.35, 1.6, group);
  pointLight(0x7fb8c8, 2.6, 9, 4.8, 2.5, 0, group, { decay: 1.4 });
  addGlow(group, 0x7fb8c8, 5.7, 2.35, 0, 1.7, 0.18);

  // wall wainscot, hazard band, ribs
  for (const side of [-1, 1]) {
    box(0.08, 1.1, 14, 0x2f3a34, side * 5.92, 0.55, 0, group);
    box(0.08, 0.1, 14, 0xc08a3a, side * 5.92, 1.2, 0, group);
    for (const z of [-6, -3.5, -1, 1.5, 4, 6]) {
      box(0.1, 3.9, 0.14, 0x24312c, side * 5.9, 2, z, group);
    }
  }
  for (const side of [-1, 1]) {
    box(12, 1.1, 0.08, 0x2f3a34, 0, 0.55, side * 6.92, group);
    box(12, 0.1, 0.08, 0xc08a3a, 0, 1.2, side * 6.92, group);
  }
  for (const x of [-4.5, -2.0, 0.5, 3.0, 5.0]) {
    box(0.12, 0.12, 14, 0x1c2420, x, 3.85, 0, group);
  }

  // rug under the counter
  plane(4.6, 3.0, 0xffffff, 0, 0.015, 0.3, group, { rotX: -Math.PI / 2, material: toonMat(0x7a2f27) });
  plane(3.9, 2.4, 0xffffff, 0, 0.018, 0.3, group, { rotX: -Math.PI / 2, material: toonMat(0x2f6b63) });

  // crates and barrels around the market
  const crateSpots = [[-5.0, 4.7, 0.8], [5.05, 4.2, 0.68], [4.95, -2.4, 0.65], [-5.0, -3.3, 0.75]];
  for (const [x, z, s] of crateSpots) {
    box(s, s, s, 0x6a4a2c, x, s / 2, z, group);
    box(s * 0.9, 0.08, s * 0.9, 0x3a2a1a, x, s * 0.8, z, group);
    colliders.push({ minX: x - s / 2, maxX: x + s / 2, minZ: z - s / 2, maxZ: z + s / 2 });
  }
  for (const [x, z] of [[-5.1, 2.6], [5.1, 2.2]]) {
    cyl(0.3, 0.3, 0.85, 8, 0x8a5a2a, x, 0.43, z, group);
    cyl(0.31, 0.31, 0.06, 8, 0x3a2a1a, x, 0.16, z, group);
    cyl(0.31, 0.31, 0.06, 8, 0x3a2a1a, x, 0.7, z, group);
    colliders.push({ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 });
  }

  // stove and steam
  cyl(0.32, 0.38, 0.8, 8, 0x3a2a1e, -4.7, 0.4, 0.9, group);
  cyl(0.34, 0.34, 0.06, 8, 0x7e3a1c, -4.7, 0.82, 0.9, group, { material: basic(0xff7a2a) });
  pointLight(0xff7a2a, 4.0, 8, -4.7, 1.0, 0.9, group, { decay: 1.3 });
  addGlow(group, 0xff7a2a, -4.7, 0.95, 0.9, 1.2, 0.26);
  addLightShaft(group, 0xb8c8b8, -4.7, 1.2, 0.9, 1.3, 0.3, 0.035);

  // shelves behind the counter
  for (const y of [1.45, 2.05]) {
    box(2.8, 0.07, 0.35, 0x3a2c20, 0, y, 0.45, group);
    for (let i = 0; i < 6; i++) {
      cyl(0.06, 0.06, 0.16, 6, i % 2 ? 0x6b7a55 : 0x8a6a3a, -1.1 + i * 0.44, y + 0.1, 0.45, group);
    }
  }

  // string lights and hanging cloth
  for (const [x, z, color] of [[-3.4, -2.2, 0xffb765], [-1.2, -2.2, 0x8fe0c0], [1.2, -2.2, 0xff8a6a], [3.4, -2.2, 0xffd27a], [-2.4, 3.6, 0xffb765], [2.4, 3.6, 0x8fe0c0]]) {
    sphere(0.055, 6, 5, color, x, 3.35, z, group, { material: basic(color) });
    addGlow(group, color, x, 3.35, z, 0.45, 0.24);
  }
  const clothColors = [0x9a3a24, 0x2f6f66, 0xb8862a];
  for (const [side, z, color] of [[-1, 2.2, 0x9a3a24], [1, -0.8, 0x2f6f66], [-1, -4.6, 0xb8862a]]) {
    plane(2.2, 1.6, 0xffffff, side * 5.83, 2.5, z, group, {
      rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
      material: toonMat(color, { transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    });
  }

  // a waiting figure by the memorial
  const local = makeHumanoid({ coat: 0x39423a, pants: 0x1a201c, hair: 0x1e1711 });
  local.position.set(-3.6, 0, -4.8);
  local.rotation.y = 2.6;
  group.add(local);

  // light shafts under the bulbs
  for (const x of [-3.5, -1.2, 1.1, 3.4]) {
    addLightShaft(group, 0xffb765, x, 3.0, -0.7, 2.8, 0.65, 0.035);
  }

  addDust(group, 50, 9, 0xa08d6b);
  group.userData.refs = refs;
  return { group, refs, colliders, spawn: new THREE.Vector3(0, 1.7, 4.8), bounds: { minX: -5.5, maxX: 5.5, minZ: -6.4, maxZ: 6.2 } };
}

export function buildKryl() {
  const group = new THREE.Group();
  const refs = {};
  const colliders = [];
  const npcs = [];
  const W = 32;
  const D = 30;
  const H = 4.2;

  const floorMat = toonMat(0x2d241b, { map: surfaceTexture("concrete", { repeat: [10, 10] }) });
  const wallMat = toonMat(0x39433b, { map: surfaceTexture("metal", { repeat: [8, 2] }) });
  const warmMat = toonMat(0x533b28, { map: surfaceTexture("wood", { repeat: [5, 2] }) });

  // shell
  box(W, 0.2, D, 0x2d241b, 0, -0.1, 0, group, { material: floorMat });
  box(W, H, 0.3, 0x39433b, 0, H / 2, -D / 2, group, { material: wallMat });
  box(W, H, 0.3, 0x303b35, 0, H / 2, D / 2, group, { material: wallMat });
  for (const side of [-1, 1]) {
    box(0.3, H, D, 0x303b35, side * W / 2, H / 2, 0, group, { material: wallMat });
    colliders.push({ minX: side * W / 2 - 0.2, maxX: side * W / 2 + 0.2, minZ: -D / 2, maxZ: D / 2 });
  }
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: -D / 2 - 0.2, maxZ: -D / 2 + 0.2 });
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: D / 2 - 0.2, maxZ: D / 2 + 0.2 });
  box(W, 0.16, D, 0x141a17, 0, H, 0, group);

  // ceiling beams and pipe runs
  for (const x of [-12, -7, -2, 3, 8, 13]) box(0.12, 0.15, D, 0x1d2521, x, H - 0.2, 0, group);
  for (const side of [-1, 1]) {
    cyl(0.06, 0.06, 28, 6, 0x3f5a50, side * 5.8, H - 0.4, 0, group, { rotX: Math.PI / 2 });
    cyl(0.045, 0.045, 28, 6, 0x8a4a2a, side * 5.66, H - 0.6, 0, group, { rotX: Math.PI / 2 });
  }

  // side partitions with wide doorways
  const partition = (x, z1, z2) => {
    const len = z2 - z1;
    box(0.2, 2.7, len, 0x2a3630, x, 1.35, (z1 + z2) / 2, group);
    box(0.28, 0.1, len, 0x8a5a2a, x, 2.72, (z1 + z2) / 2, group);
    colliders.push({ minX: x - 0.15, maxX: x + 0.15, minZ: z1, maxZ: z2 });
  };
  for (const side of [-1, 1]) {
    const x = side * 6.2;
    partition(x, -15, -11.2);
    partition(x, -9.4, -3.2);
    partition(x, 0.8, 5.2);
    partition(x, 7.4, 15);
  }

  // main market lane
  for (const [x, z, color] of [[-4.2, 9.2, 0x7a3a24], [4.2, 9.2, 0x2f6f66], [-4.2, 4.2, 0xb8862a], [4.2, 4.2, 0x6b4a2e], [-4.2, -1.0, 0x2f6f66], [4.2, -1.0, 0x7a3a24]]) {
    box(2.5, 0.7, 1.1, 0x3f2e20, x, 0.35, z, group);
    box(2.8, 0.08, 1.3, color, x, 1.35, z, group, { rotZ: 0.03 });
    cyl(0.025, 0.025, 2.2, 5, 0x2d241b, x - 1.05, 1.1, z + 0.4, group);
    cyl(0.025, 0.025, 2.2, 5, 0x2d241b, x + 1.05, 1.1, z + 0.4, group);
    for (let i = 0; i < 4; i++) cyl(0.07, 0.07, 0.14, 6, i % 2 ? 0x7d6a3f : 0x4c6045, x - 0.6 + i * 0.4, 0.88, z + 0.1, group);
  }
  // hanging bulbs / string lights
  for (const [x, z, c] of [[-4, 11, 0xffb765], [4, 11, 0xffb765], [-4, 5, 0xffd27a], [4, 5, 0xff9a4a], [-3, -3, 0x8fe0c0], [3, -3, 0xffb765], [0, -8.5, 0xff8a6a]]) {
    cyl(0.018, 0.018, 0.65, 5, 0x191d1a, x, H - 0.7, z, group);
    sphere(0.08, 6, 5, c, x, H - 1.0, z, group, { material: basic(c) });
    pointLight(c, 1.5, 7.5, x, H - 1.2, z, group, { decay: 1.5 });
    addGlow(group, c, x, H - 1.0, z, 0.7, 0.24);
    addLightShaft(group, c, x, H - 1.0, z, 3.2, 0.65, 0.028);
  }
  // broad warm wash down the main lane
  for (const z of [12.4, 6.5, 0.5, -6.0, -11.0]) {
    box(3.2, 0.05, 0.18, 0xffd27a, 0, H - 0.35, z, group, { material: basic(0xffd27a) });
    pointLight(0xffb765, 2.2, 11, 0, H - 0.6, z, group, { decay: 1.35 });
    addGlow(group, 0xffb765, 0, H - 0.5, z, 1.0, 0.18);
  }

  // Tokar's counter
  box(3.4, 0.92, 0.72, 0x3f2e20, 0, 0.46, 10.4, group, { material: warmMat });
  box(3.6, 0.1, 0.92, 0x5b4029, 0, 0.96, 10.4, group, { material: warmMat });
  colliders.push({ minX: -1.8, maxX: 1.8, minZ: 10.0, maxZ: 10.8 });
  const tokar = makeHumanoid({ coat: 0x4b3a2b, pants: 0x20231f, hair: 0x2a2119 });
  tokar.position.set(0, 0, 11.4);
  tokar.rotation.y = 0;
  group.add(tokar);
  refs.tokar = tokar;
  box(0.17, 0.045, 0.035, 0x1b1c18, 0, 1.44, 0.11, tokar);
  box(0.05, 0.05, 0.02, 0x8caa76, -0.05, 1.44, 0.13, tokar, { material: basic(0x8caa76) });
  box(0.05, 0.05, 0.02, 0x8caa76, 0.05, 1.44, 0.13, tokar, { material: basic(0x8caa76) });
  pointLight(0xffc078, 4.0, 5.0, 0, 2.0, 11.2, group, { decay: 1.25 });
  addGlow(group, 0xffc078, 0, 1.75, 10.9, 0.9, 0.2);

  // radio and missing-person wall behind Tokar
  box(0.55, 0.35, 0.4, 0x2a302c, -1.2, 1.18, 10.35, group);
  box(0.22, 0.11, 0.03, 0x8fbf7a, -1.2, 1.24, 10.56, group, { material: basic(0x8fbf7a) });
  cyl(0.015, 0.015, 0.4, 5, 0x1a211d, -1.02, 1.42, 10.35, group, { rotZ: -0.3 });
  box(3.0, 1.3, 0.05, 0x2b3029, 0, 2.25, 14.82, group);
  for (let i = 0; i < 6; i++) {
    box(0.34, 0.42, 0.02, 0x8b7b5d, -1.05 + (i % 3) * 0.72, 2.0 + Math.floor(i / 3) * 0.46, 14.78, group);
  }
  // child's drawing near the vent
  box(0.48, 0.34, 0.02, 0xd8c9a3, -2.2, 1.55, -9.78, group);
  for (let i = 0; i < 4; i++) box(0.06, 0.1 + i * 0.02, 0.01, 0x2a3530, -2.32 + i * 0.09, 1.53, -9.76, group);
  sphere(0.05, 6, 5, 0x9e2f28, -2.05, 1.58, -9.76, group, { material: basic(0x9e2f28) });

  // clinic (left, mid)
  box(0.04, 0.6, 0.04, 0x8fe0c0, -15.7, 2.45, 2.5, group, { material: basic(0x8fe0c0) });
  box(0.32, 0.08, 0.04, 0x8fe0c0, -15.7, 2.45, 2.5, group, { material: basic(0x8fe0c0) });
  box(0.08, 0.32, 0.04, 0x8fe0c0, -15.7, 2.45, 2.5, group, { material: basic(0x8fe0c0) });
  pointLight(0xcfe6b0, 3.4, 9, -12.5, 2.7, 2.0, group, { decay: 1.35 });
  addGlow(group, 0xcfe6b0, -12.5, 2.5, 2.0, 1.0, 0.22);
  for (const [x, z] of [[-14, 1.0], [-11.8, 1.0], [-14, 4.2], [-11.8, 4.2]]) {
    box(1.5, 0.14, 0.8, 0x3a3f38, x, 0.55, z, group);
    box(0.9, 0.1, 0.46, 0x9a9a82, x, 0.64, z, group);
    for (const dx of [-0.65, 0.65]) box(0.08, 0.5, 0.08, 0x2a302c, x + dx, 0.28, z, group);
  }
  for (const z of [0.2, 2.5, 4.8]) {
    plane(1.2, 0.06, 0xffffff, -9.4, 2.55, z, group, { rotY: Math.PI / 2, material: toonMat(0x8a9a88, { transparent: true, opacity: 0.7, side: THREE.DoubleSide }) });
    plane(1.2, 0.9, 0xffffff, -9.4, 2.1, z, group, { rotY: Math.PI / 2, material: toonMat(0x8a9a88, { transparent: true, opacity: 0.45, side: THREE.DoubleSide }) });
  }
  box(2.6, 0.08, 0.35, 0x3a2c20, -14.5, 1.5, -0.6, group);
  for (let i = 0; i < 6; i++) cyl(0.06, 0.06, 0.16, 6, i % 2 ? 0xc9c1aa : 0x8fbf7a, -15.5 + i * 0.42, 1.6, -0.6, group);

  // canteen (right, mid)
  for (const z of [0.2, 2.6, 5.0]) {
    box(2.7, 0.12, 0.9, 0x5b4029, 12.4, 0.8, z, group, { material: warmMat });
    for (const dx of [-1.1, 1.1]) box(0.12, 0.7, 0.12, 0x3a2a1a, 12.4 + dx, 0.4, z, group);
    for (let i = 0; i < 3; i++) {
      cyl(0.12, 0.13, 0.02, 8, 0xb7ad93, 11.7 + i * 0.7, 0.87, z, group);
    }
  }
  cyl(0.36, 0.4, 0.7, 8, 0x3a2a1e, 14.0, 0.35, 2.6, group);
  cyl(0.32, 0.32, 0.05, 8, 0x7e3a1c, 14.0, 0.72, 2.6, group, { material: basic(0xff7a2a) });
  pointLight(0xff7a2a, 3.0, 6, 14.0, 1.0, 2.6, group, { decay: 1.4 });
  addGlow(group, 0xff7a2a, 14.0, 0.9, 2.6, 0.9, 0.22);
  addLightShaft(group, 0xb8c8b8, 14.0, 1.1, 2.6, 1.1, 0.28, 0.03);
  // hanging food icons
  for (let i = 0; i < 3; i++) {
    cyl(0.18, 0.22, 0.07, 8, 0xc9a04a, 9.0, 2.8, 0.8 + i * 1.0, group, { material: basic(0xc9a04a) });
    cyl(0.12, 0.12, 0.03, 8, 0x6b4a2e, 9.0, 2.77, 0.8 + i * 1.0, group);
  }
  pointLight(0xffb765, 3.8, 9, 12.0, 2.6, 2.2, group, { decay: 1.35 });
  addGlow(group, 0xffb765, 12.0, 2.5, 2.2, 1.0, 0.22);

  // habitation / bunk rooms (left, back)
  for (const [x, z, y] of [[-14.0, -6.0, 0.55], [-14.0, -8.0, 0.55], [-14.0, -6.0, 1.35], [-14.0, -8.0, 1.35]]) {
    box(1.4, 0.14, 2.0, 0x3f2e20, x, y, z, group);
    box(1.2, 0.12, 1.7, x === -14 && z === -8 ? 0x71745f : 0x6b5a45, x, y + 0.1, z, group);
  }
  for (const x of [-15, -13]) {
    for (const z of [-9.2, -7.0, -4.8]) box(0.1, 1.4, 0.1, 0x2a1e14, x, 0.7, z, group);
  }
  // laundry lines
  for (const [x1, x2, z] of [[-15.5, -9.0, -4.2], [-15.0, -10.0, -9.4]]) {
    for (let i = 0; i < 5; i++) {
      plane(0.6, 0.5, 0xffffff, x1 + (x2 - x1) * (i / 4), 2.2, z, group, { material: toonMat(i % 2 ? 0x8a3a2a : 0x2e5e56, { side: THREE.DoubleSide }) });
    }
    cyl(0.015, 0.015, Math.abs(x2 - x1), 5, 0x3a4a42, (x1 + x2) / 2, 2.55, z, group, { rotZ: Math.PI / 2 });
  }
  // memorial shelf with tiny photos
  box(2.2, 0.08, 0.3, 0x3a2c20, -11.5, 1.5, -11.25, group);
  for (let i = 0; i < 5; i++) {
    box(0.24, 0.3, 0.02, 0x8b7b5d, -12.4 + i * 0.45, 1.68, -11.2, group);
  }
  pointLight(0xffb765, 3.0, 8, -12.0, 2.6, -7.0, group, { decay: 1.4 });
  addGlow(group, 0xffb765, -12.0, 2.5, -7.0, 1.0, 0.22);

  // alley / shrine (right, back)
  box(2.0, 0.4, 0.8, 0x3a2c20, 12.5, 0.2, -7.0, group);
  for (let i = 0; i < 4; i++) {
    cyl(0.06, 0.07, 0.24, 7, i % 2 ? 0xc9a04a : 0x9e4a2a, 11.7 + i * 0.5, 0.5, -7.0, group);
    sphere(0.05, 6, 5, 0xffb765, 11.7 + i * 0.5, 0.68, -7.0, group, { material: basic(0xffb765) });
  }
  pointLight(0xffb765, 2.5, 5, 12.5, 0.9, -7.0, group, { decay: 1.5 });
  addGlow(group, 0xffb765, 12.5, 0.8, -7.0, 0.9, 0.22);
  pointLight(0x8fe0c0, 2.4, 7, 12.0, 2.4, -7.5, group, { decay: 1.45 });
  addGlow(group, 0x8fe0c0, 12.0, 2.3, -7.5, 0.8, 0.2);
  for (const [x, z] of [[9.0, -6.0], [15.0, -6.0], [9.0, -10.0], [15.0, -10.0]]) {
    box(0.8, 0.8, 0.8, 0x4a3a2a, x, 0.4, z, group);
  }

  // vent works at the back
  const ventZ = -13.3;
  box(11.0, 3.4, 0.4, 0x202a25, 0, 1.7, ventZ - 0.2, group);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.18, 8, 20), toonMat(0x2a3832));
  ring.position.set(0, 2.1, ventZ + 0.1);
  group.add(ring);
  const fan = new THREE.Group();
  fan.position.set(0, 2.1, ventZ + 0.2);
  cyl(0.3, 0.3, 0.22, 10, 0x141c18, 0, 0, 0, fan, { rotX: Math.PI / 2 });
  for (let i = 0; i < 5; i++) {
    box(1.55, 0.28, 0.06, 0x9aa99b, Math.cos((Math.PI * 2 / 5) * i) * 0.78, Math.sin((Math.PI * 2 / 5) * i) * 0.78, 0, fan, { rotZ: (Math.PI * 2 / 5) * i });
  }
  group.add(fan);
  refs.fan = fan;
  pointLight(0x9bd0a0, 2.0, 8, 0, 1.8, ventZ + 1.6, group, { decay: 1.5 });
  addGlow(group, 0x9bd0a0, 0, 1.8, ventZ + 1.4, 1.2, 0.2);
  // hazard stripes around vent
  for (let i = 0; i < 8; i++) {
    box(0.32, 0.08, 0.06, i % 2 ? 0x1b1b1b : 0xd28a2a, -2.8 + i * 0.8, 0.05, ventZ + 0.9, group);
  }
  refs.ventGlow = pointLight(0x7ea06a, 0.7, 4, 0, 0.9, ventZ + 1.4, group, { decay: 1.8 });
  refs.ventDoor = new THREE.Vector3(0, 0, ventZ + 1.1);

  // station sign over vent works
  plane(5.0, 0.9, 0xffffff, 0, 3.4, ventZ + 0.02, group, { material: stationSign("KRYL STATION", "#ffe08a") });
  addGlow(group, 0xffd27a, 0, 3.4, ventZ + 0.3, 1.4, 0.16);

  // NPCs
  const npc = (x, z, coat, hair, name, lines, route = null, speed = 0.55, child = false) => {
    const person = makeHumanoid({ child, coat, pants: 0x1b211d, hair });
    person.position.set(x, 0, z);
    group.add(person);
    const record = { group: person, name, lines, route, speed, idx: 0, nextTalk: 0, baseY: 0 };
    npcs.push(record);
    return record;
  };
  npc(-9.0, 2.2, 0x9a9a82, 0x2a2119, "DOCTOR", ["Keep the wound clean.", "We're low on filters. Don't ask."], [[-9.0, 2.2], [-12.0, 3.8], [-9.0, 2.2]], 0.25);
  npc(13.8, 2.8, 0x7a4a2a, 0x241a12, "COOK", ["Stew's hot. Don't ask what's in it.", "Sit. You look like the vent chewed you up."], [[13.8, 2.8], [12.0, 1.0], [13.8, 2.8]], 0.2);
  npc(-11.4, -6.2, 0x4a3a2a, 0x2b1a12, "MOTHER", ["My boy went down the vent. He said he'd be back.", "Do you hear them at night? In the pipes?"], [[-11.4, -6.2], [-13.0, -7.5], [-11.4, -6.2]], 0.18);
  npc(12.2, -8.0, 0x39423a, 0x1e1711, "TRADER", ["Filters. Rounds. Names. What do you need?", "Sanctuary? That's a good story to sell."], [[12.2, -8.0], [14.4, -6.2], [12.2, -8.0]], 0.18);
  npc(-8.6, -7.6, 0x8a7135, 0x3b2418, "CHILD", ["I saw a light in the vent.", "The rat looked at me."], null, 0, true);
  npc(3.0, -10.8, 0x4a5a4a, 0x241b14, "WORKER", ["Fan's jammed again.", "Don't go past the fan after dark."], [[3.0, -10.8], [1.0, -9.4], [3.0, -10.8]], 0.22);
  npc(-3.8, 6.8, 0x7a3a24, 0x2a1a12, "VENDOR", ["Fresh air. Cheapest in Kryl.", "You buying or breathing?"], [[-3.8, 6.8], [-4.2, 8.6], [-3.8, 6.8]], 0.15);
  npc(3.8, 6.8, 0x2f6f66, 0x241a12, "VENDOR", ["Three rounds for ten. No haggling.", "Vera pays better. Go to Zarya."], [[3.8, 6.8], [4.2, 8.6], [3.8, 6.8]], 0.15);
  npc(-1.5, 2.0, 0x35443a, 0x1b211d, "RUNNER", ["Kryl used to be a city. Now it's a lung.", "If the fan stops, we all stop."], [[-1.5, 2.0], [3.5, -1.5], [0, -5.0], [-3.5, -1.5]], 0.6);
  npc(2.2, 8.4, 0x4a3a2a, 0x2a2119, "PORTER", ["Move. I've got filters to haul.", "The lower deck is flooding again."], [[2.2, 8.4], [-2.8, 8.4], [-2.8, 3.0], [2.2, 3.0]], 0.52);
  npc(-3.0, -1.5, 0x5a3b2a, 0x241a12, "SURVIVOR", ["They came through the floor. Just like the stories.", "Don't trust the radio. It lies."], [[-3.0, -1.5], [0.0, -4.0], [3.0, -1.5]], 0.42);
  npc(0.5, 4.8, 0x39423a, 0x1e1711, "GUARD", ["Keep away from the fan tunnel.", "If you hear Mara down there, don't answer."], [[0.5, 4.8], [-2.0, 5.5], [2.0, 5.5]], 0.18);
  refs.npcs = npcs;

  // clutter / barrels
  for (const [x, z, s] of [[-5.2, 12.2, 0.65], [5.2, 12.2, 0.7], [-5.2, 0.2, 0.55], [5.2, 0.2, 0.6], [-5.0, -5.0, 0.7], [5.0, -5.0, 0.55]]) {
    box(s, s, s, 0x6a4a2c, x, s / 2, z, group);
    box(s * 0.9, 0.08, s * 0.9, 0x3a2a1a, x, s * 0.8, z, group);
    colliders.push({ minX: x - s / 2, maxX: x + s / 2, minZ: z - s / 2, maxZ: z + s / 2 });
  }
  for (const [x, z] of [[-5.4, 10.0], [5.4, 10.0], [-5.4, -8.0], [5.4, -8.0]]) {
    cyl(0.28, 0.28, 0.8, 8, 0x8a5a2a, x, 0.4, z, group);
    cyl(0.29, 0.29, 0.06, 8, 0x3a2a1a, x, 0.15, z, group);
    colliders.push({ minX: x - 0.28, maxX: x + 0.28, minZ: z - 0.28, maxZ: z + 0.28 });
  }

  addDust(group, 70, 26, 0xa08d6b);
  group.userData.refs = refs;
  return {
    group,
    refs,
    colliders,
    npcs,
    spawn: new THREE.Vector3(0, 0, 14.0),
    spawnYaw: 0,
    bounds: { minX: -15.2, maxX: 15.2, minZ: -14.2, maxZ: 14.2 },
  };
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
