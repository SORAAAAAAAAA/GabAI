import { createClient } from "@/infra/supabase/supabaseServer";
import { NextResponse } from "next/server";
import { endEvaluator } from "@/utils/api/api.evaluatorCall";


export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { sessionId } = body;
    console.log("Evaluating Session with ID:", sessionId);

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Fetch conversation and evaluation data from Supabase
    const { data: evaluationData} = await supabase.from('evaluations').select('evaluationData').eq('sessionID', sessionId);
    const { data: conversationData} = await supabase.from('messages').select('content').eq('session_id', sessionId);
    
    const evaluationResponse = await endEvaluator(JSON.stringify(conversationData), JSON.stringify(evaluationData));

    NextResponse.json({ message: "Evaluated session successfully" });
    return Response.json({ evaluationResponse });
  } catch (error) {
    return Response.json({ error: error }, { status: 500 });
  }
}