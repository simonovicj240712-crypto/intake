import * as THREE from "three";
import {
  box,
  cyl,
  sphere,
  plane,
  mat,
  basic,
  toonMat,
  surfaceTexture,
  addGlow,
  addLightShaft,
  addDust,
  pointLight,
  makeHumanoid,
  makeRat,
  makeTenant,
  makeCrawler,
  makeScavenger,
} from "./world.js?v=27";

function vec(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

function ventShell({ w = 12, d = 14, h = 3.2, floor = 0x242b27, wall = 0x29322d, ceiling = 0x131918 } = {}) {
  const group = new THREE.Group();
  const colliders = [];
  const floorMat = toonMat(floor, {
    map: surfaceTexture("concrete", { repeat: [4, 4] }),
  });
  const wallMat = toonMat(wall, {
    map: surfaceTexture("metal", { repeat: [3, 1] }),
  });
  box(w, 0.2, d, floor, 0, -0.1, 0, group, { material: floorMat });
  box(w, 0.16, d, ceiling, 0, h, 0, group);
  box(0.2, h, d, wall, -w / 2, h / 2, 0, group, { material: wallMat });
  box(0.2, h, d, wall, w / 2, h / 2, 0, group, { material: wallMat });
  box(w, h, 0.2, wall, 0, h / 2, -d / 2, group, { material: wallMat });
  box(w, h, 0.2, wall, 0, h / 2, d / 2, group, { material: wallMat });
  colliders.push({ minX: -w / 2 - 0.2, maxX: -w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: w / 2 - 0.2, maxX: w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: -d / 2 - 0.2, maxZ: -d / 2 + 0.2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: d / 2 - 0.2, maxZ: d / 2 + 0.2 });
  return { group, colliders };
}

function pipes(group, zSpan = 10, x = 0, y = 2.8) {
  for (let i = 0; i < 3; i++) {
    cyl(0.055, 0.055, zSpan, 6, 0x3f7a6c, x - 0.10 + i * 0.10, y - (i % 2) * 0.12, 0, group, { rotX: Math.PI / 2 });
  }
}

function emergencyLamps(group, count, zStart, zStep, x = 0, color = 0x7fa36a, intensity = 0.8, y = 2.2) {
  for (let i = 0; i < count; i++) {
    const z = zStart - i * zStep;
    cyl(0.012, 0.012, 0.35, 4, 0x1a211d, x, y + 0.2, z, group);
    box(0.28, 0.06, 0.4, 0x1a211d, x, y + 0.05, z, group);
    box(0.18, 0.06, 0.3, color, x, y, z, group, { material: basic(color) });
    addGlow(group, color, x, y - 0.05, z, 0.5, 0.2);
    pointLight(color, intensity, 5, x, y - 0.2, z, group, { decay: 1.6 });
  }
}

function body(group, x, z, rotY = 0) {
  const g = new THREE.Group();
  box(0.42, 0.58, 0.24, 0x3b4038, 0, 0.3, 0, g, { rotZ: 1.3, rotY: 0.28 });
  sphere(0.13, 7, 5, 0x8f7d68, 0.48, 0.25, 0.06, g);
  box(0.13, 0.56, 0.14, 0x282d28, -0.4, 0.22, 0.1, g, { rotZ: 0.5 });
  box(0.13, 0.52, 0.14, 0x282d28, -0.33, 0.2, -0.18, g, { rotZ: 0.8 });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  group.add(g);
  return g;
}

function note(group, x, z, text) {
  const g = new THREE.Group();
  box(0.34, 0.02, 0.25, 0xb7ad93, 0, 0.08, 0, g);
  box(0.28, 0.012, 0.19, 0x6b5a3c, 0, 0.095, 0, g);
  g.position.set(x, 0.05, z);
  g.rotation.y = Math.random() * Math.PI;
  group.add(g);
  return { group: g, pos: g.position.clone(), text };
}

function pickup(group, x, z, type) {
  const g = new THREE.Group();
  if (type === "medkit") {
    box(0.3, 0.2, 0.24, 0xb9b6a6, 0, 0.16, 0, g);
    box(0.18, 0.05, 0.06, 0x9e4a2a, 0, 0.27, 0.0, g);
  } else if (type === "mgr") {
    cyl(0.12, 0.12, 0.16, 7, 0xc9a04a, 0, 0.14, 0, g);
    cyl(0.08, 0.08, 0.18, 7, 0x8d7135, 0.18, 0.12, 0.08, g, { rotZ: 1.4 });
  } else {
    box(0.28, 0.18, 0.2, 0xceb36a, 0, 0.14, 0, g);
  }
  g.position.set(x, 0, z);
  group.add(g);
  return { group: g, pos: g.position.clone(), type };
}

function fuse(group, x, z) {
  const g = new THREE.Group();
  cyl(0.07, 0.07, 0.28, 7, 0xc7a35a, 0, 0.18, 0, g);
  cyl(0.1, 0.1, 0.04, 7, 0x2a302c, 0, 0.33, 0, g);
  cyl(0.1, 0.1, 0.04, 7, 0x2a302c, 0, 0.03, 0, g);
  g.position.set(x, 0, z);
  group.add(g);
  return { group: g, pos: g.position.clone() };
}

function valve(group, x, z) {
  const g = new THREE.Group();
  cyl(0.05, 0.05, 0.5, 6, 0x444f48, 0, 0.32, 0, g);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 5, 10), mat(0x8b3f28));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.y = 0.6;
  g.add(wheel);
  for (let i = 0; i < 4; i++) {
    box(0.5, 0.025, 0.03, 0x8b3f28, 0, 0.6, 0, g, { rotY: (Math.PI / 4) * i });
  }
  g.position.set(x, 0, z);
  group.add(g);
  return { group: g, pos: g.position.clone(), wheel, turned: false };
}

function door(group, x, z, label = "VENT", rotY = 0) {
  const g = new THREE.Group();
  // bulkhead frame
  box(2.5, 0.2, 0.4, 0x1b2420, 0, 2.26, 0, g);
  box(0.24, 2.36, 0.4, 0x232d28, -1.13, 1.18, 0, g);
  box(0.24, 2.36, 0.4, 0x232d28, 1.13, 1.18, 0, g);
  // door panel
  box(1.86, 2.12, 0.14, 0x323b35, 0, 1.08, 0.06, g);
  for (let i = 0; i < 7; i++) {
    box(1.72, 0.055, 0.05, 0x171f1b, 0, 0.18 + i * 0.29, 0.14, g);
  }
  box(0.12, 0.5, 0.08, 0x8d7c52, 0.7, 1.08, 0.16, g);
  box(0.22, 0.06, 0.1, 0x0f1512, 0.7, 0.8, 0.16, g);
  // warning strips on frame
  plane(0.34, 0.52, 0xffffff, -1.13, 0.33, 0.21, g, { material: hazardMaterial() });
  plane(0.34, 0.52, 0xffffff, 1.13, 0.33, 0.21, g, { material: hazardMaterial() });
  // stencilled icon label
  plane(0.92, 0.46, 0xffffff, 0, 2.36, 0.22, g, { material: signMaterial(label, "#d8c9a3") });
  // requirement pips: one green light per completed fuse/valve/power stage
  const pips = [];
  for (let i = 0; i < 3; i++) {
    pips.push(box(0.1, 0.1, 0.05, 0x6a2018, -0.26 + i * 0.26, 1.84, 0.2, g, { material: basic(0x6a2018) }));
  }
  // central status lamp: red while sealed, green when ready
  const statusLamp = box(0.14, 0.14, 0.06, 0xb33a24, 0, 2.06, 0.2, g, { material: basic(0xb33a24) });
  addGlow(g, 0xb33a24, 0, 2.06, 0.25, 0.38, 0.3);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  group.add(g);
  pointLight(0x8fb06a, 1.6, 5.5, x, 1.9, z, group, { decay: 1.5 });
  return { group: g, pos: new THREE.Vector3(x, 0, z), label, pips, statusLamp };
}

function crawlerAt(group, x, z, rotY = 0) {
  const c = makeCrawler();
  c.position.set(x, 0, z);
  c.rotation.y = rotY;
  c.visible = false;
  group.add(c);
  return c;
}

function enemy(type, group, opts = {}) {
  const e = {
    type,
    group,
    health: opts.health ?? (type === "rat" ? 20 : type === "scavenger" ? 60 : 80),
    maxHealth: opts.health ?? (type === "rat" ? 30 : type === "scavenger" ? 60 : 80),
    speed: opts.speed ?? (type === "rat" ? 2.0 : type === "scavenger" ? 1.2 : 2.2),
    damage: opts.damage ?? (type === "rat" ? 5 : type === "scavenger" ? 5 : 20),
    attackRange: opts.attackRange ?? (type === "scavenger" ? 9 : 1.2),
    alertRange: opts.alertRange ?? (type === "scavenger" ? 12 : 9),
    cooldown: opts.cooldown ?? (type === "scavenger" ? 1.55 : 0.9),
    timer: 1.8 + Math.random() * 2.2,
    dead: false,
    baseY: group.position.y,
  };
  group.userData.enemyRef = e;
  return e;
}

function ratEnemy(group, x, z) {
  const r = makeRat({ scale: 0.85 });
  r.position.set(x, 0, z);
  r.rotation.y = Math.random() * Math.PI * 2;
  group.add(r);
  return enemy("rat", r);
}

function scavengerEnemy(group, x, z, rotY = 0) {
  const s = makeScavenger();
  s.position.set(x, 0, z);
  s.rotation.y = rotY;
  group.add(s);
  return enemy("scavenger", s);
}

export function buildDeadRail() {
  const group = new THREE.Group();
  const colliders = [];
  const w = 26, d = 22;
  const groundMat = toonMat(0x2a2c27, {
    map: surfaceTexture("concrete", { repeat: [12, 10] }),
  });
  const wallMat = toonMat(0x2b332e, {
    map: surfaceTexture("metal", { repeat: [8, 2] }),
  });
  const carMat = toonMat(0x40504a, {
    map: surfaceTexture("metal", { repeat: [4, 2] }),
  });
  box(w, 0.2, d, 0x1b1c19, 0, -0.1, 0, group, { material: groundMat });
  // ruined perimeter
  for (const side of [-1, 1]) {
    box(0.4, 3.5, d, 0x1d2421, side * (w / 2), 1.75, 0, group, { material: wallMat });
    colliders.push({ minX: side * (w / 2) - 0.25, maxX: side * (w / 2) + 0.25, minZ: -d / 2, maxZ: d / 2 });
    box(w, 3.5, 0.4, 0x1d2421, 0, 1.75, side * (d / 2), group, { material: wallMat });
    colliders.push({ minX: -w / 2, maxX: w / 2, minZ: side * (d / 2) - 0.25, maxZ: side * (d / 2) + 0.25 });
  }
  // rails
  for (let i = 0; i < 2; i++) {
    box(24, 0.08, 0.12, 0x4b4d45, 0, 0.04, -3 + i * 1.2, group);
    box(24, 0.08, 0.12, 0x3a3c36, 0, 0.04, 2 + i * 1.2, group);
  }
  // sleepers
  for (let x = -11.5; x <= 11.5; x += 1.25) {
    box(0.18, 0.06, 1.35, 0x3a2c20, x, 0.02, -2.4, group);
    box(0.18, 0.06, 1.35, 0x3a2c20, x, 0.02, 2.6, group);
  }
  // overhead gantry
  for (const side of [-1, 1]) {
    box(0.4, 5.2, 0.4, 0x2a3530, side * 12, 2.6, -1, group);
    box(0.18, 2.2, 0.18, 0x1c2420, side * 10.8, 3.9, -1, group, { rotZ: side * 0.5 });
  }
  box(24.6, 0.35, 0.42, 0x2a3530, 0, 5.0, -1, group);
  box(24.6, 0.12, 0.5, 0xc05a26, 0, 4.75, -1, group);
  plane(3.2, 0.85, 0xffffff, 0, 3.9, -0.76, group, { material: signMaterial("DEAD RAIL", "#ffe08a") });
  addGlow(group, 0xffd27a, 0, 3.9, -0.7, 1.2, 0.18);
  for (const x of [-1.2, 1.2]) {
    cyl(0.012, 0.012, 1.0, 4, 0x1a211d, x, 4.45, -0.9, group);
  }
  for (const x of [-6, 6]) {
    box(0.22, 0.08, 0.3, 0xffb765, x, 4.65, -0.8, group, { material: basic(0xffb765) });
    addGlow(group, 0xffb765, x, 4.65, -0.8, 0.7, 0.22);
  }
  // stacked freight containers
  for (const [x, z, color, stack] of [[-10.2, 4.2, 0x2f6f66, 2], [10.0, -4.4, 0x9a4a28, 1]]) {
    for (let k = 0; k < stack; k++) {
      const y = 1.2 + k * 2.45;
      box(2.5, 2.4, 5.2, color, x, y, z, group);
      for (let j = 0; j < 9; j++) {
        box(2.56, 0.06, 0.08, 0x1a2420, x, 0.25 + j * 0.26 + k * 2.45, z - 2.5, group);
        box(2.56, 0.06, 0.08, 0x1a2420, x, 0.25 + j * 0.26 + k * 2.45, z + 2.5, group);
      }
      box(2.56, 0.12, 5.26, 0x1a2420, x, 2.35 + k * 2.45, z, group);
      for (let j = 0; j < 10; j++) {
        box(0.04, 2.2, 0.07, 0x1a2420, x - 1.27, y, z - 2.35 + j * 0.52, group);
        box(0.04, 2.2, 0.07, 0x1a2420, x + 1.27, y, z - 2.35 + j * 0.52, group);
      }
    }
    colliders.push({ minX: x - 1.3, maxX: x + 1.3, minZ: z - 2.7, maxZ: z + 2.7 });
  }
  // signal masts
  for (const [x, z, color] of [[-9.5, -6.5, 0x9e3a24], [9.5, 6.5, 0x7fa36a]]) {
    cyl(0.08, 0.08, 4.4, 6, 0x2a3530, x, 2.2, z, group);
    box(0.35, 0.7, 0.3, 0x1a2420, x, 4.1, z, group);
    sphere(0.09, 6, 5, color, x, 4.3, z + 0.18, group, { material: basic(color) });
    pointLight(color, 2.6, 8, x, 4.2, z, group, { decay: 1.5 });
    addGlow(group, color, x, 4.3, z + 0.2, 0.8, 0.26);
    addLightShaft(group, color, x, 4.25, z, 4.2, 0.7, 0.026);
  }
  // train cars
  for (const [x, z, rotY] of [[-6, -2, 0], [5, 3, Math.PI], [7, -5, 0]]) {
    const car = new THREE.Group();
    box(7.2, 2.5, 2.5, 0x2e3935, 0, 1.3, 0, car, { material: carMat });
    box(6.9, 0.5, 2.2, 0x18211e, 0, 2.3, 0, car);
    for (let i = 0; i < 5; i++) box(1.0, 0.65, 0.06, 0x0b1110, -2.6 + i * 1.3, 1.6, 1.28, car);
    for (let i = 0; i < 4; i++) cyl(0.28, 0.28, 0.2, 8, 0x151b19, -2.4 + i * 1.6, 0.25, 1.25, car, { rotX: Math.PI / 2 });
    car.position.set(x, 0, z);
    car.rotation.y = rotY;
    group.add(car);
    colliders.push({ minX: x - 3.6, maxX: x + 3.6, minZ: z - 1.3, maxZ: z + 1.3 });
  }
  // platforms / debris
  for (let i = 0; i < 18; i++) {
    box(0.5 + Math.random(), 0.15, 0.4 + Math.random(), 0x33291e, (Math.random() - 0.5) * 20, 0.06, (Math.random() - 0.5) * 17, group, { rotY: Math.random() * 3 });
  }
  // puddles around the yard
  for (let i = 0; i < 9; i++) {
    const m = new THREE.MeshLambertMaterial({ color: 0x1a2a2c, transparent: true, opacity: 0.45 });
    plane(1.2 + Math.random() * 1.8, 0.8 + Math.random() * 1.0, 0xffffff,
      (Math.random() - 0.5) * 20, 0.014, (Math.random() - 0.5) * 16, group,
      { rotX: -Math.PI / 2, rotZ: Math.random() * 3, material: m });
  }
  for (const x of [-6, 6]) {
    addLightShaft(group, 0xffb765, x, 4.6, -0.8, 4.5, 0.65, 0.025);
  }
  // gate
  const gate = door(group, 0, -9.6, "GATE");
  for (let i = 0; i < 8; i++) box(0.06, 2.2, 0.1, 0x55605a, -1.2 + i * 0.34, 1.1, -9.48, group);
  // lights
  for (const [x, z] of [[-7, 5], [6, 2], [0, -5]]) {
    pointLight(0x8aa4a2, 2.2, 9, x, 3.4, z, group, { decay: 1.5 });
    box(0.14, 0.05, 0.4, 0x8fb2ae, x, 3.55, z, group, { material: basic(0x8fb2ae) });
    addGlow(group, 0x9ac2bc, x, 3.55, z, 1.2, 0.28);
    if (x !== 0) {
      cyl(0.04, 0.04, 3.5, 6, 0x2a3530, x, 1.75, z, group);
      box(0.22, 0.05, 0.3, 0x1a2420, x, 3.52, z, group);
    }
  }
  // ruined skyline beyond the yard
  const towerMat = mat(0x0a1210);
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (15 + Math.random() * 12);
    const z = -24 + Math.random() * 46;
    const h = 8 + Math.random() * 18;
    const tw = 2.6 + Math.random() * 3.4;
    const td = 2.6 + Math.random() * 3.4;
    box(tw, h, td, 0x0a1210, x, h / 2, z, group, { material: towerMat });
    for (let k = 0; k < 3; k++) {
      if (Math.random() < 0.55) {
        const wy = 2.5 + Math.random() * (h - 4);
        const wx = x - Math.sign(x) * (tw / 2 + 0.02);
        box(0.05, 0.32, 0.18, 0x9a743a, wx, wy, z + (Math.random() - 0.5) * td * 0.6, group, { material: basic(0x9a743a) });
      }
    }
  }
  const moon = new THREE.Mesh(
    new THREE.CircleGeometry(2.3, 22),
    new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: 0.85, fog: false })
  );
  moon.position.set(13, 15, -34);
  moon.lookAt(0, 1.6, 9);
  group.add(moon);
  addGlow(group, 0xffe6b0, 13, 15, -34, 8, 0.13);
  // stars above the yard
  const starData = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    starData[i * 3] = (Math.random() - 0.5) * 110;
    starData[i * 3 + 1] = 12 + Math.random() * 34;
    starData[i * 3 + 2] = -70 + Math.random() * 110;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starData, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xbcd8ff,
    size: 0.16,
    transparent: true,
    opacity: 0.8,
    fog: false,
    depthWrite: false,
  }));
  group.add(stars);
  // broken overhead cables
  for (let i = 0; i < 4; i++) {
    const x = -10 + i * 6.5;
    cyl(0.012, 0.012, 10, 4, 0x1a211e, x, 5.1, 2, group, { rotX: 0.2, rotZ: 0.05 });
  }
  emergencyLamps(group, 3, 6, 4, -11, 0x7fa36a, 0.7);
  // burning barrel near the spawn
  addBarrel(group, colliders, -7.6, 6.4);
  pointLight(0xff7a2a, 4.5, 9, -7.6, 1.1, 6.4, group, { decay: 1.35 });
  addGlow(group, 0xff7a2a, -7.6, 1.0, 6.4, 1.5, 0.36);

  const enemies = [
    scavengerEnemy(group, -5, 3, 0.6),
    scavengerEnemy(group, 6, -3, -0.8),
    ratEnemy(group, 2, 5),
    ratEnemy(group, -2, -5),
    ratEnemy(group, 6, 4),
  ];

  // bodies and notes
  const bodies = [
    { group: body(group, 4, 5, 0.4), loot: { mgr: 8, ammo: 8 } },
    { group: body(group, -6, -1, -0.8), loot: { mgr: 5, medkit: 1 } },
    { group: body(group, 1, -6.5, 1.2), loot: { mgr: 7, ammo: 6, log: true } },
  ];
  const notes = [
    note(group, -4, -3, "LOG 04: The rail yard was the last way out. Then the trains stopped."),
    note(group, 8, 6, "LOG 05: Something moved into the carriages. It was wearing a respirator."),
  ];
  const med = pickup(group, 9, -1, "medkit");
  const mgrPickup = pickup(group, -9, -2, "mgr");

  const interactables = [];
  for (const b of bodies) interactables.push({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false });
  for (const n of notes) interactables.push({ kind: "note", pos: n.pos, radius: 1.5, text: n.text, group: n.group });
  interactables.push({ kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group });
  interactables.push({ kind: "pickup", pos: mgrPickup.pos, radius: 1.5, item: "mgr", group: mgrPickup.group });
  interactables.push({ kind: "exit", pos: gate.pos, radius: 2.4, prompt: "E — OPEN THE GATE", next: "zarya" });

  return {
    group,
    colliders,
    refs: { gate },
    spawn: vec(0, 0, 9),
    bounds: { minX: -12.2, maxX: 12.2, minZ: -10.2, maxZ: 10.2 },
    enemies,
    interactables,
    triggers: [{ kind: "vision", pos: vec(0, 0, 0), radius: 3.5, visionId: 2, once: true }],
    fog: { color: 0x14243c, density: 0.018 },
    ambient: { color: 0x5e7a90, intensity: 0.95 },
    background: 0x0c1830,
  };
}

