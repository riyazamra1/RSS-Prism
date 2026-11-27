(() => {
  'use strict';

  const TYPES = {
    // Layout & Structure (6)
    section: { label: 'Section', category: 'layout', icon: '▱', text: 'New section', desc: 'Full-width structural band' },
    columns: { label: 'Row / Columns', category: 'layout', icon: '▥', text: 'Columns', desc: 'Multi-column Divi-style row' },
    container: { label: 'Container', category: 'layout', icon: '□', text: 'Content container', desc: 'Nested group up to 2 levels' },
    divider: { label: 'Divider', category: 'layout', icon: '—', text: 'Divider', desc: 'Horizontal separator line' },
    spacer: { label: 'Spacer', category: 'layout', icon: '↕', text: 'Spacer', desc: 'Adjustable vertical spacing' },
    sidebar: { label: 'Sidebar', category: 'layout', icon: '◫', text: 'Sidebar Widgets', desc: 'Vertical widget stack & links' },

    // Core Content (14)
    heading: { label: 'Heading', category: 'content', icon: 'T', text: 'Your heading', desc: 'Headline or section title' },
    text: { label: 'Text', category: 'content', icon: '¶', text: 'Write something useful for your visitors.', desc: 'Rich paragraph copy' },
    button: { label: 'Button', category: 'content', icon: '▰', text: 'Learn more', desc: 'Clickable action button' },
    blurb: { label: 'Blurb', category: 'content', icon: '✦', text: 'A useful feature or service', desc: 'Icon, title, and description card' },
    callout: { label: 'Call to Action', category: 'content', icon: '↗', text: 'Ready to get started?', desc: 'Headline, copy, and CTA button' },
    quote: { label: 'Quote', category: 'content', icon: '❝', text: '“Add a memorable customer quote or key message.”', desc: 'Styled testimonial or pullquote' },
    pricing_table: { label: 'Pricing Table', category: 'content', icon: '$', text: 'Professional Plan', desc: 'Tier card with price, badge & features' },
    testimonial: { label: 'Testimonial', category: 'content', icon: '★', text: '“Razeen Secure Solution delivered reliable CCTV and cloud systems ahead of schedule.”', desc: 'Client review with star rating & avatar' },
    icon_list: { label: 'Icon List', category: 'content', icon: '✓', text: 'Key Capabilities', desc: 'Bulleted checklist with custom icon' },
    person: { label: 'Person', category: 'content', icon: '☺', text: 'Alex Razeen', desc: 'Team member card with bio & links' },
    icon: { label: 'Icon', category: 'content', icon: '❖', text: 'Verified Quality', desc: 'Stylized badge icon & caption' },
    code: { label: 'Code', category: 'content', icon: '</>', text: 'HTML / CSS Snippet', desc: 'Formatted syntax code block' },
    breadcrumbs: { label: 'Breadcrumbs', category: 'content', icon: '»', text: 'Breadcrumbs', desc: 'Page hierarchy trail links' },
    post_content: { label: 'Post Content', category: 'content', icon: '▤', text: 'Write long-form article copy or documentation details here.', desc: 'Formatted body content block' },

    // Interactive & Dynamic (13)
    accordion: { label: 'Accordion', category: 'interactive', icon: '▾', text: 'Frequently Asked Questions', desc: 'Expandable FAQ / toggle panels' },
    toggle: { label: 'Toggle', category: 'interactive', icon: '▸', text: 'Click to view details', desc: 'Single collapsible toggle box' },
    tabs: { label: 'Tabs', category: 'interactive', icon: '▤', text: 'Feature Tabs', desc: 'Tabbed content switcher' },
    number_counter: { label: 'Number Counter', category: 'interactive', icon: '#', text: 'Projects Completed', desc: 'KPI stat with prefix & suffix' },
    bar_counter: { label: 'Bar Counter', category: 'interactive', icon: '▬', text: 'Client Satisfaction', desc: 'Animated percentage progress bar' },
    circle_counter: { label: 'Circle Counter', category: 'interactive', icon: '◔', text: 'System Uptime', desc: 'SVG circular percentage ring' },
    countdown: { label: 'Countdown Timer', category: 'interactive', icon: '◷', text: 'Launching Soon', desc: 'Live days/hours/mins/secs timer' },
    contact_form: { label: 'Contact Form', category: 'interactive', icon: '✉', text: 'Send Us a Message', desc: 'Interactive enquiry form' },
    email_optin: { label: 'Email Optin', category: 'interactive', icon: '📬', text: 'Subscribe for Updates', desc: 'Newsletter signup box' },
    login: { label: 'Login', category: 'interactive', icon: '🔑', text: 'Client Portal Login', desc: 'Sign-in card with form fields' },
    search: { label: 'Search', category: 'interactive', icon: '⌕', text: 'Search Site', desc: 'Live search input & button' },
    social_follow: { label: 'Social Follow', category: 'interactive', icon: '◉', text: 'Follow Us', desc: 'Network buttons with links' },
    comments: { label: 'Comments', category: 'interactive', icon: '💬', text: 'Discussion & Comments', desc: 'Threaded visitor comment list' },

    // Media & Visual (7)
    image: { label: 'Image', category: 'media', icon: '▧', text: 'Image', desc: 'Media Library or URL image' },
    gallery: { label: 'Image Gallery', category: 'media', icon: '▦', text: 'Image gallery', desc: 'Responsive 3-column image grid' },
    video: { label: 'Video', category: 'media', icon: '▶', text: 'Featured Video', desc: 'YouTube, Vimeo, or MP4 embed' },
    video_slider: { label: 'Video Slider', category: 'media', icon: '🎞', text: 'Video Playlist', desc: 'Multi-video switcher with playlist' },
    audio: { label: 'Audio', category: 'media', icon: '♫', text: 'Product Briefing Podcast', desc: 'Audio player with artist metadata' },
    map: { label: 'Map', category: 'media', icon: '📍', text: 'Our Location', desc: 'Interactive OpenStreetMap embed' },
    before_after: { label: 'Before / After', category: 'media', icon: '◧', text: 'Before & After Comparison', desc: 'Interactive comparison slider' },

    // Sliders, Posts & Navigation (8)
    slider: { label: 'Slider', category: 'posts', icon: '◁▷', text: 'Featured Slider', desc: 'Multi-slide hero & CTA carousel' },
    blog: { label: 'Blog', category: 'posts', icon: '📰', text: 'Latest Articles', desc: 'Responsive blog post cards grid' },
    portfolio: { label: 'Portfolio', category: 'posts', icon: '💼', text: 'Featured Projects', desc: 'Project showcase card grid' },
    filterable_portfolio: { label: 'Filterable Portfolio', category: 'posts', icon: '🗂', text: 'Filterable Work', desc: 'Category-filtered project grid' },
    post_title: { label: 'Post Title', category: 'posts', icon: 'H1', text: 'How Practical AI Helps Local Teams', desc: 'Article title with author & date meta' },
    post_navigation: { label: 'Post Navigation', category: 'posts', icon: '⇄', text: 'Post Navigation', desc: 'Previous & next article links' },
    post_slider: { label: 'Post Slider', category: 'posts', icon: '🗏', text: 'Featured Posts Slider', desc: 'Carousel of highlighted posts' },
    menu: { label: 'Menu', category: 'posts', icon: '☰', text: 'RSS Prism', desc: 'Inline navigation link bar' },

    // Fullwidth Divi Modules (8)
    fullwidth_header: { label: 'Fullwidth Header', category: 'fullwidth', icon: '▬', text: 'Developing Ideas. Delivering Solutions.', desc: 'Hero banner with subtitle & dual CTAs' },
    fullwidth_slider: { label: 'Fullwidth Slider', category: 'fullwidth', icon: '▭', text: 'Fullwidth Slider', desc: 'Wide edge-to-edge slide banner' },
    fullwidth_image: { label: 'Fullwidth Image', category: 'fullwidth', icon: '🖼', text: 'Fullwidth Image', desc: 'Wide showcase banner image' },
    fullwidth_map: { label: 'Fullwidth Map', category: 'fullwidth', icon: '🗺', text: 'Fullwidth Location Map', desc: 'Wide interactive map band' },
    fullwidth_menu: { label: 'Fullwidth Menu', category: 'fullwidth', icon: '☰', text: 'RSS Prism Navigation', desc: 'Full-width top navigation bar' },
    fullwidth_portfolio: { label: 'Fullwidth Portfolio', category: 'fullwidth', icon: '▤', text: 'Fullwidth Portfolio', desc: 'Wide project showcase grid' },
    fullwidth_post_slider: { label: 'Fullwidth Post Slider', category: 'fullwidth', icon: '▤', text: 'Fullwidth Post Slider', desc: 'Wide featured post carousel' },
    fullwidth_code: { label: 'Fullwidth Code', category: 'fullwidth', icon: '</>', text: 'Fullwidth Code Block', desc: 'Full-width syntax code display' },

    // WooCommerce Modules (4)
    shop: { label: 'Woo Shop', category: 'woo', icon: '🛍', text: 'Featured Products', desc: 'E-commerce product catalog grid' },
    woo_product: { label: 'Woo Product', category: 'woo', icon: '🏷', text: 'RSS Prism Pro Kit', desc: 'Single product card with price & SKU' },
    woo_cart: { label: 'Woo Cart', category: 'woo', icon: '🛒', text: 'Shopping Cart', desc: 'Cart line items & total summary' },
    woo_checkout: { label: 'Woo Checkout', category: 'woo', icon: '💳', text: 'Checkout Summary', desc: 'Order review & place order card' }
  };

  const CATEGORIES = [
    ['all', 'All (' + Object.keys(TYPES).length + ')'],
    ['layout', 'Layout'],
    ['content', 'Content'],
    ['interactive', 'Interactive'],
    ['media', 'Media'],
    ['posts', 'Blog & Portfolio'],
    ['fullwidth', 'Fullwidth'],
    ['woo', 'WooCommerce']
  ];

  const INLINE_EDITABLE_TYPES = [
    'heading', 'text', 'button', 'section', 'quote', 'blurb', 'callout',
    'pricing_table', 'testimonial', 'number_counter', 'bar_counter', 'circle_counter',
    'countdown', 'contact_form', 'email_optin', 'login', 'person', 'toggle',
    'fullwidth_header', 'post_title', 'post_content', 'audio', 'woo_product'
  ];

  function extraFreshDefaults(ts) {
    return {
      subtitle: 'Software, CCTV, Networking & Cloud Services built with clarity.',
      secondary_label: 'Explore Services',
      secondary_url: '#services',
      toggle_open: true,
      audio_url: '',
      audio_artist: 'RSS Studio',
      code_language: 'html',
      code_content: '<section class="rss-highlight">\n  <h2>RSS Prism Builder</h2>\n  <p>Clean, portable visual layout output.</p>\n</section>',
      map_address: 'Colombo, Sri Lanka',
      map_lat: 6.9271,
      map_lng: 79.8612,
      map_zoom: 13,
      map_height: 320,
      search_placeholder: 'Search pages, services, or docs…',
      icon_symbol: '★',
      icon_shape: 'circle',
      icon_size: 42,
      slides: [
        { id: 'sl-' + ts + '-1', title: 'Build Fast with RSS Prism', body: 'Design responsive sections, rows, and 60+ modules visually.', button_label: 'Get Started', button_url: '#start', bg_color: '#1e293b', image_url: '' },
        { id: 'sl-' + ts + '-2', title: 'Security-First Delivery', body: 'CCTV, networking, cloud, and AI solutions backed by direct support.', button_label: 'Contact Us', button_url: '#contact', bg_color: '#312e81', image_url: '' }
      ],
      video_playlist: [
        { id: 'vp-' + ts + '-1', title: 'Visual Builder Tour', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '03:20' },
        { id: 'vp-' + ts + '-2', title: 'Theme Studio Overview', video_url: 'https://vimeo.com/76979871', duration: '02:15' }
      ],
      cards: [
        { id: 'cd-' + ts + '-1', title: 'Smart CCTV Monitoring', category: 'Security', date: 'Oct 2026', author: 'RSS Team', excerpt: 'Multi-site camera visibility with clean network segmentation.', price: '$149', badge: 'Featured', image_url: '', url: '#' },
        { id: 'cd-' + ts + '-2', title: 'Cloud Workflow Portal', category: 'Software', date: 'Oct 2026', author: 'RSS Team', excerpt: 'Unified operations dashboard for field teams and clients.', price: '$89', badge: 'Popular', image_url: '', url: '#' },
        { id: 'cd-' + ts + '-3', title: 'AI Support Assistant', category: 'AI', date: 'Oct 2026', author: 'RSS Team', excerpt: 'Practical document search and ticket triage tools.', price: '$119', badge: 'New', image_url: '', url: '#' }
      ],
      menu_items: [
        { id: 'mn-' + ts + '-1', label: 'Home', url: '/' },
        { id: 'mn-' + ts + '-2', label: 'Services', url: '#services' },
        { id: 'mn-' + ts + '-3', label: 'Projects', url: '#projects' },
        { id: 'mn-' + ts + '-4', label: 'Contact', url: '#contact' }
      ],
      sidebar_widgets: [
        { id: 'wg-' + ts + '-1', title: 'Core Services', items: 'Software Development\nCCTV & Networking\nCloud Administration\nAI Workflows' },
        { id: 'wg-' + ts + '-2', title: 'Quick Links', items: 'Documentation\nLicensing Console\nSupport Desk' }
      ],
      post_meta: 'By RSS Editorial · Updated 2026',
      prev_post_label: '← Previous Article',
      next_post_label: 'Next Article →',
      dropcap: false,
      comments_items: [
        { id: 'cm-' + ts + '-1', author: 'Nadeesha K.', date: '2 days ago', body: 'Clear layout and super fast setup for our branch network overview.' },
        { id: 'cm-' + ts + '-2', author: 'Imran S.', date: 'Yesterday', body: 'The responsive preview modes save a lot of testing time.' }
      ],
      product_price: '$79',
      product_sale_price: '$59',
      product_sku: 'RSS-PRO-01',
      product_rating: 5,
      cart_items: [
        { id: 'ct-' + ts + '-1', name: 'RSS Prism Builder License', qty: 1, price: 49 },
        { id: 'ct-' + ts + '-2', name: 'Priority Setup Pack', qty: 1, price: 30 }
      ],
      before_image_url: '',
      after_image_url: '',
      before_label: 'Before',
      after_label: 'After',
      compare_split: 50
    };
  }

  function osmEmbedUrl(lat, lng, zoom) {
    const la = Number.isFinite(Number(lat)) ? Number(lat) : 6.9271;
    const ln = Number.isFinite(Number(lng)) ? Number(lng) : 79.8612;
    const z = Math.min(18, Math.max(1, Number(zoom) || 13));
    const delta = Math.max(0.005, 1.4 / Math.pow(2, Math.max(1, z - 6)));
    const bbox = (ln - delta).toFixed(4) + ',' + (la - delta).toFixed(4) + ',' + (ln + delta).toFixed(4) + ',' + (la + delta).toFixed(4);
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + encodeURIComponent(bbox) + '&layer=mapnik&marker=' + encodeURIComponent(la + ',' + ln);
  }

  function renderExtraModuleBody(ctx) {
    const { h, entry, i, style, borderStyle, cls, animKey, inlineProps, state, helpers } = ctx;
    const accent = entry.button_bg || '#b88a2b';
    const btnText = entry.button_text || '#ffffff';
    const btnRad = (Number(entry.button_radius ?? 6)) + 'px';

    if (entry.type === 'toggle') {
      const isOpen = state.toggleOpenMap[entry.id] !== undefined ? state.toggleOpenMap[entry.id] : Boolean(entry.toggle_open ?? true);
      return h('div', { key: animKey, className: cls + ' rp-live-accordion-item', style },
        h('button', {
          type: 'button',
          className: 'rp-live-accordion-trigger',
          onClick: e => {
            e.stopPropagation();
            state.setSelected(i);
            state.setToggleOpenMap(prev => ({ ...prev, [entry.id]: !isOpen }));
          }
        }, h('span', inlineProps, entry.text || 'Toggle Title'), h('span', null, isOpen ? '−' : '+')),
        isOpen ? h('div', { className: 'rp-live-accordion-body' }, entry.callout_body || 'Expandable toggle details.') : null
      );
    }

    if (entry.type === 'person') {
      const links = Array.isArray(entry.social_links) ? entry.social_links : [];
      return h('article', {
        key: animKey,
        className: cls + ' rp-live-person',
        style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 12) + 'px', background: style.background === 'transparent' ? '#fff' : style.background }
      },
        entry.image_url ? h('img', { src: entry.image_url, alt: entry.text || '', style: { width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' } }) : null,
        h('h3', { ...inlineProps, style: { margin: '0 0 4px', color: 'inherit' } }, entry.text || 'Team Member'),
        h('div', { style: { fontSize: '0.9em', color: accent, fontWeight: 700, marginBottom: '8px' } }, entry.subtitle || 'Lead Engineer'),
        h('p', { style: { margin: '0 0 10px', opacity: 0.82 } }, entry.callout_body || 'Specialist in software architecture and infrastructure.'),
        links.length ? h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          ...links.map((l, idx) => h('span', { key: idx, style: { fontSize: '11px', padding: '4px 9px', borderRadius: '6px', background: '#f1f5f9', color: '#1e293b', fontWeight: 600 } }, l.label || l.network))
        ) : null
      );
    }

    if (entry.type === 'circle_counter') {
      const pct = Math.min(100, Math.max(0, Number(entry.bar_percent ?? 85)));
      const r = 46;
      const circ = 2 * Math.PI * r;
      const offset = circ * (1 - pct / 100);
      return h('div', { key: animKey, className: cls + ' rp-live-circle-counter', style: { ...style, textAlign: 'center' } },
        h('svg', { width: 120, height: 120, viewBox: '0 0 120 120', style: { display: 'block', margin: '0 auto 10px' } },
          h('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: entry.bar_track_color || '#e5e7eb', strokeWidth: 10 }),
          h('circle', { cx: 60, cy: 60, r, fill: 'none', stroke: entry.bar_color || '#2b87da', strokeWidth: 10, strokeDasharray: circ.toFixed(1), strokeDashoffset: offset.toFixed(1), strokeLinecap: 'round', transform: 'rotate(-90 60 60)' }),
          h('text', { x: 60, y: 66, textAnchor: 'middle', fontSize: 22, fontWeight: 800, fill: 'currentColor' }, pct + '%')
        ),
        h('div', { ...inlineProps, style: { fontWeight: 700 } }, entry.text || 'System Uptime')
      );
    }

    if (entry.type === 'audio') {
      return h('article', {
        key: animKey,
        className: cls + ' rp-live-audio',
        style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 12) + 'px', background: style.background === 'transparent' ? '#fff' : style.background }
      },
        h('div', { style: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: accent, fontWeight: 700 } }, entry.audio_artist || 'RSS Studio'),
        h('h3', { ...inlineProps, style: { margin: '4px 0 10px', color: 'inherit' } }, entry.text || 'Audio Track'),
        entry.audio_url
          ? h('audio', { controls: true, src: entry.audio_url, style: { width: '100%' } })
          : h('div', { style: { padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', fontSize: '12px', color: '#64748b' } }, 'Set an MP3/Audio URL in Settings to enable playback.')
      );
    }

    if (entry.type === 'code' || entry.type === 'fullwidth_code') {
      const lang = (entry.code_language || 'html').toUpperCase();
      return h('div', { key: animKey, className: cls + ' rp-live-code', style: { ...style, background: '#0f172a', color: '#e2e8f0', borderRadius: (Number(entry.border_radius) || 10) + 'px' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' } },
          h('span', null, (entry.text || 'Code Snippet') + ' · ' + lang)
        ),
        h('pre', { style: { margin: 0, overflow: 'auto', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12.5px', lineHeight: 1.5 } },
          h('code', null, entry.code_content || '<div>RSS Prism</div>')
        )
      );
    }

    if (entry.type === 'email_optin') {
      return h('div', {
        key: animKey,
        className: cls + ' rp-live-optin',
        style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 12) + 'px', background: style.background === 'transparent' ? '#f8fafc' : style.background }
      },
        h('h3', { ...inlineProps, style: { margin: '0 0 6px', color: 'inherit' } }, entry.text || 'Subscribe for Updates'),
        h('p', { style: { margin: '0 0 12px', opacity: 0.8 } }, entry.subtitle || 'Receive product notes and updates.'),
        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          h('input', { type: 'text', placeholder: 'First name', readOnly: true, style: { flex: 1, minWidth: '120px', padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: '6px' } }),
          h('input', { type: 'email', placeholder: 'Email address', readOnly: true, style: { flex: 1.4, minWidth: '160px', padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: '6px' } }),
          h('span', { className: 'rss-prism-live-button', style: { background: accent, color: btnText, borderRadius: btnRad } }, entry.form_button_label || 'Subscribe')
        )
      );
    }

    if (entry.type === 'login') {
      return h('div', {
        key: animKey,
        className: cls + ' rp-live-login',
        style: { ...style, maxWidth: '440px', border: borderStyle || '1px solid #e2e8f0', borderRadius: (Number(entry.border_radius) || 12) + 'px', background: style.background === 'transparent' ? '#fff' : style.background }
      },
        h('h3', { ...inlineProps, style: { margin: '0 0 4px', color: 'inherit' } }, entry.text || 'Client Portal Login'),
        h('p', { style: { margin: '0 0 10px', fontSize: '0.9em', opacity: 0.75 } }, entry.subtitle || 'Sign in to access your dashboard.'),
        h('div', { style: { display: 'grid', gap: '8px' } },
          h('input', { type: 'text', placeholder: 'Username or Email', readOnly: true, style: { padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: '6px' } }),
          h('input', { type: 'password', placeholder: '••••••••', readOnly: true, style: { padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: '6px' } }),
          h('span', { className: 'rss-prism-live-button', style: { justifySelf: 'start', background: accent, color: btnText, borderRadius: btnRad } }, entry.form_button_label || 'Sign In')
        )
      );
    }

    if (entry.type === 'search') {
      return h('div', { key: animKey, className: cls + ' rp-live-search', style: { ...style, display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('input', { type: 'search', readOnly: true, placeholder: entry.search_placeholder || 'Search...', style: { flex: 1, minWidth: '180px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: btnRad } }),
        h('span', { className: 'rss-prism-live-button', style: { background: accent, color: btnText, borderRadius: btnRad } }, entry.form_button_label || 'Search')
      );
    }

    if (entry.type === 'map' || entry.type === 'fullwidth_map') {
      const mh = Math.min(600, Math.max(160, Number(entry.map_height) || 320));
      return h('div', { key: animKey, className: cls + ' rp-live-map', style },
        h('div', { style: { fontWeight: 700, marginBottom: '8px' } }, '📍 ' + (entry.map_address || entry.text || 'Location Map')),
        h('iframe', {
          src: osmEmbedUrl(entry.map_lat, entry.map_lng, entry.map_zoom),
          title: entry.map_address || 'Map',
          style: { width: '100%', height: mh + 'px', border: '1px solid #e2e8f0', borderRadius: '10px', pointerEvents: 'none' }
        })
      );
    }

    if (entry.type === 'icon') {
      const sz = Math.min(96, Math.max(20, Number(entry.icon_size) || 42));
      const shape = entry.icon_shape || 'circle';
      const radius = shape === 'circle' ? '50%' : shape === 'square' ? '10px' : '0';
      return h('div', { key: animKey, className: cls + ' rp-live-icon-box', style },
        h('div', {
          style: {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: (sz + 24) + 'px', height: (sz + 24) + 'px',
            borderRadius: radius,
            background: shape === 'none' ? 'transparent' : accent,
            color: shape === 'none' ? accent : btnText,
            fontSize: sz + 'px'
          }
        }, entry.icon_symbol || '★'),
        entry.text ? h('div', { style: { marginTop: '8px', fontWeight: 700 } }, entry.text) : null
      );
    }

    if (entry.type === 'before_after') {
      const split = state.compareSplitMap[entry.id] ?? Number(entry.compare_split || 50);
      const bImg = entry.before_image_url || entry.image_url;
      const aImg = entry.after_image_url || entry.image_url;
      return h('div', { key: animKey, className: cls + ' rp-live-before-after', style },
        h('div', { className: 'rp-live-compare-box' },
          aImg ? h('img', { src: aImg, alt: entry.after_label || 'After', className: 'rp-live-compare-img' })
            : h('div', { className: 'rp-live-compare-fallback rp-live-compare-fallback--after' }, entry.after_label || 'After Image'),
          h('div', { className: 'rp-live-compare-before', style: { width: split + '%' } },
            bImg ? h('img', { src: bImg, alt: entry.before_label || 'Before', className: 'rp-live-compare-img' })
              : h('div', { className: 'rp-live-compare-fallback' }, entry.before_label || 'Before Image')
          )
        ),
        h('input', {
          type: 'range',
          min: 5,
          max: 95,
          value: split,
          onClick: e => e.stopPropagation(),
          onChange: e => state.setCompareSplitMap(prev => ({ ...prev, [entry.id]: Number(e.target.value) })),
          style: { width: '100%', marginTop: '8px' }
        })
      );
    }

    if (entry.type === 'fullwidth_header') {
      return h('header', {
        key: animKey,
        className: cls + ' rp-live-fw-header',
        style: { ...style, padding: '44px 30px', borderRadius: (Number(entry.border_radius) || 12) + 'px', background: style.background === 'transparent' ? '#1e293b' : style.background, color: entry.text_color === '#202124' && style.background === 'transparent' ? '#ffffff' : style.color }
      },
        h('h1', { ...inlineProps, style: { margin: '0 0 10px', fontSize: '2em', color: 'inherit' } }, entry.text || 'Developing Ideas. Delivering Solutions.'),
        h('p', { style: { margin: '0 0 18px', opacity: 0.88, maxWidth: '680px' } }, entry.subtitle || ''),
        h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          h('span', { className: 'rss-prism-live-button', style: { background: accent, color: btnText, borderRadius: btnRad } }, entry.callout_label || 'Get Started'),
          entry.secondary_label ? h('span', { className: 'rss-prism-live-button', style: { background: 'transparent', border: '1px solid currentColor', color: 'inherit', borderRadius: btnRad } }, entry.secondary_label) : null
        )
      );
    }

    if (entry.type === 'fullwidth_image') {
      return h('div', { key: animKey, className: cls, style },
        entry.image_url
          ? h('img', { src: entry.image_url, alt: entry.alt || '', style: { display: 'block', width: '100%', height: entry.image_fit === 'contain' ? 'auto' : '340px', objectFit: entry.image_fit === 'contain' ? 'contain' : 'cover', borderRadius: '10px' } })
          : h('span', { className: 'rss-prism-image-placeholder' }, 'Choose a Fullwidth Banner Image in Settings')
      );
    }

    if (['slider', 'fullwidth_slider', 'post_slider', 'fullwidth_post_slider'].includes(entry.type)) {
      const slides = Array.isArray(entry.slides) && entry.slides.length ? entry.slides : [{ title: entry.text || 'Slide 1', body: 'Slide description', button_label: 'Learn More', bg_color: '#1e293b' }];
      const curIdx = Math.min(slides.length - 1, state.activeSlideMap[entry.id] ?? 0);
      const slide = slides[curIdx];
      return h('div', { key: animKey, className: cls + ' rp-live-slider', style },
        h('div', { className: 'rp-live-slide-stage', style: { background: slide.bg_color || '#1e293b' } },
          h('h2', { style: { margin: '0 0 8px', color: '#fff' } }, slide.title || 'Slide'),
          h('p', { style: { margin: '0 0 16px', opacity: 0.9, color: '#f8fafc' } }, slide.body || ''),
          slide.button_label ? h('span', { className: 'rss-prism-live-button', style: { background: accent, color: btnText, borderRadius: btnRad } }, slide.button_label) : null
        ),
        slides.length > 1 ? h('div', { style: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '10px' } },
          ...slides.map((_, idx) => h('button', {
            key: idx,
            type: 'button',
            className: 'rp-live-tab-btn' + (curIdx === idx ? ' is-active' : ''),
            onClick: e => { e.stopPropagation(); state.setSelected(i); state.setActiveSlideMap(prev => ({ ...prev, [entry.id]: idx })); }
          }, String(idx + 1)))
        ) : null
      );
    }

    if (entry.type === 'video_slider') {
      const vids = Array.isArray(entry.video_playlist) && entry.video_playlist.length ? entry.video_playlist : [{ title: 'Video 1', video_url: '', duration: '02:00' }];
      const curIdx = Math.min(vids.length - 1, state.activeSlideMap[entry.id] ?? 0);
      const cur = vids[curIdx];
      const embed = helpers.toEmbedUrl(cur.video_url);
      return h('div', { key: animKey, className: cls, style },
        embed
          ? h('div', { className: 'rp-live-video-wrap', style: { marginBottom: '10px' } }, h('iframe', { src: embed, title: cur.title || 'Video', allowFullScreen: true }))
          : h('div', { className: 'rss-prism-image-placeholder', style: { marginBottom: '10px' } }, 'Set YouTube/Vimeo URL in Video Playlist settings'),
        h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          ...vids.map((v, idx) => h('button', {
            key: v.id || idx,
            type: 'button',
            className: 'rp-live-tab-btn' + (curIdx === idx ? ' is-active' : ''),
            onClick: e => { e.stopPropagation(); state.setSelected(i); state.setActiveSlideMap(prev => ({ ...prev, [entry.id]: idx })); }
          }, '▶ ' + (v.title || 'Track ' + (idx + 1)) + ' (' + (v.duration || '02:00') + ')'))
        )
      );
    }

    if (['blog', 'portfolio', 'filterable_portfolio', 'fullwidth_portfolio', 'shop'].includes(entry.type)) {
      const cards = Array.isArray(entry.cards) && entry.cards.length ? entry.cards : [{ title: 'Sample Card', category: 'General', date: '2026', excerpt: 'Description', price: '$49' }];
      const cats = Array.from(new Set(cards.map(c => c.category || 'General')));
      const activeCat = state.filterCatMap[entry.id] || 'all';
      const visibleCards = entry.type === 'filterable_portfolio' && activeCat !== 'all' ? cards.filter(c => (c.category || 'General') === activeCat) : cards;
      return h('div', { key: animKey, className: cls, style },
        entry.type === 'filterable_portfolio' && cats.length > 1 ? h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' } },
          h('button', { type: 'button', className: 'rp-live-tab-btn' + (activeCat === 'all' ? ' is-active' : ''), onClick: e => { e.stopPropagation(); state.setFilterCatMap(p => ({ ...p, [entry.id]: 'all' })); } }, 'All'),
          ...cats.map(cat => h('button', {
            key: cat,
            type: 'button',
            className: 'rp-live-tab-btn' + (activeCat === cat ? ' is-active' : ''),
            onClick: e => { e.stopPropagation(); state.setFilterCatMap(p => ({ ...p, [entry.id]: cat })); }
          }, cat))
        ) : null,
        h('div', { className: 'rp-live-card-grid' },
          ...visibleCards.map((c, cIdx) => h('article', { key: c.id || cIdx, className: 'rp-live-card-item' },
            c.image_url ? h('img', { src: c.image_url, alt: c.title || '', style: { width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px' } }) : null,
            h('div', { style: { fontSize: '11px', textTransform: 'uppercase', color: accent, fontWeight: 700 } }, (c.category || 'General') + (entry.type === 'blog' && c.date ? ' · ' + c.date : '')),
            h('h4', { style: { margin: '2px 0' } }, c.title || 'Card'),
            entry.type === 'shop' ? h('div', { style: { fontWeight: 800, fontSize: '1.15em' } }, c.price || '$49') : null,
            h('p', { style: { margin: 0, fontSize: '13px', color: '#475569' } }, c.excerpt || ''),
            h('span', { style: { fontSize: '12px', color: accent, fontWeight: 700 } }, entry.type === 'shop' ? 'View Product →' : 'Read More →')
          ))
        )
      );
    }

    if (entry.type === 'post_title') {
      return h('header', { key: animKey, className: cls, style },
        h('div', { style: { fontSize: '0.85em', color: accent, fontWeight: 700, marginBottom: '6px' } }, entry.post_meta || 'By RSS Editorial'),
        h('h1', { ...inlineProps, style: { margin: '0 0 8px', color: 'inherit' } }, entry.text || 'Article Title'),
        entry.subtitle ? h('p', { style: { margin: 0, opacity: 0.78 } }, entry.subtitle) : null
      );
    }

    if (entry.type === 'post_content') {
      return h('article', { key: animKey, className: cls, style },
        h('p', { ...inlineProps, style: { margin: 0 } }, entry.text || 'Post body text.')
      );
    }

    if (entry.type === 'post_navigation') {
      return h('nav', { key: animKey, className: cls, style: { ...style, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' } },
        h('span', { style: { fontWeight: 600, color: accent } }, entry.prev_post_label || '← Previous Article'),
        h('span', { style: { fontWeight: 600, color: accent } }, entry.next_post_label || 'Next Article →')
      );
    }

    if (entry.type === 'comments') {
      const list = Array.isArray(entry.comments_items) && entry.comments_items.length ? entry.comments_items : [{ author: 'Visitor', date: 'Today', body: 'Sample comment.' }];
      return h('section', { key: animKey, className: cls, style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' } },
        h('h3', { style: { marginTop: 0 } }, (entry.text || 'Comments') + ' (' + list.length + ')'),
        ...list.map((c, idx) => h('div', { key: c.id || idx, style: { padding: '8px 0', borderTop: '1px solid #f1f5f9' } },
          h('strong', null, c.author), ' ', h('span', { style: { fontSize: '12px', color: '#64748b' } }, c.date),
          h('p', { style: { margin: '4px 0 0' } }, c.body)
        ))
      );
    }

    if (entry.type === 'menu' || entry.type === 'fullwidth_menu') {
      const links = Array.isArray(entry.menu_items) && entry.menu_items.length ? entry.menu_items : [{ label: 'Home', url: '/' }];
      return h('nav', { key: animKey, className: cls, style: { ...style, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', border: borderStyle || '1px solid #e2e8f0', borderRadius: '10px', background: style.background === 'transparent' ? '#fff' : style.background } },
        h('strong', null, entry.text || 'RSS Prism'),
        h('div', { style: { display: 'flex', gap: '14px', flexWrap: 'wrap' } },
          ...links.map((l, idx) => h('span', { key: l.id || idx, style: { fontWeight: 600 } }, l.label))
        )
      );
    }

    if (entry.type === 'breadcrumbs') {
      const links = Array.isArray(entry.menu_items) && entry.menu_items.length ? entry.menu_items : [{ label: 'Home' }, { label: 'Current' }];
      return h('nav', { key: animKey, className: cls, style: { ...style, fontSize: '0.9em' } },
        ...links.map((l, idx) => h('span', { key: l.id || idx },
          h('span', { style: { color: idx < links.length - 1 ? accent : 'inherit', fontWeight: idx < links.length - 1 ? 600 : 400 } }, l.label),
          idx < links.length - 1 ? h('span', { style: { opacity: 0.45, margin: '0 6px' } }, '/') : null
        ))
      );
    }

    if (entry.type === 'sidebar') {
      const widgets = Array.isArray(entry.sidebar_widgets) && entry.sidebar_widgets.length ? entry.sidebar_widgets : [{ title: 'Widgets', items: 'Item 1\nItem 2' }];
      return h('aside', { key: animKey, className: cls, style: { ...style, display: 'grid', gap: '12px' } },
        ...widgets.map((w, idx) => h('div', { key: w.id || idx, style: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' } },
          h('h4', { style: { margin: '0 0 6px' } }, w.title),
          h('ul', { style: { margin: 0, paddingLeft: '18px', color: '#475569' } },
            ...String(w.items || '').split(/\r?\n/).filter(Boolean).map((li, liIdx) => h('li', { key: liIdx }, li))
          )
        ))
      );
    }

    if (entry.type === 'woo_product') {
      const rating = Math.min(5, Math.max(1, Number(entry.product_rating || 5)));
      return h('article', { key: animKey, className: cls, style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', display: 'grid', gap: '8px' } },
        entry.image_url ? h('img', { src: entry.image_url, alt: entry.text || '', style: { width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px' } }) : null,
        h('div', { style: { color: '#f59e0b' } }, '★'.repeat(rating)),
        h('h3', { ...inlineProps, style: { margin: 0, color: 'inherit' } }, entry.text || 'Featured Product'),
        h('div', { style: { fontSize: '1.4em', fontWeight: 800, color: accent } },
          entry.product_sale_price || entry.product_price || '$79',
          entry.product_sale_price ? h('del', { style: { fontSize: '0.65em', color: '#94a3b8', marginLeft: '6px' } }, entry.product_price || '') : null
        ),
        h('div', { style: { fontSize: '12px', color: '#64748b' } }, 'SKU: ' + (entry.product_sku || 'RSS-01')),
        h('span', { className: 'rss-prism-live-button', style: { justifySelf: 'start', background: accent, color: btnText, borderRadius: btnRad } }, entry.callout_label || 'Add to Cart')
      );
    }

    if (entry.type === 'woo_cart' || entry.type === 'woo_checkout') {
      const rows = Array.isArray(entry.cart_items) && entry.cart_items.length ? entry.cart_items : [{ name: 'RSS Prism License', qty: 1, price: 49 }];
      const total = rows.reduce((sum, r) => sum + Number(r.qty || 1) * Number(r.price || 0), 0);
      return h('section', { key: animKey, className: cls, style: { ...style, border: borderStyle || '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' } },
        h('h3', { style: { marginTop: 0 } }, entry.text || (entry.type === 'woo_checkout' ? 'Checkout Summary' : 'Shopping Cart')),
        h('div', { style: { display: 'grid', gap: '8px', marginBottom: '12px' } },
          ...rows.map((r, idx) => h('div', { key: r.id || idx, style: { display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' } },
            h('span', null, r.name + ' × ' + r.qty),
            h('strong', null, '$' + (Number(r.qty || 1) * Number(r.price || 0)).toFixed(2))
          )),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1em' } },
            h('span', null, 'Total'), h('span', null, '$' + total.toFixed(2))
          )
        ),
        h('span', { className: 'rss-prism-live-button', style: { background: accent, color: btnText, borderRadius: btnRad } }, entry.callout_label || (entry.type === 'woo_checkout' ? 'Place Order' : 'Proceed to Checkout'))
      );
    }

    return null;
  }

  function renderArrayCards(h, item, update, clone, key, label, fieldsSpec, factory) {
    const list = Array.isArray(item[key]) ? item[key] : [];
    const mutate = fn => {
      const next = clone(list);
      fn(next);
      update(key, next);
    };
    return h('div', { className: 'rss-prism-image-controls' },
      ...list.map((row, idx) => h('div', { key: row.id || idx, className: 'rp-divi-subitem-card' },
        h('div', { className: 'rp-divi-subitem-card__head' },
          h('span', null, label + ' #' + (idx + 1)),
          h('button', {
            type: 'button',
            className: 'button-link-delete',
            disabled: list.length <= 1,
            onClick: () => mutate(arr => arr.splice(idx, 1))
          }, 'Remove')
        ),
        ...fieldsSpec.map(([fKey, fLabel, fType]) => h('label', { key: fKey, className: 'rss-prism-field' },
          h('span', null, fLabel),
          h(fType === 'textarea' ? 'textarea' : 'input', {
            type: fType === 'textarea' ? undefined : (fType || 'text'),
            rows: fType === 'textarea' ? 2 : undefined,
            value: row[fKey] ?? '',
            onChange: e => mutate(arr => { arr[idx][fKey] = fType === 'number' ? Number(e.target.value) : e.target.value; })
          })
        ))
      )),
      h('button', {
        type: 'button',
        className: 'button',
        disabled: list.length >= 12,
        onClick: () => mutate(arr => arr.push(factory(arr.length + 1)))
      }, '+ Add ' + label)
    );
  }

  function renderExtraModuleSettings(ctx) {
    const { h, item, field, update, chooseImage, clone } = ctx;
    const t = item.type;

    if (t === 'toggle') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Toggle Body Content', 'callout_body', item.callout_body || '', 'textarea'),
        h('label', { className: 'rp-divi-toggle-row' },
          h('span', null, 'Open Initially'),
          h('input', { type: 'checkbox', checked: Boolean(item.toggle_open), onChange: e => update('toggle_open', e.target.checked) })
        )
      );
    }

    if (t === 'person') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Role / Position', 'subtitle', item.subtitle || ''),
        field('Biography', 'callout_body', item.callout_body || '', 'textarea'),
        h('button', { type: 'button', className: 'button', onClick: () => chooseImage('image_url', 'alt') }, item.image_url ? 'Replace Photo' : 'Choose Photo'),
        field('Photo URL', 'image_url', item.image_url || '', 'url')
      );
    }

    if (t === 'circle_counter') {
      return h('div', { className: 'rss-prism-image-controls' },
        h('label', { className: 'rss-prism-field' }, h('span', null, 'Percentage: ' + (item.bar_percent ?? 85) + '%'),
          h('input', { type: 'range', min: 0, max: 100, value: item.bar_percent ?? 85, onChange: e => update('bar_percent', Number(e.target.value)) })
        ),
        h('div', { className: 'rp-divi-grid-2' },
          field('Ring Color', 'bar_color', item.bar_color || '#2b87da', 'color'),
          field('Track Color', 'bar_track_color', item.bar_track_color || '#e5e7eb', 'color')
        )
      );
    }

    if (t === 'audio') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Artist / Subtitle', 'audio_artist', item.audio_artist || ''),
        field('Audio File URL (.mp3 / .ogg)', 'audio_url', item.audio_url || '', 'url')
      );
    }

    if (t === 'code' || t === 'fullwidth_code') {
      return h('div', { className: 'rss-prism-image-controls' },
        h('label', { className: 'rss-prism-field' }, h('span', null, 'Language'),
          h('select', { value: item.code_language || 'html', onChange: e => update('code_language', e.target.value) },
            ...['html', 'css', 'js', 'json', 'bash', 'text'].map(l => h('option', { key: l, value: l }, l.toUpperCase()))
          )
        ),
        field('Code Content', 'code_content', item.code_content || '', 'textarea', { rows: 6 })
      );
    }

    if (t === 'email_optin' || t === 'login') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Subtitle / Description', 'subtitle', item.subtitle || ''),
        field('Submit Button Label', 'form_button_label', item.form_button_label || (t === 'login' ? 'Sign In' : 'Subscribe')),
        t === 'email_optin' ? field('Success Message', 'form_success_message', item.form_success_message || '') : null
      );
    }

    if (t === 'search') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Input Placeholder', 'search_placeholder', item.search_placeholder || ''),
        field('Button Label', 'form_button_label', item.form_button_label || 'Search')
      );
    }

    if (t === 'map' || t === 'fullwidth_map') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Location Label / Address', 'map_address', item.map_address || ''),
        h('div', { className: 'rp-divi-grid-2' },
          field('Latitude', 'map_lat', item.map_lat ?? 6.9271, 'number', { step: '0.0001' }),
          field('Longitude', 'map_lng', item.map_lng ?? 79.8612, 'number', { step: '0.0001' })
        ),
        h('div', { className: 'rp-divi-grid-2' },
          field('Zoom (1-18)', 'map_zoom', item.map_zoom ?? 13, 'number', { min: 1, max: 18 }),
          field('Height (px)', 'map_height', item.map_height ?? 320, 'number', { min: 160, max: 600 })
        )
      );
    }

    if (t === 'icon') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Icon Symbol / Emoji', 'icon_symbol', item.icon_symbol || '★'),
        h('div', { className: 'rp-divi-grid-2' },
          h('label', { className: 'rss-prism-field' }, h('span', null, 'Shape'),
            h('select', { value: item.icon_shape || 'circle', onChange: e => update('icon_shape', e.target.value) },
              h('option', { value: 'circle' }, 'Circle'),
              h('option', { value: 'square' }, 'Square'),
              h('option', { value: 'none' }, 'No Frame')
            )
          ),
          field('Icon Size (px)', 'icon_size', item.icon_size ?? 42, 'number', { min: 20, max: 96 })
        )
      );
    }

    if (t === 'before_after') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Before Image URL', 'before_image_url', item.before_image_url || '', 'url'),
        field('After Image URL', 'after_image_url', item.after_image_url || '', 'url'),
        h('div', { className: 'rp-divi-grid-2' },
          field('Before Label', 'before_label', item.before_label || 'Before'),
          field('After Label', 'after_label', item.after_label || 'After')
        )
      );
    }

    if (t === 'fullwidth_header') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Subtitle', 'subtitle', item.subtitle || '', 'textarea', { rows: 2 }),
        h('div', { className: 'rp-divi-grid-2' },
          field('Primary CTA', 'callout_label', item.callout_label || 'Get Started'),
          field('Primary URL', 'url', item.url || '', 'url')
        ),
        h('div', { className: 'rp-divi-grid-2' },
          field('Secondary CTA', 'secondary_label', item.secondary_label || ''),
          field('Secondary URL', 'secondary_url', item.secondary_url || '', 'url')
        )
      );
    }

    if (t === 'fullwidth_image') {
      return h('div', { className: 'rss-prism-image-controls' },
        h('button', { type: 'button', className: 'button button-primary', onClick: () => chooseImage('image_url', 'alt') }, item.image_url ? 'Replace Banner Image' : 'Choose Banner Image'),
        field('Image URL', 'image_url', item.image_url || '', 'url'),
        field('Alt text', 'alt', item.alt || '')
      );
    }

    if (['slider', 'fullwidth_slider', 'post_slider', 'fullwidth_post_slider'].includes(t)) {
      return renderArrayCards(h, item, update, clone, 'slides', 'Slide', [
        ['title', 'Title', 'text'],
        ['body', 'Body Text', 'textarea'],
        ['button_label', 'Button Label', 'text'],
        ['button_url', 'Button URL', 'url'],
        ['bg_color', 'Slide Background', 'color']
      ], n => ({ id: 'sl-' + Date.now() + '-' + n, title: 'Slide ' + n, body: 'Slide description.', button_label: 'Learn More', button_url: '#', bg_color: '#1e293b' }));
    }

    if (t === 'video_slider') {
      return renderArrayCards(h, item, update, clone, 'video_playlist', 'Video Track', [
        ['title', 'Video Title', 'text'],
        ['video_url', 'YouTube / Vimeo URL', 'url'],
        ['duration', 'Duration', 'text']
      ], n => ({ id: 'vp-' + Date.now() + '-' + n, title: 'Video ' + n, video_url: '', duration: '02:00' }));
    }

    if (['blog', 'portfolio', 'filterable_portfolio', 'fullwidth_portfolio', 'shop'].includes(t)) {
      return renderArrayCards(h, item, update, clone, 'cards', t === 'shop' ? 'Product' : 'Card', [
        ['title', 'Title', 'text'],
        ['category', 'Category', 'text'],
        ...(t === 'shop' ? [['price', 'Price', 'text']] : [['date', 'Date', 'text']]),
        ['excerpt', 'Summary', 'textarea'],
        ['image_url', 'Image URL', 'url'],
        ['url', 'Link URL', 'url']
      ], n => ({ id: 'cd-' + Date.now() + '-' + n, title: 'Item ' + n, category: 'General', date: '2026', excerpt: 'Card summary.', price: '$49', image_url: '', url: '#' }));
    }

    if (t === 'post_title') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Author & Date Meta', 'post_meta', item.post_meta || ''),
        field('Subtitle / Excerpt', 'subtitle', item.subtitle || '')
      );
    }

    if (t === 'post_navigation') {
      return h('div', { className: 'rss-prism-image-controls' },
        field('Previous Post Label', 'prev_post_label', item.prev_post_label || ''),
        field('Next Post Label', 'next_post_label', item.next_post_label || '')
      );
    }

    if (t === 'comments') {
      return renderArrayCards(h, item, update, clone, 'comments_items', 'Comment', [
        ['author', 'Author', 'text'],
        ['date', 'Date', 'text'],
        ['body', 'Comment Text', 'textarea']
      ], n => ({ id: 'cm-' + Date.now() + '-' + n, author: 'Reader ' + n, date: 'Today', body: 'Helpful article.' }));
    }

    if (['menu', 'fullwidth_menu', 'breadcrumbs'].includes(t)) {
      return renderArrayCards(h, item, update, clone, 'menu_items', 'Nav Item', [
        ['label', 'Label', 'text'],
        ['url', 'URL', 'url']
      ], n => ({ id: 'mn-' + Date.now() + '-' + n, label: 'Link ' + n, url: '#' }));
    }

    if (t === 'sidebar') {
      return renderArrayCards(h, item, update, clone, 'sidebar_widgets', 'Widget', [
        ['title', 'Widget Title', 'text'],
        ['items', 'Lines (one per line)', 'textarea']
      ], n => ({ id: 'wg-' + Date.now() + '-' + n, title: 'Widget ' + n, items: 'First link\nSecond link' }));
    }

    if (t === 'woo_product') {
      return h('div', { className: 'rss-prism-image-controls' },
        h('div', { className: 'rp-divi-grid-2' },
          field('Regular Price', 'product_price', item.product_price || '$79'),
          field('Sale Price', 'product_sale_price', item.product_sale_price || '')
        ),
        field('SKU', 'product_sku', item.product_sku || 'RSS-01'),
        field('Short Description', 'callout_body', item.callout_body || '', 'textarea', { rows: 2 }),
        field('Button Label', 'callout_label', item.callout_label || 'Add to Cart'),
        field('Product URL', 'url', item.url || '', 'url'),
        field('Product Image URL', 'image_url', item.image_url || '', 'url')
      );
    }

    if (t === 'woo_cart' || t === 'woo_checkout') {
      return h('div', null,
        renderArrayCards(h, item, update, clone, 'cart_items', 'Cart Item', [
          ['name', 'Product Name', 'text'],
          ['qty', 'Quantity', 'number'],
          ['price', 'Unit Price ($)', 'number']
        ], n => ({ id: 'ct-' + Date.now() + '-' + n, name: 'Product ' + n, qty: 1, price: 29 })),
        field('Action Button Label', 'callout_label', item.callout_label || (t === 'woo_checkout' ? 'Place Order' : 'Proceed to Checkout'))
      );
    }

    return null;
  }

  window.RSS_PRISM_MODULES = {
    TYPES,
    CATEGORIES,
    INLINE_EDITABLE_TYPES,
    extraFreshDefaults,
    renderExtraModuleBody,
    renderExtraModuleSettings
  };
})();
