import { Dashboard } from "@/components/dashboard/dashboard";
import { getAllSalesPeriodSnapshots } from "@/lib/cartube-sales";

export default async function Home() {
  const salesByPeriod = await getAllSalesPeriodSnapshots();

  return <Dashboard salesByPeriod={salesByPeriod} />;
}
