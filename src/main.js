import * as THREE from "three";
import { AudioEngine } from "./audio.js";
import { UI } from "./ui.js";
import {
  buildDiningRoom,
  buildCrawlspace,
  buildKryl,
  buildVent,
  makePistol,
} from "./world.js";

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
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
const flashlight = new THREE.SpotLight(0xcfe2d3, 0, 24, Math.PI * 0.29, 0.7, 0.45);
flashlight.position.set(0.08, -0.05, 0);
flashlight.target = flashTarget;
camera.add(flashlight);
flashTarget.position.set(0, -0.35, -1);

const headlamp = new THREE.PointLight(0xb6cab9, 0, 9, 1.45);
headlamp.position.set(0.08, 0.02, 0);
camera.add(headlamp);

const weapon = new THREE.Group();
weapon.position.set(0.29, -0.26, -0.58);
weapon.rotation.set(0.02, -0.06, -0.02);
const pistol = makePistol();
weapon.add(pistol);
const glove = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.14, 0.24),
  new THREE.MeshLambertMaterial({ color: 0x202723, flatShading: true })
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

let state = "title";
let world = null;
let worldGroup = null;
let prologue = null;
let kryl = null;
let vent = null;
let jumpscare = null;
let dialogueOpen = false;
let bodyLooted = false;
let mgr = 0;
let weaponKick = 0;
let gunshotWarned = false;
let shake = { time: 0, intensity: 0 };
let debugMode = false;

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

function resetCommon() {
  dialogueOpen = false;
  jumpscare = null;
  player.frozen = false;
  player.hasGun = false;
  player.flashlightOn = false;
  player.forcedCrawl = false;
  player.ammo = 8;
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
  ui.prompt(null);
  ui.crosshair(false);
}

function hideTitle() {
  ui.showTitle(false);
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
  ui.subtitle("Click the screen to capture the mouse.", 3000);
});

function startPrologue() {
  hideTitle();
  resetCommon();
  state = "prologue";
  jumpscare = null;
  bodyLooted = false;
  mgr = 0;
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
  ui.subtitle("Mom: Eat while it's warm.", 2400);
  ui.setFade(1, 0);
  setTimeout(() => ui.fadeIn(1200), 100);
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
  ui.subtitle("Dad: Don't make a sound.", 2600);
  prologue = {
    step: "crawl",
    t: 0,
    allowLook: true,
    gunshot: false,
    transitioning: false,
  };
}

