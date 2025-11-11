// Content script to capture user interactions
(function() {
  'use strict';

  let isRecording = false;
  let recordedSteps = [];
  let currentTestName = '';

  // Utility to generate optimal selector for an element
  function getSelector(element) {
    // Priority: ID > Name > Data attributes > CSS > XPath
    
    // 1. Try ID
    if (element.id) {
      return { type: 'id', value: `#${element.id}` };
    }
    
    // 2. Try Name
    if (element.name) {
      return { type: 'name', value: `[name="${element.name}"]` };
    }
    
    // 3. Try data-testid or similar
    const testId = element.getAttribute('data-testid') || 
                   element.getAttribute('data-test') ||
                   element.getAttribute('data-qa');
    if (testId) {
      const attr = element.getAttribute('data-testid') ? 'data-testid' :
                   element.getAttribute('data-test') ? 'data-test' : 'data-qa';
      return { type: 'data', value: `[${attr}="${testId}"]` };
    }
    
    // 4. Generate CSS selector
    const cssSelector = getCSSSelector(element);
    if (cssSelector) {
      return { type: 'css', value: cssSelector };
    }
    
    // 5. Fallback to XPath
    return { type: 'xpath', value: getXPath(element) };
  }

  function getCSSSelector(element) {
    if (element.tagName === 'BODY') return 'body';
    
    const classes = Array.from(element.classList)
      .filter(c => !c.match(/^(ng-|ui-|has-|is-)/))
      .slice(0, 2);
    
    let selector = element.tagName.toLowerCase();
    if (classes.length) {
      selector += '.' + classes.join('.');
    }
    
    // Add nth-child if needed for uniqueness
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        e => e.tagName === element.tagName && 
             Array.from(e.classList).some(c => classes.includes(c))
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    
    return selector;
  }

  function getXPath(element) {
    if (element.id) return `//*[@id="${element.id}"]`;
    if (element === document.body) return '/html/body';
    
    let ix = 0;
    const siblings = element.parentNode?.childNodes || [];
    
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        const tagName = element.tagName.toLowerCase();
        return `${getXPath(element.parentNode)}/${tagName}[${ix + 1}]`;
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
    return '';
  }

  function recordStep(action, element, value = null) {
    if (!isRecording) return;
    
    const selector = getSelector(element);
    const step = {
      timestamp: Date.now(),
      action: action,
      selector: selector.value,
      selectorType: selector.type,
      tagName: element.tagName.toLowerCase(),
      value: value,
      url: window.location.href,
      innerText: element.innerText?.substring(0, 50) || ''
    };
    
    recordedSteps.push(step);
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'STEP_RECORDED',
      step: step
    });
    
    console.log('Recorded step:', step);
  }

  // Event listeners
  document.addEventListener('click', (e) => {
    if (!isRecording) return;
    
    const target = e.target;
    recordStep('click', target);
  }, true);

  document.addEventListener('input', (e) => {
    if (!isRecording) return;
    
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      recordStep('type', target, target.value);
    }
  }, true);

  document.addEventListener('change', (e) => {
    if (!isRecording) return;
    
    const target = e.target;
    if (target.tagName === 'SELECT') {
      recordStep('select', target, target.value);
    } else if (target.type === 'checkbox' || target.type === 'radio') {
      recordStep('check', target, target.checked);
    }
  }, true);

  // Listen for navigation
  let lastUrl = window.location.href;
  setInterval(() => {
    if (isRecording && window.location.href !== lastUrl) {
      recordedSteps.push({
        timestamp: Date.now(),
        action: 'navigate',
        url: window.location.href
      });
      lastUrl = window.location.href;
    }
  }, 500);

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_RECORDING') {
      isRecording = true;
      recordedSteps = [];
      currentTestName = message.testName || 'Untitled Test';
      
      // Record initial navigation
      recordedSteps.push({
        timestamp: Date.now(),
        action: 'navigate',
        url: window.location.href
      });
      
      sendResponse({ success: true });
    } else if (message.type === 'STOP_RECORDING') {
      isRecording = false;
      sendResponse({ 
        success: true, 
        steps: recordedSteps,
        testName: currentTestName
      });
    } else if (message.type === 'GET_STATUS') {
      sendResponse({ isRecording: isRecording, stepCount: recordedSteps.length });
    }
    
    return true;
  });

  console.log('AutoTestFlow Recorder initialized');
})();
