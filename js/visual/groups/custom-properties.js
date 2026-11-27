(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("custom-properties", {
    sections: [
      properties.section("Custom property", [
        properties.field("Property name", "--alfa-custom-property-name", "text", { default: "--brand-color" }),
        properties.field("Property value", "--alfa-custom-property-value", "text", { default: "#45d8e8" })
      ])
    ]
  });
})();
