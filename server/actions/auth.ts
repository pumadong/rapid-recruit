"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@/lib/errors";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateToken } from "@/lib/token";

// 注册表单验证
const registerSchema = z.object({
  phone: z.string().regex(/^\d{11}$/, "手机号必须是11位数字"),
  password: z.string().min(8, "密码至少8位"),
  userType: z.enum(["talent", "company"]),
  realName: z.string().optional(),
  companyName: z.string().optional(),
  cityId: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  industryLevel1Id: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  industryLevel2Id: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
});

// 登录表单验证
const loginSchema = z.object({
  phone: z.string().regex(/^\d{11}$/, "手机号必须是11位数字"),
  password: z.string().min(1, "密码不能为空"),
});

/**
 * 用户注册
 */
export async function register(formData: FormData) {
  try {
    // FormData.get() 返回 null 如果字段不存在，需要转换为 undefined
    const getFormValue = (key: string): string | undefined => {
      const value = formData.get(key);
      return value === null ? undefined : (value as string);
    };

    const data = {
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      userType: formData.get("userType") as "talent" | "company",
      realName: getFormValue("realName"),
      companyName: getFormValue("companyName"),
      cityId: getFormValue("cityId"),
      industryLevel1Id: getFormValue("industryLevel1Id"),
      industryLevel2Id: getFormValue("industryLevel2Id"),
    };

    console.log("注册数据:", { ...data, password: "***" });

    // 验证输入
    const validated = registerSchema.parse(data);
    console.log("验证后的数据:", { ...validated, password: "***" });

    const supabase = createAdminClient();

    // 检查手机号是否已存在
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("phone", validated.phone)
      .limit(1);

    if (checkError) {
      console.error("检查用户是否存在时出错:", checkError);
      return { success: false, error: `检查手机号失败: ${checkError.message}`, code: "INTERNAL_ERROR" };
    }

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: "手机号已被注册", code: "CONFLICT" };
    }

    // 哈希密码
    const hashedPassword = await hashPassword(validated.password);

    // 创建用户
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        phone: validated.phone,
        password: hashedPassword,
        user_type: validated.userType,
      })
      .select()
      .single();

    if (userError) {
      console.error("创建用户失败:", userError);
      return { success: false, error: `创建用户失败: ${userError.message}`, code: "INTERNAL_ERROR" };
    }

    if (!newUser) {
      console.error("创建用户失败: 未返回用户数据");
      return { success: false, error: "创建用户失败: 未返回用户数据", code: "INTERNAL_ERROR" };
    }

    console.log("用户创建成功:", newUser.id);

    // 根据用户类型创建关联记录
    if (validated.userType === "talent") {
      if (!validated.realName) {
        return { success: false, error: "人才注册必须提供真实姓名", code: "VALIDATION_ERROR" };
      }
      const { error: talentError } = await supabase
        .from("talents")
        .insert({
          user_id: newUser.id,
          real_name: validated.realName,
        });

      if (talentError) {
        console.error("创建人才记录失败:", talentError);
        // 如果创建人才记录失败，尝试删除已创建的用户
        await supabase.from("users").delete().eq("id", newUser.id);
        return { success: false, error: `创建人才信息失败: ${talentError.message}`, code: "INTERNAL_ERROR" };
      }
      console.log("人才记录创建成功");
    } else {
      if (!validated.companyName) {
        return { success: false, error: "企业注册必须提供企业名称", code: "VALIDATION_ERROR" };
      }
      if (!validated.cityId) {
        return { success: false, error: "企业注册必须选择所在城市", code: "VALIDATION_ERROR" };
      }
      if (!validated.industryLevel1Id) {
        return { success: false, error: "企业注册必须选择所属行业", code: "VALIDATION_ERROR" };
      }
      
      const { error: companyError } = await supabase
        .from("companies")
        .insert({
          user_id: newUser.id,
          company_name: validated.companyName,
          city_id: validated.cityId,
          industry_level1_id: validated.industryLevel1Id,
          industry_level2_id: validated.industryLevel2Id || null,
        });

      if (companyError) {
        console.error("创建企业记录失败:", companyError);
        // 如果创建企业记录失败，尝试删除已创建的用户
        await supabase.from("users").delete().eq("id", newUser.id);
        return { success: false, error: `创建企业信息失败: ${companyError.message}`, code: "INTERNAL_ERROR" };
      }
      console.log("企业记录创建成功");
    }

    console.log("注册成功，用户ID:", newUser.id);
    
    // 生成 JWT Token
    const token = generateToken(newUser.id, validated.userType);
    
    return { 
      success: true, 
      userId: newUser.id,
      userType: validated.userType,
      token,
    };
  } catch (error) {
    console.error("注册过程中出错:", error);
    console.error("错误详情:", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      console.error("验证错误:", firstError);
      return { success: false, error: firstError.message, code: "VALIDATION_ERROR" };
    }
    // 对于其他错误，返回错误结果对象而不是抛出
    const errorMessage = error instanceof Error ? error.message : "注册失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 用户登录
 */
export async function login(formData: FormData) {
  try {
    const data = {
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
    };

    // 验证输入
    const validated = loginSchema.parse(data);

    const supabase = createAdminClient();

    // 查找用户
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", validated.phone)
      .single();

    if (error || !user) {
      return { success: false, error: "手机号或密码错误", code: "UNAUTHORIZED" };
    }

    // 验证密码
    const isValid = await verifyPassword(validated.password, user.password);

    if (!isValid) {
      return { success: false, error: "手机号或密码错误", code: "UNAUTHORIZED" };
    }

    // 生成 JWT Token
    const token = generateToken(user.id, user.user_type);
    
    console.log("登录成功，用户ID:", user.id, "用户类型:", user.user_type);

    return { 
      success: true, 
      userId: user.id, 
      userType: user.user_type,
      token,
    };
  } catch (error) {
    console.error("登录过程中出错:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message, code: "VALIDATION_ERROR" };
    }
    // 对于其他错误，返回错误结果对象
    const errorMessage = error instanceof Error ? error.message : "登录失败，请稍后重试";
    return { success: false, error: errorMessage, code: "INTERNAL_ERROR" };
  }
}

/**
 * 用户登出
 * 注意：使用 token 后，登出主要由客户端处理（删除 localStorage 中的 token）
 * 这个函数主要用于服务端清理（如果需要的话）
 */
export async function logout() {
  // Token 方式下，登出主要由客户端处理
  // 服务端可以在这里添加 token 黑名单逻辑（如果需要）
  redirect("/login");
}
