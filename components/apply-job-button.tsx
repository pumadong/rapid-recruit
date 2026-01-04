"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/auth-client";

interface ApplyJobButtonProps {
  jobId: number;
  talentId?: number;
  onApplySuccess?: () => void; // 申请成功后的回调
}

export function ApplyJobButton({ jobId, talentId, onApplySuccess }: ApplyJobButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader || !talentId) {
      toast.error("请先登录");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/applications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ jobPositionId: jobId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("申请成功！");
        // 调用回调函数
        if (onApplySuccess) {
          onApplySuccess();
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error || "申请失败，请稍后重试");
      }
    } catch (error: any) {
      toast.error(error.message || "申请失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="lg" className="flex-1" onClick={handleApply} disabled={isLoading}>
      {isLoading ? "申请中..." : "立即申请"}
    </Button>
  );
}

