import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

import worker from "./licensing/worker/src/index.js";
import { createD1Mock } from "./lib/d1-mock.js";
import {
  sanitizeLayout,
  renderCanvasHtml,
  defaultStarterLayout,
  sanitizeHexColor,
  sanitizeKey,
  sanitizeUrl
} from "./lib/builder-renderer.js";
import {
  templates,
  pages,
  allocateId,
  studioState,
  licenseConsoleState
} from "./lib/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const d1Mock = createD1Mock();

const plansCatalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, "pricing", "plans.json"), "utf8")
);

const STUDIO_LABELS = {
  brand: "Logo & site identity",
  menu: "Navigation menu",
  button: "Call-to-action button",
  search: "Search form",
  social: "Social links",
  description: "Footer description",
  widgets: "Footer widgets",
  copyright: "Copyright",
  credit: "RSS Prism credit"
};

const ALLOWED_HEADER_ELEMENTS = new Set(["brand", "menu", "button", "search", "social"]);
const ALLOWED_FOOTER_ELEMENTS = new Set(["brand", "description", "menu", "widgets", "social", "copyright", "credit"]);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets & React 18 UMD vendor files for builder.js
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));
app.use("/vendor/react", express.static(path.join(__dirname, "node_modules", "react", "umd")));
app.use("/vendor/react-dom", express.static(path.join(__dirname, "node_modules", "react-dom", "umd")));

const ALLOWED_DOWNLOADS = new Set(["rss-prism-theme.zip", "rss-prism-builder.zip"]);
app.get("/downloads/:filename", (req, res) => {
  const filename = String(req.params.filename || "");
  if (!ALLOWED_DOWNLOADS.has(filename)) {
    return res.status(404).send("Package not found.");
  }
  const filePath = path.join(__dirname, "dist", filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Package has not been built yet.");
  }
  res.download(filePath, filename);
});

