const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const TEST_DIR = path.join(__dirname, '../../data/tests');
const RESULTS_DIR = path.join(__dirname, '../../data/results');
const SCREENSHOTS_DIR = path.join(__dirname, '../../data/screenshots');

class TestExecutor {
  async executeTest(testId, executionId, options = {}) {
    const { headless = true } = options;
    
    const result = {
      executionId,
      testId,
      startTime: new Date().toISOString(),
      status: 'running',
      steps: [],
      screenshots: []
    };
    
    let browser;
    let page;
    
    try {
      // Load test
      const testPath = path.join(TEST_DIR, `${testId}.json`);
      if (!await fs.pathExists(testPath)) {
        throw new Error('Test not found');
      }
      
      const test = await fs.readJson(testPath);
      result.testName = test.name;
      
      // Launch browser
      browser = await chromium.launch({ headless });
      const context = await browser.newContext();
      page = await context.newPage();
      
      // Execute each step
      for (let i = 0; i < test.steps.length; i++) {
        const step = test.steps[i];
        const stepResult = {
          index: i,
          action: step.action,
          selector: step.selector,
          status: 'pending',
          startTime: new Date().toISOString()
        };
        
        try {
          await this.executeStep(page, step);
          stepResult.status = 'passed';
          
          // Take screenshot
          const screenshotPath = `${executionId}_step_${i}.png`;
          await page.screenshot({ 
            path: path.join(SCREENSHOTS_DIR, screenshotPath),
            fullPage: false
          });
          stepResult.screenshot = screenshotPath;
          result.screenshots.push(screenshotPath);
          
        } catch (error) {
          stepResult.status = 'failed';
          stepResult.error = error.message;
          result.status = 'failed';
        }
        
        stepResult.endTime = new Date().toISOString();
        result.steps.push(stepResult);
        
        // Stop on first failure
        if (stepResult.status === 'failed') {
          break;
        }
      }
      
      // Set overall status
      if (result.status !== 'failed') {
        result.status = 'passed';
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
    } finally {
      if (browser) {
        await browser.close();
      }
      
      result.endTime = new Date().toISOString();
      result.duration = new Date(result.endTime) - new Date(result.startTime);
      
      // Save result
      await fs.writeJson(
        path.join(RESULTS_DIR, `${executionId}.json`),
        result,
        { spaces: 2 }
      );
    }
    
    return result;
  }

  async executeStep(page, step) {
    const { action, selector, value, url } = step;
    
    switch (action) {
      case 'navigate':
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        break;
        
      case 'click':
        await page.click(selector, { timeout: 10000 });
        await page.waitForTimeout(500); // Small delay for UI updates
        break;
        
      case 'type':
        await page.fill(selector, value, { timeout: 10000 });
        break;
        
      case 'select':
        await page.selectOption(selector, value, { timeout: 10000 });
        break;
        
      case 'check':
        if (value) {
          await page.check(selector, { timeout: 10000 });
        } else {
          await page.uncheck(selector, { timeout: 10000 });
        }
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = new TestExecutor();
