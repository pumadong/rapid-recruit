import type { UserType, Gender, Education } from "./index";

/**
 * 用户信息（不含密码）
 */
export interface User {
  id: number;
  phone: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 人才信息
 */
export interface Talent {
  id: number;
  userId: number;
  realName: string;
  gender: Gender | null;
  birthDate: Date | null;
  cityId: number | null;
  workExperienceYears: number;
  education: Education | null;
  major: string | null;
  bio: string | null;
  avatar: string | null;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 企业信息
 */
export interface Company {
  id: number;
  userId: number;
  companyName: string;
  companySize: string | null;
  cityId: number;
  industryLevel1Id: number;
  industryLevel2Id: number | null;
  description: string | null;
  logo: string | null;
  website: string | null;
  businessLicense: string | null;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  verificationTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 注册输入
 */
export interface RegisterInput {
  phone: string;
  password: string;
  userType: UserType;
  realName?: string; // 人才注册时需要
  companyName?: string; // 企业注册时需要
}

/**
 * 登录输入
 */
export interface LoginInput {
  phone: string;
  password: string;
}

