import { Type, type Tool } from '@google/genai';

export const evaluateResponseFunctionDeclaration = {
  name: 'evaluateResponse',
  description:
    "Score the user's evaluation scores and feedback for the user's response to the following objects inside properties. Call this silently after evaluating the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      scores: {
        type: Type.OBJECT,
        properties: {
          confidence_score: { type: Type.NUMBER },
          clarity_score: { type: Type.NUMBER },
          relevance_score: { type: Type.NUMBER },
        },
        required: ['confidence_score', 'clarity_score', 'relevance_score'],
      },
      feedback: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvement_tip: { type: Type.STRING },
        },
      },
    },
    required: ['scores', 'feedback'],
  },
};

const evaluationTool: Tool = {
  functionDeclarations: [evaluateResponseFunctionDeclaration],
};

export const tools: Tool = evaluationTool;
