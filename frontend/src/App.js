import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TestList from './pages/TestList';
import TestDetail from './pages/TestDetail';
import CreateTest from './pages/CreateTest';
import ExecutionResults from './pages/ExecutionResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              <span className="nav-icon">🎬</span>
              <span className="nav-title">AutoTestFlow</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Tests</Link>
              <Link to="/create" className="nav-link">Create Test</Link>
              <Link to="/results" className="nav-link">Results</Link>
            </div>
          </div>
        </nav>
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<TestList />} />
            <Route path="/create" element={<CreateTest />} />
            <Route path="/test/:id" element={<TestDetail />} />
            <Route path="/results" element={<ExecutionResults />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