// Licensing Worker API routes — must read raw body for webhook HMAC verification
app.use(["/health", "/v1/license", "/v1/payments"], express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
  try {
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${PORT}`;
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const webRequest = new Request(fullUrl, {
      method: req.method,
      headers,
      body: hasBody && Buffer.isBuffer(req.body) ? req.body : undefined
    });
    const workerEnv = {
      DB: d1Mock,
      PAYMENTS_LK_SECRET_KEY: process.env.PAYMENTS_LK_SECRET_KEY,
      PAYMENTS_LK_WEBHOOK_SECRET: process.env.PAYMENTS_LK_WEBHOOK_SECRET,
      PAYMENTS_LK_MODE: process.env.PAYMENTS_LK_MODE || "test",
      PRISM_PAID_CHECKOUT_ENABLED: process.env.PRISM_PAID_CHECKOUT_ENABLED || "false",
      PRISM_SINGLE_SITE_PRICE_LKR: process.env.PRISM_SINGLE_SITE_PRICE_LKR,
      PRISM_FIVE_SITE_PRICE_LKR: process.env.PRISM_FIVE_SITE_PRICE_LKR,
      PRISM_PAYMENT_SUCCESS_URL: process.env.PRISM_PAYMENT_SUCCESS_URL,
      PRISM_PAYMENT_CANCEL_URL: process.env.PRISM_PAYMENT_CANCEL_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      PRISM_LICENSE_FROM_EMAIL: process.env.PRISM_LICENSE_FROM_EMAIL,
      PRISM_LICENSE_SIGNING_SECRET: process.env.PRISM_LICENSE_SIGNING_SECRET,
      PRISM_TERMS_VERSION: process.env.PRISM_TERMS_VERSION || "2026-10"
    };
    const webResponse = await worker.fetch(webRequest, workerEnv);
    res.status(webResponse.status);
    webResponse.headers.forEach((val, key) => res.setHeader(key, val));
    const text = await webResponse.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: "Licensing service error." });
  }
});

app.use(express.json({ limit: "1048576" }));
app.use(express.urlencoded({ extended: true, limit: "1048576" }));

function viewLocals(req, activeRoute) {
  return {
    activeRoute,
    isPreview: req.query.rp_studio_preview === "1",
    studio: studioState,
    customizer: studioState.customizer,
    plansCatalog
  };
}

// 1. RSS Prism Theme Front Page
app.get("/", (req, res) => {
  const searchQuery = String(req.query.s || "").trim();
  const allPages = Array.from(pages.values()).sort((a, b) => b.id - a.id);
  const matchingPages = searchQuery
    ? allPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  res.render("front-page", {
    ...viewLocals(req, "home"),
    searchQuery,
    matchingPages,
    publishedPages: allPages.slice(0, 6)
  });
});

// 2. RSS Prism Studio (Header & Footer Builder + Customizer)
app.get("/studio", (req, res) => {
  res.render("studio", {
    ...viewLocals(req, "studio"),
    labels: STUDIO_LABELS,
    saved: req.query.rp_studio_saved === "1"
  });
});

function normalizeStudioRows(raw, allowedSet, isFooter) {
  const rows = [];
  const seen = new Set();
  for (let i = 0; i < 3; i++) {
    const items = Array.isArray(raw?.[i]) ? raw[i] : [];
    const clean = [];
    for (const entry of items) {
      const key = sanitizeKey(entry);
      if (allowedSet.has(key) && !seen.has(key)) {
        seen.add(key);
        clean.push(key);
      }
    }
    rows.push(clean);
  }
  if (isFooter) {
    for (let i = 0; i < 3; i++) {
      rows[i] = rows[i].filter(x => x !== "credit");
    }
    rows[2].push("credit");
  }
  return rows;
}

app.post("/studio/save", (req, res) => {
  try {
    const headerRaw = JSON.parse(String(req.body.rss_prism_header_rows_json || "[]"));
    studioState.headerRows = normalizeStudioRows(headerRaw, ALLOWED_HEADER_ELEMENTS, false);
  } catch { /* keep existing */ }
  try {
    const footerRaw = JSON.parse(String(req.body.rss_prism_footer_rows_json || "[]"));
    studioState.footerRows = normalizeStudioRows(footerRaw, ALLOWED_FOOTER_ELEMENTS, true);
  } catch { /* keep existing */ }

  if (typeof req.body.rss_prism_header_button_label === "string") {
    studioState.headerButtonLabel = req.body.rss_prism_header_button_label.trim().slice(0, 60);
  }
  if (typeof req.body.rss_prism_header_button_url === "string") {
    studioState.headerButtonUrl = sanitizeUrl(req.body.rss_prism_header_button_url) || "/#contact";
  }
  if (typeof req.body.rss_prism_social_url === "string") {
    studioState.socialUrl = sanitizeUrl(req.body.rss_prism_social_url);
  }

  const c = studioState.customizer;
  const accent = sanitizeHexColor(req.body.accentColor);
  if (accent) c.accentColor = accent;
  const bg = sanitizeHexColor(req.body.backgroundColor);
  if (bg) c.backgroundColor = bg;
  const width = Number.parseInt(req.body.contentWidth, 10);
  if (Number.isFinite(width)) c.contentWidth = Math.min(1600, Math.max(720, width));
  if (["standard", "centered", "dark"].includes(req.body.headerStyle)) c.headerStyle = req.body.headerStyle;
  if (["light", "dark", "accent"].includes(req.body.footerStyle)) c.footerStyle = req.body.footerStyle;
  if (["pill", "soft", "square"].includes(req.body.buttonShape)) c.buttonShape = req.body.buttonShape;
  if (typeof req.body.heroTitle === "string" && req.body.heroTitle.trim()) {
    c.heroTitle = req.body.heroTitle.trim().slice(0, 140);
  }

  res.redirect("/studio?rp_studio_saved=1");
});

// 3. RSS Prism Visual Builder (Divi-style)
app.get("/builder", (req, res) => {
  if (req.query.new_template === "1") {
    const newId = allocateId();
    templates.set(newId, {
      id: newId,
      title: `New Prism Page #${newId}`,
      status: "draft",
      modifiedAt: new Date().toISOString(),
      layout: defaultStarterLayout()
    });
    return res.redirect(`/builder?post_id=${newId}`);
  }

  const templateSearch = String(req.query.template_search || "").trim();
  const allTemplates = Array.from(templates.values()).sort(
    (a, b) => Date.parse(b.modifiedAt) - Date.parse(a.modifiedAt)
  );
  const templatesList = templateSearch
    ? allTemplates.filter(t => t.title.toLowerCase().includes(templateSearch.toLowerCase()))
    : allTemplates;

  const requestedId = Number.parseInt(req.query.post_id, 10);
  let selected = Number.isFinite(requestedId) ? templates.get(requestedId) : null;
  if (!selected && templatesList.length > 0 && !templateSearch) {
    selected = templatesList[0];
  } else if (!selected && templatesList.length > 0) {
    selected = templatesList[0];
  }

  res.render("builder", {
    ...viewLocals(req, "builder"),
    templateSearch,
    templatesList,
    selected
  });
});

