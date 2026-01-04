import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { getApplicationsByCompanyId } from "@/server/queries/applications";

export async function GET(request: Request) {
  try {
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getCompanyByUserId(payload.userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const applications = await getApplicationsByCompanyId(
      company.id,
      status || undefined
    );

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications", details: error.message },
      { status: 500 }
    );
  }
}

