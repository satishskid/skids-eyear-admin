# Netlify Deployment Guide - SKIDS EYEAR Mobile PWA

## 🚀 Automated CI/CD Deployment via GitHub

This guide explains how to deploy the SKIDS EYEAR Mobile PWA to Netlify using automated CI/CD with GitHub Actions.

---

## 📋 Prerequisites

1. **GitHub Repository** ✅
   - Your code is already in: `https://github.com/satishskid/skids-eyear-admin.git`

2. **Netlify Account** 
   - Sign up at: https://www.netlify.com
   - Free tier includes: 100GB bandwidth, 300 build minutes/month

3. **Node.js** ✅
   - Version 18+ (already configured)

---

## 🔧 Step-by-Step Setup

### Step 1: Create Netlify Account & Site

1. **Go to Netlify**
   ```
   https://app.netlify.com/signup
   ```

2. **Sign up with GitHub**
   - Click "Sign up with GitHub"
   - Authorize Netlify

3. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select repository: `satishskid/skids-eyear-admin`

4. **Configure Build Settings**
   - **Base directory:** `mobile-pwa`
   - **Build command:** `npm run build`
   - **Publish directory:** `mobile-pwa/dist`
   - Click "Deploy site"

### Step 2: Get Netlify Credentials

1. **Get Site ID**
   - Go to: Site settings → General → Site details
   - Copy "API ID" (this is your NETLIFY_SITE_ID)
   - Example: `abc123def-4567-8901-2345-6789abcdef01`

2. **Generate Personal Access Token**
   - Go to: User settings → Applications → Personal access tokens
   - Click "New access token"
   - Name it: `SKIDS_EYEAR_DEPLOY`
   - Copy the token (this is your NETLIFY_AUTH_TOKEN)
   - Example: `nfp_ABC123xyz...`

### Step 3: Configure GitHub Secrets

1. **Go to GitHub Repository Settings**
   ```
   https://github.com/satishskid/skids-eyear-admin/settings/secrets/actions
   ```

2. **Add Repository Secrets**
   
   **Secret 1: NETLIFY_AUTH_TOKEN**
   - Click "New repository secret"
   - Name: `NETLIFY_AUTH_TOKEN`
   - Value: Paste your Netlify personal access token
   - Click "Add secret"

   **Secret 2: NETLIFY_SITE_ID**
   - Click "New repository secret"
   - Name: `NETLIFY_SITE_ID`
   - Value: Paste your Netlify site ID (API ID)
   - Click "Add secret"

### Step 4: Enable GitHub Actions

The workflow is already configured in `.github/workflows/deploy.yml`

**What it does:**
- ✅ Runs on every push to `main` branch
- ✅ Runs on pull requests to `main`
- ✅ Installs dependencies
- ✅ Builds the app
- ✅ Runs tests (if available)
- ✅ Deploys to Netlify
- ✅ Posts deployment status

### Step 5: Deploy!

**Option A: Push to Main (Automatic)**
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

**Option B: Use Netlify CLI (Manual)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Build and deploy
cd mobile-pwa
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔄 How CI/CD Works

### Workflow Trigger
```
Developer pushes to GitHub
         ↓
GitHub Actions triggered
         ↓
Build process starts
         ↓
Tests run (if configured)
         ↓
Deploy to Netlify
         ↓
Live URL updated
```

### Build Process
1. **Checkout code** from GitHub
2. **Setup Node.js** v18
3. **Install dependencies** (`npm ci`)
4. **Build application** (`npm run build`)
5. **Run tests** (optional)
6. **Deploy to Netlify** (production or preview)
7. **Post deployment comment** on GitHub

---

## 📱 PWA Features on Netlify

### Automatic Configuration
The `netlify.toml` file configures:

1. **Build Settings**
   - Node.js v18
   - Build command: `npm run build`
   - Publish directory: `mobile-pwa/dist`

2. **SPA Routing**
   - Redirects all routes to `index.html`
   - Status code: 200 (SPA mode)

3. **Security Headers**
   - X-Frame-Options: DENY
   - X-XSS-Protection enabled
   - HSTS enabled
   - Content-Type-Options: nosniff

4. **PWA-Specific Headers**
   - Camera/microphone permissions (for tests)
   - Service Worker no-cache headers
   - Manifest file proper content-type

5. **Asset Optimization**
   - CSS/JS bundling and minification
   - Image compression
   - Asset caching (1 year)
   - Service Worker fresh on every load

---

## 🌐 Deployment URLs

### Production
```
https://[your-site-name].netlify.app
```

### Preview Deployments
Every pull request gets a preview URL:
```
https://deploy-preview-[PR-number]--[your-site-name].netlify.app
```

### Branch Deployments
Every branch gets a unique URL:
```
https://[branch-name]--[your-site-name].netlify.app
```

---

## 🔧 Custom Domain Setup (Optional)

### Add Custom Domain

1. **Go to Site Settings**
   - Domain management → Add custom domain

2. **Enter Your Domain**
   - Example: `screening.skidseyear.org`

