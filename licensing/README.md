# RSS Prism licensing foundation

This is the first implementation stage of the planned RSS Prism Premium licence service. It is **not a live checkout or production licence service yet**.

## Security rules

- A licence key is checked together with the normalised purchase email. The database stores SHA-256 hashes of the key and email, not the raw values.
- Verification fails unless both hashes match a licence for the requested product and the licence is active and in date.
- The API never issues licences. Future issuance must happen only after a verified payment-provider webhook or an authenticated operator workflow.
- Activation limits are checked by a database operation. The schema supports one-site and five-site annual licence tiers.
- Responses use Cache-Control: no-store. Cross-origin browser requests are not enabled.
- The separate WordPress Premium add-on must call this service server-to-server, fail closed for protected Premium features when it cannot verify entitlement, and never disable customer-published website content when a licence expires.
- Rate limiting, monitoring, operator authentication, secure licence issuance, email delivery, payment-provider signature verification, refund/renewal handling and production secrets still need implementation before launch.

## API foundation

The base URL is not configured until the Worker is deployed.

### GET /health

Returns a minimal health response without database details.

### POST /v1/license/verify

JSON fields: license_key, email, product_id (rss-prism-premium). On success, returns valid, product, status, active activation count, activation limit and validity date. A wrong key/email pair receives a generic denial.

### POST /v1/license/activate

Accepts the same fields plus site_url. A successful response registers the site and reports the current activation count. A sixth distinct site for a five-site licence is rejected. Re-activating the same site does not consume another slot.

### POST /v1/license/deactivate

Accepts the same fields plus site_url and removes that site's activation. The email must match even for deactivation.

## Database

Apply worker/schema.sql to a new Cloudflare D1 database. It creates tables for licence hashes, activations, orders and idempotent payment webhook event records. Do not insert test or customer data into production.

## Deployment checklist

1. Create the Cloudflare D1 database and set its real ID in wrangler.toml.
2. Apply schema.sql to the intended environment.
3. Configure the Worker route or workers.dev hostname.
4. Add Cloudflare rate limits/WAF rules and monitoring.
5. Add an authenticated, audited licence issuance process.
6. Select a payment provider and implement signed webhook verification with idempotent order processing.
7. Build and test the separate Premium add-on's activation UI and server-to-server client.
8. Test wrong email, unknown key, expired/revoked licence, duplicate activation, activation-limit races, deactivation, provider failure and email retry.
9. Deploy to staging and complete a security review before production.

## Important

The public RSS Prism plan catalogue remains Free-only. No price is configured, no checkout session can be created, and no licences are for sale through this foundation.