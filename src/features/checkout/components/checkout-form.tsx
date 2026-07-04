"use client";

import { useActionState, useMemo, useState } from "react";
import { CreditCard, MapPin, Truck } from "lucide-react";
import { createCheckoutOrderAction, type CheckoutState } from "@/features/checkout/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { CustomerAddressDto } from "@/server/repositories/commerce-repository";

const initialState: CheckoutState = { message: null };

export function CheckoutForm({
  defaultName,
  onlinePaymentEnabled,
  isGuest = false,
  couponCode,
  addresses = [],
}: {
  defaultName: string;
  onlinePaymentEnabled: boolean;
  isGuest?: boolean;
  couponCode: string;
  addresses?: CustomerAddressDto[];
}) {
  const [state, action, pending] = useActionState(
    createCheckoutOrderAction,
    initialState
  );
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses]
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id ?? ""
  );
  const [address, setAddress] = useState({
    fullName: defaultAddress?.fullName ?? defaultName,
    phone: defaultAddress?.phone ?? "",
    email: "",
    line1: defaultAddress?.line1 ?? "",
    line2: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? "",
    state: defaultAddress?.state ?? "",
    postalCode: defaultAddress?.postalCode ?? "",
  });

  function selectAddress(addressId: string) {
    setSelectedAddressId(addressId);
    const next = addresses.find((item) => item.id === addressId);
    if (!next) return;
    setAddress({
      fullName: next.fullName,
      phone: next.phone,
      email: address.email,
      line1: next.line1,
      line2: next.line2 ?? "",
      city: next.city,
      state: next.state,
      postalCode: next.postalCode,
    });
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="couponCode" value={couponCode} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        {addresses.length > 0 ? (
          <Field>
            <FieldLabel htmlFor="savedAddress">Saved address</FieldLabel>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                id="savedAddress"
                value={selectedAddressId}
                onChange={(event) => selectAddress(event.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {addresses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fullName} - {item.line1}, {item.city}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!state.fieldErrors?.fullName?.[0]}>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input
              id="fullName"
              name="fullName"
              value={address.fullName}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              required
              aria-invalid={!!state.fieldErrors?.fullName?.[0]}
            />
            <FieldError>{state.fieldErrors?.fullName?.[0] ?? null}</FieldError>
          </Field>
          <Field data-invalid={!!state.fieldErrors?.phone?.[0]}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              name="phone"
              inputMode="tel"
              value={address.phone}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              required
              aria-invalid={!!state.fieldErrors?.phone?.[0]}
            />
            <FieldError>{state.fieldErrors?.phone?.[0] ?? null}</FieldError>
          </Field>
          {isGuest && (
            <Field data-invalid={!!state.fieldErrors?.email?.[0]}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={address.email}
                onChange={(event) =>
                  setAddress((current) => ({ ...current, email: event.target.value }))
                }
                required
                aria-invalid={!!state.fieldErrors?.email?.[0]}
              />
              <FieldError>{state.fieldErrors?.email?.[0] ?? null}</FieldError>
            </Field>
          )}
        </div>

        <Field data-invalid={!!state.fieldErrors?.line1?.[0]}>
          <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
          <Input
            id="line1"
            name="line1"
            value={address.line1}
            onChange={(event) =>
              setAddress((current) => ({ ...current, line1: event.target.value }))
            }
            required
            aria-invalid={!!state.fieldErrors?.line1?.[0]}
          />
          <FieldError>{state.fieldErrors?.line1?.[0] ?? null}</FieldError>
        </Field>

        <Field data-invalid={!!state.fieldErrors?.line2?.[0]}>
          <FieldLabel htmlFor="line2">Address line 2</FieldLabel>
          <Input
            id="line2"
            name="line2"
            value={address.line2}
            onChange={(event) =>
              setAddress((current) => ({ ...current, line2: event.target.value }))
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={!!state.fieldErrors?.city?.[0]}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              name="city"
              value={address.city}
              onChange={(event) =>
                setAddress((current) => ({ ...current, city: event.target.value }))
              }
              required
              aria-invalid={!!state.fieldErrors?.city?.[0]}
            />
            <FieldError>{state.fieldErrors?.city?.[0] ?? null}</FieldError>
          </Field>
          <Field data-invalid={!!state.fieldErrors?.state?.[0]}>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              name="state"
              value={address.state}
              onChange={(event) =>
                setAddress((current) => ({ ...current, state: event.target.value }))
              }
              required
              aria-invalid={!!state.fieldErrors?.state?.[0]}
            />
            <FieldError>{state.fieldErrors?.state?.[0] ?? null}</FieldError>
          </Field>
          <Field data-invalid={!!state.fieldErrors?.postalCode?.[0]}>
            <FieldLabel htmlFor="postalCode">PIN code</FieldLabel>
            <Input
              id="postalCode"
              name="postalCode"
              value={address.postalCode}
              onChange={(event) =>
                setAddress((current) => ({
                  ...current,
                  postalCode: event.target.value,
                }))
              }
              required
              aria-invalid={!!state.fieldErrors?.postalCode?.[0]}
            />
            <FieldError>{state.fieldErrors?.postalCode?.[0] ?? null}</FieldError>
          </Field>
        </div>

        {!isGuest ? (
          <label className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <input
              type="checkbox"
              name="saveAddress"
              value="true"
              className="mt-1 h-4 w-4 rounded border-zinc-300"
              defaultChecked={addresses.length === 0}
            />
            <span>
              <span className="block font-semibold text-zinc-950 dark:text-zinc-100">
                Save this as my default address
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                You can reuse or edit saved addresses from your account.
              </span>
            </span>
          </label>
        ) : null}

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