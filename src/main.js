import * as THREE from "three";
import { AudioEngine } from "./audio.js?v=34";
import { UI } from "./ui.js?v=34";
import {
  buildDiningRoom,
  buildCrawlspace,
  buildPrologueBunker,
  buildCarRide,
  buildKryl,
  buildVent,
  makePistol,
  makeShotgun,
  makeRifle,
  makeCrawler,
  toonMat,
  addGlow,
  glowTexture,
} from "./world.js?v=34";
import {
  buildDeadRail,
  buildZarya,
  buildWarren,
  buildFlooded,
  buildFan,
  buildSafeRoom,
  buildLair,
  buildLastCrawl,
  buildNest,
  buildVisionScene,
  buildTitleScene,
  buildWarrenMaze,
  buildFloodedMaze,
  buildLairMaze,
} from "./levels.js?v=34";

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.55;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030505);

const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.06, 90);
camera.rotation.order = "YXZ";
scene.add(camera);

const ambient = new THREE.AmbientLight(0x33423a, 0.45);
scene.add(ambient);

const flashTarget = new THREE.Object3D();
flashTarget.position.set(0, 0, -1);
camera.add(flashTarget);
const flashlight = new THREE.SpotLight(0xffd9a6, 0, 26, Math.PI * 0.33, 0.5, 0.35);
flashlight.position.set(0.08, -0.05, 0);
flashlight.target = flashTarget;
camera.add(flashlight);
flashTarget.position.set(0, -0.35, -1);

const headlamp = new THREE.PointLight(0xffd9a6, 0, 7, 1.5);
headlamp.position.set(0.08, 0.02, 0);
camera.add(headlamp);

const weapon = new THREE.Group();
weapon.position.set(0.34, -0.38, -0.82);
weapon.rotation.set(0.02, -0.22, -0.02);
weapon.scale.setScalar(0.45);
const weaponModels = {
  pistol: makePistol(),
  shotgun: makeShotgun(),
  rifle: makeRifle(),
};
for (const model of Object.values(weaponModels)) {
  model.visible = false;
  weapon.add(model);
}
weaponModels.pistol.visible = true;
const glove = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.14, 0.24),
  toonMat(0x202723)
);
glove.position.set(-0.04, -0.11, 0.13);
glove.rotation.x = -0.18;
weapon.add(glove);
weapon.visible = false;
camera.add(weapon);

const muzzle = new THREE.PointLight(0xffd49a, 0, 5, 2);
muzzle.position.set(0.31, -0.18, -0.98);
camera.add(muzzle);

const audio = new AudioEngine();
const ui = new UI();
const clock = new THREE.Clock();
const keys = new Set();
const raycaster = new THREE.Raycaster();

let state = "title";
let world = null;
let worldGroup = null;
let prologue = null;
let kryl = null;
let vent = null;
let jumpscare = null;
let level = null;
let levelId = null;
let vision = null;
let ending = null;
let titleScene = null;
let titleElapsed = 0;
let ambientCrawler = null;
let shopOpen = false;
let logsFound = 0;
let dialogueOpen = false;
let bodyLooted = false;
let mgr = 0;
let weaponKick = 0;
let gunshotWarned = false;
let shake = { time: 0, intensity: 0 };
let debugMode = false;
const collectBursts = [];

const WEAPONS = {
  pistol: { name: "PM pistol", cap: 8, damage: 26, spread: 0.006, pellets: 1, cooldown: 0.22 },
  shotgun: { name: "Sawed-off", cap: 2, damage: 12, spread: 0.055, pellets: 6, cooldown: 0.55 },
  rifle: { name: "Bolt rifle", cap: 5, damage: 72, spread: 0.0015, pellets: 1, cooldown: 0.78 },
};

const player = {
  pos: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  height: 1.65,
  crouched: false,
  forcedCrawl: false,
  flashlightOn: false,
  stamina: 1,
  bobTime: 0,
  stepTimer: 0,
  ammo: 8,
  hasGun: false,
  frozen: false,
  health: 100,
  medkits: 1,
  weapon: "pistol",
  aiming: false,
  mags: { pistol: 8, shotgun: 0, rifle: 0 },
  reserve: { pistol: 16, shotgun: 0, rifle: 0 },
  owned: { pistol: true, shotgun: false, rifle: false },
  fireCooldown: 0,
};

const LEVEL_BUILDERS = {
  dead_rail: buildDeadRail,
  zarya: buildZarya,
  warren: buildWarrenMaze,
  flooded: buildFloodedMaze,
  fan: buildFan,
  safe_room: buildSafeRoom,
  lair: buildLairMaze,
  last_crawl: buildLastCrawl,
  nest: buildNest,
};

const LEVEL_INFO = {
  dead_rail: { chapter: "CHAPTER II", title: "THE DEAD RAIL", sub: "The surface between Kryl and Zarya" },
  zarya: { chapter: "CHAPTER II", title: "ZARYA STATION", sub: "Everything has a price" },
  warren: { chapter: "CHAPTER II", title: "THE WARREN", sub: "The vents get older from here" },
  flooded: { chapter: "CHAPTER II", title: "THE FLOODED DUCT", sub: "The water is moving" },
  fan: { chapter: "CHAPTER II", title: "THE DEAD FAN", sub: "Keep the air moving" },
  safe_room: { chapter: "CHAPTER II", title: "SAFE ROOM", sub: "One breath before the dark" },
  lair: { chapter: "CHAPTER III", title: "THE LAIR", sub: "The nest was here first" },
  last_crawl: { chapter: "CHAPTER III", title: "THE LAST CRAWL", sub: "Sanctuary intake 04" },
  nest: { chapter: "CHAPTER III", title: "THE NEST", sub: "The safest city known to man" },
};

const VISIONS = {
  2: { kicker: "THE PASSENGER CAR", duration: 16, lines: [
    "The carriage is full. Every seat. Every face.",
    "They are all wearing your coat.",
    "The train has not moved in years.",
  ]},
  3: { kicker: "THE TABLE", duration: 16, lines: [
    "You are on the table. The lights are very bright.",
    "Someone is writing your name on a clipboard.",
    "The Tenant is holding the pen.",
  ]},
  4: { kicker: "THE BIRTH", duration: 18, lines: [
    "The vent opens. Something climbs out.",
    "It has too many joints. It has your voice.",
    "It asks you to come closer.",
  ]},
  5: { kicker: "THE DROWNED", duration: 16, lines: [
    "The water is clear around one body.",
    "It is you. It has always been you.",
    "The others are still waiting for the air.",
  ]},
  6: { kicker: "THE GUEST", duration: 16, lines: [
    "The safe room is exactly the same.",
    "The Tenant is sitting in your chair.",
    "It asks how you died.",
  ]},
  7: { kicker: "THE MIRROR", duration: 18, lines: [
    "Every reflection is a different death.",
    "In one, you never left the dinner table.",
    "The Tenant is behind you in all of them.",
  ]},
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const distXZ = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * clamp(t, 0, 1);
}

function applyLook() {
  camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
}

function lookYawTo(target) {
  const dir = target.clone().sub(camera.position).normalize();
  return Math.atan2(-dir.x, -dir.z);
}

function lookPitchTo(target) {
  const dir = target.clone().sub(camera.position).normalize();
  return Math.asin(clamp(dir.y, -1, 1));
}

function lookDot(target) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const to = target.clone().sub(camera.position).normalize();
  return dir.dot(to);
}

function addShake(intensity, time) {
  shake.intensity = Math.max(shake.intensity, intensity);
  shake.time = Math.max(shake.time, time);
}

function setFog(color, density) {
  scene.fog = new THREE.FogExp2(color, density);
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
  });
}

function loadWorld(result) {
  if (worldGroup) {
    scene.remove(worldGroup);
    disposeGroup(worldGroup);
  }
  world = result;
  worldGroup = result.group;
  scene.add(worldGroup);
  return result;
}

function spawnCollectBurst(pos, color = 0xffd27a, scale = 0.55) {
  if (!worldGroup) return;
  const material = new THREE.SpriteMaterial({
    map: glowTexture(),
    color,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(pos.x, 0.9, pos.z);
  sprite.scale.setScalar(scale);
  worldGroup.add(sprite);
  collectBursts.push({ sprite, t: 0, duration: 0.5, scale });
}

function updateCollectBursts(dt) {
  for (let i = collectBursts.length - 1; i >= 0; i--) {
    const b = collectBursts[i];
    b.t += dt;
    const k = Math.min(1, b.t / b.duration);
    b.sprite.scale.setScalar(b.scale * (1 + k * 2.6));
    b.sprite.material.opacity = 0.95 * (1 - k);
    b.sprite.position.y = 0.9 + k * 0.5;
    if (k >= 1) {
      worldGroup?.remove(b.sprite);
      b.sprite.material.dispose();
      collectBursts.splice(i, 1);
    }
  }
}

function resetCommon() {
  for (const b of collectBursts) b.sprite.material.dispose();
  collectBursts.length = 0;
  audio.stopLoops();
  dialogueOpen = false;
  jumpscare = null;
  vision = null;
  ending = null;
  shopOpen = false;
  if (ambientCrawler) {
    worldGroup?.remove(ambientCrawler.group);
    disposeGroup(ambientCrawler.group);
    ambientCrawler = null;
  }
  player.frozen = false;
  player.flashlightOn = false;
  player.forcedCrawl = false;
  player.aiming = false;
  player.fireCooldown = 0;
  weapon.visible = false;
  flashlight.intensity = 0;
  headlamp.intensity = 0;
  muzzle.intensity = 0;
  weaponKick = 0;
  ui.hideAllOverlays();
  ui.clearSubtitle();
  ui.death(false);
  ui.end(false);
  ui.jumpscare(false);
  ui.hideDialogue();
  ui.shop(false);
  ui.prompt(null);
  ui.crosshair(false);
}

function setWeaponModel(id) {
  for (const key of Object.keys(weaponModels)) weaponModels[key].visible = key === id;
}

function resetProgress() {
  player.health = 100;
  player.medkits = 1;
  player.weapon = "pistol";
  player.ammo = 8;
  player.mags = { pistol: 8, shotgun: 0, rifle: 0 };
  player.reserve = { pistol: 16, shotgun: 0, rifle: 0 };
  player.owned = { pistol: true, shotgun: false, rifle: false };
  player.hasGun = false;
  mgr = 0;
  logsFound = 0;
  bodyLooted = false;
  setWeaponModel("pistol");
}

function hideTitle() {
  ui.showTitle(false);
}

function startTitleScene() {
  if (worldGroup) {
    scene.remove(worldGroup);
    disposeGroup(worldGroup);
  }
  titleScene = buildTitleScene();
  worldGroup = titleScene.group;
  scene.add(worldGroup);
  scene.background.setHex(titleScene.background);
  setFog(titleScene.fog.color, titleScene.fog.density);
  ambient.color.setHex(titleScene.ambient.color);
  ambient.intensity = titleScene.ambient.intensity;
  titleElapsed = 0;
  weapon.visible = false;
  flashlight.intensity = 0;
  headlamp.intensity = 0;
  muzzle.intensity = 0;
  updateTitle(0);
}

function updateTitle(dt) {
  if (!titleScene) return;
  titleElapsed += dt;
  const cam = titleScene.cameraAt(titleElapsed);
  camera.position.copy(cam.pos);
  camera.lookAt(cam.look);
  for (const l of titleScene.refs.lights || []) {
    const pulse = 0.82 + 0.18 * Math.sin(titleElapsed * l.speed + l.phase);
    const blink = Math.sin(titleElapsed * 13 + l.phase) > 0.965 ? 0.18 : 1;
    l.light.intensity = l.base * pulse * blink;
  }
  if (titleScene.refs.red) titleScene.refs.red.intensity = 3.6 + Math.sin(titleElapsed * 2.1) * 0.9;
  if (titleScene.refs.doorway) titleScene.refs.doorway.intensity = 2.6 + Math.sin(titleElapsed * 1.3) * 0.4;
  if (titleScene.refs.tenant) animateTenant(titleScene.refs.tenant, titleElapsed, 1.2);
  if (titleScene.refs.motes) titleScene.refs.motes.rotation.y += dt * 0.012;
}

function lockPointer() {
  try {
    const p = canvas.requestPointerLock?.();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (err) {
    // Pointer lock can be denied by embeds or automation. Mouse look will
    // start on the next direct click on the canvas.
  }
}

document.addEventListener("pointerlockerror", () => {
  updateLookHint();
});

function updateLookHint() {
  const active = ["prologue", "kryl", "vent", "explore"].includes(state);
  const locked = document.pointerLockElement === canvas;
  ui.lookHint(active && !locked && !shopOpen && !dialogueOpen && state !== "dead" && state !== "end");
}

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas) player.aiming = false;
  updateLookHint();
});

