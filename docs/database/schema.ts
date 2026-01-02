import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  decimal,
  enum as pgEnum,
  foreignKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== 枚举类型 ====================

// 用户类型
export const userTypeEnum = pgEnum("user_type", ["talent", "company"]);

// 性别
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// 学历
export const educationEnum = pgEnum("education", [
  "high_school",
  "associate",
  "bachelor",
  "master",
  "phd",
]);

// 职位状态
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "published",
  "closed",
  "expired",
]);

// 应聘状态
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "reviewed",
  "accepted",
  "rejected",
  "withdrawn",
]);

// 企业认证状态
export const companyVerificationEnum = pgEnum("company_verification", [
  "unverified",
  "pending",
  "verified",
  "rejected",
]);

// ==================== 基础数据表 ====================

/**
 * 省份表
 */
export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * 城市表
 */
export const cities = pgTable(
  "cities",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    provinceId: integer("province_id").notNull(),
    code: varchar("code", { length: 10 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    provinceIdIdx: index("cities_province_id_idx").on(table.provinceId),
    uniqueProvinceCity: uniqueIndex("unique_province_city").on(
      table.provinceId,
      table.name
    ),
  })
);

/**
 * 一级行业表
 */
export const industriesLevel1 = pgTable("industries_level1", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * 二级行业表
 */
export const industriesLevel2 = pgTable(
  "industries_level2",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    industryLevel1Id: integer("industry_level1_id").notNull(),
    code: varchar("code", { length: 10 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    industryLevel1IdIdx: index("industries_level2_level1_id_idx").on(
      table.industryLevel1Id
    ),
    uniqueLevel1Industry: uniqueIndex("unique_level1_industry").on(
      table.industryLevel1Id,
      table.name
    ),
  })
);

/**
 * 技能表
 */
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ==================== 用户相关表 ====================

/**
 * 用户基表
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    userType: userTypeEnum("user_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    phoneIdx: uniqueIndex("users_phone_idx").on(table.phone),
  })
);

/**
 * 人才表
 */
export const talents = pgTable(
  "talents",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    realName: varchar("real_name", { length: 50 }).notNull(),
    gender: genderEnum("gender"),
    birthDate: timestamp("birth_date", { withTimezone: true }),
    cityId: integer("city_id"),
    workExperienceYears: integer("work_experience_years").default(0),
    education: educationEnum("education"),
    major: varchar("major", { length: 100 }),
    bio: text("bio"),
    avatar: varchar("avatar", { length: 255 }),
    phoneVerified: boolean("phone_verified").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("talents_user_id_idx").on(table.userId),
    cityIdIdx: index("talents_city_id_idx").on(table.cityId),
  })
);

/**
 * 企业表
 */
export const companies = pgTable(
  "companies",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    companyName: varchar("company_name", { length: 100 }).notNull(),
    companySize: varchar("company_size", { length: 50 }),
    cityId: integer("city_id").notNull(),
    industryLevel1Id: integer("industry_level1_id").notNull(),
    industryLevel2Id: integer("industry_level2_id"),
    description: text("description"),
    logo: varchar("logo", { length: 255 }),
    website: varchar("website", { length: 255 }),
    businessLicense: varchar("business_license", { length: 255 }),
    verificationStatus: companyVerificationEnum("verification_status").default(
      "unverified"
    ),
    verificationTime: timestamp("verification_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userIdIdx: index("companies_user_id_idx").on(table.userId),
    cityIdIdx: index("companies_city_id_idx").on(table.cityId),
    industryLevel1IdIdx: index("companies_industry_level1_id_idx").on(
      table.industryLevel1Id
    ),
    industryLevel2IdIdx: index("companies_industry_level2_id_idx").on(
      table.industryLevel2Id
    ),
  })
);

/**
 * 人才技能关联表
 */
export const talentSkills = pgTable(
  "talent_skills",
  {
    id: serial("id").primaryKey(),
    talentId: integer("talent_id").notNull(),
    skillId: integer("skill_id").notNull(),
    proficiencyLevel: varchar("proficiency_level", { length: 20 }).default(
      "intermediate"
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    talentIdIdx: index("talent_skills_talent_id_idx").on(table.talentId),
    skillIdIdx: index("talent_skills_skill_id_idx").on(table.skillId),
  })
);

// ==================== 职位相关表 ====================

/**
 * 职位表
 */
export const jobPositions = pgTable(
  "job_positions",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id").notNull(),
    positionName: varchar("position_name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    industryLevel1Id: integer("industry_level1_id").notNull(),
    industryLevel2Id: integer("industry_level2_id"),
    salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
    salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
    cityId: integer("city_id").notNull(),
    workExperienceRequired: integer("work_experience_required").default(0),
    educationRequired: educationEnum("education_required"),
    positionCount: integer("position_count").default(1),
    status: jobStatusEnum("status").default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    companyIdIdx: index("job_positions_company_id_idx").on(table.companyId),
    cityIdIdx: index("job_positions_city_id_idx").on(table.cityId),
    industryLevel1IdIdx: index("job_positions_industry_level1_id_idx").on(
      table.industryLevel1Id
    ),
    industryLevel2IdIdx: index("job_positions_industry_level2_id_idx").on(
      table.industryLevel2Id
    ),
    statusIdx: index("job_positions_status_idx").on(table.status),
  })
);

