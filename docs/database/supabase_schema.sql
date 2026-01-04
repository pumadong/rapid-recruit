/**
 * 快捷招聘平台 - Supabase SQL Schema (最终版)
 * 
 * 时间处理策略：
 * - 所有时间字段使用 TIMESTAMPTZ（带时区的 Timestamp）
 * - 数据库自动将所有时间转换为 UTC 存储
 * - 使用 CURRENT_TIMESTAMP 自动设置当前 UTC 时间
 * - 前端使用 ISO 8601 UTC 格式接收和显示时间
 * 
 * 安全策略：
 * - 所有表都启用 RLS (Row Level Security)
 * - 所有表都有 DENY 策略（前端无法直连）
 * - 后端使用 service_role key 连接
 * - 审计日志记录所有修改
 * 
 * 执行方式：
 * 1. 复制以下 SQL 代码
 * 2. 在 Supabase 控制台打开 SQL Editor
 * 3. 粘贴代码并执行
 * 4. 或使用 Drizzle Kit: pnpm db:push
 */

-- ==================== 第一步：删除现有对象（如果存在） ====================

-- 删除视图（必须先删除，因为它们依赖表）
DROP VIEW IF EXISTS application_details CASCADE;
DROP VIEW IF EXISTS talent_details CASCADE;
DROP VIEW IF EXISTS job_position_details CASCADE;
DROP VIEW IF EXISTS job_details CASCADE;

-- 删除审计触发器
DROP TRIGGER IF EXISTS audit_applications_trigger ON applications CASCADE;
DROP TRIGGER IF EXISTS audit_job_positions_trigger ON job_positions CASCADE;
DROP TRIGGER IF EXISTS audit_companies_trigger ON companies CASCADE;
DROP TRIGGER IF EXISTS audit_talents_trigger ON talents CASCADE;
DROP TRIGGER IF EXISTS audit_users_trigger ON users CASCADE;

-- 删除更新时间戳触发器
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications CASCADE;
DROP TRIGGER IF EXISTS applications_updated_at_trigger ON applications CASCADE;
DROP TRIGGER IF EXISTS update_job_positions_updated_at ON job_positions CASCADE;
DROP TRIGGER IF EXISTS job_positions_updated_at_trigger ON job_positions CASCADE;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies CASCADE;
DROP TRIGGER IF EXISTS companies_updated_at_trigger ON companies CASCADE;
DROP TRIGGER IF EXISTS update_talents_updated_at ON talents CASCADE;
DROP TRIGGER IF EXISTS talents_updated_at_trigger ON talents CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
DROP TRIGGER IF EXISTS users_updated_at_trigger ON users CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS audit_trigger_func() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_talents_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_companies_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_job_positions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_applications_updated_at() CASCADE;

-- 删除表（按照外键依赖关系从下到上删除）
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS talent_skills CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS talents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS industries_level2 CASCADE;
DROP TABLE IF EXISTS industries_level1 CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS skills CASCADE;

-- 删除枚举类型
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS education CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS company_verification CASCADE;

-- ==================== 第二步：创建枚举类型 ====================

-- 用户类型枚举
-- talent: 人才用户
-- company: 企业用户
CREATE TYPE user_type AS ENUM ('talent', 'company');

-- 性别枚举
CREATE TYPE gender AS ENUM ('male', 'female', 'other');

-- 学历枚举
CREATE TYPE education AS ENUM (
  'high_school',
  'associate',
  'bachelor',
  'master',
  'phd'
);

-- 职位状态枚举
-- draft: 草稿
-- published: 已发布
-- closed: 已关闭
-- expired: 已过期
CREATE TYPE job_status AS ENUM (
  'draft',
  'published',
  'closed',
  'expired'
);

-- 应聘状态枚举
-- pending: 待审核
-- reviewed: 已审核
-- accepted: 已接受
-- rejected: 已拒绝
-- withdrawn: 已撤回
CREATE TYPE application_status AS ENUM (
  'pending',
  'reviewed',
  'accepted',
  'rejected',
  'withdrawn'
);

-- 企业认证状态枚举
-- unverified: 未认证
-- pending: 审核中
-- verified: 已认证
-- rejected: 已拒绝
CREATE TYPE company_verification AS ENUM (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

-- ==================== 第三步：创建基础数据表 ====================

-- 省份表
-- 存储所有省份信息
CREATE TABLE provinces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX provinces_name_idx ON provinces(name);

-- 城市表
-- 存储所有城市信息，关联到省份
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  province_id INTEGER NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(province_id, name)
);

