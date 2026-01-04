"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { seedCompaniesAndJobs } from "@/server/actions/seed-companies-jobs";
import { seedTalents } from "@/server/actions/seed-talents";
import { toast } from "sonner";

export default function SeedPage() {
  const [isLoadingCompaniesJobs, setIsLoadingCompaniesJobs] = useState(false);
  const [isLoadingTalents, setIsLoadingTalents] = useState(false);
  const [companiesJobsResult, setCompaniesJobsResult] = useState<any>(null);
  const [talentsResult, setTalentsResult] = useState<any>(null);

  const handleSeedCompaniesAndJobs = async () => {
    setIsLoadingCompaniesJobs(true);
    setCompaniesJobsResult(null);

    try {
      const result = await seedCompaniesAndJobs();
      setCompaniesJobsResult(result);
      
      if (result.success && result.summary) {
        toast.success(
          `企业和职位初始化成功！创建了 ${result.summary.companies} 个公司、${result.summary.jobs} 个职位`
        );
      } else {
        toast.error(`初始化失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`初始化失败: ${error.message}`);
      setCompaniesJobsResult({ success: false, error: error.message });
    } finally {
      setIsLoadingCompaniesJobs(false);
    }
  };

  const handleSeedTalents = async () => {
    setIsLoadingTalents(true);
    setTalentsResult(null);

    try {
      const result = await seedTalents();
      setTalentsResult(result);
      
      if (result.success && result.summary) {
        toast.success(
          `人才初始化成功！创建了 ${result.summary.talents} 个人才`
        );
      } else {
        toast.error(`初始化失败: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`初始化失败: ${error.message}`);
      setTalentsResult({ success: false, error: error.message });
    } finally {
      setIsLoadingTalents(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-3xl space-y-6">
      {/* 企业和职位初始化 */}
      <Card>
        <CardHeader>
          <CardTitle>企业和职位初始化</CardTitle>
          <CardDescription>
            生成测试数据：100 个公司、500 个职位
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">说明：</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>自动创建基础数据（省份、城市、行业、技能）</li>
              <li>创建 100 个企业用户和公司信息</li>
              <li>创建 500 个职位信息（带技能要求）</li>
              <li>所有企业测试账号的默认密码为：12345678</li>
              <li>企业账号：13800000001 - 13800000100</li>
            </ul>
          </div>

          <Button
            onClick={handleSeedCompaniesAndJobs}
            disabled={isLoadingCompaniesJobs}
            size="lg"
            className="w-full"
          >
            {isLoadingCompaniesJobs ? "正在初始化..." : "初始化企业和职位（100公司 + 500职位）"}
          </Button>

          {companiesJobsResult && (
            <div className={`p-4 rounded-lg ${companiesJobsResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <h3 className={`font-semibold mb-2 ${companiesJobsResult.success ? "text-green-800" : "text-red-800"}`}>
                {companiesJobsResult.success ? "✅ 初始化成功" : "❌ 初始化失败"}
              </h3>
              {companiesJobsResult.success && companiesJobsResult.summary && (
                <div className="text-sm space-y-1">
                  <p>📦 公司: {companiesJobsResult.summary.companies} 个</p>
                  <p>💼 职位: {companiesJobsResult.summary.jobs} 个</p>
                </div>
              )}
              {companiesJobsResult.error && (
                <p className="text-sm text-red-700">{companiesJobsResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 人才初始化 */}
      <Card>
        <CardHeader>
          <CardTitle>人才初始化</CardTitle>
          <CardDescription>
            生成测试数据：500 个人才
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">说明：</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>自动创建基础数据（省份、城市、技能）</li>
              <li>创建 500 个人才用户和人才信息</li>
              <li>为每个人才添加 1-6 个技能</li>
              <li>所有人才测试账号的默认密码为：12345678</li>
              <li>人才账号：13900000001 - 13900000500</li>
            </ul>
          </div>

          <Button
            onClick={handleSeedTalents}
            disabled={isLoadingTalents}
            size="lg"
            className="w-full"
          >
            {isLoadingTalents ? "正在初始化..." : "初始化人才（500个）"}
          </Button>

          {talentsResult && (
            <div className={`p-4 rounded-lg ${talentsResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <h3 className={`font-semibold mb-2 ${talentsResult.success ? "text-green-800" : "text-red-800"}`}>
                {talentsResult.success ? "✅ 初始化成功" : "❌ 初始化失败"}
              </h3>
              {talentsResult.success && talentsResult.summary && (
                <div className="text-sm space-y-1">
                  <p>👤 人才: {talentsResult.summary.talents} 个</p>
                </div>
              )}
              {talentsResult.error && (
                <p className="text-sm text-red-700">{talentsResult.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

