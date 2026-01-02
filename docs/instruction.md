# 快捷招聘平台 - 需求文档

**项目名称**：快捷招聘平台（Kuaijie Recruitment Platform）

**项目描述**：一个全功能的在线招聘平台，连接人才和企业，提供职位发布、人才搜索、职位申请、应聘管理等核心功能。快捷招聘平台致力于为求职者和招聘企业提供高效、便捷的招聘体验。

**文档版本**：1.0

**最后更新**：2026年1月

---

## 📋 核心功能

### 1. 用户管理系统

#### 1.1 人才用户功能

**注册与认证**
- 使用手机号 + 短信验证码进行注册
- 支持密码设置和修改
- 手机号唯一性验证
- 登录状态管理和会话控制

**个人档案管理**
- 编辑基本信息（姓名、性别、出生日期）
- 管理工作经验（年限、职位历史）
- 学历管理（学历类型、专业、毕业学校）
- 个人简介和头像上传
- 城市/地区选择

**技能管理**
- 添加、编辑、删除个人技能
- 标记技能熟练度（初级、中级、高级、精通）
- 技能搜索和推荐

**简历管理**
- 上传和管理多份简历
- 简历预览和下载
- 设置默认简历

#### 1.2 企业用户功能

**企业认证**
- 企业信息注册（企业名称、规模、所在城市）
- 营业执照上传和验证
- 企业认证状态管理（未认证、审核中、已认证、已拒绝）
- 企业信息编辑和更新

**企业档案**
- 企业基本信息（名称、规模、行业分类）
- 企业描述和介绍
- 企业logo上传
- 企业网站链接
- 联系方式管理

**权限管理**
- 企业管理员和员工角色区分
- 职位发布权限控制
- 应聘管理权限

### 2. 职位管理系统

#### 2.1 职位发布

**职位信息**
- 职位名称和描述
- 一级行业和二级行业分类
- 薪资范围（最低、最高）
- 工作地点（城市级别）
- 工作经验要求（年限）
- 学历要求（高中、大专、本科、硕士、博士）
- 招聘人数
- 职位有效期设置

**职位要求**
- 添加所需技能
- 标记必需和可选技能
- 自定义职位要求描述

**职位状态管理**
- 草稿状态（保存但未发布）
- 已发布状态（对人才可见）
- 已关闭状态（不再接收申请）
- 已过期状态（超过有效期自动关闭）

**职位编辑和删除**
- 已发布职位可编辑基本信息
- 已关闭职位可重新发布
- 职位删除（仅草稿状态）

#### 2.2 职位搜索和筛选

**搜索功能**
- 关键词搜索（职位名称、公司名称）
- 多条件筛选：
  - 城市/地区
  - 一级行业
  - 二级行业
  - 薪资范围
  - 工作经验要求
  - 学历要求
- 排序功能（最新发布、薪资高低、相关度）
- 分页显示

**职位推荐**
- 基于人才技能的职位推荐
- 基于人才工作经验的职位推荐
- 基于人才所在城市的职位推荐
- 个性化推荐列表

**职位详情页**
- 完整的职位信息展示
- 企业信息展示
- 相似职位推荐
- 申请按钮和申请状态显示

### 3. 应聘管理系统

#### 3.1 人才端应聘流程

**职位申请**
- 一键申请职位
- 选择要提交的简历
- 添加申请附言
- 防止重复申请（同一职位只能申请一次）

**应聘跟踪**
- 查看已申请的职位列表
- 应聘状态查看（待审核、已审核、已接受、已拒绝、已撤回）
- 企业回复信息查看
- 应聘时间线展示

**应聘管理**
- 撤回未审核的申请
- 查看企业的反馈和评论
- 应聘历史记录

#### 3.2 企业端应聘管理

**应聘审核**
- 查看职位的所有申请
- 按状态筛选申请（待审核、已审核等）
- 批量审核应聘
- 单个应聘详情查看

**人才评估**
- 查看人才的完整档案
- 查看人才的技能匹配度
- 查看人才的简历
- 人才评分和评论

**应聘回复**
- 接受或拒绝应聘
- 发送回复信息
- 邀请面试
- 记录面试时间和地点

