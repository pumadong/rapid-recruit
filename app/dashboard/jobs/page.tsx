import { JobsPageContent } from "@/components/jobs-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 职位管理页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function JobsPage() {
  return (
    <AuthGuard>
      <JobsPageContent />
    </AuthGuard>
  );
}

