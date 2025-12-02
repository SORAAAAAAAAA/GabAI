import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import {  tools } from '../../tools.js';
import { evaluateInstruction } from '../../promptInstructions/evaluateInstruction.js';

dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

export const evaluatorModel = ai.chats.create({
  model: "gemini-2.0-flash-lite",
  history: [
    {
      role: "user",
      parts: [{ text: "Start evaluation" }],
    },
    {
      role: "model",
      parts: [{ text: "Evaluation started" }],
    }
  ],
  config: {
    tools: [tools],
    systemInstruction: evaluateInstruction,
  }
})