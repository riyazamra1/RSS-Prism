# RSS Prism

RSS Prism is the WordPress design platform from Razeen Secure Solution (RSS).

> Developing Ideas. Delivering Solutions.

## Current release

**RSS Prism Theme 1.2.0** is the installable multipurpose theme in `products/rss-prism-theme/`. It includes a customizable homepage, responsive navigation, colour and width controls, header/footer options, grid/list archive layouts, widget areas, and templates for pages, posts, archives, search, comments, and 404 pages.

## Product family

- **RSS Prism Theme** — free, installable multipurpose WordPress theme.
- **RSS Prism Builder 0.6.0** — a separate visual layout-builder plugin with draggable section, heading, text, button, and image elements; Media Library selection; adjustable image width; configurable CTA button colours/corner radius; responsive typography/spacing; undo/redo; and live preview. It remains an early MVP, not a complete Elementor-equivalent builder.
- **RSS Prism Studio** — planned template library.

Only the Free plan is currently offered. Paid prices and plans are not active and are not displayed by the public pricing shortcode. Historical proposed prices are kept separately in `pricing/archived-proposals.json` for internal reference only; they are not offers or checkout prices.

## Repository layout

- `products/rss-prism-theme/` — installable WordPress theme.
- `products/rss-prism-builder/` — installable visual builder plugin.
- `pricing/plans.json` — current public plan catalog (Free only).
- `pricing/archived-proposals.json` — inactive historical pricing proposals, not used by the public shortcode.
- `config/pricing.php` — canonical catalog loader.
- `docs/` — product, pricing, licensing, and release notes.

## Principles

- Keep builder content separate from theme presentation.
- Sanitize inputs and escape output at trust boundaries.
- Published customer websites must not be remotely disabled because of an entitlement change.
- Verify signed server-side payment notifications before granting future paid entitlements.
- Never commit payment secrets or customer data.
- Review current GPL and WordPress.org distribution rules before release.

## Status

The theme is implemented and syntax/ZIP checks pass. A live WordPress installation test remains outstanding. The Builder now supports draggable section, heading, text, button, and image blocks, Media Library image selection, responsive typography/spacing, undo/redo, and preview widths. Nested containers/columns, full-site editing, broad template library, licensing backend, and checkout are not yet complete. A live WordPress installation and interaction test remains outstanding.
