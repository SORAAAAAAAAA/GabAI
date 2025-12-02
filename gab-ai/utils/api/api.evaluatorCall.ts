import { GoogleGenAI } from "@google/genai";
import { analysisInstruction } from "@/utils/systemInstructions/endEvaluatorInstruction"


const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY as string});

export async function endEvaluator(conversation: string, evaluationData: string) {

    if (!conversation || !evaluationData) {
        throw new Error("Missing conversation or evaluation data for end evaluation.");
    }

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `These will be the data that you will use for your analysis: ${conversation} ${evaluationData} Upon start the analysis, strictly adhere to the provided instructions.`,
            config: {
                systemInstruction: analysisInstruction
            }
        })

        const response = result.text
        
        return response;

    } catch (error) {
        throw new Error("Error generating end evaluation: " + error);
    }

}