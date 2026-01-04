"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { ProfileForm } from "@/components/profile-form";
import { getAuthHeader } from "@/lib/auth-client";
import { Suspense } from "react";
import type { Talent } from "@/types/user";

interface City {
  id: number;
  name: string;
  province_id: number;
}

export function ProfilePageContent() {
  const router = useRouter();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [initialProvinceId, setInitialProvinceId] = useState<number | undefined>();
  const [initialCities, setInitialCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/profile/talent/data", {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      if (data.userProfile && data.userProfile.talent) {
        setTalent(data.userProfile.talent);
        
        // 获取城市和省份信息
        if (data.userProfile.talent.cityId) {
          const cityResponse = await fetch(`/api/cities?cityId=${data.userProfile.talent.cityId}`);
          if (cityResponse.ok) {
            const cityData = await cityResponse.json();
            if (cityData && cityData.length > 0) {
              const city = cityData[0];
              setInitialProvinceId(city.province_id);
              const citiesResponse = await fetch(`/api/cities?provinceId=${city.province_id}`);
              if (citiesResponse.ok) {
                const citiesData = await citiesResponse.json();
                setInitialCities(citiesData || []);
              }
            }
          }
        }
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  if (!talent) {
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
            <h1 className="text-3xl font-bold mb-2">个人信息管理</h1>
            <p className="text-muted-foreground">完善您的个人信息，让企业更好地了解您</p>
          </div>

          <ProfileForm 
            talent={talent} 
            initialProvinceId={initialProvinceId} 
            initialCities={initialCities}
            onUpdateSuccess={fetchProfile}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

