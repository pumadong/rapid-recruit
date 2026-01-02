# 快捷招聘平台 - 时间处理指南

## 核心原则

### 1. 数据库层：使用 timestamptz

**为什么使用 timestamptz？**

- ✅ **自动 UTC 转换**：所有时间自动存储为 UTC
- ✅ **时区感知**：读取时根据连接配置自动转回本地时间
- ✅ **国际化支持**：完美支持全球用户的不同时区
- ✅ **数据一致性**：避免时区混乱和数据不一致
- ✅ **最佳实践**：PostgreSQL 和 Supabase 的推荐方案

### 2. 前端层：JavaScript 原生处理

**为什么在前端处理？**

- ✅ **用户友好**：根据用户浏览器的本地设置自动显示时间
- ✅ **无需服务端配置**：减少后端复杂性
- ✅ **实时转换**：用户切换时区时自动更新
- ✅ **离线支持**：前端可以独立处理时间转换

### 3. 传输格式：ISO 8601 UTC

所有时间在前后端传输时使用 ISO 8601 UTC 格式：

```
2026-01-15T10:30:45.123Z
```

---

## 数据库配置

### Drizzle ORM 配置

所有时间字段都已配置为 `timestamptz`：

```typescript
// ✅ 正确 - 所有时间字段都使用 timestamptz
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  userType: userTypeEnum("user_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const talents = pgTable("talents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  realName: varchar("real_name", { length: 50 }).notNull(),
  birthDate: timestamp("birth_date", { withTimezone: true }),
  // ... 其他字段
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const jobPositions = pgTable("job_positions", {
  id: serial("id").primaryKey(),
  // ... 其他字段
  publishedAt: timestamp("published_at", { withTimezone: true }),
  expiredAt: timestamp("expired_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  talentId: integer("talent_id").notNull(),
  jobPositionId: integer("job_position_id").notNull(),
  status: applicationStatusEnum("status").default("pending"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  replyAt: timestamp("reply_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### Supabase SQL 配置

所有时间字段都使用 `TIMESTAMPTZ`：

```sql
-- ✅ 正确 - 所有时间字段都使用 TIMESTAMPTZ
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE talents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  real_name VARCHAR(50) NOT NULL,
  birth_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_positions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  position_name VARCHAR(100) NOT NULL,
  published_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  talent_id INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  job_position_id INTEGER NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMPTZ,
  reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 后端处理

### Server Actions 中的时间处理

```typescript
// src/server/actions/jobs.ts
"use server";

import { db } from "@/lib/db";
import { jobPositions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 发布职位
 * 返回的时间字段会自动转换为 ISO 8601 UTC 格式
 */
export async function publishJob(data: CreateJobInput) {
  const now = new Date(); // JavaScript Date 对象
  
  const [job] = await db
    .insert(jobPositions)
    .values({
      companyId: data.companyId,
      positionName: data.positionName,
      description: data.description,
      industryLevel1Id: data.industryLevel1Id,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      cityId: data.cityId,
      status: "published",
      publishedAt: now, // Drizzle 会自动转换为 UTC 存储
      expiredAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
    })
    .returning();
  
  // job.publishedAt 会是一个 Date 对象，表示 UTC 时间
  // 当序列化为 JSON 时，会自动转换为 ISO 8601 格式
  return job;
}

/**
 * 获取职位详情
 * 返回的时间字段已经是 UTC 时间
 */
export async function getJobById(id: number) {
  const [job] = await db
    .select()
    .from(jobPositions)
    .where(eq(jobPositions.id, id));
  
  if (!job) {
    throw new NotFoundError("Job");
  }
  
  // job.publishedAt 和 job.expiredAt 都是 UTC 时间
  return job;
}

/**
 * 更新职位状态
 */
export async function updateJobStatus(id: number, status: JobStatus) {
  const [job] = await db
    .update(jobPositions)
    .set({
      status,
      updatedAt: new Date(), // 自动转换为 UTC
    })
    .where(eq(jobPositions.id, id))
    .returning();
  
  return job;
}

/**
 * 企业回复职位申请
 */
export async function replyToApplication(
  applicationId: number,
  status: "accepted" | "rejected",
  reply: string,
) {
  const now = new Date();
  
  const [application] = await db
    .update(applications)
    .set({
      status,
      companyReply: reply,
      reviewedAt: now, // UTC 时间
      replyAt: now, // UTC 时间
      updatedAt: now,
    })
    .where(eq(applications.id, applicationId))
    .returning();
  
  return application;
}
```

