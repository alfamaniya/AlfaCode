(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("shadow", {
    sections: [
      properties.section("Box shadow", [
        properties.field("Box shadow", "box-shadow", "select", {
          options: [
            { value: "none", label: "None" },
            { value: "0 2px 8px rgba(0, 0, 0, 0.2)", label: "Soft" },
            { value: "0 4px 16px rgba(0, 0, 0, 0.3)", label: "Raised" },
            { value: "inset 0 2px 6px rgba(0, 0, 0, 0.2)", label: "Inset" },
            { value: "0 0 0 1px currentColor", label: "Outline" }
          ]
        })
      ]),
      properties.section("Text shadow", [
        properties.field("Text shadow", "text-shadow", "select", {
          options: [
            { value: "none", label: "None" },
            { value: "0 1px 2px rgba(0, 0, 0, 0.3)", label: "Subtle" },
            { value: "0 2px 4px rgba(0, 0, 0, 0.4)", label: "Soft" },
            { value: "0 0 8px currentColor", label: "Glow" }
          ]
        })
      ])
    ]
  });
})();
