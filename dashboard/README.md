# InstaBits Dashboard - Component System

This dashboard uses a reusable component system where all UI elements are generated from JavaScript, making it easy to add, modify, or remove features without touching HTML.

## File Structure

```
dashboard/
├── index.html          # Main HTML (minimal, just containers)
├── styles.css          # All styling
├── components.js       # Reusable UI component library
├── features-data.js    # Feature configuration data
├── app.js              # Main dashboard logic
└── README.md          # This file
```

## How to Add a New Feature

### 1. Add Feature Data (features-data.js)

Simply add a new object to the `FEATURES_DATA` array:

```javascript
{
    id: 'myNewFeature',              // Unique ID for localStorage
    name: 'My New Feature',           // Display name
    searchName: 'my new feature',     // Searchable name
    icon: 'download',                 // Icon name (see available icons)
    badge: {                          // Optional badge
        text: 'New',
        type: 'new'                   // new, beta, coming-soon, deprecated
    },
    description: 'Description of the feature',
    configPage: 'my-new-feature',     // Config page route
    enabled: false,
    disabled: false                   // true to disable the feature
}
```

**That's it!** The feature will automatically appear in the dashboard.

### 2. Available Badge Types

- `new` - Green badge for new features
- `beta` - Orange badge for beta features
- `coming-soon` - Purple badge for upcoming features
- `deprecated` - Gray badge for deprecated features
- `null` - No badge

### 3. Available Icons

Current icons in `components.js`:

**Feature Icons:**
- `download` - Download arrow
- `story` - Circle with dot
- `scroll` - Double arrow down
- `profile` - User profile
- `message` - Chat bubble
- `clock` - Clock/timer
- `grid` - 4 squares grid
- `star` - Star shape
- `arrow` - Right arrow (for links)

**Header Icons:**
- `favorites` - Star icon for favorites
- `feedback` - Chat bubble for feedback
- `settings` - Gear icon for settings

**To add a new icon**, edit the `icons` object in `UIComponents.icon()` method in `components.js`.

## Component API

### UIComponents.header(options)

Creates a header component.

```javascript
UIComponents.header({
    icon: '../icons/icon_128.png',
    title: 'InstaBits',
    subtitle: 'Manage your Instagram features',
    buttons: [
        { id: 'favorites', icon: 'favorites', title: 'Favorites' },
        { id: 'feedback', icon: 'feedback', title: 'Feedback' },
        { id: 'settings', icon: 'settings', title: 'Settings' }
    ]
})
// All parameters are optional and have defaults
```

### UIComponents.badge(text, color)

Creates a badge component.

```javascript
UIComponents.badge('New', '#10b981')
// Returns: <span class="badge" style="background-color: #10b981; color: #ffffff;">New</span>
```

### UIComponents.icon(iconName)

Returns SVG icon HTML.

```javascript
UIComponents.icon('download')
// Returns: <svg>...</svg>
```

### UIComponents.featureCard(feature)

Creates a complete feature card from feature data.

```javascript
UIComponents.featureCard(featureObject)
// Returns: Complete feature card HTML
```

### UIComponents.toast({ title, message, type })

Creates a toast notification.

```javascript
UIComponents.toast({
    title: 'Success',
    message: 'Feature enabled',
    type: 'success'
})
```

### UIComponents.searchBar(placeholder)

Creates a search input.

```javascript
UIComponents.searchBar('Search features...')
```

### UIComponents.noResults()

Creates a no results message.

```javascript
UIComponents.noResults()
```

## Examples

### Example 1: Add a "Theme Switcher" Feature

```javascript
// In features-data.js, add to FEATURES_DATA array:
{
    id: 'themeSwitcher',
    name: 'Theme Switcher',
    searchName: 'theme switcher dark mode',
    icon: 'star',  // Use existing icon or add new one
    badge: {
        text: 'New',
        type: 'new'
    },
    description: 'Switch between light and dark themes',
    configPage: 'theme-switcher',
    enabled: false,
    disabled: false
}
```

### Example 2: Add a Feature Without Badge

```javascript
{
    id: 'exportData',
    name: 'Export Data',
    searchName: 'export data download',
    icon: 'download',
    badge: null,  // No badge
    description: 'Export your Instagram data in various formats',
    configPage: 'export-data',
    enabled: false,
    disabled: false
}
```

### Example 3: Add a "Coming Soon" Feature

```javascript
{
    id: 'aiAssistant',
    name: 'AI Assistant',
    searchName: 'ai assistant chatbot',
    icon: 'message',
    badge: {
        text: 'Coming Soon',
        type: 'coming-soon'
    },
    description: 'AI-powered assistant for Instagram management',
    configPage: 'ai-assistant',
    enabled: false,
    disabled: true  // Disable toggle for coming soon features
}
```

## Helper Functions

Available in `features-data.js`:

```javascript
// Get feature by ID
const feature = getFeatureById('mediaDownloader');

// Get all enabled features
const enabled = getEnabledFeatures();

// Get features by badge type
const newFeatures = getFeaturesByBadge('new');
const betaFeatures = getFeaturesByBadge('beta');
```

## Styling

All styles are in `styles.css`. Key CSS classes:

- `.feature-card` - Feature card container
- `.feature-icon` - Icon with gradient background
- `.badge-{type}` - Badge styles (new, beta, etc.)
- `.toggle` - Toggle switch
- `.toast-{type}` - Toast notification styles
- `.feature-link` - Configure link

## Best Practices

1. **Always use the component system** - Never hardcode HTML
2. **Keep data separate** - Feature configs go in `features-data.js`
3. **Reuse components** - Use `UIComponents` for all UI elements
4. **Use descriptive IDs** - Feature IDs should be camelCase and descriptive
5. **Add searchable names** - Make features easy to find via search

## Notes

- Feature states are stored in `localStorage` with key = feature `id`
- All components return HTML strings
- The dashboard auto-renders on page load
- Toast notifications are color-coded and auto-dismiss after 3 seconds
