import { NextResponse } from "next/server";
import { createJob } from "@/server/actions/jobs";
import { getCurrentUserId } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const company = await getCompanyByUserId(userId);
    if (!company) {
      return NextResponse.json({ success: false, error: "您不是企业用户", code: "UNAUTHORIZED" }, { status: 403 });
    }

    const body = await request.json();
    const result = await createJob({
      ...body,
      companyId: company.id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { success: false, error: error.message || "创建职位失败", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

