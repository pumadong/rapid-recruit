import { Suspense } from "react"
import { HeaderClient } from "@/components/header-client"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Award, TrendingUp } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1">
        <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">关于我们</h1>
              <p className="text-lg text-muted-foreground text-pretty">
                连接优秀人才与领先企业，打造最值得信赖的招聘平台
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">我们的使命</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  我们致力于为求职者和企业搭建一座高效、便捷的桥梁。通过先进的技术和专业的服务，帮助每一位求职者找到理想的工作，助力每一家企业发现优秀的人才。
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  我们相信，合适的人才与合适的岗位相遇，能够创造无限可能。让每个人都能在职业道路上发光发热，是我们不懈的追求。
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">精准匹配</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    利用智能算法，为求职者推荐最匹配的职位，为企业筛选最合适的候选人
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">专业服务</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    提供简历优化、面试指导等增值服务，帮助求职者提升竞争力
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">优质企业</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    严格筛选合作企业，确保每一个职位都来自可信赖的优质公司
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">持续成长</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    不仅帮助找工作，更关注职业发展，提供长期的职业规划建议
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
