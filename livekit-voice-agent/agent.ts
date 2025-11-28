import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { type JobContext, WorkerOptions, cli, defineAgent, voice, llm } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { generateInterviewInstruction } from './interviewInstruction.js';
import { evaluateInstruction } from './evaluateInstruction.js';
import { evaluateResponseFunctionDeclaration, tools } from './tools.js';
import { Modality } from '@google/genai';

dotenv.config({ path: '.env.local' });

class Interviewer extends voice.Agent {
  constructor(systemInstruction: string) {
    super({
      instructions: systemInstruction,
    });
  }
}

class Evaluator extends voice.Agent {
  constructor() {
    super({
      instructions: evaluateInstruction,
      tools: {
        evaluateResponse: llm.tool({
          description: evaluateResponseFunctionDeclaration.description,
          parameters: evaluateResponseFunctionDeclaration.parameters as any,
          execute: async (input: any) => {
            console.log('[Evaluator] Evaluation tool called with:', input);
            return { success: true, message: 'Evaluation recorded' };
          },
        }),
      },
    });
  }
}
export default defineAgent({
  entry: async (ctx: JobContext) => {
    // First, connect to the room to get metadata
    await ctx.connect();

    // Extract metadata from room configuration
    let systemInstruction = '';
    let jobRole = 'Software Engineer'; // Default
    let candidateName = 'Candidate'; // Default
    let resume = ''; // Default

    try {
      if (ctx.room.metadata) {
        console.log('[agent] Attempting to parse metadata:', ctx.room.metadata);
        const metadata = JSON.parse(ctx.room.metadata);
        jobRole = metadata.jobRole || jobRole;
        candidateName = metadata.userName || candidateName;
        resume = metadata.resume || resume;

        console.log('[agent] Room metadata extracted successfully:', {
          jobRole,
          candidateName,
          resume: resume ? `${resume.substring(0, 50)}...` : 'No resume',
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

    // INTERVIEW SESSION - Create and start the interviewer
    const interviewSession = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Gacrux',
        temperature: 0.8,
        instructions: systemInstruction,
      }),
    });

    console.log('[agent] Starting interview session...');
    try {
      await interviewSession.start({
        agent: new Interviewer(systemInstruction),
        room: ctx.room,
        inputOptions: {
          noiseCancellation: BackgroundVoiceCancellation(),
        },
        // This is the PRIMARY agent - it records and responds
        record: true,
      });
      console.log('[agent] Interview session started successfully (PRIMARY)');
    } catch (error) {
      console.error('[agent] Error starting interview session:', error);
      throw error;
    }

    const handle = interviewSession.generateReply({
      instructions: 'Greet the candidate and Ask your first question.',
    });
    await handle.waitForPlayout();

    // Interview is live
    console.log('[agent] Interview session is live - waiting for interview to complete');

    // EVALUATION SESSION - Create evaluator session for after interview
    const evaluationSession = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        modalities: [Modality.TEXT],
        temperature: 0.8,
        instructions: evaluateInstruction,
        geminiTools: tools,
      }),
    });

    await evaluationSession.start({
      agent: new Evaluator(),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
      // This is a SECONDARY agent - it doesn't record/respond to user input
      record: false,
    });

    console.log('[agent] Evaluation session started (SECONDARY)');

    // Both sessions are now active
    // The interviewer responds to user input
    // When interview ends, the evaluator can be started
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