function buildZaryaLegacy() {
  const group = new THREE.Group();
  const colliders = [];
  const w = 14, d = 13;
  const floorMat = toonMat(0x6a4a30, {
    map: surfaceTexture("wood", { repeat: [6, 6] }),
  });
  const wallMat = toonMat(0x44564e, {
    map: surfaceTexture("tile", { repeat: [6, 3] }),
  });
  const counterMat = toonMat(0x8a5a34, {
    map: surfaceTexture("wood", { repeat: [4, 1] }),
  });
  box(w, 0.2, d, 0x211d18, 0, -0.1, 0, group, { material: floorMat });
  box(w, 4.2, 0.2, 0x1d2a26, 0, 2.1, -d / 2, group, { material: wallMat });
  box(w, 4.2, 0.2, 0x1d2a26, 0, 2.1, d / 2, group, { material: wallMat });
  box(0.2, 4.2, d, 0x1b2824, -w / 2, 2.1, 0, group, { material: wallMat });
  box(0.2, 4.2, d, 0x1b2824, w / 2, 2.1, 0, group, { material: wallMat });
  box(w, 0.2, d, 0x121918, 0, 4.2, 0, group);
  colliders.push({ minX: -w / 2 - 0.2, maxX: -w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: w / 2 - 0.2, maxX: w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: -d / 2 - 0.2, maxZ: -d / 2 + 0.2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: d / 2 - 0.2, maxZ: d / 2 + 0.2 });

  // bazaar
  for (let i = 0; i < 3; i++) {
    const x = -4.2 + i * 4.2;
    box(3.0, 0.9, 1.1, 0x3b2b1e, x, 0.45, -2.8, group);
    box(3.4, 0.08, 1.5, 0x6b2f21, x, 1.5, -2.8, group, { rotZ: 0.02 });
    for (let j = 0; j < 5; j++) cyl(0.07, 0.07, 0.14, 6, j % 2 ? 0x7d6a3f : 0x4c6045, x - 0.8 + j * 0.4, 0.98, -2.7, group);
    colliders.push({ minX: x - 1.6, maxX: x + 1.6, minZ: -3.4, maxZ: -2.1 });
  }
  // hanging bulbs
  for (const x of [-4, 0, 4]) {
    cyl(0.02, 0.02, 0.8, 5, 0x191d1a, x, 3.55, 0.8, group);
    sphere(0.1, 6, 5, 0xffb765, x, 3.1, 0.8, group, { material: basic(0xffb765) });
    pointLight(0xff9a4a, 3.0, 7, x, 3.0, 0.8, group, { decay: 1.3 });
    addGlow(group, 0xffb765, x, 3.1, 0.8, 0.85, 0.32);
  }
  pointLight(0xffb070, 10, 18, 0, 3.4, 0, group, { decay: 1.1 });
  // station name and trader's stall details
  plane(3.0, 1.0, 0xffffff, 0, 3.05, -6.4, group, { material: signMaterial("ZARYA", "#ffe08a") });
  plane(1.15, 0.5, 0xffffff, -4.6, 2.0, -6.38, group, { material: signMaterial("AIR", "#ffd27a") });
  plane(1.3, 0.5, 0xffffff, 4.5, 2.05, -6.38, group, { material: signMaterial("NO CREDIT", "#ff8a6a") });
  plane(1.35, 0.5, 0xffffff, 2.7, 1.72, -6.38, group, { material: signMaterial("SANCTUARY", "#8fe0c0") });
  for (const side of [-1, 1]) {
    cyl(0.045, 0.045, 12.2, 6, 0x3d4a43, side * 6.7, 2.55, 0, group, { rotX: Math.PI / 2 });
    cyl(0.03, 0.03, 12.0, 5, 0x2b3631, side * 6.6, 0.55, 0, group, { rotX: Math.PI / 2 });
  }
  for (const x of [-1.7, -0.7, 0.7, 1.7]) {
    box(0.42, 0.06, 0.3, 0x2e2118, x, 1.55, -0.8, group);
    box(0.42, 0.06, 0.3, 0x2e2118, x, 1.85, -0.8, group);
    for (let k = 0; k < 2; k++) {
      cyl(0.06, 0.06, 0.16, 6, k ? 0x6b7a55 : 0x8a6a3a, x - 0.08 + k * 0.16, 1.64, -0.8, group);
      cyl(0.06, 0.06, 0.16, 6, k ? 0x5c6b4c : 0x7c5d31, x - 0.08 + k * 0.16, 1.94, -0.8, group);
    }
  }
  // crates and barrels pushed against the walls
  addCrate(group, colliders, -5.8, 3.4, 0.7);
  addCrate(group, colliders, -5.5, 2.4, 0.55);
  addBarrel(group, colliders, 5.7, -3.6);
  addBarrel(group, colliders, 4.8, -4.5);
  // a few waiting figures
  for (const [x, z, rot] of [[-3.7, 4.5, 2.6], [-4.8, 3.4, 2.0]]) {
    const h = makeHumanoid({ coat: 0x39423a, pants: 0x1a201c, hair: 0x1e1711 });
    h.position.set(x, 0, z);
    h.rotation.y = rot;
    group.add(h);
  }
  // hanging tarps
  const tarp = new THREE.MeshLambertMaterial({ color: 0x2f6f66, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const tarp2 = new THREE.MeshLambertMaterial({ color: 0x9a3a24, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  plane(2.2, 1.5, 0xffffff, -6.3, 2.5, 0.4, group, { rotY: Math.PI / 2, material: tarp });
  plane(2.2, 1.5, 0xffffff, 6.2, 2.5, 2.2, group, { rotY: -Math.PI / 2, material: tarp2 });
  // rugs
  plane(3.4, 2.2, 0xffffff, -3.8, 0.015, 0.6, group, { rotX: -Math.PI / 2, material: toonMat(0x7d2f26) });
  plane(2.6, 1.8, 0xffffff, 3.4, 0.016, 3.0, group, { rotX: -Math.PI / 2, material: toonMat(0x2f5f58) });
  // side vent grates
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      box(0.08, 0.7, 1.2, 0x131a17, side * 6.85, 1.2, -3 + k * 3.4, group);
      for (let j = 0; j < 5; j++) box(0.04, 0.06, 1.05, 0x303a34, side * 6.78, 0.95 + j * 0.13, -3 + k * 3.4, group);
    }
  }

  // counter / Vera
  box(3.4, 0.9, 0.8, 0x3f2e20, 0, 0.45, 1.3, group, { material: counterMat });
  box(3.6, 0.1, 1.0, 0x5b4029, 0, 0.92, 1.3, group, { material: counterMat });
  colliders.push({ minX: -1.8, maxX: 1.8, minZ: 0.9, maxZ: 1.7 });
  const vera = makeHumanoid({ coat: 0x5a3b2a, pants: 0x1d211e, hair: 0x2a1d14 });
  vera.position.set(0, 0, 2.0);
  group.add(vera);
  box(0.17, 0.045, 0.035, 0x1b1c18, 0, 1.44, 0.11, vera);
  box(0.05, 0.05, 0.02, 0x8caa76, -0.05, 1.44, 0.13, vera, { material: basic(0x8caa76) });
  box(0.05, 0.05, 0.02, 0x8caa76, 0.05, 1.44, 0.13, vera, { material: basic(0x8caa76) });
  pointLight(0xffc078, 3.2, 6, 0, 2.15, 3.0, group, { decay: 1.35 });

  // floating coin beacon marks the trader without using words
  const shopBeacon = new THREE.Group();
  cyl(0.19, 0.19, 0.06, 14, 0xc9a04a, 0, 0, 0, shopBeacon, { rotX: Math.PI / 2, material: basic(0xc9a04a) });
  const beaconRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.026, 5, 16), toonMat(0x8d7135));
  shopBeacon.add(beaconRing);
  shopBeacon.position.set(1.72, 1.72, 2.55);
  shopBeacon.userData.baseY = 1.72;
  group.add(shopBeacon);
  addGlow(group, 0xffd27a, 1.72, 1.72, 2.55, 0.85, 0.22);

  // exit vent
  const exit = door(group, 0, -5.7, "VENT");
  const noteObj = note(group, -4.8, 4.2, "LOG 08: Zarya sells everything. Even the air.");
  const med = pickup(group, 4.5, 4.4, "medkit");

  return {
    group,
    colliders,
    refs: { vera, exit, shopBeacon },
    spawn: vec(0, 0, 5.2),
    bounds: { minX: -6.6, maxX: 6.6, minZ: -5.8, maxZ: 6.2 },
    enemies: [],
    interactables: [
      { kind: "shop", pos: vera.position.clone(), radius: 2.6, prompt: "E — TRADE WITH VERA" },
      { kind: "exit", pos: exit.pos, radius: 2.3, prompt: "E — DESCEND", next: "warren" },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
    ],
    triggers: [
      { kind: "vision", pos: vec(0, 0, -3.4), radius: 2.4, visionId: 3, once: true },
    ],
    fog: { color: 0x090b08, density: 0.028 },
    ambient: { color: 0x8a6a4a, intensity: 0.72 },
    background: 0x050605,
  };
}

