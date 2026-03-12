# Deployment Guide

## Quick Start (Recommended: GitHub Pages + Vercel Backend)

### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy from project directory**:
```bash
cd ~/projects/ghost-phantom
vercel
```

4. **Add environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add secrets:
     - `TIKTOK_CLIENT_KEY`: Your TikTok app client key
     - `TIKTOK_CLIENT_SECRET`: Your TikTok app client secret

5. **Get your backend URL**:
   - Vercel will give you a URL like: `https://ghost-phantom.vercel.app`
   - Note this for the frontend config

### Step 2: Configure Frontend

1. **Create `config.js`** (copy from `config.example.js`):
```bash
cp config.example.js config.js
```

2. **Edit `config.js`** with your credentials:
```javascript
const CONFIG = {
    CLIENT_KEY: 'your_tiktok_client_key',
    REDIRECT_URI: 'https://bryceshaw13.github.io/ghost-phantom/',
    BACKEND_URL: 'https://ghost-phantom.vercel.app', // Your Vercel URL
    SCOPES: [
        'user.info.basic',
        'video.upload',
        'video.publish'
    ],
    API_BASE: 'https://open.tiktokapis.com',
    AUTH_URL: 'https://www.tiktok.com/v2/auth/authorize/',
    TOKEN_URL: 'https://open.tiktokapis.com/v2/oauth/token/'
};
```

### Step 3: Deploy Frontend to GitHub Pages

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: TikTok demo app"
```

2. **Create GitHub repository**:
   - Go to github.com/new
   - Repository name: `ghost-phantom`
   - Public repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/bryceshaw13/ghost-phantom.git
git branch -M main
git push -u origin main
```

4. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to "Pages" section
   - Source: `main` branch, `/ (root)` folder
   - Save

5. **Wait for deployment** (~2 minutes):
   - GitHub will build and deploy
   - Site will be live at: https://bryceshaw13.github.io/ghost-phantom/

### Step 4: Configure TikTok App Settings

1. Go to [TikTok Developer Portal](https://developers.tiktok.com)
2. Select your app
3. Add **Redirect URI**: `https://bryceshaw13.github.io/ghost-phantom/`
4. Enable **Scopes**:
   - `user.info.basic`
   - `video.upload`
   - `video.publish`
5. Save changes

### Step 5: Test the Integration

1. Open https://bryceshaw13.github.io/ghost-phantom/
2. Click "Login with TikTok"
3. Authorize the app
4. Select a video file
5. Upload to TikTok
6. Verify in TikTok Creator Studio

---

## Alternative: Local Testing

For local development before deployment:

1. **Create `config.js`** with localhost redirect:
```javascript
REDIRECT_URI: 'http://localhost:8000/'
```

2. **Add localhost to TikTok app** redirect URIs

3. **Run local server**:
```bash
python3 -m http.server 8000
```

4. **Open**: http://localhost:8000

---

## Troubleshooting

### "CORS Error" when exchanging token
- Make sure your Vercel backend is deployed
- Check that `BACKEND_URL` in config.js matches your Vercel URL
- Verify environment variables are set in Vercel dashboard

### "Redirect URI mismatch"
- Ensure `REDIRECT_URI` in config.js exactly matches what's registered in TikTok Developer Portal
- Check for trailing slashes (they must match exactly)

### "Invalid client_key"
- Verify CLIENT_KEY in config.js matches TikTok Developer Portal
- Make sure app is in "Live" status (not sandbox-only)

### Video upload fails
- Check file size (<50MB recommended for testing)
- Verify video format (MP4 is safest)
- Ensure TikTok account has Creator permissions

### Backend deployment issues
- Run `vercel --prod` to deploy to production
- Check Vercel logs: `vercel logs <deployment-url>`
- Verify environment variables in Vercel dashboard

---

## Recording the Demo Video

For TikTok app review, record:

1. **Opening the app** at https://bryceshaw13.github.io/ghost-phantom/
2. **OAuth flow**: Click "Login with TikTok" → authorization screen
3. **Grant permissions** → redirect back to app
4. **Upload video**: Select file → click upload
5. **Success confirmation** → "Video successfully uploaded"
6. **Verify in TikTok**: Open TikTok Creator Studio → show draft video

Use screen recording software:
- macOS: QuickTime Player (File → New Screen Recording)
- Windows: Windows Game Bar (Win + G)
- Chrome: Browser extensions or built-in screen capture

---

## Production Checklist

Before going live with real Phantom integration:

- [ ] Backend deployed to Vercel (or similar)
- [ ] Environment variables secured
- [ ] Frontend deployed to GitHub Pages
- [ ] TikTok app in "Live" status
- [ ] Redirect URIs configured
- [ ] Test OAuth flow
- [ ] Test video upload
- [ ] Verify draft appears in TikTok
- [ ] Record demo video for app review
- [ ] Submit app for review

---

**Questions?** Check the main README.md or TikTok developer documentation.