3. **Configure DNS**
   
   **Option A: Netlify DNS (Recommended)**
   - Point nameservers to Netlify
   - Automatic SSL certificate
   - Fastest setup

   **Option B: External DNS**
   - Add CNAME record:
     ```
     screening.skidseyear.org → [your-site-name].netlify.app
     ```
   - Or A record to Netlify's load balancer IP

4. **Enable HTTPS**
   - Automatic with Let's Encrypt
   - Free SSL certificate
   - Auto-renewal

---

## 🔐 Environment Variables

### Set Environment Variables in Netlify

1. **Go to Site Settings**
   - Build & deploy → Environment variables

2. **Add Variables**
   ```
   VITE_EMR_ENDPOINT=https://fhir.production.com/api/FHIR/R4
   VITE_ANALYTICS_ENDPOINT=https://analytics.skidseyear.org
   VITE_ENABLE_DEBUG=false
   ```

3. **Deploy**
   - Trigger new deployment to apply changes

---

## 📊 Monitoring & Analytics

### Netlify Analytics (Optional - Paid)
- Real-time visitor data
- Page views and bandwidth
- Top pages and sources

### Google Analytics Integration
Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Netlify Functions (For Backend)
Create serverless functions in `netlify/functions/`:
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions!' })
  };
};
```

---

## 🧪 Testing Deployments

### Preview Deployments
1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make changes and push:
   ```bash
   git push origin feature/new-feature
   ```

3. Create pull request on GitHub

4. Netlify automatically creates preview URL

5. Test preview deployment

6. Merge to main when ready

### Deploy Previews Include:
- ✅ Unique URL for each PR
- ✅ Automatic updates on new commits
- ✅ Comment on PR with deployment URL
- ✅ Deploy logs and build details

---

## 🚨 Troubleshooting

### Build Fails

**Check Build Logs**
1. Go to Netlify dashboard
2. Click on failed deployment
3. View build logs

**Common Issues:**

1. **Node version mismatch**
   ```toml
   # netlify.toml
   [build.environment]
   NODE_VERSION = "18"
   ```

2. **Missing dependencies**
   ```bash
   # Ensure package-lock.json is committed
   git add package-lock.json
   git commit -m "Add package-lock.json"
   ```

3. **Build command error**
   ```toml
   # Check netlify.toml
   [build]
   command = "cd mobile-pwa && npm install && npm run build"
   ```

### Deploy Fails

1. **Check Netlify Auth Token**
   - Regenerate token in Netlify
   - Update GitHub secret

2. **Check Site ID**
   - Verify NETLIFY_SITE_ID in GitHub secrets
   - Should match Site Settings → API ID

3. **Check GitHub Actions**
   - Go to Actions tab
   - View workflow run logs

### Service Worker Issues

1. **Clear Service Worker Cache**
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   ```

2. **Hard Reload**
   - Chrome: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - Firefox: Ctrl+F5

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Code committed to GitHub
- [x] Build succeeds locally (`npm run build`)
- [x] No console errors
- [x] Environment variables configured
- [ ] Netlify account created
- [ ] GitHub secrets configured

### Post-Deployment
- [ ] Test production URL
- [ ] Verify PWA install prompt
- [ ] Test offline functionality
- [ ] Check camera/microphone permissions
- [ ] Test on mobile devices
- [ ] Verify SSL certificate
- [ ] Test all screening workflows

### Optional Enhancements
- [ ] Configure custom domain
- [ ] Set up analytics
- [ ] Enable form submissions
- [ ] Configure serverless functions
- [ ] Set up notifications

---

## 🔄 Continuous Deployment Workflow

```
┌─────────────────────────────────────────┐
│  Developer makes changes locally        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  git commit -m "Update feature"         │
│  git push origin main                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  GitHub Actions triggered automatically │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  1. Checkout code                       │
│  2. Install Node.js                     │
│  3. Install dependencies (npm ci)       │
│  4. Build application (npm run build)   │
│  5. Run tests (optional)                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Deploy to Netlify                      │
│  - Upload dist/ folder                  │
│  - Configure headers                    │
│  - Set up redirects                     │
│  - Enable HTTPS                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  ✅ Live at: your-site.netlify.app      │
│  📱 PWA ready for installation          │
│  🔒 HTTPS enabled                       │
│  ⚡ Service Worker active               │
└─────────────────────────────────────────┘
```

---

## 📞 Support Resources

### Netlify Documentation
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://www.netlifystatus.com

### GitHub Actions
- Docs: https://docs.github.com/en/actions
- Marketplace: https://github.com/marketplace?type=actions

### SKIDS EYEAR
- Repository: https://github.com/satishskid/skids-eyear-admin
- Issues: https://github.com/satishskid/skids-eyear-admin/issues

---

## 🎉 Success!

Once deployed, your SKIDS EYEAR Mobile PWA will be:

✅ **Automatically deployed** on every push to main  
✅ **Preview deployments** for every pull request  
✅ **HTTPS enabled** with automatic SSL  
✅ **PWA installable** on mobile devices  
✅ **Offline capable** with service workers  
✅ **Globally distributed** via Netlify CDN  
✅ **Performance optimized** with asset caching  

---

**Document Version:** 1.0  
**Last Updated:** October 17, 2025  
**Deployment Method:** Netlify + GitHub Actions  
**Status:** Ready for Production
