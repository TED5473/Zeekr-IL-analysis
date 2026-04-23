"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import type { Layout, Config, Data } from "plotly.js";

import type { CarModel } from "@/lib/data";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const FALLBACK_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#f43f5e",
  "#6366f1",
  "#84cc16",
  "#06b6d4",
  "#fb923c",
];

interface BubbleChartProps {
  models: CarModel[];
  selectedBrandSet: Set<string>;
  showLabels: boolean;
  bubbleScale: number;
  onBubbleClick: (model: CarModel) => void;
  revision: number;
}

export function BubbleChart({
  models,
  selectedBrandSet,
  showLabels,
  bubbleScale,
  onBubbleClick,
  revision,
}: BubbleChartProps) {
  const brandColorMap = useMemo(() => {
    const brands = Array.from(selectedBrandSet);
    const map = new Map<string, string>();

    brands.forEach((brand, index) => {
      map.set(brand, FALLBACK_COLORS[index % FALLBACK_COLORS.length]);
    });

    return map;
  }, [selectedBrandSet]);

  const traces = useMemo<Data[]>(() => {
    return Array.from(selectedBrandSet).map((brand) => {
      const brandModels = models.filter((model) => model.brand === brand);

      const salesValues = brandModels.map((model) => model.sales_volume);
      const maxSales = Math.max(...salesValues, 1);
      const minSales = Math.min(...salesValues, 1);
      const sizeRef = (2 * maxSales) / Math.pow(70 * bubbleScale, 2);
      const sizeMin = Math.max(10, 10 + (minSales / maxSales) * 6);

      return {
        type: "scatter",
        mode: showLabels ? "text+markers" : "markers",
        name: brand,
        x: brandModels.map((model) => model.length_mm),
        y: brandModels.map((model) => model.base_price_ils),
        text: brandModels.map((model) => model.fullName),
        textposition: "top center",
        textfont: {
          color: "#f5f5f5",
          size: 11,
        },
        marker: {
          sizemode: "area",
          sizeref: sizeRef,
          sizemin: sizeMin,
          size: brandModels.map((model) => model.sales_volume),
          color: brandColorMap.get(brand),
          opacity: 0.82,
          line: {
            width: 1,
            color: "rgba(255,255,255,0.4)",
          },
        },
        hovertext: brandModels.map(
          (model) =>
            `<b>${model.fullName}</b><br>` +
            `Length: ${model.length_mm.toLocaleString("en-US")} mm<br>` +
            `Base price: ${model.base_price_ils.toLocaleString("en-US")} ILS<br>` +
            `Sales volume: ${model.sales_volume.toLocaleString("en-US")}<br>` +
            `Body type: ${model.body_type ?? "N/A"}<br>` +
            `Powertrain: ${model.powertrain ?? "N/A"}`,
        ),
        customdata: brandModels.map((model) => model.fullName),
        hovertemplate:
          "%{hovertext}<extra></extra>",
      } satisfies Data;
    });
  }, [brandColorMap, models, selectedBrandSet, showLabels, bubbleScale]);

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "#111827",
    plot_bgcolor: "#111827",
    font: {
      color: "#e5e7eb",
      family: "var(--font-geist-sans)",
    },
    xaxis: {
      title: { text: "Vehicle Length (mm)" },
      range: [4400, 5100],
      gridcolor: "rgba(255,255,255,0.08)",
      zerolinecolor: "rgba(255,255,255,0.12)",
    },
    yaxis: {
      title: { text: "Base Trim Price (ILS)" },
      tickformat: ",",
      gridcolor: "rgba(255,255,255,0.08)",
      zerolinecolor: "rgba(255,255,255,0.12)",
    },
    hoverlabel: {
      bgcolor: "#1f2937",
      bordercolor: "#4b5563",
      font: { color: "#f9fafb" },
    },
    legend: {
      title: { text: "Brands" },
      orientation: "h",
      yanchor: "bottom",
      y: 1.02,
      xanchor: "right",
      x: 1,
    },
    margin: {
      l: 56,
      r: 24,
      t: 56,
      b: 56,
    },
    transition: {
      duration: 250,
      easing: "cubic-in-out",
    },
  };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["select2d", "lasso2d"],
    toImageButtonOptions: {
      format: "png",
      filename: "israel-car-bubble-analyzer",
      height: 900,
      width: 1600,
      scale: 2,
    },
    scrollZoom: true,
  };

  const handleClick: PlotParams["onClick"] = (event) => {
    const point = event.points?.[0];
    if (!point || !point.customdata) return;
    const fullName = String(point.customdata);
    const selected = models.find((model) => model.fullName === fullName);
    if (!selected) return;
    onBubbleClick(selected);
  };

  return (
    <div className="h-[70vh] min-h-[500px] w-full">
      <Plot
        revision={revision}
        data={traces}
        layout={layout}
        config={config}
        style={{ width: "100%", height: "100%" }}
        onClick={handleClick}
      />
    </div>
  );
}
