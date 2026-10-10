=== RSS Prism Premium ===
Contributors: riyazamra1
Tags: rss-prism, premium, licence
Requires at least: 6.4
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Optional RSS Prism Premium add-on with an email-bound licence activation screen.

== Installation ==
1. Install and activate RSS Prism Builder first if you use its builder features.
2. Upload the rss-prism-premium.zip through Plugins > Add New Plugin > Upload Plugin.
3. Open Settings > RSS Prism Licence.
4. Enter the HTTPS URL of the deployed RSS Prism licensing Worker, the licence key, and the exact purchase email.
5. Select Activate on this website.

== Security ==
The server must already contain a licence issued after confirmed payment. This plugin does not create licences or accept payment. A mismatched email, invalid, expired, suspended or revoked licence must be rejected by the server. Protected Premium feature handlers must call rss_prism_premium_is_licensed() and must fail closed.

== Current release limitations ==
This is an activation UI and server-check integration foundation. It does not yet add paid builder modules, checkout, payment webhooks, automated licence issuance, customer portal or renewal emails. The official licence Worker must be deployed and configured before activation works. Do not use production customer data during staging tests.