import { ApplicationsPageContent } from "@/components/applications-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 我的申请页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function ApplicationsPage() {
  return (
    <AuthGuard>
      <ApplicationsPageContent />
    </AuthGuard>
  );
}