function startPrologueLegacy() {
  hideTitle();
  resetCommon();
  resetProgress();
  state = "prologue";
  levelId = null;
  jumpscare = null;
  gunshotWarned = false;
  const res = loadWorld(buildDiningRoom());
  scene.background.setHex(0x060403);
  setFog(0x080604, 0.028);
  ambient.color.setHex(0xb09070);
  ambient.intensity = 0.82;
  camera.position.set(1.4, 1.38, 2.35);
  player.yaw = 0.5;
  player.pitch = -0.14;
  applyLook();
  player.flashlightOn = false;
  flashlight.intensity = 0;
  headlamp.intensity = 0;
  weapon.visible = false;
  ui.crosshair(false);
  audio.setAmbient(0.035);

  prologue = {
    step: "dinner",
    t: 0,
    allowLook: true,
    tenantSeen: false,
    transitioning: false,
  };

  ui.chapter("PROLOGUE", "THE LAST DINNER", "Kryl Station — years before", 2600);
  ui.speak("MOM", "Eat while it's warm.", 2400);
  ui.clearFade();
  return res;
}

function startFlashback() {
  const res = loadWorld(buildDiningRoom({ flashback: true }));
  scene.background.setHex(0x090302);
  setFog(0x0a0403, 0.034);
  ambient.color.setHex(0xb07050);
  ambient.intensity = 0.72;
  camera.position.set(1.4, 1.38, 2.35);
  player.yaw = 0.5;
  player.pitch = -0.13;
  applyLook();
  if (res.refs.sister) res.refs.sister.visible = false;
  if (res.refs.tenant) res.refs.tenant.visible = false;
  if (res.refs.alarm) res.refs.alarm.intensity = 1.6;
  if (res.refs.windowMat) res.refs.windowMat.color.setHex(0x6e2013);
  audio.alarm(5);
  audio.flash();
  ui.flash(220, "#f4dcc0");
  ui.subtitle("The same alarm. Before she was born.", 3200);
  prologue = {
    step: "flashback",
    t: 0,
    allowLook: false,
    exploded: false,
    transitioning: false,
  };
}

function startCrawlspace() {
  const res = loadWorld(buildCrawlspace());
  scene.background.setHex(0x040201);
  setFog(0x080403, 0.06);
  ambient.color.setHex(0x8a6244);
  ambient.intensity = 0.78;
  camera.position.set(0, 0.9, 3.6);
  player.yaw = 0;
  player.pitch = 0.05;
  applyLook();
  if (res.refs.mother) res.refs.mother.visible = false;
  if (res.refs.sister) res.refs.sister.visible = false;
  if (res.refs.tokar) res.refs.tokar.visible = false;
  audio.setAmbient(0.025);
  audio.heartbeat(0.09);
  ui.speak("DAD", "Don't make a sound.", 2600);
  prologue = {
    step: "crawl",
    t: 0,
    allowLook: true,
    gunshot: false,
    transitioning: false,
  };
}

function updatePrologueLegacy(dt) {
  if (!prologue || !world) return;
  const p = prologue;
  const refs = world.refs || {};
  p.t += dt;

  if (p.step === "dinner") {
    camera.position.y = 1.34 + Math.sin(p.t * 1.1) * 0.004;
    applyLook();
    if (p.t > 10) {
      p.step = "alarm";
      p.t = 0;
      audio.alarm(5);
      audio.whisper();
      if (refs.windowMat) refs.windowMat.color.setHex(0x672015);
      if (refs.alarm) refs.alarm.intensity = 1.4;
      ui.subtitle("The alarm goes off. Mom grabs your sister.", 3000);
    }
    return;
  }

  if (p.step === "alarm") {
    if (refs.alarm) refs.alarm.intensity = 1.1 + Math.sin(p.t * 20) * 0.8;
    const k = clamp(p.t / 1.8, 0, 1);
    if (refs.mom) refs.mom.position.set(lerp(-1.15, 3.1, k), 0, lerp(-1.18, 1.15, k));
    if (refs.sister) refs.sister.position.set(lerp(-1.12, 2.9, k), 0, lerp(1.12, 1.35, k));
    if (refs.dad) refs.dad.rotation.y = Math.sin(p.t * 2.2) * 0.08;

    if (p.t > 1.2 && !p.tenantSeen) {
      p.tenantSeen = true;
      if (refs.tenant) refs.tenant.visible = true;
      audio.whisper();
    }
    if (p.t > 2.4) {
      ui.speak("DAD", "Go with your mother. Now.", 2500);
    }

    const tenantPos = new THREE.Vector3(-3.35, 1.8, -3.0);
    const dot = lookDot(tenantPos);
    if (p.t > 2.6 && (dot > 0.9 || p.t > 6.2)) {
      p.step = "tenant";
      p.t = 0;
      p.allowLook = false;
      p.lockYaw = lookYawTo(tenantPos);
      p.lockPitch = lookPitchTo(tenantPos);
      audio.whisper();
      ui.subtitle("It is already looking at you.", 2400);
    }
    applyLook();
    return;
  }

  if (p.step === "tenant") {
    player.yaw = lerpAngle(player.yaw, p.lockYaw, dt * 3.6);
    player.pitch = lerp(player.pitch, p.lockPitch, dt * 3.6);
    applyLook();
    if (p.t > 1.55) startFlashback();
    return;
  }

  if (p.step === "flashback") {
    if (refs.alarm) refs.alarm.intensity = 1.2 + Math.sin(p.t * 22) * 0.8;
    if (refs.mom) refs.mom.position.x = -1.15 + Math.sin(p.t * 2.1) * 0.14;
    if (refs.dad) refs.dad.position.x = 1.15 + Math.sin(p.t * 1.6 + 1) * 0.12;
    if (!p.exploded && p.t > 4.15) {
      p.exploded = true;
      ui.flash(520, "#ffd9a0");
      audio.boom();
      addShake(0.11, 0.9);
      if (refs.windowMat) refs.windowMat.color.setHex(0x130705);
      ui.subtitle("The window breaks. Everyone is shouting.", 2800);
    }
    if (p.t > 8.4) startCrawlspace();
    applyLook();
    return;
  }

  if (p.step === "crawl") {
    if (refs.brood) {
      if (p.t > 2.2 && p.t < 5.4) {
        const k = clamp((p.t - 2.2) / 3.2, 0, 1);
        refs.brood.position.set(lerp(-2.0, 0.35, k), 0, lerp(-2.1, -1.2, k));
        refs.brood.rotation.y = lerp(0.3, -1.35, k);
      }
      if (p.t >= 5.4) {
        refs.brood.position.set(0.05, 0.12, -0.05);
        refs.brood.rotation.y = -Math.PI / 2;
        refs.brood.rotation.z = Math.sin(p.t * 9) * 0.015;
        const target = new THREE.Vector3(0.05, 1.02, 0.9);
        player.yaw = lerpAngle(player.yaw, lookYawTo(target), dt * 2.4);
        player.pitch = lerp(player.pitch, lookPitchTo(target), dt * 2.4);
      }
    }
    if (p.t > 5.7 && !p.sniffed) {
      p.sniffed = true;
      audio.scrape();
      ui.subtitle("It can smell you.", 2300);
    }
    if (p.t > 7.8) {
      if (refs.mother) refs.mother.visible = true;
      if (refs.sister) refs.sister.visible = true;
      if (refs.father) refs.father.visible = false;
      ui.subtitle("It looks at you. It knows.", 2200);
    }
    if (!p.gunshot && p.t > 9.7) {
      p.gunshot = true;
      ui.flash(220, "#fff3cf");
      audio.gunshot();
      addShake(0.09, 0.45);
      if (refs.brood) {
        refs.brood.position.set(0.05, 0.25, 0.62);
        refs.brood.rotation.z = 1.25;
      }
      if (refs.tokar) refs.tokar.visible = true;
      ui.subtitle("A gunshot. The rat drops.", 2300);
    }
    if (p.t > 11.7 && !p.transitioning) {
      p.transitioning = true;
      ui.fadeOut(1200).then(() => startKryl());
    }
    applyLook();
  }
}

function startPrologue() {
  hideTitle();
  resetCommon();
  resetProgress();
  state = "prologue";
  levelId = null;
  prologue = null;
  gunshotWarned = false;
  const res = loadWorld(buildPrologueBunker());
  scene.background.setHex(0x120d08);
  setFog(0x160f0a, 0.024);
  ambient.color.setHex(0xa08060);
  ambient.intensity = 0.9;
  player.pos.set(0, 0, 2.65);
  player.yaw = 0;
  player.pitch = -0.04;
  player.height = 1.34;
  player.flashlightOn = false;
  flashlight.intensity = 0;
  headlamp.intensity = 0.8;
  weapon.visible = false;
  camera.position.set(0, 1.34, 2.65);
  applyLook();
  ui.crosshair(false);
  ui.prompt(null);
  audio.setAmbient(0.035);
  audio.startCityMusic("kryl");
  ui.clearFade();
  prologue = {
    step: "dinner",
    t: 0,
    allowLook: true,
    entered: false,
    dialog: 0,
    fading: false,
    refs: res.refs,
  };
  ui.speak("SISTER", "You said we'd leave together.", 2800);
  return res;
}

function startCarRide() {
  if (!prologue || prologue.step === "car") return;
  const res = loadWorld(buildCarRide());
  scene.background.setHex(0x14232b);
  setFog(0x14232b, 0.018);
  ambient.color.setHex(0x7a9aa0);
  ambient.intensity = 0.95;
  player.pos.set(0, 0, 0);
  player.yaw = 0;
  player.pitch = -0.02;
  player.height = 1.08;
  player.flashlightOn = false;
  flashlight.intensity = 0;
  headlamp.intensity = 2.2;
  weapon.visible = false;
  camera.position.set(0.52, 1.12, 0.5);
  applyLook();
  ui.crosshair(false);
  audio.setAmbient(0.035);
  audio.startCarEngine();
  prologue = {
    step: "car",
    t: 0,
    allowLook: true,
    entered: true,
    dialog: 0,
    fading: false,
    refs: res.refs,
  };
  ui.speak("TOKAR", "Don't look back.", 2600);
}

function advancePrologueStep(next) {
  if (!prologue) return;
  prologue.step = next;
  prologue.t = 0;
  prologue.entered = false;
  prologue.dialog = 0;
}

