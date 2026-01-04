# 快捷招聘平台 - 架构设计

## 🏗️ 核心原则

### 1. 统一入口：所有数据库操作在 `server/` 目录

**规则**：前端组件永远不直接访问数据库或 Supabase 客户端。

```
前端组件 (app/, components/)
    ↓ 调用
server/queries/  (数据读取)
server/actions/  (数据修改)
    ↓ 使用
lib/supabase/admin.ts  (Service Role 客户端)
    ↓ 通过
Supabase HTTPS API
    ↓ 访问
PostgreSQL 数据库
```

### 2. 隐藏实现细节

前端组件只需要知道：
- `await getJobs()` - 获取职位列表
- `await getJobById(id)` - 获取职位详情
- `await createApplication(talentId, jobId)` - 申请职位

前端组件**不需要知道**：
- ❌ 后端是用 API 还是直连
- ❌ 使用的是什么数据库
- ❌ Service Role Key 是什么
- ❌ RLS 策略配置

### 3. 快速迭代策略

**当前阶段**：使用 Service Role 的"上帝权限"快速开发
- ✅ 所有查询和操作都在服务端
- ✅ 使用 `createAdminClient()` 绕过 RLS
- ✅ 快速实现功能，验证业务逻辑

**未来优化**：精细化配置 RLS
- ⏳ 后续在 Supabase 后台配置 Row Level Security
- ⏳ 细化权限控制
- ⏳ 优化安全性

## 📁 目录结构

```
server/
├── queries/           # 数据查询（只读操作）
│   ├── jobs.ts       # 职位查询
│   ├── users.ts      # 用户查询
│   └── applications.ts # 应聘查询
│
└── actions/          # 数据修改（写入操作，标记 "use server"）
    ├── auth.ts       # 认证相关（登录、注册、登出）
    ├── jobs.ts       # 职位操作（创建、更新、删除）
    └── applications.ts # 应聘操作（申请、更新状态）

lib/
└── supabase/
    └── admin.ts      # 管理员客户端（Service Role）
```

## 🔌 使用示例

### 前端组件调用（Server Component）

```typescript
// app/page.tsx
import { getFeaturedJobs } from "@/server/queries/jobs";

export default async function HomePage() {
  // 前端组件只需要调用函数，不知道后端实现
  const jobs = await getFeaturedJobs(6);
  
  return <JobList jobs={jobs} />;
}
```

### 前端组件调用（Client Component）

```typescript
// components/apply-job-button.tsx
"use client";

import { createApplication } from "@/server/actions/applications";

export function ApplyJobButton({ jobId, talentId }) {
  const handleApply = async () => {
    // Client Component 调用 Server Action
    await createApplication(talentId, jobId);
  };
  
  return <button onClick={handleApply}>申请</button>;
}
```

### 服务端实现（隐藏细节）

```typescript
// server/queries/jobs.ts
import { createAdminClient } from "@/lib/supabase/admin";

// 前端调用这个函数，但不知道内部实现
export async function getFeaturedJobs(limit: number = 6) {
  const supabase = createAdminClient();
  
  // 内部使用 Service Role 客户端
  const { data } = await supabase
    .from("job_positions")
    .select("*")
    .eq("status", "published")
    .limit(limit);
  
  return data;
}
```

## ✅ 架构检查清单

### 前端组件应该：
- ✅ 只导入 `server/queries/` 和 `server/actions/` 中的函数
- ✅ 不导入 `lib/supabase/admin.ts`
- ✅ 不导入 `lib/db.ts`
- ✅ 不知道后端使用的是 Supabase API 还是直连

### 服务端代码应该：
- ✅ 所有数据库操作都在 `server/` 目录
- ✅ 使用 `createAdminClient()` 进行数据库操作
- ✅ 标记 `"use server"` 的操作函数
- ✅ 处理错误并返回友好的错误信息

### 禁止的做法：
- ❌ 前端组件直接使用 `createAdminClient()`
- ❌ 前端组件直接调用 `supabase.from()`
- ❌ 在 `components/` 或 `app/` 中直接导入 `lib/supabase/admin.ts`
- ❌ 使用 `DATABASE_URL` 进行直连

## 🎯 当前架构状态

### ✅ 已实现统一入口
- 所有查询函数都在 `server/queries/`
- 所有操作函数都在 `server/actions/`
- 前端组件只调用这些函数

### ✅ 已隐藏实现细节
- 前端组件不知道后端使用 Supabase API
- 前端组件不知道 Service Role Key
- 实现细节完全封装在 `server/` 目录

### ✅ 已启用快速迭代模式
- 使用 Service Role 的"上帝权限"
- 绕过所有 RLS 限制
- 快速开发，后续再优化安全策略

## 🚀 后续优化计划

### 阶段 1：快速开发（当前）
- ✅ 使用 Service Role 权限
- ✅ 快速实现所有功能
- ✅ 验证业务逻辑

### 阶段 2：安全性优化（后续）
- ⏳ 配置 RLS 策略
- ⏳ 细化权限控制
- ⏳ 添加审计日志

### 阶段 3：性能优化（后续）
- ⏳ 添加查询缓存
- ⏳ 优化数据库查询
- ⏳ 添加索引优化

## 📝 开发指南

### 添加新的查询函数

1. 在 `server/queries/` 中创建或编辑文件
2. 使用 `createAdminClient()` 获取客户端
3. 使用 Supabase SDK API 进行查询
4. 导出函数供前端使用

```typescript
// server/queries/jobs.ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function getJobsByCity(cityId: number) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("job_positions")
    .select("*")
    .eq("city_id", cityId);
  return data;
}
```

### 添加新的操作函数

1. 在 `server/actions/` 中创建或编辑文件
2. 标记函数为 `"use server"`
3. 使用 `createAdminClient()` 进行操作
4. 处理错误并返回结果

```typescript
// server/actions/jobs.ts
"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function publishJob(data: CreateJobInput) {
  const supabase = createAdminClient();
  const { data: job, error } = await supabase
    .from("job_positions")
    .insert(data)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return { success: true, job };
}
```

## 🔒 安全说明

### Service Role 权限
- 当前使用 Service Role 的"上帝权限"绕过所有 RLS
- 这是快速开发的策略，**后续需要配置 RLS 策略**

### 数据访问控制
- 所有数据库操作都在服务端
- Service Role Key 永远不会暴露给前端
- 前端无法直接访问数据库

### 后续安全优化
- 配置 Row Level Security (RLS) 策略
- 添加基于用户角色的权限控制
- 实现数据访问审计

---

**最后更新**：2026年1月
**维护者**：开发团队

