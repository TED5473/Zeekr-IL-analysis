"use client";

import {
  getPeriodDescriptor,
  getSalesPeriodLabel,
  reportBrandDeliveries2025,
  reportModelDeliveries2025,
  scaleAnnualDeliveries,
  type SalesPeriod,
} from "@/lib/data";

interface ReportTablesProps {
  period: SalesPeriod;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function ReportTables({ period }: ReportTablesProps) {
  const periodLabel = getSalesPeriodLabel(period);
  const sortedBrands = [...reportBrandDeliveries2025].sort(
    (a, b) => b.deliveries_2025 - a.deliveries_2025,
  );

  const sortedModels = [...reportModelDeliveries2025].sort(
    (a, b) => b.deliveries_2025 - a.deliveries_2025,
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e5e5ea] bg-[#fbfbfd] p-3 text-xs text-[#6e6e73]">
        Report view period: <span className="font-semibold text-[#111111]">{getPeriodDescriptor(period)}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#ececf1] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#111111]">All brands - 2025 Cartube table</h3>
            <p className="text-xs text-[#6e6e73]">83 brands from the source report.</p>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="min-w-full divide-y divide-[#ececf1] text-sm">
              <thead className="sticky top-0 bg-[#f5f5f7]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Brand</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                    {periodLabel}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                    2025 Year
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ececf1]">
                {sortedBrands.map((row) => (
                  <tr key={row.brand} className="hover:bg-[#f5f5f7]">
                    <td className="px-3 py-2 text-[#111111]">{row.brand}</td>
                    <td className="px-3 py-2 text-right text-[#3a3a3c]">
                      {formatNumber(scaleAnnualDeliveries(row.deliveries_2025, period))}
                    </td>
                    <td className="px-3 py-2 text-right text-[#3a3a3c]">
                      {formatNumber(row.deliveries_2025)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
          <div className="border-b border-[#ececf1] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#111111]">All models in article tables</h3>
            <p className="text-xs text-[#6e6e73]">Top 20 overall + top 20 EV model tables.</p>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="min-w-full divide-y divide-[#ececf1] text-sm">
              <thead className="sticky top-0 bg-[#f5f5f7]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Model</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Brand</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[#6e6e73]">Source</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                    {periodLabel}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-[#6e6e73]">
                    2025 Year
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ececf1]">
                {sortedModels.map((row) => (
                  <tr
                    key={`${row.source_table}-${row.brand}-${row.model}`}
                    className="hover:bg-[#f5f5f7]"
                  >
                    <td className="px-3 py-2 text-[#111111]">{row.model}</td>
                    <td className="px-3 py-2 text-[#3a3a3c]">{row.brand}</td>
                    <td className="px-3 py-2 text-[#6e6e73]">{row.source_table}</td>
                    <td className="px-3 py-2 text-right text-[#3a3a3c]">
                      {formatNumber(scaleAnnualDeliveries(row.deliveries_2025, period))}
                    </td>
                    <td className="px-3 py-2 text-right text-[#3a3a3c]">
                      {formatNumber(row.deliveries_2025)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
