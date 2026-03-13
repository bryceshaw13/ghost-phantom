// Vercel Serverless Function for TikTok Video Upload Status Check

export default async function handler(req, res) {
    console.log('=== Upload Status Check Request ===');
    
    // Enable CORS
    const allowedOrigins = [
        'https://bryceshaw13.github.io',
        'http://localhost:8000'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { access_token, publish_id } = req.body;
        
        if (!access_token || !publish_id) {
            return res.status(400).json({ 
                error: 'Missing required parameters'
            });
        }
        
        console.log('Checking upload status for publish_id:', publish_id);
        
        const response = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publish_id: publish_id
            })
        });
        
        const data = await response.json();
        console.log('TikTok status response:', JSON.stringify(data, null, 2));
        
        if (data.error && data.error.code !== 'ok') {
            return res.status(400).json({
                error: data.error.code || 'status_check_failed',
                error_description: data.error.message,
                full_response: data
            });
        }
        
        res.status(200).json({
            status: data.data.status,
            fail_reason: data.data.fail_reason
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
