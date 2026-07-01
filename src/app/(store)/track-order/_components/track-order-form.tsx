"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Home,
  PackageCheck,
  Search,
  ShieldPlus,
  ShoppingCart,
  Star,
} from "lucide-react";

import { trackOrderAction, type TrackOrderState } from "@/features/commerce/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Order = NonNullable<TrackOrderState["order"]>;

function formatCurrency(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date | string) {
  return format(new Date(date), "EEE, dd MMM yy");
}

function addDays(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date;
}

function isTerminalProblem(status: Order["status"]) {
  return (
    status === "pending_payment" ||
    status === "payment_failed" ||
    status === "cancelled"
  );
}

function getDeliveryText(order: Order) {
  if (order.status === "delivered") return "Your item has been delivered.";
  if (order.status === "cancelled") return "This order has been cancelled.";
  if (order.status === "payment_failed")
    return "Payment failed. Please place the order again.";
  if (order.status === "pending_payment")
    return "Payment is pending for this order.";
  return "Shipment is yet to be delivered.";
}

function firstItem(order: Order) {
  return order.items[0] ?? null;
}

function getDesktopSteps(order: Order) {
  const status = order.status;

  return [
    {
      label: "Order Confirmed",
      date: formatDate(order.createdAt),
      done: ["booked", "processing", "shipped", "delivered"].includes(status),
      current: status === "booked" || status === "processing",
    },
    {
      label: "Shipped",
      date: formatDate(addDays(order.createdAt, 1)),
      done: ["shipped", "delivered"].includes(status),
      current: status === "shipped",
    },
    {
      label: "Out For Delivery",
      date: formatDate(addDays(order.createdAt, 2)),
      done: status === "delivered",
      current: status === "shipped",
    },
    {
      label: "Delivered",
      date: formatDate(addDays(order.createdAt, 3)),
      done: status === "delivered",
      current: status === "delivered",
    },
  ];
}

function getMobileSteps(order: Order) {
  const status = order.status;

  return [
    {
      label: "Ordered",
      caption: formatDate(order.createdAt),
      done: ["booked", "processing", "shipped", "delivered"].includes(status),
    },
    {
      label: "Packed",
      caption: formatDate(addDays(order.createdAt, 1)),
      done: ["processing", "shipped", "delivered"].includes(status),
    },
    {
      label: "Shipped",
      caption: formatDate(addDays(order.createdAt, 2)),
      done: ["shipped", "delivered"].includes(status),
    },
    {
      label: "Delivery",
      caption:
        status === "delivered"
          ? formatDate(addDays(order.createdAt, 3))
          : `Expected by ${formatDate(addDays(order.createdAt, 4))}`,
      done: status === "delivered",
    },
  ];
}

function productVariant(order: Order) {
  const item = firstItem(order);
  return item?.sku ? `SKU: ${item.sku}` : "Standard";
}

function addressText(order: Order) {
  const address = order.shippingAddress;
  return (
    [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postalCode,
    ]
      .filter(Boolean)
      .join(", ") || "Address details are not available for this order."
  );
}

