import { createClient } from "@/infra/supabase/supabaseServer";

export async function getRecentSessions() {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .range(0, 5) // Fetch only the 5 most recent sessions
        .order('started_at', { ascending: false }); // Order by created_at in descending order

    if (error) {
        throw new Error(`Error fetching recent sessions: ${error.message}`);   
    }

    return data;
    
}