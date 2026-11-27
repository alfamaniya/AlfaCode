/* ============ UI interactions ============ */
(function () {
  "use strict";
  var root    = document.documentElement;
  var main    = document.getElementById("main");
  var split   = document.getElementById("split");
  var splitDiv = document.getElementById("splitDivider");

  var viewModes = [
    { key: "preview", buttonId: "togglePreview", attribute: "data-preview-visible" },
    { key: "header", buttonId: "toggleHeader", attribute: "data-header-visible" },
    { key: "footer", buttonId: "toggleFooter", attribute: "data-footer-visible" }
  ];
  var savedViewModes = load("alfa-code:view-modes", {});
  if (!savedViewModes || typeof savedViewModes !== "object") savedViewModes = {};
  viewModes.forEach(function (mode) {
    var button = document.getElementById(mode.buttonId);
    var visible = !Object.prototype.hasOwnProperty.call(savedViewModes, mode.key) ||
      savedViewModes[mode.key] !== false;
    var label = mode.key === "preview" ? "preview" : mode.key;
    root.setAttribute(mode.attribute, visible ? "true" : "false");
    if (button) {
      button.setAttribute("aria-pressed", visible ? "true" : "false");
      button.classList.toggle("is-active", visible);
      button.setAttribute("aria-label", (visible ? "Hide " : "Show ") + label);
      button.title = button.getAttribute("aria-label");
      button.addEventListener("click", function () {
        visible = !visible;
        root.setAttribute(mode.attribute, visible ? "true" : "false");
        button.setAttribute("aria-pressed", visible ? "true" : "false");
        button.classList.toggle("is-active", visible);
        button.setAttribute("aria-label", (visible ? "Hide " : "Show ") + label);
        button.title = button.getAttribute("aria-label");
        var current = load("alfa-code:view-modes", {});
        if (!current || typeof current !== "object") current = {};
        current[mode.key] = visible;
        save("alfa-code:view-modes", current);
        window.dispatchEvent(new Event("alfa-code:layout-change"));
      });
    }
  });

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function makeResizer(handle, opts) {
    var dragging = false;
    function valueFromEvent(e) {
      if (opts.percentOf) {
        var rect = opts.percentOf.getBoundingClientRect();
        return ((e.clientX - rect.left) / rect.width) * 100;
      }
      return opts.reverse ? (window.innerWidth - e.clientX) : e.clientX;
    }
    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.classList.add("is-dragging");
      document.body.classList.add("resizing");
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      opts.set(valueFromEvent(e));
    });
    function stop() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("is-dragging");
      document.body.classList.remove("resizing");
      if (opts.onEnd) opts.onEnd();
    }
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("dblclick", function () {
      opts.set(opts.default);
      if (opts.onEnd) opts.onEnd();
    });
    handle.addEventListener("keydown", function (e) {
      var cur = opts.current();
      var step = opts.step || 16;
      if (e.key === "ArrowLeft")  { opts.set(cur - step); e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "ArrowRight") { opts.set(cur + step); e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "Home")       { opts.set(opts.min);   e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
      if (e.key === "End")        { opts.set(opts.max);   e.preventDefault(); if (opts.onEnd) opts.onEnd(); }
    });
  }

  function makeSidebar(opts) {
    var sidebar = document.getElementById(opts.sidebarId);
    var toggle  = document.getElementById(opts.toggleId);
    var resizer = document.getElementById(opts.resizerId);
    var side    = opts.side;
    var cssVar  = side === "left" ? "--left-w" : "--right-w";
    var railVar = side === "left" ? "--left-rail" : "--right-rail";
    var MAIN_MIN = 200;
    var DEFAULT = load(opts.storeKey, opts.defaultW);
    var current = DEFAULT;
    var isOpen  = false;
    var pinned  = false;
    var closeTimer = null;
    var suppressHoverUntil = 0;

    function getRail() {
      return parseInt(getComputedStyle(root).getPropertyValue(railVar), 10) || 56;
    }
    function isMobile() { return window.innerWidth <= 768; }
    function setWidth(px) {
      var viewportCap = window.innerWidth - MAIN_MIN - getRail() - 20;
      var limit = Math.max(opts.min, Math.min(opts.max, viewportCap));
      var w = Math.round(Math.min(limit, Math.max(opts.min, px)));
      current = w;
      root.style.setProperty(cssVar, w + "px");
      resizer.setAttribute("aria-valuenow", w);
    }
    function applyOpen(open) {
      isOpen = open;
      sidebar.classList.toggle("is-open", open);
      main.classList.toggle(side + "-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", (open ? "Collapse " : "Expand ") + side + " menu");
      resizer.classList.toggle("is-active", open);
    }
    function cancelClose() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    }
    function scheduleClose() {
      cancelClose();
      if (pinned) return;
      closeTimer = setTimeout(function () {
        if (!pinned) applyOpen(false);
        closeTimer = null;
      }, 250);
    }

    toggle.addEventListener("click", function () {
      cancelClose();
      if (pinned) {
        pinned = false;
        applyOpen(false);
        suppressHoverUntil = Date.now() + 500;
      } else {
        pinned = true;
        applyOpen(true);
      }
    });

    sidebar.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      if (Date.now() < suppressHoverUntil) return;
      cancelClose();
      if (!isOpen) applyOpen(true);
    });
    sidebar.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      scheduleClose();
    });
    resizer.addEventListener("pointerenter", cancelClose);
    resizer.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") return;
      if (isMobile()) return;
      scheduleClose();
    });

    makeResizer(resizer, {
      set: setWidth,
      current: function () { return current; },
      default: opts.defaultW,
      min: opts.min,
      max: opts.max,
      step: 16,
      reverse: side === "right",
      onEnd: function () { save(opts.storeKey, current); }
    });

    setWidth(DEFAULT);
    applyOpen(false);
    resizer.setAttribute("aria-valuemin", opts.min);
    resizer.setAttribute("aria-valuemax", opts.max);

    return {
      open:  function () { pinned = true;  applyOpen(true);  },
      close: function () { pinned = false; applyOpen(false); },
      isOpen: function () { return isOpen; }
    };
  }

  var leftSidebar = makeSidebar({
    sidebarId: "sidebarLeft",
    toggleId:  "leftToggle",
    resizerId: "leftResizer",
    side:      "left",
    storeKey:  "alfa-code:left-w",
    defaultW:  240,
    min: 200,
    max: 560
  });
  var rightSidebar = makeSidebar({
    sidebarId: "sidebarRight",
    toggleId:  "rightToggle",
    resizerId: "rightResizer",
    side:      "right",
    storeKey:  "alfa-code:right-w",
    defaultW:  240,
    min: 200,
    max: 560
  });

  var SPLIT_MIN = 15, SPLIT_MAX = 85, SPLIT_DEFAULT = 50;
  var splitVal = load("alfa-code:split", SPLIT_DEFAULT);
  function setSplit(percent) {
    var v = Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, percent));
    splitVal = v;
    split.style.setProperty("--split", v);
    splitDiv.setAttribute("aria-valuenow", Math.round(v));
  }
  makeResizer(splitDiv, {
    percentOf: split,
    set: setSplit,
    current: function () { return splitVal; },
    default: SPLIT_DEFAULT,
    min: SPLIT_MIN,
    max: SPLIT_MAX,
    step: 2,
    onEnd: function () { save("alfa-code:split", splitVal); }
  });
  splitDiv.setAttribute("aria-valuemin", SPLIT_MIN);
  splitDiv.setAttribute("aria-valuemax", SPLIT_MAX);
  setSplit(splitVal);

  var tabs   = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = document.querySelectorAll(".tab-panel");
  function activateTab(tab) {
    tabs.forEach(function (t) {
      var isActive = t === tab;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
      t.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach(function (p) { p.classList.remove("active"); });
    var target = document.getElementById("panel-" + tab.dataset.tab);
    if (target) target.classList.add("active");
    document.dispatchEvent(new CustomEvent("alfa-code:tab-change", {
      detail: { tab: tab.dataset.tab }
    }));
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { activateTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (e.key === "ArrowLeft")  next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (next) { next.focus(); activateTab(next); e.preventDefault(); }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (rightSidebar.isOpen()) rightSidebar.close();
      else if (leftSidebar.isOpen()) leftSidebar.close();
    }
  });

  document.addEventListener("pointerdown", function (e) {
    if (window.innerWidth > 768) return;
    if (e.target.closest && e.target.closest(".sidebar")) return;
    if (leftSidebar.isOpen()) leftSidebar.close();
    if (rightSidebar.isOpen()) rightSidebar.close();
  });

  window.addEventListener("resize", function () {
    if (leftSidebar.isOpen() && window.innerWidth < 900) leftSidebar.close();
    if (rightSidebar.isOpen() && window.innerWidth < 900) rightSidebar.close();
  });
})();

