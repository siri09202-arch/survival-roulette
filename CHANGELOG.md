# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Multiplayer room system with Firebase real-time sync
- 37+ number format variants (Roman, Greek, Chinese, etc.)
- 20+ multilingual name translation support
- Special events system with configurable events
- HP balance mode for fair probability distribution
- Activity logs with real-time updates
- Responsive design for mobile and desktop
- Team mode support (2-6 teams)
- Revive events system
- Manual selection phase for special events

### Changed
- Improved animation performance
- Enhanced UI responsiveness

### Fixed
- Firebase initialization error handling

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- Core roulette spinning mechanic
- Individual and team game modes
- Player HP management with damage/healing
- Real-time multiplayer support via Firebase
- Customizable damage ranges and probabilities
- Fixed item configuration
- Player elimination tracking
- Ranking system combining survivors and eliminated players
- Activity logs
- Responsive UI with Tailwind CSS
- Support for special events:
  - Reverse Mode (flip damage/healing)
  - Multi Mode (target multiple players)
  - Number Format variants
  - Name Translation
  - Feint
  - Dice Mode
  - Reverse Heal/Damage
  - Instant Death
  - True Random
- Audio feedback
- Animation system
- Mobile-friendly interface

## Version History

### 0.9.0 (Beta)
- Beta release with core features
- Multiplayer testing
- Performance optimization

### 0.5.0 (Alpha)
- Alpha release with basic gameplay
- Single-player mode only
- Initial UI design

---

## Notes for Contributors

When adding new features:

1. Update this CHANGELOG
2. Follow the format above
3. Add your changes to the [Unreleased] section
4. When releasing, create a new version section with the date

Example entry:
```markdown
### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```

## Future Roadmap

Planned features for upcoming releases:

### v1.1.0
- [ ] Game statistics and leaderboards
- [ ] Custom game templates
- [ ] Accessibility improvements (a11y)

### v1.2.0
- [ ] Voice chat integration
- [ ] Tournament mode
- [ ] Achievement system

### v2.0.0
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
- [ ] Advanced analytics dashboard
- [ ] Social features (friends, guilds)

---

For more information, see [Contributing](CONTRIBUTING.md)