**应聘统计**
- 职位应聘数统计
- 应聘状态分布
- 应聘转化率统计

### 4. 基础数据管理

#### 4.1 地理位置数据

**省份管理**
- 所有中国省份数据
- 省份代码映射

**城市管理**
- 各省份下的城市列表
- 城市代码映射
- 支持多级地理位置查询

#### 4.2 行业分类

**一级行业**
- 互联网IT
- 金融
- 房地产/建筑
- 贸易/零售/物流
- 教育/传媒/广告
- 服务业
- 市场/销售
- 人事/财务/行政

**二级行业**
- 每个一级行业下的细分行业
- 支持灵活扩展

#### 4.3 技能库

**技能分类**
- 编程语言
- 前端框架
- 后端框架
- 数据库
- DevOps
- 其他技能

**技能管理**
- 技能增删改查
- 技能搜索和自动完成
- 技能热度统计

### 5. 信息展示和通知

#### 5.1 首页和推荐

**首页内容**
- 热招企业展示
- 热门职位推荐
- 行业分类导航
- 城市频道入口
- 求职资讯和动态

**个性化推荐**
- 基于用户类型的推荐
- 基于用户行为的推荐
- 基于用户偏好的推荐

#### 5.2 通知系统

**人才通知**
- 职位申请状态变化通知
- 企业邀请通知
- 新职位推荐通知
- 企业动态通知

**企业通知**
- 新应聘通知
- 人才更新档案通知
- 系统消息通知

### 6. 其他功能

**用户反馈**
- 问题报告
- 建议提交
- 投诉处理

**数据统计**
- 用户统计（人才数、企业数）
- 职位统计（发布数、浏览数）
- 应聘统计（申请数、成功率）

**内容管理**
- 求职资讯展示
- 行业动态
- 平台公告

---

## 🛠️ 技术栈

### 前端框架

| 技术 | 版本 | 说明 |
|------|------|------|
| **Next.js** | 15.x | 全栈 React 框架，支持 App Router 和 Server Components |
| **React** | 19.x | UI 库，用于构建交互式用户界面 |
| **TypeScript** | 5.x | 类型安全的 JavaScript 超集 |
| **Tailwind CSS** | 4.x | 原子化 CSS 框架，用于快速样式开发 |

### 后端和数据库

| 技术 | 版本 | 说明 |
|------|------|------|
| **Supabase** | 最新 | 开源 Firebase 替代品，提供 PostgreSQL 数据库和认证 |
| **PostgreSQL** | 14+ | 关系型数据库，由 Supabase 托管 |
| **Drizzle ORM** | 最新 | 轻量级 TypeScript ORM，提供类型安全的数据库操作 |

### API 和通信

| 技术 | 版本 | 说明 |
|------|------|------|
| **tRPC** | 最新 | 端到端类型安全的 RPC 框架 |
| **Axios** | 最新 | HTTP 客户端库 |
| **React Query** | 最新 | 数据获取和缓存库 |

### 认证和授权

| 技术 | 版本 | 说明 |
|------|------|------|
| **Supabase Auth** | 内置 | 提供邮箱、手机号、OAuth 等认证方式 |
| **NextAuth.js** | 5.x | 可选，用于增强认证功能 |
| **JWT** | 标准 | 令牌认证方式 |

### UI 组件库

| 技术 | 版本 | 说明 |
|------|------|------|
| **shadcn/ui** | 最新 | 高质量的 React 组件库，基于 Tailwind CSS |
| **Radix UI** | 最新 | 无头 UI 组件库 |
| **Lucide Icons** | 最新 | 现代 SVG 图标库 |

### 表单处理

| 技术 | 版本 | 说明 |
|------|------|------|
| **React Hook Form** | 最新 | 高性能表单库 |
| **Zod** | 最新 | TypeScript 优先的模式验证库 |

### 文件上传

| 技术 | 版本 | 说明 |
|------|------|------|
| **Supabase Storage** | 内置 | 文件存储服务 |
| **react-dropzone** | 最新 | 文件拖放上传组件 |

### 开发工具

