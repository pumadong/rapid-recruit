import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/server/queries/session";

export async function GET() {
  try {
    const userProfile = await getCurrentUserWithProfile();
    if (!userProfile || userProfile.user.userType !== "talent") {
      return NextResponse.json(
        { error: "未登录或不是人才用户", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    return NextResponse.json({ userProfile });
  } catch (error: any) {
    console.error("Error fetching talent profile:", error);
    return NextResponse.json(
      { error: "获取用户信息失败", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

