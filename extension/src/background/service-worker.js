// Background service worker for Chrome extension
let currentRecording = null;
let allSteps = [];

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STEP_RECORDED') {
    allSteps.push(message.step);
    
    // Update badge with step count
    chrome.action.setBadgeText({ text: String(allSteps.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    
    sendResponse({ success: true });
  } else if (message.type === 'START_RECORDING') {
    allSteps = [];
    currentRecording = {
      testName: message.testName || 'Untitled Test',
      startTime: Date.now(),
      steps: []
    };
    
    // Update badge
    chrome.action.setBadgeText({ text: 'REC' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    
    sendResponse({ success: true });
  } else if (message.type === 'STOP_RECORDING') {
    if (currentRecording) {
      currentRecording.steps = allSteps;
      currentRecording.endTime = Date.now();
      
      // Save to storage
      saveRecording(currentRecording);
      
      // Clear badge
      chrome.action.setBadgeText({ text: '' });
      
      sendResponse({ success: true, recording: currentRecording });
      currentRecording = null;
    } else {
      sendResponse({ success: false, error: 'No active recording' });
    }
  } else if (message.type === 'GET_RECORDINGS') {
    getRecordings().then(recordings => {
      sendResponse({ success: true, recordings: recordings });
    });
    return true; // Keep channel open for async response
  } else if (message.type === 'EXPORT_RECORDING') {
    sendResponse({ success: true, steps: allSteps });
  }
  
  return true;
});

// Save recording to Chrome storage
async function saveRecording(recording) {
  try {
    const result = await chrome.storage.local.get(['recordings']);
    const recordings = result.recordings || [];
    
    recordings.push({
      id: generateId(),
      ...recording
    });
    
    await chrome.storage.local.set({ recordings: recordings });
    console.log('Recording saved successfully');
  } catch (error) {
    console.error('Error saving recording:', error);
  }
}

// Get all recordings from storage
async function getRecordings() {
  try {
    const result = await chrome.storage.local.get(['recordings']);
    return result.recordings || [];
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

console.log('AutoTestFlow background service worker initialized');
