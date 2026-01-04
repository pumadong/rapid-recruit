"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/crypto";

/**
 * 初始化基础数据（如果不存在）
 */
async function ensureBaseData(supabase: any) {
  // 检查并创建省份
  const { data: existingProvinces } = await supabase
    .from("provinces")
    .select("id");
  
  if (!existingProvinces || existingProvinces.length === 0) {
    console.log("📌 正在创建省份数据...");
    const provinces = [
      { name: "北京", code: "BJ" },
      { name: "上海", code: "SH" },
      { name: "广东", code: "GD" },
      { name: "浙江", code: "ZJ" },
      { name: "江苏", code: "JS" },
      { name: "四川", code: "SC" },
      { name: "湖北", code: "HB" },
      { name: "湖南", code: "HN" },
    ];
    
    const { data: createdProvinces, error } = await supabase
      .from("provinces")
      .insert(provinces)
      .select();
    
    if (error) {
      console.error("Error creating provinces:", error);
    }
  }

  // 检查并创建城市
  const { data: existingCities } = await supabase.from("cities").select("id");
  
  if (!existingCities || existingCities.length === 0) {
    console.log("📌 正在创建城市数据...");
    const { data: provinces } = await supabase.from("provinces").select("id, code");
    if (!provinces || provinces.length === 0) {
      throw new Error("无法获取省份数据");
    }

    const provinceMap: Record<string, number> = {};
    provinces.forEach((p: any) => {
      provinceMap[p.code] = p.id;
    });

    const cities = [
      { name: "北京", province_id: provinceMap["BJ"], code: "BJ01" },
      { name: "上海", province_id: provinceMap["SH"], code: "SH01" },
      { name: "深圳", province_id: provinceMap["GD"], code: "GD01" },
      { name: "广州", province_id: provinceMap["GD"], code: "GD02" },
      { name: "杭州", province_id: provinceMap["ZJ"], code: "ZJ01" },
      { name: "南京", province_id: provinceMap["JS"], code: "JS01" },
      { name: "成都", province_id: provinceMap["SC"], code: "SC01" },
      { name: "武汉", province_id: provinceMap["HB"], code: "HB01" },
      { name: "长沙", province_id: provinceMap["HN"], code: "HN01" },
      { name: "西安", province_id: provinceMap["HN"], code: "HN02" },
    ];

    await supabase.from("cities").insert(cities);
  }

  // 检查并创建行业
  const { data: existingIndustries1 } = await supabase
    .from("industries_level1")
    .select("id");
  
  if (!existingIndustries1 || existingIndustries1.length === 0) {
    console.log("📌 正在创建行业数据...");
    const industries1 = [
      { name: "互联网IT", code: "IT01", description: "互联网、软件、IT 相关行业" },
      { name: "金融", code: "FIN01", description: "银行、保险、证券等金融行业" },
      { name: "房地产", code: "RE01", description: "房地产开发、中介等行业" },
      { name: "制造业", code: "MFG01", description: "机械、电子、汽车等制造业" },
      { name: "教育", code: "EDU01", description: "教育、培训等行业" },
      { name: "医疗健康", code: "MED01", description: "医疗、健康、制药等行业" },
      { name: "零售电商", code: "RET01", description: "零售、电商、商贸等行业" },
      { name: "物流运输", code: "LOG01", description: "物流、运输、仓储等行业" },
    ];

    const { data: createdIndustries1 } = await supabase
      .from("industries_level1")
      .insert(industries1)
      .select();

    if (createdIndustries1 && createdIndustries1.length > 0) {
      const industries2 = [
        { name: "前端开发", industry_level1_id: createdIndustries1[0].id, code: "IT0101" },
        { name: "后端开发", industry_level1_id: createdIndustries1[0].id, code: "IT0102" },
        { name: "移动开发", industry_level1_id: createdIndustries1[0].id, code: "IT0103" },
        { name: "数据分析", industry_level1_id: createdIndustries1[0].id, code: "IT0104" },
        { name: "投资银行", industry_level1_id: createdIndustries1[1]?.id, code: "FIN0101" },
        { name: "风险管理", industry_level1_id: createdIndustries1[1]?.id, code: "FIN0102" },
      ];

      await supabase.from("industries_level2").insert(industries2);
    }
  }

  // 检查并创建技能
  const { data: existingSkills } = await supabase.from("skills").select("id");
  
  if (!existingSkills || existingSkills.length === 0) {
    console.log("📌 正在创建技能数据...");
    const skills = [
      { name: "Java", category: "编程语言", description: "Java 编程语言" },
      { name: "Python", category: "编程语言", description: "Python 编程语言" },
      { name: "JavaScript", category: "编程语言", description: "JavaScript 编程语言" },
      { name: "TypeScript", category: "编程语言", description: "TypeScript 编程语言" },
      { name: "React", category: "前端框架", description: "React 前端框架" },
      { name: "Vue", category: "前端框架", description: "Vue 前端框架" },
      { name: "Next.js", category: "前端框架", description: "Next.js 全栈框架" },
      { name: "Node.js", category: "后端框架", description: "Node.js 后端框架" },
      { name: "SQL", category: "数据库", description: "SQL 数据库" },
      { name: "MongoDB", category: "数据库", description: "MongoDB 数据库" },
      { name: "PostgreSQL", category: "数据库", description: "PostgreSQL 数据库" },
      { name: "Docker", category: "工具", description: "Docker 容器技术" },
      { name: "Git", category: "工具", description: "Git 版本控制" },
      { name: "Kubernetes", category: "工具", description: "Kubernetes 容器编排" },
    ];

    await supabase.from("skills").insert(skills);
  }
}

