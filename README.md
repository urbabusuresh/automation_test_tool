# Automation Test Tool 🤖

An end-to-end automation testing tool that records user actions through a web interface and automatically generates executable test cases. Record your test flows once and run them dynamically with detailed test results.

## Features

✅ **Action Recording**: Record user interactions with web applications (clicks, inputs, waits, assertions)  
✅ **Automatic Test Generation**: Automatically generates test cases from recorded actions  
✅ **Test Suite Management**: Organize and manage multiple test cases as suites  
✅ **Dynamic Execution**: Run tests dynamically with Selenium WebDriver  
✅ **Detailed Results**: Get comprehensive test results with action-by-action breakdown  
✅ **Web UI**: User-friendly interface for recording, managing, and executing tests  

## Installation

### Prerequisites
- Python 3.8 or higher
- Chrome browser (for Selenium WebDriver)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/urbabusuresh/automation_test_tool.git
cd automation_test_tool
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Chrome WebDriver:
```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y chromium-chromedriver

# On macOS
brew install chromedriver

# Or download from: https://chromedriver.chromium.org/
```

## Usage

### Starting the Application

Run the Flask application:
```bash
python app.py
```

The application will start at `http://localhost:5000`

### Recording a Test Case

1. Open the web interface at `http://localhost:5000`
2. Navigate to the **"Record Test"** tab
3. Enter a test name and starting URL
4. Click **"Start Recording"**
5. Add actions:
   - **Click**: Record clicking on elements
   - **Input**: Record text input
   - **Wait**: Add delays between actions
   - **Assertion**: Verify element properties
6. Click **"Stop & Save Recording"** when done

### Managing Test Cases

1. Navigate to the **"Test Cases"** tab
2. View all recorded test cases
3. Click **"View"** to see test details
4. Click **"Execute"** to run individual tests

### Executing Test Suites

1. Navigate to the **"Execute Tests"** tab
2. Click **"Load Test Cases"**
3. Select multiple test cases to execute
4. Click **"Execute Selected Tests"**
5. View results in the **"Test Results"** tab

### Viewing Test Results

1. Navigate to the **"Test Results"** tab
2. Click **"Refresh Results"** to see latest results
3. Click **"View Details"** to see action-by-action execution details

## Architecture

### Components

- **`app.py`**: Flask web application with REST API endpoints
- **`recorder.py`**: Action recorder using Selenium WebDriver
- **`executor.py`**: Test case executor with detailed result generation
- **`config.py`**: Configuration settings
- **`templates/index.html`**: Web UI for all operations

### Data Storage

- **Test Cases**: Stored as JSON files in `test_cases/` directory
- **Test Results**: Stored as JSON files in `test_results/` directory
- **Screenshots**: Saved in `screenshots/` directory (optional)

## API Endpoints

### Recording
- `POST /api/start-recording` - Start recording a new test case
- `POST /api/record-action` - Record an action
- `POST /api/stop-recording` - Stop recording and save test case

### Test Cases
- `GET /api/test-cases` - List all test cases
- `GET /api/test-case/<filename>` - Get specific test case details

### Execution
- `POST /api/execute-test` - Execute a single test case
- `POST /api/execute-suite` - Execute multiple test cases as a suite

### Results
- `GET /api/test-results` - List all test results
- `GET /api/test-result/<filename>` - Get specific test result details

## Example Test Case Structure

```json
{
  "name": "Login Test",
  "start_url": "https://example.com/login",
  "actions": [
    {
      "type": "navigate",
      "url": "https://example.com/login",
      "timestamp": "2024-01-01T10:00:00"
    },
    {
      "type": "input",
      "selector": "#username",
      "selector_type": "css",
      "value": "testuser",
      "timestamp": "2024-01-01T10:00:01"
    },
    {
      "type": "click",
      "selector": "#login-button",
      "selector_type": "css",
      "timestamp": "2024-01-01T10:00:02"
    },
    {
      "type": "assertion",
      "assertion_type": "text",
      "selector": ".welcome-message",
      "selector_type": "css",
      "expected_value": "Welcome!",
      "timestamp": "2024-01-01T10:00:03"
    }
  ],
  "created_at": "2024-01-01T10:00:00"
}
```

## Configuration

Edit `config.py` to customize:
- Flask host and port
- Selenium timeout
- Browser type (chrome, firefox, edge)
- Screenshot settings
- Directory paths

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests (when available)
pytest tests/
```

### Project Structure
```
automation_test_tool/
├── app.py              # Flask web application
├── recorder.py         # Action recording logic
├── executor.py         # Test execution logic
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html      # Web UI
├── test_cases/         # Stored test cases (JSON)
├── test_results/       # Test execution results (JSON)
└── screenshots/        # Optional screenshots
```

## Troubleshooting

### Chrome WebDriver Issues
- Ensure Chrome and ChromeDriver versions match
- Run with `--no-sandbox` flag in headless mode
- Check ChromeDriver is in system PATH

### Permission Issues
- Ensure write permissions for `test_cases/` and `test_results/` directories
- Check file permissions if loading test cases fails

### Selector Not Found
- Use browser DevTools to verify selectors
- Try different selector types (CSS, XPath, ID)
- Add wait time before action if page loads slowly

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Created by urbabusuresh

## Support

For issues, questions, or feature requests, please open an issue on GitHub.