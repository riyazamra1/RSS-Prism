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
