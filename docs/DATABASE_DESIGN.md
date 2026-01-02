# 快捷招聘数据库设计文档

## 项目概述

本数据库设计为快捷招聘平台提供完整的数据存储方案，支持人才注册登录、企业注册登录、职位发布、职位申请等核心功能。

## 数据库架构

### 整体结构

数据库由以下几个主要模块组成：

| 模块 | 说明 | 核心表 |
|------|------|--------|
| 基础数据 | 地理位置、行业分类、技能库 | provinces, cities, industries_level1, industries_level2, skills |
| 用户管理 | 用户账户、人才信息、企业信息 | users, talents, companies |
| 职位管理 | 职位发布、职位技能要求 | job_positions, job_skills |
| 应聘管理 | 职位申请、应聘状态跟踪 | applications |

## 表结构详解

### 1. 基础数据表

#### 1.1 provinces（省份表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| name | VARCHAR(50) | 省份名称 | NOT NULL, UNIQUE |
| code | VARCHAR(10) | 省份代码 | NOT NULL, UNIQUE |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**用途**：存储中国各省份信息，支持地理位置筛选。

#### 1.2 cities（城市表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| name | VARCHAR(50) | 城市名称 | NOT NULL |
| province_id | INTEGER | 所属省份ID | NOT NULL, FK |
| code | VARCHAR(10) | 城市代码 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：province_id, UNIQUE(province_id, name)

**用途**：存储城市信息，支持多级地理位置查询。

#### 1.3 industries_level1（一级行业表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| name | VARCHAR(50) | 行业名称 | NOT NULL, UNIQUE |
| code | VARCHAR(10) | 行业代码 | NOT NULL, UNIQUE |
| description | TEXT | 行业描述 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**用途**：存储一级行业分类（如互联网IT、金融等）。

#### 1.4 industries_level2（二级行业表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| name | VARCHAR(50) | 行业名称 | NOT NULL |
| industry_level1_id | INTEGER | 一级行业ID | NOT NULL, FK |
| code | VARCHAR(10) | 行业代码 | NOT NULL |
| description | TEXT | 行业描述 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：industry_level1_id, UNIQUE(industry_level1_id, name)

**用途**：存储二级行业分类，支持细粒度的行业筛选。

#### 1.5 skills（技能表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| name | VARCHAR(50) | 技能名称 | NOT NULL, UNIQUE |
| category | VARCHAR(50) | 技能分类 | NOT NULL |
| description | TEXT | 技能描述 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**用途**：存储可用技能库，支持人才和职位的技能匹配。

### 2. 用户管理表

#### 2.1 users（用户基表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| phone | VARCHAR(20) | 手机号 | NOT NULL, UNIQUE |
| password | VARCHAR(255) | 密码（加密） | NOT NULL |
| user_type | user_type | 用户类型 | NOT NULL (talent/company) |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：phone (UNIQUE)

**用途**：存储所有用户的基本认证信息，支持人才和企业两种用户类型。

**设计说明**：
- 使用 ENUM 类型区分用户类型，便于查询和数据验证
- 密码应使用 bcrypt 等算法加密存储
- 通过触发器自动更新 updated_at 字段

#### 2.2 talents（人才表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| user_id | INTEGER | 关联用户ID | NOT NULL, UNIQUE, FK |
| real_name | VARCHAR(50) | 真实姓名 | NOT NULL |
| gender | gender | 性别 | NULL (male/female/other) |
| birth_date | TIMESTAMP | 出生日期 | NULL |
| city_id | INTEGER | 所在城市ID | NULL, FK |
| work_experience_years | INTEGER | 工作经验年限 | DEFAULT 0 |
| education | education | 学历 | NULL |
| major | VARCHAR(100) | 专业 | NULL |
| bio | TEXT | 个人简介 | NULL |
| avatar | VARCHAR(255) | 头像URL | NULL |
| phone_verified | BOOLEAN | 手机是否验证 | DEFAULT FALSE |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：user_id (UNIQUE), city_id

**用途**：存储人才的详细信息，支持人才档案管理和搜索筛选。

**设计说明**：
- 与 users 表一对一关联，user_id 为 UNIQUE
- 支持多维度的人才信息存储
- 通过触发器自动更新 updated_at 字段

