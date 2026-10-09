# RSS Prism pricing and entitlement policy

**Status:** Proposed launch pricing. Do not enable checkout until prices, tax treatment, terms, and payment-provider onboarding are confirmed.

| Plan | USD | LKR | Billing | Production sites |
| --- | ---: | ---: | --- | --- |
| Free | $0 | LKR 0 | Free | Core free features |
| Personal | $59 | LKR 14,900 | Annual | 1 |
| Freelancer | $99 | LKR 24,900 | Annual | 5 |
| Agency | $199 | LKR 49,900 | Annual | Unlimited |
| Lifetime Personal | $199 | LKR 49,900 | One-time | 1 |

LKR values are deliberate proposed launch prices, not live currency conversions.

## Product boundaries
- Free theme: useful installable core theme and essential customization.
- Premium theme: additional design options and premium patterns.
- RSS Prism Builder: separately packaged plugin; page layout data should remain available when changing themes.
- RSS Prism Studio: free starter templates plus paid template packs.
- Paid plans govern entitlements such as premium downloads, update services, support, and activation limits, as precisely defined in the license.

## Subscription lifecycle
1. Create a pending order server-side.
2. Redirect to the provider's hosted checkout.
3. Verify the signed server-to-server payment notification.
4. Process provider events idempotently and record an audit event.
5. Grant or update entitlement only after verification.
6. Handle renewals, failed payments, cancellation, refunds, and chargebacks.
7. After a disclosed grace period, stop premium update/support entitlement on expiry. Never remotely disable a customer's published site.

## Activations
- Support activation, deactivation, and transfers.
- Enforce site counts server-side for valid licenses.
- Define staging/development-site rules in license terms.
- Agency unlimited sites is represented by `-1`.
- Lifetime Personal covers one production site; it is not an unlimited-site plan.
- State lifetime support and update coverage separately.

## Payment integration
Design a provider-independent interface. PayHere can be evaluated first for Sri Lankan payments, but merchant eligibility, international acceptance, settlement, refunds, and recurring billing must be confirmed with the provider before launch. Do not advertise recurring billing unless the selected merchant account supports it.

Use hosted checkout, keep credentials server-side, validate signatures and order amounts/currency, verify order IDs, reject replayed events, and record lifecycle events. A successful browser redirect is not proof of payment.

## Distribution and licensing
Review current WordPress.org theme/plugin guidelines and GPL compatibility before release. Keep plugin-type functionality in the plugin rather than the theme. Do not distribute trialware or use directory-hosted packages to impose premium-code restrictions that violate directory rules.
