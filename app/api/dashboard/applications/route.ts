import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";
import { getApplicationsByTalentId } from "@/server/queries/applications";

export async function GET(request: Request) {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const talent = await getTalentByUserId(payload.userId);
    if (!talent) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const allApplications = await getApplicationsByTalentId(talent.id);
    
    // 按状态筛选
    const applications = status
      ? allApplications.filter((item: any) => item.application.status === status)
      : allApplications;

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error.message },
      { status: 500 }
    );
  }
}

