import type { CarModel } from "@/lib/data";
import type { SalesRow } from "@/lib/cartube-sales-types";

function normalizeModelKey(value: string) {
  return value
    .replaceAll("׳", "'")
    .replaceAll("״", '"')
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/["'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const MODEL_ALIASES: Record<string, string[]> = {
  "Jaecoo J7": ["ג'אקו 7", "ג'אקו j7", "גאקו 7"],
  "Toyota Corolla Cross": ["טויוטה קורולה קרוס"],
  "Chery Tiggo 8 Pro": ["צ'רי טיגו 8 פרו", "צ׳רי טיגו 8 פרו"],
  "Chery FX": ["צ'רי fx", "צ׳רי fx"],
  "Toyota RAV4": ["טויוטה ראב 4", "טויוטה ראב4"],
  "Hyundai Elantra": ["יונדאי אלנטרה"],
  "BYD Seal U": ["byd סיל u", "byd סיליאון u"],
  "BYD Atto 3": ["byd אטו 3"],
  "Skoda Octavia": ["סקודה אוקטביה"],
  "Kia Niro": ["קיה נירו"],
  "XPeng G6": ["אקספנג g6", "xpeng g6"],
  "Chery Tiggo 7 Pro": ["צ'רי טיגו 7 פרו", "צ׳רי טיגו 7 פרו"],
  "Mazda CX-5": ["מאזדה cx 5", "מאזדה cx-5"],
  "Kia Sportage": ["קיה ספורטאז", "קיה ספורטאז'"],
  "Hyundai Tucson": ["יונדאי טוסון"],
  "Tesla Model Y": ["טסלה מודל y"],
  "Tesla Model 3": ["טסלה מודל 3"],
  "Zeekr X": ["זיקר x", "zeekr x"],
  "Zeekr 7X": ["זיקר 7x", "zeekr 7x"],
  "Zeekr 001": ["זיקר 001", "zeekr 001"],
  "Lynk & Co 02": ["לינק אנד קו 02", "לינק אנד קו 2", "lynk co 02"],
  "Lynk & Co 01": ["לינק אנד קו 01", "לינק אנד קו 1", "lynk co 01"],
  "Lynk & Co 08": ["לינק אנד קו 08", "לינק אנד קו 8", "lynk co 08"],
  "Volvo EX30": ["וולוו ex30", "volvo ex30"],
};

export function createModelRowsLookup(rows: SalesRow[]) {
  const lookup = new Map<string, number>();

  rows.forEach((row) => {
    lookup.set(normalizeModelKey(row.name), row.deliveries);
  });

  return lookup;
}

export function findModelDeliveriesForCar(
  model: CarModel,
  lookup: Map<string, number>,
): number | null {
  const aliases = [
    model.fullName,
    model.model,
    ...(MODEL_ALIASES[model.fullName] ?? []),
  ];

  for (const alias of aliases) {
    const key = normalizeModelKey(alias);
    const deliveries = lookup.get(key);
    if (typeof deliveries === "number") return deliveries;
  }

  return null;
}
