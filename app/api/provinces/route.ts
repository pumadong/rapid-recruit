import { NextResponse } from "next/server";
import { getProvinces } from "@/server/queries/locations";

export async function GET() {
  try {
    const provinces = await getProvinces();
    return NextResponse.json(provinces);
  } catch (error: any) {
    // 网络超时错误时返回空数组，而不是错误
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      console.warn("获取省份列表超时，返回空数组");
      return NextResponse.json([]);
    }
    
    // 其他错误返回错误信息
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

