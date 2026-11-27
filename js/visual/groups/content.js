(function () {
  "use strict";
  var properties = window.AlfaCodeVisualProperties;
  properties.register("content", {
    sections: [
      properties.section("Generated content", [
        properties.field("Content", "content", "text"),
        properties.field("Quotes", "quotes", "text")
      ]),
      properties.section("Counters", [
        properties.field("Counter reset", "counter-reset", "text"),
        properties.field("Counter increment", "counter-increment", "text")
      ]),
      properties.section("Text flow", [
        properties.field("White space", "white-space", "select", {
          options: [
            { value: "normal", label: "Normal" }, { value: "nowrap", label: "No wrap" },
            { value: "pre", label: "Preformatted" }, { value: "pre-wrap", label: "Preformatted wrap" },
            { value: "pre-line", label: "Preformatted lines" }
          ]
        })
      ])
    ]
  });
})();
