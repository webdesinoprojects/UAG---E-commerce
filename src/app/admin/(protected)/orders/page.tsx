import { PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAdminOrders } from "@/features/admin/mock-data";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "All Orders | UAG E-commerce",
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalizedQuery = query.toLowerCase();
  const orders = normalizedQuery
    ? mockAdminOrders.filter((order) =>
        [
          order.id,
          order.customer,
          order.email,
          order.productName,
          order.status,
          order.paymentStatus,
          order.bookedAt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : mockAdminOrders;

  const totalItems = mockAdminOrders.reduce((sum, order) => sum + order.quantity, 0);
  const totalRevenue = mockAdminOrders.reduce(
    (sum, order) => sum + order.quantity * order.price,
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            Orders
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            All Orders
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Every booked order appears here with product image, name, quantity,
            and price in a horizontal table.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <Summary label="Booked items" value={totalItems.toString()} />
          <Summary label="Order value" value={currency.format(totalRevenue)} />
        </div>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Booked Orders</CardTitle>
          <CardDescription>
            {query
              ? `${orders.length} result${orders.length === 1 ? "" : "s"} for "${query}".`
              : "Latest customer bookings from the storefront checkout flow."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] px-4">Order</TableHead>
                <TableHead className="min-w-[280px]">Product</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[120px]">Booked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-zinc-500">
                    No orders match this search.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-4 font-semibold">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="h-12 w-12 rounded-md border bg-cover bg-center"
                          style={{ backgroundImage: `url(${order.image})` }}
                        />
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.productName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customer}</span>
                        <span className="text-xs text-zinc-500">{order.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{currency.format(order.price)}</TableCell>
                    <TableCell className="font-semibold">
                      {currency.format(order.quantity * order.price)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.bookedAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function statusClass(status: string) {
  if (status === "Delivered") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (status === "Shipped") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (status === "Processing") {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
  }

  return "bg-zinc-100 text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300";
}
