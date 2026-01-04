import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError } from "@/lib/errors";
import type { Application } from "@/types/application";

/**
 * 根据 ID 获取应聘信息
 */
export async function getApplicationById(id: number): Promise<Application | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    talentId: data.talent_id,
    jobPositionId: data.job_position_id,
    status: data.status,
    appliedAt: new Date(data.applied_at),
    reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null,
    companyReply: data.company_reply,
    replyAt: data.reply_at ? new Date(data.reply_at) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 获取人才的应聘列表
 */
export async function getApplicationsByTalentId(talentId: number) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job_positions(
        *,
        companies(id, company_name, logo)
      )
    `)
    .eq("talent_id", talentId)
    .order("applied_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((app: any) => ({
    application: {
      id: app.id,
      talentId: app.talent_id,
      jobPositionId: app.job_position_id,
      status: app.status,
      appliedAt: new Date(app.applied_at),
      reviewedAt: app.reviewed_at ? new Date(app.reviewed_at) : null,
      companyReply: app.company_reply,
      replyAt: app.reply_at ? new Date(app.reply_at) : null,
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at),
    },
    jobPosition: app.job_positions,
    company: app.job_positions?.companies,
  }));
}

/**
 * 获取职位的所有应聘
 */
export async function getApplicationsByJobId(jobPositionId: number) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      talents(*)
    `)
    .eq("job_position_id", jobPositionId)
    .order("applied_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((app: any) => ({
    application: {
      id: app.id,
      talentId: app.talent_id,
      jobPositionId: app.job_position_id,
      status: app.status,
      appliedAt: new Date(app.applied_at),
      reviewedAt: app.reviewed_at ? new Date(app.reviewed_at) : null,
      companyReply: app.company_reply,
      replyAt: app.reply_at ? new Date(app.reply_at) : null,
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at),
    },
    talent: app.talents,
  }));
}

/**
 * 检查人才是否已申请该职位
 */
export async function hasApplied(
  talentId: number,
  jobPositionId: number
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("talent_id", talentId)
    .eq("job_position_id", jobPositionId)
    .maybeSingle();

  return !error && data !== null;
}

/**
 * 获取企业的所有应聘（通过公司ID）
 */
export async function getApplicationsByCompanyId(companyId: number, status?: string) {
  const supabase = createAdminClient();

  // 先获取企业的所有职位ID
  const { data: jobs, error: jobsError } = await supabase
    .from("job_positions")
    .select("id")
    .eq("company_id", companyId);

  if (jobsError || !jobs || jobs.length === 0) {
    return [];
  }

  const jobIds = jobs.map((job: any) => job.id);

  let query = supabase
    .from("applications")
    .select(`
      *,
      talents(*),
      job_positions(
        id,
        position_name,
        companies(id, company_name)
      )
    `)
    .in("job_position_id", jobIds);

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("applied_at", { ascending: false });

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((app: any) => ({
    application: {
      id: app.id,
      talentId: app.talent_id,
      jobPositionId: app.job_position_id,
      status: app.status,
      appliedAt: new Date(app.applied_at),
      reviewedAt: app.reviewed_at ? new Date(app.reviewed_at) : null,
      companyReply: app.company_reply,
      replyAt: app.reply_at ? new Date(app.reply_at) : null,
      createdAt: new Date(app.created_at),
      updatedAt: new Date(app.updated_at),
    },
    talent: app.talents,
    jobPosition: app.job_positions,
  }));
}
