import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executionService } from '../services/api';
import './ExecutionResults.css';

function ExecutionResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await executionService.getAllResults();
      if (response.success) {
        setResults(response.results);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (executionId) => {
    try {
      const response = await executionService.getResult(executionId);
      if (response.success) {
        setSelectedResult(response.result);
      }
    } catch (err) {
      alert('Failed to load result details: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'running': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return '✓';
      case 'failed': return '✗';
      case 'running': return '⟳';
      default: return '○';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Execution Results</h1>
        <button onClick={loadResults} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No test executions yet</h2>
          <p>Run a test to see execution results here</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go to Tests
          </button>
        </div>
      ) : (
        <div className="results-layout">
          <div className="results-list">
            {results.map((result) => (
              <div
                key={result.executionId}
                className={`result-item ${selectedResult?.executionId === result.executionId ? 'selected' : ''}`}
                onClick={() => handleViewDetails(result.executionId)}
              >
                <div className="result-header">
                  <span className="result-status" style={{ color: getStatusColor(result.status) }}>
                    {getStatusIcon(result.status)} {result.status?.toUpperCase()}
                  </span>
                  <span className="result-time">
                    {new Date(result.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="result-name">{result.testName || 'Unnamed Test'}</div>
                <div className="result-meta">
                  <span>{result.steps?.length || 0} steps</span>
                  {result.duration && <span>• {Math.round(result.duration / 1000)}s</span>}
                </div>
              </div>
            ))}
          </div>

          {selectedResult && (
            <div className="result-details">
              <div className="details-header">
                <h2>{selectedResult.testName || 'Test Execution'}</h2>
                <span className="status-badge" style={{ 
                  background: getStatusColor(selectedResult.status),
                  color: 'white'
                }}>
                  {selectedResult.status?.toUpperCase()}
                </span>
              </div>

              <div className="details-info">
                <div className="info-row">
                  <span className="info-label">Execution ID:</span>
                  <span className="info-value">{selectedResult.executionId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Started:</span>
                  <span className="info-value">
                    {new Date(selectedResult.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">
                    {selectedResult.duration ? `${Math.round(selectedResult.duration / 1000)}s` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="steps-results">
                <h3>Step Results</h3>
                {selectedResult.steps?.map((step, index) => (
                  <div key={index} className={`step-result ${step.status}`}>
                    <div className="step-result-header">
                      <span className="step-index">Step {step.index + 1}</span>
                      <span className="step-status" style={{ color: getStatusColor(step.status) }}>
                        {getStatusIcon(step.status)} {step.status}
                      </span>
                    </div>
                    <div className="step-result-action">{step.action}</div>
                    {step.selector && <div className="step-result-detail">Selector: <code>{step.selector}</code></div>}
                    {step.error && (
                      <div className="step-result-error">
                        <strong>Error:</strong> {step.error}
                      </div>
                    )}
                    {step.screenshot && (
                      <div className="step-screenshot">
                        📷 Screenshot captured
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExecutionResults;
