"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface BackButtonProps {
  children: ReactNode;
  fallbackHref?: string;
  className?: string;
}

/**
 * 返回按钮组件
 * 优先使用浏览器历史记录回退，如果没有历史记录则跳转到 fallbackHref
 * 这样可以保持之前的分页位置和搜索条件
 */
export function BackButton({ children, fallbackHref, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // 优先使用浏览器回退功能
    // 如果用户是从列表页跳转过来的，浏览器会自动回退到之前的页面（包括分页位置）
    // 如果直接访问详情页（没有历史记录），则使用 fallbackHref
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <Button variant="ghost" onClick={handleBack} className={className}>
      {children}
    </Button>
  );
}

