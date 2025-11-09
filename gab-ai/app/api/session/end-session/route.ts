import { createClient } from "@/lib/supabase/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 1️⃣ Update the session status to "ended"
    const { error } = await supabase.from("sessions").update({ status: "ended" }).eq("id", sessionId);

    if (error) throw error;

    return Response.json({ message: "Session ended successfully" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ message: "End Session endpoint" });
}