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
    var overlay = document.createElement("style");
    overlay.textContent = "html.alfa-visual-mode, html.alfa-visual-mode * { cursor: crosshair !important; } [data-alfa-visual-selected] { outline: 2px solid #ff8a00 !important; outline-offset: 2px !important; }";
    document.head.appendChild(overlay);

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
      var label = selectedElement.tagName.toLowerCase();
      if (selectedElement.id) label += "#" + selectedElement.id;
      else if (selectedElement.classList.length) label += "." + Array.prototype.join.call(selectedElement.classList, ".");
      parent.postMessage({
        type: "alfa-visual-selection",
        selector: selectorFor(selectedElement),
        label: label
      }, "*");
    }

    document.addEventListener("click", function (event) {
      if (!visualMode) return;
      var element = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      if (!element || /^(HTML|HEAD|BODY|SCRIPT|STYLE)$/.test(element.tagName)) return;
      event.preventDefault();
      event.stopPropagation();
      sendSelection(element);
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
      }
    });

    parent.postMessage({ type: "alfa-visual-ready" }, "*");
  }
  window.AlfaCodePreview = { buildDocument: buildDocument };
})();
