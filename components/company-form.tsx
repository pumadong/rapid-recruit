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
import { IndustrySelect } from "@/components/industry-select";
import type { Company } from "@/types/user";
import { getAuthHeader } from "@/lib/auth-client";

interface City {
  id: number;
  name: string;
  province_id: number;
}

interface IndustryLevel1 {
  id: number;
  name: string;
  code: string;
}

interface IndustryLevel2 {
  id: number;
  name: string;
  industry_level1_id: number;
  code: string;
}

interface CompanyFormProps {
  company: Company;
  initialProvinceId?: number;
  initialCities: City[];
  industriesLevel1: IndustryLevel1[];
  initialIndustriesLevel2: IndustryLevel2[];
  onUpdateSuccess?: () => void; // 更新成功后的回调
}

export function CompanyForm({ company, initialProvinceId, initialCities, industriesLevel1, initialIndustriesLevel2, onUpdateSuccess }: CompanyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [industriesLevel2, setIndustriesLevel2] = useState(initialIndustriesLevel2);
  const [formData, setFormData] = useState({
    companyName: company.companyName || "",
    companySize: company.companySize || "",
    cityId: company.cityId,
    provinceId: initialProvinceId,
    industryLevel1Id: company.industryLevel1Id,
    industryLevel2Id: company.industryLevel2Id || undefined,
    description: company.description || "",
    logo: company.logo || "",
    website: company.website || "",
    businessLicense: company.businessLicense || "",
  });

  // 当一级行业改变时，加载二级行业
  useEffect(() => {
    async function fetchIndustriesLevel2() {
      if (!formData.industryLevel1Id) {
        setIndustriesLevel2([]);
        setFormData(prev => ({ ...prev, industryLevel2Id: undefined }));
        return;
      }

      try {
        const response = await fetch(`/api/industries-level2?level1Id=${formData.industryLevel1Id}`);
        if (response.ok) {
          const data = await response.json();
          setIndustriesLevel2(data || []);
          // 如果当前选择的二级行业不在新列表中，清空选择
          if (formData.industryLevel2Id && data) {
            const exists = data.some((ind: IndustryLevel2) => ind.id === formData.industryLevel2Id);
            if (!exists) {
              setFormData(prev => ({ ...prev, industryLevel2Id: undefined }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching industries level2:", error);
        setIndustriesLevel2([]);
      }
    }

    fetchIndustriesLevel2();
  }, [formData.industryLevel1Id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("companyName", formData.companyName);
    if (formData.companySize) formDataObj.append("companySize", formData.companySize);
    // 地区必填，使用表单中的值（如果已修改），否则使用原始值
    const finalCityId = formData.cityId || company.cityId;
    formDataObj.append("cityId", finalCityId.toString());
    if (formData.industryLevel1Id) {
      formDataObj.append("industryLevel1Id", formData.industryLevel1Id.toString());
    }
    if (formData.industryLevel2Id) {
      formDataObj.append("industryLevel2Id", formData.industryLevel2Id.toString());
    }
    if (formData.description) formDataObj.append("description", formData.description);
    if (formData.logo) formDataObj.append("logo", formData.logo);
    if (formData.website) formDataObj.append("website", formData.website);
    if (formData.businessLicense) formDataObj.append("businessLicense", formData.businessLicense);

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

      const response = await fetch("/api/profile/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("企业信息更新成功！");
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
          <CardTitle>企业基本信息</CardTitle>
          <CardDescription>完善您的企业基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">企业名称 *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companySize">企业规模</Label>
              <Select
                value={formData.companySize || ""}
                onValueChange={(value) => setFormData({ ...formData, companySize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择企业规模" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-20人">0-20人</SelectItem>
                  <SelectItem value="21-50人">21-50人</SelectItem>
                  <SelectItem value="51-100人">51-100人</SelectItem>
                  <SelectItem value="101-200人">101-200人</SelectItem>
                  <SelectItem value="201-500人">201-500人</SelectItem>
                  <SelectItem value="501-1000人">501-1000人</SelectItem>
                  <SelectItem value="1000+人">1000+人</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>所在地区 *</Label>
              <ProvinceCitySelect
                selectedProvinceId={formData.provinceId}
                selectedCityId={formData.cityId}
                onProvinceChange={(provinceId) => setFormData({ ...formData, provinceId, cityId: undefined })}
                onCityChange={(cityId) => {
                  // 更新城市ID，如果未选择则保持原值（必填字段）
                  setFormData({ ...formData, cityId: cityId || company.cityId });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>所属行业 *</Label>
            <IndustrySelect
              selectedLevel1Id={formData.industryLevel1Id}
              selectedLevel2Id={formData.industryLevel2Id}
              onLevel1Change={(level1Id) => setFormData({ ...formData, industryLevel1Id: level1Id || company.industryLevel1Id, industryLevel2Id: undefined })}
              onLevel2Change={(level2Id) => setFormData({ ...formData, industryLevel2Id: level2Id })}
              level1Required={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">企业简介</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              maxLength={5000}
              placeholder="介绍一下您的企业..."
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/5000
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">企业Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">企业网站</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessLicense">营业执照号</Label>
            <Input
              id="businessLicense"
              value={formData.businessLicense}
              onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
              maxLength={255}
              placeholder="请输入营业执照号"
            />
          </div>

          {company.verificationStatus && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">认证状态</p>
                  <p className="text-sm text-muted-foreground">
                    {company.verificationStatus === "verified" && "已认证"}
                    {company.verificationStatus === "pending" && "认证审核中"}
                    {company.verificationStatus === "rejected" && "认证被拒绝"}
                    {company.verificationStatus === "unverified" && "未认证"}
                  </p>
                </div>
              </div>
            </div>
          )}
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

