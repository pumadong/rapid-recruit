import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getUserById } from "@/server/queries/users";
import { getTalentByUserId, getCompanyByUserId } from "@/server/queries/users";

export async function GET(request: Request) {
  try {
    console.log("API /auth/me: Received request");
    const payload = await getTokenPayload();
    console.log("API /auth/me: Token payload:", payload ? `userId=${payload.userId}, userType=${payload.userType}` : "null");
    
    if (!payload) {
      console.log("API /auth/me: No payload, returning null user");
      return NextResponse.json({ user: null });
    }

    const user = await getUserById(payload.userId);
    console.log("API /auth/me: User found:", user ? `id=${user.id}, type=${user.userType}` : "null");
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    let userName: string | null = null;
    if (user.userType === "talent") {
      const talent = await getTalentByUserId(payload.userId);
      userName = talent?.realName || null;
    } else {
      const company = await getCompanyByUserId(payload.userId);
      userName = company?.companyName || null;
    }
    
    console.log("API /auth/me: Returning user:", { id: user.id, userName, userType: user.userType });
    return NextResponse.json({
      user: {
        id: user.id,
        userName,
        userType: user.userType,
      },
    });
  } catch (error: any) {
    console.error("API /auth/me: Error fetching current user:", error);
    return NextResponse.json({ user: null });
  }
}

