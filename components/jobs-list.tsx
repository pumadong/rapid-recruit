import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Building2 } from "lucide-react"
import Link from "next/link"
import { getPublishedJobs, countJobs } from "@/server/queries/jobs"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale/zh-CN"
import { JobSearchForm } from "@/components/job-search-form"

interface JobsListProps {
  keyword?: string
  cityId?: number
  provinceId?: number
  page?: number
}

export async function JobsList({ keyword, cityId, provinceId, page = 1 }: JobsListProps) {
  const limit = 20;
  const [jobs, totalCount] = await Promise.all([
    getPublishedJobs({
      keyword,
      cityId,
      provinceId,
      limit,
      page,
    }),
    countJobs({
      keyword,
      cityId,
      provinceId,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <main className="flex-1">
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container">
          <h1 className="text-3xl font-bold tracking-tight mb-6">职位列表</h1>

          <Card className="mb-8">
            <CardContent className="p-4">
              <JobSearchForm />
            </CardContent>
          </Card>

          {/* 结果统计 */}
          <div className="mb-6 text-sm text-muted-foreground">
            共找到 <span className="font-semibold text-foreground">{totalCount}</span> 个职位
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无职位信息</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                {jobs.map((job) => {
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

                  return (
                    <Link href={`/jobs/${job.id}`} key={job.id}>
                      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <Badge variant="secondary">全职</Badge>
                          </div>

                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {job.positionName}
                          </h3>
                          <p className="text-muted-foreground mb-4">{job.company?.companyName}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.jobSkills?.slice(0, 3).map((jobSkill) => (
                              <Badge key={jobSkill.id} variant="outline" className="text-xs">
                                {jobSkill.skill?.name}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/40 text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{job.city?.name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{postedTime}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-3 text-primary font-semibold">
                            <DollarSign className="h-4 w-4" />
                            <span>{salaryText}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/jobs?${new URLSearchParams({
                        ...(keyword && { keyword }),
                        ...(provinceId && { provinceId: provinceId.toString() }),
                        ...(cityId && { cityId: cityId.toString() }),
                        page: (page - 1).toString(),
                      }).toString()}`}
                      className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent"
                    >
                      上一页
                    </Link>
                  )}
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    第 {page} 页，共 {totalPages} 页
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/jobs?${new URLSearchParams({
                        ...(keyword && { keyword }),
                        ...(provinceId && { provinceId: provinceId.toString() }),
                        ...(cityId && { cityId: cityId.toString() }),
                        page: (page + 1).toString(),
                      }).toString()}`}
                      className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent"
                    >
                      下一页
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
