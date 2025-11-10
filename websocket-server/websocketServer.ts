import WebSocket, { WebSocketServer } from "ws";
import { createClient } from "@supabase/supabase-js";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

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

wss.on('connection', ws => {
    // send a user a first message from AI upon connection

    ws.on('message', async (data) => {
        try {
            const {type, message, sessionId} = JSON.parse(data.toString());

            if (type === 'user_transcript') {
                // get session context from supabase
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
            }



        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    
});


const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});