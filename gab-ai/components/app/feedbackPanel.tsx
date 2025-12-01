// components/app/FeedbackPanel.tsx (or wherever you want to show it)
import { useInterviewData } from "@/context/InterviewDataContext";

export function FeedbackPanel() {
  const { latestEvaluation } = useInterviewData();

  if (!latestEvaluation) {
    return <div className="text-gray-500">Waiting for feedback...</div>;
  }

  return (
    <div className="p-4 bg-slate-50 border rounded-lg animate-in fade-in slide-in-from-bottom-4">
      <h3 className="font-bold text-lg mb-2">AI Feedback</h3>
      
      {/* Display Scores */}
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Scores</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Relevance: <span className="font-bold">{latestEvaluation.scores.relevance_score}</span></div>
          <div>Clarity: <span className="font-bold">{latestEvaluation.scores.clarity_score}</span></div>
          <div>Confidence: <span className="font-bold">{latestEvaluation.scores.confidence_score}</span></div>
        </div>
      </div>

      {/* Display Feedback */}
      <div>
        <h4 className="font-semibold text-sm mb-2">Feedback</h4>
        
        {/* Strengths */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 font-medium">Strengths:</p>
          <ul className="list-disc list-inside text-sm">
            {latestEvaluation.feedback.strengths.map((strength, idx) => (
              <li key={idx} className="text-green-700">{strength}</li>
            ))}
          </ul>
        </div>

        {/* Improvement Tip */}
        <div>
          <p className="text-xs text-gray-600 font-medium">Improvement Tip:</p>
          <p className="text-sm text-amber-700">{latestEvaluation.feedback.improvement_tip}</p>
        </div>
      </div>
    </div>
  );
}