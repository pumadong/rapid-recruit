"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobsListActions } from "@/components/jobs-list-actions";
import { Calendar } from "lucide-react";

interface Job {
  id: number;
  positionName: string;
  status: string;
  city?: { name: string };
  industryLevel1?: { name: string };
  industryLevel2?: { name: string };
  salaryMin?: string;
  salaryMax?: string;
  workExperienceRequired?: number;
  positionCount?: number;
  publishedAt?: Date;
  description?: string;
}

export function JobsPageContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/dashboard/jobs", {
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
          throw new Error(errorData.error || "Failed to fetch jobs");
        }

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        console.error("Error fetching jobs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">已发布</Badge>;
      case "draft":
        return <Badge variant="secondary">草稿</Badge>;
      case "closed":
        return <Badge variant="destructive">已关闭</Badge>;
      case "expired":
        return <Badge variant="outline">已过期</Badge>;
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">职位管理</h1>
              <p className="text-muted-foreground">管理您发布的职位信息</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                发布新职位
              </Link>
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">您还没有发布任何职位</p>
                <Button asChild>
                  <Link href="/dashboard/jobs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    发布第一个职位
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{job.positionName}</CardTitle>
                          {getStatusBadge(job.status)}
                        </div>
                        <CardDescription>
                          {job.city?.name} · {job.industryLevel1?.name}
                          {job.industryLevel2 && ` / ${job.industryLevel2.name}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {job.salaryMin && job.salaryMax && (
                          <span>
                            薪资：¥{parseInt(job.salaryMin).toLocaleString()} - ¥
                            {parseInt(job.salaryMax).toLocaleString()}
                          </span>
                        )}
                        {job.workExperienceRequired && job.workExperienceRequired > 0 && (
                          <span>经验：{job.workExperienceRequired}年</span>
                        )}
                        {job.positionCount && <span>招聘人数：{job.positionCount}人</span>}
                        {job.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            发布于 {new Date(job.publishedAt).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <JobsListActions jobId={job.id} />
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

