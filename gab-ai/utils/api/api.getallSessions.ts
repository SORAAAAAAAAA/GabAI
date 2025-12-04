import { createClient } from "@/infra/supabase/supabaseServer";

export async function getAllSessions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}