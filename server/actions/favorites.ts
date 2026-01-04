"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/server/queries/session";

/**
 * 切换职位收藏状态
 */
export async function toggleFavorite(talentId: number, jobId: number) {
  try {
    const supabase = createAdminClient();

    // 检查是否已收藏
    const { data: existing, error: checkError } = await supabase
      .from("job_favorites")
      .select("id")
      .eq("talent_id", talentId)
      .eq("job_position_id", jobId)
      .maybeSingle();

    // 如果表不存在，返回友好的错误信息
    if (checkError && (checkError.code === "PGRST116" || checkError.message.includes("does not exist") || checkError.message.includes("schema cache"))) {
      return {
        success: false,
        error: "收藏功能暂不可用，请先创建 job_favorites 表。请联系管理员或执行 SQL 脚本创建表。",
        code: "TABLE_NOT_FOUND",
      };
    }

    if (checkError) {
      return {
        success: false,
        error: `检查收藏状态失败: ${checkError.message}`,
        code: "INTERNAL_ERROR",
      };
    }

    if (existing) {
      // 取消收藏
      const { error } = await supabase
        .from("job_favorites")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return {
          success: false,
          error: `取消收藏失败: ${error.message}`,
          code: "INTERNAL_ERROR",
        };
      }

      return { success: true, isFavorite: false };
    } else {
      // 添加收藏
      const { error } = await supabase
        .from("job_favorites")
        .insert({
          talent_id: talentId,
          job_position_id: jobId,
        });

      if (error) {
        // 如果表不存在，返回友好的错误信息
        if (error.code === "PGRST116" || error.message.includes("does not exist") || error.message.includes("schema cache")) {
          return {
            success: false,
            error: "收藏功能暂不可用，请先创建 job_favorites 表。请联系管理员或执行 SQL 脚本创建表。",
            code: "TABLE_NOT_FOUND",
          };
        }
        
        return {
          success: false,
          error: `收藏失败: ${error.message}`,
          code: "INTERNAL_ERROR",
        };
      }

      return { success: true, isFavorite: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "操作失败，请稍后重试";
    
    // 检查是否是表不存在的错误
    if (errorMessage.includes("does not exist") || errorMessage.includes("schema cache")) {
      return {
        success: false,
        error: "收藏功能暂不可用，请先创建 job_favorites 表。请联系管理员或执行 SQL 脚本创建表。",
        code: "TABLE_NOT_FOUND",
      };
    }
    
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

