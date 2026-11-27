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

  function bind(detail, title, groups, frame) {
    var titleNode = detail.querySelector("[data-visual-detail-title]");
    var controls = detail.querySelector("[data-visual-detail-controls]");
    var definition = registry[title.getAttribute("data-visual-group")];
    if (!titleNode || !controls || !definition) return;

    titleNode.textContent = title.textContent;
    controls.replaceChildren();

    definition.sections.forEach(function (group) {
      var block = document.createElement("section");
      block.className = "visual-property-section";
      var heading = document.createElement("h4");
      heading.textContent = group.title;
      block.appendChild(heading);

      group.fields.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "visual-property-control";
        row.setAttribute("role", "group");
        row.setAttribute("aria-label", item.label);
        var copy = document.createElement("span");
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
        var valueControl = document.createElement("span");
        valueControl.className = "visual-property-control__value";
        if (item.kind === "select" || item.kind === "checkbox") {
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

        input.className = (input.className ? input.className + " " : "") + "visual-property-control__input";
        input.dataset.property = item.property;
        input.dataset.kind = input.tagName === "SELECT" ? "select" : item.kind;
        input.dataset.defaultValue = defaultValue(item, options);
        input.setAttribute("aria-label", item.label);
        var unit = item.unit || defaultUnit(item.property);
        if (unit) input.dataset.unit = unit;
        if (item.kind === "select") {
          input.addEventListener("change", function () { commitControl(row, input, item); });
        } else if (item.kind !== "color" && item.kind !== "range") {
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
    detail.querySelectorAll("input, select, button.visual-property-control__reset").forEach(function (control) {
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
    }
  };
})();
