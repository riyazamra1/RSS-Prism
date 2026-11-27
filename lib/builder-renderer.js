import crypto from "node:crypto";

const ALLOWED_TOP_LEVEL = new Set([
  // Layout & Structure (6)
  "section", "columns", "container", "divider", "spacer", "sidebar",
  // Core Content (14)
  "heading", "text", "button", "blurb", "callout", "quote", "pricing_table",
  "testimonial", "icon_list", "person", "icon", "code", "breadcrumbs", "post_content",
  // Interactive & Dynamic (13)
  "accordion", "toggle", "tabs", "number_counter", "bar_counter", "circle_counter",
  "countdown", "contact_form", "email_optin", "login", "search", "social_follow", "comments",
  // Media & Visual (7)
  "image", "gallery", "video", "video_slider", "audio", "map", "before_after",
  // Sliders, Posts, Portfolio & Navigation (8)
  "slider", "blog", "portfolio", "filterable_portfolio", "post_title",
  "post_navigation", "post_slider", "menu",
  // Fullwidth Divi Modules (8)
  "fullwidth_header", "fullwidth_slider", "fullwidth_image", "fullwidth_map",
  "fullwidth_menu", "fullwidth_portfolio", "fullwidth_post_slider", "fullwidth_code",
  // WooCommerce Modules (4)
  "shop", "woo_product", "woo_cart", "woo_checkout"
]);

const ALLOWED_COLUMN_CHILD = new Set(["heading", "text", "button", "image"]);
const ALLOWED_ALIGN = new Set(["left", "center", "right"]);
const ALLOWED_COLUMN_LAYOUTS = new Set(["50-50", "33-33-33", "66-33", "33-66", "100"]);
const ALLOWED_ANIMATIONS = new Set(["none", "fade", "slide-up", "slide-down", "slide-left", "slide-right", "zoom", "bounce", "flip"]);
const ALLOWED_SHADOWS = new Set(["none", "subtle", "elevated", "deep", "glow"]);
const ALLOWED_BORDER_STYLES = new Set(["solid", "dashed", "dotted"]);
const ALLOWED_TRANSFORMS = new Set(["none", "uppercase", "capitalize"]);
const ALLOWED_CODE_LANGS = new Set(["html", "css", "js", "json", "bash", "text"]);
const ALLOWED_ICON_SHAPES = new Set(["circle", "square", "none"]);

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeKey(val, fallback = "") {
  const cleaned = String(val ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return cleaned || fallback;
}

export function sanitizeHtmlClass(val, fallback = "") {
  const cleaned = String(val ?? "").replace(/[^A-Za-z0-9_-]/g, "");
  return cleaned || fallback;
}

export function sanitizeHexColor(val, fallback = "") {
  if (typeof val !== "string") return fallback;
  const trimmed = val.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed.toLowerCase();
  return fallback;
}

export function sanitizeUrl(val) {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("data:image/svg+xml")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (["http:", "https:", "mailto:", "tel:"].includes(u.protocol)) {
      return u.toString();
    }
  } catch {
    return "";
  }
  return "";
}

function clampInt(val, min, max, fallback) {
  const n = Number.parseInt(val, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampFloat(val, min, max, fallback) {
  const n = Number.parseFloat(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitizeResponsive(responsive, item) {
  const clean = {};
  const srcObj = responsive && typeof responsive === "object" ? responsive : {};
  for (const device of ["desktop", "tablet", "mobile"]) {
    const source = srcObj[device] && typeof srcObj[device] === "object" ? srcObj[device] : {};
    const rawAlign = source.align || item.align || "left";
    clean[device] = {
      font_size: clampInt(source.font_size ?? item.font_size, 10, 96, 16),
      padding: clampInt(source.padding ?? item.padding, 0, 200, 24),
      align: ALLOWED_ALIGN.has(rawAlign) ? rawAlign : "left"
    };
  }
  return clean;
}

function sanitizeColumnElements(columnElements, legacyContents, count) {
  const clean = [];
  const legacy = Array.isArray(legacyContents) ? legacyContents : [];
  for (let col = 0; col < count; col++) {
    let source = Array.isArray(columnElements) && Array.isArray(columnElements[col]) ? columnElements[col] : [];
    if (source.length === 0 && typeof legacy[col] === "string" && legacy[col] !== "") {
      source = [{ type: "text", text: legacy[col] }];
    }
    const colItems = [];
    for (const child of source.slice(0, 12)) {
      if (!child || typeof child !== "object" || !ALLOWED_COLUMN_CHILD.has(child.type)) continue;
      colItems.push({
        id: sanitizeKey(child.id) || crypto.randomUUID(),
        type: sanitizeKey(child.type),
        text: String(child.text ?? "").slice(0, 10000),
        url: sanitizeUrl(child.url),
        image_url: sanitizeUrl(child.image_url),
        alt: String(child.alt ?? "").slice(0, 500),
        image_fit: child.image_fit === "contain" ? "contain" : "cover"
      });
    }
    clean.push(colItems);
  }
  return clean;
}

function sanitizeContainerElements(children, depth = 0) {
  if (!Array.isArray(children)) return [];
  const allowed = new Set(["heading", "text", "button", "image"]);
  if (depth < 2) allowed.add("container");
  const clean = [];
  for (const child of children.slice(0, 20)) {
    if (!child || typeof child !== "object" || !allowed.has(child.type)) continue;
    const type = sanitizeKey(child.type);
    const entry = {
      id: sanitizeKey(child.id) || crypto.randomUUID(),
      type,
      text: String(child.text ?? "").slice(0, 10000),
      url: sanitizeUrl(child.url),
      image_url: sanitizeUrl(child.image_url),
      alt: String(child.alt ?? "").slice(0, 500)
    };
    if (type === "container") {
      entry.container_background = sanitizeHexColor(child.container_background, "#f7f6f2") || "#f7f6f2";
      entry.container_elements = sanitizeContainerElements(child.container_elements, depth + 1);
    }
    clean.push(entry);
  }
  return clean;
}

function sanitizeItemsArray(arr, max = 12) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, max).map((row, idx) => ({
    id: sanitizeKey(row?.id) || `sub-${idx}-${Date.now()}`,
    title: String(row?.title ?? "Item " + (idx + 1)).slice(0, 200),
    body: String(row?.body ?? "").slice(0, 5000)
  }));
}

function sanitizeSocialLinks(arr) {
  if (!Array.isArray(arr)) return [];
  const allowedNetworks = new Set(["website", "facebook", "twitter", "linkedin", "youtube", "instagram", "email"]);
  return arr.slice(0, 10).map(item => ({
    network: allowedNetworks.has(item?.network) ? item.network : "website",
    label: String(item?.label ?? "").slice(0, 60),
    url: sanitizeUrl(item?.url)
  }));
}

function sanitizeSlides(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 10).map((s, idx) => ({
    id: sanitizeKey(s?.id) || `slide-${idx}`,
    title: String(s?.title ?? `Slide ${idx + 1}`).slice(0, 200),
    body: String(s?.body ?? "").slice(0, 1000),
    button_label: String(s?.button_label ?? "Learn More").slice(0, 60),
    button_url: sanitizeUrl(s?.button_url),
    bg_color: sanitizeHexColor(s?.bg_color, "#1f2937") || "#1f2937",
    image_url: sanitizeUrl(s?.image_url)
  }));
}

function sanitizeVideoPlaylist(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 10).map((v, idx) => ({
    id: sanitizeKey(v?.id) || `vid-${idx}`,
    title: String(v?.title ?? `Video ${idx + 1}`).slice(0, 160),
    video_url: sanitizeUrl(v?.video_url),
    duration: String(v?.duration ?? "02:30").slice(0, 20)
  }));
}

function sanitizeCards(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 12).map((c, idx) => ({
    id: sanitizeKey(c?.id) || `card-${idx}`,
    title: String(c?.title ?? `Item ${idx + 1}`).slice(0, 180),
    category: String(c?.category ?? "General").slice(0, 60),
    date: String(c?.date ?? "Oct 2026").slice(0, 40),
    author: String(c?.author ?? "RSS Team").slice(0, 80),
    excerpt: String(c?.excerpt ?? "").slice(0, 800),
    price: String(c?.price ?? "$49").slice(0, 32),
    badge: String(c?.badge ?? "").slice(0, 32),
    image_url: sanitizeUrl(c?.image_url),
    url: sanitizeUrl(c?.url)
  }));
}

function sanitizeMenuItems(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 12).map((m, idx) => ({
    id: sanitizeKey(m?.id) || `menu-${idx}`,
    label: String(m?.label ?? `Link ${idx + 1}`).slice(0, 80),
    url: sanitizeUrl(m?.url) || "#"
  }));
}

