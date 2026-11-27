(function () {
  "use strict";

  var registry = {};

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
        var row = document.createElement("label");
        row.className = "visual-property-control";
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
        if (item.kind === "select" || item.kind === "color" || item.kind === "range" || item.kind === "checkbox") {
          input = document.createElement("select");
          options.forEach(function (option) {
            var choice = document.createElement("option");
            choice.value = option.value;
            choice.textContent = option.label;
            input.appendChild(choice);
          });
          input.value = defaultValue(item, options);
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.value = defaultValue(item, options);
          var listId = "visual-options-" + Math.random().toString(36).slice(2);
          var list = document.createElement("datalist");
          list.id = listId;
          options.forEach(function (option) {
            var choice = document.createElement("option");
            choice.value = option.value;
            choice.label = option.label;
            list.appendChild(choice);
          });
          controls.appendChild(list);
          input.setAttribute("list", listId);
          input.placeholder = item.placeholder || "Choose or enter a value";
        }

        input.className = (input.className ? input.className + " " : "") + "visual-property-control__input";
        input.dataset.property = item.property;
        input.dataset.kind = input.tagName === "SELECT" ? "select" : "text";
        var unit = item.unit || defaultUnit(item.property);
        if (unit) input.dataset.unit = unit;
        row.appendChild(input);
        block.appendChild(row);

        input.addEventListener("input", function () {
          var value = input.value.trim();
          var property = item.property;
          if (input.dataset.unit && value && input.dataset.kind !== "select" && /^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) {
            value += input.dataset.unit;
            input.value = value;
          }
          if (property === "--alfa-custom-property-name") return;
          if (property === "--alfa-custom-property-value") {
            var nameInput = controls.querySelector('[data-property="--alfa-custom-property-name"]');
            var customProperty = nameInput ? nameInput.value.trim() : "";
            if (!/^--(?!alfa-)[a-z0-9_-]+$/i.test(customProperty)) return;
            property = customProperty;
          }
          if (window.AlfaCodeEditor && window.AlfaCodeEditor.setVisualProperty) {
            window.AlfaCodeEditor.setVisualProperty(property, value);
          }
        });
      });

      controls.appendChild(block);
    });

    var properties = [];
    definition.sections.forEach(function (group) {
      group.fields.forEach(function (item) { if (item.property) properties.push(item.property); });
    });
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "alfa-visual-computed-request", properties: properties }, "*");
    }
  }

  function setComputedValues(detail, values) {
    if (!values || typeof values !== "object") return;
    detail.querySelectorAll("[data-property]").forEach(function (input) {
      var property = input.dataset.property;
      if (!Object.prototype.hasOwnProperty.call(values, property)) return;
      var value = String(values[property]);
      if (!value) return;
      if (input.tagName === "SELECT" && !Array.prototype.some.call(input.options, function (option) { return option.value === value; })) {
        var current = document.createElement("option");
        current.value = value;
        current.textContent = "Current: " + value;
        input.appendChild(current);
      }
      input.value = value;
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
