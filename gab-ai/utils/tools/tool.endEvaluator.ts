import { Type } from '@google/genai';

export const evaluatorTool = {
  name: "end_evaluator",
  description: "Tool to generate a structured performance evaluation after the interview session ends",
  parameters: {
    type: Type.OBJECT,
    properties: {
      session_summary: {
        type: Type.OBJECT,
        description: "Summary of the session performance",
        properties: {
          overall_performance_score: {
            type: Type.NUMBER,
            description: "Average of all main metrics (0-100)"
          },
          duration_feedback: {
            type: Type.STRING,
            description: "Feedback on session duration and pacing"
          },
          total_turns: {
            type: Type.NUMBER,
            description: "Total number of question-answer exchanges"
          }
        },
        required: ["overall_performance_score", "duration_feedback", "total_turns"]
      },
      metrics: {
        type: Type.OBJECT,
        description: "Individual performance metrics",
        properties: {
          average_clarity: { type: Type.NUMBER, description: "Clarity score (0-100)" },
          average_confidence: { type: Type.NUMBER, description: "Confidence score (0-100)" },
          average_relevance: { type: Type.NUMBER, description: "Relevance score (0-100)" },
          professionalism_score: { type: Type.NUMBER, description: "Professionalism score (0-100)" },
          pacing_score: { type: Type.NUMBER, description: "Pacing score (0-100)" }
        },
        required: ["average_clarity", "average_confidence", "average_relevance", "professionalism_score", "pacing_score"]
      },
      score_trend: {
        type: Type.ARRAY,
        description: "Performance trend across turns",
        items: {
          type: Type.OBJECT,
          properties: {
            turn: { type: Type.NUMBER },
            clarity: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            relevance: { type: Type.NUMBER }
          }
        }
      },
      qualitative_analysis: {
        type: Type.OBJECT,
        description: "Qualitative feedback and analysis",
        properties: {
          key_strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Key strengths demonstrated"
          },
          primary_weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Areas for improvement"
          },
          critical_flags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Critical issues or concerns"
          },
          actionable_next_steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific advice for next session"
          }
        },
        required: ["key_strengths", "primary_weaknesses", "critical_flags", "actionable_next_steps"]
      },
      sentiment_report: {
        type: Type.OBJECT,
        description: "Sentiment and emotional analysis",
        properties: {
          dominant_tone: { type: Type.STRING, description: "Overall tone of the interview" },
          emotional_progression: { type: Type.STRING, description: "How emotions changed during the interview" }
        },
        required: ["dominant_tone", "emotional_progression"]
      }
    },
    required: ["session_summary", "metrics", "qualitative_analysis", "sentiment_report"]
  }
};