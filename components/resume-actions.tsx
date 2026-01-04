"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/auth-client";
import type { ApplicationStatus } from "@/types/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumeActionsProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
  onStatusChange?: (newStatus: ApplicationStatus) => void; // 状态更新后的回调
}

export function ResumeActions({ applicationId, currentStatus, onStatusChange }: ResumeActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus: ApplicationStatus) {
    if (newStatus === currentStatus) {
      return;
    }

    setIsUpdating(true);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        toast.error("请先登录");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/dashboard/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("状态更新成功");
        // 调用回调函数通知父组件刷新数据
        if (onStatusChange) {
          onStatusChange(newStatus);
        } else {
          // 如果没有回调，使用 router.refresh() 作为后备方案
          router.refresh();
        }
      } else {
        toast.error(result.error || "更新失败，请稍后重试");
      }
    } catch (error: any) {
      toast.error(error.message || "更新失败，请稍后重试");
    } finally {
      setIsUpdating(false);
    }
  }

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: "pending", label: "待审核" },
    { value: "reviewed", label: "已查看" },
    { value: "accepted", label: "已接受" },
    { value: "rejected", label: "已拒绝" },
  ];

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

