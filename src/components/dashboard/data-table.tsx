"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { CarModel } from "@/lib/data";
import { cn } from "@/lib/utils";

type SortKey = keyof Pick<
  CarModel,
  "brand" | "model" | "length_mm" | "base_price_ils" | "sales_volume" | "body_type" | "powertrain"
>;

type SortDirection = "asc" | "desc";

interface DataTableProps {
  models: CarModel[];
  onRowClick: (model: CarModel) => void;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function DataTable({ models, onRowClick }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("sales_volume");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedModels = useMemo(() => {
    const result = [...models].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];

      if (typeof left === "number" && typeof right === "number") {
        return sortDirection === "asc" ? left - right : right - left;
      }

      return sortDirection === "asc"
        ? String(left ?? "").localeCompare(String(right ?? ""))
        : String(right ?? "").localeCompare(String(left ?? ""));
    });

    return result;
  }, [models, sortDirection, sortKey]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-400" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-950">
            <tr>
              {[
                ["brand", "Brand"],
                ["model", "Model"],
                ["length_mm", "Length (mm)"],
                ["base_price_ils", "Base Price (ILS)"],
                ["sales_volume", "Sales"],
                ["body_type", "Body Type"],
                ["powertrain", "Powertrain"],
              ].map(([key, label]) => (
                <th
                  key={key}
                  className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-zinc-300"
                >
                  <button
                    type="button"
                    onClick={() => onSort(key as SortKey)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>{label}</span>
                    {getSortIcon(key as SortKey)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedModels.map((model) => (
              <tr
                key={model.fullName}
                className={cn(
                  "cursor-pointer hover:bg-zinc-800/70",
                  model.length_mm < 4400 || model.length_mm > 5100
                    ? "bg-amber-500/5"
                    : "",
                )}
                onClick={() => onRowClick(model)}
              >
                <td className="px-3 py-2 text-zinc-200">{model.brand}</td>
                <td className="px-3 py-2 text-zinc-100">{model.model}</td>
                <td className="px-3 py-2">{formatNumber(model.length_mm)}</td>
                <td className="px-3 py-2">{formatNumber(model.base_price_ils)}</td>
                <td className="px-3 py-2">{formatNumber(model.sales_volume)}</td>
                <td className="px-3 py-2">{model.body_type ?? "-"}</td>
                <td className="px-3 py-2">{model.powertrain ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
