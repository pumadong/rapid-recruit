import { NewJobPageContent } from "@/components/new-job-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 发布新职位页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function NewJobPage() {
  return (
    <AuthGuard>
      <NewJobPageContent />
    </AuthGuard>
  );
}

