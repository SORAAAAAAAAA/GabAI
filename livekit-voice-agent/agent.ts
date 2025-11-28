import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { type JobContext, WorkerOptions, cli, defineAgent, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { generateSystemInstruction } from './systemInstruction.js';
import { tools } from './tools.js';

dotenv.config({ path: '.env.local' });

class Assistant extends voice.Agent {
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

    console.log('[agent] Room object:', {
      roomName: ctx.room.name,
      metadata: ctx.room.metadata,
      metadataType: typeof ctx.room.metadata,
    });

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
    systemInstruction = generateSystemInstruction(candidateName, jobRole, resume);

    console.log('[agent] System instruction generated for:', {
      jobRole,
      candidateName,
    });

    // NOW create sessions with the generated system instruction
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Gacrux',
        temperature: 0.8,
        instructions: systemInstruction,
      }),
    });

    const session2 = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        temperature: 0.8,
        instructions: systemInstruction,
      }),
    });

    await session.start({
      agent: new Assistant(systemInstruction),
      room: ctx.room,
      inputOptions: {
        // For telephony applications, use `TelephonyBackgroundVoiceCancellation` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    const handle = session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });
    await handle.waitForPlayout();
  },
}); 

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
