import { Suspense } from "react";
import { HeaderClient } from "@/components/header-client";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Briefcase } from "lucide-react";
import { getCompanies, countCompanies } from "@/server/queries/companies";
import { CompanySearchForm } from "@/components/company-search-form";
import Link from "next/link";
import Image from "next/image";

interface CompaniesPageProps {
  searchParams: Promise<{
    keyword?: string;
    provinceId?: string;
    cityId?: string;
    industryLevel1Id?: string;
    page?: string;
  }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const keyword = params.keyword || undefined;
  const provinceId = params.provinceId ? parseInt(params.provinceId) : undefined;
  const cityId = params.cityId ? parseInt(params.cityId) : undefined;
  const industryLevel1Id = params.industryLevel1Id ? parseInt(params.industryLevel1Id) : undefined;
  const page = parseInt(params.page || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  const [companies, totalCount] = await Promise.all([
    getCompanies({
      keyword,
      provinceId,
      cityId,
      industryLevel1Id,
      limit,
      offset,
    }),
    countCompanies({
      keyword,
      provinceId,
      cityId,
      industryLevel1Id,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderClient />
      </Suspense>
      <main className="flex-1">
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">企业招聘</h1>
              <p className="text-muted-foreground">发现优质企业，寻找理想职位</p>
            </div>

            {/* 搜索和筛选表单 */}
            <div className="mb-8">
              <CompanySearchForm
                initialKeyword={keyword}
                initialProvinceId={provinceId}
                initialCityId={cityId}
                initialIndustryLevel1Id={industryLevel1Id}
              />
            </div>

            {/* 结果统计 */}
            <div className="mb-6 text-sm text-muted-foreground">
              共找到 <span className="font-semibold text-foreground">{totalCount}</span> 家企业
            </div>

            {/* 企业列表 */}
            {companies.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">暂无企业</p>
                  <p className="text-sm text-muted-foreground">请尝试调整搜索条件</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {companies.map((company) => (
                    <Link key={company.id} href={`/companies/${company.id}`}>
                      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            {company.logo ? (
                              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={company.logo}
                                  alt={company.companyName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                <Building2 className="h-8 w-8" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                {company.companyName}
                              </h3>
                              {company.verificationStatus === "verified" && (
                                <Badge variant="default" className="text-xs">
                                  已认证
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {company.city && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {company.province?.name} {company.city.name}
                                </span>
                              </div>
                            )}
                            {company.companySize && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span>{company.companySize}</span>
                              </div>
                            )}
                            {company.industryLevel1 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {company.industryLevel1.name}
                                  {company.industryLevel2 && ` / ${company.industryLevel2.name}`}
                                </span>
                              </div>
                            )}
                          </div>

                          {company.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {company.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <Badge variant="secondary">
                              {company.industryLevel1?.name || "未知行业"}
                            </Badge>
                            <span className="text-sm text-primary font-medium">
                              {company.jobCount || 0} 个职位
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={`/companies?${new URLSearchParams({
                          ...(keyword && { keyword }),
                          ...(provinceId && { provinceId: provinceId.toString() }),
                          ...(cityId && { cityId: cityId.toString() }),
                          ...(industryLevel1Id && { industryLevel1Id: industryLevel1Id.toString() }),
                          page: (page - 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent"
                      >
                        上一页
                      </Link>
                    )}
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      第 {page} 页，共 {totalPages} 页
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`/companies?${new URLSearchParams({
                          ...(keyword && { keyword }),
                          ...(provinceId && { provinceId: provinceId.toString() }),
                          ...(cityId && { cityId: cityId.toString() }),
                          ...(industryLevel1Id && { industryLevel1Id: industryLevel1Id.toString() }),
                          page: (page + 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent"
                      >
                        下一页
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
