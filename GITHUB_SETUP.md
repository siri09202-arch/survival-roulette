# GitHub Setup Guide - File Placement

This guide explains where each file should be placed in your GitHub repository.

## File Structure for GitHub

```
survival-roulette/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          ← issue_template_bug.md
│   │   └── feature_request.md     ← issue_template_feature.md
│   ├── workflows/
│   │   ├── ci.yml                 ← ci_workflow.yml
│   │   └── deploy.yml             ← deploy_workflow.yml
│   └── pull_request_template.md   ← pull_request_template.md
│
├── src/
│   ├── App.jsx                    ← Your React app code
│   ├── App.css
│   ├── index.js
│   └── index.css
│
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── .env.example                   ← Environment template
├── .env.local                     ← (LOCAL ONLY, not in git)
├── .eslintrc.json                 ← Linting configuration
├── .gitignore                     ← Git ignore rules
├── ARCHITECTURE.md                ← Code structure guide
├── CHANGELOG.md                   ← Version history
├── CONTRIBUTING.md                ← Contribution guidelines
├── DEPLOYMENT.md                  ← Deployment guide
├── LICENSE                        ← MIT License
├── package.json                   ← Dependencies
├── package-lock.json              ← Lock file
├── postcss.config.js              ← PostCSS config
├── README.md                      ← Main documentation
├── REFACTORING.md                 ← Code improvement guide
├── tailwind.config.js             ← Tailwind config
├── TROUBLESHOOTING.md             ← FAQ & troubleshooting
└── .eslintrc.json                 ← ESLint config
```

## Step-by-Step Setup Instructions

### Step 1: Prepare Your Repository

```bash
# Navigate to your repo
cd survival-roulette

# Ensure git is initialized
git init
git add remote origin https://github.com/siri09202-arch/survival-roulette.git
```

### Step 2: Place Root Files

Copy these files to repository root:

```bash
# From outputs folder to root
cp README.md .
cp LICENSE .
cp CHANGELOG.md .
cp CONTRIBUTING.md .
cp DEPLOYMENT.md .
cp ARCHITECTURE.md .
cp REFACTORING.md .
cp TROUBLESHOOTING.md .
cp .gitignore .
cp .env.example .
cp package.json .
cp tailwind.config.js .
cp postcss.config.js .
cp .eslintrc.json .
```

### Step 3: Create .github Directory Structure

```bash
# Create directories
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE

# Copy files
cp pull_request_template.md .github/
cp issue_template_bug.md .github/ISSUE_TEMPLATE/bug_report.md
cp issue_template_feature.md .github/ISSUE_TEMPLATE/feature_request.md
cp ci_workflow.yml .github/workflows/ci.yml
cp deploy_workflow.yml .github/workflows/deploy.yml
```

### Step 4: Add Your Application Code

```bash
# Ensure src/App.jsx exists with your React code
# Ensure public/index.html exists

# If starting fresh, create React app
npx create-react-app . --template cra-template

# Then add your App.jsx code
```

### Step 5: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify build works
npm run build
```

### Step 6: Create Environment File (Local Only)

```bash
# Copy example to local
cp .env.example .env.local

# Edit with your Firebase credentials
nano .env.local  # or use your editor

# Verify .env.local is in .gitignore
grep ".env.local" .gitignore
```

### Step 7: Configure GitHub Settings

#### Branch Protection

1. Go to: Settings → Branches → Add rule
2. Apply to branch: `main`
3. Enable:
   - [x] Require pull request reviews before merging (1 approval)
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging

#### Actions/Secrets

1. Go to: Settings → Secrets and variables → Actions
2. Add secrets:
   - `FIREBASE_API_KEY` - Your Firebase API key
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `FIREBASE_SERVICE_ACCOUNT` - JSON service account key
   - `FIREBASE_AUTH_DOMAIN` - Your auth domain
   - `FIREBASE_STORAGE_BUCKET` - Storage bucket
   - `FIREBASE_MESSAGING_SENDER_ID` - Sender ID
   - `FIREBASE_APP_ID` - App ID

#### Deploy Keys (for CI/CD)

For Firebase deployment via GitHub Actions:

1. Go to Firebase Console → Project settings → Service accounts
2. Generate new private key
3. Add to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT`

### Step 8: Customize Key Files

#### README.md
- [ ] Update author name
- [ ] Add screenshots if needed
- [ ] Update links to your repo
- [ ] Add your email/contact info

#### CHANGELOG.md
- [ ] Update version numbers
- [ ] Add release dates
- [ ] Update roadmap with your plans

#### CONTRIBUTING.md
- [ ] Update email address
- [ ] Adjust contribution guidelines if needed
- [ ] Update coding standards if needed

