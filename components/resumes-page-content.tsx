"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Calendar, User } from "lucide-react";
import { ResumeActions } from "@/components/resume-actions";
import { AuthGuard } from "@/components/auth-guard";

interface Application {
  id: number;
  status: string;
  appliedAt: Date;
  reviewedAt?: Date;
  companyReply?: string;
  talent?: {
    real_name: string;
    gender?: string;
    work_experience_years?: number;
    education?: string;
    major?: string;
  };
  jobPosition?: {
    position_name: string;
  };
}

export function ResumesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        router.push("/login");
        return;
      }

      const url = status ? `/api/dashboard/resumes?status=${status}` : "/api/dashboard/resumes";
      const response = await fetch(url, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">待审核</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-500">已查看</Badge>;
      case "accepted":
        return <Badge className="bg-green-500">已接受</Badge>;
      case "rejected":
        return <Badge variant="destructive">已拒绝</Badge>;
      case "withdrawn":
        return <Badge variant="outline">已撤回</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">加载失败：{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">简历筛选</h1>
            <p className="text-muted-foreground">查看和管理收到的职位申请</p>
          </div>

          {/* 状态筛选 */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button variant={!status ? "default" : "outline"} asChild>
              <Link href="/dashboard/resumes">全部</Link>
            </Button>
            <Button variant={status === "pending" ? "default" : "outline"} asChild>
              <Link href="/dashboard/resumes?status=pending">待审核</Link>
            </Button>
            <Button variant={status === "reviewed" ? "default" : "outline"} asChild>
              <Link href="/dashboard/resumes?status=reviewed">已查看</Link>
            </Button>
            <Button variant={status === "accepted" ? "default" : "outline"} asChild>
              <Link href="/dashboard/resumes?status=accepted">已接受</Link>
            </Button>
            <Button variant={status === "rejected" ? "default" : "outline"} asChild>
              <Link href="/dashboard/resumes?status=rejected">已拒绝</Link>
            </Button>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">暂无简历申请</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((item: any) => {
                const application = item.application || item;
                const talent = item.talent;
                const jobPosition = item.jobPosition;
                return (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {talent?.real_name || "未知用户"}
                            </CardTitle>
                            {getStatusBadge(application.status)}
                          </div>
                          <CardDescription>
                            申请职位：{jobPosition?.position_name || "未知职位"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {talent && (
                          <div className="grid gap-4 md:grid-cols-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">性别：</span>
                              <span className="ml-2">
                                {talent.gender === "male"
                                  ? "男"
                                  : talent.gender === "female"
                                  ? "女"
                                  : "其他"}
                              </span>
                            </div>
                            {talent.work_experience_years !== null && talent.work_experience_years !== undefined && (
                              <div>
                                <span className="text-muted-foreground">工作经验：</span>
                                <span className="ml-2">{talent.work_experience_years}年</span>
                              </div>
                            )}
                            {talent.education && (
                              <div>
                                <span className="text-muted-foreground">学历：</span>
                                <span className="ml-2">
                                  {talent.education === "high_school"
                                    ? "高中"
                                    : talent.education === "associate"
                                    ? "大专"
                                    : talent.education === "bachelor"
                                    ? "本科"
                                    : talent.education === "master"
                                    ? "硕士"
                                    : talent.education === "phd"
                                    ? "博士"
                                    : talent.education}
                                </span>
                              </div>
                            )}
                            {talent.major && (
                              <div>
                                <span className="text-muted-foreground">专业：</span>
                                <span className="ml-2">{talent.major}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>申请时间：{new Date(application.appliedAt).toLocaleString("zh-CN")}</span>
                        </div>

                        {application.companyReply && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">企业回复：</p>
                            <p className="text-sm text-muted-foreground">
                              {application.companyReply}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <ResumeActions 
                            applicationId={application.id} 
                            currentStatus={application.status as any}
                            onStatusChange={fetchApplications}
                          />
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/resumes/${application.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

