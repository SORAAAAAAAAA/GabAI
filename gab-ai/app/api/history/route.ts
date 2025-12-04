import { getAllSessions } from '@/utils/api/api.getallSessions';

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return Response.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
