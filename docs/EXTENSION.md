# Chrome Extension Usage Guide

## Installation

1. Open Google Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" button
5. Browse to the `extension` folder in your project directory
6. Click "Select Folder"
7. The AutoTestFlow icon should appear in your browser toolbar

## Using the Extension

### Recording a Test

#### Step 1: Open the Extension Popup
- Click the AutoTestFlow icon in your Chrome toolbar
- The popup window will open showing the recorder interface

#### Step 2: Configure Your Test
- **Test Name:** Enter a descriptive name for your test (e.g., "User Login Flow")
- The name will help you identify the test later

#### Step 3: Start Recording
- Click the "▶ Start" button
- The recorder will begin capturing your actions
- You'll see "Recording" indicator and step count

#### Step 4: Perform Your Actions
Navigate to your target website and perform the actions you want to test:

**Supported Actions:**
- **Navigate:** Opening URLs (automatically captured)
- **Click:** Clicking buttons, links, or any clickable element
- **Type:** Entering text in input fields or textareas
- **Select:** Choosing options from dropdown menus
- **Check:** Checking/unchecking checkboxes or radio buttons

**Tips:**
- Perform actions slowly and deliberately
- Wait for pages to load completely before next action
- The extension captures each action as soon as you perform it

#### Step 5: Stop Recording
- Click the "⏹ Stop" button when done
- Your test is automatically saved to Chrome storage
- A confirmation alert shows the number of steps captured

### Exporting Tests

#### Option 1: Export to JSON File
1. Click the "📥 Export" button in the extension popup
2. Choose where to save the JSON file
3. The file contains all recorded steps in JSON format
4. You can import this JSON into the dashboard

#### Option 2: View in Dashboard
1. Click the "📊 Open Dashboard" button
2. This opens http://localhost:3000 in a new tab
3. Your saved tests will appear in the dashboard
4. Make sure the backend server is running

### Understanding Recorded Steps

Each recorded action creates a step object with:

```json
{
  "timestamp": 1234567890,
  "action": "click",
  "selector": "#loginButton",
  "selectorType": "id",
  "tagName": "button",
  "value": null,
  "url": "https://example.com",
  "innerText": "Sign In"
}
```

**Fields:**
- `action` - Type of action performed
- `selector` - CSS selector or XPath to locate the element
- `selectorType` - Type of selector used (id, css, xpath, name, data)
- `value` - Input value (for type, select, check actions)
- `url` - Current page URL
- `tagName` - HTML element type
- `innerText` - Visible text of the element

## Selector Priority

The extension automatically chooses the most stable selector:

1. **ID** - `#elementId` (highest priority)
2. **Name** - `[name="fieldName"]`
3. **Data attributes** - `[data-testid="value"]`
4. **CSS classes** - `.class-name`
5. **XPath** - `//div[@class='value']` (fallback)

## Tips for Better Recording

### 1. Use Stable Selectors
- Add `id` attributes to important elements
- Use `data-testid` attributes for test-specific identification
- Avoid relying on generated class names

### 2. Wait for Content
- Let pages fully load before interacting
- Wait for dynamic content to appear
- The extension captures the current state

### 3. Record Incrementally
- Record small, focused test flows
- Combine multiple small tests rather than one large test
- Easier to debug and maintain

### 4. Verify Recordings
- Check the step count in the popup
- Export and review the JSON
- Test the recording in the dashboard

### 5. Handle Dynamic Content
- For dynamic selectors, manually edit the JSON
- Use more generic selectors for unstable elements
- Consider recording multiple variations

## Troubleshooting

### Recording Not Starting
**Problem:** Click "Start" but nothing happens  
**Solutions:**
- Refresh the page you want to test
- Close and reopen the extension popup
- Check browser console for errors

### Steps Not Captured
**Problem:** Performing actions but step count doesn't increase  
**Solutions:**
- Ensure recording is active (check status indicator)
- Try performing actions more slowly
- Some iframe content may not be captured

### Selectors Not Working
**Problem:** Exported test fails during execution  
**Solutions:**
- Review generated selectors in the JSON
- Manually edit selectors to be more specific or generic
- Use the dashboard to test individual steps

### Extension Not Loading
**Problem:** Extension icon doesn't appear  
**Solutions:**
- Check `chrome://extensions/` for errors
- Ensure manifest.json is valid
- Reload the extension after code changes

## Advanced Features

### Viewing Storage
To see what's stored by the extension:
1. Open `chrome://extensions/`
2. Find AutoTestFlow and click "Details"
3. Click "Inspect views: background page"
4. In the console, type: `chrome.storage.local.get(console.log)`

### Clearing Storage
To clear all saved recordings:
```javascript
// In extension popup console
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
});
```

### Custom Selector Strategy
For advanced users, you can modify `recorder.js` to change selector priority or add custom selection logic.

## Keyboard Shortcuts

Currently, no keyboard shortcuts are implemented. This is planned for future releases.

**Planned shortcuts:**
- `Ctrl+Shift+R` - Start/Stop recording
- `Ctrl+Shift+E` - Export test

## Integration with Dashboard

### Syncing Tests
- Extension saves tests locally in Chrome storage
- Export JSON and import manually in dashboard
- Future versions will sync automatically with backend

### Running Recorded Tests
1. Export test from extension
2. Import to dashboard (or use API)
3. Run test from dashboard
4. View results with screenshots

## Privacy & Security

- All data is stored locally in Chrome storage
- No data is sent to external servers (except your own backend)
- Recordings may contain sensitive information (passwords, tokens)
- Review and sanitize test data before sharing

## Limitations

1. **Same-origin only:** Cannot record in iframe from different origin
2. **Shadow DOM:** Limited support for Shadow DOM elements
3. **Dynamic content:** May need manual adjustment for SPAs
4. **File uploads:** File upload actions not fully supported
5. **Browser features:** Cannot record browser-level actions (new tab, bookmarks)

## Examples

### Example 1: Recording Login
1. Start recording
2. Go to login page
3. Type username
4. Type password
5. Click login button
6. Stop recording
7. Export as "login-test.json"

### Example 2: Recording Form Submission
1. Start recording
2. Fill all form fields
3. Select dropdown options
4. Check agreement checkbox
5. Click submit
6. Stop recording
7. Export as "contact-form.json"

### Example 3: Recording Search Flow
1. Start recording
2. Type in search box
3. Click search button
4. Click first result
5. Verify page loaded
6. Stop recording
7. Export as "search-test.json"

## Future Enhancements

- Automatic sync with backend
- Pause/resume recording
- Step editing in popup
- Screenshot preview
- Assertion recording
- Network request capture
- Custom event listeners
