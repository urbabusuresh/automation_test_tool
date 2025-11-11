"""Action recorder for capturing user interactions with web applications."""

import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import config


class ActionRecorder:
    """Records user actions on a web application."""
    
    def __init__(self, browser_type='chrome'):
        """Initialize the action recorder."""
        self.browser_type = browser_type
        self.driver = None
        self.actions = []
        self.test_name = None
        self.start_url = None
        self.recording = False
        
    def start_recording(self, start_url, test_name):
        """Start recording user actions."""
        self.test_name = test_name
        self.start_url = start_url
        self.actions = []
        self.recording = True
        
        # Initialize WebDriver
        if self.browser_type == 'chrome':
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            self.driver = webdriver.Chrome(options=options)
        else:
            raise ValueError(f"Browser type {self.browser_type} not supported")
            
        self.driver.get(start_url)
        
        # Record initial navigation
        self.actions.append({
            'type': 'navigate',
            'url': start_url,
            'timestamp': datetime.now().isoformat()
        })
        
        return True
        
    def record_click(self, selector, selector_type='css'):
        """Record a click action."""
        if not self.recording:
            return False
            
        try:
            if selector_type == 'css':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
            elif selector_type == 'xpath':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.element_to_be_clickable((By.XPATH, selector))
                )
            elif selector_type == 'id':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.element_to_be_clickable((By.ID, selector))
                )
            else:
                return False
                
            element.click()
            
            self.actions.append({
                'type': 'click',
                'selector': selector,
                'selector_type': selector_type,
                'timestamp': datetime.now().isoformat()
            })
            
            return True
        except TimeoutException:
            return False
            
    def record_input(self, selector, value, selector_type='css'):
        """Record an input action."""
        if not self.recording:
            return False
            
        try:
            if selector_type == 'css':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
            elif selector_type == 'xpath':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.XPATH, selector))
                )
            elif selector_type == 'id':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.ID, selector))
                )
            else:
                return False
                
            element.clear()
            element.send_keys(value)
            
            self.actions.append({
                'type': 'input',
                'selector': selector,
                'selector_type': selector_type,
                'value': value,
                'timestamp': datetime.now().isoformat()
            })
            
            return True
        except TimeoutException:
            return False
            
    def record_wait(self, seconds):
        """Record a wait action."""
        if not self.recording:
            return False
            
        time.sleep(seconds)
        
        self.actions.append({
            'type': 'wait',
            'seconds': seconds,
            'timestamp': datetime.now().isoformat()
        })
        
        return True
        
    def record_assertion(self, assertion_type, selector, expected_value=None, selector_type='css'):
        """Record an assertion."""
        if not self.recording:
            return False
            
        try:
            if selector_type == 'css':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
            elif selector_type == 'xpath':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.XPATH, selector))
                )
            elif selector_type == 'id':
                element = WebDriverWait(self.driver, config.SELENIUM_TIMEOUT).until(
                    EC.presence_of_element_located((By.ID, selector))
                )
            else:
                return False
                
            actual_value = None
            if assertion_type == 'text':
                actual_value = element.text
            elif assertion_type == 'value':
                actual_value = element.get_attribute('value')
            elif assertion_type == 'visible':
                actual_value = element.is_displayed()
                
            self.actions.append({
                'type': 'assertion',
                'assertion_type': assertion_type,
                'selector': selector,
                'selector_type': selector_type,
                'expected_value': expected_value,
                'actual_value': actual_value,
                'timestamp': datetime.now().isoformat()
            })
            
            return True
        except TimeoutException:
            return False
            
    def stop_recording(self):
        """Stop recording and save test case."""
        if not self.recording:
            return None
            
        self.recording = False
        
        test_case = {
            'name': self.test_name,
            'start_url': self.start_url,
            'actions': self.actions,
            'created_at': datetime.now().isoformat()
        }
        
        # Save test case to file
        filename = f"{self.test_name.replace(' ', '_')}_{int(time.time())}.json"
        filepath = f"{config.TEST_CASES_DIR}/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump(test_case, f, indent=2)
            
        if self.driver:
            self.driver.quit()
            self.driver = None
            
        return filepath
        
    def get_current_url(self):
        """Get the current URL."""
        if self.driver:
            return self.driver.current_url
        return None
        
    def get_page_title(self):
        """Get the current page title."""
        if self.driver:
            return self.driver.title
        return None