function sanitizeSidebarWidgets(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 8).map((w, idx) => ({
    id: sanitizeKey(w?.id) || `widget-${idx}`,
    title: String(w?.title ?? `Widget ${idx + 1}`).slice(0, 120),
    items: String(w?.items ?? "").slice(0, 1500)
  }));
}

function sanitizeComments(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 10).map((c, idx) => ({
    id: sanitizeKey(c?.id) || `comment-${idx}`,
    author: String(c?.author ?? "Visitor").slice(0, 80),
    date: String(c?.date ?? "Just now").slice(0, 40),
    body: String(c?.body ?? "").slice(0, 1200)
  }));
}

function sanitizeCartItems(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 10).map((c, idx) => ({
    id: sanitizeKey(c?.id) || `cart-${idx}`,
    name: String(c?.name ?? `Product ${idx + 1}`).slice(0, 140),
    qty: clampInt(c?.qty, 1, 99, 1),
    price: clampFloat(c?.price, 0, 1000000, 49)
  }));
}

export function sanitizeLayout(layout) {
  if (!Array.isArray(layout)) {
    return { error: "Layout must be a list of elements.", status: 400 };
  }
  if (layout.length > 100) {
    return { error: "A layout may contain at most 100 elements.", status: 400 };
  }
  const clean = [];
  for (const item of layout) {
    if (!item || typeof item !== "object" || !ALLOWED_TOP_LEVEL.has(item.type)) continue;
    const columnsCount = clampInt(item.columns_count, 1, 3, 2);
    const legacyCols = Array.isArray(item.column_contents)
      ? item.column_contents.slice(0, 3).map(v => String(v ?? "").slice(0, 5000))
      : ["First column content", "Second column content", "Third column content"];
    const colLayout = ALLOWED_COLUMN_LAYOUTS.has(item.column_layout)
      ? item.column_layout
      : (columnsCount === 3 ? "33-33-33" : columnsCount === 1 ? "100" : "50-50");

    clean.push({
      id: sanitizeKey(item.id) || crypto.randomUUID(),
      type: sanitizeKey(item.type),
      text: String(item.text ?? "").slice(0, 20000),
      subtitle: String(item.subtitle ?? "").slice(0, 400),
      url: sanitizeUrl(item.url),
      secondary_label: String(item.secondary_label ?? "").slice(0, 80),
      secondary_url: sanitizeUrl(item.secondary_url),
      image_url: sanitizeUrl(item.image_url),
      alt: String(item.alt ?? "").slice(0, 500),
      button_bg: sanitizeHexColor(item.button_bg, "#b88a2b") || "#b88a2b",
      button_text: sanitizeHexColor(item.button_text, "#ffffff") || "#ffffff",
      button_radius: clampInt(item.button_radius, 0, 40, 6),
      image_width: clampInt(item.image_width, 10, 100, 100),
      image_fit: item.image_fit === "contain" ? "contain" : "cover",
      columns_count: columnsCount,
      column_layout: colLayout,
      column_contents: legacyCols,
      column_elements: sanitizeColumnElements(item.column_elements, legacyCols, columnsCount),
      container_background: sanitizeHexColor(item.container_background, "#f7f6f2") || "#f7f6f2",
      container_elements: sanitizeContainerElements(item.container_elements),
      background: sanitizeHexColor(item.background, ""),
      bg_gradient_enabled: Boolean(item.bg_gradient_enabled),
      bg_gradient_start: sanitizeHexColor(item.bg_gradient_start, "#f7f3e8") || "#f7f3e8",
      bg_gradient_end: sanitizeHexColor(item.bg_gradient_end, "#ffffff") || "#ffffff",
      bg_gradient_angle: clampInt(item.bg_gradient_angle, 0, 360, 135),
      border_radius: clampInt(item.border_radius, 0, 48, 0),
      border_color: sanitizeHexColor(item.border_color, "#d9d9d9") || "#d9d9d9",
      border_width: clampInt(item.border_width, 0, 12, 0),
      border_style: ALLOWED_BORDER_STYLES.has(item.border_style) ? item.border_style : "solid",
      box_shadow: ALLOWED_SHADOWS.has(item.box_shadow) ? item.box_shadow : "none",
      divider_color: sanitizeHexColor(item.divider_color, "#d9d9d9") || "#d9d9d9",
      divider_width: clampInt(item.divider_width, 10, 100, 100),
      spacer_height: clampInt(item.spacer_height, 8, 300, 48),
      quote_author: String(item.quote_author ?? "").slice(0, 250),
      blurb_icon: String(item.blurb_icon ?? "✦").slice(0, 16),
      blurb_body: String(item.blurb_body ?? "").slice(0, 5000),
      callout_body: String(item.callout_body ?? "").slice(0, 5000),
      callout_label: String(item.callout_label ?? "Get started").slice(0, 120),
      gallery_urls: String(item.gallery_urls ?? "").slice(0, 10000),
      accordion_items: sanitizeItemsArray(item.accordion_items, 15),
      tabs_items: sanitizeItemsArray(item.tabs_items, 10),
      toggle_open: Boolean(item.toggle_open),
      pricing_currency: String(item.pricing_currency ?? "$").slice(0, 8),
      pricing_price: String(item.pricing_price ?? "49").slice(0, 24),
      pricing_period: String(item.pricing_period ?? "/ year").slice(0, 32),
      pricing_badge: String(item.pricing_badge ?? "").slice(0, 40),
      pricing_features: String(item.pricing_features ?? "").slice(0, 4000),
      pricing_featured: Boolean(item.pricing_featured),
      testimonial_author: String(item.testimonial_author ?? "A. Customer").slice(0, 120),
      testimonial_role: String(item.testimonial_role ?? "Operations Lead").slice(0, 120),
      testimonial_avatar: sanitizeUrl(item.testimonial_avatar),
      testimonial_rating: clampInt(item.testimonial_rating, 1, 5, 5),
      counter_number: clampFloat(item.counter_number, -10000000, 10000000, 150),
      counter_prefix: String(item.counter_prefix ?? "").slice(0, 12),
      counter_suffix: String(item.counter_suffix ?? "+").slice(0, 12),
      bar_percent: clampInt(item.bar_percent, 0, 100, 85),
      bar_color: sanitizeHexColor(item.bar_color, "#2b87da") || "#2b87da",
      bar_track_color: sanitizeHexColor(item.bar_track_color, "#e5e7eb") || "#e5e7eb",
      video_url: sanitizeUrl(item.video_url),
      countdown_target: String(item.countdown_target ?? "").slice(0, 40),
      icon_list_items: String(item.icon_list_items ?? "").slice(0, 4000),
      icon_list_symbol: String(item.icon_list_symbol ?? "✓").slice(0, 8),
      form_button_label: String(item.form_button_label ?? "Send Message").slice(0, 80),
      form_success_message: String(item.form_success_message ?? "Thank you — your message has been received.").slice(0, 300),
      social_links: sanitizeSocialLinks(item.social_links),
      // Expanded Divi 54+ module fields
      audio_url: sanitizeUrl(item.audio_url),
      audio_artist: String(item.audio_artist ?? "RSS Studio").slice(0, 120),
      code_language: ALLOWED_CODE_LANGS.has(item.code_language) ? item.code_language : "html",
      code_content: String(item.code_content ?? "").slice(0, 12000),
      map_address: String(item.map_address ?? "Colombo, Sri Lanka").slice(0, 300),
      map_lat: clampFloat(item.map_lat, -90, 90, 6.9271),
      map_lng: clampFloat(item.map_lng, -180, 180, 79.8612),
      map_zoom: clampInt(item.map_zoom, 1, 18, 13),
      map_height: clampInt(item.map_height, 160, 600, 320),
      search_placeholder: String(item.search_placeholder ?? "Search pages, services, or docs…").slice(0, 120),
      icon_symbol: String(item.icon_symbol ?? "★").slice(0, 16),
      icon_shape: ALLOWED_ICON_SHAPES.has(item.icon_shape) ? item.icon_shape : "circle",
      icon_size: clampInt(item.icon_size, 20, 96, 42),
      slides: sanitizeSlides(item.slides),
      video_playlist: sanitizeVideoPlaylist(item.video_playlist),
      cards: sanitizeCards(item.cards),
      menu_items: sanitizeMenuItems(item.menu_items),
      sidebar_widgets: sanitizeSidebarWidgets(item.sidebar_widgets),
      post_meta: String(item.post_meta ?? "By Razeen Secure Solution · Updated 2026").slice(0, 200),
      prev_post_label: String(item.prev_post_label ?? "← Previous Article").slice(0, 120),
      next_post_label: String(item.next_post_label ?? "Next Article →").slice(0, 120),
      dropcap: Boolean(item.dropcap),
      comments_items: sanitizeComments(item.comments_items),
      product_price: String(item.product_price ?? "$79").slice(0, 40),
      product_sale_price: String(item.product_sale_price ?? "").slice(0, 40),
      product_sku: String(item.product_sku ?? "RSS-PRO-01").slice(0, 40),
      product_rating: clampInt(item.product_rating, 1, 5, 5),
      cart_items: sanitizeCartItems(item.cart_items),
      before_image_url: sanitizeUrl(item.before_image_url),
      after_image_url: sanitizeUrl(item.after_image_url),
      before_label: String(item.before_label ?? "Before").slice(0, 40),
      after_label: String(item.after_label ?? "After").slice(0, 40),
      compare_split: clampInt(item.compare_split, 5, 95, 50),
      // Design & typography
      text_color: sanitizeHexColor(item.text_color, ""),
      font_size: clampInt(item.font_size, 10, 96, 16),
      font_weight: String(["400", "500", "600", "700", "800"].includes(String(item.font_weight)) ? item.font_weight : "600"),
      line_height: clampFloat(item.line_height, 1.0, 2.5, 1.5),
      letter_spacing: clampInt(item.letter_spacing, -2, 12, 0),
      text_transform: ALLOWED_TRANSFORMS.has(item.text_transform) ? item.text_transform : "none",
      align: ALLOWED_ALIGN.has(item.align) ? item.align : "left",
      padding: clampInt(item.padding, 0, 200, 24),
      margin_top: clampInt(item.margin_top, 0, 200, 0),
      margin_bottom: clampInt(item.margin_bottom, 0, 200, 12),
      max_width_pct: clampInt(item.max_width_pct, 20, 100, 100),
      opacity_pct: clampInt(item.opacity_pct, 10, 100, 100),
      hover_lift: clampInt(item.hover_lift, 0, 12, 0),
      // Divi Animation & Advanced
      animation: ALLOWED_ANIMATIONS.has(item.animation) ? item.animation : "none",
      animation_duration: clampInt(item.animation_duration, 200, 2000, 650),
      animation_delay: clampInt(item.animation_delay, 0, 1500, 0),
      hide_desktop: Boolean(item.hide_desktop),
      hide_tablet: Boolean(item.hide_tablet),
      hide_mobile: Boolean(item.hide_mobile),
      custom_class: sanitizeHtmlClass(item.custom_class, ""),
      custom_id: sanitizeHtmlClass(item.custom_id, ""),
      responsive: sanitizeResponsive(item.responsive, item)
    });
  }
  return { layout: clean };
}

