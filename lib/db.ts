/**
 * ⚠️ DEPRECATED: 此文件已弃用
 * 
 * 项目已全面切换到使用 Supabase SDK API 模式，不再使用数据库直连。
 * 
 * 所有数据库操作现在都通过：
 * - lib/supabase/admin.ts (服务端，使用 service_role key，用于 server/ 目录)
 * - lib/supabase/server.ts (服务端，使用 anon key，带会话)
 * - lib/supabase/client.ts (客户端，使用 anon key)
 * 
 * 请使用 createAdminClient() 代替此处的 db 实例。
 * 
 * 架构变更：
 * - 之前：Drizzle ORM + PostgreSQL 直连（DATABASE_URL）
 * - 现在：Supabase SDK + HTTPS API（NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY）
 * 
 * 相关文档：
 * - ARCHITECTURE.md - 架构设计说明
 * - API_MIGRATION_SUMMARY.md - API 迁移总结
 */

// 保留此文件以避免破坏导入，但所有实际使用已迁移到 Supabase SDK
// 如果代码尝试使用 db，会在运行时抛出错误

// 注意：这里不进行实际的数据库连接，避免连接超时错误
// 所有数据库操作已迁移到 Supabase SDK API 模式

export const db = {
  select: () => {
    throw new Error(
      "Database direct connection has been disabled.\n\n" +
      "Please use Supabase SDK instead:\n" +
      "- For server queries: import { createAdminClient } from '@/lib/supabase/admin'\n" +
      "- For server actions: import { createAdminClient } from '@/lib/supabase/admin'\n\n" +
      "This change was made to fix connection timeout issues by using HTTPS API instead of direct PostgreSQL connection."
    );
  },
} as any;

export type Database = typeof db;

