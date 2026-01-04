import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 创建服务端 Supabase 客户端
 * 用于 Server Components 和 Server Actions
 */
export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are not set.\n\n" +
      "Please create a .env.local file in the project root with:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n" +
      "See .env.example for a template."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

