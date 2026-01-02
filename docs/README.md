# 快捷招聘平台 - 完整项目文件

欢迎使用快捷招聘平台的完整项目文件包！本项目包含数据库设计、安全配置、前端工具和完整文档。

## 📁 项目结构

```
kuaijie-recruitment/
├── README.md                          # 项目说明（本文件）
├── FILE_INDEX.md                      # 文件索引和使用指南
│
├── docs/                              # 📚 项目文档
│   ├── instruction.md                 # 需求文档（核心功能、技术栈、代码规范）
│   ├── DATABASE_DESIGN.md             # 数据库设计文档
│   ├── SECURITY_BEST_PRACTICES.md     # 安全最佳实践指南
│   └── DATETIME_HANDLING_GUIDE.md     # 时间处理完整指南
│
├── database/                          # 🗄️ 数据库文件
│   ├── supabase_schema.sql            # Supabase SQL Schema（最终版，包含 RLS）
│   └── schema.ts                      # Drizzle ORM Schema 定义
│
├── backend/                           # 🔐 后端安全配置
│   └── backend_security_config.ts     # 后端安全连接配置和示例代码
│
├── frontend/                          # 🎨 前端工具
│   └── src_lib_datetime.ts            # 前端时间处理工具库（复制到 src/lib/datetime.ts）
│
└── config/                            # ⚙️ 项目配置
    └── .cursorrules                   # Cursor IDE 全局规则
```

## 🚀 快速开始

### 第 1 步：数据库初始化（5-10 分钟）

