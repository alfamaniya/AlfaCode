(function () {
  "use strict";
  var monacoPromise = null;
  function loadMonaco() {
    if (monacoPromise) return monacoPromise;
    monacoPromise = new Promise(function (resolve, reject) {
      window.require.config({ paths: { vs: "./editors/monaco/vs" } });
      window.require(["vs/editor/editor.main"], function () {
        if (!window.monaco || !window.monaco.editor) {
          reject(new Error("Monaco loaded without its editor API."));
          return;
        }
        resolve(window.monaco);
      }, reject);
    });
    return monacoPromise;
  }

  function createMonacoEditor(key, surface, context) {
    return loadMonaco().then(function (monaco) {
      var editor = monaco.editor.create(surface, {
        value: context.values[key],
        language: context.languageByTab[key],
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        fontSize: 13,
        fontFamily: 'Consolas, "Courier New", monospace',
        roundedSelection: true,
        renderLineHighlight: "line",
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        formatOnPaste: false
      });
      editor.onDidChangeModelContent(function () { context.handleChange(key, editor.getValue()); });
      return {
        getValue: function () { return editor.getValue(); },
        setValue: function (value) { editor.setValue(value); },
        getSelection: function () {
          var selection = editor.getSelection();
          var model = editor.getModel();
          return selection && model ? {
            from: model.getOffsetAt(selection.getStartPosition()),
            to: model.getOffsetAt(selection.getEndPosition())
          } : { from: 0, to: 0 };
        },
        setSelection: function (selection) {
          var model = editor.getModel();
          if (!model || !selection) return;
          editor.setSelection({
            startLineNumber: model.getPositionAt(selection.from).lineNumber,
            startColumn: model.getPositionAt(selection.from).column,
            endLineNumber: model.getPositionAt(selection.to).lineNumber,
            endColumn: model.getPositionAt(selection.to).column
          });
        },
        replaceSelection: function (text) {
          var range = editor.getSelection();
          if (range) editor.executeEdits("alfa-code-paste", [{ range: range, text: text, forceMoveMarkers: true }]);
        },
        focus: function () { editor.focus(); },
        layout: function () { editor.layout(); },
        undo: function () { editor.trigger("alfa-code", "undo", null); },
        redo: function () { editor.trigger("alfa-code", "redo", null); },
        find: function () {
          var action = editor.getAction("actions.find");
          if (action) action.run();
        }
      };
    });
  }

  function createCodeMirrorEditor(key, surface, context) {
    var CodeMirror6 = window.CodeMirror6;
    var language = key === "html" ? CodeMirror6.html :
      (key === "css" ? CodeMirror6.css : CodeMirror6.javascript);
    var editor = new CodeMirror6.EditorView({
      doc: context.values[key],
      extensions: [
        CodeMirror6.basicSetup,
        language(),
        CodeMirror6.EditorView.lineWrapping,
        CodeMirror6.EditorView.updateListener.of(function (update) {
          if (update.docChanged) context.handleChange(key, update.state.doc.toString());
        })
      ],
      parent: surface
    });
    return {
      getValue: function () { return editor.state.doc.toString(); },
      setValue: function (value) {
        editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
      },
      getSelection: function () {
        var range = editor.state.selection.main;
        return { from: range.from, to: range.to };
      },
      setSelection: function (selection) {
        if (selection) editor.dispatch({ selection: { anchor: selection.from, head: selection.to } });
      },
      replaceSelection: function (text) {
        var range = editor.state.selection.main;
        editor.dispatch({
          changes: { from: range.from, to: range.to, insert: text },
          selection: { anchor: range.from + text.length }
        });
      },
      focus: function () { editor.focus(); },
      layout: function () { editor.requestMeasure(); },
      undo: function () { CodeMirror6.undo(editor); },
      redo: function () { CodeMirror6.redo(editor); },
      find: function () { CodeMirror6.openSearchPanel(editor); }
    };
  }


  window.AlfaCodeEngines = {
    createMonacoEditor: createMonacoEditor,
    createCodeMirrorEditor: createCodeMirrorEditor
  };
})();
