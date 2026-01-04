# 快捷招聘平台 - 文件索引和使用指南

## 📑 文件索引

### 📚 文档目录 (docs/)

#### 1. instruction.md
**需求文档** - 项目的完整需求说明

**内容**
- 核心功能（6 大模块）
  - 用户管理系统
  - 职位管理系统
  - 应聘管理系统
  - 基础数据管理
  - 信息展示和通知
  - 其他功能

- 技术栈
  - 前端：Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS 4
  - 后端：Supabase + PostgreSQL 14+ + Drizzle ORM
  - API：tRPC + React Query + Axios
  - 认证：Supabase Auth + NextAuth.js 5

- 代码规范
  - 文件结构规范
  - 命名规范
  - 导入规范
  - 性能优化
  - 安全规范
  - 测试规范
  - Git 规范
  - 部署规范

**何时使用**
- ✅ 项目初期规划
- ✅ 新成员入职
- ✅ 代码审查
- ✅ 功能开发参考

**相关命令**
```bash
# 查看需求文档
cat docs/instruction.md

# 搜索特定功能
grep -n "职位管理" docs/instruction.md
```

---

#### 2. DATABASE_DESIGN.md
**数据库设计文档** - 完整的数据库架构说明

**内容**
- 数据库概览
  - 表结构总览
  - 关系图
  - 索引策略

- 表详细说明
  - 基础数据表（provinces、cities、industries_level1、industries_level2、skills）
  - 用户表（users、talents、companies）
  - 关联表（talent_skills）
  - 职位表（job_positions、job_skills）
  - 应聘表（applications）
  - 审计表（audit_logs）

- 视图说明
  - job_details 视图
  - application_details 视图

- 性能优化
  - 索引策略
  - 查询优化
  - 缓存建议

- 安全建议
  - RLS 配置
  - 数据加密
  - 审计日志

**何时使用**
- ✅ 数据库设计和规划
- ✅ SQL 查询优化
- ✅ 数据迁移和备份
- ✅ 性能问题排查

**相关命令**
```bash
# 查看表结构
grep -A 20 "CREATE TABLE users" database/supabase_schema.sql

# 查看索引
grep "CREATE INDEX" database/supabase_schema.sql
```

---

#### 3. SECURITY_BEST_PRACTICES.md
**安全最佳实践** - 企业级安全架构指南

**内容**
- 安全架构概述
  - 模式 A（经典后端转发）
  - 流程图和特点

- RLS 配置
  - 启用 RLS
  - 创建 Policy
  - 验证 RLS 状态

- 后端安全
  - 环境变量管理
  - 认证和授权
  - 输入验证
  - 密码哈希

- 前端安全
  - Token 存储
  - XSS 防护
  - CSRF 防护
  - 敏感信息处理

- 数据保护
  - 加密策略
  - 审计日志
  - 备份和恢复

- 部署安全
  - HTTPS 配置
  - CORS 配置
  - 速率限制
  - 安全头部

- 监控和审计
  - 日志记录
  - 指标收集
  - 审计查询

- 常见漏洞防护
  - SQL 注入
  - XSS 攻击
  - CSRF 攻击
  - 认证绕过
  - 权限提升

- 安全检查清单
  - RLS 配置检查
  - 后端配置检查
  - 前端安全检查
  - 数据安全检查
  - 部署安全检查

**何时使用**
- ✅ 安全审计
- ✅ 部署前检查
- ✅ 漏洞修复
- ✅ 安全培训

**相关命令**
```bash
# 验证 RLS 状态
# 在 Supabase SQL Editor 中执行
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

# 查看 Policy
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

#### 4. DATETIME_HANDLING_GUIDE.md
**时间处理指南** - 完整的时间处理方案

**内容**
- 核心原则
  - 数据库层：timestamptz + UTC
  - 前端层：JavaScript 原生处理
  - 传输格式：ISO 8601 UTC

- 数据库配置
  - Drizzle ORM 配置
  - Supabase SQL 配置
  - 时间字段说明

- 后端处理
  - Server Actions 中的时间处理
  - API 路由中的时间处理
  - 代码示例

- 前端处理
  - 基础时间工具函数
  - React 组件中的时间显示
  - 应聘状态显示
  - 倒计时组件
  - React Query 示例
  - dayjs 库示例

- 常见场景
  - 显示职位发布时间
  - 显示职位截止时间
  - 显示应聘状态时间线
  - 显示职位倒计时

- 最佳实践
  - 数据库层最佳实践
  - 后端层最佳实践
  - 前端层最佳实践
  - 传输层最佳实践

- 故障排除
  - 时间显示不正确
  - 时间相差几个小时
  - 不同用户看到的时间不同
  - 时间戳精度丢失

**何时使用**
- ✅ 时间相关功能开发
- ✅ 时间显示问题排查
- ✅ 时区处理问题
- ✅ 倒计时功能实现

**相关命令**
```bash
# 查看时间工具函数
cat frontend/src_lib_datetime.ts

