/**
 * 快捷招聘平台 - 后端安全连接配置
 * 
 * 安全架构：模式 A（经典后端转发 - 最安全）
 * 
 * 配置说明：
 * - 后端使用 service_role key 连接 Supabase
 * - service_role key 具有超级权限，可绕过 RLS
 * - 前端无法访问 service_role key
 * - 所有数据访问都通过后端 API 转发
 * 
 * 文件位置：
 * - src/lib/db.ts - 数据库连接配置
 * - src/lib/supabase-admin.ts - 管理员客户端
 * - src/server/auth.ts - 认证配置
 * - .env.local - 环境变量配置
 */

// ==================== 1. 数据库连接配置 ====================

/**
 * 文件：src/lib/db.ts
 * 说明：使用 service_role key 创建数据库连接
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// 获取数据库连接字符串
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// 创建 PostgreSQL 连接
const client = postgres(databaseUrl);

// 创建 Drizzle ORM 实例
export const db = drizzle(client, { schema });

// 导出类型
export type Database = typeof db;

// ==================== 2. Supabase 管理员客户端 ====================

/**
 * 文件：src/lib/supabase-admin.ts
 * 说明：使用 service_role key 创建 Supabase 管理员客户端
 * 
 * 用途：
 * - 用户认证管理
 * - 文件上传管理
 * - 其他需要超级权限的操作
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required"
  );
}

// 创建 Supabase 管理员客户端（使用 service_role key）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ==================== 3. 前端 Supabase 客户端 ====================

/**
 * 文件：src/lib/supabase-client.ts
 * 说明：前端使用的 Supabase 客户端
 * 
 * 注意：
 * - 前端只用于认证（登录、注册）
 * - 前端不能直接查询数据库（RLS 会阻止）
 * - 前端所有数据访问都通过后端 API
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required"
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ==================== 4. 环境变量配置 ====================

/**
 * 文件：.env.local
 * 说明：所有敏感信息都存储在环境变量中
 * 
 * 重要：
 * - 绝对不要将 SUPABASE_SERVICE_ROLE_KEY 提交到 Git
 * - 绝对不要在前端代码中使用 SUPABASE_SERVICE_ROLE_KEY
 * - 只在后端服务器上使用 SUPABASE_SERVICE_ROLE_KEY
 */

/*
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 后端专用（绝对不要暴露给前端）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# 其他配置
NODE_ENV=development
*/

// ==================== 5. 后端 API 路由示例 ====================

/**
 * 文件：src/app/api/users/route.ts
 * 说明：后端 API 路由，使用 service_role key 访问数据
 */

import { db } from "@/lib/db";
import { users, talents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/users/:id
 * 获取用户信息
 * 
 * 安全检查：
 * 1. 验证请求来自认证用户
 * 2. 验证用户有权访问该数据
 * 3. 返回数据前过滤敏感字段
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证认证状态
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const userId = await verifyToken(token); // 实现 verifyToken 函数

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. 获取用户 ID 参数
    const url = new URL(request.url);
    const targetUserId = parseInt(url.searchParams.get("id") || "");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // 3. 权限检查：用户只能查看自己的信息（或管理员可以查看所有）
    if (userId !== targetUserId) {
      // 可以添加管理员检查
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 4. 使用 service_role key 查询数据（后端自动使用）
    const user = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 5. 过滤敏感字段（不返回密码）
    const safeUser = {
      id: user.id,
      phone: user.phone,
      userType: user.userType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 创建新用户
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证认证状态
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 解析请求体
    const body = await request.json();
    const { phone, password, userType } = body;

    // 3. 数据验证
    if (!phone || !password || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["talent", "company"].includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }

    // 4. 检查用户是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 5. 哈希密码（使用 bcrypt 或其他安全方法）
    const hashedPassword = await hashPassword(password);

    // 6. 创建用户（使用 service_role key）
    const newUser = await db
      .insert(users)
      .values({
        phone,
        password: hashedPassword,
        userType,
      })
      .returning();

    // 7. 返回用户信息（不返回密码）
    return NextResponse.json(
      {
        id: newUser[0].id,
        phone: newUser[0].phone,
        userType: newUser[0].userType,
        createdAt: newUser[0].createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==================== 6. 认证中间件 ====================

/**
 * 文件：src/middleware.ts
 * 说明：验证所有 API 请求的认证状态
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // 跳过公开路由
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 验证 API 请求的认证
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 可以在这里验证 token
    // const token = authHeader.slice(7);
    // const userId = await verifyToken(token);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

// ==================== 7. 密码哈希函数 ====================

/**
 * 文件：src/lib/crypto.ts
 * 说明：密码加密和验证
 */

import bcrypt from "bcrypt";

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==================== 8. Token 验证函数 ====================

/**
 * 文件：src/lib/auth.ts
 * 说明：JWT token 验证
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * 生成 JWT token
 */
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * 验证 JWT token
 */
export function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

// ==================== 9. 数据库查询示例 ====================

/**
 * 文件：src/server/queries/users.ts
 * 说明：常用的用户查询函数
 */

import { db } from "@/lib/db";
import { users, talents, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 获取用户及其关联信息
 */
export async function getUserWithProfile(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      talent: true,
      company: true,
    },
  });

  return user;
}

/**
 * 获取所有人才
 */
export async function getAllTalents() {
  const allTalents = await db.query.talents.findMany({
    with: {
      user: true,
      city: true,
      skills: {
        with: {
          skill: true,
        },
      },
    },
  });

  return allTalents;
}

/**
 * 获取企业发布的职位
 */
export async function getCompanyJobs(companyId: number) {
  const jobs = await db.query.jobPositions.findMany({
    where: eq(jobPositions.companyId, companyId),
    with: {
      skills: {
        with: {
          skill: true,
        },
      },
      applications: true,
    },
  });

  return jobs;
}

// ==================== 10. 安全检查清单 ====================

/**
 * 部署前安全检查：
 * 
 * ✅ 环境变量检查
 * - [ ] DATABASE_URL 已设置
 * - [ ] SUPABASE_SERVICE_ROLE_KEY 已设置（仅在服务器）
 * - [ ] JWT_SECRET 已设置
 * - [ ] 所有敏感信息都在 .env.local 中
 * - [ ] .env.local 已添加到 .gitignore
 * 
 * ✅ 后端安全检查
 * - [ ] 所有 API 路由都有认证检查
 * - [ ] 所有 API 路由都有权限检查
 * - [ ] 敏感字段（密码）不返回给前端
 * - [ ] 所有输入都进行了验证
 * - [ ] 所有错误都进行了适当的处理
 * 
 * ✅ 前端安全检查
 * - [ ] 前端不包含 SUPABASE_SERVICE_ROLE_KEY
 * - [ ] 前端不直接查询数据库
 * - [ ] 前端所有数据访问都通过后端 API
 * - [ ] 前端安全存储 JWT token
 * 
 * ✅ 数据库安全检查
 * - [ ] 所有表都已启用 RLS
 * - [ ] 所有表都有 DENY 策略
 * - [ ] 审计日志已启用
 * - [ ] 定期备份已配置
 * 
 * ✅ 部署安全检查
 * - [ ] 使用 HTTPS
 * - [ ] 启用 CORS（仅允许自己的域名）
 * - [ ] 启用速率限制
 * - [ ] 启用请求验证
 * - [ ] 启用日志记录
 */