export function buildZarya() {
  const group = new THREE.Group();
  const colliders = [];
  const npcs = [];
  const refs = {};
  const W = 34, D = 30, H = 5.2;
  const floorMat = toonMat(0x3e4b46, { map: surfaceTexture("tile", { repeat: [12, 12] }) });
  const wallMat = toonMat(0x52645d, { map: surfaceTexture("tile", { repeat: [8, 3] }) });
  const metalMat = toonMat(0x37453f, { map: surfaceTexture("metal", { repeat: [8, 2] }) });
  const woodMat = toonMat(0x6a4a30, { map: surfaceTexture("wood", { repeat: [5, 2] }) });

  box(W, 0.2, D, 0x3e4b46, 0, -0.1, 0, group, { material: floorMat });
  box(W, H, 0.3, 0x52645d, 0, H / 2, -D / 2, group, { material: wallMat });
  box(W, H, 0.3, 0x46564f, 0, H / 2, D / 2, group, { material: wallMat });
  for (const side of [-1, 1]) {
    box(0.3, H, D, 0x46564f, side * W / 2, H / 2, 0, group, { material: wallMat });
    colliders.push({ minX: side * W / 2 - 0.2, maxX: side * W / 2 + 0.2, minZ: -D / 2, maxZ: D / 2 });
  }
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: -D / 2 - 0.2, maxZ: -D / 2 + 0.2 });
  colliders.push({ minX: -W / 2, maxX: W / 2, minZ: D / 2 - 0.2, maxZ: D / 2 + 0.2 });
  box(W, 0.16, D, 0x1a2420, 0, H, 0, group);

  // tall gallery ribs and catwalks (visual verticality)
  for (const side of [-1, 1]) {
    for (const z of [-12, -7, -2, 3, 8, 13]) {
      box(0.16, H, 0.24, 0x2b3a34, side * 15.8, H / 2, z, group);
    }
    box(0.1, 0.12, 28, 0x8a6a3a, side * 15.7, 2.9, 0, group);
    box(0.1, 0.08, 28, 0x8a6a3a, side * 15.7, 4.1, 0, group);
  }
  for (const z of [-10, -4, 1, 6, 11]) {
    box(31, 0.08, 0.14, 0x2b3a34, 0, 2.8, z, group);
    box(31, 0.06, 0.12, 0x2b3a34, 0, 4.0, z, group);
  }
  // upper gallery railings and laundry
  for (const side of [-1, 1]) {
    for (let z = -10; z <= 10; z += 3.2) {
      box(0.06, 1.0, 0.06, 0x596b62, side * 10.4, 3.4, z, group);
    }
    box(0.06, 0.08, 22, 0x596b62, side * 10.4, 3.9, 0, group);
  }
  for (let i = 0; i < 8; i++) {
    const x = -8 + i * 2.2;
    plane(0.8, 0.45, 0xffffff, x, 3.35, 12.4, group, { material: toonMat(i % 2 ? 0x2e6f66 : 0x8a3a2a, { side: THREE.DoubleSide }) });
  }

  // side rooms / district partitions with wide doorways
  const partition = (x, z1, z2) => {
    const len = z2 - z1;
    box(0.22, 2.9, len, 0x3e514a, x, 1.45, (z1 + z2) / 2, group);
    box(0.3, 0.1, len, 0x8a6a3a, x, 2.92, (z1 + z2) / 2, group);
    colliders.push({ minX: x - 0.16, maxX: x + 0.16, minZ: z1, maxZ: z2 });
  };
  for (const side of [-1, 1]) {
    const x = side * 6.4;
    partition(x, -15, -11.2);
    partition(x, -9.4, -3.2);
    partition(x, 0.8, 5.2);
    partition(x, 7.4, 15);
  }

  // central scrubber tower landmark
  const tower = new THREE.Group();
  cyl(1.1, 1.3, 3.8, 12, 0x3f5550, 0, 1.9, 0, tower);
  for (let i = 0; i < 5; i++) cyl(1.18, 1.18, 0.08, 12, 0x8a6a3a, 0, 0.45 + i * 0.72, 0, tower);
  for (let i = 0; i < 6; i++) box(1.6, 0.08, 0.12, 0x596b62, 0, 1.1 + i * 0.4, 0, tower, { rotY: (Math.PI / 3) * i });
  const towerLight = pointLight(0x8fe0c0, 2.8, 9, 0, 2.6, 0, tower, { decay: 1.4 });
  addGlow(tower, 0x8fe0c0, 0, 2.8, 0, 1.2, 0.22);
  tower.position.set(0, 0, -4.4);
  group.add(tower);
  colliders.push({ minX: -1.3, maxX: 1.3, minZ: -5.7, maxZ: -3.1 });
  refs.tower = tower;
  refs.towerLight = towerLight;

  // entry / checkpoint
  for (const side of [-1, 1]) {
    box(0.3, 3.2, 1.2, 0x2b3a34, side * 4.2, 1.6, 12.8, group);
    colliders.push({ minX: side * 4.2 - 0.2, maxX: side * 4.2 + 0.2, minZ: 12.2, maxZ: 13.4 });
  }
  box(9, 0.4, 0.5, 0x2b3a34, 0, 3.9, 12.8, group);
  plane(3.0, 0.78, 0xffffff, 0, 3.75, 12.55, group, { material: signMaterial("ZARYA", "#ffe08a") });
  addGlow(group, 0xffd27a, 0, 3.75, 12.3, 1.2, 0.18);
  // guard post
  box(1.8, 0.9, 0.8, 0x37453f, -5.6, 0.45, 11.4, group, { material: metalMat });
  colliders.push({ minX: -6.5, maxX: -4.7, minZ: 11.0, maxZ: 11.8 });

  // market stalls in the plaza
  for (const [x, z, color] of [[-7.2, 8.5, 0x7a3a24], [7.2, 8.5, 0x2f6f66], [-7.2, 3.4, 0xb8862a], [7.2, 3.4, 0x6b4a2e], [-7.2, -1.0, 0x2f6f66], [7.2, -1.0, 0x7a3a24]]) {
    box(2.6, 0.75, 1.1, 0x3f2e20, x, 0.38, z, group, { material: woodMat });
    box(2.9, 0.08, 1.3, color, x, 1.4, z, group, { rotZ: 0.02 });
    cyl(0.025, 0.025, 2.3, 5, 0x2d241b, x - 1.1, 1.15, z + 0.4, group);
    cyl(0.025, 0.025, 2.3, 5, 0x2d241b, x + 1.1, 1.15, z + 0.4, group);
    for (let i = 0; i < 5; i++) {
      cyl(0.06, 0.06, 0.14, 6, i % 2 ? 0x7d6a3f : 0x8a3a2a, x - 0.7 + i * 0.35, 0.9, z + 0.1, group);
    }
  }
  // string lights and tall lamps
  for (const [x, z, c] of [[-8, 10, 0xffb765], [8, 10, 0x8fe0c0], [-8, 5, 0xffd27a], [8, 5, 0xff9a4a], [-6, 0, 0x8fe0c0], [6, 0, 0xffb765], [0, -9, 0xffd27a]]) {
    cyl(0.018, 0.018, 1.1, 5, 0x191d1a, x, H - 1.1, z, group);
    sphere(0.09, 6, 5, c, x, H - 1.4, z, group, { material: basic(c) });
    pointLight(c, 2.2, 10, x, H - 1.6, z, group, { decay: 1.45 });
    addGlow(group, c, x, H - 1.4, z, 0.9, 0.24);
    addLightShaft(group, c, x, H - 1.4, z, 3.8, 0.8, 0.028);
  }

  // Vera's raised stall
  box(4.0, 0.4, 2.8, 0x4a3a2a, 0, 0.2, 6.0, group);
  box(3.8, 0.86, 0.7, 0x5b4029, 0, 0.88, 5.9, group, { material: woodMat });
  box(4.0, 0.1, 0.9, 0x7a5a35, 0, 1.34, 5.9, group);
  for (const side of [-1, 1]) {
    for (const z of [5.0, 6.8]) box(0.12, 2.0, 0.12, 0x3a2a1a, side * 1.8, 1.0, z, group);
  }
  box(4.2, 0.08, 2.8, 0x8a3a24, 0, 2.1, 5.9, group, { rotZ: 0.02 });
  colliders.push({ minX: -2.1, maxX: 2.1, minZ: 4.8, maxZ: 7.1 });
  const vera = makeHumanoid({ coat: 0x5a3b2a, pants: 0x1d211e, hair: 0x2a1d14 });
  vera.position.set(0, 0.4, 6.1);
  vera.rotation.y = Math.PI;
  group.add(vera);
  refs.vera = vera;
  box(0.17, 0.045, 0.035, 0x1b1c18, 0, 1.44, 0.11, vera);
  box(0.05, 0.05, 0.02, 0x8caa76, -0.05, 1.44, 0.13, vera, { material: basic(0x8caa76) });
  box(0.05, 0.05, 0.02, 0x8caa76, 0.05, 1.44, 0.13, vera, { material: basic(0x8caa76) });
  pointLight(0xffc078, 4.2, 6, 0, 2.1, 7.0, group, { decay: 1.3 });
  addGlow(group, 0xffc078, 0, 1.9, 6.8, 0.9, 0.2);
  const shopBeacon = new THREE.Group();
  cyl(0.19, 0.19, 0.06, 14, 0xc9a04a, 0, 0, 0, shopBeacon, { rotX: Math.PI / 2, material: basic(0xc9a04a) });
  shopBeacon.add(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.026, 5, 16), toonMat(0x8d7135)));
  shopBeacon.position.set(1.55, 1.75, 7.5);
  shopBeacon.userData.baseY = 1.75;
  group.add(shopBeacon);
  addGlow(group, 0xffd27a, 1.55, 1.75, 7.5, 0.9, 0.22);
  refs.shopBeacon = shopBeacon;

  // hospital wing (left)
  box(0.04, 0.64, 0.04, 0x8fe0c0, -15.6, 2.55, 2.2, group, { material: basic(0x8fe0c0) });
  box(0.34, 0.08, 0.04, 0x8fe0c0, -15.6, 2.55, 2.2, group, { material: basic(0x8fe0c0) });
  box(0.08, 0.34, 0.04, 0x8fe0c0, -15.6, 2.55, 2.2, group, { material: basic(0x8fe0c0) });
  for (const [x, z] of [[-14, 0.4], [-11.8, 0.4], [-14, 3.8], [-11.8, 3.8]]) {
    box(1.5, 0.14, 0.8, 0x4a5a52, x, 0.55, z, group);
    box(0.9, 0.1, 0.46, 0xa9b6a0, x, 0.64, z, group);
    for (const dx of [-0.65, 0.65]) box(0.08, 0.5, 0.08, 0x2a302c, x + dx, 0.28, z, group);
  }
  for (const z of [-0.5, 2.2, 4.9]) {
    plane(1.4, 0.08, 0xffffff, -9.2, 2.7, z, group, { rotY: Math.PI / 2, material: toonMat(0x9ab0a4, { transparent: true, opacity: 0.7, side: THREE.DoubleSide }) });
  }
  box(2.8, 0.08, 0.35, 0x3a2c20, -14.2, 1.5, -1.4, group);
  for (let i = 0; i < 7; i++) cyl(0.06, 0.06, 0.16, 6, i % 2 ? 0xc9c1aa : 0x8fbf7a, -15.3 + i * 0.38, 1.6, -1.4, group);

  // restaurant (right)
  for (const z of [-0.4, 2.2, 4.8]) {
    box(2.8, 0.12, 1.0, 0x6a4a30, 12.4, 0.8, z, group, { material: woodMat });
    for (const dx of [-1.15, 1.15]) box(0.12, 0.7, 0.12, 0x3a2a1a, 12.4 + dx, 0.4, z, group);
    for (let i = 0; i < 3; i++) cyl(0.12, 0.13, 0.02, 8, 0xb7ad93, 11.7 + i * 0.7, 0.87, z, group);
  }
  cyl(0.38, 0.42, 0.8, 8, 0x3a2a1e, 14.2, 0.4, 2.2, group);
  cyl(0.34, 0.34, 0.05, 8, 0x7e3a1c, 14.2, 0.82, 2.2, group, { material: basic(0xff7a2a) });
  pointLight(0xff7a2a, 3.8, 7, 14.2, 1.1, 2.2, group, { decay: 1.4 });
  addGlow(group, 0xff7a2a, 14.2, 1.0, 2.2, 1.0, 0.22);
  addLightShaft(group, 0xb8c8b8, 14.2, 1.2, 2.2, 1.3, 0.32, 0.03);
  for (let i = 0; i < 3; i++) {
    cyl(0.18, 0.22, 0.07, 8, 0xc9a04a, 8.7, 2.9, 0.2 + i * 1.1, group, { material: basic(0xc9a04a) });
    cyl(0.12, 0.12, 0.03, 8, 0x6b4a2e, 8.7, 2.87, 0.2 + i * 1.1, group);
  }

  // residential gallery (left, back)
  for (const [x, z] of [[-14.2, -6.0], [-14.2, -8.2], [-11.8, -6.0], [-11.8, -8.2]]) {
    box(1.5, 0.14, 2.0, 0x3f2e20, x, 0.55, z, group);
    box(1.2, 0.12, 1.7, 0x71745f, x, 0.65, z, group);
    box(0.9, 0.1, 0.6, 0x8a3a2a, x, 0.72, z, group);
  }
  for (const x of [-15, -13]) for (const z of [-9.4, -7.0, -4.6]) box(0.1, 1.4, 0.1, 0x2a1e14, x, 0.7, z, group);
  for (const [x1, x2, z] of [[-15.4, -9.4, -4.0], [-15.0, -10.0, -9.5]]) {
    cyl(0.015, 0.015, Math.abs(x2 - x1), 5, 0x3a4a42, (x1 + x2) / 2, 2.55, z, group, { rotZ: Math.PI / 2 });
    for (let i = 0; i < 5; i++) plane(0.6, 0.5, 0xffffff, x1 + (x2 - x1) * (i / 4), 2.2, z, group, { material: toonMat(i % 2 ? 0x8a3a2a : 0x2e6f66, { side: THREE.DoubleSide }) });
  }

  // descent / service passage
  const exit = door(group, 0, -13.2, "DESCENT");
  plane(3.0, 0.5, 0xffffff, 0, 3.0, -9.8, group, { material: signMaterial("SANCTUARY", "#8fe0c0") });
  addGlow(group, 0x8fe0c0, 0, 3.0, -9.7, 1.1, 0.16);
  for (const side of [-1, 1]) {
    box(0.14, 2.2, 0.14, 0x2b3a34, side * 2.8, 1.1, -12.6, group);
  }
  box(6.2, 0.14, 0.18, 0x2b3a34, 0, 2.25, -12.6, group);
  box(1.8, 0.9, 0.8, 0x37453f, 3.8, 0.45, -11.2, group, { material: metalMat });
  colliders.push({ minX: 2.8, maxX: 4.8, minZ: -11.7, maxZ: -10.7 });

  // NPCs
  const npc = (x, z, coat, hair, name, lines, route = null, speed = 0.5, child = false) => {
    const person = makeHumanoid({ child, coat, pants: 0x1b211d, hair });
    person.position.set(x, 0, z);
    group.add(person);
    npcs.push({ group: person, name, lines, route, speed, idx: 0, nextTalk: 0 });
  };
  npc(-11.0, 2.2, 0xa9b6a0, 0x2a2119, "DOCTOR", ["Quarantine is full. Keep moving.", "We can't take another patient. I'm sorry."], [[-11.0, 2.2], [-13.2, 3.5], [-11.0, 2.2]], 0.18);
  npc(13.6, 2.8, 0x7a4a2a, 0x241a12, "COOK", ["The stew is good today. Mostly.", "Sanctuary pays in clean water. Imagine that."], [[13.6, 2.8], [12.0, 1.0], [13.6, 2.8]], 0.16);
  npc(-12.0, -6.5, 0x4a3a2a, 0x2b1a12, "RESIDENT", ["They promised us a train. There is no train.", "You hear the music? It plays all night now."], [[-12.0, -6.5], [-13.4, -8.2], [-12.0, -6.5]], 0.16);
  npc(-8.8, -7.8, 0x8a7135, 0x3b2418, "CHILD", ["My sister went to Sanctuary.", "The radio says her name sometimes."], null, 0, true);
  npc(9.5, -6.8, 0x39423a, 0x1e1711, "GUARD", ["Upper gallery is closed.", "Vera's stall is down the plaza. Don't cause trouble."], [[9.5, -6.8], [9.0, -3.0], [10.8, -1.2]], 0.42);
  npc(-4.8, 8.0, 0x5a3b2a, 0x241a12, "TRADER", ["Filters, batteries, clean water.", "Everyone's buying air. Nobody's selling."], [[-4.8, 8.0], [-5.2, 10.0], [-4.0, 10.8]], 0.22);
  npc(4.8, 8.0, 0x2f6f66, 0x241a12, "TRADER", ["You look like you came up from the vents.", "Wash the dust off before Vera sees you."], [[4.8, 8.0], [5.2, 10.0], [4.0, 10.8]], 0.22);
  npc(-1.6, 2.4, 0x35443a, 0x1b211d, "RUNNER", ["The lower gate is sealed.", "If you're going down, take a filter."], [[-1.6, 2.4], [4.2, -0.5], [2.8, -3.6], [-4.2, -2.2]], 0.62);
  npc(2.0, 10.2, 0x4a3a2a, 0x2a2119, "PORTER", ["Move. Medical supplies.", "Hospital's always short. Always."], [[2.0, 10.2], [-3.0, 9.4], [-3.0, 4.6]], 0.5);
  npc(0.8, 4.8, 0x5a3b2a, 0x2a1d14, "SHOPPER", ["Vera buys names. Did you know that?", "Don't ask what she does with them."], [[0.8, 4.8], [2.6, 3.4], [1.0, 1.0]], 0.3);
  npc(-4.0, -9.4, 0x4a5a4a, 0x241b14, "WORKER", ["The scrubber tower is the only thing keeping us alive.", "It sings at night. Listen."], [[-4.0, -9.4], [-2.0, -8.4], [-4.0, -9.4]], 0.18);
  npc(6.0, -4.8, 0x7a3a24, 0x2a1a12, "VENDOR", ["Fresh food. Real food.", "Sanctuary ration cards don't work here."], [[6.0, -4.8], [8.0, -6.0], [6.0, -4.8]], 0.14);
  refs.npcs = npcs;

  // crates / barrels / clutter
  for (const [x, z, s] of [[-5.4, 12.2, 0.7], [5.4, 12.2, 0.62], [-5.4, 0.6, 0.6], [5.4, 0.6, 0.7], [-5.2, -5.4, 0.65], [5.2, -5.4, 0.6]]) {
    box(s, s, s, 0x6a4a2c, x, s / 2, z, group);
    box(s * 0.9, 0.08, s * 0.9, 0x3a2a1a, x, s * 0.8, z, group);
    colliders.push({ minX: x - s / 2, maxX: x + s / 2, minZ: z - s / 2, maxZ: z + s / 2 });
  }
  for (const [x, z] of [[-5.6, 10.0], [5.6, 10.0]]) {
    cyl(0.3, 0.3, 0.85, 8, 0x8a5a2a, x, 0.43, z, group);
    cyl(0.31, 0.31, 0.06, 8, 0x3a2a1a, x, 0.16, z, group);
    colliders.push({ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 });
  }

  addDust(group, 80, 28, 0x9aa8a0);
  group.userData.refs = refs;
  return {
    group,
    colliders,
    refs: { ...refs, exit },
    npcs,
    spawn: new THREE.Vector3(0, 0, 13.8),
    spawnYaw: 0,
    bounds: { minX: -15.2, maxX: 15.2, minZ: -14.2, maxZ: 14.2 },
    interactables: [
      { kind: "shop", pos: vera.position.clone(), radius: 2.8, prompt: "E — TRADE WITH VERA" },
      { kind: "exit", pos: exit.pos, radius: 2.6, prompt: "E — DESCEND", next: "warren" },
    ],
    triggers: [
      { kind: "vision", pos: vec(0, 0, 1.2), radius: 2.4, visionId: 3, once: true },
    ],
    fog: { color: 0x0b1814, density: 0.022 },
    ambient: { color: 0x7a9a8a, intensity: 0.9 },
    background: 0x06120f,
    name: "zarya",
  };
}

function basicVentLevel({ name, w = 12, d = 14, h = 3.2, spawnZ = 5.5, exitZ = -5.8, color = 0x7fa36a, intensity = 0.8 } = {}) {
  const { group, colliders } = ventShell({ w, d, h, floor: 0x242b27, wall: 0x29322d });
  pipes(group, d - 1.5, -w / 2 + 0.45, h - 0.4);
  emergencyLamps(group, 4, spawnZ - 1, 3.8, 0, color, intensity, h - 1.0);
  // side vents / grates
  for (let i = 0; i < 4; i++) {
    const z = spawnZ - 2 - i * 3;
    box(0.9, 0.6, 0.06, 0x171f1c, -w / 2 + 0.18, 1.5, z, group);
    for (let j = 0; j < 4; j++) box(0.8, 0.04, 0.03, 0x0b100e, -w / 2 + 0.22, 1.3 + j * 0.12, z + 0.04, group);
  }
  for (let i = 0; i < 10; i++) {
    box(0.12 + Math.random() * 0.3, 0.08, 0.12 + Math.random() * 0.3, 0x3c3225, (Math.random() - 0.5) * (w - 3), 0.08, (Math.random() - 0.5) * (d - 3), group, { rotY: Math.random() * 3 });
  }
  const exit = door(group, 0, exitZ, "HATCH");
  return { group, colliders, exit, spawn: vec(0, 0, spawnZ) };
}

