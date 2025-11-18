export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Call the WebSocket server's close endpoint
    const wsServerUrl = process.env.WEBSOCKET_SERVER_URL || 'http://localhost:8080';
    
    try {
      const response = await fetch(`${wsServerUrl}/close-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        console.warn(`WebSocket server returned status ${response.status}`);
      }
    } catch (fetchError) {
      console.warn('Could not reach WebSocket server:', fetchError);
      // Continue anyway - the WebSocket will close when the client disconnects
    }

    return Response.json({ message: "WebSocket connection close request sent" });
  } catch (error) {
    console.error("Error closing WebSocket:", error);
    return Response.json({ error: "Failed to process close request" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: "Close WebSocket connection endpoint" });
}
