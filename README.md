# Survival Roulette 🎰

A multiplayer real-time battle game featuring dynamic HP management, special events, and multiple game modes. Built with React, Firebase, and Tailwind CSS.

## 🎮 Features

### Core Gameplay
- **Spin Roulette System** - Dynamic damage/healing values with customizable ranges
- **HP Management** - Track player health with visual indicators and animations
- **Turn-Based Combat** - Sequential turns with support for 2-100+ players
- **Elimination System** - Track defeated players with ranking system

### Game Modes
- **Individual Mode** - Every player for themselves
- **Team Mode** - Cooperative team-based battles (2-6 teams)
- **Special Events** - Random events that change gameplay mechanics
  - Reverse Mode - Flip damage/healing effects
  - Multi Mode - Target multiple players
  - Number Format Variants - Display numbers in different numeral systems (Roman, Greek, Chinese, etc.)
  - Name Translation - Multilingual name support
  - Feint - Deceptive moves
  - Dice Mode - Randomized outcomes
  - Instant Death - High-risk scenarios
  - And more!

### Multiplayer Features
- **Real-time Synchronization** - Firebase-powered live updates
- **Room System** - Create/join game rooms with unique IDs
- **Host Controls** - Game host manages spin timing and settings
- **Player Authentication** - Anonymous and custom token support

### Customization
- **HP Balance Mode** - Adjust target probability based on remaining HP
- **Configurable Settings**
  - Initial HP values
  - Spin duration
  - Heal intervals
  - Damage ranges
  - Special event probabilities
- **Number Format Support** - 37+ different number systems:
  - Roman, Greek, Kanji, Devanagari, Arabic, Hebrew, and more
- **Multilingual Support** - 20+ language options for player names

### UI/UX
- **Real-time Activity Logs** - Track all game events
- **Player Status Display** - Live HP tracking with visual cues
- **Ranking System** - Combined ranking of survivors and eliminated players
- **Responsive Design** - Mobile, tablet, and desktop support
- **Smooth Animations** - Engaging visual feedback for all actions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/siri09202-arch/survival-roulette.git
cd survival-roulette

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🔧 Environment Setup

Create a `.env.local` file in the project root:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Authentication** (Anonymous & Custom Token)
3. Create **Firestore Database** in test mode
4. Copy your config to `.env.local`

## 📦 Dependencies

### Core
- **react** (18+) - UI framework
- **firebase** (9+) - Backend services (Auth, Firestore)

### UI & Icons
- **tailwindcss** (3+) - Utility-first CSS
- **lucide-react** - Icon library

### Build Tools
- **react-scripts** - Create React App tooling
- **vite** (optional) - Fast build alternative

See `package.json` for complete dependency list.

## 🎯 Game Modes Explained

### Individual Mode
Each player competes independently. Last survivor wins.

### Team Mode
- Teams share a combined HP pool
- Team members work together for victory
- Supports 2-6 teams with customizable names

### Special Events
Enable random game-changing events:

| Event | Effect |
|-------|--------|
| Reverse Mode | Damage becomes healing, healing becomes damage |
| Multi Mode | Single spin affects multiple targets |
| Number Format | Display numbers in exotic numeral systems |
| Name Translation | Translate player names to other languages |
| Feint | Misleading HP changes |
| Dice Mode | Randomized damage calculations |
| HP Balance | Target probability based on remaining HP |
| Instant Death | Rare chance of immediate elimination |
| True Random | Completely unpredictable outcomes |

## 🕹️ How to Play

### Start Game
1. Enter game title and settings
2. Choose mode (Individual/Team)
3. Add players manually or paste a list
4. Customize HP, damage ranges, special events

### During Game
1. **Host** clicks "SPIN" button
2. Roulette animates with random result
3. Targeted player(s) take damage or healing
4. Activity logs update in real-time
5. Watch HP bars and ranking change
6. Game ends when only one team/player survives

### Multiplayer
1. Host creates room and shares Room ID
2. Other players enter Room ID to join
3. Players wait in lobby for game start
4. Only host can control spin button
5. All changes sync in real-time

## 🎨 Customization Guide

### Damage Configuration
Edit `config` state:
```javascript
{
  rangeMin: 1,        // Minimum damage
  rangeMax: 20,       // Maximum damage
  rangeProb: 70,      // Probability of range damage
  fixedItems: [       // Fixed damage values
    { id: 1, value: 50, prob: 20 }
  ]
}
```

### Special Events
Toggle specific events in `enabledSpecialEvents` array:
- `reverseMode` - Flip effects
- `multiMode` - Multiple targets
- `numberFormat` - Number system variants
- `nameTranslation` - Language translation
- etc.

### Number Formats (37 variants)
- Roman numerals (I, II, III...)
- Greek (α, β, γ...)
- Kanji (一, 二, 三...)
- Devanagari, Bengali, Tamil, Thai, Arabic, Hebrew, Armenian, Georgian, and more

### Languages (20+ options)
- Arabic, Italian, Indonesian, Ukrainian, Dutch
- Spanish, Thai, German, Turkish, Hindi
- French, Vietnamese, Polish, Portuguese, Russian
- English (US/UK), Korean, Chinese, and more

## 📊 Project Structure

```
survival-roulette/
├── src/
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── public/
│   ├── index.html        # HTML template
│   └── favicon.ico       # App icon
├── .env.example          # Environment template
├── .env.local            # Environment variables (local only)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── package-lock.json     # Dependency lock file
├── tailwind.config.js    # Tailwind CSS config
└── README.md             # This file
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### GitHub Pages
```bash
npm run build
npm install gh-pages --save-dev
# Add to package.json:
# "homepage": "https://username.github.io/survival-roulette"
# "deploy": "npm run build && gh-pages -d build"
npm run deploy
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup
```bash
git checkout -b feature/your-feature-name
npm run dev
# Make your changes
git commit -m "feat: description of changes"
git push origin feature/your-feature-name
```

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use Tailwind utility classes for styling
- Add comments for complex logic
- Keep components focused and reusable

## 🐛 Known Issues & Limitations

- Firebase config is required for multiplayer features
- Anonymously authenticated users have limited data retention
- Special events are currently server-side only
- Mobile UI is optimized for portrait orientation

## 🛣️ Roadmap

- [ ] Persistent game statistics tracking
- [ ] Custom game templates
- [ ] Voice chat integration
- [ ] Mobile app (React Native)
- [ ] Tournament mode
- [ ] Achievement system
- [ ] Dark/Light theme toggle
- [ ] Accessibility improvements (a11y)
- [ ] Internationalization (i18n)
- [ ] API for external integrations

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icon library
- Community contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/siri09202-arch/survival-roulette/issues)
- **Discussions**: [GitHub Discussions](https://github.com/siri09202-arch/survival-roulette/discussions)
- **Email**: siri09202-arch@github.com

## 📄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Made with ❤️ for battle game enthusiasts**
