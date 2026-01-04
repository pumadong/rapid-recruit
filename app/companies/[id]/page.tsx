import { Suspense } from "react";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { getCompanyById } from "@/server/queries/companies";
import { getJobsByCompanyId } from "@/server/queries/jobs";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { BackButton } from "@/components/back-button";

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = await params;
  const companyId = parseInt(id);

  if (isNaN(companyId)) {
    notFound();
  }

  const company = await getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  // 获取该企业的所有已发布职位
  const jobs = await getJobsByCompanyId(companyId, "published");

  const verificationStatusMap = {
    verified: { label: "已认证", icon: CheckCircle2, variant: "default" as const },
    pending: { label: "审核中", icon: Clock, variant: "secondary" as const },
    rejected: { label: "已拒绝", icon: XCircle, variant: "destructive" as const },
    unverified: { label: "未认证", icon: Clock, variant: "outline" as const },
  };

  const status = verificationStatusMap[company.verificationStatus];
  const StatusIcon = status.icon;

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1">
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              {/* 返回按钮 */}
              <BackButton fallbackHref="/companies" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回企业列表
              </BackButton>

              {/* 企业基本信息卡片 */}
              <Card className="mb-8">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* 企业 Logo */}
                    <div className="flex-shrink-0">
                      {company.logo ? (
                        <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={company.logo}
                            alt={company.companyName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-16 w-16" />
                        </div>
                      )}
                    </div>

                    {/* 企业信息 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold mb-2">{company.companyName}</h1>
                          <Badge variant={status.variant} className="mb-2">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {company.city && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {company.province?.name} {company.city.name}
                            </span>
                          </div>
                        )}
                        {company.companySize && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{company.companySize}</span>
                          </div>
                        )}
                        {company.industryLevel1 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {company.industryLevel1.name}
                              {company.industryLevel2 && ` / ${company.industryLevel2.name}`}
                            </span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>

                      {company.description && (
                        <div className="mt-6 pt-6 border-t">
                          <h3 className="font-semibold mb-2">企业简介</h3>
                          <p className="text-muted-foreground whitespace-pre-wrap">{company.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 招聘职位列表 */}
              <Card>
                <CardHeader>
                  <CardTitle>招聘职位</CardTitle>
                  <CardDescription>
                    共 {jobs.length} 个职位
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>暂无招聘职位</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                          <div className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                                  {job.positionName}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                                  {job.salaryMin && job.salaryMax && (
                                    <span>
                                      ¥{parseInt(job.salaryMin).toLocaleString()} - ¥
                                      {parseInt(job.salaryMax).toLocaleString()}/月
                                    </span>
                                  )}
                                  {job.city && <span>{job.city.name}</span>}
                                  <span>{job.workExperienceRequired}年经验</span>
                                  {job.educationRequired && (
                                    <span>
                                      {job.educationRequired === "high_school"
                                        ? "高中"
                                        : job.educationRequired === "associate"
                                        ? "大专"
                                        : job.educationRequired === "bachelor"
                                        ? "本科"
                                        : job.educationRequired === "master"
                                        ? "硕士"
                                        : job.educationRequired === "phd"
                                        ? "博士"
                                        : job.educationRequired}
                                    </span>
                                  )}
                                </div>
                                {job.publishedAt && (
                                  <p className="text-xs text-muted-foreground">
                                    发布于 {format(new Date(job.publishedAt), "yyyy-MM-dd")}
                                  </p>
                                )}
                              </div>
                              <Button variant="outline" size="sm" className="ml-4">
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

