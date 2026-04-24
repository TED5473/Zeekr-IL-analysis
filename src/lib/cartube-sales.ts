import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import {
  SALES_PERIOD_OPTIONS,
  getSalesPeriodOption,
  type SalesPeriod,
  type SalesPeriodSnapshot,
  type SalesRow,
} from "@/lib/cartube-sales-types";

const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9,he;q=0.8",
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeNumber(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly.length ? Number(digitsOnly) : 0;
}

function normalizeKey(value: string) {
  return cleanText(value)
    .replaceAll("_", " ")
    .replaceAll("׳", "'")
    .replaceAll("״", '"')
    .replaceAll("־", "-")
    .toLowerCase();
}

function parseRowsFromTable(
  $: cheerio.CheerioAPI,
  table: cheerio.Cheerio<AnyNode>,
  nameCellIndex: number,
  valueCellIndex: number,
): SalesRow[] {
  const rows: SalesRow[] = [];

  table
    .find("tr")
    .slice(1)
    .each((_, row) => {
      const cells = $(row)
        .find("td")
        .map((__, cell) => cleanText($(cell).text()))
        .get();

      if (cells.length <= Math.max(nameCellIndex, valueCellIndex)) return;

      const name = cleanText(cells[nameCellIndex]);
      if (!name || name.includes("סה")) return;

      rows.push({
        name,
        key: normalizeKey(name),
        deliveries: normalizeNumber(cells[valueCellIndex]),
      });
    });

  return rows;
}

function parseSplitModelTable(
  $: cheerio.CheerioAPI,
  table: cheerio.Cheerio<AnyNode>,
): SalesRow[] {
  const rows: SalesRow[] = [];

  table
    .find("tr")
    .slice(1)
    .each((_, row) => {
      const cells = $(row)
        .find("td")
        .map((__, cell) => cleanText($(cell).text()))
        .get();

      if (cells.length < 6) return;

      const leftModel = cleanText(cells[1]);
      const leftValue = normalizeNumber(cells[2]);
      const rightModel = cleanText(cells[4]);
      const rightValue = normalizeNumber(cells[5]);

      if (leftModel) {
        rows.push({ name: leftModel, key: normalizeKey(leftModel), deliveries: leftValue });
      }

      if (rightModel) {
        rows.push({ name: rightModel, key: normalizeKey(rightModel), deliveries: rightValue });
      }
    });

  return rows;
}

function toMap(rows: SalesRow[]) {
  return new Map(rows.map((row) => [row.key, row]));
}

function subtractRows(baseRows: SalesRow[], subtractRowsSet: SalesRow[]): SalesRow[] {
  const subtractMap = toMap(subtractRowsSet);

  return baseRows
    .map((row) => {
      const subtract = subtractMap.get(row.key)?.deliveries ?? 0;
      return {
        ...row,
        deliveries: Math.max(0, row.deliveries - subtract),
      };
    })
    .filter((row) => row.deliveries >= 0)
    .sort((a, b) => b.deliveries - a.deliveries);
}

