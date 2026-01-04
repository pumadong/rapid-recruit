import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const toggleFavoriteSchema = z.object({
  jobId: z.number().int().positive(),
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
    const validated = toggleFavoriteSchema.parse(body);

    const supabase = createAdminClient();

    // 检查是否已收藏
    const { data: existing, error: checkError } = await supabase
      .from("job_favorites")
      .select("id")
      .eq("talent_id", talent.id)
      .eq("job_position_id", validated.jobId)
      .maybeSingle();

    // 如果表不存在，返回友好的错误信息
    if (checkError && (checkError.code === "PGRST116" || checkError.message.includes("does not exist") || checkError.message.includes("schema cache"))) {
      return NextResponse.json(
        { error: "收藏功能暂不可用，请先创建 job_favorites 表" },
        { status: 503 }
      );
    }

    if (checkError) {
      return NextResponse.json(
        { error: `检查收藏状态失败: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from("job_favorites")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json(
          { error: `取消收藏失败: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      // 添加收藏
      const { error } = await supabase
        .from("job_favorites")
        .insert({
          talent_id: talent.id,
          job_position_id: validated.jobId,
        });

      if (error) {
        // 如果表不存在，返回友好的错误信息
        if (error.code === "PGRST116" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
          return NextResponse.json(
            { error: "收藏功能暂不可用，请先创建 job_favorites 表" },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          { error: `收藏失败: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "操作失败，请稍后重试";
    
    // 检查是否是表不存在的错误
    if (errorMessage.includes("does not exist") || errorMessage.includes("schema cache")) {
      return NextResponse.json(
        { error: "收藏功能暂不可用，请先创建 job_favorites 表" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

