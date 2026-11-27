(function () {
  "use strict";

  var properties = window.AlfaCodeVisualProperties;
  var field = properties.field;
  var section = properties.section;
  var select = function (label, property, values, defaultValue) {
    return field(label, property, "select", {
      default: defaultValue || values[0],
      options: values.map(function (value) { return { value: value, label: value }; })
    });
  };
  var text = function (label, property, defaultValue, unit) {
    var options = { default: defaultValue || "initial" };
    if (unit) options.unit = unit;
    return field(label, property, "text", options);
  };
  var additions = {
    "custom-settings": [
      section("Quick styling", [
        select("Display", "display", ["block", "flex", "grid", "inline-block", "none"], "block"),
        text("Width", "width", "auto", "px"),
        text("Height", "height", "auto", "px"),
        field("Text color", "color", "color"),
        field("Background color", "background-color", "color"),
        text("Padding", "padding", "0px", "px"),
        text("Margin", "margin", "0px", "px"),
        text("Border radius", "border-radius", "0px", "px"),
        text("Box shadow", "box-shadow", "none"),
        text("Transform", "transform", "none")
      ])
    ],
    layout: [
      section("Flow", [
        select("Float", "float", ["none", "left", "right", "inline-start", "inline-end"]),
        select("Clear", "clear", ["none", "left", "right", "both", "inline-start", "inline-end"]),
        select("Direction", "direction", ["ltr", "rtl"]),
        select("Writing mode", "writing-mode", ["horizontal-tb", "vertical-rl", "vertical-lr"])
      ]),
      section("Alignment", [
        select("Align items", "align-items", ["normal", "start", "center", "end", "stretch", "baseline"]),
        select("Justify items", "justify-items", ["normal", "start", "center", "end", "stretch"]),
        select("Align self", "align-self", ["auto", "start", "center", "end", "stretch", "baseline"]),
        select("Place items", "place-items", ["normal", "center", "stretch", "start", "end"])
      ])
    ],
    positioning: [
      section("Logical coordinates", [
        text("Inset block start", "inset-block-start", "auto", "px"),
        text("Inset block end", "inset-block-end", "auto", "px"),
        text("Inset inline start", "inset-inline-start", "auto", "px"),
        text("Inset inline end", "inset-inline-end", "auto", "px")
      ])
    ],
    flexbox: [
      section("Alignment and flow", [
        select("Align self", "align-self", ["auto", "stretch", "flex-start", "center", "flex-end", "baseline"]),
        select("Justify items", "justify-items", ["normal", "start", "center", "end", "stretch"]),
        text("Flex flow", "flex-flow", "row nowrap"),
        text("Row gap", "row-gap", "0px", "px"),
        text("Column gap", "column-gap", "0px", "px")
      ])
    ],
    grid: [
      section("Auto placement", [
        select("Auto flow", "grid-auto-flow", ["row", "column", "dense", "row dense", "column dense"]),
        text("Auto columns", "grid-auto-columns", "auto"),
        text("Auto rows", "grid-auto-rows", "auto"),
        text("Grid area", "grid-area", "auto")
      ]),
      section("Alignment", [
        select("Align items", "align-items", ["normal", "start", "center", "end", "stretch"]),
        select("Justify items", "justify-items", ["normal", "start", "center", "end", "stretch"]),
        text("Place items", "place-items", "normal")
      ])
    ],
    sizing: [
      section("Minimum and maximum", [
        text("Min inline size", "min-inline-size", "auto", "px"),
        text("Max inline size", "max-inline-size", "none", "px"),
        text("Min block size", "min-block-size", "auto", "px"),
        text("Max block size", "max-block-size", "none", "px"),
        text("Aspect ratio", "aspect-ratio", "auto")
      ])
    ],
    spacing: [
      section("Logical spacing", [
        text("Margin block", "margin-block", "0px", "px"),
        text("Margin inline", "margin-inline", "0px", "px"),
        text("Padding block", "padding-block", "0px", "px"),
        text("Padding inline", "padding-inline", "0px", "px"),
        text("Scroll margin", "scroll-margin", "0px", "px"),
        text("Scroll padding", "scroll-padding", "0px", "px")
      ])
    ],
    typography: [
      section("Font", [
        field("Font family", "font-family", "text", { default: "system-ui, sans-serif" }),
        select("Font style", "font-style", ["normal", "italic", "oblique"]),
        select("Font variant", "font-variant", ["normal", "small-caps"]),
        select("Font stretch", "font-stretch", ["normal", "condensed", "expanded"]),
        text("Line height", "line-height", "normal")
      ]),
      section("Text decoration", [
        select("Decoration line", "text-decoration-line", ["none", "underline", "overline", "line-through"]),
        select("Decoration style", "text-decoration-style", ["solid", "double", "dotted", "dashed", "wavy"]),
        field("Decoration color", "text-decoration-color", "color"),
        text("Decoration thickness", "text-decoration-thickness", "auto", "px")
      ])
    ],
    text: [
      section("Wrapping and truncation", [
        select("White space", "white-space", ["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"]),
        select("Word break", "word-break", ["normal", "break-all", "keep-all", "break-word"]),
        select("Overflow wrap", "overflow-wrap", ["normal", "break-word", "anywhere"]),
        select("Text overflow", "text-overflow", ["clip", "ellipsis"]),
        select("Hyphens", "hyphens", ["manual", "none", "auto"])
      ]),
      section("Alignment and spacing", [
        select("Text align", "text-align", ["start", "center", "end", "justify", "left", "right"]),
        text("Text indent", "text-indent", "0px", "px"),
        text("Word spacing", "word-spacing", "normal", "px"),
        select("Vertical alignment", "vertical-align", ["baseline", "top", "middle", "bottom", "sub", "super"])
      ])
    ],
    "color-background": [
      section("Background options", [
        select("Attachment", "background-attachment", ["scroll", "fixed", "local"]),
        select("Origin", "background-origin", ["padding-box", "border-box", "content-box"]),
        select("Clip", "background-clip", ["border-box", "padding-box", "content-box", "text"]),
        text("Background position X", "background-position-x", "0%"),
        text("Background position Y", "background-position-y", "0%")
      ])
    ],
    "border-outline": [
      section("Individual borders", [
        text("Top width", "border-top-width", "0px", "px"),
        select("Top style", "border-top-style", ["none", "solid", "dashed", "dotted", "double"]),
        field("Top color", "border-top-color", "color"),
        text("Right width", "border-right-width", "0px", "px"),
        select("Right style", "border-right-style", ["none", "solid", "dashed", "dotted", "double"]),
        field("Right color", "border-right-color", "color"),
        text("Bottom width", "border-bottom-width", "0px", "px"),
        select("Bottom style", "border-bottom-style", ["none", "solid", "dashed", "dotted", "double"]),
        field("Bottom color", "border-bottom-color", "color"),
        text("Left width", "border-left-width", "0px", "px"),
        select("Left style", "border-left-style", ["none", "solid", "dashed", "dotted", "double"]),
        field("Left color", "border-left-color", "color")
      ])
    ],
    shadow: [
      section("Shadow options", [
        select("Shadow mode", "box-shadow", ["none", "0 2px 8px rgba(0, 0, 0, 0.2)", "0 4px 16px rgba(0, 0, 0, 0.3)", "0 0 0 1px currentColor"]),
        text("Text shadow preset", "text-shadow", "none")
      ])
    ],
    effects: [
      section("Filter controls", [
        text("Filter preset", "filter", "none"),
        text("Backdrop filter preset", "backdrop-filter", "none"),
        select("Blend mode", "mix-blend-mode", ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "difference", "exclusion", "hue", "saturation", "color", "luminosity"]),
        select("Isolation", "isolation", ["auto", "isolate"])
      ])
    ],
    transform: [
      section("Transform behavior", [
        text("Transform origin", "transform-origin", "center"),
        select("Transform style", "transform-style", ["flat", "preserve-3d"]),
        select("Backface visibility", "backface-visibility", ["visible", "hidden"]),
        text("Perspective", "perspective", "none", "px"),
        text("Perspective origin", "perspective-origin", "center")
      ])
    ],
    responsive: [
      section("Responsive constraints", [
        text("Min width", "min-width", "auto", "px"),
        text("Max width", "max-width", "none", "px"),
        text("Min height", "min-height", "auto", "px"),
        text("Max height", "max-height", "none", "px"),
        select("Aspect ratio", "aspect-ratio", ["auto", "1 / 1", "4 / 3", "16 / 9", "3 / 2"])
      ])
    ],
    overflow: [
      section("Axis behavior", [
        select("Overflow X", "overflow-x", ["visible", "hidden", "clip", "scroll", "auto"]),
        select("Overflow Y", "overflow-y", ["visible", "hidden", "clip", "scroll", "auto"]),
        select("Overscroll behavior", "overscroll-behavior", ["auto", "contain", "none"]),
        select("Overscroll X", "overscroll-behavior-x", ["auto", "contain", "none"]),
        select("Overscroll Y", "overscroll-behavior-y", ["auto", "contain", "none"])
      ])
    ],
    "scroll-snap": [
      section("Scroll behavior", [
        select("Scroll behavior", "scroll-behavior", ["auto", "smooth"]),
        select("Snap type", "scroll-snap-type", ["none", "x mandatory", "y mandatory", "both mandatory", "x proximity", "y proximity", "both proximity"]),
        select("Snap align", "scroll-snap-align", ["none", "start", "center", "end"]),
        select("Snap stop", "scroll-snap-stop", ["normal", "always"])
      ])
    ],
    visibility: [
      section("Rendering and visibility", [
        select("Visibility", "visibility", ["visible", "hidden", "collapse"]),
        select("Content visibility", "content-visibility", ["visible", "auto", "hidden"]),
        text("Contain intrinsic size", "contain-intrinsic-size", "none", "px"),
        select("Print visibility", "visibility", ["visible", "hidden"])
      ])
    ],
    transition: [
      section("Animation", [
        text("Animation name", "animation-name", "none"),
        text("Animation duration", "animation-duration", "0ms", "ms"),
        select("Animation timing", "animation-timing-function", ["ease", "linear", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]),
        text("Animation delay", "animation-delay", "0ms", "ms"),
        select("Iteration count", "animation-iteration-count", ["1", "2", "3", "infinite"]),
        select("Fill mode", "animation-fill-mode", ["none", "forwards", "backwards", "both"]),
        select("Play state", "animation-play-state", ["running", "paused"])
      ])
    ],
    list: [
      section("Marker and positioning", [
        select("List style type", "list-style-type", ["disc", "circle", "square", "decimal", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman", "none"]),
        select("List style position", "list-style-position", ["outside", "inside"]),
        text("List style image", "list-style-image", "none")
      ])
    ],
    table: [
      section("Table layout", [
        select("Table layout", "table-layout", ["auto", "fixed"]),
        select("Border collapse", "border-collapse", ["separate", "collapse"]),
        text("Border spacing", "border-spacing", "0px", "px"),
        select("Empty cells", "empty-cells", ["show", "hide"]),
        select("Caption side", "caption-side", ["top", "bottom"])
      ])
    ],
    content: [
      section("Counter and generated content", [
        text("Counter reset", "counter-reset", "none"),
        text("Counter increment", "counter-increment", "none"),
        select("Quotes", "quotes", ["auto", "none", "\"“”‘’\""])
      ])
    ],
    states: [
      section("Element state styling", [
        field("Accent color", "accent-color", "color"),
        select("Caret color", "caret-color", ["auto", "currentColor", "#000000", "#ffffff", "#45d8e8"]),
        select("User select", "user-select", ["auto", "text", "none", "all"]),
        select("Pointer events", "pointer-events", ["auto", "none"])
      ])
    ],
    forms: [
      section("Form control styling", [
        select("Color scheme", "color-scheme", ["normal", "light", "dark", "light dark"]),
        field("Caret color", "caret-color", "color"),
        select("Resize", "resize", ["none", "both", "horizontal", "vertical"]),
        select("User resize", "field-sizing", ["fixed", "content"])
      ])
    ],
    containment: [
      section("Containment controls", [
        select("Content visibility", "content-visibility", ["visible", "auto", "hidden"]),
        text("Contain intrinsic size", "contain-intrinsic-size", "none", "px"),
        select("Will change", "will-change", ["auto", "transform", "opacity", "scroll-position", "contents"])
      ])
    ],
    columns: [
      section("Column behavior", [
        select("Fill", "column-fill", ["balance", "auto"]),
        select("Span", "column-span", ["none", "all"]),
        text("Rule", "column-rule", "none")
      ])
    ],
    masking: [
      section("Clip and mask", [
        select("Clip path", "clip-path", ["none", "inset(0)", "circle(50%)", "ellipse(50% 40% at 50% 50%)", "polygon(50% 0, 100% 100%, 0 100%)"]),
        select("Mask repeat", "mask-repeat", ["repeat", "no-repeat", "repeat-x", "repeat-y", "space", "round"]),
        select("Mask size", "mask-size", ["auto", "cover", "contain"]),
        select("Mask position", "mask-position", ["center", "top", "right", "bottom", "left"])
      ])
    ],
    svg: [
      section("SVG geometry and paint", [
        field("Fill", "fill", "color"),
        field("Stroke", "stroke", "color"),
        text("Stroke width", "stroke-width", "1", ""),
        select("Stroke line cap", "stroke-linecap", ["butt", "round", "square"]),
        select("Stroke line join", "stroke-linejoin", ["miter", "round", "bevel"]),
        text("Stroke dash array", "stroke-dasharray", "none")
      ])
    ],
    logical: [
      section("Logical dimensions", [
        text("Inline size", "inline-size", "auto", "px"),
        text("Block size", "block-size", "auto", "px"),
        text("Min inline size", "min-inline-size", "auto", "px"),
        text("Max inline size", "max-inline-size", "none", "px"),
        text("Min block size", "min-block-size", "auto", "px"),
        text("Max block size", "max-block-size", "none", "px")
      ])
    ],
    accessibility: [
      section("Focus and motion", [
        select("Scroll behavior", "scroll-behavior", ["auto", "smooth"]),
        text("Focus ring width", "outline-width", "2px", "px"),
        select("Focus ring style", "outline-style", ["auto", "none", "solid", "dashed", "dotted"]),
        field("Focus ring color", "outline-color", "color"),
        text("Focus ring offset", "outline-offset", "2px", "px")
      ])
    ],
    "view-transitions": [
      section("Transition capture", [
        text("Transition name", "view-transition-name", "none"),
        text("Transition class", "view-transition-class", "none")
      ])
    ]
  };

  Object.keys(additions).forEach(function (id) {
    properties.extend(id, additions[id]);
  });
})();
