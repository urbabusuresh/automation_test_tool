# AutoTestFlow API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. This will be added in future versions.

---

## Test Management Endpoints

### Get All Tests
Retrieve all test cases stored in the system.

**Endpoint:** `GET /api/tests`

**Response:**
```json
{
  "success": true,
  "tests": [
    {
      "id": "uuid-1234",
      "name": "Login Test",
      "description": "Test user login flow",
      "steps": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Test
Retrieve a specific test case by ID.

**Endpoint:** `GET /api/tests/:id`

**Parameters:**
- `id` (path) - Test ID

**Response:**
```json
{
  "success": true,
  "test": {
    "id": "uuid-1234",
    "name": "Login Test",
    "description": "Test user login flow",
    "steps": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Test
Create a new test case.

**Endpoint:** `POST /api/tests`

**Request Body:**
```json
{
  "name": "Login Test",
  "description": "Test user login flow",
  "steps": [
    {
      "action": "navigate",
      "url": "https://example.com"
    },
    {
      "action": "type",
      "selector": "#username",
      "value": "testuser"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "test": {
    "id": "uuid-1234",
    "name": "Login Test",
    "description": "Test user login flow",
    "steps": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Test
Update an existing test case.

**Endpoint:** `PUT /api/tests/:id`

**Parameters:**
- `id` (path) - Test ID

**Request Body:**
```json
{
  "name": "Updated Login Test",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "test": {
    "id": "uuid-1234",
    "name": "Updated Login Test",
    "description": "Updated description",
    "steps": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

### Delete Test
Delete a test case.

**Endpoint:** `DELETE /api/tests/:id`

**Parameters:**
- `id` (path) - Test ID

**Response:**
```json
{
  "success": true,
  "message": "Test deleted successfully"
}
```

### Generate Script
Generate executable test script from a test case.

**Endpoint:** `POST /api/tests/:id/generate`

**Parameters:**
- `id` (path) - Test ID

**Request Body:**
```json
{
  "framework": "playwright"
}
```

**Supported Frameworks:**
- `playwright` - JavaScript/TypeScript
- `selenium` - Python
- `cypress` - JavaScript

**Response:**
```json
{
  "success": true,
  "script": "import { test, expect } from '@playwright/test';\n\ntest('Login Test', async ({ page }) => {\n  await page.goto('https://example.com');\n  await page.fill('#username', 'testuser');\n});\n"
}
```

---

## Test Execution Endpoints

### Get All Execution Results
Retrieve all test execution results.

**Endpoint:** `GET /api/executions`

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "executionId": "exec-uuid-1234",
      "testId": "test-uuid-5678",
      "testName": "Login Test",
      "status": "passed",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T00:01:00.000Z",
      "duration": 60000,
      "steps": [...],
      "screenshots": ["screenshot1.png", "screenshot2.png"]
    }
  ]
}
```

### Get Single Execution Result
Retrieve a specific execution result.

**Endpoint:** `GET /api/executions/:id`

**Parameters:**
- `id` (path) - Execution ID

**Response:**
```json
{
  "success": true,
  "result": {
    "executionId": "exec-uuid-1234",
    "testId": "test-uuid-5678",
    "testName": "Login Test",
    "status": "passed",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T00:01:00.000Z",
    "duration": 60000,
    "steps": [
      {
        "index": 0,
        "action": "navigate",
        "status": "passed",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T00:00:10.000Z",
        "screenshot": "screenshot1.png"
      }
    ],
    "screenshots": ["screenshot1.png", "screenshot2.png"]
  }
}
```

### Run Test
Execute a test case.

**Endpoint:** `POST /api/executions/run/:testId`

**Parameters:**
- `testId` (path) - Test ID to execute

**Request Body:**
```json
{
  "headless": true
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec-uuid-1234",
  "message": "Test execution started"
}
```

### Get Execution Status
Check the status of a running execution.

**Endpoint:** `GET /api/executions/status/:executionId`

**Parameters:**
- `executionId` (path) - Execution ID

**Response (Running):**
```json
{
  "success": true,
  "status": "running",
  "message": "Execution in progress"
}
```

**Response (Completed):**
```json
{
  "success": true,
  "status": "completed",
  "result": {
    "executionId": "exec-uuid-1234",
    "status": "passed",
    ...
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## Test Step Schema

```typescript
interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'select' | 'check';
  selector?: string;        // CSS selector or XPath
  selectorType?: string;    // 'id' | 'css' | 'xpath' | 'name' | 'data'
  value?: any;             // Value for type/select/check actions
  url?: string;            // URL for navigate action
  tagName?: string;        // HTML element tag
  innerText?: string;      // Element text content
  timestamp?: number;      // Recording timestamp
}
```

---

## Examples

### cURL Examples

**Get all tests:**
```bash
curl http://localhost:5000/api/tests
```

**Create a test:**
```bash
curl -X POST http://localhost:5000/api/tests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test",
    "steps": [
      {"action": "navigate", "url": "https://example.com"},
      {"action": "type", "selector": "#username", "value": "test"}
    ]
  }'
```

**Run a test:**
```bash
curl -X POST http://localhost:5000/api/executions/run/test-id-123 \
  -H "Content-Type: application/json" \
  -d '{"headless": true}'
```

**Generate Playwright script:**
```bash
curl -X POST http://localhost:5000/api/tests/test-id-123/generate \
  -H "Content-Type: application/json" \
  -d '{"framework": "playwright"}'
```
