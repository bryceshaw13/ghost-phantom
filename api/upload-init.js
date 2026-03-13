// Vercel Serverless Function for TikTok Video Upload Initialization

export default async function handler(req, res) {
    console.log('=== Video Upload Init Request ===');
    console.log('Request method:', req.method);
    console.log('Request origin:', req.headers.origin);
    
    // Enable CORS for GitHub Pages domain
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
        console.log('OPTIONS request - returning 200');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        console.log('Invalid method:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        console.log('Request body:', JSON.stringify(req.body));
        const { access_token, video_size, chunk_size, total_chunk_count } = req.body;
        
        if (!access_token || !video_size) {
            console.log('Missing parameters');
            return res.status(400).json({ 
                error: 'Missing required parameters',
                received: { 
                    access_token: !!access_token,
                    video_size: !!video_size
                }
            });
        }
        
        const chunkSize = chunk_size || 10 * 1024 * 1024; // 10MB default
        const totalChunks = total_chunk_count || Math.ceil(video_size / chunkSize);
        
        console.log('Initializing TikTok video upload...');
        console.log('Video size:', video_size, 'bytes');
        console.log('Chunk size:', chunkSize, 'bytes');
        console.log('Total chunks:', totalChunks);
        
        const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_info: {
                    title: 'Demo video from Ghost-Phantom',
                    privacy_level: 'SELF_ONLY',
                    disable_comment: false,
                    disable_duet: false,
                    disable_stitch: false,
                    video_cover_timestamp_ms: 1000
                },
                source_info: {
                    source: 'FILE_UPLOAD',
                    video_size: video_size,
                    chunk_size: chunkSize,
                    total_chunk_count: totalChunks
                }
            })
        });
        
        console.log('TikTok API response status:', response.status);
        const data = await response.json();
        console.log('TikTok API response:', JSON.stringify(data, null, 2));
        
        if (data.error && data.error.code !== 'ok') {
            console.log('TikTok API error:', data.error);
            return res.status(400).json({
                error: data.error.code || 'upload_init_failed',
                error_description: data.error.message || 'Failed to initialize upload',
                full_response: data
            });
        }
        
        console.log('✓ Upload initialized successfully');
        res.status(200).json({
            publish_id: data.data.publish_id,
            upload_url: data.data.upload_url
        });
        
    } catch (error) {
        console.error('=== UPLOAD INIT ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
