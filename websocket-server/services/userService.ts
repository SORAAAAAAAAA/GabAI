import { createClient, UserIdentity } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY! // Use service role key for server-side operations
);

export async function getUserName(userId: UserIdentity): Promise<string | null> {
  try {
    // Use admin API to access auth.users (proper way to access auth schema)
    const userIdString = typeof userId === 'string' ? userId : String(userId);
    const { data: user, error } = await supabase.auth.admin.getUserById(userIdString);

    if (error) {
      console.error("Error fetching user from auth:", error);
      return null;
    }

    if (!user || !user.user) {
      console.error("User not found in auth");
      return null;
    }

    // Extract display name from user metadata
    const metadata = user.user.user_metadata || {};
    const displayName = metadata.full_name ||
                       metadata.name ||
                       metadata.display_name;

    // Ensure we return a string or null
    return typeof displayName === 'string' ? displayName : null;
  } catch (error) {
    console.error("Error in getUserName:", error);
    return null;
  }
}