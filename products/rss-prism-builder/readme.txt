=== RSS Prism Builder ===
Contributors: riyazamra1
Tags: page-builder, layout, templates
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.33.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

RSS Prism Builder is a visual layout builder for WordPress, with a live canvas, element inspector, reusable templates, responsive previews, and a growing module library.

== Changelog ==

= 0.33.0 =
* Adds Cover/Contain image-fit controls to images inside column layouts.
* Validates image-fit values and aligns editor preview with published output.


= 0.32.0 =
* Adds an Image Fit control for top-level image elements: Cover crops to a consistent 240px height; Contain preserves the full image height.
* Applies the validated fit setting consistently in the live canvas and published layout output; older layouts default safely to Cover.


= 0.31.0 =
* Adds image elements inside columns. Each column can contain images alongside headings, text, and buttons.
* Image URLs and alternative text are editable, sanitized before saving, and rendered in the preview and published template.
* Nested column imports accept image elements while retaining the 12-child-per-column limit.

= 0.30.0 =
* Adds a responsive Image Gallery module with up to 12 direct image URLs, live preview, and published grid output.
* Sanitizes image URLs and bounds the gallery image count.

= 0.29.0 =
* Adds Blurb and Call to Action modules, including editable text, icon/symbol, button destination, and button colors.
* Includes these modules in the inspector, autosave, import/export, sanitization, and published output.

= 0.28.0 =
* Adds Global Design System presets: RSS Gold, Ocean Blue, Forest Green, and Midnight.
* Applying a preset updates colors, button styling, spacing, dividers, and corner radii in one undoable action.
* Improves responsive panel stacking.

= 0.27.0 =
* Adds adjustable Divider, Spacer, and Quote modules.
* Fixes WordPress host-specific update routing for the GitHub Update URI.

= 0.26.0 =
* Improves GitHub-based automatic-update routing so WordPress receives the validated release version and direct ZIP package URL.
* Actual automatic updating must still be verified on the target WordPress installation.

= 0.25.0 =
* Adds optional element borders with editable color and width.

= 0.24.0 =
* Adds per-element background color and corner-radius controls, saved and rendered on published pages.

= 0.23.0 =
* Adds direct inline editing for headings, text, button labels, and section titles.
* Adds clearer hover, selection, and inline-editing states.

= 0.22.5 =
* Fixes expired “Edit with RSS Prism Builder” links using a fresh confirmation screen and nonce-protected POST conversion.

= 0.22.4 =
* Corrects the runtime version constant so update comparisons match the plugin header.

= 0.22.3 =
* Hardens GitHub release asset validation, avoids caching empty release lookups, reconciles stale WordPress update metadata, and declares a unique Update URI.

= 0.22.2 =
* Restores tablet/mobile preview-width and column-layout guards.

= 0.22.0 =
* Redesigns the editor workspace with a live canvas, layer list, contextual inspector, responsive previews, and drag-and-drop insertion.
* The interface is an original RSS Prism implementation inspired by common visual-builder workflows, not copied proprietary Divi, Elementor, or Themify code.

= 0.21.0 =
* Adds an “Edit with RSS Prism Builder” workflow for existing WordPress pages, backing up original page content and converting common blocks where possible.

= 0.20.0 =
* Adds a workflow to create a real WordPress draft page from a saved Prism layout.

= 0.19.1 =
* Ensures the automatic first-run template opens with editable starter content.

= 0.19.0 =
* Adds an editable RSS business-landing starter template with a hero, service columns, and a call to action.

= 0.18.9 =
* Fixes the welcome-screen “Create a template” shortcut so it opens the visual builder.

= 0.18.8 =
* Improves responsive preview fidelity for mobile and tablet column layouts.

= 0.18.7 =
* Adds nested-element insertion controls and WordPress Media Library selection for images inside nested containers.

= 0.18.6 =
* Aligns release package metadata and repairs cached update detection.

= 0.18.0 =
* Adds GitHub release-based plugin update detection, release notes, and a permission-protected manual update check.

== Current scope ==

* Theme-independent Prism Template content with title search, draft/published status, and template counts.
* Draggable/reorderable sections, headings, text, buttons, images, containers, and two- or three-column layouts.
* Nested content containers with editable heading, text, button, image, and container elements, with bounded nesting depth.
* Editable column children including headings, text, buttons, and images; existing text-only layouts remain supported.
* RSS-branded welcome screen with setup shortcuts and security guidance.
* Current builder features remain free; premium features stay unavailable until a server-verified licensing system exists.
* REST nonce/session checks, per-template capabilities, a 1 MB request limit, and per-user request throttling on builder save/copy endpoints.
* Save a layout as a separate reusable draft template without overwriting the source.
* Six starter layouts: Business landing, Services, About RSS, RSS projects, Security solutions, and Contact page.
* WordPress Media Library image selection with editable URL, alternative text, and image-width control.
* Call-to-action destination, button colors, and corner-radius controls.
* Text, background/text color, typography size, alignment, spacing, and per-device typography/alignment/padding controls.
* Duplicate, undo, redo, desktop/tablet/mobile preview, JSON import/export, and local restore history.
* Sanitized, permission-checked REST layout saving.
* [rss_prism_canvas id="123"] renders a published layout; [rss_prism_pricing] displays the current pricing catalog.

== Limitations ==

RSS Prism Builder is an evolving visual-builder MVP, not a complete replacement for Divi, Elementor, or Themify. Preview widths are editor previews. Container nesting is bounded. Full-site editing, a broader widget library, premium entitlements, and payment processing are not implemented. Premium roadmap items are not currently available.
