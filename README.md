# 🎬 AutoTestFlow - No-Code Test Automation Builder

<div align="center">

![AutoTestFlow Logo](https://img.shields.io/badge/AutoTestFlow-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

**A self-hosted intelligent automation tool that records, generates, and replays test cases automatically**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 🚀 Overview

AutoTestFlow is a comprehensive no-code test automation builder that:

✅ **Records** user interactions on web applications (clicks, typing, selections, navigations)  
✅ **Extracts** selectors (XPath, CSS, IDs) automatically  
✅ **Generates** executable test cases dynamically (Playwright, Selenium, Cypress scripts)  
✅ **Replays** test flows automatically end-to-end with full reporting  

## ✨ Features

### 🎥 Browser Recorder (Chrome Extension)
- Captures user interactions in real-time
- Automatically extracts optimal element selectors
- Records click, input, select, navigate, and check actions
- Exports test cases as structured JSON

### 🔧 Test Script Builder
- Generates executable test scripts from recorded actions
- Supports multiple frameworks:
  - **Playwright** (JavaScript)
  - **Selenium** (Python)
  - **Cypress** (JavaScript)
- Framework-agnostic JSON test format

### ⚡ Test Executor
- Runs tests with Playwright automation
- Supports headless and headed execution modes
- Captures screenshots at each step
- Generates detailed execution logs
- Configurable timeouts and retries

### 📊 Dashboard UI
- Beautiful React-based web interface
- View and manage all test cases
- Real-time execution monitoring
- Visual step-by-step flow display
- Pass/Fail reports with screenshots
- One-click test re-runs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Chrome Extension (Browser Recorder)           │
│  - Content Script: Captures user interactions           │
│  - Background Worker: Manages recordings                │
│  - Popup UI: Control recording                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend API Server                     │
│  - Test Management: CRUD operations                     │
│  - Script Generator: Multi-framework support            │
│  - Test Executor: Playwright automation                 │
│  - File Storage: JSON-based test repository             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              React Dashboard (Frontend)                 │
│  - Test List & Detail Views                            │
│  - Execution Results & Monitoring                       │
│  - Script Generation & Export                           │
│  - Beautiful UI with Tailwind-inspired styling          │
└─────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- **Node.js** >= 16.0.0
- **npm** or **yarn**
- **Google Chrome** browser

### Step 1: Clone Repository
```bash
git clone https://github.com/urbabusuresh/automation_test_tool.git
cd automation_test_tool
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install all component dependencies
npm run install-all
```

### Step 3: Install Playwright Browsers
```bash
cd backend
npx playwright install chromium
```

### Step 4: Start the Application

**Option A: Run Both Backend & Frontend**
```bash
npm run dev
```

**Option B: Run Separately**
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

- Backend API: http://localhost:5000
- Frontend Dashboard: http://localhost:3000

### Step 5: Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `extension` folder from the project
5. The AutoTestFlow icon should appear in your browser toolbar

## 🎯 Usage

### Recording a Test

1. **Open the Chrome Extension**
   - Click the AutoTestFlow icon in your browser toolbar
   
2. **Start Recording**
   - Enter a test name (e.g., "User Login Flow")
   - Click "▶ Start" button
   - The extension will begin capturing your actions
   
3. **Perform Actions**
   - Navigate to your web application
   - Perform the actions you want to test (clicks, typing, etc.)
   - All actions are automatically recorded
   
4. **Stop Recording**
   - Click "⏹ Stop" button in the extension
   - Your test is automatically saved
   
5. **Export or View**
   - Click "📥 Export" to download JSON
   - Click "📊 Open Dashboard" to view in the web UI

### Managing Tests via Dashboard

1. **View All Tests**
   - Navigate to http://localhost:3000
   - See all your recorded tests
   
2. **View Test Details**
   - Click on any test card
   - See step-by-step actions
   - Generate scripts for different frameworks
   
3. **Run Tests**
   - Click "▶ Run" on any test
   - Monitor execution in real-time
   - View results with screenshots

### Creating Tests Manually

1. Navigate to "Create Test" page
2. Enter test name and description
3. Paste JSON with test steps:

```json
{
  "steps": [
    {
      "action": "navigate",
      "url": "https://example.com"
    },
    {
      "action": "type",
      "selector": "#username",
      "value": "testuser"
    },
    {
      "action": "click",
      "selector": "#loginButton"
    }
  ]
}
```

4. Click "Create Test"

### Generating Test Scripts

1. Open any test detail page
2. Select framework (Playwright, Selenium, or Cypress)
3. Click "Generate Script"
4. Copy the generated code
5. Use in your test automation project

## 📖 Documentation

### API Endpoints

#### Test Management
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get single test
- `POST /api/tests` - Create new test
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `POST /api/tests/:id/generate` - Generate script

#### Test Execution
- `GET /api/executions` - Get all execution results
- `GET /api/executions/:id` - Get single result
- `POST /api/executions/run/:testId` - Run test
- `GET /api/executions/status/:executionId` - Get execution status

### Test Step Format

```typescript
{
  action: 'navigate' | 'click' | 'type' | 'select' | 'check',
  selector?: string,      // CSS selector or XPath
  selectorType?: string,  // 'id' | 'css' | 'xpath' | 'name' | 'data'
  value?: any,           // Input value (for type, select, check)
  url?: string,          // Target URL (for navigate)
  tagName?: string,      // HTML element tag
  innerText?: string     // Element text content
}
```

### Action Types

- **navigate**: Navigate to URL
- **click**: Click on element
- **type**: Type text into input field
- **select**: Select option from dropdown
- **check**: Check/uncheck checkbox or radio button

## 🔧 Configuration

### Backend Configuration
Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
```

### Frontend Configuration
Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📂 Project Structure

```
automation_test_tool/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── index.js        # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── data/               # Test data storage
│   │   ├── tests/          # Test case JSON files
│   │   ├── results/        # Execution results
│   │   └── screenshots/    # Test screenshots
│   └── package.json
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API client
│   │   └── App.js         # Main app component
│   └── package.json
├── extension/             # Chrome extension
│   ├── manifest.json      # Extension config
│   ├── src/
│   │   ├── content/      # Content scripts
│   │   ├── background/   # Service worker
│   │   └── popup/        # Extension popup UI
│   └── icons/            # Extension icons
├── docs/                 # Documentation
├── examples/             # Example test cases
└── package.json          # Root package file
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Browser Recorder | Chrome Extension (JavaScript) |
| Backend API | Node.js + Express |
| Test Executor | Playwright |
| Script Generator | Node.js |
| Frontend Dashboard | React 18 |
| Routing | React Router |
| HTTP Client | Axios |
| Data Storage | File-based JSON |
| Styling | CSS3 (Tailwind-inspired) |

## 🧪 Testing

Currently implemented with basic manual testing. Future enhancements:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Chrome Extension recorder
- [x] Backend API server
- [x] Test script generator
- [x] Playwright test executor
- [x] React dashboard UI

### Phase 2: Advanced Features (Coming Soon)
- [ ] Smart XPath auto-selector
- [ ] Step grouping & reusable flows
- [ ] AI test naming with GPT
- [ ] Export to YAML/XML formats
- [ ] Test stability analytics
- [ ] Multi-user support

### Phase 3: Enterprise Features (Future)
- [ ] CI/CD integration (Jenkins, GitHub Actions)
- [ ] Docker containerization
- [ ] Database storage (MongoDB/PostgreSQL)
- [ ] Authentication & authorization
- [ ] Team collaboration features
- [ ] Advanced reporting with Allure

## 🐛 Known Issues

- Extension icons are placeholders (replace with actual PNG icons)
- No authentication/authorization yet
- File-based storage (not suitable for large scale)

## 💡 Tips

1. **Use stable selectors**: Prefer IDs and data attributes over CSS classes
2. **Wait for elements**: Add small delays for dynamic content
3. **Test incrementally**: Record and test small flows first
4. **Review generated scripts**: Customize as needed for your use case
5. **Screenshot review**: Check execution screenshots for debugging

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review example test cases in `/examples`

---

<div align="center">
  Made with ❤️ for automation testing
  <br>
  <strong>Star ⭐ this repo if you find it useful!</strong>
</div>