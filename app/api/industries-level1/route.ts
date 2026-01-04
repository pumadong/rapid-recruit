import { NextResponse } from "next/server";
import { getIndustriesLevel1 } from "@/server/queries/industries";

export async function GET() {
  try {
    const industries = await getIndustriesLevel1();
    return NextResponse.json(industries);
  } catch (error: any) {
    // 网络超时错误时返回空数组
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      console.warn("获取一级行业列表超时，返回空数组");
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

