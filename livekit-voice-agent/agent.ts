import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { type JobContext, WorkerOptions, cli, defineAgent, voice, llm } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import * as livekit from '@livekit/agents-plugin-livekit';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { generateInterviewInstruction } from './promptInstructions/interviewInstruction.js';
import { 
  storeSupabaseEvaluation, 
  endSupabaseSession, 
  storeSupabaseConversation 
} from "./service/userServices.js";
import { createEvaluatorChat } from './infra/gemini/evaluatorAI.js';

dotenv.config({ path: '.env.local' });

// --- INTERVIEWER AGENT CLASS ---
class Interviewer extends voice.Agent {

  constructor(
    systemInstruction: string, 
  ) {
    super({
      instructions: systemInstruction,
    });
  }


}

// --- MAIN ENTRY POINT ---
export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();

    // -- State Variables --
    let conversation = '';
    let evaluations: any[] = []; // Passed by reference to the class
    let agentLastMsg = ''
    let userLastMsg = ''

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
    } catch (error) {
      console.error('[agent] Error parsing room metadata:', error);
    }

    systemInstruction = generateInterviewInstruction(candidateName, jobRole, resume);

    const interviewerAgent = new Interviewer(systemInstruction);

    const interviewSession = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Gacrux',
        temperature: 0.8,
        instructions: systemInstruction,
      }),
    });

    async function runEvaluation(question: string, answer: string) {
    console.log('[Evaluator] Analyzing response...');

    // Safety check: Don't try to evaluate if the room is closed
    if (!ctx.room.isConnected) return;

    try {
      // Create a fresh chat instance for each evaluation
      const evaluatorModel = createEvaluatorChat();
    
      const result = await evaluatorModel.sendMessage({
        message: `Interviewer asked: ${question}\nCandidate answered: ${answer}\n Evaluate this response.`
      });

      console.log('[Evaluator] Raw evaluation result:', JSON.stringify(result, null, 2));

      // Extract function calls from candidates[0].content
      const candidate = result.candidates?.[0];
      console.log('[Evaluator] Candidate:', candidate);
      
      if (!candidate) {
        console.error('[Evaluator] No candidate found in result');
        return;
      }

      const parts = candidate?.content?.parts;
      console.log('[Evaluator] Content parts:', JSON.stringify(parts, null, 2));

      const functionCall = parts?.find(
        (part: any) => part.functionCall !== undefined
      )?.functionCall;

      console.log('[Evaluator] Function call found:', JSON.stringify(functionCall, null, 2));

      if (functionCall && functionCall.name === 'evaluateResponse') {
        const evaluationData = functionCall.args;
        
        // 1. Store locally for the final DB save
      evaluations.push(evaluationData);
        
        console.log('[Evaluator] Evaluation generated:', evaluationData);

        const payload = JSON.stringify({
          type: 'EVALUATION',
          data: evaluationData
        });

        console.log('[Evaluator] Publishing payload:', payload);

        if (ctx.room.localParticipant) {
            await ctx.room.localParticipant.publishData(
            new TextEncoder().encode(payload),
            { reliable: true, topic: 'evaluation' }
          );
          console.log('[Evaluator] Payload published successfully');
        } else {
          console.error('[Evaluator] No local participant available');
        }
      } else {
        console.warn('[Evaluator] Function call not found or name mismatch');
      }
    } catch (error) {
        console.error('[Evaluator] Error analyzing response:', error);
    }
  } 

    interviewSession.on(voice.AgentSessionEventTypes.ConversationItemAdded, (event) => {  
      const { item } = event;
      const text = item.textContent; 

      if (!text) return;

      if (item.role === 'assistant' || item.role === 'system') {
        console.log('[Agent Spoke]:', text);
        agentLastMsg = text;
        conversation += 'Agent: ' + text + '\n';
        
      }
      if (item.role === 'user') {
        console.log('[User Spoke]:', text);
        userLastMsg = text;
        conversation += 'User: ' + text + '\n';
        
        if (agentLastMsg && userLastMsg) {
          runEvaluation(agentLastMsg, userLastMsg);
        }
      }
    });

    interviewSession.on(voice.AgentSessionEventTypes.Close, async () => {
      if (!conversation) {
        console.warn('[Shutdown] Conversation empty. Skipping save.');
        await endSupabaseSession(sessionId);
        return;
      }
      
      console.log(`[Shutdown] Saving session ${sessionId} to Supabase...`);
      try {
        await storeSupabaseConversation(sessionId, conversation); 
        await storeSupabaseEvaluation(sessionId, evaluations);
        await endSupabaseSession(sessionId);
        console.log('[Shutdown] Data saved successfully.');
      } catch (error) {
        console.error('[Shutdown] Error storing data:', error);
      }
      console.log('[agent] Interview session closed.');
    });

    // -- Start the Session --
    console.log('[agent] Starting interview session...');
    try {
      await interviewSession.start({
        agent: interviewerAgent, // Use our custom class instance
        room: ctx.room,
        inputOptions: {
          noiseCancellation: BackgroundVoiceCancellation(),
          closeOnDisconnect: true,
        },
      });
      console.log('[agent] Session started.');
    } catch (error) {
      console.error('[agent] Error starting session:', error);
      throw error;
    }
    
    // 1. Wait for audio path stability
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[agent] Triggering initial greeting...');

    // 2. Use generateReply with userInput to force the AI to respond immediately
    const handle = interviewSession.generateReply({
      instructions: `Start the interview session immedieately and always speak your greeting out loud on the first turn.`
    });

    await handle.waitForPlayout();
    
    console.log('[agent] Initial greeting triggered and awaited.');
  },
}); 

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));