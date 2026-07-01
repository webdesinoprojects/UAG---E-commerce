"use client";

import { useActionState } from "react";
import { CreditCard, Truck } from "lucide-react";
import { createCheckoutOrderAction, type CheckoutState } from "@/features/checkout/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const initialState: CheckoutState = { message: null };

export function CheckoutForm({
  defaultName,
  onlinePaymentEnabled,
  isGuest = false,
}: {
  defaultName: string;
  onlinePaymentEnabled: boolean;
  isGuest?: boolean;
}) {
  const [state, action, pending] = useActionState(
    createCheckoutOrderAction,
    initialState
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="couponCode" id="coupon-code-input" value="" />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input id="fullName" name="fullName" defaultValue={defaultName} required aria-invalid={!!state.fieldErrors?.fullName?.[0]} />
            <FieldError>{state.fieldErrors?.fullName?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" inputMode="tel" required aria-invalid={!!state.fieldErrors?.phone?.[0]} />
            <FieldError>{state.fieldErrors?.phone?.[0] ?? null}</FieldError>
          </Field>
          {isGuest && (
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required aria-invalid={!!state.fieldErrors?.email?.[0]} />
              <FieldError>{state.fieldErrors?.email?.[0] ?? null}</FieldError>
            </Field>
          )}
        </div>

        <Field>
          <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
          <Input id="line1" name="line1" required aria-invalid={!!state.fieldErrors?.line1?.[0]} />
          <FieldError>{state.fieldErrors?.line1?.[0] ?? null}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="line2">Address line 2</FieldLabel>
          <Input id="line2" name="line2" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" name="city" required aria-invalid={!!state.fieldErrors?.city?.[0]} />
            <FieldError>{state.fieldErrors?.city?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input id="state" name="state" required aria-invalid={!!state.fieldErrors?.state?.[0]} />
            <FieldError>{state.fieldErrors?.state?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="postalCode">PIN code</FieldLabel>
            <Input id="postalCode" name="postalCode" required aria-invalid={!!state.fieldErrors?.postalCode?.[0]} />
            <FieldError>{state.fieldErrors?.postalCode?.[0] ?? null}</FieldError>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="notes">Order notes</FieldLabel>
          <Textarea id="notes" name="notes" rows={3} />
        </Field>
      </FieldGroup>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-zinc-950">Payment method</p>
        <RadioGroup name="paymentMethod" defaultValue="cod" className="grid gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
            <RadioGroupItem value="cod" id="payment-cod" />
            <Truck className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-zinc-950">Cash on delivery</span>
              <span className="block text-xs text-zinc-500">Stock is deducted when this order is booked.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
            <RadioGroupItem
              value="razorpay"
              id="payment-razorpay"
              disabled={!onlinePaymentEnabled}
            />
            <CreditCard className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-zinc-950">Razorpay</span>
              <span className="block text-xs text-zinc-500">
                {onlinePaymentEnabled
                  ? "Pay securely online. Stock is deducted after payment is verified."
                  : "Add Razorpay env keys to enable online payment."}
              </span>
            </span>
          </label>
        </RadioGroup>
      </div>

      <Button type="submit" className="h-11 w-full bg-zinc-950" disabled={pending}>
        {pending ? "Placing order..." : "Place Order"}
      </Button>
    </form>
  );
}