function updatePrologue(dt) {
  if (!prologue) return;
  const p = prologue;
  const refs = p.refs || {};
  p.t += dt;
  if (refs.prologueTenant?.visible) {
    animateTenant(refs.prologueTenant, performance.now() * 0.001, 1.25);
  }

  if (p.step === "dinner") {
    camera.position.y = 1.34 + Math.sin(p.t * 1.1) * 0.004;
    applyLook();
    if (p.t > 1.8 && p.dialog < 1) {
      p.dialog = 1;
      ui.speak("DAD", "The alarm could go any night. If it does, stay under the boards.", 3200);
    }
    if (p.t > 5.6 && p.dialog < 2) {
      p.dialog = 2;
      ui.speak("MOM", "And you?", 1600);
    }
    if (p.t > 7.8 && p.dialog < 3) {
      p.dialog = 3;
      ui.speak("DAD", "I'm going up. Tokar has a place on the last run.", 3000);
    }
    if (p.t > 10.2 && p.dialog < 4) {
      p.dialog = 4;
      ui.speak("SISTER", "You promised.", 1800);
    }
    if (p.t > 12.4 && p.dialog < 5) {
      p.dialog = 5;
      ui.speak("MOM", "Don't go.", 1800);
    }
    if (p.t > 14.6 && p.dialog < 6) {
      p.dialog = 6;
      ui.speak("DAD", "Open the hatch. I'll be back before the alarm.", 2800);
    }
    if (p.t > 16.8) {
      advancePrologueStep("father");
    }
    return;
  }

  if (p.step === "father") {
    if (!p.entered) {
      p.entered = true;
      if (refs.hatchLight) refs.hatchLight.intensity = 1.4;
      if (refs.hatch) {
        refs.hatch.position.y = 0.02;
        refs.hatch.rotation.x = 0;
      }
      ui.speak("DAD", "Keep it closed behind me.", 2200);
    }
    camera.position.y = 1.58;
    player.yaw = lerp(player.yaw, 0.28, Math.min(1, dt * 1.6));
    player.pitch = lerp(player.pitch, -0.92, Math.min(1, dt * 1.5));
    applyLook();
    if (refs.hatch) {
      refs.hatch.position.y = Math.max(-0.55, refs.hatch.position.y - dt * 0.85);
      refs.hatch.rotation.x = Math.min(1.15, refs.hatch.rotation.x + dt * 1.3);
    }
    if (refs.dad) {
      refs.dad.position.x = lerp(refs.dad.position.x, 0.55, Math.min(1, dt * 0.55));
      refs.dad.position.z = lerp(refs.dad.position.z, 2.45, Math.min(1, dt * 0.55));
      refs.dad.rotation.y = lerpAngle(refs.dad.rotation.y, Math.PI, Math.min(1, dt * 2));
      if (p.t > 3.4) refs.dad.visible = false;
    }
    if (p.t > 1.3 && p.dialog < 1) {
      p.dialog = 1;
      ui.speak("MOM", "Please.", 1600);
    }
    if (p.t > 4.8 && refs.hatch) {
      refs.hatch.position.y = lerp(refs.hatch.position.y, 0.02, Math.min(1, dt * 2.2));
      refs.hatch.rotation.x = lerp(refs.hatch.rotation.x, 0, Math.min(1, dt * 2.2));
    }
    if (p.t > 7.2) {
      audio.stopCityMusic();
      audio.alarm(10);
      advancePrologueStep("alarm");
    }
    return;
  }

  if (p.step === "alarm") {
    if (!p.entered) {
      p.entered = true;
      if (refs.alarmLight) refs.alarmLight.intensity = 7;
      if (refs.alarmGlow) refs.alarmGlow.visible = true;
      if (refs.prologueTenant) refs.prologueTenant.visible = true;
      ui.speak("MOM", "They're in the street—", 2200);
      addShake(0.012, 0.6);
    }
    const spin = 1.5 + p.t * 1.8;
    if (refs.alarmRotor) refs.alarmRotor.rotation.y += dt * spin;
    if (refs.alarmLight) refs.alarmLight.intensity = 4 + Math.sin(p.t * 14) * 3.5;
    if (refs.alarmGlow) refs.alarmGlow.scale.setScalar(2.0 + Math.sin(p.t * 14) * 0.35);
    if (refs.boardGroup) {
      refs.boardGroup.rotation.z = Math.sin(p.t * 19) * 0.006;
      refs.boardGroup.position.y = Math.sin(p.t * 23) * 0.012;
    }
    const people = refs.exteriorPeople || [];
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const dir = i % 2 === 0 ? 1 : -1;
      person.position.x += dt * (1.2 + (i % 3) * 0.35) * dir;
      person.position.z -= dt * 0.12;
      person.rotation.y = dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      if (person.position.x > 11) person.position.x = -11;
      if (person.position.x < -11) person.position.x = 11;
    }
    const monster = refs.exteriorMonster;
    if (monster) {
      monster.position.x += dt * 3.3;
      monster.rotation.y = 0.6;
      monster.scale.setScalar(Math.min(2.0, 1.25 + p.t * 0.08));
      if (monster.position.x > 10) monster.position.x = -10;
    }
    if (refs.prologueTenant) {
      refs.prologueTenant.position.z = Math.min(-0.2, refs.prologueTenant.position.z + dt * 0.06);
    }
    if (p.t > 1.1) {
      camera.position.y = lerp(1.34, 1.58, Math.min(1, (p.t - 1.1) * 2.4));
      applyLook();
    }
    if (p.t > 4.6 && p.dialog < 1) {
      p.dialog = 1;
      ui.speak("MOM", "Get down. Under the table.", 2200);
    }
    if (p.t > 9.6) advancePrologueStep("hide");
    return;
  }

  if (p.step === "hide") {
    if (!p.entered) {
      p.entered = true;
      if (refs.hatchLight) refs.hatchLight.intensity = 0.8;
      ui.speak("MOM", "Don't move. Don't make a sound.", 2400);
    }
    camera.position.y = lerp(1.58, 1.02, Math.min(1, p.t * 1.4));
    player.yaw = lerp(player.yaw, 0.12, Math.min(1, dt * 1.6));
    player.pitch = lerp(player.pitch, -0.18, Math.min(1, dt * 1.6));
    applyLook();
    if (refs.boardGroup) {
      refs.boardGroup.rotation.z = Math.sin(p.t * 25) * 0.01;
      refs.boardGroup.position.y = Math.sin(p.t * 31) * 0.018;
    }
    if (refs.hatchLight) refs.hatchLight.intensity = 0.4 + Math.sin(p.t * 8) * 0.3;
    if (p.t > 5.2) advancePrologueStep("grab");
    return;
  }

  if (p.step === "grab") {
    if (!p.entered) {
      p.entered = true;
      if (refs.brood) {
        refs.brood.visible = true;
        refs.brood.position.set(0.4, 1.35, -2.55);
        refs.brood.scale.setScalar(2.8);
        refs.brood.rotation.y = -Math.PI / 2;
        refs.brood.rotation.z = 0;
      }
      if (refs.boards) {
        for (const i of [2, 3, 4]) if (refs.boards[i]) refs.boards[i].visible = false;
      }
      if (refs.boardGroup) refs.boardGroup.rotation.z = 0.035;
      for (let i = 0; i < 6; i++) {
        const debris = new THREE.Mesh(
          new THREE.BoxGeometry(0.12 + Math.random() * 0.2, 0.04, 0.1 + Math.random() * 0.18),
          toonMat(0x4a3826)
        );
        debris.position.set(0.2 + Math.random() * 1.8, 0.04, -2.7 + Math.random() * 0.6);
        debris.rotation.y = Math.random() * 3;
        worldGroup.add(debris);
      }
      audio.monsterGrowl();
      addShake(0.05, 0.7);
      ui.speak("MOM", "Don't look at it—", 1800);
    }
    camera.position.y = 1.58;
    player.pitch = lerp(player.pitch, 0.38, Math.min(1, dt * 2.2));
    applyLook();
    if (refs.brood) {
      refs.brood.position.y = Math.max(0.55, refs.brood.position.y - dt * 1.1);
      refs.brood.position.z = lerp(refs.brood.position.z, -0.9, Math.min(1, dt * 0.7));
      refs.brood.rotation.z = Math.sin(p.t * 2.4) * 0.02;
      if (refs.mom) {
        refs.mom.position.x = lerp(refs.mom.position.x, 0.1, Math.min(1, dt * 0.8));
        refs.mom.position.z = lerp(refs.mom.position.z, 1.0, Math.min(1, dt * 0.8));
      }
      if (refs.sister) {
        refs.sister.position.x = lerp(refs.sister.position.x, 0.6, Math.min(1, dt * 1.1));
        refs.sister.position.z = lerp(refs.sister.position.z, 1.2, Math.min(1, dt * 1.1));
      }
      if (p.t > 2.8) {
        if (refs.mom) refs.mom.visible = false;
        if (refs.sister) refs.sister.visible = false;
        if (refs.brood) {
          refs.brood.position.set(0.35, 0.55, -0.9);
          refs.brood.rotation.y = -Math.PI / 2;
        }
        if (!p.captured) {
          p.captured = true;
          audio.playSample("scream", { gain: 0.18, rate: 1.25, duration: 0.55 });
        }
      }
    }
    if (p.t > 6.2) advancePrologueStep("loom");
    return;
  }

  if (p.step === "loom") {
    if (!p.entered) {
      p.entered = true;
      if (refs.brood) {
        refs.brood.visible = true;
        refs.brood.position.set(0.35, 0.55, -0.9);
        refs.brood.scale.setScalar(2.85);
        refs.brood.rotation.z = 0;
        refs.brood.rotation.y = -Math.PI / 2;
      }
      audio.monsterGrowl();
      audio.breath();
      addShake(0.03, 0.5);
    }
    // knocked to the floor, looking up at the rat
    camera.position.set(0, 0.62, 2.68);
    player.yaw = lerp(player.yaw, 0, Math.min(1, dt * 2));
    player.pitch = lerp(player.pitch, 0.72, Math.min(1, dt * 1.5));
    applyLook();
    if (refs.brood) {
      refs.brood.position.x = 0.35 + Math.sin(p.t * 0.8) * 0.02;
      refs.brood.rotation.z = Math.sin(p.t * 1.2) * 0.015;
    }
    if (p.t > 4.4) advancePrologueStep("boom");
    return;
  }

  if (p.step === "boom") {
    if (!p.entered) {
      p.entered = true;
      ui.flash(220, "#ffe4b0");
      audio.gunshot();
      addShake(0.14, 1.0);
      if (refs.brood) {
        refs.brood.position.set(0.35, 0.2, -0.9);
        refs.brood.rotation.z = Math.PI / 2;
        refs.brood.rotation.y = -Math.PI / 2;
        refs.brood.scale.setScalar(2.55);
      }
      if (refs.tokar) {
        refs.tokar.visible = true;
        refs.tokar.position.set(3.8, 0, 2.1);
        refs.tokar.rotation.y = -1.7;
      }
      if (refs.hatch) {
        refs.hatch.position.y = -0.55;
        refs.hatch.rotation.x = 1.1;
      }
      audio.playSample("scream", { gain: 0.22, rate: 0.8, duration: 0.6 });
      ui.speak("TOKAR", "Your father sent me. Look at me.", 3600);
    }
    // hold the low angle on the downed rat, then rise with Tokar
    if (p.t < 1.6) {
      camera.position.set(0, 0.62, 2.68);
      player.pitch = lerp(player.pitch, 0.5, Math.min(1, dt * 2));
    } else {
      camera.position.y = lerp(0.62, 1.35, Math.min(1, (p.t - 1.6) * 0.9));
      player.pitch = lerp(player.pitch, 0.04, Math.min(1, dt * 1.6));
    }
    applyLook();
    if (p.t > 5.4) {
      startCarRide();
      return;
    }
    return;
  }

  if (p.step === "car") {
    const carRefs = p.refs || {};
    if (carRefs.ruins) carRefs.ruins.position.z += dt * 5.2;
    if (carRefs.cabinLight) carRefs.cabinLight.intensity = 2.2 + Math.sin(p.t * 21) * 0.5;
    camera.position.y = 1.08 + Math.sin(p.t * 7.4) * 0.006;
    applyLook();
    if (p.t > 3 && p.dialog < 1) {
      p.dialog = 1;
      ui.speak("TOKAR", "Kryl is still standing. That's where we're going.", 3400);
    }
    if (p.t > 9.5 && p.dialog < 2) {
      p.dialog = 2;
      ui.speak("TOKAR", "Don't look back.", 2200);
    }
    if (p.t > 13.5 && p.dialog < 3) {
      p.dialog = 3;
      ui.speak("TOKAR", "Almost there. Stay with me.", 2400);
    }
    if (p.t > 18.5 && !p.fading) {
      p.fading = true;
      audio.stopCarEngine();
      ui.fadeOut(1400).then(() => startKryl());
    }
    return;
  }
}

function startKryl() {
  resetCommon();
  state = "kryl";
  levelId = null;
  prologue = null;
  kryl = null;
  const res = loadWorld(buildKryl());
  scene.background.setHex(0x0a1412);
  setFog(0x0b1410, 0.02);
  ambient.color.setHex(0xc09060);
  ambient.intensity = 1.7;
  player.pos.copy(res.spawn || new THREE.Vector3(0, 0, 4.8));
  player.yaw = res.spawnYaw ?? 0;
  player.pitch = 0;
  player.height = 1.65;
  player.crouched = false;
  player.forcedCrawl = false;
  player.frozen = false;
  player.hasGun = false;
  player.health = 100;
  player.medkits = Math.max(1, player.medkits);
  player.weapon = "pistol";
  player.ammo = 8;
  player.mags.pistol = 8;
  setWeaponModel("pistol");
  player.flashlightOn = false;
  flashlight.intensity = 0;
  headlamp.intensity = 2.0;
  weapon.visible = false;
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  ui.crosshair(true);
  audio.setAmbient(0.05);
  audio.startCityMusic("kryl");
  kryl = { talked: false, pages: [], page: 0, nearTokar: false, nearVent: false, leaving: false, npcs: res.npcs || [] };
  ui.chapter("KRYL STATION", "YEARS LATER", "The last safe place you know", 3000);
  setTimeout(() => {
    if (state === "kryl" && !dialogueOpen && !kryl?.talked) ui.speak("TOKAR", "Over here, kid.", 2600);
  }, 2900);
  ui.clearFade();
  setTimeout(updateLookHint, 300);
}

function enterVentFromKryl() {
  if (!kryl || kryl.leaving) return;
  kryl.leaving = true;
  player.frozen = true;
  ui.fadeOut(1000).then(() => startVent());
}

function startVent(retry = false) {
  resetCommon();
  state = "vent";
  levelId = null;
  prologue = null;
  kryl = null;
  const res = loadWorld(buildVent());
  if (res.refs.crawler) res.refs.crawler.visible = false;
  scene.background.setHex(0x020404);
  setFog(0x04100d, 0.075);
  ambient.color.setHex(0x4a5a50);
  ambient.intensity = 0.42;
  player.pos.copy(res.spawn);
  if (retry) player.pos.set(0, 0, -5.85);
  player.pos.y = 0;
  player.yaw = 0;
  player.pitch = 0;
  player.height = 1.65;
  player.crouched = false;
  player.forcedCrawl = false;
  player.frozen = false;
  player.hasGun = true;
  player.health = 100;
  player.weapon = "pistol";
  player.ammo = 8;
  player.mags.pistol = 8;
  setWeaponModel("pistol");
  player.flashlightOn = true;
  flashlight.intensity = 32.0;
  headlamp.intensity = 1.2;
  weapon.visible = true;
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  ui.crosshair(true);
  ui.prompt(null);
  audio.setAmbient(0.06);
  audio.startVentAmbience();
  vent = {
    triggered: false,
    warning: 0,
    crawlerKilled: false,
    search: null,
    looted: bodyLooted,
    nearBody: false,
    nearExit: false,
    endTransition: false,
  };
  ui.chapter(retry ? "CHECKPOINT" : "ACT I", retry ? "THE VENT" : "THE DESCENT", retry ? "Again." : "Don't fire unless you have to.", 2200);
  ui.clearFade();
  setTimeout(updateLookHint, 300);
}

