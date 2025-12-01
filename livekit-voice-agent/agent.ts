import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { type JobContext, WorkerOptions, cli, defineAgent, voice, llm } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { GoogleGenAI } from "@google/genai";
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { generateInterviewInstruction } from './interviewInstruction.js';
import { evaluateInstruction } from './evaluateInstruction.js';
import {  tools } from './tools.js';
import { getUserName, getSupabaseResume, getSupabaseSession, getSupabaseStartedAt, storeSupabaseConversation } from "./service/userServices.js";


dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

let conversation = '';

const evaluatorModel = ai.chats.create({
  model: "gemini-2.0-flash-lite",
  history: [
    {
      role: "user",
      parts: [{ text: "Start evaluation" }],
    },
    {
      role: "model",
      parts: [{ text: "Evaluation started" }],
    }
  ],
  config: {
    tools: [tools],
    systemInstruction: evaluateInstruction,
  }
})

class Interviewer extends voice.Agent {
  constructor(systemInstruction: string) {
    super({
      instructions: systemInstruction,
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // First, connect to the room to get metadata
    await ctx.connect();

    // Extract metadata from room configuration
    let systemInstruction = '';
    let jobRole = 'Software Engineer'; 
    let candidateName = 'Candidate';
    let sessionId = ''; 
    let resume = ''; 

    try {
      if (ctx.room.metadata) {
        console.log('[agent] Attempting to parse metadata:', ctx.room.metadata);
        const metadata = JSON.parse(ctx.room.metadata);
        jobRole = metadata.jobRole || jobRole;
        candidateName = metadata.userName || candidateName;
        resume = metadata.resume || resume;
        sessionId = metadata.sessionId || sessionId;

        console.log('[agent] Room metadata extracted successfully:', {
          jobRole,
          candidateName,
          resume: resume ? `${resume.substring(0, 50)}...` : 'No resume',
          sessionId,
        });
      } else {
        console.log('[agent] No metadata found in room');
      }
    } catch (error) {
      console.error('[agent] Error parsing room metadata:', error);
    }

    // Generate personalized system instruction
    systemInstruction = generateInterviewInstruction(candidateName, jobRole, resume);

    console.log('[agent] System instruction generated for:', {
      jobRole,
      candidateName,
    });

    const interviewSession = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Gacrux',
        temperature: 0.8,
        instructions: systemInstruction,
      }),
    });


    const runEvaluation = async (question: string, answer: string) => {
      console.log('[Evaluator] Analyzing response...');

      try {

        const result = await evaluatorModel.sendMessage({
          message: `Interviewer asked: ${question}\nCandidate answered: ${answer}\n Evaluate this response.`
        });

        const functionCall = result.functionCalls?.[0];

        if (functionCall && functionCall.name === 'evaluateResponse') {
          const evaluationData = functionCall.args;
          
          console.log('[Evaluator] Evaluation generated:', evaluationData);

          // SEND TO FRONTEND: Publish JSON data to the room
          const payload = JSON.stringify({
            type: 'EVALUATION',
            data: evaluationData
          });

          if (ctx.room.localParticipant) {
              await ctx.room.localParticipant.publishData(
              new TextEncoder().encode(payload),
              { reliable: true, topic: 'evaluation' }
            );
          } else {
            console.error('[Evaluator] No local participant found to publish evaluation data.');
          }
        }
        
        } catch (error) {
            console.error('[Evaluator] Error analyzing response:', error);
          }
    } 

    let lastAgentMessage = "";

    // Use the Enum to avoid string typos. The correct event is 'conversation_item_added'
    interviewSession.on(voice.AgentSessionEventTypes.ConversationItemAdded, (event) => {
      const { item } = event;

      // 1. Identify if the AGENT spoke
      if (item.role === 'assistant' || item.role === 'system') {
        const text = item.textContent;
        if (text) {
          console.log('[Agent Spoke]:', text);
          conversation += 'Agent: ' + text + '\n';
          lastAgentMessage = text;
        }
      }

      // 2. Identify if the USER spoke (User Answer)
      if (item.role === 'user') {
        const text = item.textContent;
        
        if (text && lastAgentMessage) {
          console.log('[User Spoke]:', text);
          conversation += 'User: ' + text + '\n';
          runEvaluation(lastAgentMessage, text);
        }
      }
    });

    console.log('[agent] Starting interview session...');
    try {
      await interviewSession.start({
        agent: new Interviewer(systemInstruction),
        room: ctx.room,
        inputOptions: {
          noiseCancellation: BackgroundVoiceCancellation(),
        },
      });
      console.log('[agent] Interview session started successfully');
    } catch (error) {
      console.error('[agent] Error starting interview session:', error);
      throw error;
    }

    const handle = interviewSession.generateReply({
      instructions: 'Greet the candidate and begin the interview without waiting for a prompt.',
    });
    await handle.waitForPlayout();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
