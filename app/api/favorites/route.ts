import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ isFavorite: false });
    }

    const talent = await getTalentByUserId(payload.userId);
    if (!talent) {
      return NextResponse.json({ isFavorite: false });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("job_favorites")
      .select("id")
      .eq("talent_id", talent.id)
      .eq("job_position_id", parseInt(jobId))
      .maybeSingle();

    if (error) {
      // 如果表不存在，返回未收藏（不显示错误）
      if (error.code === "PGRST116" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ isFavorite: false });
      }
      // 其他错误也返回未收藏，避免影响用户体验
      console.error("Error checking favorite:", error);
      return NextResponse.json({ isFavorite: false });
    }

    return NextResponse.json({ isFavorite: data !== null });
  } catch (error: any) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ isFavorite: false });
  }
}

