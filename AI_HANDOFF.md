# AlfaCode — AI Engineering Handoff & Repository Review

> **Purpose:** This document is the working handoff for the next AI coding assistant (especially GitHub Copilot in VS Code). Read it before changing code. It records the repository identity, the review scope, observed issues, unverified risks, and a concrete verification plan. Treat it as project-specific engineering context, not as permission to make broad redesigns.

## 1. Message from the previous AI assistant

Hello, next AI assistant.

I am the AI assistant handing this repository over to you. I reviewed the current `main` branch of **AlfaCode** and inspected its README, main HTML entry point, editor-engine/controller modules, preview and visual-editing modules, UI layout modules, and part of the locally bundled Monaco distribution.

My job in this handoff is to preserve the distinction between:
- defects directly visible in the inspected source;
- architectural risks that deserve testing;
- features claimed by documentation but not yet verified in a real browser;
- suggestions for future improvement.

Do not turn an untested suspicion into a claimed bug. Do not rewrite working systems merely to make the code look different. First reproduce, record, and isolate each issue; then make the smallest safe change and test it.

The repository owner expects practical work, not long speculative discussions. When a task is clear, implement it directly, keep changes focused, and report exactly what changed and what was actually tested.

## 2. Repository identity and non-negotiable project rules

- Repository: https://github.com/alfamaniya/AlfaCode
- Default branch observed during review: `main`
- Repository is public.
- The project is a browser-based HTML/CSS/JavaScript playground/editor.
- The interface is built with plain HTML, CSS, and JavaScript.
- The project contains local distributions of Monaco Editor and CodeMirror 6.
- The intended runtime does not require npm installation, a bundler, a CDN, or an internet connection.
- A local HTTP server is recommended because browser restrictions can affect local assets and Monaco workers when opening the page using `file://`.

### Mandatory offline requirement

**The application must work without internet access.** Do not add runtime dependencies on:
- CDNs;
- remote JavaScript or CSS;
- external fonts, icon packs, or images;
- remote APIs or services;
- network-hosted workers or dynamically fetched libraries.

Any new required dependency must be included locally in the repository, with its license notices and correct local loading paths. A local development HTTP server is allowed; an internet connection is not a runtime requirement.

### UI language

The README states that all application UI text must be English. Keep buttons, labels, menus, messages, tooltips, settings, and other visible application copy in English, even when the owner gives instructions in another language.

### Preserve the current product direction

Do not replace Monaco or CodeMirror, remove features, change the preview architecture, or redesign the UI without a specific reason and a reproducible problem. Keep the preview's default page background white unless the owner explicitly requests otherwise.

## 3. Architecture observed

The repository documentation and inspected files indicate this general structure:

- `index.html`: application shell, controls, panels, preview iframe, SVG symbols, and stylesheet entry point.
- `style.css` and `css/`: theme, shell, editor, components, responsive behavior, visual fullscreen layout, and theme settings.
- `js/ui/layout.js`: panel layout, sidebars, resizing, and tabs.
- `js/ui/settings-state.js`: persisted UI/editor/preview/layout settings.
- `js/ui/theme-settings.js`: settings UI and theme controls.
- `js/editor/defaults.js`: default sample content.
- `js/editor/engines.js`: Monaco and CodeMirror engine integration.
- `js/editor/controller.js`: editor state, event coordination, persistence, import/export, and preview updates.
- `js/editor/html-import.js`: parsing/import of complete HTML documents and extraction of inline CSS/JS.
- `js/editor/preview-document.js`: preview document generation and visual-selection script.
- `js/editor/visual-inspector.js`: visual selection and inspector interactions.
- `js/editor/visual-fullscreen.js`: visual-mode fullscreen controls.
- `js/visual/visual-catalog.js` and `js/visual/visual-properties.js`: visual property groups, options, and property controls.
- `editors/monaco/`: locally bundled Monaco distribution.
- `editors/codemirror6/`: locally bundled CodeMirror 6 distribution and build/licensing documentation.

The README describes three code tabs (HTML, CSS, JavaScript), two editor engines, a sandboxed live preview, localStorage persistence, HTML import, export/download, search, undo/redo, visual editing, settings, and adjustable layout. These are documented capabilities, not all independently verified in this review.

## 4. Findings directly observed in source/documentation

The following are concrete observations from the inspected revision. Some are documentation/quality issues rather than runtime-breaking defects.

