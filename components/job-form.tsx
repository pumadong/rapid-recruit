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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProvinceCitySelect } from "@/components/province-city-select";
import { IndustrySelect } from "@/components/industry-select";
import type { JobWithRelations } from "@/types/job";
import type { Company } from "@/types/user";

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface JobFormProps {
  company: Company;
  job?: JobWithRelations;
  initialProvinceId?: number;
  initialCities: Array<{ id: number; name: string; province_id: number }>;
  industriesLevel1: Array<{ id: number; name: string; code: string }>;
  initialIndustriesLevel2: Array<{ id: number; name: string; industry_level1_id: number; code: string }>;
}

export function JobForm({
  company,
  job,
  initialProvinceId,
  initialCities,
  industriesLevel1,
  initialIndustriesLevel2,
}: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [industriesLevel2, setIndustriesLevel2] = useState(initialIndustriesLevel2);
  const [formData, setFormData] = useState({
    positionName: job?.positionName || "",
    description: job?.description || "",
    cityId: job?.cityId || company.cityId,
    provinceId: initialProvinceId,
    industryLevel1Id: job?.industryLevel1Id || company.industryLevel1Id,
    industryLevel2Id: job?.industryLevel2Id || company.industryLevel2Id || undefined,
    salaryMin: job?.salaryMin ? parseInt(job.salaryMin) : undefined,
    salaryMax: job?.salaryMax ? parseInt(job.salaryMax) : undefined,
    workExperienceRequired: job?.workExperienceRequired || 0,
    educationRequired: job?.educationRequired || undefined,
    positionCount: job?.positionCount || 1,
    selectedSkillIds: job?.jobSkills?.map((js) => js.skillId) || [],
  });

  // 加载技能列表
  useEffect(() => {
    async function fetchSkills() {
      try {
        const response = await fetch("/api/skills");
        if (response.ok) {
          const data = await response.json();
          setSkills(data || []);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    }
    fetchSkills();
  }, []);

  // 当一级行业改变时，加载二级行业
  useEffect(() => {
    async function fetchIndustriesLevel2() {
      if (!formData.industryLevel1Id) {
        setIndustriesLevel2([]);
        setFormData((prev) => ({ ...prev, industryLevel2Id: undefined }));
        return;
      }

      try {
        const response = await fetch(`/api/industries-level2?level1Id=${formData.industryLevel1Id}`);
        if (response.ok) {
          const data = await response.json();
          setIndustriesLevel2(data || []);
          // 如果当前选择的二级行业不在新列表中，清空选择
          if (formData.industryLevel2Id && data) {
            const exists = data.some((ind: any) => ind.id === formData.industryLevel2Id);
            if (!exists) {
              setFormData((prev) => ({ ...prev, industryLevel2Id: undefined }));
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

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: company.id,
          positionName: formData.positionName,
          description: formData.description,
          industryLevel1Id: formData.industryLevel1Id,
          industryLevel2Id: formData.industryLevel2Id,
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          cityId: formData.cityId,
          workExperienceRequired: formData.workExperienceRequired,
          educationRequired: formData.educationRequired || undefined,
          positionCount: formData.positionCount,
          skillIds: formData.selectedSkillIds,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(job ? "职位更新成功！" : "职位发布成功！");
        router.push("/dashboard/jobs");
      } else {
        toast.error(result.error || (job ? "更新失败，请稍后重试" : "发布失败，请稍后重试"));
      }
    } catch (error: any) {
      toast.error(error.message || "操作失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }

  const toggleSkill = (skillId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkillIds: prev.selectedSkillIds.includes(skillId)
        ? prev.selectedSkillIds.filter((id) => id !== skillId)
        : [...prev.selectedSkillIds, skillId],
    }));
  };

  // 按分类分组技能
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>填写职位的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="positionName">职位名称 *</Label>
              <Input
                id="positionName"
                value={formData.positionName}
                onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                required
                maxLength={100}
                placeholder="例如：前端开发工程师"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">职位描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                minLength={10}
                placeholder="详细描述职位要求、工作内容等..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>工作地点 *</Label>
                <ProvinceCitySelect
                  selectedProvinceId={formData.provinceId}
                  selectedCityId={formData.cityId}
                  onProvinceChange={(provinceId) => {
                    setFormData({ ...formData, provinceId, cityId: undefined });
                  }}
                  onCityChange={(cityId) => {
                    setFormData({ ...formData, cityId: cityId || company.cityId });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>所属行业 *</Label>
                <IndustrySelect
                  selectedLevel1Id={formData.industryLevel1Id}
                  selectedLevel2Id={formData.industryLevel2Id}
                  onLevel1Change={(level1Id) => {
                    setFormData({
                      ...formData,
                      industryLevel1Id: level1Id || company.industryLevel1Id,
                      industryLevel2Id: undefined,
                    });
                  }}
                  onLevel2Change={(level2Id) => {
                    setFormData({ ...formData, industryLevel2Id: level2Id });
                  }}
                  level1Required={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>职位要求</CardTitle>
            <CardDescription>设置职位的薪资、经验和学历要求</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">最低薪资（元/月）</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  min="0"
                  value={formData.salaryMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="例如：8000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">最高薪资（元/月）</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  min="0"
                  value={formData.salaryMax || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryMax: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="例如：15000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workExperienceRequired">工作经验（年）</Label>
                <Input
                  id="workExperienceRequired"
                  type="number"
                  min="0"
                  value={formData.workExperienceRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workExperienceRequired: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationRequired">学历要求</Label>
                <Select
                  value={formData.educationRequired || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      educationRequired: value === "none" ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择学历要求" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不限</SelectItem>
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
              <Label htmlFor="positionCount">招聘人数 *</Label>
              <Input
                id="positionCount"
                type="number"
                min="1"
                value={formData.positionCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    positionCount: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>技能要求</CardTitle>
            <CardDescription>选择职位所需的技能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(skillsByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground">加载中...</p>
            ) : (
              Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium">{category}</Label>
                  <div className="flex flex-wrap gap-3">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill.id}`}
                          checked={formData.selectedSkillIds.includes(skill.id)}
                          onCheckedChange={() => toggleSkill(skill.id)}
                        />
                        <Label
                          htmlFor={`skill-${skill.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {skill.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : job ? "保存修改" : "发布职位"}
        </Button>
      </div>
    </form>
  );
}

