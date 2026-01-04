"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { CreateJobInput, UpdateJobInput } from "@/types/job";
import { z } from "zod";
import { getCurrentUserId } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";

const createJobSchema = z.object({
  companyId: z.number().int().positive(),
  positionName: z.string().min(1).max(100),
  description: z.string().min(10),
  industryLevel1Id: z.number().int().positive(),
  industryLevel2Id: z.number().int().positive().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  cityId: z.number().int().positive(),
  workExperienceRequired: z.number().int().min(0).optional(),
  educationRequired: z
    .enum(["high_school", "associate", "bachelor", "master", "phd"])
    .optional(),
  positionCount: z.number().int().positive().optional(),
  skillIds: z.array(z.number().int().positive()).optional(),
  expiredAt: z.date().optional(),
});

/**
 * 发布职位
 */
export async function createJob(input: CreateJobInput) {
  try {
    // 验证输入
    const validated = createJobSchema.parse(input);

    const supabase = createAdminClient();

    // 创建职位
    const { data: job, error: jobError } = await supabase
      .from("job_positions")
      .insert({
        company_id: validated.companyId,
        position_name: validated.positionName,
        description: validated.description,
        industry_level1_id: validated.industryLevel1Id,
        industry_level2_id: validated.industryLevel2Id || null,
        salary_min: validated.salaryMin?.toString() || null,
        salary_max: validated.salaryMax?.toString() || null,
        city_id: validated.cityId,
        work_experience_required: validated.workExperienceRequired || 0,
        education_required: validated.educationRequired || null,
        position_count: validated.positionCount || 1,
        status: "published",
        published_at: new Date().toISOString(),
        expired_at: validated.expiredAt?.toISOString() || null,
      })
      .select()
      .single();

    if (jobError || !job) {
      return {
        success: false,
        error: `创建职位失败: ${jobError?.message || "未知错误"}`,
        code: "INTERNAL_ERROR",
      };
    }

    // 添加职位技能要求
    if (validated.skillIds && validated.skillIds.length > 0) {
      const jobSkills = validated.skillIds.map((skillId) => ({
        job_position_id: job.id,
        skill_id: skillId,
        is_required: true,
      }));

      const { error: skillError } = await supabase.from("job_skills").insert(jobSkills);

      if (skillError) {
        // 如果技能创建失败，尝试删除已创建的职位
        await supabase.from("job_positions").delete().eq("id", job.id);
        return {
          success: false,
          error: `创建职位技能失败: ${skillError.message}`,
          code: "INTERNAL_ERROR",
        };
      }
    }

    return { success: true, jobId: job.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        code: "VALIDATION_ERROR",
      };
    }
    const errorMessage = error instanceof Error ? error.message : "创建职位失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 更新职位
 */
export async function updateJob(id: number, input: UpdateJobInput) {
  try {
    const supabase = createAdminClient();

    // 检查职位是否存在
    const { data: existing } = await supabase
      .from("job_positions")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      throw new NotFoundError("Job");
    }

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.positionName) updateData.position_name = input.positionName;
    if (input.description) updateData.description = input.description;
    if (input.industryLevel1Id) updateData.industry_level1_id = input.industryLevel1Id;
    if (input.industryLevel2Id !== undefined) {
      updateData.industry_level2_id = input.industryLevel2Id;
    }
    if (input.salaryMin !== undefined) {
      updateData.salary_min = input.salaryMin.toString();
    }
    if (input.salaryMax !== undefined) {
      updateData.salary_max = input.salaryMax.toString();
    }
    if (input.cityId) updateData.city_id = input.cityId;
    if (input.workExperienceRequired !== undefined) {
      updateData.work_experience_required = input.workExperienceRequired;
    }
    if (input.educationRequired) {
      updateData.education_required = input.educationRequired;
    }
    if (input.positionCount) updateData.position_count = input.positionCount;
    if (input.status) updateData.status = input.status;
    if (input.expiredAt) updateData.expired_at = input.expiredAt.toISOString();

    // 更新职位
    const { data: updated, error } = await supabase
      .from("job_positions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return {
        success: false,
        error: `更新职位失败: ${error?.message || "未知错误"}`,
        code: "INTERNAL_ERROR",
      };
    }

    return { success: true, job: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        code: "VALIDATION_ERROR",
      };
    }
    if (error instanceof NotFoundError) {
      return { success: false, error: error.message, code: "NOT_FOUND" };
    }
    const errorMessage = error instanceof Error ? error.message : "更新职位失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 删除职位
 */
export async function deleteJob(id: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "未登录", code: "UNAUTHORIZED" };
    }

    const company = await getCompanyByUserId(userId);
    if (!company) {
      return { success: false, error: "您不是企业用户", code: "UNAUTHORIZED" };
    }

    const supabase = createAdminClient();

    // 检查职位是否存在，并验证是否属于当前企业
    const { data: existing, error: fetchError } = await supabase
      .from("job_positions")
      .select("id, company_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "职位不存在", code: "NOT_FOUND" };
    }

    // 验证职位是否属于当前企业
    if (existing.company_id !== company.id) {
      return { success: false, error: "无权删除此职位", code: "UNAUTHORIZED" };
    }

    // 删除职位技能关联
    const { error: skillError } = await supabase
      .from("job_skills")
      .delete()
      .eq("job_position_id", id);

    if (skillError) {
      console.error("删除职位技能关联失败:", skillError);
      // 继续删除职位，即使技能删除失败
    }

    // 删除职位
    const { error } = await supabase
      .from("job_positions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("删除职位失败:", error);
      return {
        success: false,
        error: `删除职位失败: ${error.message}`,
        code: "INTERNAL_ERROR",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("删除职位时发生错误:", error);
    const errorMessage = error instanceof Error ? error.message : "删除职位失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}
