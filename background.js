let originalTab = null;
let isTimerActive = false;
const delay = 0; //miliseconds
let intervalInSeconds;
let countdownInterval = null;
let notifyBeforeSwitchChecked;
let timeRemaining;  // Track time remaining for badge countdown

// Set original tab and save to storage
function setOriginalTab(tabId, windowId) {
  originalTab = { tabId, windowId };
  chrome.storage.local.set({ originalTab });
}

// Start the recurring return timer
function startReturnTimer() {
  isTimerActive = true;

  // Load interval and notify settings from storage
  chrome.storage.sync.get(['defaultInterval', 'Notify'], (items) => {
    intervalInSeconds = items.defaultInterval || 5;
    notifyBeforeSwitchChecked = items.Notify || false;
    timeRemaining = intervalInSeconds;  // Initialize countdown

    // Listen for tab activations to set the original tab if not already set
    chrome.tabs.onActivated.addListener((activeInfo) => {
      if (!originalTab) {
        setOriginalTab(activeInfo.tabId, activeInfo.windowId);
      }
    });

    // Start the countdown and badge update
    startBadgeCountdown();

    // Create the alarm with specified interval
    chrome.alarms.create('returnToTab', { periodInMinutes: intervalInSeconds / 60 });
  });
}

// Start the countdown timer on badge and update continuously
function startBadgeCountdown() {
  // Clear any previous interval to avoid multiple intervals
  if (countdownInterval) clearInterval(countdownInterval);

  // Display the countdown immediately
  updateBadgeText(timeRemaining);

  // Update badge text every second
  countdownInterval = setInterval(() => {
    timeRemaining--;

    if (timeRemaining > 0) {
      updateBadgeText(timeRemaining);
    } else {
      clearInterval(countdownInterval);  // Stop the countdown
    }
  }, 1000);  // Update every second
}

// Helper function to update the badge text
function updateBadgeText(seconds) {
  chrome.action.setBadgeText({ text: seconds.toString() });
}

// Stop the timer and clear data
function stopReturnTimer() {
  isTimerActive = false;
  chrome.action.setBadgeText({ text: '' });
  chrome.alarms.clearAll();
  chrome.storage.local.remove('originalTab');
  originalTab = null;

  // Clear the countdown interval if active
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// Handle the alarm to return to the original tab
chrome.alarms.onAlarm.addListener(() => {
  if (originalTab && isTimerActive) {
    if (notifyBeforeSwitchChecked) {
      // Notify user before switching tabs
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Returning to your original tab',
        message: 'Switching back to the saved tab in 5 seconds!',
        requireInteraction: false
      });
    }

    // Return to the saved tab after a delay
    setTimeout(() => {
      chrome.windows.update(originalTab.windowId, { focused: true });
      chrome.tabs.update(originalTab.tabId, { active: true });
    }, delay);

    // Reset the countdown when the timer resets
    timeRemaining = intervalInSeconds;
    startBadgeCountdown();
  }
});

// Reset interval dynamically if needed
chrome.runtime.onMessage.addListener((request) => {
  if (request.command === "startTimer") {
    intervalInSeconds = request.interval;
    startReturnTimer();
  } else if (request.command === "stopTimer") {
    stopReturnTimer();
  }
});
