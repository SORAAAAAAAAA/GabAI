import { supabase, type UserIdentity } from "../infra/supabase/supabase.client.js";

export async function getUserName(userId: UserIdentity): Promise<string | null> {
  try {
    // Use admin API to access auth.users (proper way to access auth schema)
    const userIdString = typeof userId === 'string' ? userId : String(userId);
    const { data: user, error } = await supabase.auth.admin.getUserById(userIdString);

    if (error) {
      console.error("Error fetching user from auth:", error);
      return null;
    }

    if (!user || !user.user) {
      console.error("User not found in auth");
      return null;
    }

    // Extract display name from user metadata
    const metadata = user.user.user_metadata || {};
    const displayName = metadata.full_name ||
                       metadata.name ||
                       metadata.display_name;

    // Ensure we return a string or null
    return typeof displayName === 'string' ? displayName : null;
  } catch (error) {
    console.error("Error in getUserName:", error);
    return null;
  }
}

export async function storeSupabaseEvaluation(sessionId: string, evaluation: any) {
  const { error } = await supabase
        .from("evaluations")
        .insert({
                sessionID: sessionId,
                evaluationData: evaluation,
        })
        .select("id")
        .single();
        
    if (error) {
        throw new Error("Error storing evaluation: " + error);
    }
}

export async function getSupabaseSession(sessionId: string) {
    
    const {data: sessionData, error: sessionError} = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

    if (sessionError || !sessionData) {
        throw new Error("Session not found or error: " + sessionError);
    }

    if (!sessionData.user_id || !sessionData.job_title) {
        throw new Error("Incomplete session data");
    }

    return {user_id: sessionData.user_id, job_title: sessionData.job_title};
}

export async function endSupabaseSession(sessionId: string) {

    const { error } = await supabase
            .from('sessions')
            .update({
                status: 'Ended',
            })
            .eq('id', sessionId);

    if (error) {
        throw new Error("Error ending session: " + error.message);
    }
}

export async function getSupabaseResume(userId: string) {
    const {data: resumeData, error: resumeError} = await supabase
        .from('resumes')
        .select('resume_text')
        .eq('user_id', userId)
        .single();

    if (resumeError || !resumeData) {
        throw new Error("Resume not found or error: " + resumeError);
    }

    return resumeData;
}

export async function getSupabaseStartedAt(sessionId: string) {

  const {  data: localtime } = await supabase
        .from('sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

  if (!localtime?.started_at) {
    throw new Error("Session start time not found");
  }

  return localtime.started_at;
}


export async function storeSupabaseConversation(sessionId: string, conversation: string) {

  const { error } = await supabase
            .from('messages')
            .insert([
                {
                    session_id: sessionId,
                    content: conversation,
                },
            ]);
        
        if (error) {
            throw new Error("Error storing conversation: " + error.message);
        }
}