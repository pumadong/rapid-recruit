"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Province {
  id: number;
  name: string;
  code: string;
}

interface City {
  id: number;
  name: string;
  province_id: number;
  code: string;
}

interface ProvinceCitySelectProps {
  selectedProvinceId?: number;
  selectedCityId?: number;
  onProvinceChange?: (provinceId: number | undefined) => void;
  onCityChange?: (cityId: number | undefined) => void;
  className?: string;
  disabled?: boolean;
  initialCities?: Array<{ id: number; name: string; province_id: number }>;
}

export function ProvinceCitySelect({
  selectedProvinceId,
  selectedCityId,
  onProvinceChange,
  onCityChange,
  className,
  disabled = false,
  initialCities = [],
}: ProvinceCitySelectProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>(initialCities);
  const [loading, setLoading] = useState(true);

  // 获取省份列表
  useEffect(() => {
    let cancelled = false;
    
    async function fetchProvinces() {
      try {
        // 使用 AbortController 实现超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
        
        const response = await fetch("/api/provinces", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setProvinces(data || []);
          }
        }
      } catch (error: any) {
        // 只在非超时错误时打印详细日志
        if (!error.message?.includes("timeout") && !error.message?.includes("fetch failed")) {
          console.error("Error fetching provinces:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchProvinces();
    
    return () => {
      cancelled = true;
    };
  }, []);

  // 初始化：如果有初始城市列表，先设置
  useEffect(() => {
    if (initialCities.length > 0 && selectedProvinceId) {
      const matchingCities = initialCities.filter(city => city.province_id === selectedProvinceId);
      if (matchingCities.length > 0) {
        setCities(matchingCities);
      }
    }
  }, []); // 只在组件挂载时执行一次

  // 根据选择的省份获取城市列表（联动）
  useEffect(() => {
    let cancelled = false;
    
    async function fetchCities() {
      if (!selectedProvinceId) {
        // 如果没有选择省份，清空城市列表和选择
        setCities([]);
        if (onCityChange) {
          onCityChange(undefined);
        }
        return;
      }

      // 如果有初始城市列表且属于当前省份，先使用初始列表（避免不必要的API调用）
      if (initialCities.length > 0) {
        const matchingCities = initialCities.filter(city => city.province_id === selectedProvinceId);
        if (matchingCities.length > 0 && !cancelled) {
          setCities(matchingCities);
          // 如果当前选择的城市不在匹配的城市列表中，清空城市选择
          if (selectedCityId && !matchingCities.some(city => city.id === selectedCityId)) {
            if (onCityChange) {
              onCityChange(undefined);
            }
          }
          // 使用初始列表，不重新获取（除非初始列表中没有匹配的城市）
          return;
        }
      }

      // 添加重试机制
      let retries = 2; // 减少重试次数，避免频繁请求
      let lastError: any = null;

      while (retries > 0 && !cancelled) {
        try {
          // 使用 AbortController 实现超时
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
          
          const response = await fetch(`/api/cities?provinceId=${selectedProvinceId}`, {
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (!cancelled) {
              setCities(data || []);
              
              // 如果当前选择的城市不在新加载的城市列表中，清空城市选择
              if (selectedCityId && data) {
                const cityExists = data.some((city: City) => city.id === selectedCityId);
                if (!cityExists && onCityChange) {
                  onCityChange(undefined);
                }
              }
            }
            return; // 成功则退出重试循环
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error: any) {
          lastError = error;
          retries--;
          
          // 如果是超时错误且还有重试次数，等待后重试
          if (retries > 0 && (error.name === "AbortError" || error.message?.includes("timeout") || error.message?.includes("fetch failed"))) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒后重试
            continue;
          }
          
          // 最后一次尝试失败或非超时错误
          if (retries === 0 || (!error.message?.includes("timeout") && !error.message?.includes("fetch failed"))) {
            // 只在开发环境或非超时错误时打印详细日志
            if (process.env.NODE_ENV === "development" && !error.message?.includes("timeout") && !error.message?.includes("fetch failed")) {
              console.error("Error fetching cities:", error);
            }
            if (!cancelled) {
              setCities([]);
              if (onCityChange) {
                onCityChange(undefined);
              }
            }
            break;
          }
        }
      }
    }
    
    fetchCities();
    
    // 清理函数
    return () => {
      cancelled = true;
    };
  }, [selectedProvinceId]); // 只在省份改变时重新获取

  const handleProvinceChange = (value: string) => {
    const newProvinceId = value && value !== "all" ? parseInt(value) : undefined;
    // 省份改变时，先清空城市选择
    if (onCityChange) {
      onCityChange(undefined);
    }
    // 然后更新省份
    if (onProvinceChange) {
      onProvinceChange(newProvinceId);
    }
  };

  const handleCityChange = (value: string) => {
    const cityId = value && value !== "all" ? parseInt(value) : undefined;
    if (onCityChange) {
      onCityChange(cityId);
    }
  };

  if (loading) {
    return <div className={className}>加载中...</div>;
  }

  return (
    <div className={`flex gap-1 items-center ${className}`}>
      <div className="flex-1 min-w-0">
        <Select
          value={selectedProvinceId?.toString() || undefined}
          onValueChange={handleProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" disabled={disabled}>
            <SelectValue placeholder="省份" />
          </SelectTrigger>
          <SelectContent>
            {!disabled && <SelectItem value="all">全部省份</SelectItem>}
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id.toString()}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-0">
        <Select
          value={selectedCityId?.toString() || undefined}
          onValueChange={handleCityChange}
          disabled={disabled || !selectedProvinceId}
        >
          <SelectTrigger className="w-full" disabled={disabled || !selectedProvinceId}>
            <SelectValue placeholder={selectedProvinceId ? "城市" : "先选省份"} />
          </SelectTrigger>
          <SelectContent>
            {selectedProvinceId && !disabled && (
              <SelectItem value="all">全部城市</SelectItem>
            )}
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