### 4.1 README begins with a bare URL

At the very beginning of `README.md`, before the project heading, there is a raw URL:

```text
https://github.com/alfamaniya/AlfaCode/blob/main/visual%20mode.md
```

It is not formatted as a Markdown link and has no explanation. This makes the README opening look accidental and does not tell readers what the linked document is.

**Required action:** Convert it into a descriptive Markdown link in an appropriate section, or remove it if the document is obsolete. Do not delete the referenced document without checking whether it contains current requirements.

### 4.2 README directory tree is incomplete/inconsistent

The README tree lists the `js/ui/` and `js/editor/` directories but does not include the `js/visual/` directory, even though later README sections explicitly refer to:
- `js/visual/visual-properties.js`
- `js/visual/visual-catalog.js`

The README therefore gives an incomplete view of the actual source layout.

**Required action:** Update the tree to include the visual directory and its files. Verify every listed path against the actual repository before documenting it. Do not invent files or directories.

### 4.3 Generic browser document title

The inspected `index.html` contains:

```html
<title>Alfa-Code Layout</title>
```

This appears to be a development/layout-oriented title rather than a finished product title. It may be visible in the browser tab and bookmarks.

**Required action:** Consider changing it to a consistent product title such as `AlfaCode`, unless the current wording is intentional. Check README, app branding, and browser title for consistency.

### 4.4 README describes behavior more comprehensively than has been verified

The README makes detailed claims about:
- Monaco and CodeMirror parity;
- autocomplete and language services;
- live preview behavior;
- HTML import and extraction;
- visual editing and CSS property groups;
- fullscreen visual mode;
- settings persistence and factory reset;
- keyboard shortcuts;
- responsive layout;
- offline operation.

A static source review cannot prove that these flows all work correctly. This is a verification/documentation gap, not proof that the features are broken.

**Required action:** Build a repeatable browser test checklist. Keep README claims only when the corresponding behavior has been exercised successfully. If a feature is incomplete, describe its actual status accurately rather than silently removing it.

### 4.5 Monaco distribution contains a version/provenance question

The inspected Monaco AMD loader at `editors/monaco/vs/loader.js` has a header identifying it as `0.42.0-dev-20230906`. The previously inspected `editor.main.js` bundle appeared to contain a newer/different build signature. This is a potential distribution consistency issue, but the loader can be independently versioned and the observation alone does **not** establish incompatibility.

**Required action:**
1. Identify the exact Monaco release/build represented by the editor bundle.
2. Check the provenance/version of the loader, editor entry point, CSS, workers, language contributions, and supporting assets.
3. Confirm that all required files come from a compatible Monaco distribution.
4. Run the editor and worker tests listed below.
5. If the files are intentionally mixed and demonstrably compatible, document that fact. Otherwise replace the distribution as a coherent, locally bundled set.

Do not replace the loader merely because its version string differs.

### 4.6 Verify README paths and actual script/style loading order

The README says scripts and styles are loaded locally in a deliberate order and that no dynamic module loader or bundler is required. This is an important design constraint. A wrong path or load order can leave the shell visible while editor functionality silently fails.

**Required action:** Audit every `<script>` and `<link>` reference in `index.html` against the actual tracked paths. Check dependency order, duplicate inclusion, missing files, and console/network errors with the app served from the repository root.

### 4.7 Preview background requirement

