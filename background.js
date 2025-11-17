// InstaBits - Background Service Worker

// Track active resources for cleanup
const activeResources = new Set();

// Error logging utility
function logError(context, error) {
  console.error(`[InstaBits] Error in ${context}:`, error);
}

// Open dashboard on extension install
chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === 'install') {
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard/view/index.html')
      }).catch(error => {
        logError('onInstalled - tab creation', error);
      });
    }
  } catch (error) {
    logError('onInstalled listener', error);
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
    logError('onClicked listener', error);
  }
});

// Cleanup handler for service worker termination
self.addEventListener('unload', () => {
  try {
    // Clean up any active resources
    activeResources.forEach(resource => {
      try {
        if (resource && typeof resource.close === 'function') {
          resource.close();
        } else if (resource && typeof resource.disconnect === 'function') {
          resource.disconnect();
        }
      } catch (error) {
        logError('resource cleanup', error);
      }
    });
    activeResources.clear();
  } catch (error) {
    logError('unload cleanup', error);
  }
});
