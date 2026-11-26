# CodeMirror 6

`codemirror.js` is a standalone browser bundle and has no runtime CDN or
package-install requirement. It exposes `CodeMirror6` with `basicSetup`,
`EditorView`, `html`, `css`, `javascript`, `undo`, `redo`, and
`openSearchPanel`.

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

The bundle's pinned dependencies are listed in `licenses/THIRD_PARTY_NOTICES.txt`.
The build entry is `build-entry.js`; esbuild is used only to rebuild the bundle.
See `licenses/` for the bundled packages' license notices.