The inspected application entry point/styles establish a white preview surface (the preview document's default background is intended to be `#ffffff`). Preserve this behavior. The application chrome may use its own theme; the user's authored preview should not inherit the editor's dark theme accidentally.

**Required action:** Test an empty preview, a page without a body background, and an imported HTML document. Verify that the preview's default canvas remains white while authored CSS backgrounds still work.

## 5. Important risks requiring runtime verification (not confirmed defects)

These areas deserve focused tests. The source inspection did not establish that each one is broken.

### 5.1 Monaco engine

Verify all of the following in a real browser:
- Monaco loads from local files with network access disabled.
- The editor appears after initial page load and after switching from CodeMirror.
- HTML, CSS, and JavaScript models use the intended language IDs.
- Syntax highlighting works for all three tabs.
- Completion/autocomplete works for HTML, CSS, and JavaScript.
- Suggestions include relevant language features and do not depend on a remote service.
- Diagnostics/markers appear where expected.
- Find/search, undo, redo, selection, copy/paste, and keyboard shortcuts work.
- Minimap behavior matches settings (if exposed).
- Font size and other editor settings apply immediately and persist after reload.
- Layout/resize events correctly call Monaco layout logic; no clipped editor or zero-sized editor appears after panel changes.
- Switching tabs preserves each tab's own text, cursor/selection where intended, and undo history where supported.
- Switching engines repeatedly does not duplicate listeners, models, workers, or DOM nodes.
- Monaco workers load from local URLs and produce no 404, MIME-type, CSP, or cross-origin errors.
- Worker language features continue to work after switching tabs and resizing panels.

### 5.2 CodeMirror 6 engine

Verify:
- CodeMirror loads independently from its local bundle.
- HTML, CSS, and JavaScript language support is correctly configured.
- Syntax highlighting, indentation, brackets, selection, search, undo/redo, and keyboard behavior work.
- Its content remains synchronized with the application's canonical tab state.
- Switching between CodeMirror and Monaco never loses or overwrites edits.
- Settings such as font size and theme are applied consistently where supported.
- Resizing and switching tabs do not leave stale editor instances.
- No runtime network request is made for an extension, language package, or stylesheet.

### 5.3 Engine switching and shared state

The inspected controller includes an `alfa-code:setting-change` event handler that reacts to `editorEngine` changes by calling `switchToEngine(event.detail.value, false)`. This is evidence that settings-driven engine switching is wired, but it does not prove every switching path is correct.

Test:
- switching through settings;
- switching through any direct engine selector, if present;
- switching while a tab contains unsaved edits;
- switching during or immediately after a preview update;
- switching repeatedly between both engines;
- restoring the chosen engine after reload;
- invalid or unavailable engine values;
- error recovery if one engine fails to initialize.

There must be one clear source of truth for each tab's text. Neither editor should silently become the only copy of the content.

### 5.4 Preview iframe and execution lifecycle

The README describes an isolated iframe with sandbox. The inspected sandbox permissions included scripts, modals, forms, and popups, without `allow-same-origin`. That configuration provides useful isolation, but the actual behavior still needs testing.

Test:
- initial blank preview;
- automatic preview update after editing each tab;
- manual/automatic preview settings;
- valid and invalid HTML/CSS/JS;
- JavaScript errors inside the preview;
- console errors versus errors in the parent application;
- form behavior and popup behavior where intended;
- reload and preview-in-new-window behavior;
- iframe recreation and event-listener cleanup;
- messages between parent and iframe;
- correct handling of the opaque sandbox origin (do not assume the iframe has the parent origin);
- malicious or malformed user-authored markup does not gain unintended access to parent application state;
- white default canvas and authored page backgrounds.

Do not weaken iframe sandbox permissions to make a failing feature work without understanding the security consequences.

### 5.5 Visual editor / inspector

This is a complex feature and should be tested as a full workflow rather than by checking whether the panel renders.

Test:
- entering visual mode and exiting it;
- exiting fullscreen without accidentally disabling visual mode, and disabling visual mode fully;
- Escape-key behavior;
- selecting elements in the preview;
- hover outline/tooltip and selected-element identity;
- nested elements, text nodes, SVG elements, pseudo-elements, and elements with no ID/class;
- selecting elements after preview refresh;
- selection when the target element is dynamically created;
- switching between HTML/CSS/JS while visual mode is active;
- CSS property groups and all controls;
- numeric values, units, colors, keywords, and arbitrary custom values;
- empty values and invalid CSS values;
- repeated edits to the same property;
- properties with shorthand/longhand interactions;
- preserving existing author CSS and not destroying unrelated rules;
- removing/resetting a managed property;
- handling duplicate selectors and multiple matching elements;
- persistence of visual edits in the CSS tab;
- responsive behavior at narrow and wide viewport sizes.

A critical acceptance criterion: visual editing must not silently delete or rewrite unrelated CSS authored by the user.

### 5.6 HTML import and paste parsing

The README claims that importing or pasting a complete HTML document extracts inline `<style>` and `<script>` contents into their corresponding tabs.

Test:
- complete valid HTML documents;
- documents with multiple style/script tags;
- attributes on script/style tags;
- scripts with `type="module"` and non-JavaScript script types;
- comments containing apparent style/script tags;
- CSS or JS strings containing HTML-like text;
- malformed/incomplete documents;
- external stylesheet/script references;
- empty style/script tags;
- preserving doctype, head metadata, body markup, and document structure;
- drag-and-drop and file-picker import;
- unsupported file types and read failures;
- importing a document after existing user edits (confirm the intended replace/merge behavior).

Do not use fragile regular expressions as a substitute for HTML parsing if they corrupt valid documents. Preserve semantics and clearly define which external references remain in the imported HTML.

### 5.7 localStorage and data lifecycle

Test:
- saving all three code tabs;
- restoring them after reload;
- saving/restoring selected engine and supported settings;
- handling missing, malformed, stale, or quota-exceeding stored data;
- private browsing or storage-disabled environments;
- factory reset versus clear-all-tabs semantics;
- settings export/import and invalid import data;
- ensuring reset operations do not accidentally erase unrelated preferences or data;
- versioning/migration if the stored schema changes.

Avoid unguarded storage operations that can crash application startup when localStorage is unavailable.

### 5.8 Layout, responsive behavior, and settings

Test:
- resizing editor and preview panes;
- collapsing/expanding sidebars;
- drag handles and minimum panel sizes;
- tab changes and settings navigation;
- restoring layout after reload;
- fullscreen and visual fullscreen transitions;
- narrow desktop windows and mobile-sized viewports;
- keyboard accessibility and visible focus;
- controls that appear enabled but have no event handler;
- settings values reflected in the actual UI and persisted state.

Check for layout races where an editor is initialized while its container is hidden or has zero dimensions.

### 5.9 Offline behavior and asset integrity

With the browser network disabled:
- load the app from a local HTTP server;
- confirm all scripts, styles, fonts, icons, workers, and language resources load;
- inspect the Network panel for attempted external requests;
- confirm no feature requires a remote endpoint;
- check for missing local files and incorrect MIME types;
- confirm all licenses/notices for bundled dependencies remain present.

A page that renders its shell offline but fails to initialize the editor is not offline-compatible.

## 6. Prioritized remediation plan

Use this order. Do not start with cosmetic refactoring.

### P0 — Establish a reproducible baseline
1. Record the current `main` commit SHA before edits.
2. Serve the project from its root using a local HTTP server.
3. Capture browser console errors and failed network requests.
4. Test startup with internet disabled.
5. Confirm both editor engines initialize.
6. Confirm the preview renders and remains white by default.
7. Record actual failures with exact reproduction steps.

### P1 — Fix confirmed documentation/consistency issues
1. Fix the unexplained raw URL at the top of README.
2. Add the missing `js/visual/` section to the README tree.
3. Verify every README path and command.
4. Decide whether the browser title should be `AlfaCode` and make branding consistent.
5. Document the actual Monaco bundle/loader versions and provenance.

### P2 — Stabilize editor engines
1. Test Monaco independently.
2. Test CodeMirror independently.
3. Test state preservation during repeated engine switches.
4. Test worker loading and all local paths.
5. Fix only reproduced issues, with focused changes.

### P3 — Stabilize preview and import
1. Verify iframe isolation and parent/child messaging.
2. Verify automatic/manual preview updates.
3. Test import and paste against realistic HTML samples.
4. Verify localStorage failure handling and data recovery.

### P4 — Stabilize visual editing
1. Test element selection and hover feedback.
2. Audit every property group/control.
3. Verify CSS serialization and preservation of unrelated rules.
4. Test fullscreen/exit behavior and responsive layouts.

### P5 — Release readiness
1. Add a repeatable manual QA checklist or automated tests where practical.
2. Check keyboard accessibility and responsive behavior.
3. Validate all bundled license notices.
4. Update README to reflect tested behavior only.
5. Run the complete offline regression checklist before declaring the project complete.

## 7. Rules for the next AI assistant / Copilot

1. **Read this file and README before editing.**
2. Work only in `alfamaniya/AlfaCode`; do not confuse it with another repository named AlfaCode.
3. Treat the current repository contents as the source of truth. Do not import assumptions from unrelated projects.
4. Inspect the exact current file before modifying it. Do not rely on stale snippets or old chat summaries.
5. Do not overwrite user work or unrelated changes.
6. Keep each change narrowly scoped and explain why it is needed.
7. Do not add internet dependencies.
8. Do not remove bundled editor files, language services, workers, or licenses without proving they are unused and checking all references.
9. Do not claim a feature works merely because a function or event listener exists.
10. Do not claim a bug is fixed without reproducing it before the change and verifying it afterward.
11. After JavaScript changes, check syntax and the browser console. After CSS/layout changes, inspect the actual rendered page at relevant viewport sizes.
12. After editor changes, test both Monaco and CodeMirror, not just the currently selected engine.
13. After preview/visual-editor changes, test the iframe boundary and preservation of user-authored content.
14. Keep application UI copy in English.
15. Preserve the white preview default.
16. Avoid broad formatting, renaming, file moves, or architecture rewrites unless explicitly requested.
17. Before committing, inspect the diff and confirm that only intended files changed.
18. Report: files changed, behavior changed, tests run, tests not run, and any remaining risks. Be honest about limitations.

## 8. Review limitations and confidence

This handoff is based on a static inspection of selected files in the repository's `main` branch. It is **not** a full browser QA report, security audit, accessibility audit, performance audit, or exhaustive line-by-line review of every file.

In particular:
- no claim is made that every documented feature was executed in a browser;
- no claim is made that every possible Monaco/CodeMirror language feature works;
- no confirmed incompatibility is inferred solely from the loader's version header;
- no security guarantee is inferred solely from the iframe sandbox attribute;
- the risk sections above are test requirements, not a list of proven defects.

The concrete source/documentation findings are listed in section 4. Everything in section 5 must be verified before being classified as a defect.

## 9. Definition of done

A change is complete only when:
- the requested behavior is implemented;
- no unrelated behavior or user data is broken;
- the app starts from a local HTTP server;
- the relevant feature works with internet disabled;
- both editor engines remain functional where the change affects shared editor behavior;
- the preview remains isolated and has the expected white default background;
- the browser console has no new relevant errors;
- the Git diff contains only intended changes;
- documentation matches the implemented and tested behavior.

---

**Handoff ends here.** Continue from the current repository state, verify before assuming, and prefer small tested fixes over speculative rewrites.


## 10. Comprehensive Visual Editor review

This section records a focused static review of the Visual Editor implementation on the repository's `main` branch. Files inspected included:

- `js/editor/visual-inspector.js`
- `js/editor/preview-document.js`
- `js/editor/visual-fullscreen.js`
- `js/editor/controller.js`
- `js/visual/visual-properties.js`
- `js/visual/visual-catalog.js`
- `js/visual/groups/*.js`
- `index.html`
- related CSS and script-loading order

**Review limitation:** This was a source-level review. No real-browser execution, visual regression, or end-to-end test of every control was performed. Findings described as code defects below are based on the inspected implementation; feature gaps and edge cases still require runtime verification.

### 10.1 Visual Editor structure observed

The application declares 33 Visual Editor groups in `index.html`:

1. Color & Background (`color-background`)
2. Spacing
3. Typography
4. Custom Settings
5. Layout
6. Sizing
7. Border & Outline
8. Flexbox
9. Grid
10. Positioning
11. Text
12. Shadow
13. Effects
14. Transform
15. Responsive
16. Interaction
17. Visibility
18. Overflow
19. Forms
20. Columns
21. Containment
22. Custom Properties
23. Transition
24. Scroll Snap
25. List
26. Table
27. States
28. Content
29. SVG
30. Logical
31. Masking
32. Accessibility
33. View Transitions

The presence of a group in the UI does not prove that it provides a complete editor for the corresponding CSS feature. In particular, Responsive, States, animation, and pseudo-element workflows have important limitations described below.

### 10.2 Confirmed implementation defects and high-confidence issues

#### VE-01 — Selection state is not fully cleared when leaving Visual Mode

The exit path resets `selectedLabel`, but the controller's `visualSelector` is retained. Re-entering Visual Mode can therefore leave a stale selector referring to the previously selected element.

**Expected behavior:** Exiting Visual Mode must clear all selection-related state, including the selected label, selector, and any pending selection/computed-style request. Re-entering must start with no element selected.

#### VE-02 — Preview reload leaves stale selection state

The preview iframe load handler resets the visible selection label but does not fully clear the controller's selected selector/selection state. The old selector can survive a document reload even though the old DOM node no longer exists.

**Expected behavior:** On every preview document replacement/load, invalidate the previous selection and pending requests. Do not allow controls to target a stale element.

#### VE-03 — Selecting a new element does not reliably refresh an already-open inspector

When a property group is open, selecting another preview element updates the selected label/selector, but the controls can continue showing computed values from the previously selected element.

**Expected behavior:** A new selection must trigger a complete refresh of all visible inspector controls and computed values. The displayed values must correspond to the currently selected element only.

#### VE-04 — Computed-style responses are vulnerable to out-of-order delivery

Computed-style requests do not carry a robust request/selection identity. If the user selects elements quickly, a delayed response for an earlier selection can update controls after a newer selection has already occurred.

**Expected behavior:** Add monotonically increasing request IDs and a selection/document generation ID to requests and responses. Ignore any response that does not match the latest active selection and preview document generation.

#### VE-05 — Inspector controls can be used without a selected element

Property groups can be opened and edited while no valid preview element is selected. In that state, a change may not be applied to the preview or serialized into CSS because there is no valid selector.

**Expected behavior:** Disable or clearly gate all element-specific controls until a valid element is selected. Show a concise English empty-state instruction such as “Select an element in the preview to edit its styles.” Do not silently discard user input.

#### VE-06 — Numeric input unit handling interferes with typing

In `js/visual/visual-properties.js`, the numeric input path appends the configured unit on each input event. This can corrupt normal multi-character editing: typing a value such as `16` can produce malformed intermediate text such as `1px6px`.

**Expected behavior:** Keep the editable input value separate from its normalized CSS value. Do not append units on every keystroke. Normalize/append the unit at a deliberate commit point (for example, change/blur/Enter), while allowing normal editing, selection, deletion, and replacement. Support negative values and decimals where the property permits them.

#### VE-07 — Inline styles can override persisted Visual Editor CSS

The preview applies a visual change using `element.style.setProperty`, but the underlying HTML source is not necessarily updated. The generated/persisted CSS rule may then lose to an existing inline style when the preview is rebuilt. Existing inline `!important` declarations can also defeat ordinary stylesheet rules.

**Expected behavior:** Define a consistent persistence strategy. Either safely update the relevant inline declaration in the HTML model, or emit a managed CSS declaration with an explicitly designed precedence strategy. Preserve unrelated inline declarations and user-authored CSS. Do not indiscriminately add `!important` as a workaround; test cascade and specificity behavior.

### 10.3 Additional functional limitations and risks to address

#### VE-08 — Generated selectors are structurally fragile

Selectors are generated using structural paths such as `body > div:nth-of-type(...)`, rather than preferring stable identifiers/classes when available. Inserting or removing sibling elements can cause the generated selector to point to a different element.

**Improvement:** Prefer a unique existing ID where safe; otherwise use a stable class/attribute strategy or a carefully generated path. Verify uniqueness against the current document. Revalidate selectors after DOM changes and preview reloads. Avoid mutating user HTML merely to create selectors unless the behavior is explicit and reversible.

#### VE-09 — HTML, BODY, and HEAD selection is restricted

The current selection behavior excludes document-level elements. This limits editing common page-wide properties such as body background, default typography, and page-level layout.

**Improvement:** Consider supporting BODY (and, where appropriate, HTML) with clear semantics. HEAD should generally not be treated as a visual canvas element. Test document-level style persistence carefully.

#### VE-10 — Shadow DOM support is incomplete

The current inspector does not provide complete traversal and selection behavior for shadow roots.

**Improvement:** Decide and document whether open Shadow DOM is supported. If implemented, traverse open shadow roots deliberately and define selector/serialization behavior. Closed shadow roots cannot be inspected through ordinary page scripting and should not be promised as supported.

#### VE-11 — Color controls are limited

Color selection is based on fixed dropdown options; a full color picker and flexible HEX/RGB/HSL entry are not available in the reviewed implementation.

**Improvement:** Add a native color input or equivalent picker plus a text field for valid CSS color syntax. Preserve alpha and modern color forms where supported. Validate with `CSS.supports` and retain unknown/current values rather than silently replacing them.

#### VE-12 — Range properties are rendered as selects

The `range` property type in `visual-properties.js` is handled as a select-style control rather than a true slider.

**Improvement:** Implement a real range input for properties that define sensible numeric bounds and step sizes. Keep a numeric/text value field where precision is needed. Do not impose arbitrary bounds on CSS properties whose valid range is effectively open-ended.

#### VE-13 — CSS values are not comprehensively validated

The inspector does not consistently validate user-entered values with `CSS.supports` before applying/persisting them. Invalid values can be stored and then ignored by the browser, leaving the UI and preview inconsistent.

**Improvement:** Validate property/value pairs before committing. Handle custom properties separately because their value grammar is intentionally broad. Show a clear English validation message and preserve the last valid value.

#### VE-14 — Property removal semantics need definition

Removing a managed value must distinguish between deleting the Visual Editor's override and deleting an existing declaration authored by the user. The current workflow needs stronger guarantees that reset/remove operations do not destroy source CSS.

**Improvement:** Track managed declarations independently and define “Reset” as removing only the Visual Editor override unless the user explicitly chooses to edit source CSS. Test shorthand/longhand interactions.

#### VE-15 — Custom property renaming can leave stale declarations

Changing a custom property name alone may not remove or migrate the old variable declaration and references, potentially leaving an unused or conflicting variable behind.

**Improvement:** Treat rename as a coordinated operation: inspect declaration and references, preview the proposed change, update references only when safe, and provide an explicit confirmation for broad changes. Never silently rewrite unrelated CSS.

#### VE-16 — Current computed values and arbitrary values are not handled consistently

The UI can expose a current/computed value option, but choosing arbitrary valid CSS values remains limited for some property controls.

**Improvement:** Ensure every relevant control can preserve and display the current value, including values not present in its predefined option list. Provide a safe custom-value path.

#### VE-17 — Responsive group is not a complete breakpoint/media-query editor

The Responsive group does not provide a complete workflow for creating, editing, ordering, and removing responsive breakpoints and their media-query declarations.

**Improvement:** If full responsive editing is intended, build a dedicated media-query editor with explicit breakpoint management, scoped declarations, and a clear preview viewport. Do not present a partial set of responsive-related properties as a complete breakpoint editor.

#### VE-18 — States group does not fully edit pseudo-classes

The States & Pseudo-classes functionality does not provide a complete authoring workflow for states such as `:hover`, `:focus`, `:active`, `:checked`, and `:disabled`.

**Improvement:** Add explicit state editing with a safe preview mechanism. Do not rely on permanently forcing pseudo-state styles onto the selected element. Preserve selectors and existing rules.

#### VE-19 — Generated Content lacks independent pseudo-element editing

There is no complete, independent editing workflow for `::before` and `::after`, including their content and associated styles.

**Improvement:** Add pseudo-element selection/editing as a distinct target type. Make it clear that pseudo-elements are not ordinary DOM nodes and serialize their declarations to the correct selectors.

#### VE-20 — No complete keyframe animation editor

The reviewed groups do not provide a complete animation/keyframes authoring workflow.

**Improvement:** If animation editing is in scope, support named `@keyframes`, keyframe stops, per-stop declarations, animation properties, and safe editing of existing user-authored keyframes. Avoid flattening or deleting existing animation rules.

#### VE-21 — Grid and Flexbox controls need deeper coverage

The presence of Grid and Flexbox groups does not establish comprehensive layout editing. Advanced tracks, areas, auto-placement, gaps, alignment, wrapping, ordering, and responsive combinations require explicit coverage and testing.

**Improvement:** Audit each group against the CSS specifications and provide controls for common workflows without hiding or corrupting unsupported existing values.

#### VE-22 — postMessage protocol needs stronger correlation and validation

The parent/preview messaging flow is relatively simple and needs request/selection correlation, stale-response handling, and robust validation of message types/payloads.

**Improvement:** Define a small typed message protocol, validate incoming payloads, include request IDs and document generations, and ignore obsolete responses. Keep the iframe security boundary intact.

#### VE-23 — Invalid selectors and removed elements need better recovery

A selector may become invalid or stop matching after source edits or DOM mutation. Error handling should not leave the inspector in a misleading state.

**Improvement:** Handle selector parsing/query errors and zero-match results explicitly. Clear invalid selection state and ask the user to select an element again. Never silently apply a rule to a different element.

#### VE-24 — Managed CSS marker block needs robust preservation

Visual Editor rules are stored using marker comments such as `ALFACODE-VISUAL-START`, `ALFACODE-VISUAL-RULE`, and `ALFACODE-VISUAL-END`. Marker-based storage can become fragile if users edit the CSS manually, duplicate blocks, partially delete markers, or reorder content.

**Improvement:** Make parsing/rebuilding tolerant of malformed or duplicate markers. Preserve all text outside the exact managed region byte-for-byte where practical. If the managed region is ambiguous, do not rewrite it automatically; report the conflict and preserve the source.

#### VE-25 — Monaco/CodeMirror synchronization requires explicit regression tests

Visual CSS changes are synchronized with existing editor instances. This interaction needs tests for both Monaco and CodeMirror, including cursor/selection stability, undo/redo, unsaved edits, and simultaneous/manual CSS edits.

**Improvement:** Verify that generated CSS changes enter the canonical application state exactly once, do not reset the editor unnecessarily, and do not erase user edits. Define expected undo behavior for a Visual Editor operation.

#### VE-26 — Rebuilding/synchronizing CSS on every edit may be expensive

If each keystroke rebuilds the managed CSS block and synchronizes editor state, large documents may experience unnecessary work or cursor disruption.

**Improvement:** Separate draft input from committed updates, debounce where appropriate, avoid full-document work for every keystroke, and measure performance on large HTML/CSS documents before optimizing.

### 10.4 Recommended remediation order for Visual Editor

#### VE-P0 — Correctness and data safety (do first)

1. Clear all selection state on Visual Mode exit.
2. Clear/invalidate selection on preview iframe reload or document replacement.
3. Refresh all visible computed controls when the selected element changes.
4. Add request IDs and selection/document generation IDs to preview messaging.
5. Disable or gate element-specific controls when no valid element is selected.
6. Fix numeric input/unit handling so multi-character typing works.
7. Resolve inline-style and `!important` precedence so visual changes survive preview rebuilds.
8. Ensure no Visual Editor operation can delete or rewrite unrelated user-authored CSS.

#### VE-P1 — Input quality and CSS correctness

1. Add a real color picker and custom color-value input.
2. Implement true range/slider controls where appropriate.
3. Validate CSS property/value pairs before committing.
4. Define safe reset/remove semantics for managed overrides.
5. Make custom-property rename behavior safe and explicit.
6. Preserve arbitrary/current values in controls.

#### VE-P2 — Selection and DOM robustness

1. Prefer stable unique selectors over brittle structural paths.
2. Consider BODY/HTML selection with clear semantics.
3. Handle DOM mutations and deleted/replaced selected nodes.
4. Define and, if feasible, implement open Shadow DOM support.
5. Improve selector and postMessage error handling.

#### VE-P3 — Advanced CSS authoring

1. Implement a real responsive breakpoint/media-query editor if required.
2. Implement pseudo-class state editing.
3. Implement separate `::before`/`::after` editing.
4. Add keyframes/animation editing.
5. Expand Grid/Flexbox workflows.
6. Improve SVG and generated-content editing where supported.

#### VE-P4 — Performance and regression quality

1. Test large HTML/CSS documents.
2. Avoid unnecessary full CSS rebuilds on every keystroke.
3. Verify Monaco and CodeMirror synchronization, undo/redo, and cursor stability.
4. Test all 33 groups and all controls.
5. Test narrow/wide viewports and fullscreen transitions.
6. Test offline operation and inspect browser console/network activity.

### 10.5 Visual Editor acceptance checklist

Do not mark the Visual Editor complete until all relevant items below pass:

- [ ] Entering and exiting Visual Mode leaves no stale selection.
- [ ] Preview reload invalidates the old selected element.
- [ ] Selecting a different element refreshes every visible property control.
- [ ] Delayed responses from old selections cannot overwrite current values.
- [ ] Controls cannot silently accept edits without a valid target.
- [ ] Numeric values, decimals, negatives, units, deletion, and replacement can be typed naturally.
- [ ] Color values can be selected and entered without losing unsupported/current values.
- [ ] Invalid CSS values are rejected or clearly reported before persistence.
- [ ] Visual edits survive preview refresh and page reload.
- [ ] Existing inline styles and `!important` declarations behave according to a documented cascade policy.
- [ ] Resetting a visual override does not delete unrelated author CSS.
- [ ] Generated selectors remain correct after sibling insertion/removal or are safely invalidated.
- [ ] Malformed/duplicate Visual Editor markers do not cause unrelated CSS loss.
- [ ] All 33 groups have been exercised; incomplete groups are clearly documented.
- [ ] Monaco and CodeMirror both remain synchronized after visual edits.
- [ ] Undo/redo behavior is predictable and does not lose user work.
- [ ] No new browser console errors or failed local asset requests occur.
- [ ] The application remains usable offline.

**Important:** The VE-01 through VE-07 items are the highest-priority implementation defects identified in the reviewed source. VE-08 through VE-26 describe limitations, robustness risks, or missing capabilities; reproduce and verify each one before treating it as a confirmed runtime bug.

