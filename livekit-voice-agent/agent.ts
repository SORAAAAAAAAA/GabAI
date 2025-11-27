import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { type JobContext, WorkerOptions, cli, defineAgent, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { systemInstructionInterviewCoach } from './systemInstruction.js';
import { tools } from './tools.js';

dotenv.config({ path: '.env.local' });

class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: systemInstructionInterviewCoach,
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Gacrux',
        temperature: 0.8,
        instructions: systemInstructionInterviewCoach,
      }),
    });

    const session2 = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        temperature: 0.8,
        instructions: systemInstructionInterviewCoach,
      }),
    });

    await session.start({
      agent: new Assistant(),
      room: ctx.room,
      inputOptions: {
        // For telephony applications, use `TelephonyBackgroundVoiceCancellation` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();

    const handle = session.generateReply({
      instructions: 'Greet the user and offer your assistance.',
    });
    await handle.waitForPlayout();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
