(function () {
  "use strict";

  var registry = {};
  var selectedSelector = null;
  var customPropertyAssignments = {};

  function register(id, definition) {
    registry[id] = definition;
  }

  function field(label, property, kind, options) {
    var config = Array.isArray(options) ? { options: options } : (options || {});
    return Object.assign({ label: label, property: property, kind: kind || "text" }, config);
  }

  function section(title, fields) {
    return { title: title, fields: fields };
  }

  function defaultUnit(property) {
    if (/^(animation-duration|animation-delay|transition-duration|transition-delay)$/.test(property)) return "ms";
    if (/^(rotate)$/.test(property)) return "deg";
    if (/^background-position-[xy]$/.test(property)) return "%";
    if (/^(font-size|letter-spacing|word-spacing|text-indent|text-decoration-thickness|outline-width|outline-offset|border(?:-.+)?-width|border-radius|border-.+-radius|border-spacing|column-width|column-rule-width|row-gap|column-gap|gap|flex-basis|grid-(?:auto|template)-(?:columns|rows)|transform-origin|(?:min-|max-)?(?:inline-size|block-size|width|height)|(?:top|right|bottom|left|inset(?:-.+)?|margin(?:-.+)?|padding(?:-.+)?|scroll-margin(?:-.+)?|scroll-padding(?:-.+)?|perspective))$/.test(property)) return "px";
    return "";
  }

  function presetsForProperty(property, item) {
    if (item.options) return item.options;
    if (property === "--alfa-custom-property-name") {
      return ["--brand-color", "--surface-color", "--spacing-unit", "--border-color"].map(function (value) {
        return { value: value, label: value };
      });
    }
    if (property === "--alfa-custom-property-value") {
      return ["#45d8e8", "#ffffff", "#000000", "1rem", "8px", "currentColor"].map(function (value) {
        return { value: value, label: value };
      });
    }
    if (/color$/i.test(property)) {
      return [
        { value: "currentColor", label: "Current color" },
        { value: "transparent", label: "Transparent" },
        { value: "#000000", label: "Black" }, { value: "#ffffff", label: "White" },
        { value: "#ff0000", label: "Red" }, { value: "#ff8000", label: "Orange" },
        { value: "#ffff00", label: "Yellow" }, { value: "#00a000", label: "Green" },
        { value: "#00a0ff", label: "Blue" }, { value: "#8000ff", label: "Purple" },
        { value: "#ff4081", label: "Pink" }, { value: "#808080", label: "Gray" }
      ];
    }
    if (item.unit || defaultUnit(property)) {
      var unit = item.unit || defaultUnit(property);
      var values = unit === "ms" ? ["0ms", "100ms", "200ms", "300ms", "500ms", "1s"] :
        unit === "deg" ? ["0deg", "45deg", "90deg", "180deg", "360deg"] :
        ["0px", "1px", "2px", "4px", "8px", "12px", "16px", "24px", "32px", "48px", "64px", "1rem", "1.5rem", "2rem", "10%", "25%", "50%", "100%", "auto"];
      return values.map(function (value) { return { value: value, label: value }; });
    }
    if (/^(z-index|order|flex-grow|flex-shrink|font-weight|orphans|widows)$/.test(property)) {
      return ["0", "1", "2", "3", "5", "10", "100", "999"].map(function (value) { return { value: value, label: value }; });
    }
    if (/^(background-image|list-style-image|border-image-source)$/.test(property)) {
      return ["none", "linear-gradient(90deg, #45d8e8, #8000ff)", "radial-gradient(circle, #45d8e8, transparent)"].map(function (value) { return { value: value, label: value }; });
    }
    if (/^(box-shadow|text-shadow)$/.test(property)) {
      return ["none", "0 2px 8px rgba(0, 0, 0, 0.2)", "0 4px 16px rgba(0, 0, 0, 0.3)", "0 0 0 1px currentColor"].map(function (value) { return { value: value, label: value }; });
    }
    if (/^(font-family)$/.test(property)) {
      return ["Arial, sans-serif", "Georgia, serif", "'Times New Roman', serif", "'Courier New', monospace", "system-ui, sans-serif"].map(function (value) { return { value: value, label: value }; });
    }
    if (/^(grid-template-columns|grid-template-rows|grid-auto-columns|grid-auto-rows)$/.test(property)) {
      return ["none", "1fr", "1fr 1fr", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)", "repeat(auto-fit, minmax(200px, 1fr))"].map(function (value) { return { value: value, label: value }; });
    }
    return ["initial", "inherit", "unset", "revert"].map(function (value) { return { value: value, label: value }; });
  }

  function valuesFor(item) {
    if (item.kind === "select") return item.options || [];
    if (item.kind === "color") {
      return [
        { value: "transparent", label: "Transparent" }, { value: "currentColor", label: "Current color" },
        { value: "#000000", label: "Black" }, { value: "#ffffff", label: "White" },
        { value: "#ff0000", label: "Red" }, { value: "#ff8000", label: "Orange" },
        { value: "#ffff00", label: "Yellow" }, { value: "#00a000", label: "Green" },
        { value: "#00a0ff", label: "Blue" }, { value: "#8000ff", label: "Purple" },
        { value: "#ff4081", label: "Pink" }, { value: "#808080", label: "Gray" }
      ];
    }
    if (item.kind === "range") {
      var min = Number(item.min == null ? 0 : item.min);
      var max = Number(item.max == null ? 100 : item.max);
      var step = Number(item.step == null ? 1 : item.step);
      var count = Math.min(20, Math.floor((max - min) / step));
      var values = [];
      for (var index = 0; index <= count; index++) {
        var value = min + index * step;
        values.push({ value: String(Number(value.toFixed(3))), label: String(Number(value.toFixed(3))) });
      }
      if (values[values.length - 1].value !== String(max)) values.push({ value: String(max), label: String(max) });
      return values;
    }
    if (item.kind === "checkbox") {
      return [
        { value: item.uncheckedValue || "none", label: "Off" },
        { value: item.checkedValue || "1", label: "On" }
      ];
    }
    return presetsForProperty(item.property, item);
  }

  function defaultValue(item, options) {
    if (item.default != null) return String(item.default);
    if (item.kind === "color") return item.property === "background-color" ? "transparent" : "currentColor";
    if (item.kind === "range") {
      if (item.property === "opacity") return String(item.max == null ? 100 : item.max);
      if (item.property === "flex-shrink" || item.property === "column-count") return "1";
      if (item.property === "order" || item.property === "flex-grow") return "0";
      return String(item.min == null ? 0 : item.min);
    }
    if (item.kind === "checkbox") return item.uncheckedValue || "none";
    var defaults = {
      "width": "auto", "height": "auto", "inline-size": "auto", "block-size": "auto",
      "min-width": "auto", "min-height": "auto", "max-width": "none", "max-height": "none",
      "min-inline-size": "auto", "min-block-size": "auto", "max-inline-size": "none", "max-block-size": "none",
      "top": "auto", "right": "auto", "bottom": "auto", "left": "auto", "inset": "auto", "z-index": "auto",
      "margin": "0px", "margin-block": "0px", "margin-inline": "0px", "padding": "0px",
      "padding-block": "0px", "padding-inline": "0px", "gap": "0px", "row-gap": "0px", "column-gap": "0px",
      "font-size": "16px", "font-family": "system-ui, sans-serif", "line-height": "normal",
      "letter-spacing": "normal", "word-spacing": "normal", "text-indent": "0px",
      "border-width": "0px", "border-radius": "0px", "outline-width": "0px", "outline-offset": "0px",
      "background-color": "transparent", "background-image": "none", "background-size": "auto",
      "background-position": "0% 0%", "background-position-x": "0%", "background-position-y": "0%",
      "background-repeat": "repeat", "box-shadow": "none", "text-shadow": "none",
      "animation-duration": "0ms", "animation-delay": "0ms", "transition-duration": "0ms", "transition-delay": "0ms",
      "opacity": "1", "aspect-ratio": "auto", "flex-basis": "auto", "flex-grow": "0", "flex-shrink": "1",
      "column-width": "auto", "column-count": "1"
    };
    if (Object.prototype.hasOwnProperty.call(defaults, item.property)) return defaults[item.property];
    if (options.length) return options[0].value;
    return "initial";
  }

  function toHexColor(value) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    if (!context) return "#000000";
    context.fillStyle = "#000000";
    context.fillStyle = value;
    var normalized = context.fillStyle;
    if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;
    var match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(normalized);
    if (!match) return "#000000";
    return "#" + match.slice(1, 4).map(function (channel) {
      return Number(channel).toString(16).padStart(2, "0");
    }).join("");
  }

  function appendDatalist(parent, input, options) {
    var list = document.createElement("datalist");
    list.id = "visual-options-" + Math.random().toString(36).slice(2);
    options.forEach(function (option) {
      var choice = document.createElement("option");
      choice.value = option.value;
      choice.label = option.label;
      list.appendChild(choice);
    });
    parent.appendChild(list);
    input.setAttribute("list", list.id);
  }

  function appendPresetMenu(parent, input, item, options) {
    if (!options.length) return;
    var picker = document.createElement("details");
    picker.className = "visual-property-presets";
    var summary = document.createElement("summary");
    summary.setAttribute("aria-label", "Choose a preset for " + item.label);
    summary.title = "Choose a preset";
    summary.textContent = "⌄";
    picker.appendChild(summary);

    var menu = document.createElement("div");
    menu.className = "visual-property-presets__menu";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", item.label + " presets");
    options.forEach(function (option) {
      var choice = document.createElement("button");
      choice.type = "button";
      choice.className = "visual-property-presets__option";
      choice.setAttribute("role", "option");
      choice.textContent = option.label;
      choice.title = option.value;
      choice.addEventListener("click", function () {
        input.value = option.value;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        picker.open = false;
        input.focus();
      });
      menu.appendChild(choice);
    });
    picker.appendChild(menu);
    picker.addEventListener("toggle", function () {
      if (!picker.open) return;
      Array.prototype.forEach.call(parent.querySelectorAll(".visual-property-presets[open]"), function (other) {
        if (other !== picker) other.open = false;
      });
    });
    picker.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && picker.open) {
        picker.open = false;
        summary.focus();
      }
    });
    parent.appendChild(picker);
  }

  function normalizedValue(input, item) {
    var value = input.value.trim();
    var unit = item.unit || defaultUnit(item.property);
    if (unit && value && /^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) {
      value += unit;
      input.value = value;
    }
    return value;
  }

  function reportControlError(row, input, message) {
    var status = row.querySelector(".visual-property-control__status");
    if (status) status.textContent = message || "";
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function commitControl(row, input, item) {
    var property = item.property;
    var value = normalizedValue(input, item);
    if (property === "--alfa-custom-property-name") return true;
    if (property === "--alfa-custom-property-value") {
      var previousProperty = selectedSelector ? customPropertyAssignments[selectedSelector] : null;
      var nameInput = row.parentElement.querySelector('[data-property="--alfa-custom-property-name"]');
      property = !value && previousProperty ? previousProperty : (nameInput ? nameInput.value.trim() : "");
      if (!/^--(?!alfa-)[a-z0-9_-]+$/i.test(property)) {
        reportControlError(row, input, "Enter a valid CSS variable name.");
        return false;
      }
    }
    var inlineImportant = input.dataset.inlineImportant === "true";
    var inlinePresent = input.dataset.inlinePresent === "true";
    var result = window.AlfaCodeEditor && window.AlfaCodeEditor.setVisualProperty
      ? window.AlfaCodeEditor.setVisualProperty(property, value, {
        important: inlinePresent && !inlineImportant,
        inlineImportant: inlineImportant
      })
      : false;
    if (result !== false && item.property === "--alfa-custom-property-value") {
      var oldProperty = selectedSelector ? customPropertyAssignments[selectedSelector] : null;
      if (value && oldProperty && oldProperty !== property) {
        result = window.AlfaCodeEditor.setVisualProperty(oldProperty, "", {});
        if (result === false) {
          reportControlError(row, input, "New variable was set, but the previous override could not be removed.");
          return false;
        }
      }
      if (selectedSelector) {
        if (value) customPropertyAssignments[selectedSelector] = property;
        else delete customPropertyAssignments[selectedSelector];
      }
    }
    reportControlError(row, input, result === false ? "Invalid value. Previous style was kept." : "");
    return result !== false;
  }

  function splitShadowValue(value, separator) {
    var parts = [];
    var start = 0;
    var depth = 0;
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
        depth++;
      } else if (character === ")") {
        depth--;
        if (depth < 0) return null;
      } else if (character === separator && depth === 0) {
        parts.push(value.slice(start, index).trim());
        start = index + 1;
      }
    }
    if (depth !== 0 || quote) return null;
    parts.push(value.slice(start).trim());
    return parts;
  }

  function shadowTokens(value) {
    var parts = [];
    var start = -1;
    var depth = 0;
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
        if (start === -1) start = index;
      } else if (character === "(") {
        depth++;
        if (start === -1) start = index;
      } else if (character === ")") {
        depth--;
        if (depth < 0) return null;
      } else if (/\s/.test(character) && depth === 0) {
        if (start !== -1) {
          parts.push(value.slice(start, index));
          start = -1;
        }
      } else if (start === -1) {
        start = index;
      }
    }
    if (depth !== 0 || quote) return null;
    if (start !== -1) parts.push(value.slice(start));
    return parts;
  }

  function parseShadowLayer(value, item) {
    var tokens = shadowTokens(value);
    if (!tokens) return { raw: value };
    var layer = { lengths: [], color: "", inset: false };
    for (var index = 0; index < tokens.length; index++) {
      var token = tokens[index];
      if (/^inset$/i.test(token) && item.isBox && !layer.inset) {
        layer.inset = true;
      } else if (!layer.color && window.CSS.supports("color", token)) {
        layer.color = token;
      } else if (window.CSS.supports("width", token)) {
        layer.lengths.push(token);
      } else {
        return { raw: value };
      }
    }
    var maxLengths = item.isBox ? 4 : 3;
    if (layer.lengths.length < 2 || layer.lengths.length > maxLengths) return { raw: value };
    return layer;
  }

  function parseShadowValue(value, item) {
    var normalized = String(value || "").trim();
    if (!normalized || /^none$/i.test(normalized)) return [];
    var parts = splitShadowValue(normalized, ",");
    if (!parts || parts.some(function (part) { return !part; })) return [{ raw: normalized }];
    return parts.map(function (part) { return parseShadowLayer(part, item); });
  }

  function createShadowInput(parent, labelText, value, className) {
    var label = document.createElement("label");
    label.className = "visual-shadow-editor__field" + (className ? " " + className : "");
    var caption = document.createElement("span");
    caption.textContent = labelText;
    var input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.setAttribute("aria-label", labelText);
    label.appendChild(caption);
    label.appendChild(input);
    parent.appendChild(label);
    return input;
  }

  function normalizedShadowLength(value) {
    var normalized = value.trim();
    return /^-?(?:\d+\.?\d*|\.\d+)$/.test(normalized) ? normalized + "px" : normalized;
  }

  function shadowLayerValue(layer, item) {
    if (layer.rawInput) return layer.rawInput.value.trim();
    var values = [];
    if (item.isBox && layer.insetInput.checked) values.push("inset");
    ["x", "y"].concat(item.isBox ? ["blur", "spread"] : ["blur"]).forEach(function (name) {
      values.push(normalizedShadowLength(layer.inputs[name].value));
    });
    var color = layer.colorInput.value.trim();
    if (color) values.push(color);
    return values.join(" ");
  }

  function updateShadowFromLayers(row, input, item) {
    var layerNodes = row.querySelectorAll("[data-shadow-layer]");
    if (!layerNodes.length) {
      input.value = "none";
      commitControl(row, input, item);
      return;
    }
    var values = [];
    for (var index = 0; index < layerNodes.length; index++) {
      var value = shadowLayerValue(layerNodes[index].shadowLayer, item);
      if (!value || (!layerNodes[index].shadowLayer.rawInput &&
          Object.keys(layerNodes[index].shadowLayer.inputs).some(function (key) {
            return !layerNodes[index].shadowLayer.inputs[key].value.trim();
          }))) {
        reportControlError(row, input, "Complete each offset and blur value before applying the shadow.");
        return;
      }
      values.push(value);
    }
    input.value = values.join(", ");
    var committed = commitControl(row, input, item);
    if (committed) reportControlError(row, input, "");
  }

  function renderShadowLayers(row, input, item) {
    var layers = row.querySelector("[data-shadow-layers]");
    if (!layers) return;
    layers.replaceChildren();
    var current = row.querySelector("[data-shadow-current]");
    if (current) current.textContent = input.value || "none";
    var sample = row.querySelector("[data-shadow-preview]");
    if (sample) {
      sample.style.boxShadow = item.isBox ? input.value : "none";
      sample.style.textShadow = item.isBox ? "none" : input.value;
    }
    var values = parseShadowValue(input.value, item);
    if (!values.length) {
      var empty = document.createElement("p");
      empty.className = "visual-shadow-editor__empty";
      empty.textContent = "No shadow. Add a layer to build one.";
      layers.appendChild(empty);
      return;
    }

    values.forEach(function (value, index) {
      var card = document.createElement("fieldset");
      card.className = "visual-shadow-editor__layer";
      card.setAttribute("data-shadow-layer", "");
      var legend = document.createElement("legend");
      legend.textContent = "Layer " + (index + 1);
      card.appendChild(legend);
      var layer = { rawInput: null, inputs: {}, colorInput: null, insetInput: null };
      card.shadowLayer = layer;

      if (value.raw) {
        layer.rawInput = createShadowInput(card, "CSS shadow layer", value.raw, "visual-shadow-editor__raw");
        layer.rawInput.addEventListener("change", function () { updateShadowFromLayers(row, input, item); });
      } else {
        var fields = document.createElement("div");
        fields.className = "visual-shadow-editor__fields";
        layer.inputs.x = createShadowInput(fields, "X offset", value.lengths[0], "");
        layer.inputs.y = createShadowInput(fields, "Y offset", value.lengths[1], "");
        layer.inputs.blur = createShadowInput(fields, "Blur", value.lengths[2] || "0px", "");
        if (item.isBox) layer.inputs.spread = createShadowInput(fields, "Spread", value.lengths[3] || "0px", "");
        card.appendChild(fields);

        var colorField = document.createElement("label");
        colorField.className = "visual-shadow-editor__field visual-shadow-editor__color-field";
        var colorCaption = document.createElement("span");
        colorCaption.textContent = "Color";
        var colorControls = document.createElement("span");
        colorControls.className = "visual-shadow-editor__color-controls";
        var colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = toHexColor(value.color || "currentColor");
        colorPicker.setAttribute("aria-label", "Shadow color picker");
        layer.colorInput = document.createElement("input");
        layer.colorInput.type = "text";
        layer.colorInput.value = value.color || "currentColor";
        layer.colorInput.placeholder = "Any CSS color";
        layer.colorInput.setAttribute("aria-label", "Shadow color");
        colorPicker.addEventListener("input", function () {
          layer.colorInput.value = colorPicker.value;
          updateShadowFromLayers(row, input, item);
        });
        layer.colorInput.addEventListener("change", function () {
          if (window.CSS.supports("color", layer.colorInput.value.trim())) {
            colorPicker.value = toHexColor(layer.colorInput.value);
          }
          updateShadowFromLayers(row, input, item);
        });
        colorControls.appendChild(colorPicker);
        colorControls.appendChild(layer.colorInput);
        colorField.appendChild(colorCaption);
        colorField.appendChild(colorControls);
        card.appendChild(colorField);

        if (item.isBox) {
          var insetLabel = document.createElement("label");
          insetLabel.className = "visual-shadow-editor__inset";
          layer.insetInput = document.createElement("input");
          layer.insetInput.type = "checkbox";
          layer.insetInput.checked = value.inset;
          layer.insetInput.addEventListener("change", function () { updateShadowFromLayers(row, input, item); });
          insetLabel.appendChild(layer.insetInput);
          insetLabel.appendChild(document.createTextNode("Inset shadow"));
          card.appendChild(insetLabel);
        }
        Object.keys(layer.inputs).forEach(function (key) {
          layer.inputs[key].addEventListener("change", function () { updateShadowFromLayers(row, input, item); });
        });
      }

      var actions = document.createElement("div");
      actions.className = "visual-shadow-editor__layer-actions";
      if (values.length > 1) {
        var moveUp = document.createElement("button");
        moveUp.type = "button";
        moveUp.className = "visual-shadow-editor__move";
        moveUp.textContent = "Move up";
        moveUp.setAttribute("aria-label", "Move shadow layer " + (index + 1) + " up");
        moveUp.disabled = index === 0;
        moveUp.addEventListener("click", function () {
          if (card.previousElementSibling) {
            layers.insertBefore(card, card.previousElementSibling);
            updateShadowFromLayers(row, input, item);
            renderShadowLayers(row, input, item);
          }
        });
        var moveDown = document.createElement("button");
        moveDown.type = "button";
        moveDown.className = "visual-shadow-editor__move";
        moveDown.textContent = "Move down";
        moveDown.setAttribute("aria-label", "Move shadow layer " + (index + 1) + " down");
        moveDown.disabled = index === values.length - 1;
        moveDown.addEventListener("click", function () {
          if (card.nextElementSibling) {
            layers.insertBefore(card.nextElementSibling, card);
            updateShadowFromLayers(row, input, item);
            renderShadowLayers(row, input, item);
          }
        });
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "visual-shadow-editor__remove";
        remove.textContent = "Remove layer";
        remove.setAttribute("aria-label", "Remove shadow layer " + (index + 1));
        remove.addEventListener("click", function () {
          card.remove();
          updateShadowFromLayers(row, input, item);
          renderShadowLayers(row, input, item);
        });
        actions.appendChild(moveUp);
        actions.appendChild(moveDown);
        actions.appendChild(remove);
      }
      card.appendChild(actions);
      layers.appendChild(card);
    });
  }

  function createShadowEditor(row, valueControl, input, item) {
    var editor = document.createElement("div");
    editor.className = "visual-shadow-editor";
    input.value = item.default || "none";
    var preset = document.createElement("select");
    preset.className = "visual-property-control__input visual-shadow-editor__preset";
    preset.setAttribute("aria-label", item.label + " preset");
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a preset…";
    preset.appendChild(placeholder);
    item.presets.forEach(function (entry) {
      var option = document.createElement("option");
      option.value = entry.value;
      option.textContent = entry.label;
      preset.appendChild(option);
    });
    preset.addEventListener("change", function () {
      if (!preset.value) return;
      input.value = preset.value;
      preset.value = "";
      renderShadowLayers(row, input, item);
      commitControl(row, input, item);
    });
    editor.appendChild(preset);

    var preview = document.createElement("div");
    preview.className = "visual-shadow-editor__preview";
    var currentValue = document.createElement("code");
    currentValue.setAttribute("data-shadow-current", "");
    currentValue.textContent = input.value;
    var sample = document.createElement(item.isBox ? "span" : "strong");
    sample.className = "visual-shadow-editor__sample" +
      (item.isBox ? " visual-shadow-editor__sample--box" : " visual-shadow-editor__sample--text");
    sample.textContent = item.isBox ? "" : "Aa";
    sample.setAttribute("data-shadow-preview", "");
    preview.appendChild(currentValue);
    preview.appendChild(sample);
    editor.appendChild(preview);

    var layerDetails = document.createElement("details");
    layerDetails.className = "visual-shadow-editor__details";
    var layerSummary = document.createElement("summary");
    layerSummary.textContent = "Customize layers";
    var layerList = document.createElement("div");
    layerList.className = "visual-shadow-editor__layers";
    layerList.setAttribute("data-shadow-layers", "");
    var add = document.createElement("button");
    add.type = "button";
    add.className = "visual-shadow-editor__add";
    add.textContent = "Add shadow layer";
    add.addEventListener("click", function () {
      var value = input.value.trim();
      var initial = item.isBox
        ? "0 4px 12px 0 rgba(0, 0, 0, 0.2)"
        : "0 2px 4px rgba(0, 0, 0, 0.3)";
      input.value = !value || /^none$/i.test(value) ? initial : value + ", " + initial;
      renderShadowLayers(row, input, item);
      updateShadowFromLayers(row, input, item);
    });
    layerDetails.appendChild(layerSummary);
    layerDetails.appendChild(layerList);
    layerDetails.appendChild(add);
    editor.appendChild(layerDetails);

    var rawDetails = document.createElement("details");
    rawDetails.className = "visual-shadow-editor__details";
    var rawSummary = document.createElement("summary");
    rawSummary.textContent = "Advanced CSS value";
    var rawHint = document.createElement("small");
    rawHint.className = "visual-shadow-editor__hint";
    rawHint.textContent = "Enter any valid CSS shadow, including multiple comma-separated layers.";
    input.rows = 3;
    input.className = "visual-property-control__input visual-shadow-editor__css";
    input.placeholder = item.isBox
      ? "inset 0 2px 8px 0 rgba(0, 0, 0, 0.2), 0 4px 12px #0003"
      : "0 2px 4px rgba(0, 0, 0, 0.3), 0 0 8px currentColor";
    input.setAttribute("aria-label", item.label + " CSS value");
    input.dataset.property = item.property;
    input.dataset.kind = "shadow";
    input.dataset.defaultValue = item.default || "none";
    input.addEventListener("change", function () {
      renderShadowLayers(row, input, item);
      commitControl(row, input, item);
    });
    input.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
    });
    rawDetails.appendChild(rawSummary);
    rawDetails.appendChild(rawHint);
    rawDetails.appendChild(input);
    editor.appendChild(rawDetails);
    valueControl.appendChild(editor);
    renderShadowLayers(row, input, item);
  }

  function bind(detail, title, groups, frame) {
    var titleNode = detail.querySelector("[data-visual-detail-title]");
    var controls = detail.querySelector("[data-visual-detail-controls]");
    var definition = registry[title.getAttribute("data-visual-group")];
    if (!titleNode || !controls || !definition) return;

    titleNode.textContent = title.textContent;
    controls.replaceChildren();
    var collapsibleSections = title.getAttribute("data-visual-group") === "custom-settings";

    definition.sections.forEach(function (group) {
      var block = document.createElement(collapsibleSections ? "details" : "section");
      block.className = "visual-property-section";
      if (collapsibleSections) {
        block.classList.add("visual-property-section--collapsible");
        var heading = document.createElement("summary");
        heading.className = "visual-property-section__summary";
        heading.textContent = group.title;
        block.appendChild(heading);
      } else {
        var staticHeading = document.createElement("h4");
        staticHeading.textContent = group.title;
        block.appendChild(staticHeading);
      }

      group.fields.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "visual-property-control" + (item.kind === "shadow" ? " visual-property-control--shadow" : "");
        row.setAttribute("role", "group");
        row.setAttribute("aria-label", item.label);
        if (item.property) row.setAttribute("data-visual-property", item.property);
        var copy = document.createElement("div");
        copy.className = "visual-property-control__copy";
        var name = document.createElement("strong");
        name.textContent = item.label;
        copy.appendChild(name);
        if (item.property) {
          var propertyName = document.createElement("small");
          propertyName.textContent = item.property;
          copy.appendChild(propertyName);
        }
        row.appendChild(copy);

        var input;
        var options = valuesFor(item);
        var valueControl = document.createElement(item.kind === "shadow" ? "div" : "span");
        valueControl.className = "visual-property-control__value";
        if (item.kind === "shadow") {
          input = document.createElement("textarea");
          createShadowEditor(row, valueControl, input, item);
        } else if (item.kind === "select" || item.kind === "checkbox") {
          input = document.createElement("select");
          options.forEach(function (option) {
            var choice = document.createElement("option");
            choice.value = option.value;
            choice.textContent = option.label;
            input.appendChild(choice);
          });
          input.value = defaultValue(item, options);
          valueControl.appendChild(input);
        } else if (item.kind === "color") {
          var colorPicker = document.createElement("input");
          colorPicker.type = "color";
          colorPicker.className = "visual-property-control__color";
          colorPicker.value = toHexColor(defaultValue(item, options));
          input = document.createElement("input");
          input.type = "text";
          input.value = defaultValue(item, options);
          appendDatalist(controls, input, options);
          input.placeholder = "Enter any valid CSS color";
          input.addEventListener("change", function () {
            if (commitControl(row, input, item)) colorPicker.value = toHexColor(input.value);
          });
          input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
              event.preventDefault();
              input.blur();
            }
          });
          colorPicker.addEventListener("input", function () {
            input.value = colorPicker.value;
            commitControl(row, input, item);
          });
          valueControl.appendChild(colorPicker);
          valueControl.appendChild(input);
        } else if (item.kind === "range") {
          var range = document.createElement("input");
          range.type = "range";
          range.min = String(item.min == null ? 0 : item.min);
          range.max = String(item.max == null ? 100 : item.max);
          range.step = String(item.step == null ? 1 : item.step);
          range.dataset.property = item.property;
          range.dataset.defaultValue = defaultValue(item, options);
          range.setAttribute("aria-label", item.label);
          range.addEventListener("input", function () {
            input.value = range.value;
            commitControl(row, input, item);
          });
          input = document.createElement("input");
          input.type = "text";
          input.value = defaultValue(item, options);
          appendDatalist(controls, input, options);
          input.placeholder = "Enter a number";
          input.addEventListener("change", function () {
            var value = Number(input.value);
            if (!Number.isFinite(value) || value < Number(range.min) || value > Number(range.max)) {
              reportControlError(row, input, "Enter a value from " + range.min + " to " + range.max + ".");
              return;
            }
            range.value = String(value);
            commitControl(row, input, item);
          });
          valueControl.appendChild(range);
          valueControl.appendChild(input);
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.value = defaultValue(item, options);
          appendDatalist(controls, input, options);
          input.placeholder = item.placeholder || "Choose or enter a value";
          valueControl.appendChild(input);
        }

        input.classList.add("visual-property-control__input");
        input.dataset.property = item.property;
        input.dataset.kind = input.tagName === "SELECT" ? "select" : item.kind;
        input.dataset.defaultValue = defaultValue(item, options);
        if (!input.getAttribute("aria-label")) input.setAttribute("aria-label", item.label);
        var unit = item.unit || defaultUnit(item.property);
        if (unit) input.dataset.unit = unit;
        if (item.kind === "text" || item.kind === "color" || item.kind === "range") {
          appendPresetMenu(copy, input, item, options);
        }
        if (item.kind === "select") {
          input.addEventListener("change", function () { commitControl(row, input, item); });
        } else if (item.kind !== "color" && item.kind !== "range" && item.kind !== "shadow") {
          input.addEventListener("change", function () { commitControl(row, input, item); });
          input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
              event.preventDefault();
              input.blur();
            }
          });
        }
        row.appendChild(valueControl);
        var reset = document.createElement("button");
        reset.type = "button";
        reset.className = "visual-property-control__reset";
        reset.textContent = "Reset";
        reset.setAttribute("aria-label", "Reset " + item.label);
        reset.addEventListener("click", function () {
          input.value = "";
          if (commitControl(row, input, item)) {
            input.value = input.dataset.defaultValue;
            if (item.kind === "shadow") renderShadowLayers(row, input, item);
            var picker = row.querySelector('input[type="color"]');
            if (picker) picker.value = toHexColor(input.value);
            var range = row.querySelector('input[type="range"]');
            if (range) range.value = range.dataset.defaultValue;
          }
        });
        valueControl.appendChild(reset);
        var status = document.createElement("small");
        status.className = "visual-property-control__status";
        status.setAttribute("role", "status");
        row.appendChild(status);
        block.appendChild(row);
      });

      controls.appendChild(block);
    });

    setEnabled(detail, false);
  }

  function setEnabled(detail, enabled) {
    detail.querySelectorAll("input, select, textarea, .visual-property-control button").forEach(function (control) {
      control.disabled = !enabled;
    });
    var controls = detail.querySelector("[data-visual-detail-controls]");
    if (!controls) return;
    var hint = controls.querySelector(".visual-property-controls__empty");
    if (!enabled && !hint) {
      hint = document.createElement("p");
      hint.className = "visual-property-controls__empty";
      hint.textContent = "Select an element in the preview to edit its styles.";
      controls.insertBefore(hint, controls.firstChild);
    } else if (enabled && hint) {
      hint.remove();
    }
  }

  function resetValues(detail) {
    detail.querySelectorAll("[data-property]").forEach(function (input) {
      if (input.type === "range") {
        input.value = input.dataset.defaultValue || input.min;
        return;
      }
      input.value = input.dataset.defaultValue || "";
      input.dataset.inlinePresent = "false";
      input.dataset.inlineImportant = "false";
      if (input.dataset.kind === "shadow") {
        renderShadowLayers(input.closest(".visual-property-control"), input, {
          isBox: input.dataset.property === "box-shadow",
          property: input.dataset.property
        });
      }
      if (input.dataset.kind === "color") {
        var picker = input.closest(".visual-property-control").querySelector('input[type="color"]');
        if (picker) picker.value = toHexColor(input.value);
      }
      if (input.tagName === "SELECT") {
        input.querySelectorAll("[data-computed-option]").forEach(function (option) { option.remove(); });
      }
    });
    detail.querySelectorAll(".visual-property-control__status").forEach(function (status) {
      status.textContent = "";
    });
  }

  function setComputedValues(detail, values, inlineStyles) {
    if (!values || typeof values !== "object") return;
    detail.querySelectorAll("[data-property]").forEach(function (input) {
      if (input.type === "range" || input.classList.contains("visual-property-control__color")) return;
      var property = input.dataset.property;
      if (!Object.prototype.hasOwnProperty.call(values, property)) return;
      var value = String(values[property]);
      if (!value) return;
      var style = inlineStyles && inlineStyles[property];
      input.dataset.inlinePresent = style && style.present ? "true" : "false";
      input.dataset.inlineImportant = style && style.important ? "true" : "false";
      if (input.tagName === "SELECT") {
        var known = Array.prototype.some.call(input.options, function (option) {
          return !option.hasAttribute("data-computed-option") && option.value === value;
        });
        input.querySelectorAll("[data-computed-option]").forEach(function (option) { option.remove(); });
        if (!known) {
          var current = document.createElement("option");
          current.value = value;
          current.textContent = "Current: " + value;
          current.setAttribute("data-computed-option", "");
          input.appendChild(current);
        }
      }
      input.value = value;
      if (input.dataset.kind === "shadow") {
        var shadowRow = input.closest(".visual-property-control");
        var shadowItem = {
          isBox: property === "box-shadow",
          property: property
        };
        renderShadowLayers(shadowRow, input, shadowItem);
      }
      var row = input.closest(".visual-property-control");
      if (row && input.dataset.kind === "range") {
        var range = row.querySelector('input[type="range"]');
        var number = parseFloat(value);
        if (range && Number.isFinite(number)) range.value = String(Math.max(Number(range.min), Math.min(Number(range.max), number)));
      } else if (row && input.dataset.kind === "color") {
        var picker = row.querySelector('input[type="color"]');
        if (picker) picker.value = toHexColor(value);
      }
    });
  }

  window.AlfaCodeVisualProperties = {
    register: register,
    extend: function (id, sections) {
      if (!registry[id]) throw new Error("Cannot extend unknown visual group: " + id);
      var existing = {};
      registry[id].sections.forEach(function (group) {
        group.fields.forEach(function (item) { if (item.property) existing[item.property] = true; });
      });
      var additions = sections.map(function (group) {
        return {
          title: group.title,
          fields: group.fields.filter(function (item) {
            if (!item.property || existing[item.property]) return false;
            existing[item.property] = true;
            return true;
          })
        };
      }).filter(function (group) { return group.fields.length; });
      registry[id].sections = registry[id].sections.concat(additions);
    },
    field: field,
    section: section,
    bind: bind,
    setSelection: function (selector) {
      selectedSelector = typeof selector === "string" ? selector : null;
      if (selectedSelector && !customPropertyAssignments[selectedSelector] &&
          window.AlfaCodeEditor && window.AlfaCodeEditor.getVisualCustomProperties) {
        var existing = window.AlfaCodeEditor.getVisualCustomProperties(selectedSelector);
        if (existing.length === 1) customPropertyAssignments[selectedSelector] = existing[0];
      }
    },
    setEnabled: setEnabled,
    resetValues: resetValues,
    setComputedValues: setComputedValues,
    getPropertyList: function (id) {
      var definition = registry[id];
      if (!definition) return [];
      var properties = [];
      definition.sections.forEach(function (group) { group.fields.forEach(function (item) { if (item.property) properties.push(item.property); }); });
      return properties;
    },
    findProperties: function (id, query) {
      var definition = registry[id];
      if (!definition || typeof query !== "string") return [];
      var normalizedQuery = query.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
      if (!normalizedQuery) return [];
      var queryWords = normalizedQuery.split(" ");
      var matches = [];
      definition.sections.forEach(function (group) {
        var sectionText = group.title.toLowerCase().replace(/[-_]+/g, " ");
        var sectionMatches = queryWords.every(function (word) {
          return sectionText.indexOf(word) !== -1;
        });
        group.fields.forEach(function (item) {
          var searchable = (item.label + " " + (item.property || "")).toLowerCase()
            .replace(/[-_]+/g, " ");
          var fieldMatches = queryWords.every(function (word) {
            return searchable.indexOf(word) !== -1;
          });
          if (item.property && (sectionMatches || fieldMatches)) matches.push(item.property);
        });
      });
      return matches;
    }
  };
})();
