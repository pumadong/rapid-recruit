import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { getJobById } from "@/server/queries/jobs";
import { getCityById, getCitiesByProvinceId } from "@/server/queries/locations";
import { getIndustriesLevel1, getIndustriesLevel2ByLevel1Id } from "@/server/queries/industries";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getTokenPayload();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getCompanyByUserId(payload.userId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 获取职位信息
    let job;
    try {
      job = await getJobById(parseInt(id));
    } catch (error) {
      if (error instanceof NotFoundError) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      throw error;
    }

    // 验证职位是否属于当前企业
    if (job.companyId !== company.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let initialProvinceId: number | undefined;
    let initialCities: Array<{ id: number; name: string; province_id: number }> = [];

    if (job.cityId) {
      const city = await getCityById(job.cityId);
      if (city) {
        initialProvinceId = city.province_id;
        initialCities = await getCitiesByProvinceId(initialProvinceId);
      }
    }

    const industriesLevel1 = await getIndustriesLevel1();
    let initialIndustriesLevel2: Array<{
      id: number;
      name: string;
      industry_level1_id: number;
      code: string;
    }> = [];

    if (job.industryLevel1Id) {
      initialIndustriesLevel2 = await getIndustriesLevel2ByLevel1Id(job.industryLevel1Id);
    }

    return NextResponse.json({
      company,
      job,
      initialProvinceId,
      initialCities,
      industriesLevel1,
      initialIndustriesLevel2,
    });
  } catch (error: any) {
    console.error("Error fetching edit job data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}