function updatePlayer(dt) {
  const f = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
  const s = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  const moving = !player.frozen && !dialogueOpen && (f !== 0 || s !== 0);

  player.crouched = keys.has("ControlLeft") || keys.has("ControlRight");
  const sprinting = keys.has("ShiftLeft") || keys.has("ShiftRight");
  const crawl = player.forcedCrawl || player.crouched;
  const targetHeight = crawl ? 0.92 : 1.65;
  player.height = lerp(player.height, targetHeight, Math.min(1, dt * 9));

  let speed = 3.15;
  if (crawl) speed = 1.45;
  else if (sprinting && player.stamina > 0.02) speed = 5.1;

  if (moving) {
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const dir = forward.multiplyScalar(f).add(right.multiplyScalar(s)).normalize();
    const distance = speed * dt;
    const substeps = Math.max(1, Math.ceil(distance / 0.14));
    const step = distance / substeps;
    for (let i = 0; i < substeps; i++) {
      player.pos.x += dir.x * step;
      player.pos.z += dir.z * step;
      resolveCollisions();
    }

    if (sprinting && !crawl) player.stamina = Math.max(0, player.stamina - dt * 0.16);
  } else {
    player.stamina = Math.min(1, player.stamina + dt * 0.1);
  }

  if (world?.bounds) {
    player.pos.x = clamp(player.pos.x, world.bounds.minX, world.bounds.maxX);
    player.pos.z = clamp(player.pos.z, world.bounds.minZ, world.bounds.maxZ);
  }
  player.pos.y = 0;

  if (moving) {
    player.bobTime += dt * (crawl ? 7 : sprinting ? 12 : 8.5);
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      audio.step(sprinting || crawl);
      player.stepTimer = crawl ? 0.72 : sprinting ? 0.3 : 0.48;
    }
  } else {
    player.bobTime *= 0.94;
    player.stepTimer = 0;
  }

  const bob = moving ? Math.sin(player.bobTime) * (crawl ? 0.007 : 0.013) : 0;
  camera.position.set(player.pos.x, player.height + bob, player.pos.z);
  camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
  flashlight.intensity = player.flashlightOn ? 32.0 : 0;
}

function resolveCollisions() {
  if (!world?.colliders) return;
  const r = 0.3;
  const p = player.pos;
  for (const c of world.colliders) {
    if (p.x + r > c.minX && p.x - r < c.maxX && p.z + r > c.minZ && p.z - r < c.maxZ) {
      const penX = Math.min(p.x + r - c.minX, c.maxX - (p.x - r));
      const penZ = Math.min(p.z + r - c.minZ, c.maxZ - (p.z - r));
      if (penX < penZ) {
        const cx = (c.minX + c.maxX) / 2;
        p.x = p.x < cx ? c.minX - r : c.maxX + r;
      } else {
        const cz = (c.minZ + c.maxZ) / 2;
        p.z = p.z < cz ? c.minZ - r : c.maxZ + r;
      }
    }
  }
}

function animateTenant(tenant, time, intensity = 1) {
  if (!tenant) return;
  const rig = tenant.userData?.tenant;
  if (!rig) return;
  if (rig.baseY == null) rig.baseY = tenant.position.y;
  const phase = rig.phase || 0;
  const sway = Math.sin(time * 0.9 + phase);
  const slow = Math.sin(time * 0.42 + phase);
  if (rig.head) {
    rig.head.rotation.z = sway * 0.07 * intensity;
    rig.head.rotation.x = slow * 0.045 * intensity;
  }
  if (rig.neck) rig.neck.rotation.z = sway * 0.025 * intensity;
  if (rig.arms) {
    const left = rig.arms[0];
    const right = rig.arms[1];
    if (left) {
      left.rotation.z = 0.06 + Math.sin(time * 0.75 + phase) * 0.06 * intensity;
      left.rotation.x = Math.sin(time * 0.5 + phase + 1) * 0.05 * intensity;
    }
    if (right) {
      right.rotation.z = -0.06 + Math.sin(time * 0.68 + phase + 2) * 0.06 * intensity;
      right.rotation.x = Math.sin(time * 0.44 + phase) * 0.05 * intensity;
    }
  }
  tenant.rotation.z = sway * 0.008 * intensity;
  tenant.position.y = (rig.baseY || 0) + Math.sin(time * 1.25 + phase) * 0.006 * intensity;
}

function updateCityNpcs(dt, npcs) {
  if (!npcs || !npcs.length) return;
  const now = performance.now();
  let near = null;
  let nearD = Infinity;
  for (const npc of npcs) {
    const g = npc.group;
    if (!g) continue;
    if (npc.route && npc.route.length > 1) {
      const target = npc.route[npc.idx % npc.route.length];
      const tx = Array.isArray(target) ? target[0] : target.x;
      const tz = Array.isArray(target) ? target[1] : target.z;
      const dx = tx - g.position.x;
      const dz = tz - g.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.12) {
        npc.idx = (npc.idx + 1) % npc.route.length;
      } else {
        g.position.x += (dx / d) * npc.speed * dt;
        g.position.z += (dz / d) * npc.speed * dt;
        g.rotation.y = Math.atan2(dx, dz);
      }
    } else {
      g.position.y = Math.sin(now * 0.0018 + npc.idx) * 0.006;
    }
    const pd = distXZ(player.pos, g.position);
    if (pd < 2.5) {
      const target = new THREE.Vector3(g.position.x, 1.42, g.position.z);
      if (lookDot(target) > 0.15 && pd < nearD) {
        near = npc;
        nearD = pd;
      }
    }
  }
  if (near && now > (near.nextTalk || 0) && !dialogueOpen) {
    near.nextTalk = now + 14000;
    const lines = near.lines || [];
    if (lines.length) {
      ui.speak(near.name, lines[Math.floor(Math.random() * lines.length)], 3000);
    }
  }
}

function updateKryl(dt) {
  if (!world || !kryl) return;
  player.forcedCrawl = false;
  updatePlayer(dt);
  if (kryl.npcs) updateCityNpcs(dt, kryl.npcs);
  if (dialogueOpen) return;

  const refs = world.refs;
  kryl.nearTokar = distXZ(player.pos, refs.tokar.position) < 2.2;
  kryl.nearVent = distXZ(player.pos, refs.ventDoor) < 2.35;

  if (kryl.nearTokar && !kryl.talked) {
    startDialogue();
    return;
  }
  if (kryl.talked && kryl.nearVent) {
    enterVentFromKryl();
    return;
  }
  ui.prompt(null);
}

function updateVent(dt) {
  if (!world || !vent) return;

  if (vent.search) {
    vent.search.t += dt;
    if (vent.search.t >= vent.search.duration) {
      vent.search = null;
      vent.looted = true;
      bodyLooted = true;
      player.frozen = false;
      player.reserve.pistol += 8;
      player.ammo = Math.min(WEAPONS.pistol.cap, player.ammo + 8);
      player.mags.pistol = player.ammo;
      mgr += 6;
      audio.click();
      spawnCollectBurst(world.refs.bodyPos, 0xffd27a, 0.7);
    }
    return;
  }

  if (vent.warning > 0) {
    vent.warning -= dt;
    player.frozen = true;
    addShake(0.018, 0.2);
    if (vent.warning <= 0) beginJumpscare();
    return;
  }

  const zBefore = player.pos.z;
  player.forcedCrawl = zBefore < -2.2 && zBefore > -5.4;
  updatePlayer(dt);
  const z = player.pos.z;

  if (!vent.triggered && z < -6.6) {
    vent.triggered = true;
    vent.warning = 1.0;
    player.frozen = true;
    audio.scrape();
    addShake(0.025, 1.0);
    ui.subtitle("Something runs on metal above you.", 1800);
    return;
  }

  const refs = world.refs;
  vent.nearBody = !vent.looted && distXZ(player.pos, refs.bodyPos) < 1.9;
  vent.nearExit = distXZ(player.pos, refs.exit) < 2.2;

  if (vent.nearBody && !vent.search) beginSearch();
  if (vent.crawlerKilled && vent.nearExit && !vent.endTransition) openEnd();
}

function updateExplore(dt) {
  if (!level || state !== "explore") return;
  if (shopOpen) return;
  if (level.transitioning) return;
  player.forcedCrawl = levelId === "last_crawl";
  updatePlayer(dt);
  if (state !== "explore") return;
  updateEnemies(dt);
  if (state !== "explore") return;
  updateAmbientCrawler(dt);
  if (level.npcs) updateCityNpcs(dt, level.npcs);

  if (level.data.refs?.fan && level.fanOn) level.data.refs.fan.rotation.z += dt * 10;
  const beacon = level.data.refs?.shopBeacon;
  if (beacon) {
    beacon.rotation.y += dt * 1.7;
    beacon.position.y = (beacon.userData.baseY ?? beacon.position.y) + Math.sin(performance.now() * 0.0022) * 0.07;
  }

  const flicker = level.data.refs?.flickerLights;
  if (flicker) {
    const now = performance.now() * 0.001;
    for (const f of flicker) {
      const blink = Math.sin(now * 11 + f.phase) > 0.972 ? 0.12 : 1;
      f.light.intensity = f.base * (0.78 + 0.22 * Math.sin(now * f.speed + f.phase)) * blink;
    }
  }
  if (level.data.refs?.motes) level.data.refs.motes.rotation.y += dt * 0.01;
  const heartLight = level.data.refs?.heartLight;
  if (heartLight) {
    const now = performance.now() * 0.001;
    const pulse = 1 + Math.sin(now * 2.2) * 0.08;
    heartLight.intensity = 6.5 + Math.sin(now * 2.2) * 2.2;
    if (level.data.refs.heart) level.data.refs.heart.scale.set(1.1 * pulse, 1.3 * pulse, 1.1 * pulse);
  }

  level.ambientTimer -= dt;
  if (level.ambientTimer <= 0) {
    level.ambientTimer = 24 + Math.random() * 34;
    const r = Math.random();
    if (r < 0.28 && ["warren", "flooded", "lair"].includes(levelId) && !ambientCrawler) {
      startCeilingCrawler();
    } else {
      if (r < 0.6) audio.whisper();
      else if (r < 0.85) audio.scrape();
      else audio.metal();
      addShake(0.008, 0.35);
      if (Math.random() < 0.34) {
        const lines = [
          "Something draws a breath behind the wall.",
          "The vent creaks above your head.",
          "You hear fingers drag across metal.",
          "The dark shifts. It was already dark.",
        ];
        ui.subtitle(lines[Math.floor(Math.random() * lines.length)], 2300);
      }
    }
  }

  for (const t of level.triggers) {
    if (t.fired) continue;
    if (distXZ(player.pos, t.pos) > t.radius) continue;
    t.fired = true;
    if (t.kind === "vision") {
      startVision(t.visionId, t);
      return;
    }
    if (t.kind === "crawler") {
      triggerCrawlerJumpscare(t.crawler, () => {
        mgr += 8;
        if (t.crawler) t.crawler.visible = false;
        ui.subtitle("Crawler down. +8 MGR", 1800);
      });
      return;
    }
    if (t.kind === "nest") {
      startNestEnding();
      return;
    }
    if (t.kind === "sighting") {
      if (t.target) {
        t.target.visible = true;
        t.target.userData.revealTime = performance.now() + 1700;
      }
      audio.whisper();
      ui.subtitle("Someone is standing at the end of the vent.", 2400);
      return;
    }
  }

  const nowT = performance.now() * 0.001;
  for (const t of level.data.refs?.watchers || []) animateTenant(t, nowT, 1.05);
  for (const t of level.data.refs?.tenants || []) animateTenant(t, nowT, 0.9);

  const sightings = level.data.refs?.sightings;
  if (sightings) {
    for (const s of sightings) {
      if (!s.visible) continue;
      if ((s.userData?.vanishT || 0) > 0) {
        s.userData.vanishT -= dt;
        const k = Math.max(0, s.userData.vanishT / 0.45);
        s.scale.setScalar(Math.max(0.01, k));
        s.position.y = (s.userData.vanishBaseY || 0) + (1 - k) * 0.75;
        if (s.userData.vanishT <= 0) {
          s.visible = false;
          s.scale.setScalar(1);
        }
        continue;
      }
      animateTenant(s, nowT + (s.userData.tenant?.phase || 0), 1.15);
      if ((s.userData?.revealTime || 0) > performance.now()) continue;
      if (distXZ(player.pos, s.position) > 8) continue;
      const targetYaw = Math.atan2(player.pos.x - s.position.x, player.pos.z - s.position.z);
      s.rotation.y = lerpAngle(s.rotation.y, targetYaw, Math.min(1, dt * 0.9));
      const target = new THREE.Vector3(s.position.x, 1.75, s.position.z);
      if (lookDot(target) > 0.985) {
        s.userData.vanishT = 0.45;
        s.userData.vanishBaseY = s.position.y;
        audio.whisper();
        addShake(0.008, 0.2);
        ui.subtitle("There was nothing there.", 1700);
      }
    }
  }

  autoInteractLevel(dt);
  updateDoorIndicators();
  level.near = findNearInteractable();
  ui.prompt(null);
}

