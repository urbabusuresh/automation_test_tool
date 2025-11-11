#!/bin/bash

# Automation Test Tool - Run Script

echo "=================================="
echo "Automation Test Tool"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Create necessary directories
echo "Setting up directories..."
mkdir -p test_cases test_results screenshots

# Check if ChromeDriver is installed
if ! command -v chromedriver &> /dev/null; then
    echo ""
    echo "Warning: ChromeDriver not found!"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install -y chromium-chromedriver"
    echo "  macOS: brew install chromedriver"
    echo ""
fi

# Start the application
echo ""
echo "Starting Automation Test Tool..."
echo "Open http://localhost:5000 in your browser"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python app.py
