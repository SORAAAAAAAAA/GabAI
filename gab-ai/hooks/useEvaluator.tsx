import { createContext, useContext, useState, ReactNode } from 'react';

interface EvaluationData {
  session_summary: {
    overall_performance_score: number;
    duration_feedback: string;
    total_turns: number;
  };
  metrics: {
    average_clarity: number;
    average_confidence: number;
    average_relevance: number;
    professionalism_score: number;
    pacing_score: number;
  };
  score_trend: Array<{
    turn: number;
    clarity: number;
    confidence: number;
    relevance: number;
  }>;
  qualitative_analysis: {
    key_strengths: string[];
    primary_weaknesses: string[];
    critical_flags: string[];
    actionable_next_steps: string[];
  };
  sentiment_report: {
    dominant_tone: string;
    emotional_progression: string;
  };
}

interface UseEvaluatorReturn {
    isEvaluatorActive: boolean;
    setIsEvaluatorActive: React.Dispatch<React.SetStateAction<boolean>>;
    evaluationData: EvaluationData | null;
    setEvaluationData: React.Dispatch<React.SetStateAction<EvaluationData | null>>;
    isEvaluationLoading: boolean;
    setIsEvaluationLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const EvaluatorContext = createContext<UseEvaluatorReturn | undefined>(undefined);

export function EvaluatorProvider({ children }: { children: ReactNode }) {
    const [isEvaluatorActive, setIsEvaluatorActive] = useState(false);
    const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
    const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);

    return (
        <EvaluatorContext.Provider value={{ 
            isEvaluatorActive, 
            setIsEvaluatorActive,
            evaluationData,
            setEvaluationData,
            isEvaluationLoading,
            setIsEvaluationLoading,
        }}>
            {children}
        </EvaluatorContext.Provider>
    );
}

export function useEvaluator(): UseEvaluatorReturn {
    const context = useContext(EvaluatorContext);
    if (!context) {
        throw new Error('useEvaluator must be used within an EvaluatorProvider');
    }
    return context;
}
