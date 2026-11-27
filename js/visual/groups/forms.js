(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("forms", {
    sections: [
      properties.section("Appearance", [
        properties.field("Appearance", "appearance", "select", {
          options: [
            { value: "none", label: "None" }, { value: "auto", label: "Auto" },
            { value: "button", label: "Button" }, { value: "textfield", label: "Text field" }
          ]
        }),
        properties.field("Accent color", "accent-color", "color")
      ]),
      properties.section("Control sizing", [
        properties.field("Control width", "inline-size", "text", { default: "auto" }),
        properties.field("Control height", "block-size", "text", { default: "auto" })
      ]),
      properties.section("Input interaction", [
        properties.field("Caret color", "caret-color", "color"),
        properties.field("Resize", "resize", "select", {
          options: [
            { value: "none", label: "None" }, { value: "both", label: "Both" },
            { value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }
          ]
        })
      ])
    ]
  });
})();
