// Vercel Serverless Function for TikTok OAuth token exchange
// Deploy this to handle secure server-side token exchange

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { code, redirect_uri } = req.body;
        
        if (!code || !redirect_uri) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Get credentials from environment variables
        const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
        const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
        
        if (!CLIENT_KEY || !CLIENT_SECRET) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        // Exchange code for access token
        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            },
            body: new URLSearchParams({
                client_key: CLIENT_KEY,
                client_secret: CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirect_uri
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            return res.status(400).json({
                error: tokenData.error,
                error_description: tokenData.error_description
            });
        }
        
        // Return tokens to client
        res.status(200).json({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
            open_id: tokenData.open_id
        });
        
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
