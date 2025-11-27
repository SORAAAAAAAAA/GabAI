import { Behavior, type Tool, Type } from '@google/genai';

const evaluationTool = {
  description:
    "Score the user's response or provideevaluation scores and feedback for the user's response to the following objects inside properties. Call this silently after evaluating the user.",
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
  behavior: Behavior.NON_BLOCKING,
};

export const tools: Tool = {
  functionDeclarations: [evaluationTool],
};