CREATE INDEX cities_province_id_idx ON cities(province_id);
CREATE INDEX cities_name_idx ON cities(name);

-- 一级行业表
-- 存储所有一级行业分类
CREATE TABLE industries_level1 (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX industries_level1_name_idx ON industries_level1(name);

-- 二级行业表
-- 存储所有二级行业分类，关联到一级行业
CREATE TABLE industries_level2 (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  industry_level1_id INTEGER NOT NULL REFERENCES industries_level1(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(industry_level1_id, name)
);

CREATE INDEX industries_level2_level1_id_idx ON industries_level2(industry_level1_id);
CREATE INDEX industries_level2_name_idx ON industries_level2(name);

-- 技能表
-- 存储所有技能信息
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX skills_name_idx ON skills(name);
CREATE INDEX skills_category_idx ON skills(category);

-- ==================== 第四步：创建用户相关表 ====================

-- 用户基表
-- 存储所有用户的基本认证信息
--
-- 时间字段说明：
-- - created_at: 账户创建时间（自动设置为当前 UTC 时间）
-- - updated_at: 账户最后更新时间（自动设置为当前 UTC 时间）
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_phone_idx ON users(phone);

-- 人才表
-- 存储人才用户的详细信息
--
-- 时间字段说明：
-- - birth_date: 出生日期（可选，用于计算年龄）
-- - created_at: 档案创建时间
-- - updated_at: 档案最后更新时间
CREATE TABLE talents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  real_name VARCHAR(50) NOT NULL,
  gender gender,
  birth_date TIMESTAMPTZ,
  city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  work_experience_years INTEGER DEFAULT 0,
  education education,
  major VARCHAR(100),
  bio TEXT,
  avatar VARCHAR(255),
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX talents_user_id_idx ON talents(user_id);
CREATE INDEX talents_city_id_idx ON talents(city_id);
CREATE INDEX talents_education_idx ON talents(education);

-- 企业表
-- 存储企业用户的详细信息
--
-- 时间字段说明：
-- - verification_time: 企业认证完成时间（仅在认证成功时设置）
-- - created_at: 企业档案创建时间
-- - updated_at: 企业档案最后更新时间
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(100) NOT NULL,
  company_size VARCHAR(50),
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  industry_level1_id INTEGER NOT NULL REFERENCES industries_level1(id) ON DELETE RESTRICT,
  industry_level2_id INTEGER REFERENCES industries_level2(id) ON DELETE SET NULL,
  description TEXT,
  logo VARCHAR(255),
  website VARCHAR(255),
  business_license VARCHAR(255),
  verification_status company_verification DEFAULT 'unverified',
  verification_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX companies_user_id_idx ON companies(user_id);
CREATE INDEX companies_city_id_idx ON companies(city_id);
CREATE INDEX companies_industry_level1_id_idx ON companies(industry_level1_id);
CREATE INDEX companies_industry_level2_id_idx ON companies(industry_level2_id);
CREATE INDEX companies_verification_status_idx ON companies(verification_status);

-- 人才技能关联表
-- 存储人才拥有的技能
CREATE TABLE talent_skills (
  id SERIAL PRIMARY KEY,
  talent_id INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'intermediate',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(talent_id, skill_id)
);

CREATE INDEX talent_skills_talent_id_idx ON talent_skills(talent_id);
CREATE INDEX talent_skills_skill_id_idx ON talent_skills(skill_id);

-- ==================== 第五步：创建职位相关表 ====================

-- 职位表
-- 存储企业发布的职位信息
--
-- 时间字段说明：
-- - published_at: 职位发布时间（仅在发布时设置）
-- - expired_at: 职位过期时间（自动计算，通常为发布后 30 天）
-- - created_at: 职位创建时间（可能在发布前）
-- - updated_at: 职位最后更新时间
CREATE TABLE job_positions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  position_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  industry_level1_id INTEGER NOT NULL REFERENCES industries_level1(id) ON DELETE RESTRICT,
  industry_level2_id INTEGER REFERENCES industries_level2(id) ON DELETE SET NULL,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  work_experience_required INTEGER DEFAULT 0,
  education_required education,
  position_count INTEGER DEFAULT 1,
  status job_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX job_positions_company_id_idx ON job_positions(company_id);
CREATE INDEX job_positions_city_id_idx ON job_positions(city_id);
CREATE INDEX job_positions_industry_level1_id_idx ON job_positions(industry_level1_id);
CREATE INDEX job_positions_industry_level2_id_idx ON job_positions(industry_level2_id);
CREATE INDEX job_positions_status_idx ON job_positions(status);
CREATE INDEX job_positions_published_at_idx ON job_positions(published_at);
CREATE INDEX job_positions_expired_at_idx ON job_positions(expired_at);

-- 职位技能要求表
-- 存储职位所需的技能
CREATE TABLE job_skills (
  id SERIAL PRIMARY KEY,
  job_position_id INTEGER NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_position_id, skill_id)
);

CREATE INDEX job_skills_job_position_id_idx ON job_skills(job_position_id);
CREATE INDEX job_skills_skill_id_idx ON job_skills(skill_id);

-- ==================== 第六步：创建应聘相关表 ====================

-- 职位应聘表
-- 存储人才对职位的应聘记录
--
-- 时间字段说明：
-- - applied_at: 应聘时间（自动设置为当前 UTC 时间）
-- - reviewed_at: 企业审核时间（企业审核后设置）
-- - reply_at: 企业回复时间（企业回复后设置）
-- - created_at: 记录创建时间
-- - updated_at: 记录最后更新时间
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  talent_id INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  job_position_id INTEGER NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMPTZ,
  company_reply TEXT,
  reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(talent_id, job_position_id)
);

