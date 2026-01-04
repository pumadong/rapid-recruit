import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createApplicationSchema = z.object({
  jobPositionId: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const talent = await getTalentByUserId(payload.userId);
    if (!talent) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = createApplicationSchema.parse(body);

    const supabase = createAdminClient();

    // 检查职位是否存在
    const { data: job, error: jobError } = await supabase
      .from("job_positions")
      .select("id, status")
      .eq("id", validated.jobPositionId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "职位不存在" }, { status: 404 });
    }

    // 检查职位是否已发布
    if (job.status !== "published") {
      return NextResponse.json({ error: "该职位暂不接受申请" }, { status: 400 });
    }

    // 检查是否已经申请过
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("talent_id", talent.id)
      .eq("job_position_id", validated.jobPositionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "您已经申请过该职位" }, { status: 409 });
    }

    // 创建申请
    const { data: application, error: appError } = await supabase
      .from("applications")
      .insert({
        talent_id: talent.id,
        job_position_id: validated.jobPositionId,
        status: "pending",
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError || !application) {
      console.error("创建申请失败:", appError);
      return NextResponse.json(
        { error: `申请失败: ${appError?.message || "未知错误"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error: any) {
    console.error("Error creating application:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "申请失败，请稍后重试" },
      { status: 500 }
    );
  }
}

