import WebSocket, { WebSocketServer } from "ws";
import { getUserName, getSupabaseResume, getSupabaseSession, getSupabaseStartedAt, storeSupabaseConversation } from "./services/userService.js";
import { startLiveInterview, continueInterview, endLiveInterview } from "./api/google/gemini";
import { server } from "./infra/httpServer.js";

// Store active WebSocket connections mapped to sessionId
const activeConnections = new Map<string, WebSocket>();

// Export function to close connection (can be called from API routes)
export async function closeSessionConnection(sessionId: string) {
  const ws = activeConnections.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    endLiveInterview();
    console.log(`[cleanup] Closing WebSocket for session: ${sessionId}`);
    ws.send(JSON.stringify({
      type: 'session_ended',
      message: 'Your interview session has been terminated'
    }));
    ws.close(1000, 'Session ended');
    activeConnections.delete(sessionId);
  }
}

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
    let conversation = '';
    const evaluationList: any[] = [];
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

    // get necessary user and session data
    const { user_id, job_title } = await getSupabaseSession(sessionId);

    const { resume_text } = await getSupabaseResume(user_id); 

    const userName = await getUserName(user_id);

    const startedAt = await getSupabaseStartedAt(sessionId);
    
    try {
        await startLiveInterview(userName!, job_title, resume_text, startedAt);
        console.debug(`Interview started for ${userName} - Position: ${job_title}`);

        // Store the connection for this session
        activeConnections.set(sessionId, ws);
        console.log(`[connection] Session ${sessionId} connection stored`);

        let initialMessage = '';

        await continueInterview(
            "After you received this message, initiate the Interview and ask the candidate the first question. Do not end the first turn without a response to the candidate.",
            (chunk) => {
                // Stream each chunk to the frontend as it arrives
                ws.send(JSON.stringify({
                    type: 'ai_chunk',
                    data: {
                        text: chunk.text,
                        audioBase64: chunk.audioBase64,
                        evaluation: chunk.evaluation,
                        isComplete: chunk.isComplete
                    }
                }));
                // Append text from this chunk
                initialMessage += chunk.text;
            }
        );
        conversation += "AI Response: " + initialMessage + '\n'; 
        console.debug("Initial AI response streamed to client");
    } catch (error) {
        console.error("Error starting interview or sending initial response:", error);
        ws.send(JSON.stringify({
            type: 'error', 
            error: 'Error starting interview'
        }));
        activeConnections.delete(sessionId);
    }
    // Handle incoming messages from client
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);

            let aiMsg = '';
            let evaluation: any = null;

            if (data.type === 'user_message') {

                await continueInterview(
                    data.message,
                    (chunk) => {
                        // Log evaluation if present
                        if (chunk.evaluation) {
                            evaluationList.push(chunk.evaluation);
                            console.log('\n✅ EVALUATION RECEIVED (Turn #' + evaluationList.length + ')');
                            console.log('━'.repeat(50));
                            console.log('📊 SCORES:');
                            console.log(`   • Confidence: ${chunk.evaluation.scores.confidence_score}/10`);
                            console.log(`   • Clarity: ${chunk.evaluation.scores.clarity_score}/10`);
                            console.log(`   • Relevance: ${chunk.evaluation.scores.relevance_score}/10`);
                            console.log('💡 FEEDBACK:');
                            console.log(`   Strengths: ${chunk.evaluation.feedback.strengths.join(', ')}`);
                            console.log(`   Improvement: ${chunk.evaluation.feedback.improvement_tip}`);
                            console.log('━'.repeat(50) + '\n');
                        }

                        // Stream each chunk to the frontend as it arrives
                        ws.send(JSON.stringify({
                            type: 'ai_chunk',
                            data: {
                                text: chunk.text,
                                audioBase64: chunk.audioBase64,
                                evaluation: chunk.evaluation ? JSON.stringify(chunk.evaluation) : null,
                                isComplete: chunk.isComplete,
                            }
                        }));

                    aiMsg += chunk.text;
                    }
                );
            
            // Append user message and AI response to conversation
            conversation += "User Message: " + data.message + '\n';
            conversation += "AI Response: " + aiMsg + '\n';
            console.debug("AI response streamed to client for user message");
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
    ws.on('close', async () => {
        // Print evaluation summary
        if (evaluationList.length > 0) {
            console.log('\n\n' + '═'.repeat(60));
            console.log('📋 INTERVIEW EVALUATION SUMMARY');
            console.log('═'.repeat(60));
            
            evaluationList.forEach((evaluation, index) => {
                const avgScore = (evaluation.scores.confidence_score + evaluation.scores.clarity_score + evaluation.scores.relevance_score) / 3;
                console.log(`\nTurn #${index + 1}:`);
                console.log(`  Average Score: ${avgScore.toFixed(1)}/10`);
                console.log(`  Scores: Confidence=${evaluation.scores.confidence_score}, Clarity=${evaluation.scores.clarity_score}, Relevance=${evaluation.scores.relevance_score}`);
                console.log(`  Strengths: ${evaluation.feedback.strengths.join(', ')}`);
                console.log(`  Improvement: ${evaluation.feedback.improvement_tip}`);
            });
            
            const overallAvg = evaluationList.reduce((sum, evaluation) => 
                sum + (evaluation.scores.confidence_score + evaluation.scores.clarity_score + evaluation.scores.relevance_score) / 3, 0
            ) / evaluationList.length;
            
            console.log(`\n📊 Overall Average Score: ${overallAvg.toFixed(1)}/10`);
            console.log('═'.repeat(60) + '\n');
        }
        
        // Store the conversation in Supabase for this session
        try {
            await storeSupabaseConversation(sessionId, conversation);
            console.debug(`Conversation stored for session: ${sessionId}`);
        } catch (error) {
            console.error(`Error storing conversation for session ${sessionId}:`, error);
        }

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
