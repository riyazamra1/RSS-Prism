# RSS Prism Payments.lk integration

This integration is intentionally disabled until an operator explicitly enables paid checkout. The public RSS Prism catalog remains Free-only until prices, terms, and payment delivery are configured and reviewed.

## Routes

- `POST /v1/payments/checkout` — creates an annual single-site or five-site checkout.
- `POST /v1/payments/webhook` — validates the timestamped HMAC signature from `Payments-Signature` and fulfils only a matching `payment.succeeded` event.
- `GET /health` — health check.

The webhook checks payment mode, successful status, order reference, checkout ID, amount, and currency. Webhook events are idempotent. Licence keys are deterministically derived from the order ID using a dedicated signing secret, so delivery can be retried without storing the raw key in D1. The purchase email is stored on the order so the verified webhook can deliver the licence.

## D1 migration

Apply the existing `schema.sql` first for a new database. For an existing database created from the current schema, apply:

```sh
npx wrangler d1 execute rss-prism-licensing --remote --file=licensing/worker/migrations/0002_payments_lk_customer_email.sql
```

Use the actual D1 database name configured for the deployment if it differs. Run the migration once.

## Staging deployment

The GitHub Actions workflow deploys only to the separate `rss-prism-licensing-staging` Worker and its separate D1 database. It must not be pointed at the production database.

Before running **Deploy RSS Prism Licensing Worker**, configure these GitHub Actions secrets in the repository (or the workflow's `rss-prism-staging` environment):

- `CLOUDFLARE_API_TOKEN` — token with Workers Scripts and D1 edit permissions for the intended account.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.
- `RSS_PRISM_D1_DATABASE_ID` — ID of the dedicated staging D1 database named `rss-prism-licensing-staging`.

Create the staging D1 database first and ensure its name matches the Wrangler staging binding. The workflow requires typing `DEPLOY-STAGING` to proceed. This deploys code/schema only; it does not configure payment secrets or enable checkout.

After deployment, add the following **Worker secrets** in Cloudflare for the staging Worker only: `PAYMENTS_LK_SECRET_KEY` (must start with `sk_test_`), `PAYMENTS_LK_WEBHOOK_SECRET`, `PRISM_LICENSE_SIGNING_SECRET`, and `RESEND_API_KEY`. Set staging Worker variables: `PAYMENTS_LK_MODE=test`, `PRISM_PAID_CHECKOUT_ENABLED=false` initially, approved test `PRISM_SINGLE_SITE_PRICE_LKR` and `PRISM_FIVE_SITE_PRICE_LKR`, `PRISM_TERMS_VERSION`, HTTPS success/cancel URLs, and `PRISM_LICENSE_FROM_EMAIL`. Configure a test-mode webhook in the Payments.lk dashboard targeting the staging Worker's `/v1/payments/webhook` route. Do not paste secret values into GitHub source, issues, or chat.

## Required configuration

Configure these as Worker secrets or non-secret variables in the Cloudflare dashboard / Wrangler environment. Do not commit secret values.

Secrets:
- `PAYMENTS_LK_SECRET_KEY` — Payments.lk sandbox API secret initially.
- `PAYMENTS_LK_WEBHOOK_SECRET` — webhook signing secret.
- `PRISM_LICENSE_SIGNING_SECRET` — a strong, independent random secret used to derive licence keys.
- `RESEND_API_KEY` — transactional email delivery.

Variables:
- `PAYMENTS_LK_MODE=test` — sandbox-only mode until a separate production review.
- `PRISM_PAID_CHECKOUT_ENABLED=false` — must remain false while RSS Prism offers Free-only.
- `PRISM_SINGLE_SITE_PRICE_LKR` — approved annual single-site price, whole LKR.
- `PRISM_FIVE_SITE_PRICE_LKR` — approved annual five-site price, whole LKR.
- `PRISM_TERMS_VERSION` — current terms version; the checkout request must match it.
- `PRISM_PAYMENT_SUCCESS_URL` and `PRISM_PAYMENT_CANCEL_URL` — reviewed HTTPS return URLs.
- `PRISM_LICENSE_FROM_EMAIL` — verified sender address for licence delivery.

The checkout code converts whole-LKR configured prices to the provider's `amountCents` minor-unit integer by multiplying by 100. Confirm the Payments.lk sandbox's LKR amount convention before enabling paid checkout.

## Activation checklist

1. Keep `PRISM_PAID_CHECKOUT_ENABLED=false` and do not publish paid pricing until prices and terms are approved.
2. Apply the migration and configure sandbox secrets/variables.
3. Point the Payments.lk sandbox webhook to `/v1/payments/webhook`.
4. Verify a sandbox checkout, a correctly signed successful payment, amount/currency mismatch rejection, invalid-signature rejection, duplicate event handling, and licence email delivery.
5. Confirm the Builder accepts the issued key and enforces the selected site activation limit.
6. Only enable paid checkout after the end-to-end tests and pricing/catalog update are explicitly approved.
