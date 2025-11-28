# Data Flow Guide: Frontend to Backend to Voice Agent

## Overview
This guide shows exactly how data flows from when a user starts an interview to when the Voice Agent receives the job and resume data.

---

## Step-by-Step Data Flow

### **STEP 1: User Input (Frontend - InterviewSetup Component)**

**File:** `gab-ai/app/session/components/InterviewSetup.tsx`

**What happens:**
- User enters a job role in the text input (e.g., "Software Engineer")
- User clicks "Start Interview Session" button
- `handleStart()` is triggered

```
User types: "Software Engineer"
       ↓
Button clicked: "Start Interview Session"
       ↓
handleStart() executes
       ↓
Calls: startInterview(jobRole)
```

---

### **STEP 2: Fetch Resume Data (Frontend Hook)**

**File:** `gab-ai/app/session/hooks/useSessionStart.ts`

**What happens:**
- `startInterview(jobRole)` is called with the job role from Step 1
- Hook sets `sessionStart = true` (shows loading spinner)
- Gets current user ID from Supabase authentication
- Queries Supabase `resumes` table to fetch the parsed resume text for that user

```
startInterview("Software Engineer") called
       ↓
setSessionStart(true) ← Shows loading state
       ↓
Get user ID from Supabase auth
       ↓
Query Supabase: SELECT resume_text FROM resumes WHERE user_id = {userID}
       ↓
Get resumeText (e.g., "John Doe, 5 years experience in...")
```

**Data at this point:**
- `jobRole` = "Software Engineer"
- `resumeText` = "John Doe\nExperience: 5 years in full-stack development..."
- `userID` = "user_123"

---

### **STEP 3: Send Data to Backend API (API Function Call)**

**File:** `gab-ai/utils/api/api.startSession.ts`

**What happens:**
- Calls the backend API route with the job and resume data
- Makes a POST request to `/api/session/start-session`
- Sends auth cookies with the request

```
Call: startSession(userID, jobRole, resumeText)
       ↓
POST /api/session/start-session
       ↓
Request Body:
{
  "job_title": "Software Engineer",
  "resume": "John Doe\nExperience: 5 years in..."
}
       ↓
Include auth cookies: credentials: 'include'
```

**Network Request:**
```
POST /api/session/start-session
Content-Type: application/json
Cookie: auth_token=xxxxx

{
  "job_title": "Software Engineer",
  "resume": "John Doe\nExperience: 5 years in full-stack development..."
}
```

---

### **STEP 4: Backend Receives Data (API Route)**

**File:** `gab-ai/app/api/session/start-session/route.ts`

**What happens:**
- Backend receives the POST request
- Extracts `job_title` and `resume` from request body
- Validates that `job_title` exists
- Creates a Supabase client using server-side credentials

```
Backend receives request
       ↓
Extract from body:
  - job_title = "Software Engineer"
  - resume = "John Doe\nExperience: 5 years in..."
       ↓
Validate: Check if job_title is provided
       ↓
Create Supabase server client
```

---

### **STEP 5: Authenticate User (Backend)**

**File:** `gab-ai/app/api/session/start-session/route.ts`

**What happens:**
- Gets the authenticated user from Supabase (using auth cookies)
- Extracts the `user_id` from the session
- Validates that user is logged in

```
Get authenticated user from Supabase auth
       ↓
Extract: user_id = "user_123"
       ↓
Validate: Check if user exists and is authenticated
       ↓
If not authenticated → Return 401 Unauthorized error
```

---

### **STEP 6: Create Session in Database (Backend)**

**File:** `gab-ai/app/api/session/start-session/route.ts`

**What happens:**
- Inserts a new session record into Supabase `sessions` table
- Stores the user_id, job_title, and status
- Gets the newly created session ID

```
Insert into Supabase sessions table:
{
  user_id: "user_123",
  job_title: "Software Engineer",
  status: "active"
}
       ↓
Supabase returns: sessionId = "session_456"
```

---

### **STEP 7: Create LiveKit Room (Backend)**

**File:** `gab-ai/app/api/session/start-session/route.ts` (TO BE ADDED)

**What happens:**
- Creates a LiveKit room for this session
- Sets the room metadata with job title and resume data
- This metadata will be read by the Voice Agent

```
Create LiveKit room with name: session_456
       ↓
Set room metadata:
{
  "jobTitle": "Software Engineer",
  "resume": "John Doe\nExperience: 5 years in...",
  "sessionId": "session_456"
}
```

**Note:** This step needs to be implemented. The code will look like:
```typescript
const livekit = new LiveKitClient(
  process.env.LIVEKIT_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

await livekit.room.create({
  name: `session-${sessionData.id}`,
  metadata: JSON.stringify({
    jobTitle: job_title,
    resume: resume,
    sessionId: sessionData.id,
  }),
});
```