| 技术 | 版本 | 说明 |
|------|------|------|
| **pnpm** | 9.x+ | 快速、节省磁盘空间的包管理器 |
| **Drizzle Kit** | 最新 | 数据库迁移和管理工具 |
| **ESLint** | 最新 | 代码质量检查 |
| **Prettier** | 最新 | 代码格式化 |
| **Vitest** | 最新 | 单元测试框架 |

### 部署和托管

| 技术 | 说明 |
|------|------|
| **Vercel** | Next.js 应用托管 |
| **Supabase** | 数据库和后端服务托管 |
| **Docker** | 容器化部署 |

### 监控和日志

| 技术 | 说明 |
|------|------|
| **Sentry** | 错误追踪和监控 |
| **Vercel Analytics** | 性能监控 |

---

## 📐 代码规范

### 1. 文件和文件夹结构

```
zhaopin-recruitment/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证相关路由（登录、注册）
│   │   ├── (dashboard)/        # 仪表板路由（人才/企业）
│   │   ├── jobs/               # 职位相关路由
│   │   ├── api/                # API 路由
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页
│   │
│   ├── components/             # React 组件
│   │   ├── auth/               # 认证组件
│   │   ├── job/                # 职位相关组件
│   │   ├── talent/             # 人才相关组件
│   │   ├── company/            # 企业相关组件
│   │   ├── common/             # 通用组件
│   │   └── ui/                 # UI 基础组件
│   │
│   ├── lib/                    # 工具函数和配置
│   │   ├── db.ts               # 数据库连接
│   │   ├── auth.ts             # 认证工具
│   │   ├── utils.ts            # 通用工具函数
│   │   └── constants.ts        # 常量定义
│   │
│   ├── server/                 # 服务端代码
│   │   ├── actions/            # Server Actions
│   │   ├── queries/            # 数据库查询
│   │   └── mutations/          # 数据库修改
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── index.ts            # 导出所有类型
│   │   ├── user.ts             # 用户相关类型
│   │   ├── job.ts              # 职位相关类型
│   │   └── application.ts      # 应聘相关类型
│   │
│   ├── hooks/                  # React Hooks
│   │   ├── useAuth.ts          # 认证 Hook
│   │   ├── useUser.ts          # 用户信息 Hook
│   │   └── useJobs.ts          # 职位数据 Hook
│   │
│   ├── styles/                 # 全局样式
│   │   └── globals.css         # 全局 CSS
│   │
│   └── db/                     # 数据库相关
│       ├── schema.ts           # Drizzle ORM Schema
│       └── migrations/         # 数据库迁移文件
│
├── public/                     # 静态资源
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/                      # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                  # 本地环境变量
├── .env.example                # 环境变量示例
├── .eslintrc.json              # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── tsconfig.json               # TypeScript 配置
├── next.config.ts              # Next.js 配置
├── drizzle.config.ts           # Drizzle ORM 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── package.json                # 项目依赖
├── pnpm-lock.yaml              # 依赖锁定文件
├── instruction.md              # 需求文档（本文件）
├── DATABASE_DESIGN.md          # 数据库设计文档
└── README.md                   # 项目说明
```

### 2. 命名规范

#### 2.1 变量和常量

**规则**：使用 camelCase 命名

```typescript
// ✅ 正确
const userName = "张三";
const isLoggedIn = true;
const maxRetries = 3;
const userProfileData = { name: "张三", age: 28 };

// ❌ 错误
const user_name = "张三";
const IsLoggedIn = true;
const MAX_RETRIES = 3;
const UserProfileData = { name: "张三", age: 28 };
```

#### 2.2 函数名

**规则**：使用 camelCase，动词开头

```typescript
// ✅ 正确
function getUserById(id: number) {}
function calculateSalaryRange(min: number, max: number) {}
function isValidEmail(email: string) {}
function handleFormSubmit(e: FormEvent) {}

// ❌ 错误
function get_user_by_id(id: number) {}
function CalculateSalaryRange(min: number, max: number) {}
function ValidEmail(email: string) {}
function form_submit(e: FormEvent) {}
```

#### 2.3 类和接口名

**规则**：使用 PascalCase

```typescript
// ✅ 正确
class UserService {}
interface UserProfile {}
type JobPosition = {}

// ❌ 错误
class user_service {}
interface user_profile {}
type job_position = {}
```

#### 2.4 常量

