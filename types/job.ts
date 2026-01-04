import type { Education, JobStatus } from "./index";

/**
 * 职位筛选参数
 */
export interface JobFilter {
  cityId?: number;
  provinceId?: number;
  industryLevel1Id?: number;
  industryLevel2Id?: number;
  salaryMin?: number;
  salaryMax?: number;
  workExperienceRequired?: number;
  educationRequired?: Education;
  status?: JobStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}

/**
 * 职位信息（包含关联数据）
 */
export interface JobWithRelations {
  id: number;
  companyId: number;
  positionName: string;
  description: string;
  industryLevel1Id: number;
  industryLevel2Id: number | null;
  salaryMin: string | null;
  salaryMax: string | null;
  cityId: number;
  workExperienceRequired: number;
  educationRequired: Education | null;
  positionCount: number;
  status: JobStatus;
  publishedAt: Date | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: number;
    companyName: string;
    logo: string | null;
  };
  city?: {
    id: number;
    name: string;
  };
  industryLevel1?: {
    id: number;
    name: string;
  };
  industryLevel2?: {
    id: number;
    name: string;
  };
  jobSkills?: Array<{
    id: number;
    skillId: number;
    isRequired: boolean;
    skill?: {
      id: number;
      name: string;
      category: string;
    };
  }>;
}

/**
 * 创建职位输入
 */
export interface CreateJobInput {
  companyId: number;
  positionName: string;
  description: string;
  industryLevel1Id: number;
  industryLevel2Id?: number;
  salaryMin?: number;
  salaryMax?: number;
  cityId: number;
  workExperienceRequired?: number;
  educationRequired?: Education;
  positionCount?: number;
  skillIds?: number[];
  expiredAt?: Date;
}

/**
 * 更新职位输入
 */
export interface UpdateJobInput {
  positionName?: string;
  description?: string;
  industryLevel1Id?: number;
  industryLevel2Id?: number;
  salaryMin?: number;
  salaryMax?: number;
  cityId?: number;
  workExperienceRequired?: number;
  educationRequired?: Education;
  positionCount?: number;
  status?: JobStatus;
  expiredAt?: Date;
}

