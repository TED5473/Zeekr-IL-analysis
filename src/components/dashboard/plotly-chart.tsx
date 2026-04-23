"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import type { Layout, Config, Data } from "plotly.js";

import type { CarModel } from "@/lib/data";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const FALLBACK_COLORS = [
  "#0071e3",
  "#34c759",
  "#ff9500",
  "#ffd60a",
  "#5856d6",
  "#64d2ff",
  "#ff2d55",
  "#30b0c7",
  "#af52de",
  "#5ac8fa",
  "#ff9f0a",
  "#00c7be",
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
          color: "#1d1d1f",
          size: 11,
        },
        marker: {
          sizemode: "area",
          sizeref: sizeRef,
          sizemin: sizeMin,
          size: brandModels.map((model) => model.sales_volume),
          color: brandColorMap.get(brand),
          opacity: 0.86,
          line: {
            width: 1,
            color: "rgba(255,255,255,0.9)",
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
        hovertemplate: "%{hovertext}<extra></extra>",
      } satisfies Data;
    });
  }, [brandColorMap, models, selectedBrandSet, showLabels, bubbleScale]);

  const layout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: {
      color: "#1d1d1f",
      family: "var(--font-geist-sans)",
    },
    xaxis: {
      title: { text: "Vehicle Length (mm)" },
      range: [4400, 5100],
      gridcolor: "rgba(15,23,42,0.08)",
      zerolinecolor: "rgba(15,23,42,0.16)",
    },
    yaxis: {
      title: { text: "Base Trim Price (ILS)" },
      tickformat: ",",
      gridcolor: "rgba(15,23,42,0.08)",
      zerolinecolor: "rgba(15,23,42,0.16)",
    },
    hoverlabel: {
      bgcolor: "#ffffff",
      bordercolor: "#d2d2d7",
      font: { color: "#1d1d1f" },
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
