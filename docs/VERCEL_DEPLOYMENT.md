# Vercel 部署指南

## 环境变量配置

在 Vercel 部署时，需要在项目设置中配置以下环境变量：

### 必需的环境变量

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Supabase 项目 URL
   - 示例：`https://your-project.supabase.co`

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Supabase 匿名密钥（公开）
   - 用于客户端认证

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Supabase 服务角色密钥（私密）
   - 用于服务端数据库操作
   - ⚠️ **不要**在客户端使用

4. **`JWT_SECRET`** ⚠️ **重要**
   - JWT Token 签名密钥
   - 长度至少 32 个字符
   - 用于生成和验证登录 token
   - 如果未设置，生产环境会报错
   - 生成方式：`openssl rand -base64 32`

### 配置步骤

1. 登录 Vercel Dashboard
2. 选择项目
3. 进入 **Settings** > **Environment Variables**
4. 添加所有必需的环境变量
5. 确保为 **Production**、**Preview** 和 **Development** 环境都设置了变量
6. 重新部署项目

## 常见问题

### 问题：登录后跳回登录页

**可能原因**：
1. `JWT_SECRET` 未设置或与本地不同
2. Token 验证失败

**解决方案**：
1. 检查 Vercel 环境变量中是否设置了 `JWT_SECRET`
2. 确保 `JWT_SECRET` 长度至少 32 个字符
3. 重新部署项目

### 问题：右上角不显示用户名

**可能原因**：
1. `/api/auth/me` API 路由返回 401
2. Token 未正确传递

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 检查 Network 标签中 `/api/auth/me` 请求的响应
3. 确认 `Authorization` header 已正确设置

## 验证部署

部署后，请验证以下功能：

- [ ] 用户注册
- [ ] 用户登录
- [ ] 登录后跳转到 dashboard
- [ ] Dashboard 显示用户信息
- [ ] 右上角显示用户名
- [ ] 退出登录功能

