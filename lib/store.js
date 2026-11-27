import { defaultStarterLayout, sanitizeLayout } from "./builder-renderer.js";

const templates = new Map();
const pages = new Map();
let nextId = 3;

templates.set(1, {
  id: 1,
  title: "My First Prism Page",
  status: "draft",
  modifiedAt: new Date().toISOString(),
  layout: defaultStarterLayout()
});

const servicesStarter = sanitizeLayout([
  { id: "svc-section", type: "section", text: "Our Services", background: "#f7f3e8" },
  { id: "svc-heading", type: "heading", text: "Technology that works for your business", font_size: 34 },
  {
    id: "svc-cols",
    type: "columns",
    columns_count: 2,
    column_layout: "50-50",
    column_elements: [
      [
        { id: "svc-c1-h", type: "heading", text: "Software & AI" },
        { id: "svc-c1-t", type: "text", text: "Custom web tools, automation, and practical AI integrations." }
      ],
      [
        { id: "svc-c2-h", type: "heading", text: "CCTV & Infrastructure" },
        { id: "svc-c2-t", type: "text", text: "CCTV installation, networking, system administration, and support." }
      ]
    ]
  },
  { id: "svc-callout", type: "callout", text: "Ready to start a project?", callout_body: "Discuss your requirements with Razeen Secure Solution.", callout_label: "Contact RSS", url: "/#contact", button_bg: "#b88a2b", button_text: "#ffffff" }
]).layout;

templates.set(2, {
  id: 2,
  title: "RSS Services Landing",
  status: "publish",
  modifiedAt: new Date().toISOString(),
  layout: servicesStarter
});

pages.set(101, {
  id: 101,
  title: "RSS Services Overview",
  status: "publish",
  templateId: 2,
  createdAt: new Date().toISOString()
});

export function allocateId() {
  return nextId++;
}

export const studioState = {
  headerRows: [[], ["brand", "menu", "button"], []],
  footerRows: [["brand", "description"], ["menu", "widgets"], ["copyright", "credit"]],
  headerButtonLabel: "Get in touch",
  headerButtonUrl: "/#contact",
  socialUrl: "",
  customizer: {
    accentColor: "#b88a2b",
    backgroundColor: "#f5f6f8",
    surfaceColor: "#ffffff",
    textColor: "#202124",
    mutedColor: "#686d76",
    contentWidth: 1180,
    cornerStyle: "round",
    shadow: "yes",
    fontFamily: "system",
    fontScale: "normal",
    buttonShape: "pill",
    contentAlignment: "left",
    headerStyle: "standard",
    headerSurface: "default",
    logoPosition: "left",
    menuStyle: "pill",
    menuAlignment: "right",
    stickyHeader: false,
    headerBorder: true,
    headerPadding: "normal",
    footerStyle: "light",
    footerAlignment: "left",
    footerColumns: "three",
    footerLogoPosition: "left",
    footerSpacing: "normal",
    footerText: "Developing Ideas. Delivering Solutions.",
    footerCopyright: "",
    heroEyebrow: "RAZEEN SECURE SOLUTION · RSS",
    heroTitle: "Developing Ideas. Delivering Solutions.",
    heroText: "We build practical digital experiences, software tools, and website solutions with a focus on clarity, reliability, and security-minded design.",
    showHeroVisual: true
  }
};

export const licenseConsoleState = {
  apiUrl: "",
  licenseKey: "",
  email: "",
  status: "not_configured",
  message: "",
  activationLimit: 0,
  activeActivations: 0,
  validUntil: ""
};

export { templates, pages };
