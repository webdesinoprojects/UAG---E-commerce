"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoicePrintButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Download className="h-4 w-4" aria-hidden="true" />
      Print / Download
    </Button>
  );
}
