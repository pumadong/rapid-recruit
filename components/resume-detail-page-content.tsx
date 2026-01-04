"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Briefcase, Building2, Mail, Phone } from "lucide-react";
import { ResumeActions } from "@/components/resume-actions";
import { BackButton } from "@/components/back-button";

interface Application {
  id: number;
  status: string;
  appliedAt: Date;
  reviewedAt?: Date;
  companyReply?: string;
  talent?: {
    real_name: string;
    gender?: string;
    birth_date?: string;
    work_experience_years?: number;
    education?: string;
    major?: string;
    bio?: string;
    avatar?: string;
    city?: {
      name: string;
      province?: {
        name: string;
      };
    };
  };
  jobPosition?: {
    id: number;
    position_name: string;
    company?: {
      company_name: string;
    };
  };
}

export function ResumeDetailPageContent({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/dashboard/resumes/${applicationId}`, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 404) {
        router.push("/dashboard/resumes");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch application");
      }

      const data = await response.json();
      setApplication(data.application);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching application:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

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

  const getEducationLabel = (education?: string) => {
    switch (education) {
      case "high_school":
        return "高中";
      case "associate":
        return "大专";
      case "bachelor":
        return "本科";
      case "master":
        return "硕士";
      case "phd":
        return "博士";
      default:
        return education || "未填写";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">加载失败：{error || "申请不存在"}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const talent = application.talent;
  const jobPosition = application.jobPosition;

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <BackButton fallbackHref="/dashboard/resumes" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回简历列表
          </BackButton>

          <div className="space-y-6">
            {/* 申请信息卡片 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Briefcase className="h-6 w-6" />
                      {jobPosition?.position_name || "未知职位"}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <Building2 className="h-4 w-4 inline mr-1" />
                      {jobPosition?.company?.company_name || "未知公司"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>申请时间：{new Date(application.appliedAt).toLocaleString("zh-CN")}</span>
                    {application.reviewedAt && (
                      <span className="ml-4">
                        审核时间：{new Date(application.reviewedAt).toLocaleString("zh-CN")}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <ResumeActions 
                      applicationId={application.id} 
                      currentStatus={application.status as any}
                      onStatusChange={fetchApplication}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 人才信息卡片 */}
            {talent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User className="h-6 w-6" />
                    {talent.real_name || "未知用户"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {talent.gender && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">性别：</span>
                          <span className="ml-2">
                            {talent.gender === "male" ? "男" : talent.gender === "female" ? "女" : "其他"}
                          </span>
                        </div>
                      )}
                      {talent.birth_date && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">出生日期：</span>
                          <span className="ml-2">{new Date(talent.birth_date).toLocaleDateString("zh-CN")}</span>
                        </div>
                      )}
                      {talent.city && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">所在地区：</span>
                          <span className="ml-2">
                            {talent.city.province?.name} {talent.city.name}
                          </span>
                        </div>
                      )}
                      {talent.work_experience_years !== null && talent.work_experience_years !== undefined && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">工作经验：</span>
                          <span className="ml-2">{talent.work_experience_years}年</span>
                        </div>
                      )}
                      {talent.education && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">学历：</span>
                          <span className="ml-2">{getEducationLabel(talent.education)}</span>
                        </div>
                      )}
                      {talent.major && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">专业：</span>
                          <span className="ml-2">{talent.major}</span>
                        </div>
                      )}
                    </div>

                    {/* 个人简介 */}
                    {talent.bio && (
                      <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">个人简介</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{talent.bio}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 企业回复 */}
            {application.companyReply && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">企业回复</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.companyReply}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

