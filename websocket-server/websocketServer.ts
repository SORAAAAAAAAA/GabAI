import WebSocket, { WebSocketServer } from "ws";
import { createClient } from "@supabase/supabase-js";
import http, { get } from "http";
import dotenv from "dotenv";
import { getUserName } from "./services/userService.js";
import { startInterview, continueInterview } from "./api/google/gemini";

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

wss.on('connection', async (ws, req) => {
    // Extract sessionId from WebSocket URL query parameters
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionToken');
    
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
    
    const interviewResponse = await startInterview(
        userName,
        job_title,
        resume_text
    );
    // Send initial AI greeting message
    ws.send(JSON.stringify({
        type: 'ai_response',
        data: { text: interviewResponse }
    }));

    // Set up message handler for subsequent messages
    ws.on('message', async (data) => {
        try {
            const messageObj = JSON.parse(data.toString());
            const { type, message, sessionId } = messageObj;

            if (type === 'user_message' && message) {
                const userMessage = message as string;

                const aiResponse = await continueInterview(userMessage);

                ws.send(JSON.stringify({
                    type: 'ai_response',
                    data: { text: aiResponse }
                }));
            } else {
                console.error('Invalid message format:', messageObj);
                ws.send(JSON.stringify({
                    type: 'error', 
                    error: 'Invalid message format'
                }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error', 
                error: 'Error processing message'
            }));
        }  
    });
});


const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});