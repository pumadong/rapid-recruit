import { ResumesPageContent } from "@/components/resumes-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 简历筛选页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function ResumesPage() {
  return (
    <AuthGuard>
      <ResumesPageContent />
    </AuthGuard>
  );
}

