const COIN_SVG = `<svg class="coin" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6"/></svg>`;
const CHECK_SVG = `<svg class="check" viewBox="0 0 32 32" aria-hidden="true"><path d="M6 17l7 7L26 9"/></svg>`;

const SHOP_ICONS = {
  shotgun: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 40l30-14 5 8-13 7 3 6-7 3-4-7-12 6z"/><path d="M36 27l13-5 8 3-3 7-13 3"/><path d="M16 48l6-3"/></svg>`,
  rifle: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M4 34h47l9 4-4 6H36l-9 8-7-3 5-9H9z"/><path d="M25 34v-8h9v8"/><path d="M38 34v-5h12v5"/></svg>`,
  pistol_ammo: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 8h10v22l-2 6h-6l-2-6z"/><path d="M34 8h10v22l-2 6h-6l-2-6z"/><path d="M23 44h4v12h-4zM37 44h4v12h-4z"/></svg>`,
  shotgun_ammo: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 10h10v26l-2 4h-6l-2-4z"/><path d="M16 44h14v12H16z"/><path d="M36 10h10v26l-2 4h-6l-2-4z"/><path d="M34 44h14v12H34z"/></svg>`,
  rifle_ammo: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M21 6h8v38l-4 12-4-12z"/><path d="M35 6h8v38l-4 12-4-12z"/></svg>`,
  medkit: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="9" y="13" width="46" height="40" rx="4"/><path d="M27 20h10v11h11v10H37v11H27V41H16V31h11z"/></svg>`,
  generic: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M32 18v28M18 32h28"/></svg>`,
};

function shopIcon(id) {
  return SHOP_ICONS[id] || SHOP_ICONS.generic;
}

