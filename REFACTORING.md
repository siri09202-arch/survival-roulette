# Code Refactoring & Optimization Guide

This guide provides recommendations for improving the Survival Roulette codebase as it grows.

## Current Issues & Recommendations

### 1. Monolithic Component Structure

**Current**: All logic in single `App.jsx` (1272+ lines)

**Refactoring Path**:

Extract into smaller components:

```
src/
├── components/
│   ├── Game/
│   │   ├── GameBoard.jsx        # Main game display
│   │   ├── Roulette.jsx         # Spinning roulette
│   │   ├── ActivityLog.jsx      # Game activity log
│   │   └── GameSettings.jsx     # Game configuration
│   ├── Player/
│   │   ├── PlayerList.jsx       # Survivors list
│   │   ├── PlayerCard.jsx       # Individual player card
│   │   ├── EliminatedList.jsx   # Eliminated players
│   │   └── RankingList.jsx      # Ranking display
│   ├── Lobby/
│   │   ├── GameLobby.jsx        # Game setup
│   │   ├── MultiplayerRoom.jsx  # Room management
│   │   └── PlayerInput.jsx      # Player entry
│   └── Common/
│       ├── Button.jsx           # Reusable button
│       ├── Modal.jsx            # Modal dialog
│       └── LoadingSpinner.jsx   # Loading state
│
├── hooks/
│   ├── useGame.js              # Game logic
│   ├── useMultiplayer.js       # Multiplayer sync
│   ├── useFirebase.js          # Firebase operations
│   └── useAnimation.js         # Animation utilities
│
├── services/
│   ├── firebaseService.js      # Firebase API
│   ├── gameService.js          # Game calculations
│   └── numberFormatter.js      # Number format conversion
│
└── App.jsx                     # Root component (simplified)
```

### 2. Duplicate Logic

**Areas with repeated code**:
- Number formatting logic
- Player state calculations
- Firebase operations
- Animation trigger conditions

**Solution**: Extract into utility functions

```javascript
// utils/gameCalculations.js
export const calculateTargetProbability = (hp, totalHp, playerCount) => {
  if (totalHp === 0) return 0;
  return Math.round((hp / totalHp) * 100);
};

export const determineDamageType = (lastResult) => {
  if (lastResult.isReverse) return 'reversed';
  if (lastResult.type === 'heal') return 'heal';
  return 'damage';
};
```

### 3. State Management Complexity

**Current**: 50+ useState hooks in App component

**Solution**: Use React Context API

```javascript
// context/GameContext.js
import React, { createContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  title: '',
  players: [],
  mode: 'individual',
  turn: 1,
  isSpinning: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.payload] };
    case 'START_SPIN':
      return { ...state, isSpinning: true };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return React.useContext(GameContext);
}
```

### 4. Firebase Integration

**Current**: Conditional Firebase initialization in main App

**Better Approach**:

```javascript
// services/firebaseService.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.initialized = false;
  }

  init(config) {
    try {
      if (!config || !config.apiKey) {
        console.warn('Firebase config missing');
        return false;
      }

      this.app = getApps().length ? getApps()[0] : initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Firebase init failed:', error);
      return false;
    }
  }

  // Auth methods
  async signInAnonymously() {
    // Implementation
  }

  // Firestore methods
  async createRoom(roomData) {
    // Implementation
  }

  subscribeToRoom(roomId, callback) {
    // Implementation
  }
}

export default new FirebaseService();
```

### 5. Configuration Management

**Current**: Hardcoded values scattered throughout

**Better Approach**:

```javascript
// config/gameConfig.js
export const DEFAULT_CONFIG = {
  game: {
    initialHP: 1000,
    spinDuration: 1.5,
    healInterval: 10,
  },
  damage: {
    rangeMin: 1,
    rangeMax: 20,
    rangeProb: 70,
    fixedItems: [
      { id: 1, value: 50, prob: 20 },
      { id: 2, value: 100, prob: 10 }
    ]
  },
  special: {
    enabled: false,
    probability: 10,
    events: [
      'reverseMode',
      'multiMode',
      'numberFormat',
      'nameTranslation',
      'feint',
      'diceMode',
      'reverseHealDamage',
      'instantDeath',
      'trueRandom'
    ]
  }
};

export const GAME_MODES = {
  INDIVIDUAL: 'individual',
  TEAM: 'team'
};

export const PHASES = {
  HOME: 'home',
  SETUP: 'setup',
  LOBBY: 'lobby',
  PLAYING: 'playing',
  RESULT: 'result'
};
```

