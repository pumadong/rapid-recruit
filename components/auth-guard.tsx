"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenValid } from "@/lib/auth-client";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 客户端认证守卫组件
 * 检查是否有 token，如果没有则重定向到登录页
 * 
 * 注意：使用 useState 和 useEffect 避免 hydration mismatch
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 只在客户端执行
    // 添加小延迟确保 localStorage 已完全加载
    const checkAuth = () => {
      console.log("AuthGuard: Checking authentication...");
      const token = getToken();
      console.log("AuthGuard: Token exists:", !!token);
      
      if (!token) {
        console.log("AuthGuard: No token found, redirecting to login");
        router.push("/login");
        setIsAuthenticated(false);
        return;
      }

      // 检查 token 是否有效（客户端检查，不验证签名）
      const isValid = isTokenValid();
      console.log("AuthGuard: Token valid:", isValid);
      
      if (!isValid) {
        console.log("AuthGuard: Token invalid or expired, redirecting to login");
        const { removeToken } = require("@/lib/auth-client");
        removeToken();
        router.push("/login");
        setIsAuthenticated(false);
        return;
      }

      console.log("AuthGuard: Token found and valid");
      setIsAuthenticated(true);
    };

    // 延迟检查，确保 localStorage 已完全加载
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // 首次渲染时返回 null，避免 hydration mismatch
  // 客户端挂载后会通过 useEffect 检查并更新状态
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  // 如果没有 token，返回 null（等待重定向）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