function renderColumnElement(child) {
  const type = child.type || "text";
  const text = escapeHtml(child.text || "");
  if (type === "heading") return `<h3 class="rss-prism-column-heading">${text}</h3>`;
  if (type === "button" && child.url) {
    return `<p><a class="rss-prism-column-button" href="${escapeHtml(child.url)}">${text}</a></p>`;
  }
  if (type === "image" && child.image_url) {
    const fit = child.image_fit === "contain" ? "contain" : "cover";
    const height = fit === "contain" ? "auto" : "180px";
    return `<figure class="rss-prism-column-image-wrap"><img class="rss-prism-column-image" style="object-fit:${fit};height:${height}" src="${escapeHtml(child.image_url)}" alt="${escapeHtml(child.alt || "")}" loading="lazy" decoding="async"></figure>`;
  }
  return `<p class="rss-prism-column-text">${text.replace(/\n/g, "<br>")}</p>`;
}

function renderContainerElement(child, depth = 0) {
  const text = escapeHtml(child.text || "");
  const type = child.type || "text";
  if (type === "container" && depth < 2) {
    const bg = sanitizeHexColor(child.container_background, "#f7f6f2") || "#f7f6f2";
    let out = `<div class="rss-prism-canvas-container rss-prism-canvas-container--nested" style="background:${escapeHtml(bg)};border:1px solid #e2e4e7;border-radius:8px;padding:12px;margin:12px 0;">`;
    for (const nested of child.container_elements || []) {
      out += renderContainerElement(nested, depth + 1);
    }
    return out + "</div>";
  }
  if (type === "heading") return `<h3 class="rss-prism-container-heading">${text}</h3>`;
  if (type === "button" && child.url) {
    return `<p><a class="rss-prism-container-button" href="${escapeHtml(child.url)}">${text}</a></p>`;
  }
  if (type === "image" && child.image_url) {
    return `<figure class="rss-prism-container-image"><img src="${escapeHtml(child.image_url)}" alt="${escapeHtml(child.alt || "")}" loading="lazy" decoding="async"></figure>`;
  }
  return `<p class="rss-prism-container-text">${text.replace(/\n/g, "<br>")}</p>`;
}

export function columnGridTemplate(count, columnLayout) {
  if (count === 1 || columnLayout === "100") return "minmax(0,1fr)";
  if (count === 2) {
    if (columnLayout === "66-33") return "minmax(0,2fr) minmax(0,1fr)";
    if (columnLayout === "33-66") return "minmax(0,1fr) minmax(0,2fr)";
    return "repeat(2,minmax(0,1fr))";
  }
  return `repeat(${Math.min(3, Math.max(1, count))},minmax(0,1fr))`;
}

export function boxShadowCss(name) {
  if (name === "subtle") return "0 4px 14px rgba(15,23,42,0.08)";
  if (name === "elevated") return "0 12px 30px rgba(15,23,42,0.14)";
  if (name === "deep") return "0 22px 50px rgba(15,23,42,0.22)";
  if (name === "glow") return "0 0 28px rgba(184,138,43,0.32)";
  return "none";
}

function toEmbedUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${encodeURIComponent(u.searchParams.get("v"))}`;
    }
    if (u.hostname === "youtu.be" && u.pathname.length > 1) {
      return `https://www.youtube.com/embed/${encodeURIComponent(u.pathname.slice(1))}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${encodeURIComponent(id)}`;
    }
  } catch {
    return "";
  }
  return "";
}

