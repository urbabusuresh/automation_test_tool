// popup.js - UI handlers for start/stop/export/create-testcase
document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const exportBtn = document.getElementById('exportBtn');
  const createTcBtn = document.getElementById('createTcBtn');
  const stepsContainer = document.getElementById('recordingSteps');

  startBtn.addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: 'start-record' }, (resp) => {
      if (resp && resp.status === 'started') {
        updateRecordingState(true);
      } else {
        console.warn('start-record response', resp);
        updateRecordingState(true);
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'stop-record' }, (resp) => {
      updateRecordingState(false);
      refreshPreview();
    });
  });

  exportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'get-recording', name: document.getElementById('testName').value || 'My Test' }, (resp) => {
      if (!resp || resp.status !== 'ok') {
        alert('No recording found');
        return;
      }
      const data = resp.recording;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(data.name || 'recording').replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });

  createTcBtn.addEventListener('click', () => {
    const name = document.getElementById('testName').value || 'My Test';
    chrome.runtime.sendMessage({ type: 'get-recording', name }, (getResp) => {
      if (!getResp || getResp.status !== 'ok') {
        alert('No recording to convert');
        return;
      }
      chrome.runtime.sendMessage({ type: 'create-testcase', name }, (resp) => {
        if (resp && resp.status === 'ok' && resp.playwrightCode) {
          const blob = new Blob([resp.playwrightCode], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name.replace(/\s+/g,'_')}.spec.js`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          alert('Failed to create testcase');
        }
      });
    });
  });

  function updateRecordingState(isRecording) {
    startBtn.disabled = isRecording;
    stopBtn.disabled = !isRecording;
    exportBtn.disabled = isRecording;
    createTcBtn.disabled = isRecording;
    document.getElementById('status').textContent = isRecording ? 'Recording...' : 'Idle';
  }

  function refreshPreview() {
    chrome.runtime.sendMessage({ type: 'get-recording', name: document.getElementById('testName').value || 'My Test' }, (resp) => {
      if (!resp || resp.status !== 'ok') {
        stepsContainer.innerHTML = '<div class="empty">No recording yet. Start recording to capture steps.</div>';
        return;
      }
      const steps = resp.recording.steps || [];
      if (!steps.length) {
        stepsContainer.innerHTML = '<div class="empty">No recording yet. Start recording to capture steps.</div>';
        return;
      }
      stepsContainer.innerHTML = '';
      steps.forEach((s) => {
        const el = document.createElement('div');
        el.className = 'step';
        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        if (s.screenshot) {
          const img = document.createElement('img');
          img.src = s.screenshot;
          thumb.appendChild(img);
        } else {
          thumb.textContent = s.action;
        }
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `<strong>${s.action}</strong> ${s.selector || ''} <div class="muted">${new Date(s.timestamp).toLocaleTimeString()}</div>`;
        el.appendChild(thumb);
        el.appendChild(meta);
        stepsContainer.appendChild(el);
      });
    });
  }

  // init
  updateRecordingState(false);
  refreshPreview();
});
