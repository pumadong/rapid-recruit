"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { ProvinceCitySelect } from "@/components/province-city-select";
import { useRouter, useSearchParams } from "next/navigation";

interface JobSearchFormProps {
  className?: string;
  variant?: "default" | "compact";
}

export function JobSearchForm({ className, variant = "default" }: JobSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [provinceId, setProvinceId] = useState<number | undefined>(
    searchParams.get("provinceId") ? parseInt(searchParams.get("provinceId")!) : undefined
  );
  const [cityId, setCityId] = useState<number | undefined>(
    searchParams.get("cityId") ? parseInt(searchParams.get("cityId")!) : undefined
  );

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
    
    router.push(`/jobs?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 sm:flex-row ${className}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索职位、公司或关键词"
            className="pl-9 border-0 focus-visible:ring-0"
          />
        </div>
        <ProvinceCitySelect
          selectedProvinceId={provinceId}
          selectedCityId={cityId}
          onProvinceChange={setProvinceId}
          onCityChange={setCityId}
          className="flex-1"
        />
        <Button type="submit" size="lg" className="sm:w-auto w-full cursor-pointer">
          搜索职位
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 md:flex-row ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          name="keyword"
          placeholder="搜索职位或关键词"
          className="pl-9"
        />
      </div>
      <div className="flex-1">
        <ProvinceCitySelect
          selectedProvinceId={provinceId}
          selectedCityId={cityId}
          onProvinceChange={setProvinceId}
          onCityChange={setCityId}
        />
      </div>
      <Button type="submit" className="md:w-auto cursor-pointer">
        <Search className="mr-2 h-4 w-4" />
        搜索
      </Button>
    </form>
  );
}

