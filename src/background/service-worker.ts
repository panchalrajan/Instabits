/**
 * Background Service Worker for InstaBits
 * Handles extension lifecycle, dashboard management, and message routing
 */

import { EXTENSION_INFO } from '@/core/utils/constants';

// Open dashboard on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[InstaBits] Extension installed, opening dashboard...');
    chrome.tabs.create({ url: EXTENSION_INFO.DASHBOARD_URL });
  } else if (details.reason === 'update') {
    console.log('[InstaBits] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Open or focus dashboard on icon click
chrome.action.onClicked.addListener(async () => {
  const dashboardUrl = EXTENSION_INFO.DASHBOARD_URL;

  // Check if dashboard is already open
  const tabs = await chrome.tabs.query({ url: dashboardUrl });

  if (tabs.length > 0 && tabs[0].id) {
    // Dashboard exists, focus it
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId!, { focused: true });
    console.log('[InstaBits] Focused existing dashboard tab');
  } else {
    // Open new dashboard tab
    await chrome.tabs.create({ url: dashboardUrl });
    console.log('[InstaBits] Opened new dashboard tab');
  }
});

// Handle messages (if needed)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[InstaBits] Background received message:', message.type);

  // Handle specific message types here if needed
  // For now, just acknowledge
  sendResponse({ success: true });

  return false;
});

console.log('[InstaBits] Service worker initialized');
