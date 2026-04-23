"use client";

import { ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CarModel } from "@/lib/data";

interface ModelDetailModalProps {
  model: CarModel | null;
  onOpenChange: (open: boolean) => void;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function ModelDetailModal({
  model,
  onOpenChange,
}: ModelDetailModalProps) {
  return (
    <Dialog open={Boolean(model)} onOpenChange={onOpenChange}>
      <DialogContent>
        {model ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {model.fullName}
                {model.powertrain ? <Badge variant="secondary">{model.powertrain}</Badge> : null}
              </DialogTitle>
              <DialogDescription>
                Cartube-backed model details for product analysis.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Brand</p>
                <p className="mt-1 font-medium">{model.brand}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Model</p>
                <p className="mt-1 font-medium">{model.model}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Length</p>
                <p className="mt-1 font-medium">{formatNumber(model.length_mm)} mm</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Base trim price</p>
                <p className="mt-1 font-medium">{formatNumber(model.base_price_ils)} ILS</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Sales volume</p>
                <p className="mt-1 font-medium">{formatNumber(model.sales_volume)}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs text-zinc-500">Body type</p>
                <p className="mt-1 font-medium">{model.body_type ?? "N/A"}</p>
              </div>
            </div>

            {model.notes ? (
              <p className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
                {model.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" className="bg-zinc-800">
                <a
                  href={model.cartube_catalog_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open catalog source <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={model.cartube_sales_url} target="_blank" rel="noreferrer">
                  Open sales source <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
