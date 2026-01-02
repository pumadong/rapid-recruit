# 快捷招聘平台 - 安全最佳实践指南

## 📋 目录

1. [安全架构概述](#安全架构概述)
2. [RLS 配置](#rls-配置)
3. [后端安全](#后端安全)
4. [前端安全](#前端安全)
5. [认证和授权](#认证和授权)
6. [数据保护](#数据保护)
7. [部署安全](#部署安全)
8. [监控和审计](#监控和审计)
9. [常见漏洞防护](#常见漏洞防护)
10. [安全检查清单](#安全检查清单)

---

## 安全架构概述

### 模式 A：经典后端转发（推荐）

```
┌─────────────┐
│   前端      │
│ (浏览器)    │
└──────┬──────┘
       │ HTTPS
       │ (API 调用)
       ▼
┌─────────────────────────────────────┐
│   后端 (Next.js)                    │
│ - 认证验证                          │
│ - 权限检查                          │
│ - 数据验证                          │
│ - 业务逻辑                          │
└──────┬──────────────────────────────┘
       │ 使用 service_role key
       │ (内部连接)
       ▼
┌─────────────────────────────────────┐
│   Supabase (PostgreSQL)             │
│ - RLS 启用                          │
│ - 所有表都有 DENY 策略              │
│ - 审计日志                          │
│ - 备份和恢复                        │
└─────────────────────────────────────┘
```

### 安全特点

✅ **前端无法直连数据库**
- 前端使用的 anon key 受 RLS 限制
- 所有表都有 DENY 策略
- 前端无法访问任何数据

✅ **后端完全控制数据访问**
- 后端使用 service_role key（超级权限）
- 后端可以绕过 RLS
- 后端负责权限检查和数据验证

✅ **多层防护**
- 网络层：HTTPS 加密
- 应用层：认证和授权
- 数据库层：RLS 和审计日志

---

## RLS 配置

### 什么是 RLS？

Row Level Security (RLS) 是 PostgreSQL 的行级安全功能，可以限制用户对表中行的访问。

### 启用 RLS

```sql
-- 启用表的 RLS
ALTER TABLE "table_name" ENABLE ROW LEVEL SECURITY;

-- 验证 RLS 启用状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 创建 Policy

对于模式 A（后端转发），我们使用默认 DENY 策略：

```sql
-- 创建默认 DENY 策略
CREATE POLICY "table_deny_all" ON "table_name"
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);
```

### Policy 说明

| 参数 | 说明 |
|------|------|
| RESTRICTIVE | 限制性策略（拒绝访问） |
| FOR ALL | 适用于所有操作（SELECT、INSERT、UPDATE、DELETE） |
| TO public | 适用于所有用户 |
| USING (false) | 读取条件：总是 false（拒绝读取） |
| WITH CHECK (false) | 写入条件：总是 false（拒绝写入） |

### service_role key 的特殊性

```
service_role key 的权限：
┌─────────────────────────────────────┐
│ 可以绕过所有 RLS Policy             │
│ 可以访问所有表和行                  │
│ 可以执行所有操作（CRUD）            │
│ 绝对不能暴露给前端                  │
└─────────────────────────────────────┘
```

---

## 后端安全

### 1. 环境变量管理

```bash
# .env.local（绝对不要提交到 Git）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 仅在服务器上使用
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your-jwt-secret
```

### 2. .gitignore 配置

```bash
# .gitignore
.env.local
.env.*.local
*.pem
*.key
.DS_Store
node_modules/
.next/
dist/
build/
```

### 3. 认证中间件

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 跳过公开路由
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 验证 API 请求
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    // 验证 token 的有效性
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

### 4. 输入验证

```typescript
// src/lib/validation.ts
import { z } from "zod";

// 定义验证 schema
export const createUserSchema = z.object({
  phone: z.string().regex(/^\d{10,11}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["talent", "company"]),
});

// 在 API 路由中使用
export async function POST(request: NextRequest) {
  const body = await request.json();

  // 验证输入
  const result = createUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error },
      { status: 400 }
    );
  }

  const { phone, password, userType } = result.data;
  // 继续处理...
}
```

### 5. 密码安全

```typescript
// src/lib/crypto.ts
import bcrypt from "bcrypt";

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // 增加轮数提高安全性
  return bcrypt.hash(password, saltRounds);
}

// 验证密码
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 在创建用户时使用
const hashedPassword = await hashPassword(userPassword);
await db.insert(users).values({
  phone,
  password: hashedPassword, // 存储哈希值，不是明文
  userType,
});
```

### 6. 敏感字段过滤

```typescript
// 不要返回密码给前端
export async function GET(request: NextRequest) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  // ❌ 错误：返回了密码
  // return NextResponse.json(user);

  // ✅ 正确：过滤敏感字段
  const safeUser = {
    id: user.id,
    phone: user.phone,
    userType: user.userType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // 不包含 password 字段
  };

  return NextResponse.json(safeUser);
}
```

### 7. 错误处理

```typescript
// 不要暴露内部错误信息
export async function POST(request: NextRequest) {
  try {
    // 业务逻辑...
  } catch (error) {
    // ❌ 错误：暴露了内部错误
    // return NextResponse.json({ error: error.message }, { status: 500 });

    // ✅ 正确：返回通用错误信息
    console.error("Internal error:", error); // 记录到服务器日志
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 前端安全

### 1. 不要暴露敏感信息

```typescript
// ❌ 错误：暴露了 service_role key
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ 正确：只使用 anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### 2. 安全存储 Token

```typescript
// src/lib/auth-client.ts
// 使用 httpOnly cookie 存储 token（由后端设置）
// 前端无法通过 JavaScript 访问 httpOnly cookie

// 在后端设置 cookie
response.cookies.set({
  name: "auth-token",
  value: token,
  httpOnly: true, // 前端 JavaScript 无法访问
  secure: true, // 仅通过 HTTPS 发送
  sameSite: "strict", // 防止 CSRF
  maxAge: 7 * 24 * 60 * 60, // 7 天
});
```

### 3. 防止 XSS 攻击

```typescript
// ❌ 错误：直接插入 HTML
function UserProfile({ user }) {
  return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
}

// ✅ 正确：React 自动转义
function UserProfile({ user }) {
  return <div>{user.bio}</div>;
}
```

### 4. CSRF 防护

```typescript
// 后端自动处理 CSRF token
// Next.js 在 POST 请求中自动验证 CSRF token

// 前端发送请求时自动包含 CSRF token
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
  // CSRF token 自动在 cookie 中发送
});
```

### 5. 安全的 API 调用

```typescript
// src/lib/api-client.ts
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await getAuthToken(); // 从 cookie 获取

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// 使用示例
const user = await apiCall("/api/users/1");
```

---

## 认证和授权

### 1. JWT Token 管理

```typescript
// src/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";

// 生成 token
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// 验证 token
export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}
```

### 2. 权限检查

```typescript
// src/server/auth.ts
export async function checkPermission(
  userId: number,
  resourceId: number,
  action: string
): Promise<boolean> {
  // 获取用户信息
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return false;

  // 检查权限
  switch (action) {
    case "read_own_profile":
      return userId === resourceId;
    case "update_own_profile":
      return userId === resourceId;
    case "delete_own_profile":
      return userId === resourceId;
    case "admin_action":
      return user.userType === "admin"; // 如果有管理员角色
    default:
      return false;
  }
}
```

### 3. 在 API 路由中使用

```typescript
// src/app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 验证认证
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. 验证权限
  const resourceId = parseInt(params.id);
  const hasPermission = await checkPermission(userId, resourceId, "read_own_profile");

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. 执行操作
  const user = await db.query.users.findFirst({
    where: eq(users.id, resourceId),
  });

  return NextResponse.json(user);
}
```

---

## 数据保护

### 1. 加密敏感数据

```typescript
// src/lib/encryption.ts
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryptData(encrypted: string): string {
  const [ivHex, encryptedHex] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### 2. 审计日志

```typescript
// src/server/audit.ts
export async function logAudit(
  tableName: string,
  operation: string,
  recordId: number,
  userId: number,
  changes: Record<string, any>
) {
  await db.insert(auditLogs).values({
    tableName,
    operation,
    recordId,
    userId,
    changes: JSON.stringify(changes),
    createdAt: new Date(),
  });
}

// 在数据修改时调用
export async function updateUser(userId: number, updates: Record<string, any>) {
  const oldUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const newUser = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();

  // 记录审计日志
  await logAudit("users", "UPDATE", userId, getCurrentUserId(), {
    before: oldUser,
    after: newUser[0],
  });

  return newUser[0];
}
```

### 3. 数据备份

```bash
# 定期备份数据库
# 在 Supabase 控制台中配置自动备份

# 手动备份
pg_dump -h your-host -U postgres -d your-db > backup.sql

# 恢复备份
psql -h your-host -U postgres -d your-db < backup.sql
```

---

## 部署安全

### 1. HTTPS 配置

```typescript
// next.config.js
module.exports = {
  // 强制 HTTPS
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://:host/:path*",
        permanent: true,
      },
    ];
  },
};
```

### 2. CORS 配置

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 只允许特定域名
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ];

  const origin = request.headers.get("origin");

  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}
```

### 3. 速率限制

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 每小时 10 次请求
});

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const { success } = await ratelimit.limit(identifier);
  return success;
}

// 在 API 路由中使用
export async function POST(request: NextRequest) {
  const ip = request.ip || "unknown";
  const allowed = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // 继续处理...
}
```

### 4. 安全头部

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

---

## 监控和审计

### 1. 日志记录

```typescript
// src/lib/logger.ts
export function logInfo(message: string, data?: any) {
  console.log(`[INFO] ${new Date().toISOString()} ${message}`, data);
}

export function logError(message: string, error?: any) {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
}

export function logWarning(message: string, data?: any) {
  console.warn(`[WARNING] ${new Date().toISOString()} ${message}`, data);
}

// 使用示例
logInfo("User login", { userId: 123 });
logError("Database connection failed", error);
```

### 2. 监控关键指标

```typescript
// src/lib/metrics.ts
export const metrics = {
  loginAttempts: 0,
  failedLogins: 0,
  apiErrors: 0,
  databaseErrors: 0,
};

// 记录登录尝试
export function recordLoginAttempt(success: boolean) {
  metrics.loginAttempts++;
  if (!success) {
    metrics.failedLogins++;
  }
}

// 定期检查异常
setInterval(() => {
  if (metrics.failedLogins > 10) {
    logWarning("High number of failed login attempts", metrics);
  }
}, 60000);
```

### 3. 审计日志查询

```sql
-- 查看最近的审计日志
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 100;

-- 查看特定用户的操作
SELECT * FROM audit_logs
WHERE user_id = 123
ORDER BY created_at DESC;

-- 查看特定表的修改
SELECT * FROM audit_logs
WHERE table_name = 'users'
ORDER BY created_at DESC;
```

---

## 常见漏洞防护

### 1. SQL 注入

```typescript
// ❌ 错误：容易被 SQL 注入
const query = `SELECT * FROM users WHERE phone = '${phone}'`;

// ✅ 正确：使用参数化查询
const user = await db.query.users.findFirst({
  where: eq(users.phone, phone),
});
```

### 2. XSS 攻击

```typescript
// ❌ 错误：直接使用 dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 正确：React 自动转义
<div>{userInput}</div>
```

### 3. CSRF 攻击

```typescript
// ✅ 正确：Next.js 自动处理 CSRF
// POST 请求会自动验证 CSRF token

// 如果需要手动处理：
import { csrf } from "@edge-csrf/nextjs";

export const middleware = csrf();
```

### 4. 暴力破解

```typescript
// 实现登录尝试限制
const loginAttempts = new Map<string, number>();

export async function login(phone: string, password: string) {
  const attempts = loginAttempts.get(phone) || 0;

  if (attempts > 5) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  // 验证密码...
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    loginAttempts.set(phone, attempts + 1);
    throw new Error("Invalid credentials");
  }

  loginAttempts.delete(phone);
  return user;
}
```

### 5. 信息泄露

```typescript
// ❌ 错误：暴露内部错误信息
return NextResponse.json(
  { error: error.message },
  { status: 500 }
);

// ✅ 正确：返回通用错误信息
console.error("Internal error:", error);
return NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);
```

---

## 安全检查清单

### 部署前检查

- [ ] **环境变量**
  - [ ] DATABASE_URL 已设置
  - [ ] SUPABASE_SERVICE_ROLE_KEY 已设置（仅服务器）
  - [ ] JWT_SECRET 已设置
  - [ ] ENCRYPTION_KEY 已设置
  - [ ] .env.local 已添加到 .gitignore

- [ ] **RLS 配置**
  - [ ] 所有 12 个表都已启用 RLS
  - [ ] 所有表都有 DENY 策略
  - [ ] 验证查询返回正确结果

- [ ] **后端安全**
  - [ ] 所有 API 路由都有认证检查
  - [ ] 所有 API 路由都有权限检查
  - [ ] 所有输入都进行了验证
  - [ ] 敏感字段不返回给前端
  - [ ] 错误信息不暴露内部细节

- [ ] **前端安全**
  - [ ] 前端不包含 service_role key
  - [ ] 前端不直接查询数据库
  - [ ] 所有数据访问都通过后端 API
  - [ ] Token 安全存储在 httpOnly cookie

- [ ] **数据保护**
  - [ ] 密码使用 bcrypt 哈希
  - [ ] 敏感数据使用加密
  - [ ] 审计日志已启用
  - [ ] 备份策略已配置

- [ ] **部署安全**
  - [ ] 使用 HTTPS
  - [ ] CORS 配置正确
  - [ ] 速率限制已启用
  - [ ] 安全头部已配置

- [ ] **监控和审计**
  - [ ] 日志记录已启用
  - [ ] 关键指标已监控
  - [ ] 审计日志可查询
  - [ ] 告警规则已配置

---

## 常见问题

**Q: 为什么要在后端进行权限检查？**
A: 因为前端代码可以被用户修改。权限检查必须在后端进行，确保安全性。

**Q: 如果 service_role key 被泄露怎么办？**
A: 立即在 Supabase 控制台重新生成 key。更新所有服务器上的环境变量。

**Q: 可以在前端使用 anon key 直连数据库吗？**
A: 不推荐。虽然 RLS 会阻止访问，但最好的做法是通过后端 API。

**Q: 如何处理 CORS 错误？**
A: 在后端配置正确的 CORS 头部。只允许特定域名访问。

**Q: 如何防止暴力破解？**
A: 实现登录尝试限制、速率限制和账户锁定机制。

---

## 参考资源

- [Supabase 安全文档](https://supabase.com/docs/guides/auth)
- [OWASP 安全指南](https://owasp.org/www-project-top-ten/)
- [Next.js 安全最佳实践](https://nextjs.org/docs/advanced-features/security)
- [PostgreSQL RLS 文档](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## 更新日志

- **2026-01-15**：初版发布
- 定期更新安全建议和最佳实践

---

**最后更新**：2026-01-15
**维护者**：快捷招聘平台安全团队
