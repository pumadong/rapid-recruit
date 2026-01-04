# JWT Token 安全指南

## 概述

本文档说明 JWT Token 的安全配置和最佳实践。

## 安全配置

### 1. JWT_SECRET 配置

**要求：**
- 生产环境必须设置 `JWT_SECRET` 环境变量
- Secret 长度至少 32 个字符
- 使用强随机字符串

**生成 Secret：**
```bash
# 使用 OpenSSL 生成 32 字节的随机字符串（Base64 编码）
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**配置环境变量：**
```bash
# .env.local
JWT_SECRET=your-generated-secret-key-at-least-32-characters-long
```

### 2. Token 存储安全

**当前实现：**
- Token 存储在 `localStorage` 中
- 容易受到 XSS（跨站脚本）攻击

**安全建议：**

#### 方案 A：使用 httpOnly Cookie（推荐）
```typescript
// 服务端设置 cookie
response.cookies.set({
  name: "auth_token",
  value: token,
  httpOnly: true,    // JavaScript 无法访问
  secure: true,      // 仅通过 HTTPS 发送
  sameSite: "strict", // 防止 CSRF
  maxAge: 7 * 24 * 60 * 60, // 7 天
});
```

#### 方案 B：增强 localStorage 安全性
- 实现 Content Security Policy (CSP)
- 使用 Web Crypto API 加密 token
- 实现 token 自动刷新机制

### 3. Token 有效期

**当前配置：**
- Token 有效期：7 天
- 建议实现 refresh token 机制

**推荐配置：**
- Access Token：15 分钟（短期）
- Refresh Token：7 天（长期）

### 4. Token 验证

**服务端验证：**
```typescript
import { verifyToken } from "@/lib/token";

const payload = verifyToken(token);
if (!payload) {
  return { error: "Invalid or expired token" };
}
```

**客户端检查（仅用于 UI 状态）：**
```typescript
import { isTokenValid } from "@/lib/auth-client";

if (!isTokenValid()) {
  // 跳转到登录页
  router.push("/login");
}
```

## 安全最佳实践

### 1. 防止 XSS 攻击

**实现 CSP：**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
];
```

**输入验证：**
- 所有用户输入都进行验证和转义
- 使用 React 的内置转义机制

### 2. 防止 CSRF 攻击

**使用 SameSite Cookie：**
```typescript
cookieStore.set("auth_token", token, {
  sameSite: "strict",
  secure: true,
});
```

**或使用 CSRF Token：**
```typescript
// 生成 CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');

// 在请求中验证
if (request.headers.get('X-CSRF-Token') !== csrfToken) {
  return { error: "Invalid CSRF token" };
}
```

### 3. Token 刷新机制

**实现自动刷新：**
```typescript
// 检查 token 是否即将过期
if (isTokenExpiringSoon(token, 5)) {
  // 自动刷新 token
  const newToken = await refreshToken();
  saveToken(newToken);
}
```

### 4. Token 黑名单（登出时）

**实现 token 黑名单：**
```typescript
// 在数据库中存储已撤销的 token
await supabase.from("revoked_tokens").insert({
  token_hash: hashToken(token),
  expires_at: getTokenExpiration(token),
});

// 验证时检查黑名单
const isRevoked = await checkTokenBlacklist(token);
if (isRevoked) {
  return { error: "Token has been revoked" };
}
```

### 5. 速率限制

**防止暴力破解：**
```typescript
// 限制登录尝试次数
const attempts = await getLoginAttempts(phone);
if (attempts > 5) {
  return { error: "Too many login attempts" };
}
```

## 安全检查清单

### 部署前检查

- [ ] `JWT_SECRET` 已设置且长度 >= 32 字符
- [ ] Token 有效期配置合理
- [ ] 实现了 token 验证机制
- [ ] 实现了 token 刷新机制（可选）
- [ ] 实现了 token 黑名单（可选）
- [ ] 配置了 CSP 头部
- [ ] 实现了速率限制
- [ ] 错误信息不泄露敏感信息

### 运行时检查

- [ ] Token 验证失败时返回适当的错误
- [ ] Token 过期时自动跳转登录
- [ ] 登出时清除 token
- [ ] 敏感操作要求重新验证

## 常见安全问题

### Q: localStorage 安全吗？

A: localStorage 容易受到 XSS 攻击。如果必须使用，请：
- 实现严格的 CSP
- 对所有用户输入进行验证和转义
- 考虑使用 httpOnly cookie

### Q: Token 泄露怎么办？

A: 如果 token 泄露：
1. 立即撤销 token（实现黑名单）
2. 要求用户重新登录
3. 检查是否有未授权访问
4. 考虑缩短 token 有效期

### Q: 如何实现 token 刷新？

A: 实现 refresh token 机制：
1. Access token 短期（15 分钟）
2. Refresh token 长期（7 天）
3. 使用 refresh token 获取新的 access token
4. Refresh token 泄露风险更低

## 参考资源

- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT.io](https://jwt.io/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

