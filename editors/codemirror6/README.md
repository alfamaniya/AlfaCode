# CodeMirror 6

`codemirror.js` is a standalone browser bundle and has no runtime CDN or
package-install requirement. It exposes `CodeMirror6` with `basicSetup`,
`EditorView`, `html`, `css`, and `javascript`.

Example:

```html
<div id="editor"></div>
<script src="./editors/codemirror6/codemirror.js"></script>
<script>
  new CodeMirror6.EditorView({
    doc: "<h1>Hello</h1>",
    extensions: [CodeMirror6.basicSetup, CodeMirror6.html()],
    parent: document.getElementById("editor")
  });
</script>
```

Serve the project locally over HTTP. The bundle is local, so no internet
connection is needed at runtime.

The bundle was built with CodeMirror 6.0.2, `@codemirror/lang-html` 6.4.12,
`@codemirror/lang-css` 6.3.1, and `@codemirror/lang-javascript` 6.2.5. The build
entry is `build-entry.js`; esbuild 0.28.2 is used only to rebuild the bundle.
See `licenses/` for the bundled packages' license notices.
