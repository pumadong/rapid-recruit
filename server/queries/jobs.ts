import { createAdminClient } from "@/lib/supabase/admin";
import type { JobFilter, JobWithRelations } from "@/types/job";
import { NotFoundError } from "@/lib/errors";
import { getCitiesByProvinceId } from "@/server/queries/locations";

/**
 * 获取已发布的职位列表（带筛选）
 */
export async function getPublishedJobs(
  filters: JobFilter = {}
): Promise<JobWithRelations[]> {
  const supabase = createAdminClient();

  // 构建查询
  let query = supabase
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
    .eq("status", "published");

  // 应用筛选条件
  // 如果提供了 cityId，直接使用
  // 如果只提供了 provinceId，获取该省所有城市的 cityId 列表
  // 注意：这些筛选条件会与关键字搜索进行 AND 组合
  if (filters.cityId) {
    query = query.eq("city_id", filters.cityId);
  } else if (filters.provinceId) {
    // 获取该省的所有城市ID
    const cities = await getCitiesByProvinceId(filters.provinceId);
    if (cities.length > 0) {
      const cityIds = cities.map((city) => city.id);
      query = query.in("city_id", cityIds);
    } else {
      // 如果该省没有城市，返回空结果
      return [];
    }
  }

  if (filters.industryLevel1Id) {
    query = query.eq("industry_level1_id", filters.industryLevel1Id);
  }

  if (filters.industryLevel2Id) {
    query = query.eq("industry_level2_id", filters.industryLevel2Id);
  }

  if (filters.salaryMin) {
    query = query.gte("salary_min", filters.salaryMin);
  }

  if (filters.salaryMax) {
    query = query.lte("salary_max", filters.salaryMax);
  }

  if (filters.workExperienceRequired !== undefined) {
    query = query.eq("work_experience_required", filters.workExperienceRequired);
  }

  if (filters.educationRequired) {
    query = query.eq("education_required", filters.educationRequired);
  }

  // 关键字搜索（在应用了所有筛选条件后，关键字搜索会与之前的条件组合）
  // 注意：Supabase 的 or() 方法会与之前的筛选条件进行 AND 组合
  if (filters.keyword) {
    query = query.or(
      `position_name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`
    );
  }

  // 分页
  const limit = filters.limit || 20;
  const offset = ((filters.page || 1) - 1) * limit;
  query = query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: jobs, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // 提供更友好的错误信息
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      throw new Error(
        `无法连接到 Supabase 数据库。请检查：\n` +
        `1. 网络连接是否正常\n` +
        `2. NEXT_PUBLIC_SUPABASE_URL 环境变量是否正确（当前: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...）\n` +
        `3. SUPABASE_SERVICE_ROLE_KEY 是否已配置\n` +
        `4. 如果使用代理/VPN，请检查配置\n\n` +
        `原始错误: ${error.message}`
      );
    }
    
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // 获取所有职位 ID
  const jobIds = jobs.map((j: any) => j.id);

  // 获取职位技能要求
  let jobSkillsData: any[] = [];
  if (jobIds.length > 0) {
    const { data, error: skillsError } = await supabase
      .from("job_skills")
      .select(
        `
        *,
        skills(*)
      `
      )
      .in("job_position_id", jobIds);

    if (skillsError) {
      console.error("Error fetching job skills:", skillsError);
      // 如果是网络超时错误，继续执行但不添加技能数据
      if (skillsError.message?.includes("fetch failed") || skillsError.message?.includes("timeout")) {
        console.warn("获取技能数据超时，将继续显示职位但不显示技能");
      }
    } else {
      jobSkillsData = data || [];
    }
  }

  // 组装技能数据
  const skillsByJobId: Record<number, any[]> = {};
  if (jobSkillsData) {
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
          : null,
      });
    });
  }

  // 转换数据格式以匹配 JobWithRelations 类型
  return jobs.map((job: any) => ({
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
  })) as JobWithRelations[];
}

/**
 * 根据 ID 获取职位详情
 */
