import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://ybqzcxabblyzqhezanaf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_srdA6MTx8hiKPHBV1ahM2w_xZBX85Eb";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
