import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startSession } from '@/utils/api/api.startSession';
import { createClient } from '@/lib/supabase/supabaseClient';
import { UUID } from 'crypto';


interface UseSessionStartReturn {
    sessionStart: boolean;
    startInterview:  (jobRole: string, resumeText: string) => Promise<void>;
}

export function useSessionStart(): UseSessionStartReturn {
     const [sessionStart, setSessionStart] = useState<boolean>(false);
     const router = useRouter();

     const startInterview = async (jobRole: string, resumeText: string) => {
         if (!jobRole.trim()) {
           throw new Error('Job role is required to start the session.');
         }
         setSessionStart(true);
         try {
           const supabase = createClient();
           const {data} = await supabase.auth.getUser();
           const userID = (data.user?.id) as UUID;
           console.log('[handleStartSession] User ID:', userID);
           console.log('[handleStartSession] Job Role:', jobRole);
           console.log('[handleStartSession] Parsed Resume length:', resumeText.length);
     
           const job = jobRole.trim();
     
           // startSession() already returns the parsed JSON data
           const responseData = await startSession(userID, job, resumeText);
           console.log('[handleStartSession] Success Response:', responseData);
           const { sessionId, wsURL } = responseData;
           console.log('[handleStartSession] Session ID:', sessionId);
           console.log('[handleStartSession] WebSocket URL:', wsURL);
     
           setSessionStart(false);
           // Redirect to chatbot page
           router.push(`/session/chatbot?sessionId=${sessionId}&wsURL=${encodeURIComponent(wsURL)}`);
         } catch (error) {
           console.error('[handleStartSession] Error:', error);
           throw error;
           alert('Failed to start session. Please try again.');
         } finally {
            setSessionStart(false);
         }
       };

       return { sessionStart, startInterview  };
}