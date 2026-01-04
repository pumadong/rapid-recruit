import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 获取所有省份
 */
export async function getProvinces() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("provinces")
    .select("*")
    .order("name");
  
  if (error) {
    // 只在非超时错误时打印详细日志
    if (!error.message?.includes("fetch failed") && !error.message?.includes("timeout")) {
      console.error("Error fetching provinces:", error);
    }
    return [];
  }
  
  return data || [];
}

/**
 * 根据省份 ID 获取城市列表
 */
export async function getCitiesByProvinceId(provinceId?: number) {
  const supabase = createAdminClient();
  
  let query = supabase
    .from("cities")
    .select("*")
    .order("name");
  
  if (provinceId) {
    query = query.eq("province_id", provinceId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    // 只在非超时错误时打印详细日志
    if (!error.message?.includes("fetch failed") && !error.message?.includes("timeout")) {
      console.error("Error fetching cities:", error);
    }
    return [];
  }
  
  return data || [];
}

/**
 * 获取所有城市
 */
export async function getAllCities() {
  return getCitiesByProvinceId();
}

/**
 * 根据城市 ID 获取城市信息
 */
export async function getCityById(cityId: number) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("id", cityId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

