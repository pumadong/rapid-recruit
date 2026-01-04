-- ==================== 职位收藏表 ====================
-- 用于存储人才收藏的职位
-- 
-- 执行说明：
-- 1. 在 Supabase 控制台打开 SQL Editor
-- 2. 复制以下 SQL 代码
-- 3. 粘贴并执行

-- ==================== 第一步：创建表 ====================

-- 职位收藏表
CREATE TABLE IF NOT EXISTS job_favorites (
  id SERIAL PRIMARY KEY,
  talent_id INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  job_position_id INTEGER NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(talent_id, job_position_id)
);

-- ==================== 第二步：创建索引 ====================

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS job_favorites_talent_id_idx ON job_favorites(talent_id);
CREATE INDEX IF NOT EXISTS job_favorites_job_position_id_idx ON job_favorites(job_position_id);
CREATE INDEX IF NOT EXISTS job_favorites_created_at_idx ON job_favorites(created_at);

-- ==================== 第三步：启用 RLS ====================

-- 启用行级安全策略
ALTER TABLE job_favorites ENABLE ROW LEVEL SECURITY;

-- ==================== 第四步：创建 RLS 策略 ====================

-- 删除已存在的策略（如果存在）
DROP POLICY IF EXISTS "job_favorites_deny_all" ON "job_favorites";

-- 策略1：默认拒绝所有操作（当前使用 Service Role 绕过）
-- 这确保了前端无法直接访问，所有操作必须通过后端 API
CREATE POLICY "job_favorites_deny_all" ON "job_favorites"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

-- 策略2（可选，未来启用）：允许人才访问自己的收藏
-- 如果需要启用此策略，请先删除上面的 deny_all 策略
-- 注意：当前项目使用 Service Role，不需要启用此策略
/*
-- 删除已存在的策略（如果存在）
DROP POLICY IF EXISTS "job_favorites_select_own" ON "job_favorites";
DROP POLICY IF EXISTS "job_favorites_insert_own" ON "job_favorites";
DROP POLICY IF EXISTS "job_favorites_delete_own" ON "job_favorites";

-- 允许人才查看自己的收藏（SELECT）
CREATE POLICY "job_favorites_select_own" ON "job_favorites"
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM talents t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = job_favorites.talent_id
      -- 这里需要通过 JWT 或其他方式获取当前用户 ID
      -- 暂时注释，因为当前使用 Service Role
    )
  );

-- 允许人才创建自己的收藏（INSERT）
CREATE POLICY "job_favorites_insert_own" ON "job_favorites"
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM talents t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = job_favorites.talent_id
      -- 这里需要通过 JWT 或其他方式获取当前用户 ID
    )
  );

-- 允许人才删除自己的收藏（DELETE）
CREATE POLICY "job_favorites_delete_own" ON "job_favorites"
  FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM talents t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = job_favorites.talent_id
      -- 这里需要通过 JWT 或其他方式获取当前用户 ID
    )
  );
*/

-- ==================== 第五步：创建触发器（可选） ====================

-- 如果需要审计日志，可以创建触发器
-- 注意：需要先创建 audit_logs 表和 audit_trigger_func 函数
/*
CREATE TRIGGER audit_job_favorites_trigger
  AFTER INSERT OR UPDATE OR DELETE ON job_favorites
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
*/

-- ==================== 第六步：验证 ====================

-- 验证表是否创建成功
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'job_favorites'
ORDER BY ordinal_position;

-- 验证 RLS 是否启用
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'job_favorites';

-- 验证策略是否创建
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'job_favorites';
