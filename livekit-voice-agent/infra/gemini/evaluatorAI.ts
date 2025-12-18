import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import {  tools } from '../../tools.js';
import { evaluateInstruction } from '../../promptInstructions/evaluateInstruction.js';

dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

// Create a fresh chat instance for each evaluation to avoid history pollution
export function createEvaluatorChat() {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      tools: [tools],
      systemInstruction: evaluateInstruction,
    }
  });
}