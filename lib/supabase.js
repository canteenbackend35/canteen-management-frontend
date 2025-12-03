import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://speatcslhmrrplxjojoq.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWF0Y3NsaG1ycnBseGpvam9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTI5MTUsImV4cCI6MjA3NDk4ODkxNX0.35wGqdAQKz3bDdn8ZcOi3E02IJ9VHJMJrVbw1KhXKiE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // important for RN
  },
});
