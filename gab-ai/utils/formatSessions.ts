export function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseOverallFeedback(feedbackString: unknown): {
  score: number;
  feedback: string;
} {
  const defaultResult = { score: 0, feedback: 'No feedback available' };

  if (!feedbackString || typeof feedbackString !== 'string') {
    return defaultResult;
  }

  try {
    // Remove outer quotes and unescape the string
    let cleanedStr = feedbackString;
    if (cleanedStr.startsWith('"') && cleanedStr.endsWith('"')) {
      cleanedStr = cleanedStr.slice(1, -1);
    }
    
    // Unescape the string
    cleanedStr = cleanedStr.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    
    // Remove markdown code fence
    cleanedStr = cleanedStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const data = JSON.parse(cleanedStr);
    const score = data?.session_summary?.overall_performance_score ?? 0;
    const feedback = data?.session_summary?.duration_feedback ?? 'No feedback available';
    
    return { score, feedback };
  } catch (error) {
    console.error('Error parsing overall_feedback:', error);
    return defaultResult;
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-50 text-green-700 border-green-100';
  if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (score >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  return 'bg-red-50 text-red-700 border-red-100';
}
