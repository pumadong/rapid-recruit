-- ==================== 修复视图 UNRESTRICTED 警告 ====================
-- 
-- 问题：Supabase 会显示视图为 "UNRESTRICTED"，因为视图不支持 RLS
-- 
-- 解决方案：删除视图，使用安全定义器函数替代
-- 
-- 执行说明：
-- 1. 在 Supabase 控制台打开 SQL Editor
-- 2. 复制以下 SQL 代码
-- 3. 粘贴并执行
-- 
-- 注意：执行此脚本后，后端代码需要使用函数替代视图查询
-- 例如：SELECT * FROM get_job_details() 替代 SELECT * FROM job_details

-- ==================== 第一步：删除视图 ====================

DROP VIEW IF EXISTS job_details CASCADE;
DROP VIEW IF EXISTS application_details CASCADE;

-- ==================== 第二步：验证函数存在 ====================

-- 验证函数是否已创建
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_job_details', 'get_application_details')
ORDER BY routine_name;

-- ==================== 使用说明 ====================
-- 
-- 1. 视图已删除，Supabase 不会再显示 "UNRESTRICTED" 警告
-- 2. 使用函数替代视图查询：
-- 
--    原视图查询：
--    SELECT * FROM job_details WHERE id = 1;
-- 
--    改为函数查询：
--    SELECT * FROM get_job_details() WHERE id = 1;
-- 
--    原视图查询：
--    SELECT * FROM application_details WHERE status = 'pending';
-- 
--    改为函数查询：
--    SELECT * FROM get_application_details() WHERE status = 'pending';
-- 
-- 3. 函数使用 SECURITY DEFINER，以 postgres 用户权限执行
-- 4. 函数可以绕过 RLS，与 service_role key 的行为一致
-- 5. 如果后端代码仍在使用视图，需要更新代码使用函数

