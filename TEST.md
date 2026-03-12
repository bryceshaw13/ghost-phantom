# Testing Checklist

## Pre-Deployment Tests

### Local Testing (Optional)

1. **Setup local server**:
```bash
python3 -m http.server 8000
```

2. **Update TikTok app** with local redirect:
   - Add `http://localhost:8000/` to Redirect URIs

3. **Update config.js**:
```javascript
REDIRECT_URI: 'http://localhost:8000/'
```

4. **Test OAuth flow**:
   - Open http://localhost:8000
   - Click "Login with TikTok"
   - Should redirect to TikTok authorization
   - Authorize → should redirect back

---

## Post-Deployment Tests

### 1. Backend Health Check

```bash
# Test backend is responding
curl https://YOUR-VERCEL-URL.vercel.app/api/auth \
  -X OPTIONS \
  -H "Content-Type: application/json"

# Should return 200 OK with CORS headers
```

### 2. Frontend Deployment

1. Open: https://bryceshaw13.github.io/ghost-phantom/
2. Check for:
   - Page loads correctly
   - No console errors
   - UI displays properly
   - "Login with TikTok" button visible

### 3. OAuth Flow

1. Click "Login with TikTok"
2. **Expected**: Redirects to TikTok authorization page
3. **If not**: Check `CLIENT_KEY` in config.js and TikTok app settings

4. Authorize the app
5. **Expected**: Redirects back to your app
6. **Expected**: Shows "✅ Successfully authenticated"
7. **Expected**: Shows your TikTok username/ID

**Troubleshooting OAuth:**
- Open browser console (F12)
- Look for errors in Network tab
- Check redirect URI matches exactly
- Verify CSRF state validation

### 4. File Upload UI

1. After login, Step 2 should be visible
2. Click "📹 Choose Video File"
3. Select a video (MP4 recommended, <50MB for testing)
4. **Expected**: Shows file name and size
5. **Expected**: "Upload to TikTok Sandbox" button appears

### 5. Video Upload (Full Integration Test)

1. Click "Upload to TikTok Sandbox"
2. **Expected**: Shows upload progress
3. **Expected**: "Processing on TikTok servers..." message
4. **Expected**: "✅ Video successfully uploaded to TikTok drafts!"
5. **Expected**: Step 3 shows "Verification Complete"

6. Open TikTok Creator Studio:
   - Web: https://www.tiktok.com/creator-tools/content
   - Mobile: TikTok app → Profile → ☰ → Creator tools
7. **Expected**: Video appears in Drafts
8. **Expected**: Title: "Demo video from Ghost-Phantom"
9. **Expected**: Privacy: Self only (draft mode)

---

## Common Issues & Fixes

### Issue: "Failed to exchange token"
**Cause**: Backend not configured properly  
**Fix**:
1. Check Vercel environment variables
2. Redeploy: `vercel --prod`
3. Check backend logs: `vercel logs`

### Issue: "CORS Error"
**Cause**: Backend URL mismatch  
**Fix**:
1. Verify `BACKEND_URL` in config.js matches Vercel URL
2. Check Vercel deployment is production (not preview)

### Issue: "Redirect URI mismatch"
**Cause**: TikTok app settings don't match config  
**Fix**:
1. Ensure exact match in TikTok Developer Portal
2. Include or exclude trailing slash consistently
3. Check for http vs https

### Issue: "Invalid scope"
**Cause**: TikTok app doesn't have required scopes  
**Fix**:
1. Go to TikTok Developer Portal
2. Enable: user.info.basic, video.upload, video.publish
3. Save and wait 5 minutes

### Issue: Upload starts but never completes
**Cause**: Large file or slow connection  
**Fix**:
1. Try smaller video (<10MB)
2. Check network tab for failed requests
3. Verify TikTok API rate limits not exceeded

### Issue: Video doesn't appear in drafts
**Cause**: Upload succeeded but status check failed  
**Fix**:
1. Wait 2-3 minutes
2. Refresh TikTok Creator Studio
3. Check "All" tab in Creator tools
4. Video might be processing

---

## Test Video Recommendations

For fastest testing:
- **Format**: MP4 (H.264 video, AAC audio)
- **Size**: 5-10 MB
- **Duration**: 15-30 seconds
- **Resolution**: 720p or 1080p vertical (9:16 ratio)

Sample test video command (create a simple test):
```bash
# macOS: Create a 10-second test video
# (Requires ffmpeg: brew install ffmpeg)
ffmpeg -f lavfi -i color=c=blue:s=720x1280:d=10 \
  -vf "drawtext=text='TikTok Test Video':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -t 10 -pix_fmt yuv420p test-video.mp4
```

---

## Success Criteria

All checks must pass:

- [ ] Local/hosted page loads without errors
- [ ] OAuth redirect to TikTok works
- [ ] Authorization succeeds and redirects back
- [ ] User info displays correctly
- [ ] File selection works
- [ ] Upload progress shows
- [ ] Upload completes successfully
- [ ] Video appears in TikTok drafts
- [ ] No console errors throughout flow

Once all pass → **ready to record demo video for app review**

---

## Demo Video Recording Checklist

Before recording:
- [ ] Clear browser cookies/cache (fresh session)
- [ ] Prepare test video file in Downloads
- [ ] Have TikTok app/web logged in and ready
- [ ] Close unnecessary windows
- [ ] Enable Do Not Disturb (no notifications)

During recording:
- [ ] Start screen recording
- [ ] Navigate to app URL (show URL bar)
- [ ] Click "Login with TikTok"
- [ ] Show authorization screen
- [ ] Click "Authorize"
- [ ] Show successful redirect + user info
- [ ] Select test video
- [ ] Show file name/size
- [ ] Click "Upload to TikTok Sandbox"
- [ ] Show upload progress
- [ ] Show success message
- [ ] Switch to TikTok Creator Studio
- [ ] Show draft video
- [ ] Stop recording

Recommended tools:
- **macOS**: QuickTime Player (⌘+N for screen recording)
- **Windows**: Xbox Game Bar (Win+G)
- **Chrome**: Extensions or built-in capture

Export as MP4, upload with app review submission.

---

**Questions?** Refer to DEPLOYMENT.md for detailed troubleshooting.
