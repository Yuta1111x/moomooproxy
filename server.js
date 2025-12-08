const http = require('http');
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
const connections = new Map(); // id -> { clientWs, serverWs, ip, startTime, messages, bytes }
const ipConnections = new Map(); // ip -> count
let connectionId = 0;

// ============ LOGGING ============
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

const log = (level, ...args) => {
    if (LOG_LEVELS[level] >= LOG_LEVEL) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;
        console.log(prefix, ...args);
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

// ============ HTTP SERVER ============
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    
    // Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }
    
    // ===== CLEAR ALL CONNECTIONS ENDPOINT =====
    if (path === '/clear' && query.key === RESTART_KEY) {
        let cleared = 0;
        
        // Close all connections gracefully
        connections.forEach((conn) => {
            try {
                conn.clientWs?.close(1000, 'Connections cleared');
                conn.serverWs?.close(1000, 'Connections cleared');
                cleared++;
            } catch (e) {}
        });
        
        // Reset IP connections map
        ipConnections.clear();
        
        log('WARN', `Clear requested - closed ${cleared} connections`);
        stats.restarts++; // reuse as "clears" counter
        
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            message: `Cleared ${cleared} connections`,
            cleared: cleared
        }));
        return;
    }
    
    // ===== HEALTH CHECK =====
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
    
    // ===== DETAILED STATS =====
    if (path === '/stats') {
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getStats(), null, 2));
        return;
    }
    
    // ===== CONNECTION LIST =====
    if (path === '/connections') {
        const connList = [];
        connections.forEach((conn, id) => {
            connList.push({
                id,
                ip: conn.ip,
                duration: formatUptime(Date.now() - conn.startTime),
                messages: conn.messages,
                bytes: formatBytes(conn.bytes)
            });
        });
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ connections: connList }, null, 2));
        return;
    }
    
    // ===== KICK CONNECTION =====
    if (path === '/kick' && query.id) {
        const conn = connections.get(parseInt(query.id));
        if (conn) {
            conn.clientWs?.close(1000, 'Kicked by admin');
            conn.serverWs?.close(1000, 'Kicked by admin');
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `Connection ${query.id} kicked` }));
        } else {
            res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Connection not found' }));
        }
        return;
    }
    
    // ===== KICK ALL FROM IP =====
    if (path === '/kickip' && query.ip) {
        let kicked = 0;
        connections.forEach((conn, id) => {
            if (conn.ip === query.ip) {
                conn.clientWs?.close(1000, 'IP banned');
                conn.serverWs?.close(1000, 'IP banned');
                kicked++;
            }
        });
        res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, kicked }));
        return;
    }
    
    // ===== DEFAULT RESPONSE =====
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        name: 'MooMoo.io Proxy Server',
        version: '2.0.0',
        author: 'Yuta1111x',
        status: 'running',
        endpoints: {
            '/': 'This info',
            '/health': 'Quick health check',
            '/stats': 'Detailed statistics',
            '/connections': 'List active connections',
            '/clear?key=KEY': 'Clear all connections',
            '/kick?id=ID': 'Kick connection by ID',
            '/kickip?ip=IP': 'Kick all connections from IP'
        },
        websocket: 'Connect with ?target=WSS_URL parameter'
    }, null, 2));
});

// ============ GET STATS FUNCTION ============
const getStats = () => ({
    server: {
        uptime: formatUptime(Date.now() - stats.startTime),
        uptimeMs: Date.now() - stats.startTime,
        startTime: new Date(stats.startTime).toISOString(),
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
    },
    connections: {
        active: stats.activeConnections,
        total: stats.totalConnections,
        maxPerIP: MAX_CONNECTIONS_PER_IP,
        maxTotal: MAX_TOTAL_CONNECTIONS
    },
    traffic: {
        messagesForwarded: stats.messagesForwarded,
        bytesTransferred: stats.bytesTransferred,
        bytesFormatted: formatBytes(stats.bytesTransferred)
    },
    memory: {
        heapUsed: formatBytes(process.memoryUsage().heapUsed),
        heapTotal: formatBytes(process.memoryUsage().heapTotal),
        rss: formatBytes(process.memoryUsage().rss)
    },
    errors: stats.errors,
    restarts: stats.restarts
});

// ============ WEBSOCKET SERVER ============
const wss = new WebSocket.Server({ server });

log('INFO', `Starting MooMoo Proxy Server v2.0.0 on port ${PORT}`);
log('INFO', `Max connections per IP: ${MAX_CONNECTIONS_PER_IP}`);
log('INFO', `Max total connections: ${MAX_TOTAL_CONNECTIONS}`);

