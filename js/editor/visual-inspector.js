(function () {
  "use strict";
  function bind(frame) {
    var visualMode = false;
    var selectedLabel = null;
    var selectedSelector = null;
    var documentGeneration = 0;
    var selectionGeneration = 0;
    var latestComputedRequest = 0;
    var rightSidebar = document.getElementById("sidebarRight");
    var rightToggle = document.getElementById("rightToggle");
    var visualModeExit = document.getElementById("visualModeExit");
    var visualSelection = document.getElementById("visualInspectorSelection");
    var visualGroups = document.getElementById("visualGroups");
    var visualGroupList = document.getElementById("visualGroupList");
    var visualGroupSearch = document.getElementById("visualGroupSearch");
    var visualGroupCategories = document.getElementById("visualGroupCategories");
    var visualGroupResults = document.getElementById("visualGroupResults");
    var visualGroupDetail = document.getElementById("visualGroupDetail");
    var visualGroupTitle = document.getElementById("visualGroupTitle");
    var visualGroupBack = document.getElementById("visualGroupBack");
    var visualTooltip = document.getElementById("visualTooltip");
    var activeVisualCategory = "essentials";
    var visualGroupCategoriesById = {
      "custom-settings": "essentials",
      "color-background": "essentials",
      spacing: "essentials",
      typography: "essentials",
      sizing: "essentials",
      "border-outline": "essentials",
      shadow: "essentials",
      layout: "layout",
      flexbox: "layout",
      grid: "layout",
      positioning: "layout",
      responsive: "layout",
      overflow: "layout",
      columns: "layout",
      logical: "layout",
      containment: "layout",
      "scroll-snap": "layout",
      effects: "effects",
      transform: "effects",
      interaction: "effects",
      visibility: "effects",
      transition: "effects",
      masking: "effects",
      accessibility: "effects",
      states: "effects",
      text: "content",
      forms: "content",
      list: "content",
      table: "content",
      content: "content",
      svg: "content",
      "view-transitions": "effects",
      "custom-properties": "advanced"
    };

    function renderVisualGroupList() {
      if (!visualGroupList) return;
      var query = visualGroupSearch ? visualGroupSearch.value.trim().toLowerCase() : "";
      var visibleCount = 0;
      Array.prototype.forEach.call(visualGroupList.querySelectorAll("[data-visual-group]"), function (button) {
        var id = button.getAttribute("data-visual-group");
        var label = (button.getAttribute("aria-label") || button.textContent).toLowerCase();
        var properties = window.AlfaCodeVisualProperties &&
          window.AlfaCodeVisualProperties.findProperties(id, query);
        var matches = !query || label.indexOf(query) !== -1 || (properties && properties.length > 0);
        var visible = matches && (query || visualGroupCategoriesById[id] === activeVisualCategory);
        button.hidden = !visible;
        if (visible) visibleCount++;
        if (properties && properties.length) button.setAttribute("data-search-target", properties[0]);
        else button.removeAttribute("data-search-target");
      });
      if (visualGroupCategories) visualGroupCategories.hidden = !!query;
      if (visualGroupList) {
        if (query) {
          visualGroupList.setAttribute("aria-label", "Search results");
          visualGroupList.removeAttribute("aria-labelledby");
        } else {
          visualGroupList.removeAttribute("aria-label");
          visualGroupList.setAttribute("aria-labelledby", "visualCategory" +
            activeVisualCategory.charAt(0).toUpperCase() + activeVisualCategory.slice(1));
        }
      }
      if (visualGroupResults) {
        visualGroupResults.textContent = query
          ? (visibleCount ? visibleCount + (visibleCount === 1 ? " group found" : " groups found") : "No matching settings")
          : "";
        visualGroupResults.hidden = !query;
      }
    }

    function selectVisualCategory(button) {
      if (!button) return;
      activeVisualCategory = button.getAttribute("data-visual-category") || "essentials";
      if (visualGroupSearch) visualGroupSearch.value = "";
      if (visualGroupCategories) {
        Array.prototype.forEach.call(visualGroupCategories.querySelectorAll("[data-visual-category]"), function (categoryButton) {
          var selected = categoryButton === button;
          categoryButton.classList.toggle("is-active", selected);
          categoryButton.setAttribute("aria-selected", selected ? "true" : "false");
        });
      }
      renderVisualGroupList();
    }

    function sendVisualMode() {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage({
          type: "alfa-visual-mode",
          enabled: visualMode,
          documentGeneration: documentGeneration
        }, "*");
      }
    }

    function setControlsEnabled(enabled) {
      if (!visualGroupDetail || !window.AlfaCodeVisualProperties) return;
      window.AlfaCodeVisualProperties.setEnabled(visualGroupDetail, enabled);
    }

    function requestComputedStyles() {
      if (!selectedSelector || !visualGroupDetail || visualGroupDetail.hidden ||
          !window.AlfaCodeVisualProperties || !frame.contentWindow) return;
      var groupId = visualGroupTitle.getAttribute("data-visual-group");
      latestComputedRequest += 1;
      frame.contentWindow.postMessage({
        type: "alfa-visual-computed-request",
        properties: window.AlfaCodeVisualProperties.getPropertyList(groupId),
        requestId: latestComputedRequest,
        documentGeneration: documentGeneration,
        selectionGeneration: selectionGeneration
      }, "*");
    }

    function clearSelectionState() {
      latestComputedRequest += 1;
      selectedLabel = null;
      selectedSelector = null;
      selectionGeneration = 0;
      if (window.AlfaCodeEditor && window.AlfaCodeEditor.setVisualSelection) {
        window.AlfaCodeEditor.setVisualSelection(null);
      }
      if (window.AlfaCodeVisualProperties && window.AlfaCodeVisualProperties.setSelection) {
        window.AlfaCodeVisualProperties.setSelection(null);
      }
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: "alfa-visual-clear-selection" }, "*");
      }
      if (visualSelection) visualSelection.textContent = "No element selected";
      if (visualGroupDetail && !visualGroupDetail.hidden && window.AlfaCodeVisualProperties) {
        window.AlfaCodeVisualProperties.resetValues(visualGroupDetail);
      }
      setControlsEnabled(false);
    }

    function updateInspector(label, selector, matchedRules) {
      if (!label || !visualSelection || !selector) return;
      selectedLabel = label;
      selectedSelector = selector;
      visualSelection.textContent = "Selected: " + selectedLabel;
      if (selectedSelector && window.AlfaCodeEditor && window.AlfaCodeEditor.setVisualSelection) {
        window.AlfaCodeEditor.setVisualSelection(selectedSelector, {
          documentGeneration: documentGeneration,
          selectionGeneration: selectionGeneration,
          matchedRules: matchedRules
        });
      }
      if (window.AlfaCodeVisualProperties && window.AlfaCodeVisualProperties.setSelection) {
        window.AlfaCodeVisualProperties.setSelection(selectedSelector);
      }
      if (visualGroupDetail && !visualGroupDetail.hidden && window.AlfaCodeVisualProperties) {
        window.AlfaCodeVisualProperties.resetValues(visualGroupDetail);
      }
      setControlsEnabled(true);
      requestComputedStyles();
    }

    if (visualGroups && visualGroupList && visualGroupDetail && visualGroupTitle && visualGroupBack) {
      Array.prototype.forEach.call(visualGroupList.querySelectorAll("[data-visual-group]"), function (button) {
        var id = button.getAttribute("data-visual-group");
        if (!visualGroupCategoriesById[id]) {
          console.error("[Alfa-Code] Visual group has no category:", id);
          return;
        }
        button.setAttribute("data-visual-category", visualGroupCategoriesById[id]);
      });
      renderVisualGroupList();
      if (visualGroupSearch) visualGroupSearch.addEventListener("input", renderVisualGroupList);
      if (visualGroupCategories) {
        visualGroupCategories.addEventListener("click", function (event) {
          selectVisualCategory(event.target.closest("[data-visual-category]"));
        });
        visualGroupCategories.addEventListener("keydown", function (event) {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          var buttons = Array.prototype.slice.call(visualGroupCategories.querySelectorAll("[data-visual-category]"));
          var current = buttons.indexOf(event.target);
          if (current === -1) return;
          event.preventDefault();
          var direction = event.key === "ArrowRight" ? 1 : -1;
          var next = buttons[(current + direction + buttons.length) % buttons.length];
          selectVisualCategory(next);
          next.focus();
        });
      }
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
        visualGroupTitle.setAttribute("data-visual-group", button.getAttribute("data-visual-group") || "");
        var searchTarget = button.getAttribute("data-search-target");
        visualGroups.hidden = true;
        visualGroupDetail.hidden = false;
        visualGroupBack.hidden = false;
        if (window.AlfaCodeVisualProperties) {
          window.AlfaCodeVisualProperties.bind(visualGroupDetail, visualGroupTitle, visualGroups, frame);
        }
        if (searchTarget) {
          window.setTimeout(function () {
            var target = Array.prototype.find.call(
              visualGroupDetail.querySelectorAll("[data-visual-property]"),
              function (row) { return row.getAttribute("data-visual-property") === searchTarget; }
            );
            if (target) {
              var section = target.closest("details");
              if (section) section.open = true;
              target.scrollIntoView({ block: "center", behavior: "smooth" });
              target.classList.add("is-search-match");
              window.setTimeout(function () { target.classList.remove("is-search-match"); }, 1600);
            }
          }, 0);
        }
        setControlsEnabled(!!selectedSelector);
        requestComputedStyles();
      });
      visualGroupBack.addEventListener("click", function () {
        latestComputedRequest += 1;
        visualGroupDetail.hidden = true;
        visualGroups.hidden = false;
        visualGroupBack.hidden = true;
      });
    }

    if (frame) {
      frame.addEventListener("load", function () {
        documentGeneration += 1;
        clearSelectionState();
        if (visualMode && visualGroupDetail && !visualGroupDetail.hidden) {
          window.AlfaCodeVisualProperties.bind(visualGroupDetail, visualGroupTitle, visualGroups, frame);
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
            typeof event.data.label === "string" &&
            typeof event.data.selector === "string" &&
            Array.isArray(event.data.matchedRules) &&
            event.data.documentGeneration === documentGeneration &&
            Number.isInteger(event.data.selectionGeneration) &&
            event.data.selectionGeneration > selectionGeneration &&
            /^(?:html|body|#[A-Za-z_][A-Za-z0-9_-]*|body(?: > [a-z][a-z0-9-]*:nth-of-type\(\d+\))+)$/.test(event.data.selector)) {
          selectionGeneration = event.data.selectionGeneration;
          updateInspector(event.data.label, event.data.selector, event.data.matchedRules);
        } else if (event.data.type === "alfa-visual-selection-invalid" &&
            event.data.documentGeneration === documentGeneration &&
            event.data.selectionGeneration === selectionGeneration) {
          clearSelectionState();
          if (visualSelection) visualSelection.textContent = "Selection changed. Select an element again.";
        } else if (event.data.type === "alfa-visual-computed" &&
            window.AlfaCodeVisualProperties && visualGroupDetail &&
            event.data.requestId === latestComputedRequest &&
            event.data.documentGeneration === documentGeneration &&
            event.data.selectionGeneration === selectionGeneration &&
            event.data.values && typeof event.data.values === "object" &&
            !Array.isArray(event.data.values) &&
            !!selectedSelector && !visualGroupDetail.hidden) {
          window.AlfaCodeVisualProperties.setComputedValues(
            visualGroupDetail, event.data.values, event.data.inlineStyles
          );
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
        clearSelectionState();
        rightSidebar.classList.remove("is-inspecting");
        document.querySelector("#sidebarRight .sidebar-title").textContent = "Menu";
        if (visualGroupDetail) visualGroupDetail.hidden = true;
        if (visualGroups) visualGroups.hidden = false;
        if (visualGroupBack) visualGroupBack.hidden = true;
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