function osmEmbedUrl(lat, lng, zoom) {
  const delta = Math.max(0.005, 1.4 / Math.pow(2, Math.max(1, zoom - 6)));
  const bbox = `${(lng - delta).toFixed(4)},${(lat - delta).toFixed(4)},${(lng + delta).toFixed(4)},${(lat + delta).toFixed(4)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function renderCanvasHtml(layout) {
  if (!Array.isArray(layout) || layout.length === 0) return "";
  let out = '<div class="rss-prism-canvas-output">';
  let responsiveCss = "";
  for (const item of layout) {
    const type = item.type || "";
    const text = item.text || "";
    const safeId = sanitizeHtmlClass(item.id || "");
    const responsive = sanitizeResponsive(item.responsive, item);

    const bgStyle = item.bg_gradient_enabled
      ? `background:linear-gradient(${clampInt(item.bg_gradient_angle, 0, 360, 135)}deg, ${sanitizeHexColor(item.bg_gradient_start, "#f7f3e8")}, ${sanitizeHexColor(item.bg_gradient_end, "#ffffff")});`
      : (item.background && sanitizeHexColor(item.background) ? `background:${sanitizeHexColor(item.background)};` : "");

    let style = `padding:${clampInt(item.padding, 0, 200, 24)}px;margin-top:${clampInt(item.margin_top, 0, 200, 0)}px;margin-bottom:${clampInt(item.margin_bottom, 0, 200, 12)}px;border-radius:${clampInt(item.border_radius, 0, 48, 0)}px;max-width:${clampInt(item.max_width_pct, 20, 100, 100)}%;margin-inline:auto;opacity:${clampInt(item.opacity_pct, 10, 100, 100) / 100};`;
    if (clampInt(item.border_width, 0, 12, 0) > 0) {
      style += `border:${clampInt(item.border_width, 0, 12, 0)}px ${item.border_style || "solid"} ${sanitizeHexColor(item.border_color, "#d9d9d9")};`;
    }
    if (item.box_shadow && item.box_shadow !== "none") {
      style += `box-shadow:${boxShadowCss(item.box_shadow)};`;
    }
    if (item.animation && item.animation !== "none") {
      style += `animation:rp-anim-${item.animation} ${clampInt(item.animation_duration, 200, 2000, 650)}ms ease ${clampInt(item.animation_delay, 0, 1500, 0)}ms both;`;
    }
    if (safeId) {
      const prefixes = {
        desktop: "",
        tablet: "@media (max-width: 1024px){",
        mobile: "@media (max-width: 640px){"
      };
      for (const [device, prefix] of Object.entries(prefixes)) {
        const s = responsive[device];
        const rule = `.rss-prism-item-${safeId}{font-size:${s.font_size}px!important;padding:${s.padding}px!important;text-align:${s.align}!important;}`;
        responsiveCss += prefix + rule + (prefix ? "}" : "");
      }
      if (item.hide_desktop) responsiveCss += `@media (min-width: 1025px){.rss-prism-item-${safeId}{display:none!important;}}`;
      if (item.hide_tablet) responsiveCss += `@media (min-width: 641px) and (max-width: 1024px){.rss-prism-item-${safeId}{display:none!important;}}`;
      if (item.hide_mobile) responsiveCss += `@media (max-width: 640px){.rss-prism-item-${safeId}{display:none!important;}}`;
      if (item.hover_lift > 0) {
        responsiveCss += `.rss-prism-item-${safeId}{transition:transform .2s ease,box-shadow .2s ease;}.rss-prism-item-${safeId}:hover{transform:translateY(-${clampInt(item.hover_lift, 0, 12, 0)}px);}`;
      }
    }

    style += `font-size:${clampInt(item.font_size, 10, 96, 16)}px;line-height:${clampFloat(item.line_height, 1.0, 2.5, 1.5)};letter-spacing:${clampInt(item.letter_spacing, -2, 12, 0)}px;text-transform:${escapeHtml(item.text_transform || "none")};text-align:${ALLOWED_ALIGN.has(item.align) ? item.align : "left"};`;
    style += bgStyle;
    if (item.text_color && sanitizeHexColor(item.text_color)) style += `color:${sanitizeHexColor(item.text_color)};`;

    const extraClass = item.custom_class ? ` ${escapeHtml(item.custom_class)}` : "";
    const idAttr = item.custom_id ? ` id="${escapeHtml(item.custom_id)}"` : "";
    const itemCls = escapeHtml(`rss-prism-item-${safeId}`) + extraClass;
    const btnBg = sanitizeHexColor(item.button_bg, "#b88a2b") || "#b88a2b";
    const btnText = sanitizeHexColor(item.button_text, "#ffffff") || "#ffffff";
    const btnRad = clampInt(item.button_radius, 0, 40, 6);

    if (type === "section") {
      out += `<section${idAttr} class="rss-prism-canvas-section ${itemCls}" style="${escapeHtml(style)}">${escapeHtml(text)}</section>`;
    } else if (type === "heading") {
      out += `<h2${idAttr} class="rss-prism-canvas-heading ${itemCls}" style="${escapeHtml(style + `font-weight:${escapeHtml(item.font_weight || "700")};`)}">${escapeHtml(text)}</h2>`;
    } else if (type === "text") {
      out += `<p${idAttr} class="rss-prism-canvas-text ${itemCls}" style="${escapeHtml(style)}">${escapeHtml(text).replace(/\n/g, "<br>")}</p>`;
    } else if (type === "button") {
      const btnStyle = `display:inline-block;background:${btnBg};color:${btnText};border-radius:${btnRad}px;padding:.7rem 1.2rem;text-decoration:none;font-weight:600;`;
      const inner = item.url
        ? `<a class="rss-prism-canvas-button" style="${escapeHtml(btnStyle)}" href="${escapeHtml(item.url)}">${escapeHtml(text)}</a>`
        : `<span class="rss-prism-canvas-button" style="${escapeHtml(btnStyle)}">${escapeHtml(text)}</span>`;
      out += `<p${idAttr} class="${itemCls}" style="${escapeHtml(style)}">${inner}</p>`;
    } else if (type === "columns") {
      const count = clampInt(item.columns_count, 1, 3, 2);
      const colElems = sanitizeColumnElements(item.column_elements, item.column_contents, count);
      const gridCols = columnGridTemplate(count, item.column_layout);
      out += `<div${idAttr} class="rss-prism-canvas-columns ${itemCls}" style="${escapeHtml(style)}"><div class="rss-prism-columns-grid" style="display:grid;grid-template-columns:${gridCols};gap:1rem">`;
      for (let col = 0; col < count; col++) {
        out += '<div class="rss-prism-column-cell" style="padding:1rem;border:1px solid #e2e4e7;border-radius:6px;overflow-wrap:anywhere">';
        for (const child of colElems[col] || []) {
          out += renderColumnElement(child);
        }
        out += "</div>";
      }
      out += "</div></div>";
    } else if (type === "container") {
      const bg = sanitizeHexColor(item.container_background, "#f7f6f2") || "#f7f6f2";
      out += `<div${idAttr} class="rss-prism-canvas-container ${itemCls}" style="${escapeHtml(style + `background:${bg};border:1px solid #e2e4e7;border-radius:10px;`)}">`;
      for (const child of sanitizeContainerElements(item.container_elements)) {
        out += renderContainerElement(child);
      }
      out += "</div>";
    } else if (type === "divider") {
      const w = clampInt(item.divider_width, 10, 100, 100);
      const c = sanitizeHexColor(item.divider_color, "#d9d9d9") || "#d9d9d9";
      out += `<div${idAttr} class="rss-prism-canvas-divider ${itemCls}" role="separator" style="padding:0;margin:1rem 0;text-align:${escapeHtml(item.align || "left")}"><span style="display:inline-block;width:${w}%;height:0;border-top:2px solid ${escapeHtml(c)}"></span></div>`;
    } else if (type === "spacer") {
      const h = clampInt(item.spacer_height, 8, 300, 48);
      out += `<div${idAttr} class="rss-prism-canvas-spacer ${itemCls}" aria-hidden="true" style="height:${h}px;padding:0"></div>`;
    } else if (type === "quote") {
      const cite = item.quote_author ? `<cite style="display:block;margin-top:.5rem;font-style:normal">${escapeHtml(item.quote_author)}</cite>` : "";
      out += `<blockquote${idAttr} class="rss-prism-canvas-quote ${itemCls}" style="${escapeHtml(style + "border-left:4px solid #b88a2b;font-style:italic;")}"><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>${cite}</blockquote>`;
    } else if (type === "blurb") {
      const icon = escapeHtml(item.blurb_icon || "✦");
      const body = escapeHtml(item.blurb_body || "").replace(/\n/g, "<br>");
      out += `<article${idAttr} class="rss-prism-canvas-blurb ${itemCls}" style="${escapeHtml(style + `border:1px solid #e5e7eb;border-radius:${clampInt(item.border_radius, 0, 48, 8)}px;`)}"><span class="rss-prism-blurb-icon" aria-hidden="true">${icon}</span><h3 style="margin:10px 0 6px;color:inherit">${escapeHtml(text)}</h3><p>${body}</p></article>`;
    } else if (type === "callout") {
      const body = escapeHtml(item.callout_body || "").replace(/\n/g, "<br>");
      const label = escapeHtml(item.callout_label || "Get started");
      const btnStyle = `display:inline-block;background:${btnBg};color:${btnText};border-radius:${btnRad}px;padding:.7rem 1.1rem;text-decoration:none;`;
      const cta = item.url
        ? `<a class="rss-prism-canvas-button" style="${escapeHtml(btnStyle)}" href="${escapeHtml(item.url)}">${label}</a>`
        : `<span class="rss-prism-canvas-button" style="${escapeHtml(btnStyle)}">${label}</span>`;
      out += `<section${idAttr} class="rss-prism-canvas-callout ${itemCls}" style="${escapeHtml(style)}"><h2 style="margin-top:0;color:inherit">${escapeHtml(text)}</h2><p>${body}</p>${cta}</section>`;
    } else if (type === "gallery") {
      const urls = String(item.gallery_urls || "").split(/\r?\n/).map(u => sanitizeUrl(u)).filter(Boolean).slice(0, 12);
      if (urls.length > 0) {
        out += `<div${idAttr} class="rss-prism-canvas-gallery ${itemCls}" style="${escapeHtml(style)}">`;
        for (const u of urls) {
          out += `<figure><img src="${escapeHtml(u)}" alt="" loading="lazy" decoding="async"></figure>`;
        }
        out += "</div>";
      }
    } else if ((type === "image" || type === "fullwidth_image") && item.image_url) {
      const w = type === "fullwidth_image" ? 100 : clampInt(item.image_width, 10, 100, 100);
      const fit = item.image_fit === "contain" ? "contain" : "cover";
      const h = fit === "contain" ? "auto" : (type === "fullwidth_image" ? "360px" : "240px");
      out += `<figure${idAttr} class="rss-prism-canvas-image rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style)}"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.alt || "")}" loading="lazy" decoding="async" style="display:block;width:${w}%;max-width:100%;height:${h};object-fit:${fit};margin-inline:auto;border-radius:8px"></figure>`;
    } else if (type === "accordion") {
      const acc = item.accordion_items?.length ? item.accordion_items : [{ title: "Question 1", body: "Answer details." }];
      out += `<div${idAttr} class="rss-prism-canvas-accordion ${itemCls}" style="${escapeHtml(style)}">`;
      acc.forEach((row, idx) => {
        out += `<details style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;background:#fff;padding:12px 14px"${idx === 0 ? " open" : ""}><summary style="font-weight:700;cursor:pointer">${escapeHtml(row.title)}</summary><p style="margin:10px 0 0;color:#475569">${escapeHtml(row.body).replace(/\n/g, "<br>")}</p></details>`;
      });
      out += "</div>";
    } else if (type === "toggle") {
      out += `<details${idAttr} class="rss-prism-canvas-toggle ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:8px;background:#fff;")}"${item.toggle_open ? " open" : ""}><summary style="font-weight:700;cursor:pointer">${escapeHtml(text || "Toggle Title")}</summary><p style="margin:10px 0 0;color:#475569">${escapeHtml(item.callout_body || "Expandable toggle details.").replace(/\n/g, "<br>")}</p></details>`;
    } else if (type === "tabs") {
      const tabs = item.tabs_items?.length ? item.tabs_items : [{ title: "Tab 1", body: "First tab content." }];
      out += `<div${idAttr} class="rss-prism-canvas-tabs ${itemCls}" style="${escapeHtml(style)}" data-rp-tabs="1">`;
      out += '<div style="display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">';
      tabs.forEach((t, idx) => {
        out += `<button type="button" data-rp-tab-btn="${idx}" style="padding:8px 14px;border:1px solid #cbd5e1;border-radius:6px;background:${idx === 0 ? "#2b87da" : "#f8fafc"};color:${idx === 0 ? "#fff" : "#1e293b"};font-weight:600;cursor:pointer">${escapeHtml(t.title)}</button>`;
      });
      out += "</div>";
      tabs.forEach((t, idx) => {
        out += `<div data-rp-tab-panel="${idx}" style="${idx === 0 ? "" : "display:none;"}">${escapeHtml(t.body).replace(/\n/g, "<br>")}</div>`;
      });
      out += "</div>";
    } else if (type === "pricing_table") {
      const features = String(item.pricing_features || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const badge = item.pricing_badge ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${btnBg};color:#fff;font-size:11px;font-weight:700;margin-bottom:8px">${escapeHtml(item.pricing_badge)}</span>` : "";
      const cardBorder = item.pricing_featured ? `2px solid ${btnBg}` : "1px solid #e2e8f0";
      out += `<article${idAttr} class="rss-prism-canvas-pricing ${itemCls}" style="${escapeHtml(style + `border:${cardBorder};border-radius:12px;background:#fff;`)}">${badge}<h3 style="margin:4px 0">${escapeHtml(text || "Plan")}</h3><div style="font-size:2em;font-weight:800;margin:8px 0">${escapeHtml(item.pricing_currency || "$")}${escapeHtml(item.pricing_price || "49")} <span style="font-size:.45em;font-weight:500;color:#64748b">${escapeHtml(item.pricing_period || "/ year")}</span></div><ul style="text-align:left;padding-left:18px;margin:14px 0">${features.map(f => `<li>${escapeHtml(f)}</li>`).join("")}</ul><a href="${escapeHtml(item.url || "#")}" style="display:inline-block;padding:.7rem 1.3rem;border-radius:${btnRad}px;background:${btnBg};color:${btnText};text-decoration:none;font-weight:700">${escapeHtml(item.callout_label || "Choose Plan")}</a></article>`;
    } else if (type === "testimonial") {
      const stars = "★".repeat(clampInt(item.testimonial_rating, 1, 5, 5));
      const avatar = item.testimonial_avatar ? `<img src="${escapeHtml(item.testimonial_avatar)}" alt="${escapeHtml(item.testimonial_author)}" style="width:48px;height:48px;border-radius:50%;object-fit:cover">` : "";
      out += `<article${idAttr} class="rss-prism-canvas-testimonial ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;")}"><div style="color:#f59e0b;font-size:15px;margin-bottom:8px">${stars}</div><p style="font-style:italic;margin:0 0 14px">${escapeHtml(text).replace(/\n/g, "<br>")}</p><div style="display:flex;align-items:center;gap:10px">${avatar}<div><strong>${escapeHtml(item.testimonial_author)}</strong><div style="font-size:12px;color:#64748b">${escapeHtml(item.testimonial_role)}</div></div></div></article>`;
    } else if (type === "person") {
      const links = item.social_links?.length ? item.social_links : [];
      const photo = item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(text)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:10px;margin-bottom:12px">` : "";
      out += `<article${idAttr} class="rss-prism-canvas-person ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;")}">${photo}<h3 style="margin:0 0 4px">${escapeHtml(text || "Team Member")}</h3><div style="font-size:.9em;color:${btnBg};font-weight:600;margin-bottom:8px">${escapeHtml(item.subtitle || "Lead Engineer")}</div><p style="margin:0 0 10px;color:#475569">${escapeHtml(item.callout_body || "").replace(/\n/g, "<br>")}</p><div style="display:flex;gap:8px;flex-wrap:wrap">${links.map(l => `<a href="${escapeHtml(l.url || "#")}" style="font-size:12px;padding:4px 10px;border-radius:6px;background:#f1f5f9;color:#1e293b;text-decoration:none;font-weight:600">${escapeHtml(l.label || l.network)}</a>`).join("")}</div></article>`;
    } else if (type === "number_counter") {
      out += `<div${idAttr} class="rss-prism-canvas-counter ${itemCls}" style="${escapeHtml(style)}"><div style="font-size:2.4em;font-weight:800;line-height:1.1;color:${btnBg}">${escapeHtml(item.counter_prefix || "")}${escapeHtml(String(item.counter_number ?? 150))}${escapeHtml(item.counter_suffix || "")}</div><div style="margin-top:6px;font-weight:600">${escapeHtml(text)}</div></div>`;
    } else if (type === "bar_counter") {
      const pct = clampInt(item.bar_percent, 0, 100, 85);
      out += `<div${idAttr} class="rss-prism-canvas-bar ${itemCls}" style="${escapeHtml(style)}"><div style="display:flex;justify-content:space-between;font-weight:600;margin-bottom:6px"><span>${escapeHtml(text)}</span><span>${pct}%</span></div><div style="height:12px;border-radius:999px;background:${escapeHtml(item.bar_track_color || "#e5e7eb")};overflow:hidden"><div style="width:${pct}%;height:100%;background:${escapeHtml(item.bar_color || "#2b87da")};border-radius:999px"></div></div></div>`;
    } else if (type === "circle_counter") {
      const pct = clampInt(item.bar_percent, 0, 100, 85);
      const r = 46;
      const circ = (2 * Math.PI * r).toFixed(1);
      const offset = (circ * (1 - pct / 100)).toFixed(1);
      out += `<div${idAttr} class="rss-prism-canvas-circle-counter ${itemCls}" style="${escapeHtml(style + "text-align:center;")}">`;
      out += `<svg width="120" height="120" viewBox="0 0 120 120" style="display:block;margin:0 auto 10px"><circle cx="60" cy="60" r="${r}" fill="none" stroke="${escapeHtml(item.bar_track_color || "#e5e7eb")}" stroke-width="10"/><circle cx="60" cy="60" r="${r}" fill="none" stroke="${escapeHtml(item.bar_color || "#2b87da")}" stroke-width="10" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${pct}%</text></svg>`;
      out += `<div style="font-weight:700">${escapeHtml(text || "Reliability")}</div></div>`;
    } else if (type === "video") {
      const embed = toEmbedUrl(item.video_url);
      if (embed) {
        out += `<div${idAttr} class="rss-prism-canvas-video ${itemCls}" style="${escapeHtml(style)}"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px"><iframe src="${escapeHtml(embed)}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div></div>`;
      } else if (item.video_url) {
        out += `<div${idAttr} class="rss-prism-canvas-video ${itemCls}" style="${escapeHtml(style)}"><video src="${escapeHtml(item.video_url)}" controls style="width:100%;border-radius:10px"></video></div>`;
      }
    } else if (type === "video_slider") {
      const vids = item.video_playlist?.length ? item.video_playlist : [{ title: "Product Walkthrough", video_url: item.video_url || "", duration: "02:15" }];
      const firstEmbed = toEmbedUrl(vids[0].video_url);
      out += `<div${idAttr} class="rss-prism-canvas-video-slider ${itemCls}" style="${escapeHtml(style)}" data-rp-video-slider="1">`;
      out += `<div data-rp-video-stage style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;background:#0f172a;margin-bottom:10px">${firstEmbed ? `<iframe src="${escapeHtml(firstEmbed)}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen></iframe>` : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#cbd5e1">Select a video track</div>`}</div>`;
      out += `<div style="display:flex;gap:8px;flex-wrap:wrap">${vids.map((v, idx) => `<button type="button" data-rp-vid-url="${escapeHtml(toEmbedUrl(v.video_url) || v.video_url || "")}" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;background:${idx === 0 ? btnBg : "#f8fafc"};color:${idx === 0 ? btnText : "#1e293b"};font-weight:600;cursor:pointer">▶ ${escapeHtml(v.title)} (${escapeHtml(v.duration)})</button>`).join("")}</div></div>`;
    } else if (type === "audio") {
      out += `<article${idAttr} class="rss-prism-canvas-audio ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;")}">`;
      out += `<div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:${btnBg};font-weight:700">${escapeHtml(item.audio_artist || "RSS Studio")}</div><h3 style="margin:4px 0 10px">${escapeHtml(text || "Audio Track")}</h3>`;
      out += item.audio_url ? `<audio controls src="${escapeHtml(item.audio_url)}" style="width:100%"></audio>` : `<p style="margin:0;color:#64748b;font-size:13px">Audio source not configured.</p>`;
      out += "</article>";
    } else if (type === "countdown") {
      const target = escapeHtml(item.countdown_target || "");
      out += `<div${idAttr} class="rss-prism-canvas-countdown ${itemCls}" style="${escapeHtml(style)}" data-rp-countdown="${target}"><h3 style="margin-top:0">${escapeHtml(text || "Launching Soon")}</h3><div style="display:grid;grid-template-columns:repeat(4,minmax(60px,1fr));gap:10px;max-width:440px;margin-inline:auto"><div><strong data-cd="d" style="font-size:1.8em;display:block">00</strong><span style="font-size:11px;text-transform:uppercase;color:#64748b">Days</span></div><div><strong data-cd="h" style="font-size:1.8em;display:block">00</strong><span style="font-size:11px;text-transform:uppercase;color:#64748b">Hours</span></div><div><strong data-cd="m" style="font-size:1.8em;display:block">00</strong><span style="font-size:11px;text-transform:uppercase;color:#64748b">Mins</span></div><div><strong data-cd="s" style="font-size:1.8em;display:block">00</strong><span style="font-size:11px;text-transform:uppercase;color:#64748b">Secs</span></div></div></div>`;
    } else if (type === "icon_list") {
      const lines = String(item.icon_list_items || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      const sym = escapeHtml(item.icon_list_symbol || "✓");
      out += `<ul${idAttr} class="rss-prism-canvas-icon-list ${itemCls}" style="${escapeHtml(style + "list-style:none;padding-left:0;display:grid;gap:8px;")}">${lines.map(l => `<li style="display:flex;align-items:flex-start;gap:8px"><span style="color:${btnBg};font-weight:800">${sym}</span><span>${escapeHtml(l)}</span></li>`).join("")}</ul>`;
    } else if (type === "icon") {
      const sz = clampInt(item.icon_size, 20, 96, 42);
      const radius = item.icon_shape === "circle" ? "50%" : item.icon_shape === "square" ? "10px" : "0";
      const bgChip = item.icon_shape === "none" ? "transparent" : btnBg;
      const fgChip = item.icon_shape === "none" ? btnBg : btnText;
      out += `<div${idAttr} class="rss-prism-canvas-icon ${itemCls}" style="${escapeHtml(style)}"><div style="display:inline-flex;align-items:center;justify-content:center;width:${sz + 24}px;height:${sz + 24}px;border-radius:${radius};background:${bgChip};color:${fgChip};font-size:${sz}px">${escapeHtml(item.icon_symbol || "★")}</div>${text ? `<div style="margin-top:8px;font-weight:700">${escapeHtml(text)}</div>` : ""}</div>`;
    } else if (type === "contact_form") {
      out += `<form${idAttr} class="rss-prism-canvas-form ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:10px;background:#fff;display:grid;gap:10px;")}" onsubmit="event.preventDefault();this.querySelector('[data-form-msg]').hidden=false"><h3 style="margin:0">${escapeHtml(text || "Contact Us")}</h3><input type="text" placeholder="Your name" required style="padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><input type="email" placeholder="Email address" required style="padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><textarea rows="3" placeholder="Message" required style="padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"></textarea><button type="submit" style="justify-self:start;padding:.7rem 1.3rem;border:0;border-radius:${btnRad}px;background:${btnBg};color:${btnText};font-weight:700;cursor:pointer">${escapeHtml(item.form_button_label || "Send Message")}</button><p data-form-msg hidden style="margin:0;color:#047857;font-weight:600">${escapeHtml(item.form_success_message || "Thank you — your message has been received.")}</p></form>`;
    } else if (type === "email_optin") {
      out += `<form${idAttr} class="rss-prism-canvas-optin ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;display:grid;gap:10px;")}" onsubmit="event.preventDefault();this.querySelector('[data-optin-msg]').hidden=false"><h3 style="margin:0">${escapeHtml(text || "Subscribe for Updates")}</h3><p style="margin:0;color:#475569">${escapeHtml(item.subtitle || "Receive product notes and security advisories.")}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" placeholder="First name" style="flex:1;min-width:140px;padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><input type="email" placeholder="Email address" required style="flex:1.4;min-width:180px;padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><button type="submit" style="padding:9px 16px;border:0;border-radius:${btnRad}px;background:${btnBg};color:${btnText};font-weight:700;cursor:pointer">${escapeHtml(item.form_button_label || "Subscribe")}</button></div><p data-optin-msg hidden style="margin:0;color:#047857;font-weight:600">${escapeHtml(item.form_success_message || "Subscribed! Please check your inbox.")}</p></form>`;
    } else if (type === "login") {
      out += `<form${idAttr} class="rss-prism-canvas-login ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;max-width:440px;display:grid;gap:10px;")}" onsubmit="event.preventDefault();this.querySelector('[data-login-msg]').hidden=false"><h3 style="margin:0">${escapeHtml(text || "Client Portal Login")}</h3><p style="margin:0;color:#64748b;font-size:.9em">${escapeHtml(item.subtitle || "Sign in to access your account dashboard.")}</p><input type="text" placeholder="Username or Email" required style="padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><input type="password" placeholder="Password" required style="padding:9px 11px;border:1px solid #cbd5e1;border-radius:6px"><button type="submit" style="padding:.7rem 1.3rem;border:0;border-radius:${btnRad}px;background:${btnBg};color:${btnText};font-weight:700;cursor:pointer">${escapeHtml(item.form_button_label || "Sign In")}</button><p data-login-msg hidden style="margin:0;color:#1d4ed8;font-weight:600">Sign-in request submitted.</p></form>`;
    } else if (type === "search") {
      out += `<form${idAttr} class="rss-prism-canvas-search ${itemCls}" action="/pages" method="get" style="${escapeHtml(style + "display:flex;gap:8px;flex-wrap:wrap;")}"><input type="search" name="q" placeholder="${escapeHtml(item.search_placeholder || "Search...")}" style="flex:1;min-width:200px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:${btnRad}px"><button type="submit" style="padding:10px 18px;border:0;border-radius:${btnRad}px;background:${btnBg};color:${btnText};font-weight:700;cursor:pointer">${escapeHtml(item.form_button_label || "Search")}</button></form>`;
    } else if (type === "social_follow") {
      const links = item.social_links?.length ? item.social_links : [{ network: "website", label: "Website", url: "https://www.rsscctvsolution.eu.cc/" }];
      out += `<div${idAttr} class="rss-prism-canvas-social ${itemCls}" style="${escapeHtml(style + "display:flex;gap:8px;flex-wrap:wrap;")}">${links.map(l => `<a href="${escapeHtml(l.url || "#")}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;padding:8px 14px;border-radius:${btnRad}px;background:${btnBg};color:#fff;text-decoration:none;font-weight:600;font-size:.9em">${escapeHtml(l.label || l.network)}</a>`).join("")}</div>`;
    } else if (type === "code" || type === "fullwidth_code") {
      const lang = escapeHtml(item.code_language || "html").toUpperCase();
      const snippet = escapeHtml(item.code_content || text || "<div>RSS Prism snippet</div>");
      out += `<div${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style + "background:#0f172a;color:#e2e8f0;border-radius:10px;")}" data-rp-code><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8"><span>${escapeHtml(text || "Code Snippet")} · ${lang}</span></div><pre style="margin:0;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.5"><code>${snippet}</code></pre></div>`;
    } else if (type === "map" || type === "fullwidth_map") {
      const mapUrl = osmEmbedUrl(item.map_lat ?? 6.9271, item.map_lng ?? 79.8612, item.map_zoom ?? 13);
      const mh = clampInt(item.map_height, 160, 600, 320);
      out += `<div${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style)}"><div style="font-weight:700;margin-bottom:8px">📍 ${escapeHtml(item.map_address || text || "Location Map")}</div><iframe src="${escapeHtml(mapUrl)}" title="${escapeHtml(item.map_address || "Map")}" style="width:100%;height:${mh}px;border:1px solid #e2e8f0;border-radius:10px" loading="lazy"></iframe></div>`;
    } else if (type === "before_after") {
      const split = clampInt(item.compare_split, 5, 95, 50);
      const bImg = item.before_image_url || item.image_url;
      const aImg = item.after_image_url || item.image_url;
      out += `<div${idAttr} class="rss-prism-canvas-before-after ${itemCls}" style="${escapeHtml(style)}" data-rp-compare><div style="position:relative;overflow:hidden;border-radius:10px;border:1px solid #e2e8f0;height:280px;background:#f1f5f9">${aImg ? `<img src="${escapeHtml(aImg)}" alt="${escapeHtml(item.after_label || "After")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">` : ""}<div data-rp-before-layer style="position:absolute;inset:0;width:${split}%;overflow:hidden;border-right:3px solid #fff">${bImg ? `<img src="${escapeHtml(bImg)}" alt="${escapeHtml(item.before_label || "Before")}" style="width:100%;max-width:none;height:100%;object-fit:cover">` : `<div style="height:100%;background:#cbd5e1;display:flex;align-items:center;justify-content:center">${escapeHtml(item.before_label || "Before")}</div>`}</div></div><input type="range" min="5" max="95" value="${split}" oninput="var l=this.parentElement.querySelector('[data-rp-before-layer]');if(l)l.style.width=this.value+'%'" style="width:100%;margin-top:8px"></div>`;
    } else if (type === "fullwidth_header") {
      out += `<header${idAttr} class="rss-prism-canvas-fullwidth-header ${itemCls}" style="${escapeHtml(style + "padding:48px 32px;border-radius:12px;")}"><h1 style="margin:0 0 10px;color:inherit;font-size:2.1em">${escapeHtml(text || "Developing Ideas. Delivering Solutions.")}</h1><p style="margin:0 0 20px;opacity:.88;max-width:680px">${escapeHtml(item.subtitle || "")}</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a href="${escapeHtml(item.url || "#")}" style="display:inline-block;padding:.75rem 1.4rem;border-radius:${btnRad}px;background:${btnBg};color:${btnText};text-decoration:none;font-weight:700">${escapeHtml(item.callout_label || "Get Started")}</a>${item.secondary_label ? `<a href="${escapeHtml(item.secondary_url || "#")}" style="display:inline-block;padding:.75rem 1.4rem;border-radius:${btnRad}px;border:1px solid currentColor;color:inherit;text-decoration:none;font-weight:600">${escapeHtml(item.secondary_label)}</a>` : ""}</div></header>`;
    } else if (type === "slider" || type === "fullwidth_slider" || type === "post_slider" || type === "fullwidth_post_slider") {
      const slides = item.slides?.length ? item.slides : [{ title: text || "Featured Slide", body: "Add slides in Settings.", button_label: "Explore", button_url: "#", bg_color: "#1e293b" }];
      out += `<div${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style)}" data-rp-slider="1">`;
      slides.forEach((s, idx) => {
        out += `<div data-rp-slide="${idx}" style="${idx === 0 ? "" : "display:none;"}background:${escapeHtml(s.bg_color || "#1e293b")};color:#fff;padding:38px 28px;border-radius:12px"><h2 style="margin:0 0 8px;color:#fff">${escapeHtml(s.title)}</h2><p style="margin:0 0 16px;opacity:.9">${escapeHtml(s.body)}</p>${s.button_label ? `<a href="${escapeHtml(s.button_url || "#")}" style="display:inline-block;padding:.65rem 1.2rem;border-radius:${btnRad}px;background:${btnBg};color:${btnText};text-decoration:none;font-weight:700">${escapeHtml(s.button_label)}</a>` : ""}</div>`;
      });
      if (slides.length > 1) {
        out += `<div style="display:flex;gap:6px;justify-content:center;margin-top:10px">${slides.map((_, idx) => `<button type="button" data-rp-slide-btn="${idx}" style="padding:4px 10px;border:1px solid #cbd5e1;border-radius:999px;background:${idx === 0 ? btnBg : "#fff"};color:${idx === 0 ? btnText : "#334155"};cursor:pointer;font-size:12px;font-weight:700">${idx + 1}</button>`).join("")}</div>`;
      }
      out += "</div>";
    } else if (type === "blog" || type === "portfolio" || type === "filterable_portfolio" || type === "fullwidth_portfolio" || type === "shop") {
      const cards = item.cards?.length ? item.cards : [{ title: "Sample Entry", category: "General", date: "2026", excerpt: "Add entries in Settings.", price: "$49" }];
      const cats = Array.from(new Set(cards.map(c => c.category || "General")));
      out += `<div${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style)}"${type === "filterable_portfolio" ? ' data-rp-filter-grid="1"' : ""}>`;
      if (type === "filterable_portfolio" && cats.length > 1) {
        out += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"><button type="button" data-rp-cat="all" style="padding:6px 12px;border-radius:999px;border:1px solid #cbd5e1;background:${btnBg};color:${btnText};font-weight:600;cursor:pointer">All</button>${cats.map(cat => `<button type="button" data-rp-cat="${escapeHtml(cat)}" style="padding:6px 12px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:600;cursor:pointer">${escapeHtml(cat)}</button>`).join("")}</div>`;
      }
      out += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">`;
      for (const c of cards) {
        out += `<article data-rp-card-cat="${escapeHtml(c.category || "General")}" style="border:1px solid #e2e8f0;border-radius:10px;background:#fff;overflow:hidden;padding:16px;display:grid;gap:8px">${c.image_url ? `<img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.title)}" style="width:100%;height:150px;object-fit:cover;border-radius:6px">` : ""}<div style="font-size:11px;text-transform:uppercase;color:${btnBg};font-weight:700">${escapeHtml(c.category)}${type === "blog" && c.date ? ` · ${escapeHtml(c.date)}` : ""}</div><h3 style="margin:0">${escapeHtml(c.title)}</h3>${type === "shop" ? `<div style="font-weight:800;font-size:1.2em">${escapeHtml(c.price || "$49")}</div>` : ""}<p style="margin:0;color:#475569;font-size:.92em">${escapeHtml(c.excerpt)}</p>${c.url ? `<a href="${escapeHtml(c.url)}" style="color:${btnBg};font-weight:700;text-decoration:none">${type === "shop" ? "View Product →" : "Read More →"}</a>` : ""}</article>`;
      }
      out += "</div></div>";
    } else if (type === "post_title") {
      out += `<header${idAttr} class="rss-prism-canvas-post-title ${itemCls}" style="${escapeHtml(style)}"><div style="font-size:.85em;color:${btnBg};font-weight:700;margin-bottom:6px">${escapeHtml(item.post_meta || "By Razeen Secure Solution")}</div><h1 style="margin:0 0 8px">${escapeHtml(text || "Article Title")}</h1>${item.subtitle ? `<p style="margin:0;color:#64748b;font-size:1.1em">${escapeHtml(item.subtitle)}</p>` : ""}</header>`;
    } else if (type === "post_content") {
      out += `<article${idAttr} class="rss-prism-canvas-post-content ${itemCls}" style="${escapeHtml(style)}"><p style="margin:0">${escapeHtml(text).replace(/\n/g, "<br>")}</p></article>`;
    } else if (type === "post_navigation") {
      out += `<nav${idAttr} class="rss-prism-canvas-post-nav ${itemCls}" style="${escapeHtml(style + "display:flex;justify-content:space-between;gap:12px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;")}"><span>${escapeHtml(item.prev_post_label || "← Previous")}</span><span>${escapeHtml(item.next_post_label || "Next →")}</span></nav>`;
    } else if (type === "comments") {
      const list = item.comments_items?.length ? item.comments_items : [{ author: "Visitor", date: "Today", body: "Great solution!" }];
      out += `<section${idAttr} class="rss-prism-canvas-comments ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:10px;background:#fff;")}" ><h3 style="margin-top:0">${escapeHtml(text || "Comments")} (${list.length})</h3>${list.map(c => `<div style="padding:10px 0;border-top:1px solid #f1f5f9"><strong>${escapeHtml(c.author)}</strong> <span style="font-size:12px;color:#64748b">${escapeHtml(c.date)}</span><p style="margin:4px 0 0">${escapeHtml(c.body)}</p></div>`).join("")}</section>`;
    } else if (type === "menu" || type === "fullwidth_menu") {
      const links = item.menu_items?.length ? item.menu_items : [{ label: "Home", url: "/" }, { label: "Builder", url: "/builder" }];
      out += `<nav${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style + "display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;border:1px solid #e2e8f0;border-radius:10px;background:#fff;")}"><strong>${escapeHtml(text || "RSS Prism")}</strong><div style="display:flex;gap:14px;flex-wrap:wrap">${links.map(l => `<a href="${escapeHtml(l.url || "#")}" style="text-decoration:none;color:inherit;font-weight:600">${escapeHtml(l.label)}</a>`).join("")}</div></nav>`;
    } else if (type === "breadcrumbs") {
      const links = item.menu_items?.length ? item.menu_items : [{ label: "Home", url: "/" }, { label: "Pages", url: "/pages" }, { label: "Current Page", url: "#" }];
      out += `<nav${idAttr} aria-label="Breadcrumb" class="rss-prism-canvas-breadcrumbs ${itemCls}" style="${escapeHtml(style + "font-size:.9em;")}">${links.map((l, idx) => (idx < links.length - 1 ? `<a href="${escapeHtml(l.url || "#")}" style="color:${btnBg};text-decoration:none;font-weight:600">${escapeHtml(l.label)}</a> <span style="opacity:.5">/</span> ` : `<span>${escapeHtml(l.label)}</span>`)).join("")}</nav>`;
    } else if (type === "sidebar") {
      const widgets = item.sidebar_widgets?.length ? item.sidebar_widgets : [{ title: "Recent Services", items: "Software Development\nCCTV Installation\nCloud Hosting" }];
      out += `<aside${idAttr} class="rss-prism-canvas-sidebar ${itemCls}" style="${escapeHtml(style + "display:grid;gap:14px;")}">${widgets.map(w => `<div style="padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#fff"><h4 style="margin:0 0 8px">${escapeHtml(w.title)}</h4><ul style="margin:0;padding-left:18px;color:#475569">${String(w.items || "").split(/\r?\n/).filter(Boolean).map(li => `<li>${escapeHtml(li)}</li>`).join("")}</ul></div>`).join("")}</aside>`;
    } else if (type === "woo_product") {
      const stars = "★".repeat(clampInt(item.product_rating, 1, 5, 5));
      out += `<article${idAttr} class="rss-prism-canvas-woo-product ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;display:grid;gap:10px;")}">${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(text)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:8px">` : ""}<div style="color:#f59e0b">${stars}</div><h3 style="margin:0">${escapeHtml(text || "Featured Product")}</h3><div style="font-size:1.5em;font-weight:800;color:${btnBg}">${escapeHtml(item.product_sale_price || item.product_price || "$79")}${item.product_sale_price ? ` <del style="font-size:.65em;color:#94a3b8">${escapeHtml(item.product_price || "")}</del>` : ""}</div><div style="font-size:12px;color:#64748b">SKU: ${escapeHtml(item.product_sku || "RSS-01")}</div><p style="margin:0">${escapeHtml(item.callout_body || "")}</p><a href="${escapeHtml(item.url || "#")}" style="justify-self:start;padding:.7rem 1.3rem;border-radius:${btnRad}px;background:${btnBg};color:${btnText};text-decoration:none;font-weight:700">${escapeHtml(item.callout_label || "Add to Cart")}</a></article>`;
    } else if (type === "woo_cart" || type === "woo_checkout") {
      const rows = item.cart_items?.length ? item.cart_items : [{ name: "RSS Prism License", qty: 1, price: 49 }];
      const total = rows.reduce((sum, r) => sum + Number(r.qty || 1) * Number(r.price || 0), 0);
      out += `<section${idAttr} class="rss-prism-canvas-${type} ${itemCls}" style="${escapeHtml(style + "border:1px solid #e2e8f0;border-radius:12px;background:#fff;")}" ><h3 style="margin-top:0">${escapeHtml(text || (type === "woo_checkout" ? "Checkout Summary" : "Shopping Cart"))}</h3><div style="display:grid;gap:8px;margin-bottom:14px">${rows.map(r => `<div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:1px solid #f1f5f9"><span>${escapeHtml(r.name)} × ${r.qty}</span><strong>$${(Number(r.qty || 1) * Number(r.price || 0)).toFixed(2)}</strong></div>`).join("")}<div style="display:flex;justify-content:space-between;font-size:1.15em;font-weight:800"><span>Total</span><span>$${total.toFixed(2)}</span></div></div><a href="${escapeHtml(item.url || "#")}" style="display:inline-block;padding:.7rem 1.3rem;border-radius:${btnRad}px;background:${btnBg};color:${btnText};text-decoration:none;font-weight:700">${escapeHtml(item.callout_label || (type === "woo_checkout" ? "Place Order" : "Proceed to Checkout"))}</a></section>`;
    }
  }

  const keyframes = `@keyframes rp-anim-fade{from{opacity:0}to{opacity:1}}@keyframes rp-anim-slide-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}@keyframes rp-anim-slide-down{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:none}}@keyframes rp-anim-slide-left{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}@keyframes rp-anim-slide-right{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:none}}@keyframes rp-anim-zoom{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}@keyframes rp-anim-bounce{0%{opacity:0;transform:translateY(28px)}65%{opacity:1;transform:translateY(-6px)}100%{transform:none}}@keyframes rp-anim-flip{from{opacity:0;transform:perspective(600px) rotateX(-25deg)}to{opacity:1;transform:none}}`;
  const interactiveScript = `<script>(function(){document.querySelectorAll('[data-rp-tabs]').forEach(function(box){box.querySelectorAll('[data-rp-tab-btn]').forEach(function(btn){btn.addEventListener('click',function(){var idx=btn.getAttribute('data-rp-tab-btn');box.querySelectorAll('[data-rp-tab-btn]').forEach(function(b){var on=b.getAttribute('data-rp-tab-btn')===idx;b.style.background=on?'#2b87da':'#f8fafc';b.style.color=on?'#fff':'#1e293b';});box.querySelectorAll('[data-rp-tab-panel]').forEach(function(p){p.style.display=p.getAttribute('data-rp-tab-panel')===idx?'block':'none';});});});});document.querySelectorAll('[data-rp-slider]').forEach(function(box){box.querySelectorAll('[data-rp-slide-btn]').forEach(function(btn){btn.addEventListener('click',function(){var idx=btn.getAttribute('data-rp-slide-btn');box.querySelectorAll('[data-rp-slide]').forEach(function(s){s.style.display=s.getAttribute('data-rp-slide')===idx?'block':'none';});});});});document.querySelectorAll('[data-rp-filter-grid]').forEach(function(box){box.querySelectorAll('[data-rp-cat]').forEach(function(btn){btn.addEventListener('click',function(){var cat=btn.getAttribute('data-rp-cat');box.querySelectorAll('[data-rp-card-cat]').forEach(function(c){c.style.display=(cat==='all'||c.getAttribute('data-rp-card-cat')===cat)?'grid':'none';});});});});document.querySelectorAll('[data-rp-countdown]').forEach(function(el){var raw=el.getAttribute('data-rp-countdown');var target=raw?Date.parse(raw):Date.now()+7*86400000;if(isNaN(target))target=Date.now()+7*86400000;function tick(){var diff=Math.max(0,target-Date.now());var d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);var pad=function(n){return String(n).padStart(2,'0')};var set=function(k,v){var n=el.querySelector('[data-cd="'+k+'"]');if(n)n.textContent=pad(v);};set('d',d);set('h',h);set('m',m);set('s',s);}tick();setInterval(tick,1000);});})();</script>`;

  out += `<style>${keyframes}${responsiveCss}@media(max-width:640px){.rss-prism-canvas-columns .rss-prism-columns-grid{grid-template-columns:1fr!important}}</style>${interactiveScript}</div>`;
  return out;
}