export function buildWarren() {
  const base = basicVentLevel({ w: 14, d: 16, spawnZ: 6.5, exitZ: -6.8 });
  const { group, colliders, exit } = base;
  const fuses = [fuse(group, -4.5, 2.5), fuse(group, 4.2, 0.5), fuse(group, 0, -3.2)];
  const bodies = [
    { group: body(group, 4.5, 4.5, -0.6), loot: { mgr: 6, ammo: 8 } },
    { group: body(group, -4.8, -2.2, 0.7), loot: { mgr: 5, medkit: 1 } },
  ];
  const noteObj = note(group, -1.8, 4.2, "LOG 09: The Warren was dug by hand. The vents were already here.");
  const med = pickup(group, 5.8, -4.8, "medkit");
  const enemies = [ratEnemy(group, 2.5, 0), ratEnemy(group, -2.5, -2), ratEnemy(group, 3.2, -4.8), ratEnemy(group, -3.5, 3.2)];
  const crawler = crawlerAt(group, 3.8, -4.8, -1.2);

  const interactables = [
    ...fuses.map((f, i) => ({ kind: "fuse", pos: f.pos, radius: 1.6, index: i, group: f.group })),
    { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE DOOR", next: "flooded", requirement: "fuses", required: 3 },
    { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
    { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
    ...bodies.map(b => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
  ];
  return {
    ...base,
    group,
    colliders,
    refs: { exit, crawler, fan: null },
    bounds: { minX: -6.6, maxX: 6.6, minZ: -7.2, maxZ: 7.2 },
    enemies,
    interactables,
    triggers: [
      { kind: "crawler", pos: vec(0, 0, -4.4), radius: 2.0, crawler, once: true },
      { kind: "vision", pos: vec(-2.5, 0, 1.0), radius: 2.2, visionId: 4, once: true },
    ],
    fog: { color: 0x05100c, density: 0.07 },
    ambient: { color: 0x4a5a50, intensity: 0.45 },
    background: 0x020404,
    name: "warren",
  };
}

export function buildFlooded() {
  const base = basicVentLevel({ w: 14, d: 18, spawnZ: 7.2, exitZ: -7.8, color: 0x6f9b78, intensity: 0.7 });
  const { group, colliders, exit } = base;
  // water
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x1b3a35, transparent: true, opacity: 0.72 });
  const water = plane(13.2, 17.2, 0xffffff, 0, 0.05, 0, group, { rotX: -Math.PI / 2, material: waterMat });
  water.name = "water";
  const valves = [valve(group, -4.8, 3.2), valve(group, 4.6, 0.8), valve(group, -3.8, -3.8)];
  const bodies = [
    { group: body(group, 3.8, 4.2, -0.8), loot: { mgr: 7, ammo: 8 } },
    { group: body(group, -4.4, -1.5, 0.4), loot: { mgr: 4, medkit: 1 } },
  ];
  const noteObj = note(group, 5.2, -4.2, "LOG 10: The water came up in the dark. Something came with it.");
  const enemies = [ratEnemy(group, 2.8, 2), ratEnemy(group, -2.5, -1.6), ratEnemy(group, 4.2, -4), ratEnemy(group, -1.2, -5.2)];
  const crawler = crawlerAt(group, -4.2, -5.0, 0.8);
  const med = pickup(group, 0, 5.6, "medkit");

  return {
    ...base,
    group,
    colliders,
    refs: { exit, crawler, water },
    bounds: { minX: -6.6, maxX: 6.6, minZ: -8.2, maxZ: 8.2 },
    enemies,
    interactables: [
      ...valves.map((v, i) => ({ kind: "valve", pos: v.pos, radius: 1.7, index: i, group: v.group, wheel: v.wheel })),
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE HATCH", next: "fan", requirement: "valves", required: 3 },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map(b => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [
      { kind: "crawler", pos: vec(0, 0, -4.5), radius: 2.0, crawler, once: true },
      { kind: "vision", pos: vec(0, 0, 1.6), radius: 2.2, visionId: 5, once: true },
    ],
    fog: { color: 0x05100b, density: 0.075 },
    ambient: { color: 0x41564c, intensity: 0.5 },
    background: 0x020404,
    name: "flooded",
  };
}

export function buildFan() {
  const base = basicVentLevel({ w: 16, d: 18, h: 5.4, spawnZ: 7.2, exitZ: -7.8, color: 0x9bd0a0, intensity: 1.0 });
  const { group, colliders, exit } = base;
  const fanZ = -4.8;
  const fanY = 2.55;

  // tall wall ribs and pipe runs
  for (const side of [-1, 1]) {
    for (const z of [-7, -4.5, -2, 0.5, 3, 5.5]) {
      box(0.12, 5.1, 0.18, 0x2a3832, side * 7.9, 2.55, z, group);
    }
    for (const y of [1.1, 2.6, 4.15]) {
      box(0.08, 0.12, 18, 0x2a3530, side * 7.92, y, 0, group);
    }
    cyl(0.07, 0.07, 17, 6, 0x3f7a6c, side * 7.8, 4.6, 0, group, { rotX: Math.PI / 2 });
    cyl(0.05, 0.05, 17, 6, 0xc05a26, side * 7.7, 4.35, 0, group, { rotX: Math.PI / 2 });
  }

  // huge circular fan housing and duct
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.22, 8, 24), toonMat(0x2a3832));
  ring.position.set(0, fanY, fanZ);
  group.add(ring);
  const backRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.18, 8, 24), toonMat(0x1b2621));
  backRing.position.set(0, fanY, fanZ - 1.8);
  group.add(backRing);
  const backing = new THREE.Mesh(new THREE.CircleGeometry(2.3, 24), toonMat(0x0b100e));
  backing.position.set(0, fanY, fanZ - 0.12);
  group.add(backing);
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 2.6, 20, 1, true), toonMat(0x1b2621));
  duct.rotation.x = Math.PI / 2;
  duct.position.set(0, fanY, fanZ - 1.4);
  group.add(duct);

  // spinning blades
  const fan = new THREE.Group();
  fan.position.set(0, fanY, fanZ + 0.12);
  cyl(0.38, 0.38, 0.3, 10, 0x141c18, 0, 0, 0, fan, { rotX: Math.PI / 2 });
  const bladeMat = toonMat(0x9aa99b);
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 / 6) * i;
    box(1.9, 0.34, 0.08, 0x9aa99b, Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0, fan, { rotZ: a, material: bladeMat });
    box(0.18, 0.16, 0.1, 0xd9782f, Math.cos(a) * 1.78, Math.sin(a) * 1.78, 0, fan, { rotZ: a });
  }
  group.add(fan);
  // front grille
  for (let i = 0; i < 3; i++) {
    box(4.6, 0.05, 0.06, 0x1a2420, 0, fanY, fanZ + 0.4, group, { rotZ: (Math.PI / 3) * i });
  }

  // fan warning lights
  pointLight(0xff7a2a, 4.5, 10, 0, fanY + 2.3, fanZ, group, { decay: 1.3 });
  addGlow(group, 0xff7a2a, 0, fanY + 2.3, fanZ, 1.5, 0.28);
  for (const side of [-1, 1]) {
    box(0.16, 0.16, 0.08, 0xff3a1a, side * 2.35, fanY + 1.2, fanZ + 0.3, group, { material: basic(0xff3a1a) });
    pointLight(0xff3a1a, 2.2, 6, side * 2.35, fanY + 1.2, fanZ + 0.3, group, { decay: 1.5 });
    addGlow(group, 0xff3a1a, side * 2.35, fanY + 1.2, fanZ + 0.3, 0.7, 0.26);
  }

  // back-wall duct panel and fan sign
  box(2.4, 1.2, 0.2, 0x1b2621, 0, 4.6, -7.85, group);
  for (let i = 0; i < 4; i++) {
    box(2.2, 0.06, 0.05, 0x3a4a42, 0, 4.2 + i * 0.24, -7.72, group);
  }

  // catwalk railings
  for (const side of [-1, 1]) {
    for (let z = -6.2; z <= 0.2; z += 2.1) {
      cyl(0.05, 0.05, 1.1, 5, 0x3a4a42, side * 4.4, 0.55, z, group);
    }
    box(0.1, 0.08, 6.6, 0x3a4a42, side * 4.4, 1.1, -3, group);
    box(0.08, 0.06, 6.6, 0x2a3530, side * 4.4, 0.7, -3, group);
  }
  // overhead beams and floodlights
  for (const z of [-2.8, 2.8]) {
    box(15.8, 0.15, 0.2, 0x1c2420, 0, 4.9, z, group);
  }
  for (const side of [-1, 1]) {
    box(0.2, 0.15, 17, 0x1c2420, side * 6.2, 4.9, 0, group);
  }
  for (const [x, z] of [[-4.5, -2.8], [4.5, -2.8]]) {
    box(0.32, 0.22, 0.32, 0x1a2420, x, 4.78, z, group);
    box(0.22, 0.08, 0.22, 0xffd27a, x, 4.63, z, group, { material: basic(0xffd27a) });
    pointLight(0xffd27a, 3.6, 10, x, 4.4, z, group, { decay: 1.4 });
    addGlow(group, 0xffd27a, x, 4.65, z, 0.8, 0.24);
    addLightShaft(group, 0xffd27a, x, 4.6, z, 4.5, 0.8, 0.022);
  }
  // hanging chain hoist
  for (let i = 0; i < 8; i++) {
    cyl(0.02, 0.02, 0.2, 4, 0x3a423c, 0, 4.65 - i * 0.21, -1.5, group);
  }
  box(0.16, 0.12, 0.3, 0x2a3530, 0, 2.95, -1.5, group);
  box(0.12, 0.22, 0.12, 0x1a2420, 0, 2.8, -1.5, group);
  // floor guide stripes
  for (const z of [5.2, 3.8, 2.4]) {
    plane(2.0, 0.4, 0xffffff, 0, 0.018, z, group, { rotX: -Math.PI / 2, material: hazardMaterial() });
  }
  // fan sign above the ring
  plane(2.0, 0.5, 0xffffff, 0, 5.15, -7.72, group, { material: signMaterial("FAN 03", "#ffe08a") });

  // control station
  const consoleBox = new THREE.Group();
  box(1.5, 0.9, 0.85, 0x2a3933, 0, 0.45, 0, consoleBox);
  box(1.6, 0.12, 0.9, 0x1a2420, 0, 0.96, 0, consoleBox, { rotX: 0.18 });
  box(0.7, 0.2, 0.04, 0x8fe0c0, 0, 0.8, 0.44, consoleBox, { material: basic(0x8fe0c0) });
  for (let i = 0; i < 5; i++) {
    box(0.08, 0.05, 0.05, i % 2 ? 0xffb765 : 0xff3a1a, -0.5 + i * 0.24, 1.02, 0.22, consoleBox, { material: basic(i % 2 ? 0xffb765 : 0xff3a1a) });
  }
  cyl(0.045, 0.045, 0.4, 6, 0x1a2420, 0.55, 1.05, 0.12, consoleBox, { rotZ: -0.4 });
  sphere(0.075, 6, 5, 0xd9782f, 0.62, 1.22, 0.12, consoleBox);
  consoleBox.position.set(4.8, 0, -2.6);
  group.add(consoleBox);
  pointLight(0x8fe0c0, 2.6, 6, 4.8, 1.4, -2.6, group, { decay: 1.4 });
  addGlow(group, 0x8fe0c0, 4.8, 1.15, -2.2, 0.8, 0.22);

  // wall signage and floor hazard markings
  plane(1.5, 0.65, 0xffffff, -7.82, 2.6, -3.4, group, { rotY: Math.PI / 2, material: signMaterial("DANGER", "#ff8a6a") });
  plane(7.2, 0.55, 0xffffff, 0, 0.02, -1.9, group, { rotX: -Math.PI / 2, material: hazardMaterial() });
  plane(7.2, 0.55, 0xffffff, 0, 0.02, -2.9, group, { rotX: -Math.PI / 2, material: hazardMaterial() });

  // crates, barrels, wall fans, steam
  addCrate(group, colliders, -6.8, 4.8, 0.72);
  addCrate(group, colliders, -6.4, 3.5, 0.55);
  addCrate(group, colliders, 6.6, 4.7, 0.66);
  addBarrel(group, colliders, 6.7, -5.3);
  addBarrel(group, colliders, -6.7, -5.6);
  addCrate(group, colliders, -3.2, 5.6, 0.62);
  addCrate(group, colliders, 3.4, 5.6, 0.55);
  // wheeled tool cart
  box(1.2, 0.1, 0.65, 0x3a4a42, 4.6, 0.85, 3.2, group);
  for (const x of [4.1, 5.1]) {
    for (const z of [2.95, 3.45]) {
      cyl(0.08, 0.08, 0.06, 8, 0x121714, x, 0.08, z, group, { rotX: Math.PI / 2 });
      box(0.05, 0.78, 0.05, 0x2a3530, x, 0.46, z, group);
    }
  }
  for (let i = 0; i < 4; i++) {
    box(0.1, 0.06, 0.26, i % 2 ? 0x4c554d : 0x2a302c, 4.15 + i * 0.22, 0.95, 3.2, group);
  }
  colliders.push({ minX: 4.0, maxX: 5.2, minZ: 2.85, maxZ: 3.55 });
  // hanging chains
  for (const [x, z] of [[-3.6, 2.0], [3.7, 0.2], [-4.2, -3.8]]) {
    for (let i = 0; i < 5; i++) {
      cyl(0.025, 0.025, 0.28, 5, 0x3a423c, x, 4.9 - i * 0.3, z, group);
    }
  }
  // floor puddles
  for (let i = 0; i < 5; i++) {
    const m = new THREE.MeshLambertMaterial({ color: 0x16332c, transparent: true, opacity: 0.42 });
    plane(1.2 + Math.random() * 1.2, 0.7 + Math.random() * 0.8, 0xffffff,
      (Math.random() - 0.5) * 11, 0.012, (Math.random() - 0.5) * 12, group,
      { rotX: -Math.PI / 2, rotZ: Math.random() * 3, material: m });
  }
  addWallFan(group, -7.85, 2.3, 2.0, Math.PI / 2);
  addWallFan(group, 7.85, 2.3, 3.2, -Math.PI / 2);
  addLightShaft(group, 0x9ab8a8, 0, 2.2, fanZ + 0.4, 3.4, 1.7, 0.04);
  addLightShaft(group, 0xff7a2a, 0, fanY + 2.2, fanZ + 0.2, 3.0, 1.1, 0.035);

  const bodies = [
    { group: body(group, -5.2, 2.4, 0.6), loot: { mgr: 8, ammo: 8 } },
    { group: body(group, 3.8, 4.4, -1.1), loot: { mgr: 4, medkit: 1 } },
  ];
  const noteObj = note(group, -3.8, 5.2, "LOG 11: The fan kept the air moving. It kept everything moving.");
  const enemies = [scavengerEnemy(group, -5.2, -2.4, 0.8), ratEnemy(group, 2.2, 1.2), ratEnemy(group, -1.2, -1.4), ratEnemy(group, 4.4, -5.0)];
  const crawler = crawlerAt(group, 0, -5.8, 0);
  const med = pickup(group, 5.6, 5.2, "medkit");

  return {
    ...base,
    group,
    colliders,
    refs: { exit, crawler, fan, console: consoleBox },
    bounds: { minX: -7.6, maxX: 7.6, minZ: -8.2, maxZ: 8.2 },
    enemies,
    interactables: [
      { kind: "console", pos: consoleBox.position.clone().add(vec(0, 0, 0.7)), radius: 2.2, prompt: "E — START THE FAN", group: consoleBox },
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE HATCH", next: "safe_room", requirement: "console" },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map(b => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [{ kind: "crawler", pos: vec(0, 0, -3.4), radius: 2.0, crawler, once: true }],
    fog: { color: 0x0a1a14, density: 0.03 },
    ambient: { color: 0x5a7a66, intensity: 0.9 },
    background: 0x06110c,
    name: "fan",
  };
}

export function buildSafeRoom() {
  const { group, colliders } = ventShell({ w: 8, d: 8, h: 3.0, floor: 0x26231d, wall: 0x2b302a, ceiling: 0x171b18 });

  // ceiling beams and cable runs
  for (const x of [-3, -1, 1, 3]) {
    box(0.12, 0.12, 8, 0x1c2420, x, 2.9, 0, group);
  }
  cyl(0.04, 0.04, 7.6, 6, 0x3f7a6c, -3.7, 2.8, 0, group, { rotX: Math.PI / 2 });
  cyl(0.03, 0.03, 7.6, 6, 0xc05a26, 3.65, 2.65, 0, group, { rotX: Math.PI / 2 });

  // warm rug
  plane(2.8, 2.0, 0xffffff, 0, 0.015, 0.1, group, { rotX: -Math.PI / 2, material: toonMat(0x2e1410) });
  plane(2.2, 1.5, 0xffffff, 0, 0.018, 0.1, group, { rotX: -Math.PI / 2, material: toonMat(0x142420) });

  // bunk along the left wall
  box(1.0, 0.14, 2.2, 0x3f2e20, -3.0, 0.45, -0.8, group);
  for (const [x, z] of [[-3.4, -1.75], [-2.6, -1.75], [-3.4, 0.15], [-2.6, 0.15]]) {
    box(0.1, 0.45, 0.1, 0x2a1e14, x, 0.22, z, group);
  }
  box(0.92, 0.16, 2.05, 0x71745f, -3.0, 0.57, -0.8, group);
  box(0.7, 0.14, 0.4, 0xc9c1aa, -3.0, 0.7, -1.5, group);
  box(0.94, 0.07, 1.15, 0x8a3a2a, -3.0, 0.68, -0.35, group);
  box(0.94, 0.06, 0.5, 0x2e5e56, -3.0, 0.66, -1.1, group);
  colliders.push({ minX: -3.5, maxX: -2.5, minZ: -1.9, maxZ: 0.3 });

  // desk, radio, maps, lamp
  box(1.9, 0.1, 0.85, 0x5b4029, 1.85, 0.85, -2.65, group);
  for (const [x, z] of [[1.1, -2.9], [2.6, -2.9], [1.1, -2.4], [2.6, -2.4]]) {
    box(0.08, 0.82, 0.08, 0x3a2a1a, x, 0.42, z, group);
  }
  colliders.push({ minX: 0.85, maxX: 2.85, minZ: -3.1, maxZ: -2.2 });
  const radio = new THREE.Group();
  box(0.7, 0.4, 0.4, 0x2a302c, 0, 0.3, 0, radio);
  box(0.3, 0.15, 0.03, 0x8fbf7a, 0, 0.35, 0.21, radio, { material: basic(0x8fbf7a) });
  cyl(0.018, 0.018, 0.5, 5, 0x1a211d, 0.24, 0.62, 0, radio, { rotZ: -0.3 });
  radio.position.set(1.9, 0.95, -2.65);
  group.add(radio);
  // papers / map on the desk
  box(0.5, 0.02, 0.35, 0xc9bf9f, 1.25, 0.92, -2.55, group, { rotY: 0.2 });
  box(0.4, 0.02, 0.3, 0xb8ae8e, 2.35, 0.92, -2.75, group, { rotY: -0.15 });
  // desk lamp
  cyl(0.03, 0.04, 0.55, 6, 0x2a302c, 2.55, 1.18, -2.75, group);
  box(0.35, 0.16, 0.25, 0x3a2c20, 2.55, 1.48, -2.75, group);
  pointLight(0xffc078, 3.2, 5, 2.55, 1.4, -2.75, group, { decay: 1.35 });
  addGlow(group, 0xffc078, 2.55, 1.42, -2.75, 0.7, 0.24);
  // chair
  box(0.5, 0.08, 0.5, 0x3a2a1a, 1.75, 0.45, -1.8, group);
  box(0.5, 0.55, 0.08, 0x3a2a1a, 1.75, 0.72, -2.05, group);
  for (const [x, z] of [[1.55, -2.0], [1.95, -2.0], [1.55, -1.6], [1.95, -1.6]]) {
    box(0.06, 0.45, 0.06, 0x2a1e14, x, 0.22, z, group);
  }

  // wall shelves and supplies
  for (const y of [1.25, 1.85]) {
    box(3.0, 0.08, 0.35, 0x3a2c20, 0, y, -3.68, group);
    for (let i = 0; i < 7; i++) {
      const color = i % 3 === 0 ? 0x8a3a2a : i % 3 === 1 ? 0x2e5e56 : 0xc9a04a;
      cyl(0.07, 0.07, 0.18, 6, color, -1.25 + i * 0.42, y + 0.11, -3.68, group);
    }
  }
  // medkit on the shelf
  box(0.32, 0.2, 0.22, 0xc9c1aa, 2.2, 1.36, -3.64, group);
  box(0.16, 0.04, 0.04, 0x9e4a2a, 2.2, 1.46, -3.5, group);

  // posters and wall map
  plane(1.5, 0.7, 0xffffff, 0, 2.5, -3.86, group, { material: signMaterial("SANCTUARY", "#8fe0c0") });
  plane(1.2, 0.55, 0xffffff, -3.86, 2.2, 1.0, group, { rotY: Math.PI / 2, material: signMaterial("SEALED", "#ffd27a") });
  for (const [x, y, z, ry] of [[-1.2, 2.25, -3.84, 0], [1.4, 2.35, -3.84, 0], [-3.84, 1.7, -1.8, Math.PI / 2]]) {
    box(0.34, 0.26, 0.03, 0x8b7b5d, x, y, z, group, { rotY: ry });
  }

  // small stove and kettle
  cyl(0.24, 0.28, 0.55, 8, 0x3a2a1e, 3.0, 0.28, -0.5, group);
  cyl(0.2, 0.2, 0.05, 8, 0xff7a2a, 3.0, 0.56, -0.5, group, { material: basic(0xff7a2a) });
  sphere(0.16, 7, 5, 0x3a3f38, 3.0, 0.75, -0.5, group, { sy: 0.7 });
  cyl(0.02, 0.02, 0.22, 5, 0x2a302c, 3.16, 0.82, -0.5, group, { rotZ: -0.6 });
  pointLight(0xff7a2a, 2.8, 6, 3.0, 0.8, -0.5, group, { decay: 1.4 });
  addGlow(group, 0xff7a2a, 3.0, 0.7, -0.5, 0.8, 0.22);
  addLightShaft(group, 0xb8c8b8, 3.0, 1.0, -0.5, 1.1, 0.24, 0.03);

  // hanging ceiling lamp
  cyl(0.025, 0.025, 0.45, 5, 0x191d1a, 0, 2.72, 0.2, group);
  box(0.5, 0.12, 0.5, 0x2a302c, 0, 2.45, 0.2, group);
  box(0.42, 0.05, 0.42, 0xffc078, 0, 2.38, 0.2, group, { material: basic(0xffc078) });
  pointLight(0xffc078, 4.8, 7, 0, 2.2, 0.2, group, { decay: 1.35 });
  addGlow(group, 0xffc078, 0, 2.4, 0.2, 1.1, 0.3);
  addLightShaft(group, 0xffc078, 0, 2.4, 0.2, 2.4, 1.2, 0.04);

  // string lights
  for (const [x, z, color] of [[-2.2, 1.8, 0xffb765], [0, 1.9, 0x8fe0c0], [2.2, 1.8, 0xff8a6a]]) {
    sphere(0.05, 6, 5, color, x, 2.65, z, group, { material: basic(color) });
    addGlow(group, color, x, 2.65, z, 0.42, 0.22);
  }

  // curtains, crates and a water barrel
  plane(2.0, 1.6, 0xffffff, 3.86, 1.9, 1.2, group, { rotY: -Math.PI / 2, material: toonMat(0x2e5e56, { transparent: true, opacity: 0.9, side: THREE.DoubleSide }) });
  addCrate(group, colliders, -3.0, 2.8, 0.6);
  addCrate(group, colliders, 3.1, 2.4, 0.55);
  addBarrel(group, colliders, 2.9, 0.8);
  // footlocker and armchair
  box(0.8, 0.4, 0.5, 0x3a2c20, -2.4, 0.2, 1.4, group);
  box(0.84, 0.06, 0.54, 0x5b4029, -2.4, 0.42, 1.4, group);
  box(0.14, 0.08, 0.04, 0xc8a24a, -2.4, 0.43, 1.66, group);
  box(0.8, 0.5, 0.72, 0x5a3a2a, 2.3, 0.3, 2.0, group);
  box(0.8, 0.65, 0.18, 0x5a3a2a, 2.3, 0.75, 2.3, group);
  for (const x of [1.9, 2.7]) {
    box(0.12, 0.5, 0.7, 0x4a2f22, x, 0.5, 2.0, group);
  }
  addGlow(group, 0xffc078, 2.3, 0.8, 1.8, 0.5, 0.12);

  const exit = door(group, 0, 3.7, "VENT");
  plane(1.5, 0.55, 0xffffff, 0, 2.8, 3.48, group, { rotY: Math.PI, material: signMaterial("KEEP SEALED", "#ffd27a") });
  const med = pickup(group, -1.8, 1.8, "medkit");
  const noteObj = note(group, 2.4, 1.4, "LOG 12: Mara stopped answering. The radio still hums.");

  return {
    group,
    colliders,
    refs: { radio, exit },
    spawn: vec(0, 0, 2.4),
    bounds: { minX: -3.6, maxX: 3.6, minZ: -3.6, maxZ: 3.4 },
    enemies: [],
    interactables: [
      { kind: "radio", pos: radio.position.clone(), radius: 1.8, prompt: "E — USE THE RADIO", group: radio },
      { kind: "exit", pos: exit.pos, radius: 2.0, prompt: "E — KEEP GOING", next: "lair", requirement: "radio", required: 1 },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
    ],
    triggers: [
      { kind: "vision", pos: vec(0, 0, 0.4), radius: 1.8, visionId: 6, once: true },
    ],
    fog: { color: 0x0c0b07, density: 0.022 },
    ambient: { color: 0x9a7a58, intensity: 0.95 },
    background: 0x0a0806,
    name: "safe_room",
  };
}

