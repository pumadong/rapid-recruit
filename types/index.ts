/**
 * 通用类型定义
 */

// 用户类型
export type UserType = "talent" | "company";

// 性别
export type Gender = "male" | "female" | "other";

// 学历
export type Education =
  | "high_school"
  | "associate"
  | "bachelor"
  | "master"
  | "phd";

// 职位状态
export type JobStatus = "draft" | "published" | "closed" | "expired";

// 应聘状态
export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "accepted"
  | "rejected"
  | "withdrawn";

// 企业认证状态
export type CompanyVerification =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

