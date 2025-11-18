# InstaBits V2 - User Guide

## 🚀 Quick Start

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `/home/user/Instabits/v2/dist` folder
5. The extension icon should appear in your toolbar

### 2. Using the Extension

#### On Instagram:
1. Visit any Instagram page with videos (feed, reels, etc.)
2. Video controls will automatically appear on videos:
   - **Fullscreen button** (top-left of video)
   - **Playback speed dropdown** (0.25x - 3x)
   - **Volume slider** (0-100%)

#### Settings Dashboard:
1. Click the InstaBits extension icon in toolbar
2. Toggle features on/off
3. Changes take effect immediately (reload Instagram if needed)

## ✨ Available Features

### Currently Implemented (3 features):

1. **Fullscreen** ✅
   - Quick fullscreen button overlayed on videos
   - Click to enter/exit fullscreen mode

2. **Playback Speed** ✅
   - Dropdown menu with speed options (0.25x to 3x)
   - Persistent speed control for all videos

3. **Volume Control** ✅
   - Visual volume slider (0-100%)
   - Real-time volume adjustment
   - Syncs with native video controls

### Coming Soon:
- Video Seekbar
- Duration Display
- Picture-in-Picture
- Background Play
- Zen Mode
- Auto Scroll

## 🔧 Development Mode

The extension is currently running in **development mode** with:
- Live reload on code changes
- Source maps for debugging
- Verbose logging in console

To see logs:
1. Right-click on Instagram page → Inspect
2. Open Console tab
3. Look for `[InstaBits]` logs

## 🐛 Troubleshooting

### Features not appearing?
1. Check that you're on `https://instagram.com` or `https://www.instagram.com`
2. Refresh the page (Ctrl+R / Cmd+R)
3. Check browser console for errors
4. Verify extension is enabled in `chrome://extensions/`

### Dashboard empty?
1. Make sure you clicked "Load unpacked" on the `dist` folder (not `v2` folder)
2. Check that all files are present in `dist/`:
   - background.js
   - content.js
   - core.js
   - services.js
   - dashboard.js
   - dashboard.html
   - manifest.json

### Features not working?
1. Open the dashboard and check if features are enabled (green toggle)
2. Try toggling the feature off and on again
3. Reload the Instagram page
4. Check console for JavaScript errors

### Build issues?
If you made code changes and they're not reflected:
```bash
cd /home/user/Instabits/v2
npm run dev  # Development build with watch
# OR
npm run build  # Production build
```

## 📊 Performance

V2 Bundle sizes (development mode):
- `background.js`: ~7 KB
- `services.js`: ~99 KB (shared)
- `core.js`: ~56 KB
- `content.js`: ~135 KB
- `dashboard.js`: ~48 KB

Total: ~345 KB (development mode)
Production mode will be 60-70% smaller with minification.

## 🎯 How It Works

1. **Content Script** (`content.js`) runs on Instagram pages
2. **VideoObserver** detects video elements using MutationObserver
3. **Features** process each video and add controls
4. **Dashboard** allows you to enable/disable features
5. **Storage** syncs settings across tabs

## 📝 Adding New Features

See `ARCHITECTURE.md` for developer documentation on how to add features.

Each feature:
1. Extends `BaseFeature` class
2. Implements `onProcessVideo()` method
3. Gets registered in `content.ts`
4. Added to dashboard feature list

## 💡 Tips

- All features are **enabled by default** on first install
- Settings are **synced** across all Instagram tabs
- Features are **isolated** - if one fails, others continue working
- Console shows detailed logs for debugging

## 🆘 Support

If you encounter issues:
1. Check console logs for errors
2. Try disabling/re-enabling features
3. Reload the extension
4. Check that you're using latest Chrome version

---

**Enjoy enhanced Instagram video controls!** 🎥
