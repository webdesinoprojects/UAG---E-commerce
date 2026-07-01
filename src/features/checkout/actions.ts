"use server";

import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CART_COOKIE_NAME } from "@/lib/cart-cookies";
import { getCartSummary } from "@/features/cart/queries";
import { getCurrentCustomer } from "@/server/auth/customer";
import { createCheckoutOrder } from "@/server/repositories/commerce-repository";
import { checkoutSchema } from "@/server/validators/commerce";

export interface CheckoutState {
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function createCheckoutOrderAction(
  _previousState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const customer = await getCurrentCustomer();
  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes"),
    couponCode: formData.get("couponCode"),
  });

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let redirectTo = "";

  try {
    const cart = await getCartSummary();
    const result = await createCheckoutOrder({
      customer,
      cart,
      checkout: parsed.data,
    });

    if (result.paymentMethod === "cod") {
      const cookieStore = await cookies();
      cookieStore.delete(CART_COOKIE_NAME);
      revalidatePath("/cart");
      revalidatePath("/checkout");
      revalidatePath("/account");
      revalidatePath("/admin/orders");
      revalidatePath("/admin/inventory");
      redirectTo = `/checkout/confirmation/${result.orderId}`;
    } else {
      redirectTo = `/checkout/payment/${result.orderId}`;
    }
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again.",
    };
  }

  redirect(redirectTo);
}