# 在前端组件中使用
import { formatLocalDateTime } from '@/lib/datetime';
```

---

### 🗄️ 数据库目录 (database/)

#### 1. supabase_schema.sql
**Supabase SQL Schema** - 完整的数据库初始化脚本

**特点**
- ✅ 包含删除现有对象的逻辑（可重复执行）
- ✅ 所有 13 个表都启用了 RLS
- ✅ 所有 2 个视图都启用了 RLS
- ✅ 所有时间字段使用 TIMESTAMPTZ
- ✅ 包含审计日志和触发器
- ✅ 包含初始化数据
- ✅ 包含验证脚本

**执行步骤**
1. 打开 Supabase 控制台
2. 进入 SQL Editor
3. 复制全部内容
4. 粘贴并执行
5. 等待完成

**验证脚本**
```sql
-- 验证 RLS 启用状态
-- 预期结果：15（13 个表 + 2 个视图）
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- 验证 Policy 创建状态
-- 预期结果：15
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' AND policyname LIKE '%deny_all';
```

**何时使用**
- ✅ 项目初期数据库初始化
- ✅ 开发环境重置
- ✅ 测试环境部署
- ✅ 生产环境部署

**相关命令**
```bash
# 使用 Drizzle Kit 执行迁移
pnpm db:push

# 查看数据库状态
psql $DATABASE_URL -c "SELECT * FROM pg_tables WHERE schemaname = 'public';"
```

---

#### 2. schema.ts
**⚠️ 已废弃** - 此文件已不再使用，请参考 `db/schema.ts`

**说明**：
- 此文件是历史遗留文件，内容与 `db/schema.ts` 重复
- 实际使用的 schema 文件位于 `db/schema.ts`（根目录）
- `db/schema.ts` 包含详细的废弃说明和架构变更说明

**表结构**（参考 `db/schema.ts`）：
- 基础数据表：provinces、cities、industries_level1、industries_level2、skills
- 用户表：users、talents、companies
- 关联表：talent_skills
- 职位表：job_positions、job_skills
- 应聘表：applications
- 审计表：audit_logs

**使用方式**（已废弃，仅供参考）：
```typescript
// ⚠️ 注意：以下代码已废弃，仅作为参考
// import { users, talents, companies, jobPositions, applications } from '@/db/schema';
// import { db } from '@/lib/db';
// import { eq } from 'drizzle-orm';

// 查询用户
const user = await db.query.users.findFirst({
  where: eq(users.phone, '13800138000'),
});

// 创建人才档案
const talent = await db.insert(talents).values({
  userId: user.id,
  realName: '张三',
  gender: 'male',
  birthDate: new Date('1990-01-01'),
  workExperienceYears: 5,
  education: 'bachelor',
});

// 查询职位列表
const positions = await db.query.jobPositions.findMany({
  where: eq(jobPositions.status, 'published'),
  limit: 10,
});

// 创建应聘记录
const application = await db.insert(applications).values({
  talentId: talent.id,
  jobPositionId: positions[0].id,
  status: 'pending',
});
```

**何时使用**
- ✅ 后端数据库查询
- ✅ 类型检查和自动补全
- ✅ 数据库迁移
- ✅ ORM 代码生成

**相关命令**（已废弃）
```bash
# ⚠️ 注意：以下命令已废弃，项目已切换到 Supabase SDK API 模式
# 复制到项目（不再需要）
# cp database/schema.ts src/db/schema.ts

# 生成类型（不再需要）
# pnpm db:generate

# 推送迁移（不再需要）
# pnpm db:push
```

---

### 🔐 后端目录 (backend/)

#### 1. backend_security_config.ts
**后端安全连接配置** - 完整的后端实现示例

**包含内容**
- Drizzle ORM + PostgreSQL 连接配置
- Supabase Admin 客户端（service_role key）
- Supabase 前端客户端（anon key）
- 密码哈希和验证函数
- JWT 生成和验证函数
- 认证中间件示例
- API 路由示例（GET/POST/PUT/DELETE）

**关键代码**
```typescript
// 后端使用 service_role key
import { supabaseAdmin } from '@/lib/supabase-admin';

