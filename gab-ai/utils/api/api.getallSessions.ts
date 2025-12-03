import { createClient } from "@/infra/supabase/supabaseServer";

const supabase = await createClient();

export async function getAllSessions() {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}