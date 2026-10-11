# RSS Prism theme updates

## Version 1.3.1

- Added adjustable logo width and height sliders.
- Added navigation text size, font weight, capitalization, item spacing, horizontal/vertical padding, and corner-radius controls.
- Added an outlined navigation style alongside minimal, rounded, and underline styles.
- Added standard, centered, and dark header layout choices.
- Added global font-family selection (system, Arial, Georgia, Trebuchet MS, Verdana).
- Retained previous Customizer setting IDs and values, including the 1.3.0 updater fixes.


## Version 1.3.0

- Fixed dashboard update status handling for WordPress's array-based theme update entries.
- Added a capability-checked, nonce-protected manual update refresh action for administrators.
- Refresh clears only RSS Prism release metadata and WordPress theme-update caches; it does not delete or reset Customizer settings.
- Release detection validates official ZIP assets and sorts all eligible stable releases by semantic version rather than trusting API list order.
- Increased GitHub release API timeout to reduce false negatives on slower hosting.
- Preserved existing Customizer setting IDs and stored header/footer layout options.

RSS Prism uses WordPress's native theme update screen. When a newer stable release is available, WordPress shows its normal update notification and the site administrator chooses Update. Updates are not forced.

## Release process

1. Update the theme version in style.css and the stable tag in readme.txt.
2. Commit and merge the tested theme changes to main.
3. Create and push a tag such as rss-prism-theme-v1.2.3 pointing at that commit.
4. The GitHub Actions workflow validates the version, packages products/rss-prism-theme under the correct rss-prism-theme ZIP root, tests the archive, and attaches rss-prism-theme.zip to the GitHub Release.
5. WordPress checks public GitHub release metadata and offers the package through its standard Themes updater. Release metadata is cached for 15 minutes in version 1.3.0.

The release must contain the exact asset name rss-prism-theme.zip. Releases for other RSS Prism products should use different tag prefixes and will not be offered as theme updates.

## Preservation and safety

WordPress replaces the theme's code directory during a theme update. Site content and properly stored Customizer/theme-mod settings live in the database and are not overwritten by the theme package. Do not store customer-specific edits in theme files; use a child theme or plugin for custom code. If a release changes the structure or meaning of stored options, add a backward-compatible migration and test it before publishing.

The updater fails closed: it does not offer an update unless a stable, versioned release with the expected ZIP asset is found. A temporary GitHub/API issue leaves the currently installed theme active. Updates are initiated by the site administrator using WordPress; no automatic background installation is enabled.

## Limitations

This public-release updater is appropriate for the free RSS Prism theme. It is not a premium license-validation or private download system. If premium theme updates are later added, enforce entitlement and signed/authorized downloads on the server rather than trusting a client-side license check.

The updater first becomes available when version 1.2.2 is installed. Sites on 1.2.1 need that one initial upgrade through their existing installation method; after version 1.2.2 is installed, later releases can be installed from WordPress without manually uploading a ZIP.

## Version 1.2.3

- Group theme options under one RSS Prism Settings panel with clearer customization categories.
- Add category labels to posts and article cards, with a Customizer toggle.
- Generate a 1200 × 900 `screenshot.png` for WordPress theme previews from the included `screenshot.svg` artwork.
- Reduce the release metadata cache duration to 15 minutes for future update checks.

## Version 1.2.4

- Fix the welcome-card Hide action with an authenticated AJAX dismissal and a non-JavaScript fallback.
- Preserve a user's Hide preference when the theme is switched again; only initialize the welcome preference on first activation for that user.
- Add an RSS Prism dashboard widget and Appearance → RSS Prism Dashboard page with installed version, WordPress update status, links to design tools, and release notes/source links.
- Simplify the Customizer section names and hierarchy, add guidance to use RSS Prism Studio for layout arrangement, and remove the duplicate header-style selector while retaining saved legacy settings.
