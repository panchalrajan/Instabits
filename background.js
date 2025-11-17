// InstaBits - Background Service Worker

// Open dashboard on extension install
chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === 'install') {
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard/view/index.html')
      });
    }
  } catch (error) {
    console.error('Error in onInstalled listener:', error);
  }
});

// Open dashboard when extension icon is clicked
chrome.action.onClicked.addListener(async () => {
  try {
    const dashboardUrl = chrome.runtime.getURL('dashboard/view/index.html');
    const extensionId = chrome.runtime.id;

    // Query for extension tabs using wildcard pattern
    const allTabs = await chrome.tabs.query({});

    // Manually filter for dashboard tabs since query might not work with chrome-extension:// URLs
    const dashboardTab = allTabs.find(tab => {
      return tab.url && tab.url.includes(`chrome-extension://${extensionId}/dashboard/view/index.html`);
    });

    if (dashboardTab) {
      // Focus the existing dashboard tab
      await chrome.tabs.update(dashboardTab.id, { active: true });
      await chrome.windows.update(dashboardTab.windowId, { focused: true });
    } else {
      // Create new dashboard tab
      await chrome.tabs.create({ url: dashboardUrl });
    }
  } catch (error) {
    console.error('Error in onClicked listener:', error);
  }
});
