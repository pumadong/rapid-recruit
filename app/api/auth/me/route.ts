import { NextResponse } from "next/server";
import { getCurrentUser, getCurrentUserName } from "@/server/queries/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const userName = await getCurrentUserName();
    
    return NextResponse.json({
      user: {
        id: user.id,
        userName,
        userType: user.userType,
      },
    });
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ user: null });
  }
}

