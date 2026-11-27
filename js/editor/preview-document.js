(function () {
  "use strict";
  function buildDocument(values) {
    var safeCss = values.css.replace(/<\/style/gi, "<\\/style");
    var safeJs = values.js.replace(/<\/script/gi, "<\\/script");
    var doc = new DOMParser().parseFromString(values.html, "text/html");
    if (!doc.querySelector("meta[charset]")) {
      var metaCharset = doc.createElement("meta");
      metaCharset.setAttribute("charset", "utf-8");
      doc.head.insertBefore(metaCharset, doc.head.firstChild);
    }
    if (!doc.querySelector('meta[name="viewport"]')) {
      var metaViewport = doc.createElement("meta");
      metaViewport.setAttribute("name", "viewport");
      metaViewport.setAttribute("content", "width=device-width,initial-scale=1");
      doc.head.appendChild(metaViewport);
    }
    var style = doc.createElement("style");
    var cssStyleId = "alfa-code-generated-css";
    while (doc.getElementById(cssStyleId)) cssStyleId += "-";
    style.id = cssStyleId;
    style.textContent = safeCss;
    doc.head.appendChild(style);
    var script = doc.createElement("script");
    script.textContent = safeJs;
    doc.body.appendChild(script);
    var visualScript = doc.createElement("script");
    visualScript.textContent = "(" + visualEditorBootstrap.toString() + ")(" + JSON.stringify(cssStyleId) + ");";
    doc.body.appendChild(visualScript);
    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
  }

  function visualEditorBootstrap(cssStyleId) {
    var visualMode = false;
    var selectedElement = null;
    var selectedSelector = null;
    var hoveredElement = null;
    var documentGeneration = 0;
    var selectionGeneration = 0;
    var nextSelectionGeneration = 0;
    var managedCssStyle = document.getElementById(cssStyleId);
    var visualOverrides = {};
    var visualOverrideStyle = document.createElement("style");
    var visualOverrideStyleId = cssStyleId + "-visual-overrides";
    while (document.getElementById(visualOverrideStyleId)) visualOverrideStyleId += "-";
    visualOverrideStyle.id = visualOverrideStyleId;
    document.head.appendChild(visualOverrideStyle);
    var overlay = document.createElement("style");
    overlay.textContent = "html.alfa-visual-mode, html.alfa-visual-mode * { cursor: crosshair !important; } [data-alfa-visual-hovered] { outline: 2px solid #45d8e8 !important; outline-offset: 2px !important; } [data-alfa-visual-selected] { outline: 2px solid #ff8a00 !important; outline-offset: 2px !important; } #alfa-visual-hover-label { position: fixed; z-index: 2147483647; max-width: min(320px, calc(100vw - 16px)); padding: 5px 8px; border: 1px solid #45d8e8; border-radius: 6px; background: #04141a; color: #d6f5fb; box-shadow: 0 0 12px rgba(69,216,232,.28); font: 12px/1.35 system-ui, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }";
    document.head.appendChild(overlay);

    var hoverLabel = document.createElement("div");
    hoverLabel.id = "alfa-visual-hover-label";
    hoverLabel.hidden = true;
    hoverLabel.setAttribute("aria-hidden", "true");
    document.body.appendChild(hoverLabel);

    function labelFor(element) {
      var label = element.tagName.toLowerCase();
      if (element.id) label += "#" + element.id;
      if (element.classList.length) label += "." + Array.prototype.join.call(element.classList, ".");
      return label;
    }

    function clearHover() {
      if (hoveredElement) parent.postMessage({ type: "alfa-visual-hover-clear" }, "*");
      if (hoveredElement) hoveredElement.removeAttribute("data-alfa-visual-hovered");
      hoveredElement = null;
      hoverLabel.hidden = true;
    }

    function clearSelection() {
      if (selectedElement) selectedElement.removeAttribute("data-alfa-visual-selected");
      selectedElement = null;
      selectedSelector = null;
      selectionGeneration = 0;
    }

    function renderVisualOverrides() {
      var rules = [];
      Object.keys(visualOverrides).forEach(function (selector) {
        Object.keys(visualOverrides[selector]).forEach(function (property) {
          var entry = visualOverrides[selector][property];
          rules.push(selector + " { " + property + ": " + entry.value +
            (entry.important ? " !important" : "") + "; }");
        });
      });
      visualOverrideStyle.textContent = rules.join("\n");
    }

    function showHover(element, event) {
      if (!element || /^(HTML|HEAD|BODY|SCRIPT|STYLE)$/.test(element.tagName)) {
        clearHover();
        return;
      }

      if (hoveredElement !== element) {
        if (hoveredElement) hoveredElement.removeAttribute("data-alfa-visual-hovered");
        hoveredElement = element;
        hoveredElement.setAttribute("data-alfa-visual-hovered", "");
        var label = labelFor(element);
        hoverLabel.textContent = label;
        parent.postMessage({ type: "alfa-visual-hover", label: label }, "*");
      }

      hoverLabel.hidden = false;
      var left = Math.max(8, Math.min(event.clientX - hoverLabel.offsetWidth / 2, window.innerWidth - hoverLabel.offsetWidth - 8));
      var top = event.clientY - hoverLabel.offsetHeight - 12;
      if (top < 8) top = Math.min(window.innerHeight - hoverLabel.offsetHeight - 8, event.clientY + 16);
      hoverLabel.style.left = left + "px";
      hoverLabel.style.top = top + "px";
    }

    function selectorFor(element) {
      if (element === document.documentElement) return "html";
      if (element === document.body) return "body";
      if (element.id && /^[A-Za-z_][A-Za-z0-9_-]*$/.test(element.id) &&
          document.querySelectorAll("#" + element.id).length === 1) return "#" + element.id;
      var parts = [];
      while (element && element !== document.body && element !== document.documentElement) {
        var parent = element.parentElement;
        if (!parent) break;
        var siblings = Array.prototype.filter.call(parent.children, function (child) {
          return child.tagName === element.tagName;
        });
        parts.unshift(element.tagName.toLowerCase() + ":nth-of-type(" + (siblings.indexOf(element) + 1) + ")");
        element = parent;
      }
      return "body > " + parts.join(" > ");
    }

    function matchingStyleRules(element) {
      var matches = [];
      var rules = managedCssStyle && managedCssStyle.sheet ? managedCssStyle.sheet.cssRules : [];

      function visit(ruleList) {
        Array.prototype.forEach.call(ruleList || [], function (rule) {
          if (typeof rule.selectorText === "string" && rule.style) {
            try {
              if (element.matches(rule.selectorText)) {
                var properties = [];
                for (var index = 0; index < rule.style.length; index++) {
                  properties.push(rule.style.item(index));
                }
                matches.push({ selector: rule.selectorText, properties: properties });
              }
            } catch (error) {
              return;
            }
          } else if (rule.cssRules) {
            if (rule.conditionText && window.matchMedia &&
                !/^\s*@supports/i.test(rule.cssText) &&
                !window.matchMedia(rule.conditionText).matches) return;
            visit(rule.cssRules);
          }
        });
      }

      visit(rules);
      return matches;
    }

    function sendSelection(element) {
      clearSelection();
      selectedElement = element;
      selectedSelector = selectorFor(element);
      selectionGeneration = ++nextSelectionGeneration;
      selectedElement.setAttribute("data-alfa-visual-selected", "");
      parent.postMessage({
        type: "alfa-visual-selection",
        selector: selectedSelector,
        matchedRules: matchingStyleRules(selectedElement),
        label: labelFor(selectedElement),
        documentGeneration: documentGeneration,
        selectionGeneration: selectionGeneration
      }, "*");
    }

    document.addEventListener("mousemove", function (event) {
      if (!visualMode) return;
      var element = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      showHover(element, event);
    }, true);

    document.addEventListener("mouseleave", clearHover);

    document.addEventListener("click", function (event) {
      if (!visualMode) return;
      var element = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      if (!element || /^(HEAD|SCRIPT|STYLE)$/.test(element.tagName) || element.id === hoverLabel.id) return;
      event.preventDefault();
      event.stopPropagation();
      sendSelection(element);
    }, true);

    document.addEventListener("keydown", function (event) {
      if (visualMode && event.key === "Escape") {
        parent.postMessage({ type: "alfa-visual-exit" }, "*");
      }
    }, true);

    window.addEventListener("message", function (event) {
      if (event.source !== parent) return;
      var message = event.data;
      if (!message || typeof message !== "object") return;
      if ((message.type === "alfa-visual-computed-request" || message.type === "alfa-visual-property") &&
          selectedElement && (!selectedElement.isConnected || selectorFor(selectedElement) !== selectedSelector)) {
        var invalidSelection = {
          type: "alfa-visual-selection-invalid",
          documentGeneration: documentGeneration,
          selectionGeneration: selectionGeneration
        };
        clearSelection();
        parent.postMessage(invalidSelection, "*");
        return;
      }
      if (message.type === "alfa-visual-mode") {
        if (Number.isInteger(message.documentGeneration)) documentGeneration = message.documentGeneration;
        visualMode = message.enabled === true;
        document.documentElement.classList.toggle("alfa-visual-mode", visualMode);
        if (!visualMode) clearSelection();
        if (!visualMode) clearHover();
      } else if (message.type === "alfa-visual-clear-selection") {
        clearSelection();
      } else if (message.type === "alfa-visual-computed-request" && selectedElement) {
        if (message.documentGeneration !== documentGeneration ||
            message.selectionGeneration !== selectionGeneration ||
            !Number.isInteger(message.requestId) ||
            !Array.isArray(message.properties)) return;
        var computed = window.getComputedStyle(selectedElement);
        var values = {};
        var inlineStyles = {};
        (message.properties || []).forEach(function (property) {
          if (typeof property !== "string" || property.indexOf("--alfa-") === 0) return;
          values[property] = computed.getPropertyValue(property).trim();
          inlineStyles[property] = {
            present: selectedElement.style.getPropertyValue(property) !== "",
            important: selectedElement.style.getPropertyPriority(property) === "important"
          };
        });
        parent.postMessage({
          type: "alfa-visual-computed",
          requestId: message.requestId,
          documentGeneration: documentGeneration,
          selectionGeneration: selectionGeneration,
          values: values,
          inlineStyles: inlineStyles
        }, "*");
      } else if (message.type === "alfa-visual-property" && selectedElement &&
          typeof message.property === "string" && message.documentGeneration === documentGeneration &&
          message.selectionGeneration === selectionGeneration && typeof message.value === "string" &&
          (/^[a-z][a-z0-9-]*$/i.test(message.property) ||
            /^--(?!alfa-)[a-z0-9_-]+$/i.test(message.property))) {
        var selector = selectedSelector;
        if (!message.value) {
          if (visualOverrides[selector]) delete visualOverrides[selector][message.property];
          if (visualOverrides[selector] && !Object.keys(visualOverrides[selector]).length) delete visualOverrides[selector];
        } else {
          if (!visualOverrides[selector]) visualOverrides[selector] = {};
          visualOverrides[selector][message.property] = {
            value: message.value,
            important: message.important === true
          };
        }
        renderVisualOverrides();
      } else if (message.type === "alfa-visual-css-sync" &&
          message.documentGeneration === documentGeneration && typeof message.css === "string") {
        if (!managedCssStyle || !managedCssStyle.isConnected) {
          managedCssStyle = document.createElement("style");
          do {
            cssStyleId += "-";
          } while (document.getElementById(cssStyleId));
          managedCssStyle.id = cssStyleId;
          document.head.appendChild(managedCssStyle);
        }
        managedCssStyle.textContent = message.css;
        visualOverrides = {};
        renderVisualOverrides();
      }
    });

    parent.postMessage({ type: "alfa-visual-ready" }, "*");
  }
  window.AlfaCodePreview = { buildDocument: buildDocument };
})();