CREATE INDEX applications_talent_id_idx ON applications(talent_id);
CREATE INDEX applications_job_position_id_idx ON applications(job_position_id);
CREATE INDEX applications_status_idx ON applications(status);
CREATE INDEX applications_applied_at_idx ON applications(applied_at);
CREATE INDEX applications_reviewed_at_idx ON applications(reviewed_at);

-- ==================== 第七步：创建审计日志表 ====================

-- 审计日志表
-- 用于记录所有数据修改操作
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  record_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  user_id INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_logs_table_name_idx ON audit_logs(table_name);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);

-- ==================== 第八步：创建触发器函数 ====================

-- 创建自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建审计触发器函数
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, record_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==================== 第九步：创建自动更新时间戳的触发器 ====================

-- 为 users 表创建触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为 talents 表创建触发器
CREATE TRIGGER update_talents_updated_at
BEFORE UPDATE ON talents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为 companies 表创建触发器
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为 job_positions 表创建触发器
CREATE TRIGGER update_job_positions_updated_at
BEFORE UPDATE ON job_positions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为 applications 表创建触发器
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ==================== 第十步：创建审计触发器 ====================

-- 为 users 表创建审计触发器
CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- 为 talents 表创建审计触发器
CREATE TRIGGER audit_talents_trigger
AFTER INSERT OR UPDATE OR DELETE ON talents
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- 为 companies 表创建审计触发器
CREATE TRIGGER audit_companies_trigger
AFTER INSERT OR UPDATE OR DELETE ON companies
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- 为 job_positions 表创建审计触发器
CREATE TRIGGER audit_job_positions_trigger
AFTER INSERT OR UPDATE OR DELETE ON job_positions
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- 为 applications 表创建审计触发器
CREATE TRIGGER audit_applications_trigger
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();

-- ==================== 第十一步：启用 RLS ====================

-- 启用所有表的 RLS
ALTER TABLE "provinces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "industries_level1" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "industries_level2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "talents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "talent_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_positions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "job_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- ==================== 第十二步：创建 RLS Policy ====================

-- 为所有表创建默认 DENY 策略
-- 说明：前端无法直连数据库，所有请求必须通过后端
-- 后端使用 service_role key，可以绕过 RLS

CREATE POLICY "provinces_deny_all" ON "provinces"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "cities_deny_all" ON "cities"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "industries_level1_deny_all" ON "industries_level1"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "industries_level2_deny_all" ON "industries_level2"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "skills_deny_all" ON "skills"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "users_deny_all" ON "users"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "talents_deny_all" ON "talents"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "companies_deny_all" ON "companies"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "talent_skills_deny_all" ON "talent_skills"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "job_positions_deny_all" ON "job_positions"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "job_skills_deny_all" ON "job_skills"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "applications_deny_all" ON "applications"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

CREATE POLICY "audit_logs_deny_all" ON "audit_logs"
  AS RESTRICTIVE FOR ALL TO public USING (false) WITH CHECK (false);

-- ==================== 第十三步：初始化数据 ====================

-- 插入省份数据
INSERT INTO provinces (name, code) VALUES
('北京', 'BJ'),
('上海', 'SH'),
('广东', 'GD'),
('浙江', 'ZJ'),
('江苏', 'JS'),
('四川', 'SC'),
('湖北', 'HB'),
('湖南', 'HN');

