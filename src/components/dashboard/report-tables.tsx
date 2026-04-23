"use client";

import {
  getPeriodDescriptor,
  getSalesPeriodLabel,
  type SalesPeriod,
  type SalesPeriodSnapshot,
} from "@/lib/cartube-sales-types";

interface ReportTablesProps {
  period: SalesPeriod;
  snapshot: SalesPeriodSnapshot;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function ReportTables({ period, snapshot }: ReportTablesProps) {
  const periodLabel = getSalesPeriodLabel(period);
  const sortedBrands = [...snapshot.brand_rows].sort((a, b) => b.deliveries - a.deliveries);
  const sortedModels = [...snapshot.model_rows].sort((a, b) => b.deliveries - a.deliveries);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e5e5ea] bg-[#fbfbfd] p-3 text-xs text-[#6e6e73]">
        Report view period: <span className="font-semibold text-[#111111]">{getPeriodDescriptor(period)}</span>
        <span className="ml-2">| Source: {snapshot.source_url}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#ececf1] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#111111]">Brands from selected period</h3>
            <p className="text-xs text-[#6e6e73]">
              Scraped live from Cartube delivery table for {periodLabel}.
            </p>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="min-w-full divide-y divide-[#ececf1] text-sm">
              <thead className="sticky top-0 bg-[#f5f5f7]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Brand</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                    {periodLabel}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ececf1]">
                {sortedBrands.map((row) => (
                  <tr key={row.key} className="hover:bg-[#f5f5f7]">
                    <td className="px-3 py-2 text-[#111111]">{row.name}</td>
                    <td className="px-3 py-2 text-right text-[#3a3a3c]">
                      {formatNumber(row.deliveries)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#ececf1] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#111111]">Models from selected period</h3>
            <p className="text-xs text-[#6e6e73]">
              {snapshot.supports_model_data
                ? "Scraped directly from Cartube model table for the selected period."
                : "This period article does not publish a model table. Brand totals only."}
            </p>
          </div>
          <div className="max-h-[460px] overflow-auto">
            {snapshot.supports_model_data ? (
              <table className="min-w-full divide-y divide-[#ececf1] text-sm">
                <thead className="sticky top-0 bg-[#f5f5f7]">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Model</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                      {periodLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ececf1]">
                  {sortedModels.map((row) => (
                    <tr key={`${row.key}-${row.deliveries}`} className="hover:bg-[#f5f5f7]">
                      <td className="px-3 py-2 text-[#111111]">{row.name}</td>
                      <td className="px-3 py-2 text-right text-[#3a3a3c]">
                        {formatNumber(row.deliveries)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-sm text-[#6e6e73]">
                Cartube does not provide a model-level table in this period article.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