export function buildLair() {
  const base = basicVentLevel({ w: 18, d: 18, spawnZ: 7.4, exitZ: -7.8, color: 0x8a6a4a, intensity: 0.55 });
  const { group, colliders, exit } = base;
  const valves = [valve(group, -5.0, 2.4), valve(group, 5.0, 0.6), valve(group, 0, -3.0)];
  // bodies arranged in rows
  for (let i = 0; i < 8; i++) {
    body(group, -6 + (i % 4) * 2.6, -5.6 + Math.floor(i / 4) * 1.0, Math.PI * 0.5);
  }
  // respirators on the floor
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group();
    sphere(0.12, 6, 5, 0x8d8a75, 0, 0.08, 0, g, { sx: 1.2, sy: 0.7, sz: 1.0 });
    box(0.16, 0.05, 0.05, 0x2a302c, 0.08, 0.04, 0, g);
    g.position.set((Math.random() - 0.5) * 12, 0.05, (Math.random() - 0.5) * 10);
    group.add(g);
  }
  // static Tenant watchers
  const watchers = [];
  for (let i = 0; i < 5; i++) {
    const t = makeTenant(2.4);
    t.position.set(-6 + i * 3.0, 0, -6.8);
    t.rotation.y = Math.PI;
    group.add(t);
    watchers.push(t);
  }
  const bodies = [
    { group: body(group, 3.8, 3.0, -0.6), loot: { mgr: 10, ammo: 10, log: true } },
    { group: body(group, -4.2, -1.2, 0.8), loot: { mgr: 6, medkit: 1 } },
  ];
  const noteObj = note(group, 5.2, 4.8, "LOG 13: The nest was here before the station. We built around it.");
  const med = pickup(group, -5.2, 5.2, "medkit");
  const enemies = [ratEnemy(group, 2.2, 1.0), ratEnemy(group, -2.4, 0.2), ratEnemy(group, 4.2, -4.2), ratEnemy(group, -4.8, -4.8)];
  const crawler = crawlerAt(group, 0, -5.8, 0);

  return {
    ...base,
    group,
    colliders,
    refs: { exit, crawler, watchers },
    bounds: { minX: -8.6, maxX: 8.6, minZ: -8.2, maxZ: 8.2 },
    enemies,
    interactables: [
      ...valves.map((v, i) => ({ kind: "valve", pos: v.pos, radius: 1.7, index: i, group: v.group, wheel: v.wheel })),
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE LAST DOOR", next: "last_crawl", requirement: "valves", required: 3 },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map(b => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [
      { kind: "crawler", pos: vec(0, 0, -4.2), radius: 2.0, crawler, once: true },
      { kind: "vision", pos: vec(0, 0, 1.2), radius: 3.0, visionId: 7, once: true },
    ],
    fog: { color: 0x080504, density: 0.075 },
    ambient: { color: 0x5a4030, intensity: 0.55 },
    background: 0x030202,
    name: "lair",
  };
}

export function buildLastCrawl() {
  const { group, colliders } = ventShell({ w: 3.0, d: 20, h: 2.1, floor: 0x242a27, wall: 0x29322d, ceiling: 0x111716 });
  // repeating low bulkheads create the crawl rhythm
  // (the player is also mechanically forced to crawl here)
  emergencyLamps(group, 3, 7, 6, 0, 0x7fa36a, 0.5);
  // hanging cables and old filters
  for (let i = 0; i < 9; i++) {
    const z = -8 + i * 2;
    cyl(0.012, 0.012, 0.4 + Math.random() * 0.35, 4, 0x303a34, (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.4), 1.72, z, group);
  }
  for (let i = 0; i < 10; i++) {
    const z = -8.5 + i * 1.9;
    box(0.14 + Math.random() * 0.3, 0.03, 0.12 + Math.random() * 0.2, 0x8d8a75, (Math.random() - 0.5) * 2.0, 0.04, z, group, { rotY: Math.random() * 3 });
  }
  // structural frames and low bulkheads
  for (let z = 6.4; z >= -8.8; z -= 2.2) {
    for (const side of [-1, 1]) {
      box(0.1, 1.0, 0.14, 0x2b3530, side * 1.42, 0.52, z, group);
      box(0.08, 0.85, 0.1, 0x1f2824, side * 1.4, 1.65, z, group);
    }
    box(2.9, 0.08, 0.14, 0x1c2420, 0, 1.95, z, group);
    box(2.9, 0.16, 0.2, 0x111614, 0, 1.02, z, group);
    box(0.18, 0.16, 0.22, 0x1b2420, -1.34, 1.02, z, group);
    box(0.18, 0.16, 0.22, 0x1b2420, 1.34, 1.02, z, group);
  }
  // low pipe runs along the floor edges
  cyl(0.035, 0.035, 18.5, 6, 0x2a3530, -1.4, 0.15, 0, group, { rotX: Math.PI / 2 });
  cyl(0.035, 0.035, 18.5, 6, 0x2a3530, 1.4, 0.15, 0, group, { rotX: Math.PI / 2 });
  // crawl-height wall signage and lights
  plane(0.9, 0.38, 0xffffff, -1.36, 0.78, 5.2, group, { rotY: Math.PI / 2, material: signMaterial("CRAWL", "#ffe08a") });
  plane(0.8, 0.35, 0xffffff, 1.36, 0.76, -2.0, group, { rotY: -Math.PI / 2, material: signMaterial("04", "#8fe0c0") });
  plane(1.3, 0.4, 0xffffff, 0, 1.2, -9.28, group, { material: signMaterial("SANCTUARY", "#8fe0c0") });
  for (const [x, z, color] of [[-1.36, 3.8, 0xffb765], [1.36, -0.8, 0xff8a6a], [-1.36, -5.6, 0x8fe0c0], [1.36, -8.6, 0xffd27a]]) {
    box(0.06, 0.18, 0.36, color, x, 0.72, z, group, { material: basic(color) });
    addGlow(group, color, x, 0.72, z, 0.55, 0.26);
    pointLight(color, 1.6, 4.5, x, 0.8, z, group, { decay: 1.6 });
    addLightShaft(group, color, x, 0.85, z, 0.8, 0.35, 0.035);
  }
  // floor grates, puddles and pipes
  const grateMat = toonMat(0x4a5a52, { map: grateTexture() });
  for (const z of [6.0, 2.0, -2.5, -7.0]) {
    plane(1.8, 1.2, 0xffffff, 0, 0.014, z, group, { rotX: -Math.PI / 2, material: grateMat });
  }
  for (let i = 0; i < 5; i++) {
    const m = new THREE.MeshLambertMaterial({ color: 0x16332c, transparent: true, opacity: 0.45 });
    plane(0.9 + Math.random() * 0.8, 0.6 + Math.random() * 0.7, 0xffffff,
      (Math.random() - 0.5) * 1.8, 0.012, -7 + Math.random() * 14, group,
      { rotX: -Math.PI / 2, rotZ: Math.random() * 3, material: m });
  }
  cyl(0.035, 0.035, 18, 6, 0x2a3530, -1.34, 0.16, 0, group, { rotX: Math.PI / 2 });
  cyl(0.03, 0.03, 18, 6, 0x3a2a1e, 1.34, 0.12, 0, group, { rotX: Math.PI / 2 });
  // bodies and bones along the crawl
  body(group, -0.95, 3.0, 0.8);
  body(group, 0.92, -1.6, -1.1);
  body(group, -0.92, -6.8, 0.4);
  for (let i = 0; i < 16; i++) {
    const z = -8.5 + Math.random() * 16;
    const x = (Math.random() < 0.5 ? -1 : 1) * (0.95 + Math.random() * 0.25);
    box(0.06 + Math.random() * 0.1, 0.03, 0.06 + Math.random() * 0.1, 0x8d8a75, x, 0.03, z, group, { rotY: Math.random() * 3 });
  }
  addMotes(group, 18, 1.7, 0xa8b8a8, 80);

  const exit = door(group, 0, -9.4, "SANCTUARY INTAKE");
  const noteObj = note(group, -0.8, -6.4, "LOG 14: Sanctuary is safe. Say it back.");
  // something waits where the light does not reach
  const sighting = makeTenant(2.3);
  sighting.position.set(0, 0, -1.4);
  sighting.rotation.y = Math.PI;
  group.add(sighting);
  const sighting2 = makeTenant(2.3);
  sighting2.position.set(0, 0, -7.6);
  sighting2.rotation.y = Math.PI;
  sighting2.visible = false;
  group.add(sighting2);
  const crawler = crawlerAt(group, 0, -4.4, 0);
  const bodyObj = body(group, 0.72, 1.0, 0.5);
  const bodyItem = { group: bodyObj, loot: { mgr: 9, ammo: 8, medkit: 1 } };

  return {
    group,
    colliders,
    refs: { exit, crawler, sightings: [sighting, sighting2] },
    spawn: vec(0, 0, 8.5),
    bounds: { minX: -1.2, maxX: 1.2, minZ: -9.2, maxZ: 9.2 },
    enemies: [],
    interactables: [
      { kind: "exit", pos: exit.pos, radius: 2.4, prompt: "E — OPEN THE LAST VENT", next: "nest" },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "body", pos: bodyObj.position.clone(), radius: 1.5, loot: bodyItem.loot, group: bodyItem.group, looted: false },
    ],
    triggers: [
      { kind: "crawler", pos: vec(0, 0, -3.6), radius: 1.8, crawler, once: true },
      { kind: "sighting", pos: vec(0, 0, -1.4), radius: 4.5, target: sighting2, once: true },
    ],
    fog: { color: 0x08140f, density: 0.06 },
    ambient: { color: 0x6a7a66, intensity: 0.78 },
    background: 0x06100c,
    name: "last_crawl",
  };
}

export function buildNest() {
  const group = new THREE.Group();
  const colliders = [];
  const w = 22, d = 18;
  box(w, 0.2, d, 0x2a241f, 0, -0.1, 0, group);
  box(w, 4.2, 0.2, 0x241d18, 0, 2.1, -d / 2, group);
  box(w, 4.2, 0.2, 0x241d18, 0, 2.1, d / 2, group);
  box(0.2, 4.2, d, 0x221c18, -w / 2, 2.1, 0, group);
  box(0.2, 4.2, d, 0x221c18, w / 2, 2.1, 0, group);
  box(w, 0.2, d, 0x15110f, 0, 4.2, 0, group);
  colliders.push({ minX: -w / 2 - 0.2, maxX: -w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: w / 2 - 0.2, maxX: w / 2 + 0.2, minZ: -d / 2, maxZ: d / 2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: -d / 2 - 0.2, maxZ: -d / 2 + 0.2 });
  colliders.push({ minX: -w / 2, maxX: w / 2, minZ: d / 2 - 0.2, maxZ: d / 2 + 0.2 });

  // nest mound
  for (let i = 0; i < 18; i++) {
    box(0.8 + Math.random() * 1.6, 0.2 + Math.random() * 0.8, 0.8 + Math.random() * 1.6, i % 3 === 0 ? 0x3b2b20 : 0x2b241b, (Math.random() - 0.5) * 7, 0.2 + Math.random() * 0.5, -2.5 + (Math.random() - 0.5) * 5, group, { rotY: Math.random() * 3 });
  }
  for (let i = 0; i < 16; i++) {
    sphere(0.12, 6, 5, 0x8d8a75, -5 + Math.random() * 10, 0.1, -5 + Math.random() * 8, group, { sx: 1.2, sy: 0.7, sz: 1.0 });
  }
  // organic central mound
  sphere(2.4, 12, 8, 0x3a2a1e, 0, 0.5, -2.5, group, { sx: 1.35, sy: 0.55, sz: 1.1 });
  sphere(1.6, 10, 7, 0x4a3324, 0.3, 0.8, -2.2, group, { sx: 1.2, sy: 0.7, sz: 1.0 });
  const pods = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 3.2;
    const p = sphere(0.22 + Math.random() * 0.2, 8, 6, i % 3 ? 0x6b5a45 : 0x4a3a2c,
      Math.cos(a) * r, 0.35 + Math.random() * 0.5, -2.5 + Math.sin(a) * r, group, { sy: 1.4 });
    pods.push(p);
  }
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.5 + Math.random() * 4;
    cyl(0.04, 0.07, 0.6 + Math.random() * 1.2, 5, 0x4a3324,
      Math.cos(a) * r, 0.3, -2.5 + Math.sin(a) * r, group,
      { rotX: (Math.random() - 0.5) * 1.4, rotZ: (Math.random() - 0.5) * 1.4 });
  }
  // pulsing heart / sac over the mound
  const heart = sphere(0.45, 10, 8, 0xe04a26, 0, 1.0, -2.5, group, { material: basic(0xe04a26), sx: 1.1, sy: 1.3, sz: 1.1 });
  const heartLight = pointLight(0xff5a2a, 8.0, 13, 0, 1.8, -2.5, group, { decay: 1.3 });
  addGlow(group, 0xff5a2a, 0, 1.5, -2.5, 2.0, 0.3);
  addLightShaft(group, 0xff5a2a, 0, 3.2, -2.5, 2.0, 1.15, 0.028);
  // hanging pods
  for (let i = 0; i < 8; i++) {
    const x = -8 + Math.random() * 16;
    const z = -6.5 + Math.random() * 11;
    const y = 3.0 + Math.random() * 0.7;
    sphere(0.28, 8, 6, 0x5a4a38, x, y, z, group, { sy: 1.6 });
    cyl(0.012, 0.012, 0.55, 4, 0x2a1f18, x, y + 0.55, z, group);
    if (i % 2 === 0) {
      addGlow(group, 0x8a2a1a, x, y - 0.1, z, 0.5, 0.18);
    }
  }
  // rows of tall figures facing the entrance
  const tenants = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8; i++) {
      const t = makeTenant(2.45);
      t.position.set(-8.4 + i * 2.4, 0, -1.5 - row * 2.4);
      t.rotation.y = 0;
      t.visible = true;
      if ((row * 8 + i) % 5 === 0) {
        for (const side of [-1, 1]) {
          sphere(0.016, 5, 4, 0xd06a3a, side * 0.05, 2.06, 0.18, t, { material: basic(0xd06a3a) });
        }
      }
      group.add(t);
      tenants.push(t);
    }
  }
  // red/green lights
  pointLight(0xa89070, 9.0, 18, 0, 3.7, -2.0, group, { decay: 1.2 });
  pointLight(0xffb070, 3.2, 8, 0, 2.4, 4.5, group, { decay: 1.35 });
  pointLight(0x7fa36a, 4.0, 9, 0, 2.5, -7.0, group, { decay: 1.3 });
  addGlow(group, 0xa89070, 0, 3.7, -2.0, 2.0, 0.18);
  addGlow(group, 0xffb070, 0, 2.4, 4.5, 1.2, 0.22);
  addGlow(group, 0x7fa36a, 0, 2.5, -7.0, 1.2, 0.22);
  for (const [x, z, color] of [[-7, 2, 0x8a3a25], [7, 2, 0x8a3a25], [0, -7, 0x7fa36a], [0, 5, 0x7fa36a]]) {
    cyl(0.02, 0.02, 0.9, 5, 0x1a211d, x, 3.65, z, group);
    box(0.34, 0.08, 0.34, 0x1a211d, x, 3.15, z, group);
    box(0.26, 0.04, 0.26, color, x, 3.1, z, group, { material: basic(color) });
    pointLight(color, 3.4, 9, x, 3.0, z, group, { decay: 1.3 });
    addGlow(group, color, x, 3.1, z, 0.9, 0.24);
    addLightShaft(group, color, x, 3.1, z, 3.05, 0.7, 0.026);
  }
  addMotes(group, 20, 3.8, 0x9a8a70, 140);
  box(0.2, 3.0, 3.0, 0x111010, 0, 1.5, 8.4, group);
  const exitLight = pointLight(0x9bc17a, 0.9, 4, 0, 1.6, 7.8, group, { decay: 1.6 });

  return {
    group,
    colliders,
    refs: { tenants, heart, heartLight, pods },
    spawn: vec(0, 0, 7.4),
    bounds: { minX: -10.2, maxX: 10.2, minZ: -8.2, maxZ: 8.2 },
    enemies: [],
    interactables: [],
    triggers: [{ kind: "nest", pos: vec(0, 0, 3.6), radius: 2.4, once: true }],
    fog: { color: 0x0b0604, density: 0.03 },
    ambient: { color: 0x8a6a50, intensity: 0.9 },
    background: 0x0a0503,
    name: "nest",
  };
}

