import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/server/queries/session";
import { getIndustriesLevel1, getIndustriesLevel2ByLevel1Id } from "@/server/queries/industries";
import { getCityById, getCitiesByProvinceId } from "@/server/queries/locations";

export async function GET() {
  try {
    const userProfile = await getCurrentUserWithProfile();
    if (!userProfile || userProfile.user.userType !== "company") {
      return NextResponse.json(
        { error: "未登录或不是企业用户", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { company } = userProfile;
    
    // 根据城市ID获取城市信息，然后获取该省份的城市列表
    let initialProvinceId: number | undefined;
    let cities: Array<{ id: number; name: string; province_id: number }> = [];
    if (company?.cityId) {
      const city = await getCityById(company.cityId);
      if (city && city.province_id) {
        initialProvinceId = city.province_id;
        cities = await getCitiesByProvinceId(city.province_id);
      }
    }
    const industriesLevel1 = await getIndustriesLevel1();
    const industriesLevel2 = company?.industryLevel1Id 
      ? await getIndustriesLevel2ByLevel1Id(company.industryLevel1Id)
      : [];

    return NextResponse.json({
      company,
      initialProvinceId,
      cities,
      industriesLevel1,
      industriesLevel2,
    });
  } catch (error: any) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "获取用户信息失败", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

