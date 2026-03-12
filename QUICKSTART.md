# Quick Start Guide

Get your TikTok demo running in 15 minutes.

## Prerequisites

- TikTok Developer account with an app created
- GitHub account
- Vercel account (free tier is fine)
- Git installed locally

## 5-Step Setup

### 1️⃣ Get Your TikTok Credentials

1. Go to [TikTok Developer Portal](https://developers.tiktok.com)
2. Select your app (or create one)
3. Copy your **Client Key** (you'll need this)
4. Copy your **Client Secret** (you'll need this)
5. Note: Keep these secret!

### 2️⃣ Deploy Backend (Vercel)

```bash
# Navigate to project
cd ~/projects/ghost-phantom

# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# When prompted:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ghost-phantom
# - Directory? ./ (just press Enter)
# - Override settings? No
```

After deployment:
1. Go to Vercel dashboard → your project → Settings → Environment Variables
2. Add:
   - Name: `TIKTOK_CLIENT_KEY`, Value: (your client key)
   - Name: `TIKTOK_CLIENT_SECRET`, Value: (your client secret)
3. Redeploy: `vercel --prod` again to apply env vars
4. **Copy your Vercel URL** (e.g., `https://ghost-phantom.vercel.app`)

### 3️⃣ Configure Frontend

```bash
# Create config file
cp config.example.js config.js

# Edit config.js
nano config.js  # or use your preferred editor
```

Update these values:
```javascript
CLIENT_KEY: 'awLIST_YOUR_ACTUAL_CLIENT_KEY_HERE',
BACKEND_URL: 'https://YOUR-VERCEL-URL.vercel.app',
REDIRECT_URI: 'https://bryceshaw13.github.io/ghost-phantom/',
```

Save and close.

### 4️⃣ Deploy to GitHub Pages

```bash
# Initialize git
git init
git add .
git commit -m "TikTok demo app for review"

# Create repo on GitHub: github.com/bryceshaw13/ghost-phantom
# Then push:
git remote add origin https://github.com/bryceshaw13/ghost-phantom.git
git branch -M main
git push -u origin main

# Enable GitHub Pages:
# 1. Go to repo Settings → Pages
# 2. Source: main branch, / (root)
# 3. Save
# 4. Wait ~2 minutes for deployment
```

### 5️⃣ Configure TikTok App

1. Go to [TikTok Developer Portal](https://developers.tiktok.com)
2. Select your app
3. **Redirect URIs** → Add: `https://bryceshaw13.github.io/ghost-phantom/`
4. **Scopes** → Enable:
   - `user.info.basic`
   - `video.upload`
   - `video.publish`
5. **Save changes**

---

## Test It!

1. Open: https://bryceshaw13.github.io/ghost-phantom/
2. Click **"Login with TikTok"**
3. Authorize the app
4. Select a video file (MP4, <50MB)
5. Click **"Upload to TikTok Sandbox"**
6. Check your **TikTok Creator Studio** → Drafts

---

## Record Demo Video

Use **QuickTime** (macOS) or **Windows Game Bar**:

1. Start screen recording
2. Open https://bryceshaw13.github.io/ghost-phantom/
3. Show OAuth login → authorize
4. Upload a test video
5. Show success message
6. Open TikTok app/web → show draft
7. Stop recording

Upload this video to TikTok app review.

---

## Troubleshooting

**"Failed to exchange token"**
→ Check Vercel environment variables are set correctly

**"Redirect URI mismatch"**
→ Ensure exact match (including trailing slash) in TikTok app settings

**"Upload failed"**
→ Check TikTok app has video.upload and video.publish scopes enabled

**Still stuck?**
→ Check DEPLOYMENT.md for detailed troubleshooting

---

**Total time: ~15 minutes** | Questions? Check README.md
