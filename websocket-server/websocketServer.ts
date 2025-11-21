import WebSocket, { WebSocketServer } from "ws";
import { createClient } from "@supabase/supabase-js";
import http, { get } from "http";
import dotenv from "dotenv";
import { getUserName } from "./services/userService.js";
import { startLiveInterview, continueInterview, endLiveInterview } from "./api/google/gemini";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

// Store active WebSocket connections mapped to sessionId
const activeConnections = new Map<string, WebSocket>();

// Export function to close connection (can be called from API routes)
export function closeSessionConnection(sessionId: string) {
  const ws = activeConnections.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log(`[cleanup] Closing WebSocket for session: ${sessionId}`);
    ws.send(JSON.stringify({
      type: 'session_ended',
      message: 'Your interview session has been terminated'
    }));
    ws.close(1000, 'Session ended');
    activeConnections.delete(sessionId);
  }
}


const server = http.createServer((req, res) => {
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

const wss = new WebSocketServer({ 
    server,
    // Allow connections from specific origin only
    verifyClient: (info: unknown) => {
        const allowedOrigin = process.env.ALLOWED_ORIGIN!;
        const infoObj = info as Record<string, unknown>;
        const origin = (infoObj.origin as string) || '';
        
        if (origin === allowedOrigin) {
            return true;
        }
        console.warn(`WebSocket connection rejected from origin: ${origin}`);
        return false;
    },
    perMessageDeflate: false
});

wss.on('connection', async (ws, req) => {
    // Extract sessionId from WebSocket URL query parameters
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionToken');
    
    console.log(`[connection] New WebSocket connection from sessionToken: ${sessionId}`);
    
    if (!sessionId) {
        console.error('No sessionToken provided in WebSocket connection');
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Session token required'
        }));
        ws.close();
        return;
    }

    // send a user a first message from AI upon connection
    const {data: sessionData, error: sessionError} = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

    if (sessionError || !sessionData) {
        console.error("Session not found or error:", sessionError);
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Session not found'
        }));
        return;
    }

    const { user_id, job_title} = sessionData;

    if (!user_id || !job_title) {
        console.error("Missing user_id or job_title in session data");
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Incomplete session data'
        }));
        return;
    }

    const {data: resumeData, error: resumeError} = await supabase
        .from('resumes')
        .select('resume_text')
        .eq('user_id', user_id)
        .single();

    if (resumeError || !resumeData) {
        console.error("Resume not found or error:", resumeError);
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Resume not found'
        }));
        return;
    }

    const { resume_text } = resumeData; 

    const userName = await getUserName(user_id);
    
    if (!userName) {
        console.error('User name not found for user_id:', user_id);
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'User information not found'
        }));
        return;
    }
    
    try {
        await startLiveInterview(userName, job_title, resume_text);
        console.debug(`Interview started for ${userName} - Position: ${job_title}`);

        // Store the connection for this session
        activeConnections.set(sessionId, ws);
        console.log(`[connection] Session ${sessionId} connection stored`);

        await continueInterview(
            "Start the interview",
            (chunk) => {
                // Stream each chunk to the frontend as it arrives
                ws.send(JSON.stringify({
                    type: 'ai_chunk',
                    data: {
                        text: chunk.text,
                        audioBase64: chunk.audioBase64,
                        isComplete: chunk.isComplete
                    }
                }));
            }
        );

        console.debug("Initial AI response streamed to client");
    } catch (error) {
        console.error("Error starting interview or sending initial response:", error);
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Error starting interview'
        }));
        activeConnections.delete(sessionId);
    }

    // Set up message handler for subsequent messages
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'user_message') {
                const userMessage = data.message;

                if (!userMessage) {
                    ws.send(JSON.stringify({
                        type: 'error', 
                        error: 'No message provided'
                    }));
                    return;
                }

                console.debug('Received user message:', userMessage);

                await continueInterview(userMessage, (chunk) => {
                    // Stream each chunk to the frontend as it arrives
                    ws.send(JSON.stringify({
                        type: 'ai_chunk',
                        data: {
                            text: chunk.text,
                            audioBase64: chunk.audioBase64,
                            isComplete: chunk.isComplete
                        }
                    }));
                });

                console.debug("AI response streamed to client");
            }

            if (data.type === 'session_ended') {
                console.log(`[cleanup] Received session_ended for: ${sessionId}`);
                activeConnections.delete(sessionId);
                ws.close(1000, 'Session ended by client');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Failed to process message'
            }));
        }
    });

    // Handle connection close
    ws.on('close', () => {
        console.log(`[close] WebSocket connection closed for session: ${sessionId}`);
        activeConnections.delete(sessionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
        console.error(`[error] WebSocket error for session ${sessionId}:`, error);
        activeConnections.delete(sessionId);
    });
});


const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});