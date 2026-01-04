"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "./header";
import { usePathname } from "next/navigation";
import { getAuthHeader, getToken } from "@/lib/auth-client";

interface CurrentUser {
  id: number;
  userName: string | null;
  userType: "talent" | "company";
}

/**
 * 从 token 中快速提取用户信息（客户端解码，不验证签名）
 * 用于立即显示用户状态，避免等待 API 响应
 */
function getQuickUserInfo(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    // 快速解码 token（不验证签名）
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // 解码 payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decodedStr = atob(padded);
    const decoded = JSON.parse(decodedStr);

    // 检查是否过期
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    // 返回基本信息（用户名稍后从 API 获取）
    return {
      id: decoded.userId,
      userName: null, // 先显示 null，等待 API 返回真实用户名
      userType: decoded.userType,
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function HeaderClient() {
  const pathname = usePathname();
  
  // 立即从 token 中提取用户信息（用于快速显示）
  const quickUser = useMemo(() => getQuickUserInfo(), []);
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(quickUser);

  const fetchUser = useCallback(async () => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setCurrentUser(null);
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      };
      
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers,
      });
      
      if (!response.ok) {
        setCurrentUser(null);
        return;
      }
      
      const data = await response.json();
      
      // 只有在响应成功时才更新状态
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    // 立即开始获取用户信息，不使用延迟
    // 如果已经有 quickUser，先显示它，然后异步更新用户名
    fetchUser();
  }, [fetchUser, pathname]); // 当路径变化时重新获取用户信息

  return <Header currentUser={currentUser} />;
}

