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
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await new Promise(resolve => setTimeout(resolve, 7000)); // Wait for 7 seconds to ensure data consistency

    // Fetch conversation and evaluation data from Supabase
    const { data: evaluationData, error: evalError } = await supabase
      .from('evaluations')
      .select('evaluationData')
      .eq('sessionID', sessionId);

    const { data: conversationData, error: convError } = await supabase
      .from('messages')
      .select('content')
      .eq('session_id', sessionId);

    if (evalError) {
      console.error('Error fetching evaluation data:', evalError);
      return NextResponse.json({ error: "Failed to fetch evaluation data" }, { status: 400 });
    }

    if (convError) {
      console.error('Error fetching conversation data:', convError);
      return NextResponse.json({ error: "Failed to fetch conversation data" }, { status: 400 });
    }
    
    const evaluationResponse = await endEvaluator(JSON.stringify(conversationData), JSON.stringify(evaluationData));
    console.log("Evaluation Response:", evaluationResponse);

    const { error: insertError } = await supabase
      .from('sessions')
      .update({
        overall_feedback: JSON.stringify(evaluationResponse),
      })
      .eq('id', sessionId);

    if (insertError) {
      console.error('Error inserting evaluation data:', insertError);
      return NextResponse.json({ error: "Failed to insert evaluation data"
      })
    } 

    return NextResponse.json({ message: "Evaluated session successfully", evaluationResponse });
  } catch (error) {
    console.error('[end-evaluator] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}