export function defaultStarterLayout() {
  const { layout } = sanitizeLayout([
    { id: "starter-section", type: "section", text: "Razeen Secure Solution", background: "#f7f6f2", animation: "fade" },
    { id: "starter-heading", type: "heading", text: "Developing Ideas. Delivering Solutions.", font_size: 36, align: "left", animation: "slide-up" },
    { id: "starter-intro", type: "text", text: "Software development, CCTV solutions, networking, cloud services, and practical AI solutions." },
    {
      id: "starter-columns",
      type: "columns",
      columns_count: 3,
      column_layout: "33-33-33",
      column_contents: ["Software & AI solutions", "CCTV & networking", "Cloud & system support"],
      column_elements: [
        [
          { id: "starter-col1-title", type: "heading", text: "Software & AI solutions" },
          { id: "starter-col1-text", type: "text", text: "Build practical digital tools for everyday work." }
        ],
        [
          { id: "starter-col2-title", type: "heading", text: "CCTV & networking" },
          { id: "starter-col2-text", type: "text", text: "Connect sites and improve security visibility." }
        ],
        [
          { id: "starter-col3-title", type: "heading", text: "Cloud & system support" },
          { id: "starter-col3-text", type: "text", text: "Keep systems connected, useful, and maintainable." }
        ]
      ]
    },
    { id: "starter-cta", type: "button", text: "Explore RSS", url: "https://www.rsscctvsolution.eu.cc/", button_bg: "#b88a2b", button_text: "#ffffff" }
  ]);
  return layout;
}
