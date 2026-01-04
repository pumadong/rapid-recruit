import { headers } from "next/headers";
import { getUserById } from "./users";
import { getTalentByUserId } from "./users";
import { getCompanyByUserId } from "./users";
import { verifyToken, extractTokenFromHeader } from "@/lib/token";

/**
 * 从请求头中获取当前登录用户 ID
 * @returns 用户ID或null
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    if (!authHeader) {
      return null;
    }

    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    return payload.userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * 获取当前登录用户信息（不含密码）
 */
export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return null;
  }
  
  return await getUserById(userId);
}

/**
 * 获取当前登录用户的完整信息（包括人才或企业信息）
 */
export async function getCurrentUserWithProfile() {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return null;
  }
  
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }
  
  if (user.userType === "talent") {
    const talent = await getTalentByUserId(userId);
    return { user, talent };
  } else {
    const company = await getCompanyByUserId(userId);
    return { user, company };
  }
}

/**
 * 获取当前登录用户的显示名称
 */
export async function getCurrentUserName(): Promise<string | null> {
  const userProfile = await getCurrentUserWithProfile();
  
  if (!userProfile) {
    return null;
  }
  
  if (userProfile.user.userType === "talent" && userProfile.talent) {
    return userProfile.talent.realName;
  } else if (userProfile.user.userType === "company" && userProfile.company) {
    return userProfile.company.companyName;
  }
  
  // 如果没有名称，返回手机号
  return userProfile.user.phone;
}

/**
 * 从请求头中获取 Token Payload（用于 Server Actions）
 * 注意：Server Actions 无法直接访问 headers()，需要从客户端传递 token
 * 这个函数主要用于 Server Components
 */
export async function getTokenPayload() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    console.log("getTokenPayload: Authorization header:", authHeader ? `${authHeader.substring(0, 20)}...` : "missing");
    
    if (!authHeader) {
      console.log("getTokenPayload: No authorization header");
      return null;
    }

    const token = extractTokenFromHeader(authHeader);
    console.log("getTokenPayload: Extracted token:", token ? `${token.substring(0, 20)}...` : "null");
    
    if (!token) {
      console.log("getTokenPayload: Failed to extract token from header");
      return null;
    }

    const payload = verifyToken(token);
    console.log("getTokenPayload: Verified payload:", payload ? `userId=${payload.userId}, userType=${payload.userType}` : "null");
    return payload;
  } catch (error) {
    console.error("getTokenPayload: Error getting token payload:", error);
    return null;
  }
}