// Builder REST Endpoints
app.post("/wp-json/rss-prism/v1/layout", (req, res) => {
  const postId = Number.parseInt(req.body?.post_id, 10);
  const tpl = templates.get(postId);
  if (!tpl) {
    return res.status(404).json({ saved: false, message: "Choose a valid Prism template first." });
  }
  const result = sanitizeLayout(req.body?.layout);
  if (result.error) {
    return res.status(result.status || 400).json({ saved: false, message: result.error });
  }
  tpl.layout = result.layout;
  tpl.modifiedAt = new Date().toISOString();
  res.json({ saved: true, post_id: postId, count: result.layout.length });
});

app.post("/wp-json/rss-prism/v1/template-copy", (req, res) => {
  const sourceId = Number.parseInt(req.body?.post_id, 10);
  const source = templates.get(sourceId);
  if (!source) {
    return res.status(403).json({ created: false, message: "Choose a valid template to copy." });
  }
  const title = String(req.body?.title || "").trim().slice(0, 120);
  if (!title) {
    return res.status(400).json({ created: false, message: "Enter a name for the new template." });
  }
  const result = sanitizeLayout(req.body?.layout);
  if (result.error) {
    return res.status(result.status || 400).json({ created: false, message: result.error });
  }
  const newId = allocateId();
  templates.set(newId, {
    id: newId,
    title,
    status: "draft",
    modifiedAt: new Date().toISOString(),
    layout: result.layout
  });
  res.json({ created: true, post_id: newId, edit_url: `/builder?post_id=${newId}` });
});

app.post("/wp-json/rss-prism/v1/publish-page", (req, res) => {
  const templateId = Number.parseInt(req.body?.post_id, 10);
  const tpl = templates.get(templateId);
  if (!tpl) {
    return res.status(404).json({ created: false, message: "Choose a valid Prism template first." });
  }
  const pageTitle = String(req.body?.page_title || "").trim().slice(0, 120);
  if (!pageTitle) {
    return res.status(400).json({ created: false, message: "Enter a title for the page." });
  }
  const result = sanitizeLayout(req.body?.layout);
  if (result.error) {
    return res.status(result.status || 400).json({ created: false, message: result.error });
  }
  tpl.layout = result.layout;
  tpl.status = "publish";
  tpl.modifiedAt = new Date().toISOString();

  const pageId = allocateId();
  pages.set(pageId, {
    id: pageId,
    title: pageTitle,
    status: "publish",
    templateId,
    createdAt: new Date().toISOString()
  });

  res.json({
    created: true,
    page_id: pageId,
    page_title: pageTitle,
    edit_url: `/pages/${pageId}`,
    preview_url: `/pages/${pageId}`,
    message: "Page created and published."
  });
});

// 4. Pages & Shortcode Renderer
app.get("/pages", (req, res) => {
  const previewTemplateId = Number.parseInt(req.query.template_id, 10);
  const previewTemplate = Number.isFinite(previewTemplateId) ? templates.get(previewTemplateId) : null;
  const previewHtml = previewTemplate ? renderCanvasHtml(previewTemplate.layout) : "";

  res.render("pages-list", {
    ...viewLocals(req, "pages"),
    pagesList: Array.from(pages.values()).sort((a, b) => b.id - a.id),
    templatesList: Array.from(templates.values()).sort((a, b) => b.id - a.id),
    previewTemplate,
    previewHtml
  });
});