### API 路由中的时间处理

```typescript
// src/app/api/jobs/route.ts
import { getJobs } from "@/server/queries/jobs";

export async function GET(request: Request) {
  try {
    const jobs = await getJobs();
    
    // 数据会自动序列化为 JSON
    // 时间字段会自动转换为 ISO 8601 UTC 格式
    return Response.json(jobs);
  } catch (error) {
    return Response.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 },
    );
  }
}

// 响应示例：
// {
//   "id": 1,
//   "positionName": "高级前端工程师",
//   "publishedAt": "2026-01-15T10:30:45.123Z",
//   "expiredAt": "2026-02-14T10:30:45.123Z",
//   "createdAt": "2026-01-15T10:30:45.123Z",
//   "updatedAt": "2026-01-15T10:30:45.123Z"
// }
```

---

## 前端处理

### 1. 基础时间工具函数

```typescript
// src/lib/datetime.ts
/**
 * 将 ISO 8601 UTC 时间字符串转换为本地时间字符串
 * @param isoString - ISO 8601 UTC 时间字符串 (如: "2026-01-15T10:30:45.123Z")
 * @returns 格式化的本地时间字符串
 */
export function formatLocalDateTime(isoString: string | Date): string {
  const date = new Date(isoString);
  
  // 使用用户浏览器的本地设置
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地日期字符串
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 格式化的本地日期字符串 (如: "2026-01-15")
 */
export function formatLocalDate(isoString: string | Date): string {
  const date = new Date(isoString);
  
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地时间字符串
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 格式化的本地时间字符串 (如: "10:30:45")
 */
export function formatLocalTime(isoString: string | Date): string {
  const date = new Date(isoString);
  
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 获取相对时间字符串 (如: "2小时前", "3天前")
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 相对时间字符串
 */
export function getRelativeTime(isoString: string | Date): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return "刚刚";
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}周前`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)}月前`;
  } else {
    return `${Math.floor(diffDays / 365)}年前`;
  }
}

/**
 * 判断时间是否已过期
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 是否已过期
 */
export function isExpired(isoString: string | Date): boolean {
  const date = new Date(isoString);
  return date < new Date();
}

/**
 * 获取距离指定时间的剩余时间
 * @param isoString - ISO 8601 UTC 时间字符串
 * @returns 剩余时间对象 { days, hours, minutes, seconds }
 */
export function getTimeRemaining(isoString: string | Date) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const hours = Math.floor((diffMs / 1000 / 60 / 60) % 24);
  const days = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  
  return { days, hours, minutes, seconds, isExpired: false };
}
```

### 2. React 组件中的时间显示

```typescript
// src/components/job-card.tsx
"use client";

import { formatLocalDateTime, getRelativeTime, isExpired } from "@/lib/datetime";
import type { JobPosition } from "@/types/job";

interface JobCardProps {
  job: JobPosition;
}

export function JobCard({ job }: JobCardProps) {
  const isJobExpired = isExpired(job.expiredAt);
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-gray-900">{job.positionName}</h3>
      
      <p className="mt-2 text-sm text-gray-600">{job.description}</p>
      
      <div className="mt-4 flex flex-col gap-2">
        {/* 发布时间 - 显示相对时间 */}
        <div className="text-xs text-gray-500">
          发布于 {getRelativeTime(job.publishedAt)}
        </div>
        
        {/* 过期时间 - 显示绝对时间和状态 */}
        <div className={`text-xs ${isJobExpired ? "text-red-600" : "text-green-600"}`}>
          {isJobExpired ? (
            <span>已过期</span>
          ) : (
            <span>截止时间：{formatLocalDateTime(job.expiredAt)}</span>
          )}
        </div>
        
        {/* 创建时间 - 显示完整时间 */}
        <div className="text-xs text-gray-400">
          创建于 {formatLocalDateTime(job.createdAt)}
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          disabled={isJobExpired}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isJobExpired ? "职位已过期" : "申请职位"}
        </button>
      </div>
    </div>
  );
}
```

