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

interface IndustrySelectProps {
  selectedLevel1Id?: number;
  selectedLevel2Id?: number;
  onLevel1Change?: (level1Id: number | undefined) => void;
  onLevel2Change?: (level2Id: number | undefined) => void;
  className?: string;
  level1Required?: boolean;
}

export function IndustrySelect({
  selectedLevel1Id,
  selectedLevel2Id,
  onLevel1Change,
  onLevel2Change,
  className,
  level1Required = false,
}: IndustrySelectProps) {
  const [industriesLevel1, setIndustriesLevel1] = useState<IndustryLevel1[]>([]);
  const [industriesLevel2, setIndustriesLevel2] = useState<IndustryLevel2[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取一级行业列表
  useEffect(() => {
    let cancelled = false;
    
    async function fetchIndustriesLevel1() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch("/api/industries-level1", {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIndustriesLevel1(data || []);
          }
        }
      } catch (error: any) {
        if (!error.message?.includes("timeout") && !error.message?.includes("fetch failed")) {
          console.error("Error fetching industries level1:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchIndustriesLevel1();
    
    return () => {
      cancelled = true;
    };
  }, []);

  // 根据选择的一级行业获取二级行业列表（联动）
  useEffect(() => {
    let cancelled = false;
    
    async function fetchIndustriesLevel2() {
      if (!selectedLevel1Id) {
        setIndustriesLevel2([]);
        if (onLevel2Change) {
          onLevel2Change(undefined);
        }
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`/api/industries-level2?level1Id=${selectedLevel1Id}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIndustriesLevel2(data || []);
            
            // 如果当前选择的二级行业不在新加载的列表中，清空选择
            if (selectedLevel2Id && data) {
              const industryExists = data.some((ind: IndustryLevel2) => ind.id === selectedLevel2Id);
              if (!industryExists && onLevel2Change) {
                onLevel2Change(undefined);
              }
            }
          }
        }
      } catch (error: any) {
        if (!error.message?.includes("timeout") && !error.message?.includes("fetch failed")) {
          console.error("Error fetching industries level2:", error);
        }
        if (!cancelled) {
          setIndustriesLevel2([]);
          if (onLevel2Change) {
            onLevel2Change(undefined);
          }
        }
      }
    }
    
    fetchIndustriesLevel2();
    
    return () => {
      cancelled = true;
    };
  }, [selectedLevel1Id]);

  const handleLevel1Change = (value: string) => {
    const level1Id = value && value !== "all" ? parseInt(value) : undefined;
    if (onLevel1Change) {
      onLevel1Change(level1Id);
    }
    // 一级行业改变时，清空二级行业选择
    if (onLevel2Change) {
      onLevel2Change(undefined);
    }
  };

  const handleLevel2Change = (value: string) => {
    const level2Id = value && value !== "all" ? parseInt(value) : undefined;
    if (onLevel2Change) {
      onLevel2Change(level2Id);
    }
  };

  if (loading) {
    return <div className={className}>加载中...</div>;
  }

  return (
    <div className={`flex gap-1 items-center ${className}`}>
      <div className="flex-1 min-w-0">
        <Select
          value={selectedLevel1Id?.toString() || undefined}
          onValueChange={handleLevel1Change}
          required={level1Required}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="一级行业" />
          </SelectTrigger>
          <SelectContent>
            {!level1Required && <SelectItem value="all">全部行业</SelectItem>}
            {industriesLevel1.map((industry) => (
              <SelectItem key={industry.id} value={industry.id.toString()}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-0">
        <Select
          value={selectedLevel2Id?.toString() || undefined}
          onValueChange={handleLevel2Change}
          disabled={!selectedLevel1Id}
        >
          <SelectTrigger className="w-full" disabled={!selectedLevel1Id}>
            <SelectValue placeholder={selectedLevel1Id ? "二级行业（可选）" : "先选一级行业"} />
          </SelectTrigger>
          <SelectContent>
            {selectedLevel1Id && (
              <SelectItem value="all">不选二级行业</SelectItem>
            )}
            {industriesLevel2.map((industry) => (
              <SelectItem key={industry.id} value={industry.id.toString()}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

