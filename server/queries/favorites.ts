import { createAdminClient } from "@/lib/supabase/admin";
import type { JobWithRelations } from "@/types/job";

/**
 * 获取求职者收藏的职位列表
 */
export async function getFavoriteJobsByTalentId(talentId: number) {
  const supabase = createAdminClient();

  // 先获取收藏记录
  const { data: favorites, error: favoritesError } = await supabase
    .from("job_favorites")
    .select("job_position_id, created_at")
    .eq("talent_id", talentId)
    .order("created_at", { ascending: false });

  if (favoritesError) {
    // 如果表不存在，返回空数组
    if (favoritesError.code === "PGRST116" || favoritesError.message.includes("does not exist") || favoritesError.message.includes("schema cache")) {
      return [];
    }
    console.error("Error fetching favorites:", favoritesError);
    return [];
  }

  if (!favorites || favorites.length === 0) {
    return [];
  }

  // 获取收藏的职位ID列表
  const jobIds = favorites.map((fav: any) => fav.job_position_id);

  // 获取职位详情（只获取已发布的职位）
  const { data: jobs, error: jobsError } = await supabase
    .from("job_positions")
    .select(
      `
      *,
      companies!inner(id, company_name, logo),
      cities!inner(id, name),
      industries_level1!inner(id, name),
      industries_level2(id, name)
    `
    )
    .in("id", jobIds)
    .eq("status", "published");

  if (jobsError) {
    console.error("Error fetching favorite jobs:", jobsError);
    return [];
  }

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // 获取职位技能要求
  const jobIdsForSkills = jobs.map((j: any) => j.id);
  let jobSkillsData: any[] = [];
  if (jobIdsForSkills.length > 0) {
    const { data: skillsData } = await supabase
      .from("job_skills")
      .select(
        `
        *,
        skills(*)
      `
      )
      .in("job_position_id", jobIdsForSkills);

    if (skillsData) {
      jobSkillsData = skillsData;
    }
  }

  // 组装技能数据
  const skillsByJobId: Record<number, any[]> = {};
  jobSkillsData.forEach((item: any) => {
    if (!skillsByJobId[item.job_position_id]) {
      skillsByJobId[item.job_position_id] = [];
    }
    skillsByJobId[item.job_position_id].push({
      id: item.id,
      skillId: item.skill_id,
      isRequired: item.is_required,
      skill: item.skills
        ? {
            id: item.skills.id,
            name: item.skills.name,
            category: item.skills.category,
          }
        : undefined,
    });
  });

  // 创建收藏时间映射
  const favoriteTimeMap: Record<number, Date> = {};
  favorites.forEach((fav: any) => {
    favoriteTimeMap[fav.job_position_id] = new Date(fav.created_at);
  });

  // 按照收藏时间排序（最新的在前）
  const sortedJobs = jobs.sort((a: any, b: any) => {
    const timeA = favoriteTimeMap[a.id]?.getTime() || 0;
    const timeB = favoriteTimeMap[b.id]?.getTime() || 0;
    return timeB - timeA;
  });

  return sortedJobs.map((job: any) => ({
    id: job.id,
    companyId: job.company_id,
    positionName: job.position_name,
    description: job.description,
    industryLevel1Id: job.industry_level1_id,
    industryLevel2Id: job.industry_level2_id,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    cityId: job.city_id,
    workExperienceRequired: job.work_experience_required,
    educationRequired: job.education_required,
    positionCount: job.position_count,
    status: job.status,
    publishedAt: job.published_at ? new Date(job.published_at) : null,
    expiredAt: job.expired_at ? new Date(job.expired_at) : null,
    createdAt: new Date(job.created_at),
    updatedAt: new Date(job.updated_at),
    favoriteTime: favoriteTimeMap[job.id],
    company: job.companies
      ? {
          id: job.companies.id,
          companyName: job.companies.company_name,
          logo: job.companies.logo,
        }
      : undefined,
    city: job.cities
      ? {
          id: job.cities.id,
          name: job.cities.name,
        }
      : undefined,
    industryLevel1: job.industries_level1
      ? {
          id: job.industries_level1.id,
          name: job.industries_level1.name,
        }
      : undefined,
    industryLevel2: job.industries_level2
      ? {
          id: job.industries_level2.id,
          name: job.industries_level2.name,
        }
      : undefined,
    jobSkills: skillsByJobId[job.id] || [],
  })) as (JobWithRelations & { favoriteTime: Date })[];
}

