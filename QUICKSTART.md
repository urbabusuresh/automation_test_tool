# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/urbabusuresh/automation_test_tool.git
cd automation_test_tool

# Install dependencies
pip install -r requirements.txt

# Install ChromeDriver (choose your OS)
# Ubuntu/Debian:
sudo apt-get install -y chromium-chromedriver

# macOS:
brew install chromedriver
```

### 2. Start the Application

```bash
# Using the run script
./run.sh

# Or directly with Python
python app.py
```

Open your browser to: **http://localhost:5000**

### 3. Record Your First Test

1. **Go to "Record Test" tab**
2. **Fill in the form:**
   - Test Name: `My First Test`
   - Start URL: `https://example.com`
3. **Click "Start Recording"**
4. **Add actions** (examples below)
5. **Click "Stop & Save Recording"**

### 4. Action Examples

#### Click an Element
- Action Type: `Click Element`
- Element Selector: `#button-id` or `.button-class`
- Selector Type: `CSS`

#### Input Text
- Action Type: `Input Text`
- Element Selector: `#username`
- Value to Input: `testuser`
- Selector Type: `CSS`

#### Wait
- Action Type: `Wait`
- Wait Duration: `2` seconds

#### Assertion
- Action Type: `Assertion`
- Assertion Type: `Text Content`
- Element Selector: `h1`
- Expected Value: `Welcome`

### 5. Execute Tests

1. **Go to "Execute Tests" tab**
2. **Click "Load Test Cases"**
3. **Select tests** to run
4. **Click "Execute Selected Tests"**

### 6. View Results

1. **Go to "Test Results" tab**
2. **Click "Refresh Results"**
3. **Click "View Details"** on any result

## Common Workflows

### Workflow 1: Login Test

```
1. Record Test: "Login Test"
2. Start URL: "https://yourapp.com/login"
3. Actions:
   - Input: #username -> "admin"
   - Input: #password -> "password123"
   - Click: #login-button
   - Wait: 2 seconds
   - Assertion: .welcome-message -> "Welcome, Admin"
4. Stop & Save
5. Execute Test
```

### Workflow 2: Form Submission Test

```
1. Record Test: "Contact Form Test"
2. Start URL: "https://yourapp.com/contact"
3. Actions:
   - Input: #name -> "John Doe"
   - Input: #email -> "john@example.com"
   - Input: #message -> "Test message"
   - Click: #submit-button
   - Wait: 2 seconds
   - Assertion: .success-message -> "Message sent"
4. Stop & Save
5. Execute Test
```

### Workflow 3: E-commerce Checkout Test

```
1. Record Test: "Checkout Flow"
2. Start URL: "https://yourshop.com"
3. Actions:
   - Click: .product-item (first product)
   - Wait: 1 second
   - Click: #add-to-cart
   - Wait: 1 second
   - Click: #cart-icon
   - Click: #checkout-button
   - Input: #shipping-address -> "123 Main St"
   - Click: #place-order
   - Assertion: .order-confirmation -> "Order placed"
4. Stop & Save
5. Execute Test
```

## Selector Tips

### CSS Selectors (Recommended)
- By ID: `#element-id`
- By Class: `.element-class`
- By Tag: `button`
- Combined: `div.container button#submit`
- Attribute: `input[type="email"]`
- Nth child: `li:nth-child(2)`

### XPath Selectors (Advanced)
- By ID: `//div[@id="element-id"]`
- By Text: `//button[text()="Submit"]`
- By Attribute: `//input[@type="email"]`
- Complex: `//div[@class="form"]//input[1]`

### Element ID (Simple)
- Just the ID: `submit-button`
- No # symbol needed

## Troubleshooting

### Test Recording Issues

**Problem:** "Element not found"
- **Solution:** Check selector in browser DevTools (F12)
- Try different selector type (CSS → XPath)
- Add wait before action

**Problem:** "Timeout"
- **Solution:** Increase wait duration before action
- Check if element loads asynchronously
- Verify element is visible and clickable

### Test Execution Issues

**Problem:** "ChromeDriver not found"
- **Solution:** Install ChromeDriver:
  ```bash
  sudo apt-get install chromium-chromedriver
  ```

**Problem:** Test fails but worked when recording
- **Solution:** Add wait actions for dynamic content
- Check if page has changed
- Verify selectors are still valid

**Problem:** "Permission denied" errors
- **Solution:** Check directory permissions:
  ```bash
  chmod -R 755 test_cases/ test_results/
  ```

## Best Practices

### ✅ DO:
- Use unique, stable selectors (IDs preferred)
- Add waits before checking dynamic content
- Use assertions to verify expected behavior
- Name tests descriptively
- Group related tests into suites
- Test one flow per test case

### ❌ DON'T:
- Don't use fragile selectors (nth-child(17))
- Don't assume instant page loads
- Don't create tests with too many actions
- Don't forget to add assertions
- Don't use hardcoded waits without need

## API Usage Examples

### Start Recording (curl)
```bash
curl -X POST http://localhost:5000/api/start-recording \
  -H "Content-Type: application/json" \
  -d '{"test_name": "API Test", "start_url": "https://example.com"}'
```

### Record Action (curl)
```bash
curl -X POST http://localhost:5000/api/record-action \
  -H "Content-Type: application/json" \
  -d '{"action_type": "click", "selector": "#button", "selector_type": "css"}'
```

### Execute Test (curl)
```bash
curl -X POST http://localhost:5000/api/execute-test \
  -H "Content-Type: application/json" \
  -d '{"test_case_path": "/path/to/test.json"}'
```

## Advanced Features

### Programmatic Usage

```python
from recorder import ActionRecorder
from executor import TestExecutor

# Record a test
recorder = ActionRecorder()
recorder.start_recording("https://example.com", "My Test")
recorder.record_click("#button", "css")
recorder.record_input("#field", "value", "css")
test_path = recorder.stop_recording()

# Execute the test
executor = TestExecutor()
result = executor.execute_test_case(test_path)
print(f"Status: {result['status']}")
```

### Custom Configuration

Edit `config.py`:
```python
# Change browser
BROWSER_TYPE = 'firefox'  # chrome, firefox, edge

# Change timeout
SELENIUM_TIMEOUT = 20  # seconds

# Enable screenshots
RECORD_SCREENSHOTS = True
```

## Next Steps

1. **Learn More:** Read the full [README.md](README.md)
2. **Explore:** Check `example.py` for programmatic usage
3. **Customize:** Modify `config.py` for your needs
4. **Integrate:** Use the REST API in your CI/CD pipeline
5. **Extend:** Add custom actions in `recorder.py`

## Getting Help

- **Issues:** https://github.com/urbabusuresh/automation_test_tool/issues
- **Documentation:** Check README.md
- **Examples:** See `example.py`

Happy Testing! 🚀
