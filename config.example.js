// TikTok API Configuration
// Copy this to config.js and fill in your actual credentials from developers.tiktok.com

const CONFIG = {
    // Your TikTok App credentials
    CLIENT_KEY: 'your_client_key_here',
    
    // Backend proxy URL (Vercel deployment)
    // This handles secure token exchange server-side
    BACKEND_URL: 'https://ghost-phantom.vercel.app',
    
    // Redirect URI must match what's registered in TikTok Developer Portal
    REDIRECT_URI: 'https://bryceshaw13.github.io/ghost-phantom/',
    
    // OAuth scopes needed for content posting
    SCOPES: [
        'user.info.basic',
        'video.upload',
        'video.publish'
    ],
    
    // API endpoints
    API_BASE: 'https://open.tiktokapis.com',
    AUTH_URL: 'https://www.tiktok.com/v2/auth/authorize/',
    TOKEN_URL: 'https://open.tiktokapis.com/v2/oauth/token/'
};