/**
 * 初始化测试数据
 * 生成 100 个公司、100 个职位、100 个人才
 */
export async function seedDatabase() {
  const supabase = createAdminClient();

  try {
    console.log("🌱 开始初始化数据...");

    // 0. 确保基础数据存在
    await ensureBaseData(supabase);

    // 1. 获取基础数据
    const { data: cities } = await supabase.from("cities").select("id");
    const { data: industriesLevel1 } = await supabase
      .from("industries_level1")
      .select("id");
    const { data: industriesLevel2 } = await supabase
      .from("industries_level2")
      .select("id, industry_level1_id");
    const { data: skills } = await supabase.from("skills").select("id");

    if (!cities || cities.length === 0) {
      throw new Error("无法获取城市数据，请检查数据库连接");
    }

    const cityIds = cities.map((c) => c.id);
    const industryLevel1Ids = industriesLevel1?.map((i) => i.id) || [];
    const industryLevel2Ids = industriesLevel2?.map((i) => i.id) || [];
    const skillIds = skills?.map((s) => s.id) || [];

    if (industryLevel1Ids.length === 0) {
      throw new Error("请先初始化行业数据");
    }

    // 2. 生成公司数据（100个）
    console.log("📦 正在生成公司数据...");
    const companies: any[] = [];
    const companyUsers: any[] = [];

    for (let i = 1; i <= 100; i++) {
      const phone = `138${String(i).padStart(8, "0")}`;
      const password = await hashPassword("12345678");
      const cityId = cityIds[Math.floor(Math.random() * cityIds.length)];
      const industryLevel1Id =
        industryLevel1Ids[Math.floor(Math.random() * industryLevel1Ids.length)];
      const relatedLevel2 = industriesLevel2?.filter(
        (i2) => i2.industry_level1_id === industryLevel1Id
      );
      const industryLevel2Id =
        relatedLevel2 && relatedLevel2.length > 0
          ? relatedLevel2[Math.floor(Math.random() * relatedLevel2.length)].id
          : null;

      const companyNames = [
        "科技创新",
        "互联网科技",
        "数字科技",
        "智能科技",
        "云端科技",
        "智慧科技",
        "未来科技",
        "创新科技",
        "前沿科技",
        "领先科技",
      ];

      companyUsers.push({
        phone,
        password,
        user_type: "company",
      });

      companies.push({
        user_id: null, // 将在创建用户后设置
        company_name: `${companyNames[i % companyNames.length]}有限公司${i}号`,
        company_size:
          ["1-50人", "51-200人", "201-500人", "501-1000人", "1000+人"][
            Math.floor(Math.random() * 5)
          ],
        city_id: cityId,
        industry_level1_id: industryLevel1Id,
        industry_level2_id: industryLevel2Id,
        description: `这是一家专注于技术创新和产品研发的公司，致力于为客户提供优质的产品和服务。公司拥有专业的团队和先进的技术，在行业内具有较高的知名度。`,
        verification_status: i % 3 === 0 ? "verified" : i % 3 === 1 ? "pending" : "unverified",
      });
    }

    // 批量创建用户
    console.log("👥 正在创建企业用户...");
    const createdCompanyUsers = [];
    for (let i = 0; i < companyUsers.length; i += 10) {
      const batch = companyUsers.slice(i, i + 10);
      const { data: users, error } = await supabase
        .from("users")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating users batch ${i / 10 + 1}:`, error);
        throw error;
      }

      createdCompanyUsers.push(...(users || []));
    }

    // 关联用户ID到公司数据
    companies.forEach((company, index) => {
      company.user_id = createdCompanyUsers[index].id;
    });

    // 批量创建公司
    console.log("🏢 正在创建公司...");
    const createdCompanies = [];
    for (let i = 0; i < companies.length; i += 10) {
      const batch = companies.slice(i, i + 10);
      const { data: companiesData, error } = await supabase
        .from("companies")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating companies batch ${i / 10 + 1}:`, error);
        throw error;
      }

      createdCompanies.push(...(companiesData || []));
    }

    console.log(`✅ 已创建 ${createdCompanies.length} 个公司`);

    // 3. 生成职位数据（100个）
    console.log("💼 正在生成职位数据...");
    const jobPositions: any[] = [];
    const jobSkillsData: any[] = [];

    const positionNames = [
      "高级前端工程师",
      "后端开发工程师",
      "全栈工程师",
      "产品经理",
      "UI/UX设计师",
      "数据分析师",
      "算法工程师",
      "运维工程师",
      "测试工程师",
      "架构师",
      "项目经理",
      "市场运营",
      "销售经理",
      "客户经理",
      "财务专员",
    ];

    const descriptions = [
      "负责公司核心产品的开发和维护，与团队协作完成项目目标。",
      "参与产品设计和需求分析，负责技术方案的设计和实现。",
      "优化系统性能，提升用户体验，确保产品质量。",
      "跟进技术发展趋势，推动技术创新和团队成长。",
      "参与代码审查，保证代码质量和团队协作效率。",
    ];

    for (let i = 0; i < 100; i++) {
      const company = createdCompanies[i % createdCompanies.length];
      const cityId = cityIds[Math.floor(Math.random() * cityIds.length)];
      const industryLevel1Id =
        industryLevel1Ids[Math.floor(Math.random() * industryLevel1Ids.length)];
      const relatedLevel2 = industriesLevel2?.filter(
        (i2) => i2.industry_level1_id === industryLevel1Id
      );
      const industryLevel2Id =
        relatedLevel2 && relatedLevel2.length > 0
          ? relatedLevel2[Math.floor(Math.random() * relatedLevel2.length)].id
          : null;

      const salaryMin = [8000, 10000, 12000, 15000, 18000, 20000][
        Math.floor(Math.random() * 6)
      ];
      const salaryMax = salaryMin + [5000, 10000, 15000, 20000][
        Math.floor(Math.random() * 4)
      ];

      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30));

      const jobPosition = {
        company_id: company.id,
        position_name: positionNames[i % positionNames.length],
        description: descriptions[i % descriptions.length] + `\n\n工作职责：\n1. 负责核心功能的开发和维护\n2. 参与产品设计和需求分析\n3. 优化系统性能和用户体验\n4. 与团队协作完成项目目标\n\n任职要求：\n1. ${3 + (i % 5)}年以上相关工作经验\n2. 熟悉相关技术栈\n3. 良好的沟通和协作能力\n4. 本科及以上学历`,
        industry_level1_id: industryLevel1Id,
        industry_level2_id: industryLevel2Id,
        salary_min: salaryMin.toString(),
        salary_max: salaryMax.toString(),
        city_id: cityId,
        work_experience_required: Math.floor(Math.random() * 6),
        education_required: ["high_school", "associate", "bachelor", "master", "phd"][
          Math.floor(Math.random() * 5)
        ] as any,
        position_count: Math.floor(Math.random() * 5) + 1,
        status: "published" as const,
        published_at: publishedAt.toISOString(),
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      jobPositions.push(jobPosition);
    }

    // 批量创建职位
    const createdJobs = [];
    for (let i = 0; i < jobPositions.length; i += 10) {
      const batch = jobPositions.slice(i, i + 10);
      const { data: jobs, error } = await supabase
        .from("job_positions")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating jobs batch ${i / 10 + 1}:`, error);
        throw error;
      }

      createdJobs.push(...(jobs || []));
    }

    // 为职位添加技能要求
    if (skillIds.length > 0) {
      console.log("🎯 正在为职位添加技能要求...");
      for (const job of createdJobs) {
        const numSkills = Math.floor(Math.random() * 4) + 1; // 1-4个技能
        const selectedSkills = skillIds
          .sort(() => Math.random() - 0.5)
          .slice(0, numSkills);

        const jobSkills = selectedSkills.map((skillId) => ({
          job_position_id: job.id,
          skill_id: skillId,
          is_required: Math.random() > 0.5,
        }));

        if (jobSkills.length > 0) {
          await supabase.from("job_skills").insert(jobSkills);
        }
      }
    }

    console.log(`✅ 已创建 ${createdJobs.length} 个职位`);

    // 4. 生成人才数据（100个）
    console.log("👤 正在生成人才数据...");
    const talents: any[] = [];
    const talentUsers: any[] = [];

    const firstNames = [
      "张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴",
      "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗",
    ];
    const lastNames = [
      "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
      "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
    ];

    for (let i = 1; i <= 100; i++) {
      const phone = `139${String(i).padStart(8, "0")}`;
      const password = await hashPassword("12345678");
      const cityId = cityIds[Math.floor(Math.random() * cityIds.length)];

      talentUsers.push({
        phone,
        password,
        user_type: "talent",
      });

      const realName = `${firstNames[i % firstNames.length]}${lastNames[i % lastNames.length]}`;
      const birthDate = new Date(1985 + (i % 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

      talents.push({
        user_id: null, // 将在创建用户后设置
        real_name: realName,
        gender: ["male", "female", "other"][Math.floor(Math.random() * 3)] as any,
        birth_date: birthDate.toISOString(),
        city_id: cityId,
        work_experience_years: Math.floor(Math.random() * 10),
        education: ["high_school", "associate", "bachelor", "master", "phd"][
          Math.floor(Math.random() * 5)
        ] as any,
        major: ["计算机科学", "软件工程", "信息管理", "电子商务", "市场营销"][
          Math.floor(Math.random() * 5)
        ],
        bio: `我是一名具有${Math.floor(Math.random() * 10)}年工作经验的${["前端", "后端", "全栈", "产品", "设计"][Math.floor(Math.random() * 5)]}开发人员，专注于${["Web开发", "移动应用", "系统架构", "产品设计", "用户体验"][Math.floor(Math.random() * 5)]}领域。`,
        phone_verified: Math.random() > 0.3, // 70% 已验证
      });
    }

    // 批量创建人才用户
    console.log("👥 正在创建人才用户...");
    const createdTalentUsers = [];
    for (let i = 0; i < talentUsers.length; i += 10) {
      const batch = talentUsers.slice(i, i + 10);
      const { data: users, error } = await supabase
        .from("users")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating talent users batch ${i / 10 + 1}:`, error);
        throw error;
      }

      createdTalentUsers.push(...(users || []));
    }

    // 关联用户ID到人才数据
    talents.forEach((talent, index) => {
      talent.user_id = createdTalentUsers[index].id;
    });

    // 批量创建人才
    const createdTalents = [];
    for (let i = 0; i < talents.length; i += 10) {
      const batch = talents.slice(i, i + 10);
      const { data: talentsData, error } = await supabase
        .from("talents")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating talents batch ${i / 10 + 1}:`, error);
        throw error;
      }

      createdTalents.push(...(talentsData || []));
    }

    // 为人才添加技能
    if (skillIds.length > 0) {
      console.log("🎯 正在为人才添加技能...");
      for (const talent of createdTalents) {
        const numSkills = Math.floor(Math.random() * 5) + 1; // 1-5个技能
        const selectedSkills = skillIds
          .sort(() => Math.random() - 0.5)
          .slice(0, numSkills);

        const talentSkills = selectedSkills.map((skillId) => ({
          talent_id: talent.id,
          skill_id: skillId,
          proficiency_level: ["beginner", "intermediate", "advanced", "expert"][
            Math.floor(Math.random() * 4)
          ],
        }));

        if (talentSkills.length > 0) {
          await supabase.from("talent_skills").insert(talentSkills);
        }
      }
    }

    console.log(`✅ 已创建 ${createdTalents.length} 个人才`);

    return {
      success: true,
      summary: {
        companies: createdCompanies.length,
        jobs: createdJobs.length,
        talents: createdTalents.length,
      },
    };
  } catch (error: any) {
    console.error("❌ 初始化数据失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