### 3. 应聘状态显示

```typescript
// src/components/application-status.tsx
"use client";

import { formatLocalDateTime, getRelativeTime } from "@/lib/datetime";
import type { Application } from "@/types/application";

interface ApplicationStatusProps {
  application: Application;
}

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  const statusLabels = {
    pending: "待审核",
    reviewed: "已审核",
    accepted: "已接受",
    rejected: "已拒绝",
    withdrawn: "已撤回",
  };
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-800",
  };
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">应聘状态</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[application.status]}`}>
          {statusLabels[application.status]}
        </span>
      </div>
      
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        {/* 应聘时间 */}
        <div>
          <span className="font-medium">应聘时间：</span>
          <span>{formatLocalDateTime(application.appliedAt)}</span>
          <span className="ml-2 text-gray-400">({getRelativeTime(application.appliedAt)})</span>
        </div>
        
        {/* 审核时间 */}
        {application.reviewedAt && (
          <div>
            <span className="font-medium">审核时间：</span>
            <span>{formatLocalDateTime(application.reviewedAt)}</span>
          </div>
        )}
        
        {/* 回复时间 */}
        {application.replyAt && (
          <div>
            <span className="font-medium">回复时间：</span>
            <span>{formatLocalDateTime(application.replyAt)}</span>
          </div>
        )}
        
        {/* 企业回复 */}
        {application.companyReply && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-gray-700">{application.companyReply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. 倒计时组件

```typescript
// src/components/countdown-timer.tsx
"use client";

import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/datetime";

interface CountdownTimerProps {
  expiredAt: string | Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiredAt, onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(expiredAt)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiredAt);
      setTimeRemaining(remaining);
      
      if (remaining.isExpired && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expiredAt, onExpire]);
  
  if (timeRemaining.isExpired) {
    return <span className="text-red-600 font-medium">已过期</span>;
  }
  
  return (
    <span className="text-orange-600 font-medium">
      剩余时间：{timeRemaining.days}天 {timeRemaining.hours}小时 {timeRemaining.minutes}分钟
    </span>
  );
}
```

### 5. 使用 React Query 的完整示例

```typescript
// src/components/job-list.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { formatLocalDateTime, getRelativeTime } from "@/lib/datetime";

export function JobList() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/jobs");
      return response.json();
    },
  });
  
  if (isLoading) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="space-y-4">
      {jobs?.map((job) => (
        <div key={job.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-gray-900">{job.positionName}</h3>
          
          {/* 时间信息 - 自动根据用户浏览器时区显示 */}
          <div className="mt-2 text-sm text-gray-500">
            <p>发布于 {getRelativeTime(job.publishedAt)}</p>
            <p>截止时间：{formatLocalDateTime(job.expiredAt)}</p>
          </div>
          
          <p className="mt-3 text-gray-600">{job.description}</p>
          
          <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            申请职位
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 6. 使用 dayjs 库（可选）

如果需要更强大的日期处理功能，可以使用 dayjs：

```bash
pnpm add dayjs
```

```typescript
// src/lib/datetime-dayjs.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

/**
 * 将 ISO 8601 UTC 时间字符串转换为本地时间字符串
 */
export function formatLocalDateTime(isoString: string | Date): string {
  return dayjs(isoString).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * 获取相对时间字符串
 */
export function getRelativeTime(isoString: string | Date): string {
  return dayjs(isoString).fromNow();
}

/**
 * 获取特定时区的时间
 */
export function formatInTimezone(
  isoString: string | Date,
  timezone: string
): string {
  return dayjs(isoString).tz(timezone).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * 判断时间是否已过期
 */
export function isExpired(isoString: string | Date): boolean {
  return dayjs(isoString).isBefore(dayjs());
}
```

---

## 常见场景

### 场景 1：显示职位发布时间

```typescript
// 后端返回
{
  "id": 1,
  "positionName": "高级前端工程师",
  "publishedAt": "2026-01-15T10:30:45.123Z"
}

// 前端显示
<div>发布于 {getRelativeTime(job.publishedAt)}</div>
// 输出：发布于 2小时前
```

### 场景 2：显示职位截止时间

```typescript
// 后端返回
{
  "id": 1,
  "positionName": "高级前端工程师",
  "expiredAt": "2026-02-14T10:30:45.123Z"
}

// 前端显示
<div>截止时间：{formatLocalDateTime(job.expiredAt)}</div>
// 输出：截止时间：2026-02-14 18:30:45 (用户本地时间)
```

### 场景 3：显示应聘状态时间线

```typescript
// 后端返回
{
  "id": 1,
  "status": "accepted",
  "appliedAt": "2026-01-15T10:30:45.123Z",
  "reviewedAt": "2026-01-15T11:00:00.000Z",
  "replyAt": "2026-01-15T11:05:00.000Z"
}

// 前端显示
<div>
  <p>应聘时间：{formatLocalDateTime(app.appliedAt)}</p>
  <p>审核时间：{formatLocalDateTime(app.reviewedAt)}</p>
  <p>回复时间：{formatLocalDateTime(app.replyAt)}</p>
</div>
```

### 场景 4：显示职位倒计时

```typescript
// 前端显示
<CountdownTimer 
  expiredAt={job.expiredAt} 
  onExpire={() => {
    // 职位已过期，刷新列表
    refetchJobs();
  }}
/>
// 输出：剩余时间：15天 3小时 45分钟
```

---

## 最佳实践总结

### ✅ 数据库层

- 所有时间字段使用 `timestamptz`
- 使用 `defaultNow()` 自动设置创建时间
- 使用触发器自动更新 `updatedAt`

### ✅ 后端层

- 使用 JavaScript `Date` 对象处理时间
- 让 Drizzle ORM 自动处理时间转换
- 返回 ISO 8601 UTC 格式的时间

### ✅ 前端层

- 接收 ISO 8601 UTC 格式的时间
- 使用 JavaScript `Date` 对象或 dayjs 处理时间
- 使用 `toLocaleString()` 或 dayjs 显示本地时间
- 根据用户浏览器设置自动显示时区

### ✅ 传输层

- 所有时间使用 ISO 8601 UTC 格式
- 不要在 API 中进行时区转换
- 让前端根据用户设置显示时间

---

## 故障排除

### 问题 1：时间显示不正确

**原因**：可能在后端进行了时区转换

**解决方案**：
- 确保数据库字段使用 `timestamptz`
- 不要在后端进行时区转换
- 让前端根据用户浏览器设置显示时间

### 问题 2：时间相差几个小时

**原因**：可能使用了 `TIMESTAMP` 而不是 `TIMESTAMPTZ`

**解决方案**：
- 检查数据库字段类型
- 迁移到 `TIMESTAMPTZ`
- 重新运行数据库迁移

### 问题 3：不同用户看到的时间不同

**这是正常的！**

- 不同用户在不同时区
- 前端会根据用户浏览器的时区自动显示
- 这是预期的行为

### 问题 4：时间戳精度丢失

**原因**：JavaScript `Date` 对象精度为毫秒

**解决方案**：
- 如果需要更高精度，使用 BigInt 时间戳
- 或使用 dayjs 等库处理

---

## 代码检查清单

在提交代码前，确保：

- [ ] 所有时间字段使用 `timestamptz`
- [ ] 后端返回 ISO 8601 UTC 格式的时间
- [ ] 前端使用 `formatLocalDateTime()` 显示时间
- [ ] 没有在后端进行时区转换
- [ ] 没有硬编码时区信息
- [ ] 使用了相对时间显示（如"2小时前"）
- [ ] 倒计时功能正常工作
- [ ] 不同时区的用户显示正确的时间

---

## 参考资源

- [PostgreSQL timestamptz 文档](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [JavaScript Date 对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [ISO 8601 标准](https://en.wikipedia.org/wiki/ISO_8601)
- [dayjs 文档](https://day.js.org/)
- [Supabase 时间处理指南](https://supabase.com/docs/guides/database/database-basics)

---

**最后更新**：2026年1月

**维护者**：开发团队
