import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://speatcslhmrrplxjojoq.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZWF0Y3NsaG1ycnBseGpvam9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTI5MTUsImV4cCI6MjA3NDk4ODkxNX0.35wGqdAQKz3bDdn8ZcOi3E02IJ9VHJMJrVbw1KhXKiE";

// Use a no-op storage in Node.js environment during SSR/Static rendering
const isNode = typeof window === "undefined";
const storage = isNode
  ? {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    }
  : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
