"""
Static analysis and code quality checks for the automation test tool.
Validates code structure, documentation, and best practices.
"""

import os
import ast
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def analyze_python_file(filepath):
    """Analyze a Python file for structure and quality."""
    print(f"\nAnalyzing {os.path.basename(filepath)}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    try:
        tree = ast.parse(content)
    except SyntaxError as e:
        print(f"  ✗ Syntax error: {e}")
        return False
    
    # Count elements
    classes = [node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
    functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
    imports = [node for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))]
    
    print(f"  ✓ Valid Python syntax")
    print(f"  - Classes: {len(classes)}")
    print(f"  - Functions: {len(functions)}")
    print(f"  - Imports: {len(imports)}")
    
    # Check for docstrings
    has_module_docstring = ast.get_docstring(tree) is not None
    if has_module_docstring:
        print(f"  ✓ Has module docstring")
    
    for cls in classes:
        has_cls_docstring = ast.get_docstring(cls) is not None
        if has_cls_docstring:
            print(f"  ✓ Class '{cls.name}' has docstring")
    
    return True


def check_file_structure():
    """Check that all required files exist."""
    print("Checking file structure...")
    
    required_files = [
        'app.py',
        'recorder.py',
        'executor.py',
        'config.py',
        'requirements.txt',
        'README.md',
        '.gitignore',
        'templates/index.html'
    ]
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    all_exist = True
    for file in required_files:
        filepath = os.path.join(base_dir, file)
        if os.path.exists(filepath):
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} missing")
            all_exist = False
    
    return all_exist


def check_documentation():
    """Check that README is comprehensive."""
    print("\nChecking documentation...")
    
    readme_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'README.md')
    
    with open(readme_path, 'r') as f:
        content = f.read()
    
    required_sections = [
        'Features',
        'Installation',
        'Usage',
        'API',
        'Example'
    ]
    
    all_present = True
    for section in required_sections:
        if section.lower() in content.lower():
            print(f"  ✓ {section} section present")
        else:
            print(f"  ✗ {section} section missing")
            all_present = False
    
    return all_present


def check_requirements():
    """Check that requirements.txt has necessary dependencies."""
    print("\nChecking requirements...")
    
    req_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'requirements.txt')
    
    with open(req_path, 'r') as f:
        content = f.read()
    
    required_deps = ['flask', 'selenium', 'werkzeug']
    
    all_present = True
    for dep in required_deps:
        if dep.lower() in content.lower():
            print(f"  ✓ {dep}")
        else:
            print(f"  ✗ {dep} missing")
            all_present = False
    
    return all_present


def check_gitignore():
    """Check that .gitignore has essential entries."""
    print("\nChecking .gitignore...")
    
    gitignore_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.gitignore')
    
    with open(gitignore_path, 'r') as f:
        content = f.read()
    
    important_entries = ['__pycache__', 'venv', ('*.pyc', '*.py[cod]')]
    
    all_present = True
    for entry in important_entries:
        if isinstance(entry, tuple):
            # Check if any of the patterns match
            if any(pattern in content for pattern in entry):
                print(f"  ✓ {entry[0]} (or equivalent)")
            else:
                print(f"  ✗ {entry[0]} missing")
                all_present = False
        else:
            if entry in content:
                print(f"  ✓ {entry}")
            else:
                print(f"  ✗ {entry} missing")
                all_present = False
    
    return all_present


def check_web_ui():
    """Check that web UI has essential components."""
    print("\nChecking web UI...")
    
    template_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), 
        'templates', 
        'index.html'
    )
    
    with open(template_path, 'r') as f:
        content = f.read()
    
    essential_components = [
        'Record Test',
        'Test Cases',
        'Execute Tests',
        'Test Results',
        'startRecording',
        'stopRecording',
        'executeTest'
    ]
    
    all_present = True
    for component in essential_components:
        if component in content:
            print(f"  ✓ {component}")
        else:
            print(f"  ✗ {component} missing")
            all_present = False
    
    return all_present


def run_code_quality_checks():
    """Run all code quality checks."""
    print("=" * 70)
    print("Automation Test Tool - Code Quality Checks")
    print("=" * 70)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    results = []
    
    # Check file structure
    results.append(('File Structure', check_file_structure()))
    
    # Analyze Python files
    python_files = ['app.py', 'recorder.py', 'executor.py', 'config.py', 'example.py']
    for pyfile in python_files:
        filepath = os.path.join(base_dir, pyfile)
        if os.path.exists(filepath):
            results.append((pyfile, analyze_python_file(filepath)))
    
    # Check other aspects
    results.append(('Documentation', check_documentation()))
    results.append(('Requirements', check_requirements()))
    results.append(('.gitignore', check_gitignore()))
    results.append(('Web UI', check_web_ui()))
    
    print("\n" + "=" * 70)
    print("Summary")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} checks passed")
    print("=" * 70)
    
    return passed == total


if __name__ == "__main__":
    success = run_code_quality_checks()
    sys.exit(0 if success else 1)