**规则**：使用 UPPER_SNAKE_CASE

```typescript
// ✅ 正确
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_BASE_URL = "https://api.example.com";
const USER_ROLES = ["admin", "user", "guest"] as const;

// ❌ 错误
const maxFileSize = 5 * 1024 * 1024;
const apiBaseUrl = "https://api.example.com";
const userRoles = ["admin", "user", "guest"];
```

#### 2.5 文件和文件夹名

**规则**：使用 kebab-case（小写，用连字符分隔）

```
// ✅ 正确
src/components/job-card.tsx
src/hooks/use-auth.ts
src/lib/api-client.ts
src/types/user-profile.ts

// ❌ 错误
src/components/JobCard.tsx
src/hooks/UseAuth.ts
src/lib/apiClient.ts
src/types/userProfile.ts
```

#### 2.6 React 组件名

**规则**：使用 PascalCase，文件名与组件名一致

```typescript
// ✅ 正确
// src/components/job-card.tsx
export function JobCard() {
  return <div>...</div>;
}

// ❌ 错误
// src/components/jobCard.tsx
export function jobCard() {
  return <div>...</div>;
}
```

### 3. React 和 Next.js 最佳实践

#### 3.1 优先使用 Server Components

**规则**：默认使用 Server Components，只在需要交互时使用 Client Components

```typescript
// ✅ 正确 - Server Component
// src/app/jobs/page.tsx
import { getJobs } from "@/server/queries/jobs";

export default async function JobsPage() {
  const jobs = await getJobs();
  return <JobList jobs={jobs} />;
}

// ✅ 正确 - Client Component（需要交互）
// src/components/job-filter.tsx
"use client";

import { useState } from "react";

export function JobFilter() {
  const [filters, setFilters] = useState({});
  return <div>...</div>;
}

// ❌ 错误 - 不必要的 Client Component
"use client";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  // 在客户端获取数据
  useEffect(() => {
    fetchJobs();
  }, []);
  return <JobList jobs={jobs} />;
}
```

#### 3.2 使用 Server Actions

**规则**：在 Server Components 中使用 Server Actions 处理表单提交和数据修改

```typescript
// ✅ 正确
// src/server/actions/jobs.ts
"use server";

import { db } from "@/lib/db";
import { jobPositions } from "@/db/schema";

export async function publishJob(formData: FormData) {
  const positionName = formData.get("positionName") as string;
  
  const result = await db
    .insert(jobPositions)
    .values({ positionName })
    .returning();
  
  return result;
}

// src/app/jobs/publish/page.tsx
import { publishJob } from "@/server/actions/jobs";

export default function PublishJobPage() {
  return (
    <form action={publishJob}>
      <input name="positionName" />
      <button type="submit">发布职位</button>
    </form>
  );
}

// ❌ 错误 - 在客户端处理数据修改
"use client";

export function PublishJobForm() {
  const handleSubmit = async (e: FormEvent) => {
    const response = await fetch("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### 3.3 数据获取

**规则**：在 Server Components 中直接查询数据库，避免不必要的 API 调用

```typescript
// ✅ 正确 - Server Component 中直接查询
// src/app/jobs/[id]/page.tsx
import { getJobById } from "@/server/queries/jobs";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(parseInt(params.id));
  return <JobDetail job={job} />;
}

// ✅ 正确 - Client Component 中使用 React Query
// src/components/job-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function JobList() {
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      return response.json();
    },
  });
  return <div>...</div>;
}

// ❌ 错误 - Server Component 中使用 useEffect
"use client";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    fetch("/api/jobs").then(res => res.json()).then(setJobs);
  }, []);
  
  return <div>...</div>;
}
```

### 4. TypeScript 规范

#### 4.1 类型定义

**规则**：为所有函数参数和返回值添加类型注解

```typescript
// ✅ 正确
function getUserById(id: number): Promise<User | null> {
  // ...
}

function calculateAge(birthDate: Date): number {
  // ...
}

interface JobPosition {
  id: number;
  name: string;
  salary: {
    min: number;
    max: number;
  };
}

// ❌ 错误
function getUserById(id) {
  // ...
}

function calculateAge(birthDate) {
  // ...
}

