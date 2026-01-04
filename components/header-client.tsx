"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "./header";
import { usePathname } from "next/navigation";
import { getAuthHeader } from "@/lib/auth-client";

interface CurrentUser {
  id: number;
  userName: string | null;
  userType: "talent" | "company";
}

export function HeaderClient() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }
      
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers,
      });
      const data = await response.json();
      setCurrentUser(data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 添加小延迟确保 localStorage 已完全加载
    const timer = setTimeout(() => {
      fetchUser();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchUser, pathname]); // 当路径变化时重新获取用户信息

  // 在加载期间，显示未登录状态的 Header（不显示用户信息）
  return <Header currentUser={currentUser} />;
}