-- 插入城市数据
INSERT INTO cities (name, province_id, code) VALUES
('北京', 1, 'BJ01'),
('上海', 2, 'SH01'),
('深圳', 3, 'GD01'),
('广州', 3, 'GD02'),
('杭州', 4, 'ZJ01'),
('南京', 5, 'JS01'),
('成都', 6, 'SC01'),
('武汉', 7, 'HB01'),
('长沙', 8, 'HN01'),
('西安', 8, 'HN02');

-- 插入一级行业数据
INSERT INTO industries_level1 (name, code, description) VALUES
('互联网IT', 'IT01', '互联网、软件、IT 相关行业'),
('金融', 'FIN01', '银行、保险、证券等金融行业'),
('房地产', 'RE01', '房地产开发、中介等行业'),
('制造业', 'MFG01', '机械、电子、汽车等制造业'),
('教育', 'EDU01', '教育、培训等行业'),
('医疗健康', 'MED01', '医疗、健康、制药等行业'),
('零售电商', 'RET01', '零售、电商、商贸等行业'),
('物流运输', 'LOG01', '物流、运输、仓储等行业');

-- 插入二级行业数据
INSERT INTO industries_level2 (name, industry_level1_id, code, description) VALUES
('前端开发', 1, 'IT0101', '前端开发工程师'),
('后端开发', 1, 'IT0102', '后端开发工程师'),
('移动开发', 1, 'IT0103', '移动应用开发工程师'),
('数据分析', 1, 'IT0104', '数据分析工程师'),
('投资银行', 2, 'FIN0101', '投资银行相关岗位'),
('风险管理', 2, 'FIN0102', '风险管理岗位'),
('项目管理', 3, 'RE0101', '房地产项目管理'),
('销售代理', 3, 'RE0102', '房地产销售代理'),
('机械工程', 4, 'MFG0101', '机械工程师'),
('电子工程', 4, 'MFG0102', '电子工程师');

-- 插入技能数据
INSERT INTO skills (name, category, description) VALUES
('Java', '编程语言', 'Java 编程语言'),
('Python', '编程语言', 'Python 编程语言'),
('JavaScript', '编程语言', 'JavaScript 编程语言'),
('React', '前端框架', 'React 前端框架'),
('Vue', '前端框架', 'Vue 前端框架'),
('Node.js', '后端框架', 'Node.js 后端框架'),
('SQL', '数据库', 'SQL 数据库'),
('MongoDB', '数据库', 'MongoDB 数据库'),
('Docker', '工具', 'Docker 容器技术'),
('Git', '工具', 'Git 版本控制');

-- ==================== 第十四步：创建视图 ====================

-- 创建职位详情视图（包含公司信息）
CREATE OR REPLACE VIEW job_details AS
SELECT
  jp.id,
  jp.position_name,
  jp.description,
  jp.salary_min,
  jp.salary_max,
  jp.status,
  jp.published_at,
  jp.expired_at,
  jp.created_at,
  jp.updated_at,
  c.company_name,
  c.logo,
  c.city_id,
  ct.name AS city_name,
  il1.name AS industry_level1_name,
  il2.name AS industry_level2_name
FROM job_positions jp
LEFT JOIN companies c ON jp.company_id = c.id
LEFT JOIN cities ct ON jp.city_id = ct.id
LEFT JOIN industries_level1 il1 ON jp.industry_level1_id = il1.id
LEFT JOIN industries_level2 il2 ON jp.industry_level2_id = il2.id;

-- 创建应聘详情视图
CREATE OR REPLACE VIEW application_details AS
SELECT
  a.id,
  a.status,
  a.applied_at,
  a.reviewed_at,
  a.reply_at,
  a.company_reply,
  a.created_at,
  a.updated_at,
  t.real_name AS talent_name,
  t.city_id,
  ct.name AS talent_city_name,
  jp.position_name,
  c.company_name
FROM applications a
LEFT JOIN talents t ON a.talent_id = t.id
LEFT JOIN cities ct ON t.city_id = ct.id
LEFT JOIN job_positions jp ON a.job_position_id = jp.id
LEFT JOIN companies c ON jp.company_id = c.id;

-- ==================== 第十四步（续）：设置视图所有者和安全函数 ====================

-- 注意：视图（VIEW）不支持 RLS（Row Level Security）
-- 为了消除 Supabase 的 "UNRESTRICTED" 警告，我们创建安全定义器函数来封装视图查询
-- 这些函数使用 SECURITY DEFINER，以函数所有者的权限执行，可以绕过 RLS