---

### **STEP 8: Return Response to Frontend (Backend)**

**File:** `gab-ai/app/api/session/start-session/route.ts`

**What happens:**
- Backend sends a success response back to the frontend
- Includes the session ID, job title, resume, and WebSocket URL

```
Return Response:
{
  "message": "Session started successfully",
  "sessionId": "session_456",
  "jobTitle": "Software Engineer",
  "resume": "John Doe\nExperience: 5 years in...",
  "wsUrl": "ws://livekit-server/room/session_456?token=xxxxx"
}
```

---

### **STEP 9: Frontend Receives Response (Hook)**

**File:** `gab-ai/app/session/hooks/useSessionStart.ts`

**What happens:**
- Frontend receives the API response
- Extracts `sessionId` and `wsUrl`
- Sets `sessionStart = false` (hides loading spinner)
- Logs the successful response

```
Receive response from backend
       ↓
Extract:
  - sessionId = "session_456"
  - wsUrl = "ws://livekit-server/..."
       ↓
setSessionStart(false) ← Hide loading spinner
       ↓
Log success: "Session ID: session_456"
       ↓
Call: onStartInterview() ← Trigger transition to chat view
```

---

### **STEP 10: Frontend Connects to LiveKit Room (Frontend)**

**File:** `gab-ai/app/session/page.tsx` or similar

**What happens:**
- Frontend uses the `wsUrl` to establish WebSocket connection
- Connects to the LiveKit room with the session ID
- Joins as a participant in the room

```
Use wsUrl to connect to LiveKit room
       ↓
Connect to: ws://livekit-server/room/session_456?token=xxxxx
       ↓
Frontend joins as participant "user_123"
       ↓
Room contains:
  - Metadata: { jobTitle, resume, sessionId }
  - Participant: Frontend client
```

---

### **STEP 11: Voice Agent Joins Room (LiveKit Server)**

**File:** `livekit-voice-agent/agent.ts`

**What happens:**
- Voice Agent instance is spawned for this session
- Agent connects to the same LiveKit room
- Agent reads the room metadata

```
Voice Agent spawned
       ↓
Agent connects to: session_456
       ↓
Read room metadata:
{
  jobTitle: "Software Engineer",
  resume: "John Doe\nExperience: 5 years in...",
  sessionId: "session_456"
}
```

---

### **STEP 12: Voice Agent Generates System Instructions (Agent)**

**File:** `livekit-voice-agent/agent.ts` (TO BE ADDED)

**What happens:**
- Agent extracts job title and resume from room metadata
- Calls `generateSystemInstruction()` function with the data
- Creates personalized system instructions for the LLM

```
Extract from room metadata:
  - jobTitle = "Software Engineer"
  - resume = "John Doe\nExperience: 5 years in..."
       ↓
Call: generateSystemInstruction(
  candidateName: "John Doe",
  jobRole: "Software Engineer",
  resumeText: "..." 
)
       ↓
Returns personalized system instruction:
"
Role: You are "GabAI," a professional AI Interviewer.

Candidate Name: John Doe
Role Applied For: Software Engineer

Candidate Resume:
John Doe
Experience: 5 years in full-stack development...
[Full resume content]
"
```

---

### **STEP 13: Initialize LLM with Instructions (Agent)**

**File:** `livekit-voice-agent/agent.ts` (TO BE MODIFIED)

**What happens:**
- Agent initializes Google Gemini model with the personalized instructions
- LLM is now aware of the job role and candidate resume

```
Create RealtimeModel with:
  - model: "gemini-2.5-flash-native-audio-preview-09-2025"
  - instructions: [personalized instructions from Step 12]
  - voice: "Gacrux"
       ↓
LLM initialization complete
       ↓
Agent ready to conduct interview
```

---

### **STEP 14: Agent Starts Interview (Voice Agent)**

**File:** `livekit-voice-agent/agent.ts`

**What happens:**
- Agent generates its first greeting
- References the job role and candidate name from the system instructions
- Sends audio back to the frontend