/* ============ Editor, Import, Paste & Live Preview ============ */
(function () {
  "use strict";

  var frame = document.getElementById("previewFrame");
  var importBtn = document.getElementById("importBtn");
  var importFile = document.getElementById("importFile");
  var editorSwitch = document.getElementById("editorSwitch");
  var editorName = document.getElementById("editorName");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var tabKeys = ["html", "css", "js"];
  var languageByTab = { html: "html", css: "css", js: "javascript" };
  var engineNames = { monaco: "Monaco", codemirror6: "CodeMirror 6" };

  function showToast(msg, isError) {
    var container = document.getElementById("toastContainer");
    if (!container) return;
    var el = document.createElement("div");
    el.className = "toast" + (isError ? " toast--error" : "");
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity .25s";
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
    }, 2600);
  }

  if (!frame || !editorSwitch || !editorName || !window.CodeMirror6 || !window.require) {
    console.error("[Alfa-Code] Editor assets or page elements are missing.");
    showToast("Could not load the offline code editors.", true);
    return;
  }

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

  function load(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }
  function loadString(key, fallback) {
    var value = load(key, null);
    return typeof value === "string" ? value : fallback;
  }

  var values = {
    html: loadString("alfa-code:html", DEFAULT_HTML),
    css: loadString("alfa-code:css", DEFAULT_CSS),
    js: loadString("alfa-code:js", DEFAULT_JS)
  };
  var activeEngine = load("alfa-code:editor", "monaco");
  if (!Object.prototype.hasOwnProperty.call(engineNames, activeEngine)) activeEngine = "monaco";
  var activeTab = "html";
  var instances = { monaco: {}, codemirror6: {} };
  var selections = { monaco: {}, codemirror6: {} };
  var monacoPromise = null;
  var suppressChanges = false;
  var saveTimer = null;
  var renderTimer = null;

  function persist() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushPersist, 400);
  }
  function flushPersist() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    tabKeys.forEach(function (key) { save("alfa-code:" + key, values[key]); });
    save("alfa-code:editor", activeEngine);
  }
  window.addEventListener("beforeunload", flushPersist);

  function schedule() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 250);
  }

  function getCurrentEditor() {
    return instances[activeEngine][activeTab] || null;
  }

  function handleChange(key, value) {
    if (suppressChanges) return;
    values[key] = value;
    persist();
    schedule();
  }

  function saveSelection() {
    var editor = getCurrentEditor();
    if (editor) selections[activeEngine][activeTab] = editor.getSelection();
  }

  function syncEditorSurfaces() {
    tabKeys.forEach(function (key) {
      var panel = document.getElementById("panel-" + key);
      if (panel) panel.classList.toggle("active", key === activeTab);
      ["monaco", "codemirror6"].forEach(function (engine) {
        var surface = document.getElementById("editor-" + key + "-" + engine);
        if (surface) surface.classList.toggle("active", key === activeTab && engine === activeEngine);
      });
    });
  }

  function loadMonaco() {
    if (monacoPromise) return monacoPromise;
    monacoPromise = new Promise(function (resolve, reject) {
      window.require.config({ paths: { vs: "./editors/monaco/vs" } });
      window.require(["vs/editor/editor.main"], function () {
        if (!window.monaco || !window.monaco.editor) {
          reject(new Error("Monaco loaded without its editor API."));
          return;
        }
        resolve(window.monaco);
      }, reject);
    });
    return monacoPromise;
  }

  function createMonacoEditor(key, surface) {
    return loadMonaco().then(function (monaco) {
      var editor = monaco.editor.create(surface, {
        value: values[key],
        language: languageByTab[key],
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        fontSize: 13,
        fontFamily: 'Consolas, "Courier New", monospace',
        roundedSelection: true,
        renderLineHighlight: "line",
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        formatOnPaste: false
      });
      editor.onDidChangeModelContent(function () { handleChange(key, editor.getValue()); });
      return {
        getValue: function () { return editor.getValue(); },
        setValue: function (value) { editor.setValue(value); },
        getSelection: function () {
          var selection = editor.getSelection();
          var model = editor.getModel();
          return selection && model ? {
            from: model.getOffsetAt(selection.getStartPosition()),
            to: model.getOffsetAt(selection.getEndPosition())
          } : { from: 0, to: 0 };
        },
        setSelection: function (selection) {
          var model = editor.getModel();
          if (!model || !selection) return;
          editor.setSelection({
            startLineNumber: model.getPositionAt(selection.from).lineNumber,
            startColumn: model.getPositionAt(selection.from).column,
            endLineNumber: model.getPositionAt(selection.to).lineNumber,
            endColumn: model.getPositionAt(selection.to).column
          });
        },
        replaceSelection: function (text) {
          var range = editor.getSelection();
          if (range) editor.executeEdits("alfa-code-paste", [{ range: range, text: text, forceMoveMarkers: true }]);
        },
        focus: function () { editor.focus(); },
        layout: function () { editor.layout(); },
        undo: function () { editor.trigger("alfa-code", "undo", null); },
        redo: function () { editor.trigger("alfa-code", "redo", null); },
        find: function () {
          var action = editor.getAction("actions.find");
          if (action) action.run();
        }
      };
    });
  }

  function createCodeMirrorEditor(key, surface) {
    var CodeMirror6 = window.CodeMirror6;
    var language = key === "html" ? CodeMirror6.html :
      (key === "css" ? CodeMirror6.css : CodeMirror6.javascript);
    var editor = new CodeMirror6.EditorView({
      doc: values[key],
      extensions: [
        CodeMirror6.basicSetup,
        language(),
        CodeMirror6.EditorView.lineWrapping,
        CodeMirror6.EditorView.updateListener.of(function (update) {
          if (update.docChanged) handleChange(key, update.state.doc.toString());
        })
      ],
      parent: surface
    });
    return {
      getValue: function () { return editor.state.doc.toString(); },
      setValue: function (value) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
      },
      getSelection: function () {
        var range = editor.state.selection.main;
        return { from: range.from, to: range.to };
      },
      setSelection: function (selection) {
        if (selection) editor.dispatch({ selection: { anchor: selection.from, head: selection.to } });
      },
      replaceSelection: function (text) {
        var range = editor.state.selection.main;
        editor.dispatch({
          changes: { from: range.from, to: range.to, insert: text },
          selection: { anchor: range.from + text.length }
        });
      },
      focus: function () { editor.focus(); },
      layout: function () { editor.requestMeasure(); },
      undo: function () { CodeMirror6.undo(editor); },
      redo: function () { CodeMirror6.redo(editor); },
      find: function () { CodeMirror6.openSearchPanel(editor); }
    };
  }

  function ensureEditor(engine, key) {
    if (instances[engine][key]) return Promise.resolve(instances[engine][key]);
    var surface = document.getElementById("editor-" + key + "-" + engine);
    if (!surface) return Promise.reject(new Error("Missing editor surface for " + key + "."));
    var created = engine === "monaco"
      ? createMonacoEditor(key, surface)
      : Promise.resolve(createCodeMirrorEditor(key, surface));
    return created.then(function (editor) {
      instances[engine][key] = editor;
      var selection = selections[engine][key];
      if (selection) editor.setSelection(selection);
      editor.layout();
      return editor;
    });
  }

  function syncExistingEditors() {
    suppressChanges = true;
    try {
      ["monaco", "codemirror6"].forEach(function (engine) {
        tabKeys.forEach(function (key) {
          var editor = instances[engine][key];
          if (editor && editor.getValue() !== values[key]) editor.setValue(values[key]);
        });
      });
    } finally {
      suppressChanges = false;
    }
  }

  function setValues(nextValues) {
    tabKeys.forEach(function (key) {
      if (typeof nextValues[key] === "string") values[key] = nextValues[key];
    });
    syncExistingEditors();
    persist();
    schedule();
  }

  function activateTab(key) {
    if (tabKeys.indexOf(key) === -1) return;
    saveSelection();
    activeTab = key;
    syncEditorSurfaces();
    ensureEditor(activeEngine, activeTab).then(function (editor) {
      editor.layout();
    }).catch(function (error) {
      console.error("[Alfa-Code] Could not initialize editor:", error);
      showToast("Could not initialize " + engineNames[activeEngine] + ": " + error.message, true);
    });
  }

  function updateSwitchButton() {
    var nextEngine = activeEngine === "monaco" ? "codemirror6" : "monaco";
    editorName.textContent = engineNames[activeEngine];
    editorSwitch.setAttribute("aria-label", "Switch editor to " + engineNames[nextEngine]);
    editorSwitch.title = "Switch to " + engineNames[nextEngine];
  }

  function switchEditor() {
    var nextEngine = activeEngine === "monaco" ? "codemirror6" : "monaco";
    saveSelection();
    if (getCurrentEditor()) values[activeTab] = getCurrentEditor().getValue();
    syncExistingEditors();
    ensureEditor(nextEngine, activeTab).then(function () {
      activeEngine = nextEngine;
      save("alfa-code:editor", activeEngine);
      updateSwitchButton();
      syncEditorSurfaces();
      var editor = getCurrentEditor();
      editor.layout();
      editor.focus();
    }).catch(function (error) {
      console.error("[Alfa-Code] Could not switch editor:", error);
      showToast("Could not switch to " + engineNames[nextEngine] + ": " + error.message, true);
    });
  }

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

  function buildDocument() {
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
    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
  }

  function render() {
    if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
    frame.srcdoc = buildDocument();
  }

  function applyImportedFile(text, fileName) {
    var parts = splitHTML(text);
    setValues(parts);
    var htmlTab = document.getElementById("tab-html");
    if (htmlTab) htmlTab.click();
    var summary = "Imported" + (fileName ? " " + fileName : "") + " — ";
    var details = [];
    if (parts.css) details.push("CSS: " + parts.css.length + " chars");
    if (parts.js) details.push("JS: " + parts.js.length + " chars");
    details.push("HTML: " + parts.html.length + " chars");
    showToast(summary + details.join(" · "));
  }

  if (importFile) {
    importFile.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { applyImportedFile(String(reader.result || ""), file.name); }
        catch (error) {
          console.error("[Alfa-Code] Import failed:", error);
          showToast("Import failed: " + (error.message || "unknown error"), true);
        }
      };
      reader.onerror = function () {
        console.error("[Alfa-Code] FileReader error:", reader.error);
        showToast("Could not read the file.", true);
      };
      reader.readAsText(file);
      event.target.value = "";
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        importBtn.click();
      }
    });
  }

  function pasteFullDocument(event) {
    var clipboard = event.clipboardData || window.clipboardData;
    if (!clipboard) return;
    var text = clipboard.getData("text/plain");
    if (!text || !looksLikeFullDocument(text)) return;
    event.preventDefault();
    event.stopPropagation();
    var parts = splitHTML(text);
    var editor = getCurrentEditor();
    if (editor) editor.replaceSelection(parts.html);
    values.html = editor ? editor.getValue() : parts.html;
    if (parts.css) values.css = values.css ? values.css.replace(/\s+$/, "") + "\n\n" + parts.css : parts.css;
    if (parts.js) values.js = values.js ? values.js.replace(/\s+$/, "") + "\n\n" + parts.js : parts.js;
    syncExistingEditors();
    persist();
    render();
    showToast("Pasted HTML split — CSS & JS moved to their tabs");
  }

  var htmlHost = document.getElementById("editor-host-html");
  if (htmlHost) {
    htmlHost.addEventListener("paste", pasteFullDocument, true);
    ["dragover", "dragenter"].forEach(function (type) {
      htmlHost.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
        var surface = event.target.closest(".editor-surface");
        if (surface) surface.classList.add("is-dragover");
      });
    });
    ["dragleave", "dragend"].forEach(function (type) {
      htmlHost.addEventListener(type, function (event) {
        var surface = event.target.closest(".editor-surface");
        if (surface) surface.classList.remove("is-dragover");
      });
    });
    htmlHost.addEventListener("drop", function (event) {
      event.preventDefault();
      event.stopPropagation();
      htmlHost.querySelectorAll(".editor-surface").forEach(function (surface) {
        surface.classList.remove("is-dragover");
      });
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { applyImportedFile(String(reader.result || ""), file.name); }
        catch (error) {
          console.error("[Alfa-Code] Drop import failed:", error);
          showToast("Could not import dropped file.", true);
        }
      };
      reader.onerror = function () { showToast("Could not read the dropped file.", true); };
      reader.readAsText(file);
    });
  }

  editorSwitch.addEventListener("click", switchEditor);
  document.addEventListener("alfa-code:tab-change", function (event) {
    activateTab(event.detail && event.detail.tab);
  });
  window.addEventListener("resize", function () {
    var editor = getCurrentEditor();
    if (editor) editor.layout();
  });
  window.addEventListener("alfa-code:layout-change", function () {
    var editor = getCurrentEditor();
    if (editor) editor.layout();
  });

  var undoButton = document.querySelector('[aria-label="Undo"]');
  var redoButton = document.querySelector('[aria-label="Redo"]');
  var searchButton = document.querySelector('[aria-label="Search"]');
  if (undoButton) undoButton.addEventListener("click", function () {
    var editor = getCurrentEditor();
    if (editor) editor.undo();
  });
  if (redoButton) redoButton.addEventListener("click", function () {
    var editor = getCurrentEditor();
    if (editor) editor.redo();
  });
  if (searchButton) searchButton.addEventListener("click", function () {
    var editor = getCurrentEditor();
    if (editor) { editor.find(); editor.focus(); }
  });

  var downloadButton = document.querySelector('[aria-label="Download"]');
  if (downloadButton) downloadButton.addEventListener("click", function () {
    var blob = new Blob([buildDocument()], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "alfa-code.html";
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  });

  var openPreviewButton = document.querySelector('[aria-label="Open preview in new window"]');
  if (openPreviewButton) openPreviewButton.addEventListener("click", function () {
    var previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      showToast("The preview window was blocked by the browser. Allow pop-ups and try again.", true);
      return;
    }

    try {
      var previewDocument = previewWindow.document;
      previewDocument.title = "Alfa-Code Preview";
      previewDocument.body.style.margin = "0";
      previewDocument.body.style.height = "100vh";

      var previewFrame = previewDocument.createElement("iframe");
      previewFrame.title = "Live preview";
      previewFrame.setAttribute("sandbox", "allow-scripts allow-modals allow-forms allow-popups");
      previewFrame.style.cssText = "display:block;width:100%;height:100%;border:0";
      previewFrame.srcdoc = buildDocument();
      previewDocument.body.appendChild(previewFrame);
    } catch (error) {
      previewWindow.close();
      console.error("[Alfa-Code] Could not open preview window:", error);
      showToast("Could not open the preview window.", true);
    }
  });

  var clearButton = document.querySelector('[aria-label="Clear all tabs"]');
  if (clearButton) clearButton.addEventListener("click", function () {
    setValues({ html: "", css: "", js: "" });
    showToast("All editor tabs cleared");
  });

  var resetButton = document.querySelector('[aria-label="Factory reset"]');
  if (resetButton) resetButton.addEventListener("click", function () {
    setValues({ html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS });
    showToast("Editor content restored to defaults");
  });

  syncEditorSurfaces();
  updateSwitchButton();
  ensureEditor(activeEngine, activeTab).then(function () {
    render();
    console.log("[Alfa-Code] " + engineNames[activeEngine] + " editor initialized");
  }).catch(function (error) {
    console.error("[Alfa-Code] Could not initialize editor:", error);
    showToast("Could not initialize " + engineNames[activeEngine] + ": " + error.message, true);
  });
})();
