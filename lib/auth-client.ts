/**
 * 客户端认证工具
 * 用于在客户端存储和管理 JWT Token
 * 
 * 安全注意事项：
 * 1. localStorage 容易受到 XSS 攻击，但考虑到用户要求使用 token 而非 cookie
 * 2. 建议在生产环境中实现以下安全措施：
 *    - 使用 Content Security Policy (CSP) 防止 XSS
 *    - 实现 token 自动刷新机制
 *    - 在敏感操作时要求重新验证
 *    - 实现 token 黑名单机制（登出时）
 */

const TOKEN_KEY = "auth_token";

/**
 * 保存 Token 到 localStorage
 * 
 * 安全建议：
 * - 考虑使用 httpOnly cookie（但需要后端支持）
 * - 或者使用 sessionStorage（关闭标签页后自动清除）
 * - 实现 token 加密存储（使用 Web Crypto API）
 */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save token to localStorage:", error);
      // 如果 localStorage 不可用（如隐私模式），可以考虑使用 sessionStorage
      if (error instanceof DOMException && error.code === 22) {
        console.warn("localStorage is full or disabled, trying sessionStorage");
        try {
          sessionStorage.setItem(TOKEN_KEY, token);
        } catch (sessionError) {
          console.error("Failed to save token to sessionStorage:", sessionError);
        }
      }
    }
  }
}

/**
 * 从 localStorage 获取 Token
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      // 优先从 localStorage 读取
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        return token;
      }
      // 如果 localStorage 没有，尝试从 sessionStorage 读取
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get token from storage:", error);
      return null;
    }
  }
  return null;
}

/**
 * 删除 Token
 */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }
}

/**
 * 获取 Authorization Header 值
 */
export function getAuthHeader(): string | null {
  const token = getToken();
  if (!token) {
    return null;
  }
  return `Bearer ${token}`;
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * 检查 Token 是否有效（客户端检查，不验证签名）
 * 注意：真正的验证必须在服务端进行
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  try {
    // 简单检查 token 格式（JWT 包含两个点）
    if (token.split(".").length !== 3) {
      return false;
    }

    // 检查是否过期（客户端解码，不验证签名）
    const { decodeToken } = require("@/lib/token");
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const expirationTime = decoded.exp * 1000;
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
}
