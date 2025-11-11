"""Test executor for running recorded test cases."""

import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import config


class TestExecutor:
    """Executes recorded test cases and generates results."""
    
    def __init__(self, browser_type='chrome'):
        """Initialize the test executor."""
        self.browser_type = browser_type
        self.driver = None
        self.results = []
        
    def execute_test_case(self, test_case_path):
        """Execute a single test case and return results."""
        # Load test case
        with open(test_case_path, 'r') as f:
            test_case = json.load(f)
            
        test_result = {
            'test_name': test_case['name'],
            'test_case_path': test_case_path,
            'start_time': datetime.now().isoformat(),
            'actions_executed': [],
            'status': 'running'
        }
        
        try:
            # Initialize WebDriver
            if self.browser_type == 'chrome':
                options = webdriver.ChromeOptions()
                options.add_argument('--headless')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                self.driver = webdriver.Chrome(options=options)
            else:
                raise ValueError(f"Browser type {self.browser_type} not supported")
                
            # Execute actions
            for action in test_case['actions']:
                action_result = self._execute_action(action)
                test_result['actions_executed'].append(action_result)
                
                if not action_result['success']:
                    test_result['status'] = 'failed'
                    break
                    
            if test_result['status'] == 'running':
                test_result['status'] = 'passed'
                
        except Exception as e:
            test_result['status'] = 'error'
            test_result['error'] = str(e)
            
        finally:
            if self.driver:
                self.driver.quit()
                self.driver = None
                
        test_result['end_time'] = datetime.now().isoformat()
        
        # Calculate duration
        start = datetime.fromisoformat(test_result['start_time'])
        end = datetime.fromisoformat(test_result['end_time'])
        test_result['duration_seconds'] = (end - start).total_seconds()
        
        # Save result
        self._save_result(test_result)
        
        return test_result
        
    def _execute_action(self, action):
        """Execute a single action."""
        action_result = {
            'action': action,
            'success': False,
            'message': '',
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            action_type = action['type']
            
            if action_type == 'navigate':
                self.driver.get(action['url'])
                action_result['success'] = True
                action_result['message'] = f"Navigated to {action['url']}"
                
            elif action_type == 'click':
                element = self._find_element(action['selector'], action['selector_type'])
                element.click()
                action_result['success'] = True
                action_result['message'] = f"Clicked element: {action['selector']}"
                
            elif action_type == 'input':
                element = self._find_element(action['selector'], action['selector_type'])
                element.clear()
                element.send_keys(action['value'])
                action_result['success'] = True
                action_result['message'] = f"Input '{action['value']}' into {action['selector']}"
                
            elif action_type == 'wait':
                time.sleep(action['seconds'])
                action_result['success'] = True
                action_result['message'] = f"Waited for {action['seconds']} seconds"
                
            elif action_type == 'assertion':
                element = self._find_element(action['selector'], action['selector_type'])
                
                if action['assertion_type'] == 'text':
                    actual_value = element.text
                elif action['assertion_type'] == 'value':
                    actual_value = element.get_attribute('value')
                elif action['assertion_type'] == 'visible':
                    actual_value = element.is_displayed()
                else:
                    actual_value = None
                    
                expected_value = action.get('expected_value')
                
                if expected_value is None or actual_value == expected_value:
                    action_result['success'] = True
                    action_result['message'] = f"Assertion passed: {action['assertion_type']}"
                else:
                    action_result['success'] = False
                    action_result['message'] = f"Assertion failed: expected '{expected_value}', got '{actual_value}'"
                    
            else:
                action_result['message'] = f"Unknown action type: {action_type}"
                
        except TimeoutException:
            action_result['message'] = f"Timeout waiting for element: {action.get('selector', 'N/A')}"
        except NoSuchElementException:
            action_result['message'] = f"Element not found: {action.get('selector', 'N/A')}"
        except Exception as e:
            action_result['message'] = f"Error: {str(e)}"
            
        return action_result
        
    def _find_element(self, selector, selector_type):
        """Find an element using the specified selector."""
        if selector_type == 'css':
            return WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
            )
        elif selector_type == 'xpath':
            return WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                EC.presence_of_element_located((By.XPATH, selector))
            )
        elif selector_type == 'id':
            return WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                EC.presence_of_element_located((By.ID, selector))
            )
        else:
            raise ValueError(f"Unknown selector type: {selector_type}")
            
    def _save_result(self, test_result):
        """Save test result to file."""
        filename = f"{test_result['test_name'].replace(' ', '_')}_{int(time.time())}.json"
        filepath = f"{config.TEST_RESULTS_DIR}/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump(test_result, f, indent=2)
            
    def execute_test_suite(self, test_case_paths):
        """Execute multiple test cases as a suite."""
        suite_result = {
            'suite_name': 'Test Suite',
            'start_time': datetime.now().isoformat(),
            'test_results': [],
            'total_tests': len(test_case_paths),
            'passed': 0,
            'failed': 0,
            'errors': 0
        }
        
        for test_case_path in test_case_paths:
            result = self.execute_test_case(test_case_path)
            suite_result['test_results'].append(result)
            
            if result['status'] == 'passed':
                suite_result['passed'] += 1
            elif result['status'] == 'failed':
                suite_result['failed'] += 1
            elif result['status'] == 'error':
                suite_result['errors'] += 1
                
        suite_result['end_time'] = datetime.now().isoformat()
        
        # Calculate duration
        start = datetime.fromisoformat(suite_result['start_time'])
        end = datetime.fromisoformat(suite_result['end_time'])
        suite_result['duration_seconds'] = (end - start).total_seconds()
        
        return suite_result
