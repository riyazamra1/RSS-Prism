# RSS Prism pricing and entitlement policy

**Current public offering: Free only.** RSS Prism currently has no active paid plans, checkout, subscriptions, or paid entitlements. Do not show proposed prices on public pages or describe historical proposals as available offers.

## Current Free plan

- Installable RSS Prism multipurpose theme.
- Theme colour, content-width, header, footer, and archive-layout settings.
- Responsive homepage and core WordPress templates.
- RSS Prism Builder foundation, distributed separately.

## Archived proposals

Historical paid-plan proposals have been moved to `pricing/archived-proposals.json` for internal reference. They are inactive, are not included in the current catalog, and must not be rendered by the public pricing shortcode or treated as checkout prices. Do not reactivate them without explicit approval and a reviewed licensing/payment implementation.

## Future payment requirements

Before any paid plan is enabled:
1. Confirm plan names, prices, currency, tax treatment, terms, and provider eligibility.
2. Use hosted checkout and keep payment credentials server-side.
3. Verify signed server-to-server payment notifications, order ID, amount, and currency.
4. Process provider events idempotently and record an audit event.
5. Handle renewals, failed payments, cancellations, refunds, and chargebacks.
6. Never remotely disable a customer's published website because an entitlement expires.

## Distribution and licensing

Review current WordPress.org theme/plugin guidelines and GPL compatibility before release. Keep plugin-type functionality in the plugin rather than the theme.
