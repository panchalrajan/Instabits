// InstaBits - Background Service Worker

// Open dashboard on extension install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time install - open dashboard
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard/index.html')
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('InstaBits updated to version', chrome.runtime.getManifest().version);
  }
});

// Open dashboard when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('dashboard/index.html')
  });
});
