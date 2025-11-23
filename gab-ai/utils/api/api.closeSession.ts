// utils/api/closeSession.ts
export const closeSessionAPI = async (sessionId: string) => {
  const serverUrl = process.env.NEXT_PUBLIC_HTTP_SERVER_URL;
  
  const response = await fetch(`${serverUrl}/close-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  
  return response.json();
};