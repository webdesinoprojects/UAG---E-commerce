import { UsersRound } from "lucide-react";

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
import { readAdminCustomers } from "@/server/repositories/commerce-repository";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "All Customers | UAG E-commerce",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const customers = await readAdminCustomers(query);
  const normalizedQuery = query.toLowerCase();
  const filtered = normalizedQuery
    ? customers.filter((customer) =>
        [
          customer.id,
          customer.name,
          customer.email,
          customer.email,
          customer.lastOrderAt ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : customers;

  const booked = filtered.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const returned = 0;
  const replaced = 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            Customers
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            All Customers
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Customer details shown after login, including contact information and
            order activity.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
          <Summary label="Booked" value={booked.toString()} />
          <Summary label="Returned" value={returned.toString()} />
          <Summary label="Replaced" value={replaced.toString()} />
        </div>
      </div>

      <Card className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader className="border-b">
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>
            {query
              ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${query}".`
              : "Login profile and customer order history in one table."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px] px-4">Customer ID</TableHead>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[240px]">Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead className="min-w-[120px]">Last Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-zinc-500">
                    No customers match this search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-4 font-semibold">{customer.id}</TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>{customer.totalItems}</TableCell>
                    <TableCell>{formatCents(customer.totalSpentCents)}</TableCell>
                    <TableCell>{customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleString("en-IN") : "-"}</TableCell>
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

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
