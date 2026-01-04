import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError } from "@/lib/errors";
import type { Company } from "@/types/user";

/**
 * 企业信息（包含关联数据）
 */
export interface CompanyWithRelations extends Company {
  city?: {
    id: number;
    name: string;
    province_id: number;
  };
  province?: {
    id: number;
    name: string;
  };
  industryLevel1?: {
    id: number;
    name: string;
  };
  industryLevel2?: {
    id: number;
    name: string;
  } | null;
  jobCount?: number; // 职位数量
}

/**
 * 企业筛选条件
 */
export interface CompanyFilter {
  cityId?: number;
  provinceId?: number;
  industryLevel1Id?: number;
  industryLevel2Id?: number;
  keyword?: string; // 搜索关键词（企业名称、描述）
  limit?: number;
  offset?: number;
}

/**
 * 获取所有企业列表（带筛选）
 */
export async function getCompanies(filter: CompanyFilter = {}): Promise<CompanyWithRelations[]> {
  const supabase = createAdminClient();
  const { cityId, provinceId, industryLevel1Id, industryLevel2Id, keyword, limit = 20, offset = 0 } = filter;

  try {
    // 构建查询
    let query = supabase
      .from("companies")
      .select(`
        *,
        cities!inner (
          id,
          name,
          province_id,
          provinces (
            id,
            name
          )
        ),
        industries_level1!inner (
          id,
          name
        ),
        industries_level2 (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 城市筛选
    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    // 省份筛选（通过城市）
    if (provinceId && !cityId) {
      // 先获取该省份的所有城市ID
      const { data: cities } = await supabase
        .from("cities")
        .select("id")
        .eq("province_id", provinceId);

      if (cities && cities.length > 0) {
        const cityIds = cities.map((c) => c.id);
        query = query.in("city_id", cityIds);
      } else {
        // 如果没有城市，返回空数组
        return [];
      }
    }

    // 一级行业筛选
    if (industryLevel1Id) {
      query = query.eq("industry_level1_id", industryLevel1Id);
    }

    // 二级行业筛选
    if (industryLevel2Id) {
      query = query.eq("industry_level2_id", industryLevel2Id);
    }

    // 关键词搜索（企业名称或描述）
    if (keyword) {
      query = query.or(
        `company_name.ilike.%${keyword}%,description.ilike.%${keyword}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching companies:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 获取所有城市ID，然后查询省份信息
    const cityIds = data
      .map((c: any) => c.cities?.id)
      .filter((id: number | undefined): id is number => id !== undefined);
    
    const provinceMap = new Map<number, { id: number; name: string }>();
    if (cityIds.length > 0) {
      const uniqueCityIds = [...new Set(cityIds)];
      const { data: citiesWithProvinces } = await supabase
        .from("cities")
        .select(`
          id,
          province_id,
          provinces (
            id,
            name
          )
        `)
        .in("id", uniqueCityIds);

      if (citiesWithProvinces) {
        citiesWithProvinces.forEach((city: any) => {
          if (city.provinces) {
            provinceMap.set(city.province_id, {
              id: city.provinces.id,
              name: city.provinces.name,
            });
          }
        });
      }
    }

    // 获取每个企业的职位数量
    const companyIds = data.map((c: any) => c.id);
    const { data: jobCounts } = await supabase
      .from("job_positions")
      .select("company_id")
      .in("company_id", companyIds)
      .eq("status", "published");

    // 统计职位数量
    const jobCountMap = new Map<number, number>();
    if (jobCounts) {
      jobCounts.forEach((job: any) => {
        const count = jobCountMap.get(job.company_id) || 0;
        jobCountMap.set(job.company_id, count + 1);
      });
    }

    // 转换数据格式
    return data.map((company: any) => {
      const cityId = company.cities?.province_id;
      const province = cityId ? provinceMap.get(cityId) : undefined;

      return {
        id: company.id,
        userId: company.user_id,
        companyName: company.company_name,
        companySize: company.company_size,
        cityId: company.city_id,
        industryLevel1Id: company.industry_level1_id,
        industryLevel2Id: company.industry_level2_id,
        description: company.description,
        logo: company.logo,
        website: company.website,
        businessLicense: company.business_license,
        verificationStatus: company.verification_status,
        verificationTime: company.verification_time ? new Date(company.verification_time) : null,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at),
        city: company.cities
          ? {
              id: company.cities.id,
              name: company.cities.name,
              province_id: company.cities.province_id,
            }
          : undefined,
        province: province,
        industryLevel1: company.industries_level1
          ? {
              id: company.industries_level1.id,
              name: company.industries_level1.name,
            }
          : undefined,
        industryLevel2: company.industries_level2
          ? {
              id: company.industries_level2.id,
              name: company.industries_level2.name,
            }
          : null,
        jobCount: jobCountMap.get(company.id) || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

/**
 * 根据 ID 获取企业详情
 */
export async function getCompanyById(id: number): Promise<CompanyWithRelations | null> {
  const supabase = createAdminClient();

    try {
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        cities!inner (
          id,
          name,
          province_id
        ),
        industries_level1!inner (
          id,
          name
        ),
        industries_level2 (
          id,
          name
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    // 获取省份信息（Supabase 不支持嵌套查询，需要单独查询）
    let province = undefined;
    if (data.cities?.province_id) {
      const { data: provinceData, error: provinceError } = await supabase
        .from("provinces")
        .select("id, name")
        .eq("id", data.cities.province_id)
        .single();
      
      if (!provinceError && provinceData) {
        province = {
          id: provinceData.id,
          name: provinceData.name,
        };
      }
    }

    // 获取职位数量
    const { count } = await supabase
      .from("job_positions")
      .select("*", { count: "exact", head: true })
      .eq("company_id", id)
      .eq("status", "published");

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
      city: data.cities
        ? {
            id: data.cities.id,
            name: data.cities.name,
            province_id: data.cities.province_id,
          }
        : undefined,
      province: province,
      industryLevel1: data.industries_level1
        ? {
            id: data.industries_level1.id,
            name: data.industries_level1.name,
          }
        : undefined,
      industryLevel2: data.industries_level2
        ? {
            id: data.industries_level2.id,
            name: data.industries_level2.name,
          }
        : null,
      jobCount: count || 0,
    };
  } catch (error) {
    console.error("Error fetching company by id:", error);
    return null;
  }
}

/**
 * 统计企业总数
 */
export async function countCompanies(filter: CompanyFilter = {}): Promise<number> {
  const supabase = createAdminClient();
  const { cityId, provinceId, industryLevel1Id, industryLevel2Id, keyword } = filter;

  try {
    // 构建基础查询
    let query = supabase.from("companies").select("*", { count: "exact", head: true });

    // 城市筛选
    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    // 省份筛选（通过城市）
    if (provinceId && !cityId) {
      const { data: cities, error: citiesError } = await supabase
        .from("cities")
        .select("id")
        .eq("province_id", provinceId);

      if (citiesError) {
        console.error("Error fetching cities for province:", citiesError);
        return 0;
      }

      if (cities && cities.length > 0) {
        const cityIds = cities.map((c) => c.id);
        query = query.in("city_id", cityIds);
      } else {
        return 0;
      }
    }

    // 一级行业筛选
    if (industryLevel1Id) {
      query = query.eq("industry_level1_id", industryLevel1Id);
    }

    // 二级行业筛选（虽然前端不再使用，但保留以兼容）
    if (industryLevel2Id) {
      query = query.eq("industry_level2_id", industryLevel2Id);
    }

    // 关键词搜索（企业名称或描述）
    if (keyword) {
      query = query.or(
        `company_name.ilike.%${keyword}%,description.ilike.%${keyword}%`
      );
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting companies:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        filter,
      });
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting companies (catch):", {
      error: error instanceof Error ? error.message : String(error),
      filter,
    });
    return 0;
  }
}

