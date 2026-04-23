"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, GitBranch, RefreshCcw, Table2 } from "lucide-react";

import { BubbleChart } from "@/components/dashboard/plotly-chart";
import { DataTable } from "@/components/dashboard/data-table";
import { FiltersSidebar } from "@/components/dashboard/filters-sidebar";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ModelDetailModal } from "@/components/dashboard/model-detail-modal";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATA_PERIOD_LABEL,
  DATA_UPDATED_AT,
  bubbleModels,
  type CarModel,
} from "@/lib/data";

function toCsv(models: CarModel[]) {
  const headers = [
    "brand",
    "model",
    "fullName",
    "length_mm",
    "base_price_ils",
    "sales_volume",
    "body_type",
    "powertrain",
    "cartube_catalog_url",
    "cartube_sales_url",
  ];

  const rows = models.map((model) =>
    [
      model.brand,
      model.model,
      model.fullName,
      model.length_mm,
      model.base_price_ils,
      model.sales_volume,
      model.body_type ?? "",
      model.powertrain ?? "",
      model.cartube_catalog_url,
      model.cartube_sales_url,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function withinRange(value: number, [min, max]: [number, number]) {
  return value >= min && value <= max;
}

export function Dashboard() {
  const allBrands = useMemo(
    () => Array.from(new Set(bubbleModels.map((model) => model.brand))).sort(),
    [],
  );
  const allBodyTypes = useMemo(
    () =>
      Array.from(
        new Set(bubbleModels.map((model) => model.body_type).filter(Boolean) as string[]),
      ).sort(),
    [],
  );
  const allPowertrains = useMemo(
    () =>
      Array.from(
        new Set(bubbleModels.map((model) => model.powertrain).filter(Boolean) as string[]),
      ).sort(),
    [],
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>(allBrands);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(allBodyTypes);
  const [selectedPowertrains, setSelectedPowertrains] = useState<string[]>(allPowertrains);
  const [priceRange, setPriceRange] = useState<[number, number]>([130000, 300000]);
  const [salesRange, setSalesRange] = useState<[number, number]>([3000, 16000]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showLabels, setShowLabels] = useState(true);
  const [bubbleScale, setBubbleScale] = useState("1");
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [chartRevision, setChartRevision] = useState(0);

  const selectedBrandSet = useMemo(() => new Set(selectedBrands), [selectedBrands]);

  const filteredModels = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bubbleModels.filter((model) => {
      const inBrand = selectedBrands.includes(model.brand);
      const inBodyType =
        selectedBodyTypes.length === 0 ||
        (model.body_type ? selectedBodyTypes.includes(model.body_type) : false);
      const inPowertrain =
        selectedPowertrains.length === 0 ||
        (model.powertrain ? selectedPowertrains.includes(model.powertrain) : false);
      const inPrice = withinRange(model.base_price_ils, priceRange);
      const inSales = withinRange(model.sales_volume, salesRange);

      const inSearch =
        normalizedSearch.length === 0 ||
        `${model.brand} ${model.model}`.toLowerCase().includes(normalizedSearch);

      return inBrand && inBodyType && inPowertrain && inPrice && inSales && inSearch;
    });
  }, [
    priceRange,
    salesRange,
    searchTerm,
    selectedBodyTypes,
    selectedBrands,
    selectedPowertrains,
  ]);

  const handleToggle = (
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    setSelected((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== value);
      }

      return [...prev, value].sort();
    });
  };

  const resetFilters = () => {
    setSelectedBrands(allBrands);
    setSelectedBodyTypes(allBodyTypes);
    setSelectedPowertrains(allPowertrains);
    setPriceRange([130000, 300000]);
    setSalesRange([3000, 16000]);
    setSearchTerm("");
  };

  const exportCsv = () => {
    downloadCsv("israel-car-bubble-analyzer.csv", toCsv(filteredModels));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-blue-600/90 p-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold md:text-base">Cartube Bubble Analyzer</p>
              <p className="text-xs text-zinc-400">
                Data from cartube.co.il - Updated {formatDate(DATA_UPDATED_AT)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden md:inline-flex">
              {DATA_PERIOD_LABEL}
            </Badge>
            <Button asChild variant="ghost" size="sm">
              <a
                href="https://github.com/TED5473/Zeekr-IL-analysis"
                target="_blank"
                rel="noreferrer"
              >
                <GitBranch className="h-4 w-4" /> GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 p-4 md:p-6 xl:grid-cols-[310px_1fr_320px]">
        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <FiltersSidebar
            allBrands={allBrands}
            selectedBrands={selectedBrands}
            onToggleBrand={(brand) => handleToggle(selectedBrands, setSelectedBrands, brand)}
            allBodyTypes={allBodyTypes}
            selectedBodyTypes={selectedBodyTypes}
            onToggleBodyType={(bodyType) =>
              handleToggle(selectedBodyTypes, setSelectedBodyTypes, bodyType)
            }
            allPowertrains={allPowertrains}
            selectedPowertrains={selectedPowertrains}
            onTogglePowertrain={(powertrain) =>
              handleToggle(selectedPowertrains, setSelectedPowertrains, powertrain)
            }
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            salesRange={salesRange}
            onSalesRangeChange={setSalesRange}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onResetFilters={resetFilters}
          />
        </aside>

        <main className="space-y-4">
          <SummaryCards models={filteredModels} />

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button
                variant={showLabels ? "default" : "secondary"}
                size="sm"
                onClick={() => setShowLabels((prev) => !prev)}
              >
                {showLabels ? "Hide Labels" : "Show Labels"}
              </Button>

              <div className="min-w-[170px]">
                <Select value={bubbleScale} onValueChange={setBubbleScale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bubble scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">Bubble scale: Compact</SelectItem>
                    <SelectItem value="1">Bubble scale: Normal</SelectItem>
                    <SelectItem value="1.25">Bubble scale: Large</SelectItem>
                    <SelectItem value="1.5">Bubble scale: XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartRevision((rev) => rev + 1)}
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Reset zoom
              </Button>

              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>

              <div className="ml-auto flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-950 p-1">
                <Button
                  variant={viewMode === "chart" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("chart")}
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Chart
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  <Table2 className="h-3.5 w-3.5" /> Table
                </Button>
              </div>
            </div>

            {viewMode === "chart" ? (
              <BubbleChart
                models={filteredModels}
                selectedBrandSet={selectedBrandSet}
                showLabels={showLabels}
                bubbleScale={Number(bubbleScale)}
                onBubbleClick={setSelectedModel}
                revision={chartRevision}
              />
            ) : (
              <DataTable models={filteredModels} onRowClick={setSelectedModel} />
            )}
          </div>
        </main>

        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <InsightsPanel
            models={filteredModels}
            isCollapsed={insightsCollapsed}
            onToggle={() => setInsightsCollapsed((prev) => !prev)}
          />
        </aside>
      </div>

      <ModelDetailModal model={selectedModel} onOpenChange={() => setSelectedModel(null)} />
    </div>
  );
}
