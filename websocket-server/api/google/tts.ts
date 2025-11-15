import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
export async function generateAudio(ai_response: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [{ text: ai_response }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Gacrux' },
        },
      },
      }
      
    }as any);

    const data = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) {
      throw new Error('No audio data returned from API');
    }
    // Return base64 audio data for frontend playback
    return data;

  } catch (error) {
    console.error('Error generating audio:', error);
    return null;
  }
}
