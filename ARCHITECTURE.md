# Project Structure & Architecture Guide

## Current Structure

```
survival-roulette/
├── public/
│   ├── index.html              # Main HTML file
│   ├── favicon.ico             # Application icon
│   └── manifest.json           # PWA manifest (optional)
│
├── src/
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Global styles
│   ├── index.js                # React entry point
│   ├── index.css               # Global CSS
│   └── (components/            # Future: Split into components
│       └── GameBoard.jsx       # Example component
│       └── PlayerList.jsx
│       └── ActivityLog.jsx
│   )
│
├── .env.example                # Environment template
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI/CD pipeline
│   │   └── deploy.yml          # Deployment workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Bug report template
│   │   └── feature_request.md  # Feature request template
│   └── pull_request_template.md # PR template
│
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies & scripts
├── package-lock.json           # Dependency lock file
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── README.md                   # Project documentation
├── CONTRIBUTING.md             # Contribution guidelines
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Version history
└── .eslintrc.json             # ESLint configuration
```

## Recommended Refactored Structure (Future)

As the project grows, consider this structure:

```
src/
├── components/
│   ├── Game/
│   │   ├── GameBoard.jsx       # Main game board
│   │   ├── Roulette.jsx        # Spinning roulette component
│   │   └── GameBoard.css       # Component-specific styles
│   │
│   ├── Player/
│   │   ├── PlayerList.jsx      # Player list display
│   │   ├── PlayerCard.jsx      # Individual player card
│   │   └── PlayerList.css
│   │
│   ├── UI/
│   │   ├── Button.jsx          # Reusable button
│   │   ├── Modal.jsx           # Modal dialog
│   │   ├── Input.jsx           # Input field
│   │   └── UI.css
│   │
│   └── Layout/
│       ├── Header.jsx          # Header component
│       ├── Sidebar.jsx         # Sidebar navigation
│       └── Layout.css
│
├── hooks/
│   ├── useGame.js              # Game logic hook
│   ├── useFirebase.js          # Firebase integration
│   ├── useMultiplayer.js       # Multiplayer logic
│   └── useAnimation.js         # Animation utilities
│
├── services/
│   ├── firebaseService.js      # Firebase operations
│   ├── gameService.js          # Game logic
│   ├── numberFormatter.js      # Number format conversion
│   └── translator.js           # Name translation
│
├── utils/
│   ├── constants.js            # App constants
│   ├── helpers.js              # Helper functions
│   ├── validation.js           # Input validation
│   └── calculations.js         # Game calculations
│
├── context/
│   ├── GameContext.js          # Game state context
│   ├── MultiplayerContext.js   # Multiplayer state
│   └── AuthContext.js          # Authentication state
│
├── types/
│   └── index.d.ts              # TypeScript definitions (optional)
│
├── styles/
│   ├── globals.css             # Global styles
│   ├── tailwind.css            # Tailwind imports
│   └── animations.css          # Animation definitions
│
├── App.jsx                     # Main app component
├── index.js                    # Entry point
└── index.css                   # Entry CSS
```

## Architecture Decisions

### 1. State Management

**Current Approach**: React Hooks (useState, useRef)

For larger projects, consider:
- **Zustand**: Light-weight state management
- **Redux Toolkit**: Enterprise-scale state management
- **Recoil**: Atom-based state management

### 2. Firebase Integration

**Safe Initialization**:
```javascript
// Check for Firebase config before initializing
const hasFirebaseConfig = firebaseConfig && firebaseConfig.apiKey;
if (hasFirebaseConfig) {
  // Initialize Firebase
}
```

### 3. Component Organization

**Current**: Monolithic App component
**Recommended**: Extract into smaller, reusable components

### 4. Styling Approach

**Current**: Tailwind CSS inline (className chains)
**Best Practices**:
- Use `clsx` or `classnames` for conditional styling
- Extract repeated class patterns into CSS modules or components
- Keep className chains under 80 characters for readability

Example:
```javascript
import clsx from 'clsx';

const playerCardClasses = clsx(
  'bg-slate-950 p-4 rounded-2xl border transition-all',
  {
    'border-red-500 ring-red-500/20': isLowHp,
    'border-slate-800': !isLowHp
  }
);
```

## Performance Considerations

### 1. Rendering Optimization
- Use `React.memo()` for components that receive same props
- Implement `useCallback()` for event handlers
- Consider `useMemo()` for expensive calculations

### 2. Firebase Optimization
- Unsubscribe from listeners when components unmount
- Use `onSnapshot` for real-time updates
- Batch Firestore operations when possible

### 3. Bundle Size
- Monitor bundle size with `npm run build`
- Consider code splitting for large components
- Tree-shake unused Lucide icons

## Testing Strategy

### Unit Tests
```javascript
// Example: useGame hook test
describe('useGame', () => {
  it('should initialize game with default values', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.players).toEqual([]);
  });
});
```

### Integration Tests
- Test Firebase integration
- Test multiplayer room creation/joining
- Test game state transitions

### E2E Tests (Cypress)
- Test full game flow
- Test multiplayer synchronization
- Test special events triggering

## Configuration Files

### tailwind.config.js
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      }
    }
  }
}
```

### .eslintrc.json
```json
{
  "extends": ["react-app"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn"
  }
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Environment Variables

Keep sensitive data in `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
```

Never commit `.env.local` or `.env` files!

## Git Workflow

### Branching Strategy: Git Flow
```
main (production)
├── develop (staging)
│   ├── feature/new-feature
│   ├── fix/bug-fix
│   └── hotfix/critical-fix
```

### Naming Conventions
- Feature: `feature/add-tournament-mode`
- Bug fix: `fix/multiplayer-sync-issue`
- Hotfix: `hotfix/critical-crash`

## Documentation

### Code Documentation
- Add JSDoc comments to functions
- Explain complex logic
- Include parameter and return types

Example:
```javascript
/**
 * Calculate damage value based on configuration
 * @param {Object} config - Configuration object
 * @param {number} config.rangeMin - Minimum damage
 * @param {number} config.rangeMax - Maximum damage
 * @returns {number} Calculated damage value
 */
function calculateDamage(config) {
  // Implementation
}
```

## Security Best Practices

1. **Never expose secrets**
   - Use environment variables
   - Keep `.env.local` in `.gitignore`

2. **Firebase Security Rules**
   - Set strict Firestore rules
   - Limit authentication methods
   - Validate user input on backend

3. **Input Validation**
   - Validate all player input
   - Sanitize room names and player names
   - Prevent XSS attacks

## Performance Monitoring

- Use React DevTools Profiler
- Monitor Firebase read/write operations
- Check bundle size regularly
- Implement error tracking (Sentry)

## Deployment Checklist

- [ ] Run tests: `npm test`
- [ ] Check linting: `npm run lint`
- [ ] Build locally: `npm run build`
- [ ] Test in production build
- [ ] Update CHANGELOG.md
- [ ] Create version tag
- [ ] Push to main branch
- [ ] Deploy via CI/CD

---

For questions about architecture or structure, open a GitHub Discussion or Issue.
