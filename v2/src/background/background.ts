/**
 * Background Service Worker
 * Handles extension lifecycle and tab management
 */

const DASHBOARD_URL = chrome.runtime.getURL('dashboard.html');

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[InstaBits] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Open dashboard on first install
    chrome.tabs.create({ url: DASHBOARD_URL });
  }
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener(async () => {
  try {
    // Check if dashboard is already open
    const tabs = await chrome.tabs.query({ url: DASHBOARD_URL });

    if (tabs.length > 0 && tabs[0].id) {
      // Focus existing dashboard tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      await chrome.windows.update(tabs[0].windowId!, { focused: true });
    } else {
      // Open new dashboard tab
      await chrome.tabs.create({ url: DASHBOARD_URL });
    }
  } catch (error) {
    console.error('[InstaBits] Error opening dashboard:', error);
  }
});

/**
 * Handle messages from content scripts and dashboard
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[InstaBits] Message received:', message.type, sender);

  // Handle different message types
  switch (message.type) {
    case 'GET_VERSION':
      sendResponse({ version: '2.0.0' });
      break;

    case 'PING':
      sendResponse({ pong: true });
      break;

    default:
      console.warn('[InstaBits] Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }

  return true; // Keep channel open for async response
});

console.log('[InstaBits] Background service worker initialized');
