import { createClient } from "@/infra/supabase/supabaseServer";
import { useRef, useEffect, useState, use } from "react";

const supabase = await createClient();

export async function GetSessions() {
    const [sessions, setSessions] = useRef<any[]>([]);
    
    useEffect( () => {

        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .order('created_at', { ascending: false });
        };
        fetchSessions();
    }, []);
}