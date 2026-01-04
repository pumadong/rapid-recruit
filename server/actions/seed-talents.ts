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
    const { data: provinces } = await supabase
      .from("provinces")
      .select("id, code");
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

  // 检查并创建技能
  const { data: existingSkills } = await supabase.from("skills").select("id");

  if (!existingSkills || existingSkills.length === 0) {
    console.log("📌 正在创建技能数据...");
    const skills = [
      { name: "Java", category: "编程语言", description: "Java 编程语言" },
      { name: "Python", category: "编程语言", description: "Python 编程语言" },
      { name: "JavaScript", category: "编程语言", description: "JavaScript 编程语言" },
      {
        name: "TypeScript",
        category: "编程语言",
        description: "TypeScript 编程语言",
      },
      { name: "React", category: "前端框架", description: "React 前端框架" },
      { name: "Vue", category: "前端框架", description: "Vue 前端框架" },
      {
        name: "Next.js",
        category: "前端框架",
        description: "Next.js 全栈框架",
      },
      {
        name: "Node.js",
        category: "后端框架",
        description: "Node.js 后端框架",
      },
      { name: "SQL", category: "数据库", description: "SQL 数据库" },
      {
        name: "MongoDB",
        category: "数据库",
        description: "MongoDB 数据库",
      },
      {
        name: "PostgreSQL",
        category: "数据库",
        description: "PostgreSQL 数据库",
      },
      { name: "Docker", category: "工具", description: "Docker 容器技术" },
      { name: "Git", category: "工具", description: "Git 版本控制" },
      {
        name: "Kubernetes",
        category: "工具",
        description: "Kubernetes 容器编排",
      },
    ];

    await supabase.from("skills").insert(skills);
  }
}

/**
 * 初始化人才数据
 * 生成 500 个人才
 */
export async function seedTalents() {
  const supabase = createAdminClient();

  try {
    console.log("🌱 开始初始化人才数据...");

    // 0. 确保基础数据存在
    await ensureBaseData(supabase);

    // 1. 获取基础数据
    const { data: cities } = await supabase.from("cities").select("id");
    const { data: skills } = await supabase.from("skills").select("id");

    if (!cities || cities.length === 0) {
      throw new Error("无法获取城市数据，请检查数据库连接");
    }

    const cityIds = cities.map((c) => c.id);
    const skillIds = skills?.map((s) => s.id) || [];

    // 2. 生成人才数据（500个）
    console.log("👤 正在生成人才数据（500个）...");
    const talents: any[] = [];
    const talentUsers: any[] = [];

    const firstNames = [
      "张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴",
      "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗",
      "梁", "宋", "郑", "谢", "韩", "唐", "冯", "于", "董", "萧",
    ];
    const lastNames = [
      "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
      "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
      "平", "刚", "桂英", "建华", "文", "华", "建国", "红", "建华", "秀华",
    ];

    const jobTypes = ["前端", "后端", "全栈", "产品", "设计", "算法", "数据", "运维", "测试", "架构"];
    const focusAreas = ["Web开发", "移动应用", "系统架构", "产品设计", "用户体验", "大数据", "人工智能", "云计算", "区块链", "物联网"];

    for (let i = 1; i <= 500; i++) {
      const phone = `139${String(i).padStart(8, "0")}`;
      const password = await hashPassword("12345678");
      const cityId = cityIds[Math.floor(Math.random() * cityIds.length)];

      talentUsers.push({
        phone,
        password,
        user_type: "talent",
      });

      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[(i * 3) % lastNames.length];
      const realName = `${firstName}${lastName}`;
      
      // 生成出生日期（20-45岁之间）
      const age = 20 + (i % 26);
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - age);
      birthDate.setMonth(Math.floor(Math.random() * 12));
      birthDate.setDate(Math.floor(Math.random() * 28) + 1);

      const workExperienceYears = Math.floor(Math.random() * 12);
      const jobType = jobTypes[i % jobTypes.length];
      const focusArea = focusAreas[i % focusAreas.length];

      talents.push({
        user_id: null, // 将在创建用户后设置
        real_name: realName,
        gender: ["male", "female", "other"][Math.floor(Math.random() * 3)] as any,
        birth_date: birthDate.toISOString(),
        city_id: cityId,
        work_experience_years: workExperienceYears,
        education: ["high_school", "associate", "bachelor", "master", "phd"][
          Math.floor(Math.random() * 5)
        ] as any,
        major: ["计算机科学", "软件工程", "信息管理", "电子商务", "市场营销", "数学", "统计学", "电子工程", "自动化"][
          Math.floor(Math.random() * 9)
        ],
        bio: `我是一名具有${workExperienceYears}年工作经验的${jobType}开发人员，专注于${focusArea}领域。熟悉多种编程语言和框架，具备良好的团队协作能力和问题解决能力。曾参与多个大型项目的开发，有丰富的项目经验。`,
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
        console.error(`Error creating talent users batch ${Math.floor(i / 10) + 1}:`, error);
        throw error;
      }

      createdTalentUsers.push(...(users || []));
      
      // 显示进度
      if ((i + 10) % 100 === 0 || i + 10 >= talentUsers.length) {
        console.log(`   已创建 ${Math.min(i + 10, talentUsers.length)}/${talentUsers.length} 个用户`);
      }
    }

    // 关联用户ID到人才数据
    talents.forEach((talent, index) => {
      talent.user_id = createdTalentUsers[index].id;
    });

    // 批量创建人才
    console.log("👤 正在批量创建人才...");
    const createdTalents = [];
    for (let i = 0; i < talents.length; i += 20) {
      const batch = talents.slice(i, i + 20);
      const { data: talentsData, error } = await supabase
        .from("talents")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error creating talents batch ${Math.floor(i / 20) + 1}:`, error);
        throw error;
      }

      createdTalents.push(...(talentsData || []));
      
      // 显示进度
      if ((i + 20) % 100 === 0 || i + 20 >= talents.length) {
        console.log(`   已创建 ${Math.min(i + 20, talents.length)}/${talents.length} 个人才`);
      }
    }

    // 为人才添加技能
    if (skillIds.length > 0) {
      console.log("🎯 正在为人才添加技能...");
      let skillsProcessed = 0;
      for (const talent of createdTalents) {
        const numSkills = Math.floor(Math.random() * 6) + 1; // 1-6个技能
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

        skillsProcessed++;
        if (skillsProcessed % 100 === 0) {
          console.log(`   已处理 ${skillsProcessed}/${createdTalents.length} 个人才的技能`);
        }
      }
    }

    console.log(`✅ 已创建 ${createdTalents.length} 个人才`);

    return {
      success: true,
      summary: {
        talents: createdTalents.length,
      },
    };
  } catch (error: any) {
    console.error("❌ 初始化人才数据失败:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

