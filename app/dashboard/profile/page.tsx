import { ProfilePageContent } from "@/components/profile-page-content";

/**
 * 个人信息管理页面
 * 使用客户端组件来获取用户数据（因为 token 在 localStorage 中）
 */
export default function ProfilePage() {
  return <ProfilePageContent />;
}