const job = {
  id: 1,
  name: "前端工程师",
  salary: { min: 15000, max: 25000 },
};
```

#### 4.2 使用 Zod 进行运行时验证

**规则**：对用户输入和 API 响应进行验证

```typescript
// ✅ 正确
import { z } from "zod";

const jobFilterSchema = z.object({
  cityId: z.number().optional(),
  industryId: z.number().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
});

type JobFilter = z.infer<typeof jobFilterSchema>;

function filterJobs(filters: unknown): JobFilter {
  return jobFilterSchema.parse(filters);
}

// ❌ 错误
function filterJobs(filters: any) {
  return filters;
}
```

### 5. 样式规范

#### 5.1 使用 Tailwind CSS

**规则**：优先使用 Tailwind CSS 类，避免自定义 CSS

```typescript
// ✅ 正确
export function JobCard({ job }: { job: JobPosition }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
      <p className="mt-2 text-sm text-gray-600">{job.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-medium text-green-600">
          ¥{job.salary.min.toLocaleString()} - ¥{job.salary.max.toLocaleString()}
        </span>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          申请职位
        </button>
      </div>
    </div>
  );
}

// ❌ 错误 - 使用自定义 CSS
export function JobCard({ job }: { job: JobPosition }) {
  return (
    <div className="job-card">
      <h3>{job.name}</h3>
      <p>{job.description}</p>
      <button>申请职位</button>
    </div>
  );
}

/* styles.css */
.job-card {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### 5.2 响应式设计

**规则**：使用 Tailwind 的响应式前缀确保移动端适配

```typescript
// ✅ 正确
export function JobGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

// ❌ 错误 - 不考虑响应式
export function JobGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

### 6. 数据库操作规范

#### 6.1 使用 Drizzle ORM

**规则**：使用 Drizzle ORM 进行类型安全的数据库操作

```typescript
// ✅ 正确
// src/server/queries/jobs.ts
import { db } from "@/lib/db";
import { jobPositions, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getJobById(id: number) {
  const [job] = await db
    .select()
    .from(jobPositions)
    .where(eq(jobPositions.id, id));
  
  return job;
}

export async function getJobsWithCompany() {
  return db
    .select()
    .from(jobPositions)
    .innerJoin(companies, eq(jobPositions.companyId, companies.id));
}

// ❌ 错误 - 使用原生 SQL
export async function getJobById(id: number) {
  const result = await db.query(
    `SELECT * FROM job_positions WHERE id = ${id}`
  );
  return result[0];
}
```

#### 6.2 分离查询和修改

**规则**：将数据库查询和修改分离到不同的文件

```typescript
// src/server/queries/jobs.ts - 只读操作
export async function getJobs(filters: JobFilter) {
  // 查询逻辑
}

export async function getJobById(id: number) {
  // 查询逻辑
}

// src/server/mutations/jobs.ts - 写入操作
export async function createJob(data: CreateJobInput) {
  // 创建逻辑
}

export async function updateJob(id: number, data: UpdateJobInput) {
  // 更新逻辑
}

export async function deleteJob(id: number) {
  // 删除逻辑
}
```

### 7. 错误处理规范

#### 7.1 使用自定义错误类

**规则**：定义和使用自定义错误类处理应用错误

```typescript
// ✅ 正确
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", 404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("UNAUTHORIZED", 401, "Unauthorized");
  }
}

// src/server/queries/jobs.ts
export async function getJobById(id: number) {
  const job = await db
    .select()
    .from(jobPositions)
    .where(eq(jobPositions.id, id));
  
  if (!job) {
    throw new NotFoundError("Job");
  }
  
  return job;
}

