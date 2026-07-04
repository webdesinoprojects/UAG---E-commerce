"use client";

import { useActionState } from "react";
import { AlertCircle, RotateCcw, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelCustomerOrderAction,
  createOrderServiceRequestAction,
  type CommerceActionState,
} from "@/features/commerce/order-actions";
import type { OrderDto } from "@/server/repositories/commerce-repository";

const initialState: CommerceActionState = { message: null };

export function OrderSelfService({ order }: { order: OrderDto }) {
  const canCancel = ["pending_payment", "booked", "processing"].includes(
    order.status
  );
  const canRequestService = order.status === "delivered";

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <XCircle className="mt-1 h-5 w-5 text-red-500" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
              Cancel order
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Available before the order is shipped. Stock is restored automatically.
            </p>
          </div>
        </div>
        {canCancel ? (
          <CancelOrderForm orderId={order.id} />
        ) : (
          <div className="mt-5 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            This order can no longer be cancelled online.
          </div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <RotateCcw className="mt-1 h-5 w-5 text-blue-600" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
              Return or replace
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Open a request after delivery and admin can process it from the returns panel.
            </p>
          </div>
        </div>
        {canRequestService ? (
          <ServiceRequestForm order={order} />
        ) : (
          <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Return and replacement requests open after delivery.
          </div>
        )}
      </section>
    </div>
  );
}

function CancelOrderForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    cancelCustomerOrderAction,
    initialState
  );

  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.successMessage ? (
        <Alert>
          <AlertDescription>{state.successMessage}</AlertDescription>
        </Alert>
      ) : null}
      <Field>
        <FieldLabel htmlFor="cancelReason">Reason</FieldLabel>
        <Textarea
          id="cancelReason"
          name="reason"
          rows={3}
          placeholder="Optional cancellation note"
        />
        <FieldError>{state.fieldErrors?.reason?.[0] ?? null}</FieldError>
      </Field>
      <Button
        type="submit"
        variant="destructive"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Cancelling..." : "Cancel Order"}
      </Button>
    </form>
  );
}

function ServiceRequestForm({ order }: { order: OrderDto }) {
  const [state, action, pending] = useActionState(
    createOrderServiceRequestAction,
    initialState
  );

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="orderId" value={order.id} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.successMessage ? (
        <Alert>
          <AlertDescription>{state.successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="requestType">Request type</FieldLabel>
          <select
            id="requestType"
            name="requestType"
            className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            defaultValue="return"
          >
            <option value="return">Return</option>
            <option value="replacement">Replacement</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="orderItemId">Item</FieldLabel>
          <select
            id="orderItemId"
            name="orderItemId"
            className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            defaultValue={order.items[0]?.id}
          >
            {order.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
        <Field>
          <FieldLabel htmlFor="quantity">Qty</FieldLabel>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <FieldError>{state.fieldErrors?.quantity?.[0] ?? null}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="reason">Reason</FieldLabel>
          <input
            id="reason"
            name="reason"
            placeholder="Damaged, wrong item, not working..."
            className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <FieldError>{state.fieldErrors?.reason?.[0] ?? null}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="details">Details</FieldLabel>
        <Textarea
          id="details"
          name="details"
          rows={4}
          placeholder="Tell us what happened and what resolution you need."
        />
        <FieldError>{state.fieldErrors?.details?.[0] ?? null}</FieldError>
      </Field>

      <Button type="submit" className="w-full bg-zinc-950" disabled={pending}>
        {pending ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
