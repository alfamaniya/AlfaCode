(function () {
  "use strict";
  function splitHTML(input) {
    if (!input) return { html: "", css: "", js: "" };
    var styles = [];
    var scripts = [];
    try {
      var doc = new DOMParser().parseFromString(input, "text/html");
      doc.querySelectorAll("style").forEach(function (node) {
        if (node.textContent && node.textContent.trim()) styles.push(node.textContent);
      });
      doc.querySelectorAll("script").forEach(function (node) {
        if (!node.src && node.textContent && node.textContent.trim()) scripts.push(node.textContent);
      });
    } catch (error) {
      console.warn("[Alfa-Code] DOMParser split failed, using regex only:", error);
    }
    var html = input
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, function (match, attrs) {
        return /\bsrc\s*=/i.test(attrs) ? match : "";
      })
      .replace(/<script\b[^>]*\/>/gi, function (match) {
        return /\bsrc\s*=/i.test(match) ? match : "";
      })
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return {
      html: html,
      css: styles.map(function (style) { return style.trim(); }).join("\n\n"),
      js: scripts.map(function (script) { return script.trim(); }).join("\n\n")
    };
  }

  function looksLikeFullDocument(text) {
    return /<!doctype\s+html/i.test(text) || /<html[\s>]/i.test(text);
  }
  window.AlfaCodeImport = { splitHTML: splitHTML, looksLikeFullDocument: looksLikeFullDocument };
})();
