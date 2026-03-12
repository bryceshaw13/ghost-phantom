# Ghost-Phantom TikTok Demo

Minimal TikTok OAuth + Content Posting API demo for TikTok Developer App Review.

## Purpose

This demo showcases:
1. **TikTok OAuth Login** using Login Kit
2. **Video Upload** via Content Posting API (sandbox mode)
3. **Draft Verification** in TikTok Creator Studio

This is a proof-of-concept for the full Phantom content publishing system.

## Setup Instructions

### 1. Configure TikTok App Credentials

1. Copy `config.example.js` to `config.js`
2. Fill in your TikTok app credentials from [developers.tiktok.com](https://developers.tiktok.com):
   - `CLIENT_KEY`: Your app's client key
   - `REDIRECT_URI`: Must match the registered redirect URI in TikTok Developer Portal

```javascript
const CONFIG = {
    CLIENT_KEY: 'your_actual_client_key',
    REDIRECT_URI: 'https://bryceshaw13.github.io/ghost-phantom/',
    SCOPES: ['user.info.basic', 'video.upload', 'video.publish'],
    // ... rest of config
};
```

### 2. Deploy to GitHub Pages

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: TikTok OAuth demo"

# Create GitHub repository 'ghost-phantom' at github.com/bryceshaw13/ghost-phantom
# Then push:
git remote add origin https://github.com/bryceshaw13/ghost-phantom.git
git branch -M main
git push -u origin main

# Enable GitHub Pages in repository settings:
# Settings → Pages → Source: main branch, / (root)
```

### 3. Configure TikTok Developer Portal

In your TikTok app settings:
- **Redirect URI**: Add `https://bryceshaw13.github.io/ghost-phantom/`
- **Scopes**: Enable:
  - `user.info.basic`
  - `video.upload`
  - `video.publish`

### 4. Test the Flow

1. Open https://bryceshaw13.github.io/ghost-phantom/
2. Click "Login with TikTok"
3. Authorize the app
4. Upload a test video (MP4, <50MB recommended)
5. Verify draft appears in TikTok Creator Studio

## For App Review Video

Record a screen capture showing:
1. Opening the demo URL
2. Clicking "Login with TikTok" → OAuth authorization screen
3. Granting permissions
4. Selecting and uploading a video file
5. Success confirmation
6. Opening TikTok app/Creator Studio showing the draft video

## Important Notes

### Security
- **Never commit `config.js`** (it's in .gitignore)
- In production, token exchange MUST happen server-side
- This demo uses client-side code for simplicity

### Backend Proxy (Production)
For the full Phantom system, you'll need a backend to:
- Handle OAuth token exchange (protect `client_secret`)
- Store access/refresh tokens securely
- Manage rate limits and retries

### File Structure
```
ghost-phantom/
├── index.html          # Main UI
├── app.js              # Application logic
├── config.example.js   # Template configuration
├── config.js           # Your actual config (gitignored)
└── README.md           # This file
```

## Next Steps After Approval

Once TikTok approves the app:
1. Build proper Pulse agent (content distribution worker)
2. Implement backend API proxy
3. Add secure credential storage
4. Integrate with Phantom approval queue
5. Enable automated publishing from approved content

## Links
- TikTok Developer Portal: https://developers.tiktok.com
- Content Posting API Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
- Login Kit Docs: https://developers.tiktok.com/doc/login-kit-web

---

**Ghost-Phantom System** | OpenClaw Multi-Agent Architecture
