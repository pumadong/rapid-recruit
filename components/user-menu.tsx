"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Briefcase, Heart } from "lucide-react";

interface UserMenuProps {
  userName: string;
  userType: "talent" | "company";
}

export function UserMenu({ userName, userType }: UserMenuProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    removeToken();
    router.push("/login");
    router.refresh();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
          <User className="h-4 w-4" />
          <span className="font-medium">{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{userName}</span>
            <span className="text-xs text-muted-foreground font-normal">
              {userType === "talent" ? "求职者" : "企业"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <Briefcase className="h-4 w-4" />
            <span>会员中心</span>
          </Link>
        </DropdownMenuItem>
        {userType === "company" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/jobs" className="flex items-center gap-2 cursor-pointer">
              <Briefcase className="h-4 w-4" />
              <span>我的职位</span>
            </Link>
          </DropdownMenuItem>
        )}
        {userType === "talent" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/applications" className="flex items-center gap-2 cursor-pointer">
                <Briefcase className="h-4 w-4" />
                <span>我的申请</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/favorites" className="flex items-center gap-2 cursor-pointer">
                <Heart className="h-4 w-4" />
                <span>我的收藏</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

