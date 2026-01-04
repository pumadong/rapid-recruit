import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected", "withdrawn"]),
  companyReply: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateApplicationSchema.parse(body);

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
      return NextResponse.json({ error: "申请不存在" }, { status: 404 });
    }

    // 获取当前用户的企业信息
    const company = await getCompanyByUserId(payload.userId);
    if (!company) {
      return NextResponse.json({ error: "您不是企业用户" }, { status: 403 });
    }

    // 验证职位是否属于当前企业
    const jobPosition = (application as any).job_positions;
    if (!jobPosition || jobPosition.company_id !== company.id) {
      return NextResponse.json({ error: "无权操作此申请" }, { status: 403 });
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
      return NextResponse.json(
        { error: `更新失败: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating application status:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "更新失败，请稍后重试" },
      { status: 500 }
    );
  }
}

