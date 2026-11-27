(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("shadow", {
    sections: [
      properties.section("Element shadow", [
        properties.field("Box shadow", "box-shadow", "shadow", {
          isBox: true,
          default: "none",
          presets: [
            { value: "none", label: "No shadow" },
            { value: "0 1px 3px rgba(0, 0, 0, 0.16)", label: "Subtle" },
            { value: "0 4px 12px rgba(0, 0, 0, 0.18)", label: "Soft" },
            { value: "0 10px 24px rgba(0, 0, 0, 0.24)", label: "Raised" },
            { value: "0 16px 36px rgba(0, 0, 0, 0.3)", label: "Deep" },
            { value: "inset 0 2px 6px rgba(0, 0, 0, 0.18)", label: "Inset" },
            { value: "0 0 0 1px currentColor", label: "Outline" },
            { value: "0 0 18px rgba(69, 216, 232, 0.48)", label: "Glow" },
            { value: "0 4px 12px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.12)", label: "Layered" }
          ]
        })
      ]),
      properties.section("Text shadow", [
        properties.field("Text shadow", "text-shadow", "shadow", {
          isBox: false,
          default: "none",
          presets: [
            { value: "none", label: "No shadow" },
            { value: "0 1px 2px rgba(0, 0, 0, 0.24)", label: "Subtle" },
            { value: "0 2px 4px rgba(0, 0, 0, 0.3)", label: "Soft" },
            { value: "0 3px 8px rgba(0, 0, 0, 0.4)", label: "Readable" },
            { value: "0 0 8px currentColor", label: "Glow" },
            { value: "2px 2px 0 rgba(0, 0, 0, 0.3), 4px 4px 0 rgba(0, 0, 0, 0.16)", label: "Layered" }
          ]
        })
      ])
    ]
  });
})();
