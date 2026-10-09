# RSS Prism

RSS Prism is the WordPress design platform from Razeen Secure Solution (RSS): a lightweight theme, a visual page-builder plugin, and a reusable template library.

> Developing Ideas. Delivering Solutions.

## Product family
- **RSS Prism Theme** — free core theme with essential customization.
- **RSS Prism Builder** — visual editor plugin, designed to keep layouts independent of the active theme.
- **RSS Prism Studio** — free starter templates and paid template packs.
- **Premium plans** — premium features, updates, and support under the applicable license.

## Repository layout
- `products/rss-prism-theme/` — installable WordPress theme.
- `products/rss-prism-builder/` — installable plugin foundation.
- `config/pricing.php` — canonical PHP pricing catalog.
- `pricing/plans.json` — machine-readable public plan data.
- `docs/` — pricing, licensing, payment, and release notes.

## Proposed launch pricing

| Plan | USD | LKR | Billing | Production sites |
| --- | ---: | ---: | --- | --- |
| Free | $0 | LKR 0 | Free | Core free features |
| Personal | $59 | LKR 14,900 | Annual | 1 |
| Freelancer | $99 | LKR 24,900 | Annual | 5 |
| Agency | $199 | LKR 49,900 | Annual | Unlimited |
| Lifetime Personal | $199 | LKR 49,900 | One-time | 1 |

These are proposed launch prices, not live checkout prices. See [pricing policy](docs/PRICING.md).

## Principles
- Keep builder content separate from theme presentation.
- Sanitize inputs and escape output at trust boundaries.
- Subscription expiry must not remotely disable an already-published site.
- Verify signed server-side payment notifications before granting entitlements.
- Never commit payment secrets or customer data.
- Review current GPL and WordPress.org distribution rules before release.

## Status
Initial foundations only. Pricing data and starter theme/plugin scaffolding are present. The complete drag-and-drop builder, licensing backend, checkout, and template library remain unimplemented.
