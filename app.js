// Ghost-Phantom TikTok Demo - Main Application Logic

// State management
let accessToken = null;
let userData = null;
let selectedFile = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check if we're returning from OAuth redirect
    handleOAuthCallback();
});

/**
 * Initiates TikTok OAuth login flow
 */
function loginWithTikTok() {
    if (!CONFIG || !CONFIG.CLIENT_KEY) {
        showStatus('loginStatus', 'Please configure your TikTok API credentials in config.js', 'error');
        return;
    }
    
    // Generate CSRF state token
    const csrfState = generateRandomString(32);
    sessionStorage.setItem('tiktok_csrf_state', csrfState);
    
    // Build authorization URL
    const params = new URLSearchParams({
        client_key: CONFIG.CLIENT_KEY,
        scope: CONFIG.SCOPES.join(','),
        response_type: 'code',
        redirect_uri: CONFIG.REDIRECT_URI,
        state: csrfState
    });
    
    const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
    
    // Redirect to TikTok authorization page
    window.location.href = authUrl;
}

/**
 * Handles OAuth callback after user authorizes
 */
async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // Handle authorization errors
    if (error) {
        showStatus('loginStatus', `Authorization failed: ${error}`, 'error');
        return;
    }
    
    // If no code, user hasn't logged in yet
    if (!code) {
        return;
    }
    
    // Verify CSRF state
    const savedState = sessionStorage.getItem('tiktok_csrf_state');
    if (state !== savedState) {
        showStatus('loginStatus', 'CSRF validation failed. Please try again.', 'error');
        return;
    }
    
    // Exchange authorization code for access token
    try {
        showStatus('loginStatus', 'Exchanging authorization code for access token...', '');
        
        // Note: In production, this should be done server-side to protect client_secret
        // For demo purposes, we'll use a backend proxy or client-side workaround
        await exchangeCodeForToken(code);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        const errorMsg = error.message || error.toString() || 'Unknown error occurred';
        showStatus('loginStatus', `Token exchange failed: ${errorMsg}`, 'error');
        console.error('=== FULL ERROR DETAILS ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error string:', error.toString());
    }
}

/**
 * Exchange authorization code for access token
 * Uses backend proxy to protect client_secret
 */
