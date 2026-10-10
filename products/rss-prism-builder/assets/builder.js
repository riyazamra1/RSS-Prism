(() => {
	'use strict';
	const root = document.getElementById('rss-prism-builder-app');
	const dataNode = document.getElementById('rss-prism-builder-data');
	if (!root || !dataNode || !window.wp || !wp.element) return;
	let config;
	try { config = JSON.parse(dataNode.textContent); } catch (e) { root.textContent = 'Could not load layout data.'; return; }
	const { createElement: h, useState } = wp.element;
	const TYPES = {
		section: { label: 'Section', text: 'New section' },
		heading: { label: 'Heading', text: 'Your heading' },
		text: { label: 'Text', text: 'Write something useful for your visitors.' },
		button: { label: 'Button', text: 'Learn more' },
		image: { label: 'Image', text: 'Image' },
		columns: { label: 'Columns', text: 'Columns' }
	};
	const fresh = type => {
		const fontSize = type === 'heading' ? 32 : 16;
		const responsive = {};
		['desktop', 'tablet', 'mobile'].forEach(device => { responsive[device] = { font_size: fontSize, padding: 24, align: 'left' }; });
		return { id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), type, text: TYPES[type].text, url: '', image_url: '', alt: '', button_bg: '#b88a2b', button_text: '#ffffff', button_radius: 6, image_width: 100, columns_count: 2, column_contents: ['First column content', 'Second column content', 'Third column content'], column_elements: [[{ id: 'child-' + Date.now() + '-a', type: 'text', text: 'First column content', url: '' }], [{ id: 'child-' + Date.now() + '-b', type: 'text', text: 'Second column content', url: '' }], [{ id: 'child-' + Date.now() + '-c', type: 'text', text: 'Third column content', url: '' }]], background: type === 'section' ? '#f7f6f2' : '', text_color: '#202124', font_size: fontSize, align: 'left', padding: 24, responsive };
	};
	const clone = value => JSON.parse(JSON.stringify(value));
	const normalizedColumnElements = entry => Array.from({ length: Number(entry.columns_count || 2) }, (_, index) => {
		const children = entry.column_elements && entry.column_elements[index];
		if (Array.isArray(children) && children.length) return clone(children);
		const legacy = (entry.column_contents || [])[index];
		return legacy ? [{ id: 'legacy-column-' + index, type: 'text', text: legacy, url: '' }] : [];
	});
	function App() {
		const [items, setItems] = useState(Array.isArray(config.layout) ? config.layout : []);
		const [selected, setSelected] = useState(0);
		const [notice, setNotice] = useState('');
		const [busy, setBusy] = useState(false);
		const [preview, setPreview] = useState('desktop');
		const [history, setHistory] = useState([]);
		const [future, setFuture] = useState([]);
		const commitItems = next => { setHistory(old => [...old.slice(-29), clone(items)]); setFuture([]); setItems(typeof next === 'function' ? next(items) : next); };
		const item = items[selected] || null;
		const update = (key, value) => commitItems(old => old.map((entry, i) => {
			if (i !== selected) return entry;
			if (['font_size', 'padding', 'align'].includes(key)) {
				const responsive = clone(entry.responsive || {});
				['desktop', 'tablet', 'mobile'].forEach(device => { if (!responsive[device]) responsive[device] = { font_size: entry.font_size || 16, padding: entry.padding ?? 24, align: entry.align || 'left' }; });
				responsive[preview] = { ...responsive[preview], [key]: value };
				return { ...entry, [key]: value, responsive };
			}
			return { ...entry, [key]: value };
		}));
		const add = type => { const next = [...items, fresh(type)]; commitItems(next); setSelected(next.length - 1); setNotice(''); };
		const insertStarter = kind => {
			const specs = kind === 'services' ? [['section','Our Services'],['heading','Solutions for your business'],['columns',''],['text','CCTV installation, networking, software development, system administration, and technical support.'],['button','Contact RSS']]
				: kind === 'contact' ? [['section','Contact Razeen Secure Solution'],['heading','Let’s discuss your project'],['text','Developing Ideas. Delivering Solutions.'],['columns',''],['button','Email RSS']]
				: [['section','Razeen Secure Solution'],['heading','Developing Ideas. Delivering Solutions.'],['text','Software development, CCTV solutions, networking, cloud services, and practical AI solutions.'],['columns',''],['heading','Our approach'],['text','Reliable implementation, clear communication, and security-conscious solutions for every project.'],['button','Contact RSS']];
			const additions = specs.map(([type, text]) => { const entry = fresh(type); if (text) entry.text = text; if (type === 'columns') { entry.column_contents = ['Software & AI solutions','CCTV & networking','Cloud & system support']; entry.column_elements = [['heading','Software & AI solutions'],['heading','CCTV & networking'],['heading','Cloud & system support']].map(([childType, text], i) => [{ id: 'child-' + Date.now() + '-' + i, type: childType, text, url: '' }]); } if (type === 'button') entry.url = kind === 'contact' ? 'mailto:rsscctvsolution@gmail.com' : 'https://www.rsscctvsolution.eu.cc/'; return entry; });
			const next = [...items, ...additions]; commitItems(next); setSelected(items.length); setNotice('Starter sections added. Review the content and save the layout.');
		};
		const move = (from, to) => { if (to < 0 || to >= items.length || from === to) return; const next = items.slice(); const [entry] = next.splice(from, 1); next.splice(to, 0, entry); commitItems(next); setSelected(to); };
		const remove = index => { commitItems(items.filter((_, i) => i !== index)); setSelected(Math.max(0, Math.min(selected, items.length - 2))); };
		const undo = () => { if (!history.length) return; setFuture(old => [clone(items), ...old]); setItems(history[history.length - 1]); setHistory(old => old.slice(0, -1)); };
		const redo = () => { if (!future.length) return; setHistory(old => [...old, clone(items)]); setItems(future[0]); setFuture(old => old.slice(1)); };
		const duplicate = index => { const next = items.slice(); const copy = clone(next[index]); copy.id = 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); next.splice(index + 1, 0, copy); commitItems(next); setSelected(index + 1); };
		const chooseImage = () => {
			if (!window.wp || !wp.media) { setNotice('The WordPress media library is not available on this screen.'); return; }
			const frame = wp.media({ title: 'Choose an image', button: { text: 'Use image' }, library: { type: 'image' }, multiple: false });
			frame.on('select', () => { const attachment = frame.state().get('selection').first().toJSON(); update('image_url', attachment.url || ''); if (!item.alt && attachment.alt) update('alt', attachment.alt); });
			frame.open();
		};
		const save = async () => {
			setBusy(true); setNotice('');
			try {
				const response = await fetch(config.restUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, layout: items }) });
				const result = await response.json();
				if (!response.ok || !result.saved) throw new Error(result.message || 'Save failed.');
				setNotice('Saved. Publish the Prism Template and place [rss_prism_canvas id="' + config.postId + '"] on a page to display it.');
			} catch (error) { setNotice(error.message || 'Could not save the layout.'); }
			finally { setBusy(false); }
		};
		const field = (label, key, value, type = 'text') => h('label', { className: 'rss-prism-field' }, h('span', null, label), h(type === 'textarea' ? 'textarea' : 'input', { type: type === 'textarea' ? undefined : type, value: value ?? '', onChange: e => update(key, type === 'range' ? Number(e.target.value) : e.target.value), rows: type === 'textarea' ? 4 : undefined, min: type === 'range' ? 10 : undefined, max: type === 'range' ? 96 : undefined }));
		const previewElement = (entry, i) => {
			const deviceStyle = (entry.responsive && entry.responsive[preview]) || entry;
			const style = { padding: (Number(deviceStyle.padding ?? entry.padding) || 0) + 'px', background: entry.background || 'transparent', color: entry.text_color || '#202124', fontSize: (Number(deviceStyle.font_size ?? entry.font_size) || 16) + 'px', textAlign: deviceStyle.align || entry.align || 'left', boxSizing: 'border-box', overflowWrap: 'anywhere' };
			const common = { key: entry.id || i, className: 'rss-prism-live-element ' + (i === selected ? 'is-selected' : ''), style, onClick: () => setSelected(i) };
			if (entry.type === 'heading') return h('h2', common, entry.text || 'Heading');
			if (entry.type === 'text') return h('p', common, entry.text || 'Text');
			if (entry.type === 'button') return h('div', common, h('span', { className: 'rss-prism-live-button', style: { background: entry.button_bg || '#b88a2b', color: entry.button_text || '#ffffff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' } }, entry.text || 'Button'));
			if (entry.type === 'columns') return h('div', { ...common, className: common.className + ' rss-prism-live-columns', style: { ...style, display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(3, Math.max(2, Number(entry.columns_count || 2))) + ', minmax(0, 1fr))', gap: '12px' } }, ...Array.from({ length: Number(entry.columns_count || 2) }, (_, index) => { const children = normalizedColumnElements(entry)[index]; return h('div', { key: index, className: 'rss-prism-live-column-cell' }, ...children.map((child, childIndex) => child.type === 'heading' ? h('h3', { key: child.id || childIndex }, child.text || 'Heading') : child.type === 'button' ? h('p', { key: child.id || childIndex }, h('span', { className: 'rss-prism-live-button' }, child.text || 'Button')) : h('p', { key: child.id || childIndex }, child.text || 'Text'))); }));
			if (entry.type === 'image') return h('div', common, entry.image_url ? h('img', { src: entry.image_url, alt: entry.alt || '', className: 'rss-prism-live-image', style: { width: Math.min(100, Math.max(10, Number(entry.image_width ?? 100))) + '%' } }) : h('span', { className: 'rss-prism-image-placeholder' }, 'Choose an image in Element settings'));
			return h('section', common, entry.text || 'Section');
		};
		const canvasItem = (entry, i) => h('div', { key: entry.id || i, className: 'rss-prism-canvas-item' + (i === selected ? ' is-selected' : ''), draggable: true, onDragStart: e => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; }, onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, onDrop: e => { e.preventDefault(); move(Number(e.dataTransfer.getData('text/plain')), i); }, onClick: () => setSelected(i) },
			h('span', { className: 'rss-prism-drag-handle', title: 'Drag to reorder', 'aria-label': 'Drag to reorder' }, '⠿'),
			h('span', { className: 'rss-prism-canvas-kind' }, TYPES[entry.type] ? TYPES[entry.type].label : entry.type),
			h('span', { className: 'rss-prism-canvas-text' }, entry.text || '(empty)'),
			h('button', { type: 'button', className: 'button', onClick: e => { e.stopPropagation(); duplicate(i); } }, 'Duplicate'),
			h('button', { type: 'button', className: 'button-link-delete', onClick: e => { e.stopPropagation(); remove(i); } }, 'Remove'));
		return h('div', { className: 'rss-prism-builder-layout' },
			h('div', { className: 'rss-prism-builder-toolbar' },
				h('div', { className: 'rss-prism-builder-add' }, h('strong', null, 'Add element'), ...Object.keys(TYPES).map(type => h('button', { key: type, type: 'button', className: 'button', onClick: () => add(type) }, '+ ' + TYPES[type].label))),
				h('div', { className: 'rss-prism-builder-add rss-prism-starters' }, h('strong', null, 'Insert RSS starter layout'), ...[['business','Business landing'],['services','Services'],['contact','Contact page']].map(([kind,label]) => h('button', { key: kind, type: 'button', className: 'button', onClick: () => insertStarter(kind) }, label))),
				h('div', { className: 'rss-prism-builder-actions' }, h('button', { type: 'button', className: 'button', disabled: !history.length, onClick: undo }, 'Undo'), h('button', { type: 'button', className: 'button', disabled: !future.length, onClick: redo }, 'Redo'), h('button', { type: 'button', className: 'button button-primary', disabled: busy, onClick: save }, busy ? 'Saving…' : 'Save layout'))),
			notice ? h('div', { className: 'notice notice-info rss-prism-builder-notice', role: 'status' }, h('p', null, notice)) : null,
			h('div', { className: 'rss-prism-preview-toolbar' }, h('strong', null, 'Responsive preview'), ...[['desktop','Desktop'],['tablet','Tablet'],['mobile','Mobile']].map(pair => h('button', { key: pair[0], type: 'button', className: 'button ' + (preview === pair[0] ? 'button-primary' : ''), onClick: () => setPreview(pair[0]), 'aria-pressed': preview === pair[0] }, pair[1]))),
			h('div', { className: 'rss-prism-builder-workspace' },
				h('section', { className: 'rss-prism-builder-canvas' }, h('div', { className: 'rss-prism-canvas-heading' }, 'Structure · drag items to reorder'), items.length ? items.map(canvasItem) : h('p', { className: 'rss-prism-empty' }, 'Start by adding a section, heading, text, or button.')),
				h('aside', { className: 'rss-prism-builder-inspector' }, h('h2', null, 'Element settings'), item ? h('div', null,
					h('p', { className: 'rss-prism-inspector-type' }, TYPES[item.type] ? TYPES[item.type].label : item.type),
					field('Content', 'text', item.text, 'textarea'),
					item.type === 'button' ? h('div', { className: 'rss-prism-image-controls' }, field('Button URL', 'url', item.url, 'url'), field('Button background', 'button_bg', item.button_bg || '#b88a2b', 'color'), field('Button text color', 'button_text', item.button_text || '#ffffff', 'color'), h('label', { className: 'rss-prism-field' }, h('span', null, 'Corner radius: ' + (item.button_radius ?? 6) + ' px'), h('input', { type: 'range', min: 0, max: 40, value: item.button_radius ?? 6, onChange: e => update('button_radius', Number(e.target.value)) }))) : null,
					item.type === 'columns' ? h('div', { className: 'rss-prism-image-controls' },
						h('p', null, h('strong', null, 'Number of columns')),
						h('select', { value: item.columns_count || 2, onChange: e => update('columns_count', Number(e.target.value)) }, ...[2, 3].map(v => h('option', { key: v, value: v }, String(v)))),
						...Array.from({ length: Number(item.columns_count || 2) }, (_, columnIndex) => {
							const columns = normalizedColumnElements(item);
							if (!columns[columnIndex]) columns[columnIndex] = [{ type: 'text', text: (item.column_contents || [])[columnIndex] || '', url: '' }];
							const children = columns[columnIndex];
							const updateChild = (childIndex, key, value) => { const next = normalizedColumnElements(item); next[columnIndex] = (next[columnIndex] || []).slice(); next[columnIndex][childIndex] = { ...(next[columnIndex][childIndex] || { id: 'child-' + Date.now(), type: 'text', text: '', url: '' }), [key]: value }; update('column_elements', next); };
							const addChild = () => { const next = clone(item.column_elements || []); while (next.length < Number(item.columns_count || 2)) next.push([]); next[columnIndex] = (next[columnIndex] || []).concat([{ id: 'child-' + Date.now() + '-' + Math.random().toString(36).slice(2,6), type: 'text', text: 'New column content', url: '' }]); update('column_elements', next); };
							const removeChild = childIndex => { const next = clone(item.column_elements || []); while (next.length < Number(item.columns_count || 2)) next.push([]); next[columnIndex] = (next[columnIndex] || []).filter((_, index) => index !== childIndex); update('column_elements', next); };
							return h('div', { className: 'rss-prism-nested-column-editor', key: columnIndex },
								h('h4', null, 'Column ' + (columnIndex + 1)),
								...children.map((child, childIndex) => h('div', { className: 'rss-prism-nested-child', key: child.id || childIndex },
									h('label', { className: 'rss-prism-field' }, h('span', null, 'Element type'), h('select', { value: child.type || 'text', onChange: e => updateChild(childIndex, 'type', e.target.value) }, ...[['heading','Heading'],['text','Text'],['button','Button']].map(([value,label]) => h('option', { key: value, value }, label)))),
									h('label', { className: 'rss-prism-field' }, h('span', null, 'Content'), h('textarea', { value: child.text || '', rows: 2, onChange: e => updateChild(childIndex, 'text', e.target.value) })),
									child.type === 'button' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Button URL'), h('input', { type: 'url', value: child.url || '', onChange: e => updateChild(childIndex, 'url', e.target.value) })) : null,
									h('button', { type: 'button', className: 'button-link-delete', onClick: () => removeChild(childIndex) }, 'Remove element')
								)),
								h('button', { type: 'button', className: 'button', onClick: addChild }, '+ Add element to column')
							);
						})
					) : null,
					item.type === 'image' ? h('div', { className: 'rss-prism-image-controls' }, h('button', { type: 'button', className: 'button button-primary', onClick: chooseImage }, item.image_url ? 'Replace image from Media Library' : 'Choose from Media Library'), field('Image URL', 'image_url', item.image_url, 'url'), field('Alternative text (accessibility)', 'alt', item.alt || ''), h('label', { className: 'rss-prism-field' }, h('span', null, 'Image width: ' + (item.image_width ?? 100) + '%'), h('input', { type: 'range', min: 10, max: 100, value: item.image_width ?? 100, onChange: e => update('image_width', Number(e.target.value)) })), item.image_url ? h('img', { src: item.image_url, alt: item.alt || '', className: 'rss-prism-inspector-image' }) : null) : null,
					item.type === 'section' ? field('Background color', 'background', item.background, 'color') : null,
					field('Text color', 'text_color', item.text_color || '#202124', 'color'),
					field('Font size (' + preview + '): ' + ((((item.responsive || {})[preview] || item).font_size) || item.font_size || 16) + 'px', 'font_size', (((item.responsive || {})[preview] || item).font_size || item.font_size || 16), 'range'),
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Text alignment'), h('select', { value: (((item.responsive || {})[preview] || item).align || item.align || 'left'), onChange: e => update('align', e.target.value) }, ...['left','center','right'].map(v => h('option', { key: v, value: v }, v[0].toUpperCase() + v.slice(1))))),
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Padding (' + preview + '): ' + ((((item.responsive || {})[preview] || item).padding ?? item.padding) || 0) + ' px'), h('input', { type: 'range', min: 0, max: 200, value: (((item.responsive || {})[preview] || item).padding ?? item.padding ?? 0), onChange: e => update('padding', Number(e.target.value)) })),
					h('div', { className: 'rss-prism-inspector-actions' }, h('button', { type: 'button', className: 'button', disabled: selected <= 0, onClick: () => move(selected, selected - 1) }, 'Move up'), h('button', { type: 'button', className: 'button', disabled: selected >= items.length - 1, onClick: () => move(selected, selected + 1) }, 'Move down'))
				) : h('p', null, 'Select an element on the canvas to edit its settings.')),
				h('section', { className: 'rss-prism-preview-frame rss-prism-preview-' + preview }, h('div', { className: 'rss-prism-preview-caption' }, preview.charAt(0).toUpperCase() + preview.slice(1) + ' canvas preview'), items.length ? items.map(previewElement) : h('p', { className: 'rss-prism-empty' }, 'Your page preview will appear here.'))
			)
		);
	}
	wp.element.render(h(App), root);
})();