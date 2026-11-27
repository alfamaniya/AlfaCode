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
  var visualSelector = null;
  var visualContext = { documentGeneration: 0, selectionGeneration: 0, matchedRules: [] };
  var visualRules = {};
  var visualCssConflict = false;
  var visualEditStates = load("alfa-code:visual-edits", {});
  var visualGeneratedRules = load("alfa-code:visual-generated-rules", {});

  function isVisualSelector(selector) {
    return typeof selector === "string" &&
      /^(?:html|body|#[A-Za-z_][A-Za-z0-9_-]*|body(?: > [a-z][a-z0-9-]*:nth-of-type\(\d+\))+)$/.test(selector);
  }

  function parseVisualRules(css) {
    var parsed = {};
    var start = "/* ALFACODE-VISUAL-START */";
    var end = "/* ALFACODE-VISUAL-END */";
    var startIndex = (css || "").indexOf(start);
    var endIndex = (css || "").indexOf(end);
    if (startIndex === -1 && endIndex === -1) return parsed;
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex ||
        css.indexOf(start, startIndex + start.length) !== -1 ||
        css.indexOf(end, endIndex + end.length) !== -1) {
      visualCssConflict = true;
      return parsed;
    }

    var region = css.slice(startIndex + start.length, endIndex);
    var pattern = /^\s*\/\* ALFACODE-VISUAL-RULE (.*?) \*\/\s*\n([^\n]+)\n/gm;
    var match;
    var consumed = 0;
    while ((match = pattern.exec(region))) {
      if (region.slice(consumed, match.index).trim()) {
        visualCssConflict = true;
        return {};
      }
      try {
        var rule = JSON.parse(match[1]);
        if (!rule || !isVisualSelector(rule.selector) ||
            typeof rule.property !== "string" ||
            !(/^[a-z][a-z0-9-]*$/i.test(rule.property) || /^--(?!alfa-)[a-z0-9_-]+$/i.test(rule.property)) ||
            typeof rule.value !== "string" || /[;{}\r\n]/.test(rule.value) ||
            (rule.important !== undefined && typeof rule.important !== "boolean") ||
            match[2].replace(/\r$/, "") !== rule.selector + " { " + rule.property + ": " + rule.value +
              (rule.important === true ? " !important" : "") + "; }") {
          visualCssConflict = true;
          return {};
        }
        if (!parsed[rule.selector]) parsed[rule.selector] = {};
        if (Object.prototype.hasOwnProperty.call(parsed[rule.selector], rule.property)) {
          visualCssConflict = true;
          return {};
        }
        parsed[rule.selector][rule.property] = { value: rule.value, important: rule.important === true };
      } catch (error) {
        visualCssConflict = true;
        return {};
      }
      consumed = pattern.lastIndex;
    }
    if (region.slice(consumed).trim()) {
      visualCssConflict = true;
      return {};
    }
    return parsed;
  }

  function refreshVisualRules() {
    visualCssConflict = false;
    visualRules = parseVisualRules(values.css);
  }

  function stripCssComments(value) {
    return value.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  function canonicalSelector(value) {
    return stripCssComments(value).trim().replace(/\s*([>+~])\s*/g, "$1").replace(/\s+/g, " ");
  }

  function splitSelectorList(value) {
    var selectors = [];
    var start = 0;
    var parentheses = 0;
    var brackets = 0;
    var quote = "";
    var escaped = false;
    for (var index = 0; index < value.length; index++) {
      var character = value.charAt(index);
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (quote) {
        if (character === quote) quote = "";
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        parentheses++;
      } else if (character === ")") {
        parentheses = Math.max(0, parentheses - 1);
      } else if (character === "[") {
        brackets++;
      } else if (character === "]") {
        brackets = Math.max(0, brackets - 1);
      } else if (character === "," && !parentheses && !brackets) {
        selectors.push(value.slice(start, index).trim());
        start = index + 1;
      }
    }
    selectors.push(value.slice(start).trim());
    return selectors;
  }

  function findClosingBrace(css, open, limit) {
    var depth = 1;
    var quote = "";
    var comment = false;
    var escaped = false;
    for (var index = open + 1; index < limit; index++) {
      var character = css.charAt(index);
      var next = css.charAt(index + 1);
      if (comment) {
        if (character === "*" && next === "/") {
          comment = false;
          index++;
        }
      } else if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (quote) {
        if (character === quote) quote = "";
      } else if (character === "/" && next === "*") {
        comment = true;
        index++;
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "{") {
        depth++;
      } else if (character === "}" && --depth === 0) {
        return index;
      }
    }
    return -1;
  }

  function collectCssRules(css, start, end, result) {
    var preludeStart = start;
    var quote = "";
    var comment = false;
    var escaped = false;
    var parentheses = 0;
    var brackets = 0;
    for (var index = start; index < end; index++) {
      var character = css.charAt(index);
      var next = css.charAt(index + 1);
      if (comment) {
        if (character === "*" && next === "/") {
          comment = false;
          index++;
        }
      } else if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (quote) {
        if (character === quote) quote = "";
      } else if (character === "/" && next === "*") {
        comment = true;
        index++;
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        parentheses++;
      } else if (character === ")") {
        parentheses = Math.max(0, parentheses - 1);
      } else if (character === "[") {
        brackets++;
      } else if (character === "]") {
        brackets = Math.max(0, brackets - 1);
      } else if (!parentheses && !brackets && character === ";") {
        preludeStart = index + 1;
      } else if (!parentheses && !brackets && character === "{") {
        var close = findClosingBrace(css, index, end);
        if (close === -1) return;
        var rawPrelude = css.slice(preludeStart, index);
        var prelude = stripCssComments(rawPrelude).trim();
        if (prelude.charAt(0) === "@") {
          collectCssRules(css, index + 1, close, result);
        } else if (prelude) {
          result.push({
            selector: prelude,
            start: preludeStart,
            open: index,
            close: close
          });
        }
        index = close;
        preludeStart = close + 1;
      }
    }
  }

  function selectorMatchesRule(ruleSelector, targetSelector) {
    var ruleParts = splitSelectorList(ruleSelector).map(canonicalSelector);
    var targetParts = splitSelectorList(targetSelector).map(canonicalSelector);
    return ruleParts.some(function (part) {
      return targetParts.indexOf(part) !== -1;
    });
  }

  function cssRulesForSelector(css, selector) {
    var rules = [];
    collectCssRules(css, 0, css.length, rules);
    return rules.filter(function (rule) {
      return selectorMatchesRule(rule.selector, selector);
    });
  }

  function declarationSegments(body) {
    var segments = [];
    var start = 0;
    var quote = "";
    var comment = false;
    var escaped = false;
    var parentheses = 0;
    var brackets = 0;
    for (var index = 0; index < body.length; index++) {
      var character = body.charAt(index);
      var next = body.charAt(index + 1);
      if (comment) {
        if (character === "*" && next === "/") {
          comment = false;
          index++;
        }
      } else if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (quote) {
        if (character === quote) quote = "";
      } else if (character === "/" && next === "*") {
        comment = true;
        index++;
      } else if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        parentheses++;
      } else if (character === ")") {
        parentheses = Math.max(0, parentheses - 1);
      } else if (character === "[") {
        brackets++;
      } else if (character === "]") {
        brackets = Math.max(0, brackets - 1);
      } else if (!parentheses && !brackets && character === ";") {
        segments.push({ start: start, end: index, semicolon: true });
        start = index + 1;
      }
    }
    if (start < body.length || !segments.length) segments.push({ start: start, end: body.length, semicolon: false });
    return segments;
  }

  function declarationInBody(body, property) {
    var found = null;
    var segments = declarationSegments(body);
    segments.forEach(function (segment) {
      var text = body.slice(segment.start, segment.end);
      var colon = -1;
      var quote = "";
      var comment = false;
      for (var index = 0; index < text.length; index++) {
        var character = text.charAt(index);
        var next = text.charAt(index + 1);
        if (comment) {
          if (character === "*" && next === "/") {
            comment = false;
            index++;
          }
        } else if (quote) {
          if (character === quote) quote = "";
        } else if (character === "/" && next === "*") {
          comment = true;
          index++;
        } else if (character === "'" || character === '"') {
          quote = character;
        } else if (character === ":") {
          colon = index;
          break;
        }
      }
      if (colon === -1) return;
      var name = stripCssComments(text.slice(0, colon)).trim();
      var value = stripCssComments(text.slice(colon + 1)).trim();
      if ((name.charAt(0) === "*" ? name.slice(1) : name).toLowerCase() !== property.toLowerCase()) return;
      var important = /\s*!important\s*$/i.test(value);
      if (important) value = value.replace(/\s*!important\s*$/i, "").trim();
      found = {
        value: value,
        important: important,
        start: segment.start,
        end: segment.end,
        semicolon: segment.semicolon
      };
    });
    return found;
  }

  function ruleDeclaration(css, rule, property) {
    return declarationInBody(css.slice(rule.open + 1, rule.close), property);
  }

  function rewriteRuleDeclaration(css, rule, property, value, important) {
    var body = css.slice(rule.open + 1, rule.close);
    var declaration = declarationInBody(body, property);
    var nextBody;
    if (value) {
      var serialized = property + " : " + value + (important ? " !important" : "");
      if (declaration) {
        nextBody = body.slice(0, declaration.start) + " " + serialized + " " + body.slice(declaration.end);
      } else {
        var trimmed = body.replace(/\s+$/, "");
        var needsSeparator = trimmed && trimmed.charAt(trimmed.length - 1) !== ";";
        nextBody = (trimmed ? trimmed + (needsSeparator ? " ; " : " ") : " ") + serialized + " ; ";
      }
    } else if (declaration) {
      var declarationEnd = declaration.end + (declaration.semicolon ? 1 : 0);
      nextBody = body.slice(0, declaration.start) + body.slice(declarationEnd);
    } else {
      return css;
    }

    if (!value && !nextBody.trim() && visualGeneratedRules[rule.selector]) {
      return css.slice(0, rule.start) + css.slice(rule.close + 1);
    }
    return css.slice(0, rule.open + 1) + nextBody + css.slice(rule.close);
  }

  function appendCssRule(css, selector, property, value, important) {
    var separator = css && !/\s$/.test(css) ? "\n" : "";
    return css + separator + selector + " { " + property + " : " + value +
      (important ? " !important" : "") + " ; }\n";
  }

  function editCssRule(css, selector, property, value, important, allowCreate) {
    var rules = cssRulesForSelector(css, selector);
    if (rules.length) {
      var rule = rules[rules.length - 1];
      return {
        css: rewriteRuleDeclaration(css, rule, property, value, important),
        ruleSelector: rule.selector,
        declaration: ruleDeclaration(css, rule, property),
        created: false
      };
    }
    if (!allowCreate) return null;
    return {
      css: appendCssRule(css, selector, property, value, important),
      ruleSelector: selector,
      declaration: null,
      created: true
    };
  }

  function visualEditKey(selector, property) {
    return selector + "\n" + property;
  }

  function saveVisualEditState() {
    save("alfa-code:visual-edits", visualEditStates);
    save("alfa-code:visual-generated-rules", visualGeneratedRules);
  }

  function migrateLegacyVisualCss() {
    if (visualCssConflict) return false;
    var start = "/* ALFACODE-VISUAL-START */";
    var end = "/* ALFACODE-VISUAL-END */";
    var startIndex = values.css.indexOf(start);
    var endIndex = values.css.indexOf(end);
    if (startIndex === -1 && endIndex === -1) return true;
    var css = values.css.slice(0, startIndex) + values.css.slice(endIndex + end.length);
    Object.keys(visualRules).forEach(function (selector) {
      Object.keys(visualRules[selector]).forEach(function (property) {
        var entry = visualRules[selector][property];
        var edit = editCssRule(css, selector, property, entry.value, entry.important === true, true);
        var key = visualEditKey(selector, property);
        visualEditStates[key] = {
          selector: edit.ruleSelector,
          original: edit.declaration ? { value: edit.declaration.value, important: edit.declaration.important } : null,
          current: { value: entry.value, important: entry.important === true }
        };
        if (edit.created) visualGeneratedRules[edit.ruleSelector] = true;
        css = edit.css;
      });
    });
    values.css = css;
    visualRules = {};
    visualCssConflict = false;
    return true;
  }

  refreshVisualRules();

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
    if (key === "css") {
      refreshVisualRules();
      visualGeneratedRules = {};
      saveVisualEditState();
    }
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
    if (typeof nextValues.css === "string") {
      visualEditStates = {};
      visualGeneratedRules = {};
      saveVisualEditState();
    }
    tabKeys.forEach(function (key) {
      if (typeof nextValues[key] === "string") values[key] = nextValues[key];
    });
    refreshVisualRules();
    syncExistingEditors();
    persist();
    schedule();
  }

  window.AlfaCodeEditor = {
    clearSavedCode: function () {
      visualRules = {};
      visualEditStates = {};
      visualGeneratedRules = {};
      setValues({ html: "", css: "", js: "" });
      saveVisualEditState();
      render();
      flushPersist();
    },
    setVisualSelection: function (selector, context) {
      visualSelector = typeof selector === "string" ? selector : null;
      visualContext = selector ? {
        documentGeneration: context && Number.isInteger(context.documentGeneration) ? context.documentGeneration : 0,
        selectionGeneration: context && Number.isInteger(context.selectionGeneration) ? context.selectionGeneration : 0,
        matchedRules: Array.isArray(context && context.matchedRules)
          ? context.matchedRules.filter(function (rule) {
            return rule && typeof rule.selector === "string" && rule.selector.length < 2048 &&
              !/[{};]/.test(rule.selector) && Array.isArray(rule.properties);
          })
          : []
      } : { documentGeneration: 0, selectionGeneration: 0, matchedRules: [] };
    },
    getVisualCustomProperties: function (selector) {
      var properties = [];
      var prefix = selector + "\n";
      Object.keys(visualEditStates).forEach(function (key) {
        var property = key.slice(prefix.length);
        if (key.indexOf(prefix) === 0 && property.indexOf("--") === 0) properties.push(property);
      });
      return properties;
    },
    setVisualProperty: function (property, value, options) {
      if (typeof property !== "string" ||
          !(/^[a-z][a-z0-9-]*$/i.test(property) || /^--(?!alfa-)[a-z0-9_-]+$/i.test(property))) return false;
      if (!visualSelector) {
        showToast("Select an element in the preview before editing styles.", true);
        return false;
      }
      var safeValue = String(value == null ? "" : value).trim();
      if (/[;{}\r\n]/.test(safeValue)) {
        showToast("Enter a single CSS value without declarations or braces.", true);
        return false;
      }
      var isCustomProperty = property.indexOf("--") === 0;
      if (safeValue && !isCustomProperty && !window.CSS.supports(property, safeValue)) {
        showToast("Invalid value for " + property + ".", true);
        return false;
      }
      var important = !!(options && options.important);
      if (options && options.inlineImportant) {
        if (safeValue) {
          showToast("This element has an inline !important value for " + property + ".", true);
          return false;
        }
      }
      if (!migrateLegacyVisualCss()) {
        showToast("Visual CSS markers are ambiguous. Existing CSS was preserved.", true);
        return false;
      }

      var key = visualEditKey(visualSelector, property);
      var state = visualEditStates[key];
      var targetSelector = state && state.selector;
      var rules = targetSelector ? cssRulesForSelector(values.css, targetSelector) : [];
      if (!rules.length) {
        var candidates = visualContext.matchedRules;
        var matchingCandidates = [];
        candidates.forEach(function (candidate) {
          var candidateRules = cssRulesForSelector(values.css, candidate.selector);
          candidateRules.forEach(function (rule) {
            matchingCandidates.push({
              selector: candidate.selector,
              rule: rule,
              declaration: ruleDeclaration(values.css, rule, property)
            });
          });
        });
        var existingDeclaration = matchingCandidates.filter(function (candidate) {
          return !!candidate.declaration;
        });
        var chosen = existingDeclaration.length
          ? existingDeclaration[existingDeclaration.length - 1]
          : matchingCandidates[matchingCandidates.length - 1];
        targetSelector = chosen ? chosen.selector : visualSelector;
        rules = chosen ? [chosen.rule] : [];
      }

      if (!safeValue && !state) return true;

      var currentRule = rules.length ? rules[rules.length - 1] : null;
      var currentDeclaration = currentRule ? ruleDeclaration(values.css, currentRule, property) : null;
      if (safeValue && state &&
          (state.selector !== targetSelector || !currentRule || !currentDeclaration || !state.current ||
            currentDeclaration.value !== state.current.value ||
            currentDeclaration.important !== state.current.important)) {
        state = null;
      }
      if (!safeValue) {
        if (!state || !currentRule) {
          showToast("The Visual Editor change could not be located in the current CSS.", true);
          return false;
        }
        if (!currentDeclaration || !state.current ||
            currentDeclaration.value !== state.current.value ||
            currentDeclaration.important !== state.current.important) {
          delete visualEditStates[key];
          saveVisualEditState();
          showToast("This CSS declaration changed in the code editor; Reset was canceled to preserve that edit.", true);
          return false;
        }
        var original = state.original;
        var restored = editCssRule(
          values.css, state.selector, property,
          original ? original.value : "",
          original ? original.important : false,
          false
        );
        if (!restored) {
          showToast("The original CSS rule could not be restored safely.", true);
          return false;
        }
        values.css = restored.css;
        if (!cssRulesForSelector(values.css, state.selector).length) delete visualGeneratedRules[state.selector];
        delete visualEditStates[key];
      } else {
        var appliedImportant = important;
        if (!currentRule) {
          var appended = editCssRule(values.css, targetSelector, property, safeValue, important, true);
          if (!appended) {
            showToast("Could not create a CSS rule for the selected element.", true);
            return false;
          }
          values.css = appended.css;
          if (appended.created) visualGeneratedRules[targetSelector] = true;
          currentDeclaration = null;
          currentRule = null;
        } else {
          var effectiveImportant = important || !!(currentDeclaration && currentDeclaration.important);
          appliedImportant = effectiveImportant;
          var changed = editCssRule(values.css, targetSelector, property, safeValue, effectiveImportant, false);
          if (!changed) {
            showToast("Could not update the selected element's CSS rule.", true);
            return false;
          }
          if (!state) {
            state = {
              selector: changed.ruleSelector,
              original: currentDeclaration
                ? { value: currentDeclaration.value, important: currentDeclaration.important }
                : null
            };
          }
          values.css = changed.css;
        }
        if (!state) {
          state = {
            selector: targetSelector,
            original: currentDeclaration
              ? { value: currentDeclaration.value, important: currentDeclaration.important }
              : null
          };
        }
        state.current = { value: safeValue, important: appliedImportant };
        visualEditStates[key] = state;
      }

      refreshVisualRules();
      saveVisualEditState();
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({
          type: "alfa-visual-css-sync",
          css: values.css,
          documentGeneration: visualContext.documentGeneration
        }, "*");
      }
      syncExistingEditors();
      persist();
      return true;
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
    refreshVisualRules();
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
