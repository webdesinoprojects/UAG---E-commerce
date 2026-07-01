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
import { mockAdminCustomers } from "@/features/admin/mock-data";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "Support Tickets | UAG E-commerce",
};

const supportTickets = mockAdminCustomers.slice(0, 6).map((customer, index) => ({
  id: `TKT-${String(index + 1).padStart(4, "0")}`,
  customer: customer.name,
  email: customer.email,
  subject: [
    "Delivery status request",
    "Replacement eligibility",
    "Invoice copy needed",
    "Product warranty question",
    "Return pickup follow-up",
    "Order address update",
  ][index],
  priority: index < 2 ? "High" : index < 4 ? "Medium" : "Low",
  status: index % 3 === 0 ? "Open" : index % 3 === 1 ? "In Review" : "Resolved",
  updatedAt: customer.lastLogin,
}));

export default async function AdminSupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const normalizedQuery = query.toLowerCase();
  const tickets = normalizedQuery
    ? supportTickets.filter((ticket) =>
        [
          ticket.id,
          ticket.customer,
          ticket.email,
          ticket.subject,
          ticket.priority,
          ticket.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : supportTickets;

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
              : "Support tickets are ready for the live helpdesk integration."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[110px] px-4">Ticket</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead className="min-w-[260px]">Subject</TableHead>
                <TableHead>Priority</TableHead>
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
                    <TableCell className="px-4 font-semibold">{ticket.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {ticket.customer}
                      </div>
                      <div className="text-xs text-zinc-500">{ticket.email}</div>
                    </TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClass(ticket.status)}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell>{ticket.updatedAt}</TableCell>
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
  if (status === "Resolved") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300";
  }

  if (status === "In Review") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300";
  }

  return "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300";
}
