/**
 * Supabase Client Configuration
 * Follows the dependency inversion principle
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Type for Supabase client - using ReturnType for type safety
export type ISupabaseClient = ReturnType<typeof createBrowserClient>;

/**
 * Creates a browser-side Supabase client
 * This is a dependency that should be injected where needed
 */
export const createSupabaseClient = (): ISupabaseClient =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
