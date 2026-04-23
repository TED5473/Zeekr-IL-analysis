export type BodyType =
  | "Sedan"
  | "Liftback"
  | "Crossover"
  | "SUV"
  | "MPV";

export type Powertrain =
  | "Petrol"
  | "Hybrid"
  | "PHEV"
  | "EV"
  | "Mild Hybrid";

export interface CarModel {
  brand: string;
  model: string;
  fullName: string;
  length_mm: number;
  base_price_ils: number;
  sales_volume: number;
  body_type?: BodyType;
  powertrain?: Powertrain;
  cartube_catalog_url: string;
  cartube_sales_url: string;
  notes?: string;
}

/**
 * Israel Car Bubble Analyzer dataset (passenger vehicles only).
 *
 * DATA QUALITY POLICY
 * -------------------
 * - Source of truth is ONLY https://www.cartube.co.il/.
 * - Length + base price come from Cartube "מחירון רכב חדש" model/spec pages.
 * - Sales volume comes from Cartube delivery reports tagged "מסירות רכב חדש ישראל"
 *   (currently anchored to the 2025 year-end report below).
 * - One row = one model nameplate (not trim-level split).
 * - Keep only passenger models with length in [4400, 5100] mm.
 * - Exclude commercial vehicles, pickups, vans and trucks.
 *
 * MONTHLY / PERIODIC UPDATE PROCEDURE
 * -----------------------------------
 * 1) Open Cartube catalog page: https://www.cartube.co.il/מחירון-רכב-חדש
 * 2) For each tracked model, open the model family page and then a base-trim spec page.
 *    - Update base_price_ils to the model's current base trim price.
 *    - Update length_mm from the "מידות" section ("אורך (ס\"מ)") * 10.
 *    - Keep cartube_catalog_url pointing to the exact spec page used for extraction.
 * 3) Open latest delivery report article (example current source below) and update
 *    sales_volume for each model from a consistent period (full year preferred).
 *    - If a model is missing in top tables, either use another consistent Cartube
 *      table/monthly source or remove the model until consistent data exists.
 * 4) Validate constraints:
 *    - 4400 <= length_mm <= 5100
 *    - base_price_ils > 0
 *    - sales_volume > 0
 *    - fullName = `${brand} ${model}`
 * 5) Set DATA_UPDATED_AT and DATA_PERIOD_LABEL to the newly used period.
 *
 * IMPORTANT
 * ---------
 * The values below are built from Cartube model/spec pages and Cartube's 2025 summary
 * delivery report. Some models are very recent/facelifted, so refresh prices monthly
 * and confirm that the sales period remains methodologically consistent.
 */

export const SALES_SOURCE_URL =
  "https://www.cartube.co.il/חדשות-רכב/שיא-מסירות-של-כל-הזמנים-מסירות-רכב-חדש-בישראל-סיכום-2025";

export const DATA_UPDATED_AT = "2026-04-23";
export const DATA_PERIOD_LABEL = "Cartube full-year deliveries 2025";

