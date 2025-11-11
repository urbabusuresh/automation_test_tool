(() => {
  if (window.__automationRecorderInjected) return;
  window.__automationRecorderInjected = true;

  const lastClick = { time: 0, x: 0, y: 0, selector: null };
  let typingBuffer = {};

  function now() { return Date.now(); }
  function safeSelector(el) {
    try {
      if (!el) return '';
      if (el.id) return `#${el.id}`;
      if (el.className && typeof el.className === 'string') {
        const cls = el.className.split(' ').filter(Boolean).join('.');
        if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
      }
      let path = el.tagName.toLowerCase();
      if (el.getAttribute && el.getAttribute('data-testid')) {
        path += `[data-testid="${el.getAttribute('data-testid')}"]`;
      }
      return path;
    } catch (e) {
      return el.tagName ? el.tagName.toLowerCase() : '';
    }
  }

  function sendStep(step, opts = { attachScreenshot: false }) {
    chrome.runtime.sendMessage({ type: 'record-step', step, attachScreenshot: opts.attachScreenshot }, (resp) => {});
  }

  function validClickTarget(target) {
    if (!target) return false;
    if (target.closest && target.closest('.automation-extension-ui')) return false;
    const tag = target.tagName && target.tagName.toLowerCase();
    if (tag === 'body' || tag === 'html') return false;
    const rect = target.getBoundingClientRect && target.getBoundingClientRect();
    if (rect) {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const area = rect.width * rect.height;
      const vpArea = vw * vh;
      if (area > vpArea * 0.85) return false;
      if (rect.width === 0 || rect.height === 0) return false;
    }
    return true;
  }

  document.addEventListener('click', (ev) => {
    try {
      const target = ev.target;
      if (!validClickTarget(target)) return;
      const rect = target.getBoundingClientRect();
      const x = Math.round(ev.clientX);
      const y = Math.round(ev.clientY);
      if (now() - lastClick.time < 200 && Math.abs(lastClick.x - x) < 5 && Math.abs(lastClick.y - y) < 5 && lastClick.selector === safeSelector(target)) {
        return;
      }
      lastClick.time = now();
      lastClick.x = x;
      lastClick.y = y;
      lastClick.selector = safeSelector(target);
      const step = {
        timestamp: Date.now(),
        action: 'click',
        selector: lastClick.selector,
        selectorType: inferSelectorType(target),
        tagName: target.tagName.toLowerCase(),
        value: null,
        url: window.location.href,
        innerText: (target.innerText || '').substring(0, 200)
      };
      sendStep(step, { attachScreenshot: true });
    } catch (e) {
      console.error('click record failed', e);
    }
  }, true);

  function onInput(ev) {
    try {
      const el = ev.target;
      const tag = el.tagName && el.tagName.toLowerCase();
      if (!['input', 'textarea'].includes(tag)) return;
      const selector = safeSelector(el);
      if (typingBuffer[selector] && typingBuffer[selector].timer) clearTimeout(typingBuffer[selector].timer);
      typingBuffer[selector] = typingBuffer[selector] || {};
      typingBuffer[selector].lastValue = el.value;
      typingBuffer[selector].timer = setTimeout(() => {
        const step = {
          timestamp: Date.now(),
          action: 'type',
          selector,
          selectorType: inferSelectorType(el),
          tagName: tag,
          value: el.value,
          url: window.location.href,
          innerText: ''
        };
        sendStep(step, { attachScreenshot: false });
        delete typingBuffer[selector];
      }, 400);
    } catch (e) {
      console.error('input record failed', e);
    }
  }

  function onBlur(ev) {
    try {
      const el = ev.target;
      const tag = el.tagName && el.tagName.toLowerCase();
      if (!['input', 'textarea', 'select'].includes(tag)) return;
      const selector = safeSelector(el);
      if (typingBuffer[selector] && typingBuffer[selector].timer) {
        clearTimeout(typingBuffer[selector].timer);
      }
      const step = {
        timestamp: Date.now(),
        action: 'type',
        selector,
        selectorType: inferSelectorType(el),
        tagName: tag,
        value: el.value,
        url: window.location.href,
        innerText: ''
      };
      sendStep(step, { attachScreenshot: false });
      delete typingBuffer[selector];
    } catch (e) {
      console.error('blur record failed', e);
    }
  }

  function inferSelectorType(el) {
    if (!el) return 'css';
    if (el.id) return 'id';
    return 'css';
  }

  document.addEventListener('input', onInput, true);
  document.addEventListener('blur', onBlur, true);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'ping-content-script') {
      sendResponse({ status: 'ready' });
    }
  });
})();
