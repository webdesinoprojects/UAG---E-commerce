"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/auth/admin";
import { requireCustomer } from "@/server/auth/customer";
import {
  cancelCustomerOrder,
  createCustomerServiceRequest,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  updateAdminOrderStatus,
  updateAdminServiceRequestStatus,
  upsertCustomerAddress,
} from "@/server/repositories/commerce-repository";
import {
  adminOrderStatusSchema,
  adminServiceRequestStatusSchema,
  customerAddressSchema,
  customerOrderCancelSchema,
  orderServiceRequestSchema,
} from "@/server/validators/commerce";

export interface CommerceActionState {
  message: string | null;
  successMessage?: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
}

const initialSuccess = (message: string): CommerceActionState => ({
  message: null,
  successMessage: message,
});

const addressIdSchema = z.object({
  addressId: z.string().uuid(),
});

export async function saveCustomerAddressAction(
  _previousState: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const customer = await requireCustomer();
  const parsed = customerAddressSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "IN",
    isDefault: formData.get("isDefault"),
  });

  if (!parsed.success) {
    return {
      message: "Check the highlighted address fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await upsertCustomerAddress(customer.id, parsed.data);
    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return initialSuccess("Address saved.");
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Could not save address.",
    };
  }
}

export async function setDefaultCustomerAddressAction(formData: FormData) {
  const customer = await requireCustomer();
  const parsed = addressIdSchema.parse({
    addressId: formData.get("addressId"),
  });

  await setDefaultCustomerAddress(customer.id, parsed.addressId);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function deleteCustomerAddressAction(formData: FormData) {
  const customer = await requireCustomer();
  const parsed = addressIdSchema.parse({
    addressId: formData.get("addressId"),
  });

  await deleteCustomerAddress(customer.id, parsed.addressId);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function cancelCustomerOrderAction(
  _previousState: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const customer = await requireCustomer();
  const parsed = customerOrderCancelSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return {
      message: "Could not cancel this order.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await cancelCustomerOrder({
      orderId: parsed.data.orderId,
      customerId: customer.id,
      reason: parsed.data.reason,
    });
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders");
    return initialSuccess("Order cancelled.");
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Could not cancel order.",
    };
  }
}

export async function createOrderServiceRequestAction(
  _previousState: CommerceActionState,
  formData: FormData
): Promise<CommerceActionState> {
  const customer = await requireCustomer();
  const parsed = orderServiceRequestSchema.safeParse({
    orderId: formData.get("orderId"),
    orderItemId: formData.get("orderItemId"),
    requestType: formData.get("requestType"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
    details: formData.get("details"),
  });

  if (!parsed.success) {
    return {
      message: "Check the highlighted request fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createCustomerServiceRequest(customer.id, parsed.data);
    revalidatePath(`/account/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/orders/returns");
    return initialSuccess("Request submitted.");
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Could not submit request.",
    };
  }
}

export async function updateAdminOrderStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = adminOrderStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber"),
    note: formData.get("note"),
  });

  await updateAdminOrderStatus({
    orderId: parsed.orderId,
    status: parsed.status,
    adminId: admin.id,
    note: parsed.note,
    trackingNumber: parsed.trackingNumber,
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders/returns");
}

export async function updateAdminServiceRequestStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = adminServiceRequestStatusSchema.parse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote"),
  });

  await updateAdminServiceRequestStatus({
    requestId: parsed.requestId,
    status: parsed.status,
    adminId: admin.id,
    adminNote: parsed.adminNote,
  });
  revalidatePath("/admin/orders/returns");
}
