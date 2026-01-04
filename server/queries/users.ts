import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError } from "@/lib/errors";
import type { User, Talent, Company } from "@/types/user";

/**
 * 根据 ID 获取用户信息（不含密码）
 */
export async function getUserById(id: number): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, phone, user_type, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    phone: data.phone,
    userType: data.user_type,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 根据手机号获取用户信息（包含密码，用于登录验证）
 */
export async function getUserByPhone(phone: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    phone: data.phone,
    password: data.password,
    userType: data.user_type,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 检查手机号是否已存在
 */
export async function isPhoneExists(phone: string): Promise<boolean> {
  const user = await getUserByPhone(phone);
  return user !== null;
}

/**
 * 根据用户 ID 获取人才信息
 */
export async function getTalentByUserId(userId: number): Promise<Talent | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("talents")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    realName: data.real_name,
    gender: data.gender,
    birthDate: data.birth_date ? new Date(data.birth_date) : null,
    cityId: data.city_id,
    workExperienceYears: data.work_experience_years || 0,
    education: data.education,
    major: data.major,
    bio: data.bio,
    avatar: data.avatar,
    phoneVerified: data.phone_verified || false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 根据用户 ID 获取企业信息
 */
export async function getCompanyByUserId(userId: number): Promise<Company | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    companyName: data.company_name,
    companySize: data.company_size,
    cityId: data.city_id,
    industryLevel1Id: data.industry_level1_id,
    industryLevel2Id: data.industry_level2_id,
    description: data.description,
    logo: data.logo,
    website: data.website,
    businessLicense: data.business_license,
    verificationStatus: data.verification_status,
    verificationTime: data.verification_time ? new Date(data.verification_time) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 获取用户及其关联信息
 */
export async function getUserWithProfile(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  if (user.userType === "talent") {
    const talent = await getTalentByUserId(userId);
    return { user, talent };
  } else {
    const company = await getCompanyByUserId(userId);
    return { user, company };
  }
}
