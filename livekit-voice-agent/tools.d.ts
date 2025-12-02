import { Type, type Tool } from '@google/genai';
export declare const evaluateResponseFunctionDeclaration: {
    name: string;
    description: string;
    parameters: {
        type: Type;
        properties: {
            scores: {
                type: Type;
                properties: {
                    confidence_score: {
                        type: Type;
                    };
                    clarity_score: {
                        type: Type;
                    };
                    relevance_score: {
                        type: Type;
                    };
                };
                required: string[];
            };
            feedback: {
                type: Type;
                properties: {
                    strengths: {
                        type: Type;
                        items: {
                            type: Type;
                        };
                    };
                    improvement_tip: {
                        type: Type;
                    };
                };
            };
        };
        required: string[];
    };
};
export declare const tools: Tool;
//# sourceMappingURL=tools.d.ts.map