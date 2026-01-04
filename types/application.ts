import type { ApplicationStatus } from "./index";

/**
 * 应聘信息
 */
export interface Application {
  id: number;
  talentId: number;
  jobPositionId: number;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt: Date | null;
  companyReply: string | null;
  replyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建应聘输入
 */
export interface CreateApplicationInput {
  talentId: number;
  jobPositionId: number;
}

/**
 * 更新应聘状态输入
 */
export interface UpdateApplicationInput {
  status: ApplicationStatus;
  companyReply?: string;
}

