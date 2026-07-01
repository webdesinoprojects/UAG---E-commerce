import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { getCurrentAdmin } from "@/server/auth/admin";

type DashboardOrderRow = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  total_cents: number | null;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  currency: string | null;
  created_at: string;
};

type DashboardOrderItemRow = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number | null;
  line_total_cents: number | null;
  order_id: string;
};

type DashboardProductRow = {
  id: string;
  name: string;
  category_id: string | null;
  stock_quantity: number | null;
  price_cents: number | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = createSupabaseServiceRoleClient();
  if (!client) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  // Fetch real data from backend tables
  const [{ data: orders }, { data: orderItems }, { data: products }] =
    await Promise.all([
      client
        .from("commerce_orders")
        .select("id, order_number, customer_name, customer_email, status, payment_status, payment_method, total_cents, subtotal_cents, shipping_cents, currency, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      client
        .from("commerce_order_items")
        .select("product_id, product_name, quantity, unit_price_cents, line_total_cents, order_id")
        .order("created_at", { ascending: false })
        .limit(200),
      client
        .from("catalog_products")
        .select("id, name, category_id, stock_quantity, price_cents")
        .eq("status", "active")
        .limit(50),
    ]);

  const orderRows = (orders ?? []) as DashboardOrderRow[];
  const itemRows = (orderItems ?? []) as DashboardOrderItemRow[];
  const productRows = (products ?? []) as DashboardProductRow[];

  // Overview calculations
  const totalRevenueCents = orderRows.reduce((s, o) => s + (o.total_cents ?? 0), 0);
  const totalOrders = orderRows.length;
  const totalUsers = new Set(orderRows.map((o) => o.customer_email)).size;

  // Revenue by month
  const monthlyMap = new Map<string, number>();
  orderRows.forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (o.total_cents ?? 0));
  });
  const revenueByMonth = [...monthlyMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, revenue]) => ({ month, revenue }));

  // Top products from order items
  const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  itemRows.forEach((item) => {
    const pid = item.product_id ?? "unknown";
    const existing = productSalesMap.get(pid) ?? { name: item.product_name, qty: 0, revenue: 0 };
    existing.qty += item.quantity;
    existing.revenue += item.line_total_cents ?? 0;
    productSalesMap.set(pid, existing);
  });
  const topProducts = [...productSalesMap.entries()]
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data }));

  // Status breakdown
  const statusMap = new Map<string, number>();
  orderRows.forEach((o) => {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  });
  const statusBreakdown = [...statusMap.entries()].map(([status, count]) => ({ status, count }));

  // Build a professional Excel-compatible HTML file
  const currency = (cents: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(cents / 100);

  const formatDate = (iso: string) => new Date(iso).toLocaleString("en-IN");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UAG E-Commerce Dashboard Report</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px; color: #1f2937; }
  h1 { font-size: 22px; color: #111827; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #374151; margin-top: 28px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 13px; }
  th { background: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; white-space: nowrap; }
  td { padding: 7px 12px; border: 1px solid #e5e7eb; color: #4b5563; }
  tr:nth-child(even) td { background: #f9fafb; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .kpi-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; background: #ffffff; }
  .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; font-weight: 600; }
  .kpi-value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 6px; }
  .kpi-growth { font-size: 11px; margin-top: 4px; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; }
</style>
</head>
<body>
  <h1>UAG E-Commerce Dashboard Report</h1>
  <div class="subtitle">Generated on ${new Date().toLocaleString("en-IN")}</div>

  <h2>Overview</h2>
  <div class="kpi-grid">
    <div class="kpi-box">
      <div class="kpi-label">Total Revenue</div>
      <div class="kpi-value">${currency(totalRevenueCents)}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Total Orders</div>
      <div class="kpi-value">${totalOrders}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Total Users</div>
      <div class="kpi-value">${totalUsers}</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Products</div>
      <div class="kpi-value">${productRows.length}</div>
    </div>
  </div>

  <h2>Revenue by Month</h2>
  <table>
    <thead>
      <tr><th>Month</th><th class="text-right">Revenue</th></tr>
    </thead>
    <tbody>
      ${revenueByMonth.map((r) => `<tr><td>${r.month}</td><td class="text-right">${currency(r.revenue)}</td></tr>`).join("")}
      ${revenueByMonth.length === 0 ? '<tr><td colspan="2" class="text-center">No data</td></tr>' : ""}
    </tbody>
  </table>

  <h2>Order Status Breakdown</h2>
  <table>
    <thead>
      <tr><th>Status</th><th class="text-right">Count</th></tr>
    </thead>
    <tbody>
      ${statusBreakdown.map((r) => `<tr><td>${r.status}</td><td class="text-right">${r.count}</td></tr>`).join("")}
      ${statusBreakdown.length === 0 ? '<tr><td colspan="2" class="text-center">No data</td></tr>' : ""}
    </tbody>
  </table>

  <h2>Top Selling Products</h2>
  <table>
    <thead>
      <tr><th>#</th><th>Product</th><th class="text-right">Sold Qty</th><th class="text-right">Revenue</th></tr>
    </thead>
    <tbody>
      ${topProducts.map((p, i) => `<tr><td class="text-center">${i + 1}</td><td>${p.name}</td><td class="text-right">${p.qty}</td><td class="text-right">${currency(p.revenue)}</td></tr>`).join("")}
      ${topProducts.length === 0 ? '<tr><td colspan="4" class="text-center">No data</td></tr>' : ""}
    </tbody>
  </table>

  <h2>Recent Orders</h2>
  <table>
    <thead>
      <tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Payment</th><th class="text-right">Amount</th><th>Date</th></tr>
    </thead>
    <tbody>
      ${orderRows.slice(0, 50).map((o) => `<tr>
        <td>${o.order_number ?? o.id}</td>
        <td>${o.customer_name ?? "Customer"}<br/><span style="font-size:11px;color:#6b7280">${o.customer_email ?? ""}</span></td>
        <td>${o.status}</td>
        <td>${o.payment_method ?? o.payment_status ?? "N/A"}</td>
        <td class="text-right">${currency(o.total_cents ?? 0)}</td>
        <td>${formatDate(o.created_at)}</td>
      </tr>`).join("")}
      ${orderRows.length === 0 ? '<tr><td colspan="6" class="text-center">No data</td></tr>' : ""}
    </tbody>
  </table>

  <div class="footer">Report generated from UAG E-Commerce backend &mdash; ${orderRows.length} orders, ${itemRows.length} order items</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="UAG-Dashboard-Report-${new Date().toISOString().slice(0, 10)}.xls"`,
    },
  });
}
