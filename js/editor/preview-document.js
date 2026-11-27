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
    style.textContent = safeCss;
    doc.head.appendChild(style);
    var script = doc.createElement("script");
    script.textContent = safeJs;
    doc.body.appendChild(script);
    var visualScript = doc.createElement("script");
    visualScript.textContent = "(" + visualEditorBootstrap.toString() + ")();";
    doc.body.appendChild(visualScript);
    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
  }

  function visualEditorBootstrap() {
    var visualMode = false;
    var selectedElement = null;
    var hoveredElement = null;
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
      var selected = element;
      var parts = [];
      while (element && element !== document.body) {
        var parent = element.parentElement;
        if (!parent) break;
        var siblings = Array.prototype.filter.call(parent.children, function (child) {
          return child.tagName === element.tagName;
        });
        parts.unshift(element.tagName.toLowerCase() + ":nth-of-type(" + (siblings.indexOf(element) + 1) + ")");
        element = parent;
      }
      var specificityId = "alfa-visual-editor-specificity";
      if (selected.id === specificityId) specificityId += "-1";
      return "body > " + parts.join(" > ") + ":not(#" + specificityId + ")";
    }

    function sendSelection(element) {
      selectedElement = element;
      document.querySelectorAll("[data-alfa-visual-selected]").forEach(function (item) {
        item.removeAttribute("data-alfa-visual-selected");
      });
      selectedElement.setAttribute("data-alfa-visual-selected", "");
      parent.postMessage({
        type: "alfa-visual-selection",
        selector: selectorFor(selectedElement),
        label: labelFor(selectedElement)
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
      if (!element || /^(HTML|HEAD|BODY|SCRIPT|STYLE)$/.test(element.tagName)) return;
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
      var message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "alfa-visual-mode") {
        visualMode = message.enabled === true;
        document.documentElement.classList.toggle("alfa-visual-mode", visualMode);
        if (!visualMode && selectedElement) {
          selectedElement.removeAttribute("data-alfa-visual-selected");
          selectedElement = null;
        }
        if (!visualMode) clearHover();
      }
    });

    parent.postMessage({ type: "alfa-visual-ready" }, "*");
  }
  window.AlfaCodePreview = { buildDocument: buildDocument };
})();
