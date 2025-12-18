import { GoogleGenAI } from "@google/genai";
import { analysisInstruction } from "@/utils/systemInstructions/endEvaluatorInstruction"
import { evaluatorTool } from "@/utils/tools/tool.endEvaluator";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY as string});

// Helper function to round all numeric values to 2 decimal places
function roundNumbers(obj: unknown): unknown {
    if (typeof obj === 'number') {
        return Math.round(obj * 100) / 100;
    }
    if (Array.isArray(obj)) {
        return obj.map(roundNumbers);
    }
    if (obj !== null && typeof obj === 'object') {
        const rounded: Record<string, unknown> = {};
        for (const key in obj) {
            rounded[key] = roundNumbers((obj as Record<string, unknown>)[key]);
        }
        return rounded;
    }
    return obj;
}

export async function endEvaluator(conversation: string, evaluationData: string) {

    if (!conversation || !evaluationData) {
        throw new Error("Missing conversation or evaluation data for end evaluation.");
    }

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `These will be the data that you will use for your analysis: ${conversation} ${evaluationData} Upon start the analysis, strictly adhere to the provided instructions. Use the designated tool to format your output accordingly.`,
            config: {
                systemInstruction: analysisInstruction,
                tools: [
                    {
                        functionDeclarations: [evaluatorTool],
                    }
                ],
            },
        })

        await new Promise(resolve => setTimeout(resolve, 7000)); // Wait for 7 seconds to ensure data consistency

        if (result.functionCalls && result.functionCalls.length > 0) {
            const functionCall = result.functionCalls[0];   

            // Round all numeric values to 2 decimal places
            const roundedArgs = roundNumbers(functionCall.args);
            const args = JSON.stringify(roundedArgs);
            
            return args;
        }
        

    } catch (error) {
        throw new Error("Error generating end evaluation: " + error);
    }

}