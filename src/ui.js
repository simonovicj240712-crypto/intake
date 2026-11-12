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
      dialogue: document.getElementById("dialogue"),
      dialogueSpeaker: document.getElementById("dialogue-speaker"),
      dialogueText: document.getElementById("dialogue-text"),
      jumpscare: document.getElementById("jumpscare"),
      jumpscareBar: document.getElementById("jumpscare-bar"),
      death: document.getElementById("death"),
      end: document.getElementById("end"),
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

  subtitle(text, ms = 2600) {
    clearTimeout(this.subTimer);
    this.el.subtitle.textContent = text;
    this.el.subtitle.classList.add("on");
    this.subTimer = setTimeout(() => this.el.subtitle.classList.remove("on"), ms);
  }

  clearSubtitle() {
    clearTimeout(this.subTimer);
    this.el.subtitle.classList.remove("on");
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

  death(show) {
    this.el.death.classList.toggle("on", show);
  }

  end(show) {
    this.el.end.classList.toggle("on", show);
  }

  setFade(opacity, ms = 800) {
    this.el.fade.style.transition = `opacity ${ms}ms ease`;
    this.el.fade.style.opacity = String(opacity);
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
  }
}
