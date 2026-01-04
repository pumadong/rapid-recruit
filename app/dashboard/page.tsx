import { DashboardContent } from "@/components/dashboard-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * Dashboard 页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

