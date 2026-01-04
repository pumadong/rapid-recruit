import jwt from "jsonwebtoken";

/**
 * JWT Secret Key
 * 安全要求：
 * 1. 生产环境必须设置 JWT_SECRET 环境变量
 * 2. Secret 长度至少 32 个字符
 * 3. 使用强随机字符串（建议使用 openssl rand -base64 32 生成）
 * 4. 定期轮换 Secret（需要实现 token 迁移机制）
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  // 开发环境允许使用默认值，但会警告
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production. " +
        "Please set a strong secret key (at least 32 characters) in your environment variables."
      );
    }
    console.warn(
      "⚠️  WARNING: JWT_SECRET not set. Using default secret for development only. " +
      "This is INSECURE for production. Please set JWT_SECRET in .env.local"
    );
    return "dev-secret-key-change-in-production-min-32-chars";
  }
  
  // 验证 Secret 强度
  if (secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long for security. " +
      "Current length: " + secret.length
    );
  }
  
  return secret;
}

const JWT_SECRET = getJwtSecret();

/**
 * Token 有效期配置
 * - accessToken: 短期 token（15分钟），用于日常请求
 * - refreshToken: 长期 token（7天），用于刷新 accessToken
 * 
 * 注意：当前实现使用单一 token，建议未来实现 refresh token 机制
 */
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // 短期 token，减少泄露风险
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // 长期 token，用于刷新

/**
 * 当前使用的 token 有效期（7天）
 * TODO: 未来实现 refresh token 机制后，改为使用 ACCESS_TOKEN_EXPIRES_IN
 */
const TOKEN_EXPIRES_IN = REFRESH_TOKEN_EXPIRES_IN;

/**
 * Token Payload 接口
 */
export interface TokenPayload {
  userId: number;
  userType: "talent" | "company";
  iat?: number;
  exp?: number;
}

/**
 * 生成 JWT Token
 * @param userId 用户ID
 * @param userType 用户类型
 * @returns JWT Token 字符串
 */
export function generateToken(userId: number, userType: "talent" | "company"): string {
  const payload: Omit<TokenPayload, "iat" | "exp"> = {
    userId,
    userType,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

/**
 * Token 验证错误类型
 */
export enum TokenError {
  INVALID = "INVALID",
  EXPIRED = "EXPIRED",
  MALFORMED = "MALFORMED",
  UNKNOWN = "UNKNOWN",
}

/**
 * Token 验证结果
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: TokenError;
  message?: string;
}

/**
 * 验证 JWT Token（增强版，提供详细错误信息）
 * @param token JWT Token 字符串
 * @returns Token 验证结果
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    // 不记录详细错误信息到日志，避免泄露敏感信息
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn("Invalid token");
    } else {
      console.warn("Token verification failed");
    }
    return null;
  }
}

/**
 * 验证 JWT Token（详细版，返回错误信息）
 * @param token JWT Token 字符串
 * @returns Token 验证结果，包含详细错误信息
 */
export function verifyTokenDetailed(token: string): TokenVerificationResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return {
      valid: true,
      payload: decoded,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: TokenError.EXPIRED,
        message: "Token has expired",
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: TokenError.INVALID,
        message: "Invalid token",
      };
    } else if (error instanceof jwt.NotBeforeError) {
      return {
        valid: false,
        error: TokenError.INVALID,
        message: "Token not active yet",
      };
    } else {
      return {
        valid: false,
        error: TokenError.UNKNOWN,
        message: "Token verification failed",
      };
    }
  }
}

/**
 * 从请求头中提取 Token
 * @param authHeader Authorization 请求头的值（格式：Bearer <token>）
 * @returns Token 字符串或 null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // 支持多种格式：Bearer <token> 或 <token>
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    // 验证 token 格式（JWT 通常包含两个点）
    if (token && token.split(".").length === 3) {
      return token;
    }
  }

  return null;
}

/**
 * 检查 Token 是否即将过期（用于实现自动刷新）
 * @param token JWT Token 字符串
 * @param thresholdMinutes 过期阈值（分钟），默认 5 分钟
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return true; // 无法解析，视为过期
    }

    const expirationTime = decoded.exp * 1000; // 转换为毫秒
    const now = Date.now();
    const threshold = thresholdMinutes * 60 * 1000; // 转换为毫秒

    return expirationTime - now < threshold;
  } catch {
    return true; // 解析失败，视为过期
  }
}

/**
 * 从 Token 中提取用户信息（不验证签名，仅用于读取）
 * 注意：仅用于客户端读取，服务端必须使用 verifyToken 验证
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

