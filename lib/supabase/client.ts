import { createBrowserClient } from "@supabase/ssr";

/**
 * 创建浏览器端 Supabase 客户端
 * 用于 Client Components
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

