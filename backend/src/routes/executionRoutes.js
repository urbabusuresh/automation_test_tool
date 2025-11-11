const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const testExecutor = require('../services/testExecutor');

const RESULTS_DIR = path.join(__dirname, '../../data/results');

// Get all execution results
router.get('/', async (req, res) => {
  try {
    await fs.ensureDir(RESULTS_DIR);
    const files = await fs.readdir(RESULTS_DIR);
    const results = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readJson(path.join(RESULTS_DIR, file));
        results.push(content);
      }
    }
    
    // Sort by execution time, most recent first
    results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single execution result
router.get('/:id', async (req, res) => {
  try {
    const resultPath = path.join(RESULTS_DIR, `${req.params.id}.json`);
    
    if (!await fs.pathExists(resultPath)) {
      return res.status(404).json({ success: false, error: 'Result not found' });
    }
    
    const result = await fs.readJson(resultPath);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute a test
router.post('/run/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const { headless = true } = req.body;
    
    const executionId = uuidv4();
    
    // Start execution asynchronously
    testExecutor.executeTest(testId, executionId, { headless })
      .catch(error => {
        console.error('Test execution error:', error);
      });
    
    res.json({ 
      success: true, 
      executionId,
      message: 'Test execution started' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get execution status
router.get('/status/:executionId', async (req, res) => {
  try {
    const resultPath = path.join(RESULTS_DIR, `${req.params.executionId}.json`);
    
    if (!await fs.pathExists(resultPath)) {
      return res.json({ 
        success: true, 
        status: 'running',
        message: 'Execution in progress' 
      });
    }
    
    const result = await fs.readJson(resultPath);
    res.json({ success: true, status: 'completed', result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
