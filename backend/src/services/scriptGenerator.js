const fs = require('fs-extra');
const path = require('path');

class ScriptGenerator {
  generate(test, framework = 'playwright') {
    switch (framework.toLowerCase()) {
      case 'playwright':
        return this.generatePlaywright(test);
      case 'selenium':
        return this.generateSelenium(test);
      case 'cypress':
        return this.generateCypress(test);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  generatePlaywright(test) {
    const { name, steps } = test;
    
    let script = `import { test, expect } from '@playwright/test';\n\n`;
    script += `test('${name}', async ({ page }) => {\n`;
    
    for (const step of steps) {
      script += this.generatePlaywrightStep(step);
    }
    
    script += `});\n`;
    
    return script;
  }

  generatePlaywrightStep(step) {
    const { action, selector, value, url } = step;
    let code = '';
    
    switch (action) {
      case 'navigate':
        code = `  await page.goto('${url}');\n`;
        break;
      case 'click':
        code = `  await page.click('${selector}');\n`;
        break;
      case 'type':
        code = `  await page.fill('${selector}', '${value}');\n`;
        break;
      case 'select':
        code = `  await page.selectOption('${selector}', '${value}');\n`;
        break;
      case 'check':
        if (value) {
          code = `  await page.check('${selector}');\n`;
        } else {
          code = `  await page.uncheck('${selector}');\n`;
        }
        break;
      default:
        code = `  // Unknown action: ${action}\n`;
    }
    
    return code;
  }

  generateSelenium(test) {
    const { name, steps } = test;
    
    let script = `from selenium import webdriver\n`;
    script += `from selenium.webdriver.common.by import By\n`;
    script += `from selenium.webdriver.support.ui import WebDriverWait\n`;
    script += `from selenium.webdriver.support import expected_conditions as EC\n\n`;
    script += `def test_${name.toLowerCase().replace(/\s+/g, '_')}():\n`;
    script += `    driver = webdriver.Chrome()\n`;
    script += `    try:\n`;
    
    for (const step of steps) {
      script += this.generateSeleniumStep(step);
    }
    
    script += `    finally:\n`;
    script += `        driver.quit()\n`;
    
    return script;
  }

  generateSeleniumStep(step) {
    const { action, selector, value, url } = step;
    let code = '';
    const indent = '        ';
    
    // Convert CSS selector to Selenium locator
    const locator = this.convertToSeleniumLocator(selector);
    
    switch (action) {
      case 'navigate':
        code = `${indent}driver.get('${url}')\n`;
        break;
      case 'click':
        code = `${indent}driver.find_element(${locator}).click()\n`;
        break;
      case 'type':
        code = `${indent}driver.find_element(${locator}).send_keys('${value}')\n`;
        break;
      case 'select':
        code = `${indent}Select(driver.find_element(${locator})).select_by_value('${value}')\n`;
        break;
      default:
        code = `${indent}# Unknown action: ${action}\n`;
    }
    
    return code;
  }

  convertToSeleniumLocator(selector) {
    if (selector.startsWith('#')) {
      return `By.ID, '${selector.substring(1)}'`;
    } else if (selector.startsWith('[name=')) {
      const name = selector.match(/\[name="(.+?)"\]/)?.[1];
      return `By.NAME, '${name}'`;
    } else if (selector.startsWith('//')) {
      return `By.XPATH, '${selector}'`;
    } else {
      return `By.CSS_SELECTOR, '${selector}'`;
    }
  }

  generateCypress(test) {
    const { name, steps } = test;
    
    let script = `describe('${name}', () => {\n`;
    script += `  it('should execute test steps', () => {\n`;
    
    for (const step of steps) {
      script += this.generateCypressStep(step);
    }
    
    script += `  });\n`;
    script += `});\n`;
    
    return script;
  }

  generateCypressStep(step) {
    const { action, selector, value, url } = step;
    let code = '';
    const indent = '    ';
    
    switch (action) {
      case 'navigate':
        code = `${indent}cy.visit('${url}');\n`;
        break;
      case 'click':
        code = `${indent}cy.get('${selector}').click();\n`;
        break;
      case 'type':
        code = `${indent}cy.get('${selector}').type('${value}');\n`;
        break;
      case 'select':
        code = `${indent}cy.get('${selector}').select('${value}');\n`;
        break;
      case 'check':
        if (value) {
          code = `${indent}cy.get('${selector}').check();\n`;
        } else {
          code = `${indent}cy.get('${selector}').uncheck();\n`;
        }
        break;
      default:
        code = `${indent}// Unknown action: ${action}\n`;
    }
    
    return code;
  }
}

module.exports = new ScriptGenerator();