1. **打开 Supabase 控制台**
   - 登录 [Supabase](https://supabase.com)
   - 进入您的项目

2. **执行 SQL Schema**
   - 打开 SQL Editor
   - 复制 `database/supabase_schema.sql` 的全部内容
   - 粘贴并执行
   - 等待完成

3. **验证 RLS 配置**
   ```sql
   -- 在 SQL Editor 中执行
   -- 预期结果：15（13 个表 + 2 个视图）
   SELECT COUNT(*) FROM pg_tables 
   WHERE schemaname = 'public' AND rowsecurity = true;
   ```

### 第 2 步：后端配置（1-2 小时）

1. **复制数据库 Schema**
   ```bash
   cp database/schema.ts src/db/schema.ts
   ```

2. **复制后端配置**
   ```bash
   cp backend/backend_security_config.ts src/lib/db.ts
   ```

3. **配置环境变量**
   ```bash
   cat > .env.local << EOF
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-jwt-secret
   EOF
   ```

4. **安装依赖**
   ```bash
   pnpm install bcrypt jsonwebtoken drizzle-orm postgres
   ```

### 第 3 步：前端配置（30 分钟）

1. **复制时间工具库**
   ```bash
   cp frontend/src_lib_datetime.ts src/lib/datetime.ts
   ```

2. **在组件中使用**
   ```typescript
   import { formatLocalDateTime, getRelativeTime } from '@/lib/datetime';
   
   export function JobCard({ job }) {
     return (
       <div>
         <h3>{job.position_name}</h3>
         <p>发布于：{formatLocalDateTime(job.published_at)}</p>
         <p>截止于：{getRelativeTime(job.expired_at)}</p>
       </div>
     );
   }
   ```

### 第 4 步：Cursor IDE 配置（1 分钟）

1. **复制 Cursor 规则**
   ```bash
   cp config/.cursorrules .cursorrules
   ```

2. **重启 Cursor IDE**
   - Cursor 会自动读取 .cursorrules
   - 所有代码生成都会遵循规则

## 📚 文档说明

### 📖 docs/instruction.md
**需求文档** - 项目的完整需求说明
- 核心功能模块（6 大模块）
- 技术栈选择和版本
- 代码规范和最佳实践
- 测试和部署规范

**何时使用**：项目初期、新成员入职、代码审查

### 📖 docs/DATABASE_DESIGN.md
**数据库设计文档** - 完整的数据库架构说明
- 表结构和字段说明
- 关系图和依赖关系
- 索引策略和性能优化
- 初始化数据说明

**何时使用**：数据库设计、SQL 查询优化、数据迁移

### 📖 docs/SECURITY_BEST_PRACTICES.md
**安全最佳实践** - 企业级安全架构指南
- 安全架构概述（模式 A）
- RLS 配置和 Policy 管理
- 后端安全（认证、授权、输入验证）
- 前端安全（Token 存储、XSS 防护）
- 常见漏洞防护（SQL 注入、CSRF 等）
- 部署安全检查清单

**何时使用**：安全审计、部署前检查、漏洞修复

### 📖 docs/DATETIME_HANDLING_GUIDE.md
**时间处理指南** - 完整的时间处理方案
- 时间处理策略（timestamptz + 前端转换）
- 数据库配置示例
- 后端处理代码
- 前端处理代码
- 常见问题和故障排除

**何时使用**：时间相关功能开发、时间显示问题排查

## 🗄️ 数据库文件说明

### database/supabase_schema.sql
**Supabase SQL Schema** - 完整的数据库初始化脚本

**特点**
- ✅ 包含删除现有对象的逻辑（可重复执行）
- ✅ 所有 13 个表都启用了 RLS
- ✅ 所有 2 个视图都启用了 RLS
- ✅ 所有时间字段使用 TIMESTAMPTZ
- ✅ 包含审计日志和触发器
- ✅ 包含初始化数据
- ✅ 包含验证脚本

**执行方式**
```bash
# 在 Supabase SQL Editor 中执行
# 或使用 Drizzle Kit
pnpm db:push
```

### database/schema.ts
**Drizzle ORM Schema** - TypeScript 类型定义

**特点**
- ✅ 完整的 TypeScript 类型
- ✅ 所有关系定义
- ✅ 所有索引配置
- ✅ JSDoc 注释说明

**使用方式**
```typescript
import { db } from '@/lib/db';
import { users, talents, companies } from '@/db/schema';

// 查询用户
const user = await db.query.users.findFirst({
  where: eq(users.phone, '13800138000'),
});

// 创建人才档案
const talent = await db.insert(talents).values({
  userId: user.id,
  realName: '张三',
  // ...
});
```

## 🔐 后端配置说明

### backend/backend_security_config.ts
**后端安全连接配置** - 完整的后端实现示例

**包含内容**
- Drizzle ORM + PostgreSQL 连接配置
- Supabase Admin 客户端（service_role key）
- Supabase 前端客户端（anon key）
- 密码哈希和验证函数
- JWT 生成和验证函数
- 认证中间件示例
- API 路由示例（GET/POST/PUT/DELETE）

**使用方式**
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

## 🎨 前端工具说明

### frontend/src_lib_datetime.ts
**前端时间处理工具库** - 20+ 个时间处理函数

**包含函数**
- `formatLocalDateTime()` - 格式化本地时间
- `getRelativeTime()` - 相对时间（如"2 小时前"）
- `isExpired()` - 判断是否过期
- `getTimeRemaining()` - 获取剩余时间
- `formatDateOnly()` - 仅格式化日期
- `formatTimeOnly()` - 仅格式化时间
- 等等...

**使用方式**
```typescript
import { formatLocalDateTime, getRelativeTime } from '@/lib/datetime';

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
```

## ⚙️ 配置文件说明

### config/.cursorrules
**Cursor IDE 全局规则** - 代码生成和开发规范

**包含内容**
- 核心开发原则（Server Components、类型安全等）
- 命名规范（camelCase、PascalCase 等）
- 文件结构规范
- 导入规范
- React 规范
- 数据库规范
- 代码生成指南

**使用方式**
- 复制到项目根目录
- Cursor 会自动读取
- 所有代码生成都会遵循规则

## 📋 安全架构总结

### 核心安全特性

✅ **RLS 启用**
- 所有 13 个表都启用了 RLS
- 所有 2 个视图都启用了 RLS
- 前端无法直连数据库

✅ **后端控制**
- 后端使用 service_role key
- 所有数据访问都通过后端 API
- 后端进行权限检查和数据验证

✅ **时间处理**
- 所有时间字段使用 TIMESTAMPTZ
- 自动转换为 UTC 存储
- 前端根据用户浏览器时区显示

✅ **审计日志**
- 所有数据修改都被记录
- 支持安全审计和问题追踪
- 自动触发器维护日志

✅ **环境变量**
- 所有敏感信息都存储在 .env.local
- service_role key 不暴露给前端
- 支持多环境配置

## 🔍 文件清单

| 文件 | 大小 | 用途 |
|------|------|------|
| docs/instruction.md | 32 KB | 需求文档 |
| docs/DATABASE_DESIGN.md | 15 KB | 数据库设计 |
| docs/SECURITY_BEST_PRACTICES.md | 21 KB | 安全指南 |
| docs/DATETIME_HANDLING_GUIDE.md | 22 KB | 时间处理 |
| database/supabase_schema.sql | 24 KB | SQL Schema |
| database/schema.ts | 14 KB | Drizzle Schema |
| backend/backend_security_config.ts | 12 KB | 后端配置 |
| frontend/src_lib_datetime.ts | 11 KB | 前端工具 |
| config/.cursorrules | - | Cursor 规则 |

**总计**：约 150+ KB

## ✅ 部署检查清单

部署前请确认以下项目：

- [ ] 执行了 supabase_schema.sql
- [ ] 验证了所有 15 个对象都启用了 RLS
- [ ] 配置了所有环境变量
- [ ] .env.local 已添加到 .gitignore
- [ ] 后端可以正常连接数据库
- [ ] 前端无法直连数据库（RLS 阻止）
- [ ] 审计日志表正常工作
- [ ] 时间字段显示正确
- [ ] Cursor 规则已配置

## 🤝 支持和反馈

如有任何问题或建议，请：

1. 查看相关文档
2. 检查常见问题部分
3. 参考代码示例
4. 查看验证脚本

## 📞 联系方式

- 项目名称：快捷招聘平台
- 创建日期：2024-01-03
- 最后更新：2024-01-03

---

**祝您开发愉快！** 🚀
