=== RSS Prism Builder ===
Contributors: riyazamra1
Tags: page-builder, layout, templates
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.18.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An early visual layout builder for RSS Prism. Version 0.18.0 adds native WordPress plugin update detection and installation from official GitHub releases, with version validation, release notes, and a permission-protected manual update check. Version 0.17.2 fixed Media Library selection so the image URL and attachment alt text are applied together without one update overwriting the other. It retains performance regression budgets, per-template REST permissions for save and copy operations, and bounded nested JSON import depth. Debounced autosave is retained so rapid editing does not send a request for every keystroke.

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
