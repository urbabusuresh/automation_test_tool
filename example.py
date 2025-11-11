"""
Example script demonstrating how to use the automation test tool programmatically.
This shows how to record and execute tests without the web UI.
"""

from recorder import ActionRecorder
from executor import TestExecutor
import time


def example_recording():
    """Example: Record a test case programmatically."""
    print("=== Example: Recording a Test Case ===\n")
    
    # Create a recorder
    recorder = ActionRecorder(browser_type='chrome')
    
    # Start recording
    print("Starting recording...")
    recorder.start_recording(
        start_url="https://example.com",
        test_name="Example Test"
    )
    
    # Record some actions (these would fail with example.com, but show the API)
    print("Recording actions...")
    
    # Note: These actions will likely fail with example.com as it's just a demo page
    # In real usage, you'd use actual selectors from your application
    
    # Example: Click action
    # recorder.record_click("#button-id", selector_type="id")
    
    # Example: Input action
    # recorder.record_input("#username", "testuser", selector_type="id")
    
    # Example: Wait action
    recorder.record_wait(2)
    
    # Example: Assertion
    # recorder.record_assertion("text", "h1", "Example Domain", selector_type="css")
    
    # Stop recording and save
    print("Stopping recording...")
    filepath = recorder.stop_recording()
    
    print(f"✓ Test case saved to: {filepath}\n")
    return filepath


def example_execution(test_case_path):
    """Example: Execute a test case programmatically."""
    print("=== Example: Executing a Test Case ===\n")
    
    # Create an executor
    executor = TestExecutor(browser_type='chrome')
    
    # Execute the test case
    print("Executing test case...")
    result = executor.execute_test_case(test_case_path)
    
    # Print results
    print(f"\nTest Name: {result['test_name']}")
    print(f"Status: {result['status'].upper()}")
    print(f"Duration: {result['duration_seconds']} seconds")
    print(f"Actions Executed: {len(result['actions_executed'])}")
    
    print("\nAction Results:")
    for i, action_result in enumerate(result['actions_executed'], 1):
        status = "✓" if action_result['success'] else "✗"
        print(f"  {status} Action {i}: {action_result['message']}")
    
    print()


def example_suite_execution(test_case_paths):
    """Example: Execute multiple test cases as a suite."""
    print("=== Example: Executing a Test Suite ===\n")
    
    # Create an executor
    executor = TestExecutor(browser_type='chrome')
    
    # Execute the suite
    print("Executing test suite...")
    result = executor.execute_test_suite(test_case_paths)
    
    # Print results
    print(f"\nSuite Name: {result['suite_name']}")
    print(f"Total Tests: {result['total_tests']}")
    print(f"Passed: {result['passed']}")
    print(f"Failed: {result['failed']}")
    print(f"Errors: {result['errors']}")
    print(f"Duration: {result['duration_seconds']} seconds")
    
    print()


if __name__ == "__main__":
    print("Automation Test Tool - Example Usage\n")
    print("=" * 50)
    print()
    
    # Example 1: Record a test case
    try:
        test_case_path = example_recording()
        
        # Example 2: Execute the recorded test case
        if test_case_path:
            time.sleep(1)  # Brief pause
            example_execution(test_case_path)
            
            # Example 3: Execute as a suite (with just one test)
            time.sleep(1)  # Brief pause
            example_suite_execution([test_case_path])
            
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: Make sure Chrome and ChromeDriver are installed.")
        print("Run: sudo apt-get install -y chromium-chromedriver")
    
    print("=" * 50)
    print("\nFor a better experience, use the web UI:")
    print("  python app.py")
    print("  Then open http://localhost:5000 in your browser")
