# RSS Prism

RSS Prism is the WordPress design platform from Razeen Secure Solution (RSS).

> Developing Ideas. Delivering Solutions.

## Current release

**RSS Prism Theme 1.0.0** is the installable multipurpose theme in `products/rss-prism-theme/`. It includes a customizable homepage, responsive navigation, colour and width controls, header/footer options, grid/list archive layouts, widget areas, and templates for pages, posts, archives, search, comments, and 404 pages.

## Product family

- **RSS Prism Theme** — free, installable multipurpose WordPress theme.
- **RSS Prism Builder** — a separate visual layout-builder plugin foundation.
- **RSS Prism Studio** — planned template library.

Only the Free plan is currently offered. Paid prices and plans are not active and are not displayed by the public pricing shortcode. Historical proposed prices are kept separately in `pricing/archived-proposals.json` for internal reference only; they are not offers or checkout prices.

## Repository layout

- `products/rss-prism-theme/` — installable WordPress theme.
- `products/rss-prism-builder/` — installable plugin foundation.
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

The theme is implemented and syntax/ZIP checks pass. A live WordPress installation test remains outstanding. The Builder has an initial visual layout editor and template foundation; a complete drag-and-drop page-builder product, template library, licensing backend, and checkout are not yet complete.
