# GabAI - AI-Powered Interview Platform

GabAI is a comprehensive AI-driven interview preparation and simulation platform. It leverages Google's Gemini API with real-time audio capabilities to conduct realistic mock interviews tailored to users' job applications and resumes.

## 📋 Project Overview

GabAI provides users with:

- **Resume Upload & Parsing**: Extract key skills and experiences from resumes using AI
- **Personalized Mock Interviews**: AI conducts interviews based on job role and resume content
- **Real-time Voice Interaction**: Speech-to-text and text-to-speech for natural conversation
- **Interview History & Analytics**: Track interview sessions and performance metrics
- **User Authentication**: Secure login via Supabase Auth

## 🏗️ Architecture

The project is split into two main parts:

### Frontend & API Server (`/gab-ai`)

- **Framework**: Next.js 15.5.4 with React 19.1.0
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth with SSR support
- **Database Integration**: Supabase for user data, resumes, sessions, and transcripts
- **AI Services**: Google's Generative AI APIs (Gemini 2.5 Flash)

### WebSocket Server (`/websocket-server`)

- **Runtime**: Node.js with TypeScript
- **Protocol**: WebSocket (ws) for real-time bidirectional communication
- **AI Engine**: Gemini Live API for interactive audio conversations
- **Database**: Supabase for session management and logging

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- **Supabase** account with PostgreSQL database
- **Google Cloud** account with:
  - Gemini API enabled
  - Document AI API (for resume parsing)
- Environment variables configured

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd GabAI
```

#### 2. Frontend Setup (`gab-ai`)

```bash
cd gab-ai
npm install
```

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

#### 3. WebSocket Server Setup (`websocket-server`)

```bash
cd websocket-server
npm install
```

Create `.env` with:

```env
SUPABASE_URL=<your-supabase-url>
SERVICE_ROLE_KEY=<your-service-role-key>
GEMINI_API_KEY=<your-gemini-api-key>
ALLOWED_ORIGIN=http://localhost:3000
PORT=8080
```

### Running the Application

#### Start Frontend Development Server

```bash
cd gab-ai
npm run dev
```

Frontend will be available at `http://localhost:3000`

#### Start WebSocket Server

```bash
cd websocket-server
npm start
```

WebSocket server will be available at `ws://localhost:8080`

## 📚 Key Features

### 1. **User Authentication**

- Magic link authentication via Supabase Auth
- Session management with JWT tokens
- Secure server-side authentication

### 2. **Resume Management**

- PDF and document upload support
- AI-powered resume parsing using Gemini
- Extract skills and experiences for personalized interviews
- Storage in Supabase database

### 3. **Mock Interviews**

- Real-time conversational AI using Gemini Live API
- Audio input (speech-to-text) and output (text-to-speech)
- Contextual questions based on resume and job role
- 8-15 tailored interview questions
- Natural, realistic interview flow

### 4. **Dashboard & Analytics**

- View interview history
- Track interview scores and performance
- Visual representations of progress
- Interview duration and status tracking

### 5. **Real-time Communication**

- WebSocket protocol for low-latency communication
- Bidirectional audio streaming
- Session persistence and recovery

## 🔌 API Endpoints

### Frontend API Routes (`/api`)

#### Resume Processing

- **POST** `/api/ai/resume-process` - Parse resume and extract key information

#### Authentication

- **POST** `/api/auth/logout` - Logout user

#### Session Management

- **POST** `/api/session/start-session` - Initialize interview session
- **POST** `/api/session/end-session` - Terminate interview session

### WebSocket Events

#### Client → Server

- `start_interview` - Begin interview with candidate info
- `audio_chunk` - Send audio data from user
- `end_interview` - End the interview session

#### Server → Client

- `interview_started` - Interview initialization complete
- `ai_response` - AI response with audio and transcript
- `interview_ended` - Interview conclusion with summary
- `error` - Error message

## 💾 Database Schema

### Supabase Tables

**users** (via Auth)

- `id` - UUID (primary key)
- `email` - User email
- `user_metadata` - Additional user info

**sessions**

- `id` - UUID (primary key)
- `user_id` - Reference to user
- `job_title` - Job position being interviewed for
- `status` - active, completed, cancelled
- `created_at` - Session start time
- `updated_at` - Last activity timestamp

**resumes**

- `id` - UUID (primary key)
- `user_id` - Reference to user
- `resume_text` - Parsed resume content
- `uploaded_at` - Upload timestamp

**messages** (Optional)

- `id` - UUID (primary key)
- `session_id` - Reference to session
- `user_message` - User input
- `ai_response` - AI output
- `timestamp` - Message timestamp

## 🔐 Security Considerations

- ✅ Supabase Row Level Security (RLS) policies
- ✅ Service role key restricted to backend
- ✅ WebSocket origin verification
- ✅ JWT token validation
- ✅ Protected API routes with authentication

## 🛠️ Technology Stack

### Frontend

| Technology           | Version | Purpose                  |
| -------------------- | ------- | ------------------------ |
| Next.js              | 15.5.4  | React framework with SSR |
| React                | 19.1.0  | UI library               |
| TypeScript           | 5       | Type safety              |
| Tailwind CSS         | 4       | Styling                  |
| Supabase             | 2.58.0  | Backend-as-a-Service     |
| Google Generative AI | 0.24.1  | AI/ML integration        |

### Backend

| Technology     | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| Node.js        | 18.17+  | Runtime                 |
| WebSocket (ws) | 8.18.3  | Real-time communication |
| TypeScript     | Latest  | Type safety             |
| Supabase       | 2.80.0  | Database                |
| Google GenAI   | 1.29.0  | Gemini API              |

## 📝 Environment Variables

### gab-ai/.env.local

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_WEBSOCKET_URL=
```

### websocket-server/.env

```
SUPABASE_URL=
SERVICE_ROLE_KEY=
GEMINI_API_KEY=
ALLOWED_ORIGIN=
PORT=
```

## 🚢 Deployment

### Deploy Frontend to Vercel

```bash
cd gab-ai
npm run build
vercel deploy
```

### Deploy WebSocket Server

- Options: Railway, Render, AWS EC2, DigitalOcean, Heroku
- Ensure environment variables are configured in platform
- Configure allowed origins for CORS

## 📊 Monitoring & Debugging

### View Logs

- **Frontend**: Browser DevTools Console
- **WebSocket Server**: Terminal output with `console.log` statements
- **Database**: Supabase Dashboard → SQL Editor

### Common Issues

1. **WebSocket connection refused**: Check server is running and origin is allowed
2. **Resume parsing fails**: Verify Gemini API key and file format
3. **Authentication errors**: Confirm Supabase credentials and user exists
4. **Audio issues**: Check browser microphone permissions

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 📞 Support

For issues, questions, or suggestions:

- Open an GitHub issue
- Contact the development team

---

**Last Updated**: November 2025  
**Current Version**: 0.1.0  
**Status**: Active Development
