import { MessageSquareText } from "lucide-react";

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
import { readAdminServiceRequests } from "@/server/repositories/commerce-repository";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "Support Tickets | UAG E-commerce",
};

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const tickets = await readAdminServiceRequests(query);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Customers
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Support Tickets
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Track customer questions, return follow-ups, and delivery support in one queue.
        </p>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Ticket Queue</CardTitle>
          <CardDescription>
            {query
              ? `${tickets.length} result${tickets.length === 1 ? "" : "s"} for "${query}".`
              : "Service requests and follow-ups from customers."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[110px] px-4">Request</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead className="min-w-[260px]">Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[120px]">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-zinc-500">
                    No support tickets match this search.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="px-4 font-semibold">{ticket.requestNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {ticket.customerName ?? ticket.customerId ?? "-"}
                      </div>
                      <div className="text-xs text-zinc-500">{ticket.customerEmail ?? ""}</div>
                    </TableCell>
                    <TableCell>{ticket.productName ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.requestType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(ticket.status)}>{ticket.status.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.updatedAt).toLocaleString("en-IN")}</TableCell>
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

function statusClass(status: string) {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (status === "rejected" || status === "cancelled") {
    return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
}
