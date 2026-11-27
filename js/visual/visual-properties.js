(function () {
  "use strict";

  var registry = {};

  function register(id, definition) {
    registry[id] = definition;
  }

  function field(label, property, kind, options) {
    return Object.assign({ label: label, property: property, kind: kind || "text" }, options || {});
  }

  function section(title, fields) {
    return { title: title, fields: fields };
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
        if (item.kind === "select") {
          input = document.createElement("select");
          (item.options || []).forEach(function (option) {
            var choice = document.createElement("option");
            choice.value = option.value;
            choice.textContent = option.label;
            input.appendChild(choice);
          });
        } else if (item.kind === "color") {
          input = document.createElement("input");
          input.type = "color";
        } else if (item.kind === "range") {
          input = document.createElement("input");
          input.type = "range";
          input.min = String(item.min == null ? 0 : item.min);
          input.max = String(item.max == null ? 100 : item.max);
          input.step = String(item.step == null ? 1 : item.step);
        } else if (item.kind === "checkbox") {
          input = document.createElement("input");
          input.type = "checkbox";
          input.className = "visual-property-control__switch";
        } else {
          input = document.createElement("input");
          input.type = "text";
          input.placeholder = item.placeholder || "inherit";
        }

        input.className = (input.className ? input.className + " " : "") + "visual-property-control__input";
        input.dataset.property = item.property;
        input.dataset.kind = item.kind;
        if (item.unit) input.dataset.unit = item.unit;
        row.appendChild(input);
        block.appendChild(row);

        input.addEventListener("input", function () {
          var value;
          if (item.kind === "checkbox") value = input.checked ? (item.checkedValue || "1") : (item.uncheckedValue || "none");
          else value = input.value.trim();
          if (item.unit && value && item.kind !== "select") value += item.unit;
          if (window.AlfaCodeEditor && window.AlfaCodeEditor.setVisualProperty) {
            window.AlfaCodeEditor.setVisualProperty(item.property, value);
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
      var value = values[property];
      if (input.type === "checkbox") {
        input.checked = value !== "none" && value !== "" && value !== "0";
      } else if (input.type === "color") {
        var match = /^rgba?\(([^)]+)\)/.exec(value);
        if (match) {
          var parts = match[1].split("/")[0].split(",").map(function (part) { return part.trim(); });
          var r = Math.round(Number(parts[0]) || 0), g = Math.round(Number(parts[1]) || 0), b = Math.round(Number(parts[2]) || 0);
          input.value = "#" + [r, g, b].map(function (channel) { return channel.toString(16).padStart(2, "0"); }).join("");
        } else if (/^#[0-9a-f]{6}$/i.test(value)) {
          input.value = value;
        }
      } else {
        if (input.dataset.unit) {
          var suffix = input.dataset.unit;
          if (value && value.slice(-suffix.length) === suffix) value = value.slice(0, -suffix.length);
        }
        input.value = value;
      }
    });
  }

  window.AlfaCodeVisualProperties = {
    register: register,
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
