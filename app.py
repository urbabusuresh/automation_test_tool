"""Flask web application for the automation test tool."""

import os
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from recorder import ActionRecorder
from executor import TestExecutor
import config

app = Flask(__name__)

# Global recorder instance
recorder = None


@app.route('/')
def index():
    """Main page."""
    return render_template('index.html')


@app.route('/api/start-recording', methods=['POST'])
def start_recording():
    """Start recording a new test case."""
    global recorder
    
    data = request.json
    test_name = data.get('test_name')
    start_url = data.get('start_url')
    
    if not test_name or not start_url:
        return jsonify({'error': 'test_name and start_url are required'}), 400
        
    try:
        recorder = ActionRecorder(browser_type=config.BROWSER_TYPE)
        success = recorder.start_recording(start_url, test_name)
        
        if success:
            return jsonify({
                'status': 'recording',
                'message': 'Recording started successfully',
                'test_name': test_name,
                'start_url': start_url
            })
        else:
            return jsonify({'error': 'Failed to start recording'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/record-action', methods=['POST'])
def record_action():
    """Record an action."""
    global recorder
    
    if not recorder or not recorder.recording:
        return jsonify({'error': 'Not currently recording'}), 400
        
    data = request.json
    action_type = data.get('action_type')
    
    try:
        if action_type == 'click':
            success = recorder.record_click(
                data.get('selector'),
                data.get('selector_type', 'css')
            )
        elif action_type == 'input':
            success = recorder.record_input(
                data.get('selector'),
                data.get('value'),
                data.get('selector_type', 'css')
            )
        elif action_type == 'wait':
            success = recorder.record_wait(data.get('seconds', 1))
        elif action_type == 'assertion':
            success = recorder.record_assertion(
                data.get('assertion_type'),
                data.get('selector'),
                data.get('expected_value'),
                data.get('selector_type', 'css')
            )
        else:
            return jsonify({'error': f'Unknown action type: {action_type}'}), 400
            
        if success:
            return jsonify({
                'status': 'success',
                'message': f'Action {action_type} recorded',
                'current_url': recorder.get_current_url()
            })
        else:
            return jsonify({'error': 'Failed to record action'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stop-recording', methods=['POST'])
def stop_recording():
    """Stop recording and save test case."""
    global recorder
    
    if not recorder or not recorder.recording:
        return jsonify({'error': 'Not currently recording'}), 400
        
    try:
        filepath = recorder.stop_recording()
        
        if filepath:
            return jsonify({
                'status': 'success',
                'message': 'Recording stopped and test case saved',
                'filepath': filepath
            })
        else:
            return jsonify({'error': 'Failed to save test case'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test-cases', methods=['GET'])
def list_test_cases():
    """List all test cases."""
    try:
        test_cases = []
        
        if os.path.exists(config.TEST_CASES_DIR):
            for filename in os.listdir(config.TEST_CASES_DIR):
                if filename.endswith('.json'):
                    filepath = os.path.join(config.TEST_CASES_DIR, filename)
                    with open(filepath, 'r') as f:
                        test_case = json.load(f)
                        test_cases.append({
                            'filename': filename,
                            'filepath': filepath,
                            'name': test_case.get('name'),
                            'start_url': test_case.get('start_url'),
                            'actions_count': len(test_case.get('actions', [])),
                            'created_at': test_case.get('created_at')
                        })
                        
        return jsonify({'test_cases': test_cases})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test-case/<path:filename>', methods=['GET'])
def get_test_case(filename):
    """Get a specific test case."""
    try:
        filepath = os.path.join(config.TEST_CASES_DIR, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Test case not found'}), 404
            
        with open(filepath, 'r') as f:
            test_case = json.load(f)
            
        return jsonify({'test_case': test_case})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/execute-test', methods=['POST'])
def execute_test():
    """Execute a test case."""
    data = request.json
    test_case_path = data.get('test_case_path')
    
    if not test_case_path:
        return jsonify({'error': 'test_case_path is required'}), 400
        
    if not os.path.exists(test_case_path):
        return jsonify({'error': 'Test case not found'}), 404
        
    try:
        executor = TestExecutor(browser_type=config.BROWSER_TYPE)
        result = executor.execute_test_case(test_case_path)
        
        return jsonify({'result': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/execute-suite', methods=['POST'])
def execute_suite():
    """Execute multiple test cases as a suite."""
    data = request.json
    test_case_paths = data.get('test_case_paths', [])
    
    if not test_case_paths:
        return jsonify({'error': 'test_case_paths is required'}), 400
        
    try:
        executor = TestExecutor(browser_type=config.BROWSER_TYPE)
        result = executor.execute_test_suite(test_case_paths)
        
        return jsonify({'result': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test-results', methods=['GET'])
def list_test_results():
    """List all test results."""
    try:
        test_results = []
        
        if os.path.exists(config.TEST_RESULTS_DIR):
            for filename in os.listdir(config.TEST_RESULTS_DIR):
                if filename.endswith('.json'):
                    filepath = os.path.join(config.TEST_RESULTS_DIR, filename)
                    with open(filepath, 'r') as f:
                        result = json.load(f)
                        test_results.append({
                            'filename': filename,
                            'filepath': filepath,
                            'test_name': result.get('test_name'),
                            'status': result.get('status'),
                            'duration_seconds': result.get('duration_seconds'),
                            'start_time': result.get('start_time')
                        })
                        
        # Sort by start_time, newest first
        test_results.sort(key=lambda x: x.get('start_time', ''), reverse=True)
        
        return jsonify({'test_results': test_results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test-result/<path:filename>', methods=['GET'])
def get_test_result(filename):
    """Get a specific test result."""
    try:
        filepath = os.path.join(config.TEST_RESULTS_DIR, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'Test result not found'}), 404
            
        with open(filepath, 'r') as f:
            result = json.load(f)
            
        return jsonify({'result': result})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host=config.FLASK_HOST, port=config.FLASK_PORT, debug=config.DEBUG_MODE)