#### 2.3 companies（企业表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| user_id | INTEGER | 关联用户ID | NOT NULL, UNIQUE, FK |
| company_name | VARCHAR(100) | 企业名称 | NOT NULL |
| company_size | VARCHAR(50) | 企业规模 | NULL |
| city_id | INTEGER | 所在城市ID | NOT NULL, FK |
| industry_level1_id | INTEGER | 一级行业ID | NOT NULL, FK |
| industry_level2_id | INTEGER | 二级行业ID | NULL, FK |
| description | TEXT | 企业描述 | NULL |
| logo | VARCHAR(255) | 企业logo URL | NULL |
| website | VARCHAR(255) | 企业网站 | NULL |
| business_license | VARCHAR(255) | 营业执照 | NULL |
| verification_status | company_verification | 认证状态 | DEFAULT 'unverified' |
| verification_time | TIMESTAMP | 认证时间 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：user_id (UNIQUE), city_id, industry_level1_id, industry_level2_id

**用途**：存储企业的详细信息，支持企业档案管理和认证。

**设计说明**：
- 与 users 表一对一关联，user_id 为 UNIQUE
- 支持企业认证流程，verification_status 记录认证状态
- 通过触发器自动更新 updated_at 字段

#### 2.4 talent_skills（人才技能关联表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| talent_id | INTEGER | 人才ID | NOT NULL, FK |
| skill_id | INTEGER | 技能ID | NOT NULL, FK |
| proficiency_level | VARCHAR(20) | 熟练度 | DEFAULT 'intermediate' |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：talent_id, skill_id

**用途**：存储人才拥有的技能，支持技能匹配和推荐。

### 3. 职位管理表

#### 3.1 job_positions（职位表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| company_id | INTEGER | 企业ID | NOT NULL, FK |
| position_name | VARCHAR(100) | 职位名称 | NOT NULL |
| description | TEXT | 职位描述 | NOT NULL |
| industry_level1_id | INTEGER | 一级行业ID | NOT NULL, FK |
| industry_level2_id | INTEGER | 二级行业ID | NULL, FK |
| salary_min | DECIMAL(10,2) | 最低薪资 | NULL |
| salary_max | DECIMAL(10,2) | 最高薪资 | NULL |
| city_id | INTEGER | 工作城市ID | NOT NULL, FK |
| work_experience_required | INTEGER | 要求工作年限 | DEFAULT 0 |
| education_required | education | 要求学历 | NULL |
| position_count | INTEGER | 招聘人数 | DEFAULT 1 |
| status | job_status | 职位状态 | DEFAULT 'draft' |
| published_at | TIMESTAMP | 发布时间 | NULL |
| expired_at | TIMESTAMP | 过期时间 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：company_id, city_id, industry_level1_id, industry_level2_id, status

**用途**：存储企业发布的职位信息，支持职位搜索、筛选和推荐。

**设计说明**：
- status 字段支持职位生命周期管理（草稿、已发布、已关闭、已过期）
- 通过触发器自动更新 updated_at 字段
- 索引 status 字段以优化职位查询性能

#### 3.2 job_skills（职位技能要求表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| job_position_id | INTEGER | 职位ID | NOT NULL, FK |
| skill_id | INTEGER | 技能ID | NOT NULL, FK |
| is_required | BOOLEAN | 是否必需 | DEFAULT TRUE |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：job_position_id, skill_id

**用途**：存储职位所需的技能，支持技能匹配和人才推荐。

### 4. 应聘管理表

#### 4.1 applications（职位应聘表）

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | SERIAL | 主键 | PRIMARY KEY |
| talent_id | INTEGER | 人才ID | NOT NULL, FK |
| job_position_id | INTEGER | 职位ID | NOT NULL, FK |
| status | application_status | 应聘状态 | DEFAULT 'pending' |
| applied_at | TIMESTAMP | 应聘时间 | DEFAULT CURRENT_TIMESTAMP |
| reviewed_at | TIMESTAMP | 审核时间 | NULL |
| company_reply | TEXT | 企业回复 | NULL |
| reply_at | TIMESTAMP | 回复时间 | NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP |

**索引**：talent_id, job_position_id, status, UNIQUE(talent_id, job_position_id)

**用途**：存储人才的职位申请记录，支持应聘流程管理。

**设计说明**：
- UNIQUE(talent_id, job_position_id) 确保同一人才对同一职位只能申请一次
- status 字段支持应聘状态跟踪（待审核、已审核、已接受、已拒绝、已撤回）
- 通过触发器自动更新 updated_at 字段

## 枚举类型定义

### user_type（用户类型）
- `talent`：人才用户
- `company`：企业用户

### gender（性别）
- `male`：男
- `female`：女
- `other`：其他

### education（学历）
- `high_school`：高中
- `associate`：大专
- `bachelor`：本科
- `master`：硕士
- `phd`：博士

