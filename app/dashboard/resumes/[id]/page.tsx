import { ResumeDetailPageContent } from "@/components/resume-detail-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 简历详情页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGuard>
      <ResumeDetailPageContent applicationId={id} />
    </AuthGuard>
  );
}