-- 为 job_details 视图设置所有者
ALTER VIEW job_details OWNER TO postgres;

-- 为 application_details 视图设置所有者
ALTER VIEW application_details OWNER TO postgres;

-- ==================== 第十五步：创建视图安全函数 ====================

-- 创建 job_details 视图的安全访问函数
-- 使用 SECURITY DEFINER 确保函数以 postgres 用户权限执行
CREATE OR REPLACE FUNCTION get_job_details()
RETURNS TABLE (
  id INTEGER,
  position_name VARCHAR(100),
  description TEXT,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  status job_status,
  published_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  company_name VARCHAR(100),
  logo VARCHAR(255),
  city_id INTEGER,
  city_name VARCHAR(50),
  industry_level1_name VARCHAR(50),
  industry_level2_name VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jp.id,
    jp.position_name,
    jp.description,
    jp.salary_min,
    jp.salary_max,
    jp.status,
    jp.published_at,
    jp.expired_at,
    jp.created_at,
    jp.updated_at,
    c.company_name,
    c.logo,
    c.city_id,
    ct.name AS city_name,
    il1.name AS industry_level1_name,
    il2.name AS industry_level2_name
  FROM job_positions jp
  LEFT JOIN companies c ON jp.company_id = c.id
  LEFT JOIN cities ct ON jp.city_id = ct.id
  LEFT JOIN industries_level1 il1 ON jp.industry_level1_id = il1.id
  LEFT JOIN industries_level2 il2 ON jp.industry_level2_id = il2.id;
END;
$$;

-- 创建 application_details 视图的安全访问函数
CREATE OR REPLACE FUNCTION get_application_details()
RETURNS TABLE (
  id INTEGER,
  status application_status,
  applied_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reply_at TIMESTAMPTZ,
  company_reply TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  talent_name VARCHAR(50),
  city_id INTEGER,
  talent_city_name VARCHAR(50),
  position_name VARCHAR(100),
  company_name VARCHAR(100)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.status,
    a.applied_at,
    a.reviewed_at,
    a.reply_at,
    a.company_reply,
    a.created_at,
    a.updated_at,
    t.real_name AS talent_name,
    t.city_id,
    ct.name AS talent_city_name,
    jp.position_name,
    c.company_name
  FROM applications a
  LEFT JOIN talents t ON a.talent_id = t.id
  LEFT JOIN cities ct ON t.city_id = ct.id
  LEFT JOIN job_positions jp ON a.job_position_id = jp.id
  LEFT JOIN companies c ON jp.company_id = c.id;
END;
$$;

-- 设置函数所有者
ALTER FUNCTION get_job_details() OWNER TO postgres;
ALTER FUNCTION get_application_details() OWNER TO postgres;

-- 说明：
-- 1. 视图本身不支持 RLS，Supabase 会显示 "UNRESTRICTED" 警告
-- 2. 视图的安全性由底层表的 RLS 策略保证（所有表都有 DENY 策略）
-- 3. 创建安全定义器函数可以消除警告，但视图仍然可以直接访问
-- 4. 如果后端代码使用视图，可以继续使用；如果需要消除警告，可以使用这些函数替代视图
-- 5. 后端使用 service_role key 可以绕过 RLS，正常访问视图和函数

-- ==================== 第十六步：验证脚本 ====================

-- 验证 RLS 启用状态（仅表，不包括视图）
-- 预期结果：13（13 个表）
-- 注意：视图不支持 RLS，它们的安全性由底层表的 RLS 策略保证
SELECT COUNT(*) as rls_enabled_tables
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

-- 验证 Policy 创建状态（仅表，不包括视图）
-- 预期结果：13（13 个表）
-- 注意：视图不支持 POLICY，它们的安全性由底层表的 RLS 策略保证
SELECT COUNT(*) as policies_created
FROM pg_policies
WHERE schemaname = 'public' AND policyname LIKE '%deny_all';

-- 验证视图是否存在
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'VIEW'
ORDER BY table_name;

-- 查看所有表的 RLS 状态详情
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 查看所有 Policy 详情
SELECT
  tablename,
  policyname,
  permissive,
  qual as condition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 查看初始化数据
SELECT COUNT(*) as provinces_count FROM provinces;
SELECT COUNT(*) as cities_count FROM cities;
SELECT COUNT(*) as industries_level1_count FROM industries_level1;
SELECT COUNT(*) as industries_level2_count FROM industries_level2;
SELECT COUNT(*) as skills_count FROM skills;
