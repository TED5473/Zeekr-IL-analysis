"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface FiltersSidebarProps {
  allBrands: string[];
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  allBodyTypes: string[];
  selectedBodyTypes: string[];
  onToggleBodyType: (bodyType: string) => void;
  allPowertrains: string[];
  selectedPowertrains: string[];
  onTogglePowertrain: (powertrain: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  salesRange: [number, number];
  onSalesRangeChange: (range: [number, number]) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onResetFilters: () => void;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function MultiSelectList({
  title,
  items,
  selectedItems,
  onToggle,
}: {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-[#6e6e73]">{title}</p>
      <div className="max-h-32 space-y-2 overflow-auto pr-1">
        {items.map((item) => {
          const id = `${title}-${item}`;
          return (
            <label
              key={item}
              htmlFor={id}
              className="flex cursor-pointer items-center gap-2 text-sm text-[#1d1d1f]"
            >
              <Checkbox
                id={id}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => onToggle(item)}
              />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function FiltersSidebar({
  allBrands,
  selectedBrands,
  onToggleBrand,
  allBodyTypes,
  selectedBodyTypes,
  onToggleBodyType,
  allPowertrains,
  selectedPowertrains,
  onTogglePowertrain,
  priceRange,
  onPriceRangeChange,
  salesRange,
  onSalesRangeChange,
  searchTerm,
  onSearchTermChange,
  onResetFilters,
}: FiltersSidebarProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            <X className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6e6e73]">Search</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-[#8e8e93]" />
            <Input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search brand or model"
              className="pl-8"
            />
          </div>
        </div>

        <MultiSelectList
          title="Brands"
          items={allBrands}
          selectedItems={selectedBrands}
          onToggle={onToggleBrand}
        />

        <MultiSelectList
          title="Body Type"
          items={allBodyTypes}
          selectedItems={selectedBodyTypes}
          onToggle={onToggleBodyType}
        />

        <MultiSelectList
          title="Powertrain"
          items={allPowertrains}
          selectedItems={selectedPowertrains}
          onToggle={onTogglePowertrain}
        />

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6e6e73]">Price range</p>
          <Slider
            value={priceRange}
            min={130000}
            max={350000}
            step={1000}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          />
          <p className="text-xs text-[#6e6e73]">
            {formatNumber(priceRange[0])} - {formatNumber(priceRange[1])} ILS
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6e6e73]">
            Sales volume range
          </p>
          <Slider
            value={salesRange}
            min={300}
            max={16000}
            step={50}
            onValueChange={(value) => onSalesRangeChange(value as [number, number])}
          />
          <p className="text-xs text-[#6e6e73]">
            {formatNumber(salesRange[0])} - {formatNumber(salesRange[1])}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
