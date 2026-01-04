import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserIdFromToken } from "@/server/utils/auth";
import { extractTokenFromHeader } from "@/lib/token";
import { z } from "zod";

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

export async function PUT(request: Request) {
  try {
    // 从请求头获取 token
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: "未登录", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "无效的 token", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    
    // 处理 cityId（可能是字符串或数字）
    const cityIdValue = body.cityId;
    const data = {
      realName: body.realName || undefined,
      gender: body.gender === "null" || body.gender === null ? null : body.gender || undefined,
      birthDate: body.birthDate || undefined,
      cityId: cityIdValue && cityIdValue !== "" ? parseInt(String(cityIdValue)) : null,
      workExperienceYears: body.workExperienceYears ? parseInt(String(body.workExperienceYears)) : undefined,
      education: body.education === "null" || body.education === null ? null : body.education || undefined,
      major: body.major || undefined,
      bio: body.bio || undefined,
      avatar: body.avatar || undefined,
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
      return NextResponse.json(
        { error: "人才信息不存在", code: "NOT_FOUND" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: `更新失败: ${error.message}`, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating talent profile:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "更新失败，请稍后重试", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
