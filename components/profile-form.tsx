"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProvinceCitySelect } from "@/components/province-city-select";
import type { Talent } from "@/types/user";
import { getAuthHeader } from "@/lib/auth-client";

interface ProfileFormProps {
  talent: Talent;
  initialProvinceId?: number;
  initialCities: Array<{ id: number; name: string; province_id: number }>;
  onUpdateSuccess?: () => void; // 更新成功后的回调
}

export function ProfileForm({ talent, initialProvinceId, initialCities, onUpdateSuccess }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    realName: talent.realName || "",
    gender: talent.gender || "",
    birthDate: talent.birthDate ? new Date(talent.birthDate).toISOString().split("T")[0] : "",
    cityId: talent.cityId || undefined,
    provinceId: initialProvinceId,
    workExperienceYears: talent.workExperienceYears || 0,
    education: talent.education || "",
    major: talent.major || "",
    bio: talent.bio || "",
    avatar: talent.avatar || "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("realName", formData.realName);
    if (formData.gender) formDataObj.append("gender", formData.gender);
    if (formData.birthDate) formDataObj.append("birthDate", formData.birthDate);
    // 如果选择了城市，保存城市ID；如果没有选择，也要传递null以便清空
    if (formData.cityId) {
      formDataObj.append("cityId", formData.cityId.toString());
    } else {
      formDataObj.append("cityId", "");
    }
    if (formData.workExperienceYears !== undefined) {
      formDataObj.append("workExperienceYears", formData.workExperienceYears.toString());
    }
    if (formData.education) formDataObj.append("education", formData.education);
    if (formData.major) formDataObj.append("major", formData.major);
    if (formData.bio) formDataObj.append("bio", formData.bio);
    if (formData.avatar) formDataObj.append("avatar", formData.avatar);

    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        toast.error("请先登录");
        router.push("/login");
        return;
      }

      // 将 FormData 转换为 JSON
      const jsonData: Record<string, any> = {};
      formDataObj.forEach((value, key) => {
        jsonData[key] = value;
      });

      const response = await fetch("/api/profile/talent", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("个人信息更新成功！");
        // 调用回调函数重新获取数据，而不是跳转页面
        if (onUpdateSuccess) {
          onUpdateSuccess();
        } else {
          // 如果没有回调，使用 router.refresh() 刷新当前页面
          router.refresh();
        }
      } else {
        toast.error(result.error || "更新失败，请稍后重试");
      }
    } catch (error: any) {
      console.error("更新失败:", error);
      toast.error(error.message || "更新失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>完善您的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="realName">真实姓名 *</Label>
            <Input
              id="realName"
              value={formData.realName}
              onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
              required
              maxLength={50}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">出生日期</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>所在地区</Label>
            <ProvinceCitySelect
              selectedProvinceId={formData.provinceId}
              selectedCityId={formData.cityId}
              initialCities={initialCities}
              onProvinceChange={(provinceId) => {
                setFormData({ ...formData, provinceId, cityId: undefined });
              }}
              onCityChange={(cityId) => {
                setFormData({ ...formData, cityId: cityId || undefined });
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workExperienceYears">工作经验（年）</Label>
              <Input
                id="workExperienceYears"
                type="number"
                min="0"
                value={formData.workExperienceYears}
                onChange={(e) => setFormData({ ...formData, workExperienceYears: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">学历</Label>
              <Select
                value={formData.education || ""}
                onValueChange={(value) => setFormData({ ...formData, education: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择学历" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">高中</SelectItem>
                  <SelectItem value="associate">大专</SelectItem>
                  <SelectItem value="bachelor">本科</SelectItem>
                  <SelectItem value="master">硕士</SelectItem>
                  <SelectItem value="phd">博士</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">专业</Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              maxLength={100}
              placeholder="请输入您的专业"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={5}
              maxLength={2000}
              placeholder="介绍一下您的经历、技能和职业规划..."
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">头像URL</Label>
            <Input
              id="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : "保存修改"}
        </Button>
      </div>
    </form>
  );
}

