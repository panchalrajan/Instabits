# InstaBits V2 - Modern Architecture

## Overview
InstaBits V2 is a complete rewrite using modern technologies, best practices, and SOLID principles.

## Technology Stack
- **TypeScript**: Type safety and better developer experience
- **Webpack**: Module bundling and code splitting
- **Manifest V3**: Latest Chrome extension standard
- **CSS Modules**: Scoped styling

## Architecture Principles

### SOLID Principles
- **S**ingle Responsibility: Each class has one clear purpose
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes can replace base types
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### Design Patterns
- **Dependency Injection**: Services injected into features
- **Observer Pattern**: Event-driven architecture
- **Singleton Pattern**: Single instances of core services
- **Factory Pattern**: Feature creation and registration
- **Strategy Pattern**: Pluggable feature implementations

## Project Structure

```
v2/
├── src/
│   ├── types/              # TypeScript interfaces and types
│   │   ├── index.ts        # Main type exports
│   │   ├── feature.types.ts
│   │   ├── service.types.ts
│   │   └── config.types.ts
│   │
│   ├── core/               # Core abstractions
│   │   ├── BaseFeature.ts  # Abstract base for all features
│   │   ├── BaseService.ts  # Abstract base for services
│   │   ├── FeatureManager.ts
│   │   ├── ServiceContainer.ts # DI Container
│   │   └── EventBus.ts     # Event-driven communication
│   │
│   ├── services/           # Core services (business logic)
│   │   ├── storage/
│   │   │   ├── StorageService.ts
│   │   │   └── CacheService.ts
│   │   ├── messaging/
│   │   │   └── MessageService.ts
│   │   ├── logging/
│   │   │   ├── Logger.ts
│   │   │   └── LogLevel.ts
│   │   ├── error/
│   │   │   └── ErrorHandler.ts
│   │   └── dom/
│   │       ├── VideoObserver.ts
│   │       ├── DOMUtils.ts
│   │       └── MutationManager.ts
│   │
│   ├── features/           # Feature implementations
│   │   ├── video/
│   │   │   ├── PlaybackSpeedFeature.ts
│   │   │   ├── VolumeControlFeature.ts
│   │   │   ├── SeekbarFeature.ts
│   │   │   ├── DurationDisplayFeature.ts
│   │   │   ├── PiPModeFeature.ts
│   │   │   ├── BackgroundPlayFeature.ts
│   │   │   ├── ZenModeFeature.ts
│   │   │   └── FullscreenFeature.ts
│   │   └── automation/
│   │       └── AutoScrollFeature.ts
│   │
│   ├── ui/                 # UI components
│   │   ├── components/
│   │   │   ├── Button.ts
│   │   │   ├── Slider.ts
│   │   │   ├── Dropdown.ts
│   │   │   └── Seekbar.ts
│   │   ├── controls/
│   │   │   └── VideoControlsManager.ts
│   │   └── styles/
│   │       └── *.css
│   │
│   ├── utils/              # Utility functions
│   │   ├── debounce.ts
│   │   ├── throttle.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── content/            # Content script entry
│   │   └── content.ts
│   │
│   ├── background/         # Background service worker
│   │   └── background.ts
│   │
│   └── dashboard/          # Settings dashboard
│       ├── dashboard.ts
│       ├── components/
│       └── styles/
│
├── public/                 # Static assets
│   ├── manifest.json
│   ├── dashboard.html
│   └── icons/
│
├── dist/                   # Build output
├── package.json
├── tsconfig.json
├── webpack.config.js
└── ARCHITECTURE.md
```

## Data Flow

```
Extension Load
    ↓
Background Service Worker Initializes
    ↓
Content Script Injected
    ↓
ServiceContainer.initialize()
  - LoggerService
  - ErrorHandler
  - StorageService
  - MessageService
  - VideoObserver
  - DOMUtils
    ↓
FeatureManager.initialize()
  - Registers all features
  - Injects dependencies
  - Enables based on storage
    ↓
VideoObserver detects video elements
    ↓
EventBus emits 'video:detected'
    ↓
Features subscribe and process videos
    ↓
UI components render controls
    ↓
User interactions → Events → Feature handlers
```

## Service Container (Dependency Injection)

All services are registered in the ServiceContainer:
```typescript
container.register('logger', LoggerService);
container.register('storage', StorageService);
container.register('errorHandler', ErrorHandler);
```

Features receive dependencies through constructor:
```typescript
class PlaybackSpeedFeature extends BaseFeature {
  constructor(
    logger: ILogger,
    storage: IStorage,
    errorHandler: IErrorHandler
  ) {
    super(logger, storage, errorHandler);
  }
}
```

## Error Handling Strategy

1. **Try-Catch Blocks**: All async operations wrapped
2. **Error Boundaries**: Features isolated from each other
3. **Graceful Degradation**: Failed features don't break others
4. **Logging**: All errors logged with context
5. **User Feedback**: Toast notifications for critical errors

## Performance Optimizations

1. **Code Splitting**: Separate bundles for content/background/dashboard
2. **Lazy Loading**: Features loaded on-demand
3. **Debouncing/Throttling**: Rate-limited event handlers
4. **WeakMap/WeakSet**: Automatic garbage collection
5. **MutationObserver**: Efficient DOM change detection
6. **Caching**: Storage reads cached with TTL

## Bundle Size Reduction

**Before (V1):**
- 30+ JavaScript files
- 8+ CSS files
- ~1,101 lines of code
- No minification
- No tree-shaking

**After (V2):**
- 3 main bundles (content, background, dashboard)
- 1-2 vendor bundles (shared code)
- Minified and optimized
- Tree-shaking removes unused code
- Estimated 60-70% size reduction

## Testing Strategy (Future)

- Unit tests for services
- Integration tests for features
- E2E tests for critical flows
- Mock Chrome APIs
- Test coverage reports

## Security Considerations

- CSP compliance
- XSS prevention (sanitized inputs)
- No eval() or unsafe code
- Minimal permissions
- Secure storage patterns
