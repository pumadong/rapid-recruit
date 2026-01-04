import { FavoritesPageContent } from "@/components/favorites-page-content";
import { AuthGuard } from "@/components/auth-guard";

/**
 * 我的收藏页面
 * 显示求职者收藏的所有职位
 */
export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesPageContent />
    </AuthGuard>
  );
}

