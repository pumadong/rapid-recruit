import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserIdFromToken } from "@/server/utils/auth";
import { extractTokenFromHeader } from "@/lib/token";
import { z } from "zod";

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
    
    const cityIdValue = body.cityId;
    if (!cityIdValue) {
      return NextResponse.json(
        { error: "所在地区不能为空", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const data = {
      companyName: body.companyName || undefined,
      companySize: body.companySize === "null" || body.companySize === null ? null : body.companySize || undefined,
      cityId: parseInt(String(cityIdValue)),
      industryLevel1Id: body.industryLevel1Id ? parseInt(String(body.industryLevel1Id)) : undefined,
      industryLevel2Id: body.industryLevel2Id === "null" || body.industryLevel2Id === null ? null : (body.industryLevel2Id ? parseInt(String(body.industryLevel2Id)) : undefined),
      description: body.description || undefined,
      logo: body.logo || undefined,
      website: body.website || undefined,
      businessLicense: body.businessLicense || undefined,
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
      return NextResponse.json(
        { error: "企业信息不存在", code: "NOT_FOUND" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: `更新失败: ${error.message}`, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating company profile:", error);
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

