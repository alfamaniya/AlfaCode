(function () {
  "use strict";
  var DEFAULT_HTML = [
    '<div class="demo-card">',
    '  <h1>Hello, Alfa-Code!</h1>',
    '  <p>Edit the HTML, CSS, and JS tabs to see live changes.</p>',
    '  <button data-demo-btn>Click me</button>',
    '</div>'
  ].join('\n');

  var DEFAULT_CSS = [
    '.demo-card {',
    '  max-width: 420px;',
    '  margin: 0 auto;',
    '  padding: 24px;',
    '  background: #0d3845;',
    '  border: 1px solid #45d8e8;',
    '  border-radius: 12px;',
    '  color: #d6f5fb;',
    '  font-family: system-ui, sans-serif;',
    '  box-shadow: 0 0 24px rgba(69,216,232,.18);',
    '}',
    '.demo-card h1 { color: #45d8e8; margin: 0 0 12px; font-size: 20px; }',
    '.demo-card p  { color: #7fc0d0; margin: 0 0 16px; font-size: 14px; }',
    '[data-demo-btn] {',
    '  padding: 8px 20px;',
    '  background: #45d8e8;',
    '  color: #041620;',
    '  border: 0;',
    '  border-radius: 8px;',
    '  font-weight: 700;',
    '  cursor: pointer;',
    '  transition: transform .15s ease;',
    '}',
    '[data-demo-btn]:hover { transform: translateY(-1px); }'
  ].join('\n');

  var DEFAULT_JS = [
    "document.addEventListener('click', function (e) {",
    "  if (e.target.matches('[data-demo-btn]')) {",
    "    alert('Hello from Alfa-Code!');",
    "  }",
    "});"
  ].join('\n');
  window.AlfaCodeDefaults = { html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS };
})();
