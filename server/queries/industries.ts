import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 获取所有一级行业
 */
export async function getIndustriesLevel1() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("industries_level1")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching industries level1:", error);
    return [];
  }
  
  return data || [];
}

/**
 * 根据一级行业 ID 获取二级行业列表
 */
export async function getIndustriesLevel2ByLevel1Id(level1Id?: number) {
  const supabase = createAdminClient();
  
  let query = supabase
    .from("industries_level2")
    .select("*")
    .order("name");
  
  if (level1Id) {
    query = query.eq("industry_level1_id", level1Id);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching industries level2:", error);
    return [];
  }
  
  return data || [];
}

/**
 * 获取所有二级行业
 */
export async function getAllIndustriesLevel2() {
  return getIndustriesLevel2ByLevel1Id();
}

