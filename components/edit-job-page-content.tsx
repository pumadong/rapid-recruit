"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import { JobForm } from "@/components/job-form";
import { AuthGuard } from "@/components/auth-guard";

interface Company {
  id: number;
  companyName: string;
  cityId?: number | null;
  industryLevel1Id?: number | null;
}

interface Job {
  id: number;
  positionName: string;
  cityId?: number | null;
  industryLevel1Id?: number | null;
  industryLevel2Id?: number | null;
  [key: string]: any;
}

interface City {
  id: number;
  name: string;
  province_id: number;
}

interface IndustryLevel1 {
  id: number;
  name: string;
  code: string;
}

interface IndustryLevel2 {
  id: number;
  name: string;
  industry_level1_id: number;
  code: string;
}

export function EditJobPageContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [initialProvinceId, setInitialProvinceId] = useState<number | undefined>();
  const [initialCities, setInitialCities] = useState<City[]>([]);
  const [industriesLevel1, setIndustriesLevel1] = useState<IndustryLevel1[]>([]);
  const [initialIndustriesLevel2, setInitialIndustriesLevel2] = useState<IndustryLevel2[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          router.push("/login");
          return;
        }

        const response = await fetch(`/api/dashboard/jobs/${jobId}`, {
          headers: {
            Authorization: authHeader,
          },
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          router.push("/dashboard/jobs");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }

        const data = await response.json();
        setCompany(data.company);
        setJob(data.job);
        setInitialProvinceId(data.initialProvinceId);
        setInitialCities(data.initialCities || []);
        setIndustriesLevel1(data.industriesLevel1 || []);
        setInitialIndustriesLevel2(data.initialIndustriesLevel2 || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !company || !job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <HeaderClient />
        </Suspense>
        <main className="flex-1 container py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">加载失败：{error || "数据不存在"}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">编辑职位</h1>
            <p className="text-muted-foreground">修改职位信息</p>
          </div>

          <JobForm
            company={company}
            job={job}
            initialProvinceId={initialProvinceId}
            initialCities={initialCities}
            industriesLevel1={industriesLevel1}
            initialIndustriesLevel2={initialIndustriesLevel2}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