// 查询数据（绕过 RLS）
const users = await supabaseAdmin
  .from('users')
  .select('*')
  .limit(10);

// 前端只使用 anon key
import { supabase } from '@/lib/supabase-client';

// 仅用于认证
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});
```

**包含的工具函数**
- `hashPassword()` - 密码哈希
- `verifyPassword()` - 密码验证
- `generateToken()` - JWT 生成
- `verifyToken()` - JWT 验证

**何时使用**
- ✅ 后端项目初期配置
- ✅ API 路由实现
- ✅ 认证功能开发
- ✅ 数据库连接配置

**相关命令**
```bash
# 复制到项目
cp backend/backend_security_config.ts src/lib/db.ts

# 安装依赖
pnpm install bcrypt jsonwebtoken drizzle-orm postgres

# 配置环境变量
cat > .env.local << EOF
SUPABASE_SERVICE_ROLE_KEY=your-key
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
EOF
```

---

### 🎨 前端目录 (frontend/)

#### 1. src_lib_datetime.ts
**前端时间处理工具库** - 20+ 个时间处理函数

**包含函数**
- `formatLocalDateTime()` - 格式化本地时间
- `getRelativeTime()` - 相对时间
- `isExpired()` - 判断是否过期
- `getTimeRemaining()` - 获取剩余时间
- `formatDateOnly()` - 仅格式化日期
- `formatTimeOnly()` - 仅格式化时间
- `getTimeUntilExpiry()` - 获取到期时间
- `formatDuration()` - 格式化时长
- `addDays()` - 添加天数
- `isSameDay()` - 判断是否同一天
- 等等...

**使用方式**
```typescript
import { 
  formatLocalDateTime, 
  getRelativeTime, 
  isExpired,
  getTimeRemaining 
} from '@/lib/datetime';

// 格式化时间
const publishedAt = formatLocalDateTime(job.published_at);
// 输出：2024-01-03 10:30:45

// 相对时间
const timeAgo = getRelativeTime(job.published_at);
// 输出：2 小时前

// 判断过期
if (isExpired(job.expired_at)) {
  console.log('职位已过期');
}

// 获取剩余时间
const remaining = getTimeRemaining(job.expired_at);
// 输出：{ days: 5, hours: 3, minutes: 20, seconds: 15 }
```

**何时使用**
- ✅ 时间显示功能
- ✅ 倒计时功能
- ✅ 时间相关计算
- ✅ 时区处理

**相关命令**
```bash
# 复制到项目
cp frontend/src_lib_datetime.ts src/lib/datetime.ts

# 在组件中导入使用
import { formatLocalDateTime } from '@/lib/datetime';
```

---

### ⚙️ 配置目录 (config/)

#### 1. .cursorrules
**Cursor IDE 全局规则** - 代码生成和开发规范

**包含内容**
- 核心开发原则
  - 优先使用 Server Components
  - 类型安全第一
  - 使用 Drizzle ORM
  - 使用 Tailwind CSS

- 命名规范
  - 变量/函数：camelCase
  - 类/接口：PascalCase
  - 常量：UPPER_SNAKE_CASE
  - 文件/文件夹：kebab-case
  - React 组件：PascalCase

- 文件结构规范
  - src/app/ - Next.js App Router
  - src/components/ - React 组件
  - src/lib/ - 工具函数
  - src/server/ - 服务端代码
  - src/types/ - TypeScript 类型
  - src/hooks/ - React Hooks
  - src/db/ - 数据库相关

- 导入规范
  - 按类型分组
  - 使用别名
  - 避免相对路径

- React 规范
  - 优先使用 Server Components
  - 使用 React.memo 优化
  - 使用 useCallback 优化

- 数据库规范
  - 使用 Drizzle ORM
  - 分离查询和修改
  - 类型安全的查询

- 代码生成指南
  - 生成 Server Components
  - 生成 TypeScript 代码
  - 生成类型定义
  - 生成 API 路由

**何时使用**
- ✅ 项目初期配置
- ✅ 新成员入职
- ✅ 代码生成
- ✅ 代码审查

**相关命令**
```bash
# 复制到项目根目录
cp config/.cursorrules .cursorrules

