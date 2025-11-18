# Session Exit Confirmation Implementation

## Overview
Implemented a comprehensive session exit confirmation system that warns users when they attempt to navigate away from an active interview session and provides dedicated session termination functionality.

## Components Created

### 1. `SessionExitConfirmation.tsx`
**Location:** `gab-ai/components/SessionExitConfirmation.tsx`

A reusable modal component that displays when users attempt to leave an active interview session.

**Features:**
- Professional warning design with red warning styling
- Two action buttons: "Continue Interview" and "Exit Session"
- Loading state indication during session termination
- Responsive dialog with warning box
- Works in client-side mode

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onContinue: () => void` - Called when user chooses to stay
- `onExit: () => void` - Called when user confirms exit
- `isLoading?: boolean` - Shows loading state during session termination

### 2. `useSessionExit.ts` Hook
**Location:** `gab-ai/hooks/useSessionExit.ts`

A custom React hook that manages session exit logic including API calls and navigation.

**Key Functions:**
- `handleNavigationIntent(path)` - Detects navigation attempts and shows confirmation if in active session
- `handleContinueInterview()` - Closes dialog and stays on current page
- `handleExitSession()` - Ends session and navigates to destination
- `endSession()` - Calls `/api/session/end-session` API endpoint

**State Management:**
- `isConfirmationOpen` - Modal visibility state
- `isExiting` - Loading state during session termination
- `pendingNavigationPath` - Stores intended destination before confirmation

**Return Values:**
All state and handlers needed to manage session exit confirmation flow

## Features Implemented

### 1. Navigation Guard on Sidebar
**Updated:** `gab-ai/components/sidebar.tsx`

- All navbar links (Dashboard, Start Interview, Interview History, Logo) now trigger confirmation
- If user is in active session (detected via URL):
  - Shows confirmation dialog
  - Prevents immediate navigation
- If user is not in active session:
  - Navigates immediately without confirmation
- Displays confirmation modal when attempting to leave

### 2. End Session Button on Chatbot Page
**Updated:** `gab-ai/app/session/chatbot/page.tsx`

- Added prominent "End Session" button in header (top right)
- Button shows loading state during session termination
- Triggers same confirmation dialog as sidebar navigation
- Styled in red to indicate destructive action
- Icon indicates exit/logout behavior

### 3. Session Layout with Sidebar
**Updated:** `gab-ai/app/session/layout.tsx`

- Sidebar now displays in session pages alongside main content
- Flexbox layout: Sidebar (left) | Content (right)
- Sidebar appears on all routes under `/session`
- Enables navigation guard across all session pages

## API Integration

### End Session Endpoint
**Path:** `POST /api/session/end-session`

**Request Body:**
```json
{
  "sessionId": "string"
}
```

**Response:**
```json
{
  "message": "Session ended successfully"
}
```

**Functionality:**
- Updates session status to "ended" in database
- Called when user confirms exit
- Must complete before navigation

## User Experience Flow

### Scenario 1: User Clicks Navbar Link During Active Session
1. User clicks navbar link (Dashboard, History, etc.)
2. Confirmation modal appears with warning
3. User can either:
   - **Continue Interview** → Modal closes, stays on current page
   - **Exit Session** → Session ends, user redirected to clicked destination

### Scenario 2: User Clicks "End Session" Button
1. User clicks red "End Session" button in chatbot header
2. Confirmation modal appears
3. User confirms exit
4. Session ends, user redirected to dashboard

### Scenario 3: User Not in Active Session
1. Click navbar links
2. Navigation happens immediately without confirmation
3. No modal shown

## Technical Details

### Navigation Detection
```typescript
// Active session detected by:
// 1. sessionId present in URL params (from /session/chatbot?sessionId=xxx)
// 2. Current path includes /session/chatbot
isInActiveSession: isInActiveSession || (pathname?.includes('/session/chatbot') ?? false)
```

### Session Termination Process
```typescript
1. User clicks "End Session" or confirms exit in modal
2. Hook calls /api/session/end-session with sessionId
3. API updates database status to "ended"
4. Navigation to destination (or dashboard if no destination)
5. Session state is cleared from client
```

### Error Handling
- Displays alert if session termination fails
- Loading state prevents multiple simultaneous requests
- Gracefully falls back to dashboard if navigation path unavailable

## Files Modified/Created

**New Files:**
- `gab-ai/components/SessionExitConfirmation.tsx` (92 lines)
- `gab-ai/hooks/useSessionExit.ts` (79 lines)

**Modified Files:**
- `gab-ai/components/sidebar.tsx` - Added navigation guard
- `gab-ai/app/session/chatbot/page.tsx` - Added End Session button
- `gab-ai/app/session/layout.tsx` - Added sidebar integration

## Browser Compatibility
- Modern browsers with React 19+
- ES6+ JavaScript support required
- Requires fetch API for session termination

## Security Considerations
- Session termination requires valid sessionId
- API validates sessionId before updating
- Navigation only occurs after successful API response
- Loading state prevents premature navigation

## Future Enhancements
- Auto-save progress before session termination
- Session recovery option within 30 seconds
- Analytics tracking for session exits
- Keyboard shortcut (Ctrl+Q) for quick exit
- Unsaved changes detection
