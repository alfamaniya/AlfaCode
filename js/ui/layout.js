/* ============ UI interactions ============ */
(function () {
  "use strict";
  var root    = document.documentElement;
  var main    = document.getElementById("main");
  var split   = document.getElementById("split");
  var splitDiv = document.getElementById("splitDivider");

  var viewModes = [
    { key: "preview", buttonId: "togglePreview", attribute: "data-preview-visible" },
    { key: "header", buttonId: "toggleHeader", attribute: "data-header-visible" },
    { key: "footer", buttonId: "toggleFooter", attribute: "data-footer-visible" }
  ];
  var savedViewModes = load("alfa-code:view-modes", {});
  if (!savedViewModes || typeof savedViewModes !== "object") savedViewModes = {};
  viewModes.forEach(function (mode) {
    var button = document.getElementById(mode.buttonId);
    var visible = !Object.prototype.hasOwnProperty.call(savedViewModes, mode.key) ||
      savedViewModes[mode.key] !== false;
    var label = mode.key === "preview" ? "preview" : mode.key;
    root.setAttribute(mode.attribute, visible ? "true" : "false");
    if (button) {
      button.setAttribute("aria-pressed", visible ? "true" : "false");
      button.classList.toggle("is-active", visible);
      button.setAttribute("aria-label", (visible ? "Hide " : "Show ") + label);
      button.title = button.getAttribute("aria-label");
      button.addEventListener("click", function () {
        visible = !visible;
        root.setAttribute(mode.attribute, visible ? "true" : "false");
        button.setAttribute("aria-pressed", visible ? "true" : "false");
        button.classList.toggle("is-active", visible);
        button.setAttribute("aria-label", (visible ? "Hide " : "Show ") + label);
        button.title = button.getAttribute("aria-label");
        var current = load("alfa-code:view-modes", {});
        if (!current || typeof current !== "object") current = {};
        current[mode.key] = visible;
        save("alfa-code:view-modes", current);
        window.dispatchEvent(new Event("alfa-code:layout-change"));
      });
    }
  });

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function makeResizer(handle, opts) {
    var dragging = false;
    function valueFromEvent(e) {
      if (opts.percentOf) {
        var rect = opts.percentOf.getBoundingClientRect();
        return ((e.clientX - rect.left) / rect.width) * 100;
      }
      return opts.reverse ? (window.innerWidth - e.clientX) : e.clientX;
    }
    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.classList.add("is-dragging");
      document.body.classList.add("resizing");
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      opts.set(valueFromEvent(e));
    });
    function stop() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("is-dragging");
      document.body.classList.remove("resizing");
      if (opts.onEnd) opts.onEnd();
    }
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("dblclick", function () {
      opts.set(opts.default);
      if (opts.onEnd) opts.onEnd();
    });
    handle.addEventListener("keydown", function (e) {
      var cur = opts.current();
      var step = opts.step || 16;
      if (e.key === "ArrowLeft")  { opts.set(cur - step); e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "ArrowRight") { opts.set(cur + step); e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "Home")       { opts.set(opts.min);   e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "End")        { opts.set(opts.max);   e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
    });
  }

  function makeSidebar(opts) {
    var sidebar = document.getElementById(opts.sidebarId);
    var toggle  = document.getElementById(opts.toggleId);
    var resizer = document.getElementById(opts.resizerId);
    var side    = opts.side;
    var cssVar  = side === "left" ? "--left-w" : "--right-w";
    var railVar = side === "left" ? "--left-rail" : "--right-rail";
    var MAIN_MIN = 200;
    var DEFAULT = load(opts.storeKey, opts.defaultW);
    var current = DEFAULT;
    var isOpen  = false;
    var pinned  = false;
    var closeTimer = null;
    var suppressHoverUntil = 0;

    function getRail() {
      return parseInt(getComputedStyle(root).getPropertyValue(railVar), 10) || 56;
    }
    function isMobile() { return window.innerWidth <= 768; }
    function setWidth(px) {
      var viewportCap = window.innerWidth - MAIN_MIN - getRail() - 20;
      var limit = Math.max(opts.min, Math.min(opts.max, viewportCap));
      var w = Math.round(Math.min(limit, Math.max(opts.min, px)));
      current = w;
      root.style.setProperty(cssVar, w + "px");
      resizer.setAttribute("aria-valuenow", w);
    }
    function applyOpen(open) {
      isOpen = open;
      sidebar.classList.toggle("is-open", open);
      main.classList.toggle(side + "-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", (open ? "Collapse " : "Expand ") + side + " menu");
      resizer.classList.toggle("is-active", open);
    }
    function cancelClose() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }
    function scheduleClose() {
      cancelClose();
      if (pinned) return;
      closeTimer = setTimeout(function () {
        if (!pinned) applyOpen(false);
        closeTimer = null;
      }, 250);
    }

    toggle.addEventListener("click", function () {
      cancelClose();
      if (pinned) {
        pinned = false;
        applyOpen(false);
        suppressHoverUntil = Date.now() + 500;
      } else {
        pinned = true;
        applyOpen(true);
      }
    });

    sidebar.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      if (Date.now() < suppressHoverUntil) return;
      cancelClose();
      if (!isOpen) applyOpen(true);
    });
    sidebar.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      scheduleClose();
    });
    resizer.addEventListener("pointerenter", cancelClose);
    resizer.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      scheduleClose();
    });

    makeResizer(resizer, {
      set: setWidth,
      current: function () { return current; },
      default: opts.defaultW,
      min: opts.min,
      max: opts.max,
      step: 16,
      reverse: side === "right",
      onEnd: function () { save(opts.storeKey, current); }
    });

    setWidth(DEFAULT);
    applyOpen(false);
    resizer.setAttribute("aria-valuemin", opts.min);
    resizer.setAttribute("aria-valuemax", opts.max);

    return {
      open:  function () { pinned = true;  applyOpen(true);  },
      close: function () { pinned = false; applyOpen(false); },
      isOpen: function () { return isOpen; }
    };
  }

  var leftSidebar = makeSidebar({
    sidebarId: "sidebarLeft",
    toggleId:  "leftToggle",
    resizerId: "leftResizer",
    side:      "left",
    storeKey:  "alfa-code:left-w",
    defaultW:  240,
    min: 200,
    max: 560
  });
  var rightSidebar = makeSidebar({
    sidebarId: "sidebarRight",
    toggleId:  "rightToggle",
    resizerId: "rightResizer",
    side:      "right",
    storeKey:  "alfa-code:right-w",
    defaultW:  240,
    min: 200,
    max: 560
  });
  document.addEventListener("alfa-code:open-right-sidebar", function () {
    rightSidebar.open();
  });

  var SPLIT_MIN = 15, SPLIT_MAX = 85, SPLIT_DEFAULT = 50;
  var splitVal = load("alfa-code:split", SPLIT_DEFAULT);
  function setSplit(percent) {
    var v = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, percent));
    splitVal = v;
    split.style.setProperty("--split", v);
    splitDiv.setAttribute("aria-valuenow", Math.round(v));
  }
  makeResizer(splitDiv, {
    percentOf: split,
    set: setSplit,
    current: function () { return splitVal; },
    default: SPLIT_DEFAULT,
    min: SPLIT_MIN,
    max: SPLIT_MAX,
    step: 2,
    onEnd: function () { save("alfa-code:split", splitVal); }
  });
  splitDiv.setAttribute("aria-valuemin", SPLIT_MIN);
  splitDiv.setAttribute("aria-valuemax", SPLIT_MAX);
  setSplit(splitVal);

  var tabs   = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = document.querySelectorAll(".tab-panel");
  function activateTab(tab) {
    tabs.forEach(function (t) {
      var isActive = t === tab;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach(function (p) { p.classList.remove("active"); });
    var target = document.getElementById("panel-" + tab.dataset.tab);
    if (target) target.classList.add("active");
    document.dispatchEvent(new CustomEvent("alfa-code:tab-change", {
      detail: { tab: tab.dataset.tab }
    }));
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (e.key === "ArrowLeft")  next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (next) { next.focus(); activateTab(next); e.preventDefault(); }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (rightSidebar.isOpen()) rightSidebar.close();
      else if (leftSidebar.isOpen()) leftSidebar.close();
    }
  });

  document.addEventListener("pointerdown", function (e) {
    if (window.innerWidth > 768) return;
    if (e.target.closest && e.target.closest(".sidebar")) return;
    if (leftSidebar.isOpen()) leftSidebar.close();
    if (rightSidebar.isOpen()) rightSidebar.close();
  });

  window.addEventListener("resize", function () {
    if (leftSidebar.isOpen() && window.innerWidth < 900) leftSidebar.close();
    if (rightSidebar.isOpen() && window.innerWidth < 900) rightSidebar.close();
  });
})();
