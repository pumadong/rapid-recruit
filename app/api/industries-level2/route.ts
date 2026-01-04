import { NextResponse } from "next/server";
import { getIndustriesLevel2ByLevel1Id } from "@/server/queries/industries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level1Id = searchParams.get("level1Id");
    
    const industries = await getIndustriesLevel2ByLevel1Id(
      level1Id ? parseInt(level1Id) : undefined
    );
    
    return NextResponse.json(industries);
  } catch (error: any) {
    // 网络超时错误时返回空数组
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      console.warn("获取二级行业列表超时，返回空数组");
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

