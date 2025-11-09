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
    res.writeHead(200);
    res.end("AI Interview WebScocket Running");
});

const wss = new WebSocketServer({ server });

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