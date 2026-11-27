(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("states", {
    sections: [
      properties.section("Interactive appearance", [
        properties.field("Accent color", "accent-color", "color"),
        properties.field("Caret color", "caret-color", "color"),
        properties.field("Selection", "user-select", "select", {
          options: [
            { value: "auto", label: "Auto" }, { value: "text", label: "Text" },
            { value: "none", label: "None" }, { value: "all", label: "All" }
          ]
        })
      ]),
      properties.section("Focus state", [
        properties.field("Outline style", "outline-style", "select", {
          options: [
            { value: "auto", label: "Auto" }, { value: "none", label: "None" },
            { value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" }
          ]
        }),
        properties.field("Outline color", "outline-color", "color")
      ])
    ]
  });
})();
