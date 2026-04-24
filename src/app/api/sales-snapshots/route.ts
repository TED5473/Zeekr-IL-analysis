import { NextResponse } from "next/server";

import { getAllSalesPeriodSnapshots } from "@/lib/cartube-sales";

export async function GET() {
  try {
    const salesByPeriod = await getAllSalesPeriodSnapshots({ forceRefresh: true });
    return NextResponse.json({ salesByPeriod }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to refresh sales snapshots from Cartube",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