function bump(el) {
  if (!el) return;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

export class UI {
  constructor() {
    this.el = {
      title: document.getElementById("title"),
      fade: document.getElementById("fade"),
      chapter: document.getElementById("chapter"),
      chapterKicker: document.getElementById("chapter-kicker"),
      chapterTitle: document.getElementById("chapter-title"),
      chapterSub: document.getElementById("chapter-sub"),
      subtitle: document.getElementById("subtitle"),
      prompt: document.getElementById("prompt"),
      crosshair: document.getElementById("crosshair"),
      lookHint: document.getElementById("look-hint"),
      hud: document.getElementById("hud"),
      hudHealthBar: document.getElementById("hud-health-bar"),
      hudHealth: document.getElementById("hud-health"),
      hudMedkits: document.getElementById("hud-medkits"),
      hudMgrNum: document.getElementById("hud-mgr-num"),
      hudLogs: document.getElementById("hud-logs"),
      hudWeaponName: document.getElementById("hud-weapon-name"),
      hudAmmoNum: document.getElementById("hud-ammo-num"),
      hudReserve: document.getElementById("hud-reserve"),
      visionSkip: document.getElementById("vision-skip"),
      dialogue: document.getElementById("dialogue"),
      dialogueSpeaker: document.getElementById("dialogue-speaker"),
      dialogueText: document.getElementById("dialogue-text"),
      jumpscare: document.getElementById("jumpscare"),
      jumpscareBar: document.getElementById("jumpscare-bar"),
      death: document.getElementById("death"),
      end: document.getElementById("end"),
      hurt: document.getElementById("hurt"),
      vision: document.getElementById("vision"),
      visionKicker: document.getElementById("vision-kicker"),
      visionText: document.getElementById("vision-text"),
      shop: document.getElementById("shop"),
      shopMgr: document.getElementById("shop-mgr-num"),
      shopItems: document.getElementById("shop-items"),
      shopClose: document.getElementById("shop-close"),
      flash: document.getElementById("flash"),
      timer: null,
      subTimer: null,
      chapterTimer: null,
      flashTimer: null,
    };
  }

  showTitle(show) {
    this.el.title.classList.toggle("hidden", !show);
  }

  crosshair(show) {
    this.el.crosshair.classList.toggle("on", show);
  }

  hitmark() {
    this.el.crosshair.classList.add("hit");
    clearTimeout(this.hitTimer);
    this.hitTimer = setTimeout(() => this.el.crosshair.classList.remove("hit"), 120);
  }

  lookHint(show) {
    // Mouse capture is automatic; no text hint is shown.
    this.el.lookHint.classList.remove("on");
  }

  hud(show, data = null) {
    this.el.hud.classList.toggle("on", show);
    if (!show || !data) return;
    const prev = this._hudPrev || {};
    this.el.hudHealthBar.style.width = `${Math.max(0, Math.min(100, data.health))}%`;
    this.el.hudHealthBar.style.background = data.health <= 30
      ? "linear-gradient(90deg, #7d1f16, #d06a3a)"
      : "linear-gradient(90deg, #9e4a2a, #85a66a)";
    this.el.hudHealth.textContent = String(Math.round(data.health));
    this.el.hudMedkits.textContent = String(data.medkits);
    this.el.hudMgrNum.textContent = String(data.mgr);
    this.el.hudLogs.textContent = String(data.logs);
    this.el.hudAmmoNum.textContent = String(data.ammo);
    this.el.hudReserve.textContent = data.reserve;
    if (prev.health !== data.health) bump(this.el.hudHealth);
    if (prev.medkits !== data.medkits) bump(this.el.hudMedkits);
    if (prev.mgr !== data.mgr) bump(this.el.hudMgrNum);
    if (prev.logs !== data.logs) bump(this.el.hudLogs);
    if (prev.ammo !== data.ammo) bump(this.el.hudAmmoNum);
    this._hudPrev = {
      health: data.health,
      medkits: data.medkits,
      mgr: data.mgr,
      logs: data.logs,
      ammo: data.ammo,
    };
  }

  subtitle(text, ms = 2600) {
    // Narration is intentionally suppressed. Only character speech uses speak().
    return;
  }

  speak(speaker, text, ms = 2600) {
    clearTimeout(this.subTimer);
    this.el.subtitle.textContent = speaker ? `${speaker}: ${text}` : text;
    this.el.subtitle.classList.add("on");
    this.subTimer = setTimeout(() => this.el.subtitle.classList.remove("on"), ms);
  }

  clearSubtitle() {
    clearTimeout(this.subTimer);
    this.el.subtitle.classList.remove("on");
    this.el.subtitle.textContent = "";
  }

  prompt(html) {
    // Prompts are suppressed; interaction is visual/automatic.
    this.el.prompt.classList.remove("on");
    this.el.prompt.innerHTML = "";
  }

  chapter(kicker, title, sub, ms = 3500) {
    // Chapter titles are intentionally suppressed; transitions use visuals only.
    this.el.chapter.classList.remove("on");
  }

  hideChapter() {
    clearTimeout(this.chapterTimer);
    this.el.chapter.classList.remove("on");
  }

  dialogue(speaker, text) {
    this.el.dialogueSpeaker.textContent = speaker || "";
    this.el.dialogueText.textContent = text || "";
    this.el.dialogue.classList.add("on");
  }

  hideDialogue() {
    this.el.dialogue.classList.remove("on");
  }

  jumpscare(show) {
    this.el.jumpscare.classList.toggle("on", show);
    if (!show) this.el.jumpscareBar.style.transform = "scaleX(1)";
  }

  jumpscareProgress(p) {
    this.el.jumpscareBar.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
  }

  hurt() {
    this.el.hurt.classList.add("on");
    clearTimeout(this.hurtTimer);
    this.hurtTimer = setTimeout(() => this.el.hurt.classList.remove("on"), 240);
  }

  vision(show) {
    this.el.vision.classList.toggle("on", show);
  }

  visionText(text) {
    // Vision captions are visual-only; no text is rendered.
  }

  shop(show) {
    this.el.shop.classList.toggle("on", show);
  }

  shopMgr(amount) {
    this.el.shopMgr.textContent = String(amount);
  }

  shopItems(items, onBuy) {
    this.el.shopItems.innerHTML = "";
    for (const item of items) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "shop-item";
      row.setAttribute("aria-label", item.name);
      row.disabled = item.owned || item.price > item.mgr;
      const icon = document.createElement("span");
      icon.className = "shop-icon";
      icon.innerHTML = shopIcon(item.id);
      const price = document.createElement("span");
      price.className = "shop-price";
      price.innerHTML = item.owned ? CHECK_SVG : `${COIN_SVG}<span>${item.price}</span>`;
      row.append(icon, price);
      row.addEventListener("click", () => onBuy(item));
      this.el.shopItems.append(row);
    }
  }

  visionSkip(show) {
    this.el.visionSkip.classList.toggle("on", show);
  }

  death(show) {
    this.el.death.classList.toggle("on", show);
  }

  end(show) {
    this.el.end.classList.toggle("on", show);
  }

  setFade(opacity, ms = 800) {
    this.el.fade.style.display = "block";
    this.el.fade.style.transition = `opacity ${ms}ms ease`;
    this.el.fade.style.opacity = String(opacity);
  }

  clearFade() {
    this.el.fade.style.transition = "none";
    this.el.fade.style.opacity = "0";
    this.el.fade.style.display = "none";
  }

  fadeOut(ms = 900) {
    this.setFade(1, ms);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  fadeIn(ms = 900) {
    this.setFade(0, ms);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  flash(duration = 220, color = "#f4efe0") {
    clearTimeout(this.flashTimer);
    this.el.flash.style.background = color;
    this.el.flash.style.transition = "none";
    this.el.flash.style.opacity = "0.92";
    this.flashTimer = setTimeout(() => {
      this.el.flash.style.transition = `opacity ${duration}ms ease`;
      this.el.flash.style.opacity = "0";
    }, 24);
  }

  hideAllOverlays() {
    this.el.chapter.classList.remove("on");
    this.el.dialogue.classList.remove("on");
    this.el.jumpscare.classList.remove("on");
    this.el.death.classList.remove("on");
    this.el.end.classList.remove("on");
    this.el.prompt.classList.remove("on");
    this.el.subtitle.classList.remove("on");
    this.el.vision.classList.remove("on");
    this.el.shop.classList.remove("on");
    this.el.hurt.classList.remove("on");
    this.el.lookHint.classList.remove("on");
    this.el.visionSkip.classList.remove("on");
  }
}
