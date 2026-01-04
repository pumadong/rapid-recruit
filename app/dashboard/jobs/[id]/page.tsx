import { EditJobPageContent } from "@/components/edit-job-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 编辑职位页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGuard>
      <EditJobPageContent jobId={id} />
    </AuthGuard>
  );
}

