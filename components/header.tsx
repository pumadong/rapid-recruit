"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, Menu, User } from "lucide-react"
import { useState } from "react"
import { removeToken } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserMenu } from "./user-menu"

interface HeaderProps {
  currentUser?: {
    id: number;
    userName: string | null;
    userType: "talent" | "company";
  } | null;
}

export function Header({ currentUser }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  
  const handleLogout = () => {
    removeToken()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">快捷招聘</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            首页
          </Link>
          <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
            职位列表
          </Link>
          <Link href="/companies" className="text-sm font-medium hover:text-primary transition-colors">
            企业招聘
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            关于我们
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <UserMenu 
              userName={currentUser.userName || (currentUser.userType === "talent" ? "求职者" : "企业")} 
              userType={currentUser.userType} 
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                首页
              </Link>
              <Link
                href="/jobs"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                职位列表
              </Link>
              <Link
                href="/companies"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                企业招聘
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                关于我们
              </Link>
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                {currentUser ? (
                  <>
                    <div className="px-2 py-2 text-sm font-medium">
                      {currentUser.userName || (currentUser.userType === "talent" ? "求职者" : "企业")}
                    </div>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/dashboard">会员中心</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={handleLogout}
                    >
                      退出登录
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/login">登录</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register">注册</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
