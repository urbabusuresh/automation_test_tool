import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService, executionService } from '../services/api';
import './TestDetail.css';

function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState('playwright');

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const response = await testService.getTest(id);
      if (response.success) {
        setTest(response.test);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load test: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      const response = await executionService.runTest(id, { headless: true });
      if (response.success) {
        alert(`Test execution started! Execution ID: ${response.executionId}`);
        navigate('/results');
      }
    } catch (err) {
      alert('Failed to run test: ' + err.message);
    }
  };

  const handleGenerateScript = async () => {
    try {
      const response = await testService.generateScript(id, selectedFramework);
      if (response.success) {
        setGeneratedScript(response.script);
      }
    } catch (err) {
      alert('Failed to generate script: ' + err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    alert('Script copied to clipboard!');
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading test...</div></div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  if (!test) {
    return <div className="container"><div className="error">Test not found</div></div>;
  }

  return (
    <div className="container">
      <div className="test-detail-header">
        <div>
          <button onClick={() => navigate('/')} className="btn-back">← Back</button>
          <h1>{test.name}</h1>
          {test.description && <p className="test-desc">{test.description}</p>}
        </div>
        <button onClick={handleRun} className="btn btn-primary">
          ▶ Run Test
        </button>
      </div>

      <div className="test-info-card">
        <div className="info-item">
          <span className="info-label">Created:</span>
          <span>{new Date(test.createdAt).toLocaleString()}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Steps:</span>
          <span>{test.steps?.length || 0}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Last Updated:</span>
          <span>{new Date(test.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="steps-section">
        <h2>Test Steps</h2>
        <div className="steps-list">
          {test.steps?.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <div className="step-action">{step.action.toUpperCase()}</div>
                {step.selector && (
                  <div className="step-detail">
                    <span className="step-label">Selector:</span>
                    <code>{step.selector}</code>
                  </div>
                )}
                {step.value !== null && step.value !== undefined && (
                  <div className="step-detail">
                    <span className="step-label">Value:</span>
                    <code>{String(step.value)}</code>
                  </div>
                )}
                {step.url && (
                  <div className="step-detail">
                    <span className="step-label">URL:</span>
                    <code className="step-url">{step.url}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="script-generator">
        <h2>Generate Test Script</h2>
        <div className="generator-controls">
          <select 
            value={selectedFramework} 
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="framework-select"
          >
            <option value="playwright">Playwright (JavaScript)</option>
            <option value="selenium">Selenium (Python)</option>
            <option value="cypress">Cypress (JavaScript)</option>
          </select>
          <button onClick={handleGenerateScript} className="btn btn-secondary">
            Generate Script
          </button>
        </div>

        {generatedScript && (
          <div className="script-output">
            <div className="script-header">
              <span>Generated {selectedFramework} Script</span>
              <button onClick={copyToClipboard} className="btn-copy">
                📋 Copy
              </button>
            </div>
            <pre><code>{generatedScript}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestDetail;