app.get("/pages/:id", (req, res) => {
  const pageId = Number.parseInt(req.params.id, 10);
  const page = pages.get(pageId);
  if (!page) {
    return res.status(404).send("Page not found. <a href='/pages'>Back to pages</a>");
  }
  const tpl = templates.get(page.templateId);
  const renderedHtml = tpl ? renderCanvasHtml(tpl.layout) : "<p>Template layout not found.</p>";
  res.render("page", {
    ...viewLocals(req, "pages"),
    page,
    renderedHtml
  });
});

// 5. Welcome & Roadmap
app.get("/welcome", (req, res) => {
  res.render("welcome", viewLocals(req, "welcome"));
});

// 6. Licensing & Public Pricing
const STATUS_LABELS = {
  not_configured: "Not configured",
  active: "Activated",
  verified: "Verified (not activated on this site)",
  deactivated: "Deactivated",
  invalid: "Not valid",
  error: "Needs attention"
};

app.get(["/licensing", "/pricing"], (req, res) => {
  const host = req.get("host") || `localhost:${PORT}`;
  const siteUrl = `${req.protocol || "http"}://${host}/`;
  res.render("licensing", {
    ...viewLocals(req, "licensing"),
    licenseState: licenseConsoleState,
    statusLabels: STATUS_LABELS,
    siteUrl,
    noticeMessage: req.query.notice === "1" ? licenseConsoleState.message : ""
  });
});

app.post("/licensing/action", async (req, res) => {
  const action = sanitizeKey(req.body.rss_prism_action);
  const licenseKey = String(req.body.license_key || "").trim().toUpperCase();
  const email = String(req.body.email || "").trim().toLowerCase();
  const siteUrl = sanitizeUrl(req.body.site_url) || `http://localhost:${PORT}/`;

  licenseConsoleState.licenseKey = licenseKey;
  licenseConsoleState.email = email;

  if (!["activate", "verify", "deactivate"].includes(action)) {
    licenseConsoleState.status = "error";
    licenseConsoleState.message = "Unknown licence action.";
    return res.redirect("/licensing?notice=1");
  }

  try {
    const endpoint = `/v1/license/${action}`;
    const payload = {
      license_key: licenseKey,
      email,
      product_id: "rss-prism-premium",
      ...(action !== "verify" ? { site_url: siteUrl } : {})
    };
    const webRequest = new Request(`http://127.0.0.1:${PORT}${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const webRes = await worker.fetch(webRequest, { DB: d1Mock });
    const data = await webRes.json();

    if (!webRes.ok) {
      licenseConsoleState.status = "invalid";
      licenseConsoleState.message = data.message || "The licence was not accepted.";
      if (action !== "deactivate") {
        licenseConsoleState.activationLimit = 0;
        licenseConsoleState.activeActivations = 0;
        licenseConsoleState.validUntil = "";
      }
    } else if (action === "deactivate") {
      licenseConsoleState.status = "deactivated";
      licenseConsoleState.message = "This website has been deactivated for this licence.";
      licenseConsoleState.activeActivations = Number(data.active_activations || 0);
    } else {
      const ok = Boolean(data.activated || data.valid);
      licenseConsoleState.status = ok ? (action === "activate" ? "active" : "verified") : "invalid";
      licenseConsoleState.message = ok ? "Licence verified by the RSS Prism server." : "The RSS Prism server did not approve this licence.";
      licenseConsoleState.activationLimit = Number(data.activation_limit || 0);
      licenseConsoleState.activeActivations = Number(data.active_activations || 0);
      licenseConsoleState.validUntil = data.valid_until || "";
    }
  } catch {
    licenseConsoleState.status = "error";
    licenseConsoleState.message = "The licensing service could not be reached.";
  }

  res.redirect("/licensing?notice=1");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`RSS Prism server listening on http://0.0.0.0:${PORT}`);
});
