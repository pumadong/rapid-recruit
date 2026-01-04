# db/ 目录说明

## ⚠️ 此目录已废弃

此目录中的文件仅作为**类型参考**，**不再用于实际的数据库操作**。

## 架构变更

### 之前（已废弃）
- 使用 Drizzle ORM 直接连接 PostgreSQL
- 通过 `DATABASE_URL` 连接数据库端口 5432/6543
- 使用 `db/schema.ts` 定义表结构

### 现在（当前架构）
- 使用 Supabase SDK 通过 HTTPS API 访问数据库
- 通过 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`
- 所有数据库操作在 `server/queries/` 和 `server/actions/` 中

## 文件说明

### `schema.ts`
- **状态**: 已废弃，仅供类型参考
- **用途**: 了解数据库表结构（类型定义）
- **请勿**: 修改此文件或使用其中的导出

## 正确的使用方式

### 1. 数据库操作
所有数据库操作应该：
- 在 `server/queries/` 中进行查询操作
- 在 `server/actions/` 中进行修改操作（标记 `"use server"`）

### 2. 客户端创建
```typescript
// ❌ 错误 - 不要使用
import { db } from "@/lib/db";
import { jobPositions } from "@/db/schema";

// ✅ 正确 - 使用 Supabase SDK
import { createAdminClient } from "@/lib/supabase/admin";

const supabase = createAdminClient();
const { data } = await supabase.from("job_positions").select("*");
```

### 3. 查看数据库结构
- 查看 `docs/database/supabase_schema.sql` 了解实际数据库结构
- 查看 `db/schema.ts` 仅作为 TypeScript 类型参考

## 相关文档

- `ARCHITECTURE.md` - 整体架构说明
- `API_MIGRATION_SUMMARY.md` - API 迁移总结
- `docs/database/supabase_schema.sql` - 数据库结构定义

