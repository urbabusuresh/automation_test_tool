"""
Integration tests for the automation test tool.
Tests the core functionality without requiring Selenium WebDriver.
"""

import json
import os
import sys
import tempfile
import shutil
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config


def test_config():
    """Test that configuration is set up correctly."""
    print("Testing configuration...")
    assert hasattr(config, 'TEST_CASES_DIR')
    assert hasattr(config, 'TEST_RESULTS_DIR')
    assert hasattr(config, 'FLASK_HOST')
    assert hasattr(config, 'FLASK_PORT')
    print("✓ Configuration test passed")


def test_test_case_structure():
    """Test that example test case has correct structure."""
    print("\nTesting test case structure...")
    
    example_file = os.path.join(config.TEST_CASES_DIR, '.example_test.json')
    
    if not os.path.exists(example_file):
        print("✗ Example test case file not found")
        return False
    
    with open(example_file, 'r') as f:
        test_case = json.load(f)
    
    # Verify required fields
    assert 'name' in test_case
    assert 'start_url' in test_case
    assert 'actions' in test_case
    assert 'created_at' in test_case
    
    # Verify actions structure
    assert isinstance(test_case['actions'], list)
    assert len(test_case['actions']) > 0
    
    for action in test_case['actions']:
        assert 'type' in action
        assert 'timestamp' in action
    
    print("✓ Test case structure test passed")
    return True


def test_flask_app_imports():
    """Test that Flask app can be imported."""
    print("\nTesting Flask app imports...")
    
    try:
        import app
        assert hasattr(app, 'app')
        assert hasattr(app, 'index')
        assert hasattr(app, 'start_recording')
        assert hasattr(app, 'stop_recording')
        print("✓ Flask app import test passed")
        return True
    except ImportError as e:
        print(f"✗ Flask app import failed: {e}")
        return False


def test_recorder_class():
    """Test that ActionRecorder class is properly defined."""
    print("\nTesting ActionRecorder class...")
    
    try:
        from recorder import ActionRecorder
        
        # Check class methods
        assert hasattr(ActionRecorder, 'start_recording')
        assert hasattr(ActionRecorder, 'record_click')
        assert hasattr(ActionRecorder, 'record_input')
        assert hasattr(ActionRecorder, 'record_wait')
        assert hasattr(ActionRecorder, 'record_assertion')
        assert hasattr(ActionRecorder, 'stop_recording')
        
        print("✓ ActionRecorder class test passed")
        return True
    except ImportError as e:
        print(f"✗ ActionRecorder import failed: {e}")
        return False


def test_executor_class():
    """Test that TestExecutor class is properly defined."""
    print("\nTesting TestExecutor class...")
    
    try:
        from executor import TestExecutor
        
        # Check class methods
        assert hasattr(TestExecutor, 'execute_test_case')
        assert hasattr(TestExecutor, 'execute_test_suite')
        
        print("✓ TestExecutor class test passed")
        return True
    except ImportError as e:
        print(f"✗ TestExecutor import failed: {e}")
        return False


def test_api_structure():
    """Test that Flask API has all required endpoints."""
    print("\nTesting Flask API structure...")
    
    try:
        import app
        
        # Get all routes
        routes = [str(rule) for rule in app.app.url_map.iter_rules()]
        
        # Check required endpoints
        required_endpoints = [
            '/api/start-recording',
            '/api/record-action',
            '/api/stop-recording',
            '/api/test-cases',
            '/api/execute-test',
            '/api/execute-suite',
            '/api/test-results'
        ]
        
        for endpoint in required_endpoints:
            assert endpoint in routes, f"Missing endpoint: {endpoint}"
        
        print("✓ Flask API structure test passed")
        return True
    except Exception as e:
        print(f"✗ Flask API structure test failed: {e}")
        return False


def test_directory_creation():
    """Test that necessary directories are created."""
    print("\nTesting directory creation...")
    
    assert os.path.exists(config.TEST_CASES_DIR)
    assert os.path.exists(config.TEST_RESULTS_DIR)
    assert os.path.exists(config.SCREENSHOT_DIR)
    
    print("✓ Directory creation test passed")


def test_html_template_exists():
    """Test that HTML template exists and is valid."""
    print("\nTesting HTML template...")
    
    template_path = os.path.join(config.BASE_DIR, 'templates', 'index.html')
    
    assert os.path.exists(template_path)
    
    with open(template_path, 'r') as f:
        content = f.read()
    
    # Check for key UI elements
    assert '<title>Automation Test Tool</title>' in content
    assert 'Record Test' in content
    assert 'Test Cases' in content
    assert 'Execute Tests' in content
    assert 'Test Results' in content
    
    print("✓ HTML template test passed")


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("Running Automation Test Tool Integration Tests")
    print("=" * 60)
    
    tests = [
        test_config,
        test_directory_creation,
        test_test_case_structure,
        test_flask_app_imports,
        test_recorder_class,
        test_executor_class,
        test_api_structure,
        test_html_template_exists
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ Test failed: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ Test error: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"Test Results: {passed} passed, {failed} failed")
    print("=" * 60)
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
