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
    "SELECT id, product_id, status, activation_limit, expires_at FROM licenses WHERE license_key_hash = ? AND customer_email_hash = ? AND product_id = ? LIMIT 1"
  ).bind(keyHash, emailHash, product).first() || null;
}
function licenceUsable(licence) {
  return Boolean(licence && licence.status === "active" &&
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
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "rss-prism-licensing", mode: "foundation" });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!env.DB) return json({ error: "Licence service is not configured." }, 503);
    const parsed = await readJson(request);
    if (parsed.error) return json({ error: parsed.error }, parsed.status);
    try {
      if (url.pathname === "/v1/license/verify") return await handleVerify(parsed.value, env);
      if (url.pathname === "/v1/license/activate") return await handleActivate(parsed.value, env);
      if (url.pathname === "/v1/license/deactivate") return await handleDeactivate(parsed.value, env);
      return json({ error: "Not found." }, 404);
    } catch { return json({ error: "Licence service temporarily unavailable." }, 503); }
  }
};
export { normaliseEmail, normaliseSite, sha256 };