// Popup script for Chrome extension
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const exportBtn = document.getElementById('exportBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const testNameInput = document.getElementById('testName');
const recordingStatus = document.getElementById('recordingStatus');
const stepCount = document.getElementById('stepCount');
const recordingIndicator = document.getElementById('recordingIndicator');

let isRecording = false;

// Update UI status
function updateStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_STATUS' }, (response) => {
        if (response) {
          isRecording = response.isRecording;
          stepCount.textContent = response.stepCount || 0;
          
          if (isRecording) {
            recordingStatus.innerHTML = '<span class="recording-indicator"></span>Recording';
            startBtn.disabled = true;
            stopBtn.disabled = false;
            exportBtn.disabled = true;
            testNameInput.disabled = true;
          } else {
            recordingStatus.innerHTML = 'Idle';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            exportBtn.disabled = response.stepCount === 0;
            testNameInput.disabled = false;
          }
        }
      });
    }
  });
}

// Start recording
startBtn.addEventListener('click', () => {
  const testName = testNameInput.value.trim() || 'Untitled Test';
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // Send to content script
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'START_RECORDING',
        testName: testName
      }, (response) => {
        if (response && response.success) {
          // Also notify background script
          chrome.runtime.sendMessage({
            type: 'START_RECORDING',
            testName: testName
          });
          
          updateStatus();
        }
      });
    }
  });
});

// Stop recording
stopBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_RECORDING' }, (response) => {
        if (response && response.success) {
          // Notify background script
          chrome.runtime.sendMessage({
            type: 'STOP_RECORDING'
          }, (bgResponse) => {
            if (bgResponse && bgResponse.success) {
              alert(`Recording saved! Captured ${response.steps.length} steps.`);
              updateStatus();
            }
          });
        }
      });
    }
  });
});

// Export recording
exportBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'EXPORT_RECORDING' }, (response) => {
    if (response && response.success) {
      const testName = testNameInput.value.trim() || 'test';
      const dataStr = JSON.stringify({
        name: testName,
        steps: response.steps,
        timestamp: Date.now()
      }, null, 2);
      
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      chrome.downloads.download({
        url: dataUri,
        filename: `${testName.replace(/\s+/g, '_')}.json`,
        saveAs: true
      });
    }
  });
});

// Open dashboard
dashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});

// Update status on popup open
updateStatus();
setInterval(updateStatus, 1000);
