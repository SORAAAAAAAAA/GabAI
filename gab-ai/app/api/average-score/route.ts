import { getAllSessions } from '@/utils/api/api.getallSessions';
import { parseOverallFeedback } from '@/utils/formatSessions';

export async function GET() {
  try {
    const sessions = await getAllSessions();

    if (!sessions || sessions.length === 0) {
      return Response.json({ averageScore: 0, sessionCount: 0 });
    }

    // Extract scores from all sessions
    const scores = sessions
      .map((session) => {
        const { score } = parseOverallFeedback(session.overall_feedback);
        // Convert from 0-100 scale to 0-10 scale
        return score;
      }) // Only include valid scores

    if (scores.length === 0) {
      return Response.json({ averageScore: 0, sessionCount: sessions.length });
    };

    // Calculate average score
    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    const averageScore = parseFloat((totalScore / scores.length).toFixed(2));

    return Response.json({
      averageScore:  averageScore, // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error calculating average score:', error);
    return Response.json(
      { error: 'Failed to calculate average score' },
      { status: 500 }
    );
  }
}
