interface EvaluationScores {
    confidence_score: number;
    clarity_score: number;
    relevance_score: number;
}

interface EvaluationFeedback {
    strengths: string[];
    improvement_tip: string;
}

export interface EvaluationData {
    scores: EvaluationScores;
    feedback: EvaluationFeedback;
}