function MobileTimeline({ order }: { order: Order }) {
  if (isTerminalProblem(order.status)) {
    return (
      <div className="px-4 py-5">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
          {getDeliveryText(order)}
        </div>
      </div>
    );
  }

  const steps = getMobileSteps(order);

  return (
    <div className="px-4 py-5">
      <div className="space-y-0">
        {steps.map((step) => (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`mt-1.5 h-3 w-3 rounded-full border-2 ${
                  step.done
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-zinc-300 bg-white"
                }`}
              />
              {steps.length > 1 ? (
                <div
                  className={`h-12 w-0.5 ${
                    step.done ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                />
              ) : null}
            </div>
            <div className={steps.length > 1 ? "pb-4" : ""}>
              <div className="flex items-center gap-1.5">
                <p
                  className={`text-sm font-semibold ${
                    step.done ? "text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </p>
                {step.label === "Delivery" ? (
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">{step.caption}</p>
              {step.label === "Delivery" ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {getDeliveryText(order)}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopTimeline({ order }: { order: Order }) {
  if (isTerminalProblem(order.status)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
        {getDeliveryText(order)}
      </div>
    );
  }

  const steps = getDesktopSteps(order);

  return (
    <div className="flex flex-col justify-center">
      <div className="relative">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-zinc-200" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all"
          style={{
            width:
              steps.filter((s) => s.done).length > 0
                ? `${
                    ((steps.filter((s) => s.done).length - 1) /
                      (steps.length - 1)) *
                    100
                  }%`
                : "0%",
          }}
        />
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => (
            <div
              key={step.label}
              className="relative flex flex-col items-center text-center"
            >
              <p
                className={`z-10 text-xs font-bold ${
                  step.done ? "text-emerald-600" : "text-zinc-400"
                }`}
              >
                {step.label}
              </p>
              <div
                className={`z-10 mt-2 h-4 w-4 rounded-full border-2 ${
                  step.done
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-zinc-300 bg-white"
                } ${step.current ? "ring-4 ring-emerald-100" : ""}`}
              />
              <p
                className={`mt-2 text-xs ${
                  step.current
                    ? "font-bold text-zinc-900"
                    : step.done
                      ? "font-medium text-zinc-700"
                      : "text-zinc-500"
                }`}
              >
                {step.date}
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-800">
        {getDeliveryText(order)}
      </p>
    </div>
  );
}

function SearchPanel({
  state,
  formAction,
  pending,
}: {
  state: TrackOrderState;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  return (
    <section className="mx-4 mt-10 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm md:mx-auto md:mt-16 md:max-w-xl md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
        Track Order
      </p>
      <h1 className="mt-3 text-2xl font-heading font-bold text-zinc-950 md:text-3xl">
        Find your order details
      </h1>
      <p className="mt-2 text-sm leading-6 text-zinc-500">
        Enter your order number or order ID to load live order status.
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="identifier">Order Number or ID</FieldLabel>
            <Input
              id="identifier"
              name="identifier"
              placeholder="e.g. UAG-2024-0001 or UUID"
              required
              aria-invalid={!!state.fieldErrors?.identifier?.[0]}
            />
            <FieldError>
              {state.fieldErrors?.identifier?.[0] ?? null}
            </FieldError>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          className="w-full bg-[#2874f0] hover:bg-[#1e5bb5]"
          disabled={pending}
        >
          <Search className="mr-2 h-4 w-4" />
          {pending ? "Searching..." : "Track Order"}
        </Button>
      </form>

      {state.message && !state.order ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.notFound && !state.message ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            No order found with this order number or ID. Please check and try again.
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}

function MobileOrderDetails({ order }: { order: Order }) {
  const item = firstItem(order);

  return (
    <section className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-white shadow-sm md:hidden">
      <div className="sticky top-0 z-20 flex h-11 items-center justify-between bg-[#2874f0] px-3 text-white">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Go back">
            <ArrowLeft className="h-5 w-5 stroke-[2.4]" aria-hidden="true" />
          </Link>
          <span className="text-base font-medium">Order Details</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/search" aria-label="Search">
            <Search className="h-4.5 w-4.5 stroke-[2.6]" aria-hidden="true" />
          </Link>
          <Link href="/cart" aria-label="Cart">
            <ShoppingCart className="h-4.5 w-4.5 stroke-[2.6]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-[11px] text-zinc-500">
          Order ID -{" "}
          <span className="font-medium text-zinc-700">
            {order.orderNumber}
          </span>
        </p>
      </div>

      {item ? (
        <div className="flex gap-3 border-b border-zinc-100 px-4 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm font-medium text-zinc-950">
              {item.productName}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{productVariant(order)}</p>
            <p className="mt-1 text-xs text-zinc-500">Seller: UAG Store</p>
            <p className="mt-2 text-base font-semibold text-zinc-950">
              {formatCurrency(item.lineTotalCents, item.currency)}
            </p>
          </div>
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-white">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.productName}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            ) : (
              <PackageCheck className="m-6 h-8 w-8 text-zinc-300" />
            )}
          </div>
        </div>
      ) : null}

      <MobileTimeline order={order} />

      <div className="grid grid-cols-2 border-y border-zinc-100 text-sm font-semibold text-zinc-800">
        <Link
          href="/contact-us"
          className="flex h-11 items-center justify-center border-r border-zinc-100"
        >
          Cancel
        </Link>
        <Link
          href="/contact-us"
          className="flex h-11 items-center justify-center"
        >
          Need help?
        </Link>
      </div>

      <div className="flex items-center gap-3 border-b border-zinc-100 bg-[#e4f8ff] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0aa6c7] text-white">
          <ShieldPlus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">
            Your Safety Comes First
          </p>
          <p className="truncate text-xs text-zinc-600">
            We are taking important measures to keep you safe
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-cyan-700" />
      </div>

      <div className="px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Your issues with this item
        </p>
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-900">
            I have a delivery related issue
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full border border-blue-600" />
            Issue will be resolved by{" "}
            {formatDate(addDays(order.createdAt, 7))}.
          </div>
        </div>
        <Link
          href="/contact-us"
          className="mt-5 flex items-center justify-between text-sm font-medium text-zinc-800"
        >
          View All Issues
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function DesktopOrderDetails({ order }: { order: Order }) {
  const item = firstItem(order);
  const address = order.shippingAddress;
  const resolvedAddress = addressText(order);

  return (
    <section className="hidden bg-[#f1f3f6] py-4 pb-10 text-[#212121] md:block">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-1 py-3 text-[11px] text-zinc-500">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
          <ChevronRight className="h-3 w-3" />
          <span>My Account</span>
          <ChevronRight className="h-3 w-3" />
          <span>My Orders</span>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-zinc-700">
            {order.orderNumber}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold">Delivery Address</h2>
            <p className="mt-3 text-sm font-semibold">
              {address?.fullName || order.customerName}
            </p>
            <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">
              {resolvedAddress}
            </p>
            <p className="mt-3 text-sm font-semibold">Phone number</p>
            <p className="mt-1 text-sm text-zinc-600">
              {address?.phone || order.customerPhone}
            </p>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold">Rewards / Cashback</h2>
            <div className="mt-5 flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold">28 UAG Coins Cashback</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Use it to save on your next order
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold">More Actions</h2>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Download Invoice</span>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-9 rounded-md px-5 text-xs font-semibold text-[#2874f0]"
              >
                <Link href={`/checkout/confirmation/${order.id}`}>
                  Download
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <section className="mt-4 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:grid-cols-[280px_minmax(0,1fr)_230px]">
          <div className="flex gap-5">
            <div className="relative h-32 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-50">
              {item?.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : (
                <PackageCheck className="m-6 h-8 w-8 text-zinc-300" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-3 text-sm font-semibold text-zinc-900">
                {item?.productName ?? "Order item"}
              </h3>
              <p className="mt-2 text-xs text-zinc-500">
                {productVariant(order)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Seller: UAG Store</p>
              <p className="mt-3 text-base font-semibold text-zinc-900">
                {formatCurrency(
                  item?.lineTotalCents ?? order.totalCents,
                  item?.currency ?? order.currency
                )}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                Offers Applied
              </p>
            </div>
          </div>

          <DesktopTimeline order={order} />

          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4 text-sm font-semibold text-[#2874f0] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <Link
              href="/contact-us"
              className="flex items-center gap-2 hover:underline"
            >
              <Star className="h-4 w-4 fill-[#2874f0]" />
              Rate & Review Product
            </Link>
            <Link
              href="/contact-us"
              className="flex items-center gap-2 hover:underline"
            >
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

export function TrackOrderForm() {
  const [state, formAction, pending] = useActionState(
    trackOrderAction,
    { order: null, notFound: false } as TrackOrderState
  );

  return (
    <div>
      {state.order ? (
        <>
          <MobileOrderDetails order={state.order} />
          <DesktopOrderDetails order={state.order} />
        </>
      ) : (
        <SearchPanel state={state} formAction={formAction} pending={pending} />
      )}
    </div>
  );
}
