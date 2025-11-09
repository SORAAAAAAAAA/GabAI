import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function SpeechtoText(audioBuffer: Buffer): Promise<string>{
  try {
    const audioBase64 = audioBuffer.toString('base64');

    const genAI = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = 'Transcribe the following audio content into text.';

    const audioContent = {
      
      inlineData: {
        data: audioBase64,
        mimeType: 'audio/webm',
      }
    };

    const result = await genAI.generateContent(
      [
        prompt,
        audioContent,
      ]
    );

    const response = (result.response).text();
    return response;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
    
} 

  