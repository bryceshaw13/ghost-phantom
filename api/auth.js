// Vercel Serverless Function for TikTok OAuth token exchange
// Deploy this to handle secure server-side token exchange

export default async function handler(req, res) {
    console.log('=== Token Exchange Request Started ===');
    console.log('Request method:', req.method);
    console.log('Request origin:', req.headers.origin);
    
    // Enable CORS for GitHub Pages domain
    const allowedOrigins = [
        'https://bryceshaw13.github.io',
        'http://localhost:8000' // For local testing
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS request - returning 200');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        console.log('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('Request body:', JSON.stringify(req.body));
        const { code, redirect_uri } = req.body;
        
        console.log('Validating request parameters...');
        if (!code || !redirect_uri) {
            console.log('ERROR: Missing parameters - code:', !!code, 'redirect_uri:', !!redirect_uri);
            return res.status(400).json({ 
                error: 'Missing required parameters',
                received: { code: !!code, redirect_uri: !!redirect_uri }
            });
        }
        console.log('✓ Parameters validated');
        
        // Get credentials from environment variables
        const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
        const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
        
        console.log('Environment variables check:');
        console.log('- CLIENT_KEY exists:', !!CLIENT_KEY);
        console.log('- CLIENT_KEY value:', CLIENT_KEY ? CLIENT_KEY.substring(0, 10) + '...' : 'MISSING');
        console.log('- CLIENT_SECRET exists:', !!CLIENT_SECRET);
        console.log('- CLIENT_SECRET length:', CLIENT_SECRET ? CLIENT_SECRET.length : 0);
        
        if (!CLIENT_KEY || !CLIENT_SECRET) {
            console.log('ERROR: Missing environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                hasClientKey: !!CLIENT_KEY,
                hasClientSecret: !!CLIENT_SECRET
            });
        }
        console.log('✓ Environment variables validated');
        
        // Exchange code for access token
        const requestBody = {
            client_key: CLIENT_KEY,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirect_uri
        };
        
        console.log('=== Calling TikTok Token API ===');
        console.log('URL: https://open.tiktokapis.com/v2/oauth/token/');
        console.log('Request body:', {
            client_key: CLIENT_KEY.substring(0, 10) + '...',
            client_secret: '***HIDDEN***',
            code: code.substring(0, 20) + '...',
            grant_type: 'authorization_code',
            redirect_uri: redirect_uri
        });
        
        const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            },
            body: new URLSearchParams(requestBody)
        });
        
        console.log('TikTok API response status:', tokenResponse.status);
        console.log('TikTok API response headers:', JSON.stringify([...tokenResponse.headers.entries()]));
        
        const tokenData = await tokenResponse.json();
        console.log('TikTok API full response:', JSON.stringify(tokenData, null, 2));
        
        if (tokenData.error) {
            console.log('ERROR: TikTok API returned error');
            console.log('Error code:', tokenData.error);
            console.log('Error description:', tokenData.error_description);
            console.log('Full error response:', JSON.stringify(tokenData, null, 2));
            
            return res.status(400).json({
                error: tokenData.error,
                error_description: tokenData.error_description,
                full_response: tokenData
            });
        }
        
        console.log('✓ Token exchange successful!');
        console.log('- Access token received:', !!tokenData.access_token);
        console.log('- Open ID:', tokenData.open_id);
        
        // Return tokens to client
        res.status(200).json({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
            open_id: tokenData.open_id
        });
        
        console.log('=== Token Exchange Complete ===');
        
    } catch (error) {
        console.error('=== FATAL ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            type: error.constructor.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
