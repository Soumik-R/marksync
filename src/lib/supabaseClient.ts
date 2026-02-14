import { createClient } from "@supabase/supabase-js";

// Provide dummy values for build time that won't throw errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MTIsImV4cCI6MTk2MDc2ODgxMn0.dummy";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
