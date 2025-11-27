import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { WorkerOptions, cli, defineAgent, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { systemInstruction } from './systemInstruction.js';

dotenv.config({ path: '.env.local' });
class Assistant extends voice.Agent {
  constructor() {
    super({
      instructions: systemInstruction,
    });
  }
}
export default defineAgent({
  entry: async (ctx) => {
    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        voice: 'Puck',
        temperature: 0.8,
        instructions: 'You are a helpful assistant',
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
      instructions:
        'Greet the user and offer your assistance. You should start by speaking in English.',
    });
    await handle.waitForPlayout();
  },
});
cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
//# sourceMappingURL=agent.js.map