export async function getJobById(id: number): Promise<JobWithRelations> {
  const supabase = createAdminClient();

  const { data: job, error } = await supabase
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
    .eq("id", id)
    .single();

  if (error || !job) {
    throw new NotFoundError("Job");
  }

  // 获取职位技能要求
  const { data: jobSkillsData } = await supabase
    .from("job_skills")
    .select(
      `
      *,
      skills(*)
    `
    )
    .eq("job_position_id", id);

  return {
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
    jobSkills: (jobSkillsData || []).map((item: any) => ({
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
    })),
  } as JobWithRelations;
}

/**
 * 获取推荐职位（最新发布的职位）
 */
export async function getFeaturedJobs(limit: number = 6): Promise<JobWithRelations[]> {
  return getPublishedJobs({ limit, page: 1 });
}

/**
 * 统计职位数量
 */
export async function countJobs(filters: JobFilter = {}): Promise<number> {
  const supabase = createAdminClient();

  let query = supabase
    .from("job_positions")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // 城市/省份筛选（先应用地理位置筛选）
  if (filters.cityId) {
    query = query.eq("city_id", filters.cityId);
  } else if (filters.provinceId) {
    // 获取该省的所有城市ID
    const cities = await getCitiesByProvinceId(filters.provinceId);
    if (cities.length > 0) {
      const cityIds = cities.map((city) => city.id);
      query = query.in("city_id", cityIds);
    } else {
      // 如果该省没有城市，返回 0
      return 0;
    }
  }

  if (filters.industryLevel1Id) {
    query = query.eq("industry_level1_id", filters.industryLevel1Id);
  }

  // 关键字搜索（与之前的筛选条件进行 AND 组合）
  // Supabase 的 or() 方法会与之前的筛选条件进行 AND 组合，所以关键字搜索会与城市/省份筛选同时生效
  if (filters.keyword) {
    query = query.or(
      `position_name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`
    );
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error counting jobs:", error);
    // 如果是网络超时错误，返回 0 而不是抛出错误
    if (error.message?.includes("fetch failed") || error.message?.includes("timeout")) {
      console.warn("网络连接超时，返回默认值 0");
      return 0;
    }
    return 0;
  }

  return count || 0;
}

/**
 * 获取企业发布的所有职位（包括未发布的）
 */
export async function getJobsByCompanyId(
  companyId: number,
  status?: JobFilter["status"]
): Promise<JobWithRelations[]> {
  const supabase = createAdminClient();

  let query = supabase
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
    .eq("company_id", companyId);

  // 如果指定了状态，则过滤
  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false });

  const { data: jobs, error } = await query;

  if (error || !jobs || jobs.length === 0) {
    return [];
  }

  // 获取所有职位的技能要求
  const jobIds = jobs.map((job: any) => job.id);
  const { data: jobSkillsData } = await supabase
    .from("job_skills")
    .select(
      `
      *,
      skills(*)
    `
    )
    .in("job_position_id", jobIds);

  // 按职位ID分组技能
  const skillsByJobId: Record<number, any[]> = {};
  if (jobSkillsData) {
    jobSkillsData.forEach((js: any) => {
      if (!skillsByJobId[js.job_position_id]) {
        skillsByJobId[js.job_position_id] = [];
      }
      skillsByJobId[js.job_position_id].push({
        id: js.id,
        skillId: js.skill_id,
        isRequired: js.is_required,
        skill: js.skills
          ? {
              id: js.skills.id,
              name: js.skills.name,
              category: js.skills.category,
            }
          : undefined,
      });
    });
  }

  return jobs.map((job: any) => ({
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
  })) as JobWithRelations[];
}

/**
 * 测试管理员连接
 * 验证通过 HTTPS API 模式是否能正常连接数据库
 */
export async function testAdminConnection() {
  const supabase = createAdminClient();

  try {
    const { count, error } = await supabase
      .from("job_positions")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("❌ Test connection failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Test connection successful!");
    console.log(`📊 Total jobs in database: ${count || 0}`);
    return {
      success: true,
      count: count || 0,
    };
  } catch (error: any) {
    console.error("❌ Test connection error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
