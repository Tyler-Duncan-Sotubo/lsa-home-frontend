"use client";

import { ProductRail } from "@/features/Products/ui/ProductRail/product-rail";
import type { Product } from "@/features/Products/types/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

type Tab = {
  key: string;
  label: string;
  products: Product[];
};

export function ProductRailTabs({
  title,
  subtitle,
  tabs,
  sectionClassName,
}: {
  title: string;
  subtitle?: string;
  tabs: Tab[];
  sectionClassName?: string;
}) {
  const defaultValue = tabs[0]?.key ?? "tab";

  return (
    <section className={sectionClassName}>
      <Tabs defaultValue={defaultValue} className="w-full">
        {/* Header */}
        <div className="mb-4 space-y-3">
          <div className="text-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle ? <p className="text-sm opacity-70">{subtitle}</p> : null}
          </div>

          {/* Triggers centered */}
          <div className="flex justify-center">
            <TabsList className="h-10">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  className="px-4 text-base md:text-xl"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Content */}
        {tabs.map((t) => (
          <TabsContent key={t.key} value={t.key} className="mt-0">
            <ProductRail
              title=""
              subtitle={undefined}
              products={t.products}
              sectionClassName="w-full mx-auto py-0"
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
