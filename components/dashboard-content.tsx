"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, User, Building2, FileText, Heart } from "lucide-react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";

interface UserProfile {
  user: {
    id: number;
    phone: string;
    userType: "talent" | "company";
    createdAt: string;
    updatedAt: string;
  };
  talent?: {
    id: number;
    userId: number;
    realName: string;
    cityId?: number;
  };
  company?: {
    id: number;
    userId: number;
    companyName: string;
    verificationStatus: string;
  };
}

export function DashboardContent() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const authHeader = getAuthHeader();
        console.log("DashboardContent: Checking auth header:", authHeader ? "exists" : "missing");
        if (!authHeader) {
          console.log("DashboardContent: No auth header, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("DashboardContent: Fetching user profile...");
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: authHeader,
          },
          cache: "no-store", // 确保每次都获取最新数据
        });

        console.log("DashboardContent: Response status:", response.status);

        if (response.status === 401 || response.status === 403) {
          // Token 无效或过期，清除本地 token 并重定向
          console.log("DashboardContent: Token invalid, clearing and redirecting");
          const { removeToken } = await import("@/lib/auth-client");
          removeToken();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          console.error("DashboardContent: Failed to fetch user profile:", response.status, response.statusText);
          const errorText = await response.text();
          console.error("DashboardContent: Error response:", errorText);
          router.push("/login");
          return;
        }

        const data = await response.json();
        console.log("DashboardContent: User profile data:", data);
        if (data.userProfile) {
          setUserProfile(data.userProfile);
        } else {
          // 如果没有用户数据，清除 token 并重定向
          console.log("DashboardContent: No user profile in response, clearing token");
          const { removeToken } = await import("@/lib/auth-client");
          removeToken();
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    // 添加小延迟确保 localStorage 已完全加载
    const timer = setTimeout(() => {
      fetchUserProfile();
    }, 100); // 延迟 100ms 确保 localStorage 已加载

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const { user, talent, company } = userProfile;
  const displayName = user.userType === "talent" 
    ? talent?.realName || "求职者"
    : company?.companyName || "企业";

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* 欢迎区域 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">欢迎回来，{displayName}</h1>
            <p className="text-muted-foreground">
              {user.userType === "talent" 
                ? "在这里管理您的简历、申请记录和求职进度"
                : "在这里管理您的职位发布、招聘进度和企业信息"}
            </p>
          </div>

          {/* 快捷操作卡片 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {user.userType === "talent" ? (
              <>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">我的简历</CardTitle>
                        <CardDescription>查看和编辑个人简历</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/profile">管理简历</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Briefcase className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">我的申请</CardTitle>
                        <CardDescription>查看申请记录和状态</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/applications">查看申请</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Heart className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">我的收藏</CardTitle>
                        <CardDescription>查看收藏的职位</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/favorites">查看收藏</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <User className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">个人中心</CardTitle>
                        <CardDescription>管理个人信息和设置</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/profile">个人设置</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">职位管理</CardTitle>
                        <CardDescription>发布和管理招聘职位</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/jobs">管理职位</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <User className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">简历筛选</CardTitle>
                        <CardDescription>查看和筛选收到的简历</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/resumes">查看简历</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Building2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">企业信息</CardTitle>
                        <CardDescription>管理企业资料和认证</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/dashboard/company">企业设置</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>账户信息</CardTitle>
              <CardDescription>您的账户基本信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">用户类型</span>
                  <span className="text-sm">{user.userType === "talent" ? "求职者" : "企业"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">手机号</span>
                  <span className="text-sm">{user.phone}</span>
                </div>
                {user.userType === "talent" && talent && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">真实姓名</span>
                      <span className="text-sm">{talent.realName}</span>
                    </div>
                    {talent.cityId && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm font-medium text-muted-foreground">所在城市</span>
                        <span className="text-sm">ID: {talent.cityId}</span>
                      </div>
                    )}
                  </>
                )}
                {user.userType === "company" && company && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">企业名称</span>
                      <span className="text-sm">{company.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">认证状态</span>
                      <span className="text-sm">
                        {company.verificationStatus === "verified" ? "已认证" : "未认证"}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">注册时间</span>
                  <span className="text-sm">{new Date(user.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

