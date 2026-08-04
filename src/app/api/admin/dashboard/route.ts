import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/server/auth/admin";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { readAdminProductList } from "@/server/repositories/catalog-repository";

type OrderRow = { id: string; order_number: string | null; customer_name: string; status: string; total_cents: number; created_at: string };
type ItemRow = { product_id: string | null; product_name: string; quantity: number; line_total_cents: number };

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = createSupabaseServiceRoleClient();
  if (!client) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const [{ data: orders }, { data: items }, productRows, { count: profileCount }] = await Promise.all([
    client.from("commerce_orders").select("id,order_number,customer_name,status,total_cents,created_at").order("created_at", { ascending: false }).limit(500),
    client.from("commerce_order_items").select("product_id,product_name,quantity,line_total_cents").limit(2000),
    readAdminProductList(),
    client.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const orderRows = (orders ?? []) as unknown as OrderRow[];
  const itemRows = (items ?? []) as unknown as ItemRow[];
  const months = new Map<string, { name: string; revenue: number; orders: number }>();
  for (const order of orderRows) { const date = new Date(order.created_at); const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`; const entry = months.get(key) ?? { name: date.toLocaleString("en", { month: "short" }), revenue: 0, orders: 0 }; entry.revenue += Number(order.total_cents ?? 0) / 100; entry.orders += 1; months.set(key, entry); }
  const sales = new Map<string, { id: string; name: string; sales: number }>();
  for (const item of itemRows) { const id = item.product_id ?? item.product_name; const entry = sales.get(id) ?? { id, name: item.product_name, sales: 0 }; entry.sales += Number(item.quantity ?? 0); sales.set(id, entry); }
  const productMap = new Map(productRows.map((product) => [product.id, product]));
  const totalRevenue = orderRows.reduce((sum, order) => sum + Number(order.total_cents ?? 0), 0) / 100;
  return NextResponse.json({ overview: { totalRevenue, activeUsers: profileCount ?? 0, totalOrders: orderRows.length, products: productRows.length }, revenueChart: [...months.values()].slice(-12), recentOrders: orderRows.slice(0, 5).map((order) => ({ id: order.order_number ?? order.id, customer: order.customer_name, status: order.status, amount: Number(order.total_cents ?? 0) / 100 })), topProducts: [...sales.values()].sort((a, b) => b.sales - a.sales).slice(0, 4).map((sale) => { const product = productMap.get(sale.id); return { ...sale, category: product?.categoryName ?? "Uncategorized", price: Number(product?.priceCents ?? 0) / 100, image: product?.primaryImageUrl ?? "/images/products/drone.png" }; }), generatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
