const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const scriptGenerator = require('../services/scriptGenerator');

const TEST_DIR = path.join(__dirname, '../../data/tests');

// Get all test cases
router.get('/', async (req, res) => {
  try {
    await fs.ensureDir(TEST_DIR);
    const files = await fs.readdir(TEST_DIR);
    const tests = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readJson(path.join(TEST_DIR, file));
        tests.push(content);
      }
    }
    
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single test case
router.get('/:id', async (req, res) => {
  try {
    const testPath = path.join(TEST_DIR, `${req.params.id}.json`);
    
    if (!await fs.pathExists(testPath)) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    const test = await fs.readJson(testPath);
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new test case
router.post('/', async (req, res) => {
  try {
    const { name, steps, description } = req.body;
    
    if (!name || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid test data. Name and steps array required.' 
      });
    }
    
    const testId = uuidv4();
    const test = {
      id: testId,
      name,
      description: description || '',
      steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJson(path.join(TEST_DIR, `${testId}.json`), test, { spaces: 2 });
    
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update test case
router.put('/:id', async (req, res) => {
  try {
    const testPath = path.join(TEST_DIR, `${req.params.id}.json`);
    
    if (!await fs.pathExists(testPath)) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    const existingTest = await fs.readJson(testPath);
    const updatedTest = {
      ...existingTest,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeJson(testPath, updatedTest, { spaces: 2 });
    
    res.json({ success: true, test: updatedTest });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete test case
router.delete('/:id', async (req, res) => {
  try {
    const testPath = path.join(TEST_DIR, `${req.params.id}.json`);
    
    if (!await fs.pathExists(testPath)) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    await fs.remove(testPath);
    
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate script from test
router.post('/:id/generate', async (req, res) => {
  try {
    const { framework } = req.body;
    const testPath = path.join(TEST_DIR, `${req.params.id}.json`);
    
    if (!await fs.pathExists(testPath)) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    const test = await fs.readJson(testPath);
    const script = scriptGenerator.generate(test, framework || 'playwright');
    
    res.json({ success: true, script });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
