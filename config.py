"""Configuration settings for the automation test tool."""

import os

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directories for storing test data
TEST_CASES_DIR = os.path.join(BASE_DIR, 'test_cases')
TEST_RESULTS_DIR = os.path.join(BASE_DIR, 'test_results')

# Flask app configuration
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 5000
DEBUG_MODE = True

# Selenium configuration
SELENIUM_TIMEOUT = 10
BROWSER_TYPE = 'chrome'  # chrome, firefox, edge

# Recording configuration
RECORD_SCREENSHOTS = True
SCREENSHOT_DIR = os.path.join(BASE_DIR, 'screenshots')

# Create necessary directories
for directory in [TEST_CASES_DIR, TEST_RESULTS_DIR, SCREENSHOT_DIR]:
    os.makedirs(directory, exist_ok=True)