/**
 * 职位技能要求表
 */
export const jobSkills = pgTable(
  "job_skills",
  {
    id: serial("id").primaryKey(),
    jobPositionId: integer("job_position_id").notNull(),
    skillId: integer("skill_id").notNull(),
    isRequired: boolean("is_required").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    jobPositionIdIdx: index("job_skills_job_position_id_idx").on(
      table.jobPositionId
    ),
    skillIdIdx: index("job_skills_skill_id_idx").on(table.skillId),
  })
);

// ==================== 应聘相关表 ====================

/**
 * 职位应聘表
 */
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    talentId: integer("talent_id").notNull(),
    jobPositionId: integer("job_position_id").notNull(),
    status: applicationStatusEnum("status").default("pending"),
    appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    companyReply: text("company_reply"),
    replyAt: timestamp("reply_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    talentIdIdx: index("applications_talent_id_idx").on(table.talentId),
    jobPositionIdIdx: index("applications_job_position_id_idx").on(
      table.jobPositionId
    ),
    statusIdx: index("applications_status_idx").on(table.status),
    talentJobIdx: uniqueIndex("unique_talent_job").on(
      table.talentId,
      table.jobPositionId
    ),
  })
);

// ==================== 关系定义 ====================

export const provinceRelations = relations(provinces, ({ many }) => ({
  cities: many(cities),
}));

export const cityRelations = relations(cities, ({ one, many }) => ({
  province: one(provinces, {
    fields: [cities.provinceId],
    references: [provinces.id],
  }),
  talents: many(talents),
  companies: many(companies),
  jobPositions: many(jobPositions),
}));

export const industryLevel1Relations = relations(
  industriesLevel1,
  ({ many }) => ({
    industriesLevel2: many(industriesLevel2),
    companies: many(companies),
    jobPositions: many(jobPositions),
  })
);

export const industryLevel2Relations = relations(
  industriesLevel2,
  ({ one, many }) => ({
    industryLevel1: one(industriesLevel1, {
      fields: [industriesLevel2.industryLevel1Id],
      references: [industriesLevel1.id],
    }),
    companies: many(companies),
    jobPositions: many(jobPositions),
  })
);

export const skillRelations = relations(skills, ({ many }) => ({
  talentSkills: many(talentSkills),
  jobSkills: many(jobSkills),
}));

export const userRelations = relations(users, ({ one }) => ({
  talent: one(talents, {
    fields: [users.id],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [users.id],
    references: [users.id],
  }),
}));

export const talentRelations = relations(talents, ({ one, many }) => ({
  user: one(users, {
    fields: [talents.userId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [talents.cityId],
    references: [cities.id],
  }),
  talentSkills: many(talentSkills),
  applications: many(applications),
}));

export const companyRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [companies.cityId],
    references: [cities.id],
  }),
  industryLevel1: one(industriesLevel1, {
    fields: [companies.industryLevel1Id],
    references: [industriesLevel1.id],
  }),
  industryLevel2: one(industriesLevel2, {
    fields: [companies.industryLevel2Id],
    references: [industriesLevel2.id],
  }),
  jobPositions: many(jobPositions),
}));

export const talentSkillRelations = relations(talentSkills, ({ one }) => ({
  talent: one(talents, {
    fields: [talentSkills.talentId],
    references: [talents.id],
  }),
  skill: one(skills, {
    fields: [talentSkills.skillId],
    references: [skills.id],
  }),
}));

export const jobPositionRelations = relations(
  jobPositions,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [jobPositions.companyId],
      references: [companies.id],
    }),
    city: one(cities, {
      fields: [jobPositions.cityId],
      references: [cities.id],
    }),
    industryLevel1: one(industriesLevel1, {
      fields: [jobPositions.industryLevel1Id],
      references: [industriesLevel1.id],
    }),
    industryLevel2: one(industriesLevel2, {
      fields: [jobPositions.industryLevel2Id],
      references: [industriesLevel2.id],
    }),
    jobSkills: many(jobSkills),
    applications: many(applications),
  })
);

export const jobSkillRelations = relations(jobSkills, ({ one }) => ({
  jobPosition: one(jobPositions, {
    fields: [jobSkills.jobPositionId],
    references: [jobPositions.id],
  }),
  skill: one(skills, {
    fields: [jobSkills.skillId],
    references: [skills.id],
  }),
}));

export const applicationRelations = relations(applications, ({ one }) => ({
  talent: one(talents, {
    fields: [applications.talentId],
    references: [talents.id],
  }),
  jobPosition: one(jobPositions, {
    fields: [applications.jobPositionId],
    references: [jobPositions.id],
  }),
}));
