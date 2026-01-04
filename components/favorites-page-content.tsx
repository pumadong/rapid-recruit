"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Briefcase, GraduationCap, Heart, Building2 } from "lucide-react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import type { JobWithRelations } from "@/types/job";

interface FavoriteJob extends JobWithRelations {
  favoriteTime: Date;
}

export function FavoritesPageContent() {
  const router = useRouter();
  const [favoriteJobs, setFavoriteJobs] = useState<FavoriteJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavoriteJobs() {
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/dashboard/favorites", {
          headers: {
            Authorization: authHeader,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          const { removeToken } = await import("@/lib/auth-client");
          removeToken();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          console.error("Failed to fetch favorite jobs:", response.status, response.statusText);
          toast.error("加载收藏列表失败");
          return;
        }

        const data = await response.json();
        if (data.favoriteJobs) {
          // 转换日期字符串为 Date 对象
          const jobs = data.favoriteJobs.map((job: any) => ({
            ...job,
            publishedAt: job.publishedAt ? new Date(job.publishedAt) : null,
            expiredAt: job.expiredAt ? new Date(job.expiredAt) : null,
            createdAt: new Date(job.createdAt),
            updatedAt: new Date(job.updatedAt),
            favoriteTime: job.favoriteTime ? new Date(job.favoriteTime) : new Date(),
          }));
          setFavoriteJobs(jobs);
        }
      } catch (error) {
        console.error("Error fetching favorite jobs:", error);
        toast.error("加载收藏列表失败");
      } finally {
        setLoading(false);
      }
    }

    fetchFavoriteJobs();
  }, [router]);

  async function handleRemoveFavorite(jobId: number) {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ jobId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 从列表中移除该职位
        setFavoriteJobs((prev) => prev.filter((job) => job.id !== jobId));
        toast.success("已取消收藏");
      } else {
        toast.error(result.error || "取消收藏失败");
      }
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      toast.error("取消收藏失败");
    }
  }

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

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">我的收藏</h1>
            <p className="text-muted-foreground">
              您共收藏了 {favoriteJobs.length} 个职位
            </p>
          </div>

          {/* 收藏列表 */}
          {favoriteJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">还没有收藏任何职位</p>
                <Button asChild>
                  <Link href="/jobs">去浏览职位</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {favoriteJobs.map((job) => {
                const salaryText =
                  job.salaryMin && job.salaryMax
                    ? `¥${parseInt(job.salaryMin).toLocaleString()} - ¥${parseInt(job.salaryMax).toLocaleString()}`
                    : "面议";

                const experienceText = job.workExperienceRequired
                  ? `${job.workExperienceRequired}年以上`
                  : "不限";

                const educationMap: Record<string, string> = {
                  high_school: "高中",
                  associate: "大专",
                  bachelor: "本科",
                  master: "硕士",
                  phd: "博士",
                };

                const educationText = job.educationRequired
                  ? educationMap[job.educationRequired] || "不限"
                  : "不限";

                const favoriteTimeText = formatDistanceToNow(job.favoriteTime, {
                  addSuffix: true,
                  locale: zhCN,
                });

                return (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {job.positionName}
                                </Link>
                              </h3>
                              <p className="text-muted-foreground mb-2">
                                {job.company?.companyName}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite(job.id)}
                              className="text-muted-foreground hover:text-red-500"
                            >
                              <Heart className="h-4 w-4 fill-current mr-1" />
                              取消收藏
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-primary">{salaryText}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.city?.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{experienceText}经验</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              <span>{educationText}及以上</span>
                            </div>
                          </div>

                          {job.jobSkills && job.jobSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.jobSkills.slice(0, 5).map((jobSkill) => (
                                <Badge key={jobSkill.id} variant="outline">
                                  {jobSkill.skill?.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              收藏于 {favoriteTimeText}
                            </p>
                            <Button asChild size="sm">
                              <Link href={`/jobs/${job.id}`}>查看详情</Link>
                            </Button>
                          </div>
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

