# WebSocket Connection Closure on Session End

## Overview
Implemented automatic WebSocket connection closure when an interview session ends, ensuring proper resource cleanup and preventing orphaned connections.

## Architecture

### WebSocket Server Changes
**File:** `websocket-server/websocketServer.ts`

#### 1. Connection Registry
```typescript
// Store active WebSocket connections mapped to sessionId
const activeConnections = new Map<string, WebSocket>();
```
- Tracks all active WebSocket connections
- Maps session IDs to their corresponding WebSocket instances
- Used for targeted connection cleanup

#### 2. Connection Closure Function
```typescript
export function closeSessionConnection(sessionId: string)
```
- Looks up connection by sessionId
- Sends "session_ended" message to client
- Closes connection with code 1000 (normal closure)
- Removes connection from registry

#### 3. Connection Tracking
- Connection stored when interview starts: `activeConnections.set(sessionId, ws)`
- Connection removed on close: `activeConnections.delete(sessionId)`
- Connection removed on error: `activeConnections.delete(sessionId)`
- Error handling in catch blocks to prevent orphaned connections

#### 4. Event Handlers
- **close event**: Logs closure and removes from registry
- **error event**: Logs error and removes from registry
- **message event**: Handles 'end_interview' type and removes connection

### API Endpoint Changes

#### 1. End Session Endpoint (Updated)
**File:** `gab-ai/app/api/session/end-session/route.ts`

**Process:**
1. Updates session status to "ended" in database
2. Calls WebSocket close endpoint to terminate connection
3. Handles errors gracefully (logs warning but continues)

```typescript
// After updating session status:
await fetch(`${NEXT_PUBLIC_API_URL}/api/websocket/close-connection`, {
  method: 'POST',
  body: JSON.stringify({ sessionId }),
});
```

**Error Handling:**
- If WebSocket closure fails, session is still marked as ended
- Prevents frontend from being stuck waiting for connection closure
- Logs warning for debugging

#### 2. WebSocket Close Connection Endpoint (New)
**File:** `gab-ai/app/api/websocket/close-connection/route.ts`

**Purpose:**
- Bridge between frontend session end and WebSocket server
- Receives sessionId from end-session endpoint
- Imports and calls `closeSessionConnection(sessionId)`
- Returns success response

**Request:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "message": "WebSocket connection closed successfully"
}
```

### Client-Side Changes

#### WebSocket Hook Update
**File:** `gab-ai/hooks/useWebSocket.ts`

**Message Types Added:**
- `session_ended` - Server initiated session termination
- `interview_ended` - Interview completion

**Handler for session_ended:**
```typescript
if (message.type === 'session_ended') {
  setConnected(false);
  setMessages((prev) => [...prev, { 
    type: 'session_ended', 
    message: message.message || 'Session has been terminated'
  }]);
  return;
}
```

**Behavior:**
- Sets connection status to disconnected
- Adds message to chat history (informs user)
- WebSocket closes automatically after message

## Data Flow

### When User Clicks "End Session"

1. **Client:** `handleExitSession()` in `useSessionExit` hook
   ↓
2. **Client → Server:** POST `/api/session/end-session` with sessionId
   ↓
3. **Server (End Session API):** Updates DB status to "ended"
   ↓
4. **Server (End Session API):** POST `/api/websocket/close-connection`
   ↓
5. **WebSocket Server:** `closeSessionConnection(sessionId)`
   - Finds connection in registry
   - Sends "session_ended" message
   - Closes connection
   - Cleans up registry
   ↓
6. **Client WebSocket Hook:** Receives "session_ended" message
   - Sets `connected = false`
   - Displays termination message
   ↓
7. **Client:** Navigation to destination (Dashboard, etc.)

### When Server Initiates End (From Database)

If session status is externally changed to "ended", connection cleanup happens:
1. Frontend polls or observes session status change
2. Can manually call close endpoint
3. Or user navigates away naturally

## Benefits

✅ **Resource Cleanup**
- WebSocket connections properly closed
- No orphaned connections in memory
- Server resources freed immediately

✅ **User Feedback**
- Client receives termination notification
- Message appears in chat history
- User knows why connection closed

✅ **Error Resilience**
- Handles connection errors gracefully
- Session status updated even if WS closure fails
- No cascading failures

✅ **Clean State**
- Registry is kept clean
- All connections accounted for
- Memory leaks prevented

## Connection Lifecycle

```
1. CONNECTED (open)
   - Connection stored in registry
   - Messages flowing both ways
   
2. CLOSING (initiated)
   - Server sends "session_ended" message
   - WebSocket.close() called
   
3. CLOSED
   - Connection removed from registry
   - Event handlers triggered
   - Resources freed
```

## Error Scenarios

### Scenario 1: Network Disconnection
- Client disconnects unexpectedly
- Server's 'close' event fires
- Connection removed from registry

### Scenario 2: Session Termination Fails
- End session API fails to reach WebSocket server
- Session status still updated
- Frontend proceeds with navigation
- Message logged for debugging

### Scenario 3: Double Termination
- User clicks "End Session" multiple times
- First call succeeds and closes connection
- Second call finds no connection (safely handled)
- No error thrown

## Configuration

### WebSocket Server
- Uses Map data structure for O(1) lookup
- No external dependencies required
- Scales linearly with number of connections

### API Integration
- Uses NEXT_PUBLIC_API_URL for flexibility
- Timeout handled by fetch API
- Graceful degradation if timeout occurs

## Testing Considerations

1. **Connection Cleanup:**
   - Start session
   - Click "End Session"
   - Verify connection closed in browser DevTools

2. **Message Delivery:**
   - Start session
   - End session
   - Check "session_ended" message appears in chat

3. **Database Consistency:**
   - End session
   - Verify session.status = "ended" in database

4. **Multiple Clients:**
   - Start 2 sessions simultaneously
   - End one session
   - Other session remains active

## Future Enhancements

- Add ping/pong heartbeat to detect dead connections
- Implement auto-cleanup for stale connections
- Add analytics for connection closure reasons
- Implement graceful shutdown sequence
- Add reconnection logic for temporary disconnections
