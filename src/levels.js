import * as THREE from "three";
import {
  box,
  cyl,
  sphere,
  plane,
  mat,
  basic,
  pointLight,
  makeHumanoid,
  makeRat,
  makeTenant,
  makeCrawler,
  makeScavenger,
} from "./world.js";

function vec(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

function ventShell({ w = 12, d = 14, h = 3.2, floor = 0x242b27, wall = 0x29322d, ceiling = 0x131918 } = {}) {
  const group = new THREE.Group();
  const colliders = [];
  box(w, 0.2, d, floor, 0, -0.1, 0, group);
  box(w, 0.16, d, ceiling, 0, h, 0, group);
  box(0.2, h, d, wall, -w / 2, h / 2, 0, group);
  box(0.2, h, d, wall, w / 2, h / 2, 0, group);
  box(w, h, 0.2, wall, 0, h / 2, -d / 2, group);
  box(w, h, 0.2, wall, 0, h / 2, d / 2, group);
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

function door(group, x, z, label = "VENT") {
  const g = new THREE.Group();
  box(2.0, 2.2, 0.16, 0x2f3833, 0, 1.1, 0, g);
  for (let i = 0; i < 6; i++) {
    box(1.7, 0.06, 0.04, 0x111614, 0, 0.2 + i * 0.34, 0.11, g);
  }
  box(0.18, 0.08, 0.05, 0x9e4a2a, 0.65, 1.05, 0.14, g);
  g.position.set(x, 0, z);
  group.add(g);
  pointLight(0x8fb06a, 0.7, 4, x, 1.3, z + 0.5, group, { decay: 1.7 });
  return { group: g, pos: g.position.clone(), label };
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
    timer: 0,
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
  box(w, 0.2, d, 0x1b1c19, 0, -0.1, 0, group);
  // ruined perimeter
  for (const side of [-1, 1]) {
    box(0.4, 3.5, d, 0x1d2421, side * (w / 2), 1.75, 0, group);
    colliders.push({ minX: side * (w / 2) - 0.25, maxX: side * (w / 2) + 0.25, minZ: -d / 2, maxZ: d / 2 });
    box(w, 3.5, 0.4, 0x1d2421, 0, 1.75, side * (d / 2), group);
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
    box(7.2, 2.5, 2.5, 0x2e3935, 0, 1.3, 0, car);
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
    fog: { color: 0x08100f, density: 0.035 },
    ambient: { color: 0x52645b, intensity: 0.62 },
    background: 0x030606,
  };
}

export function buildZarya() {
  const group = new THREE.Group();
  const colliders = [];
  const w = 14, d = 13;
  box(w, 0.2, d, 0x211d18, 0, -0.1, 0, group);
  box(w, 4.2, 0.2, 0x1d2a26, 0, 2.1, -d / 2, group);
  box(w, 4.2, 0.2, 0x1d2a26, 0, 2.1, d / 2, group);
  box(0.2, 4.2, d, 0x1b2824, -w / 2, 2.1, 0, group);
  box(0.2, 4.2, d, 0x1b2824, w / 2, 2.1, 0, group);
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
  }
  pointLight(0xffb070, 10, 18, 0, 3.4, 0, group, { decay: 1.1 });

  // counter / Vera
  box(3.4, 0.9, 0.8, 0x3f2e20, 0, 0.45, 1.3, group);
  box(3.6, 0.1, 1.0, 0x5b4029, 0, 0.92, 1.3, group);
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
      { kind: "vision", pos: vec(0, 0, -1.2), radius: 2.2, visionId: 6, once: true },
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
  const exit = door(group, 0, -9.4, "SANCTUARY INTAKE");
  for (let i = 0; i < 6; i++) {
    box(0.3 + Math.random() * 0.3, 0.06, 0.2 + Math.random() * 0.2, 0x3c3225, (Math.random() - 0.5) * 1.6, 0.06, -6 + i * 2.2, group, { rotY: Math.random() * 3 });
  }
  const noteObj = note(group, -0.8, -6.4, "LOG 14: Sanctuary is safe. Say it back.");

  return {
    group,
    colliders,
    refs: { exit },
    spawn: vec(0, 0, 8.5),
    bounds: { minX: -1.2, maxX: 1.2, minZ: -9.2, maxZ: 9.2 },
    enemies: [],
    interactables: [
      { kind: "exit", pos: exit.pos, radius: 2.4, prompt: "E — OPEN THE LAST VENT", next: "nest" },
      { kind: "note", pos: noteObj.pos, radius: 1.5, text: noteObj.text, group: noteObj.group },
    ],
    triggers: [],
    fog: { color: 0x04100c, density: 0.09 },
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
  for (const [x, z, color] of [[-7, 2, 0x8a3a25], [7, 2, 0x8a3a25], [0, -7, 0x7fa36a], [0, 5, 0x7fa36a]]) {
    pointLight(color, 3.4, 9, x, 3.0, z, group, { decay: 1.3 });
    box(0.2, 0.06, 0.4, color, x, 3.2, z, group, { material: basic(color) });
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
