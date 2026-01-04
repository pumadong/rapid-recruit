"use client";

import { Suspense } from "react";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { login } from "@/server/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveToken, getToken } from "@/lib/auth-client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);
      console.log("登录结果:", result);
      
      if (result?.success && result.token) {
        // 保存 token 到 localStorage
        saveToken(result.token);
        
        // 验证 token 是否已保存
        const savedToken = getToken();
        if (!savedToken) {
          toast.error("Token 保存失败，请重新登录");
          setIsLoading(false);
          return;
        }
        
        toast.success("登录成功！");
        // 跳转到会员中心
        // 使用 window.location.href 强制刷新页面，确保页面完全重新加载
        // 增加延迟确保 token 已保存到 localStorage
        setTimeout(() => {
          // 再次验证 token 是否存在
          const finalToken = getToken();
          if (finalToken) {
            window.location.href = "/dashboard";
          } else {
            console.error("跳转前 token 丢失，重定向到登录页");
            toast.error("认证失败，请重新登录");
            router.push("/login");
          }
        }, 800);
      } else {
        // 处理登录失败的情况
        const errorMsg = result?.error || "登录失败，请检查手机号和密码";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("登录错误:", error);
      toast.error(error.message || "登录失败，请检查手机号和密码");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 flex items-center justify-center py-12 bg-muted/30">
        <div className="container max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">欢迎回来</CardTitle>
              <CardDescription>登录您的账户继续使用</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="请输入11位手机号"
                    required
                    pattern="[0-9]{11}"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      忘记密码？
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                还没有账户？{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  立即注册
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
