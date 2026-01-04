"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/auth-client";

interface FavoriteJobButtonProps {
  jobId: number;
  talentId?: number;
}

export function FavoriteJobButton({ jobId, talentId }: FavoriteJobButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 检查收藏状态
  useEffect(() => {
    async function checkFavorite() {
      if (!talentId) {
        setIsChecking(false);
        return;
      }

      const authHeader = getAuthHeader();
      if (!authHeader) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/favorites?jobId=${jobId}`, {
          headers: {
            Authorization: authHeader,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite || false);
        } else {
          // 如果表不存在，默认为未收藏
          setIsFavorite(false);
        }
      } catch (error) {
        console.error("检查收藏状态失败:", error);
        // 出错时默认为未收藏，不影响用户体验
        setIsFavorite(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkFavorite();
  }, [jobId, talentId]);

  async function handleToggleFavorite() {
    const authHeader = getAuthHeader();
    if (!authHeader || !talentId) {
      toast.error("请先登录");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ jobId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsFavorite(result.isFavorite);
        toast.success(result.isFavorite ? "收藏成功" : "取消收藏成功");
        router.refresh();
      } else {
        toast.error(result.error || "操作失败，请稍后重试");
      }
    } catch (error: any) {
      toast.error(error.message || "操作失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }

  if (isChecking) {
    return (
      <Button size="lg" variant="outline" disabled>
        收藏职位
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      variant={isFavorite ? "default" : "outline"}
      onClick={handleToggleFavorite}
      disabled={isLoading || !talentId}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "已收藏" : "收藏职位"}
    </Button>
  );
}

