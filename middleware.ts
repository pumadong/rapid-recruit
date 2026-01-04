import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 中间件
 * 用于在请求时从 localStorage（通过客户端）或请求头中读取 token
 * 
 * 注意：中间件无法直接访问 localStorage，但可以：
 * 1. 从请求头读取 token（如果客户端设置了）
 * 2. 从 cookie 读取 token（如果使用 cookie）
 * 3. 或者让客户端组件处理认证
 */
export function middleware(request: NextRequest) {
  // 对于 API 路由，检查 Authorization header
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // 公开的 API 路由不需要认证
    // 注意：/api/auth/profile 需要认证，所以不在公开列表中
    const publicApiRoutes = [
      "/api/auth/login",      // 登录（公开）
      "/api/auth/register",   // 注册（公开）
      "/api/provinces",       // 省份列表（公开）
      "/api/cities",          // 城市列表（公开）
      "/api/industries-level1", // 一级行业列表（公开）
      "/api/industries-level2", // 二级行业列表（公开）
      "/api/skills",          // 技能列表（公开）
      "/api/jobs",            // 职位列表（公开，GET 请求）
    ];
    
    const isPublicRoute = publicApiRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // 对于需要认证的 API 路由，检查 Authorization header
    // 但某些路由（如 /api/favorites GET）允许无 token 访问（返回默认值）
    const routesAllowNoToken = [
      "/api/favorites",  // GET 请求允许无 token（返回 isFavorite: false）
    ];
    
    const allowsNoToken = routesAllowNoToken.some(route => 
      request.nextUrl.pathname.startsWith(route) && request.method === "GET"
    );
    
    if (allowsNoToken) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // 对于页面路由，让客户端组件处理认证
  // Server Components 会通过 headers() 读取 token
  // 如果 token 不在请求头中，Server Component 会重定向到登录页
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon文件)
     * - public 文件夹中的文件
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

