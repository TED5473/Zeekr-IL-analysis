# Israel Car Bubble Analyzer

Production-ready single-page dashboard for Israeli passenger vehicle market analysis, built for car product managers using **Cartube** as the sole data source.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Plotly.js (`react-plotly.js`)
- Radix UI primitives (shadcn-style local components)
- Lucide icons

## Features

- Interactive bubble chart:
  - **X:** vehicle length (mm), fixed 4400-5100 range
  - **Y:** base trim price (ILS)
  - **Bubble size:** sales volume
  - **Color:** brand legend
- Show/hide labels toggle
- Bubble size scaling controls
- Zoom / pan / export PNG (Plotly mode bar)
- Click bubble -> model detail modal + source links
- Full filter system:
  - brand, body type, powertrain
  - price range + sales range sliders
  - text search
- Chart/Table switch with sortable table
- Quick insights panel (collapsible)
- Summary metric cards
- CSV export for currently filtered dataset
- Dark-mode-first responsive dashboard layout

## Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

### Production checks

```bash
npm run lint
npm run build
```

## Data source policy (critical)

All analytical data must come **only** from:

1. Cartube catalog (`מחירון רכב חדש`) pages for:
   - `length_mm`
   - `base_price_ils` (base trim)
2. Cartube deliveries/sales reports (e.g. `מסירות רכב חדש ישראל`) for:
   - `sales_volume`

Passenger vehicles only. Exclude vans, pickups, trucks and commercial vehicles.

## Monthly update workflow (100% accuracy maintenance)

Primary data file: `src/lib/data.ts`

1. Open Cartube new-car catalog:
   - `https://www.cartube.co.il/מחירון-רכב-חדש`
2. For each tracked model:
   - Open model family page and a base-trim spec page
   - Update:
     - `base_price_ils` from base trim price
     - `length_mm` from `אורך (ס"מ)` x 10
   - Ensure `cartube_catalog_url` references the exact page you used
3. Open latest consistent deliveries report:
   - Example current source:
     `https://www.cartube.co.il/חדשות-רכב/שיא-מסירות-של-כל-הזמנים-מסירות-רכב-חדש-בישראל-סיכום-2025`
   - Update `sales_volume` using a consistent period (full year preferred)
   - Update `DATA_PERIOD_LABEL`
4. Validate constraints:
   - 4400 <= `length_mm` <= 5100 for bubble inclusion
   - one bubble per model nameplate (not trims)
   - numeric fields positive
5. Update `DATA_UPDATED_AT`

## Data exportability

The dataset is plain TypeScript and can be exported to JSON easily.

Quick approach: add a temporary script that imports `carModels` from `src/lib/data.ts` and writes JSON.

## Notes

- `bubbleModels` in `src/lib/data.ts` automatically keeps only models within 4400-5100 mm.
- Raw source URLs are stored per model for auditability.
