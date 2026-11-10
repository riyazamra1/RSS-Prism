# RSS Prism product and Builder requirements

This document is the working product baseline for RSS Prism Theme and RSS Prism Builder. It records the requested experience and acceptance criteria so implementation can be completed and reviewed against a stable repository reference. It does not claim that unfinished items are implemented.

## Product direction

RSS Prism Builder must become a production-quality WordPress visual page builder comparable in workflow capability to established builders such as Divi, Elementor, and Themify. Build an original RSS Prism implementation; do not copy proprietary code, assets, or interface artwork.

The Builder must remain a separate plugin from the Theme. Builder layouts and content must survive a theme switch. The Theme controls site presentation; the Builder controls page layout and content.

## Builder editor experience

### Canvas and editing
- Provide a live front-end-like canvas with direct selection and inline text editing.
- Support desktop, tablet, and mobile preview modes. Responsive values must be independently configurable per device and must fall back predictably when a device override is unset.
- Keep the canvas usable at common laptop and mobile viewport sizes. Provide clear selected, hover, focus, and drop-target states.
- Provide a distraction-reduced/full-screen editing workspace and clear controls for save state, preview, and publishing.
- Support keyboard operation for selection and common editing actions. Do not hijack keyboard shortcuts while the user is typing in an input, textarea, select, or content-editable field.

### Structure and layout
- Support hierarchical Sections, Rows, Columns, Containers, and nested content.
- Provide a hierarchical Navigator/Layers panel with expand/collapse, selection, useful labels, and synchronized canvas/Inspector selection.
- Support drag-and-drop insertion and reordering at top-level and nested levels. A move must preserve the complete element subtree and unique IDs, reject invalid parent/descendant drops, and update the selected path safely.
- Provide non-drag alternatives such as Move up/Move down for accessibility and touch use.
- Support responsive row/column wrapping, configurable gaps, widths, alignment, and stacking behavior.

### Modules
The module library must grow beyond the current foundation. Core modules include Section, Heading, Text, Button, Image, Gallery, Columns, Row, Container, Divider, Spacer, Quote, Blurb, and Call to Action. Plan additional common content modules such as video, icon, list, accordion/toggle, tabs, forms, map/embed, social links, and post/content grids. New modules must include validated settings, preview output, published output, responsive behavior where relevant, and safe serialization.

### Inspector and design controls
- Provide contextual Inspector controls for the selected element, not merely its parent.
- Support typography (font family, size, weight, line height, letter spacing, text transform), text and background colours, borders, radius, shadows, spacing, sizing, alignment, and visibility.
- Support hover/focus styling where meaningful, including links and buttons.
- Provide background colour/image/gradient controls where appropriate, with safe media selection and URL validation.
- Provide device-specific controls and explicit reset/inherit behavior.
- Keep controls organized into predictable categories; avoid duplicated controls and missing/ambiguous categories.

### Editing operations
- Support undo/redo, autosave, recovery after editor reload, and clear save/error feedback.
- Support duplicate, copy, cut, paste, delete, and reorder for top-level and nested elements. Regenerate all IDs recursively when cloning.
- Support reusable templates/sections and global reusable components. Editing a global component should update its instances according to an explicit user-visible global/local editing model.
- Support import/export with schema validation, size/depth/element-count limits, and safe failure handling.
- Existing WordPress pages should have a safe conversion/edit workflow that preserves a recoverable copy of original content.

### Rendering, persistence, and security
- Persist layouts using WordPress-native storage and capability/nonce-protected endpoints.
- Sanitize data on write and escape output on render. Validate allowed element types, URLs, colours, responsive values, nesting depth, and collection sizes on both client and server.
- Keep front-end rendering independent of the editor JavaScript. Published pages must render when the Builder editor is not loaded.
- Maintain backward compatibility for previously saved layouts or provide explicit, tested migrations.
- Avoid remote dependencies that can disable or corrupt already-published pages.

## Theme requirements

- Keep the Theme lightweight, responsive, and usable with standard WordPress content and the Builder plugin.
- Provide coherent, categorized Customizer controls without duplicate settings or missing categories.
- Include a valid theme thumbnail and accurate dashboard welcome/update information.
- The welcome-screen Hide/Dismiss action must work reliably and persist for the intended administrator/user.
- Keep customer-facing screens free of internal RSS development tools, mailing-list administration, and internal ecosystem wording.
- Preserve the original RSS brand assets and approved brand treatment; do not distort or recolour the official logo.
- Maintain accessible navigation, keyboard focus, reduced-motion support, and responsive layouts.

## Automatic updates and releases

- Builder and Theme updates must be discoverable and installable from the normal WordPress Dashboard update flow. Users should not need to download ZIPs, delete plugins/themes, or reinstall manually for routine updates.
- Update metadata must report the correct product name, installed version, latest version, release notes, and exact official installable ZIP URL.
- Validate release tag/version consistency, asset naming, HTTPS origin, and package contents. Ignore unrelated release assets and reject malformed or unexpected package URLs.
- Release workflows must be serialized so Theme and Builder releases cannot race or overwrite each other.
- Preserve WordPress rollback/recovery behavior and fail safely if the release service is unavailable.
- Test update discovery and installation against a real supported WordPress installation before claiming end-to-end updater completion. CI ZIP creation alone is not proof that WordPress can install the update.

## Quality gates and acceptance criteria

For each Builder/Theme change:
1. Run PHP syntax checks and JavaScript syntax checks where applicable.
2. Build the installable ZIP and inspect required files and package root layout.
3. Run automated tests for sanitization, permissions, layout persistence/rendering, and update metadata where available.
4. Add regression coverage for the defect or new behavior.
5. Test desktop, tablet, and mobile editor states; test keyboard and pointer interactions.
6. Verify the actual WordPress dashboard flow for save, preview, publish, theme welcome dismissal, and automatic updates in a staging WordPress site before marking those flows complete.
7. Report CI and live-site verification separately. Never treat a successful package build as a production release or a live update test.

## Current implementation snapshot (2026-11-10)

Implemented in the current working branch:
- Live canvas, inline editing, responsive preview modes, autosave/recovery, undo/redo, templates, and a contextual Inspector foundation.
- Sections, headings, text, buttons, images, columns, rows, containers, divider, spacer, quote, blurb, callout, and gallery modules.
- Hierarchical Navigator for containers/rows and columns, nested child selection, and keyboard activation for nested canvas elements.
- Recursive ID regeneration for cloned nested layouts.
- Top-level drag/reorder plus nested-editor and live-canvas drag/drop. Nested elements can be reordered among siblings or moved into a nested Container within the same top-level Row/Container tree. Moves reject self/descendant cycles and preserve the moved subtree. Cross-top-level and cross-column drag/drop remain outstanding.
- Builder 0.37.9, 0.37.10, and 0.37.11 syntax/package validation passed in GitHub Actions, including the cross-tree nested drag/drop implementation.
- Theme metadata/thumbnail-source, PHP syntax, and installable ZIP validation passed in GitHub Actions.
- Updater package validation and release workflow serialization have been improved.

Still outstanding:
- Cross-column drag/drop, plus more complete touch-friendly drag handles and drop-target feedback.
- Broader module library and full Inspector coverage (including advanced typography, hover/focus, backgrounds, shadows, and responsive visibility/layout controls).
- Full global component workflow and expanded template library.
- Real staging WordPress regression testing, especially actual Dashboard automatic update installation and theme welcome dismissal.
- Final release review and publication. No release or live WordPress end-to-end update verification is claimed by this document.