### job_status（职位状态）
- `draft`：草稿
- `published`：已发布
- `closed`：已关闭
- `expired`：已过期

### application_status（应聘状态）
- `pending`：待审核
- `reviewed`：已审核
- `accepted`：已接受
- `rejected`：已拒绝
- `withdrawn`：已撤回

### company_verification（企业认证状态）
- `unverified`：未认证
- `pending`：审核中
- `verified`：已认证
- `rejected`：已拒绝

## 视图定义

### job_position_details（职位详情视图）

提供职位的完整信息，包括企业信息、行业分类、地理位置等，便于前端展示和查询。

**包含字段**：职位基本信息、企业信息、城市和省份、一级和二级行业

### talent_details（人才详情视图）

提供人才的完整信息，包括城市、省份、注册信息等，便于企业查看人才档案。

**包含字段**：人才基本信息、城市和省份、注册时间

### application_details（应聘详情视图）

提供应聘的完整信息，包括人才、职位、企业等相关信息，便于追踪应聘进度。

**包含字段**：应聘状态、人才信息、职位信息、企业信息

## 触发器定义

为了确保数据的一致性和完整性，设置了以下触发器：

| 表名 | 触发器名 | 触发条件 | 功能 |
|------|---------|---------|------|
| users | users_updated_at_trigger | BEFORE UPDATE | 自动更新 updated_at |
| talents | talents_updated_at_trigger | BEFORE UPDATE | 自动更新 updated_at |
| companies | companies_updated_at_trigger | BEFORE UPDATE | 自动更新 updated_at |
| job_positions | job_positions_updated_at_trigger | BEFORE UPDATE | 自动更新 updated_at |
| applications | applications_updated_at_trigger | BEFORE UPDATE | 自动更新 updated_at |

## 关系图

```
provinces (1) ──── (N) cities
                       │
                       ├─── (1) talents
                       ├─── (1) companies
                       └─── (N) job_positions

industries_level1 (1) ──── (N) industries_level2
                               │
                               ├─── (N) companies
                               └─── (N) job_positions

skills (1) ──── (N) talent_skills ──── (N) talents
         │
         └─── (N) job_skills ──── (N) job_positions

users (1) ──── (1) talents
     │
     └─── (1) companies (1) ──── (N) job_positions (N) ──── (N) applications ──── (N) talents
```

## 初始化数据

数据库包含以下初始化数据：

### 一级行业
- 互联网IT
- 金融
- 房地产/建筑
- 贸易/零售/物流
- 教育/传媒/广告
- 服务业
- 市场/销售
- 人事/财务/行政

### 省份和城市
初始化了10个省份和对应的主要城市（北京、上海、深圳、广州、杭州等）

### 技能
初始化了10个常见技能（Java、Python、JavaScript、React、Vue、Node.js、MySQL、MongoDB、Docker、Kubernetes）

## 性能优化建议

### 索引策略

1. **频繁查询的字段**：已为 phone、city_id、industry_id、status 等字段创建索引
2. **外键字段**：为所有外键创建索引以加速 JOIN 操作
3. **组合索引**：为 (province_id, name) 和 (talent_id, job_position_id) 创建唯一索引

### 查询优化

1. **使用视图**：利用预定义视图简化复杂查询
2. **分页查询**：对职位列表等大数据集使用分页
3. **缓存策略**：缓存行业、城市、技能等基础数据

### 数据库维护

1. **定期备份**：定期备份数据库以防数据丢失
2. **索引维护**：定期重建索引以保持查询性能
3. **统计信息更新**：定期更新表统计信息以优化查询计划

## 安全建议

1. **密码存储**：使用 bcrypt 或 argon2 等强加密算法
2. **数据加密**：敏感数据（如营业执照）应加密存储
3. **访问控制**：实施行级安全策略，确保用户只能访问自己的数据
4. **SQL 注入防护**：使用参数化查询防止 SQL 注入

## 扩展建议

### 未来可能的表扩展

1. **简历表**：存储人才的详细简历
2. **面试表**：记录面试信息和结果
3. **合同表**：管理录用合同
4. **评价表**：人才和企业的互评系统
5. **消息表**：人才和企业的沟通记录
6. **收藏表**：人才收藏职位、企业收藏人才

### 功能扩展

1. **推荐系统**：基于技能匹配的职位推荐
2. **搜索优化**：全文搜索支持
3. **数据分析**：招聘数据统计和分析
4. **通知系统**：职位更新、应聘状态变化通知
