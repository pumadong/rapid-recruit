# 网络连接问题排查指南

## 🔍 常见错误

### 连接超时 (ConnectTimeoutError)

如果看到类似错误：
```
ConnectTimeoutError: Connect Timeout Error (attempted addresses: 104.18.38.10:443, timeout: 10000ms)
```

## 🔧 排查步骤

### 1. 检查环境变量

确保 `.env.local` 文件存在且配置正确：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**检查要点**：
- ✅ URL 必须以 `https://` 开头
- ✅ 没有多余的空格或引号
- ✅ 项目 ID 正确（在 Supabase Dashboard 可以找到）

### 2. 验证 Supabase URL

访问你的 Supabase URL 看看是否能打开：
```bash
# 在浏览器中打开
https://your-project.supabase.co
```

应该能看到 Supabase 的欢迎页面。

### 3. 测试网络连接

```bash
# 测试能否连接到 Supabase
curl https://your-project.supabase.co/rest/v1/
```

如果连接失败，可能是：
- 网络问题
- 防火墙阻止
- 代理配置问题

### 4. 检查代理/VPN

如果你使用了代理或 VPN：
- 尝试暂时关闭
- 或者配置 Node.js 使用代理：
  ```bash
  export HTTP_PROXY=http://your-proxy:port
  export HTTPS_PROXY=http://your-proxy:port
  ```

### 5. 增加超时时间

已实现的改进：
- ✅ 超时时间从默认 10 秒增加到 30 秒
- ✅ 添加了自定义 fetch 函数
- ✅ 改进了错误提示信息

### 6. 检查 Supabase 服务状态

访问 Supabase Status 页面检查服务是否正常：
https://status.supabase.com/

## 🛠️ 解决方案

### 方案 1: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

### 方案 2: 清除缓存并重新安装依赖

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 方案 3: 检查防火墙设置

确保以下端口未被阻止：
- 443 (HTTPS)
- 5432 (PostgreSQL - 虽然我们不用直连，但某些工具可能需要)

### 方案 4: 使用代理配置（如果需要）

创建或编辑 `.npmrc` 文件：
```
proxy=http://your-proxy:port
https-proxy=http://your-proxy:port
```

或者在代码中配置：
```typescript
// lib/supabase/admin.ts
global.fetch = (url, options) => {
  // 使用代理的 fetch 实现
};
```

### 方案 5: 使用环境变量设置代理（临时）

```bash
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
npm run dev
```

## 📝 调试信息

如果问题持续存在，请收集以下信息：

1. **环境变量**（隐藏敏感信息）：
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   # 只显示前 30 个字符，不要显示完整 URL
   ```

2. **网络测试**：
   ```bash
   curl -v https://your-project.supabase.co/rest/v1/
   ```

3. **Node.js 版本**：
   ```bash
   node --version
   ```

4. **操作系统信息**：
   ```bash
   uname -a  # Linux/Mac
   # 或
   systeminfo  # Windows
   ```

## ✅ 验证修复

修复后，访问以下页面验证：
1. 首页：`http://localhost:3000` - 应该能看到职位列表
2. 职位列表：`http://localhost:3000/jobs` - 应该能看到所有职位
3. 检查控制台：应该看到 `✅ Test connection successful!`

## 🆘 仍然无法解决？

如果以上步骤都无法解决问题，请提供：
1. 完整的错误信息
2. 环境变量配置（隐藏敏感信息）
3. 网络连接测试结果
4. Node.js 和操作系统版本

然后我们可以在 GitHub Issues 或 Supabase 支持中寻求帮助。