function startCeilingCrawler() {
  if (!worldGroup) return;
  const c = makeCrawler();
  const fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const base = player.pos.clone().addScaledVector(fwd, 4.2);
  c.position.set(base.x, 2.15, base.z);
  c.rotation.y = player.yaw + Math.PI;
  c.rotation.z = Math.PI;
  c.scale.setScalar(1.15);
  worldGroup.add(c);
  ambientCrawler = { group: c, t: 0, dir: Math.random() < 0.5 ? -1 : 1, right };
  audio.scrape();
  addShake(0.012, 0.5);
  ui.subtitle("Something moves across the ceiling.", 2000);
}

function updateAmbientCrawler(dt) {
  if (!ambientCrawler) return;
  ambientCrawler.t += dt;
  const a = ambientCrawler;
  a.group.position.addScaledVector(a.right, dt * 2.6 * a.dir);
  a.group.rotation.z = Math.PI + Math.sin(a.t * 14) * 0.05;
  a.group.rotation.y += dt * 0.4 * a.dir;
  if (a.t > 2.0) {
    worldGroup?.remove(a.group);
    disposeGroup(a.group);
    ambientCrawler = null;
  }
}

function blockAt(x, z, pad = 0.2) {
  if (!level?.data?.colliders) return false;
  for (const c of level.data.colliders) {
    if (x > c.minX - pad && x < c.maxX + pad && z > c.minZ - pad && z < c.maxZ + pad) return true;
  }
  return false;
}

function lineOfSight(ax, az, bx, bz) {
  const dist = Math.hypot(bx - ax, bz - az);
  const steps = Math.ceil(dist / 0.25);
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    if (blockAt(ax + (bx - ax) * k, az + (bz - az) * k, 0.1)) return false;
  }
  return true;
}

function updateEnemies(dt) {
  if (!level?.data?.enemies) return;
  for (const enemy of level.data.enemies) {
    if (enemy.dead) {
      if (enemy.group.visible) {
        enemy.deathT = (enemy.deathT || 0) + dt;
        enemy.group.rotation.z = Math.min(1.35, enemy.deathT * 4.5);
        enemy.group.position.y = Math.max(0, 0.08 - enemy.deathT * 0.12);
      }
      continue;
    }
    const group = enemy.group;
    const d = distXZ(player.pos, group.position);
    if (d > enemy.alertRange) continue;
    const canSee = lineOfSight(group.position.x, group.position.z, player.pos.x, player.pos.z);

    const dx = player.pos.x - group.position.x;
    const dz = player.pos.z - group.position.z;
    group.rotation.y = Math.atan2(dx, dz);

    if (enemy.type === "scavenger") {
      if (d > 2.5 && canSee) {
        const s = enemy.speed * dt;
        const nx = group.position.x + (dx / Math.max(0.001, d)) * s;
        const nz = group.position.z + (dz / Math.max(0.001, d)) * s;
        if (!blockAt(nx, nz, 0.3)) {
          group.position.x = nx;
          group.position.z = nz;
        } else {
          if (!blockAt(nx, group.position.z, 0.3)) group.position.x = nx;
          else if (!blockAt(group.position.x, nz, 0.3)) group.position.z = nz;
        }
      }
      enemy.timer -= dt;
      if (enemy.timer <= 0 && d < enemy.attackRange && canSee) {
        enemy.timer = enemy.cooldown;
        audio.noise({ duration: 0.1, gain: 0.1, type: "bandpass", freq: 800, q: 0.8 });
        audio.tone({ freq: 120, endFreq: 60, duration: 0.12, type: "triangle", gain: 0.05 });
        hurtPlayer(enemy.damage);
        if (state !== "explore") return;
      }
    } else {
      if (d > enemy.attackRange && canSee) {
        const s = enemy.speed * dt;
        const nx = group.position.x + (dx / Math.max(0.001, d)) * s;
        const nz = group.position.z + (dz / Math.max(0.001, d)) * s;
        if (!blockAt(nx, nz, 0.24)) {
          group.position.x = nx;
          group.position.z = nz;
        } else {
          if (!blockAt(nx, group.position.z, 0.24)) group.position.x = nx;
          else if (!blockAt(group.position.x, nz, 0.24)) group.position.z = nz;
        }
        group.position.y = enemy.baseY + Math.sin(performance.now() * 0.02) * 0.02;
      } else {
        enemy.timer -= dt;
        if (enemy.timer <= 0 && d < enemy.attackRange + 0.3 && canSee) {
          enemy.timer = enemy.cooldown;
          audio.rat();
          hurtPlayer(enemy.damage);
          if (state !== "explore") return;
        }
      }
    }
    if (level.data.bounds) {
      group.position.x = clamp(group.position.x, level.data.bounds.minX + 0.4, level.data.bounds.maxX - 0.4);
      group.position.z = clamp(group.position.z, level.data.bounds.minZ + 0.4, level.data.bounds.maxZ - 0.4);
    }
  }
}

function findNearInteractable() {
  if (!level?.data?.interactables) return null;
  let best = null;
  let bestD = Infinity;
  for (const item of level.data.interactables) {
    if (item.group && !item.group.visible) continue;
    if (item.looted) continue;
    if (item.used) continue;
    const d = distXZ(player.pos, item.pos);
    if (d <= item.radius && d < bestD) {
      best = item;
      bestD = d;
    }
  }
  return best;
}

function requirementMet(item) {
  if (!item.requirement) return true;
  if (item.requirement === "fuses") return level.fuses >= (item.required ?? 3);
  if (item.requirement === "valves") return level.valves >= (item.required ?? 3);
  if (item.requirement === "console") return !!level.fanOn;
  if (item.requirement === "radio") return !!level.radioUsed;
  return false;
}

function updateDoorIndicators() {
  const door = level?.door;
  if (!door?.pips) return;
  const item = level.doorItem;
  let done = 0;
  const total = 3;
  if (item?.requirement === "fuses") done = Math.min(total, level.fuses);
  else if (item?.requirement === "valves") done = Math.min(total, level.valves);
  else if (item?.requirement === "console") done = level.fanOn ? total : 0;
  else if (item?.requirement === "radio") done = level.radioUsed ? total : 0;
  else done = total;
  const ready = item ? requirementMet(item) : true;
  for (let i = 0; i < door.pips.length; i++) {
    const pip = door.pips[i];
    if (!pip?.material?.color) continue;
    pip.material.color.setHex(i < done ? 0x8fe08a : 0x6a2018);
  }
  if (door.statusLamp?.material?.color) {
    door.statusLamp.material.color.setHex(ready ? 0x8fe08a : 0xb33a24);
  }
}

function autoInteractLevel(dt) {
  if (!level || level.transitioning || shopOpen || state !== "explore") return;
  if (level.autoCooldown > 0) {
    level.autoCooldown = Math.max(0, level.autoCooldown - dt);
    return;
  }

  const priority = { fuse: 0, valve: 0, console: 0, pickup: 1, note: 1, body: 1, radio: 1 };
  let target = null;
  let targetPriority = 9;
  let targetDist = Infinity;

  for (const item of level.data.interactables) {
    if (item.kind === "shop" || item.kind === "door" || item.kind === "exit") continue;
    if (item.group && !item.group.visible) continue;
    if (item.used || item.looted) continue;
    const p = priority[item.kind] ?? 2;
    const d = distXZ(player.pos, item.pos);
    if (d > item.radius) continue;
    if (p < targetPriority || (p === targetPriority && d < targetDist)) {
      target = item;
      targetPriority = p;
      targetDist = d;
    }
  }

  if (!target) {
    for (const item of level.data.interactables) {
      if (item.kind !== "door" && item.kind !== "exit") continue;
      if (level.transitioning) return;
      if (!requirementMet(item)) continue;
      if (distXZ(player.pos, item.pos) <= item.radius) {
        target = item;
        break;
      }
    }
  }

  if (!target) return;
  const kind = target.kind;
  interactLevel(target);
  level.autoCooldown = kind === "door" || kind === "exit" ? 0.85 : 0.32;
  if (kind !== "door" && kind !== "exit") {
    const color = kind === "fuse" || kind === "console" ? 0xffd27a
      : kind === "valve" ? 0x8fe0c0
      : kind === "body" ? 0xd06a3a
      : kind === "radio" ? 0x9bc17a
      : 0xb6d68f;
    spawnCollectBurst(target.pos, color, 0.5);
  }
}

function promptFor(item) {
  return "";
}

function interactLevel(itemOverride = null) {
  if (!level || state !== "explore" || shopOpen || level.transitioning) return;
  const item = itemOverride || level.near || findNearInteractable();
  if (!item || item.used || item.looted) return;

  if (item.kind === "body") {
    item.looted = true;
    const loot = item.loot || {};
    let message = [];
    if (loot.mgr) { mgr += loot.mgr; message.push(`+${loot.mgr} MGR`); }
    if (loot.ammo) {
      player.reserve.pistol += loot.ammo;
      if (player.weapon === "pistol") {
        player.ammo = Math.min(WEAPONS.pistol.cap, player.ammo + loot.ammo);
        player.mags.pistol = player.ammo;
      }
      message.push(`+${loot.ammo} pistol rounds`);
    }
    if (loot.medkit) { player.medkits += loot.medkit; message.push("+1 medkit"); }
    if (loot.log) { logsFound++; message.push("log recovered"); }
    audio.click();
    ui.subtitle(`Looted: ${message.join(" · ")}`, 2400);
    return;
  }

  if (item.kind === "note") {
    item.used = true;
    if (item.group) item.group.visible = false;
    logsFound++;
    mgr += 3;
    audio.click();
    ui.subtitle(`${item.text}  (+3 MGR)`, 6000);
    return;
  }

  if (item.kind === "pickup") {
    item.used = true;
    if (item.group) item.group.visible = false;
    if (item.item === "medkit") { player.medkits++; ui.subtitle("Medkit taken.", 1600); }
    else { mgr += 6; ui.subtitle("+6 MGR", 1600); }
    audio.click();
    return;
  }

  if (item.kind === "fuse") {
    item.used = true;
    if (item.group) item.group.visible = false;
    level.fuses++;
    audio.click();
    ui.subtitle(`Fuse taken. ${level.fuses}/3.`, 1800);
    if (level.fuses === 3) {
      setTimeout(() => {
        if (state === "explore" && levelId === "warren") startCeilingCrawler();
      }, 1600);
    }
    return;
  }

  if (item.kind === "valve") {
    item.used = true;
    if (item.wheel) item.wheel.rotation.z += Math.PI * 0.6;
    level.valves++;
    audio.metal();
    ui.subtitle(`Valve turned. ${level.valves}/3.`, 1800);
    if (level.valves === 3) {
      setTimeout(() => {
        if (state === "explore" && (levelId === "flooded" || levelId === "lair")) startCeilingCrawler();
      }, 1600);
    }
    return;
  }

  if (item.kind === "console") {
    item.used = true;
    level.fanOn = true;
    audio.metal();
    addShake(0.05, 0.5);
    ui.subtitle("The fan wakes up. The hatch is open.", 2400);
    return;
  }

  if (item.kind === "shop") {
    openShop();
    return;
  }

  if (item.kind === "radio") {
    item.used = true;
    level.radioUsed = true;
    player.health = 100;
    audio.beacon();
    ui.speak("MARA", "I can still hear you. Keep moving. Sanctuary is real.", 4200);
    setTimeout(() => { if (state === "explore") ui.speak("MARA", "Don't stop for the voices.", 3200); }, 4400);
    return;
  }

  if (item.kind === "door" || item.kind === "exit") {
    const ok =
      !item.requirement ||
      (item.requirement === "fuses" && level.fuses >= item.required) ||
      (item.requirement === "valves" && level.valves >= item.required) ||
      (item.requirement === "console" && level.fanOn) ||
      (item.requirement === "radio" && level.radioUsed);
    if (ok && item.next) {
      goNext(item.next);
    } else if (item.requirement === "fuses") {
      ui.subtitle(`The door needs three fuses. ${level.fuses}/3.`, 1800);
    } else if (item.requirement === "valves") {
      ui.subtitle(`The hatch needs three valves. ${level.valves}/3.`, 1800);
    } else if (item.requirement === "console") {
      ui.subtitle("The hatch is sealed. Start the fan first.", 2000);
    }
    return;
  }

  if (item.kind === "nest") {
    startNestEnding();
  }
}

function goNext(next) {
  if (!next || !level || level.transitioning) return;
  level.transitioning = true;
  player.frozen = true;
  ui.prompt(null);
  ui.crosshair(false);
  ui.fadeOut(900).then(() => startLevel(next));
}

