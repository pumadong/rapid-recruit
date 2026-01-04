import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getUserById } from "@/server/queries/users";
import { getTalentByUserId } from "@/server/queries/users";
import { getCompanyByUserId } from "@/server/queries/users";

export async function GET(request: Request) {
  try {
    console.log("API /auth/profile: Received request");
    const payload = await getTokenPayload();
    console.log("API /auth/profile: Token payload:", payload ? `userId=${payload.userId}, userType=${payload.userType}` : "null");
    
    if (!payload) {
      console.log("API /auth/profile: No payload, returning 401");
      return NextResponse.json({ userProfile: null }, { status: 401 });
    }

    const user = await getUserById(payload.userId);
    console.log("API /auth/profile: User found:", user ? `id=${user.id}, type=${user.userType}` : "null");
    
    if (!user) {
      console.log("API /auth/profile: User not found, returning 404");
      return NextResponse.json({ userProfile: null }, { status: 404 });
    }

    let userProfile;
    if (user.userType === "talent") {
      const talent = await getTalentByUserId(payload.userId);
      console.log("API /auth/profile: Talent found:", talent ? `id=${talent.id}` : "null");
      userProfile = { user, talent };
    } else {
      const company = await getCompanyByUserId(payload.userId);
      console.log("API /auth/profile: Company found:", company ? `id=${company.id}` : "null");
      userProfile = { user, company };
    }

    console.log("API /auth/profile: Returning user profile");
    return NextResponse.json({ userProfile });
  } catch (error: any) {
    console.error("API /auth/profile: Error fetching user profile:", error);
    console.error("API /auth/profile: Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json({ userProfile: null }, { status: 500 });
  }
}
