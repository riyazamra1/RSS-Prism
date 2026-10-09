(() => {
	'use strict';
	const root = document.getElementById('rss-prism-builder-app');
	const dataNode = document.getElementById('rss-prism-builder-data');
	if (!root || !dataNode || !window.wp || !wp.element) return;
	let config;
	try { config = JSON.parse(dataNode.textContent); } catch (e) { root.textContent = 'Could not load the layout data.'; return; }
	const { createElement: h, useState } = wp.element;
	const TYPES = {
		section: { label: 'Section', text: 'New section' },
		heading: { label: 'Heading', text: 'Your heading' },
		text: { label: 'Text', text: 'Write something useful for your visitors.' },
		button: { label: 'Button', text: 'Learn more' }
	};
	const fresh = (type) => ({ id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), type, text: TYPES[type].text, url: type === 'button' ? 'https://example.com/' : '', background: type === 'section' ? '#f7f6f2' : '', padding: 24 });
	function App() {
		const [items, setItems] = useState(Array.isArray(config.layout) ? config.layout : []);
		const [selected, setSelected] = useState(0);
		const [notice, setNotice] = useState('');
		const [busy, setBusy] = useState(false);
		const item = items[selected] || null;
		const update = (key, value) => setItems(old => old.map((entry, i) => i === selected ? { ...entry, [key]: value } : entry));
		const add = type => { setItems(old => [...old, fresh(type)]); setSelected(items.length); setNotice(''); };
		const move = (from, to) => setItems(old => { if (to < 0 || to >= old.length || from === to) return old; const next = old.slice(); const [entry] = next.splice(from, 1); next.splice(to, 0, entry); setSelected(to); return next; });
		const save = async () => {
			setBusy(true); setNotice('');
			try {
				const response = await fetch(config.restUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, layout: items }) });
				const result = await response.json();
				if (!response.ok || !result.saved) throw new Error(result.message || 'Save failed.');
				setNotice('Layout saved. To publish it, publish the selected Prism Template and use [rss_prism_canvas id="' + config.postId + '"] on a page.');
			} catch (error) { setNotice(error.message || 'Could not save the layout.'); }
			finally { setBusy(false); }
		};
		const field = (label, key, value, type = 'text') => h('label', { className: 'rss-prism-field' }, h('span', null, label), h(type === 'textarea' ? 'textarea' : 'input', { type: type === 'textarea' ? undefined : type, value: value || '', onChange: e => update(key, e.target.value), rows: type === 'textarea' ? 4 : undefined }));
		const canvasItem = (entry, i) => h('div', { key: entry.id || i, className: 'rss-prism-canvas-item' + (i === selected ? ' is-selected' : ''), draggable: true, onDragStart: e => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; }, onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, onDrop: e => { e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); move(from, i); }, onClick: () => setSelected(i) },
			h('span', { className: 'rss-prism-drag-handle', title: 'Drag to reorder', 'aria-label': 'Drag to reorder' }, '⠿'),
			h('span', { className: 'rss-prism-canvas-kind' }, TYPES[entry.type] ? TYPES[entry.type].label : entry.type),
			h('span', { className: 'rss-prism-canvas-text' }, entry.text || '(empty)'),
			h('button', { type: 'button', className: 'button-link-delete', onClick: e => { e.stopPropagation(); setItems(old => old.filter((_, n) => n !== i)); setSelected(Math.max(0, Math.min(selected, items.length - 2))); } }, 'Remove'));
		return h('div', { className: 'rss-prism-builder-layout' },
			h('div', { className: 'rss-prism-builder-toolbar' }, h('div', null, h('strong', null, 'Add element'), ...Object.keys(TYPES).map(type => h('button', { key: type, type: 'button', className: 'button', onClick: () => add(type) }, '+ ' + TYPES[type].label))), h('button', { type: 'button', className: 'button button-primary', disabled: busy, onClick: save }, busy ? 'Saving…' : 'Save layout')),
			notice ? h('div', { className: 'notice notice-info rss-prism-builder-notice', role: 'status' }, h('p', null, notice)) : null,
			h('div', { className: 'rss-prism-builder-workspace' },
				h('section', { className: 'rss-prism-builder-canvas' }, h('div', { className: 'rss-prism-canvas-heading' }, 'Page canvas · drag elements to reorder'), items.length ? items.map(canvasItem) : h('p', { className: 'rss-prism-empty' }, 'Start by adding a section, heading, text, or button.')),
				h('aside', { className: 'rss-prism-builder-inspector' }, h('h2', null, 'Element settings'), item ? h('div', null,
					h('p', { className: 'rss-prism-inspector-type' }, TYPES[item.type] ? TYPES[item.type].label : item.type),
					field('Content', 'text', item.text, 'textarea'),
					item.type === 'button' ? field('Button URL', 'url', item.url, 'url') : null,
					item.type === 'section' ? field('Background color', 'background', item.background, 'color') : null,
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Padding: ' + (item.padding || 0) + ' px'), h('input', { type: 'range', min: 0, max: 100, value: item.padding || 0, onChange: e => update('padding', Number(e.target.value)) })),
					h('button', { type: 'button', className: 'button', disabled: selected <= 0, onClick: () => move(selected, selected - 1) }, 'Move up'),
					h('button', { type: 'button', className: 'button', disabled: selected >= items.length - 1, onClick: () => move(selected, selected + 1) }, 'Move down')
				) : h('p', null, 'Select an element on the canvas to edit its settings.'))
			)
		);
	}
	wp.element.render(h(App), root);
})();