# Troubleshooting & FAQ

## Common Issues & Solutions

### Development Issues

#### Issue: npm install fails

**Symptoms**:
```
npm ERR! code E404
npm ERR! 404 Not Found
```

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete lock file and reinstall
rm package-lock.json
npm install

# Use different registry
npm config set registry https://registry.npmjs.org/
npm install
```

#### Issue: Port 3000 already in use

**Symptoms**:
```
Port 3000 is already in use
```

**Solutions**:
```bash
# Linux/macOS: Find and kill process
lsof -ti:3000 | xargs kill -9

# Windows: Use different port
set PORT=3001 && npm start

# Or kill port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Issue: React DevTools not working

**Solutions**:
1. Ensure you're using development build (not production)
2. Install [React DevTools Extension](https://chrome.google.com/webstore/detail/react-developer-tools/)
3. Restart browser and clear cache
4. Check console for warnings

#### Issue: Module not found error

**Symptoms**:
```
Module not found: Can't resolve './component'
```

**Solutions**:
```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Check file paths are correct (case-sensitive on Linux)
# Check .gitignore isn't excluding files
```

### Firebase Issues

#### Issue: Firebase initialization fails

**Symptoms**:
```
Error: Firebase initialization failed
```

**Troubleshooting**:

1. **Check .env.local exists**
```bash
ls -la .env.local
# Should show .env.local file
```

2. **Verify environment variables**
```bash
echo $REACT_APP_FIREBASE_API_KEY
# Should output your API key
```

3. **Validate Firebase config**
```javascript
// In browser console
console.log(window.__firebase_config)
// Should show your Firebase config
```

4. **Common causes**:
   - Missing .env.local file
   - Environment variables not loaded
   - Invalid Firebase credentials
   - Firebase project not initialized

**Solution**:
```bash
# Copy example to local
cp .env.example .env.local

# Edit .env.local with correct credentials
nano .env.local

# Restart dev server
npm start
```

#### Issue: Firestore rules too restrictive

**Symptoms**:
```
Missing or insufficient permissions
```

**Solutions**:

For development, temporarily allow all:
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For production, use proper rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms: Owner can read/write
    match /rooms/{roomId} {
      allow read: if resource.data.hostId == request.auth.uid;
      allow write: if resource.data.hostId == request.auth.uid;
      allow create: if request.auth != null;
    }

    // Players: Only in own game
    match /players/{playerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Issue: Anonymous authentication not working

**Symptoms**:
```
auth/operation-not-allowed
```

**Solutions**:

1. Enable Anonymous authentication:
   - Firebase Console → Authentication
   - Sign-in method → Anonymous → Enable

2. Check authentication code:
```javascript
import { signInAnonymously } from "firebase/auth";

const auth = getAuth();
try {
  await signInAnonymously(auth);
} catch (error) {
  console.error("Auth failed:", error.code);
}
```

### Multiplayer Issues

#### Issue: Multiplayer not syncing

**Symptoms**:
- Players see different states
- Updates not reflecting in real-time
- Room changes don't sync

**Troubleshooting**:

1. **Check Firebase connection**
```javascript
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Authenticated:', user.uid);
  }
});
```

2. **Verify Firestore listeners**
```javascript
// Check active listeners
console.log('Active listeners:', db._connectionState);
```

3. **Check network**
   - Open DevTools → Network tab
   - Look for failed Firebase requests
   - Check browser offline status

4. **Restart connection**
```javascript
// Disconnect and reconnect Firebase
import { getFirestore } from 'firebase/firestore';

const db = getFirestore();
db.disableNetwork().then(() => {
  db.enableNetwork();
});
```

#### Issue: Room ID not working

**Symptoms**:
```
Room not found
Cannot join room
```

**Solutions**:

1. **Verify Room ID format**
   - Should be alphanumeric
   - Check for typos
   - Ensure correct case sensitivity

2. **Check room exists in Firestore**
   - Firebase Console → Firestore
   - Check "rooms" collection
   - Verify room document exists

3. **Check room permissions**
```javascript
// Verify host can read own room
const roomRef = doc(db, 'rooms', roomId);
const roomSnap = await getDoc(roomRef);
if (roomSnap.exists()) {
  console.log('Room exists:', roomSnap.data());
}
```

### UI/Display Issues

#### Issue: Styles not applying

**Symptoms**:
- Tailwind classes not working
- Custom styles ignored
- Inconsistent styling

**Solutions**:

1. **Check Tailwind configuration**
```bash
# Verify tailwind.config.js includes src files
# Should have: "./src/**/*.{js,jsx}"
```

2. **Rebuild Tailwind**
```bash
# Clear Tailwind cache
rm -rf node_modules/.cache

# Restart dev server
npm start
```

3. **Check class names**
```bash
# Invalid: space in expression
className={`bg-${color}-500`}  // ❌ Wrong

# Valid: template string or conditional
className={`bg-red-500 ${active ? 'text-white' : ''}`}  // ✓ Correct
```

4. **Import global styles**
```javascript
// Check App.jsx imports CSS
import './App.css';  // Should be present
```

#### Issue: Animations not smooth

**Symptoms**:
- Jittery animations
- Laggy performance
- Dropped frames

**Solutions**:

1. **Check animation settings**
```javascript
// Use GPU acceleration
className="transition-all duration-300 will-change-transform"
```

2. **Optimize re-renders**
```javascript
// Use useCallback for event handlers
const handleSpin = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

3. **Check performance**
   - DevTools → Performance tab
   - Look for long tasks
   - Check frame rate

4. **Reduce animation complexity**
   - Simplify CSS transitions
   - Reduce number of animated elements
   - Use CSS transforms (faster than position)

### Mobile Issues

#### Issue: Mobile layout broken

**Symptoms**:
- UI not responsive
- Text too small/large
- Components overlapping

**Solutions**:

1. **Test responsive design**
```bash
# DevTools → Toggle device toolbar (Ctrl+Shift+M)
# Test at: 375px (mobile), 768px (tablet), 1024px (desktop)
```

2. **Check viewport meta tag**
```html
<!-- public/index.html should have: -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

3. **Verify responsive classes**
```javascript
// Use Tailwind responsive prefixes
className="w-full md:w-1/2 lg:w-1/3"
```

#### Issue: Touch interactions not working

**Symptoms**:
- Buttons not responding to touch
- Swipes not detected
- Slow touch response

**Solutions**:

1. **Add touch-friendly padding**
```javascript
// Ensure buttons are at least 44x44px
className="w-full h-12 px-4 py-3"
```

2. **Add touch event handlers**
```javascript
const handleTouchStart = (e) => {
  const touch = e.touches[0];
  // Handle touch
};

element.addEventListener('touchstart', handleTouchStart);
```

3. **Disable zoom on double-tap**
```html
<!-- In public/index.html -->
<meta name="viewport" content="
  width=device-width, 
  initial-scale=1, 
  user-scalable=no" />
```

## FAQ

### General Questions

**Q: What are the minimum requirements?**
A: Node.js 16+, npm 8+, modern browser (Chrome 90+, Firefox 88+, Safari 14+)

**Q: How do I get Firebase credentials?**
A:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Settings → Project settings
4. Copy config object values to .env.local

**Q: Can I use this without Firebase?**
A: Yes, but multiplayer features won't work. Single-player works without Firebase.

**Q: How do I report bugs?**
A: Open [GitHub Issue](https://github.com/siri09202-arch/survival-roulette/issues)

### Gameplay Questions

**Q: How many players can join a game?**
A: Unlimited in theory, but recommended max 100 for performance

**Q: Can I customize damage values?**
A: Yes, in game settings before starting

**Q: What are special events?**
A: Random events that change game rules (reverse damage, multi-target, etc.)

**Q: How do I translate names?**
A: Enable "Name Translation" in special events settings

### Development Questions

**Q: How do I add a new number format?**
A:
```javascript
// In src/App.jsx, add to ALL_NUMBER_FORMATS
{ id: 'myformat', label: 'My Format' }

// Add conversion function in numberFormatter
case 'myformat':
  return convertToMyFormat(number);
```

**Q: How do I add a new special event?**
A:
```javascript
// Add to enabledSpecialEvents array
const [enabledSpecialEvents, setEnabledSpecialEvents] = useState([
  'myEvent'
]);

// Implement in gameLogic
if (enabledSpecialEvents.includes('myEvent')) {
  // Event logic
}
```

**Q: How do I change colors?**
A: Edit `tailwind.config.js` theme colors section

**Q: How do I run tests?**
A:
```bash
npm test              # Run all tests
npm test -- --watch  # Watch mode
npm test -- --coverage  # With coverage
```

### Deployment Questions

**Q: Which platform should I use?**
A: 
- Firebase Hosting (recommended, integrated with backend)
- Vercel (easiest GitHub integration)
- Netlify (simple alternative)

**Q: How much does it cost?**
A: All recommended platforms have free tiers for small projects

**Q: Can I use custom domain?**
A: Yes, all platforms support custom domains

**Q: How do I set up SSL/HTTPS?**
A: All recommended platforms provide free SSL automatically

### Performance Questions

**Q: How can I improve game performance?**
A:
1. Enable HP Balance Mode (fairer targeting)
2. Reduce number of players
3. Disable special events
4. Check bundle size

**Q: How do I check bundle size?**
A:
```bash
npm run build
npm install -g source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

**Q: Is there a limit to how many games I can host?**
A: No limit in code, but Firebase has quotas (generous free tier)

## Getting More Help

1. **Check Existing Issues**: [GitHub Issues](https://github.com/siri09202-arch/survival-roulette/issues)
2. **Search Discussions**: [GitHub Discussions](https://github.com/siri09202-arch/survival-roulette/discussions)
3. **Read Documentation**: Check README.md and relevant docs
4. **Enable Debug Mode**:
```javascript
// In App.jsx
const DEBUG = process.env.REACT_APP_DEBUG === 'true';
if (DEBUG) console.log('Debug info:', state);
```

5. **Check Browser Console**: F12 → Console tab for errors

## Still Stuck?

1. **Create a minimal reproduction**
   - Isolate the issue in a simple example
   - Include steps to reproduce

2. **Collect debug information**
   - Browser version
   - Error messages
   - Console logs
   - Network requests

3. **Open a GitHub Issue**
   - Use bug report template
   - Include all collected information
   - Tag with appropriate labels

---

**Last Updated**: 2024
**Need Help?** Open [GitHub Issue](https://github.com/siri09202-arch/survival-roulette/issues)