function startLevel(id, retry = false) {
  if (!LEVEL_BUILDERS[id]) return;
  resetCommon();
  state = "explore";
  levelId = id;
  prologue = null;
  kryl = null;
  vent = null;

  const data = LEVEL_BUILDERS[id]();
  loadWorld(data);
  scene.background.setHex(data.background ?? 0x030505);
  if (data.fog) setFog(data.fog.color, data.fog.density);
  if (data.ambient) {
    ambient.color.setHex(data.ambient.color);
    ambient.intensity = data.ambient.intensity;
  }

  player.pos.copy(data.spawn);
  player.pos.y = 0;
  player.yaw = data.spawnYaw ?? 0;
  player.pitch = 0;
  player.height = 1.65;
  player.crouched = false;
  player.forcedCrawl = id === "last_crawl";
  player.frozen = false;
  player.health = id === "safe_room" || id === "zarya" ? 100 : retry ? 100 : Math.max(35, player.health);
  player.medkits = Math.max(1, player.medkits);
  player.hasGun = true;
  player.weapon = player.weapon || "pistol";
  player.ammo = player.mags[player.weapon] ?? 8;
  player.mags[player.weapon] = player.ammo;
  player.flashlightOn = id !== "nest";
  flashlight.intensity = player.flashlightOn ? 32.0 : 0;
  headlamp.intensity = id === "dead_rail" ? 1.6 : id === "nest" ? 0.9 : 1.2;
  weapon.visible = id !== "nest";
  setWeaponModel(player.weapon);
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  ui.crosshair(id !== "nest");
  ui.prompt(null);
  audio.setAmbient(id === "dead_rail" ? 0.07 : 0.055);
  if (id === "zarya") audio.startCityMusic("zarya");
  else if (["warren", "flooded", "fan", "safe_room", "lair", "last_crawl"].includes(id)) audio.startVentAmbience();

  for (const s of data.refs?.sightings || []) {
    s.userData.revealTime = performance.now() + 2600;
  }

  level = {
    id,
    data,
    triggers: data.triggers.map((t) => ({ ...t, fired: false })),
    fuses: 0,
    valves: 0,
    fanOn: false,
    radioUsed: false,
    npcs: data.npcs || [],
    near: null,
    door: data.refs?.exit || data.refs?.gate || null,
    doorItem: data.interactables.find((i) => i.kind === "door" || i.kind === "exit") || null,
    transitioning: false,
    autoCooldown: 0.7,
    ambientTimer: 24 + Math.random() * 26,
    spawnGrace: performance.now() + 1600,
  };

  for (const item of data.interactables) {
    if (!item.group) continue;
    const color =
      item.kind === "fuse" ? 0xffd27a
      : item.kind === "valve" ? 0x8fe0c0
      : item.kind === "body" ? 0xd06a3a
      : item.kind === "radio" ? 0x9bc17a
      : item.kind === "note" ? 0xd8c9a3
      : 0xb6d68f;
    const y = item.kind === "body" ? 0.45 : 0.34;
    const scale = item.kind === "body" ? 0.55 : 0.34;
    addGlow(item.group, color, 0, y, 0, scale, 0.2);
  }
  updateDoorIndicators();

  const info = LEVEL_INFO[id] || { chapter: "INTAKE", title: id.toUpperCase(), sub: "" };
  ui.chapter(info.chapter, info.title, info.sub, 2600);
  const objectives = {
    zarya: "Vera buys and sells. Descend when you are ready.",
    warren: "Find three fuses. Open the far door.",
    flooded: "Turn three valves. Open the hatch.",
    fan: "Start the fan. The hatch is sealed until you do.",
    safe_room: "Use the radio. Take a breath.",
    lair: "Turn three valves. Reach the last door.",
    last_crawl: "Crawl. Do not stop for the voices.",
  };
  if (objectives[id]) {
    setTimeout(() => {
      if (state === "explore" && levelId === id) ui.subtitle(objectives[id], 4200);
    }, 2900);
  }
  if (id === "dead_rail") {
    setTimeout(() => {
      if (state === "explore") ui.subtitle("WASD move · LMB fire · F flashlight · E interact · H medkit", 5200);
    }, 2400);
  }
  ui.clearFade();
  setTimeout(updateLookHint, 300);
}

function openShop() {
  if (shopOpen || state !== "explore") return;
  shopOpen = true;
  player.frozen = true;
  ui.prompt(null);
  ui.lookHint(false);
  if (document.pointerLockElement === canvas) document.exitPointerLock();
  ui.shop(true);
  refreshShop();
  audio.click();
}

function closeShop() {
  shopOpen = false;
  player.frozen = false;
  ui.shop(false);
  updateLookHint();
  lockPointer();
}

function refreshShop() {
  const items = [
    { id: "shotgun", name: "Sawed-off shotgun", desc: "Two shells. Very loud. Very close.", price: 28, owned: player.owned.shotgun },
    { id: "rifle", name: "Bolt-action rifle", desc: "Slow, precise, expensive.", price: 45, owned: player.owned.rifle },
    { id: "pistol_ammo", name: "Pistol rounds ×12", desc: "For the PM.", price: 4 },
    { id: "shotgun_ammo", name: "Shotgun shells ×8", desc: "For the sawed-off.", price: 5 },
    { id: "rifle_ammo", name: "Rifle rounds ×10", desc: "For the bolt-action.", price: 6 },
    { id: "medkit", name: "Medkit", desc: "Patches you up. Mostly.", price: 8 },
  ];
  for (const item of items) item.mgr = mgr;
  ui.shopMgr(mgr);
  ui.shopItems(items, (item) => buyShopItem(item));
}

function buyShopItem(item) {
  if (!shopOpen || item.owned || item.price > mgr) return;
  mgr -= item.price;
  if (item.id === "shotgun") {
    player.owned.shotgun = true;
    player.mags.shotgun = 2;
    player.reserve.shotgun += 8;
    ui.subtitle("Bought the sawed-off. Press 2 to equip.", 2600);
  } else if (item.id === "rifle") {
    player.owned.rifle = true;
    player.mags.rifle = 5;
    player.reserve.rifle += 10;
    ui.subtitle("Bought the bolt-action. Press 3 to equip.", 2600);
  } else if (item.id === "pistol_ammo") {
    player.reserve.pistol += 12;
    ui.subtitle("+12 pistol rounds.", 1800);
  } else if (item.id === "shotgun_ammo") {
    player.reserve.shotgun += 8;
    ui.subtitle("+8 shotgun shells.", 1800);
  } else if (item.id === "rifle_ammo") {
    player.reserve.rifle += 10;
    ui.subtitle("+10 rifle rounds.", 1800);
  } else if (item.id === "medkit") {
    player.medkits++;
    ui.subtitle("+1 medkit.", 1800);
  }
  audio.click();
  refreshShop();
}

function startVision(id, trigger) {
  const data = VISIONS[id];
  if (!data || state !== "explore") return;
  const visionScene = buildVisionScene(id);
  if (!visionScene) return;

  const returnGroup = worldGroup;
  const returnPos = player.pos.clone();
  const returnYaw = player.yaw;
  const returnPitch = player.pitch;
  scene.remove(returnGroup);

  worldGroup = visionScene.group;
  scene.add(visionScene.group);
  scene.background.setHex(visionScene.background);
  setFog(visionScene.fog.color, visionScene.fog.density);
  ambient.color.setHex(visionScene.ambient.color);
  ambient.intensity = Math.max(visionScene.ambient.intensity * 2.4, 1.8);
  flashlight.intensity = 0;
  headlamp.intensity = 14;
  headlamp.distance = 26;
  headlamp.decay = 1.0;
  weapon.visible = false;

  const c0 = visionScene.cameraAt(0);
  camera.position.copy(c0.pos);
  camera.lookAt(c0.look);
  state = "vision";
  player.frozen = true;
  ui.lookHint(false);
  ui.hideChapter();
  ui.crosshair(false);
  ui.prompt(null);
  ui.subtitle(visionScene.caption, 5200);
  ui.visionSkip(true);
  ui.flash(220, "#c9d3c4");
  audio.whisper();
  audio.flash();
  addShake(0.02, 0.4);
  vision = {
    id,
    data,
    sceneData: visionScene,
    t: 0,
    trigger,
    duration: visionScene.duration,
    returnGroup,
    returnPos,
    returnYaw,
    returnPitch,
  };
}

function restoreLevelEnvironment() {
  if (!level?.data) return;
  const d = level.data;
  scene.background.setHex(d.background ?? 0x030505);
  if (d.fog) setFog(d.fog.color, d.fog.density);
  if (d.ambient) {
    ambient.color.setHex(d.ambient.color);
    ambient.intensity = d.ambient.intensity;
  }
}

function finishVision() {
  if (!vision) return;
  scene.remove(vision.sceneData.group);
  disposeGroup(vision.sceneData.group);
  worldGroup = vision.returnGroup;
  scene.add(worldGroup);
  restoreLevelEnvironment();
  player.pos.copy(vision.returnPos);
  player.yaw = vision.returnYaw;
  player.pitch = vision.returnPitch;
  player.frozen = false;
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  flashlight.intensity = player.flashlightOn ? 32 : 0;
  headlamp.intensity = 1.2;
  headlamp.distance = 7;
  headlamp.decay = 1.5;
  weapon.visible = player.hasGun && levelId !== "nest";
  state = "explore";
  ui.crosshair(true);
  ui.visionSkip(false);
  ui.flash(180, "#9fae9c");
  audio.whisper();
  ui.subtitle("You are back in the dark.", 1800);
  updateLookHint();
  vision = null;
}

function updateVision(dt) {
  if (!vision) return;
  vision.t += dt;
  const t = Math.min(1, vision.t / vision.duration);
  const cam = vision.sceneData.cameraAt(t);
  camera.position.copy(cam.pos);
  camera.lookAt(cam.look);

  const refs = vision.sceneData.refs || {};
  if (refs.light) refs.light.intensity = 1.6 + Math.sin(vision.t * 17) * 0.7;
  if (refs.light2) refs.light2.intensity = 1.0 + Math.sin(vision.t * 9 + 1) * 0.3;
  if (refs.lamp) refs.lamp.intensity = 7 + Math.sin(vision.t * 24) * 1.5;
  if (refs.crawler) {
    refs.crawler.visible = vision.t > 0.15;
    const k = Math.min(1, Math.max(0, (vision.t - 0.15) / 3.2));
    refs.crawler.scale.setScalar(0.4 + k * 1.25);
    refs.crawler.position.z = -1.4 + k * 2.2;
    refs.crawler.rotation.z = Math.sin(vision.t * 11) * 0.04;
  }
  if (refs.warning) refs.warning.intensity = vision.t > 1 ? 1.5 + Math.sin(vision.t * 18) * 0.8 : 0;
  if (refs.tenant) {
    refs.tenant.position.z += dt * 0.09;
    animateTenant(refs.tenant, vision.t, 1.35);
  }

  if (vision.t >= vision.duration) finishVision();
}

function startNestEnding() {
  if (state === "ending") return;
  state = "ending";
  player.frozen = true;
  ui.crosshair(false);
  ui.lookHint(false);
  ui.prompt(null);
  ui.hideChapter();
  ui.subtitle("They are all looking at you.", 2600);
  weapon.visible = false;
  flashlight.intensity = 0;
  audio.whisper();
  addShake(0.025, 1.0);
  ending = {
    t: 0,
    startPos: camera.position.clone(),
    captions: [0],
    flashDone: false,
    faded: false,
  };
}

function updateEnding(dt) {
  if (!ending) return;
  ending.t += dt;
  const z = ending.startPos.z - Math.min(2.9, ending.t * 0.22);
  camera.position.set(Math.sin(ending.t * 0.4) * 0.12, 1.55, z);
  camera.lookAt(0, 1.2, -4.2);
  for (const t of world?.refs?.tenants || []) animateTenant(t, ending.t, 1.1);

  if (ending.t > 4 && ending.captions.length === 1) {
    ending.captions.push(1);
    ui.subtitle("Sanctuary. The best and safest city known to man.", 3400);
  }
  if (ending.t > 8 && ending.captions.length === 2) {
    ending.captions.push(2);
    ui.subtitle("It is in pieces. It is full of monsters.", 3400);
  }
  if (ending.t > 11.5 && ending.captions.length === 3) {
    ending.captions.push(3);
    ui.subtitle("They want you to see it before they take you.", 2600);
  }
  if (ending.t > 10.5 && !ending.flashDone) {
    ending.flashDone = true;
    ui.flash(500, "#e8d0a8");
    audio.flash();
    audio.scream();
    addShake(0.12, 1.2);
  }
  if (ending.t > 14.0 && !ending.faded) {
    ending.faded = true;
    ui.fadeOut(1400).then(() => {
      state = "end";
      ui.end(true);
      ui.setFade(1, 0);
      audio.setAmbient(0.0);
    });
  }
}

function retryLevel() {
  ui.death(false);
  if (levelId) startLevel(levelId, true);
  else if (vent) startVent(true);
  else startKryl();
}

