(() => {
  'use strict';
  const root = document.getElementById('rss-prism-builder-app');
  const dataNode = document.getElementById('rss-prism-builder-data');
  if (!root || !dataNode || !window.wp || !wp.element) return;

  let config;
  try {
    config = JSON.parse(dataNode.textContent);
  } catch (e) {
    root.textContent = 'Could not load layout data.';
    return;
  }

  const { createElement: h, useState, useEffect, useRef } = wp.element;

  const MOD = window.RSS_PRISM_MODULES || {};
  const TYPES = MOD.TYPES || {};
  const CATEGORIES = MOD.CATEGORIES || [['all', 'All']];
  const INLINE_EDITABLE_TYPES = MOD.INLINE_EDITABLE_TYPES || ['heading', 'text', 'button', 'section'];

  const ANIMATION_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade In' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-down', label: 'Slide Down' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'zoom', label: 'Zoom In' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'flip', label: '3D Flip' }
  ];

  const SHADOW_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'subtle', label: 'Subtle Lift' },
    { value: 'elevated', label: 'Elevated Card' },
    { value: 'deep', label: 'Deep Floating' },
    { value: 'glow', label: 'Warm Gold Glow' }
  ];

  const SOCIAL_NETWORKS = [
    { value: 'website', label: 'Website' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'X / Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'email', label: 'Email' }
  ];

  const DESIGN_PRESETS = {
    'rss-gold': { label: 'RSS Gold', background: '#f7f3e8', surface: '#ffffff', text: '#202124', accent: '#b88a2b', buttonText: '#ffffff', radius: 8, padding: 28 },
    'ocean-blue': { label: 'Ocean Blue', background: '#edf5fb', surface: '#ffffff', text: '#17324d', accent: '#1769aa', buttonText: '#ffffff', radius: 10, padding: 28 },
    'forest-green': { label: 'Forest Green', background: '#eef5ef', surface: '#ffffff', text: '#20352a', accent: '#28734b', buttonText: '#ffffff', radius: 8, padding: 26 },
    'midnight': { label: 'Midnight', background: '#202632', surface: '#2b3443', text: '#f3f5f8', accent: '#d7ad54', buttonText: '#202632', radius: 6, padding: 28 }
  };

  const STARTER_META = [
    { key: 'business', label: 'Business landing', desc: 'Hero, value proposition, 3 service columns & CTA' },
    { key: 'services', label: 'Services', desc: 'Service showcase with capabilities & enquiry CTA' },
    { key: 'about', label: 'About RSS', desc: 'Company story since 2015, pillars & contact button' },
    { key: 'projects', label: 'RSS projects', desc: 'Software, AI, security & infrastructure overview' },
    { key: 'security', label: 'Security solutions', desc: 'Assess, Implement & Support security framework' },
    { key: 'contact', label: 'Contact page', desc: 'Email, phone lines, website & direct mail button' }
  ];

  const COLUMN_STRUCTURES = [
    { id: '100', count: 1, label: '1 Column', bars: [100] },
    { id: '50-50', count: 2, label: '2 Columns (50/50)', bars: [50, 50] },
    { id: '33-33-33', count: 3, label: '3 Columns (33/33/33)', bars: [33, 33, 33] },
    { id: '66-33', count: 2, label: '2 Columns (2/3 + 1/3)', bars: [66, 33] },
    { id: '33-66', count: 2, label: '2 Columns (1/3 + 2/3)', bars: [33, 66] }
  ];

  const STYLE_CLIPBOARD_KEYS = [
    'background', 'bg_gradient_enabled', 'bg_gradient_start', 'bg_gradient_end', 'bg_gradient_angle',
    'text_color', 'button_bg', 'button_text', 'button_radius',
    'border_color', 'border_width', 'border_style', 'border_radius', 'box_shadow',
    'padding', 'margin_top', 'margin_bottom', 'max_width_pct', 'opacity_pct', 'hover_lift',
    'font_size', 'font_weight', 'line_height', 'letter_spacing', 'text_transform', 'align',
    'animation', 'animation_duration', 'animation_delay', 'responsive'
  ];

  const boxShadowCss = name => {
    if (name === 'subtle') return '0 4px 14px rgba(15,23,42,0.08)';
    if (name === 'elevated') return '0 12px 30px rgba(15,23,42,0.14)';
    if (name === 'deep') return '0 22px 50px rgba(15,23,42,0.22)';
    if (name === 'glow') return '0 0 28px rgba(184,138,43,0.32)';
    return 'none';
  };

  const toEmbedUrl = rawUrl => {
    if (!rawUrl) return '';
    try {
      const u = new URL(rawUrl);
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return 'https://www.youtube.com/embed/' + encodeURIComponent(u.searchParams.get('v'));
      }
      if (u.hostname === 'youtu.be' && u.pathname.length > 1) {
        return 'https://www.youtube.com/embed/' + encodeURIComponent(u.pathname.slice(1));
      }
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        if (id) return 'https://player.vimeo.com/video/' + encodeURIComponent(id);
      }
    } catch {
      return '';
    }
    return '';
  };

  const computeCountdown = rawTarget => {
    let target = rawTarget ? Date.parse(rawTarget) : Date.now() + 7 * 86400000;
    if (Number.isNaN(target)) target = Date.now() + 7 * 86400000;
    const diff = Math.max(0, target - Date.now());
    const pad = n => String(n).padStart(2, '0');
    return {
      d: pad(Math.floor(diff / 86400000)),
      h: pad(Math.floor((diff % 86400000) / 3600000)),
      m: pad(Math.floor((diff % 3600000) / 60000)),
      s: pad(Math.floor((diff % 60000) / 1000))
    };
  };

  const fresh = type => {
    const fontSize = type === 'heading' ? 32 : 16;
    const responsive = {};
    ['desktop', 'tablet', 'mobile'].forEach(device => {
      responsive[device] = { font_size: fontSize, padding: 24, align: 'left' };
    });
    const ts = Date.now();
    const defaultCountdown = new Date(ts + 14 * 86400000).toISOString().slice(0, 16);
    return {
      id: 'item-' + ts + '-' + Math.random().toString(36).slice(2, 7),
      type,
      text: (TYPES[type] && TYPES[type].text) || 'Module',
      url: '',
      image_url: '',
      image_fit: 'cover',
      alt: '',
      button_bg: '#b88a2b',
      button_text: '#ffffff',
      button_radius: 6,
      image_width: 100,
      columns_count: 2,
      column_layout: '50-50',
      column_contents: ['First column content', 'Second column content', 'Third column content'],
      column_elements: [
        [{ id: 'child-' + ts + '-a', type: 'text', text: 'First column content', url: '' }],
        [{ id: 'child-' + ts + '-b', type: 'text', text: 'Second column content', url: '' }],
        [{ id: 'child-' + ts + '-c', type: 'text', text: 'Third column content', url: '' }]
      ],
      container_background: '#f7f6f2',
      container_elements: [
        { id: 'nested-' + ts + '-h', type: 'heading', text: 'Container heading', url: '' },
        { id: 'nested-' + ts + '-p', type: 'text', text: 'Add content inside this container.', url: '' }
      ],
      background: type === 'section' ? '#f7f6f2' : '',
      bg_gradient_enabled: false,
      bg_gradient_start: '#f7f3e8',
      bg_gradient_end: '#ffffff',
      bg_gradient_angle: 135,
      text_color: '#202124',
      border_color: '#d9d9d9',
      border_width: 0,
      border_style: 'solid',
      border_radius: 0,
      box_shadow: 'none',
      spacer_height: 48,
      divider_color: '#d9d9d9',
      divider_width: 100,
      quote_author: '',
      blurb_icon: '✦',
      blurb_body: 'Describe the benefit or service in a sentence or two.',
      callout_body: 'Tell visitors what to do next and why it matters.',
      callout_label: 'Get started',
      gallery_urls: '',
      // 11 New Modules
      accordion_items: [
        { id: 'acc-' + ts + '-1', title: 'How quickly can we deploy?', body: 'Most software, networking, and CCTV rollouts begin within 48 hours of scoping.' },
        { id: 'acc-' + ts + '-2', title: 'Do you provide ongoing support?', body: 'Yes — every RSS Prism & infrastructure engagement includes structured maintenance.' }
      ],
      tabs_items: [
        { id: 'tab-' + ts + '-1', title: 'Overview', body: 'Streamlined visual layout building with full responsive control.' },
        { id: 'tab-' + ts + '-2', title: 'Security', body: 'Built with clean HTML escaping, role checks, and verified licensing.' },
        { id: 'tab-' + ts + '-3', title: 'Support', body: 'Direct technical guidance from Razeen Secure Solution.' }
      ],
      pricing_currency: '$',
      pricing_price: '49',
      pricing_period: '/ year',
      pricing_badge: 'Most Popular',
      pricing_features: 'Unlimited visual pages\nResponsive desktop, tablet & mobile\n60 Divi-style modules\nExport & import JSON backups',
      pricing_featured: false,
      testimonial_author: 'A. Customer',
      testimonial_role: 'Operations Lead',
      testimonial_avatar: '',
      testimonial_rating: 5,
      counter_number: 150,
      counter_prefix: '',
      counter_suffix: '+',
      bar_percent: 85,
      bar_color: '#2b87da',
      bar_track_color: '#e5e7eb',
      video_url: '',
      countdown_target: defaultCountdown,
      icon_list_items: 'Rapid installation & clean cable management\nSecure remote access & cloud backup\nDedicated post-launch technical support',
      icon_list_symbol: '✓',
      form_button_label: 'Send Message',
      form_success_message: 'Thank you — your message has been received.',
      social_links: [
        { network: 'website', label: 'Website', url: 'https://www.rsscctvsolution.eu.cc/' },
        { network: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
        { network: 'email', label: 'Email RSS', url: 'mailto:rsscctvsolution@gmail.com' }
      ],
      // Typography, Spacing & Animation
      font_size: fontSize,
      font_weight: '600',
      line_height: 1.5,
      letter_spacing: 0,
      text_transform: 'none',
      align: 'left',
      padding: 24,
      margin_top: 0,
      margin_bottom: 12,
      max_width_pct: 100,
      opacity_pct: 100,
      hover_lift: 0,
      animation: 'none',
      animation_duration: 650,
      animation_delay: 0,
      hide_desktop: false,
      hide_tablet: false,
      hide_mobile: false,
      custom_class: '',
      custom_id: '',
      responsive,
      ...(MOD.extraFreshDefaults ? MOD.extraFreshDefaults(ts) : {})
    };
  };

  const clone = value => JSON.parse(JSON.stringify(value));

  const normalizedColumnElements = entry => Array.from({ length: Number(entry.columns_count || 2) }, (_, index) => {
    const children = entry.column_elements && entry.column_elements[index];
    if (Array.isArray(children) && children.length) return clone(children);
    const legacy = (entry.column_contents || [])[index];
    return legacy ? [{ id: 'legacy-column-' + index, type: 'text', text: legacy, url: '' }] : [];
  });

  const gridTemplateFor = entry => {
    const count = Math.min(3, Math.max(1, Number(entry.columns_count || 2)));
    const layout = entry.column_layout || (count === 3 ? '33-33-33' : count === 1 ? '100' : '50-50');
    if (count === 1 || layout === '100') return 'minmax(0,1fr)';
    if (count === 2) {
      if (layout === '66-33') return 'minmax(0,2fr) minmax(0,1fr)';
      if (layout === '33-66') return 'minmax(0,1fr) minmax(0,2fr)';
      return 'repeat(2,minmax(0,1fr))';
    }
    return 'repeat(' + count + ',minmax(0,1fr))';
  };

  const nodeToneFor = type => {
    if (type === 'section') return 'section';
    if (type === 'columns' || type === 'container') return 'row';
    return 'module';
  };

  function App() {
    const [items, setItems] = useState(Array.isArray(config.layout) ? config.layout : []);
    const [selected, setSelected] = useState(0);
    const [inlineEditing, setInlineEditing] = useState(false);
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [copyTitle, setCopyTitle] = useState('');
    const [pageTitle, setPageTitle] = useState('');
    const [viewMode, setViewMode] = useState('desktop'); // 'wireframe' | 'desktop' | 'tablet' | 'mobile'
    const [designPreset, setDesignPreset] = useState('rss-gold');
    const [history, setHistory] = useState([]);
    const [future, setFuture] = useState([]);
    const [autosaveStatus, setAutosaveStatus] = useState('Ready');
    const [restoreVersions, setRestoreVersions] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem('rss-prism-history-' + config.postId) || '[]').slice(0, 20);
      } catch {
        return [];
      }
    });

    // Divi UI states
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('content'); // 'content' | 'design' | 'advanced'
    const [settingsFloating, setSettingsFloating] = useState(false);
    const [layersOpen, setLayersOpen] = useState(false);
    const [insertAt, setInsertAt] = useState(null);
    const [insertTab, setInsertTab] = useState('modules');
    const [moduleCategory, setModuleCategory] = useState('all');
    const [moduleSearch, setModuleSearch] = useState('');
    const [colPickerIndex, setColPickerIndex] = useState(null);
    const [utilityModal, setUtilityModal] = useState(null);

    const THEME_STORAGE_KEY = 'rss-prism-builder-theme';
    const resolveInitialTheme = () => {
      const attr = document.documentElement.dataset.rpBuilderTheme;
      if (attr === 'dark' || attr === 'light') return attr;
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
      } catch {}
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    };
    const [builderTheme, setBuilderThemeState] = useState(resolveInitialTheme);

    const applyBuilderTheme = next => {
      const mode = next === 'dark' ? 'dark' : 'light';
      if (typeof window.rssPrismSetBuilderTheme === 'function') {
        window.rssPrismSetBuilderTheme(mode);
      } else {
        document.documentElement.dataset.rpBuilderTheme = mode;
        try { localStorage.setItem(THEME_STORAGE_KEY, mode); } catch {}
        window.dispatchEvent(new CustomEvent('rp-builder-theme-change', { detail: { theme: mode } }));
      }
      setBuilderThemeState(mode);
    };

    useEffect(() => {
      if (!document.documentElement.dataset.rpBuilderTheme) {
        document.documentElement.dataset.rpBuilderTheme = builderTheme;
      }
      const onThemeEvent = e => {
        const next = e && e.detail && e.detail.theme;
        if (next === 'dark' || next === 'light') setBuilderThemeState(next);
      };
      window.addEventListener('rp-builder-theme-change', onThemeEvent);
      return () => window.removeEventListener('rp-builder-theme-change', onThemeEvent);
    }, []);

    // Enhanced Divi Edit & Interactive States
    const [contextMenu, setContextMenu] = useState(null); // { index, x, y }
    const [copiedStyle, setCopiedStyle] = useState(null);
    const [copiedModule, setCopiedModule] = useState(null);
    const [animNonce, setAnimNonce] = useState({});
    const [openAccordion, setOpenAccordion] = useState({});
    const [activeTabMap, setActiveTabMap] = useState({});
    const [toggleOpenMap, setToggleOpenMap] = useState({});
    const [activeSlideMap, setActiveSlideMap] = useState({});
    const [filterCatMap, setFilterCatMap] = useState({});
    const [compareSplitMap, setCompareSplitMap] = useState({});
    const [tickNow, setTickNow] = useState(Date.now());

    const previousItems = useRef(clone(Array.isArray(config.layout) ? config.layout : []));
    const firstAutosave = useRef(true);
    const activeDevice = viewMode === 'wireframe' ? 'desktop' : viewMode;

    useEffect(() => {
      const hasCountdown = items.some(it => it.type === 'countdown');
      if (!hasCountdown) return undefined;
      const timer = window.setInterval(() => setTickNow(Date.now()), 1000);
      return () => window.clearInterval(timer);
    }, [items]);

    const commitItems = next => {
      setHistory(old => [...old.slice(-29), clone(items)]);
      setFuture([]);
      setItems(typeof next === 'function' ? next(items) : next);
    };

    const item = items[selected] || null;

    const update = (key, value) => commitItems(old => old.map((entry, i) => {
      if (i !== selected) return entry;
      if (['font_size', 'padding', 'align'].includes(key)) {
        const responsive = clone(entry.responsive || {});
        ['desktop', 'tablet', 'mobile'].forEach(device => {
          if (!responsive[device]) {
            responsive[device] = { font_size: entry.font_size || 16, padding: entry.padding ?? 24, align: entry.align || 'left' };
          }
        });
        responsive[activeDevice] = { ...responsive[activeDevice], [key]: value };
        return { ...entry, [key]: value, responsive };
      }
      return { ...entry, [key]: value };
    }));

    const updateAt = (index, key, value) => commitItems(old => old.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry)));

    const updateMultipleAt = (index, fields) => {
      commitItems(old => old.map((entry, i) => (i === index ? { ...entry, ...fields } : entry)));
    };

    const replayAnimationFor = entry => {
      if (!entry || !entry.id) return;
      setAnimNonce(prev => ({ ...prev, [entry.id]: (prev[entry.id] || 0) + 1 }));
    };

    const add = (type, atIndex = null) => {
      const freshEl = fresh(type);
      let newIndex = items.length;
      if (atIndex !== null && atIndex >= 0 && atIndex <= items.length) {
        const next = items.slice();
        next.splice(atIndex, 0, freshEl);
        newIndex = atIndex;
        commitItems(next);
      } else {
        commitItems([...items, freshEl]);
      }
      setSelected(newIndex);
      setInsertAt(null);
      setSettingsOpen(true);
      setSettingsTab('content');
      setNotice('');
    };

    const copyStyleFrom = index => {
      const src = items[index];
      if (!src) return;
      const styles = {};
      STYLE_CLIPBOARD_KEYS.forEach(k => {
        if (src[k] !== undefined) styles[k] = clone(src[k]);
      });
      setCopiedStyle(styles);
      setContextMenu(null);
      setNotice('Copied styles from "' + (TYPES[src.type]?.label || src.type) + '".');
    };

    const pasteStyleTo = index => {
      if (!copiedStyle || !items[index]) return;
      updateMultipleAt(index, clone(copiedStyle));
      replayAnimationFor(items[index]);
      setContextMenu(null);
      setNotice('Pasted styles onto "' + (TYPES[items[index].type]?.label || items[index].type) + '".');
    };

    const copyModuleFrom = index => {
      const src = items[index];
      if (!src) return;
      setCopiedModule(clone(src));
      setContextMenu(null);
      setNotice('Copied "' + (TYPES[src.type]?.label || src.type) + '" module.');
    };

    const pasteModuleAfter = index => {
      if (!copiedModule) return;
      const copy = clone(copiedModule);
      copy.id = 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const next = items.slice();
      const targetIdx = Math.min(next.length, Math.max(0, index + 1));
      next.splice(targetIdx, 0, copy);
      commitItems(next);
      setSelected(targetIdx);
      setContextMenu(null);
      setNotice('Pasted module below.');
    };

    const toggleHideOnActiveDevice = index => {
      const entry = items[index];
      if (!entry) return;
      const key = activeDevice === 'tablet' ? 'hide_tablet' : activeDevice === 'mobile' ? 'hide_mobile' : 'hide_desktop';
      updateAt(index, key, !entry[key]);
      setContextMenu(null);
    };

    const applyDesignPreset = key => {
      const preset = DESIGN_PRESETS[key];
      if (!preset) return;
      commitItems(items.map(entry => {
        const next = { ...entry, text_color: preset.text, padding: preset.padding, border_radius: preset.radius };
        if (['section', 'container', 'columns', 'quote'].includes(entry.type)) next.background = preset.background;
        if (entry.type === 'container') next.container_background = preset.surface;
        if (['button', 'callout', 'pricing_table', 'contact_form', 'social_follow'].includes(entry.type)) {
          next.button_bg = preset.accent;
          next.button_text = preset.buttonText;
          next.button_radius = preset.radius;
        }
        if (entry.type === 'divider') next.divider_color = preset.accent;
        if (entry.type === 'bar_counter') next.bar_color = preset.accent;
        if (entry.responsive) {
          next.responsive = clone(entry.responsive);
          ['desktop', 'tablet', 'mobile'].forEach(device => {
            next.responsive[device] = { ...(next.responsive[device] || {}), padding: preset.padding };
          });
        }
        return next;
      }));
      setUtilityModal(null);
      setNotice(preset.label + ' global styling applied across ' + items.length + ' elements.');
    };

    const insertStarter = kind => {
      const library = {
        business: [['section', 'Razeen Secure Solution'], ['heading', 'Developing Ideas. Delivering Solutions.'], ['text', 'Software development, CCTV solutions, networking, cloud services, and practical AI solutions.'], ['columns', ''], ['heading', 'A practical technology partner'], ['text', 'Reliable implementation, clear communication, and security-conscious solutions for every project.'], ['button', 'Explore RSS']],
        services: [['section', 'Our Services'], ['heading', 'Technology that works for your business'], ['columns', ''], ['text', 'CCTV installation, networking, software development, system administration, troubleshooting, and technical support.'], ['button', 'Discuss a project']],
        contact: [['section', 'Contact Razeen Secure Solution'], ['heading', 'Let’s discuss your project'], ['text', 'Email: rsscctvsolution@gmail.com\nPhone: 077 115 5504 | 070 155 5504\nWebsite: www.rsscctvsolution.eu.cc'], ['contact_form', 'Send Us a Message']],
        about: [['section', 'About Razeen Secure Solution'], ['heading', 'Developing Ideas. Delivering Solutions.'], ['text', 'Razeen Secure Solution (RSS) has delivered technology services since 2015, helping people and businesses turn ideas into practical digital and security solutions.'], ['columns', ''], ['heading', 'Our approach'], ['text', 'Clear communication, thoughtful implementation, and dependable support.'], ['button', 'Get in touch']],
        projects: [['section', 'RSS Projects & Solutions'], ['heading', 'A connected ecosystem of useful tools'], ['text', 'Explore RSS software and service projects across productivity, money management, cloud tools, AI-assisted workflows, and security systems.'], ['columns', ''], ['heading', 'Software & AI'], ['text', 'Purpose-built software, automation, and practical AI solutions.'], ['heading', 'Security & infrastructure'], ['text', 'CCTV, networking, system administration, and troubleshooting.'], ['button', 'View RSS website']],
        security: [['section', 'Security-first solutions'], ['heading', 'Protect systems. Improve visibility.'], ['text', 'Security-conscious CCTV installation, network setup, system administration, and software practices designed around reliability and responsible access.'], ['columns', ''], ['heading', 'Assess'], ['text', 'Understand the site, systems, and requirements.'], ['heading', 'Implement'], ['text', 'Configure solutions with clear access boundaries.'], ['heading', 'Support'], ['text', 'Troubleshoot and maintain the result.'], ['button', 'Contact RSS']]
      };
      const specs = library[kind] || library.business;
      const additions = specs.map(([type, text]) => {
        const entry = fresh(type);
        if (text) entry.text = text;
        if (type === 'columns') {
          entry.columns_count = 3;
          entry.column_layout = '33-33-33';
          const titles = kind === 'about' ? ['Experience since 2015', 'Practical solutions', 'Dependable support'] : kind === 'security' ? ['Assess', 'Implement', 'Support'] : kind === 'projects' ? ['Software & AI', 'Productivity tools', 'Security & infrastructure'] : ['Software & AI solutions', 'CCTV & networking', 'Cloud & system support'];
          entry.column_contents = titles;
          entry.column_elements = titles.map((title, i) => [
            { id: 'child-' + Date.now() + '-' + i, type: 'heading', text: title, url: '' },
            { id: 'child-' + Date.now() + '-t' + i, type: 'text', text: ['Plan the right approach for your needs.', 'Build a reliable, maintainable solution.', 'Keep systems useful with ongoing support.'][i], url: '' }
          ]);
        }
        if (type === 'button') entry.url = kind === 'contact' ? 'mailto:rsscctvsolution@gmail.com' : 'https://www.rsscctvsolution.eu.cc/';
        return entry;
      });
      const next = [...items, ...additions];
      commitItems(next);
      setSelected(items.length);
      setInsertAt(null);
      setNotice('Added "' + (STARTER_META.find(m => m.key === kind)?.label || 'Starter layout') + '" sections to the canvas.');
    };

    const move = (from, to) => {
      if (to < 0 || to >= items.length || from === to) return;
      const next = items.slice();
      const [entry] = next.splice(from, 1);
      next.splice(to, 0, entry);
      commitItems(next);
      setSelected(to);
    };

    const remove = index => {
      commitItems(items.filter((_, i) => i !== index));
      setSelected(Math.max(0, Math.min(selected, items.length - 2)));
      setContextMenu(null);
      if (items.length <= 1) setSettingsOpen(false);
    };

    const undo = () => {
      if (!history.length) return;
      setFuture(old => [clone(items), ...old]);
      setItems(history[history.length - 1]);
      setHistory(old => old.slice(0, -1));
    };

    const redo = () => {
      if (!future.length) return;
      setHistory(old => [...old, clone(items)]);
      setItems(future[0]);
      setFuture(old => old.slice(1));
    };

    const duplicate = index => {
      const next = items.slice();
      const copy = clone(next[index]);
      copy.id = 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      next.splice(index + 1, 0, copy);
      commitItems(next);
      setSelected(index + 1);
      setContextMenu(null);
    };

    const save = async () => {
      setBusy(true);
      setNotice('');
      try {
        const response = await fetch(config.restUrl, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
          body: JSON.stringify({ post_id: config.postId, layout: items })
        });
        const result = await response.json();
        if (!response.ok || !result.saved) throw new Error(result.message || 'Save failed.');
        setAutosaveStatus('Saved at ' + new Date().toLocaleTimeString());
        setNotice('Layout saved. You can publish or preview your page anytime.');
      } catch (error) {
        setNotice(error.message || 'Could not save the layout.');
      } finally {
        setBusy(false);
      }
    };

    useEffect(() => {
      const onGlobalClick = () => {
        if (contextMenu) setContextMenu(null);
      };
      const onKeyDown = event => {
        if (event.key === 'Escape') {
          setInsertAt(null);
          setColPickerIndex(null);
          setUtilityModal(null);
          setContextMenu(null);
          return;
        }
        const target = event.target;
        if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && items[selected]) {
          event.preventDefault();
          duplicate(selected);
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault();
          undo();
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
          event.preventDefault();
          redo();
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          save();
        }
      };
      window.addEventListener('click', onGlobalClick);
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('click', onGlobalClick);
        window.removeEventListener('keydown', onKeyDown);
      };
    });

    const chooseImage = (fieldKey = 'image_url', altKey = 'alt') => {
      if (!window.wp || !wp.media) {
        setNotice('The Media Library is not available on this screen.');
        return;
      }
      const frame = wp.media({ title: 'Choose an image', button: { text: 'Use image' }, library: { type: 'image' }, multiple: false });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        const fields = { [fieldKey]: attachment.url || '' };
        if (altKey && !item[altKey] && attachment.alt) fields[altKey] = attachment.alt;
        commitItems(items.map((entry, index) => (index !== selected ? entry : { ...entry, ...fields })));
      });
      frame.open();
    };

    const exportLayout = () => {
      try {
        const payload = { format: 'rss-prism-layout', version: 1, exported_at: new Date().toISOString(), source_template_id: config.postId, layout: items };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rss-prism-layout-' + config.postId + '.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setNotice('Layout JSON exported.');
      } catch {
        setNotice('Could not export the layout in this browser.');
      }
    };

    const normalizeImported = (entries, depth = 0) => {
      if (!Array.isArray(entries) || entries.length > (depth === 0 ? 100 : 20)) throw new Error('The layout contains too many elements.');
      const allowed = depth === 0 ? Object.keys(TYPES) : ['heading', 'text', 'button', 'image'].concat(depth < 2 ? ['container'] : []);
      return entries.map((entry, index) => {
        if (!entry || typeof entry !== 'object' || !allowed.includes(entry.type)) throw new Error('Unsupported element found in the JSON file.');
        const clean = { ...entry, id: 'import-' + Date.now() + '-' + depth + '-' + index + '-' + Math.random().toString(36).slice(2, 6) };
        if (entry.type === 'container') clean.container_elements = normalizeImported(entry.container_elements || [], depth + 1);
        if (entry.type === 'columns') {
          clean.columns_count = Math.min(3, Math.max(1, Number(entry.columns_count || 2)));
          clean.column_elements = Array.from({ length: clean.columns_count }, (_, column) => {
            const children = entry.column_elements && entry.column_elements[column];
            if (!Array.isArray(children)) return [];
            if (children.length > 12 || children.some(child => !child || !['heading', 'text', 'button', 'image'].includes(child.type))) {
              throw new Error('Invalid column content in the JSON file.');
            }
            return children.map((child, childIndex) => ({ ...child, id: 'import-column-' + Date.now() + '-' + column + '-' + childIndex }));
          });
        }
        return clean;
      });
    };

    const importLayout = event => {
      const file = event.target.files && event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (file.size > 1024 * 1024) {
        setNotice('Import rejected: layout JSON must be smaller than 1 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ''));
          const entries = Array.isArray(parsed) ? parsed : parsed && parsed.format === 'rss-prism-layout' && parsed.version === 1 ? parsed.layout : null;
          if (!Array.isArray(entries)) throw new Error('This is not a supported RSS Prism layout JSON file.');
          const next = normalizeImported(entries);
          commitItems(next);
          setSelected(0);
          setUtilityModal(null);
          setNotice('Imported ' + next.length + ' elements.');
        } catch (error) {
          setNotice(error.message || 'Could not read this layout JSON file.');
        }
      };
      reader.readAsText(file);
    };

    useEffect(() => {
      if (firstAutosave.current) {
        firstAutosave.current = false;
        return undefined;
      }
      const snapshot = clone(previousItems.current);
      const current = clone(items);
      previousItems.current = current;
      try {
        const key = 'rss-prism-history-' + config.postId;
        let stored = [];
        try { stored = JSON.parse(localStorage.getItem(key) || '[]'); } catch { stored = []; }
        const versions = [{ id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), saved_at: new Date().toISOString(), layout: snapshot }, ...(Array.isArray(stored) ? stored : [])].slice(0, 20);
        localStorage.setItem(key, JSON.stringify(versions));
        setRestoreVersions(versions);
      } catch {
        // Ignore storage quota errors
      }
      const timer = window.setTimeout(async () => {
        setAutosaveStatus('Saving…');
        try {
          const response = await fetch(config.restUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
            body: JSON.stringify({ post_id: config.postId, layout: current })
          });
          const result = await response.json();
          if (!response.ok || !result.saved) throw new Error(result.message || 'Autosave failed.');
          setAutosaveStatus('Autosaved ' + new Date().toLocaleTimeString());
        } catch {
          setAutosaveStatus('Autosave failed');
        }
      }, 1200);
      return () => window.clearTimeout(timer);
    }, [items]);

    const restoreVersion = version => {
      if (!version || !Array.isArray(version.layout)) return;
      commitItems(clone(version.layout));
      setSelected(0);
      setUtilityModal(null);
      setNotice('Restored saved version in editor.');
    };

    const createWordPressPage = async () => {
      const title = pageTitle.trim();
      if (!title) {
        setNotice('Enter a title for the page first.');
        return;
      }
      setBusy(true);
      try {
        const response = await fetch(config.publishUrl, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
          body: JSON.stringify({ post_id: config.postId, page_title: title, layout: items })
        });
        const result = await response.json();
        if (!response.ok || !result.created || !result.edit_url) throw new Error(result.message || 'Could not create the page.');
        window.location.href = result.edit_url;
      } catch (error) {
        setNotice(error.message || 'Could not create the page.');
        setBusy(false);
      }
    };

    const copyTemplate = async () => {
      const title = copyTitle.trim();
      if (!title) {
        setNotice('Enter a name for the reusable template first.');
        return;
      }
      setBusy(true);
      try {
        const response = await fetch(config.copyUrl, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
          body: JSON.stringify({ post_id: config.postId, title, layout: items })
        });
        const result = await response.json();
        if (!response.ok || !result.created || !result.edit_url) throw new Error(result.message || 'Could not copy template.');
        window.location.href = result.edit_url;
      } catch (error) {
        setNotice(error.message || 'Could not copy template.');
        setBusy(false);
      }
    };

    const field = (label, key, value, type = 'text', extra = {}) => h('label', { className: 'rss-prism-field' },
      h('span', null, label),
      h(type === 'textarea' ? 'textarea' : 'input', {
        type: type === 'textarea' ? undefined : type,
        value: value ?? '',
        onChange: e => update(key, (type === 'range' || type === 'number') ? Number(e.target.value) : e.target.value),
        rows: type === 'textarea' ? (extra.rows || 4) : undefined,
        min: type === 'range' ? (extra.min ?? 10) : extra.min,
        max: type === 'range' ? (extra.max ?? 96) : extra.max,
        step: extra.step,
        placeholder: extra.placeholder
      })
    );

    const mutateNested = (parentPath, callback) => {
      const rootChildren = clone(item.container_elements || []);
      let target = rootChildren;
      parentPath.forEach(index => {
        target = target[index] && Array.isArray(target[index].container_elements) ? target[index].container_elements : [];
      });
      callback(target);
      update('container_elements', rootChildren);
    };

    const chooseNestedImage = (parentPath, childIndex) => {
      if (!window.wp || !wp.media) return;
      const frame = wp.media({ title: 'Choose an image for this element', button: { text: 'Use image' }, library: { type: 'image' }, multiple: false });
      frame.on('select', () => {
        const attachment = frame.state().get('selection').first().toJSON();
        mutateNested(parentPath, list => {
          if (!list[childIndex]) return;
          list[childIndex].image_url = attachment.url || '';
          if (!list[childIndex].alt && attachment.alt) list[childIndex].alt = attachment.alt;
        });
      });
      frame.open();
    };

    const nestedEditor = (children, parentPath, depth) => h('div', { className: 'rss-prism-nested-editor rss-prism-nested-depth-' + depth },
      ...(children || []).map((child, index) => h('div', {
        className: 'rss-prism-nested-child',
        key: child.id || index,
        draggable: true,
        onDragStart: e => { e.dataTransfer.setData('text/plain', JSON.stringify({ path: parentPath, index })); e.dataTransfer.effectAllowed = 'move'; },
        onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
        onDrop: e => {
          e.preventDefault();
          let source;
          try { source = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
          if (!source || JSON.stringify(source.path) !== JSON.stringify(parentPath) || source.index === index) return;
          mutateNested(parentPath, list => {
            if (!Number.isInteger(source.index) || source.index < 0 || source.index >= list.length) return;
            const moved = list.splice(source.index, 1)[0];
            list.splice(index, 0, moved);
          });
        }
      },
        h('div', { className: 'rss-prism-nested-child-toolbar' },
          h('strong', null, (child.type === 'container' ? 'Nested container ' : 'Element ') + (index + 1)),
          h('button', { type: 'button', className: 'button-link', disabled: index === 0, onClick: () => mutateNested(parentPath, list => { const m = list.splice(index, 1)[0]; list.splice(index - 1, 0, m); }) }, '↑'),
          h('button', { type: 'button', className: 'button-link', disabled: index === children.length - 1, onClick: () => mutateNested(parentPath, list => { const m = list.splice(index, 1)[0]; list.splice(index + 1, 0, m); }) }, '↓'),
          h('button', { type: 'button', className: 'button-link-delete', onClick: () => mutateNested(parentPath, list => list.splice(index, 1)) }, 'Remove')
        ),
        h('label', { className: 'rss-prism-field' }, h('span', null, 'Type'),
          h('select', {
            value: child.type || 'text',
            onChange: e => mutateNested(parentPath, list => {
              list[index].type = e.target.value;
              if (e.target.value === 'container') {
                list[index].container_background = list[index].container_background || '#f7f6f2';
                list[index].container_elements = Array.isArray(list[index].container_elements) ? list[index].container_elements : [{ id: 'nested-' + Date.now(), type: 'text', text: 'Nested content', url: '' }];
              }
            })
          }, ...([['heading', 'Heading'], ['text', 'Text'], ['button', 'Button'], ['image', 'Image']].concat(depth < 2 ? [['container', 'Nested container']] : [])).map(([value, label]) => h('option', { key: value, value }, label)))
        ),
        child.type === 'container' ? h('div', { className: 'rss-prism-image-controls' },
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Container background'), h('input', { type: 'color', value: child.container_background || '#f7f6f2', onChange: e => mutateNested(parentPath, list => { list[index].container_background = e.target.value; }) })),
          nestedEditor(child.container_elements || [], [...parentPath, index], depth + 1)
        ) : h('label', { className: 'rss-prism-field' }, h('span', null, 'Content'), h('textarea', { rows: 2, value: child.text || '', onChange: e => mutateNested(parentPath, list => { list[index].text = e.target.value; }) })),
        child.type === 'button' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Button URL'), h('input', { type: 'url', value: child.url || '', onChange: e => mutateNested(parentPath, list => { list[index].url = e.target.value; }) })) : null,
        child.type === 'image' ? h('div', { className: 'rss-prism-image-controls' },
          h('button', { type: 'button', className: 'button', onClick: () => chooseNestedImage(parentPath, index) }, child.image_url ? 'Replace image' : 'Choose from Media Library'),
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Image URL'), h('input', { type: 'url', value: child.image_url || '', onChange: e => mutateNested(parentPath, list => { list[index].image_url = e.target.value; }) })),
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Alt text'), h('input', { type: 'text', value: child.alt || '', onChange: e => mutateNested(parentPath, list => { list[index].alt = e.target.value; }) }))
        ) : null
      )),
      h('div', { className: 'rss-prism-nested-add-actions' },
        ...([['heading', '+ Heading'], ['text', '+ Text'], ['button', '+ Button'], ['image', '+ Image']].concat(depth < 2 ? [['container', '+ Container']] : [])).map(([type, label]) =>
          h('button', {
            key: type,
            type: 'button',
            className: 'button button-small',
            disabled: (children || []).length >= 20,
            onClick: () => mutateNested(parentPath, list => list.push({
              id: 'nested-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
              type,
              text: type === 'heading' ? 'New heading' : type === 'button' ? 'Learn more' : type === 'image' ? 'Image description' : type === 'container' ? '' : 'New nested content',
              url: '',
              image_url: '',
              alt: '',
              container_background: '#f7f6f2',
              container_elements: type === 'container' ? [{ id: 'nested-child-' + Date.now(), type: 'text', text: 'Nested content', url: '' }] : undefined
            }))
          }, label)
        )
      )
    );

    const renderModuleBody = (entry, i) => {
      const deviceStyle = (entry.responsive && entry.responsive[activeDevice]) || entry;
      const bw = Number(entry.border_width) || 0;
      const borderStyle = bw > 0 ? bw + 'px ' + (entry.border_style || 'solid') + ' ' + (entry.border_color || '#d9d9d9') : undefined;
      const backgroundVal = entry.bg_gradient_enabled
        ? 'linear-gradient(' + (Number(entry.bg_gradient_angle ?? 135)) + 'deg, ' + (entry.bg_gradient_start || '#f7f3e8') + ', ' + (entry.bg_gradient_end || '#ffffff') + ')'
        : (entry.background || 'transparent');
      const animName = entry.animation && entry.animation !== 'none' ? 'rp-anim-' + entry.animation : null;
      const animString = animName
        ? animName + ' ' + (Number(entry.animation_duration) || 650) + 'ms ease ' + (Number(entry.animation_delay) || 0) + 'ms both'
        : undefined;
      const lift = Number(entry.hover_lift) || 0;

      const style = {
        padding: (Number(deviceStyle.padding ?? entry.padding) || 0) + 'px',
        marginTop: (Number(entry.margin_top) || 0) + 'px',
        marginBottom: (Number(entry.margin_bottom ?? 12)) + 'px',
        maxWidth: (Number(entry.max_width_pct ?? 100)) + '%',
        marginInline: 'auto',
        opacity: (Number(entry.opacity_pct ?? 100)) / 100,
        background: backgroundVal,
        color: entry.text_color || '#202124',
        fontSize: (Number(deviceStyle.font_size ?? entry.font_size) || 16) + 'px',
        fontWeight: entry.font_weight || undefined,
        lineHeight: Number(entry.line_height || 1.5),
        letterSpacing: (Number(entry.letter_spacing) || 0) + 'px',
        textTransform: entry.text_transform || 'none',
        textAlign: deviceStyle.align || entry.align || 'left',
        borderRadius: (Number(entry.border_radius) || 0) + 'px',
        border: borderStyle,
        boxShadow: entry.box_shadow && entry.box_shadow !== 'none' ? boxShadowCss(entry.box_shadow) : undefined,
        animation: animString,
        '--rp-lift': lift,
        boxSizing: 'border-box',
        overflowWrap: 'anywhere'
      };

      const editable = i === selected && inlineEditing && INLINE_EDITABLE_TYPES.includes(entry.type);
      const inlineProps = {
        contentEditable: editable,
        suppressContentEditableWarning: true,
        spellCheck: editable,
        onBlur: e => {
          if (editable) {
            const value = e.currentTarget.innerText.replace(/\r/g, '');
            if (value !== (entry.text || '')) update('text', value);
            setInlineEditing(false);
          }
        },
        onKeyDown: e => {
          if (e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === 'Enter' && entry.type !== 'text') { e.preventDefault(); e.currentTarget.blur(); }
        }
      };

      const cls = 'rss-prism-live-element' + (editable ? ' is-inline-editing' : '') + (lift > 0 ? ' rp-divi-hover-lift' : '');
      const animKey = (entry.id || i) + '-' + (animNonce[entry.id] || 0) + '-' + (entry.animation || 'none');

      if (entry.type === 'heading') {
        return h('h2', { key: animKey, className: cls, style: { ...style, fontWeight: entry.font_weight || '700' }, ...inlineProps }, entry.text || 'Heading');
      }
      if (entry.type === 'text') {
        return h('p', { key: animKey, className: cls, style: { ...style, marginTop: style.marginTop, marginBottom: style.marginBottom }, ...inlineProps }, entry.text || 'Text');
      }
      if (entry.type === 'button') {
        return h('div', { key: animKey, className: cls, style },
          h('span', { className: 'rss-prism-live-button', style: { background: entry.button_bg || '#b88a2b', color: entry.button_text || '#ffffff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' }, ...inlineProps }, entry.text || 'Button')
        );
      }
      if (entry.type === 'divider') {
        return h('div', { key: animKey, className: cls, style: { ...style, padding: '8px 0' } },
          h('span', { style: { display: 'inline-block', width: Math.min(100, Math.max(10, Number(entry.divider_width || 100))) + '%', borderTop: '2px solid ' + (entry.divider_color || '#d9d9d9') } })
        );
      }
      if (entry.type === 'spacer') {
        return h('div', { key: animKey, className: cls + ' rss-prism-live-spacer', style: { ...style, padding: 0, height: Math.min(300, Math.max(8, Number(entry.spacer_height || 48))) + 'px', background: 'repeating-linear-gradient(135deg,#f8fafc,#f8fafc 5px,#eef2f6 5px,#eef2f6 6px)' } }, 'Spacer · ' + (entry.spacer_height || 48) + 'px');
      }
      if (entry.type === 'quote') {
        return h('blockquote', { key: animKey, className: cls, style: { ...style, borderLeft: '4px solid #b88a2b', fontStyle: 'italic' } },
          h('span', inlineProps, entry.text || 'Quote'),
          entry.quote_author ? h('cite', { style: { display: 'block', marginTop: '8px', fontStyle: 'normal', fontSize: '0.85em', opacity: 0.75 } }, entry.quote_author) : null
        );
      }
      if (entry.type === 'blurb') {
        return h('article', { key: animKey, className: cls, style: { ...style, border: borderStyle || '1px solid #e5e7eb', borderRadius: (Number(entry.border_radius) || 8) + 'px' } },
          h('span', { className: 'rss-prism-blurb-icon', 'aria-hidden': 'true' }, entry.blurb_icon || '✦'),
          h('h3', { ...inlineProps, style: { margin: '10px 0 6px', fontSize: '1.15em', color: 'inherit' } }, entry.text || 'Feature title'),
          h('p', { style: { margin: 0 } }, entry.blurb_body || 'Describe the benefit or service.')
        );
      }
      if (entry.type === 'callout') {
        return h('section', { key: animKey, className: cls + ' rss-prism-live-callout', style: { ...style, borderRadius: (Number(entry.border_radius) || 8) + 'px' } },
          h('h2', { ...inlineProps, style: { marginTop: 0, color: 'inherit' } }, entry.text || 'Ready to get started?'),
          h('p', null, entry.callout_body || 'Tell visitors what to do next.'),
          h('span', { className: 'rss-prism-live-button', style: { background: entry.button_bg || '#b88a2b', color: entry.button_text || '#fff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' } }, entry.callout_label || 'Get started')
        );
      }

      if (entry.type === 'accordion') {
        const acc = Array.isArray(entry.accordion_items) && entry.accordion_items.length
          ? entry.accordion_items
          : [{ id: 'def', title: 'Question 1', body: 'Answer details.' }];
        const activeIdx = openAccordion[entry.id] ?? 0;
        return h('div', { key: animKey, className: cls + ' rp-live-accordion', style },
          ...acc.map((row, idx) => h('div', { key: row.id || idx, className: 'rp-live-accordion-item' },
            h('button', {
              type: 'button',
              className: 'rp-live-accordion-trigger',
              onClick: e => {
                e.stopPropagation();
                setSelected(i);
                setOpenAccordion(prev => ({ ...prev, [entry.id]: activeIdx === idx ? -1 : idx }));
              }
            }, h('span', null, row.title || 'Item ' + (idx + 1)), h('span', null, activeIdx === idx ? '−' : '+')),
            activeIdx === idx ? h('div', { className: 'rp-live-accordion-body' }, row.body || '') : null
          ))
        );
      }

      if (entry.type === 'tabs') {
        const tabs = Array.isArray(entry.tabs_items) && entry.tabs_items.length
          ? entry.tabs_items
          : [{ id: 'def', title: 'Tab 1', body: 'First tab content.' }];
        const currentTab = Math.min(tabs.length - 1, activeTabMap[entry.id] ?? 0);
        return h('div', { key: animKey, className: cls + ' rp-live-tabs', style },
          h('div', { className: 'rp-live-tabs-nav' },
            ...tabs.map((t, idx) => h('button', {
              key: t.id || idx,
              type: 'button',
              className: 'rp-live-tab-btn' + (currentTab === idx ? ' is-active' : ''),
              onClick: e => {
                e.stopPropagation();
                setSelected(i);
                setActiveTabMap(prev => ({ ...prev, [entry.id]: idx }));
              }
            }, t.title || 'Tab ' + (idx + 1)))
          ),
          h('div', { style: { whiteSpace: 'pre-wrap' } }, (tabs[currentTab] && tabs[currentTab].body) || '')
        );
      }

      if (entry.type === 'pricing_table') {
        const features = String(entry.pricing_features || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const accent = entry.button_bg || '#b88a2b';
        return h('article', {
          key: animKey,
          className: cls + ' rp-live-pricing' + (entry.pricing_featured ? ' is-featured' : ''),
          style: { ...style, border: borderStyle || (entry.pricing_featured ? '2px solid ' + accent : '1px solid #e2e8f0'), borderRadius: (Number(entry.border_radius) || 12) + 'px' }
        },
          entry.pricing_badge ? h('span', { className: 'rp-live-pricing-badge', style: { background: accent } }, entry.pricing_badge) : null,
          h('h3', { ...inlineProps, style: { margin: '4px 0', color: 'inherit' } }, entry.text || 'Plan'),
          h('div', { className: 'rp-live-pricing-price' },
            (entry.pricing_currency || '$') + (entry.pricing_price || '49') + ' ',
            h('span', { style: { fontSize: '0.42em', fontWeight: 500, opacity: 0.7 } }, entry.pricing_period || '/ year')
          ),
          features.length ? h('ul', { className: 'rp-live-pricing-features' }, ...features.map((f, fIdx) => h('li', { key: fIdx }, f))) : null,
          h('span', { className: 'rss-prism-live-button', style: { background: accent, color: entry.button_text || '#fff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' } }, entry.callout_label || 'Choose Plan')
        );
      }

      if (entry.type === 'testimonial') {
        const rating = Math.min(5, Math.max(1, Number(entry.testimonial_rating || 5)));
        return h('article', {
          key: animKey,
          className: cls + ' rp-live-testimonial',
          style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 12) + 'px' }
        },
          h('div', { className: 'rp-live-testimonial-stars' }, '★'.repeat(rating)),
          h('p', { ...inlineProps, style: { fontStyle: 'italic', margin: 0 } }, entry.text || 'Customer review'),
          h('div', { className: 'rp-live-testimonial-meta' },
            entry.testimonial_avatar ? h('img', { src: entry.testimonial_avatar, alt: entry.testimonial_author || '' }) : null,
            h('div', null,
              h('strong', null, entry.testimonial_author || 'A. Customer'),
              h('div', { style: { fontSize: '12px', opacity: 0.75 } }, entry.testimonial_role || 'Operations Lead')
            )
          )
        );
      }

      if (entry.type === 'number_counter') {
        return h('div', { key: animKey, className: cls + ' rp-live-counter', style },
          h('div', { style: { fontSize: '2.4em', fontWeight: 800, lineHeight: 1.1, color: entry.button_bg || '#2b87da' } },
            (entry.counter_prefix || '') + String(entry.counter_number ?? 150) + (entry.counter_suffix || '')
          ),
          h('div', { ...inlineProps, style: { marginTop: '6px', fontWeight: 600 } }, entry.text || 'Projects Completed')
        );
      }

      if (entry.type === 'bar_counter') {
        const pct = Math.min(100, Math.max(0, Number(entry.bar_percent ?? 85)));
        return h('div', { key: animKey, className: cls + ' rp-live-bar', style },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '6px' } },
            h('span', inlineProps, entry.text || 'Completion'),
            h('span', null, pct + '%')
          ),
          h('div', { className: 'rp-live-bar-track', style: { background: entry.bar_track_color || '#e5e7eb' } },
            h('div', { className: 'rp-live-bar-fill', style: { width: pct + '%', background: entry.bar_color || '#2b87da' } })
          )
        );
      }

      if (entry.type === 'video') {
        const embed = toEmbedUrl(entry.video_url);
        return h('div', { key: animKey, className: cls, style },
          embed
            ? h('div', { className: 'rp-live-video-wrap' }, h('iframe', { src: embed, title: entry.text || 'Video', allowFullScreen: true }))
            : entry.video_url
              ? h('video', { src: entry.video_url, controls: true, style: { width: '100%', borderRadius: '10px' } })
              : h('span', { className: 'rss-prism-image-placeholder' }, 'Set a YouTube, Vimeo, or MP4 URL in Video settings')
        );
      }

      if (entry.type === 'countdown') {
        const cd = computeCountdown(entry.countdown_target, tickNow);
        return h('div', { key: animKey, className: cls + ' rp-live-countdown', style },
          h('h3', { ...inlineProps, style: { marginTop: 0, color: 'inherit' } }, entry.text || 'Launching Soon'),
          h('div', { className: 'rp-live-countdown-grid' },
            ...[['Days', cd.d], ['Hours', cd.h], ['Mins', cd.m], ['Secs', cd.s]].map(([lbl, val]) =>
              h('div', { key: lbl, className: 'rp-live-countdown-box' }, h('strong', null, val), h('span', null, lbl))
            )
          )
        );
      }

      if (entry.type === 'icon_list') {
        const lines = String(entry.icon_list_items || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        return h('ul', { key: animKey, className: cls + ' rp-live-icon-list', style },
          ...(lines.length ? lines : ['Add icon list items in Settings']).map((line, idx) =>
            h('li', { key: idx },
              h('span', { style: { color: entry.button_bg || '#b88a2b', fontWeight: 800 } }, entry.icon_list_symbol || '✓'),
              h('span', null, line)
            )
          )
        );
      }

      if (entry.type === 'contact_form') {
        return h('div', { key: animKey, className: cls + ' rp-live-contact-form', style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 10) + 'px' } },
          h('h3', { ...inlineProps, style: { margin: 0, color: 'inherit' } }, entry.text || 'Contact Us'),
          h('input', { type: 'text', placeholder: 'Your name', readOnly: true }),
          h('input', { type: 'email', placeholder: 'Email address', readOnly: true }),
          h('textarea', { rows: 3, placeholder: 'Message', readOnly: true }),
          h('span', { className: 'rss-prism-live-button', style: { justifySelf: 'start', background: entry.button_bg || '#b88a2b', color: entry.button_text || '#fff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' } }, entry.form_button_label || 'Send Message')
        );
      }

      if (entry.type === 'social_follow') {
        const links = Array.isArray(entry.social_links) && entry.social_links.length
          ? entry.social_links
          : [{ network: 'website', label: 'Website', url: 'https://www.rsscctvsolution.eu.cc/' }];
        return h('div', { key: animKey, className: cls + ' rp-live-social-follow', style },
          ...links.map((l, idx) => h('span', {
            key: idx,
            className: 'rp-live-social-pill',
            style: { background: entry.button_bg || '#2b87da', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' }
          }, l.label || l.network))
        );
      }

      const previewNested = (child, childIndex, depth = 0) => {
        const key = child.id || childIndex;
        if (child.type === 'container' && depth < 2) {
          return h('div', { key, style: { background: child.container_background || '#f7f6f2', border: '1px solid #e2e4e7', borderRadius: '8px', padding: '12px', margin: '10px 0' } },
            ...(Array.isArray(child.container_elements) ? child.container_elements : []).map((nested, ni) => previewNested(nested, ni, depth + 1))
          );
        }
        if (child.type === 'heading') return h('h3', { key, style: { margin: '0 0 8px' } }, child.text || 'Heading');
        if (child.type === 'button') return h('p', { key }, h('span', { className: 'rss-prism-live-button' }, child.text || 'Button'));
        if (child.type === 'image' && child.image_url) return h('p', { key }, h('img', { src: child.image_url, alt: child.alt || '', className: 'rss-prism-live-image' }));
        return h('p', { key, style: { margin: '0 0 8px' } }, child.text || 'Text');
      };

      if (entry.type === 'container') {
        return h('div', { key: animKey, className: cls, style: { ...style, background: entry.container_background || '#f7f6f2', border: borderStyle || '1px solid #e2e4e7', borderRadius: (Number(entry.border_radius) || 10) + 'px' } },
          ...(Array.isArray(entry.container_elements) ? entry.container_elements : []).map((child, childIndex) => previewNested(child, childIndex, 0))
        );
      }

      if (entry.type === 'columns') {
        const count = Math.min(3, Math.max(1, Number(entry.columns_count || 2)));
        return h('div', { key: animKey, className: cls + ' rss-prism-live-columns', style: { ...style, display: 'grid', gridTemplateColumns: gridTemplateFor(entry), gap: '14px' } },
          ...Array.from({ length: count }, (_, colIndex) => {
            const children = normalizedColumnElements(entry)[colIndex] || [];
            return h('div', { key: colIndex, className: 'rss-prism-live-column-cell' },
              children.length ? children.map((child, childIndex) =>
                child.type === 'heading' ? h('h3', { key: child.id || childIndex, style: { marginTop: 0 } }, child.text || 'Heading') :
                child.type === 'button' ? h('p', { key: child.id || childIndex }, h('span', { className: 'rss-prism-live-button' }, child.text || 'Button')) :
                child.type === 'image' ? (child.image_url ? h('img', { key: child.id || childIndex, className: 'rss-prism-column-image', src: child.image_url, alt: child.alt || '', style: { objectFit: child.image_fit === 'contain' ? 'contain' : 'cover', height: child.image_fit === 'contain' ? 'auto' : '180px' } }) : h('span', { key: child.id || childIndex, className: 'rss-prism-image-placeholder' }, 'Set image URL in Row settings')) :
                h('p', { key: child.id || childIndex, style: { margin: '0 0 6px' } }, child.text || 'Text')
              ) : h('span', { style: { color: '#94a3b8', fontSize: '12px' } }, 'Empty column — edit in Settings')
            );
          })
        );
      }

      if (entry.type === 'gallery') {
        const urls = String(entry.gallery_urls || '').split(/\n+/).map(u => u.trim()).filter(Boolean).slice(0, 12);
        return h('div', { key: animKey, className: cls, style },
          urls.length ? h('div', { className: 'rss-prism-gallery-grid' }, ...urls.map((url, idx) => h('img', { key: idx, src: url, alt: '' })))
            : h('span', { className: 'rss-prism-image-placeholder' }, 'Add image URLs in Gallery settings')
        );
      }

      if (entry.type === 'image') {
        return h('div', { key: animKey, className: cls, style },
          entry.image_url ? h('img', {
            src: entry.image_url,
            alt: entry.alt || '',
            className: 'rss-prism-live-image',
            style: { width: Math.min(100, Math.max(10, Number(entry.image_width ?? 100))) + '%', objectFit: entry.image_fit === 'contain' ? 'contain' : 'cover', height: entry.image_fit === 'contain' ? 'auto' : '240px', marginInline: 'auto' }
          }) : h('span', { className: 'rss-prism-image-placeholder' }, 'Choose an image in Image settings')
        );
      }

      if (MOD.renderExtraModuleBody) {
        const extraRendered = MOD.renderExtraModuleBody({
          h, entry, i, style, borderStyle, cls, animKey, inlineProps,
          state: {
            setSelected,
            toggleOpenMap, setToggleOpenMap,
            activeSlideMap, setActiveSlideMap,
            filterCatMap, setFilterCatMap,
            compareSplitMap, setCompareSplitMap
          },
          helpers: { toEmbedUrl }
        });
        if (extraRendered) return extraRendered;
      }

      return h('section', { key: animKey, className: cls, style, ...inlineProps }, entry.text || 'Section');
    };

    const isHiddenOnActiveDevice = entry => (
      (activeDevice === 'desktop' && entry.hide_desktop) ||
      (activeDevice === 'tablet' && entry.hide_tablet) ||
      (activeDevice === 'mobile' && entry.hide_mobile)
    );

    const openContextMenuAt = (e, i) => {
      e.preventDefault();
      e.stopPropagation();
      setSelected(i);
      const x = Math.min(window.innerWidth - 240, Math.max(12, e.clientX));
      const y = Math.min(window.innerHeight - 340, Math.max(12, e.clientY));
      setContextMenu({ index: i, x, y });
    };

    const renderDiviNode = (entry, i) => {
      const tone = nodeToneFor(entry.type);
      const isSelected = i === selected;
      const hiddenHere = isHiddenOnActiveDevice(entry);
      return h('div', {
        key: entry.id || i,
        className: 'rp-divi-node rp-divi-node--' + tone + (isSelected ? ' is-selected' : '') + (hiddenHere ? ' is-hidden-device' : ''),
        draggable: !inlineEditing,
        onContextMenu: e => openContextMenuAt(e, i),
        onDragStart: e => {
          if (inlineEditing) return;
          e.dataTransfer.setData('text/plain', String(i));
          e.dataTransfer.effectAllowed = 'move';
        },
        onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
        onDrop: e => {
          e.preventDefault();
          const payload = e.dataTransfer.getData('text/plain');
          const from = Number(payload);
          if (Number.isInteger(from) && String(from) === payload) move(from, i);
        },
        onClick: e => {
          e.stopPropagation();
          setContextMenu(null);
          setSelected(i);
          if (i !== selected) {
            setInlineEditing(false);
            setColPickerIndex(null);
          }
        },
        onDoubleClick: e => {
          e.stopPropagation();
          setSelected(i);
          if (INLINE_EDITABLE_TYPES.includes(entry.type)) {
            setInlineEditing(true);
          } else {
            setSettingsOpen(true);
          }
        }
      },
        h('div', { className: 'rp-divi-outline' }),
        hiddenHere ? h('span', { className: 'rp-divi-hidden-badge' }, 'Hidden on ' + activeDevice) : null,
        h('div', { className: 'rp-divi-pill' },
          h('span', { className: 'rp-divi-pill__label' }, TYPES[entry.type]?.label || entry.type),
          h('button', { type: 'button', title: 'Move up', disabled: i === 0, onClick: e => { e.stopPropagation(); move(i, i - 1); } }, '↑'),
          h('button', { type: 'button', title: 'Move down', disabled: i === items.length - 1, onClick: e => { e.stopPropagation(); move(i, i + 1); } }, '↓'),
          entry.type === 'columns' ? h('button', { type: 'button', title: 'Column Structure', onClick: e => { e.stopPropagation(); setColPickerIndex(colPickerIndex === i ? null : i); } }, '▥') : null,
          entry.animation && entry.animation !== 'none' ? h('button', { type: 'button', title: 'Replay Animation', onClick: e => { e.stopPropagation(); replayAnimationFor(entry); } }, '▶') : null,
          h('button', { type: 'button', title: 'Module Settings', onClick: e => { e.stopPropagation(); setSelected(i); setSettingsOpen(true); } }, '⚙'),
          h('button', { type: 'button', title: 'Duplicate (Ctrl+D)', onClick: e => { e.stopPropagation(); duplicate(i); } }, '⧉'),
          h('button', { type: 'button', title: 'More Options', onClick: e => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            openContextMenuAt({ preventDefault: () => {}, stopPropagation: () => {}, clientX: rect.left, clientY: rect.bottom + 6 }, i);
          } }, '⋮'),
          h('button', { type: 'button', title: 'Delete', onClick: e => { e.stopPropagation(); remove(i); } }, '🗑')
        ),
        entry.type === 'columns' && colPickerIndex === i ? h('div', { className: 'rp-divi-col-picker', onClick: e => e.stopPropagation() },
          ...COLUMN_STRUCTURES.map(cs => h('button', {
            key: cs.id,
            type: 'button',
            title: cs.label,
            className: 'rp-divi-col-option' + ((entry.column_layout || '') === cs.id ? ' is-active' : ''),
            onClick: () => {
              updateMultipleAt(i, { columns_count: cs.count, column_layout: cs.id });
              setColPickerIndex(null);
            }
          }, ...cs.bars.map((pct, bIdx) => h('span', { key: bIdx, style: { flex: pct } }))))
        ) : null,
        renderModuleBody(entry, i),
        h('button', {
          type: 'button',
          className: 'rp-divi-insert-dot',
          title: 'Add New Element Below',
          onClick: e => { e.stopPropagation(); setInsertAt(i + 1); setInsertTab('modules'); }
        }, '+')
      );
    };

    const renderWireframeNode = (entry, i) => {
      const tone = nodeToneFor(entry.type);
      return h('div', {
        key: entry.id || i,
        className: 'rp-wireframe-block' + (i === selected ? ' is-selected' : ''),
        style: { '--divi-color': tone === 'section' ? 'var(--divi-blue)' : tone === 'row' ? 'var(--divi-teal)' : 'var(--divi-slate)' },
        draggable: true,
        onContextMenu: e => openContextMenuAt(e, i),
        onDragStart: e => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; },
        onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
        onDrop: e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) move(from, i); },
        onClick: () => setSelected(i)
      },
        h('div', { className: 'rp-wireframe-block__meta' },
          h('span', { className: 'rp-wireframe-badge' }, TYPES[entry.type]?.label || entry.type),
          h('span', { className: 'rp-wireframe-title' }, entry.text || (entry.type === 'columns' ? entry.columns_count + '-Column Row' : '(empty)')),
          entry.animation && entry.animation !== 'none' ? h('span', { className: 'rp-b-anim-tag' }, '✦ ' + entry.animation) : null
        ),
        h('div', { className: 'rp-wireframe-actions' },
          h('button', { type: 'button', onClick: e => { e.stopPropagation(); setSelected(i); setSettingsOpen(true); } }, '⚙ Settings'),
          h('button', { type: 'button', onClick: e => { e.stopPropagation(); duplicate(i); } }, 'Duplicate'),
          h('button', { type: 'button', onClick: e => { e.stopPropagation(); setInsertAt(i + 1); } }, '+ Below'),
          h('button', { type: 'button', onClick: e => { e.stopPropagation(); remove(i); } }, 'Delete')
        )
      );
    };

    const renderSubItemListEditor = (listKey, defaultItemFactory, itemLabel) => {
      const list = Array.isArray(item[listKey]) ? item[listKey] : [];
      const mutateList = fn => {
        const next = clone(list);
        fn(next);
        update(listKey, next);
      };
      return h('div', { className: 'rss-prism-image-controls' },
        ...list.map((row, idx) => h('div', { key: row.id || idx, className: 'rp-divi-subitem-card' },
          h('div', { className: 'rp-divi-subitem-card__head' },
            h('span', null, itemLabel + ' #' + (idx + 1)),
            h('div', { style: { display: 'flex', gap: '6px' } },
              h('button', { type: 'button', className: 'button-link', disabled: idx === 0, onClick: () => mutateList(arr => { const m = arr.splice(idx, 1)[0]; arr.splice(idx - 1, 0, m); }) }, '↑'),
              h('button', { type: 'button', className: 'button-link', disabled: idx === list.length - 1, onClick: () => mutateList(arr => { const m = arr.splice(idx, 1)[0]; arr.splice(idx + 1, 0, m); }) }, '↓'),
              h('button', { type: 'button', className: 'button-link-delete', disabled: list.length <= 1, onClick: () => mutateList(arr => arr.splice(idx, 1)) }, 'Remove')
            )
          ),
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Title'),
            h('input', { type: 'text', value: row.title || '', onChange: e => mutateList(arr => { arr[idx].title = e.target.value; }) })
          ),
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Body'),
            h('textarea', { rows: 2, value: row.body || '', onChange: e => mutateList(arr => { arr[idx].body = e.target.value; }) })
          )
        )),
        h('button', {
          type: 'button',
          className: 'button',
          disabled: list.length >= 12,
          onClick: () => mutateList(arr => arr.push(defaultItemFactory(arr.length + 1)))
        }, '+ Add ' + itemLabel)
      );
    };

    const renderSettingsModal = () => {
      if (!settingsOpen || !item) return null;
      const devStyle = (item.responsive && item.responsive[activeDevice]) || item;
      return h('aside', { className: 'rp-divi-settings-modal' + (settingsFloating ? ' is-floating' : '') },
        h('div', { className: 'rp-divi-settings__header' },
          h('h2', null, (TYPES[item.type]?.label || item.type) + ' Settings'),
          h('div', { className: 'rp-divi-settings__head-actions' },
            h('button', { type: 'button', title: 'Copy Styles', onClick: () => copyStyleFrom(selected) }, 'Copy Style'),
            copiedStyle ? h('button', { type: 'button', title: 'Paste Styles', onClick: () => pasteStyleTo(selected) }, 'Paste') : null,
            h('button', { type: 'button', onClick: () => setSettingsFloating(!settingsFloating) }, settingsFloating ? 'Dock' : 'Float'),
            h('button', { type: 'button', onClick: () => setSettingsOpen(false) }, 'Done')
          )
        ),
        h('div', { className: 'rp-divi-settings__tabs' },
          ...[['content', 'Content'], ['design', 'Design'], ['advanced', 'Advanced']].map(([k, label]) =>
            h('button', { key: k, type: 'button', className: settingsTab === k ? 'is-active' : '', onClick: () => setSettingsTab(k) }, label)
          )
        ),
        h('div', { className: 'rp-divi-settings__body' },
          settingsTab === 'content' ? h('div', null,
            !['accordion', 'tabs', 'social_follow', 'blog', 'portfolio', 'filterable_portfolio', 'fullwidth_portfolio', 'shop', 'slider', 'fullwidth_slider', 'post_slider', 'fullwidth_post_slider', 'video_slider', 'sidebar', 'breadcrumbs'].includes(item.type) ? field('Content / Title', 'text', item.text, 'textarea') : null,
            MOD.renderExtraModuleSettings ? MOD.renderExtraModuleSettings({ h, item, field, update, chooseImage, clone }) : null,
            item.type === 'button' ? field('Button URL', 'url', item.url, 'url') : null,
            item.type === 'quote' ? field('Attribution / author', 'quote_author', item.quote_author || '') : null,
            item.type === 'blurb' ? h('div', { className: 'rss-prism-image-controls' },
              field('Icon or symbol', 'blurb_icon', item.blurb_icon || '✦'),
              field('Description', 'blurb_body', item.blurb_body || '', 'textarea')
            ) : null,
            item.type === 'callout' ? h('div', { className: 'rss-prism-image-controls' },
              field('Supporting text', 'callout_body', item.callout_body || '', 'textarea'),
              field('Button label', 'callout_label', item.callout_label || 'Get started'),
              field('Button URL', 'url', item.url || '', 'url')
            ) : null,
            item.type === 'gallery' ? field('Image URLs (one per line; up to 12)', 'gallery_urls', item.gallery_urls || '', 'textarea') : null,
            item.type === 'image' ? h('div', { className: 'rss-prism-image-controls' },
              h('button', { type: 'button', className: 'button button-primary', onClick: () => chooseImage('image_url', 'alt') }, item.image_url ? 'Replace from Media Library' : 'Choose from Media Library'),
              field('Image URL', 'image_url', item.image_url, 'url'),
              field('Alternative text', 'alt', item.alt || ''),
              item.image_url ? h('img', { src: item.image_url, alt: item.alt || '', className: 'rss-prism-inspector-image' }) : null
            ) : null,
            item.type === 'accordion' ? renderSubItemListEditor(
              'accordion_items',
              n => ({ id: 'acc-' + Date.now() + '-' + n, title: 'Question ' + n, body: 'Answer details.' }),
              'Accordion Item'
            ) : null,
            item.type === 'tabs' ? renderSubItemListEditor(
              'tabs_items',
              n => ({ id: 'tab-' + Date.now() + '-' + n, title: 'Tab ' + n, body: 'Tab content.' }),
              'Tab'
            ) : null,
            item.type === 'pricing_table' ? h('div', { className: 'rss-prism-image-controls' },
              h('div', { className: 'rp-divi-grid-2' },
                field('Currency', 'pricing_currency', item.pricing_currency || '$'),
                field('Price', 'pricing_price', item.pricing_price || '49')
              ),
              h('div', { className: 'rp-divi-grid-2' },
                field('Billing Period', 'pricing_period', item.pricing_period || '/ year'),
                field('Badge Text', 'pricing_badge', item.pricing_badge || '')
              ),
              field('Features (one per line)', 'pricing_features', item.pricing_features || '', 'textarea', { rows: 4 }),
              field('Button Label', 'callout_label', item.callout_label || 'Choose Plan'),
              field('Button URL', 'url', item.url || '', 'url'),
              h('label', { className: 'rp-divi-toggle-row' },
                h('span', null, 'Highlight as Featured Tier'),
                h('input', { type: 'checkbox', checked: Boolean(item.pricing_featured), onChange: e => update('pricing_featured', e.target.checked) })
              )
            ) : null,
            item.type === 'testimonial' ? h('div', { className: 'rss-prism-image-controls' },
              field('Author Name', 'testimonial_author', item.testimonial_author || ''),
              field('Role / Company', 'testimonial_role', item.testimonial_role || ''),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Star Rating: ' + (item.testimonial_rating ?? 5) + ' / 5'),
                h('input', { type: 'range', min: 1, max: 5, value: item.testimonial_rating ?? 5, onChange: e => update('testimonial_rating', Number(e.target.value)) })
              ),
              h('button', { type: 'button', className: 'button', onClick: () => chooseImage('testimonial_avatar', '') }, item.testimonial_avatar ? 'Replace Avatar' : 'Choose Avatar Image'),
              field('Avatar URL', 'testimonial_avatar', item.testimonial_avatar || '', 'url')
            ) : null,
            item.type === 'number_counter' ? h('div', { className: 'rss-prism-image-controls' },
              field('Target Number', 'counter_number', item.counter_number ?? 150, 'number'),
              h('div', { className: 'rp-divi-grid-2' },
                field('Prefix (e.g. $)', 'counter_prefix', item.counter_prefix || ''),
                field('Suffix (e.g. +, %)', 'counter_suffix', item.counter_suffix || '')
              )
            ) : null,
            item.type === 'bar_counter' ? h('div', { className: 'rss-prism-image-controls' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Percentage: ' + (item.bar_percent ?? 85) + '%'),
                h('input', { type: 'range', min: 0, max: 100, value: item.bar_percent ?? 85, onChange: e => update('bar_percent', Number(e.target.value)) })
              ),
              h('div', { className: 'rp-divi-grid-2' },
                field('Bar Fill Color', 'bar_color', item.bar_color || '#2b87da', 'color'),
                field('Track Color', 'bar_track_color', item.bar_track_color || '#e5e7eb', 'color')
              )
            ) : null,
            item.type === 'video' ? h('div', { className: 'rss-prism-image-controls' },
              field('Video URL (YouTube, Vimeo, or MP4)', 'video_url', item.video_url || '', 'url', { placeholder: 'https://www.youtube.com/watch?v=...' })
            ) : null,
            item.type === 'countdown' ? h('div', { className: 'rss-prism-image-controls' },
              field('Target Date & Time', 'countdown_target', item.countdown_target || '', 'datetime-local')
            ) : null,
            item.type === 'icon_list' ? h('div', { className: 'rss-prism-image-controls' },
              field('Bullet Icon / Symbol', 'icon_list_symbol', item.icon_list_symbol || '✓'),
              field('List Items (one per line)', 'icon_list_items', item.icon_list_items || '', 'textarea', { rows: 4 })
            ) : null,
            item.type === 'contact_form' ? h('div', { className: 'rss-prism-image-controls' },
              field('Submit Button Label', 'form_button_label', item.form_button_label || 'Send Message'),
              field('Success Message', 'form_success_message', item.form_success_message || '', 'textarea', { rows: 2 })
            ) : null,
            (item.type === 'social_follow' || item.type === 'person') ? h('div', { className: 'rss-prism-image-controls' },
              ...(Array.isArray(item.social_links) ? item.social_links : []).map((row, idx) => h('div', { key: idx, className: 'rp-divi-subitem-card' },
                h('div', { className: 'rp-divi-subitem-card__head' },
                  h('span', null, 'Link #' + (idx + 1)),
                  h('button', {
                    type: 'button',
                    className: 'button-link-delete',
                    disabled: (item.social_links || []).length <= 1,
                    onClick: () => update('social_links', (item.social_links || []).filter((_, j) => j !== idx))
                  }, 'Remove')
                ),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Network'),
                  h('select', {
                    value: row.network || 'website',
                    onChange: e => {
                      const next = clone(item.social_links || []);
                      next[idx].network = e.target.value;
                      update('social_links', next);
                    }
                  }, ...SOCIAL_NETWORKS.map(n => h('option', { key: n.value, value: n.value }, n.label)))
                ),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Button Label'),
                  h('input', {
                    type: 'text',
                    value: row.label || '',
                    onChange: e => {
                      const next = clone(item.social_links || []);
                      next[idx].label = e.target.value;
                      update('social_links', next);
                    }
                  })
                ),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Profile URL'),
                  h('input', {
                    type: 'url',
                    value: row.url || '',
                    onChange: e => {
                      const next = clone(item.social_links || []);
                      next[idx].url = e.target.value;
                      update('social_links', next);
                    }
                  })
                )
              )),
              h('button', {
                type: 'button',
                className: 'button',
                disabled: (item.social_links || []).length >= 10,
                onClick: () => update('social_links', (item.social_links || []).concat([{ network: 'website', label: 'Website', url: 'https://www.rsscctvsolution.eu.cc/' }]))
              }, '+ Add Social Link')
            ) : null,
            item.type === 'container' ? h('div', { className: 'rss-prism-image-controls' },
              field('Container background', 'container_background', item.container_background || '#f7f6f2', 'color'),
              nestedEditor(item.container_elements || [], [], 0)
            ) : null,
            item.type === 'columns' ? h('div', { className: 'rss-prism-image-controls' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Column Structure'),
                h('select', {
                  value: item.column_layout || (Number(item.columns_count) === 3 ? '33-33-33' : '50-50'),
                  onChange: e => {
                    const spec = COLUMN_STRUCTURES.find(cs => cs.id === e.target.value);
                    if (spec) updateMultipleAt(selected, { columns_count: spec.count, column_layout: spec.id });
                  }
                }, ...COLUMN_STRUCTURES.map(cs => h('option', { key: cs.id, value: cs.id }, cs.label)))
              ),
              ...Array.from({ length: Number(item.columns_count || 2) }, (_, columnIndex) => {
                const columns = normalizedColumnElements(item);
                const children = columns[columnIndex] || [];
                const updateChild = (childIndex, key, value) => {
                  const next = normalizedColumnElements(item);
                  next[columnIndex] = (next[columnIndex] || []).slice();
                  next[columnIndex][childIndex] = { ...(next[columnIndex][childIndex] || { id: 'child-' + Date.now(), type: 'text', text: '', url: '' }), [key]: value };
                  update('column_elements', next);
                };
                const addChild = () => {
                  const next = clone(item.column_elements || []);
                  while (next.length < Number(item.columns_count || 2)) next.push([]);
                  next[columnIndex] = (next[columnIndex] || []).concat([{ id: 'child-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), type: 'text', text: 'New column content', url: '' }]);
                  update('column_elements', next);
                };
                const removeChild = childIndex => {
                  const next = clone(item.column_elements || []);
                  next[columnIndex] = (next[columnIndex] || []).filter((_, idx) => idx !== childIndex);
                  update('column_elements', next);
                };
                return h('div', { className: 'rss-prism-nested-column-editor', key: columnIndex },
                  h('h4', { style: { margin: '0 0 8px' } }, 'Column ' + (columnIndex + 1)),
                  ...children.map((child, childIndex) => h('div', { className: 'rss-prism-nested-child', key: child.id || childIndex },
                    h('div', { className: 'rss-prism-nested-child-toolbar' },
                      h('strong', null, child.type.toUpperCase()),
                      h('button', { type: 'button', className: 'button-link-delete', onClick: () => removeChild(childIndex) }, 'Remove')
                    ),
                    h('label', { className: 'rss-prism-field' }, h('span', null, 'Type'),
                      h('select', { value: child.type || 'text', onChange: e => updateChild(childIndex, 'type', e.target.value) },
                        ...[['heading', 'Heading'], ['text', 'Text'], ['button', 'Button'], ['image', 'Image']].map(([v, l]) => h('option', { key: v, value: v }, l))
                      )
                    ),
                    h('label', { className: 'rss-prism-field' }, h('span', null, 'Content'),
                      h('textarea', { rows: 2, value: child.text || '', onChange: e => updateChild(childIndex, 'text', e.target.value) })
                    ),
                    child.type === 'button' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Button URL'), h('input', { type: 'url', value: child.url || '', onChange: e => updateChild(childIndex, 'url', e.target.value) })) : null,
                    child.type === 'image' ? h('div', null,
                      h('label', { className: 'rss-prism-field' }, h('span', null, 'Image URL'), h('input', { type: 'url', value: child.image_url || '', onChange: e => updateChild(childIndex, 'image_url', e.target.value) })),
                      h('label', { className: 'rss-prism-field' }, h('span', null, 'Alt text'), h('input', { type: 'text', value: child.alt || '', onChange: e => updateChild(childIndex, 'alt', e.target.value) }))
                    ) : null
                  )),
                  h('button', { type: 'button', className: 'button', onClick: addChild }, '+ Add element to column')
                );
              })
            ) : null,

            h('div', { className: 'rp-divi-section-heading' }, 'Background'),
            h('label', { className: 'rp-divi-toggle-row' },
              h('span', null, 'Use Gradient Background'),
              h('input', { type: 'checkbox', checked: Boolean(item.bg_gradient_enabled), onChange: e => update('bg_gradient_enabled', e.target.checked) })
            ),
            item.bg_gradient_enabled ? h('div', { className: 'rss-prism-image-controls' },
              h('div', { className: 'rp-divi-grid-2' },
                field('Start Color', 'bg_gradient_start', item.bg_gradient_start || '#f7f3e8', 'color'),
                field('End Color', 'bg_gradient_end', item.bg_gradient_end || '#ffffff', 'color')
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Gradient Angle: ' + (item.bg_gradient_angle ?? 135) + '°'),
                h('input', { type: 'range', min: 0, max: 360, value: item.bg_gradient_angle ?? 135, onChange: e => update('bg_gradient_angle', Number(e.target.value)) })
              )
            ) : field('Solid Background Color', 'background', item.background || '#ffffff', 'color')
          ) : null,

          settingsTab === 'design' ? h('div', null,
            (['button', 'callout', 'pricing_table', 'contact_form', 'social_follow', 'number_counter', 'icon_list', 'person', 'fullwidth_header', 'slider', 'fullwidth_slider', 'post_slider', 'fullwidth_post_slider', 'video_slider', 'blog', 'portfolio', 'filterable_portfolio', 'fullwidth_portfolio', 'shop', 'woo_product', 'woo_cart', 'woo_checkout', 'email_optin', 'login', 'search', 'icon'].includes(item.type)) ? h('div', { className: 'rss-prism-image-controls' },
              h('div', { className: 'rp-divi-grid-2' },
                field('Accent / Button BG', 'button_bg', item.button_bg || '#b88a2b', 'color'),
                field('Button Text Color', 'button_text', item.button_text || '#ffffff', 'color')
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Button Corner Radius: ' + (item.button_radius ?? 6) + ' px'),
                h('input', { type: 'range', min: 0, max: 40, value: item.button_radius ?? 6, onChange: e => update('button_radius', Number(e.target.value)) })
              )
            ) : null,
            item.type === 'image' ? h('div', { className: 'rss-prism-image-controls' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Image width: ' + (item.image_width ?? 100) + '%'),
                h('input', { type: 'range', min: 10, max: 100, value: item.image_width ?? 100, onChange: e => update('image_width', Number(e.target.value)) })
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Image fit'),
                h('select', { value: item.image_fit || 'cover', onChange: e => update('image_fit', e.target.value) },
                  h('option', { value: 'cover' }, 'Cover'),
                  h('option', { value: 'contain' }, 'Contain')
                )
              )
            ) : null,
            item.type === 'divider' ? h('div', { className: 'rss-prism-image-controls' },
              field('Divider color', 'divider_color', item.divider_color || '#d9d9d9', 'color'),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Divider width: ' + (item.divider_width ?? 100) + '%'),
                h('input', { type: 'range', min: 10, max: 100, value: item.divider_width ?? 100, onChange: e => update('divider_width', Number(e.target.value)) })
              )
            ) : null,
            item.type === 'spacer' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Spacer height: ' + (item.spacer_height ?? 48) + ' px'),
              h('input', { type: 'range', min: 8, max: 300, value: item.spacer_height ?? 48, onChange: e => update('spacer_height', Number(e.target.value)) })
            ) : null,

            h('div', { className: 'rp-divi-section-heading' }, 'Typography'),
            field('Text Color', 'text_color', item.text_color || '#202124', 'color'),
            field('Font Size (' + activeDevice + '): ' + (devStyle.font_size || item.font_size || 16) + 'px', 'font_size', devStyle.font_size || item.font_size || 16, 'range'),
            h('div', { className: 'rp-divi-grid-2' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Font Weight'),
                h('select', { value: item.font_weight || '600', onChange: e => update('font_weight', e.target.value) },
                  ...[['400', 'Regular (400)'], ['500', 'Medium (500)'], ['600', 'SemiBold (600)'], ['700', 'Bold (700)'], ['800', 'ExtraBold (800)']].map(([v, l]) => h('option', { key: v, value: v }, l))
                )
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Text Align (' + activeDevice + ')'),
                h('select', { value: devStyle.align || item.align || 'left', onChange: e => update('align', e.target.value) },
                  ...['left', 'center', 'right'].map(v => h('option', { key: v, value: v }, v[0].toUpperCase() + v.slice(1)))
                )
              )
            ),
            h('div', { className: 'rp-divi-grid-2' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Line Height: ' + (item.line_height ?? 1.5)),
                h('input', { type: 'range', min: 1.0, max: 2.5, step: 0.1, value: item.line_height ?? 1.5, onChange: e => update('line_height', Number(e.target.value)) })
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Letter Spacing: ' + (item.letter_spacing ?? 0) + 'px'),
                h('input', { type: 'range', min: -2, max: 12, step: 1, value: item.letter_spacing ?? 0, onChange: e => update('letter_spacing', Number(e.target.value)) })
              )
            ),
            h('label', { className: 'rss-prism-field' }, h('span', null, 'Text Transform'),
              h('select', { value: item.text_transform || 'none', onChange: e => update('text_transform', e.target.value) },
                h('option', { value: 'none' }, 'Default'),
                h('option', { value: 'uppercase' }, 'UPPERCASE'),
                h('option', { value: 'capitalize' }, 'Capitalize')
              )
            ),

            h('div', { className: 'rp-divi-section-heading' }, 'Spacing & Sizing'),
            h('label', { className: 'rss-prism-field' }, h('span', null, 'Padding (' + activeDevice + '): ' + (devStyle.padding ?? item.padding ?? 0) + ' px'),
              h('input', { type: 'range', min: 0, max: 200, value: devStyle.padding ?? item.padding ?? 0, onChange: e => update('padding', Number(e.target.value)) })
            ),
            h('div', { className: 'rp-divi-grid-2' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Margin Top: ' + (item.margin_top ?? 0) + 'px'),
                h('input', { type: 'range', min: 0, max: 200, value: item.margin_top ?? 0, onChange: e => update('margin_top', Number(e.target.value)) })
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Margin Bottom: ' + (item.margin_bottom ?? 12) + 'px'),
                h('input', { type: 'range', min: 0, max: 200, value: item.margin_bottom ?? 12, onChange: e => update('margin_bottom', Number(e.target.value)) })
              )
            ),
            h('label', { className: 'rss-prism-field' }, h('span', null, 'Max Width: ' + (item.max_width_pct ?? 100) + '%'),
              h('input', { type: 'range', min: 20, max: 100, value: item.max_width_pct ?? 100, onChange: e => update('max_width_pct', Number(e.target.value)) })
            ),

            h('div', { className: 'rp-divi-section-heading' }, 'Border, Shadow & Transform'),
            h('div', { className: 'rp-divi-grid-2' },
              field('Border Color', 'border_color', item.border_color || '#d9d9d9', 'color'),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Border Style'),
                h('select', { value: item.border_style || 'solid', onChange: e => update('border_style', e.target.value) },
                  h('option', { value: 'solid' }, 'Solid'),
                  h('option', { value: 'dashed' }, 'Dashed'),
                  h('option', { value: 'dotted' }, 'Dotted')
                )
              )
            ),
            h('div', { className: 'rp-divi-grid-2' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Border Width: ' + (Number(item.border_width) || 0) + 'px'),
                h('input', { type: 'range', min: 0, max: 12, value: Number(item.border_width) || 0, onChange: e => update('border_width', Number(e.target.value)) })
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Corner Radius: ' + (Number(item.border_radius) || 0) + 'px'),
                h('input', { type: 'range', min: 0, max: 48, value: Number(item.border_radius) || 0, onChange: e => update('border_radius', Number(e.target.value)) })
              )
            ),
            h('label', { className: 'rss-prism-field' }, h('span', null, 'Box Shadow'),
              h('select', { value: item.box_shadow || 'none', onChange: e => update('box_shadow', e.target.value) },
                ...SHADOW_OPTIONS.map(opt => h('option', { key: opt.value, value: opt.value }, opt.label))
              )
            ),
            h('div', { className: 'rp-divi-grid-2' },
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Opacity: ' + (item.opacity_pct ?? 100) + '%'),
                h('input', { type: 'range', min: 10, max: 100, value: item.opacity_pct ?? 100, onChange: e => update('opacity_pct', Number(e.target.value)) })
              ),
              h('label', { className: 'rss-prism-field' }, h('span', null, 'Hover Lift: ' + (item.hover_lift ?? 0) + 'px'),
                h('input', { type: 'range', min: 0, max: 12, value: item.hover_lift ?? 0, onChange: e => update('hover_lift', Number(e.target.value)) })
              )
            ),

            h('div', { className: 'rp-divi-section-heading' }, 'Animation'),
            h('label', { className: 'rss-prism-field' }, h('span', null, 'Animation Style'),
              h('select', {
                value: item.animation || 'none',
                onChange: e => {
                  update('animation', e.target.value);
                  replayAnimationFor(item);
                }
              }, ...ANIMATION_OPTIONS.map(opt => h('option', { key: opt.value, value: opt.value }, opt.label)))
            ),
            item.animation && item.animation !== 'none' ? h('div', { className: 'rss-prism-image-controls' },
              h('div', { className: 'rp-divi-grid-2' },
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Duration: ' + (item.animation_duration ?? 650) + 'ms'),
                  h('input', { type: 'range', min: 200, max: 2000, step: 50, value: item.animation_duration ?? 650, onChange: e => update('animation_duration', Number(e.target.value)) })
                ),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Delay: ' + (item.animation_delay ?? 0) + 'ms'),
                  h('input', { type: 'range', min: 0, max: 1500, step: 50, value: item.animation_delay ?? 0, onChange: e => update('animation_delay', Number(e.target.value)) })
                )
              ),
              h('button', { type: 'button', className: 'button', style: { marginTop: '6px' }, onClick: () => replayAnimationFor(item) }, '▶ Replay Animation')
            ) : null
          ) : null,

          settingsTab === 'advanced' ? h('div', null,
            h('p', { className: 'rp-b-muted-copy', style: { marginTop: 0 } }, 'Element ID: ', h('code', null, item.id)),
            h('div', { className: 'rp-divi-section-heading' }, 'CSS ID & Classes'),
            field('Custom CSS ID', 'custom_id', item.custom_id || '', 'text', { placeholder: 'e.g. hero-pricing' }),
            field('Custom CSS Class', 'custom_class', item.custom_class || '', 'text', { placeholder: 'e.g. highlight-band' }),
            h('div', { className: 'rp-divi-section-heading' }, 'Responsive Visibility'),
            h('label', { className: 'rp-divi-toggle-row' },
              h('span', null, 'Disable on Desktop'),
              h('input', { type: 'checkbox', checked: Boolean(item.hide_desktop), onChange: e => update('hide_desktop', e.target.checked) })
            ),
            h('label', { className: 'rp-divi-toggle-row' },
              h('span', null, 'Disable on Tablet'),
              h('input', { type: 'checkbox', checked: Boolean(item.hide_tablet), onChange: e => update('hide_tablet', e.target.checked) })
            ),
            h('label', { className: 'rp-divi-toggle-row' },
              h('span', null, 'Disable on Mobile'),
              h('input', { type: 'checkbox', checked: Boolean(item.hide_mobile), onChange: e => update('hide_mobile', e.target.checked) })
            ),
            h('div', { className: 'rp-divi-panel-section' },
              h('h4', null, 'Global Design System'),
              h('p', { className: 'rp-b-muted-copy' }, 'Apply a cohesive palette across all ' + items.length + ' elements on this page.'),
              h('div', { className: 'rss-prism-design-presets' },
                ...Object.keys(DESIGN_PRESETS).map(key => h('button', {
                  key,
                  type: 'button',
                  className: 'rss-prism-design-preset button' + (designPreset === key ? ' is-active' : ''),
                  onClick: () => setDesignPreset(key)
                }, h('span', { className: 'rss-prism-design-swatch', style: { background: DESIGN_PRESETS[key].accent } }), DESIGN_PRESETS[key].label))
              ),
              h('button', { type: 'button', className: 'button button-primary', onClick: () => applyDesignPreset(designPreset) }, 'Apply Preset to Entire Layout')
            )
          ) : null
        ),
        h('div', { className: 'rp-divi-settings__footer' },
          h('div', { style: { display: 'flex', gap: '6px' } },
            h('button', { type: 'button', className: 'button', disabled: selected <= 0, onClick: () => move(selected, selected - 1) }, 'Move ↑'),
            h('button', { type: 'button', className: 'button', disabled: selected >= items.length - 1, onClick: () => move(selected, selected + 1) }, 'Move ↓')
          ),
          h('button', { type: 'button', className: 'button-link-delete', onClick: () => remove(selected) }, 'Delete Element')
        )
      );
    };

    const renderContextMenu = () => {
      if (!contextMenu) return null;
      const idx = contextMenu.index;
      const target = items[idx];
      if (!target) return null;
      const hiddenHere = isHiddenOnActiveDevice(target);
      return h('div', {
        className: 'rp-divi-context-menu',
        style: { left: contextMenu.x + 'px', top: contextMenu.y + 'px' },
        onClick: e => e.stopPropagation()
      },
        h('div', { className: 'rp-divi-context-menu__head' }, TYPES[target.type]?.label || target.type),
        h('button', { type: 'button', onClick: () => { setSelected(idx); setSettingsOpen(true); setContextMenu(null); } }, h('span', null, '⚙ Module Settings'), h('span', { className: 'rp-divi-context-menu__kbd' }, 'Edit')),
        INLINE_EDITABLE_TYPES.includes(target.type) ? h('button', { type: 'button', onClick: () => { setSelected(idx); setInlineEditing(true); setContextMenu(null); } }, h('span', null, '✎ Inline Edit Text'), h('span', { className: 'rp-divi-context-menu__kbd' }, '2×Click')) : null,
        h('div', { className: 'rp-divi-context-menu__sep' }),
        h('button', { type: 'button', onClick: () => duplicate(idx) }, h('span', null, '⧉ Duplicate'), h('span', { className: 'rp-divi-context-menu__kbd' }, 'Ctrl+D')),
        h('button', { type: 'button', onClick: () => copyModuleFrom(idx) }, h('span', null, '⎘ Copy Module')),
        h('button', { type: 'button', disabled: !copiedModule, onClick: () => pasteModuleAfter(idx) }, h('span', null, '⎗ Paste Module Below')),
        h('button', { type: 'button', onClick: () => copyStyleFrom(idx) }, h('span', null, '🎨 Copy Style')),
        h('button', { type: 'button', disabled: !copiedStyle, onClick: () => pasteStyleTo(idx) }, h('span', null, '🖌 Paste Style')),
        target.animation && target.animation !== 'none' ? h('button', { type: 'button', onClick: () => { replayAnimationFor(target); setContextMenu(null); } }, h('span', null, '▶ Replay Animation')) : null,
        h('div', { className: 'rp-divi-context-menu__sep' }),
        h('button', { type: 'button', onClick: () => toggleHideOnActiveDevice(idx) }, h('span', null, (hiddenHere ? '👁 Show on ' : '🚫 Hide on ') + activeDevice)),
        h('button', { type: 'button', onClick: () => { setInsertAt(idx + 1); setInsertTab('modules'); setContextMenu(null); } }, h('span', null, '+ Add Module Below')),
        h('button', { type: 'button', disabled: idx === 0, onClick: () => { move(idx, idx - 1); setContextMenu(null); } }, h('span', null, '↑ Move Up')),
        h('button', { type: 'button', disabled: idx === items.length - 1, onClick: () => { move(idx, idx + 1); setContextMenu(null); } }, h('span', null, '↓ Move Down')),
        h('div', { className: 'rp-divi-context-menu__sep' }),
        h('button', { type: 'button', className: 'is-danger', onClick: () => remove(idx) }, h('span', null, '🗑 Delete Module'))
      );
    };

    const renderInsertModal = () => {
      if (insertAt === null) return null;
      const filteredTypes = Object.keys(TYPES).filter(type => {
        const meta = TYPES[type];
        if (moduleCategory !== 'all' && meta.category !== moduleCategory) return false;
        if (moduleSearch.trim()) {
          const q = moduleSearch.toLowerCase();
          return meta.label.toLowerCase().includes(q) || meta.desc.toLowerCase().includes(q);
        }
        return true;
      });
      return h('div', { className: 'rp-divi-modal-backdrop', onClick: () => setInsertAt(null) },
        h('div', { className: 'rp-divi-modal', role: 'dialog', 'aria-modal': 'true', onClick: e => e.stopPropagation() },
          h('div', { className: 'rp-divi-modal__head' },
            h('h3', null, 'Insert Module (' + Object.keys(TYPES).length + ' Available) or Starter Layout'),
            h('button', { type: 'button', className: 'rp-divi-modal__close', onClick: () => setInsertAt(null) }, '×')
          ),
          h('div', { className: 'rp-divi-modal__tabs' },
            h('button', { type: 'button', className: insertTab === 'modules' ? 'is-active' : '', onClick: () => setInsertTab('modules') }, 'New Module'),
            h('button', { type: 'button', className: insertTab === 'library' ? 'is-active' : '', onClick: () => setInsertTab('library') }, 'Add From RSS Library')
          ),
          h('div', { className: 'rp-divi-modal__body' },
            insertTab === 'modules' ? h('div', null,
              h('input', { type: 'search', className: 'rp-divi-search', placeholder: 'Search modules (Accordion, Pricing, Tabs, Video, Countdown…)', value: moduleSearch, onChange: e => setModuleSearch(e.target.value) }),
              h('div', { style: { display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' } },
                ...CATEGORIES.map(([cat, label]) =>
                  h('button', { key: cat, type: 'button', className: 'button ' + (moduleCategory === cat ? 'button-primary' : ''), onClick: () => setModuleCategory(cat) }, label)
                )
              ),
              h('div', { className: 'rp-divi-module-grid' },
                ...filteredTypes.map(type => h('button', { key: type, type: 'button', className: 'rp-divi-module-card', onClick: () => add(type, insertAt) },
                  h('span', { className: 'rp-divi-module-card__icon' }, TYPES[type].icon),
                  h('strong', null, TYPES[type].label),
                  h('span', null, TYPES[type].desc)
                ))
              )
            ) : h('div', { className: 'rp-divi-module-grid' },
              ...STARTER_META.map(st => h('button', { key: st.key, type: 'button', className: 'rp-divi-module-card', onClick: () => insertStarter(st.key) },
                h('span', { className: 'rp-divi-module-card__icon' }, '★'),
                h('strong', null, st.label),
                h('span', null, st.desc)
              ))
            )
          )
        )
      );
    };

    const renderUtilityModal = () => {
      if (!utilityModal) return null;
      return h('div', { className: 'rp-divi-modal-backdrop', onClick: () => setUtilityModal(null) },
        h('div', { className: 'rp-divi-modal', role: 'dialog', 'aria-modal': 'true', onClick: e => e.stopPropagation() },
          h('div', { className: 'rp-divi-modal__head' },
            h('h3', null, utilityModal === 'publish' ? 'Publish Page & Copy Template' : utilityModal === 'presets' ? 'Global Design System' : 'History & Portability'),
            h('button', { type: 'button', className: 'rp-divi-modal__close', onClick: () => setUtilityModal(null) }, '×')
          ),
          h('div', { className: 'rp-divi-modal__body' },
            utilityModal === 'publish' ? h('div', null,
              h('div', { className: 'rp-divi-panel-section' },
                h('h4', null, 'Create a Published/Draft Page from This Layout'),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Page Title'),
                  h('input', { type: 'text', value: pageTitle, placeholder: 'e.g. Services Overview', onChange: e => setPageTitle(e.target.value), maxLength: 120 })
                ),
                h('button', { type: 'button', className: 'button button-primary', disabled: busy, onClick: createWordPressPage }, busy ? 'Creating page…' : 'Create & Open Page')
              ),
              h('div', { className: 'rp-divi-panel-section' },
                h('h4', null, 'Save as Reusable Draft Template'),
                h('label', { className: 'rss-prism-field' }, h('span', null, 'Template Name'),
                  h('input', { type: 'text', value: copyTitle, placeholder: 'e.g. RSS Services Landing', onChange: e => setCopyTitle(e.target.value), maxLength: 120 })
                ),
                h('button', { type: 'button', className: 'button', disabled: busy, onClick: copyTemplate }, 'Save Copy as New Draft')
              )
            ) : null,

            utilityModal === 'presets' ? h('div', null,
              h('p', { className: 'rp-b-muted-copy', style: { fontSize: '13px', marginTop: 0 } }, 'Apply a curated palette, corner radius, and padding across every element in this layout (undoable).'),
              h('div', { className: 'rss-prism-design-presets' },
                ...Object.keys(DESIGN_PRESETS).map(key => h('button', {
                  key,
                  type: 'button',
                  className: 'rss-prism-design-preset button' + (designPreset === key ? ' is-active' : ''),
                  onClick: () => setDesignPreset(key)
                }, h('span', { className: 'rss-prism-design-swatch', style: { background: DESIGN_PRESETS[key].accent } }), DESIGN_PRESETS[key].label))
              ),
              h('button', { type: 'button', className: 'button button-primary', onClick: () => applyDesignPreset(designPreset) }, 'Apply to Entire Layout')
            ) : null,

            utilityModal === 'history' ? h('div', null,
              h('div', { className: 'rp-divi-panel-section' },
                h('h4', null, 'JSON Portability (Export / Import)'),
                h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                  h('button', { type: 'button', className: 'button button-primary', onClick: exportLayout }, 'Export JSON Backup'),
                  h('button', { type: 'button', className: 'button', onClick: () => { const input = root.querySelector('#rss-prism-layout-import'); if (input) input.click(); } }, 'Import JSON File')
                )
              ),
              h('div', { className: 'rp-divi-panel-section rss-prism-restore-history' },
                h('h4', null, 'Browser Recovery Snapshots (' + restoreVersions.length + '/20)'),
                restoreVersions.length ? h('ol', null, ...restoreVersions.map(v => h('li', { key: v.id },
                  h('span', null, new Date(v.saved_at).toLocaleString() + ' (' + (v.layout ? v.layout.length : 0) + ' items)'),
                  h('button', { type: 'button', className: 'button', onClick: () => restoreVersion(v) }, 'Restore')
                ))) : h('p', { className: 'rp-b-muted-copy' }, 'No browser recovery snapshots yet. Edits are automatically snapshotted here.')
              )
            ) : null
          )
        )
      );
    };

    const stageClass = 'rp-divi-stage' + (layersOpen ? ' has-layers-open' : '') + (settingsOpen && !settingsFloating ? ' has-docked-inspector' : '');
    const renderThemeIcon = mode => mode === 'dark'
      ? h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
          h('circle', { cx: 12, cy: 12, r: 4 }),
          h('path', { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' })
        )
      : h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
          h('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' })
        );

    return h('div', { className: 'rss-prism-builder-layout' },
      h('input', { id: 'rss-prism-layout-import', type: 'file', accept: 'application/json,.json', onChange: importLayout, hidden: true }),
      notice ? h('div', { className: 'rss-prism-builder-notice', role: 'status' },
        h('span', null, notice),
        h('button', { type: 'button', onClick: () => setNotice('') }, '×')
      ) : null,

      h('div', { className: stageClass },
        layersOpen ? h('section', { className: 'rss-prism-builder-canvas' },
          h('div', { className: 'rss-prism-canvas-heading' }, h('span', null, 'Layers (' + items.length + ')'), h('button', { type: 'button', className: 'button-link', style: { color: '#fff' }, onClick: () => setLayersOpen(false) }, '×')),
          items.length ? items.map((entry, i) => h('div', {
            key: entry.id || i,
            className: 'rss-prism-canvas-item' + (i === selected ? ' is-selected' : ''),
            draggable: true,
            onContextMenu: e => openContextMenuAt(e, i),
            onDragStart: e => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; },
            onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
            onDrop: e => { e.preventDefault(); move(Number(e.dataTransfer.getData('text/plain')), i); },
            onClick: () => setSelected(i)
          },
            h('span', { className: 'rss-prism-drag-handle' }, '⠿'),
            h('span', { className: 'rss-prism-canvas-kind' }, TYPES[entry.type]?.label || entry.type),
            h('button', { type: 'button', className: 'button-link', onClick: e => { e.stopPropagation(); setSelected(i); setSettingsOpen(true); } }, '⚙'),
            h('span', { className: 'rss-prism-canvas-text' }, entry.text || '(empty)')
          )) : h('p', { className: 'rp-b-muted-copy', style: { padding: '14px' } }, 'No elements yet.')
        ) : null,

        h('section', {
          className: 'rss-prism-preview-frame rss-prism-preview-' + (viewMode === 'wireframe' ? 'desktop' : viewMode) + (viewMode === 'wireframe' ? ' is-wireframe' : '') + (items.length === 0 ? ' is-empty' : ''),
          onClick: () => { setColPickerIndex(null); setContextMenu(null); }
        },
          h('div', { className: 'rss-prism-preview-caption' },
            h('strong', null, viewMode === 'wireframe' ? 'DIVI WIREFRAME VIEW' : 'VISUAL BUILDER · ' + activeDevice.toUpperCase()),
            h('span', null, 'Right-click any element for Edit, Copy/Paste Style & Visibility · Double-click text to edit inline')
          ),
          items.length === 0 ? h('div', { className: 'rp-divi-empty-canvas' },
            h('h3', null, 'Start Building Your Page'),
            h('p', { style: { margin: 0, maxWidth: '420px' } }, 'Add any of 60 Divi-style modules or choose one of the 6 RSS Prism Starter Layouts from the library.'),
            h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
              h('button', { type: 'button', className: 'rp-divi-plus-circle', onClick: () => { setInsertAt(0); setInsertTab('modules'); } }, '+ Add First Module'),
              h('button', { type: 'button', className: 'button', onClick: () => { setInsertAt(0); setInsertTab('library'); } }, 'Browse Starter Layouts')
            )
          ) : (viewMode === 'wireframe'
            ? h('div', { className: 'rp-wireframe-canvas' }, ...items.map(renderWireframeNode))
            : items.map(renderDiviNode)
          ),
          items.length > 0 ? h('div', { className: 'rp-divi-add-row-cta' },
            h('button', { type: 'button', className: 'rp-divi-plus-circle', onClick: () => { setInsertAt(items.length); setInsertTab('modules'); } }, '+ Add Section / Module')
          ) : null
        ),

        !settingsFloating ? renderSettingsModal() : null
      ),
      settingsFloating ? renderSettingsModal() : null,
      renderContextMenu(),
      renderInsertModal(),
      renderUtilityModal(),

      /* Divi Floating Bottom Dock */
      h('nav', { className: 'rp-divi-dock', 'aria-label': 'Visual Builder Controls' },
        h('div', { className: 'rp-divi-dock__group' },
          h('button', { type: 'button', className: 'rp-divi-dock-btn' + (viewMode === 'wireframe' ? ' is-active' : ''), onClick: () => setViewMode('wireframe'), title: 'Wireframe View' }, '▤ Wireframe'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn' + (viewMode === 'desktop' ? ' is-active' : ''), onClick: () => setViewMode('desktop'), title: 'Desktop View' }, '🖥 Desktop'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn' + (viewMode === 'tablet' ? ' is-active' : ''), onClick: () => setViewMode('tablet'), title: 'Tablet View (768px)' }, '▯ Tablet'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn' + (viewMode === 'mobile' ? ' is-active' : ''), onClick: () => setViewMode('mobile'), title: 'Mobile View (390px)' }, '📱 Mobile')
        ),
        h('div', { className: 'rp-divi-dock__group' },
          h('button', { type: 'button', className: 'rp-divi-dock-btn' + (layersOpen ? ' is-active' : ''), onClick: () => setLayersOpen(!layersOpen) }, 'Layers'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn', disabled: !history.length, onClick: undo, title: 'Undo (Ctrl+Z)' }, '↶ Undo'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn', disabled: !future.length, onClick: redo, title: 'Redo (Ctrl+Y)' }, '↷ Redo')
        ),
        h('div', { className: 'rp-divi-dock__group' },
          h('button', { type: 'button', className: 'rp-divi-dock-btn', onClick: () => { setInsertAt(items.length); setInsertTab('library'); } }, '+ Library'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn', onClick: () => setUtilityModal('presets') }, '🎨 Presets'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn', onClick: () => setUtilityModal('history') }, '⏱ History & JSON'),
          h('button', { type: 'button', className: 'rp-divi-dock-btn', onClick: () => setUtilityModal('publish') }, '📄 Publish / Copy')
        ),
        h('div', { className: 'rp-divi-dock__group' },
          h('button', {
            type: 'button',
            className: 'rp-divi-dock-btn',
            'aria-pressed': builderTheme === 'dark',
            'aria-label': builderTheme === 'dark' ? 'Switch builder interface to light mode' : 'Switch builder interface to dark mode',
            title: builderTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            onClick: () => applyBuilderTheme(builderTheme === 'dark' ? 'light' : 'dark')
          }, renderThemeIcon(builderTheme), builderTheme === 'dark' ? 'Light' : 'Dark')
        ),
        h('div', { className: 'rp-divi-dock__group' },
          h('span', { className: 'rp-divi-dock-status' + (autosaveStatus.startsWith('Autosaved') || autosaveStatus.startsWith('Saved') ? ' is-saved' : autosaveStatus.includes('failed') ? ' is-error' : '') }, autosaveStatus),
          h('button', { type: 'button', className: 'rp-divi-dock-btn rp-divi-dock-btn--save', disabled: busy, onClick: save }, busy ? 'Saving…' : 'Save Layout')
        )
      )
    );
  }

  wp.element.render(h(App), root);
})();
