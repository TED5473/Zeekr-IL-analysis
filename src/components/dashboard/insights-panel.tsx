import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarModel } from "@/lib/data";

interface InsightsPanelProps {
  models: CarModel[];
  isCollapsed: boolean;
  onToggle: () => void;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function InsightsPanel({ models, isCollapsed, onToggle }: InsightsPanelProps) {
  const topSeller = models.reduce<CarModel | null>((acc, model) => {
    if (!acc) return model;
    return model.sales_volume > acc.sales_volume ? model : acc;
  }, null);

  const bestValue = models.reduce<CarModel | null>((acc, model) => {
    const currentValue = model.base_price_ils / model.sales_volume;
    if (!acc) return model;
    const accValue = acc.base_price_ils / acc.sales_volume;
    return currentValue < accValue ? model : acc;
  }, null);

  const avgPrice =
    models.length > 0
      ? models.reduce((sum, model) => sum + model.base_price_ils, 0) / models.length
      : 0;

  const totalSales = models.reduce((sum, model) => sum + model.sales_volume, 0);

  const avgPricePerMm =
    models.length > 0
      ? models.reduce((sum, model) => sum + model.base_price_ils / model.length_mm, 0) /
        models.length
      : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">Quick Insights</h2>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs text-[#6e6e73] hover:text-[#1d1d1f]"
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {!isCollapsed ? (
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Top seller in view</CardTitle>
              <CardDescription>Highest sales_volume in filtered set.</CardDescription>
            </CardHeader>
            <CardContent>
              {topSeller ? (
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{topSeller.fullName}</p>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    {formatNumber(topSeller.sales_volume)} deliveries
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#8e8e93]">No data in current filter.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highest value index</CardTitle>
              <CardDescription>Lower ILS per sale = stronger value index.</CardDescription>
            </CardHeader>
            <CardContent>
              {bestValue ? (
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{bestValue.fullName}</p>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    {(bestValue.base_price_ils / bestValue.sales_volume).toFixed(2)} ILS per sale unit
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#8e8e93]">No data in current filter.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market snapshot</CardTitle>
              <CardDescription>Aggregated metrics from visible models.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#3a3a3c]">
              <p>
                Average base price: <span className="font-medium">{formatCurrency(avgPrice)} ILS</span>
              </p>
              <p>
                Total sales represented: <span className="font-medium">{formatNumber(totalSales)}</span>
              </p>
              <p>
                Average ILS/mm: <span className="font-medium">{avgPricePerMm.toFixed(2)}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