export function buildVisionScene(id) {
  const group = new THREE.Group();
  const refs = {};
  let cameraAt = null;
  let fog = { color: 0x050707, density: 0.04 };
  let ambient = { color: 0x6a5848, intensity: 0.6 };
  let background = 0x030303;
  let duration = 16;
  let caption = "";

  if (id === 2) {
    caption = "The passenger car is full. They are all wearing your coat.";
    duration = 16;
    fog = { color: 0x07100e, density: 0.04 };
    ambient = { color: 0x8a9c92, intensity: 0.95 };
    // long car: aisle runs along z
    box(4.4, 0.2, 22, 0x2a2a24, 0, -0.1, 0, group);
    box(4.4, 0.2, 22, 0x111614, 0, 3.0, 0, group);
    for (const side of [-1, 1]) {
      box(0.2, 3.0, 22, 0x2a302b, side * 2.2, 1.5, 0, group);
      for (let i = 0; i < 7; i++) {
        box(0.06, 1.1, 1.8, 0x0d1715, side * 2.31, 1.8, -8 + i * 2.8, group);
        box(0.06, 0.06, 1.8, 0x1b2420, side * 2.31, 2.36, -8 + i * 2.8, group);
      }
      for (let i = 0; i < 7; i++) {
        box(1.3, 0.1, 1.0, 0x3a2c20, side * 1.35, 0.45, -8 + i * 2.8, group);
        box(0.1, 0.7, 1.0, 0x3a2c20, side * 2.02, 0.8, -8 + i * 2.8, group);
      }
    }
    box(4.4, 3.0, 0.2, 0x232a26, 0, 1.5, -11, group);
    box(4.4, 3.0, 0.2, 0x232a26, 0, 1.5, 11, group);
    const seated = [];
    for (let i = 0; i < 10; i++) {
      const seatZ = -8 + i * 1.8;
      const h = makeHumanoid({ coat: i % 2 ? 0x3b4238 : 0x4b3a2b, pants: 0x1d211e, hair: 0x201713 });
      h.position.set(i % 2 ? -1.25 : 1.25, 0.36, seatZ);
      h.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2;
      h.scale.setScalar(0.9);
      group.add(h);
      seated.push(h);
    }
    refs.seated = seated;
    const tenant = makeTenant(2.5);
    tenant.position.set(0, 0, -10.0);
    tenant.rotation.y = 0;
    group.add(tenant);
    refs.tenant = tenant;
    const light = pointLight(0xffd9a0, 4.2, 10, 0, 2.7, 5, group, { decay: 1.2 });
    const light2 = pointLight(0x9ab8a8, 3.2, 10, 0, 2.7, -4, group, { decay: 1.3 });
    refs.light = light;
    refs.light2 = light2;
    for (let i = 0; i < 4; i++) {
      box(0.2, 0.06, 0.5, 0xffd9a0, 0, 2.94, 7 - i * 4.5, group, { material: basic(0xffd9a0) });
    }
    cameraAt = (t) => ({ pos: new THREE.Vector3(0, 1.55, 9.2 - t * 15.5), look: new THREE.Vector3(0, 1.4, -9) });
  } else if (id === 3) {
    caption = "You are on the table. The lights are very bright.";
    duration = 16;
    ambient = { color: 0xc8b898, intensity: 1.2 };
    fog = { color: 0x0a0806, density: 0.03 };
    box(10, 0.2, 10, 0x2b2a25, 0, -0.1, 0, group);
    box(10, 3.0, 0.2, 0x2e3732, 0, 1.5, -5, group);
    for (const side of [-1, 1]) box(0.2, 3.0, 10, 0x29312d, side * 5, 1.5, 0, group);
    box(2.2, 0.2, 1.0, 0x6d7168, 0, 0.8, 0, group);
    cyl(0.1, 0.1, 1.0, 6, 0x444d46, 0, 0.35, 0, group);
    const patient = makeHumanoid({ coat: 0x6e5b4b, pants: 0x1f2420, hair: 0x2b1b13 });
    patient.position.set(0, 1.02, 0);
    patient.rotation.z = Math.PI / 2;
    patient.rotation.y = 0.1;
    group.add(patient);
    refs.patient = patient;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + 0.5;
      const w = makeTenant(2.2);
      w.position.set(Math.cos(angle) * 2.8, 0, Math.sin(angle) * 2.8);
      w.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));
      group.add(w);
    }
    const lamp = pointLight(0xf4e6c4, 8, 12, 0, 3.0, 0, group, { decay: 1.1 });
    refs.lamp = lamp;
    cameraAt = (t) => {
      const a = 0.4 + t * 1.8;
      return { pos: new THREE.Vector3(Math.cos(a) * 4.4, 1.7, Math.sin(a) * 4.4), look: new THREE.Vector3(0, 1.1, 0) };
    };
  } else if (id === 4) {
    caption = "The vent opens. Something climbs out.";
    duration = 18;
    ambient = { color: 0x6a4f3c, intensity: 0.55 };
    fog = { color: 0x0b0503, density: 0.07 };
    box(10, 0.2, 12, 0x24211b, 0, -0.1, 0, group);
    for (const side of [-1, 1]) box(0.2, 2.6, 12, 0x2b322d, side * 5, 1.3, 0, group);
    box(10, 0.2, 12, 0x111311, 0, 2.6, 0, group);
    box(2.0, 1.6, 0.1, 0x111815, 0, 0.8, -5.9, group);
    for (let i = 0; i < 7; i++) box(1.8, 0.05, 0.05, 0x2c342f, 0, 0.2 + i * 0.21, -5.84, group);
    const crawler = makeCrawler();
    crawler.position.set(0, 0.25, -1.4);
    crawler.rotation.y = 0;
    crawler.scale.setScalar(0.4);
    crawler.visible = false;
    group.add(crawler);
    refs.crawler = crawler;
    const light = pointLight(0x8a4a32, 2.8, 8, 0, 2.0, 2.0, group, { decay: 1.3 });
    refs.light = light;
    refs.warning = pointLight(0xff3a1a, 0, 7, 0, 2.2, -4.5, group, { decay: 1.2 });
    cameraAt = (t) => ({
      pos: new THREE.Vector3(0, 0.75, 4.8 - t * 2.2),
      look: new THREE.Vector3(0, 0.65, -2.0),
    });
  } else if (id === 5) {
    caption = "The water is clear around one body.";
    duration = 16;
    ambient = { color: 0x4a625a, intensity: 0.55 };
    fog = { color: 0x04100c, density: 0.06 };
    box(12, 0.2, 12, 0x212620, 0, -0.1, 0, group);
    for (const side of [-1, 1]) box(0.2, 2.8, 12, 0x28322d, side * 6, 1.4, 0, group);
    box(0.2, 2.8, 12, 0x28322d, 0, 1.4, -6, group);
    box(0.2, 2.8, 12, 0x28322d, 0, 1.4, 6, group);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x1b3a35, transparent: true, opacity: 0.7 });
    plane(11.6, 11.6, 0xffffff, 0, 0.1, 0, group, { rotX: -Math.PI / 2, material: waterMat });
    for (let i = 0; i < 5; i++) {
      const b = makeHumanoid({ coat: 0x3a4038, pants: 0x202520, hair: 0x241a13 });
      b.position.set(-3 + i * 1.6, 0.02, -2.2 + (i % 2) * 1.0);
      b.rotation.z = 1.55;
      b.rotation.y = i * 0.6;
      group.add(b);
    }
    const tenant = makeTenant(2.4);
    tenant.position.set(0, 0, -4.8);
    tenant.rotation.y = 0;
    group.add(tenant);
    refs.tenant = tenant;
    pointLight(0x7fa38a, 3.0, 10, 0, 2.4, -4, group, { decay: 1.4 });
    cameraAt = (t) => ({ pos: new THREE.Vector3(0, 1.0, 4.5 - t * 1.8), look: new THREE.Vector3(0, 0.45, -3.5) });
  } else if (id === 6) {
    caption = "The Tenant is sitting in your chair.";
    duration = 15;
    ambient = { color: 0xb08a60, intensity: 0.9 };
    fog = { color: 0x0b0a07, density: 0.032 };
    box(7, 0.2, 7, 0x2b261f, 0, -0.1, 0, group);
    for (const side of [-1, 1]) box(0.2, 2.8, 7, 0x2d352f, side * 3.5, 1.4, 0, group);
    box(7, 2.8, 0.2, 0x2d352f, 0, 1.4, -3.5, group);
    box(7, 0.2, 7, 0x151815, 0, 2.8, 0, group);
    box(2.2, 0.1, 1.2, 0x5b4029, 0, 0.75, -0.4, group);
    for (const z of [-1.4, 0.6]) {
      box(0.5, 0.08, 0.5, 0x3a2c20, 0, 0.45, z, group);
      box(0.5, 0.6, 0.08, 0x3a2c20, 0, 0.75, z - 0.22, group);
    }
    const tenant = makeTenant(2.4);
    tenant.position.set(0, 0, -0.3);
    tenant.rotation.y = 0;
    group.add(tenant);
    refs.tenant = tenant;
    pointLight(0xffb36a, 5.0, 7, 0, 2.3, 0, group, { decay: 1.3 });
    cameraAt = (t) => ({ pos: new THREE.Vector3(0, 1.35, 2.6 - t * 1.0), look: new THREE.Vector3(0, 1.05, -0.4) });
  } else {
    caption = "Every reflection is a different death.";
    duration = 18;
    ambient = { color: 0x5a5248, intensity: 0.55 };
    fog = { color: 0x050807, density: 0.055 };
    box(4, 0.2, 18, 0x24251f, 0, -0.1, 0, group);
    for (const side of [-1, 1]) {
      box(0.2, 2.8, 18, 0x2a312c, side * 2, 1.4, 0, group);
      for (let i = 0; i < 5; i++) {
        box(0.08, 1.8, 1.6, 0x0a1210, side * 1.88, 1.5, -7 + i * 3.5, group, { material: basic(0x0a1210) });
        box(0.1, 0.08, 1.8, 0x303a34, side * 1.86, 0.6, -7 + i * 3.5, group);
      }
    }
    box(4, 0.2, 18, 0x111413, 0, 2.8, 0, group);
    for (let i = 0; i < 3; i++) {
      const t = makeTenant(2.35);
      t.position.set(-0.7 + i * 0.7, 0, -2 - i * 3);
      t.rotation.y = 0;
      group.add(t);
    }
    pointLight(0x9a7a58, 3.0, 10, 0, 2.3, 2, group, { decay: 1.4 });
    cameraAt = (t) => ({ pos: new THREE.Vector3(Math.sin(t * Math.PI) * 0.8, 1.5, 6.5 - t * 5.0), look: new THREE.Vector3(0, 1.2, -2) });
  }

  return { group, refs, cameraAt, fog, ambient, background, duration, caption };
}

export function buildTitleScene() {
  const group = new THREE.Group();
  const refs = {};
  const wallColor = 0x2a332d;
  const floorColor = 0x1a211e;
  box(6.6, 0.2, 42, floorColor, 0, -0.1, 0, group);
  box(6.6, 0.2, 42, 0x0c1210, 0, 3.1, 0, group);
  for (const side of [-1, 1]) {
    box(0.32, 3.2, 42, wallColor, side * 3.3, 1.55, 0, group);
    for (let z = -19; z <= 19; z += 2.6) {
      box(0.12, 3.0, 0.16, mixColor(wallColor, 0xa4b3a6, 0.12), side * 3.1, 1.5, z, group);
    }
    for (let i = 0; i < 3; i++) {
      cyl(0.05, 0.05, 42, 6, 0x3f7a6c, side * (3.13 + i * 0.02), 2.72 - i * 0.09, 0, group, { rotX: Math.PI / 2 });
    }
    // recessed service doors
    for (const z of [-9, 4, 14]) {
      box(0.1, 2.2, 2.4, 0x121917, side * 3.14, 1.1, z, group);
      box(0.16, 0.16, 2.7, 0x1b2420, side * 3.06, 2.24, z, group);
      box(0.16, 0.16, 2.7, 0x1b2420, side * 3.06, 0.06, z, group);
      box(0.16, 2.35, 0.16, 0x232d28, side * 3.06, 1.16, z - 1.28, group);
      box(0.16, 2.35, 0.16, 0x232d28, side * 3.06, 1.16, z + 1.28, group);
      box(0.12, 0.08, 0.22, 0x9e4a2a, side * 3.0, 1.1, z + 0.55, group, { material: basic(0x9e4a2a) });
    }
  }
  // ceiling girders and cable trays
  for (let z = -18; z <= 18; z += 3) {
    box(6.6, 0.09, 0.14, 0x101614, 0, 3.02, z, group);
  }
  for (const x of [-2.2, 2.2]) {
    box(0.14, 0.14, 42, 0x161d1a, x, 2.86, 0, group);
    for (let z = -19; z <= 19; z += 4) {
      box(0.2, 0.22, 0.06, 0x2c3530, x, 2.8, z, group);
    }
  }
  // end bulkhead with the intake hatch
  box(6.6, 3.2, 0.3, wallColor, 0, 1.55, -20.5, group);
  box(2.7, 0.2, 0.45, 0x1b2420, 0, 2.38, -20.25, group);
  box(0.26, 2.5, 0.45, 0x232d28, -1.24, 1.25, -20.25, group);
  box(0.26, 2.5, 0.45, 0x232d28, 1.24, 1.25, -20.25, group);
  box(2.05, 2.28, 0.16, 0x303a34, 0, 1.14, -20.2, group);
  for (let i = 0; i < 7; i++) {
    box(1.92, 0.055, 0.05, 0x151c19, 0, 0.2 + i * 0.31, -20.1, group);
  }
  plane(1.12, 0.5, 0xffffff, 0, 2.58, -20.0, group, { material: signMaterial("INTAKE 04") });
  box(0.12, 0.12, 0.08, 0xb33a24, 0, 2.3, -20.05, group, { material: basic(0xb33a24) });
  // the figure at the end
  const tenant = makeTenant(2.55);
  tenant.position.set(0, 0, -14.2);
  tenant.rotation.y = Math.PI;
  group.add(tenant);
  refs.tenant = tenant;
  // lamps
  const lampSpecs = [
    { z: 7.5, color: 0xd6a14a, intensity: 6.0 },
    { z: 1.0, color: 0x7fbfa8, intensity: 4.4 },
    { z: -6.2, color: 0x9fb8ae, intensity: 3.2 },
  ];
  refs.lights = [];
  for (const s of lampSpecs) {
    box(0.5, 0.05, 0.24, 0x1b221f, 0, 3.0, s.z, group);
    box(0.38, 0.04, 0.12, s.color, 0, 2.97, s.z, group, { material: basic(s.color) });
    const l = pointLight(s.color, s.intensity, 12, 0, 2.65, s.z, group, { decay: 1.35 });
    addGlow(group, s.color, 0, 2.97, s.z, 1.2, 0.3);
    refs.lights.push({ light: l, base: s.intensity, phase: Math.random() * 20, speed: 4 + Math.random() * 5 });
  }
  const red = pointLight(0x9a2a1a, 4.5, 8, 0, 1.8, -19.7, group, { decay: 1.25 });
  addGlow(group, 0x9a2a1a, 0, 1.8, -19.7, 1.4, 0.26);
  refs.red = red;
  const doorway = pointLight(0x6a8a76, 2.4, 7, 0, 1.5, -16.0, group, { decay: 1.5 });
  refs.doorway = doorway;
  // dust around the camera
  refs.motes = addMotes(group, 16, 2.2, 0xa2b5a8, 160);
  // ground puddles
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshLambertMaterial({ color: 0x12231e, transparent: true, opacity: 0.5 });
    plane(1.0 + Math.random() * 1.2, 0.6 + Math.random() * 0.8, 0xffffff,
      (Math.random() - 0.5) * 4.4, 0.014, -12 + Math.random() * 24, group,
      { rotX: -Math.PI / 2, rotZ: Math.random() * 3, material: m });
  }

  return {
    group,
    refs,
    cameraAt(t) {
      return {
        pos: new THREE.Vector3(Math.sin(t * 0.19) * 0.18, 1.52 + Math.sin(t * 0.43) * 0.02, 11.5 - t * 0.42),
        look: new THREE.Vector3(Math.sin(t * 0.08) * 0.35, 1.36, -14.2),
      };
    },
    fog: { color: 0x060b09, density: 0.028 },
    ambient: { color: 0x5e7066, intensity: 0.62 },
    background: 0x020303,
  };
}

