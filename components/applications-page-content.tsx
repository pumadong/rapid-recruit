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
import { Eye, Calendar, Briefcase, Building2 } from "lucide-react";

interface Application {
  id: number;
  status: string;
  appliedAt: Date;
  reviewedAt?: Date;
  companyReply?: string;
  jobPositionId: number;
  jobPosition?: {
    position_name: string;
  };
  company?: {
    company_name: string;
  };
}

export function ApplicationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          router.push("/login");
          return;
        }

        const url = status ? `/api/dashboard/applications?status=${status}` : "/api/dashboard/applications";
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
      } catch (err: any) {
        console.error("Error fetching applications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

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
            <h1 className="text-3xl font-bold mb-2">我的申请</h1>
            <p className="text-muted-foreground">查看您的职位申请记录和状态</p>
          </div>

          {/* 状态筛选 */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button variant={!status ? "default" : "outline"} asChild>
              <Link href="/dashboard/applications">全部</Link>
            </Button>
            <Button variant={status === "pending" ? "default" : "outline"} asChild>
              <Link href="/dashboard/applications?status=pending">待审核</Link>
            </Button>
            <Button variant={status === "reviewed" ? "default" : "outline"} asChild>
              <Link href="/dashboard/applications?status=reviewed">已查看</Link>
            </Button>
            <Button variant={status === "accepted" ? "default" : "outline"} asChild>
              <Link href="/dashboard/applications?status=accepted">已接受</Link>
            </Button>
            <Button variant={status === "rejected" ? "default" : "outline"} asChild>
              <Link href="/dashboard/applications?status=rejected">已拒绝</Link>
            </Button>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">暂无申请记录</p>
                <Button asChild>
                  <Link href="/jobs">浏览职位</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((item: any) => {
                const application = item.application || item;
                const jobPosition = item.jobPosition;
                const company = item.company;
                return (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Briefcase className="h-5 w-5" />
                              {jobPosition?.position_name || "未知职位"}
                            </CardTitle>
                            {getStatusBadge(application.status)}
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {company?.company_name || "未知公司"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>申请时间：{new Date(application.appliedAt).toLocaleString("zh-CN")}</span>
                          {application.reviewedAt && (
                            <span className="ml-4">
                              审核时间：{new Date(application.reviewedAt).toLocaleString("zh-CN")}
                            </span>
                          )}
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
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${application.jobPositionId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              查看职位
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

