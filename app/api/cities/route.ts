import { NextResponse } from "next/server";
import { getCitiesByProvinceId } from "@/server/queries/locations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get("provinceId");
    
    const cities = await getCitiesByProvinceId(
      provinceId ? parseInt(provinceId) : undefined
    );
    
    return NextResponse.json(cities);
  } catch (error: any) {
    // 网络超时错误时返回空数组，而不是错误
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      console.warn("获取城市列表超时，返回空数组");
      return NextResponse.json([]);
    }
    
    // 其他错误返回错误信息
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

