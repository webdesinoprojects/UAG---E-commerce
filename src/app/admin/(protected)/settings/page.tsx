import { Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/server/auth/admin";

export const metadata = {
  title: "Settings | UAG E-commerce",
};

const settingsGroups = [
  {
    title: "Store Settings",
    description: "Store identity, catalog defaults, currency, and customer-facing business details.",
    status: "Ready",
  },
  {
    title: "Checkout",
    description: "Payment method visibility, COD availability, and order confirmation behavior.",
    status: "Connected",
  },
  {
    title: "Media",
    description: "Image library rules, local asset paths, and future ImageKit upload preferences.",
    status: "Configured",
  },
  {
    title: "Admin Access",
    description: "Role checks and admin session settings are enforced server side.",
    status: "Protected",
  },
];

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Settings className="h-4 w-4" aria-hidden="true" />
          Admin
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Review store configuration areas before deeper editable settings are connected.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card
            key={group.title}
            className="rounded-lg border-zinc-200 shadow-sm dark:border-zinc-800"
          >
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{group.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {group.description}
                  </CardDescription>
                </div>
                <Badge variant="outline">{group.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-sm text-zinc-500">
              This section is available as a stable admin route and can be wired to persistent settings when the final fields are approved.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
