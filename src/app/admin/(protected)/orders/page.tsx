import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { updateAdminOrderStatusAction } from "@/features/commerce/order-actions";
import { requireAdmin } from "@/server/auth/admin";
import {
  readAdminOrders,
  type OrderDto,
  type OrderStatus,
} from "@/server/repositories/commerce-repository";

export const metadata = {
  title: "All Orders | UAG E-commerce",
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const adminStatuses: Array<
  Extract<OrderStatus, "booked" | "processing" | "shipped" | "delivered" | "cancelled">
> = ["booked", "processing", "shipped", "delivered", "cancelled"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const orders = await readAdminOrders(query);
  const totalItems = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalRevenue = orders.reduce(
    (sum, order) =>
      ["cancelled", "payment_failed"].includes(order.status)
        ? sum
        : sum + order.totalCents,
    0
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
            Live customer bookings with payment, fulfillment, tracking, and
            cancellation controls.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <Summary label="Booked items" value={totalItems.toString()} />
          <Summary label="Order value" value={currency.format(totalRevenue / 100)} />
        </div>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Booked Orders</CardTitle>
          <CardDescription>
            {query
              ? `${orders.length} result${orders.length === 1 ? "" : "s"} for "${query}".`
              : "Latest orders from checkout, COD, and verified online payments."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px] px-4">Order</TableHead>
                <TableHead className="min-w-[300px]">Items</TableHead>
                <TableHead className="min-w-[210px]">Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[320px]">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-zinc-500">
                    No orders match this search.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="align-top">
                    <TableCell className="px-4">
                      <div className="font-semibold">{order.orderNumber}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="outline">{order.paymentMethod}</Badge>
                        <Badge variant="secondary">{order.paymentStatus}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-zinc-100 dark:bg-zinc-800">
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="line-clamp-1 font-medium text-zinc-900 dark:text-zinc-100">
                                {item.productSlug ? (
                                  <Link href={`/products/${item.productSlug}`}>
                                    {item.productName}
                                  </Link>
                                ) : (
                                  item.productName
                                )}
                              </div>
                              <div className="text-xs text-zinc-500">
                                Qty {item.quantity} - {currency.format(item.lineTotalCents / 100)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-zinc-500">{order.customerEmail}</div>
                      <div className="text-xs text-zinc-500">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {currency.format(order.totalCents / 100)}
                      {order.discountCents > 0 ? (
                        <div className="mt-1 text-xs font-medium text-emerald-600">
                          -{currency.format(order.discountCents / 100)} coupon
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(order.status)}>
                        {statusLabel(order.status)}
                      </Badge>
                      {order.trackingNumber ? (
                        <div className="mt-2 text-xs text-zinc-500">
                          Tracking: {order.trackingNumber}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <StatusUpdateForm order={order} />
                    </TableCell>
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

function StatusUpdateForm({ order }: { order: OrderDto }) {
  return (
    <form action={updateAdminOrderStatusAction} className="grid gap-2">
      <input type="hidden" name="orderId" value={order.id} />
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          name="status"
          defaultValue={order.status}
          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {adminStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <input
          name="trackingNumber"
          defaultValue={order.trackingNumber ?? ""}
          placeholder="Tracking number"
          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>
      <input
        name="note"
        placeholder="Status note"
        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      <Button type="submit" size="sm" className="bg-zinc-950">
        Save Status
      </Button>
    </form>
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
  if (status === "delivered") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (status === "shipped") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (status === "processing" || status === "booked") {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
  }

  if (status === "cancelled" || status === "payment_failed") {
    return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-zinc-100 text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300";
}
