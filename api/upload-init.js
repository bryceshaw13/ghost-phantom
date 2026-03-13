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
        
        // TikTok requires: (1) minimum 4+ chunks, (2) chunk size as power of 2
        // Use 2MB chunks (2^21 bytes) for small videos to satisfy both requirements
        let chunkSize;
        if (video_size < 20 * 1024 * 1024) {
            // For videos under 20MB, use 2MB chunks (power of 2, ensures 4+ chunks)
            chunkSize = 2 * 1024 * 1024;
        } else if (video_size < 64 * 1024 * 1024) {
            // For 20-64MB videos, use 8MB chunks (power of 2)
            chunkSize = 8 * 1024 * 1024;
        } else {
            // For larger videos, use 16MB chunks (power of 2)
            chunkSize = 16 * 1024 * 1024;
        }
        
        const totalChunks = Math.ceil(video_size / chunkSize);
        
        console.log('Initializing TikTok video upload...');
        console.log('Video size:', video_size, 'bytes', `(${(video_size / 1024 / 1024).toFixed(2)} MB)`);
        console.log('Chunk size:', chunkSize, 'bytes', `(${(chunkSize / 1024 / 1024).toFixed(2)} MB)`);
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
            upload_url: data.data.upload_url,
            chunk_size: chunkSize // Return chunk size so frontend knows how to split
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
