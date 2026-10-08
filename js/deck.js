/* ==========================================================================
   html-slides v1 · deck.js
   - Reveal.js 初始化（1600×900 畫布、等比縮放）
   - 左側章節 Sidebar（目前章節高亮、已讀完成、點擊跳轉、窄螢幕抽屜）
   - 頂部總進度條＋章節進度＋頁碼 01 / 24
   - 深色／淺色投影模式切換（T 鍵）
   - Chart.js：進入該頁才建立、離開就銷毀（動畫每次重播、不在背景跑）
   - KPI 數字跳動、tooltip（滑鼠與鍵盤）、Detail Panel（Esc 關閉）
   不要在這裡寫內容；內容寫在 index.html。
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 主題 ---------- */
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    store("deck-theme", t);
    var b = document.getElementById("themeBtn");
    if (b) b.textContent = t === "dark" ? "淺色投影" : "深色模式";
    rebuildCharts();
  }
  function toggleTheme() { setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light"); }
  setTheme(store("deck-theme") || "dark");

  /* ---------- Reveal ---------- */
  Reveal.initialize({
    embedded: true,
    keyboardCondition: null,
    width: 1600,
    height: 900,
    margin: 0.02,
    minScale: 0.2,
    maxScale: 2.0,
    center: false,
    hash: true,
    controls: true,
    controlsTutorial: false,
    progress: false,
    slideNumber: false,
    transition: reduceMotion ? "none" : "slide",
    backgroundTransition: "fade",
    keyboard: {
      84: toggleTheme // T：切換深淺色
    },
    plugins: [RevealNotes].concat(window.RevealHighlight ? [RevealHighlight] : [])
  });

  /* ---------- 章節結構 ---------- */
  // 每個水平 <section> 用 data-chapter="章節名稱" 標記；沒標的沿用上一個章節
  var hSlides = Array.prototype.slice.call(document.querySelectorAll(".reveal .slides > section"));
  var chapters = [];
  hSlides.forEach(function (s, h) {
    var name = s.getAttribute("data-chapter");
    if (name || !chapters.length) chapters.push({ name: name || "開場", start: h, end: h });
    chapters[chapters.length - 1].end = h;
  });
  var visited = {};

  var nav = document.getElementById("chapNav");
  chapters.forEach(function (c, i) {
    var b = document.createElement("button");
    b.className = "chap";
    b.type = "button";
    b.innerHTML = '<span class="no">' + String(i + 1).padStart(2, "0") + "</span><span>" + c.name + '</span><span class="bar" aria-hidden="true"></span>';
    b.setAttribute("aria-label", "跳到第 " + (i + 1) + " 章：" + c.name);
    b.addEventListener("click", function () { Reveal.slide(c.start, 0); document.body.classList.remove("nav-open"); });
    nav.appendChild(b);
    c.el = b;
  });

  function linearIndex() {
    // 含垂直子頁的總頁序
    var idx = Reveal.getIndices();
    var n = 0;
    for (var h = 0; h < idx.h; h++) n += Math.max(1, hSlides[h].querySelectorAll(":scope > section").length);
    return n + (idx.v || 0);
  }
  function chapterOf(h) {
    for (var i = 0; i < chapters.length; i++) if (h >= chapters[i].start && h <= chapters[i].end) return i;
    return 0;
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  function updateNav() {
    var idx = Reveal.getIndices();
    var total = Reveal.getTotalSlides();
    var cur = linearIndex() + 1;
    visited[idx.h] = true;
    var ci = chapterOf(idx.h);
    chapters.forEach(function (c, i) {
      var all = true;
      for (var h = c.start; h <= c.end; h++) if (!visited[h]) all = false;
      c.el.classList.toggle("current", i === ci);
      c.el.classList.toggle("done", all && i !== ci);
      if (i === ci) c.el.setAttribute("aria-current", "step"); else c.el.removeAttribute("aria-current");
    });
    var c = chapters[ci];
    var span = c.end - c.start + 1;
    document.getElementById("counter").innerHTML = pad(cur) + ' <span class="tot">/ ' + pad(total) + "</span>";
    document.getElementById("chapName").textContent = "第 " + pad(ci + 1) + " 章 · " + c.name;
    document.getElementById("chapProg").style.width = ((idx.h - c.start + 1) / span * 100) + "%";
    document.getElementById("topProg").style.width = (cur / total * 100) + "%";
  }

  /* ---------- Chart.js：進頁建立、離頁銷毀 ---------- */
  var live = [];
  function cssVar(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  function paletteFor() {
    return [cssVar("--teal"), cssVar("--sky"), cssVar("--violet"), cssVar("--warn"), cssVar("--danger"), cssVar("--ok")];
  }
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = '"GenYoGothic", "Noto Sans TC", sans-serif';
    Chart.defaults.font.size = 18;
    Chart.defaults.font.weight = 400;
    Chart.defaults.color = cssVar("--text-2");
    Chart.defaults.borderColor = cssVar("--border");
    Chart.defaults.plugins.tooltip.titleFont = { weight: 700, size: 16 };
    Chart.defaults.plugins.tooltip.bodyFont = { weight: 400, size: 15 };
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.animation.duration = reduceMotion ? 0 : 1100;
  }
  function buildCharts(slide) {
    if (!window.Chart || !slide) return;
    chartDefaults();
    var pal = paletteFor();
    slide.querySelectorAll("canvas[data-chart]").forEach(function (cv) {
      var src = document.getElementById(cv.getAttribute("data-chart"));
      if (!src) return;
      var cfg = JSON.parse(src.textContent);
      (cfg.data.datasets || []).forEach(function (ds, i) {
        var col = pal[i % pal.length];
        if (!ds.backgroundColor) ds.backgroundColor = cfg.type === "line" ? col + "33" : (cfg.type === "doughnut" || cfg.type === "pie" ? pal : col);
        if (!ds.borderColor) ds.borderColor = cfg.type === "doughnut" || cfg.type === "pie" ? cssVar("--bg") : col;
        if (cfg.type === "bar" && ds.borderRadius === undefined) ds.borderRadius = 8;
        if (cfg.type === "line") { ds.tension = ds.tension === undefined ? 0.35 : ds.tension; ds.fill = ds.fill === undefined ? true : ds.fill; ds.borderWidth = 3; }
      });
      cfg.options = cfg.options || {};
      cfg.options.responsive = true;
      cfg.options.maintainAspectRatio = false;
      live.push(new Chart(cv, cfg));
    });
  }
  function destroyCharts() { live.forEach(function (c) { c.destroy(); }); live = []; }
  function rebuildCharts() { if (!window.Reveal || !Reveal.isReady || !Reveal.isReady()) return; destroyCharts(); buildCharts(Reveal.getCurrentSlide()); }

  /* ---------- KPI 數字跳動 ---------- */
  function runCounters(slide) {
    slide.querySelectorAll(".count[data-to]").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-to"));
      var dec = (el.getAttribute("data-to").split(".")[1] || "").length;
      var suf = el.getAttribute("data-suffix") || "";
      var pre = el.getAttribute("data-prefix") || "";
      if (reduceMotion) { el.textContent = pre + to.toFixed(dec) + suf; return; }
      var t0 = null, dur = 1200;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (to * e).toFixed(dec) + suf;
        if (p < 1 && el.isConnected) el._raf = requestAnimationFrame(step);
      }
      cancelAnimationFrame(el._raf);
      el._raf = requestAnimationFrame(step);
    });
  }
  function resetCounters(slide) {
    if (!slide) return;
    slide.querySelectorAll(".count[data-to]").forEach(function (el) {
      cancelAnimationFrame(el._raf);
      el.textContent = (el.getAttribute("data-prefix") || "") + "0" + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---------- Tooltip ---------- */
  var tip = document.getElementById("tip");
  function showTip(el) {
    tip.textContent = el.getAttribute("data-tip");
    var r = el.getBoundingClientRect();
    tip.classList.add("show");
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var x = Math.min(window.innerWidth - tw - 12, Math.max(12, r.left + r.width / 2 - tw / 2));
    var y = r.top - th - 10 < 8 ? r.bottom + 10 : r.top - th - 10;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.classList.remove("show"); }
  document.querySelectorAll("[data-tip]").forEach(function (el) {
    if (!el.hasAttribute("tabindex") && !/^(A|BUTTON)$/.test(el.tagName)) el.setAttribute("tabindex", "0");
    el.addEventListener("mouseenter", function () { showTip(el); });
    el.addEventListener("mouseleave", hideTip);
    el.addEventListener("focus", function () { showTip(el); });
    el.addEventListener("blur", hideTip);
  });

  /* ---------- Detail Panel ---------- */
  var panel = document.getElementById("detail");
  var scrim = document.getElementById("scrim");
  var lastFocus = null;
  function openDetail(el) {
    var tpl = document.getElementById(el.getAttribute("data-detail"));
    if (!tpl) return;
    lastFocus = el;
    document.getElementById("detailBody").innerHTML = tpl.innerHTML;
    panel.classList.add("open"); scrim.classList.add("show");
    panel.setAttribute("aria-hidden", "false");
    hideTip();
    Reveal.configure({ keyboard: false });
    document.getElementById("detailClose").focus();
  }
  function closeDetail() {
    if (!panel.classList.contains("open")) return;
    panel.classList.remove("open"); scrim.classList.remove("show");
    panel.setAttribute("aria-hidden", "true");
    Reveal.configure({ keyboard: { 84: toggleTheme } });
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-detail]").forEach(function (el) {
    if (!el.hasAttribute("tabindex") && !/^(A|BUTTON)$/.test(el.tagName)) el.setAttribute("tabindex", "0");
    el.setAttribute("role", el.getAttribute("role") || "button");
    el.addEventListener("click", function (e) { e.stopPropagation(); openDetail(el); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); openDetail(el); } });
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  scrim.addEventListener("click", closeDetail);
  document.addEventListener("keydown", function (e) {
    // 面板開著時 Esc 只關面板，不讓 Reveal 收到（否則會順便開總覽）
    if (e.key === "Escape" && panel.classList.contains("open")) { e.preventDefault(); e.stopImmediatePropagation(); closeDetail(); }
  }, true);

  /* ---------- 工具列 ---------- */
  document.getElementById("themeBtn").addEventListener("click", toggleTheme);
  document.getElementById("menuBtn").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  document.getElementById("overviewBtn").addEventListener("click", function () { Reveal.toggleOverview(); });

  /* ---------- 事件 ---------- */
  function onEnter(slide) {
    destroyCharts();
    buildCharts(slide);
    runCounters(slide);
    updateNav();
  }
  Reveal.on("ready", function (e) { onEnter(e.currentSlide); });
  Reveal.on("slidechanged", function (e) { resetCounters(e.previousSlide); hideTip(); closeDetail(); onEnter(e.currentSlide); });
  Reveal.on("overviewshown", function () { destroyCharts(); });
  Reveal.on("overviewhidden", function () { onEnter(Reveal.getCurrentSlide()); });
})();
