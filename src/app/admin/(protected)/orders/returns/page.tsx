import { RotateCcw } from "lucide-react";
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
import { updateAdminServiceRequestStatusAction } from "@/features/commerce/order-actions";
import { requireAdmin } from "@/server/auth/admin";
import {
  readAdminServiceRequests,
  type ServiceRequestDto,
  type ServiceRequestStatus,
} from "@/server/repositories/commerce-repository";

export const metadata = {
  title: "Returns & Replacements | UAG E-commerce",
};

const requestStatuses: ServiceRequestStatus[] = [
  "requested",
  "approved",
  "pickup_scheduled",
  "received",
  "replacement_shipped",
  "refunded",
  "rejected",
  "cancelled",
  "completed",
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function label(value: string) {
  return value.replace(/_/g, " ");
}

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const requests = await readAdminServiceRequests(query);
  const pendingCount = requests.filter((request) =>
    ["requested", "approved", "pickup_scheduled", "received"].includes(
      request.status
    )
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Orders
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Returns & Replacements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Customer service requests from delivered orders, ready for review,
            pickup, refund, or replacement handling.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <Summary label="Open requests" value={pendingCount.toString()} />
          <Summary label="Total requests" value={requests.length.toString()} />
        </div>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Request Queue</CardTitle>
          <CardDescription>
            {query
              ? `${requests.length} result${requests.length === 1 ? "" : "s"} for "${query}".`
              : "Review return and replacement requests created from customer order details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px] px-4">Request</TableHead>
                <TableHead className="min-w-[180px]">Order</TableHead>
                <TableHead className="min-w-[240px]">Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[260px]">Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[300px]">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-zinc-500">
                    No return or replacement requests match this search.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id} className="align-top">
                    <TableCell className="px-4">
                      <div className="font-semibold">{request.requestNumber}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {formatDate(request.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {request.orderNumber ?? request.orderId}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {request.customerName ?? "Customer"}
                      </div>
                      {request.customerEmail ? (
                        <div className="text-xs text-zinc-500">
                          {request.customerEmail}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {request.productName ?? "Order item"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Qty {request.quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{label(request.requestType)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {request.reason}
                      </p>
                      {request.details ? (
                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-500">
                          {request.details}
                        </p>
                      ) : null}
                      {request.adminNote ? (
                        <p className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                          {request.adminNote}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge className={requestStatusClass(request.status)}>
                        {label(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RequestStatusForm request={request} />
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

function RequestStatusForm({ request }: { request: ServiceRequestDto }) {
  return (
    <form action={updateAdminServiceRequestStatusAction} className="grid gap-2">
      <input type="hidden" name="requestId" value={request.id} />
      <select
        name="status"
        defaultValue={request.status}
        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {requestStatuses.map((status) => (
          <option key={status} value={status}>
            {label(status)}
          </option>
        ))}
      </select>
      <input
        name="adminNote"
        defaultValue={request.adminNote ?? ""}
        placeholder="Admin note"
        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      <Button type="submit" size="sm" className="bg-zinc-950">
        Save Request
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

function requestStatusClass(status: ServiceRequestStatus) {
  if (["completed", "refunded", "replacement_shipped"].includes(status)) {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (["pickup_scheduled", "received", "approved"].includes(status)) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
  }

  if (["rejected", "cancelled"].includes(status)) {
    return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
}
