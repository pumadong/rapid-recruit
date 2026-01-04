import { NextResponse } from "next/server";
import { getTokenPayload } from "@/server/queries/session";
import { getCompanyByUserId } from "@/server/queries/users";
import { getCityById, getCitiesByProvinceId } from "@/server/queries/locations";
import { getIndustriesLevel1, getIndustriesLevel2ByLevel1Id } from "@/server/queries/industries";

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

    let initialProvinceId: number | undefined;
    let initialCities: Array<{ id: number; name: string; province_id: number }> = [];

    if (company.cityId) {
      const city = await getCityById(company.cityId);
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

    if (company.industryLevel1Id) {
      initialIndustriesLevel2 = await getIndustriesLevel2ByLevel1Id(company.industryLevel1Id);
    }

    return NextResponse.json({
      company,
      initialProvinceId,
      initialCities,
      industriesLevel1,
      initialIndustriesLevel2,
    });
  } catch (error: any) {
    console.error("Error fetching new job data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}

