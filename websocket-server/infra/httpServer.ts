import http from 'http';
import { closeSessionConnection } from '../websocketServer';

export const server = http.createServer((req, res) => {
    // Set CORS headers - allow only frontend origin
    const allowedOrigin = process.env.ALLOWED_ORIGIN!;
    const origin = req.headers.origin;
    
    if (origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle close-connection endpoint
    if (req.method === 'POST' && req.url === '/close-connection') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { sessionId } = data;
                
                if (sessionId) {
                    closeSessionConnection(sessionId);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Connection closed successfully' }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing sessionId' }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to parse request' }));
            }
        });
        return;
    }
    
    res.writeHead(200);
    res.end("AI Interview WebScocket Running");
});