import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav, bufferToBase64 } from "../../services/fileConvertService";
import { createSystemInstruction } from "../../services/systemInstruction";
import { convertWebMTo16BitPCM } from "../../services/audioConvert";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string});

let liveSession: any = null;
let responseQueue: any[] = [];

export async function startLiveInterview(  name: string, job: string, resume: string, localtime: string) {

  const model = "gemini-2.5-flash-native-audio-preview-09-2025";
  
  const systemInstruction = createSystemInstruction(name, resume, job, localtime);
 
  const config = { 
    responseModalities: [Modality.AUDIO],
    thinkingConfig: {
    thinkingBudget: 5000,
    includeThoughts: true,
  },
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

  // Wait for the session to connect and be fully ready
  liveSession = await ai.live.connect({
    model: model,
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
    config: config,
  });

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
    console.debug("Message polled from queue:", message ? message.serverContent?.modelTurn?.parts[0] : "No message yet");
  } return message;
}

export async function continueInterview(userMessage: any, onChunk?: (chunk: {text: string, audioBase64: string, isComplete: boolean}) => void) {
  if (!liveSession) {
    throw new Error("Interview not started. Please call startLiveInterview() first.");
  }
  // Prepare audio if present
  let base64Audio = "";
  // Only convert audio if it exists
  if (userMessage.audioMessage) {
    console.debug(userMessage.audioMessage);
    const fileBuffer = await convertWebMTo16BitPCM(userMessage.audioMessage);
    base64Audio = Buffer.from(fileBuffer).toString('base64');

    liveSession.sendRealtimeInput({
      audio: {
        data: base64Audio,
        mimeType: "audio/pcm;rate=16000"
      }
    });
  }
  const initialMessage = userMessage?.initialMsg;
  if (initialMessage) {
    console.debug("Initial Message: ", initialMessage);
    liveSession.sendClientContent({turns: initialMessage, turnComplete: true});
  }
  
  let done = false;
  let isComplete = false;

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
    if (message.serverContent && message.serverContent.turnComplete) {
      console.debug("Turn complete received.");
      done = true;
      isComplete = true;
    }
    // Stream this chunk to the callback
    if (onChunk && (chunkText || audioBase64)) {
      onChunk({
        text: chunkText,
        audioBase64: audioBase64,
        isComplete: isComplete,
      });
    }
  }

  console.debug("continueInterview completed.");
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