async function exchangeCodeForToken(code) {
    const backendUrl = CONFIG.BACKEND_URL || 'https://ghost-phantom.vercel.app';
    
    console.log('=== Token Exchange Debug ===');
    console.log('Backend URL:', backendUrl);
    console.log('Code received:', code.substring(0, 20) + '...');
    console.log('Redirect URI:', CONFIG.REDIRECT_URI);
    
    let response;
    try {
        console.log('Sending POST request to:', `${backendUrl}/api/auth`);
        response = await fetch(`${backendUrl}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: CONFIG.REDIRECT_URI
            })
        });
        console.log('Response received. Status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
    } catch (fetchError) {
        console.error('FETCH FAILED:', fetchError);
        console.error('Error name:', fetchError.name);
        console.error('Error message:', fetchError.message);
        throw new Error(`Network request failed: ${fetchError.message}. Check browser console for details.`);
    }
    
    let data;
    try {
        data = await response.json();
        console.log('Response data:', data);
    } catch (jsonError) {
        console.error('JSON PARSE FAILED:', jsonError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from backend');
    }
    
    if (data.error) {
        console.error('Backend returned error:', data);
        const errorMessage = data.error_description || data.error || 'Unknown backend error';
        console.error('Throwing error with message:', errorMessage);
        throw new Error(errorMessage);
    }
    
    if (!response.ok) {
        console.error('Response not OK. Status:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    accessToken = data.access_token;
    
    // Fetch user info
    await fetchUserInfo();
    
    // Update UI
    showStatus('loginStatus', '✅ Successfully authenticated with TikTok!', 'success');
    document.getElementById('userInfo').innerHTML = `
        <strong>Logged in as:</strong> ${userData.display_name}<br>
        <strong>User ID:</strong> ${userData.open_id}
    `;
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('loginBtn').disabled = true;
    document.getElementById('loginBtn').textContent = '✅ Logged In';
    
    // Show step 2
    document.getElementById('step2').classList.remove('hidden');
}

/**
 * Fetch TikTok user information
 */
async function fetchUserInfo() {
    const response = await fetch(`${CONFIG.API_BASE}/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    userData = data.data.user;
}

/**
 * Handle video file selection
 */
function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    
    if (!selectedFile) {
        return;
    }
    
    // Validate file
    if (!selectedFile.type.startsWith('video/')) {
        showStatus('uploadStatus', 'Please select a valid video file', 'error');
        selectedFile = null;
        return;
    }
    
    // Update UI
    const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    document.getElementById('fileInfo').innerHTML = `
        📹 <strong>${selectedFile.name}</strong><br>
        Size: ${sizeMB} MB | Type: ${selectedFile.type}
    `;
    document.getElementById('uploadBtn').classList.remove('hidden');
}

/**
 * Upload video to TikTok via Content Posting API
 */
async function uploadVideo() {
    if (!selectedFile) {
        showStatus('uploadStatus', 'Please select a video file first', 'error');
        return;
    }
    
    if (!accessToken) {
        showStatus('uploadStatus', 'Please login first', 'error');
        return;
    }
    
    try {
        showStatus('uploadStatus', 'Uploading video to TikTok sandbox...', '');
        document.getElementById('uploadBtn').disabled = true;
        
        // Step 1: Initialize upload
        const initResponse = await initializeUpload();
        
        // Step 2: Upload video chunks
        await uploadVideoChunks(initResponse.upload_url);
        
        // Step 3: Publish to drafts
        await publishVideo(initResponse.publish_id);
        
        // Success!
        showStatus('uploadStatus', '✅ Video successfully uploaded to TikTok drafts!', 'success');
        document.getElementById('step3').classList.remove('hidden');
        
    } catch (error) {
        showStatus('uploadStatus', `Upload failed: ${error.message}`, 'error');
        console.error('Upload error:', error);
        document.getElementById('uploadBtn').disabled = false;
    }
}

/**
 * Initialize TikTok video upload
 */
async function initializeUpload() {
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks (TikTok recommendation)
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    
    const response = await fetch(`${CONFIG.API_BASE}/v2/post/publish/video/init/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            post_info: {
                title: 'Demo video from Ghost-Phantom',
                privacy_level: 'SELF_ONLY', // Draft mode - appears in drafts inbox
                disable_comment: false,
                disable_duet: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: selectedFile.size,
                chunk_size: chunkSize,
                total_chunk_count: totalChunks
            }
        })
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data.data;
}

/**
 * Upload video in chunks
 */
async function uploadVideoChunks(uploadUrl) {
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);
        
        await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Range': `bytes ${start}-${end - 1}/${selectedFile.size}`,
                'Content-Type': selectedFile.type
            },
            body: chunk
        });
        
        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        showStatus('uploadStatus', `Uploading... ${progress}%`, '');
    }
}

/**
 * Publish video to TikTok drafts
 */
async function publishVideo(publishId) {
    // Poll for upload completion
    let maxAttempts = 30;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        const response = await fetch(`${CONFIG.API_BASE}/v2/post/publish/status/fetch/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publish_id: publishId
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        const status = data.data.status;
        
        if (status === 'PUBLISH_COMPLETE') {
            return; // Success!
        } else if (status === 'FAILED') {
            throw new Error('Video upload failed on TikTok servers');
        }
        
        // Still processing, wait and retry
        showStatus('uploadStatus', `Processing on TikTok servers... (${attempt + 1}/${maxAttempts})`, '');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempt++;
    }
    
    throw new Error('Upload timeout - check TikTok Creator Studio for status');
}

/**
 * Utility: Generate random string for CSRF tokens
 */
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Utility: Show status message
 */
function showStatus(elementId, message, type) {
    const statusEl = document.getElementById(elementId);
    statusEl.textContent = message;
    statusEl.className = 'status show';
    if (type) {
        statusEl.classList.add(type);
    }
}
