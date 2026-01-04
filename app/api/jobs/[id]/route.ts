import { NextResponse } from "next/server";
import { getJobById } from "@/server/queries/jobs";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getJobById(parseInt(id));
    
    // 转换日期为字符串格式，以便客户端使用
    const jobData = {
      ...job,
      publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
      expiredAt: job.expiredAt ? job.expiredAt.toISOString() : null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
    
    return NextResponse.json({ job: jobData });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
