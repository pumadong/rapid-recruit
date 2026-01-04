"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError, ValidationError, UnauthorizedError, ConflictError } from "@/lib/errors";
import type { CreateApplicationInput, UpdateApplicationInput } from "@/types/application";
import { z } from "zod";
import { getCurrentUserId } from "@/server/queries/session";
import { getCompanyByUserId, getTalentByUserId } from "@/server/queries/users";
import { hasApplied } from "@/server/queries/applications";

const createApplicationSchema = z.object({
  talentId: z.number().int().positive(),
  jobPositionId: z.number().int().positive(),
});

const updateApplicationSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected", "withdrawn"]),
  companyReply: z.string().optional(),
});

/**
 * 创建职位申请（人才操作）
 */
export async function createApplication(
  talentId: number,
  jobPositionId: number
) {
  try {
    // 验证输入
    const validated = createApplicationSchema.parse({
      talentId,
      jobPositionId,
    });

    const supabase = createAdminClient();

    // 检查人才是否存在（talentId 是 talents 表的 id）
    const { data: talent, error: talentError } = await supabase
      .from("talents")
      .select("id")
      .eq("id", validated.talentId)
      .single();

    if (talentError || !talent) {
      return { success: false, error: "人才信息不存在", code: "NOT_FOUND" };
    }

    // 检查职位是否存在
    const { data: job, error: jobError } = await supabase
      .from("job_positions")
      .select("id, status")
      .eq("id", validated.jobPositionId)
      .single();

    if (jobError || !job) {
      return { success: false, error: "职位不存在", code: "NOT_FOUND" };
    }

    // 检查职位是否已发布
    if (job.status !== "published") {
      return { success: false, error: "该职位暂不接受申请", code: "VALIDATION_ERROR" };
    }

    // 检查是否已经申请过
    const alreadyApplied = await hasApplied(validated.talentId, validated.jobPositionId);
    if (alreadyApplied) {
      return { success: false, error: "您已经申请过该职位", code: "CONFLICT" };
    }

    // 创建申请
    const { data: application, error: appError } = await supabase
      .from("applications")
      .insert({
        talent_id: validated.talentId,
        job_position_id: validated.jobPositionId,
        status: "pending",
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError || !application) {
      console.error("创建申请失败:", appError);
      return {
        success: false,
        error: `申请失败: ${appError?.message || "未知错误"}`,
        code: "INTERNAL_ERROR",
      };
    }

    return { success: true, applicationId: application.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        code: "VALIDATION_ERROR",
      };
    }
    const errorMessage = error instanceof Error ? error.message : "申请失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 更新应聘状态（企业操作）
 */
export async function updateApplicationStatus(
  applicationId: number,
  input: UpdateApplicationInput
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "未登录", code: "UNAUTHORIZED" };
    }

    // 验证输入
    const validated = updateApplicationSchema.parse(input);

    const supabase = createAdminClient();

    // 获取申请信息，确认职位属于当前企业
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        job_positions!inner(
          id,
          company_id
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "申请不存在", code: "NOT_FOUND" };
    }

    // 获取当前用户的企业信息
    const company = await getCompanyByUserId(userId);
    if (!company) {
      return { success: false, error: "您不是企业用户", code: "UNAUTHORIZED" };
    }

    // 验证职位是否属于当前企业
    const jobPosition = (application as any).job_positions;
    if (!jobPosition || jobPosition.company_id !== company.id) {
      return {
        success: false,
        error: "无权操作此申请",
        code: "UNAUTHORIZED",
      };
    }

    // 更新申请状态
    const updateData: any = {
      status: validated.status,
      updated_at: new Date().toISOString(),
    };

    // 如果状态变为已审核、已接受或已拒绝，记录审核时间
    if (["reviewed", "accepted", "rejected"].includes(validated.status)) {
      updateData.reviewed_at = new Date().toISOString();
    }

    // 如果有企业回复，记录回复信息
    if (validated.companyReply) {
      updateData.company_reply = validated.companyReply;
      updateData.reply_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", applicationId);

    if (updateError) {
      console.error("更新申请状态失败:", updateError);
      return {
        success: false,
        error: `更新失败: ${updateError.message}`,
        code: "INTERNAL_ERROR",
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message,
        code: "VALIDATION_ERROR",
      };
    }
    const errorMessage = error instanceof Error ? error.message : "更新失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}