// ❌ 错误 - 不处理错误
export async function getJobById(id: number) {
  return db
    .select()
    .from(jobPositions)
    .where(eq(jobPositions.id, id));
}
```

#### 7.2 在 API 路由中处理错误

**规则**：统一处理和返回错误响应

```typescript
// ✅ 正确
// src/app/api/jobs/[id]/route.ts
import { AppError } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const job = await getJobById(parseInt(params.id));
    return Response.json(job);
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { code: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    
    return Response.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### 8. 代码注释规范

#### 8.1 函数注释

**规则**：为复杂函数添加 JSDoc 注释

```typescript
// ✅ 正确
/**
 * 根据过滤条件搜索职位
 * @param filters - 过滤条件
 * @param filters.cityId - 城市ID
 * @param filters.industryId - 行业ID
 * @param filters.salaryMin - 最低薪资
 * @returns 匹配的职位列表
 */
export async function searchJobs(filters: JobFilter): Promise<JobPosition[]> {
  // ...
}

// ❌ 错误 - 没有注释
export async function searchJobs(filters: JobFilter) {
  // ...
}
```

#### 8.2 复杂逻辑注释

**规则**：为复杂的业务逻辑添加说明注释

```typescript
// ✅ 正确
export function calculateMatchScore(talent: Talent, job: JobPosition): number {
  let score = 0;
  
  // 技能匹配度：每个匹配的技能加10分
  const matchedSkills = talent.skills.filter(skill =>
    job.requiredSkills.includes(skill)
  );
  score += matchedSkills.length * 10;
  
  // 工作经验匹配度：如果经验年限满足要求，加20分
  if (talent.workExperienceYears >= job.workExperienceRequired) {
    score += 20;
  }
  
  // 地理位置匹配度：如果在同一城市，加15分
  if (talent.cityId === job.cityId) {
    score += 15;
  }
  
  return score;
}

// ❌ 错误 - 没有说明
export function calculateMatchScore(talent: Talent, job: JobPosition): number {
  let score = 0;
  score += talent.skills.filter(skill =>
    job.requiredSkills.includes(skill)
  ).length * 10;
  if (talent.workExperienceYears >= job.workExperienceRequired) {
    score += 20;
  }
  if (talent.cityId === job.cityId) {
    score += 15;
  }
  return score;
}
```

### 9. 导入和导出规范

#### 9.1 使用路径别名

**规则**：使用 @ 别名导入，避免相对路径

```typescript
// ✅ 正确
import { db } from "@/lib/db";
import { getJobById } from "@/server/queries/jobs";
import { JobCard } from "@/components/job-card";
import type { JobPosition } from "@/types/job";

// ❌ 错误 - 使用相对路径
import { db } from "../../../lib/db";
import { getJobById } from "../../../../server/queries/jobs";
import { JobCard } from "../job-card";
```

#### 9.2 按类型分组导入

**规则**：导入时按照类型、库、本地代码的顺序分组

```typescript
// ✅ 正确
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/job-card";
import { db } from "@/lib/db";
import type { JobPosition } from "@/types/job";

// ❌ 错误 - 导入顺序混乱
import { JobCard } from "@/components/job-card";
import { useState } from "react";
import type { JobPosition } from "@/types/job";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
```

### 10. 性能优化规范

#### 10.1 使用 React.memo 优化组件

**规则**：对频繁重新渲染的组件使用 React.memo

```typescript
// ✅ 正确
interface JobCardProps {
  job: JobPosition;
  onApply: (jobId: number) => void;
}

export const JobCard = React.memo(function JobCard({
  job,
  onApply,
}: JobCardProps) {
  return (
    <div>
      <h3>{job.name}</h3>
      <button onClick={() => onApply(job.id)}>申请</button>
    </div>
  );
});

// ❌ 错误 - 每次都重新渲染
export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div>
      <h3>{job.name}</h3>
      <button onClick={() => onApply(job.id)}>申请</button>
    </div>
  );
}
```

#### 10.2 使用 useCallback 优化回调

**规则**：为传递给子组件的回调函数使用 useCallback

```typescript
// ✅ 正确
"use client";

import { useCallback } from "react";

export function JobList() {
  const handleApply = useCallback((jobId: number) => {
    // 申请职位逻辑
  }, []);
  
  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onApply={handleApply} />
      ))}
    </div>
  );
}

// ❌ 错误 - 每次都创建新函数
export function JobList() {
  return (
    <div>
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onApply={(jobId) => {
            // 申请职位逻辑
          }}
        />
      ))}
    </div>
  );
}
```

---

## 🔒 安全规范

### 1. 认证和授权

**规则**：
- 所有受保护的路由必须进行身份验证
- 使用 Supabase Auth 进行用户认证
- 在 Server Components 中验证用户权限
- 敏感操作必须进行二次验证

```typescript
// ✅ 正确
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return <div>Protected content</div>;
}
```

### 2. 数据验证

**规则**：
- 所有用户输入必须进行验证
- 使用 Zod 进行运行时验证
- 在 Server Actions 中验证数据

```typescript
// ✅ 正确
const jobSchema = z.object({
  positionName: z.string().min(1).max(100),
  description: z.string().min(10).max(5000),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
});

export async function publishJob(formData: FormData) {
  const data = jobSchema.parse({
    positionName: formData.get("positionName"),
    description: formData.get("description"),
    salaryMin: formData.get("salaryMin"),
    salaryMax: formData.get("salaryMax"),
  });
  
  // 处理数据
}
```

### 3. 环境变量

**规则**：
- 敏感信息必须存储在环境变量中
- 不要在代码中硬编码敏感信息
- 使用 .env.local 存储本地开发环境变量
- 使用 .env.example 作为模板

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://xxx

# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

---

## 📦 依赖管理

### 1. 包管理器

**使用 pnpm**：项目使用 pnpm 作为包管理器

```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add package-name

# 删除依赖
pnpm remove package-name

# 更新依赖
pnpm update
```

### 2. 依赖版本

**规则**：
- 使用 ^ 符号允许小版本更新（^1.2.3 允许 1.x.x）
- 关键依赖使用 ~ 符号限制更新（~1.2.3 只允许 1.2.x）
- 定期更新依赖，但要进行充分测试

---

## 🧪 测试规范

### 1. 单元测试

**规则**：
- 为工具函数编写单元测试
- 使用 Vitest 框架
- 测试覆盖率目标：80%+

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { calculateAge } from "./utils";

describe("calculateAge", () => {
  it("should calculate age correctly", () => {
    const birthDate = new Date("1995-01-01");
    const age = calculateAge(birthDate);
    expect(age).toBe(29);
  });
  
  it("should handle edge cases", () => {
    const birthDate = new Date("2000-12-31");
    const age = calculateAge(birthDate);
    expect(age).toBeGreaterThanOrEqual(23);
  });
});
```

### 2. 集成测试

**规则**：
- 为 API 路由编写集成测试
- 测试数据库操作
- 使用测试数据库

### 3. E2E 测试

**规则**：
- 为关键用户流程编写 E2E 测试
- 使用 Playwright 或 Cypress
- 测试登录、职位申请等核心功能

---

## 📝 Git 规范

### 1. 提交信息

**规则**：使用 Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建、依赖等

**示例**：
```
feat(jobs): add job search filter

- Add city filter
- Add industry filter
- Add salary range filter

Closes #123
```

### 2. 分支命名

**规则**：使用 kebab-case

```
feature/job-search-filter
fix/login-bug
docs/api-documentation
```

---

## 🚀 部署规范

### 1. 环境配置

**规则**：
- 开发环境：.env.local
- 测试环境：.env.test
- 生产环境：Vercel 环境变量

### 2. 部署流程

**规则**：
- 所有代码必须通过 ESLint 检查
- 所有代码必须通过 TypeScript 编译
- 所有测试必须通过
- 使用 Vercel 自动部署

---

## 📚 文档规范

### 1. README

**规则**：
- 项目根目录必须有 README.md
- 包含项目描述、快速开始、技术栈等

### 2. API 文档

**规则**：
- 使用 OpenAPI/Swagger 文档化 API
- 包含请求参数、响应格式、错误处理

### 3. 代码文档

**规则**：
- 为复杂函数添加 JSDoc 注释
- 为复杂逻辑添加说明注释
- 保持注释与代码同步

---

## ✅ 检查清单

在提交代码前，请确保：

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 编译
- [ ] 代码通过 Prettier 格式化
- [ ] 所有测试通过
- [ ] 没有 console.log 或调试代码
- [ ] 没有硬编码的敏感信息
- [ ] 变量和函数命名遵循规范
- [ ] 添加了必要的类型注解
- [ ] 添加了必要的注释
- [ ] 更新了相关文档

---

## 📞 联系和支持

如有问题或建议，请提交 Issue 或联系开发团队。

---

**最后更新**：2026年1月

**维护者**：开发团队