```
Agent generates greeting:
"Welcome John, let's discuss your experience for the Software Engineer position. 
Can you start by telling me a bit about yourself?"
       ↓
Audio sent to frontend via WebSocket
       ↓
Frontend receives and plays audio
       ↓
Interview begins!
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                            │
│                                                                     │
│  InterviewSetup Component:                                         │
│  User types: "Software Engineer"                                   │
│  User clicks: "Start Interview Session"                            │
│                     ↓                                               │
│  useSessionStart Hook:                                             │
│  1. Get user ID from Supabase auth                                │
│  2. Query Supabase for resume_text                                │
│  3. Call startSession API                                         │
│                     ↓                                               │
│  api.startSession Function:                                       │
│  Send POST request with:                                          │
│  {                                                                 │
│    "job_title": "Software Engineer",                              │
│    "resume": "John Doe..."                                        │
│  }                                                                 │
│                                                                     │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
                  │ POST /api/session/start-session
                  │ Body: { job_title, resume }
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND (Next.js API Route)                      │
│                                                                     │
│  route.ts: POST /api/session/start-session                        │
│  1. Extract job_title and resume from request                     │
│  2. Validate job_title exists                                     │
│  3. Get authenticated user from Supabase                          │
│  4. Insert session into Supabase database                         │
│  5. Create LiveKit room ← NEEDS TO BE ADDED                       │
│  6. Set room metadata with job & resume ← NEEDS TO BE ADDED       │
│  7. Return response to frontend                                   │
│                     ↓                                               │
│  Response sent back:                                              │
│  {                                                                 │
│    "sessionId": "session_456",                                    │
│    "jobTitle": "Software Engineer",                               │
│    "resume": "John Doe...",                                       │
│    "wsUrl": "ws://livekit-server/..."                             │
│  }                                                                 │
│                                                                     │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
                  │ WebSocket Response
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                            │
│                                                                     │
│  useSessionStart Hook:                                             │
│  1. Receive response with sessionId and wsUrl                     │
│  2. Extract sessionId and wsUrl                                   │
│  3. Hide loading spinner                                          │
│  4. Call onStartInterview()                                       │
│                     ↓                                               │
│  Frontend connects to LiveKit room using wsUrl                    │
│  Joins as participant                                             │
│                                                                     │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      LiveKit Server (Room)                         │
│                                                                     │
│  Room: session_456                                                 │
│  Metadata: { jobTitle, resume, sessionId }                        │
│  Participants:                                                     │
│  ├─ Frontend client (user_123)                                    │
│  └─ Voice Agent (to be spawned)                                   │
│                                                                     │
└─────────────────┬─────────────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  VOICE AGENT (livekit-voice-agent)                 │
│                                                                     │
│  agent.ts: defineAgent entry function                             │
│  1. Agent joins room: session_456                                 │
│  2. Read room metadata: { jobTitle, resume }                      │
│  3. Extract: jobTitle = "Software Engineer"                       │
│  4. Extract: resume = "John Doe..."                               │
│  5. Call generateSystemInstruction() ← NEEDS TO BE ADDED          │
│  6. Create RealtimeModel with personalized instructions           │
│  7. Start AgentSession                                            │
│                     ↓                                               │
│  Agent greets with job-aware message:                            │
│  "Welcome John, let's discuss your experience for the             │
│   Software Engineer position..."                                  │
│                     ↓                                               │
│  Audio sent to frontend via WebSocket                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Transformations Along the Flow

| Step | Data | Format | Source |
|------|------|--------|--------|
| 1 | Job Role | String | User input |
| 2 | Resume Text | String | Supabase DB |
| 3 | Job + Resume | JSON | API request body |
| 4 | Job + Resume + User ID | Variables | API request parsing |
| 5 | User ID | UUID | Supabase auth |
| 6 | Session ID | UUID | Supabase insert |
| 7 | Room Metadata | JSON string | Room creation |
| 11 | Room Metadata | JSON object | Agent reads |
| 12 | Personalized Instructions | String template | Function call |
| 13 | LLM Instructions | System prompt | Model initialization |

---

## Key Data Points

### Data Entering the System (Frontend)
- **jobRole**: "Software Engineer" (from user input)
- **resumeText**: Full parsed resume from Supabase (already extracted from PDF)

### Data in Transit (API)
- **job_title**: Sent in POST body
- **resume**: Sent in POST body
- **Auth Cookies**: Sent automatically with credentials

### Data in Database (Supabase)
- **Session Record**: { user_id, job_title, status }
- **Resume Record**: { user_id, resume_text } (already exists)

### Data in LiveKit (Room Metadata)
- **jobTitle**: Stored in room metadata
- **resume**: Stored in room metadata
- **sessionId**: Stored in room metadata

### Data in Voice Agent (System Instructions)
- **candidateName**: Extracted from resume or room participants
- **jobRole**: From room metadata
- **resumeText**: From room metadata
- **currentTime**: Generated dynamically

---

## Summary

The data flows in this sequence:
1. User enters job role in UI
2. Frontend fetches resume from database
3. Frontend sends both to backend API
4. Backend creates session in database
5. Backend creates LiveKit room with metadata
6. Frontend connects to LiveKit room
7. Voice Agent joins room and reads metadata
8. Agent uses metadata to generate personalized instructions
9. Agent starts interview with context about job and resume
