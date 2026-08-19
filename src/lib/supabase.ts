import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export type Borrow = {
  id: string;
  user_id: string;
  book_id: string;
  borrowed_at: string;
  due_date: string | null;
  notes: string | null;
  books?: Book | null;
};
