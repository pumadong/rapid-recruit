import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getTalentByUserId } from "@/server/queries/users";
import { getFavoriteJobsByTalentId } from "@/server/queries/favorites";

export async function GET() {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const talent = await getTalentByUserId(payload.userId);
    if (!talent) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const favoriteJobs = await getFavoriteJobsByTalentId(talent.id);

    return NextResponse.json({ favoriteJobs });
  } catch (error: any) {
    console.error("Error fetching favorite jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite jobs" },
      { status: 500 }
    );
  }
}

