# RSS Prism Premium licence security

## Required rule

A licence key is not sufficient on its own. RSS Prism must verify licence key + purchase email + product + status + validity on the official RSS licence service, not only in browser JavaScript or a WordPress option.

## Grant access only when all checks pass

- The key exists and belongs to the requested RSS Prism product.
- The normalised email hash matches the email hash recorded for that licence.
- Payment was confirmed by a trusted, verified server-side payment notification before issuance.
- The licence is active, within its validity period, and not suspended, revoked or refunded.
- The activation count is within the server-side limit.
- The site is registered as an activation for that licence.

For the planned annual five-site licence, no more than five distinct site identities may be active at once. Duplicate activation of the same site must not use an extra slot.

## Failure behaviour

Wrong email, invalid key, expired licence, revoked licence or unsupported product: deny activation and do not expose licence details.

Failed or pending payment: do not issue a licence.

Payment webhook replay: process an event once using its provider event ID and a unique database constraint.

Licence service unavailable: do not grant new activations or enable protected Premium functionality based on an unverified key. Keep already-published website content working; licensing must not remotely break the customer's public website.

## Privacy

Store hashes of licence keys and normalised purchase email addresses for verification. Keep customer contact details needed for receipts in a separate order/customer system with access controls and a retention policy. Do not log raw licence keys, purchase emails, payment details or full request bodies. Site identity hashes are used for activation counting.

## Limitations

No client-side or WordPress-only licensing system can guarantee that modified local PHP code will never bypass a local feature gate. Keep valuable hosted services server-side, minimise sensitive data in the plugin, and test the separate Premium add-on against tampering. Do not promise absolute anti-piracy protection.

## Current implementation status

The Worker API and D1 schema are a foundation only. Checkout, payment-provider verification, licence issuance, email delivery, admin tools, Premium add-on integration, rate limiting, deployment and live security tests are not yet complete. The public product catalogue remains Free-only.