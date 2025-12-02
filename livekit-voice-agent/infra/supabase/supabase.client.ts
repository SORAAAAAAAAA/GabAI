import { createClient, type UserIdentity } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

export type { UserIdentity };