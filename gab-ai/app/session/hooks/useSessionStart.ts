import { useState } from 'react';
import { startSession } from '@/utils/api/api.startSession';
import { createClient } from '@/infra/supabase/supabaseClient';
import { useInterviewData } from '@/context/InterviewDataContext';
import { UUID } from 'crypto';


interface UseSessionStartReturn {
    sessionStart: boolean;
    startInterview:  (jobRole: string) => Promise<void>;
}

export function useSessionStart(): UseSessionStartReturn {
     const [sessionStart, setSessionStart] = useState<boolean>(false);
     const { setInterviewData } = useInterviewData();

     const startInterview = async (jobRole: string) => {
         if (!jobRole.trim()) {
           throw new Error('Job role is required to start the session.');
         }
         
         setSessionStart(true);
         try {
           const supabase = createClient();
           const {data} = await supabase.auth.getUser();
           const userID = (data.user?.id) as UUID;
           
           // Extract display name from user metadata
           const metadata = data.user?.user_metadata || {};
           const userName = metadata.full_name ||
                           metadata.name ||
                           metadata.display_name ||
                           metadata["Display name"] ||
                           'Candidate';
           
           // Fetch the saved resume from Supabase
           const { data: resumeData, error: resumeError } = await supabase
             .from('resumes')
             .select('resume_text')
             .eq('user_id', userID)
             .single();
           
           if (resumeError || !resumeData?.resume_text) {
             throw new Error('Please upload a valid resume before starting the session.');
           }
           
           const resume = resumeData.resume_text;

           if ( resume.toLowerCase() === 'not a resume' ) {
              console.log('[handleStartSession] Uploaded document is not a resume/CV.');
              throw new Error('Uploaded document is not recognized as a resume/CV.');
           }
     
           const job = jobRole.trim();
           
           // Store interview data in context for connection-details to use
           setInterviewData({
             job,
             resume,
             userName,
           });
           
           // startSession() already returns the parsed JSON data
           const responseData = await startSession(userID, job, resume);
           console.log('[handleStartSession] Success Response:', responseData);
           const { sessionId, wsURL } = responseData;
           console.log('[handleStartSession] Session ID:', sessionId);
           console.log('[handleStartSession] WebSocket URL:', wsURL);
     
           setSessionStart(false);
           // Redirect to chatbot page
         } catch (error) {
           console.error('[handleStartSession] Error:', error);
           throw error;
         } finally {
            setSessionStart(false);
         }
       };

       return { sessionStart, startInterview };
}