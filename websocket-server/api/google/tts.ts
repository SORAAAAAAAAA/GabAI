import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function TranscribeAudio(ai_response: string) {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-preview-tts' });

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: ai_response }],
        },
      ],
      response_modalities: ['AUDIO'],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: { voice_name: 'Gacrux' },
        },
      },
    }as any);

    const data = response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'No audio data returned from API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return base64 audio data for frontend playback
    return new Response(
      JSON.stringify({ audioBase64: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating audio:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
