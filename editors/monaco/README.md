# Monaco Editor

This folder contains the local Monaco Editor browser distribution. Load it
without a CDN:

```html
<div id="monaco-editor" style="height: 400px"></div>
<script src="./editors/monaco/vs/loader.js"></script>
<script>
  require.config({ paths: { vs: "./editors/monaco/vs" } });
  require(["vs/editor/editor.main"], function () {
    monaco.editor.create(document.getElementById("monaco-editor"), {
      value: "<h1>Hello</h1>",
      language: "html",
      automaticLayout: true
    });
  });
</script>
```

The application should be served from a local HTTP server so Monaco's workers
can load. This does not require an internet connection.

Version: 0.58.0. See `LICENSE` for the upstream license.
