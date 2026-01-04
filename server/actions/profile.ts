"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/server/queries/session";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";
import { getUserIdFromToken } from "@/server/utils/auth";

// 更新人才信息验证
const updateTalentSchema = z.object({
  realName: z.string().min(1, "真实姓名不能为空").max(50).optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  birthDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  cityId: z.number().int().positive().nullable().optional(),
  workExperienceYears: z.number().int().min(0).optional(),
  education: z.enum(["high_school", "associate", "bachelor", "master", "phd"]).nullable().optional(),
  major: z.string().max(100).nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
});

// 更新企业信息验证
const updateCompanySchema = z.object({
  companyName: z.string().min(1, "企业名称不能为空").max(100).optional(),
  companySize: z.string().max(50).nullable().optional(),
  cityId: z.number().int().positive(), // 企业地区必填，不能为可选
  industryLevel1Id: z.number().int().positive().optional(),
  industryLevel2Id: z.number().int().positive().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  logo: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  businessLicense: z.string().max(255).nullable().optional(),
});

/**
 * 更新人才信息
 * @param formData 表单数据
 * @param userId 可选的用户ID（如果从 API 路由调用，可以传递 userId）
 */
export async function updateTalentProfile(formData: FormData, userId?: number) {
  try {
    // 如果没有传递 userId，尝试从请求头获取
    if (!userId) {
      userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: "未登录", code: "UNAUTHORIZED" };
      }
    }

    const cityIdValue = formData.get("cityId");
    
    const data = {
      realName: formData.get("realName") || undefined,
      gender: formData.get("gender") === "null" ? null : formData.get("gender") || undefined,
      birthDate: formData.get("birthDate") || undefined,
      cityId: cityIdValue && cityIdValue !== "" ? parseInt(cityIdValue as string) : null,
      workExperienceYears: formData.get("workExperienceYears") ? parseInt(formData.get("workExperienceYears") as string) : undefined,
      education: formData.get("education") === "null" ? null : formData.get("education") || undefined,
      major: formData.get("major") || undefined,
      bio: formData.get("bio") || undefined,
      avatar: formData.get("avatar") || undefined,
    };

    const validated = updateTalentSchema.parse(data);

    const supabase = createAdminClient();

    // 获取人才 ID
    const { data: talentData } = await supabase
      .from("talents")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!talentData) {
      return { success: false, error: "人才信息不存在", code: "NOT_FOUND" };
    }

    // 更新人才信息
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validated.realName !== undefined) updateData.real_name = validated.realName;
    if (validated.gender !== undefined) updateData.gender = validated.gender;
    if (validated.birthDate !== undefined) updateData.birth_date = validated.birthDate?.toISOString() || null;
    if (validated.cityId !== undefined) updateData.city_id = validated.cityId;
    if (validated.workExperienceYears !== undefined) updateData.work_experience_years = validated.workExperienceYears;
    if (validated.education !== undefined) updateData.education = validated.education;
    if (validated.major !== undefined) updateData.major = validated.major;
    if (validated.bio !== undefined) updateData.bio = validated.bio;
    if (validated.avatar !== undefined) updateData.avatar = validated.avatar;

    const { error } = await supabase
      .from("talents")
      .update(updateData)
      .eq("id", talentData.id);

    if (error) {
      console.error("更新人才信息失败:", error);
      return { success: false, error: `更新失败: ${error.message}`, code: "INTERNAL_ERROR" };
    }

    return { success: true };
  } catch (error) {
    console.error("更新人才信息出错:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message, code: "VALIDATION_ERROR" };
    }
    const errorMessage = error instanceof Error ? error.message : "更新失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 更新企业信息
 * @param formData 表单数据
 * @param userId 可选的用户ID（如果从 API 路由调用，可以传递 userId）
 */
export async function updateCompanyProfile(formData: FormData, userId?: number) {
  try {
    // 如果没有传递 userId，尝试从请求头获取
    if (!userId) {
      userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: "未登录", code: "UNAUTHORIZED" };
      }
    }

    const cityIdValue = formData.get("cityId");
    if (!cityIdValue) {
      return { success: false, error: "所在地区不能为空", code: "VALIDATION_ERROR" };
    }

    const data = {
      companyName: formData.get("companyName") || undefined,
      companySize: formData.get("companySize") === "null" ? null : formData.get("companySize") || undefined,
      cityId: parseInt(cityIdValue as string),
      industryLevel1Id: formData.get("industryLevel1Id") ? parseInt(formData.get("industryLevel1Id") as string) : undefined,
      industryLevel2Id: formData.get("industryLevel2Id") === "null" ? null : (formData.get("industryLevel2Id") ? parseInt(formData.get("industryLevel2Id") as string) : undefined),
      description: formData.get("description") || undefined,
      logo: formData.get("logo") || undefined,
      website: formData.get("website") || undefined,
      businessLicense: formData.get("businessLicense") || undefined,
    };

    const validated = updateCompanySchema.parse(data);

    const supabase = createAdminClient();

    // 获取企业 ID
    const { data: companyData } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!companyData) {
      return { success: false, error: "企业信息不存在", code: "NOT_FOUND" };
    }

    // 更新企业信息
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validated.companyName !== undefined) updateData.company_name = validated.companyName;
    if (validated.companySize !== undefined) updateData.company_size = validated.companySize;
    // 企业地区必填，总是更新
    updateData.city_id = validated.cityId;
    if (validated.industryLevel1Id !== undefined) updateData.industry_level1_id = validated.industryLevel1Id;
    if (validated.industryLevel2Id !== undefined) updateData.industry_level2_id = validated.industryLevel2Id;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.logo !== undefined) updateData.logo = validated.logo;
    if (validated.website !== undefined) updateData.website = validated.website;
    if (validated.businessLicense !== undefined) updateData.business_license = validated.businessLicense;

    const { error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", companyData.id);

    if (error) {
      console.error("更新企业信息失败:", error);
      return { success: false, error: `更新失败: ${error.message}`, code: "INTERNAL_ERROR" };
    }

    return { success: true };
  } catch (error) {
    console.error("更新企业信息出错:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message, code: "VALIDATION_ERROR" };
    }
    const errorMessage = error instanceof Error ? error.message : "更新失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

