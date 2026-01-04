import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { getJobsByCompanyId } from "@/server/queries/jobs";

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

    const jobs = await getJobsByCompanyId(company.id);

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: error.message },
      { status: 500 }
    );
  }
}

