import { Suspense } from "react"
import { HeaderClient } from "@/components/header-client"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, TrendingUp, MapPin, Clock, DollarSign, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getFeaturedJobs, countJobs, testAdminConnection } from "@/server/queries/jobs"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale/zh-CN"
import { JobSearchForm } from "@/components/job-search-form"

async function FeaturedJobs() {
  const jobs = await getFeaturedJobs(6);
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => {
        const postedTime = job.publishedAt
          ? formatDistanceToNow(new Date(job.publishedAt), {
              addSuffix: true,
              locale: zhCN,
            })
          : "刚刚";
        
        const salaryText =
          job.salaryMin && job.salaryMax
            ? `${parseFloat(job.salaryMin) / 1000}K-${parseFloat(job.salaryMax) / 1000}K`
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
  );
}

async function JobStats() {
  const totalJobs = await countJobs();
  
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="text-center border-0 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-8">
          <div className="text-4xl font-bold text-primary mb-2">{totalJobs.toLocaleString()}+</div>
          <p className="text-muted-foreground">优质职位</p>
        </CardContent>
      </Card>
      <Card className="text-center border-0 bg-gradient-to-br from-accent/10 to-accent/5">
        <CardContent className="p-8">
          <div className="text-4xl font-bold text-accent mb-2">5,000+</div>
          <p className="text-muted-foreground">合作企业</p>
        </CardContent>
      </Card>
      <Card className="text-center border-0 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-8">
          <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
          <p className="text-muted-foreground">成功入职</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function HomePage() {
  // 测试管理员连接（仅在开发环境打印）
  if (process.env.NODE_ENV === "development") {
    try {
      const testResult = await testAdminConnection();
      if (testResult.success) {
        console.log("✅ Supabase Admin API connection successful via HTTPS");
      } else {
        console.error("❌ Supabase Admin API connection failed:", testResult.error);
      }
    } catch (error) {
      console.error("❌ Connection test error:", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-20 md:pt-28 pb-0">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                发现您的
                <span className="text-primary"> 理想职位</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty mb-8 leading-relaxed">
                连接优秀人才与领先企业，开启职业生涯新篇章
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <Card>
                  <CardContent className="p-2">
                    <JobSearchForm variant="compact" />
                  </CardContent>
                </Card>
              </div>

              {/* Popular Tags */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">热门搜索：</span>
                {["前端开发", "产品经理", "UI设计", "数据分析", "运营"].map((tag) => (
                  <Link key={tag} href={`/jobs?keyword=${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Section - Moved inside Hero Section for better spacing */}
          <div className="container mt-8 md:mt-10 pb-4 md:pb-6">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-3">热门职位分类</h2>
              <p className="text-muted-foreground text-pretty">探索不同领域的职业机会</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "技术开发", count: "2,345", icon: Briefcase, keyword: "技术开发" },
                { name: "产品设计", count: "1,234", icon: Users, keyword: "产品设计" },
                { name: "市场运营", count: "987", icon: TrendingUp, keyword: "市场运营" },
                { name: "销售商务", count: "1,567", icon: Building2, keyword: "销售商务" },
              ].map((category) => {
                const Icon = category.icon
                return (
                  <Link key={category.name} href={`/jobs?keyword=${encodeURIComponent(category.keyword)}`}>
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Icon className="h-6 w-6" />
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} 个职位</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="pt-4 md:pt-6 pb-8 md:pb-12 bg-muted/30">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">推荐职位</h2>
                <p className="text-muted-foreground">为您精选的优质工作机会</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex bg-transparent">
                <Link href="/jobs">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
              <FeaturedJobs />
            </Suspense>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/jobs">
                  查看全部职位
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 md:py-12">
          <div className="container">
            <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
              <JobStats />
            </Suspense>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-balance">准备好开启新的职业旅程了吗？</h2>
                <p className="text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto leading-relaxed">
                  立即注册，上传简历，让优质企业主动找到您
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      立即注册
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/jobs">浏览职位</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