async function loadHtml(url: string) {
  const response = await fetch(url, { headers: REQUEST_HEADERS, cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Cartube fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
}

async function scrape2025Year(): Promise<SalesPeriodSnapshot> {
  const option = getSalesPeriodOption("y2025");
  const html = await loadHtml(option.source_url);
  const $ = cheerio.load(html);

  const brandRows = parseRowsFromTable($, $("table").eq(3), 1, 2);
  const modelRows = [
    ...parseSplitModelTable($, $("table").eq(0)),
    ...parseSplitModelTable($, $("table").eq(2)),
  ];

  return {
    period: "y2025",
    label: option.label,
    description: option.description,
    source_url: option.source_url,
    supports_model_data: option.supports_model_data,
    brand_rows: brandRows,
    model_rows: modelRows,
    scraped_at: new Date().toISOString(),
  };
}

async function scrapeQ12025(): Promise<SalesPeriodSnapshot> {
  const option = getSalesPeriodOption("q1-2025");
  const html = await loadHtml(option.source_url);
  const $ = cheerio.load(html);

  return {
    period: "q1-2025",
    label: option.label,
    description: option.description,
    source_url: option.source_url,
    supports_model_data: option.supports_model_data,
    brand_rows: parseRowsFromTable($, $("table").eq(2), 1, 2),
    model_rows: parseRowsFromTable($, $("table").eq(0), 1, 2),
    scraped_at: new Date().toISOString(),
  };
}

async function scrapeJan2026(): Promise<SalesPeriodSnapshot> {
  const option = getSalesPeriodOption("jan-2026");
  const html = await loadHtml(option.source_url);
  const $ = cheerio.load(html);

  return {
    period: "jan-2026",
    label: option.label,
    description: option.description,
    source_url: option.source_url,
    supports_model_data: option.supports_model_data,
    brand_rows: parseRowsFromTable($, $("table").eq(0), 1, 2),
    model_rows: [],
    scraped_at: new Date().toISOString(),
  };
}

async function scrapeJanFeb2026Cumulative() {
  const option = getSalesPeriodOption("feb-2026");
  const html = await loadHtml(option.source_url);
  const $ = cheerio.load(html);

  return {
    option,
    rows: parseRowsFromTable($, $("table").eq(1), 1, 2),
  };
}

async function scrapeQ12026(): Promise<SalesPeriodSnapshot> {
  const option = getSalesPeriodOption("q1-2026");
  const html = await loadHtml(option.source_url);
  const $ = cheerio.load(html);

  return {
    period: "q1-2026",
    label: option.label,
    description: option.description,
    source_url: option.source_url,
    supports_model_data: option.supports_model_data,
    brand_rows: parseRowsFromTable($, $("table").eq(2), 1, 2),
    model_rows: parseRowsFromTable($, $("table").eq(3), 1, 2),
    scraped_at: new Date().toISOString(),
  };
}

async function scrapeY2026Ytd(): Promise<SalesPeriodSnapshot> {
  const q1 = await scrapeQ12026();
  const option = getSalesPeriodOption("y2026-ytd");

  return {
    period: "y2026-ytd",
    label: option.label,
    description: option.description,
    source_url: option.source_url,
    supports_model_data: option.supports_model_data,
    brand_rows: q1.brand_rows,
    model_rows: q1.model_rows,
    scraped_at: q1.scraped_at,
  };
}

async function scrapeFeb2026(): Promise<SalesPeriodSnapshot> {
  const jan = await scrapeJan2026();
  const febCum = await scrapeJanFeb2026Cumulative();

  return {
    period: "feb-2026",
    label: febCum.option.label,
    description: febCum.option.description,
    source_url: febCum.option.source_url,
    supports_model_data: febCum.option.supports_model_data,
    brand_rows: subtractRows(febCum.rows, jan.brand_rows),
    model_rows: [],
    scraped_at: new Date().toISOString(),
  };
}

const loaders: Record<SalesPeriod, () => Promise<SalesPeriodSnapshot>> = {
  "y2025": scrape2025Year,
  "q1-2025": scrapeQ12025,
  "jan-2026": scrapeJan2026,
  "feb-2026": scrapeFeb2026,
  "q1-2026": scrapeQ12026,
  "y2026-ytd": scrapeY2026Ytd,
};

const cache = new Map<SalesPeriod, { expiresAt: number; data: SalesPeriodSnapshot }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

interface SnapshotOptions {
  forceRefresh?: boolean;
}

export async function getSalesPeriodSnapshot(
  period: SalesPeriod,
  options: SnapshotOptions = {},
): Promise<SalesPeriodSnapshot> {
  const { forceRefresh = false } = options;
  const current = cache.get(period);
  if (!forceRefresh && current && current.expiresAt > Date.now()) return current.data;

  const data = await loaders[period]();
  cache.set(period, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return data;
}

export async function getAllSalesPeriodSnapshots(options: SnapshotOptions = {}) {
  const entries = await Promise.all(
    SALES_PERIOD_OPTIONS.map(async (option) => [
      option.value,
      await getSalesPeriodSnapshot(option.value, options),
    ]),
  );

  return Object.fromEntries(entries) as Record<SalesPeriod, SalesPeriodSnapshot>;
}
