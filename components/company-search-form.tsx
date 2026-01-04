"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProvinceCitySelect } from "@/components/province-city-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

interface CompanySearchFormProps {
  initialKeyword?: string;
  initialProvinceId?: number;
  initialCityId?: number;
  initialIndustryLevel1Id?: number;
  className?: string;
}

export function CompanySearchForm({
  initialKeyword = "",
  initialProvinceId,
  initialCityId,
  initialIndustryLevel1Id,
  className,
}: CompanySearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [provinceId, setProvinceId] = useState<number | undefined>(initialProvinceId);
  const [cityId, setCityId] = useState<number | undefined>(initialCityId);
  const [industryLevel1Id, setIndustryLevel1Id] = useState<number | undefined>(initialIndustryLevel1Id);
  const [industriesLevel1, setIndustriesLevel1] = useState<Array<{ id: number; name: string }>>([]);

  // 获取一级行业列表
  useEffect(() => {
    async function fetchIndustries() {
      try {
        const response = await fetch("/api/industries-level1");
        if (response.ok) {
          const data = await response.json();
          setIndustriesLevel1(data || []);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      }
    }
    fetchIndustries();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }
    if (cityId) {
      params.set("cityId", cityId.toString());
    } else if (provinceId) {
      params.set("provinceId", provinceId.toString());
    }
    if (industryLevel1Id) {
      params.set("industryLevel1Id", industryLevel1Id.toString());
    }

    router.push(`/companies?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${className}`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索企业名称或描述"
            className="pl-9"
          />
        </div>
        <ProvinceCitySelect
          selectedProvinceId={provinceId}
          selectedCityId={cityId}
          onProvinceChange={(newProvinceId) => {
            setProvinceId(newProvinceId);
            // 省份改变时，清空城市选择
            if (newProvinceId !== provinceId) {
              setCityId(undefined);
            }
          }}
          onCityChange={setCityId}
        />
        <Select
          value={industryLevel1Id?.toString() || undefined}
          onValueChange={(value) => setIndustryLevel1Id(value && value !== "all" ? parseInt(value) : undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择行业" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部行业</SelectItem>
            {industriesLevel1.map((industry) => (
              <SelectItem key={industry.id} value={industry.id.toString()}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full cursor-pointer">
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
      </div>
    </form>
  );
}

