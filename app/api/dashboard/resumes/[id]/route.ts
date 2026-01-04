import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getCompanyByUserId(payload.userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const supabase = createAdminClient();

    // 获取申请信息，包含人才和职位信息
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        job_positions!inner(
          id,
          position_name,
          company_id,
          companies!inner(
            company_name
          )
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "申请不存在" }, { status: 404 });
    }

    // 验证职位是否属于当前企业
    const jobPosition = (application as any).job_positions;
    if (!jobPosition || jobPosition.company_id !== company.id) {
      return NextResponse.json({ error: "无权查看此申请" }, { status: 403 });
    }

    // 获取人才信息
    const talentId = (application as any).talent_id;
    const { data: talent, error: talentError } = await supabase
      .from("talents")
      .select(`
        *,
        cities(
          id,
          name,
          provinces(
            id,
            name
          )
        )
      `)
      .eq("id", talentId)
      .single();

    if (talentError || !talent) {
      return NextResponse.json({ error: "人才信息不存在" }, { status: 404 });
    }

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        appliedAt: application.applied_at,
        reviewedAt: application.reviewed_at,
        companyReply: application.company_reply,
        talent: talent ? {
          real_name: talent.real_name,
          gender: talent.gender,
          birth_date: talent.birth_date,
          work_experience_years: talent.work_experience_years,
          education: talent.education,
          major: talent.major,
          bio: talent.bio,
          avatar: talent.avatar,
          city: talent.cities ? {
            name: talent.cities.name,
            province: talent.cities.provinces ? {
              name: talent.cities.provinces.name,
            } : undefined,
          } : undefined,
        } : undefined,
        jobPosition: {
          id: jobPosition.id,
          position_name: jobPosition.position_name,
          company: jobPosition.companies ? {
            company_name: jobPosition.companies.company_name,
          } : undefined,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application", details: error.message },
      { status: 500 }
    );
  }
}

