(function () {
  "use strict";
  function bind(frame) {
    var visualMode = false;
    var visualButton = document.querySelector('[aria-label="Visual edit"]');
    var rightSidebar = document.getElementById("sidebarRight");
    var rightToggle = document.getElementById("rightToggle");
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
      visualSelection.textContent = label;
    }

    if (visualGroups && visualGroupDetail && visualGroupTitle && visualGroupBack) {
      function showGroupTooltip(button) {
        if (!visualTooltip || !button) return;
        visualTooltip.textContent = button.getAttribute("data-tooltip") || button.getAttribute("aria-label") || "";
        var rect = button.getBoundingClientRect();
        visualTooltip.classList.add("is-visible");
        visualTooltip.setAttribute("aria-hidden", "false");
        var tooltipRect = visualTooltip.getBoundingClientRect();
        var left = rect.right + 8;
        if (left + tooltipRect.width > window.innerWidth - 8) left = rect.left - tooltipRect.width - 8;
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        var top = rect.top + (rect.height - tooltipRect.height) / 2;
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
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
        if (button && !button.contains(event.relatedTarget)) showGroupTooltip(button);
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
          visualSelection.textContent = "Select an element in the preview.";
        }
        sendVisualMode();
      });
      window.addEventListener("message", function (event) {
        if (event.source !== frame.contentWindow || !event.data || typeof event.data !== "object") return;
        if (event.data.type === "alfa-visual-ready") {
          sendVisualMode();
        } else if (event.data.type === "alfa-visual-selection" &&
            typeof event.data.selector === "string" &&
            /^body(?: > [a-z0-9:-]+(?:\(\d+\))?)+(?:\:not\(#[a-z0-9_-]+\))?$/.test(event.data.selector)) {
          updateInspector(event.data.label);
        }
      });
    }

    if (visualButton && rightSidebar && rightToggle) {
      function exitVisualMode() {
        visualMode = false;
        visualButton.setAttribute("aria-pressed", "false");
        visualButton.classList.remove("is-active");
        rightSidebar.classList.remove("is-inspecting");
        document.querySelector("#sidebarRight .sidebar-title").textContent = "Menu";
        visualSelection.textContent = "No element selected";
        if (visualGroupDetail) visualGroupDetail.hidden = true;
        if (visualGroups) visualGroups.hidden = false;
        sendVisualMode();
      }

      visualButton.addEventListener("click", function () {
        if (visualMode) exitVisualMode();
        else {
          visualMode = true;
          visualButton.setAttribute("aria-pressed", "true");
          visualButton.classList.add("is-active");
          rightSidebar.classList.add("is-inspecting");
          document.querySelector("#sidebarRight .sidebar-title").textContent = "Visual Editor";
          document.dispatchEvent(new Event("alfa-code:open-right-sidebar"));
        }
        sendVisualMode();
      });

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
