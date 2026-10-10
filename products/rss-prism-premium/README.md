# RSS Prism Premium add-on (staging foundation)

This installable WordPress plugin adds a licence screen at **Settings → RSS Prism Licence**.

It submits the licence key and purchase email to the official RSS Prism licensing API over HTTPS. Activation is only successful when that server already has an active licence matching both the key and the email. The API URL must be deployed first; there is no demo bypass and this plugin does not mint licences.

## Build a ZIP
From the repository root:
\`\`\`sh
cd products
zip -r rss-prism-premium.zip rss-prism-premium
\`\`\`

## Current limitations
This foundation does not implement checkout/payment processing or issue licences. The API's Cloudflare D1 database must be provisioned and deployed, and an authenticated issuance process must be implemented before a real purchased key can activate. Do not call this production-ready until webhook verification, operator controls, rate limiting and security review are complete.