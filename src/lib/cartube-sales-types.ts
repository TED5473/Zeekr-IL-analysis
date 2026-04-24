export type SalesPeriod =
  | "y2025"
  | "q1-2025"
  | "jan-2026"
  | "feb-2026"
  | "q1-2026"
  | "y2026-ytd";

export interface SalesPeriodOption {
  value: SalesPeriod;
  label: string;
  description: string;
  source_url: string;
  supports_model_data: boolean;
}

export interface SalesRow {
  name: string;
  key: string;
  deliveries: number;
}

export interface SalesPeriodSnapshot {
  period: SalesPeriod;
  label: string;
  description: string;
  source_url: string;
  supports_model_data: boolean;
  brand_rows: SalesRow[];
  model_rows: SalesRow[];
  scraped_at: string;
}

export const SALES_PERIOD_OPTIONS: SalesPeriodOption[] = [
  {
    value: "y2025",
    label: "2025 Year",
    description: "Full-year totals from Cartube 2025 summary report",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/שיא-מסירות-של-כל-הזמנים-מסירות-רכב-חדש-בישראל-סיכום-2025",
    supports_model_data: true,
  },
  {
    value: "q1-2025",
    label: "Q1 2025",
    description: "Quarter totals from Cartube Q1 2025 report",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/מסכמים-רבעון-מסירות-רכב-חדש-בישראל-מרץ-2025",
    supports_model_data: true,
  },
  {
    value: "jan-2026",
    label: "Jan 2026",
    description: "Monthly report with brand totals (no model table published)",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/פתיחה-חלשה-מסירות-רכב-חדש-בישראל-ינואר-2026",
    supports_model_data: false,
  },
  {
    value: "feb-2026",
    label: "Feb 2026",
    description: "Derived monthly brand totals from Jan-Feb cumulative report",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/מסירות-רכב-חדש-בישראל-פברואר-2026",
    supports_model_data: false,
  },
  {
    value: "q1-2026",
    label: "Q1 2026",
    description: "Quarter totals from Cartube March 2026 report",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/כאילו-אין-מלחמה-מסירות-רכב-חדש-בישראל-מרץ-2026",
    supports_model_data: true,
  },
  {
    value: "y2026-ytd",
    label: "2026 Year (YTD Q1)",
    description: "Year-to-date totals through Q1 2026 from Cartube",
    source_url:
      "https://www.cartube.co.il/חדשות-רכב/כאילו-אין-מלחמה-מסירות-רכב-חדש-בישראל-מרץ-2026",
    supports_model_data: true,
  },
];

export function getSalesPeriodOption(period: SalesPeriod) {
  return SALES_PERIOD_OPTIONS.find((option) => option.value === period) ?? SALES_PERIOD_OPTIONS[0];
}

export function getSalesPeriodLabel(period: SalesPeriod) {
  return getSalesPeriodOption(period).label;
}

export function getSalesPeriodColumnKey(period: SalesPeriod) {
  return getSalesPeriodLabel(period)
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_")
    .replaceAll("(", "")
    .replaceAll(")", "");
}

export function getPeriodDescriptor(period: SalesPeriod) {
  const option = getSalesPeriodOption(period);
  return `${option.label}: ${option.description}`;
}
