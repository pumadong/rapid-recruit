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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { register } from "@/server/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProvinceCitySelect } from "@/components/province-city-select";
import { IndustrySelect } from "@/components/industry-select";
import { saveToken, getToken } from "@/lib/auth-client";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"talent" | "company">("talent");
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [cityId, setCityId] = useState<number | undefined>();
  const [industryLevel1Id, setIndustryLevel1Id] = useState<number | undefined>();
  const [industryLevel2Id, setIndustryLevel2Id] = useState<number | undefined>();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    formData.append("userType", userType);
    
    // 如果是企业注册，添加城市和行业信息
    if (userType === "company") {
      if (!cityId) {
        toast.error("请选择企业所在城市");
        setIsLoading(false);
        return;
      }
      if (!industryLevel1Id) {
        toast.error("请选择企业所属行业");
        setIsLoading(false);
        return;
      }
      formData.append("cityId", cityId.toString());
      formData.append("industryLevel1Id", industryLevel1Id.toString());
      if (industryLevel2Id) {
        formData.append("industryLevel2Id", industryLevel2Id.toString());
      }
    }

    try {
      console.log("开始注册，表单数据:", {
        userType,
        phone: formData.get("phone"),
        hasRealName: !!formData.get("realName"),
        hasCompanyName: !!formData.get("companyName"),
        cityId,
        industryLevel1Id,
      });
      
      let result;
      try {
        result = await register(formData);
        console.log("注册结果:", result);
        console.log("注册结果类型:", typeof result);
        console.log("注册结果 JSON:", JSON.stringify(result));
      } catch (error) {
        console.error("调用 register 时出错:", error);
        toast.error("注册失败，请稍后重试");
        return;
      }
      
      if (!result) {
        console.error("注册结果为 undefined 或 null");
        toast.error("注册失败，请稍后重试");
        return;
      }
      
      if (result.success && result.token) {
        // 保存 token 到 localStorage
        console.log("注册成功，保存 token:", result.token.substring(0, 20) + "...");
        saveToken(result.token);
        
        // 验证 token 是否已保存
        const savedToken = getToken();
        console.log("Token 保存验证:", savedToken ? "成功" : "失败");
        
        if (!savedToken) {
          toast.error("Token 保存失败，请重新登录");
          setIsLoading(false);
          return;
        }
        
        toast.success("注册成功！正在跳转...");
        // 注册成功后跳转到会员中心
        // 使用 window.location.href 强制刷新页面，确保页面完全重新加载
        // 增加延迟确保 token 已保存到 localStorage
        setTimeout(() => {
          console.log("准备跳转到 dashboard");
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
        // 处理注册失败的情况
        const errorMsg = result.error || "注册失败，请检查表单信息";
        console.log("注册失败，错误代码:", result.code, "错误信息:", errorMsg);
        
        // 根据错误类型显示友好的提示
        if (result.code === "CONFLICT" || errorMsg.includes("手机号已被注册")) {
          console.log("显示手机号已被注册提示");
          toast.error("该手机号已被注册，请直接登录或使用其他手机号");
        } else {
          console.log("显示其他错误提示:", errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("注册错误:", error);
      
      // 处理意外的错误
      let errorMessage = "注册失败，请稍后重试";
      
      if (error?.message) {
        const msg = error.message;
        if (msg.includes("手机号已被注册") || msg.includes("已被注册")) {
          errorMessage = "该手机号已被注册，请直接登录或使用其他手机号";
        } else {
          errorMessage = msg;
        }
      }
      
      toast.error(errorMessage);
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
              <CardTitle className="text-2xl">创建账户</CardTitle>
              <CardDescription>开启您的职业新旅程</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">注册类型</Label>
                  <Select value={userType} onValueChange={(value: "talent" | "company") => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择注册类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talent">我是求职者</SelectItem>
                      <SelectItem value="company">我是企业</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userType === "talent" ? (
                  <div className="space-y-2">
                    <Label htmlFor="realName">真实姓名</Label>
                    <Input
                      id="realName"
                      name="realName"
                      type="text"
                      placeholder="请输入您的真实姓名"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">企业名称</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="请输入企业名称"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>企业所在地</Label>
                      <ProvinceCitySelect
                        selectedProvinceId={provinceId}
                        selectedCityId={cityId}
                        onProvinceChange={setProvinceId}
                        onCityChange={setCityId}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>所属行业</Label>
                      <IndustrySelect
                        selectedLevel1Id={industryLevel1Id}
                        selectedLevel2Id={industryLevel2Id}
                        onLevel1Change={setIndustryLevel1Id}
                        onLevel2Change={setIndustryLevel2Id}
                        level1Required={true}
                      />
                    </div>
                  </>
                )}

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
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="至少8位字符"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "注册中..." : "注册"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                已有账户？{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  立即登录
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
