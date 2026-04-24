"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, GitBranch, RefreshCcw, Table2 } from "lucide-react";

import { BubbleChart } from "@/components/dashboard/plotly-chart";
import { DataTable } from "@/components/dashboard/data-table";
import { FiltersSidebar } from "@/components/dashboard/filters-sidebar";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { ModelDetailModal } from "@/components/dashboard/model-detail-modal";
import { ReportTables } from "@/components/dashboard/report-tables";
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
import { toCanonicalBrandName } from "@/lib/brand-alias";
import {
  SALES_PERIOD_OPTIONS,
  getSalesPeriodColumnKey,
  getSalesPeriodLabel,
  type SalesPeriod,
  type SalesPeriodSnapshot,
} from "@/lib/cartube-sales-types";
import { createModelRowsLookup, findModelDeliveriesForCar } from "@/lib/model-alias";
import {
  DATA_PERIOD_LABEL,
  DATA_UPDATED_AT,
  bubbleModels,
  type CarModel,
} from "@/lib/data";

interface DashboardProps {
  salesByPeriod: Record<SalesPeriod, SalesPeriodSnapshot>;
}

interface RefreshState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

function toCsv(models: CarModel[], salesPeriod: SalesPeriod) {
  const salesPeriodKey = getSalesPeriodColumnKey(salesPeriod);
  const headers = [
    "brand",
    "model",
    "fullName",
    "length_mm",
    "base_price_ils",
    `sales_${salesPeriodKey}`,
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

function salesRangeForPeriod(models: CarModel[]): [number, number] {
  if (models.length === 0) return [0, 0];
  const values = models.map((model) => model.sales_volume);
  return [Math.min(...values), Math.max(...values)];
}

export function Dashboard({ salesByPeriod }: DashboardProps) {
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
  const [priceRange, setPriceRange] = useState<[number, number]>([130000, 350000]);
  const [salesRange, setSalesRange] = useState<[number, number]>([0, 16000]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showLabels, setShowLabels] = useState(true);
  const [bubbleScale, setBubbleScale] = useState("1");
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [chartRevision, setChartRevision] = useState(0);
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("y2025");
  const [liveSalesByPeriod, setLiveSalesByPeriod] = useState(salesByPeriod);
  const [refreshState, setRefreshState] = useState<RefreshState>({
    status: "idle",
    message: "",
  });

  const selectedBrandSet = useMemo(() => new Set(selectedBrands), [selectedBrands]);

  const periodSnapshot = liveSalesByPeriod[salesPeriod];

  const modelsForPeriod = useMemo(() => {
    const brandMap = new Map(
      periodSnapshot.brand_rows.map((row) => [toCanonicalBrandName(row.name), row.deliveries]),
    );
    const modelLookup = createModelRowsLookup(periodSnapshot.model_rows);

    return bubbleModels.map((model) => {
      const modelDeliveries = findModelDeliveriesForCar(model, modelLookup);
      const brandDeliveries = brandMap.get(model.brand);

      return {
        ...model,
        sales_volume: modelDeliveries ?? brandDeliveries ?? 0,
        notes:
          modelDeliveries !== null
            ? model.notes
            : `${model.notes ? `${model.notes} ` : ""}Model-level row unavailable for ${getSalesPeriodLabel(
                salesPeriod,
              )}; using brand total from Cartube period table.`,
      };
    });
  }, [periodSnapshot, salesPeriod]);

  const filteredModels = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return modelsForPeriod.filter((model) => {
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
    modelsForPeriod,
    priceRange,
    salesRange,
    searchTerm,
    selectedBodyTypes,
    selectedBrands,
    selectedPowertrains,
  ]);

  const handleToggle = (
    _selected: string[],
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
    setPriceRange([130000, 350000]);
    setSalesRange(salesRangeForPeriod(modelsForPeriod));
    setSearchTerm("");
  };

  const exportCsv = () => {
    downloadCsv("israel-car-bubble-analyzer.csv", toCsv(filteredModels, salesPeriod));
  };

  const onPeriodChange = (period: SalesPeriod) => {
    setSalesPeriod(period);

    const brandMap = new Map(
      liveSalesByPeriod[period].brand_rows.map((row) => [toCanonicalBrandName(row.name), row.deliveries]),
    );
    const modelLookup = createModelRowsLookup(liveSalesByPeriod[period].model_rows);

    const periodModels = bubbleModels.map((model) => ({
      ...model,
      sales_volume:
        findModelDeliveriesForCar(model, modelLookup) ?? brandMap.get(model.brand) ?? 0,
    }));

    setSalesRange(salesRangeForPeriod(periodModels));
  };

  const refreshSnapshots = async () => {
    setRefreshState({ status: "loading", message: "Refreshing live data from Cartube..." });

    try {
      const response = await fetch("/api/sales-snapshots", { method: "GET" });
      if (!response.ok) throw new Error(`Refresh failed with status ${response.status}`);

      const payload = (await response.json()) as {
        salesByPeriod: Record<SalesPeriod, SalesPeriodSnapshot>;
      };

      setLiveSalesByPeriod(payload.salesByPeriod);
      setRefreshState({
        status: "success",
        message: `Refreshed successfully at ${new Date().toLocaleTimeString("en-GB")}`,
      });
    } catch (error) {
      setRefreshState({
        status: "error",
        message: error instanceof Error ? error.message : "Refresh failed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#111111]">
      <header className="sticky top-0 z-20 border-b border-[#e5e5ea] bg-[#fbfbfd]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#0071e3] p-2 text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold md:text-base">Cartube Bubble Analyzer</p>
              <p className="text-xs text-[#6e6e73]">
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

          <div className="rounded-2xl border border-[#e5e5ea] bg-white/95 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
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

              <div className="min-w-[220px]">
                <Select value={salesPeriod} onValueChange={(value) => onPeriodChange(value as SalesPeriod)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sales period" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Badge variant="secondary">{getSalesPeriodLabel(salesPeriod)}</Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setChartRevision((rev) => rev + 1)}
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Reset zoom
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshSnapshots}
                disabled={refreshState.status === "loading"}
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Refresh now
              </Button>

              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>

              <div className="ml-auto flex items-center gap-1 rounded-full border border-[#d2d2d7] bg-[#f5f5f7] p-1">
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

            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-[#e5e5ea] bg-[#fbfbfd] px-3 py-2 text-xs text-[#6e6e73]">
              <span>
                Last synced:{" "}
                <span className="font-semibold text-[#111111]">
                  {new Date(periodSnapshot.scraped_at).toLocaleString("en-GB")}
                </span>
              </span>
              {refreshState.message ? (
                <span
                  className={
                    refreshState.status === "error"
                      ? "text-[#b42318]"
                      : refreshState.status === "success"
                        ? "text-[#087443]"
                        : "text-[#6e6e73]"
                  }
                >
                  {refreshState.message}
                </span>
              ) : null}
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

          <ReportTables period={salesPeriod} snapshot={periodSnapshot} />
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
