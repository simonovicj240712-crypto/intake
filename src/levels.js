import * as THREE from "three";
import {
  box,
  cyl,
  sphere,
  plane,
  mat,
  basic,
  surfaceTexture,
  addGlow,
  pointLight,
  makeHumanoid,
  makeRat,
  makeTenant,
  makeCrawler,
  makeScavenger,
} from "./world.js?v=8";

function vec(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

function ventShell({ w = 12, d = 14, h = 3.2, floor = 0x242b27, wall = 0x29322d, ceiling = 0x131918 } = {}) {
  const group = new THREE.Group();
  const colliders = [];
  const floorMat = new THREE.MeshLambertMaterial({
    color: floor,
    map: surfaceTexture("concrete", { repeat: [4, 4] }),
    flatShading: true,
  });
  const wallMat = new THREE.MeshLambertMaterial({
    color: wall,
    map: surfaceTexture("metal", { repeat: [3, 1] }),
    flatShading: true,
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
    cyl(0.055, 0.055, zSpan, 6, 0x3a4641, x - 0.10 + i * 0.10, y - (i % 2) * 0.12, 0, group, { rotX: Math.PI / 2 });
  }
}

function emergencyLamps(group, count, zStart, zStep, x = 0, color = 0x7fa36a, intensity = 0.8) {
  for (let i = 0; i < count; i++) {
    const z = zStart - i * zStep;
    box(0.18, 0.06, 0.3, color, x, 2.2, z, group, { material: basic(color) });
    pointLight(color, intensity, 5, x, 2.0, z, group, { decay: 1.6 });
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
  // stencilled label
  plane(0.92, 0.46, 0xffffff, 0, 2.36, 0.22, g, { material: signMaterial(label, "#d8c9a3") });
  // status lamp
  box(0.1, 0.1, 0.06, 0xb33a24, 0, 2.06, 0.2, g, { material: basic(0xb33a24) });
  addGlow(g, 0xb33a24, 0, 2.06, 0.25, 0.38, 0.3);
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  group.add(g);
  pointLight(0x8fb06a, 1.6, 5.5, x, 1.9, z, group, { decay: 1.5 });
  return { group: g, pos: new THREE.Vector3(x, 0, z), label };
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
    health: opts.health ?? (type === "rat" ? 30 : type === "scavenger" ? 60 : 80),
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
  const r = makeRat({ scale: 0.8 });
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
  const groundMat = new THREE.MeshLambertMaterial({
    color: 0x2a2c27,
    map: surfaceTexture("concrete", { repeat: [12, 10] }),
    flatShading: true,
  });
  const wallMat = new THREE.MeshLambertMaterial({
    color: 0x2b332e,
    map: surfaceTexture("metal", { repeat: [8, 2] }),
    flatShading: true,
  });
  const carMat = new THREE.MeshLambertMaterial({
    color: 0x40504a,
    map: surfaceTexture("metal", { repeat: [4, 2] }),
    flatShading: true,
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
  // gate
  const gate = door(group, 0, -9.6, "GATE");
  for (let i = 0; i < 8; i++) box(0.06, 2.2, 0.1, 0x55605a, -1.2 + i * 0.34, 1.1, -9.48, group);
  // lights
  for (const [x, z] of [[-7, 5], [6, 2], [0, -5]]) {
    pointLight(0x8aa4a2, 2.2, 9, x, 3.4, z, group, { decay: 1.5 });
    box(0.14, 0.05, 0.4, 0x8fb2ae, x, 3.55, z, group, { material: basic(0x8fb2ae) });
    addGlow(group, 0x9ac2bc, x, 3.55, z, 1.2, 0.28);
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
    new THREE.MeshBasicMaterial({ color: 0xb9c7b6, transparent: true, opacity: 0.7, fog: false })
  );
  moon.position.set(13, 15, -34);
  moon.lookAt(0, 1.6, 9);
  group.add(moon);
  // broken overhead cables
  for (let i = 0; i < 4; i++) {
    const x = -10 + i * 6.5;
    cyl(0.012, 0.012, 10, 4, 0x1a211e, x, 5.1, 2, group, { rotX: 0.2, rotZ: 0.05 });
  }
  emergencyLamps(group, 3, 6, 4, -11, 0x7fa36a, 0.7);

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
    fog: { color: 0x0a1513, density: 0.028 },
    ambient: { color: 0x5a6e64, intensity: 0.68 },
    background: 0x050a09,
  };
}

export function buildZarya() {
  const group = new THREE.Group();
  const colliders = [];
  const w = 14, d = 13;
  const floorMat = new THREE.MeshLambertMaterial({
    color: 0x6a4a30,
    map: surfaceTexture("wood", { repeat: [6, 6] }),
    flatShading: true,
  });
  const wallMat = new THREE.MeshLambertMaterial({
    color: 0x44564e,
    map: surfaceTexture("tile", { repeat: [6, 3] }),
    flatShading: true,
  });
  const counterMat = new THREE.MeshLambertMaterial({
    color: 0x8a5a34,
    map: surfaceTexture("wood", { repeat: [4, 1] }),
    flatShading: true,
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
  plane(3.0, 1.0, 0xffffff, 0, 3.05, -6.4, group, { material: signMaterial("ZARYA", "#d8b06a") });
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
  const tarp = new THREE.MeshLambertMaterial({ color: 0x4a3f30, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  for (const [x, z] of [[-6.3, 0.4], [6.2, 2.2]]) {
    plane(2.2, 1.5, 0xffffff, x, 2.5, z, group, { rotY: x < 0 ? Math.PI / 2 : -Math.PI / 2, material: tarp });
  }
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
  pointLight(0xffc078, 4.5, 5, 0, 1.8, 2.0, group, { decay: 1.3 });

  // exit vent
  const exit = door(group, 0, -5.7, "VENT");
  const noteObj = note(group, -4.8, 4.2, "LOG 08: Zarya sells everything. Even the air.");
  const med = pickup(group, 4.5, 4.4, "medkit");

  return {
    group,
    colliders,
    refs: { vera, exit },
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
    ambient: { color: 0xb08a60, intensity: 1.0 },
    background: 0x050605,
  };
}

function basicVentLevel({ name, w = 12, d = 14, spawnZ = 5.5, exitZ = -5.8, color = 0x7fa36a, intensity = 0.8 } = {}) {
  const { group, colliders } = ventShell({ w, d, floor: 0x242b27, wall: 0x29322d });
  pipes(group, d - 1.5, 0, 2.8);
  emergencyLamps(group, 4, spawnZ - 1, 3.8, 0, color, intensity);
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
  const base = basicVentLevel({ w: 16, d: 18, spawnZ: 7.2, exitZ: -7.8, color: 0x8fa36a, intensity: 0.8 });
  const { group, colliders, exit } = base;
  // fan housing at center / far
  const fan = new THREE.Group();
  cyl(0.6, 0.6, 1.2, 10, 0x3b4641, 0, 2.0, 0, fan, { rotX: Math.PI / 2 });
  for (let i = 0; i < 5; i++) {
    box(0.24, 2.4, 0.1, 0x8a958c, 0, 2.0, 0, fan, { rotZ: (Math.PI / 5) * i });
  }
  fan.position.set(0, 0, -4.2);
  group.add(fan);
  const consoleBox = new THREE.Group();
  box(1.2, 1.0, 0.7, 0x303a34, 0, 0.5, 0, consoleBox);
  box(0.6, 0.25, 0.06, 0x8fbf7a, 0, 0.85, 0.38, consoleBox, { material: basic(0x8fbf7a) });
  consoleBox.position.set(4.8, 0, -2.6);
  group.add(consoleBox);
  pointLight(0x7fa36a, 1.4, 5, 4.8, 1.5, -2.6, group, { decay: 1.5 });
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
      { kind: "console", pos: consoleBox.position.clone().add(vec(0, 0, 0.7)), radius: 2.2, prompt: "E — START THE FAN" },
      { kind: "door", pos: exit.pos, radius: 2.2, prompt: "E — OPEN THE HATCH", next: "safe_room", requirement: "console" },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      ...bodies.map(b => ({ kind: "body", pos: b.group.position.clone(), radius: 1.8, loot: b.loot, group: b.group, looted: false })),
    ],
    triggers: [{ kind: "crawler", pos: vec(0, 0, -3.4), radius: 2.0, crawler, once: true }],
    fog: { color: 0x07100a, density: 0.055 },
    ambient: { color: 0x4b5a44, intensity: 0.55 },
    background: 0x030504,
    name: "fan",
  };
}

export function buildSafeRoom() {
  const { group, colliders } = ventShell({ w: 8, d: 8, h: 3.0, floor: 0x26231d, wall: 0x2b302a, ceiling: 0x171b18 });
  const lamp = pointLight(0xffb36a, 5, 7, 0, 2.3, 0, group, { decay: 1.4 });
  box(0.3, 0.4, 2.6, 0x3f2e20, 0, 0.2, -2.4, group);
  box(0.8, 0.15, 1.4, 0x5b4029, 0, 0.5, -1.8, group);
  box(1.4, 1.9, 0.4, 0x303a34, -2.8, 0.95, -1.0, group);
  box(0.5, 0.4, 0.12, 0x8fbf7a, -2.6, 1.5, -0.79, group, { material: basic(0x8fbf7a) });
  const radio = new THREE.Group();
  box(0.7, 0.4, 0.4, 0x2a302c, 0, 0.3, 0, radio);
  box(0.3, 0.15, 0.03, 0x8fbf7a, 0, 0.35, 0.21, radio, { material: basic(0x8fbf7a) });
  radio.position.set(1.4, 0, -1.8);
  group.add(radio);
  const exit = door(group, 0, 3.7, "VENT");
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
      { kind: "radio", pos: radio.position.clone(), radius: 1.8, prompt: "E — USE THE RADIO" },
      { kind: "exit", pos: exit.pos, radius: 2.0, prompt: "E — KEEP GOING", next: "lair" },
      { kind: "pickup", pos: med.pos, radius: 1.5, item: "medkit", group: med.group },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
    ],
    triggers: [
      { kind: "vision", pos: vec(0, 0, 0.4), radius: 1.8, visionId: 6, once: true },
    ],
    fog: { color: 0x0b0a07, density: 0.035 },
    ambient: { color: 0xb08a60, intensity: 0.9 },
    background: 0x050403,
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
  // force a crawl space with a low visual beam
  box(2.4, 0.16, 19, 0x171d1a, 0, 1.05, 0, group);
  pipes(group, 19, 0, 1.85);
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
    fog: { color: 0x04100c, density: 0.1 },
    ambient: { color: 0x4a5a50, intensity: 0.42 },
    background: 0x020404,
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
  // rows of tall figures facing the entrance
  const tenants = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8; i++) {
      const t = makeTenant(2.45);
      t.position.set(-8.4 + i * 2.4, 0, -1.5 - row * 2.4);
      t.rotation.y = 0;
      t.visible = true;
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
    pointLight(color, 3.4, 9, x, 3.0, z, group, { decay: 1.3 });
    box(0.2, 0.06, 0.4, color, x, 3.2, z, group, { material: basic(color) });
    addGlow(group, color, x, 3.2, z, 0.9, 0.24);
  }
  box(0.2, 3.0, 3.0, 0x111010, 0, 1.5, 8.4, group);
  const exitLight = pointLight(0x9bc17a, 0.9, 4, 0, 1.6, 7.8, group, { decay: 1.6 });

  return {
    group,
    colliders,
    refs: { tenants },
    spawn: vec(0, 0, 7.4),
    bounds: { minX: -10.2, maxX: 10.2, minZ: -8.2, maxZ: 8.2 },
    enemies: [],
    interactables: [],
    triggers: [{ kind: "nest", pos: vec(0, 0, 3.6), radius: 2.4, once: true }],
    fog: { color: 0x060403, density: 0.035 },
    ambient: { color: 0x8a7058, intensity: 0.72 },
    background: 0x020202,
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
      cyl(0.05, 0.05, 42, 6, 0x4a5650, side * (3.13 + i * 0.02), 2.72 - i * 0.09, 0, group, { rotX: Math.PI / 2 });
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

function makeMaze({ n = 8, cell = 2.9, wallColor = 0x29322d, floorColor = 0x242b27, height = 2.9, water = false, lightColor = 0x7fa36a } = {}) {
  const group = new THREE.Group();
  const colliders = [];
  const size = n * cell;
  const half = size / 2;
  const trimColor = mixColor(wallColor, 0x111815, 0.34);
  const ribColor = mixColor(wallColor, 0xa4b3a6, 0.14);
  const beamColor = mixColor(wallColor, 0x0b100e, 0.42);
  const wallMat = new THREE.MeshLambertMaterial({
    color: wallColor,
    map: surfaceTexture("metal", { repeat: [2, 1] }),
    flatShading: true,
  });
  const floorMat = new THREE.MeshLambertMaterial({
    color: floorColor,
    map: surfaceTexture("concrete", { repeat: [6, 6] }),
    flatShading: true,
  });
  const ceilMat = new THREE.MeshLambertMaterial({
    color: 0x111716,
    map: surfaceTexture("metal", { repeat: [6, 6] }),
    flatShading: true,
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
          box(0.08, 0.1, cell, trimColor, x, 0.05, c.z, group);
          box(0.3, 0.1, cell, beamColor, x, height - 0.16, c.z, group);
          if (Math.random() < 0.34) {
            cyl(0.035, 0.035, cell, 6, 0x4a5650, x + 0.12, 0.56, c.z, group, { rotX: Math.PI / 2 });
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
          box(cell, 0.1, 0.08, trimColor, c.x, 0.05, z, group);
          box(cell, 0.1, 0.3, beamColor, c.x, height - 0.16, z, group);
          if (Math.random() < 0.34) {
            cyl(0.035, 0.035, cell, 6, 0x4a5650, c.x, 0.56, z + 0.12, group, { rotZ: Math.PI / 2 });
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

  // face down the guaranteed entrance corridor
  const startYaw = entranceYaw;

  // light fixtures: bright core, dark bracket, some flicker
  const flickerLights = [];
  for (let i = 0; i < n; i += 2) {
    for (let j = 0; j < n; j += 2) {
      const c = center(i, j);
      box(0.5, 0.04, 0.22, 0x1b221f, c.x, height - 0.3, c.z, group);
      box(0.44, 0.045, 0.16, 0x0b0f0d, c.x, height - 0.27, c.z, group);
      box(0.36, 0.035, 0.1, lightColor, c.x, height - 0.25, c.z, group, { material: basic(lightColor) });
      addGlow(group, lightColor, c.x, height - 0.25, c.z, 0.9, 0.3);
      if ((i + j) % 4 === 0) {
        const light = pointLight(lightColor, 2.4, 7.4, c.x, height - 0.48, c.z, group, { decay: 1.5 });
        if (Math.random() < 0.32) {
          flickerLights.push({ light, base: 2.4, phase: Math.random() * 20, speed: 5 + Math.random() * 7 });
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
  const grateMat = new THREE.MeshLambertMaterial({ map: grateTexture(), color: 0xffffff });
  for (let k = 0; k < Math.floor(n * 1.4); k++) {
    const iCell = Math.floor(Math.random() * n);
    const jCell = Math.floor(Math.random() * n);
    const c = center(iCell, jCell);
    plane(1.15, 0.85, 0xffffff, c.x + (Math.random() - 0.5) * 0.5, 0.012, c.z + (Math.random() - 0.5) * 0.5,
      group, { rotX: -Math.PI / 2, material: grateMat });
  }
  const drainMat = new THREE.MeshLambertMaterial({ color: 0x111614 });
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
    cyl(0.055, 0.055, cell * 0.9, 6, 0x46524b,
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
  ctx.fillStyle = fg;
  ctx.font = "bold 40px Arial Narrow, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 64);
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
function crateMaterial() {
  if (!_crateMat) {
    _crateMat = new THREE.MeshLambertMaterial({
      color: 0x8a6339,
      map: surfaceTexture("wood", { repeat: [1, 1] }),
      flatShading: true,
    });
  }
  return _crateMat;
}
function barrelMaterial() {
  if (!_barrelMat) {
    _barrelMat = new THREE.MeshLambertMaterial({
      color: 0x6a4a2a,
      map: surfaceTexture("metal", { repeat: [1, 1] }),
      flatShading: true,
    });
  }
  return _barrelMat;
}

function addCrate(group, colliders, x, z, s = 0.65) {
  box(s, s, s, 0x4a3a28, x, s / 2, z, group, { rotY: Math.random() * 0.5, material: crateMaterial() });
  box(s * 0.86, s * 0.08, s * 1.02, 0x2f251a, x, s * 0.75, z, group, { rotY: Math.random() * 0.1 });
  box(s * 0.86, s * 0.1, s * 0.08, 0x2f251a, x, s * 0.5, z + s / 2, group);
  colliders.push({ minX: x - s / 2, maxX: x + s / 2, minZ: z - s / 2, maxZ: z + s / 2 });
}

function addBarrel(group, colliders, x, z) {
  cyl(0.3, 0.3, 0.82, 8, 0x5a4328, x, 0.41, z, group, { material: barrelMaterial() });
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
  const maze = makeMaze({ n: 8, cell: 2.9, wallColor: 0x2c352f, floorColor: 0x242b27, lightColor: 0x8fb56a });
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
    fog: { color: 0x07130e, density: 0.045 },
    ambient: { color: 0x60766a, intensity: 0.72 },
    background: 0x020404,
    name: "warren",
  };
}

export function buildFloodedMaze() {
  const maze = makeMaze({ n: 8, cell: 2.9, wallColor: 0x2b3a34, floorColor: 0x1e2824, lightColor: 0x7fc4a2, water: true });
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
    fog: { color: 0x06120e, density: 0.05 },
    ambient: { color: 0x526e64, intensity: 0.76 },
    background: 0x020404,
    name: "flooded",
  };
}

export function buildLairMaze() {
  const maze = makeMaze({ n: 7, cell: 3.1, wallColor: 0x3a2b22, floorColor: 0x2a211b, lightColor: 0xc58a58 });
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
    fog: { color: 0x0d0705, density: 0.045 },
    ambient: { color: 0x8a6248, intensity: 0.8 },
    background: 0x030202,
    name: "lair",
  };
}
