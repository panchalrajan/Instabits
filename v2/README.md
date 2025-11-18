# InstaBits V2 - Modern Chrome Extension

Complete rewrite of InstaBits using modern technologies and best practices.

## Overview

InstaBits V2 is a Chrome extension that enhances Instagram with video controls and automation features. This version features a complete architectural overhaul with:

- **TypeScript** for type safety
- **Webpack** for bundling and optimization
- **SOLID Principles** for maintainable code
- **Dependency Injection** for testability
- **Service-oriented architecture**

## Features

### Video Controls
- ⚡ **Playback Speed**: Control video speed (0.25x - 3x)
- 🔊 **Volume Control**: Independent volume slider
- 🖥️ **Fullscreen**: Quick fullscreen button

### Coming Soon
- 📊 **Video Seekbar**: Interactive progress bar
- ⏱️ **Duration Display**: Show current time and total duration
- 🎬 **Picture-in-Picture**: Watch while browsing
- 🎧 **Background Play**: Continue playback when tab is hidden
- 🧘 **Zen Mode**: Hide UI overlays
- 🔄 **Auto Scroll**: Automatically scroll to next reel

## Architecture

### Core Services
- **Logger**: Structured logging with levels
- **ErrorHandler**: Centralized error handling
- **StorageService**: Chrome storage with caching
- **MessageService**: Inter-context communication
- **VideoObserver**: Efficient video detection
- **DOMUtils**: Common DOM operations
- **EventBus**: Event-driven communication

### Base Classes
- **BaseFeature**: Abstract base for all features
- **ServiceContainer**: Dependency injection container
- **FeatureManager**: Feature lifecycle management

### Design Patterns
- Singleton (services)
- Factory (feature creation)
- Observer (video detection, events)
- Dependency Injection (services into features)
- Template Method (BaseFeature lifecycle)

## Development

### Prerequisites
```bash
Node.js >= 18.0.0
npm or yarn
```

### Installation
```bash
cd v2
npm install
```

### Build Commands
```bash
# Development build with watch mode
npm run dev

# Production build (minified)
npm run build

# Type checking
npm run type-check

# Clean build directory
npm run clean
```

### Project Structure
```
v2/
├── src/
│   ├── types/              # TypeScript interfaces
│   ├── core/               # Core abstractions
│   ├── services/           # Core services
│   ├── features/           # Feature implementations
│   ├── ui/                 # UI components
│   ├── utils/              # Utilities
│   ├── content/            # Content script
│   ├── background/         # Background script
│   └── dashboard/          # Settings dashboard
├── public/                 # Static assets
├── dist/                   # Build output
└── ARCHITECTURE.md         # Architecture documentation
```

## Loading the Extension

### Development
1. Run `npm run dev` to start development build
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `v2/dist` directory

### Production
1. Run `npm run build` to create production build
2. Load `v2/dist` directory as unpacked extension

## Bundle Size Comparison

**V1 (Old):**
- 30+ JavaScript files
- 8+ CSS files
- ~1,101 lines of code
- No minification

**V2 (New):**
- 3 main bundles (content, background, dashboard)
- Shared vendor bundle
- Minified and optimized
- **Estimated 60-70% size reduction**

## SOLID Principles

### Single Responsibility
Each class has one clear purpose (e.g., Logger only logs, StorageService only handles storage)

### Open/Closed
Features extend BaseFeature without modifying core code

### Liskov Substitution
All features can be treated as IFeature

### Interface Segregation
Small, focused interfaces (ILogger, IStorage, etc.)

### Dependency Inversion
Features depend on abstractions (interfaces), not concrete implementations

## Error Handling

- All async operations wrapped in try-catch
- Centralized ErrorHandler service
- Graceful degradation (failed features don't break others)
- Comprehensive logging
- User feedback via toast notifications

## Performance Optimizations

- Code splitting (separate bundles)
- Debouncing/throttling event handlers
- WeakMap/WeakSet for automatic garbage collection
- MutationObserver (efficient DOM detection)
- Storage caching with TTL
- Lazy feature initialization

## Contributing

When adding new features:

1. Create feature class extending `BaseFeature`
2. Implement `onProcessVideo()` method
3. Add factory function
4. Register in `content.ts`
5. Add to dashboard feature list

Example:
```typescript
export class MyFeature extends BaseFeature {
  protected onProcessVideo(video: HTMLVideoElement, state: VideoFeatureState): void {
    // Your implementation
  }
}

export function createMyFeature(deps: FeatureDependencies) {
  return new MyFeature(config, deps);
}
```

## Testing (Future)

- Unit tests for services
- Integration tests for features
- E2E tests for critical flows
- Mock Chrome APIs

## License

Same as parent project

## Author

Rajan Panchal
