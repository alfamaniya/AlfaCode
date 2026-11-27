(function () {
  "use strict";

  var root = document.documentElement;
  var button = document.getElementById("visualFullscreenToggle");
  if (!button) return;

  var icon = button.querySelector("use");
  var label = button.querySelector(".preview-btn-label");

  function setFullscreen(enabled) {
    root.setAttribute("data-visual-fullscreen", enabled ? "true" : "false");
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.setAttribute("aria-label", enabled ? "Exit fullscreen" : "Enter visual edit fullscreen");
    button.title = button.getAttribute("aria-label");
    if (label) label.textContent = enabled ? "Exit fullscreen" : "Visual edit";
    if (icon) icon.setAttribute("href", enabled ? "#i-minimize-2" : "#i-maximize-2");
    window.dispatchEvent(new Event("alfa-code:layout-change"));
  }

  button.addEventListener("click", function () {
    var enabled = root.getAttribute("data-visual-fullscreen") === "true";
    if (enabled) {
      setFullscreen(false);
      return;
    }

    document.dispatchEvent(new Event("alfa-code:visual-mode-enter"));
    var rightToggle = document.getElementById("rightToggle");
    if (rightToggle && rightToggle.getAttribute("aria-expanded") !== "true") {
      document.dispatchEvent(new Event("alfa-code:open-right-sidebar"));
    }
    setFullscreen(true);
  });

  document.addEventListener("alfa-code:visual-mode-exit", function () {
    if (root.getAttribute("data-visual-fullscreen") === "true") setFullscreen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.getAttribute("data-visual-fullscreen") === "true") {
      setFullscreen(false);
    }
  });
})();
