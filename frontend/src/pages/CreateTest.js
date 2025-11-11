import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/api';
import './CreateTest.css';

function CreateTest() {
  const navigate = useNavigate();
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let steps = [];
      
      if (jsonInput.trim()) {
        // Parse JSON input
        const parsed = JSON.parse(jsonInput);
        steps = parsed.steps || parsed;
      }
      
      if (!Array.isArray(steps) || steps.length === 0) {
        setError('Please provide valid test steps in JSON format');
        return;
      }
      
      const response = await testService.createTest({
        name: testName,
        description: testDescription,
        steps: steps
      });
      
      if (response.success) {
        navigate(`/test/${response.test.id}`);
      }
    } catch (err) {
      setError('Failed to create test: ' + err.message);
    }
  };

  const exampleJson = {
    steps: [
      {
        action: "navigate",
        url: "https://example.com"
      },
      {
        action: "type",
        selector: "#username",
        value: "testuser"
      },
      {
        action: "type",
        selector: "#password",
        value: "password123"
      },
      {
        action: "click",
        selector: "#loginButton"
      }
    ]
  };

  return (
    <div className="container">
      <div className="create-header">
        <button onClick={() => navigate('/')} className="btn-back">← Back</button>
        <h1>Create New Test</h1>
        <p>Import test steps from Chrome extension or paste JSON manually</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="testName">Test Name *</label>
          <input
            type="text"
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., User Login Flow"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="testDescription">Description</label>
          <textarea
            id="testDescription"
            value={testDescription}
            onChange={(e) => setTestDescription(e.target.value)}
            placeholder="Optional description of what this test does"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jsonInput">Test Steps (JSON) *</label>
          <textarea
            id="jsonInput"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={JSON.stringify(exampleJson, null, 2)}
            rows="15"
            required
          />
          <small className="form-hint">
            Export JSON from the Chrome extension or paste test steps manually
          </small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Test
          </button>
        </div>
      </form>

      <div className="help-section">
        <h3>📝 JSON Format</h3>
        <p>Your JSON should contain a "steps" array with objects having these fields:</p>
        <ul>
          <li><strong>action:</strong> navigate, click, type, select, check</li>
          <li><strong>selector:</strong> CSS selector or XPath (for actions other than navigate)</li>
          <li><strong>value:</strong> Input value (for type, select, check actions)</li>
          <li><strong>url:</strong> Target URL (for navigate action)</li>
        </ul>
      </div>
    </div>
  );
}

export default CreateTest;
