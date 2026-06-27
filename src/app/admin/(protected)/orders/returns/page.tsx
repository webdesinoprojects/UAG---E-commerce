import { RotateCcw } from "lucide-react";

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
import { mockReturnRefundOrders } from "@/features/admin/mock-data";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "Returns & Refunds | UAG E-commerce",
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalizedQuery = query.toLowerCase();
  const orders = normalizedQuery
    ? mockReturnRefundOrders.filter((order) =>
        [
          order.id,
          order.orderId,
          order.customer,
          order.productName,
          order.requestType,
          order.reason,
          order.status,
          order.requestedAt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : mockReturnRefundOrders;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Orders
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Returns & Refunds
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Track returned, refunded, and replacement orders with clear status and
          reason details.
        </p>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Return and Refund Requests</CardTitle>
          <CardDescription>
            {query
              ? `${orders.length} result${orders.length === 1 ? "" : "s"} for "${query}".`
              : "Requests are grouped by order so support can quickly resolve each case."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[110px] px-4">Request</TableHead>
                <TableHead className="min-w-[110px]">Order</TableHead>
                <TableHead className="min-w-[280px]">Product</TableHead>
                <TableHead className="min-w-[160px]">Customer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[220px]">Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[120px]">Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-zinc-500">
                    No return or refund requests match this search.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-4 font-semibold">{order.id}</TableCell>
                    <TableCell>{order.orderId}</TableCell>
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
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{currency.format(order.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.requestType}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal text-zinc-600 dark:text-zinc-300">
                      {order.reason}
                    </TableCell>
                    <TableCell>
                      <Badge className={returnStatusClass(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.requestedAt}</TableCell>
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

function returnStatusClass(status: string) {
  if (status === "Completed" || status === "Replacement Sent") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (status === "Pickup Scheduled") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
  }

  return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
}
