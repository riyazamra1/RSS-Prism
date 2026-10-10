# RSS Prism licensing staging deployment

This deployment workflow requires access to the RSS Cloudflare account. It will not run automatically and it does not process payments or issue licences.

## 1. Create a Cloudflare D1 database

In Cloudflare, create a D1 database named \`rss-prism-licensing\`. Copy its database ID. Do not put customer data in this staging database.

## 2. Add GitHub Actions secrets

In the RSS-Prism repository, open **Settings → Secrets and variables → Actions** and add:

- \`CLOUDFLARE_API_TOKEN\`: a Cloudflare API token with permission to deploy Workers and manage the selected D1 database.
- \`CLOUDFLARE_ACCOUNT_ID\`: the account ID that owns the Worker and D1 database.
- \`RSS_PRISM_D1_DATABASE_ID\`: the database ID from step 1.

Prefer the \`rss-prism-staging\` GitHub environment and restrict who can run deployments. Never commit these values or paste them into source files.

## 3. Deploy to staging

1. Open the repository's **Actions** tab.
2. Select **Deploy RSS Prism Licensing Worker**.
3. Choose **Run workflow**.
4. Type exactly \`DEPLOY-STAGING\` in the confirmation field.
5. Run the workflow and wait for every step to pass.
6. Open the Worker URL printed by Wrangler and append \`/health\`. A successful response should include \`"ok":true\`.

The API endpoints are \`/v1/license/verify\`, \`/v1/license/activate\`, and \`/v1/license/deactivate\`. Until a licence is securely issued into D1, activation must deny access.

## 4. Install the Premium staging plugin

Download the artifact named \`rss-prism-premium-staging\` from the latest successful **RSS Prism Licensing Foundation** workflow run. The downloaded artifact is a ZIP containing \`rss-prism-premium-staging.zip\` and its SHA-256 checksum file.

In WordPress staging, go to **Plugins → Add New Plugin → Upload Plugin**, upload the inner plugin ZIP, activate it, then open **Settings → RSS Prism Licence**. Enter the HTTPS Worker URL, a valid issued licence key and the matching purchase email.

## What is not configured yet

This staging foundation does not contain a live checkout provider, verified payment webhook, secure paid-licence issuance process, email delivery, refund/renewal automation, customer account portal or production rate limiting. Do not sell licences or treat the service as production-ready until those are implemented and security-tested.