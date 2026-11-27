(function () {
  'use strict';
  if (!window.React || !window.ReactDOM) return;

  window.wp = window.wp || {};
  window.wp.element = {
    createElement: window.React.createElement,
    useState: window.React.useState,
    useEffect: window.React.useEffect,
    useRef: window.React.useRef,
    useMemo: window.React.useMemo,
    Fragment: window.React.Fragment,
    render: function (element, container) {
      if (window.ReactDOM.createRoot) {
        if (!container._rssRoot) {
          container._rssRoot = window.ReactDOM.createRoot(container);
        }
        container._rssRoot.render(element);
      } else {
        window.ReactDOM.render(element, container);
      }
    }
  };

  const SAMPLE_MEDIA = [
    {
      id: 'rss-brand-card',
      title: 'RSS Prism Monogram',
      alt: 'Razeen Secure Solution RSS Prism visual emblem',
      url: '/assets/theme/screenshot.svg'
    },
    {
      id: 'rss-security-banner',
      title: 'Security Architecture Graphic',
      alt: 'RSS Prism security-first digital infrastructure diagram',
      url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#191b20"/><stop offset="100%" stop-color="#2c313c"/></linearGradient></defs><rect width="800" height="420" rx="18" fill="url(#g)"/><circle cx="620" cy="210" r="130" fill="#b88a2b" opacity="0.18"/><circle cx="620" cy="210" r="85" fill="none" stroke="#b88a2b" stroke-width="2"/><text x="64" y="170" fill="#b88a2b" font-family="system-ui,sans-serif" font-size="16" font-weight="700" letter-spacing="3">RAZEEN SECURE SOLUTION</text><text x="64" y="224" fill="#ffffff" font-family="system-ui,sans-serif" font-size="40" font-weight="800">Security-First Systems</text><text x="64" y="268" fill="#c4c6cc" font-family="system-ui,sans-serif" font-size="20">CCTV · Networking · Software · Cloud</text></svg>')
    },
    {
      id: 'rss-gold-showcase',
      title: 'RSS Gold Workspace Card',
      alt: 'RSS Prism visual workspace showcase',
      url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffdf7"/><stop offset="100%" stop-color="#f3ead2"/></linearGradient></defs><rect width="800" height="420" rx="18" fill="url(#g2)" stroke="#e2d4b0" stroke-width="2"/><rect x="56" y="64" width="688" height="292" rx="14" fill="#ffffff" stroke="#e5e7eb"/><rect x="84" y="96" width="180" height="22" rx="6" fill="#b88a2b" opacity="0.2"/><rect x="84" y="138" width="420" height="32" rx="6" fill="#202124"/><rect x="84" y="186" width="540" height="16" rx="4" fill="#686d76" opacity="0.45"/><rect x="84" y="214" width="460" height="16" rx="4" fill="#686d76" opacity="0.35"/><rect x="84" y="264" width="160" height="44" rx="22" fill="#b88a2b"/></svg>')
    }
  ];

  window.wp.media = function (opts) {
    const callbacks = {};
    let selectedItem = SAMPLE_MEDIA[0];
    let overlay = null;

    function close() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }

    const frame = {
      on: function (event, cb) {
        callbacks[event] = cb;
      },
      state: function () {
        return {
          get: function () {
            return {
              first: function () {
                return {
                  toJSON: function () {
                    return selectedItem;
                  }
                };
              }
            };
          }
        };
      },
      open: function () {
        close();
        overlay = document.createElement('div');
        overlay.className = 'rp-media-modal-backdrop';
        overlay.innerHTML =
          '<div class="rp-media-modal" role="dialog" aria-modal="true" aria-label="' + ((opts && opts.title) || 'Media Library') + '">' +
            '<div class="rp-media-modal__head">' +
              '<h3>' + ((opts && opts.title) || 'Choose an image') + '</h3>' +
              '<button type="button" class="rp-media-close" aria-label="Close">×</button>' +
            '</div>' +
            '<div class="rp-media-modal__body">' +
              '<div class="rp-media-grid">' +
                SAMPLE_MEDIA.map(function (m, idx) {
                  return '<button type="button" class="rp-media-item' + (idx === 0 ? ' is-active' : '') + '" data-idx="' + idx + '">' +
                    '<img src="' + m.url + '" alt="' + m.alt + '">' +
                    '<span>' + m.title + '</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
              '<div class="rp-media-custom">' +
                '<label>Or paste an external image URL<input type="url" class="rp-media-url-input" placeholder="https://example.com/photo.jpg"></label>' +
                '<label>Alternative text<input type="text" class="rp-media-alt-input" placeholder="Describe the image for accessibility"></label>' +
              '</div>' +
            '</div>' +
            '<div class="rp-media-modal__foot">' +
              '<button type="button" class="button rp-media-cancel">Cancel</button>' +
              '<button type="button" class="button button-primary rp-media-use">' + ((opts && opts.button && opts.button.text) || 'Use image') + '</button>' +
            '</div>' +
          '</div>';

        document.body.appendChild(overlay);
        const urlInput = overlay.querySelector('.rp-media-url-input');
        const altInput = overlay.querySelector('.rp-media-alt-input');
        overlay.querySelectorAll('.rp-media-item').forEach(function (btn) {
          btn.addEventListener('click', function () {
            overlay.querySelectorAll('.rp-media-item').forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            selectedItem = SAMPLE_MEDIA[Number(btn.dataset.idx)] || SAMPLE_MEDIA[0];
            urlInput.value = '';
            altInput.value = selectedItem.alt;
          });
        });
        overlay.querySelector('.rp-media-close').addEventListener('click', close);
        overlay.querySelector('.rp-media-cancel').addEventListener('click', close);
        overlay.querySelector('.rp-media-use').addEventListener('click', function () {
          const customUrl = urlInput.value.trim();
          if (customUrl) {
            selectedItem = { url: customUrl, alt: altInput.value.trim() };
          } else if (altInput.value.trim()) {
            selectedItem = { ...selectedItem, alt: altInput.value.trim() };
          }
          if (callbacks.select) callbacks.select();
          close();
        });
      }
    };
    return frame;
  };
})();
