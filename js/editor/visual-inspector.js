(function () {
  "use strict";
  function bind(frame) {
    var visualMode = false;
    var selectedLabel = null;
    var rightSidebar = document.getElementById("sidebarRight");
    var rightToggle = document.getElementById("rightToggle");
    var visualModeExit = document.getElementById("visualModeExit");
    var visualSelection = document.getElementById("visualInspectorSelection");
    var visualGroups = document.getElementById("visualGroups");
    var visualGroupDetail = document.getElementById("visualGroupDetail");
    var visualGroupTitle = document.getElementById("visualGroupTitle");
    var visualGroupBack = document.getElementById("visualGroupBack");
    var visualTooltip = document.getElementById("visualTooltip");
    function sendVisualMode() {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage({ type: "alfa-visual-mode", enabled: visualMode }, "*");
      }
    }

    function updateInspector(label) {
      if (!label || !visualSelection) return;
      selectedLabel = label;
      visualSelection.textContent = "Selected: " + selectedLabel;
    }

    if (visualGroups && visualGroupDetail && visualGroupTitle && visualGroupBack) {
      function showGroupTooltip(button, pointerX, pointerY) {
        if (!visualTooltip || !button) return;
        visualTooltip.textContent = button.getAttribute("data-tooltip") || button.getAttribute("aria-label") || "";
        var rect = button.getBoundingClientRect();
        visualTooltip.classList.add("is-visible");
        visualTooltip.setAttribute("aria-hidden", "false");
        var tooltipRect = visualTooltip.getBoundingClientRect();
        var anchorX = typeof pointerX === "number" ? pointerX : rect.left + rect.width / 2;
        var anchorY = typeof pointerY === "number" ? pointerY : rect.top;
        var left = Math.max(8, Math.min(anchorX - tooltipRect.width / 2, window.innerWidth - tooltipRect.width - 8));
        var top = anchorY - tooltipRect.height - 10;
        if (top < 8) top = Math.min(window.innerHeight - tooltipRect.height - 8, anchorY + 10);
        visualTooltip.style.left = left + "px";
        visualTooltip.style.top = top + "px";
      }

      function hideGroupTooltip() {
        if (!visualTooltip) return;
        visualTooltip.classList.remove("is-visible");
        visualTooltip.setAttribute("aria-hidden", "true");
      }

      visualGroups.addEventListener("pointerover", function (event) {
        var button = event.target.closest("[data-visual-group]");
        if (button && !button.contains(event.relatedTarget)) showGroupTooltip(button, event.clientX, event.clientY);
      });
      visualGroups.addEventListener("pointermove", function (event) {
        var button = event.target.closest("[data-visual-group]");
        if (button && visualTooltip && visualTooltip.classList.contains("is-visible")) {
          showGroupTooltip(button, event.clientX, event.clientY);
        }
      });
      visualGroups.addEventListener("pointerout", function (event) {
        var button = event.target.closest("[data-visual-group]");
        if (button && !button.contains(event.relatedTarget)) hideGroupTooltip();
      });
      visualGroups.addEventListener("focusin", function (event) {
        var button = event.target.closest("[data-visual-group]");
        if (button) showGroupTooltip(button);
      });
      visualGroups.addEventListener("focusout", function (event) {
        if (event.target.closest("[data-visual-group]")) hideGroupTooltip();
      });
      visualGroups.addEventListener("click", function (event) {
        var button = event.target.closest("[data-visual-group]");
        if (!button) return;
        hideGroupTooltip();
        visualGroupTitle.textContent = button.textContent;
        visualGroups.hidden = true;
        visualGroupDetail.hidden = false;
      });
      visualGroupBack.addEventListener("click", function () {
        visualGroupDetail.hidden = true;
        visualGroups.hidden = false;
      });
    }

    if (frame) {
      frame.addEventListener("load", function () {
        if (visualMode) {
          selectedLabel = null;
          visualSelection.textContent = "No element selected";
        }
        sendVisualMode();
      });
      window.addEventListener("message", function (event) {
        if (event.source !== frame.contentWindow || !event.data || typeof event.data !== "object") return;
        if (event.data.type === "alfa-visual-ready") {
          sendVisualMode();
        } else if (event.data.type === "alfa-visual-exit") {
          document.dispatchEvent(new Event("alfa-code:visual-mode-exit-request"));
        } else if (event.data.type === "alfa-visual-hover" &&
            typeof event.data.label === "string" && !selectedLabel && visualSelection) {
          visualSelection.textContent = "Hovering: " + event.data.label;
        } else if (event.data.type === "alfa-visual-hover-clear" && !selectedLabel && visualSelection) {
          visualSelection.textContent = "No element selected";
        } else if (event.data.type === "alfa-visual-selection" &&
            typeof event.data.selector === "string" &&
            /^body(?: > [a-z0-9:-]+(?:\(\d+\))?)+(?:\:not\(#[a-z0-9_-]+\))?$/.test(event.data.selector)) {
          updateInspector(event.data.label);
        }
      });
    }

    if (rightSidebar && rightToggle) {
      function enterVisualMode() {
        if (visualMode) return;
        visualMode = true;
        rightSidebar.classList.add("is-inspecting");
        document.querySelector("#sidebarRight .sidebar-title").textContent = "Visual Editor";
        document.dispatchEvent(new Event("alfa-code:open-right-sidebar"));
        sendVisualMode();
      }

      function exitVisualMode() {
        if (!visualMode) return;
        visualMode = false;
        selectedLabel = null;
        rightSidebar.classList.remove("is-inspecting");
        document.querySelector("#sidebarRight .sidebar-title").textContent = "Menu";
        visualSelection.textContent = "No element selected";
        if (visualGroupDetail) visualGroupDetail.hidden = true;
        if (visualGroups) visualGroups.hidden = false;
        sendVisualMode();
        document.dispatchEvent(new Event("alfa-code:visual-mode-exit"));
      }

      document.addEventListener("alfa-code:visual-mode-enter", enterVisualMode);
      document.addEventListener("alfa-code:visual-mode-exit-request", exitVisualMode);
      if (visualModeExit) visualModeExit.addEventListener("click", exitVisualMode);

      rightToggle.addEventListener("click", function () {
        if (visualMode && rightToggle.getAttribute("aria-expanded") !== "true") exitVisualMode();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && visualMode) exitVisualMode();
      });
    }
  }
  window.AlfaCodeVisualInspector = { bind: bind };
})();
