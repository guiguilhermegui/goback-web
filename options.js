// Load saved options
chrome.storage.sync.get(['defaultInterval', 'Notify'], (items) => {
  document.getElementById('defaultInterval').value = items.defaultInterval || 5;
  document.getElementById('Notify').checked = items.Notify || false;
});

// Save options to storage
document.getElementById('saveOptions').addEventListener('click', () => {
  const defaultInterval = parseInt(document.getElementById('defaultInterval').value, 10);
  const Notify = document.getElementById('Notify').checked;

  chrome.storage.sync.set({
    defaultInterval: isNaN(defaultInterval) ? 5 : defaultInterval,
    Notify
  }, () => {
    alert('Options saved');
  });
});
