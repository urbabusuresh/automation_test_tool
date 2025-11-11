import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService, executionService } from '../services/api';
import './TestList.css';

function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await testService.getAllTests();
      if (response.success) {
        setTests(response.tests);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load tests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await testService.deleteTest(id);
        loadTests();
      } catch (err) {
        alert('Failed to delete test: ' + err.message);
      }
    }
  };

  const handleRun = async (id) => {
    try {
      const response = await executionService.runTest(id, { headless: true });
      if (response.success) {
        alert(`Test execution started! Execution ID: ${response.executionId}`);
      }
    } catch (err) {
      alert('Failed to run test: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading tests...</div>
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
        <h1>Test Cases</h1>
        <Link to="/create" className="btn btn-primary">
          ➕ Create New Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No tests yet</h2>
          <p>Create your first test case using the Chrome extension or manually</p>
          <Link to="/create" className="btn btn-primary">
            Create Test
          </Link>
        </div>
      ) : (
        <div className="test-grid">
          {tests.map((test) => (
            <div key={test.id} className="test-card">
              <div className="test-card-header">
                <h3>{test.name}</h3>
                <span className="test-badge">{test.steps?.length || 0} steps</span>
              </div>
              
              {test.description && (
                <p className="test-description">{test.description}</p>
              )}
              
              <div className="test-meta">
                <span>Created: {new Date(test.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="test-actions">
                <Link to={`/test/${test.id}`} className="btn btn-secondary">
                  View
                </Link>
                <button 
                  onClick={() => handleRun(test.id)} 
                  className="btn btn-success"
                >
                  ▶ Run
                </button>
                <button 
                  onClick={() => handleDelete(test.id)} 
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestList;
