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

  var DEFAULT_HTML = window.AlfaCodeDefaults.html;
  var DEFAULT_CSS = window.AlfaCodeDefaults.css;
  var DEFAULT_JS = window.AlfaCodeDefaults.js;

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
  var activeEngine = window.AlfaCodeSettings.get("editorEngine") || load("alfa-code:editor", "monaco");
  if (!Object.prototype.hasOwnProperty.call(engineNames, activeEngine)) activeEngine = "monaco";
  var activeTab = "html";
  var instances = { monaco: {}, codemirror6: {} };
  var selections = { monaco: {}, codemirror6: {} };
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
    if (!window.AlfaCodeSettings.get("autoRun")) return;
    renderTimer = setTimeout(render, window.AlfaCodeSettings.get("previewDelay"));
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

  function ensureEditor(engine, key) {
    if (instances[engine][key]) return Promise.resolve(instances[engine][key]);
    var surface = document.getElementById("editor-" + key + "-" + engine);
    if (!surface) return Promise.reject(new Error("Missing editor surface for " + key + "."));
    var engineContext = { values: values, languageByTab: languageByTab, handleChange: handleChange };
    var created = engine === "monaco"
      ? window.AlfaCodeEngines.createMonacoEditor(key, surface, engineContext)
      : Promise.resolve(window.AlfaCodeEngines.createCodeMirrorEditor(key, surface, engineContext));
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

  window.AlfaCodeEditor = {
    clearSavedCode: function () {
      setValues({ html: "", css: "", js: "" });
      render();
      flushPersist();
    }
  };

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

  function switchToEngine(nextEngine, persistSetting) {
    if (nextEngine === activeEngine) return;
    saveSelection();
    if (getCurrentEditor()) values[activeTab] = getCurrentEditor().getValue();
    syncExistingEditors();
    ensureEditor(nextEngine, activeTab).then(function () {
      activeEngine = nextEngine;
      save("alfa-code:editor", activeEngine);
      if (persistSetting) window.AlfaCodeSettings.set("editorEngine", activeEngine);
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

  function switchEditor() {
    var nextEngine = activeEngine === "monaco" ? "codemirror6" : "monaco";
    switchToEngine(nextEngine, true);
  }

  var splitHTML = window.AlfaCodeImport.splitHTML;
  var looksLikeFullDocument = window.AlfaCodeImport.looksLikeFullDocument;

  function buildDocument() {
    return window.AlfaCodePreview.buildDocument(values);
  }

  function render() {
    if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
    frame.srcdoc = buildDocument();
  }

  window.AlfaCodeVisualInspector.bind(frame);

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
  window.addEventListener("alfa-code:setting-change", function (event) {
    var key = event.detail && event.detail.key;
    if (key === "editorEngine") {
      switchToEngine(event.detail.value, false);
      return;
    }
    if (["fontSize", "tabSize", "wordWrap", "minimap"].indexOf(key) !== -1) {
      var settings = window.AlfaCodeSettings.getAll();
      ["monaco", "codemirror6"].forEach(function (engine) {
        tabKeys.forEach(function (tab) {
          var editor = instances[engine][tab];
          if (editor && editor.setOptions) editor.setOptions(settings);
        });
      });
    }
    if (key === "autoRun" && event.detail.value) schedule();
    if (key === "autoRun" && !event.detail.value && renderTimer) {
      clearTimeout(renderTimer);
      renderTimer = null;
    }
    if (key === "previewDelay" && window.AlfaCodeSettings.get("autoRun")) schedule();
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

  var runPreviewButton = document.getElementById("previewRun");
  var refreshPreviewButton = document.getElementById("previewRefresh");
  [runPreviewButton, refreshPreviewButton].forEach(function (button) {
    if (button) button.addEventListener("click", render);
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
