"use client";

import { useActionState } from "react";
import { MapPin, Star, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  deleteCustomerAddressAction,
  saveCustomerAddressAction,
  setDefaultCustomerAddressAction,
  type CommerceActionState,
} from "@/features/commerce/order-actions";
import type { CustomerAddressDto } from "@/server/repositories/commerce-repository";

const initialState: CommerceActionState = { message: null };

export function AddressManager({
  addresses,
  defaultName,
}: {
  addresses: CustomerAddressDto[];
  defaultName: string;
}) {
  const [state, action, pending] = useActionState(
    saveCustomerAddressAction,
    initialState
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <MapPin className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-xl font-bold">No saved addresses</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Add one now or save your checkout address after placing an order.
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                      {address.fullName}
                    </h3>
                    {address.isDefault ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    <p>{address.line1}</p>
                    {address.line2 ? <p>{address.line2}</p> : null}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <form action={setDefaultCustomerAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <Button type="submit" variant="outline" size="sm">
                        <Star className="h-4 w-4" aria-hidden="true" />
                        Default
                      </Button>
                    </form>
                  ) : null}
                  <form action={deleteCustomerAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
          Add address
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Saved addresses can be selected during checkout.
        </p>
        <form action={action} className="mt-5 space-y-4">
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
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input id="fullName" name="fullName" defaultValue={defaultName} />
            <FieldError>{state.fieldErrors?.fullName?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" inputMode="tel" />
            <FieldError>{state.fieldErrors?.phone?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="line1">Address line 1</FieldLabel>
            <Input id="line1" name="line1" />
            <FieldError>{state.fieldErrors?.line1?.[0] ?? null}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="line2">Address line 2</FieldLabel>
            <Input id="line2" name="line2" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input id="city" name="city" />
              <FieldError>{state.fieldErrors?.city?.[0] ?? null}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Input id="state" name="state" />
              <FieldError>{state.fieldErrors?.state?.[0] ?? null}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="postalCode">PIN</FieldLabel>
              <Input id="postalCode" name="postalCode" />
              <FieldError>{state.fieldErrors?.postalCode?.[0] ?? null}</FieldError>
            </Field>
          </div>
          <input type="hidden" name="country" value="IN" />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isDefault"
              value="true"
              defaultChecked={addresses.length === 0}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Make this my default address
          </label>
          <Button type="submit" className="w-full bg-zinc-950" disabled={pending}>
            {pending ? "Saving..." : "Save Address"}
          </Button>
        </form>
      </section>
    </div>
  );
}
