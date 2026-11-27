(function () {
  "use strict";

  var storageKey = "alfa-code:settings";
  var defaults = {
    editorEngine: "monaco",
    fontSize: 13,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    autoRun: true,
    previewDelay: 250,
    split: 50,
    previewVisible: true,
    headerVisible: true,
    footerVisible: true,
    reduceMotion: false
  };
  var validEngines = ["monaco", "codemirror6"];
  var settings = loadSettings();

  function readJSON(key) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? null : JSON.parse(value);
    } catch (error) {
      console.warn("[Alfa-Code] Could not read setting " + key + ":", error);
      return null;
    }
  }

  function loadSettings() {
    var saved = readJSON(storageKey);
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) saved = {};
    var merged = {};
    Object.keys(defaults).forEach(function (key) {
      merged[key] = Object.prototype.hasOwnProperty.call(saved, key) ? saved[key] : defaults[key];
    });

    var legacyEngine = readJSON("alfa-code:editor");
    if (!Object.prototype.hasOwnProperty.call(saved, "editorEngine") &&
        validEngines.indexOf(legacyEngine) !== -1) merged.editorEngine = legacyEngine;
    var legacySplit = readJSON("alfa-code:split");
    if (!Object.prototype.hasOwnProperty.call(saved, "split") &&
        typeof legacySplit === "number") merged.split = legacySplit;
    var legacyModes = readJSON("alfa-code:view-modes");
    if (legacyModes && typeof legacyModes === "object") {
      ["preview", "header", "footer"].forEach(function (key) {
        var setting = key === "preview" ? "previewVisible" : key + "Visible";
        if (!Object.prototype.hasOwnProperty.call(saved, setting) &&
            Object.prototype.hasOwnProperty.call(legacyModes, key)) merged[setting] = legacyModes[key] !== false;
      });
    }
    return normalize(merged);
  }

  function normalize(value) {
    value.editorEngine = validEngines.indexOf(value.editorEngine) !== -1 ? value.editorEngine : defaults.editorEngine;
    value.fontSize = clampNumber(value.fontSize, 11, 22, defaults.fontSize);
    value.tabSize = Number(value.tabSize) === 4 ? 4 : 2;
    value.previewDelay = clampNumber(value.previewDelay, 100, 1000, defaults.previewDelay);
    value.split = clampNumber(value.split, 20, 80, defaults.split);
    ["wordWrap", "minimap", "autoRun", "previewVisible", "headerVisible", "footerVisible", "reduceMotion"].forEach(function (key) {
      value[key] = value[key] !== false;
    });
    return value;
  }

  function clampNumber(value, min, max, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.warn("[Alfa-Code] Could not save application settings:", error);
    }
  }

  function set(key, value) {
    if (!Object.prototype.hasOwnProperty.call(defaults, key)) return;
    var next = {};
    next[key] = value;
    var normalized = normalize(Object.assign({}, settings, next));
    if (settings[key] === normalized[key]) return;
    settings = normalized;
    persist();
    window.dispatchEvent(new CustomEvent("alfa-code:setting-change", {
      detail: { key: key, value: settings[key], settings: getAll() }
    }));
  }

  function getAll() {
    return Object.assign({}, settings);
  }

  function showToast(message, isError) {
    var container = document.getElementById("toastContainer");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "toast" + (isError ? " toast--error" : "");
    toast.textContent = message;
    container.appendChild(toast);
    window.setTimeout(function () {
      toast.style.opacity = "0";
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2600);
  }

  function downloadPreferences() {
    function readStoredValue(key, fallback) {
      try {
        return localStorage.getItem(key) || fallback;
      } catch (error) {
        console.warn("[Alfa-Code] Could not include " + key + " in exported preferences:", error);
        return fallback;
      }
    }
    var preferences = {
      version: 1,
      settings: getAll(),
      theme: readStoredValue("alfa-code:theme", "ocean"),
      customAccent: readStoredValue("alfa-code:custom-accent", null)
    };
    var blob = new Blob([JSON.stringify(preferences, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "alfacode-settings.json";
    link.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function resetPreferences() {
    if (!window.confirm("Reset interface preferences? Your code will be kept.")) return;
    [
      storageKey,
      "alfa-code:editor",
      "alfa-code:split",
      "alfa-code:view-modes",
      "alfa-code:left-w",
      "alfa-code:right-w",
      "alfa-code:theme",
      "alfa-code:custom-accent"
    ].forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn("[Alfa-Code] Could not clear preference " + key + ":", error);
      }
    });
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaults));
    } catch (error) {
      console.warn("[Alfa-Code] Could not restore default settings:", error);
    }
    window.location.reload();
  }

  function clearSavedCode() {
    if (!window.confirm("Clear saved HTML, CSS and JavaScript? This cannot be undone.")) return;
    if (!window.AlfaCodeEditor || !window.AlfaCodeEditor.clearSavedCode) {
      console.error("[Alfa-Code] Cannot clear code before the editor is initialized.");
      showToast("The editor is not ready yet. Try again in a moment.", true);
      return;
    }
    window.AlfaCodeEditor.clearSavedCode();
    showToast("Saved code cleared");
  }

  function activateSection(sectionName) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-settings-section]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-settings-panel]"));
    buttons.forEach(function (button) {
      var active = button.getAttribute("data-settings-section") === sectionName;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    panels.forEach(function (panel) {
      var active = panel.getAttribute("data-settings-panel") === sectionName;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
  }

  function updateControl(input) {
    var key = input.getAttribute("data-setting");
    if (!key) return;
    var value = settings[key];
    if (input.type === "checkbox") input.checked = value;
    else input.value = String(value);
    var output = document.querySelector('[data-setting-output="' + key + '"]');
    if (output) output.value = key === "split" ? value + "%" :
      (key === "previewDelay" ? value + " ms" : value + " px");
    if (key === "autoRun") {
      var dependent = document.querySelector('[data-setting-dependent="autoRun"]');
      if (dependent) dependent.classList.toggle("is-disabled", !value);
    }
  }

  function applyLayoutSettings() {
    document.documentElement.setAttribute("data-reduce-motion", settings.reduceMotion ? "true" : "false");
    ["preview", "header", "footer"].forEach(function (mode) {
      var key = mode === "preview" ? "previewVisible" : mode + "Visible";
      var button = document.getElementById(mode === "preview" ? "togglePreview" : "toggle" + mode.charAt(0).toUpperCase() + mode.slice(1));
      document.documentElement.setAttribute("data-" + mode + "-visible", settings[key] ? "true" : "false");
      if (button) {
        button.setAttribute("aria-pressed", settings[key] ? "true" : "false");
        button.setAttribute("aria-label", (settings[key] ? "Hide " : "Show ") + mode);
        button.title = button.getAttribute("aria-label");
        button.classList.toggle("is-active", settings[key]);
      }
    });
    document.documentElement.style.setProperty("--split", settings.split);
  }

  window.AlfaCodeSettings = {
    get: function (key) { return settings[key]; },
    getAll: getAll,
    set: set
  };

  persist();
  applyLayoutSettings();
  Array.prototype.forEach.call(document.querySelectorAll("[data-setting]"), function (input) {
    updateControl(input);
    input.addEventListener("input", function () {
      var value = input.type === "checkbox" ? input.checked :
        (input.type === "range" || input.tagName === "SELECT" ? Number(input.value) : input.value);
      if (input.getAttribute("data-setting") === "editorEngine") value = input.value;
      set(input.getAttribute("data-setting"), value);
      updateControl(input);
      if (input.getAttribute("data-setting") === "split") {
        window.dispatchEvent(new Event("alfa-code:layout-change"));
      }
    });
    input.addEventListener("change", function () {
      var key = input.getAttribute("data-setting");
      var value = input.type === "checkbox" ? input.checked :
        (input.tagName === "SELECT" && key !== "editorEngine" ? Number(input.value) :
          (input.type === "range" ? Number(input.value) : input.value));
      set(key, value);
      updateControl(input);
    });
  });
  window.addEventListener("alfa-code:setting-change", function (event) {
    var changedControl = document.querySelector('[data-setting="' + event.detail.key + '"]');
    if (changedControl) updateControl(changedControl);
    if (["split", "previewVisible", "headerVisible", "footerVisible", "reduceMotion"].indexOf(event.detail.key) !== -1) {
      applyLayoutSettings();
    }
  });
  document.querySelectorAll("[data-settings-section]").forEach(function (button) {
    button.addEventListener("click", function () {
      activateSection(button.getAttribute("data-settings-section"));
    });
  });
  document.getElementById("exportSettings").addEventListener("click", downloadPreferences);
  document.getElementById("resetPreferences").addEventListener("click", resetPreferences);
  document.getElementById("clearSavedCode").addEventListener("click", clearSavedCode);
  document.getElementById("resetLayoutSettings").addEventListener("click", function () {
    ["split", "previewVisible", "headerVisible", "footerVisible", "reduceMotion"].forEach(function (key) {
      set(key, defaults[key]);
      var input = document.querySelector('[data-setting="' + key + '"]');
      if (input) updateControl(input);
    });
    window.AlfaCodeLayout.reset();
    window.dispatchEvent(new Event("alfa-code:layout-change"));
    showToast("Layout restored");
  });
})();