#### DEPLOYMENT.md
- [ ] Choose your deployment platform
- [ ] Follow platform-specific steps
- [ ] Update with your project ID

## GitHub Workflow

### For Contributors

```bash
# 1. Fork repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/survival-roulette.git

# 3. Create feature branch
git checkout -b feature/your-feature

# 4. Make changes, commit
git commit -m "feat: description"

# 5. Push and create pull request
git push origin feature/your-feature
```

### For Maintainers

```bash
# Review pull request
# Approve if good

# GitHub Actions will:
# 1. Run linting (ci.yml)
# 2. Run tests
# 3. Build project
# 4. Post results on PR

# Merge PR when approved
# Automatic deployment to Firebase (deploy.yml)
```

## File Descriptions

### Documentation Files

| File | Purpose |
|------|---------|
| README.md | Main project documentation |
| CONTRIBUTING.md | Contribution guidelines |
| DEPLOYMENT.md | How to deploy to various platforms |
| ARCHITECTURE.md | Code structure and design |
| REFACTORING.md | Code improvement recommendations |
| TROUBLESHOOTING.md | FAQ and common issues |
| CHANGELOG.md | Version history |

### Configuration Files

| File | Purpose |
|------|---------|
| package.json | Dependencies and scripts |
| .gitignore | Files to ignore in git |
| .env.example | Environment variable template |
| tailwind.config.js | Tailwind CSS configuration |
| postcss.config.js | PostCSS configuration |
| .eslintrc.json | ESLint linting rules |

### GitHub Workflow Files

| File | Purpose |
|------|---------|
| .github/workflows/ci.yml | Continuous integration pipeline |
| .github/workflows/deploy.yml | Deployment pipeline |
| .github/pull_request_template.md | PR template |
| .github/ISSUE_TEMPLATE/bug_report.md | Bug report template |
| .github/ISSUE_TEMPLATE/feature_request.md | Feature request template |

## Important: Before First Commit

### Add to .gitignore (Already included)

Make sure these are in .gitignore:
```
node_modules/
.env
.env.local
.env.production.local
build/
dist/
.DS_Store
```

### Create First Commit

```bash
# Add all files
git add .

# Commit
git commit -m "chore: initial setup with GitHub configuration"

# Push to GitHub
git push origin main
```

### Verify Workflows

1. Go to GitHub → Actions
2. Check that workflows appear:
   - ci.yml shows when files change
   - deploy.yml ready for manual trigger
3. Fix any workflow errors

## Customization Checklist

- [ ] README.md - Update project description and examples
- [ ] CONTRIBUTING.md - Update contact email
- [ ] CHANGELOG.md - Update roadmap and version info
- [ ] package.json - Verify all dependencies correct
- [ ] .env.example - Verify all env vars documented
- [ ] GitHub Secrets - Add all Firebase credentials
- [ ] Branch Protection - Configure main branch rules
- [ ] DEPLOYMENT.md - Choose your platform and follow steps
- [ ] Update website links if applicable
- [ ] Test CI/CD pipeline with a test PR

## Next Steps

1. **Set up Development**
   - Clone repository
   - Run `npm install`
   - Create `.env.local` with Firebase config
   - Run `npm start`

2. **Configure Deployment**
   - Follow DEPLOYMENT.md
   - Choose your platform
   - Set up GitHub Secrets
   - Test deployment

3. **Make Your First Changes**
   - Create feature branch
   - Make improvements
   - Create pull request
   - Verify CI/CD passes

4. **Engage Community**
   - Star the repository (if you like it!)
   - Share with others
   - Respond to issues
   - Review contributions

## Troubleshooting Setup

**Workflows not running?**
- Check .github/workflows/ files are in correct location
- Verify workflow file syntax (YML format)
- Check GitHub Actions are enabled (Settings → Actions)

**Secrets not loading?**
- Verify secrets are added under Settings → Secrets
- Check secret names match workflow file
- Restart workflows after adding secrets

**Tests failing in CI?**
- Run `npm test` locally first
- Check .eslintrc.json rules
- Verify all dependencies installed

## Support

Need help setting up?

1. Check [GitHub Docs](https://docs.github.com)
2. Review TROUBLESHOOTING.md
3. Check existing [Issues](https://github.com/siri09202-arch/survival-roulette/issues)
4. Open new issue with setup details

---

**Setup Status**: Complete! ✅

Your GitHub repository is now fully configured with:
- ✅ Professional documentation
- ✅ CI/CD pipelines
- ✅ Contribution guidelines
- ✅ Issue templates
- ✅ Configuration files
- ✅ Deployment guides

Ready to start development! 🚀
