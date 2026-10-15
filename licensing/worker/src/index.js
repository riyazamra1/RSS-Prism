const PRODUCT_ID = "rss-prism-premium";
const MAX_BODY_BYTES = 8192;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
function normaliseEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function normaliseSite(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host + url.pathname.replace(/\/+$/, "");
  } catch { return null; }
}
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
async function readJson(request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return { error: "Request is too large.", status: 413 };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return { error: "Request is too large.", status: 413 };
  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Invalid body");
    return { value };
  } catch { return { error: "Send a valid JSON object.", status: 400 }; }
}
function validInputs(body, requireSite = false) {
  const key = typeof body.license_key === "string" ? body.license_key.trim() : "";
  const email = normaliseEmail(body.email);
  const product = typeof body.product_id === "string" ? body.product_id : PRODUCT_ID;
  const site = requireSite ? normaliseSite(body.site_url) : null;
  if (!/^[A-Z0-9-]{16,128}$/i.test(key)) return { error: "Enter a valid licence key format." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid purchase email address." };
  if (product !== PRODUCT_ID) return { error: "This licence is not for the requested product." };
  if (requireSite && !site) return { error: "Enter a valid WordPress site URL." };
  return { key, email, site, product };
}
async function findLicence(db, key, email, product) {
  const keyHash = await sha256(key.toUpperCase());
  const emailHash = await sha256(email);
  return await db.prepare(
    "SELECT id, product_id, status, activation_limit, starts_at, expires_at FROM licenses WHERE license_key_hash = ? AND customer_email_hash = ? AND product_id = ? LIMIT 1"
  ).bind(keyHash, emailHash, product).first() || null;
}
function licenceUsable(licence) {
  return Boolean(licence && licence.status === "active" &&
    (!licence.starts_at || Date.parse(licence.starts_at) <= Date.now()) &&
    (!licence.expires_at || Date.parse(licence.expires_at) > Date.now()));
}
async function activationCount(db, licenceId) {
  const result = await db.prepare("SELECT COUNT(*) AS count FROM activations WHERE license_id = ?").bind(licenceId).first();
  return Number(result?.count || 0);
}
async function handleVerify(body, env) {
  const input = validInputs(body);
  if (input.error) return json({ valid: false, message: input.error }, 400);
  const licence = await findLicence(env.DB, input.key, input.email, input.product);
  if (!licenceUsable(licence)) return json({ valid: false, message: "Licence details could not be verified." }, 403);
  return json({
    valid: true, product_id: licence.product_id, status: licence.status,
    activation_limit: Number(licence.activation_limit),
    active_activations: await activationCount(env.DB, licence.id),
    valid_until: licence.expires_at || null
  });
}
async function handleActivate(body, env) {
  const input = validInputs(body, true);
  if (input.error) return json({ activated: false, message: input.error }, 400);
  const licence = await findLicence(env.DB, input.key, input.email, input.product);
  if (!licenceUsable(licence)) return json({ activated: false, message: "Licence details could not be verified." }, 403);
  const siteHash = await sha256(input.site);
  const now = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO activations (license_id, site_hash, created_at, last_seen_at) " +
    "SELECT ?, ?, ?, ? WHERE EXISTS (" +
      "SELECT 1 FROM licenses WHERE id = ? AND status = 'active' AND (expires_at IS NULL OR expires_at > ?) " +
      "AND (EXISTS (SELECT 1 FROM activations WHERE license_id = ? AND site_hash = ?) " +
      "OR (SELECT COUNT(*) FROM activations WHERE license_id = ?) < activation_limit)" +
    ") ON CONFLICT(license_id, site_hash) DO UPDATE SET last_seen_at = excluded.last_seen_at"
  ).bind(licence.id, siteHash, now, now, licence.id, now, licence.id, siteHash, licence.id).run();
  const activation = await env.DB.prepare(
    "SELECT 1 AS active FROM activations WHERE license_id = ? AND site_hash = ? LIMIT 1"
  ).bind(licence.id, siteHash).first();
  if (!activation) return json({
    activated: false, message: "This licence has reached its website activation limit.",
    activation_limit: Number(licence.activation_limit),
    active_activations: await activationCount(env.DB, licence.id)
  }, 409);
  return json({
    activated: true, product_id: licence.product_id,
    activation_limit: Number(licence.activation_limit),
    active_activations: await activationCount(env.DB, licence.id),
    valid_until: licence.expires_at || null
  });
}
async function handleDeactivate(body, env) {
  const input = validInputs(body, true);
  if (input.error) return json({ deactivated: false, message: input.error }, 400);
  const licence = await findLicence(env.DB, input.key, input.email, input.product);
  if (!licence) return json({ deactivated: false, message: "Licence details could not be verified." }, 403);
  const siteHash = await sha256(input.site);
  await env.DB.prepare("DELETE FROM activations WHERE license_id = ? AND site_hash = ?").bind(licence.id, siteHash).run();
  return json({ deactivated: true, active_activations: await activationCount(env.DB, licence.id) });
}

function timingSafeHexEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function verifyPaymentsSignature(secret, header, rawBody) {
  const parts = Object.fromEntries(String(header || "").split(",").map(part => {
    const i = part.indexOf("=");
    return i > 0 ? [part.slice(0, i).trim(), part.slice(i + 1).trim()] : ["", ""];
  }).filter(part => part[0]));
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || !parts.v1 || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(parts.t) + "." + rawBody));
  const expected = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
  return timingSafeHexEqual(expected, String(parts.v1).toLowerCase());
}
async function paymentsLkRequest(env, path, body, idempotencyKey) {
  if (!env.PAYMENTS_LK_SECRET_KEY) throw new Error("Payments.lk API key is not configured");
  const response = await fetch("https://api.payments.lk/v1" + path, {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.PAYMENTS_LK_SECRET_KEY,
      "content-type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(body)
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = {}; }
  if (!response.ok) throw new Error("Payments.lk checkout request failed (" + response.status + ")");
  return data?.data || data;
}
async function createPrismCheckout(body, env) {
  if (env.PRISM_PAID_CHECKOUT_ENABLED !== "true") return json({ error: "RSS Prism paid checkout is not enabled. The Free plan remains active." }, 403);
  if (!env.PAYMENTS_LK_SECRET_KEY || !env.PRISM_PAYMENT_SUCCESS_URL || !env.PRISM_PAYMENT_CANCEL_URL ||
      !env.RESEND_API_KEY || !env.PRISM_LICENSE_FROM_EMAIL || !env.PRISM_LICENSE_SIGNING_SECRET || !env.PRISM_TERMS_VERSION) {
    return json({ error: "Payments.lk checkout is not fully configured." }, 503);
  }
  const email = normaliseEmail(body.email);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid purchase email address." }, 400);
  const tier = body.license_tier;
  const tierConfig = tier === "single_site"
    ? { activationLimit: 1, price: Number(env.PRISM_SINGLE_SITE_PRICE_LKR) }
    : tier === "five_site" ? { activationLimit: 5, price: Number(env.PRISM_FIVE_SITE_PRICE_LKR) } : null;
  if (!tierConfig || !Number.isSafeInteger(tierConfig.price) || tierConfig.price <= 0) return json({ error: "That paid licence tier is not configured." }, 400);
  if (body.accept_terms !== true || String(body.terms_version || "") !== String(env.PRISM_TERMS_VERSION)) {
    return json({ error: "Please accept the current RSS Prism licence terms." }, 400);
  }
  const orderId = "prism_" + crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();
  const amountMinor = tierConfig.price * 100;
  if (!Number.isSafeInteger(amountMinor)) return json({ error: "Configured price is invalid." }, 503);
  await env.DB.prepare(
    "INSERT INTO orders (id, customer_email, customer_email_hash, product_id, license_tier, billing_interval, activation_limit, amount_minor, currency, payment_status, provider, terms_version, created_at) VALUES (?, ?, ?, ?, ?, 'annual', ?, ?, 'LKR', 'pending', 'payments_lk', ?, ?)"
  ).bind(orderId, email, await sha256(email), PRODUCT_ID, tier, tierConfig.activationLimit, amountMinor, String(env.PRISM_TERMS_VERSION), now).run();
  const checkout = await paymentsLkRequest(env, "/checkouts", {
    amountCents: amountMinor,
    currency: "LKR",
    description: "RSS Prism Premium — " + (tier === "single_site" ? "Single Site" : "Five Sites") + " — Annual",
    reference: orderId,
    successUrl: env.PRISM_PAYMENT_SUCCESS_URL,
    cancelUrl: env.PRISM_PAYMENT_CANCEL_URL
  }, orderId);
  const checkoutUrl = String(checkout.url || "");
  const checkoutId = String(checkout.id || "");
  if (!checkoutId || !/^https:\/\//i.test(checkoutUrl)) throw new Error("Payments.lk returned an invalid checkout response");
  await env.DB.prepare("UPDATE orders SET provider_session_id = ? WHERE id = ? AND payment_status = 'pending'").bind(checkoutId, orderId).run();
  return json({ ok: true, provider: "payments_lk", order_id: orderId, checkout_url: checkoutUrl, currency: "LKR", amount_lkr: tierConfig.price, license_tier: tier, billing_interval: "annual" }, 201);
}
async function sendPrismLicenseEmail(env, email, key, tier, expiresAt) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.PRISM_LICENSE_FROM_EMAIL,
      to: [email],
      subject: "Your RSS Prism Premium licence",
      text: "Thank you for purchasing RSS Prism Premium.\n\nLicence key: " + key + "\nLicence tier: " + tier + "\nValid until: " + expiresAt + "\n\nUse this key and the purchase email in RSS Prism Builder → Licence. Keep this key private.\n\nRazeen Secure Solution",
      html: "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto\"><h2>RSS Prism Premium</h2><p>Thank you for your purchase.</p><p><strong>Licence key</strong></p><p style=\"font-size:18px;word-break:break-all\">" + key + "</p><p>Tier: " + tier + "<br>Valid until: " + expiresAt + "</p><p>Enter this key and your purchase email in RSS Prism Builder → Licence.</p><p>Razeen Secure Solution</p></div>"
    })
  });
  if (!response.ok) throw new Error("Unable to deliver RSS Prism licence email (" + response.status + ")");
}
async function handlePaymentsWebhook(request, env) {
  if (!env.PAYMENTS_LK_WEBHOOK_SECRET || !env.PRISM_LICENSE_SIGNING_SECRET || !env.RESEND_API_KEY || !env.PRISM_LICENSE_FROM_EMAIL) {
    return json({ error: "Payments.lk webhook is not fully configured." }, 503);
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 65536) return json({ error: "Webhook payload is too large." }, 413);
  const signature = request.headers.get("Payments-Signature") || "";
  if (!(await verifyPaymentsSignature(env.PAYMENTS_LK_WEBHOOK_SECRET, signature, raw))) return json({ error: "Invalid webhook signature." }, 400);
  let event;
  try { event = JSON.parse(raw); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!event || typeof event.id !== "string" || typeof event.type !== "string") return json({ error: "Invalid event payload." }, 400);
  const headerEventId = request.headers.get("Payments-Event-Id");
  if (headerEventId && headerEventId !== event.id) return json({ error: "Event ID mismatch." }, 400);
  if (event.type === "test.ping") return json({ ok: true, received: true, event_id: event.id });
  if (event.type !== "payment.succeeded") return json({ ok: true, ignored: true, event_id: event.id });
  const payment = event?.data?.object;
  const expectedMode = String(env.PAYMENTS_LK_MODE || "test").toLowerCase();
  const actualMode = String(payment?.mode || event?.mode || "").toLowerCase();
  if (!payment || actualMode !== expectedMode) return json({ error: "Payment mode mismatch." }, 400);
  if (String(payment.status || "").toLowerCase() !== "succeeded" || !String(payment.id || "")) return json({ error: "Payment is not confirmed as succeeded." }, 400);
  const orderId = String(payment.reference || "");
  if (!/^prism_[a-f0-9]{32}$/i.test(orderId)) return json({ error: "Payment reference is invalid." }, 400);
  const order = await env.DB.prepare("SELECT id, customer_email, customer_email_hash, product_id, license_tier, activation_limit, amount_minor, currency, payment_status, provider_session_id FROM orders WHERE id = ? AND provider = 'payments_lk' LIMIT 1").bind(orderId).first();
  if (!order) return json({ error: "Payment order not found." }, 404);
  if (Number(payment.amountCents) !== Number(order.amount_minor) || String(payment.currency || "").toUpperCase() !== String(order.currency).toUpperCase()) {
    return json({ error: "Payment amount or currency mismatch." }, 400);
  }
  if (order.provider_session_id && String(payment.checkoutId || "") !== String(order.provider_session_id)) return json({ error: "Checkout reference mismatch." }, 400);
  if (!order.customer_email || !order.customer_email_hash) return json({ error: "Order customer details are missing." }, 503);
  if (!["pending", "paid"].includes(String(order.payment_status))) return json({ error: "Order is not payable." }, 409);
  await env.DB.prepare("INSERT INTO payment_webhook_events (provider, event_id, received_at, processing_status) VALUES ('payments_lk', ?, ?, 'received') ON CONFLICT(provider, event_id) DO NOTHING").bind(event.id, new Date().toISOString()).run();
  const existingEvent = await env.DB.prepare("SELECT processing_status FROM payment_webhook_events WHERE provider = 'payments_lk' AND event_id = ? LIMIT 1").bind(event.id).first();
  if (existingEvent?.processing_status === "processed") return json({ ok: true, duplicate: true, event_id: event.id });
  const signingKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.PRISM_LICENSE_SIGNING_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const keyBytes = new Uint8Array(await crypto.subtle.sign("HMAC", signingKey, new TextEncoder().encode("rss-prism-license:" + orderId)));
  const licenseKey = "RSSP-" + Array.from(keyBytes.slice(0, 20), byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 86400000).toISOString();
  await env.DB.prepare("UPDATE orders SET payment_status = 'paid', provider_payment_id = ?, paid_at = COALESCE(paid_at, ?) WHERE id = ? AND payment_status IN ('pending', 'paid')").bind(String(payment.id || ""), now, orderId).run();
  await env.DB.prepare(
    "INSERT INTO licenses (id, license_key_hash, customer_email_hash, product_id, license_tier, activation_limit, status, starts_at, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING"
  ).bind(orderId, await sha256(licenseKey), order.customer_email_hash, PRODUCT_ID, order.license_tier, Number(order.activation_limit), now, expiresAt, now, now).run();
  const savedLicense = await env.DB.prepare("SELECT expires_at FROM licenses WHERE id = ? LIMIT 1").bind(orderId).first();
  await sendPrismLicenseEmail(env, order.customer_email, licenseKey, order.license_tier, String(savedLicense?.expires_at || expiresAt));
  await env.DB.prepare("UPDATE payment_webhook_events SET processing_status = 'processed', processed_at = ? WHERE provider = 'payments_lk' AND event_id = ?").bind(new Date().toISOString(), event.id).run();
  return json({ ok: true, processed: true, event_id: event.id, order_id: orderId });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "rss-prism-licensing", mode: "foundation" });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!env.DB) return json({ error: "Licence service is not configured." }, 503);
    if (url.pathname === "/v1/payments/webhook") {
      try { return await handlePaymentsWebhook(request, env); }
      catch { return json({ error: "Payment webhook processing failed; provider may retry." }, 503); }
    }
    const parsed = await readJson(request);
    if (parsed.error) return json({ error: parsed.error }, parsed.status);
    try {
      if (url.pathname === "/v1/license/verify") return await handleVerify(parsed.value, env);
      if (url.pathname === "/v1/license/activate") return await handleActivate(parsed.value, env);
      if (url.pathname === "/v1/license/deactivate") return await handleDeactivate(parsed.value, env);
      if (url.pathname === "/v1/payments/checkout") return await createPrismCheckout(parsed.value, env);
      return json({ error: "Not found." }, 404);
    } catch { return json({ error: "Licence service temporarily unavailable." }, 503); }
  }
};
export { normaliseEmail, normaliseSite, sha256 };