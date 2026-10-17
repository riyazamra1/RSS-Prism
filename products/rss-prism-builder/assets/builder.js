(() => {
	'use strict';
	const root = document.getElementById('rss-prism-builder-app');
	const dataNode = document.getElementById('rss-prism-builder-data');
	if (!root || !dataNode || !window.wp || !wp.element) return;
	let config;
	try { config = JSON.parse(dataNode.textContent); } catch (e) { root.textContent = 'Could not load layout data.'; return; }
	const { createElement: h, useState, useEffect, useRef } = wp.element;
	const TYPES = {
		section: { label: 'Section', text: 'New section' },
		heading: { label: 'Heading', text: 'Your heading' },
		text: { label: 'Text', text: 'Write something useful for your visitors.' },
		button: { label: 'Button', text: 'Learn more' },
		image: { label: 'Image', text: 'Image' },
		columns: { label: 'Columns', text: 'Columns' },
		container: { label: 'Container', text: 'Content container' }
	};
	const fresh = type => {
		const fontSize = type === 'heading' ? 32 : 16;
		const responsive = {};
		['desktop', 'tablet', 'mobile'].forEach(device => { responsive[device] = { font_size: fontSize, padding: 24, align: 'left' }; });
		return { border_radius: 0, id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), type, text: TYPES[type].text, url: '', image_url: '', alt: '', button_bg: '#b88a2b', button_text: '#ffffff', button_radius: 6, image_width: 100, columns_count: 2, column_contents: ['First column content', 'Second column content', 'Third column content'], column_elements: [[{ id: 'child-' + Date.now() + '-a', type: 'text', text: 'First column content', url: '' }], [{ id: 'child-' + Date.now() + '-b', type: 'text', text: 'Second column content', url: '' }], [{ id: 'child-' + Date.now() + '-c', type: 'text', text: 'Third column content', url: '' }]], container_background: '#f7f6f2', container_elements: [{ id: 'nested-' + Date.now() + '-h', type: 'heading', text: 'Container heading', url: '' }, { id: 'nested-' + Date.now() + '-p', type: 'text', text: 'Add content inside this container.', url: '' }], background: type === 'section' ? '#f7f6f2' : '', text_color: '#202124', font_size: fontSize, align: 'left', padding: 24, responsive };
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
		const [inlineEditing, setInlineEditing] = useState(false);
		const [notice, setNotice] = useState('');
		const [busy, setBusy] = useState(false);
		const [copyTitle, setCopyTitle] = useState('');
		const [pageTitle, setPageTitle] = useState('');
		const [preview, setPreview] = useState('desktop');
		const [history, setHistory] = useState([]);
		const [future, setFuture] = useState([]);
		const [autosaveStatus, setAutosaveStatus] = useState('Waiting for changes');
		const [restoreVersions, setRestoreVersions] = useState(() => { try { return JSON.parse(localStorage.getItem('rss-prism-history-' + config.postId) || '[]').slice(0, 20); } catch (error) { return []; } });
		const previousItems = useRef(clone(Array.isArray(config.layout) ? config.layout : []));
		const firstAutosave = useRef(true);
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
			const library = {
				business: [['section','Razeen Secure Solution'],['heading','Developing Ideas. Delivering Solutions.'],['text','Software development, CCTV solutions, networking, cloud services, and practical AI solutions.'],['columns',''],['heading','A practical technology partner'],['text','Reliable implementation, clear communication, and security-conscious solutions for every project.'],['button','Explore RSS']],
				services: [['section','Our Services'],['heading','Technology that works for your business'],['columns',''],['text','CCTV installation, networking, software development, system administration, troubleshooting, and technical support.'],['button','Discuss a project']],
				contact: [['section','Contact Razeen Secure Solution'],['heading','Let’s discuss your project'],['text','Email: rsscctvsolution@gmail.com\\nPhone: 077 115 5504 | 070 155 5504\\nWebsite: www.rsscctvsolution.eu.cc'],['button','Email RSS']],
				about: [['section','About Razeen Secure Solution'],['heading','Developing Ideas. Delivering Solutions.'],['text','Razeen Secure Solution (RSS) has delivered technology services since 2015, helping people and businesses turn ideas into practical digital and security solutions.'],['columns',''],['heading','Our approach'],['text','Clear communication, thoughtful implementation, and dependable support.'],['button','Get in touch']],
				projects: [['section','RSS Projects & Solutions'],['heading','A connected ecosystem of useful tools'],['text','Explore RSS software and service projects across productivity, money management, cloud tools, AI-assisted workflows, and security systems.'],['columns',''],['heading','Software & AI'],['text','Purpose-built software, automation, and practical AI solutions.'],['heading','Security & infrastructure'],['text','CCTV, networking, system administration, and troubleshooting.'],['button','View RSS website']],
				security: [['section','Security-first solutions'],['heading','Protect systems. Improve visibility.'],['text','Security-conscious CCTV installation, network setup, system administration, and software practices designed around reliability and responsible access.'],['columns',''],['heading','Assess'],['text','Understand the site, systems, and requirements.'],['heading','Implement'],['text','Configure solutions with clear access boundaries.'],['heading','Support'],['text','Troubleshoot and maintain the result.'],['button','Contact RSS']]
			};
			const specs = library[kind] || library.business;
			const additions = specs.map(([type, text]) => {
				const entry = fresh(type);
				if (text) entry.text = text;
				if (type === 'columns') {
					const titles = kind === 'about' ? ['Experience since 2015','Practical solutions','Dependable support'] : kind === 'security' ? ['Assess','Implement','Support'] : kind === 'projects' ? ['Software & AI','Productivity tools','Security & infrastructure'] : ['Software & AI solutions','CCTV & networking','Cloud & system support'];
					entry.column_contents = titles;
					entry.column_elements = titles.map((title, i) => [{ id: 'child-' + Date.now() + '-' + i, type: 'heading', text: title, url: '' }, { id: 'child-' + Date.now() + '-t' + i, type: 'text', text: ['Plan the right approach for your needs.','Build a reliable, maintainable solution.','Keep systems useful with ongoing support.'][i], url: '' }]);
				}
				if (type === 'button') entry.url = kind === 'contact' ? 'mailto:rsscctvsolution@gmail.com' : 'https://www.rsscctvsolution.eu.cc/';
				return entry;
			});
			const next = [...items, ...additions];
			commitItems(next); setSelected(items.length); setNotice('“' + ({business:'Business landing',services:'Services',contact:'Contact page',about:'About RSS',projects:'RSS projects',security:'Security solutions'}[kind] || 'Starter layout') + '” sections added. Review the content and save the layout.');
		};
		const move = (from, to) => { if (to < 0 || to >= items.length || from === to) return; const next = items.slice(); const [entry] = next.splice(from, 1); next.splice(to, 0, entry); commitItems(next); setSelected(to); };
		const remove = index => { commitItems(items.filter((_, i) => i !== index)); setSelected(Math.max(0, Math.min(selected, items.length - 2))); };
		const undo = () => { if (!history.length) return; setFuture(old => [clone(items), ...old]); setItems(history[history.length - 1]); setHistory(old => old.slice(0, -1)); };
		const redo = () => { if (!future.length) return; setHistory(old => [...old, clone(items)]); setItems(future[0]); setFuture(old => old.slice(1)); };
		const duplicate = index => { const next = items.slice(); const copy = clone(next[index]); copy.id = 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); next.splice(index + 1, 0, copy); commitItems(next); setSelected(index + 1); };
		const chooseImage = () => {
			if (!window.wp || !wp.media) { setNotice('The WordPress media library is not available on this screen.'); return; }
			const frame = wp.media({ title: 'Choose an image', button: { text: 'Use image' }, library: { type: 'image' }, multiple: false });
			frame.on('select', () => { const attachment = frame.state().get('selection').first().toJSON(); const fields = { image_url: attachment.url || '' }; if (!item.alt && attachment.alt) fields.alt = attachment.alt; commitItems(items.map((entry, index) => index !== selected ? entry : { ...entry, ...fields })); });
			frame.open();
		};
		const exportLayout = () => {
			try {
				const payload = { format: 'rss-prism-layout', version: 1, exported_at: new Date().toISOString(), source_template_id: config.postId, layout: items };
				const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url; link.download = 'rss-prism-layout-' + config.postId + '.json';
				document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
				setNotice('Layout JSON exported. Keep this file as a backup before experimenting.');
			} catch (error) { setNotice('Could not export the layout in this browser.'); }
		};
		const normalizeImported = (entries, depth = 0) => {
			if (!Array.isArray(entries) || entries.length > (depth === 0 ? 100 : 20)) throw new Error('The layout contains too many elements.');
			const allowed = depth === 0 ? ['section','heading','text','button','image','columns','container'] : ['heading','text','button','image'].concat(depth < 2 ? ['container'] : []);
			return entries.map((entry, index) => {
				if (!entry || typeof entry !== 'object' || !allowed.includes(entry.type)) throw new Error('Unsupported element found in the JSON file.');
				const clean = { ...entry, id: 'import-' + Date.now() + '-' + depth + '-' + index + '-' + Math.random().toString(36).slice(2,6) };
				if (entry.type === 'container') clean.container_elements = normalizeImported(entry.container_elements || [], depth + 1);
				if (entry.type === 'columns') {
					clean.columns_count = Math.min(3, Math.max(2, Number(entry.columns_count || 2)));
					clean.column_elements = Array.from({ length: clean.columns_count }, (_, column) => {
						const children = entry.column_elements && entry.column_elements[column];
						if (!Array.isArray(children)) return [];
						if (children.length > 12 || children.some(child => !child || !['heading','text','button'].includes(child.type))) throw new Error('Invalid column content in the JSON file.');
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
			if (file.size > 1024 * 1024) { setNotice('Import rejected: layout JSON must be smaller than 1 MB.'); return; }
			const reader = new FileReader();
			reader.onload = () => {
				try {
					const parsed = JSON.parse(String(reader.result || ''));
					const entries = Array.isArray(parsed) ? parsed : parsed && parsed.format === 'rss-prism-layout' && parsed.version === 1 ? parsed.layout : null;
					if (!Array.isArray(entries)) throw new Error('This is not a supported RSS Prism layout JSON file.');
					const next = normalizeImported(entries);
					if (!window.confirm('Replace the current unsaved layout with ' + next.length + ' imported elements? Export a backup first if needed.')) return;
					commitItems(next); setSelected(0); setNotice('Imported ' + next.length + ' top-level elements. Review the layout and save it to WordPress.');
				} catch (error) { setNotice(error.message || 'Could not read this layout JSON file.'); }
			};
			reader.onerror = () => setNotice('Could not read the selected file.');
			reader.readAsText(file);
		};
		const save = async () => {
			setBusy(true); setNotice('');
			try {
				const response = await fetch(config.restUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, layout: items }) });
				const result = await response.json();
				if (!response.ok || !result.saved) throw new Error(result.message || 'Save failed.');
				setNotice('Layout saved to WordPress. You can now create a real WordPress page from this design.');
			} catch (error) { setNotice(error.message || 'Could not save the layout.'); }
			finally { setBusy(false); }
		};
		useEffect(() => {
			if (firstAutosave.current) { firstAutosave.current = false; return undefined; }
			const snapshot = clone(previousItems.current);
			const current = clone(items);
			previousItems.current = current;
			try {
				const key = 'rss-prism-history-' + config.postId;
				let stored = [];
				try { stored = JSON.parse(localStorage.getItem(key) || '[]'); } catch (error) { stored = []; }
				const versions = [{ id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2,6), saved_at: new Date().toISOString(), layout: snapshot }, ...(Array.isArray(stored) ? stored : [])].slice(0, 20);
				localStorage.setItem(key, JSON.stringify(versions));
				setRestoreVersions(versions);
			} catch (error) { setNotice('Browser history could not be stored. Autosave will still be attempted.'); }
			const timer = window.setTimeout(async () => {
				setAutosaveStatus('Saving…');
				try {
					const response = await fetch(config.restUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, layout: current }) });
					const result = await response.json();
					if (!response.ok || !result.saved) throw new Error(result.message || 'Autosave failed.');
					setAutosaveStatus('Autosaved at ' + new Date().toLocaleTimeString());
				} catch (error) { setAutosaveStatus('Autosave failed — use Save layout to retry.'); }
			}, 1200);
			return () => window.clearTimeout(timer);
		}, [items]);
		const restoreVersion = version => {
			if (!version || !Array.isArray(version.layout)) return;
			if (!window.confirm('Restore this saved browser-history version? Current changes will be added to undo history.')) return;
			commitItems(clone(version.layout));
			setSelected(0);
			setNotice('Version restored in the editor. Autosave will store it to WordPress shortly.');
		};
		const createWordPressPage = async () => {
			const title = pageTitle.trim();
			if (!title) { setNotice('Enter a title for the WordPress page first.'); return; }
			setBusy(true); setNotice('Saving the layout and creating your WordPress draft page…');
			try {
				const response = await fetch(config.publishUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, page_title: title, layout: items }) });
				const result = await response.json();
				if (!response.ok || !result.created || !result.edit_url) throw new Error(result.message || 'Could not create the WordPress page.');
				setNotice('WordPress draft page created successfully. Opening its WordPress editor…');
				window.location.href = result.edit_url;
			} catch (error) { setNotice(error.message || 'Could not create the WordPress page.'); setBusy(false); }
		};
		const copyTemplate = async () => {
			const title = copyTitle.trim();
			if (!title) { setNotice('Enter a name for the reusable template first.'); return; }
			setBusy(true); setNotice('');
			try {
				const response = await fetch(config.copyUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce }, body: JSON.stringify({ post_id: config.postId, title, layout: items }) });
				const result = await response.json();
				if (!response.ok || !result.created || !result.edit_url) throw new Error(result.message || 'Could not create the reusable template.');
				setNotice('Reusable draft created. Opening the copied template…'); window.location.href = result.edit_url;
			} catch (error) { setNotice(error.message || 'Could not create the reusable template.'); setBusy(false); }
		};
		const field = (label, key, value, type = 'text') => h('label', { className: 'rss-prism-field' }, h('span', null, label), h(type === 'textarea' ? 'textarea' : 'input', { type: type === 'textarea' ? undefined : type, value: value ?? '', onChange: e => update(key, type === 'range' ? Number(e.target.value) : e.target.value), rows: type === 'textarea' ? 4 : undefined, min: type === 'range' ? 10 : undefined, max: type === 'range' ? 96 : undefined }));
		const mutateNested = (parentPath, callback) => {
			const rootChildren = clone(item.container_elements || []);
			let target = rootChildren;
			parentPath.forEach(index => { target = target[index] && Array.isArray(target[index].container_elements) ? target[index].container_elements : []; });
			callback(target);
			update('container_elements', rootChildren);
		};
		const chooseNestedImage = (parentPath, childIndex) => {
			if (!window.wp || !wp.media) { setNotice('The WordPress Media Library is not available on this screen.'); return; }
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
			...(children || []).map((child, index) => h('div', { className: 'rss-prism-nested-child', key: child.id || index, draggable: true,
				onDragStart: e => { e.dataTransfer.setData('text/plain', JSON.stringify({ path: parentPath, index })); e.dataTransfer.effectAllowed = 'move'; },
				onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
				onDrop: e => { e.preventDefault(); let source; try { source = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (error) { return; }
					if (!source || JSON.stringify(source.path) !== JSON.stringify(parentPath) || source.index === index) return;
					mutateNested(parentPath, list => { if (!Number.isInteger(source.index) || source.index < 0 || source.index >= list.length) return; const moved = list.splice(source.index, 1)[0]; list.splice(index, 0, moved); });
				}
			},
				h('div', { className: 'rss-prism-nested-child-toolbar' }, h('strong', null, (child.type === 'container' ? 'Nested container ' : 'Nested element ') + (index + 1)),
					h('button', { type: 'button', className: 'button-link', disabled: index === 0, onClick: () => mutateNested(parentPath, list => { const moved = list.splice(index, 1)[0]; list.splice(index - 1, 0, moved); }) }, 'Move up'),
					h('button', { type: 'button', className: 'button-link', disabled: index === children.length - 1, onClick: () => mutateNested(parentPath, list => { const moved = list.splice(index, 1)[0]; list.splice(index + 1, 0, moved); }) }, 'Move down')),
				h('label', { className: 'rss-prism-field' }, h('span', null, 'Type'), h('select', { value: child.type || 'text', onChange: e => mutateNested(parentPath, list => { list[index].type = e.target.value; if (e.target.value === 'container') { list[index].container_background = list[index].container_background || '#f7f6f2'; list[index].container_elements = Array.isArray(list[index].container_elements) ? list[index].container_elements : [{ id: 'nested-' + Date.now(), type: 'text', text: 'Nested content', url: '' }]; } }) },
					...([['heading','Heading'],['text','Text'],['button','Button'],['image','Image']].concat(depth < 2 ? [['container','Nested container']] : [])).map(([value,label]) => h('option', { key: value, value }, label)))),
				child.type === 'container' ? h('div', { className: 'rss-prism-image-controls' },
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Container background'), h('input', { type: 'color', value: child.container_background || '#f7f6f2', onChange: e => mutateNested(parentPath, list => { list[index].container_background = e.target.value; }) })),
					nestedEditor(child.container_elements || [], [...parentPath, index], depth + 1)
				) : null,
				child.type !== 'container' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Content'), h('textarea', { rows: 2, value: child.text || '', onChange: e => mutateNested(parentPath, list => { list[index].text = e.target.value; }) })) : null,
				child.type === 'button' ? h('label', { className: 'rss-prism-field' }, h('span', null, 'Button URL'), h('input', { type: 'url', value: child.url || '', onChange: e => mutateNested(parentPath, list => { list[index].url = e.target.value; }) })) : null,
				child.type === 'image' ? h('div', { className: 'rss-prism-image-controls' }, h('button', { type: 'button', className: 'button', onClick: () => chooseNestedImage(parentPath, index) }, child.image_url ? 'Choose replacement image' : 'Choose from Media Library'), h('label', { className: 'rss-prism-field' }, h('span', null, 'Image URL'), h('input', { type: 'url', value: child.image_url || '', onChange: e => mutateNested(parentPath, list => { list[index].image_url = e.target.value; }) })), h('label', { className: 'rss-prism-field' }, h('span', null, 'Alternative text'), h('input', { type: 'text', value: child.alt || '', placeholder: 'Describe the image', onChange: e => mutateNested(parentPath, list => { list[index].alt = e.target.value; }) }))) : null,
				child.type === 'container' ? h('p', { className: 'description' }, depth >= 1 ? 'Maximum nested depth reached for child containers.' : 'This container can include another container.') : null,
				h('button', { type: 'button', className: 'button-link-delete', onClick: () => mutateNested(parentPath, list => list.splice(index, 1)) }, 'Remove element')
			)),
			h('div', { className: 'rss-prism-nested-add-actions', role: 'group', 'aria-label': 'Add nested content' }, ...([['heading','+ Heading'],['text','+ Text'],['button','+ Button'],['image','+ Image']].concat(depth < 2 ? [['container','+ Container']] : []).map(([type, label]) => h('button', { key: type, type: 'button', className: 'button button-small', disabled: (children || []).length >= 20, onClick: () => mutateNested(parentPath, list => list.push({ id: 'nested-' + Date.now() + '-' + Math.random().toString(36).slice(2,6), type, text: type === 'heading' ? 'New heading' : type === 'button' ? 'Learn more' : type === 'image' ? 'Image description' : type === 'container' ? '' : 'New nested content', url: '', image_url: '', alt: '', container_background: '#f7f6f2', container_elements: type === 'container' ? [{ id: 'nested-child-' + Date.now(), type: 'text', text: 'Nested content', url: '' }] : undefined })) }, label))))
		);
		const previewElement = (entry, i) => {
			const deviceStyle = (entry.responsive && entry.responsive[preview]) || entry;
			const style = { padding: (Number(deviceStyle.padding ?? entry.padding) || 0) + 'px', background: entry.background || 'transparent', color: entry.text_color || '#202124', fontSize: (Number(deviceStyle.font_size ?? entry.font_size) || 16) + 'px', textAlign: deviceStyle.align || entry.align || 'left', borderRadius: (Number(entry.border_radius) || 0) + 'px', boxSizing: 'border-box', overflowWrap: 'anywhere' };
			const editable = i === selected && inlineEditing && ['heading', 'text', 'button', 'section'].includes(entry.type);
			const inlineTextProps = {
				contentEditable: editable,
				suppressContentEditableWarning: true,
				spellCheck: editable,
				'aria-label': 'Edit text inline; changes are saved when you finish editing',
				onBlur: e => { if (editable) { const value = e.currentTarget.innerText.replace(/\\r/g, ''); if (value !== (entry.text || '')) update('text', value); setInlineEditing(false); } },
				onKeyDown: e => { if (e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur(); } if (e.key === 'Enter' && entry.type !== 'text') { e.preventDefault(); e.currentTarget.blur(); } }
			};
			const common = { key: entry.id || i, className: 'rss-prism-live-element ' + (i === selected ? 'is-selected' : '') + (editable ? ' is-inline-editing' : ''), style, onClick: () => { setSelected(i); if (i !== selected) setInlineEditing(false); }, onDoubleClick: () => { if (['heading', 'text', 'button', 'section'].includes(entry.type)) { setSelected(i); setInlineEditing(true); } }, title: ['heading', 'text', 'button', 'section'].includes(entry.type) ? 'Double-click to edit text inline' : 'Click to select and edit settings' };
			if (entry.type === 'heading') return h('h2', { ...common, ...inlineTextProps }, entry.text || 'Heading');
			if (entry.type === 'text') return h('p', { ...common, ...inlineTextProps }, entry.text || 'Text');
			if (entry.type === 'button') return h('div', common, h('span', { className: 'rss-prism-live-button', style: { background: entry.button_bg || '#b88a2b', color: entry.button_text || '#ffffff', borderRadius: (Number(entry.button_radius ?? 6)) + 'px' }, ...inlineTextProps }, entry.text || 'Button'));
			const previewNested = (child, childIndex, depth = 0) => {
				const key = child.id || childIndex;
				if (child.type === 'container' && depth < 2) return h('div', { key, className: 'rss-prism-live-container rss-prism-live-container--nested', style: { background: child.container_background || '#f7f6f2', border: '1px solid #e2e4e7', borderRadius: '8px', padding: '12px', margin: '12px 0' } }, ...(Array.isArray(child.container_elements) ? child.container_elements : []).map((nested, nestedIndex) => previewNested(nested, nestedIndex, depth + 1)));
				if (child.type === 'heading') return h('h3', { key }, child.text || 'Heading');
				if (child.type === 'button') return h('p', { key }, h('span', { className: 'rss-prism-live-button' }, child.text || 'Button'));
				if (child.type === 'image' && child.image_url) return h('p', { key }, h('img', { src: child.image_url, alt: child.alt || '', className: 'rss-prism-live-image' }));
				return h('p', { key }, child.text || 'Text');
			};
			if (entry.type === 'container') return h('div', { ...common, className: common.className + ' rss-prism-live-container', style: { ...style, background: entry.container_background || '#f7f6f2', border: '1px solid #e2e4e7', borderRadius: '10px' } }, ...(Array.isArray(entry.container_elements) ? entry.container_elements : []).map((child, childIndex) => previewNested(child, childIndex, 0)));
			if (entry.type === 'columns') return h('div', { ...common, className: common.className + ' rss-prism-live-columns', style: { ...style, display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(3, Math.max(2, Number(entry.columns_count || 2))) + ', minmax(0, 1fr))', gap: '12px' } }, ...Array.from({ length: Number(entry.columns_count || 2) }, (_, index) => { const children = normalizedColumnElements(entry)[index]; return h('div', { key: index, className: 'rss-prism-live-column-cell' }, ...children.map((child, childIndex) => child.type === 'heading' ? h('h3', { key: child.id || childIndex }, child.text || 'Heading') : child.type === 'button' ? h('p', { key: child.id || childIndex }, h('span', { className: 'rss-prism-live-button' }, child.text || 'Button')) : h('p', { key: child.id || childIndex }, child.text || 'Text'))); }));
			if (entry.type === 'image') return h('div', common, entry.image_url ? h('img', { src: entry.image_url, alt: entry.alt || '', className: 'rss-prism-live-image', style: { width: Math.min(100, Math.max(10, Number(entry.image_width ?? 100))) + '%' } }) : h('span', { className: 'rss-prism-image-placeholder' }, 'Choose an image in Element settings'));
			return h('section', { ...common, ...inlineTextProps }, entry.text || 'Section');
		};
		const canvasItem = (entry, i) => h('div', { key: entry.id || i, className: 'rss-prism-canvas-item' + (i === selected ? ' is-selected' : ''), draggable: true, onDragStart: e => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; }, onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, onDrop: e => { e.preventDefault(); move(Number(e.dataTransfer.getData('text/plain')), i); }, onClick: () => setSelected(i) },
			h('span', { className: 'rss-prism-drag-handle', title: 'Drag to reorder', 'aria-label': 'Drag to reorder' }, '⠿'),
			h('span', { className: 'rss-prism-canvas-kind' }, TYPES[entry.type] ? TYPES[entry.type].label : entry.type),
			h('span', { className: 'rss-prism-canvas-text' }, entry.text || '(empty)'),
			h('button', { type: 'button', className: 'button', onClick: e => { e.stopPropagation(); duplicate(i); } }, 'Duplicate'),
			h('button', { type: 'button', className: 'button-link-delete', onClick: e => { e.stopPropagation(); remove(i); } }, 'Remove'));
		return h('div', { className: 'rss-prism-builder-layout' },
			h('div', { className: 'rss-prism-builder-toolbar' },
				h('div', { className: 'rss-prism-builder-add' }, h('strong', null, 'Add element'), ...Object.keys(TYPES).map(type => h('button', { key: type, type: 'button', className: 'button rss-prism-palette-item', draggable: true, title: 'Drag onto the page canvas or click to add', onDragStart: e => { e.dataTransfer.setData('text/plain', 'rss-prism-add:' + type); e.dataTransfer.effectAllowed = 'copy'; }, onClick: () => add(type) }, h('span', { className: 'rss-prism-palette-icon', 'aria-hidden': 'true' }, ({section:'▱',heading:'T',text:'¶',button:'▰',image:'▧',columns:'▥',container:'□'})[type] || '+'), h('span', null, TYPES[type].label)))),
				h('div', { className: 'rss-prism-builder-add rss-prism-starters' }, h('strong', null, 'Insert RSS starter layout'), ...[['business','Business landing'],['services','Services'],['about','About RSS'],['projects','RSS projects'],['security','Security solutions'],['contact','Contact page']].map(([kind,label]) => h('button', { key: kind, type: 'button', className: 'button', onClick: () => insertStarter(kind) }, label))),
				h('div', { className: 'rss-prism-autosave-status', role: 'status', 'aria-live': 'polite' }, h('span', { className: autosaveStatus.startsWith('Autosaved') ? 'is-saved' : autosaveStatus.startsWith('Autosave failed') ? 'is-error' : '' }, 'Autosave: ' + autosaveStatus)),
				restoreVersions.length ? h('details', { className: 'rss-prism-restore-history' }, h('summary', null, 'Restore history (' + restoreVersions.length + ')'), h('p', { className: 'description' }, 'Browser-local recovery list for this template. Up to 20 prior layouts are kept in this browser; export JSON for an independent backup.'), h('ol', null, ...restoreVersions.map(version => h('li', { key: version.id }, h('span', null, new Date(version.saved_at).toLocaleString()), h('button', { type: 'button', className: 'button button-small', onClick: () => restoreVersion(version) }, 'Restore'))))) : h('p', { className: 'description rss-prism-no-history' }, 'No browser restore versions yet. Make a change to start the recovery list.'),
				h('div', { className: 'rss-prism-builder-actions' }, h('button', { type: 'button', className: 'button', disabled: !history.length, onClick: undo }, 'Undo'), h('button', { type: 'button', className: 'button', disabled: !future.length, onClick: redo }, 'Redo'), h('button', { type: 'button', className: 'button', onClick: exportLayout }, 'Export JSON backup'), h('button', { type: 'button', className: 'button', onClick: () => { const input = root.querySelector('#rss-prism-layout-import'); if (input) input.click(); } }, 'Import JSON'), h('button', { type: 'button', className: 'button button-primary', disabled: busy, onClick: save }, busy ? 'Saving…' : 'Save layout'), h('input', { id: 'rss-prism-layout-import', type: 'file', accept: 'application/json,.json', onChange: importLayout, hidden: true, 'aria-label': 'Import RSS Prism layout JSON' })),
				h('div', { className: 'rss-prism-template-copy' }, h('label', { htmlFor: 'rss-prism-page-title' }, 'WordPress page title'), h('input', { id: 'rss-prism-page-title', type: 'text', value: pageTitle, placeholder: 'e.g. Services', onChange: e => setPageTitle(e.target.value), maxLength: 120 }), h('button', { type: 'button', className: 'button button-primary', disabled: busy, onClick: createWordPressPage }, busy ? 'Creating page…' : 'Create WordPress draft page'), h('label', { htmlFor: 'rss-prism-copy-title' }, 'Reusable template name'), h('input', { id: 'rss-prism-copy-title', type: 'text', value: copyTitle, placeholder: 'e.g. RSS Services Landing', onChange: e => setCopyTitle(e.target.value), maxLength: 120 }), h('button', { type: 'button', className: 'button', disabled: busy, onClick: copyTemplate }, 'Save as new draft template'))),
			notice ? h('div', { className: 'notice notice-info rss-prism-builder-notice', role: 'status' }, h('p', null, notice)) : null,
			h('div', { className: 'rss-prism-preview-toolbar' }, h('strong', null, 'Responsive preview'), ...[['desktop','Desktop'],['tablet','Tablet'],['mobile','Mobile']].map(pair => h('button', { key: pair[0], type: 'button', className: 'button ' + (preview === pair[0] ? 'button-primary' : ''), onClick: () => setPreview(pair[0]), 'aria-pressed': preview === pair[0] }, pair[1]))),
			h('div', { className: 'rss-prism-builder-workspace' },
				h('section', { className: 'rss-prism-builder-canvas' }, h('div', { className: 'rss-prism-canvas-heading' }, h('span', null, 'LAYERS'), h('span', null, items.length + ' elements')), items.length ? items.map(canvasItem) : h('p', { className: 'rss-prism-empty' }, 'Start by adding a section, heading, text, or button.')),
				h('aside', { className: 'rss-prism-builder-inspector' }, h('h2', null, 'Element settings'), item ? h('div', null,
					h('p', { className: 'rss-prism-inspector-type' }, TYPES[item.type] ? TYPES[item.type].label : item.type),
					field('Content', 'text', item.text, 'textarea'),
					item.type === 'button' ? h('div', { className: 'rss-prism-image-controls' }, field('Button URL', 'url', item.url, 'url'), field('Button background', 'button_bg', item.button_bg || '#b88a2b', 'color'), field('Button text color', 'button_text', item.button_text || '#ffffff', 'color'), h('label', { className: 'rss-prism-field' }, h('span', null, 'Corner radius: ' + (item.button_radius ?? 6) + ' px'), h('input', { type: 'range', min: 0, max: 40, value: item.button_radius ?? 6, onChange: e => update('button_radius', Number(e.target.value)) }))) : null,
					item.type === 'container' ? h('div', { className: 'rss-prism-image-controls' },
						field('Container background', 'container_background', item.container_background || '#f7f6f2', 'color'),
						h('p', { className: 'description' }, 'Containers can hold up to 20 elements per level, with nesting limited to two levels inside the main container.'),
						nestedEditor(item.container_elements || [], [], 0)
					) : null,
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
								...children.map((child, childIndex) => h('div', { className: 'rss-prism-nested-child', key: child.id || childIndex, draggable: true, onDragStart: e => { e.dataTransfer.setData('text/plain', JSON.stringify({ columnIndex, childIndex })); e.dataTransfer.effectAllowed = 'move'; }, onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, onDrop: e => { e.preventDefault(); let source; try { source = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (error) { return; } if (!source || source.columnIndex !== columnIndex || source.childIndex === childIndex) return; const next = normalizedColumnElements(item); const moved = next[columnIndex].splice(source.childIndex, 1)[0]; next[columnIndex].splice(childIndex, 0, moved); update('column_elements', next); } },
									h('div', { className: 'rss-prism-nested-child-toolbar' }, h('span', { className: 'rss-prism-child-drag-handle', title: 'Drag to reorder this element', 'aria-label': 'Drag to reorder this element' }, '⠿ Drag to reorder'), h('button', { type: 'button', className: 'button-link', disabled: childIndex === 0, onClick: () => { const next = normalizedColumnElements(item); const moved = next[columnIndex].splice(childIndex, 1)[0]; next[columnIndex].splice(childIndex - 1, 0, moved); update('column_elements', next); } }, 'Move up'), h('button', { type: 'button', className: 'button-link', disabled: childIndex === children.length - 1, onClick: () => { const next = normalizedColumnElements(item); const moved = next[columnIndex].splice(childIndex, 1)[0]; next[columnIndex].splice(childIndex + 1, 0, moved); update('column_elements', next); } }, 'Move down')),
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
					field('Background color', 'background', item.background || '#ffffff', 'color'),
					field('Text color', 'text_color', item.text_color || '#202124', 'color'),
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Corner radius: ' + (Number(item.border_radius) || 0) + ' px'), h('input', { type: 'range', min: 0, max: 48, value: Number(item.border_radius) || 0, onChange: e => update('border_radius', Number(e.target.value) })),
					field('Font size (' + preview + '): ' + ((((item.responsive || {})[preview] || item).font_size) || item.font_size || 16) + 'px', 'font_size', (((item.responsive || {})[preview] || item).font_size || item.font_size || 16), 'range'),
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Text alignment'), h('select', { value: (((item.responsive || {})[preview] || item).align || item.align || 'left'), onChange: e => update('align', e.target.value) }, ...['left','center','right'].map(v => h('option', { key: v, value: v }, v[0].toUpperCase() + v.slice(1))))),
					h('label', { className: 'rss-prism-field' }, h('span', null, 'Padding (' + preview + '): ' + ((((item.responsive || {})[preview] || item).padding ?? item.padding) || 0) + ' px'), h('input', { type: 'range', min: 0, max: 200, value: (((item.responsive || {})[preview] || item).padding ?? item.padding ?? 0), onChange: e => update('padding', Number(e.target.value)) })),
					h('div', { className: 'rss-prism-inspector-actions' }, h('button', { type: 'button', className: 'button', disabled: selected <= 0, onClick: () => move(selected, selected - 1) }, 'Move up'), h('button', { type: 'button', className: 'button', disabled: selected >= items.length - 1, onClick: () => move(selected, selected + 1) }, 'Move down'))
				) : h('p', null, 'Select an element on the canvas to edit its settings.')),
				h('section', { className: 'rss-prism-preview-frame rss-prism-preview-' + preview, onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = String(e.dataTransfer.getData('text/plain') || '').startsWith('rss-prism-add:') ? 'copy' : 'move'; }, onDrop: e => { e.preventDefault(); const payload = e.dataTransfer.getData('text/plain') || ''; if (payload.startsWith('rss-prism-add:')) { const type = payload.slice('rss-prism-add:'.length); if (TYPES[type]) add(type); return; } const from = Number(payload); if (Number.isInteger(from) && String(from) === payload) move(from, items.length - 1); } }, h('div', { className: 'rss-prism-preview-caption' }, h('span', null, 'LIVE CANVAS'), h('span', null, preview.charAt(0).toUpperCase() + preview.slice(1) + ' preview · click to select · double-click text to edit inline · drop elements here')), items.length ? items.map(previewElement) : h('p', { className: 'rss-prism-empty' }, 'Drag an element here or click an element above to start building.'))
			)
		);
	}
	wp.element.render(h(App), root);
})();