import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { WorkerOptions, cli, defineAgent, voice, llm } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import * as livekit from '@livekit/agents-plugin-livekit';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { generateInterviewInstruction } from './promptInstructions/interviewInstruction.js';
import { getUserName, getSupabaseResume, getSupabaseSession, getSupabaseStartedAt, storeSupabaseEvaluation, endSupabaseSession, storeSupabaseConversation } from "./service/userServices.js";
import { evaluatorModel } from './infra/gemini/evaluatorAI.js';
dotenv.config({ path: '.env.local' });
// --- INTERVIEWER AGENT CLASS ---
class Interviewer extends voice.Agent {
    _room;
    _evaluations;
    _lastAgentMessage = "";
    constructor(systemInstruction, room, evaluations) {
        super({
            instructions: systemInstruction,
        });
        this._room = room;
        this._evaluations = evaluations;
    }
    /**
     * HOOK: Called automatically when the user finishes a turn.
     * This is the perfect place to run evaluation because the user's answer is complete.
     */
    async onUserTurnCompleted(turnCtx, newMessage) {
        console.log('[Hook] User turn completed. Message:', newMessage.textContent);
        // Only run evaluation if we have a previous question to compare against
        if (newMessage.textContent && this._lastAgentMessage) {
            await this.runEvaluation(this._lastAgentMessage, newMessage.textContent);
        }
        // Example: You could also modify the message here before it goes to history
        // if (newMessage.textContent?.toLowerCase().includes("wait")) { throw new voice.StopResponse(); }
    }
    /**
     * Helper to update the last question asked by the agent.
     * Called from the main event listener in the entry function.
     */
    setLastAgentMessage(msg) {
        this._lastAgentMessage = msg;
    }
    /**
     * Private method to handle the Gemini evaluation logic.
     */
    async runEvaluation(question, answer) {
        console.log('[Evaluator] Analyzing response...');
        // Safety check: Don't try to evaluate if the room is closed
        if (!this._room.isConnected)
            return;
        try {
            const result = await evaluatorModel.sendMessage({
                message: `Interviewer asked: ${question}\nCandidate answered: ${answer}\n Evaluate this response.`
            });
            const functionCall = result.functionCalls?.[0];
            if (functionCall && functionCall.name === 'evaluateResponse') {
                const evaluationData = functionCall.args;
                // 1. Store locally for the final DB save
                this._evaluations.push(evaluationData);
                console.log('[Evaluator] Evaluation generated:', evaluationData);
                // 2. Publish real-time to the frontend
                const payload = JSON.stringify({
                    type: 'EVALUATION',
                    data: evaluationData
                });
                if (this._room.localParticipant) {
                    await this._room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true, topic: 'evaluation' });
                }
            }
        }
        catch (error) {
            console.error('[Evaluator] Error analyzing response:', error);
        }
    }
}
// --- MAIN ENTRY POINT ---
export default defineAgent({
    entry: async (ctx) => {
        await ctx.connect();
        // -- State Variables --
        let conversation = '';
        let evaluations = []; // Passed by reference to the class
        // -- Metadata Extraction --
        let systemInstruction = '';
        let jobRole = 'Software Engineer';
        let candidateName = 'Candidate';
        let sessionId = '';
        let resume = '';
        try {
            if (ctx.room.metadata) {
                console.log('[agent] Parsing metadata:', ctx.room.metadata);
                const metadata = JSON.parse(ctx.room.metadata);
                jobRole = metadata.jobRole || jobRole;
                candidateName = metadata.userName || candidateName;
                resume = metadata.resume || resume;
                sessionId = metadata.sessionId || sessionId;
            }
        }
        catch (error) {
            console.error('[agent] Error parsing room metadata:', error);
        }
        systemInstruction = generateInterviewInstruction(candidateName, jobRole, resume);
        // -- Agent Instantiation --
        // We pass the room and evaluations array so the class can access them
        const interviewerAgent = new Interviewer(systemInstruction, ctx.room, evaluations);
        const interviewSession = new voice.AgentSession({
            llm: new google.beta.realtime.RealtimeModel({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                voice: 'Gacrux',
                temperature: 0.8,
                instructions: systemInstruction,
                realtimeInputConfig: {
                    automaticActivityDetection: {
                        disabled: true, // We rely on LiveKit's turn detector instead
                    },
                },
            }),
            stt: "assemblyai/universal-streaming", // Ensure you have this plugin installed/configured
            turnDetection: new livekit.turnDetector.MultilingualModel(),
        });
        // -- Event Listener: Conversation Logging --
        // We use this listener primarily to build the full conversation transcript string
        // and to update the "lastAgentMessage" state in our class.
        interviewSession.on(voice.AgentSessionEventTypes.ConversationItemAdded, (event) => {
            const { item } = event;
            const text = item.textContent;
            if (!text)
                return;
            if (item.role === 'assistant' || item.role === 'system') {
                console.log('[Agent Spoke]:', text);
                conversation += 'Agent: ' + text + '\n';
                // Critical: Tell the agent class what the question was
                interviewerAgent.setLastAgentMessage(text);
            }
            else if (item.role === 'user') {
                console.log('[User Spoke]:', text);
                conversation += 'User: ' + text + '\n';
                // Note: Evaluation is handled by the onUserTurnCompleted hook inside the class
            }
        });
        // -- Event Listener: Graceful Shutdown Trigger --
        ctx.room.on('participantDisconnected', (participant) => {
            // If a non-agent participant leaves, shut everything down
            if (participant.identity !== 'agent') {
                console.log(`[Agent] Participant ${participant.identity} disconnected. Shutting down...`);
                ctx.shutdown();
            }
        });
        // -- Shutdown Callback: Database Storage --
        ctx.addShutdownCallback(async () => {
            if (!conversation) {
                console.warn('[Shutdown] Conversation empty. Skipping save.');
                return;
            }
            console.log(`[Shutdown] Saving session ${sessionId} to Supabase...`);
            try {
                await storeSupabaseConversation(sessionId, conversation);
                await storeSupabaseEvaluation(sessionId, evaluations);
                await endSupabaseSession(sessionId);
                console.log('[Shutdown] Data saved successfully.');
            }
            catch (error) {
                console.error('[Shutdown] Error storing data:', error);
            }
        });
        // -- Start the Session --
        console.log('[agent] Starting interview session...');
        try {
            await interviewSession.start({
                agent: interviewerAgent, // Use our custom class instance
                room: ctx.room,
                inputOptions: {
                    noiseCancellation: BackgroundVoiceCancellation(),
                },
            });
            console.log('[agent] Session started.');
        }
        catch (error) {
            console.error('[agent] Error starting session:', error);
            throw error;
        }
        // -- Kickstart Sequence (Force First Greeting) --
        // 1. Wait for audio path stability
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('[agent] Triggering initial greeting...');
        // 2. Use generateReply with userInput to force the AI to respond immediately
        await interviewSession.generateReply({
            userInput: `The interview is starting. Please greet me warmly as ${candidateName} and ask the first question for the ${jobRole} role.`
        });
    },
});
cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
//# sourceMappingURL=agent.js.map