function triggerCrawlerJumpscare(crawler, onSuccess = null) {
  if (!crawler) return;
  const prevState = state;
  state = "jumpscare";
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  crawler.visible = true;
  crawler.position.set(
    camera.position.x + forward.x * 1.18,
    0.52,
    camera.position.z + forward.z * 1.18
  );
  crawler.scale.set(1.5, 1.5, 1.5);
  crawler.lookAt(camera.position.x, 0.8, camera.position.z);
  ui.jumpscare(true);
  ui.jumpscareProgress(1);
  ui.hideChapter();
  ui.prompt(null);
  ui.crosshair(false);
  audio.scream();
  addShake(0.07, 0.6);
  jumpscare = { t: 0, duration: 1.8, resolved: false, crawler, prevState, onSuccess };
}

function beginJumpscare() {
  if (!world?.refs?.crawler) return;
  triggerCrawlerJumpscare(world.refs.crawler, () => {
    if (vent) vent.crawlerKilled = true;
  });
}

function updateJumpscare(dt) {
  if (!jumpscare || jumpscare.resolved) return;
  jumpscare.t += dt;
  const p = 1 - jumpscare.t / jumpscare.duration;
  ui.jumpscareProgress(p);
  const c = jumpscare.crawler;
  if (c) {
    c.scale.setScalar(1.5 + jumpscare.t * 0.1);
    c.rotation.z = Math.sin(jumpscare.t * 30) * 0.06;
  }
  addShake(0.04, 0.1);
  if (jumpscare.t >= jumpscare.duration) resolveJumpscare(false);
}

function resolveJumpscare(success) {
  if (!jumpscare || jumpscare.resolved) return;
  jumpscare.resolved = true;
  const j = jumpscare;
  ui.jumpscare(false);
  if (success) {
    state = j.prevState || "vent";
    player.frozen = false;
    ui.crosshair(true);
    if (j.onSuccess) j.onSuccess();
    if (j.crawler) {
      j.crawler.rotation.z = Math.PI / 2;
      j.crawler.position.y = 0.14;
      j.crawler.scale.setScalar(1.3);
    }
    audio.crawlerDeath();
    ui.subtitle("It stops moving. The vent is quiet again.", 2600);
    addShake(0.02, 0.3);
  } else {
    state = "dead";
    player.frozen = true;
    ui.crosshair(false);
    ui.death(true);
    audio.heartbeat(0.1);
  }
}

function crawlerShot() {
  if (state !== "jumpscare" || !jumpscare || jumpscare.resolved) return;
  if (player.fireCooldown > 0) return;
  if (player.ammo > 0) {
    player.ammo--;
    player.mags[player.weapon] = player.ammo;
    player.fireCooldown = 0.3;
    audio.gunshot();
    muzzle.intensity = 7;
    weaponKick = 0.18;
    ui.flash(90, "#ffd9a6");
    addShake(0.04, 0.22);
  } else {
    audio.click();
  }
  resolveJumpscare(true);
}

function findEnemyRef(obj) {
  let cur = obj;
  while (cur) {
    if (cur.userData?.enemyRef) return cur.userData.enemyRef;
    cur = cur.parent;
  }
  return null;
}

function isVisible(obj) {
  let cur = obj;
  while (cur) {
    if (!cur.visible) return false;
    cur = cur.parent;
  }
  return true;
}

function killEnemy(enemy) {
  if (!enemy || enemy.dead) return;
  enemy.dead = true;
  enemy.deathT = 0;
  enemy.group.visible = true;
  const reward = enemy.type === "scavenger" ? 7 : enemy.type === "crawler" ? 10 : 3;
  mgr += reward;
  player.reserve.pistol += enemy.type === "scavenger" ? 4 : 2;
  audio.ratDeath();
  addShake(0.012, 0.16);
  setTimeout(() => {
    if (enemy.group) enemy.group.visible = false;
  }, 900);
}

function hurtPlayer(amount) {
  if (state === "dead" || state === "end" || state === "ending") return;
  if (level?.spawnGrace && performance.now() < level.spawnGrace) return;
  player.health = Math.max(0, player.health - amount);
  ui.hurt();
  audio.heartbeat(0.12);
  addShake(0.035, 0.25);
  if (player.health <= 0) {
    state = "dead";
    player.frozen = true;
    ui.crosshair(false);
    ui.death(true);
    audio.heartbeat(0.12);
  }
}

function fire() {
  if (state !== "vent" && state !== "explore") return;
  if (dialogueOpen || shopOpen) return;
  if (player.fireCooldown > 0) return;
  if (player.ammo <= 0) {
    audio.click();
    ui.subtitle("Empty. R to reload.", 1400);
    return;
  }

  const spec = WEAPONS[player.weapon];
  player.ammo--;
  player.mags[player.weapon] = player.ammo;
  player.fireCooldown = spec.cooldown;
  audio.gunshot();
  muzzle.intensity = 7;
  weaponKick = 0.16;
  addShake(0.018, 0.14);

  const groups = [];
  if (level?.data?.enemies) {
    for (const e of level.data.enemies) if (!e.dead) groups.push(e.group);
  }
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const origin = camera.position.clone();
  const spread = spec.spread * (player.aiming ? 0.32 : 1);
  let hitSomething = false;
  for (let i = 0; i < spec.pellets; i++) {
    const shot = dir.clone();
    shot.x += (Math.random() - 0.5) * spread * 2;
    shot.y += (Math.random() - 0.5) * spread * 2;
    shot.z += (Math.random() - 0.5) * spread * 2;
    shot.normalize();
    raycaster.camera = camera;
    raycaster.set(origin, shot);
    raycaster.far = 45;
    const hits = raycaster.intersectObjects(groups, true);
    const enemyHit = hits.find((h) => findEnemyRef(h.object));
    const blockerHit = worldGroup
      ? raycaster.intersectObject(worldGroup, true).find((h) => h.object.isMesh && isVisible(h.object) && !findEnemyRef(h.object))
      : null;
    if (enemyHit && (!blockerHit || enemyHit.distance < blockerHit.distance)) {
      const ref = findEnemyRef(enemyHit.object);
      if (ref) {
        ref.health -= spec.damage;
        hitSomething = true;
        const kx = ref.group.position.x - player.pos.x;
        const kz = ref.group.position.z - player.pos.z;
        const kd = Math.hypot(kx, kz);
        if (kd > 0.01) {
          const kb = spec.pellets > 1 ? 0.28 : 0.16;
          const nx = ref.group.position.x + (kx / kd) * kb;
          const nz = ref.group.position.z + (kz / kd) * kb;
          if (!blockAt(nx, nz, 0.2)) {
            ref.group.position.x = nx;
            ref.group.position.z = nz;
          }
        }
        if (ref.health <= 0) killEnemy(ref);
      }
    }
  }
  if (hitSomething) ui.hitmark();

  if (!gunshotWarned) {
    gunshotWarned = true;
    ui.subtitle("A gunshot in the vent is a dinner bell.", 2200);
  }
}

function reload() {
  if (state !== "vent" && state !== "explore") return;
  const spec = WEAPONS[player.weapon];
  const need = spec.cap - player.ammo;
  const take = Math.min(need, player.reserve[player.weapon]);
  if (take <= 0) {
    audio.click();
    ui.subtitle("No spare rounds for this weapon.", 1400);
    return;
  }
  player.reserve[player.weapon] -= take;
  player.ammo += take;
  player.mags[player.weapon] = player.ammo;
  audio.click();
  ui.subtitle(`Reloaded. ${player.ammo} in the ${spec.name}.`, 1600);
}

function checkAmmo() {
  if (state !== "vent" && state !== "explore") return;
  const spec = WEAPONS[player.weapon];
  audio.click();
  ui.subtitle(`${player.ammo}/${spec.cap} in the ${spec.name}. ${player.reserve[player.weapon]} spare.`, 2200);
}

function switchWeapon(id) {
  if (!player.owned[id] || player.weapon === id) return;
  if (state !== "vent" && state !== "explore" && state !== "kryl") return;
  player.mags[player.weapon] = player.ammo;
  player.weapon = id;
  player.ammo = player.mags[id];
  setWeaponModel(id);
  audio.click();
  ui.subtitle(WEAPONS[id].name, 1200);
}

function useMedkit() {
  if (player.medkits <= 0) {
    ui.subtitle("No medkits.", 1200);
    return;
  }
  if (player.health >= 100) {
    ui.subtitle("You are not hurt enough.", 1200);
    return;
  }
  player.medkits--;
  player.health = Math.min(100, player.health + 45);
  audio.click();
  ui.subtitle(`Medkit used. ${player.medkits} left.`, 1600);
}

function melee() {
  if (state === "jumpscare") {
    resolveJumpscare(true);
    return;
  }
  if (state !== "vent" && state !== "explore") return;
  let hit = null;
  for (const enemy of level?.data?.enemies || []) {
    if (enemy.dead) continue;
    if (distXZ(player.pos, enemy.group.position) > 2.0) continue;
    if (lookDot(new THREE.Vector3(enemy.group.position.x, 1.0, enemy.group.position.z)) < 0.5) continue;
    hit = enemy;
    break;
  }
  if (hit) {
    hit.health -= 38;
    ui.hitmark();
    audio.noise({ duration: 0.12, gain: 0.09, type: "bandpass", freq: 900, q: 0.7 });
    addShake(0.02, 0.18);
    if (hit.health <= 0) killEnemy(hit);
    else ui.subtitle("You drive the blade in. It keeps moving.", 1500);
  } else {
    audio.noise({ duration: 0.12, gain: 0.07, type: "highpass", freq: 1400 });
    ui.subtitle("You slash at the dark.", 1200);
  }
}

function toggleFlashlight() {
  if (state !== "vent" && state !== "kryl" && state !== "explore") return;
  player.flashlightOn = !player.flashlightOn;
  flashlight.intensity = player.flashlightOn ? 32.0 : 0;
  audio.click();
  ui.subtitle(player.flashlightOn ? "Flashlight on." : "Flashlight off.", 1200);
}

function beginSearch() {
  if (!vent || state !== "vent" || vent.looted || vent.search) return;
  vent.search = { t: 0, duration: 1.15 };
  player.frozen = true;
  audio.noise({ duration: 0.3, gain: 0.045, type: "bandpass", freq: 1200 });
}

function openEnd() {
  if (!vent || state !== "vent" || vent.endTransition) return;
  vent.endTransition = true;
  player.frozen = true;
  ui.prompt(null);
  ui.crosshair(false);
  ui.fadeOut(1000).then(() => startLevel("dead_rail"));
}

function startDialogue() {
  dialogueOpen = true;
  player.frozen = true;
  ui.lookHint(false);
  kryl.page = 0;
  kryl.pages = [
    { speaker: "TOKAR", text: "You're late. I was starting to think the vents got you." },
    { speaker: "TOKAR", text: "The scrubbers are dying. Kryl has maybe two days of air. The key is in Zarya." },
    { speaker: "TOKAR", text: "Mara says there's a city beyond the deep vents. Sanctuary. The last safe place. If it's real, we need you to reach it." },
    { speaker: "TOKAR", text: "Take this. It was your father's. Don't fire it in the vents unless you have to." },
    { speaker: "YOU", text: "I'll go." },
  ];
  ui.dialogue(kryl.pages[0].speaker, kryl.pages[0].text);
}

function advanceDialogue() {
  if (!dialogueOpen || !kryl) return;
  kryl.page++;
  if (kryl.page >= kryl.pages.length) {
    dialogueOpen = false;
    player.frozen = false;
    ui.hideDialogue();
    if (!kryl.talked) {
      kryl.talked = true;
      player.hasGun = true;
      player.weapon = "pistol";
      player.ammo = 8;
      player.mags.pistol = 8;
      setWeaponModel("pistol");
      weapon.visible = true;
      audio.click();
    }
    updateLookHint();
  } else {
    ui.dialogue(kryl.pages[kryl.page].speaker, kryl.pages[kryl.page].text);
  }
}

function interact() {
  if (shopOpen) {
    closeShop();
    return;
  }
  if (state === "explore") {
    interactLevel();
    return;
  }
  if (state === "kryl") {
    if (dialogueOpen) {
      advanceDialogue();
      return;
    }
    if (kryl?.nearTokar) {
      if (!kryl.talked) startDialogue();
      else ui.speak("TOKAR", "The vent is behind the counter. Go.", 2200);
      return;
    }
    if (kryl?.nearVent) {
      if (!kryl.talked) {
        ui.speak("TOKAR", "Talk to me first, kid.", 1800);
        return;
      }
      enterVentFromKryl();
      return;
    }
    return;
  }

  if (state === "vent") {
    if (vent?.nearBody) {
      beginSearch();
      return;
    }
    if (vent?.nearExit) {
      if (vent.crawlerKilled) openEnd();
      else ui.subtitle("The hatch is sealed. Something is still moving in the dark.", 2200);
    }
  }
}

