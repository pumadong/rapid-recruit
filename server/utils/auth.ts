/**
 * Server Actions 认证工具
 * 用于在 Server Actions 中验证 token
 */

import { verifyToken } from "@/lib/token";

/**
 * 从 token 字符串中获取用户 ID
 * 用于 Server Actions（token 从客户端传递）
 */
export function getUserIdFromToken(token: string | null | undefined): number | null {
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return payload.userId;
}

/**
 * 从 token 字符串中获取用户类型
 */
export function getUserTypeFromToken(token: string | null | undefined): "talent" | "company" | null {
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return payload.userType;
}

