import { BarChart3, Car, Coins, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CarModel } from "@/lib/data";

interface SummaryCardsProps {
  models: CarModel[];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryCards({ models }: SummaryCardsProps) {
  const totalModels = models.length;
  const totalSales = models.reduce((sum, model) => sum + model.sales_volume, 0);
  const avgPrice =
    totalModels > 0
      ? models.reduce((sum, model) => sum + model.base_price_ils, 0) / totalModels
      : 0;
  const avgPricePerMm =
    totalModels > 0
      ? models.reduce((sum, model) => sum + model.base_price_ils / model.length_mm, 0) /
        totalModels
      : 0;

  const cards = [
    {
      title: "Models in view",
      value: formatNumber(totalModels),
      icon: Car,
    },
    {
      title: "Total sales volume",
      value: formatNumber(totalSales),
      icon: TrendingUp,
    },
    {
      title: "Average base price",
      value: `${formatCurrency(avgPrice)} ILS`,
      icon: Coins,
    },
    {
      title: "Average ILS/mm",
      value: avgPricePerMm.toFixed(2),
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-[#6e6e73]">{card.title}</p>
              <p className="mt-1 text-lg font-semibold text-[#111111]">{card.value}</p>
            </div>
            <card.icon className="h-5 w-5 text-[#0071e3]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
