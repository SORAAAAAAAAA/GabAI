// components/app/FeedbackPanel.tsx
import { useInterviewData } from "@/context/InterviewDataContext";

export function FeedbackPanel() {
  const { latestEvaluation } = useInterviewData();

  if (!latestEvaluation) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm p-4">Waiting for feedback...</div>;
  }

  return (
    <div className="flex flex-col p-4 gap-4 overflow-y-auto h-full">
      {/* Display Scores */}
      <div className="bg-slate-50 rounded-lg p-3">
        <h4 className="font-semibold text-sm mb-3 text-gray-800">Scores</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Relevance</span>
            <span className="font-bold text-blue-600">{latestEvaluation.scores.relevance_score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Clarity</span>
            <span className="font-bold text-blue-600">{latestEvaluation.scores.clarity_score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Confidence</span>
            <span className="font-bold text-blue-600">{latestEvaluation.scores.confidence_score}</span>
          </div>
        </div>
      </div>

      {/* Display Feedback */}
      <div className="space-y-3">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Strengths</p>
          <ul className="space-y-1">
            {(latestEvaluation.feedback?.strengths ?? []).map((strength, idx) => (
              <li key={idx} className="text-xs text-green-800 leading-relaxed">
                • {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Tip */}
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Improvement Tip</p>
          <p className="text-xs text-amber-800 leading-relaxed">{latestEvaluation.feedback?.improvement_tip || 'No improvement tip available'}</p>
        </div>
      </div>
    </div>
  );
}