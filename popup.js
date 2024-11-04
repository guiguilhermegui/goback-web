// popup.js

// Retrieve the default interval from storage and set it as the initial value of #timer
chrome.storage.sync.get(['defaultInterval'], (items) => {
  // Set the #timer value to defaultInterval if available; otherwise, use 5 seconds as a fallback
  document.getElementById('timer').value = items.defaultInterval || 5;
});

// Start timer button handler
document.getElementById('startTimerBtn').addEventListener('click', () => {
  const interval = parseInt(document.getElementById('timer').value, 10);
  if (!isNaN(interval) && interval >= 2) {
    chrome.runtime.sendMessage({ command: "startTimer", interval });
    window.close();
  } else {
    alert("Please enter a valid number (minimum 2 seconds).");
  }
});

// Stop timer button handler
document.getElementById('stopTimerBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ command: "stopTimer" });
  window.close();
});

