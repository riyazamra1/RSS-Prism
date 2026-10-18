(function () {
	'use strict';
	var form = document.getElementById('rp-studio-form');
	if (!form) return;
	var dragged = null;
	function createChip(element, type) {
		var chip = document.createElement('button');
		chip.type = 'button';
		chip.className = 'rp-studio-chip';
		chip.draggable = true;
		chip.dataset.element = element;
		chip.textContent = (window.rssPrismStudio.labels[element] || element) + ' ';
		if (element === 'credit' && type === 'footer') {
			var lock = document.createElement('span'); lock.className = 'rp-studio-lock'; lock.textContent = '●'; lock.title = 'Required for free users'; chip.appendChild(lock);
		} else {
			var remove = document.createElement('span'); remove.className = 'rp-studio-remove'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Remove element'); chip.appendChild(remove);
		}
		return chip;
	}
	function hasElement(type, element) {
		var placed = document.querySelectorAll('[data-builder-rows="' + type + '"] .rp-studio-dropzone .rp-studio-chip');
		return Array.prototype.some.call(placed, function (chip) { return chip.dataset.element === element; });
	}
	function updateEmpty(zone) {
		var empty = zone.querySelector('.rp-studio-empty');
		if (empty) empty.hidden = !!zone.querySelector('.rp-studio-chip');
	}
	document.querySelectorAll('.rp-studio-chip').forEach(function (chip) {
		chip.addEventListener('dragstart', function (event) { dragged = chip; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', chip.dataset.element); chip.classList.add('is-dragging'); });
		chip.addEventListener('dragend', function () { if (dragged) dragged.classList.remove('is-dragging'); dragged = null; document.querySelectorAll('.rp-studio-dropzone').forEach(updateEmpty); });
		chip.addEventListener('click', function (event) {
			if (event.target.classList.contains('rp-studio-remove')) { chip.remove(); document.querySelectorAll('.rp-studio-dropzone').forEach(updateEmpty); return; }
			if (chip.dataset.source === 'palette') {
				var editor = chip.closest('[data-studio-editor]');
				var type = editor ? editor.dataset.studioEditor : 'header';
				if (hasElement(type, chip.dataset.element)) return;
				var firstZone = document.querySelector('[data-builder-rows="' + type + '"] .rp-studio-dropzone');
				if (firstZone) { firstZone.appendChild(createChip(chip.dataset.element, type)); bindNewChips(firstZone); updateEmpty(firstZone); }
			}
		});
	});
	function bindNewChips(root) {
		root.querySelectorAll('.rp-studio-chip:not([data-bound])').forEach(function (chip) {
			chip.dataset.bound = '1';
			chip.addEventListener('dragstart', function (event) { dragged = chip; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', chip.dataset.element); chip.classList.add('is-dragging'); });
			chip.addEventListener('dragend', function () { if (dragged) dragged.classList.remove('is-dragging'); dragged = null; document.querySelectorAll('.rp-studio-dropzone').forEach(updateEmpty); });
			chip.addEventListener('click', function (event) { if (event.target.classList.contains('rp-studio-remove')) { chip.remove(); document.querySelectorAll('.rp-studio-dropzone').forEach(updateEmpty); } });
		});
	}
	document.querySelectorAll('.rp-studio-dropzone').forEach(function (zone) {
		zone.addEventListener('dragover', function (event) { event.preventDefault(); zone.classList.add('is-over'); });
		zone.addEventListener('dragleave', function () { zone.classList.remove('is-over'); });
		zone.addEventListener('drop', function (event) {
			event.preventDefault(); zone.classList.remove('is-over');
			if (!dragged || !zone.closest('[data-builder-rows="' + zone.dataset.dropzone + '"]')) return;
			var target = event.target.closest('.rp-studio-chip');
			if (target && target.parentNode !== zone) target = null;
			var item = dragged;
			if (dragged.dataset.source === 'palette') {
				if (hasElement(zone.dataset.dropzone, dragged.dataset.element)) return;
				item = createChip(dragged.dataset.element, zone.dataset.dropzone);
			}
			if (target && target !== item) {
				var rect = target.getBoundingClientRect();
				var insertAfter = event.clientY > rect.top + rect.height / 2;
				zone.insertBefore(item, insertAfter ? target.nextSibling : target);
			} else {
				zone.appendChild(item);
			}
			if (item !== dragged) bindNewChips(zone);
			document.querySelectorAll('.rp-studio-dropzone').forEach(updateEmpty);
		});
		updateEmpty(zone);
	});
	document.querySelectorAll('[data-studio-tab]').forEach(function (tab) {
		tab.addEventListener('click', function () {
			document.querySelectorAll('[data-studio-tab]').forEach(function (item) { item.classList.toggle('is-active', item === tab); });
			document.querySelectorAll('[data-studio-editor]').forEach(function (editor) { editor.classList.toggle('is-active', editor.dataset.studioEditor === tab.dataset.studioTab); });
		});
	});
	document.querySelectorAll('[data-preview-width]').forEach(function (button) {
		button.addEventListener('click', function () {
			document.querySelectorAll('[data-preview-width]').forEach(function (item) { item.classList.toggle('is-active', item === button); });
			var frame = document.querySelector('.rp-studio-preview-panel iframe');
			if (frame) { frame.style.width = button.dataset.previewWidth; frame.style.maxWidth = '100%'; frame.style.marginInline = 'auto'; frame.style.display = 'block'; }
		});
	});
	form.addEventListener('submit', function () {
		['header', 'footer'].forEach(function (type) {
			var rows = [];
			document.querySelectorAll('[data-builder-rows="' + type + '"] .rp-studio-dropzone').forEach(function (zone) {
				rows.push(Array.prototype.map.call(zone.querySelectorAll('.rp-studio-chip'), function (chip) { return chip.dataset.element; }));
			});
			var input = document.getElementById('rp-' + type + '-rows-json');
			if (input) input.value = JSON.stringify(rows);
		});
	});
	// Palette chips should remain available as templates; clicks add a fresh draggable chip.
	document.querySelectorAll('.rp-studio-palette .rp-studio-chip').forEach(function (chip) { chip.dataset.source = 'palette'; });
	document.querySelectorAll('.rp-studio-rows .rp-studio-chip').forEach(function (chip) { chip.dataset.bound = '1'; });
}());