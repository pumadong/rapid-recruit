"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Building2, Briefcase, GraduationCap, ArrowLeft } from "lucide-react";
import { ApplyJobButton } from "@/components/apply-job-button";
import { FavoriteJobButton } from "@/components/favorite-job-button";
import { BackButton } from "@/components/back-button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";

interface JobDetail {
  id: number;
  positionName: string;
  description: string;
  salaryMin?: string;
  salaryMax?: string;
  workExperienceRequired?: number;
  educationRequired?: string;
  publishedAt?: Date;
  companyId?: number;
  company?: {
    companyName: string;
  };
  city?: {
    name: string;
  };
  jobSkills?: Array<{
    id: number;
    isRequired?: boolean;
    skill?: {
      name: string;
    };
  }>;
}

export function JobDetailContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [talentId, setTalentId] = useState<number | undefined>();
  const [hasAppliedToJob, setHasAppliedToJob] = useState(false);
  const [isJobOwner, setIsJobOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 获取职位信息
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          if (jobResponse.status === 404) {
            setError("职位不存在");
          } else {
            setError("加载失败");
          }
          return;
        }
        const jobData = await jobResponse.json();
        // 转换日期字符串为 Date 对象
        const job = jobData.job;
        if (job) {
          setJob({
            ...job,
            publishedAt: job.publishedAt ? new Date(job.publishedAt) : undefined,
            expiredAt: job.expiredAt ? new Date(job.expiredAt) : undefined,
          });
        }

        // 获取用户状态
        const authHeader = getAuthHeader();
        if (!authHeader) {
          setLoading(false);
          return;
        }

        // 获取用户信息
        const userResponse = await fetch("/api/auth/profile", {
          headers: {
            Authorization: authHeader,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          // API 返回的数据结构是 { userProfile: { user, talent/company } }
          if (userData.userProfile) {
            const { user, talent, company } = userData.userProfile;
            
            if (user.userType === "talent" && talent) {
              setTalentId(talent.id);
              
              // 检查是否已申请
              const applyResponse = await fetch(`/api/applications/check?jobId=${jobId}`, {
                headers: {
                  Authorization: authHeader,
                },
              });
              
              if (applyResponse.ok) {
                const applyData = await applyResponse.json();
                setHasAppliedToJob(applyData.hasApplied || false);
              }
            } else if (user.userType === "company" && company) {
              // 检查是否是职位所有者
              if (job && job.companyId === company.id) {
                setIsJobOwner(true);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 py-8 md:py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 py-8 md:py-12 bg-muted/30">
          <div className="container max-w-4xl">
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">加载失败：{error || "职位不存在"}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const postedTime = job.publishedAt
    ? formatDistanceToNow(new Date(job.publishedAt), {
        addSuffix: true,
        locale: zhCN,
      })
    : "刚刚";

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

  // 从描述中提取职责和要求（这里简化处理，实际应该分开存储）
  const descriptionLines = job.description.split("\n").filter((line) => line.trim());
  const responsibilities = descriptionLines.filter((line) =>
    line.includes("负责") || line.includes("开发") || line.includes("参与")
  );
  const requirements = descriptionLines.filter(
    (line) =>
      line.includes("经验") ||
      line.includes("熟悉") ||
      line.includes("精通") ||
      line.includes("要求")
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-4xl">
          <BackButton fallbackHref="/jobs" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回职位列表
          </BackButton>

          <Card className="mb-6">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.positionName}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{job.company?.companyName}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">全职</Badge>
                    {job.jobSkills?.slice(0, 5).map((jobSkill) => (
                      <Badge key={jobSkill.id} variant="outline">
                        {jobSkill.skill?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold text-primary text-lg">{salaryText}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{job.city?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-5 w-5" />
                  <span>{experienceText}经验</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-5 w-5" />
                  <span>{educationText}及以上</span>
                </div>
              </div>

              {/* 操作按钮 */}
              {!isJobOwner && (
                <div className="flex gap-4">
                  {hasAppliedToJob ? (
                    <Button size="lg" className="flex-1" disabled>
                      已申请
                    </Button>
                  ) : (
                    <ApplyJobButton 
                      jobId={job.id} 
                      talentId={talentId}
                      onApplySuccess={() => {
                        // 申请成功后重新检查申请状态
                        const authHeader = getAuthHeader();
                        if (authHeader) {
                          fetch(`/api/applications/check?jobId=${job.id}`, {
                            headers: { Authorization: authHeader },
                          })
                            .then(res => res.json())
                            .then(data => setHasAppliedToJob(data.hasApplied || false));
                        }
                      }}
                    />
                  )}
                  {talentId && <FavoriteJobButton jobId={job.id} talentId={talentId} />}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 职位描述 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>职位描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {responsibilities.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>工作职责</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {requirements.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>任职要求</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {job.jobSkills && job.jobSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>技能要求</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.jobSkills.map((jobSkill) => (
                    <Badge
                      key={jobSkill.id}
                      variant={jobSkill.isRequired ? "default" : "outline"}
                    >
                      {jobSkill.skill?.name}
                      {jobSkill.isRequired && " (必需)"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 发布时间 */}
          <div className="text-sm text-muted-foreground text-center mt-6">
            发布于 {postedTime}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

