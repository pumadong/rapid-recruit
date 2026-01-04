import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";
import { createAdminClient } from "@/lib/supabase/admin";

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
      return NextResponse.json({ hasApplied: false });
    }

    const talent = await getTalentByUserId(payload.userId);
    if (!talent) {
      return NextResponse.json({ hasApplied: false });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("talent_id", talent.id)
      .eq("job_position_id", parseInt(jobId))
      .maybeSingle();

    if (error) {
      console.error("Error checking application:", error);
      return NextResponse.json({ hasApplied: false });
    }

    return NextResponse.json({ hasApplied: data !== null });
  } catch (error: any) {
    console.error("Error checking application:", error);
    return NextResponse.json({ hasApplied: false });
  }
}