function updateWeapon(dt) {
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  weaponKick = Math.max(0, weaponKick - dt * 1.8);
  const canAim = state === "vent" || state === "explore";
  const aiming = player.aiming && canAim && player.hasGun;
  const moving = !player.frozen && !player.forcedCrawl && ["KeyW", "KeyA", "KeyS", "KeyD"].some((k) => keys.has(k));
  const sprinting = moving && (keys.has("ShiftLeft") || keys.has("ShiftRight"));
  const sway = moving ? Math.sin(player.bobTime * 0.5) : 0;
  const targetX = camera.aspect < 1 ? 0.2 : (aiming ? 0.07 : 0.34) + sway * (aiming ? 0.002 : 0.008);
  const targetY = (aiming ? -0.24 : -0.38) + Math.cos(player.bobTime * 0.5) * (moving ? 0.004 : 0);
  weapon.position.x = lerp(weapon.position.x, targetX, Math.min(1, dt * 12));
  weapon.position.y = lerp(weapon.position.y, targetY, Math.min(1, dt * 12));
  weapon.position.z = (aiming ? -0.7 : -0.82) + weaponKick;
  weapon.rotation.x = 0.02 - weaponKick * 0.45;
  weapon.rotation.z = lerp(weapon.rotation.z, sway * (aiming ? 0.004 : 0.015), Math.min(1, dt * 10));
  const targetFov = aiming ? 68 : sprinting ? 88 : camera.aspect < 1 ? 95 : 80;
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov = lerp(camera.fov, targetFov, Math.min(1, dt * 10));
    camera.updateProjectionMatrix();
  }
  muzzle.intensity = Math.max(0, muzzle.intensity - dt * 48);
}

function updateShake(dt) {
  if (shake.time <= 0) {
    shake.intensity = 0;
    return;
  }
  shake.time -= dt;
  const s = shake.intensity * Math.min(1, Math.max(0, shake.time * 3));
  camera.position.x += (Math.random() - 0.5) * s;
  camera.position.y += (Math.random() - 0.5) * s * 0.7;
  camera.rotation.z += (Math.random() - 0.5) * s * 0.25;
}

function update(dt) {
  if (state === "title") updateTitle(dt);
  else if (state === "prologue") updatePrologue(dt);
  else if (state === "kryl") updateKryl(dt);
  else if (state === "vent") updateVent(dt);
  else if (state === "explore") updateExplore(dt);
  else if (state === "jumpscare") updateJumpscare(dt);
  else if (state === "vision") updateVision(dt);
  else if (state === "ending") updateEnding(dt);
  updateWeapon(dt);
  updateCollectBursts(dt);

  const hudOn = ["kryl", "vent", "explore", "jumpscare"].includes(state);
  if (hudOn) {
    ui.hud(true, {
      health: player.health,
      medkits: player.medkits,
      mgr,
      logs: logsFound,
      ammo: player.hasGun ? player.ammo : "--",
      reserve: player.hasGun ? `/ ${player.reserve[player.weapon] ?? 0}` : "",
    });
  } else {
    ui.hud(false);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  update(dt);
  updateShake(dt);
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = camera.aspect < 1 ? 95 : 80;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  weapon.position.x = camera.aspect < 1 ? 0.14 : 0.25;
}

window.addEventListener("resize", onResize);
onResize();

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== canvas) return;
  if (state === "prologue" && prologue && !prologue.allowLook) return;
  if (dialogueOpen) return;
  const sens = 0.0022;
  player.yaw -= e.movementX * sens;
  player.pitch -= e.movementY * sens;
  if (state === "prologue") {
    player.yaw = clamp(player.yaw, -1.35, 1.35);
    player.pitch = clamp(player.pitch, -1.15, 0.7);
  } else {
    player.pitch = clamp(player.pitch, -1.25, 1.25);
  }
  applyLook();
});

document.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    if (state === "vent" || state === "explore" || state === "kryl") player.aiming = true;
    return;
  }
  if (e.button !== 0) return;
  if (dialogueOpen) {
    advanceDialogue();
    return;
  }
  if (state === "jumpscare") {
    crawlerShot();
    return;
  }
  if (state === "vision") {
    finishVision();
    return;
  }
  if ((state === "vent" || state === "explore") && document.pointerLockElement === canvas && !dialogueOpen && !shopOpen) fire();
});

document.addEventListener("mouseup", (e) => {
  if (e.button === 2) player.aiming = false;
});

document.addEventListener("keydown", (e) => {
  if (state === "title") {
    if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      startGame();
    }
    return;
  }
  if (e.code === "Escape") {
    if (shopOpen) closeShop();
    ui.prompt(null);
    return;
  }
  if (state === "jumpscare") {
    if (e.code === "KeyV") resolveJumpscare(true);
    return;
  }
  if (state === "vision") {
    if (e.code === "KeyE" || e.code === "Enter" || e.code === "Space") finishVision();
    return;
  }
  if (state === "ending") return;
  if (e.code === "KeyE" || e.code === "Enter") {
    if (dialogueOpen) {
      advanceDialogue();
      return;
    }
    interact();
    return;
  }
  if (e.code === "Digit1") { switchWeapon("pistol"); return; }
  if (e.code === "Digit2") { switchWeapon("shotgun"); return; }
  if (e.code === "Digit3") { switchWeapon("rifle"); return; }
  if (e.code === "KeyH") {
    useMedkit();
    return;
  }
  if (e.code === "KeyF") {
    toggleFlashlight();
    return;
  }
  if (e.code === "KeyR") {
    reload();
    return;
  }
  if (e.code === "KeyT") {
    checkAmmo();
    return;
  }
  if (e.code === "KeyV") {
    melee();
    return;
  }
  keys.add(e.code);
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
});

document.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});

document.addEventListener("contextmenu", (e) => e.preventDefault());

canvas.addEventListener("click", () => {
  audio.init();
  if (state === "title") return;
  if (document.pointerLockElement !== canvas) lockPointer();
});

// A click anywhere on the title starts the game, even if the button's own
// listener was not attached for any reason. Starting on the click event keeps
// the pointer-lock request inside a trusted user gesture.
document.addEventListener("click", () => {
  if (state === "title") startGame();
}, true);

function startGame() {
  if (state !== "title") return;
  const btn = document.getElementById("start");
  if (btn) {
    btn.classList.add("pressed");
    btn.setAttribute("aria-busy", "true");
  }
  window.__intakeBootStatus?.("");
  try {
    audio.init();
  } catch (err) {
    // Audio is optional; the game must still start.
  }
  try {
    hideTitle();
    startPrologue();
    lockPointer();
    setTimeout(updateLookHint, 300);
  } catch (err) {
    console.error("INTAKE failed to start:", err);
    window.__intakeBootStatus?.("START FAILED. OPEN THE BROWSER CONSOLE OR HARD-REFRESH.");
    if (btn) {
      btn.classList.remove("pressed");
      btn.setAttribute("aria-busy", "false");
    }
    try {
      resetCommon();
      state = "title";
      levelId = null;
      prologue = null;
      audio.stopLoops();
      startTitleScene();
      ui.showTitle(true);
      ui.clearFade();
    } catch (resetErr) {
      console.error("INTAKE could not return to the title:", resetErr);
      ui.showTitle(true);
    }
  }
}
window.__intakeStart = startGame;

document.getElementById("start").addEventListener("click", () => {
  startGame();
});

document.getElementById("title").addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  startGame();
});

document.getElementById("retry").addEventListener("click", () => {
  audio.init();
  ui.death(false);
  retryLevel();
  lockPointer();
});

document.getElementById("shop-close").addEventListener("click", () => {
  closeShop();
});

document.getElementById("restart").addEventListener("click", () => {
  window.location.reload();
});

// Debug handles for testing. Safe to leave in the build; they do not affect normal play.
window.__intake = {
  get state() { return state; },
  get player() { return player; },
  get ammo() { return player.ammo; },
  get mgr() { return mgr; },
  get vent() { return vent; },
  get kryl() { return kryl; },
  get prologue() { return prologue; },
  get refs() { return world?.refs; },
  get level() { return level; },
  get levelId() { return levelId; },
  get health() { return player.health; },
  get logs() { return logsFound; },
  get weapon() { return player.weapon; },
  get owned() { return player.owned; },
  get keys() { return [...keys]; },
  get crouched() { return player.crouched; },
  get scene() { return scene; },
  get camera() { return camera; },
  get ambient() { return ambient; },
  get audio() { return audio; },
  get flashlight() { return flashlight; },
  get renderer() { return renderer; },
  snapshot() {
    return {
      state,
      pos: player.pos.toArray(),
      ammo: player.ammo,
      mgr,
      health: player.health,
      medkits: player.medkits,
      weapon: player.weapon,
      owned: { ...player.owned },
      hasGun: player.hasGun,
      levelId,
      logs: logsFound,
      shopOpen,
      vision: vision ? { id: vision.id, t: vision.t } : null,
      prompt: document.getElementById("prompt").textContent,
      promptOn: document.getElementById("prompt").classList.contains("on"),
      subtitle: document.getElementById("subtitle").textContent,
      dialogue: document.getElementById("dialogue-text").textContent,
      dialogueOn: document.getElementById("dialogue").classList.contains("on"),
      deathOn: document.getElementById("death").classList.contains("on"),
      endOn: document.getElementById("end").classList.contains("on"),
      jumpscareOn: document.getElementById("jumpscare").classList.contains("on"),
      chapterOn: document.getElementById("chapter").classList.contains("on"),
      vent: vent ? { triggered: vent.triggered, warning: vent.warning, looted: vent.looted, crawlerKilled: vent.crawlerKilled } : null,
      prologue: prologue ? { step: prologue.step, t: prologue.t } : null,
    };
  },
  step(seconds = 0.1) {
    update(seconds);
    updateShake(seconds);
    renderer.render(scene, camera);
    return this.snapshot();
  },
  screenshot() {
    update(0.001);
    updateShake(0.001);
    renderer.render(scene, camera);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "intake-debug.png";
    a.click();
    return "download";
  },
  goto(sceneName) {
    if (sceneName === "prologue") startPrologue();
    else if (sceneName === "kryl") startKryl();
    else if (sceneName === "vent") startVent();
    else if (sceneName === "title") { resetCommon(); state = "title"; levelId = null; startTitleScene(); ui.showTitle(true); ui.setFade(1, 0); }
    else if (LEVEL_BUILDERS[sceneName]) startLevel(sceneName);
  },
  addMgr(n) { mgr += n; ui.subtitle(`+${n} MGR`, 1200); return this.snapshot(); },
  give(id) {
    if (!player.owned[id]) {
      player.owned[id] = true;
      player.mags[id] = WEAPONS[id].cap;
      player.reserve[id] += WEAPONS[id].cap * 2;
    }
    return this.snapshot();
  },
  heal() { player.health = 100; player.medkits = Math.max(player.medkits, 2); ui.subtitle("Debug heal.", 1200); return this.snapshot(); },
  useMedkit() { useMedkit(); return this.snapshot(); },
  triggerAmbush() {
    if (state === "vent") {
      vent.triggered = true;
      vent.warning = 1.0;
      player.frozen = true;
      audio.scrape();
      ui.subtitle("Something runs on metal above you.", 1800);
    }
  },
  fire() { fire(); return this.snapshot(); },
  melee() { melee(); return this.snapshot(); },
  reload() { reload(); return this.snapshot(); },
  checkAmmo() { checkAmmo(); return this.snapshot(); },
  kill() { resolveJumpscare(true); },
  die() { resolveJumpscare(false); },
  jumpscareHit() { if (state === "jumpscare") resolveJumpscare(true); return this.snapshot(); },
  setPos(x, z) { player.pos.set(x, 0, z); },
  look(yaw, pitch) { player.yaw = yaw; player.pitch = pitch; applyLook(); },
  setHealth(h) { player.health = h; return this.snapshot(); },
  damage(n) { hurtPlayer(n); return this.snapshot(); },
  interact() { interact(); return this.snapshot(); },
  scare() { startCeilingCrawler(); return this.snapshot(); },
  worldInfo() {
    if (!world) return null;
    return {
      name: levelId,
      refs: Object.fromEntries(
        Object.entries(world.refs || {}).map(([k, v]) => [
          k,
          v?.isVector3
            ? [v.x, v.z]
            : v?.position
              ? [v.position.x, v.position.z]
              : Array.isArray(v)
                ? `${v.length} items`
                : typeof v,
        ])
      ),
      interactables: (world.interactables || []).map((i) => ({
        kind: i.kind,
        pos: i.pos ? [i.pos.x, i.pos.z] : null,
        prompt: i.prompt || null,
        text: i.text || null,
        requirement: i.requirement || null,
      })),
      triggers: (world.triggers || []).map((t) => ({
        kind: t.kind,
        pos: [t.pos.x, t.pos.z],
        radius: t.radius,
        fired: !!t.fired,
        visionId: t.visionId ?? null,
      })),
    };
  },
  skipToVent() { startVent(); },
  skipToKryl() { startKryl(); },
};

const params = new URLSearchParams(window.location.search);
window.THREE = THREE;
const sceneParam = params.get("scene");
if (sceneParam === "vent" || sceneParam === "kryl" || LEVEL_BUILDERS[sceneParam]) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      hideTitle();
      if (sceneParam === "vent") startVent();
      else if (sceneParam === "kryl") startKryl();
      else startLevel(sceneParam);
    }, 60);
  });
}

startTitleScene();
ui.showTitle(true);
ui.clearFade();
window.__intakeBooted = true;
window.__intakeBootStatus?.("");
animate();
