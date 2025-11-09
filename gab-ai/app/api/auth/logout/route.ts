import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabaseServer";

export async function POST() {
  const supabase = await createClient();
  const res = NextResponse.json({ success: true });
  res.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });
  await supabase.auth.signOut();
  return res;
}
