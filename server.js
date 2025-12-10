const http = require('http');
const https = require('https');
const crypto = require('crypto');
const WebSocket = require('ws');
const url = require('url');
const os = require('os');

// ============ CONFIGURATION ============
const PORT = process.env.PORT || 3000;
const RESTART_KEY = process.env.RESTART_KEY || 'yuta1111x-restart-secret';
const MAX_CONNECTIONS_PER_IP = parseInt(process.env.MAX_CONNECTIONS_PER_IP) || 10;
const CONNECTION_TIMEOUT = parseInt(process.env.CONNECTION_TIMEOUT) || 30000;
const HEARTBEAT_INTERVAL = parseInt(process.env.HEARTBEAT_INTERVAL) || 25000;
const MAX_TOTAL_CONNECTIONS = parseInt(process.env.MAX_TOTAL_CONNECTIONS) || 100;

// ============ STATISTICS ============
const stats = {
    startTime: Date.now(),
    totalConnections: 0,
    activeConnections: 0,
    messagesForwarded: 0,
    bytesTransferred: 0,
    errors: 0,
    restarts: 0
};

// ============ CONNECTION TRACKING ============
const connections = new Map();
const ipConnections = new Map();
let connectionId = 0;

// ============ LOGGING ============
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

const log = (level, ...args) => {
    if (LOG_LEVELS[level] >= LOG_LEVEL) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}]`, ...args);
    }
};

// ============ UTILITY FUNCTIONS ============
const getClientIP = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.socket?.remoteAddress ||
           'unknown';
};

const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

// ============ CUSTOM WEBSOCKET CONNECTION ============
// Creates WebSocket connection with exact browser-like headers
function createMooMooConnection(targetUrl, connId, onOpen, onMessage, onClose, onError) {
    const parsedUrl = new URL(targetUrl);
    const isSecure = parsedUrl.protocol === 'wss:';
    const host = parsedUrl.host;
    const path = parsedUrl.pathname + parsedUrl.search;
    
    // Generate WebSocket key
    const wsKey = crypto.randomBytes(16).toString('base64');
    
    // Exact headers that Chrome sends
    const headers = {
        'Host': host,
        'Connection': 'Upgrade',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Upgrade': 'websocket',
        'Origin': 'https://moomoo.io',
        'Sec-WebSocket-Version': '13',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-WebSocket-Key': wsKey,
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
    };
    
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isSecure ? 443 : 80),
        path: path || '/',
        method: 'GET',
        headers: headers,
        rejectUnauthorized: false,
        timeout: CONNECTION_TIMEOUT
    };
    
    log('DEBUG', `[${connId}] Connecting with headers:`, JSON.stringify(headers, null, 2));
    
    const httpModule = isSecure ? https : http;
    
    const req = httpModule.request(options);
    
    req.on('upgrade', (res, socket, head) => {
        log('INFO', `[${connId}] WebSocket upgrade successful`);
        
        // Create WebSocket from upgraded socket
        const ws = new WebSocket(null);
        ws.setSocket(socket, head, {
            maxPayload: 100 * 1024 * 1024,
            skipUTF8Validation: true
        });
        
        ws.on('open', onOpen);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        
        // Trigger open manually since socket is already connected
        onOpen(ws);
    });
    
    req.on('response', (res) => {
        log('ERROR', `[${connId}] HTTP response instead of upgrade: ${res.statusCode}`);
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            log('ERROR', `[${connId}] Response body: ${body.substring(0, 200)}`);
            onError(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        });
    });
    
    req.on('error', (err) => {
        log('ERROR', `[${connId}] Request error: ${err.message}`);
        onError(err);
    });
    
    req.on('timeout', () => {
        log('ERROR', `[${connId}] Connection timeout`);
        req.destroy();
        onError(new Error('Connection timeout'));
    });
    
    req.end();
    
    return req;
}

// ============ HTTP SERVER ============
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }
    
    if (path === '/clear' && query.key === RESTART_KEY) {
        let cleared = 0;
        connections.forEach((conn) => {
            try {
                conn.clientWs?.close(1000, 'Connections cleared');
                conn.serverWs?.close(1000, 'Connections cleared');
                cleared++;
            } catch (e) {}
        });
        ipConnections.clear();
        log('WARN', `Clear requested - closed ${cleared} connections`);
        stats.restarts++;
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, cleared }));
        return;
    }
    
    if (path === '/health') {
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            uptime: formatUptime(Date.now() - stats.startTime),
            connections: stats.activeConnections,
            memory: formatBytes(process.memoryUsage().heapUsed)
        }));
        return;
    }
    
    if (path === '/stats') {
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            server: {
                uptime: formatUptime(Date.now() - stats.startTime),
                nodeVersion: process.version,
                platform: os.platform()
            },
            connections: {
                active: stats.activeConnections,
                total: stats.totalConnections
            },
            traffic: {
                messages: stats.messagesForwarded,
                bytes: formatBytes(stats.bytesTransferred)
            },
            errors: stats.errors
        }, null, 2));
        return;
    }
    
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        name: 'MooMoo.io Proxy Server',
        version: '2.1.0',
        author: 'Yuta1111x',
        status: 'running',
        websocket: 'Connect with ?target=WSS_URL parameter'
    }, null, 2));
});

// ============ WEBSOCKET SERVER ============
const wss = new WebSocket.Server({ server });

log('INFO', `Starting MooMoo Proxy Server v2.1.0 on port ${PORT}`);
log('INFO', `Max connections per IP: ${MAX_CONNECTIONS_PER_IP}`);
log('INFO', `Max total connections: ${MAX_TOTAL_CONNECTIONS}`);

wss.on('connection', (clientWs, req) => {
    const clientIP = getClientIP(req);
    const params = url.parse(req.url, true).query;
    const targetUrl = params.target;
    const connId = ++connectionId;
    
    if (!targetUrl || (!targetUrl.startsWith('wss://') && !targetUrl.startsWith('ws://'))) {
        clientWs.close(1008, 'Invalid target URL');
        return;
    }
    
    if (stats.activeConnections >= MAX_TOTAL_CONNECTIONS) {
        clientWs.close(1013, 'Server at capacity');
        return;
    }
    
    const currentIPConns = ipConnections.get(clientIP) || 0;
    if (currentIPConns >= MAX_CONNECTIONS_PER_IP) {
        clientWs.close(1013, 'Too many connections');
        return;
    }
    
    stats.totalConnections++;
    stats.activeConnections++;
    ipConnections.set(clientIP, currentIPConns + 1);
    
    const conn = {
        clientWs,
        serverWs: null,
        ip: clientIP,
        startTime: Date.now(),
        messages: 0,
        bytes: 0,
        isAlive: true,
        cleaned: false
    };
    connections.set(connId, conn);
    
    log('INFO', `[${connId}] Connecting to ${targetUrl.split('?')[0]}...`);
    
    const cleanup = (reason) => {
        if (conn.cleaned) return;
        conn.cleaned = true;
        
        try { clientWs.close(); } catch (e) {}
        try { conn.serverWs?.close(); } catch (e) {}
        
        connections.delete(connId);
        stats.activeConnections = Math.max(0, stats.activeConnections - 1);
        
        const ipCount = ipConnections.get(clientIP) || 1;
        if (ipCount <= 1) ipConnections.delete(clientIP);
        else ipConnections.set(clientIP, ipCount - 1);
        
        log('INFO', `[${connId}] Disconnected (${reason}) - Messages: ${conn.messages}`);
    };
    
    // Parse target URL for host
    let targetHost = '';
    try {
        targetHost = new URL(targetUrl).host;
    } catch (e) {
        targetHost = targetUrl.replace('wss://', '').split('/')[0].split('?')[0];
    }
    
    // Use standard ws library connection with browser-like headers
    const serverWs = new WebSocket(targetUrl, {
        origin: 'https://moomoo.io',
        headers: {
            'Host': targetHost,
            'Origin': 'https://moomoo.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
            'Sec-WebSocket-Version': '13'
        },
        handshakeTimeout: CONNECTION_TIMEOUT,
        rejectUnauthorized: false,
        followRedirects: true
    });
    
    serverWs.binaryType = 'arraybuffer';
    conn.serverWs = serverWs;
    
    serverWs.on('open', () => {
        log('INFO', `[${connId}] Connected to MooMoo server`);
    });
    
    serverWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            try {
                clientWs.send(data);
                conn.messages++;
                conn.bytes += data.byteLength || data.length || 0;
                stats.messagesForwarded++;
                stats.bytesTransferred += data.byteLength || data.length || 0;
            } catch (e) {
                stats.errors++;
            }
        }
    });
    
    serverWs.on('close', (code) => cleanup(`server closed: ${code}`));
    serverWs.on('error', (err) => {
        log('ERROR', `[${connId}] Server error: ${err.message}`);
        stats.errors++;
        cleanup(`server error: ${err.message}`);
    });
    
    clientWs.on('message', (data) => {
        if (serverWs.readyState === WebSocket.OPEN) {
            try {
                serverWs.send(data);
                conn.messages++;
                conn.bytes += data.byteLength || data.length || 0;
                stats.messagesForwarded++;
                stats.bytesTransferred += data.byteLength || data.length || 0;
            } catch (e) {
                stats.errors++;
            }
        }
    });
    
    clientWs.on('close', (code) => cleanup(`client closed: ${code}`));
    clientWs.on('error', (err) => {
        stats.errors++;
        cleanup(`client error: ${err.message}`);
    });
});

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGTERM', () => {
    log('WARN', 'Shutting down...');
    connections.forEach((conn) => {
        try {
            conn.clientWs?.close(1001, 'Server shutting down');
            conn.serverWs?.close(1001, 'Server shutting down');
        } catch (e) {}
    });
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
});

process.on('uncaughtException', (err) => {
    log('ERROR', 'Uncaught exception:', err.message);
    stats.errors++;
});

// ============ START SERVER ============
server.listen(PORT, () => {
    log('INFO', `Server listening on port ${PORT}`);
    log('INFO', `WebSocket: wss://YOUR_DOMAIN/?target=TARGET_URL`);
});
