import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">快捷招聘</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              连接优秀人才与理想职位，为企业和求职者搭建最专业的招聘平台。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">求职者</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-primary transition-colors">
                  浏览职位
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-primary transition-colors">
                  个人中心
                </Link>
              </li>
              <li>
                <Link href="/dashboard/applications" className="hover:text-primary transition-colors">
                  我的申请
                </Link>
              </li>
              <li>
                <Link href="/dashboard/favorites" className="hover:text-primary transition-colors">
                  我的收藏
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">企业招聘</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard/jobs/new" className="hover:text-primary transition-colors">
                  发布职位
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-primary transition-colors">
                  企业列表
                </Link>
              </li>
              <li>
                <Link href="/dashboard/jobs" className="hover:text-primary transition-colors">
                  管理职位
                </Link>
              </li>
              <li>
                <Link href="/dashboard/resumes" className="hover:text-primary transition-colors">
                  简历筛选
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">关于我们</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  公司介绍
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  注册账号
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  登录账号
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  会员中心
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2025 快捷招聘. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  )
}