# 重启 Cursor IDE
# Cursor 会自动读取规则
```

---

## 🚀 使用流程

### 场景 1：项目初期（第一周）

1. **阅读文档**
   ```bash
   # 阅读需求文档
   cat docs/instruction.md
   
   # 阅读数据库设计
   cat docs/DATABASE_DESIGN.md
   ```

2. **初始化数据库**
   ```bash
   # 在 Supabase SQL Editor 中执行
   # 复制 database/supabase_schema.sql 的全部内容
   ```

3. **配置后端**（已废弃）
   ```bash
   # ⚠️ 注意：以下命令已废弃，项目已切换到 Supabase SDK API 模式
   # 复制文件（不再需要）
   # cp database/schema.ts src/db/schema.ts
   # cp backend/backend_security_config.ts src/lib/db.ts
   
   # 配置环境变量
   cat > .env.local << EOF
   SUPABASE_SERVICE_ROLE_KEY=your-key
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   EOF
   ```

4. **配置前端**
   ```bash
   # 复制时间工具库
   cp frontend/src_lib_datetime.ts src/lib/datetime.ts
   
   # 配置 Cursor
   cp config/.cursorrules .cursorrules
   ```

5. **验证配置**
   ```bash
   # 测试数据库连接
   pnpm dev
   
   # 验证 RLS
   # 在 Supabase SQL Editor 中执行验证脚本
   ```

### 场景 2：功能开发（日常开发）

1. **查看需求**
   ```bash
   grep -n "职位发布" docs/instruction.md
   ```

2. **查看数据库设计**
   ```bash
   grep -A 30 "CREATE TABLE job_positions" database/supabase_schema.sql
   ```

3. **实现 API 路由**
   ```bash
   # 参考 backend_security_config.ts 中的示例
   # 实现 POST /api/jobs 路由
   ```

4. **实现前端组件**
   ```bash
   # 使用 src_lib_datetime.ts 中的函数
   # 处理时间显示
   ```

5. **使用 Cursor 生成代码**
   ```bash
   # Cursor 会遵循 .cursorrules 规则
   # 生成符合规范的代码
   ```

### 场景 3：安全审计（部署前）

1. **检查 RLS 配置**
   ```bash
   # 在 Supabase SQL Editor 中执行
   SELECT COUNT(*) FROM pg_tables 
   WHERE schemaname = 'public' AND rowsecurity = true;
   # 预期结果：15
   ```

2. **检查环境变量**
   ```bash
   # 确保 .env.local 已配置
   # 确保 service_role key 不暴露
   cat .env.local
   ```

3. **检查安全规范**
   ```bash
   # 阅读安全最佳实践
   cat docs/SECURITY_BEST_PRACTICES.md
   
   # 按照检查清单逐项检查
   ```

4. **部署**
   ```bash
   # 部署到生产环境
   # 确保所有检查都通过
   ```

---

## 📞 常见问题

### Q1: 如何快速开始？
A: 按照"使用流程 - 场景 1"的步骤执行。

### Q2: 如何添加新表？
A: 
1. 在 schema.ts 中定义表结构
2. 在 supabase_schema.sql 中添加 SQL 语句
3. 运行 `pnpm db:push` 推送迁移

### Q3: 如何处理时间相关问题？
A: 查看 docs/DATETIME_HANDLING_GUIDE.md 和 frontend/src_lib_datetime.ts

### Q4: 如何确保安全？
A: 查看 docs/SECURITY_BEST_PRACTICES.md 和部署检查清单

### Q5: 如何使用 Cursor 生成代码？
A: 确保 config/.cursorrules 已复制到项目根目录，Cursor 会自动读取规则

---

## 📊 文件大小统计

| 文件 | 大小 |
|------|------|
| docs/instruction.md | 32 KB |
| docs/DATABASE_DESIGN.md | 15 KB |
| docs/SECURITY_BEST_PRACTICES.md | 21 KB |
| docs/DATETIME_HANDLING_GUIDE.md | 22 KB |
| database/supabase_schema.sql | 24 KB |
| ~~database/schema.ts~~ | ~~14 KB~~ | ⚠️ 已删除（与 db/schema.ts 重复） |
| backend/backend_security_config.ts | 12 KB |
| frontend/src_lib_datetime.ts | 11 KB |
| config/.cursorrules | 5 KB |
| **总计** | **156 KB** |

---

**祝您开发愉快！** 🚀