function makeMaze({ n = 8, cell = 2.9, wallColor = 0x29322d, floorColor = 0x242b27, height = 2.9, water = false, lightColor = 0x7fa36a, accentColor = null } = {}) {
  const group = new THREE.Group();
  const colliders = [];
  const size = n * cell;
  const half = size / 2;
  const trimColor = mixColor(wallColor, 0x050807, 0.65);
  const ribColor = mixColor(wallColor, 0x0d1a16, 0.32);
  const beamColor = mixColor(wallColor, 0x0b100e, 0.42);
  const wallMat = toonMat(wallColor, {
    map: surfaceTexture("metal", { repeat: [2, 1] }),
  });
  const floorMat = toonMat(floorColor, {
    map: surfaceTexture("concrete", { repeat: [6, 6] }),
  });
  const ceilMat = toonMat(0x111716, {
    map: surfaceTexture("metal", { repeat: [6, 6] }),
  });
  box(size, 0.2, size, floorColor, 0, -0.1, 0, group, { material: floorMat });
  box(size, 0.16, size, 0x111716, 0, height, 0, group, { material: ceilMat });
  // outer shell
  for (const side of [-1, 1]) {
    box(0.28, height + 0.2, size, wallColor, side * half, height / 2, 0, group, { material: wallMat });
    box(size, height + 0.2, 0.28, wallColor, 0, height / 2, side * half, group, { material: wallMat });
    colliders.push({ minX: side * half - 0.16, maxX: side * half + 0.16, minZ: -half, maxZ: half });
    colliders.push({ minX: -half, maxX: half, minZ: side * half - 0.16, maxZ: side * half + 0.16 });
  }
  // perimeter ribs
  for (let i = 0; i < 7; i++) {
    const p = -half + (i + 0.5) * (size / 7);
    for (const side of [-1, 1]) {
      box(0.1, height - 0.2, 0.12, ribColor, side * (half - 0.16), height / 2, p, group);
      box(0.12, height - 0.2, 0.1, ribColor, p, height / 2, side * (half - 0.16), group);
    }
  }
  // painted hazard bands on the perimeter walls
  for (const side of [-1, 1]) {
    box(0.05, 0.14, size, 0xf2a13a, side * (half - 0.17), 1.2, 0, group);
    box(size, 0.14, 0.05, 0xf2a13a, 0, 1.2, side * (half - 0.17), group);
  }
  // big ventilation fans on the outer walls
  addWallFan(group, -half + 0.2, 1.9, -size * 0.23, Math.PI / 2);
  addWallFan(group, half - 0.2, 1.9, size * 0.23, -Math.PI / 2);
  addWallFan(group, -size * 0.23, 1.9, half - 0.2, Math.PI);
  addWallFan(group, size * 0.23, 1.9, -half + 0.2, 0);

  const visited = new Set();
  const open = new Set();
  const key = (i, j) => `${i},${j}`;
  const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inside = (i, j) => i >= 0 && j >= 0 && i < n && j < n;
  function carve(i, j) {
    visited.add(key(i, j));
    const order = dirs.slice().sort(() => Math.random() - 0.5);
    for (const [dx, dz] of order) {
      const ni = i + dx, nj = j + dz;
      if (!inside(ni, nj) || visited.has(key(ni, nj))) continue;
      open.add(edgeKey(key(i, j), key(ni, nj)));
      carve(ni, nj);
    }
  }
  carve(0, 0);
  // a few loops so the maze is not a single corridor
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (const [dx, dz] of [[1, 0], [0, 1]]) {
        const ni = i + dx, nj = j + dz;
        if (!inside(ni, nj)) continue;
        if (open.has(edgeKey(key(i, j), key(ni, nj)))) continue;
        if (Math.random() < 0.18) open.add(edgeKey(key(i, j), key(ni, nj)));
      }
    }
  }
  // guarantee a readable entrance corridor instead of spawning nose-first into a wall
  const entrance = Math.random() < 0.55 ? [0, 1] : [1, 0];
  for (let k = 0; k < 2; k++) {
    const ax = entrance[0] * k, az = entrance[1] * k;
    const bx = entrance[0] * (k + 1), bz = entrance[1] * (k + 1);
    if (!inside(bx, bz)) break;
    open.add(edgeKey(key(ax, az), key(bx, bz)));
  }
  const entranceYaw = entrance[0] === 1 ? -Math.PI / 2 : Math.PI;
  const center = (i, j) => new THREE.Vector3(-half + (i + 0.5) * cell, 0, -half + (j + 0.5) * cell);

  // painted floor guide down the entrance run
  for (let k = 0; k < 3; k++) {
    const c = center(entrance[0] * k, entrance[1] * k);
    box(entrance[0] ? cell * 0.7 : 0.06, 0.012, entrance[1] ? cell * 0.7 : 0.06, 0xd6a14a, c.x, 0.006, c.z, group);
  }
  // hanging entrance sign
  const startC = center(0, 0);
  const signX = startC.x + entrance[0] * 2.05;
  const signZ = startC.z + entrance[1] * 2.05;
  const signYaw = entrance[0] === 1 ? -Math.PI / 2 : entrance[1] === 1 ? Math.PI : 0;
  plane(0.8, 0.32, 0xffffff, signX, height - 0.72, signZ, group, {
    rotY: signYaw,
    material: signMaterial("VENT 04", "#ffe08a"),
  });
  const sideX = entrance[1] === 0 ? 0.34 : 0;
  const sideZ = entrance[0] === 0 ? 0.34 : 0;
  for (const k of [-1, 1]) {
    cyl(0.012, 0.012, 0.55, 4, 0x151a17,
      signX + sideX * k, height - 0.34, signZ + sideZ * k, group);
  }
  addGlow(group, 0xffd27a, signX, height - 0.72, signZ, 0.7, 0.16);

  // internal walls with ribs, base trim, and occasional wall pipes
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = key(i, j);
      const c = center(i, j);
      if (i < n - 1) {
        const b = key(i + 1, j);
        if (!open.has(edgeKey(a, b))) {
          const x = -half + (i + 1) * cell;
          box(0.18, height, cell, wallColor, x, height / 2, c.z, group, { material: wallMat });
          colliders.push({ minX: x - 0.12, maxX: x + 0.12, minZ: c.z - cell / 2, maxZ: c.z + cell / 2 });
          for (const k of [-0.24, 0.24]) {
            box(0.07, height - 0.24, 0.09, ribColor, x, height / 2, c.z + cell * k, group);
          }
          box(0.07, 0.06, cell, trimColor, x, 1.06, c.z, group);
          box(0.07, 0.06, cell, trimColor, x, 1.72, c.z, group);
          if (Math.random() < 0.72) {
            box(0.075, 0.16, cell, 0xf2a13a, x, 1.2, c.z, group);
          }
          if (Math.random() < 0.28) {
            box(0.075, 0.09, cell, 0x55c9c0, x, 0.44, c.z, group);
          }
          box(0.08, 0.1, cell, trimColor, x, 0.05, c.z, group);
          box(0.3, 0.1, cell, beamColor, x, height - 0.16, c.z, group);
          if (Math.random() < 0.34) {
            cyl(0.035, 0.035, cell, 6, Math.random() < 0.35 ? 0xd9782f : 0x3f7a6c, x + 0.12, 0.56, c.z, group, { rotX: Math.PI / 2 });
          }
          if (Math.random() < 0.2) {
            box(0.13, 0.36, 0.24, 0x252e2a, x + 0.13, 1.45, c.z + cell * 0.22, group);
            box(0.04, 0.05, 0.05, 0x9e4a2a, x + 0.21, 1.55, c.z + cell * 0.22, group, { material: basic(0x9e4a2a) });
          }
        }
      }
      if (j < n - 1) {
        const b = key(i, j + 1);
        if (!open.has(edgeKey(a, b))) {
          const z = -half + (j + 1) * cell;
          box(cell, height, 0.18, wallColor, c.x, height / 2, z, group, { material: wallMat });
          colliders.push({ minX: c.x - cell / 2, maxX: c.x + cell / 2, minZ: z - 0.12, maxZ: z + 0.12 });
          for (const k of [-0.24, 0.24]) {
            box(0.09, height - 0.24, 0.07, ribColor, c.x + cell * k, height / 2, z, group);
          }
          box(cell, 0.06, 0.07, trimColor, c.x, 1.06, z, group);
          box(cell, 0.06, 0.07, trimColor, c.x, 1.72, z, group);
          if (Math.random() < 0.72) {
            box(cell, 0.16, 0.075, 0xf2a13a, c.x, 1.2, z, group);
          }
          if (Math.random() < 0.28) {
            box(cell, 0.09, 0.075, 0x55c9c0, c.x, 0.44, z, group);
          }
          box(cell, 0.1, 0.08, trimColor, c.x, 0.05, z, group);
          box(cell, 0.1, 0.3, beamColor, c.x, height - 0.16, z, group);
          if (Math.random() < 0.34) {
            cyl(0.035, 0.035, cell, 6, Math.random() < 0.35 ? 0xd9782f : 0x3f7a6c, c.x, 0.56, z + 0.12, group, { rotZ: Math.PI / 2 });
          }
          if (Math.random() < 0.2) {
            box(0.24, 0.36, 0.13, 0x252e2a, c.x + cell * 0.22, 1.45, z + 0.13, group);
            box(0.05, 0.05, 0.04, 0x9e4a2a, c.x + cell * 0.22, 1.55, z + 0.21, group, { material: basic(0x9e4a2a) });
          }
        }
      }
    }
  }

  // ceiling girders
  for (let i = 0; i <= n; i++) {
    const p = -half + i * cell;
    box(size, 0.09, 0.14, beamColor, 0, height - 0.08, p, group);
    box(0.14, 0.09, size, beamColor, p, height - 0.08, 0, group);
    box(size, 0.012, 0.03, beamColor, 0, 0.004, p, group);
    box(0.03, 0.012, size, beamColor, p, 0.004, 0, group);
  }

  const deadEnds = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let degree = 0;
      for (const [dx, dz] of dirs) {
        const ni = i + dx, nj = j + dz;
        if (inside(ni, nj) && open.has(edgeKey(key(i, j), key(ni, nj)))) degree++;
      }
      if (degree === 1) deadEnds.push(center(i, j));
    }
  }

  // guaranteed start-to-end path, used to place story beats where players will find them
  const startKey = key(0, 0);
  const endKey = key(n - 1, n - 1);
  const prev = new Map([[startKey, null]]);
  const queue = [startKey];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === endKey) break;
    const [ci, cj] = cur.split(",").map(Number);
    for (const [dx, dz] of dirs) {
      const ni = ci + dx, nj = cj + dz;
      if (!inside(ni, nj)) continue;
      if (!open.has(edgeKey(key(ci, cj), key(ni, nj)))) continue;
      const nk = key(ni, nj);
      if (prev.has(nk)) continue;
      prev.set(nk, cur);
      queue.push(nk);
    }
  }
  const path = [];
  let pk = endKey;
  while (pk !== null && pk !== undefined) {
    const [ci, cj] = pk.split(",").map(Number);
    path.push(center(ci, cj));
    pk = prev.get(pk);
  }
  path.reverse();

  // overhead duct runs deeper along the route
  for (let k = 3; k < Math.min(path.length - 1, 7); k += 2) {
    const a = path[k];
    const b = path[k + 1];
    const alongX = Math.abs(b.x - a.x) > Math.abs(b.z - a.z);
    const len = cell * 0.8;
    box(alongX ? len : 0.62, 0.3, alongX ? 0.62 : len, 0x2f7a70, a.x, height - 0.38, a.z, group);
    box(alongX ? 0.08 : 0.72, 0.36, alongX ? 0.72 : 0.08, 0x1a2420,
      a.x - (alongX ? len / 2 : 0), height - 0.38, a.z - (alongX ? 0 : len / 2), group);
    box(alongX ? 0.08 : 0.72, 0.36, alongX ? 0.72 : 0.08, 0x1a2420,
      a.x + (alongX ? len / 2 : 0), height - 0.38, a.z + (alongX ? 0 : len / 2), group);
    box(alongX ? 0.1 : 0.66, 0.07, alongX ? 0.66 : 0.1, 0xc05a26, a.x, height - 0.38, a.z, group);
  }

  // face down the guaranteed entrance corridor
  const startYaw = entranceYaw;

  // light fixtures: bright core, dark bracket, some flicker
  const flickerLights = [];
  for (let i = 0; i < n; i += 2) {
    for (let j = 0; j < n; j += 2) {
      const c = center(i, j);
      const fixtureColor = accentColor && (i + j) % 6 === 0 ? accentColor : lightColor;
      for (const sx of [-0.18, 0.18]) {
        box(0.025, 0.44, 0.025, 0x2a3530, c.x + sx, height - 0.2, c.z, group);
      }
      box(0.58, 0.05, 0.3, 0x1b221f, c.x, height - 0.44, c.z, group);
      box(0.5, 0.04, 0.22, 0x0b0f0d, c.x, height - 0.47, c.z, group);
      box(0.4, 0.05, 0.11, fixtureColor, c.x, height - 0.49, c.z, group, { material: basic(fixtureColor) });
      addGlow(group, fixtureColor, c.x, height - 0.49, c.z, 1.05, 0.34);
      addLightShaft(group, fixtureColor, c.x, height - 0.5, c.z, height - 0.55, cell * 0.36, 0.04);
      if ((i + j) % 4 === 0) {
        const light = pointLight(fixtureColor, 3.2, 8.2, c.x, height - 0.68, c.z, group, { decay: 1.45 });
        if (Math.random() < 0.32) {
          flickerLights.push({ light, base: 3.2, phase: Math.random() * 20, speed: 5 + Math.random() * 7 });
        }
      }
    }
  }
  // warm contrast at the entrance, red warning at the exit
  pointLight(0xd6a14a, 2.4, 7, center(0, 0).x, 1.9, center(0, 0).z, group, { decay: 1.5 });
  pointLight(0xb33a24, 2.6, 7, center(n - 1, n - 1).x, 1.9, center(n - 1, n - 1).z, group, { decay: 1.5 });
  addGlow(group, 0xd6a14a, center(0, 0).x, 1.9, center(0, 0).z, 1.5, 0.22);
  addGlow(group, 0xb33a24, center(n - 1, n - 1).x, 1.9, center(n - 1, n - 1).z, 1.3, 0.26);

  // floor grates and drains
  const grateMat = toonMat(0xffffff, { map: grateTexture() });
  for (let k = 0; k < Math.floor(n * 1.4); k++) {
    const iCell = Math.floor(Math.random() * n);
    const jCell = Math.floor(Math.random() * n);
    const c = center(iCell, jCell);
    plane(1.15, 0.85, 0xffffff, c.x + (Math.random() - 0.5) * 0.5, 0.012, c.z + (Math.random() - 0.5) * 0.5,
      group, { rotX: -Math.PI / 2, material: grateMat });
  }
  const drainMat = toonMat(0x111614);
  for (let k = 0; k < 4; k++) {
    const c = center(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    cyl(0.2, 0.2, 0.03, 10, 0x0b1210, c.x + (Math.random() - 0.5) * 1.2, 0.01, c.z + (Math.random() - 0.5) * 1.2, group, { material: drainMat });
  }

  // wall pipes, chains, junction boxes and warning markings
  for (let k = 0; k < n * 2; k++) {
    const iCell = Math.floor(Math.random() * n);
    const jCell = Math.floor(Math.random() * n);
    const c = center(iCell, jCell);
    const rot = Math.random() < 0.5;
    cyl(0.055, 0.055, cell * 0.9, 6, Math.random() < 0.3 ? 0xd9782f : 0x3f7a6c,
      c.x + (rot ? 0 : (Math.random() - 0.5) * 1.3),
      height - 0.42,
      c.z + (rot ? (Math.random() - 0.5) * 1.3 : 0),
      group, { rotX: rot ? Math.PI / 2 : 0, rotZ: rot ? 0 : Math.PI / 2 });
  }
  for (let k = 0; k < 6; k++) {
    const c = center(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    cyl(0.012, 0.012, 0.6 + Math.random() * 0.5, 4, 0x3a423c, c.x + (Math.random() - 0.5) * 0.9, height - 0.55, c.z + (Math.random() - 0.5) * 0.9, group);
  }

  // debris; placed toward cell edges so it never reads as a solid door
  for (let i = 0; i < n * n * 1.6; i++) {
    const iCell = Math.floor(Math.random() * n);
    const jCell = Math.floor(Math.random() * n);
    const c = center(iCell, jCell);
    if (Math.random() < 0.72) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.85 + Math.random() * 0.35;
      box(0.12 + Math.random() * 0.32, 0.06 + Math.random() * 0.16, 0.14 + Math.random() * 0.28,
        Math.random() < 0.5 ? 0x3c3225 : 0x2c3530, c.x + Math.cos(a) * r, 0.06, c.z + Math.sin(a) * r,
        group, { rotY: Math.random() * 3 });
    }
  }

  // crates and barrels with colliders, kept away from the spawn and exit cells
  for (let k = 0; k < Math.min(7, 3 + n / 2); k++) {
    let c = center(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    for (let tries = 0; tries < 12; tries++) {
      if (c.distanceTo(center(0, 0)) > cell * 1.6 && c.distanceTo(center(n - 1, n - 1)) > cell * 1.2) break;
      c = center(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    }
    const x = c.x + (Math.random() < 0.5 ? -1 : 1) * 0.78;
    const z = c.z + (Math.random() < 0.5 ? -1 : 1) * 0.6;
    if (Math.random() < 0.55) { addCrate(group, colliders, x, z, 0.55 + Math.random() * 0.2); }
    else { addBarrel(group, colliders, x, z); }
  }

  // small green emergency marker and wall sign at some dead ends
  for (const c of deadEnds.slice(0, 4)) {
    box(0.16, 0.05, 0.28, 0x8fc46a, c.x, 2.25, c.z, group, { material: basic(0x8fc46a) });
    addGlow(group, 0x8fc46a, c.x, 2.25, c.z, 0.72, 0.22);
    pointLight(0x6fa34a, 1.2, 4, c.x, 2.05, c.z, group, { decay: 1.7 });
  }

  // puddles and damp streaks
  for (let i = 0; i < 8; i++) {
    const c = center(Math.floor(Math.random() * n), Math.floor(Math.random() * n));
    const m = new THREE.MeshLambertMaterial({ color: water ? 0x16332c : 0x15231f, transparent: true, opacity: 0.45 });
    plane(1.1 + Math.random() * 0.9, 0.7 + Math.random() * 0.7, 0xffffff, c.x, 0.014, c.z,
      group, { rotX: -Math.PI / 2, rotZ: Math.random() * 3, material: m });
  }
  if (water) {
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x1b3a35, transparent: true, opacity: 0.62 });
    plane(size - 1.2, size - 1.2, 0xffffff, 0, 0.06, 0, group, { rotX: -Math.PI / 2, material: waterMat });
  }

  const motes = addMotes(group, size * 0.9, height * 0.85);

  return {
    group,
    colliders,
    size,
    cell,
    n,
    half,
    center,
    start: center(0, 0),
    end: center(n - 1, n - 1),
    startYaw,
    deadEnds,
    path,
    open,
    flickerLights,
    motes,
  };
}

