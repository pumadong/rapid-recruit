import { createClient } from "@supabase/supabase-js";

/**
 * 自定义 fetch 函数，增加超时时间和重试逻辑
 */
async function customFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  // 增加超时时间到 30 秒
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 秒超时

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // 如果是超时错误，提供更友好的错误信息
    if (error.name === "AbortError") {
      throw new Error(
        "连接 Supabase 超时。请检查：\n" +
        "1. 网络连接是否正常\n" +
        "2. NEXT_PUBLIC_SUPABASE_URL 是否正确\n" +
        "3. 是否使用了代理或 VPN（可能需要配置）"
      );
    }
    
    throw error;
  }
}

/**
 * 创建 Supabase 管理员客户端
 * 使用 service_role key，具有完整权限，绕过 RLS
 * 仅用于服务端操作（Server Actions 和 Server Queries）
 * 
 * ⚠️ 重要：此客户端绝对不能在前端组件中使用
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase admin environment variables are not set.\n\n" +
      "Please ensure .env.local contains:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n" +
      "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n\n"
    );
  }

  // 验证 URL 格式
  try {
    const url = new URL(supabaseUrl);
    if (!url.protocol.startsWith("https")) {
      console.warn("⚠️  Supabase URL 应该使用 HTTPS 协议");
    }
  } catch (error) {
    throw new Error(
      `无效的 Supabase URL: ${supabaseUrl}\n` +
      "请确保 URL 格式正确，例如: https://your-project.supabase.co"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: customFetch,
    },
  });
}

