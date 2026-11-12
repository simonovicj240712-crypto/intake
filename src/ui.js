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
      shopMgr: document.getElementById("shop-mgr"),
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
    this.el.lookHint.classList.toggle("on", show);
  }

  hud(show, data = null) {
    this.el.hud.classList.toggle("on", show);
    if (!show || !data) return;
    this.el.hudHealthBar.style.width = `${Math.max(0, Math.min(100, data.health))}%`;
    this.el.hudHealthBar.style.background = data.health <= 30
      ? "linear-gradient(90deg, #7d1f16, #d06a3a)"
      : "linear-gradient(90deg, #9e4a2a, #85a66a)";
    this.el.hudHealth.textContent = String(Math.round(data.health));
    this.el.hudMedkits.textContent = `+${data.medkits} MED`;
    this.el.hudMgrNum.textContent = String(data.mgr);
    this.el.hudLogs.textContent = String(data.logs);
    this.el.hudWeaponName.textContent = data.weaponName;
    this.el.hudAmmoNum.textContent = String(data.ammo);
    this.el.hudReserve.textContent = data.reserve;
  }

  subtitle(text, ms = 2600) {
    clearTimeout(this.subTimer);
    this.el.subtitle.textContent = text;
    this.el.subtitle.classList.add("on");
    this.subTimer = setTimeout(() => this.el.subtitle.classList.remove("on"), ms);
  }

  clearSubtitle() {
    clearTimeout(this.subTimer);
    this.el.subtitle.classList.remove("on");
    this.el.subtitle.textContent = "";
  }

  prompt(html) {
    if (!html) {
      this.el.prompt.classList.remove("on");
      this.el.prompt.innerHTML = "";
      return;
    }
    this.el.prompt.innerHTML = html;
    this.el.prompt.classList.add("on");
  }

  chapter(kicker, title, sub, ms = 3500) {
    clearTimeout(this.chapterTimer);
    this.el.chapterKicker.textContent = kicker || "";
    this.el.chapterTitle.textContent = title || "";
    this.el.chapterSub.textContent = sub || "";
    this.el.chapter.classList.add("on");
    if (ms > 0) {
      this.chapterTimer = setTimeout(() => this.el.chapter.classList.remove("on"), ms);
    }
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

  vision(show, kicker = "", text = "") {
    this.el.vision.classList.toggle("on", show);
    if (show) {
      this.el.visionKicker.textContent = kicker;
      this.el.visionText.textContent = text;
    }
  }

  visionText(text) {
    this.el.visionText.textContent = text;
  }

  shop(show) {
    this.el.shop.classList.toggle("on", show);
  }

  shopMgr(amount) {
    this.el.shopMgr.textContent = `${amount} MGR`;
  }

  shopItems(items, onBuy) {
    this.el.shopItems.innerHTML = "";
    for (const item of items) {
      const row = document.createElement("div");
      row.className = "shop-item";
      const info = document.createElement("div");
      info.className = "shop-item-info";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const desc = document.createElement("span");
      desc.textContent = item.desc;
      info.append(name, desc);
      const btn = document.createElement("button");
      btn.className = "shop-buy";
      btn.textContent = item.owned ? "OWNED" : `${item.price} MGR`;
      btn.disabled = item.owned || item.price > item.mgr;
      btn.addEventListener("click", () => onBuy(item));
      row.append(info, btn);
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