function mixColor(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function drawSignPips(ctx, count, x, y, gap = 10, radius = 3.4) {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(x + (i - (count - 1) / 2) * gap, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSignIcon(ctx, text, fg) {
  const t = String(text || "").toUpperCase();
  const cx = 128;
  const cy = 62;
  const stroke = (w = 4) => { ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = fg; ctx.fillStyle = fg; };
  const line = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  const slash = () => { stroke(6); line(92, 36, 164, 92); };

  let kind = "grille";
  if (/NO CREDIT/.test(t)) kind = "coinbar";
  else if (/NO DIVING/.test(t)) kind = "waterbar";
  else if (/NO AIR/.test(t)) kind = "airbar";
  else if (/NO ACCESS|KEEP OUT|TURN BACK/.test(t)) kind = "barred";
  else if (/DANGER/.test(t)) kind = "hazard";
  else if (/FAN/.test(t)) kind = "fan";
  else if (/RAIL/.test(t)) kind = "rail";
  else if (/AIR/.test(t)) kind = "air";
  else if (/SEALED|LOCK/.test(t)) kind = "lock";
  else if (/SANCTUARY|SAFE|SHELTER/.test(t)) kind = "shelter";
  else if (/CRAWL/.test(t)) kind = "crawl";
  else if (/NEST/.test(t)) kind = "nest";
  else if (/SUMP|DROWN|WATER/.test(t)) kind = "water";
  else if (/HATCH/.test(t)) kind = "hatch";
  else if (/STATION|ZARYA|KRYL|CITY/.test(t)) kind = "city";
  else if (/^[\d\s]+$/.test(t)) kind = "count";

  if (kind === "hazard") {
    stroke(5);
    ctx.beginPath();
    ctx.moveTo(cx, 20);
    ctx.lineTo(198, 100);
    ctx.lineTo(58, 100);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 7;
    line(cx, 43, cx, 73);
    ctx.beginPath();
    ctx.arc(cx, 88, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "barred") {
    stroke(6);
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.stroke();
    slash();
  } else if (kind === "fan") {
    stroke(5);
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((Math.PI / 2) * i);
      ctx.beginPath();
      ctx.ellipse(15, 0, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#141a17";
    ctx.fill();
  } else if (kind === "rail") {
    stroke(5);
    line(48, 48, 208, 48);
    line(48, 76, 208, 76);
    stroke(4);
    for (let x = 58; x <= 198; x += 28) line(x, 38, x, 86);
    stroke(3);
    line(80, 104, 176, 104);
  } else if (kind === "city") {
    stroke(4);
    const base = 98;
    const blocks = [[44, 48, 26], [74, 34, 30], [108, 58, 22], [134, 28, 30], [168, 42, 32], [204, 54, 18]];
    for (const [x, h, w] of blocks) {
      ctx.strokeRect(x, base - h, w, h);
      for (let wy = base - h + 8; wy < base - 8; wy += 12) {
        for (let wx = x + 6; wx < x + w - 4; wx += 10) {
          if ((wx + wy) % 3 === 0) ctx.fillRect(wx, wy, 4, 5);
        }
      }
    }
    stroke(3);
    ctx.beginPath();
    ctx.arc(74, 22, 10, 0, Math.PI * 2);
    ctx.stroke();
    line(28, 108, 228, 108);
  } else if (kind === "air" || kind === "airbar") {
    stroke(5);
    for (let y = 44; y <= 82; y += 19) {
      ctx.beginPath();
      ctx.moveTo(58, y);
      ctx.bezierCurveTo(88, y - 12, 108, y + 12, 139, y);
      ctx.bezierCurveTo(166, y - 12, 184, y + 12, 206, y);
      ctx.stroke();
    }
    if (kind === "airbar") slash();
  } else if (kind === "coinbar") {
    stroke(5);
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();
    slash();
  } else if (kind === "lock") {
    stroke(5);
    ctx.strokeRect(88, 58, 80, 44);
    ctx.beginPath();
    ctx.arc(cx, 58, 24, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, 78, 7, 0, Math.PI * 2);
    ctx.fill();
    line(cx, 84, cx, 94);
  } else if (kind === "shelter") {
    stroke(5);
    ctx.beginPath();
    ctx.moveTo(62, 62);
    ctx.lineTo(cx, 24);
    ctx.lineTo(194, 62);
    ctx.stroke();
    ctx.strokeRect(74, 62, 108, 42);
    ctx.strokeRect(116, 76, 24, 28);
    ctx.strokeRect(88, 72, 14, 14);
    ctx.strokeRect(154, 72, 14, 14);
  } else if (kind === "crawl") {
    stroke(6);
    line(50, 34, 206, 34);
    line(50, 104, 206, 104);
    stroke(5);
    for (const x of [94, 162]) {
      line(x, 48, x, 78);
      line(x - 10, 68, x, 78);
      line(x + 10, 68, x, 78);
    }
    stroke(4);
    line(54, 50, 54, 90);
    line(202, 50, 202, 90);
  } else if (kind === "nest") {
    stroke(5);
    ctx.beginPath();
    ctx.ellipse(cx, 82, 58, 24, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, 82, 36, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
    stroke(3);
    for (const [x, y] of [[96, 60], [128, 52], [160, 60]]) {
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 13, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (kind === "water" || kind === "waterbar") {
    stroke(5);
    for (let y = 42; y <= 80; y += 19) {
      ctx.beginPath();
      ctx.moveTo(54, y);
      ctx.quadraticCurveTo(79, y - 14, 104, y);
      ctx.quadraticCurveTo(129, y + 14, 154, y);
      ctx.quadraticCurveTo(179, y - 14, 204, y);
      ctx.stroke();
    }
    if (kind === "waterbar") slash();
  } else if (kind === "hatch") {
    stroke(5);
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.stroke();
    line(cx - 20, cy, cx + 20, cy);
    line(cx, cy - 20, cx, cy + 20);
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "count") {
    const n = Math.max(0, Math.min(9, parseInt(t, 10) || 0));
    stroke(5);
    ctx.strokeRect(38, 26, 180, 76);
    drawSignPips(ctx, n, cx, cy, 17, 6);
  } else {
    // vent / gate / generic bulkhead grille
    stroke(5);
    ctx.strokeRect(72, 34, 112, 62);
    stroke(4);
    for (let x = 88; x <= 168; x += 16) line(x, 42, x, 88);
    stroke(4);
    line(196, 58, 214, 66);
    line(196, 74, 214, 66);
  }

  const num = parseInt((t.match(/(\d+)\s*$/) || [])[1] || "", 10);
  ctx.fillStyle = fg;
  if (num > 0 && kind !== "count") drawSignPips(ctx, Math.min(9, num), 128, 112, 9, 3);
}

const _signCache = new Map();
function signMaterial(text, fg = "#d9cba8") {
  if (_signCache.has(text + fg)) return _signCache.get(text + fg);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#141a17";
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = "#46524b";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 122);
  drawSignIcon(ctx, text, fg);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  const m = new THREE.MeshBasicMaterial({ map: tex });
  _signCache.set(text + fg, m);
  return m;
}

let _grateTex = null;
function grateTexture() {
  if (_grateTex) return _grateTex;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#202824";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#0b0f0d";
  for (let i = 0; i < 8; i++) ctx.fillRect(8 + i * 15, 4, 7, 120);
  ctx.fillStyle = "#37413b";
  ctx.fillRect(0, 0, 128, 5);
  ctx.fillRect(0, 123, 128, 5);
  ctx.fillRect(0, 0, 5, 128);
  ctx.fillRect(123, 0, 5, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  _grateTex = tex;
  return tex;
}

const _hazardCache = new Map();
function hazardMaterial(color = "#b98b2f") {
  if (_hazardCache.has(color)) return _hazardCache.get(color);
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#16130d";
  ctx.fillRect(0, 0, 128, 32);
  ctx.fillStyle = color;
  for (let x = -32; x < 160; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 32);
    ctx.lineTo(x + 16, 32);
    ctx.lineTo(x + 32, 0);
    ctx.lineTo(x + 16, 0);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const m = new THREE.MeshBasicMaterial({ map: tex });
  _hazardCache.set(color, m);
  return m;
}

let _crateMat = null;
let _barrelMat = null;
let _orangeBarrelMat = null;
let _metalCrateMat = null;
let _orangeCrateMat = null;
function crateMaterial() {
  if (!_crateMat) {
    _crateMat = toonMat(0x8a6339, {
      map: surfaceTexture("wood", { repeat: [1, 1] }),
    });
  }
  return _crateMat;
}
function metalCrateMaterial() {
  if (!_metalCrateMat) {
    _metalCrateMat = toonMat(0x2f7a70, {
      map: surfaceTexture("metal", { repeat: [1, 1] }),
    });
  }
  return _metalCrateMat;
}
function orangeCrateMaterial() {
  if (!_orangeCrateMat) {
    _orangeCrateMat = toonMat(0xb85a28, {
      map: surfaceTexture("metal", { repeat: [1, 1] }),
    });
  }
  return _orangeCrateMat;
}
function barrelMaterial() {
  if (!_barrelMat) {
    _barrelMat = toonMat(0x6a4a2a, {
      map: surfaceTexture("metal", { repeat: [1, 1] }),
    });
  }
  return _barrelMat;
}
function orangeBarrelMaterial() {
  if (!_orangeBarrelMat) {
    _orangeBarrelMat = toonMat(0xc05a26, {
      map: surfaceTexture("metal", { repeat: [1, 1] }),
    });
  }
  return _orangeBarrelMat;
}

function addCrate(group, colliders, x, z, s = 0.65) {
  const roll = Math.random();
  const cm = roll < 0.45 ? crateMaterial() : roll < 0.75 ? metalCrateMaterial() : orangeCrateMaterial();
  box(s, s, s, 0x4a3a28, x, s / 2, z, group, { rotY: Math.random() * 0.5, material: cm });
  box(s * 0.86, s * 0.08, s * 1.02, 0x1a211e, x, s * 0.75, z, group, { rotY: Math.random() * 0.1 });
  box(s * 0.86, s * 0.1, s * 0.08, 0x1a211e, x, s * 0.5, z + s / 2, group);
  colliders.push({ minX: x - s / 2, maxX: x + s / 2, minZ: z - s / 2, maxZ: z + s / 2 });
}

function addBarrel(group, colliders, x, z) {
  const bm = Math.random() < 0.5 ? orangeBarrelMaterial() : barrelMaterial();
  cyl(0.3, 0.3, 0.82, 8, 0x5a4328, x, 0.41, z, group, { material: bm });
  cyl(0.31, 0.31, 0.06, 8, 0x2e2417, x, 0.16, z, group);
  cyl(0.31, 0.31, 0.06, 8, 0x2e2417, x, 0.66, z, group);
  colliders.push({ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 });
}

function addMotes(group, area, height, color = 0x9fb3a4, count = 110) {
  const geo = new THREE.BufferGeometry();
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * area;
    arr[i * 3 + 1] = 0.15 + Math.random() * height;
    arr[i * 3 + 2] = (Math.random() - 0.5) * area;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 0.018, transparent: true, opacity: 0.36, depthWrite: false,
  }));
  group.add(p);
  return p;
}


function addWallFan(group, x, y, z, rotY = 0) {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.36, 12), toonMat(0x0c1311));
  back.position.z = -0.02;
  g.add(back);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.055, 6, 12), toonMat(0x1a2420));
  g.add(ring);
  cyl(0.09, 0.09, 0.08, 8, 0x2a3530, 0, 0, 0.06, g, { rotX: Math.PI / 2 });
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i + 0.4;
    box(0.32, 0.1, 0.035, 0xd9782f, Math.cos(a) * 0.16, Math.sin(a) * 0.16, 0.04, g, { rotZ: a });
  }
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  group.add(g);
}

function mazePickCells(maze, count, exclude = []) {
  const cells = [];
  const used = new Set(exclude.map((v) => `${v.x.toFixed(2)},${v.z.toFixed(2)}`));
  const candidates = [];
  for (let i = 0; i < maze.n; i++) {
    for (let j = 0; j < maze.n; j++) {
      const c = maze.center(i, j);
      const k = `${c.x.toFixed(2)},${c.z.toFixed(2)}`;
      if (used.has(k)) continue;
      candidates.push(c);
    }
  }
  candidates.sort(() => Math.random() - 0.5);
  for (const c of candidates) {
    if (cells.length >= count) break;
    cells.push(c);
  }
  return cells;
}

function yawFromDir(dx, dz) {
  if (dz === 1) return 0;
  if (dz === -1) return Math.PI;
  if (dx === 1) return Math.PI / 2;
  return -Math.PI / 2;
}

function mazeDoorYaw(maze) {
  const i = maze.n - 1, j = maze.n - 1;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (const [dx, dz] of dirs) {
    const ni = i + dx, nj = j + dz;
    if (ni < 0 || nj < 0 || ni >= maze.n || nj >= maze.n) continue;
    const a = `${i},${j}`, b = `${ni},${nj}`;
    const ek = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (maze.open.has(ek)) return yawFromDir(dx, dz);
  }
  return 0;
}

function addDeadEndSign(maze, cell, text) {
  const i = Math.round((cell.x + maze.half) / maze.cell - 0.5);
  const j = Math.round((cell.z + maze.half) / maze.cell - 0.5);
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (const [dx, dz] of dirs) {
    const ni = i + dx, nj = j + dz;
    if (ni < 0 || nj < 0 || ni >= maze.n || nj >= maze.n) continue;
    const a = `${i},${j}`, b = `${ni},${nj}`;
    const ek = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!maze.open.has(ek)) continue;
    // sign sits on the wall opposite the only opening and faces into the dead end
    const wx = cell.x - dx * (maze.cell / 2 - 0.14);
    const wz = cell.z - dz * (maze.cell / 2 - 0.14);
    plane(0.9, 0.45, 0xffffff, wx, 1.72, wz, maze.group, {
      rotY: yawFromDir(dx, dz),
      material: signMaterial(text),
    });
    plane(0.72, 0.13, 0xffffff, wx, 0.2, wz, maze.group, {
      rotY: yawFromDir(dx, dz),
      material: hazardMaterial(),
    });
    return;
  }
}

function decorateMazeStory(maze, labels = []) {
  const spots = maze.deadEnds.slice(0, labels.length);
  spots.forEach((c, i) => addDeadEndSign(maze, c, labels[i]));
}

export function buildWarrenMaze() {
  const maze = makeMaze({ n: 8, cell: 2.9, wallColor: 0x2a4f66, floorColor: 0x16262e, lightColor: 0xffb35a, accentColor: 0x55c9c0 });
  const { group, colliders } = maze;
  const path = maze.path.length ? maze.path : [maze.start, maze.end];
  const visionCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.52))];
  const crawlerCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.74))];
  const noteCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.32))];
  const medCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.42))];
  const sightingCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.86))];
  const fuseCells = maze.deadEnds
    .filter((c) => c.distanceTo(maze.start) > 1 && c.distanceTo(maze.end) > 1)
    .slice(0, 3);
  const cellPick = mazePickCells(maze, 14, [maze.start, maze.end, ...fuseCells, visionCell, crawlerCell, noteCell, medCell, sightingCell]);
  while (fuseCells.length < 3) fuseCells.push(cellPick.pop());
  const fuses = fuseCells.map((c) => fuse(group, c.x, c.z));
  const exit = door(group, maze.end.x, maze.end.z, "WARREN 04", mazeDoorYaw(maze));
  const bodies = cellPick.slice(0, 2).map((c, i) => ({ group: body(group, c.x, c.z, i * 1.2), loot: i === 0 ? { mgr: 8, ammo: 8 } : { mgr: 5, medkit: 1 } }));
  const noteObj = note(group, noteCell.x, noteCell.z, "LOG 09: The vents go deeper than the station ever did.");
  const med = pickup(group, medCell.x, medCell.z, "medkit");
  const enemies = cellPick.filter((c) => c.distanceTo(maze.start) > 4.2).slice(0, 5).map((c) => ratEnemy(group, c.x, c.z));
  const scavCell = maze.center(maze.n - 2, maze.n - 2);
  enemies.push(scavengerEnemy(group, scavCell.x + 0.45, scavCell.z + 0.45, Math.PI));
  const crawler = crawlerAt(group, crawlerCell.x, crawlerCell.z, Math.random() * Math.PI * 2);
  const sighting = makeTenant(2.45);
  sighting.position.set(sightingCell.x, 0, sightingCell.z);
  sighting.rotation.y = Math.PI;
  group.add(sighting);
  decorateMazeStory(maze, ["VENT 04", "NO ACCESS", "KEEP OUT"]);

  return {
    group,
    colliders,
    refs: { exit, crawler, sightings: [sighting], flickerLights: maze.flickerLights, motes: maze.motes },
    spawn: maze.start.clone(),
    spawnYaw: maze.startYaw,
    bounds: { minX: -maze.half + 0.8, maxX: maze.half - 0.8, minZ: -maze.half + 0.8, maxZ: maze.half - 0.8 },
    enemies,
    interactables: [
      ...fuses.map((f, i) => ({ kind: "fuse", pos: f.pos, radius: 1.6, index: i, group: f.group })),
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE DOOR", next: "flooded", requirement: "fuses", required: 3 },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map((b) => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [
      { kind: "crawler", pos: crawlerCell.clone(), radius: 1.9, crawler, once: true },
      { kind: "vision", pos: visionCell.clone(), radius: 2.0, visionId: 4, once: true },
    ],
    fog: { color: 0x0a1a2a, density: 0.03 },
    ambient: { color: 0x4a6a80, intensity: 0.88 },
    background: 0x0a1726,
    name: "warren",
  };
}

export function buildFloodedMaze() {
  const maze = makeMaze({ n: 8, cell: 2.9, wallColor: 0x24505a, floorColor: 0x122a30, lightColor: 0x66d6c4, water: true, accentColor: 0xffb35a });
  const { group, colliders } = maze;
  const path = maze.path.length ? maze.path : [maze.start, maze.end];
  const visionCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.54))];
  const crawlerCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.76))];
  const noteCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.3))];
  const medCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.44))];
  const sightingCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.86))];
  const valveCells = maze.deadEnds
    .filter((c) => c.distanceTo(maze.start) > 1 && c.distanceTo(maze.end) > 1)
    .slice(0, 3);
  const cellPick = mazePickCells(maze, 14, [maze.start, maze.end, ...valveCells, visionCell, crawlerCell, noteCell, medCell, sightingCell]);
  while (valveCells.length < 3) valveCells.push(cellPick.pop());
  const valves = valveCells.map((c) => valve(group, c.x, c.z));
  const exit = door(group, maze.end.x, maze.end.z, "HATCH 06", mazeDoorYaw(maze));
  const bodies = cellPick.slice(0, 2).map((c, i) => ({ group: body(group, c.x, c.z, i * 1.1), loot: i === 0 ? { mgr: 7, ammo: 8 } : { mgr: 4, medkit: 1 } }));
  const noteObj = note(group, noteCell.x, noteCell.z, "LOG 10: The water came up in the dark. Something came with it.");
  const med = pickup(group, medCell.x, medCell.z, "medkit");
  const enemies = cellPick.filter((c) => c.distanceTo(maze.start) > 4.2).slice(0, 5).map((c) => ratEnemy(group, c.x, c.z));
  const scavCell = maze.center(maze.n - 2, maze.n - 2);
  enemies.push(scavengerEnemy(group, scavCell.x + 0.45, scavCell.z + 0.45, Math.PI));
  const crawler = crawlerAt(group, crawlerCell.x, crawlerCell.z, Math.random() * Math.PI * 2);
  const sighting = makeTenant(2.45);
  sighting.position.set(sightingCell.x, 0, sightingCell.z);
  sighting.rotation.y = Math.PI;
  group.add(sighting);
  decorateMazeStory(maze, ["SUMP 06", "NO DIVING", "DANGER"]);

  return {
    group,
    colliders,
    refs: { exit, crawler, sightings: [sighting], flickerLights: maze.flickerLights, motes: maze.motes },
    spawn: maze.start.clone(),
    spawnYaw: maze.startYaw,
    bounds: { minX: -maze.half + 0.8, maxX: maze.half - 0.8, minZ: -maze.half + 0.8, maxZ: maze.half - 0.8 },
    enemies,
    interactables: [
      ...valves.map((v, i) => ({ kind: "valve", pos: v.pos, radius: 1.7, index: i, group: v.group, wheel: v.wheel })),
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE HATCH", next: "fan", requirement: "valves", required: 3 },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map((b) => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [
      { kind: "crawler", pos: crawlerCell.clone(), radius: 1.9, crawler, once: true },
      { kind: "vision", pos: visionCell.clone(), radius: 2.0, visionId: 5, once: true },
    ],
    fog: { color: 0x0a2230, density: 0.036 },
    ambient: { color: 0x4a7a88, intensity: 0.9 },
    background: 0x081a24,
    name: "flooded",
  };
}

export function buildLairMaze() {
  const maze = makeMaze({ n: 7, cell: 3.1, wallColor: 0x5a3428, floorColor: 0x2a1814, lightColor: 0xffa04a, accentColor: 0xffd166 });
  const { group, colliders } = maze;
  const path = maze.path.length ? maze.path : [maze.start, maze.end];
  const visionCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.5))];
  const crawlerCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.7))];
  const noteCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.31))];
  const medCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.45))];
  const sightingCell = path[Math.min(path.length - 2, Math.floor(path.length * 0.86))];
  const valveCells = maze.deadEnds
    .filter((c) => c.distanceTo(maze.start) > 1 && c.distanceTo(maze.end) > 1)
    .slice(0, 3);
  const cellPick = mazePickCells(maze, 14, [maze.start, maze.end, ...valveCells, visionCell, crawlerCell, noteCell, medCell, sightingCell]);
  while (valveCells.length < 3) valveCells.push(cellPick.pop());
  const valves = valveCells.map((c) => valve(group, c.x, c.z));
  const exit = door(group, maze.end.x, maze.end.z, "NEST 00", mazeDoorYaw(maze));
  const bodies = cellPick.slice(0, 3).map((c, i) => ({ group: body(group, c.x, c.z, i * 1.2), loot: i === 0 ? { mgr: 10, ammo: 10, log: true } : { mgr: 5, medkit: 1 } }));
  const noteObj = note(group, noteCell.x, noteCell.z, "LOG 13: The nest was here before the station.");
  const med = pickup(group, medCell.x, medCell.z, "medkit");
  const watchers = [];
  for (let i = 0; i < 7; i++) {
    const c = maze.center(Math.min(maze.n - 1, 4 + (i % 2)), Math.min(maze.n - 1, 2 + Math.floor(i / 2)));
    const t = makeTenant(2.4);
    t.position.set(c.x + (i % 2 ? 0.7 : -0.7), 0, c.z);
    t.rotation.y = 0;
    group.add(t);
    watchers.push(t);
  }
  const enemies = cellPick.filter((c) => c.distanceTo(maze.start) > 4.2).slice(0, 5).map((c) => ratEnemy(group, c.x, c.z));
  const scavCell = maze.center(maze.n - 2, maze.n - 2);
  enemies.push(scavengerEnemy(group, scavCell.x + 0.45, scavCell.z + 0.45, Math.PI));
  const crawler = crawlerAt(group, crawlerCell.x, crawlerCell.z, Math.random() * Math.PI * 2);
  const sighting = makeTenant(2.45);
  sighting.position.set(sightingCell.x, 0, sightingCell.z);
  sighting.rotation.y = Math.PI;
  group.add(sighting);
  decorateMazeStory(maze, ["NEST 00", "TURN BACK", "NO AIR"]);

  return {
    group,
    colliders,
    refs: { exit, crawler, watchers, sightings: [sighting], flickerLights: maze.flickerLights, motes: maze.motes },
    spawn: maze.start.clone(),
    spawnYaw: maze.startYaw,
    bounds: { minX: -maze.half + 0.8, maxX: maze.half - 0.8, minZ: -maze.half + 0.8, maxZ: maze.half - 0.8 },
    enemies,
    interactables: [
      ...valves.map((v, i) => ({ kind: "valve", pos: v.pos, radius: 1.7, index: i, group: v.group, wheel: v.wheel })),
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE LAST DOOR", next: "last_crawl", requirement: "valves", required: 3 },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map((b) => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [
      { kind: "crawler", pos: crawlerCell.clone(), radius: 1.9, crawler, once: true },
      { kind: "vision", pos: visionCell.clone(), radius: 2.0, visionId: 7, once: true },
    ],
    fog: { color: 0x2a1208, density: 0.032 },
    ambient: { color: 0x8a5a42, intensity: 0.9 },
    background: 0x200a04,
    name: "lair",
  };
}
