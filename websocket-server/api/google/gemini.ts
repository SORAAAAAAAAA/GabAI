import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav, bufferToBase64 } from "../../services/fileConvertService";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string});

let liveSession: any = null;
let responseQueue: any[] = [];

export async function startLiveInterview(  name: string, job: string, resume: string) {

  const model = "gemini-2.5-flash-native-audio-preview-09-2025";
  
  const systemInstruction = `You are a professional interviewer. You will interview the candidate below.

Candidate Name: ${name},
Resume Information: ${resume},
Job Applied for: ${job},

Your Guide as an Interviewer:
- Generate 8-15 questions that are necessary and relevant to the user.
- The generated questions should be relevant to the user's Resume and the Job they are applying for.
- You should make the interview and your role as realistic as possible.
- You should understand the user and not give all questions at once.
- Always finish the current question before moving to the next one.
- After asking a question, wait for the user's response before proceeding.
- Be engaging and interactive, make the user feel comfortable.
- Stay in character as an interviewer throughout the session.
- If the user goes off-topic, gently steer them back to the interview.
- Do not answer as the candidate, only ask questions as the interviewer.
- Do not answer any questions that are not related to the interview.
- In greeting the user for the first time, use their name to make it more personal.`;
 
  const config = {
    responseModalities: [Modality.AUDIO],
    systemInstruction: {
      parts: [{text: systemInstruction}]
    },
    outputAudioTranscription: {},
    speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Gacrux' },
        }
    },
  }

  responseQueue = [];

  // Wait for the session to connect and be fully ready
  liveSession = await ai.live.connect({
    model: model,
    config: config,
    callbacks: {
      onopen: function () {
        console.debug('Live session opened Successfully');
      },
      onmessage: function (message) {
        console.debug('Message received from gemini', message.serverContent?.outputTranscription?.text);
        responseQueue.push(message);
      },
      onerror: function (e) {
        console.debug('Error:', e.message);
      },
      onclose: function (e) {
        console.debug('Connection Closed:', e.reason);
      },
    },
  });

  console.debug("Live Interview Session started and ready");
  return {success: true};
}


async function waitMessage() {
  let done = false;
  let message = undefined;
  while (!done) {
    message = responseQueue.shift();
    if (message) {
      done = true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100) ); // wait 100ms
    }
  } return message;
}


export async function continueInterview(userMessage: string, onChunk?: (chunk: {text: string, audioBase64: string, isComplete: boolean}) => void) {
  if (!liveSession) {
    throw new Error("Interview not started. Please call startLiveInterview() first.");
  }

  liveSession.sendClientContent({turns: userMessage});

  let done = false;

  while (!done) {
    const message = await waitMessage();
    
    let chunkText = "";
    let audioBuffer: ArrayBuffer | null = null;
    let audioBase64 = "";

    // Get text transcription
    if (message.serverContent?.outputTranscription) {
      chunkText = message.serverContent.outputTranscription.text;
    }

    // Get audio data
    if (message.serverContent?.modelTurn) {
      const parts = message.serverContent.modelTurn.parts;
      for (const part of parts) {
        if (part.inlineData?.mimeType?.includes('audio')) {
          const binaryString = atob(part.inlineData.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioBuffer = bytes.buffer;
        }
      }
    }

    const wavBuffer = audioBuffer ? pcmToWav(audioBuffer, 24000, 1, 16) : null;
    audioBase64 = wavBuffer ? bufferToBase64(wavBuffer) : "";

    // Check if turn is complete
    const isComplete = message.serverContent?.turnComplete === true;
    
    // Stream this chunk to the callback
    if (onChunk && (chunkText || audioBase64)) {
      onChunk({
        text: chunkText,
        audioBase64: audioBase64,
        isComplete: isComplete
      });
    }

    if (isComplete) {
      done = true;
    }
  }

  return { success: true };
}
  
export function endLiveInterview() {
  if (liveSession) {
    liveSession.close();
    liveSession = null;
    responseQueue = [];
    console.debug("Live Interview Session ended");
  }
}