export const carModels: CarModel[] = [
  {
    brand: "Jaecoo",
    model: "J7",
    fullName: "Jaecoo J7",
    length_mm: 4500,
    base_price_ils: 169900,
    sales_volume: 15230,
    body_type: "Crossover",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/ג-אקו/ג-אקו-7/6056-ג-אקו-7-executive-2wd",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Toyota",
    model: "Corolla Cross",
    fullName: "Toyota Corolla Cross",
    length_mm: 4460,
    base_price_ils: 179990,
    sales_volume: 9002,
    body_type: "Crossover",
    powertrain: "Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/טויוטה/טויוטה-קורולה-קרוס/6633-טויוטה-קורולה-קרוס-1-8-היברידי-active",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Chery",
    model: "Tiggo 8 Pro",
    fullName: "Chery Tiggo 8 Pro",
    length_mm: 4722,
    base_price_ils: 179990,
    sales_volume: 8187,
    body_type: "SUV",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/צ-רי/צ-רי-טיגו-8-פרו",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Chery",
    model: "FX",
    fullName: "Chery FX",
    length_mm: 4447,
    base_price_ils: 152990,
    sales_volume: 7522,
    body_type: "Crossover",
    powertrain: "Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/צ-רי/צ-רי-fx/6706-צ-רי-fx-היברידי-comfort",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Toyota",
    model: "RAV4",
    fullName: "Toyota RAV4",
    length_mm: 4600,
    base_price_ils: 209990,
    sales_volume: 7178,
    body_type: "SUV",
    powertrain: "Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/טויוטה/טויוטה-ראב4/4367-טויוטה-ראב-4-היברידית-2-5-2x4-e-volve",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Hyundai",
    model: "Elantra",
    fullName: "Hyundai Elantra",
    length_mm: 4675,
    base_price_ils: 169990,
    sales_volume: 6072,
    body_type: "Sedan",
    powertrain: "Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/יונדאי/יונדאי-אלנטרה/4233-יונדאי-אלנטרה-1-6-היברידי-prime",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "BYD",
    model: "Seal U",
    fullName: "BYD Seal U",
    length_mm: 4785,
    base_price_ils: 194990,
    sales_volume: 5691,
    body_type: "SUV",
    powertrain: "EV",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/byd/byd-סיל-u",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "BYD",
    model: "Atto 3",
    fullName: "BYD Atto 3",
    length_mm: 4455,
    base_price_ils: 171500,
    sales_volume: 5496,
    body_type: "Crossover",
    powertrain: "EV",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/byd/BYD-אטו-3/4232-byd-אטו-3-קומפורט",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Skoda",
    model: "Octavia",
    fullName: "Skoda Octavia",
    length_mm: 4698,
    base_price_ils: 159990,
    sales_volume: 5339,
    body_type: "Liftback",
    powertrain: "Mild Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/סקודה/סקודה-אוקטביה/4147-סקודה-אוקטביה-1-5-טורבו-115-כ-ס-selection",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Kia",
    model: "Niro",
    fullName: "Kia Niro",
    length_mm: 4420,
    base_price_ils: 179990,
    sales_volume: 5319,
    body_type: "Crossover",
    powertrain: "Hybrid",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/קיה/קיה-נירו/6765-קיה-נירו-היברידי-ex",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "XPeng",
    model: "G6",
    fullName: "XPeng G6",
    length_mm: 4753,
    base_price_ils: 204990,
    sales_volume: 4844,
    body_type: "SUV",
    powertrain: "EV",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/אקספנג/אקספנג-g6",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Chery",
    model: "Tiggo 7 Pro",
    fullName: "Chery Tiggo 7 Pro",
    length_mm: 4500,
    base_price_ils: 159990,
    sales_volume: 4716,
    body_type: "SUV",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/צ-רי/צ-רי-טיגו-7-פרו",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Mazda",
    model: "CX-5",
    fullName: "Mazda CX-5",
    length_mm: 4575,
    base_price_ils: 189900,
    sales_volume: 4425,
    body_type: "SUV",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/מאזדה/מאזדה-cx-5",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Kia",
    model: "Sportage",
    fullName: "Kia Sportage",
    length_mm: 4540,
    base_price_ils: 184990,
    sales_volume: 4334,
    body_type: "SUV",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/קיה/קיה-ספורטאז",
    cartube_sales_url: SALES_SOURCE_URL,
  },
  {
    brand: "Hyundai",
    model: "Tucson",
    fullName: "Hyundai Tucson",
    length_mm: 4510,
    base_price_ils: 188990,
    sales_volume: 4297,
    body_type: "SUV",
    powertrain: "Petrol",
    cartube_catalog_url:
      "https://www.cartube.co.il/מחירון-רכב-חדש/יונדאי/יונדאי-טוסון/6480-יונדאי-טוסון-1-6-טורבו-premium",
    cartube_sales_url: SALES_SOURCE_URL,
  },
];

export const bubbleModels = carModels.filter(
  (model) => model.length_mm >= 4400 && model.length_mm <= 5100,
);
