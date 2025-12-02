import { createClient } from "@/infra/supabase/supabaseServer";

export async function POST(req: Request) {
  try {
    console.log('[start-session] Request received');
    const body = await req.json();
    const { job_title, resume } = body;

    if (!job_title) {
      return Response.json({ error: "Missing jobTitle" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id;
    
    if (!user || !user_id) {
      return Response.json({ error: "Unauthorized - not logged in" }, { status: 401 });
    }

    const { data: sessionData, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user_id, 
        job_title: job_title,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      console.error('[start-session] Session insert error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log('[start-session] Session created:', sessionData?.id);

    // Return session info + WebSocket URL
    return Response.json({
      message: "Session started successfully",
      sessionId: sessionData?.id,
      jobTitle: job_title,
      resume: resume,
    });
  } catch (error) {
    console.error("[start-session] Catch block error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
