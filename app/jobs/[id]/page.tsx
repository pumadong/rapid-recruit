import { JobDetailContent } from "@/components/job-detail-content";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetailContent jobId={id} />;
}
