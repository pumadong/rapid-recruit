import { Suspense } from "react"
import { HeaderClient } from "@/components/header-client"
import { Footer } from "@/components/footer"
import { JobsList } from "@/components/jobs-list"

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; cityId?: string; provinceId?: string; page?: string }>
}) {
  const params = await searchParams;
  const keyword = params.keyword || undefined;
  const cityId = params.cityId ? parseInt(params.cityId) : undefined;
  const provinceId = params.provinceId ? parseInt(params.provinceId) : undefined;
  const page = parseInt(params.page || "1");

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <Suspense fallback={<div className="flex-1" />}>
        <JobsList keyword={keyword} cityId={cityId} provinceId={provinceId} page={page} />
      </Suspense>
      <Footer />
    </div>
  )
}
