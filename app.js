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
    
    // Check for actual errors (not TikTok's success response with error.code='ok')
    if (data.error && typeof data.error === 'string') {
        // OAuth error format: {error: "invalid_grant", error_description: "..."}
        console.error('Backend returned error:', data);
        const errorMessage = data.error_description || data.error || 'Unknown backend error';
        console.error('Throwing error with message:', errorMessage);
        throw new Error(errorMessage);
    }
    
    if (data.error && data.error.code && data.error.code !== 'ok') {
        // TikTok error format: {error: {code: "...", message: "..."}}
        console.error('Backend returned TikTok API error:', data.error);
        throw new Error(data.error.message || data.error.code);
    }
    
    if (!response.ok) {
        console.error('Response not OK. Status:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('Token exchange successful! Setting access token...');
    accessToken = data.access_token;
    console.log('Access token set:', !!accessToken);
    
    if (!accessToken) {
        console.error('Backend response missing access_token:', data);
        throw new Error('Backend did not return an access token');
    }
    
    // Fetch user info
    console.log('Proceeding to fetch user info...');
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
    console.log('=== Fetching User Info ===');
    console.log('Access token:', accessToken ? accessToken.substring(0, 20) + '...' : 'MISSING');
    console.log('API URL:', `${CONFIG.API_BASE}/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`);
    
    let response;
    try {
        response = await fetch(`${CONFIG.API_BASE}/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('User info response status:', response.status);
    } catch (fetchError) {
        console.error('FETCH USER INFO FAILED:', fetchError);
        throw new Error(`Failed to fetch user info: ${fetchError.message}`);
    }
    
    let data;
    try {
        data = await response.json();
        console.log('User info response data:', data);
    } catch (jsonError) {
        console.error('JSON PARSE FAILED:', jsonError);
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from TikTok user info API');
    }
    
    if (data.error && data.error.code !== 'ok') {
        console.error('TikTok user info API error:', data.error);
        throw new Error(data.error.message || data.error.code || 'User info fetch failed');
    }
    
    if (data.error && data.error.code === 'ok') {
        console.log('✓ TikTok API success (error.code = "ok")');
    }
    
    if (!data.data || !data.data.user) {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response structure from TikTok');
    }
    
    userData = data.data.user;
    console.log('✓ User info fetched successfully:', userData);
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
        await uploadVideoChunks(initResponse.upload_url, initResponse.chunk_size);
        
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
    console.log('=== Initializing Upload ===');
    console.log('Video size:', selectedFile.size, 'bytes', `(${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    
    const backendUrl = CONFIG.BACKEND_URL || 'https://ghost-phantom-navy.vercel.app';
    console.log('Calling backend:', `${backendUrl}/api/upload-init`);
    
    // Backend will calculate appropriate chunk size based on video size
    const response = await fetch(`${backendUrl}/api/upload-init`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            access_token: accessToken,
            video_size: selectedFile.size
        })
    });
    
    console.log('Upload init response status:', response.status);
    const data = await response.json();
    console.log('Upload init response data:', data);
    
    if (data.error) {
        console.error('Upload init error:', data);
        throw new Error(data.error_description || data.error);
    }
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✓ Upload initialized');
    console.log('Publish ID:', data.publish_id);
    console.log('Upload URL:', data.upload_url);
    console.log('Chunk size:', data.chunk_size, 'bytes');
    
    return {
        publish_id: data.publish_id,
        upload_url: data.upload_url,
        chunk_size: data.chunk_size
    };
}

/**
 * Upload video in chunks
 */
async function uploadVideoChunks(uploadUrl, chunkSize) {
    console.log('=== Uploading Video Chunks ===');
    console.log('Upload URL:', uploadUrl);
    console.log('Chunk size:', chunkSize, 'bytes');
    
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    console.log('Total chunks to upload:', totalChunks);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);
        
        console.log(`Uploading chunk ${i + 1}/${totalChunks}: bytes ${start}-${end - 1}/${selectedFile.size}`);
        
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Range': `bytes ${start}-${end - 1}/${selectedFile.size}`,
                'Content-Type': selectedFile.type
            },
            body: chunk
        });
        
        console.log(`Chunk ${i + 1} upload response:`, uploadResponse.status, uploadResponse.statusText);
        
        if (!uploadResponse.ok) {
            throw new Error(`Chunk upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        showStatus('uploadStatus', `Uploading... ${progress}%`, '');
    }
    
    console.log('✓ All chunks uploaded successfully');
}

/**
 * Publish video to TikTok drafts
 */
async function publishVideo(publishId) {
    console.log('=== Publishing Video ===');
    console.log('Publish ID:', publishId);
    
    const backendUrl = CONFIG.BACKEND_URL || 'https://ghost-phantom-navy.vercel.app';
    
    // Poll for upload completion
    let maxAttempts = 30;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        console.log(`Status check attempt ${attempt + 1}/${maxAttempts}`);
        
        const response = await fetch(`${backendUrl}/api/upload-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token: accessToken,
                publish_id: publishId
            })
        });
        
        const data = await response.json();
        console.log('Status response:', data);
        
        if (data.error) {
            console.error('Status check error:', data);
            throw new Error(data.error_description || data.error);
        }
        
        const status = data.status;
        console.log('Upload status:', status);
        
        if (status === 'PUBLISH_COMPLETE') {
            console.log('✓ Upload complete!');
            return; // Success!
        } else if (status === 'FAILED') {
            console.error('Upload failed. Reason:', data.fail_reason);
            throw new Error(`Video upload failed: ${data.fail_reason || 'Unknown reason'}`);
        }
        
        // Still processing, wait and retry
        showStatus('uploadStatus', `Processing on TikTok servers... (${attempt + 1}/${maxAttempts})`, '');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempt++;
    }
    
    console.error('Upload timeout after', maxAttempts, 'attempts');
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