## Performance Optimizations

### 1. Memoization

```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const PlayerCard = memo(({ player, isSelected, onClick }) => {
  return (
    <div onClick={onClick} className={isSelected ? 'selected' : ''}>
      {player.name}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.player.id === nextProps.player.id &&
         prevProps.isSelected === nextProps.isSelected;
});

// Memoize expensive calculations
const GameBoard = ({ players, totalHP }) => {
  const survivorList = useMemo(() => {
    return players.filter(p => p.hp > 0).sort((a, b) => b.hp - a.hp);
  }, [players]);

  const handleSpin = useCallback(() => {
    // Handle spin logic
  }, []);

  return <div>...</div>;
};
```

### 2. Code Splitting

```javascript
import React, { Suspense } from 'react';

// Lazy load components
const GameSetup = React.lazy(() => import('./GameSetup'));
const GameBoard = React.lazy(() => import('./GameBoard'));

function App() {
  const [phase, setPhase] = useState('home');

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {phase === 'setup' && <GameSetup onStart={() => setPhase('playing')} />}
      {phase === 'playing' && <GameBoard />}
    </Suspense>
  );
}
```

### 3. Event Listener Cleanup

```javascript
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);

  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## Testing Improvements

### Unit Tests

```javascript
// __tests__/gameService.test.js
import { calculateDamage, calculateHealing } from '../services/gameService';

describe('gameService', () => {
  describe('calculateDamage', () => {
    it('should return damage within configured range', () => {
      const damage = calculateDamage({ min: 1, max: 20, rangeProb: 70 });
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(20);
    });

    it('should handle special cases', () => {
      // Test edge cases
    });
  });
});
```

### Integration Tests

```javascript
// __tests__/Firebase.integration.test.js
describe('Firebase Integration', () => {
  it('should create and join a room', async () => {
    const roomId = await firebaseService.createRoom({ title: 'Test Game' });
    expect(roomId).toBeDefined();

    const room = await firebaseService.joinRoom(roomId);
    expect(room.title).toBe('Test Game');
  });
});
```

## Code Quality

### ESLint Rules

```json
{
  "rules": {
    "complexity": ["warn", 10],
    "max-lines": ["warn", { "max": 300 }],
    "max-params": ["warn", 4],
    "no-nested-ternary": "warn",
    "no-multiple-empty-lines": "warn"
  }
}
```

### Type Safety (Optional: TypeScript)

```typescript
// types/game.ts
interface Player {
  id: string;
  name: string;
  hp: number;
  team?: string;
  isEliminated: boolean;
}

interface GameConfig {
  title: string;
  mode: 'individual' | 'team';
  initialHP: number;
  specialEventsEnabled: boolean;
}

interface GameState {
  players: Player[];
  config: GameConfig;
  turn: number;
  isSpinning: boolean;
}
```

## Documentation

### JSDoc Comments

```javascript
/**
 * Calculate damage for a player
 * @param {Object} config - Damage configuration
 * @param {number} config.min - Minimum damage value
 * @param {number} config.max - Maximum damage value
 * @param {number} config.probability - Probability of range damage
 * @returns {number} Calculated damage amount
 * @throws {Error} If config is invalid
 *
 * @example
 * const damage = calculateDamage({ min: 1, max: 20, probability: 70 });
 */
function calculateDamage(config) {
  // Implementation
}
```

## Refactoring Checklist

- [ ] Extract components from App.jsx
- [ ] Create custom hooks for logic
- [ ] Move constants to config file
- [ ] Implement Firebase service class
- [ ] Add Context API for global state
- [ ] Memoize expensive components
- [ ] Implement code splitting
- [ ] Add comprehensive tests
- [ ] Add TypeScript types (optional)
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Implement proper logging
- [ ] Add performance monitoring
- [ ] Document all functions
- [ ] Update README with structure

## Migration Path (Recommended Order)

1. **Week 1**: Extract components (GameBoard, PlayerList, ActivityLog)
2. **Week 2**: Create custom hooks (useGame, useMultiplayer)
3. **Week 3**: Implement Context API
4. **Week 4**: Add tests and improve documentation
5. **Week 5**: Performance optimization and TypeScript
6. **Week 6**: Deploy refactored version

---

For detailed examples, see the [ARCHITECTURE.md](ARCHITECTURE.md) file.
