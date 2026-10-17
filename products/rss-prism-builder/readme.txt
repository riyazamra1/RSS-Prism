Version 0.28.0 introduces a Global Design System panel with four coordinated design presets (RSS Gold, Ocean Blue, Forest Green, Midnight). Applying a preset updates the current layout's element palette, text colors, button styles, spacing, dividers, and corner radii in one undoable action; the normal WordPress autosave persists the resulting layout. The admin workspace also gains improved responsive panel stacking. This is a further builder foundation, not a claim of complete Divi feature parity.

Version 0.27.0 fixes WordPress host-specific update routing for the GitHub Update URI and adds three practical visual modules: adjustable divider, adjustable vertical spacer, and quote with attribution. Each module is available from the element palette, editable in the live canvas/inspector, and sanitized and rendered in published output. Automatic updating still requires verification on the target WordPress installation.

Version 0.26.0 fixes WordPress automatic-update routing for the plugin's GitHub Update URI. WordPress versions that use the host-specific update hook now receive the validated release version and direct ZIP package URL, rather than relying only on the generic update transient. This addresses the “Automatic update is unavailable” state; the actual customer WordPress installation still needs an update check and upgrade test.

=== RSS Prism Builder ===

Version 0.25.0 adds optional element borders to the live design inspector. Set border color and a 0–12px border width; borders are validated and saved with the layout and applied to published output. Combined with the previous release's background and corner-radius controls, this adds practical per-element styling without requiring custom CSS.

Version 0.24.0 expands the live design inspector: background color is available for every top-level element, corner radius is adjustable from 0–48px, and these styles are sanitized, stored, and rendered on the published page. This builds on the inline canvas editing introduced in 0.23.0; full Divi parity is still in progress.

Version 0.23.0 adds direct inline editing on the live canvas: double-click a heading, text block, button label, or section title to edit it in place, then finish editing to commit the text into the autosaved layout. Escape exits inline editing; Enter finishes editing for single-line elements. The editor now visibly outlines hover, selection, and inline-editing states. The Divi-style workflow is being built incrementally; this release does not yet provide full Divi parity.

Version 0.22.5 fixes the expired-link issue when opening existing pages: clicking “Edit with RSS Prism Builder” now opens a fresh confirmation screen and performs page conversion through a nonce-protected POST, with a clear recovery message if the confirmation expires. Version 0.22.4 corrects the runtime version constant so WordPress update comparisons match the plugin header. Version 0.22.3 hardens GitHub release asset validation, prevents empty release lookups from being cached, reconciles stale WordPress update/no-update metadata, and declares a unique Update URI so WordPress can route this plugin away from WordPress.org. Version 0.22.2 restores explicit tablet/mobile preview-width and column-layout guards. Version 0.22.1 keeps the visual workspace within the plugin's CSS performance budget while preserving the new editor layout and responsive controls. Version 0.22.0 redesigns the editor into a focused visual workspace: live page canvas in the center, layer list on the left, contextual element settings on the right, responsive preview controls, a compact design toolbar, and drag-from-palette/drop-on-canvas element insertion. Click an element in the live canvas to select it for editing. This is an original RSS Prism interface inspired by common visual-builder workflows; it is not a copy of proprietary Divi, Elementor, or Themify code.
Contributors: riyazamra1
Tags: page-builder, layout, templates
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.28.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An early visual layout builder for RSS Prism. Version 0.19.1 ensures the automatic first-run template opens with the same editable starter content as manually created templates, preventing a blank first canvas. Version 0.19.0 makes “Create a template” start with editable RSS business-landing content, including a hero, three service columns and a call-to-action, so the new template is visibly populated when the builder opens. Version 0.18.9 fixes the welcome-screen “Create a template” shortcut so it creates a draft and opens the visual builder instead of sending users to the empty/default WordPress editor. Version 0.18.8 fixes responsive preview fidelity so columns collapse in mobile preview and use a two-column layout in tablet preview, matching the intended canvas width. Version 0.18.7 adds direct nested-element insertion controls and WordPress Media Library selection for images inside nested containers. Version 0.18.6 aligns release package metadata and repairs cached update detection; Version 0.18.5 repairs WordPress update package metadata and cached update detection; Version 0.18.0 added native WordPress plugin update detection and installation from official GitHub releases, with version validation, release notes, and a permission-protected manual update check. Version 0.17.2 fixed Media Library selection so the image URL and attachment alt text are applied together without one update overwriting the other. It retains performance regression budgets, per-template REST permissions for save and copy operations, and bounded nested JSON import depth. Debounced autosave is retained so rapid editing does not send a request for every keystroke.

Version 0.21.0 adds an “Edit with RSS Prism Builder” box to existing WordPress pages. It backs up the page’s original content in page metadata, converts common WordPress heading, paragraph, image, button, and columns blocks into builder elements, then connects the page to the saved Prism layout. Unsupported block text is retained where possible; the original content backup remains available for recovery. Version 0.20.0 adds a direct WordPress page workflow: enter a page title in the visual builder, save the current layout, and create a real WordPress draft page that renders the saved design. The page opens in the standard WordPress editor for review and publishing; no manual shortcode copying is required.

== Current scope ==
* Theme-independent Prism Template content, with title search, draft/published status labels, and a matching-template count in the builder library.
* Draggable/reorderable section, heading, text, button, image, content container, and 2/3-column layout elements.
* Content containers with recursively editable and reorderable heading, text, button, image, and nested-container elements; each level is limited to 20 items and nesting is bounded to two levels inside the main container.
* Edit and drag-reorder nested heading, text, and button elements independently inside each column, with move-up/down controls. Existing text-only column layouts remain supported.
* Show an RSS-branded welcome screen after activation with Free features, planned Premium roadmap, setup shortcuts, and security guidance.
* Keep all currently available features free; future premium features remain unavailable until a server-verified licensing system exists.
* Apply REST nonce/session checks, per-template capabilities, a 1 MB request limit, and per-user request throttling to builder save/copy endpoints.
* Save the current layout as a separate reusable draft template without overwriting the source template.
* Insert six RSS starter layouts: Business landing, Services, About RSS, RSS projects, Security solutions, and Contact page. Starter content uses RSS brand details and can be edited before saving.
* Select images directly from the WordPress Media Library, with editable image URL, accessible alternative text, and percentage width control.
* Configure call-to-action button destination, background colour, text colour, and corner radius.
* Basic text, button URL, background/text color, typography size, alignment, and spacing controls.
* Duplicate, undo, redo, and desktop/tablet/mobile-width preview controls.
* Saved per-device typography, alignment, and padding with responsive frontend CSS.
* Sanitized, permission-checked REST layout saving.
* [rss_prism_canvas id="123"] renders a published layout; [rss_prism_pricing] displays the active catalog (Free only).

== Limitations ==
This remains an early MVP, not the complete visual builder. Preview widths are editor previews; typography, alignment, and padding are saved per device. Container nesting is supported to a bounded depth; a broader widget library, full-site editing, premium entitlements, and payment processing are not implemented. Premium roadmap items are not currently available.
