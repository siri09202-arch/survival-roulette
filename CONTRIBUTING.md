# Contributing to Survival Roulette

First off, thank you for considering contributing to Survival Roulette! It's people like you that make Survival Roulette such a great game.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (Browser, OS, React version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and the expected behavior**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the JavaScript/React styleguides
* End all files with a newline
* Avoid platform-dependent code
* Document new code based on the Documentation Styleguide

## Development Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git

### Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/survival-roulette.git
   cd survival-roulette
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication (Anonymous & Custom Token)
   - Create a Firestore database
   - Copy your config

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider using these prefixes:
  * `feat:` - A new feature
  * `fix:` - A bug fix
  * `docs:` - Documentation changes
  * `style:` - Code style changes (formatting, etc)
  * `refactor:` - Code refactoring without feature changes
  * `test:` - Adding or updating tests
  * `chore:` - Maintenance tasks

Example:
```
feat: add multiplayer room creation with unique IDs

Allows users to create game rooms and share room IDs for multiplayer
sessions. Implements Firebase Firestore integration for real-time
room synchronization.

Fixes #123
```

### JavaScript/React Styleguide

* Use functional components with React Hooks
* Use meaningful variable and function names
* Use camelCase for variables and functions
* Use PascalCase for components
* Use Tailwind CSS utility classes for styling
* Add comments for complex logic
* Keep components focused and single-responsibility
* Use destructuring for props
* Use const/let, avoid var

Example:
```javascript
const GameBoard = ({ players, onSpinClick }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);
    // Spin logic here
  };

  return (
    <div className="game-board">
      <button onClick={handleSpin} disabled={isSpinning}>
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
    </div>
  );
};

export default GameBoard;
```

### CSS/Tailwind Styleguide

* Use Tailwind utility classes whenever possible
* Avoid inline styles
* Use responsive classes (sm:, md:, lg:, etc.)
* Follow the class ordering: layout → spacing → sizing → colors → effects
* Keep component-specific styles in Tailwind classes

Example:
```javascript
<div className="w-full px-4 py-2 md:px-6 md:py-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
  {/* Content */}
</div>
```

### Documentation Styleguide

* Use Markdown
* Reference functions/classes in backticks: `myFunction()`
* Use code blocks with language specification
* Include examples where applicable
* Keep line length to 100 characters for readability

## Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Run tests with: `npm test`
* Aim for at least 80% code coverage on new code

## Review Process

1. **Automated checks** - All PRs must pass:
   - Linting (ESLint)
   - Build process
   - Test suite

2. **Code review** - At least one maintainer review

3. **Approval and merge** - After approved, the PR can be merged

## Release Process

The maintainers handle releases following semantic versioning:
- **MAJOR** - Breaking changes (x.0.0)
- **MINOR** - New features (0.x.0)
- **PATCH** - Bug fixes (0.0.x)

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `wontfix` - This will not be worked on

## Getting Help

* **GitHub Issues** - Ask questions in issues with `question` label
* **GitHub Discussions** - Start a discussion for general questions
* **Email** - siri09202-arch@github.com

---

Thank you for contributing! 🎉
