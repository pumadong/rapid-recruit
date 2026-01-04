import { createAdminClient } from "@/lib/supabase/admin";

export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

/**
 * 获取所有技能
 */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("category")
    .order("name");

  if (error || !data) {
    console.error("Error fetching skills:", error);
    return [];
  }

  return data.map((skill: any) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    description: skill.description || undefined,
  }));
}

/**
 * 根据分类获取技能
 */
export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("category", category)
    .order("name");

  if (error || !data) {
    console.error("Error fetching skills by category:", error);
    return [];
  }

  return data.map((skill: any) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    description: skill.description || undefined,
  }));
}

