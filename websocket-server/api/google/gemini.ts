import { GoogleGenAI, Modality, type LiveConnectConfig, type Tool, type ToolUnion, FunctionResponseScheduling } from "@google/genai";
import { pcmToWav, bufferToBase64 } from "../../services/fileConvertService";
import { createSystemInstruction } from "../../services/systemInstruction";
import { convertWebMTo16BitPCM } from "../../services/audioConvert";
import { evaluationTool } from "../../services/tools";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string});

let liveSession: any = null;
let responseQueue: any[] = [];
let conversation: string[] = [];

export async function startLiveInterview(  name: string, job: string, resume: string, localtime: string) {

  const model = "gemini-2.5-flash-native-audio-preview-09-2025";
  
  const systemInstruction = createSystemInstruction(name, resume, job, localtime);

  const tools = [{ functionDeclarations: [evaluationTool] }];
 
  const config = { 
  responseModalities: [Modality.AUDIO],
  tools: tools,
  thinkingConfig: {
    thinkingBudget: 5000,
    includeThoughts: true,
  },
  systemInstruction: {
    parts: [{ text: systemInstruction }]
  },
  outputAudioTranscription: {},
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: 'Gacrux' },
    }
  },
  toolConfig: {
    functionCallingConfig: {
      mode: 'AUTO'
    }
  }
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
  if (liveSession) {
    return {success: true};
  }
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

export async function continueInterview(userMessage: any, onChunk?: (chunk: {text: string, audioBase64: string, evaluation?: any, isComplete: boolean}) => void) {
  if (!liveSession) {
    throw new Error("Interview not started. Please call startLiveInterview() first.");
  }

  if (!userMessage){
      throw new Error("No user message provided.");
  }

  liveSession.sendClientContent({ turns: [{ role: "user", parts: [{ text: userMessage }] }] });
  // Prepare audio if present
  
  let done = false;
  

  while (!done) {
    const message = await waitMessage();
    
    let chunkText = "";
    let audioBuffer: ArrayBuffer | null = null;
    let audioBase64 = "";
    let evaluationData = null;
    let isComplete = false;

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

    // Check for tool calls - they can be at message.toolCall OR message.serverContent.toolCall
    let toolCall = message.toolCall || message.serverContent?.toolCall;
    
    if (toolCall && toolCall.functionCalls && toolCall.functionCalls.length > 0) {
      console.debug("✅ Tool call received:", toolCall);
      const functionResponses = [];
      
      for (const fc of toolCall.functionCalls) {
        console.debug(`📞 Function called: ${fc.name} (id: ${fc.id})`);
        console.debug(`📋 Arguments:`, JSON.stringify(fc.args));
        
        evaluationData = fc.args;
        
        // Prepare function response for the Live API
        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response: { 
            result: "evaluated",
            scheduling: FunctionResponseScheduling.SILENT
          }
        });
      }
      
      // Send tool response back to the session
      console.log("📤 Sending tool response...");
      liveSession.sendToolResponse({ functionResponses: functionResponses });
    } else {
      console.debug("❌ No toolCall in message. Checked: message.toolCall and message.serverContent?.toolCall");
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
    if (onChunk && (chunkText || audioBase64 || evaluationData)) {
      onChunk({
        text: chunkText,
        audioBase64: audioBase64,
        evaluation: evaluationData,
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