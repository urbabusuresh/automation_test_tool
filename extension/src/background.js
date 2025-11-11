// background.js - recording controller and screenshot capturer
let recording = false;
let steps = [];
let currentTabId = null;

async function captureScreenshot(tabId) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab();
    return dataUrl;
  } catch (err) {
    console.warn('captureScreenshot failed', err);
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === 'start-record') {
      recording = true;
      steps = [];
      currentTabId = sender.tab?.id ?? message.tabId ?? null;
      sendResponse({ status: 'started' });
      if (currentTabId) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: currentTabId },
            files: ['src/contentScript.js']
          });
        } catch (e) {
        }
      }
      return;
    }

    if (message?.type === 'stop-record') {
      recording = false;
      sendResponse({ status: 'stopped', timestamp: Date.now() });
      return;
    }

    if (message?.type === 'record-step') {
      const step = message.step;
      if (message.attachScreenshot && currentTabId != null) {
        const screenshot = await captureScreenshot(currentTabId);
        if (screenshot) step.screenshot = screenshot;
      }
      steps.push(step);
      sendResponse({ status: 'ok' });
      return;
    }

    if (message?.type === 'get-recording') {
      sendResponse({ status: 'ok', recording: { name: message.name || 'My Test', steps, timestamp: Date.now() } });
      return;
    }

    if (message?.type === 'clear-recording') {
      steps = [];
      sendResponse({ status: 'cleared' });
      return;
    }

    if (message?.type === 'create-testcase') {
      const name = message.name || 'generated_test';
      const playwrightCode = generatePlaywrightFromSteps({ name, steps });
      sendResponse({ status: 'ok', playwrightCode });
      return;
    }

    sendResponse({ status: 'unknown' });
  })();
  return true;
});

function generatePlaywrightFromSteps(recording) {
  const { steps, name } = recording;
  const lines = [
    "const { test, expect } = require('@playwright/test');",
    `test('${escapeQuotes(name)}', async ({ page }) => {`
  ];
  let lastUrl = null;
  steps.forEach((s, idx) => {
    if (s.url && s.url !== lastUrl) {
      lines.push(`  await page.goto('${escapeQuotes(s.url)}');`);
      lastUrl = s.url;
    }
    if (s.action === 'click') {
      const sel = s.selector ? s.selector.replace(/'/g, "\\'") : '';
      lines.push(`  await page.click('${sel}');`);
    } else if (s.action === 'type') {
      const sel = s.selector ? s.selector.replace(/'/g, "\\'") : '';
      const value = (s.value || '').replace(/'/g, "\\'");
      lines.push(`  await page.fill('${sel}', '${value}');`);
    }
  });
  lines.push('});');
  return lines.join('\n');
}
function escapeQuotes(s = '') { return String(s).replace(/'/g, "\\'"); }