wss.on('connection', (clientWs, req) => {
    const clientIP = getClientIP(req);
    const params = url.parse(req.url, true).query;
    const targetUrl = params.target;
    const connId = ++connectionId;
    
    log('DEBUG', `[${connId}] New connection from ${clientIP}`);
    
    // ===== VALIDATION =====
    if (!targetUrl) {
        log('WARN', `[${connId}] No target URL provided`);
        clientWs.close(1008, 'No target URL');
        return;
    }
    
    // Validate target URL
    if (!targetUrl.startsWith('wss://') && !targetUrl.startsWith('ws://')) {
        log('WARN', `[${connId}] Invalid target URL: ${targetUrl}`);
        clientWs.close(1008, 'Invalid target URL');
        return;
    }
    
    // Check max total connections
    if (stats.activeConnections >= MAX_TOTAL_CONNECTIONS) {
        log('WARN', `[${connId}] Max total connections reached`);
        clientWs.close(1013, 'Server at capacity');
        return;
    }
    
    // Check per-IP limit
    const currentIPConns = ipConnections.get(clientIP) || 0;
    if (currentIPConns >= MAX_CONNECTIONS_PER_IP) {
        log('WARN', `[${connId}] IP ${clientIP} exceeded connection limit`);
        clientWs.close(1013, 'Too many connections from your IP');
        return;
    }
    
    // ===== UPDATE COUNTERS =====
    stats.totalConnections++;
    stats.activeConnections++;
    ipConnections.set(clientIP, currentIPConns + 1);
    
    // ===== CONNECTION STATE =====
    const conn = {
        clientWs,
        serverWs: null,
        ip: clientIP,
        startTime: Date.now(),
        messages: 0,
        bytes: 0,
        isAlive: true
    };
    connections.set(connId, conn);
    
    log('INFO', `[${connId}] Connecting to ${targetUrl.split('?')[0]}...`);
    
    // ===== CONNECT TO MOOMOO SERVER =====
    const serverWs = new WebSocket(targetUrl, {
        headers: {
            'Origin': 'https://moomoo.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        handshakeTimeout: CONNECTION_TIMEOUT
    });
    
    serverWs.binaryType = 'arraybuffer';
    conn.serverWs = serverWs;
    
    // ===== HEARTBEAT =====
    const heartbeat = setInterval(() => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.ping();
        }
        if (serverWs.readyState === WebSocket.OPEN) {
            serverWs.ping();
        }
    }, HEARTBEAT_INTERVAL);
    
    // ===== CLEANUP FUNCTION =====
    const cleanup = (reason) => {
        if (conn.cleaned) return;
        conn.cleaned = true;
        
        clearInterval(heartbeat);
        
        try { clientWs.close(); } catch (e) {}
        try { serverWs.close(); } catch (e) {}
        
        connections.delete(connId);
        stats.activeConnections = Math.max(0, stats.activeConnections - 1);
        
        const ipCount = ipConnections.get(clientIP) || 1;
        if (ipCount <= 1) {
            ipConnections.delete(clientIP);
        } else {
            ipConnections.set(clientIP, ipCount - 1);
        }
        
        const duration = formatUptime(Date.now() - conn.startTime);
        log('INFO', `[${connId}] Disconnected (${reason}) - Duration: ${duration}, Messages: ${conn.messages}, Bytes: ${formatBytes(conn.bytes)}`);
    };
    
    // ===== SERVER WEBSOCKET EVENTS =====
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
                log('ERROR', `[${connId}] Error forwarding to client:`, e.message);
                stats.errors++;
            }
        }
    });
    
    serverWs.on('close', (code, reason) => {
        cleanup(`server closed: ${code}`);
    });
    
    serverWs.on('error', (err) => {
        log('ERROR', `[${connId}] Server error:`, err.message);
        stats.errors++;
        cleanup(`server error: ${err.message}`);
    });
    
    // ===== CLIENT WEBSOCKET EVENTS =====
    clientWs.on('message', (data) => {
        if (serverWs.readyState === WebSocket.OPEN) {
            try {
                serverWs.send(data);
                conn.messages++;
                conn.bytes += data.byteLength || data.length || 0;
                stats.messagesForwarded++;
                stats.bytesTransferred += data.byteLength || data.length || 0;
            } catch (e) {
                log('ERROR', `[${connId}] Error forwarding to server:`, e.message);
                stats.errors++;
            }
        }
    });
    
    clientWs.on('close', (code, reason) => {
        cleanup(`client closed: ${code}`);
    });
    
    clientWs.on('error', (err) => {
        log('ERROR', `[${connId}] Client error:`, err.message);
        stats.errors++;
        cleanup(`client error: ${err.message}`);
    });
    
    clientWs.on('pong', () => {
        conn.isAlive = true;
    });
});

// ============ PERIODIC CLEANUP ============
setInterval(() => {
    connections.forEach((conn, id) => {
        if (!conn.isAlive) {
            log('WARN', `[${id}] Connection timed out`);
            conn.clientWs?.terminate();
            conn.serverWs?.terminate();
            return;
        }
        conn.isAlive = false;
    });
}, HEARTBEAT_INTERVAL * 2);

// ============ GRACEFUL SHUTDOWN ============
const shutdown = (signal) => {
    log('WARN', `Received ${signal}, shutting down gracefully...`);
    
    // Close all connections
    connections.forEach((conn, id) => {
        try {
            conn.clientWs?.close(1001, 'Server shutting down');
            conn.serverWs?.close(1001, 'Server shutting down');
        } catch (e) {}
    });
    
    // Close server
    server.close(() => {
        log('INFO', 'Server closed');
        process.exit(0);
    });
    
    // Force exit after 5 seconds
    setTimeout(() => {
        log('WARN', 'Forcing exit...');
        process.exit(1);
    }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============ ERROR HANDLING ============
process.on('uncaughtException', (err) => {
    log('ERROR', 'Uncaught exception:', err.message);
    stats.errors++;
});

process.on('unhandledRejection', (reason, promise) => {
    log('ERROR', 'Unhandled rejection:', reason);
    stats.errors++;
});

// ============ START SERVER ============
server.listen(PORT, () => {
    log('INFO', `Server listening on port ${PORT}`);
    log('INFO', `WebSocket endpoint: wss://YOUR_DOMAIN/?target=TARGET_URL`);
    log('INFO', `Health check: https://YOUR_DOMAIN/health`);
    log('INFO', `Statistics: https://YOUR_DOMAIN/stats`);
});
