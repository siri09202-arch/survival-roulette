# Deployment Guide

This guide covers deploying Survival Roulette to various platforms.

## Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Firebase project (for backend)

## Build Process

### Local Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused packages
npm ls --depth=0
```

## Deployment Platforms

### 1. Firebase Hosting (Recommended)

**Best for**: Full Firebase integration, automatic scaling, free tier available

#### Setup

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Authenticate**
```bash
firebase login
```

3. **Initialize Firebase project**
```bash
firebase init hosting
```

Select your existing Firebase project and configure:
- Public directory: `build`
- Single-page app: `yes`

4. **Create .firebaserc**
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

5. **Update firebase.json**
```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.{js,css,png,gif,jpg,jpeg,svg,eot,otf,ttf,ttc,woff,woff2,font.css}",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=0"
          }
        ]
      }
    ]
  }
}
```

#### Deploy

```bash
# Development
npm run build
firebase hosting:channel:deploy staging

# Production
npm run build
firebase deploy --only hosting
```

### 2. Vercel (Recommended)

**Best for**: Seamless GitHub integration, automatic deployments, fast CDN

#### Setup

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

Follow the prompts to:
- Link to GitHub repository
- Set production branch (main)
- Configure environment variables

3. **Set Environment Variables**
```bash
vercel env add REACT_APP_FIREBASE_API_KEY
# Add all Firebase configuration variables
```

4. **Automatic Deployments**
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

#### Deploy Command

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 3. Netlify

**Best for**: Simple deployment, continuous deployment from Git

#### Setup

1. **Connect GitHub**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: 16 or higher

3. **Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add all `REACT_APP_*` variables

4. **Deploy Settings**
   ```toml
   # netlify.toml
   [build]
   command = "npm run build"
   publish = "build"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200

   [build.environment]
   NODE_VERSION = "18"
   ```

#### Automatic Deployments

- Push to main branch → Auto deploys to production
- Create pull request → Preview deployment created

### 4. GitHub Pages

**Best for**: Free hosting, simple setup

#### Setup

1. **Update package.json**
```json
{
  "homepage": "https://username.github.io/survival-roulette",
  "scripts": {
    "deploy": "npm run build && gh-pages -d build"
  }
}
```

2. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

3. **Deploy**
```bash
npm run deploy
```

4. **Configure GitHub**
   - Go to repository Settings
   - Pages → Source: gh-pages branch
   - Save

#### Limitations
- No server-side rendering
- Limited to static files
- No custom server configuration

### 5. AWS Amplify

**Best for**: AWS ecosystem integration, serverless functions

#### Setup

1. **Install Amplify CLI**
```bash
npm install -g @aws-amplify/cli
```

2. **Initialize**
```bash
amplify init
```

3. **Add Hosting**
```bash
amplify add hosting
```

Choose "Hosting with Amplify Console"

4. **Environment Variables**
```bash
amplify env add
```

5. **Deploy**
```bash
amplify publish
```

### 6. Docker + AWS / Google Cloud

**Best for**: Custom infrastructure, microservices

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY public ./public
COPY src ./src
COPY package*.json ./
COPY .env.production .env.production

RUN npm run build

# Serve with a simple HTTP server
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

#### Build and Push

```bash
# Build
docker build -t survival-roulette:latest .

# Push to Docker Hub
docker tag survival-roulette:latest username/survival-roulette:latest
docker push username/survival-roulette:latest

# Deploy to cloud platform
# AWS: aws ecs create-service ...
# Google Cloud: gcloud run deploy ...
```

## Environment Variables for Deployment

### Firebase Configuration

All deployment platforms require Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_FIREBASE_MEASUREMENT_ID=xxx
```

**Never commit `.env` files!** Use platform-specific secret management.

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev source-map-explorer
npx source-map-explorer 'build/static/js/*.js'
```

### Code Splitting

Implement lazy loading for large components:

```javascript
import React, { Suspense } from 'react';

const GameBoard = React.lazy(() => import('./GameBoard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameBoard />
    </Suspense>
  );
}
```

### Caching Strategy

Set proper cache headers:

```javascript
// Cache static assets for 1 year
max-age: 31536000

// Don't cache HTML
max-age: 0
```

## Monitoring & Analytics

### Firebase Analytics

```javascript
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics(app);
logEvent(analytics, "game_started", {
  players: playerCount,
  mode: gameMode
});
```

### Error Tracking (Sentry)

```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});
```

### Performance Monitoring

Use Web Vitals:

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

## Troubleshooting

### Common Issues

**Issue**: Build fails with "module not found"
```bash
# Solution: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Firebase config not loading
```bash
# Check environment variables are set
echo $REACT_APP_FIREBASE_API_KEY

# Rebuild required after env changes
npm run build
```

**Issue**: Deployment fails - Firebase rules too strict
```bash
# Update Firebase Firestore rules in console
# Allow read/write for development:
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if request.auth != null;
  }
}
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Firebase security rules set appropriately
- [ ] SSL/HTTPS enabled
- [ ] Build succeeds without warnings
- [ ] All tests pass
- [ ] CHANGELOG updated
- [ ] Version tag created
- [ ] Documentation updated
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Performance monitoring active
- [ ] Backup strategy in place

---

For questions, refer to platform-specific documentation or open a GitHub issue.
