(function () {
  "use strict";

  var root = document.documentElement;
  var trigger = document.getElementById("themeSettingsToggle");
  var panel = document.getElementById("themeSettingsPanel");
  var closeButton = document.getElementById("themeSettingsClose");
  var main = document.getElementById("main");
  var split = document.getElementById("split");
  var customColor = document.getElementById("customThemeColor");
  var customColorValue = document.getElementById("customThemeColorValue");
  var customColorReset = document.getElementById("customThemeColorReset");
  var options = Array.prototype.slice.call(document.querySelectorAll("[data-theme-option]"));
  if (!trigger || !panel || !closeButton || !main || !split || !customColor || !customColorValue || !customColorReset || !options.length) return;

  var themes = {
    ocean: {
      "--c-bg": "#061a22",
      "--c-panel": "#0a2830",
      "--c-panel-deep": "#04141a",
      "--c-drawer": "#0c2a35",
      "--c-drawer-deep": "#040f14",
      "--c-editor": "#082630",
      "--c-textarea": "#041620",
      "--c-header-a": "#061a22",
      "--c-header-b": "#0d3845",
      "--c-turquoise": "#45d8e8",
      "--c-turquoise-soft": "#1faabb",
      "--c-text": "#d6f5fb",
      "--c-muted": "#7fc0d0",
      "--c-border": "#215b6c",
      "--c-overlay": "rgba(2, 12, 18, .72)",
      "--c-drawer-shadow": "rgba(0, 0, 0, .65)"
    },
    forest: {
      "--c-bg": "#0b1c17",
      "--c-panel": "#122a20",
      "--c-panel-deep": "#07130f",
      "--c-drawer": "#173326",
      "--c-drawer-deep": "#091710",
      "--c-editor": "#10251c",
      "--c-textarea": "#081710",
      "--c-header-a": "#0b1c17",
      "--c-header-b": "#1d4531",
      "--c-turquoise": "#4ade80",
      "--c-turquoise-soft": "#22a35a",
      "--c-text": "#e0f5e8",
      "--c-muted": "#91b9a0",
      "--c-border": "#315d43",
      "--c-overlay": "rgba(3, 12, 7, .72)",
      "--c-drawer-shadow": "rgba(0, 0, 0, .65)"
    },
    violet: {
      "--c-bg": "#171323",
      "--c-panel": "#251d35",
      "--c-panel-deep": "#100c19",
      "--c-drawer": "#2d2340",
      "--c-drawer-deep": "#130e1d",
      "--c-editor": "#20192f",
      "--c-textarea": "#120e1d",
      "--c-header-a": "#171323",
      "--c-header-b": "#382a54",
      "--c-turquoise": "#c4a1ff",
      "--c-turquoise-soft": "#9467d4",
      "--c-text": "#f0e9fb",
      "--c-muted": "#b2a2ca",
      "--c-border": "#594477",
      "--c-overlay": "rgba(8, 5, 14, .74)",
      "--c-drawer-shadow": "rgba(0, 0, 0, .65)"
    },
    amber: {
      "--c-bg": "#21190f",
      "--c-panel": "#332516",
      "--c-panel-deep": "#171007",
      "--c-drawer": "#3c2b18",
      "--c-drawer-deep": "#1b1209",
      "--c-editor": "#2b2014",
      "--c-textarea": "#191208",
      "--c-header-a": "#21190f",
      "--c-header-b": "#50391b",
      "--c-turquoise": "#ffc266",
      "--c-turquoise-soft": "#c98532",
      "--c-text": "#fff2dc",
      "--c-muted": "#cbb08a",
      "--c-border": "#70512c",
      "--c-overlay": "rgba(15, 9, 3, .74)",
      "--c-drawer-shadow": "rgba(0, 0, 0, .65)"
    },
    rose: {
      "--c-bg": "#211318",
      "--c-panel": "#331c25",
      "--c-panel-deep": "#170b10",
      "--c-drawer": "#3c202c",
      "--c-drawer-deep": "#1b0d13",
      "--c-editor": "#2b1921",
      "--c-textarea": "#190d12",
      "--c-header-a": "#211318",
      "--c-header-b": "#502633",
      "--c-turquoise": "#ff8da1",
      "--c-turquoise-soft": "#cc536d",
      "--c-text": "#ffedf0",
      "--c-muted": "#d0a1ab",
      "--c-border": "#70404e",
      "--c-overlay": "rgba(15, 4, 8, .74)",
      "--c-drawer-shadow": "rgba(0, 0, 0, .65)"
    },
    light: {
      "--c-bg": "#e8eef5",
      "--c-panel": "#f6f8fb",
      "--c-panel-deep": "#e1e8f0",
      "--c-drawer": "#f2f6fa",
      "--c-drawer-deep": "#e2eaf2",
      "--c-editor": "#e8eff6",
      "--c-textarea": "#ffffff",
      "--c-header-a": "#f6f8fb",
      "--c-header-b": "#dce8f4",
      "--c-turquoise": "#2878c8",
      "--c-turquoise-soft": "#1e65ab",
      "--c-text": "#1c2b3a",
      "--c-muted": "#52677b",
      "--c-border": "#b8c8d8",
      "--c-overlay": "rgba(19, 34, 50, .38)",
      "--c-drawer-shadow": "rgba(35, 54, 74, .22)"
    }
  };

  var activeTheme = "ocean";
  var customAccentKey = "alfa-code:custom-accent";
  var tintLevels = {
    "--c-tint-02": 0.03,
    "--c-tint-05": 0.06,
    "--c-tint-06": 0.08,
    "--c-tint-09": 0.12,
    "--c-tint-14": 0.18
  };

  function loadTheme() {
    try {
      var savedTheme = localStorage.getItem("alfa-code:theme");
      return Object.prototype.hasOwnProperty.call(themes, savedTheme) ? savedTheme : "ocean";
    } catch (error) {
      console.warn("[Alfa-Code] Could not read the saved color theme:", error);
      return "ocean";
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("alfa-code:theme", theme);
    } catch (error) {
      console.warn("[Alfa-Code] Could not save the selected color theme:", error);
    }
  }

  function loadCustomAccent() {
    try {
      var accent = localStorage.getItem(customAccentKey);
      return isValidAccent(accent) ? accent : null;
    } catch (error) {
      console.warn("[Alfa-Code] Could not read the saved custom color:", error);
      return null;
    }
  }

  function saveCustomAccent(accent) {
    try {
      if (accent) localStorage.setItem(customAccentKey, accent);
      else localStorage.removeItem(customAccentKey);
    } catch (error) {
      console.warn("[Alfa-Code] Could not save the custom color:", error);
    }
  }

  function isValidAccent(hex) {
    return typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex);
  }

  function accentChannels(hex) {
    if (!isValidAccent(hex)) throw new Error("Invalid accent color in theme configuration.");
    var value = hex.slice(1);
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ];
  }

  function applyTheme(themeName, clearCustomAccent) {
    var theme = themes[themeName];
    if (!theme) return;
    root.setAttribute("data-color-theme", themeName);
    Object.keys(theme).forEach(function (property) {
      root.style.setProperty(property, theme[property]);
    });

    activeTheme = themeName;
    options.forEach(function (option) {
      var selected = option.getAttribute("data-theme-option") === activeTheme;
      option.setAttribute("aria-checked", selected ? "true" : "false");
      option.tabIndex = selected ? 0 : -1;
    });
    saveTheme(themeName);
    if (clearCustomAccent) saveCustomAccent(null);
    applyAccent(theme["--c-turquoise"], false);
  }

  function applyAccent(accent, persist) {
    if (!isValidAccent(accent)) return;
    var channels = accentChannels(accent);
    var softChannels = channels.map(function (channel) {
      return Math.round(channel * 0.78);
    });
    root.style.setProperty("--c-turquoise", accent);
    root.style.setProperty("--c-turquoise-soft", "#" + softChannels.map(function (channel) {
      return channel.toString(16).padStart(2, "0");
    }).join(""));
    Object.keys(tintLevels).forEach(function (property) {
      root.style.setProperty(property, "rgba(" + channels.join(", ") + ", " + tintLevels[property] + ")");
    });
    root.style.setProperty("--c-glow", "rgba(" + channels.join(", ") + ", .42)");
    root.style.setProperty("--c-glow-soft", "rgba(" + channels.join(", ") + ", .18)");
    customColor.value = accent;
    customColorValue.value = accent.toUpperCase();
    customColorValue.textContent = accent.toUpperCase();
    var activeOption = options.filter(function (option) {
      return option.getAttribute("data-theme-option") === activeTheme;
    })[0];
    if (activeOption) activeOption.style.setProperty("--theme-swatch", accent);
    if (persist) saveCustomAccent(accent);
    window.dispatchEvent(new CustomEvent("alfa-code:theme-change", {
      detail: { theme: activeTheme, accent: accent }
    }));
  }

  function setSettingsOpen(open, returnFocus) {
    panel.hidden = !open;
    main.classList.toggle("settings-open", open);
    trigger.setAttribute("aria-pressed", open ? "true" : "false");
    trigger.setAttribute("aria-label", open ? "Return to editor" : "Open settings");
    trigger.title = open ? "Return to editor" : "Settings";
    var label = trigger.querySelector(".btn-label");
    if (label) label.textContent = open ? "Editor" : "Settings";
    if (open) {
      split.setAttribute("aria-hidden", "true");
      var selected = options.filter(function (option) {
        return option.getAttribute("data-theme-option") === activeTheme;
      })[0];
      if (selected) selected.focus();
    } else {
      split.removeAttribute("aria-hidden");
      if (returnFocus) trigger.focus();
    }
  }

  trigger.addEventListener("click", function () {
    setSettingsOpen(panel.hidden, false);
  });
  closeButton.addEventListener("click", function () {
    setSettingsOpen(false, true);
  });
  options.forEach(function (option) {
    option.addEventListener("click", function () {
      applyTheme(option.getAttribute("data-theme-option"), true);
    });
  });
  customColor.addEventListener("input", function () {
    applyAccent(customColor.value, true);
  });
  customColorReset.addEventListener("click", function () {
    applyTheme(activeTheme, true);
  });

  panel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSettingsOpen(false, true);
      return;
    }

    var currentIndex = options.indexOf(document.activeElement);
    var nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      options[nextIndex].focus();
      applyTheme(options[nextIndex].getAttribute("data-theme-option"));
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      setSettingsOpen(false, true);
    }
  });

  activeTheme = loadTheme();
  var savedAccent = loadCustomAccent();
  applyTheme(activeTheme, false);
  if (savedAccent) applyAccent(savedAccent, false);
})();
