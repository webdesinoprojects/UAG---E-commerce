"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RazorpayPayment({
  orderId,
  orderNumber,
  razorpayOrderId,
  keyId,
  amountCents,
  currency,
  customerName,
  customerEmail,
  customerPhone,
}: {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  keyId: string;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadRazorpay() {
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function startPayment() {
    setPending(true);
    setMessage(null);

    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setPending(false);
      setMessage("Could not load Razorpay checkout. Please try again.");
      return;
    }

    const checkout = new window.Razorpay({
      key: keyId,
      amount: amountCents,
      currency,
      name: "UAG",
      description: orderNumber,
      order_id: razorpayOrderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      handler: async (response: unknown) => {
        const verifyResponse = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, ...(response as Record<string, unknown>) }),
        });
        const result = (await verifyResponse.json()) as {
          ok?: boolean;
          redirectTo?: string;
          error?: string;
        };

        if (!verifyResponse.ok || !result.ok) {
          setPending(false);
          setMessage(result.error ?? "Payment verification failed.");
          return;
        }

        router.push(result.redirectTo ?? "/account/orders");
        router.refresh();
      },
      modal: {
        ondismiss: () => {
          setPending(false);
        },
      },
    });

    checkout.open();
  }

  return (
    <div className="space-y-4">
      {message ? (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="button"
        className="h-11 w-full bg-zinc-950"
        onClick={startPayment}
        disabled={pending}
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        {pending ? "Opening payment..." : "Pay Now"}
      </Button>
    </div>
  );
}