function updatePrologue(dt) {
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
      ui.subtitle("Dad: Go with your mother. Now.", 2500);
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

function startKryl() {
  resetCommon();
  state = "kryl";
  prologue = null;
  kryl = null;
  const res = loadWorld(buildKryl());
  scene.background.setHex(0x050605);
  setFog(0x0a0d0b, 0.03);
  ambient.color.setHex(0xa07850);
  ambient.intensity = 1.15;
  player.pos.set(0, 0, 4.8);
  player.yaw = 0;
  player.pitch = 0;
  player.height = 1.65;
  player.crouched = false;
  player.forcedCrawl = false;
  player.frozen = false;
  player.hasGun = false;
  player.flashlightOn = false;
  flashlight.intensity = 0;
  headlamp.intensity = 2.0;
  weapon.visible = false;
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  ui.crosshair(true);
  audio.setAmbient(0.05);
  kryl = { talked: false, pages: [], page: 0, nearTokar: false, nearVent: false };
  ui.chapter("KRYL STATION", "YEARS LATER", "The last safe place you know", 3000);
  setTimeout(() => {
    if (state === "kryl") ui.subtitle("Tokar: Over here, kid.", 2600);
  }, 2900);
  ui.setFade(1, 0);
  setTimeout(() => ui.fadeIn(1000), 100);
}

function startVent(retry = false) {
  resetCommon();
  state = "vent";
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
  player.flashlightOn = true;
  player.ammo = 8;
  flashlight.intensity = 24.0;
  headlamp.intensity = 1.2;
  weapon.visible = true;
  camera.position.set(player.pos.x, player.height, player.pos.z);
  applyLook();
  ui.crosshair(true);
  ui.prompt(null);
  audio.setAmbient(0.06);
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
  setTimeout(() => {
    if (state === "vent") ui.subtitle("WASD move · F flashlight · Ctrl crouch · E search · LMB fire", 5000);
  }, 2200);
  ui.setFade(1, 0);
  setTimeout(() => ui.fadeIn(900), 100);
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
  flashlight.intensity = player.flashlightOn ? 24.0 : 0;
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

function updateKryl(dt) {
  if (!world || !kryl) return;
  player.forcedCrawl = false;
  updatePlayer(dt);
  if (dialogueOpen) {
    ui.prompt(null);
    return;
  }

  const refs = world.refs;
  kryl.nearTokar = distXZ(player.pos, refs.tokar.position) < 2.75;
  kryl.nearVent = distXZ(player.pos, new THREE.Vector3(0, 0, -6.2)) < 2.35;

  if (kryl.nearTokar) {
    ui.prompt(kryl.talked ? "<b>E</b> TALK TO TOKAR" : "<b>E</b> TALK TO TOKAR");
  } else if (kryl.nearVent) {
    ui.prompt(kryl.talked ? "<b>E</b> OPEN THE VENT" : "<b>E</b> TALK TO TOKAR FIRST");
  } else {
    ui.prompt(null);
  }
}

function updateVent(dt) {
  if (!world || !vent) return;

  if (vent.search) {
    vent.search.t += dt;
    ui.prompt("<b>...</b> SEARCHING THE BODY");
    if (vent.search.t >= vent.search.duration) {
      vent.search = null;
      vent.looted = true;
      bodyLooted = true;
      player.frozen = false;
      player.ammo = Math.min(24, player.ammo + 8);
      mgr += 6;
      audio.click();
      ui.prompt(null);
      ui.subtitle(`Pistol rounds +8 · MGR +6 · Filter +1  (${mgr} MGR)`, 3200);
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

  if (vent.nearBody) {
    ui.prompt("<b>E</b> SEARCH BODY");
  } else if (vent.nearExit) {
    ui.prompt(vent.crawlerKilled ? "<b>E</b> OPEN THE HATCH" : "<b>E</b> THE HATCH IS SEALED");
  } else {
    ui.prompt(null);
  }

  if (player.pos.z < -2.2 && player.pos.z > -5.4) {
    if (!vent.crawlHinted) {
      vent.crawlHinted = true;
      ui.subtitle("Crawl. Keep your head down.", 2200);
    }
  }
}

function beginJumpscare() {
  if (!world || !world.refs.crawler) return;
  state = "jumpscare";
  const refs = world.refs;
  const c = refs.crawler;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  c.visible = true;
  c.position.set(
    camera.position.x + forward.x * 1.18,
    0.52,
    camera.position.z + forward.z * 1.18
  );
  c.scale.set(1.5, 1.5, 1.5);
  c.lookAt(camera.position.x, 0.8, camera.position.z);
  ui.jumpscare(true);
  ui.jumpscareProgress(1);
  audio.scream();
  addShake(0.07, 0.6);
  jumpscare = { t: 0, duration: 1.8, resolved: false };
}

function updateJumpscare(dt) {
  if (!jumpscare || jumpscare.resolved) return;
  jumpscare.t += dt;
  const p = 1 - jumpscare.t / jumpscare.duration;
  ui.jumpscareProgress(p);
  if (world?.refs?.crawler) {
    world.refs.crawler.scale.setScalar(1.5 + jumpscare.t * 0.1);
    world.refs.crawler.rotation.z = Math.sin(jumpscare.t * 30) * 0.06;
  }
  addShake(0.04, 0.1);
  if (jumpscare.t >= jumpscare.duration) resolveJumpscare(false);
}

function resolveJumpscare(success) {
  if (!jumpscare || jumpscare.resolved) return;
  jumpscare.resolved = true;
  ui.jumpscare(false);
  if (success) {
    state = "vent";
    player.frozen = false;
    vent.crawlerKilled = true;
    if (world?.refs?.crawler) {
      world.refs.crawler.rotation.z = Math.PI / 2;
      world.refs.crawler.position.y = 0.14;
      world.refs.crawler.scale.setScalar(1.3);
    }
    audio.scream();
    ui.subtitle("It stops moving. The vent is quiet again.", 2600);
    addShake(0.02, 0.3);
  } else {
    state = "dead";
    player.frozen = true;
    ui.death(true);
    audio.heartbeat(0.1);
  }
}

function fire() {
  if (state !== "vent" || dialogueOpen) return;
  if (player.ammo <= 0) {
    audio.click();
    ui.subtitle("Empty. R to reload.", 1400);
    return;
  }
  player.ammo--;
  audio.gunshot();
  muzzle.intensity = 7;
  weaponKick = 0.16;
  addShake(0.018, 0.14);
  if (!gunshotWarned) {
    gunshotWarned = true;
    ui.subtitle("A gunshot in the vent is a dinner bell.", 2200);
  }
}

function reload() {
  if (state !== "vent") return;
  player.ammo = 8;
  audio.click();
  ui.subtitle("Reloaded. 8 in the magazine.", 1500);
}

function checkAmmo() {
  if (state !== "vent") return;
  audio.click();
  ui.subtitle(`${player.ammo} in the magazine.`, 1500);
}

function melee() {
  if (state === "jumpscare") {
    resolveJumpscare(true);
    return;
  }
  if (state !== "vent") return;
  audio.noise({ duration: 0.12, gain: 0.07, type: "highpass", freq: 1400 });
  ui.subtitle("You slash at the dark.", 1200);
}

function toggleFlashlight() {
  if (state !== "vent" && state !== "kryl") return;
  player.flashlightOn = !player.flashlightOn;
  flashlight.intensity = player.flashlightOn ? 24.0 : 0;
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
  ui.fadeOut(1000).then(() => {
    state = "end";
    audio.setAmbient(0.012);
    ui.end(true);
    ui.setFade(1, 0);
  });
}

function startDialogue() {
  dialogueOpen = true;
  player.frozen = true;
  kryl.page = 0;
  kryl.pages = [
    { speaker: "TOKAR", text: "You're late. I was starting to think the vents got you." },
    { speaker: "TOKAR", text: "The scrubbers are dying. Kryl has maybe two days of air. The key is in Zarya." },
    { speaker: "TOKAR", text: "Mara says there's a city beyond the deep vents. Sanctuary. The last safe place. If it's real, we need you to reach it." },
    { speaker: "TOKAR", text: "Take this. It was your father's. Don't fire it in the vents unless you have to." },
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
      player.ammo = 8;
      weapon.visible = true;
      audio.click();
      ui.subtitle("Objective: reach the maintenance vent.", 3200);
    }
  } else {
    ui.dialogue(kryl.pages[kryl.page].speaker, kryl.pages[kryl.page].text);
  }
}

function interact() {
  if (state === "kryl") {
    if (dialogueOpen) {
      advanceDialogue();
      return;
    }
    if (kryl?.nearTokar) {
      if (!kryl.talked) startDialogue();
      else ui.subtitle("Tokar: The vent is behind the counter. Go.", 2200);
      return;
    }
    if (kryl?.nearVent) {
      if (!kryl.talked) {
        ui.subtitle("Tokar: Talk to me first, kid.", 1800);
        return;
      }
      player.frozen = true;
      ui.fadeOut(1000).then(() => startVent());
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
  weaponKick = Math.max(0, weaponKick - dt * 1.8);
  weapon.position.z = -0.58 + weaponKick;
  weapon.rotation.x = 0.02 - weaponKick * 0.45;
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
  if (state === "prologue") updatePrologue(dt);
  else if (state === "kryl") updateKryl(dt);
  else if (state === "vent") updateVent(dt);
  else if (state === "jumpscare") updateJumpscare(dt);
  updateWeapon(dt);
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
  weapon.position.x = camera.aspect < 1 ? 0.17 : 0.29;
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
    player.pitch = clamp(player.pitch, -0.55, 0.5);
  } else {
    player.pitch = clamp(player.pitch, -1.25, 1.25);
  }
  applyLook();
});

document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (state === "jumpscare") {
    resolveJumpscare(true);
    return;
  }
  if (state === "vent" && document.pointerLockElement === canvas && !dialogueOpen) fire();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    ui.prompt(null);
    return;
  }
  if (state === "jumpscare") {
    if (e.code === "KeyV") resolveJumpscare(true);
    return;
  }
  if (e.code === "KeyE" || e.code === "Enter") {
    if (dialogueOpen) {
      advanceDialogue();
      return;
    }
    interact();
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
  if (state === "title") return;
  if (document.pointerLockElement !== canvas) lockPointer();
});

document.getElementById("start").addEventListener("click", () => {
  audio.init();
  hideTitle();
  lockPointer();
  startPrologue();
});

document.getElementById("retry").addEventListener("click", () => {
  audio.init();
  ui.death(false);
  startVent(true);
  lockPointer();
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
  get keys() { return [...keys]; },
  get crouched() { return player.crouched; },
  get scene() { return scene; },
  get camera() { return camera; },
  get ambient() { return ambient; },
  get flashlight() { return flashlight; },
  get renderer() { return renderer; },
  snapshot() {
    return {
      state,
      pos: player.pos.toArray(),
      ammo: player.ammo,
      mgr,
      hasGun: player.hasGun,
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
    else if (sceneName === "title") { resetCommon(); state = "title"; ui.showTitle(true); ui.setFade(1, 0); }
  },
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
  reload() { reload(); return this.snapshot(); },
  checkAmmo() { checkAmmo(); return this.snapshot(); },
  kill() { resolveJumpscare(true); },
  die() { resolveJumpscare(false); },
  setPos(x, z) { player.pos.set(x, 0, z); },
  look(yaw, pitch) { player.yaw = yaw; player.pitch = pitch; applyLook(); },
  skipToVent() { startVent(); },
  skipToKryl() { startKryl(); },
};

const params = new URLSearchParams(window.location.search);
window.THREE = THREE;
if (params.get("scene") === "vent") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      hideTitle();
      startVent();
    }, 60);
  });
} else if (params.get("scene") === "kryl") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      hideTitle();
      startKryl();
    }, 60);
  });
}

ui.showTitle(true);
ui.setFade(1, 0);
setTimeout(() => ui.fadeIn(900), 200);
animate();
