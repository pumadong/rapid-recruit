"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { CompanyForm } from "@/components/company-form";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import type { Company } from "@/types/user";

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

export function CompanyPageContent() {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [initialProvinceId, setInitialProvinceId] = useState<number | undefined>();
  const [initialCities, setInitialCities] = useState<City[]>([]);
  const [industriesLevel1, setIndustriesLevel1] = useState<IndustryLevel1[]>([]);
  const [initialIndustriesLevel2, setInitialIndustriesLevel2] = useState<IndustryLevel2[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/profile/company/data", {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      if (data.company) {
        setCompany(data.company);
        setInitialProvinceId(data.initialProvinceId);
        setInitialCities(data.cities || []);
        setIndustriesLevel1(data.industriesLevel1 || []);
        setInitialIndustriesLevel2(data.industriesLevel2 || []);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!company) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">企业信息管理</h1>
            <p className="text-muted-foreground">完善您的企业信息，提升企业形象和招聘效果</p>
          </div>

          <CompanyForm 
            company={company}
            initialProvinceId={initialProvinceId}
            initialCities={initialCities}
            industriesLevel1={industriesLevel1}
            initialIndustriesLevel2={initialIndustriesLevel2}
            onUpdateSuccess={fetchProfile}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

