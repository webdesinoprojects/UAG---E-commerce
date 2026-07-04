/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import type { CustomerSession } from "@/server/auth/customer";
import type { CartSummary } from "@/features/cart/types";
import type {
  CheckoutInput,
  CustomerAddressInput,
  OrderServiceRequestInput,
} from "@/server/validators/commerce";
import type { Coupon, CouponValidationResult } from "@/features/commerce/types";
import { createRazorpayOrder } from "@/server/payments/razorpay";

type AnyClient = NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>;

export type OrderStatus =
  | "pending_payment"
  | "booked"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed";

export type PaymentStatus = "pending" | "paid" | "failed" | "cod";
export type PaymentMethod = "cod" | "razorpay";

export interface OrderItemDto {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  imageUrl: string | null;
  sku: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  currency: string;
}

export interface OrderShippingAddressDto {
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  couponCode: string | null;
  razorpayOrderId: string | null;
  statusNote: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  shippingAddress: OrderShippingAddressDto | null;
  items: OrderItemDto[];
}

export interface CustomerAddressDto extends OrderShippingAddressDto {
  id: string;
  customerId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEventDto {
  id: string;
  orderId: string;
  eventType: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus | null;
  message: string | null;
  actorRole: "customer" | "admin" | "system";
  createdAt: string;
}

export type ServiceRequestType = "return" | "replacement";
export type ServiceRequestStatus =
  | "requested"
  | "approved"
  | "pickup_scheduled"
  | "received"
  | "replacement_shipped"
  | "refunded"
  | "rejected"
  | "cancelled"
  | "completed";

export interface ServiceRequestDto {
  id: string;
  requestNumber: string;
  orderId: string;
  orderNumber: string | null;
  orderItemId: string | null;
  productName: string | null;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  requestType: ServiceRequestType;
  status: ServiceRequestStatus;
  quantity: number;
  reason: string;
  details: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomerDto {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalItems: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
}

export interface AdminReviewDto {
  id: string;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  status: string;
  updatedAt: string;
}

function getClient(): AnyClient {
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Database not available.");
  return client as AnyClient;
}

function addressJson(input: CheckoutInput) {
  return {
    fullName: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || null,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: "IN",
  };
}

function ensureCheckoutCart(cart: CartSummary) {
  if (cart.items.length === 0) throw new Error("Your cart is empty.");

  const outOfStock = cart.items.find(
    (item) => item.stockQuantity < item.quantity
  );

  if (outOfStock) {
    throw new Error(`${outOfStock.name} does not have enough stock.`);
  }
}

async function readOrderItems(client: AnyClient, orderIds: string[]) {
  const map = new Map<string, OrderItemDto[]>();
  if (orderIds.length === 0) return map;

  const { data } = await (client as any)
    .from("commerce_order_items")
    .select("*")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  (data ?? []).forEach((row: any) => {
    const item: OrderItemDto = {
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      productSlug: row.product_slug,
      imageUrl: row.image_url,
      sku: row.sku,
      unitPriceCents: row.unit_price_cents,
      quantity: row.quantity,
      lineTotalCents: row.line_total_cents,
      currency: row.currency,
    };
    map.set(row.order_id, [...(map.get(row.order_id) ?? []), item]);
  });

  return map;
}

function mapOrder(row: any, items: OrderItemDto[]): OrderDto {
  const shippingAddress =
    row.shipping_address && typeof row.shipping_address === "object"
      ? {
          fullName: String(row.shipping_address.fullName ?? row.customer_name ?? ""),
          phone: String(row.shipping_address.phone ?? row.customer_phone ?? ""),
          line1: String(row.shipping_address.line1 ?? ""),
          line2: row.shipping_address.line2 ? String(row.shipping_address.line2) : null,
          city: String(row.shipping_address.city ?? ""),
          state: String(row.shipping_address.state ?? ""),
          postalCode: String(row.shipping_address.postalCode ?? ""),
          country: String(row.shipping_address.country ?? "IN"),
        }
      : null;

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    discountCents: row.discount_cents ?? 0,
    totalCents: row.total_cents,
    currency: row.currency,
    couponCode: row.coupon_code ?? null,
    razorpayOrderId: row.razorpay_order_id,
    statusNote: row.status_note ?? null,
    trackingNumber: row.tracking_number ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shippedAt: row.shipped_at ?? null,
    deliveredAt: row.delivered_at ?? null,
    cancelledAt: row.cancelled_at ?? null,
    shippingAddress,
    items,
  };
}

function mapAddress(row: any): CustomerAddressDto {
  return {
    id: row.id,
    customerId: row.customer_id,
    fullName: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2 ?? null,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderEvent(row: any): OrderEventDto {
  return {
    id: row.id,
    orderId: row.order_id,
    eventType: row.event_type,
    oldStatus: row.old_status ?? null,
    newStatus: row.new_status ?? null,
    message: row.message ?? null,
    actorRole: row.actor_role ?? "system",
    createdAt: row.created_at,
  };
}

function mapServiceRequest(
  row: any,
  order?: any,
  item?: any
): ServiceRequestDto {
  return {
    id: row.id,
    requestNumber: row.request_number,
    orderId: row.order_id,
    orderNumber: order?.order_number ?? null,
    orderItemId: row.order_item_id ?? null,
    productName: item?.product_name ?? null,
    customerId: row.customer_id ?? null,
    customerName: order?.customer_name ?? null,
    customerEmail: order?.customer_email ?? null,
    requestType: row.request_type,
    status: row.status,
    quantity: row.quantity,
    reason: row.reason,
    details: row.details ?? null,
    adminNote: row.admin_note ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "") || value.trim();
}

export async function createCheckoutOrder(input: {
  customer: CustomerSession | null;
  cart: CartSummary;
  checkout: CheckoutInput & { email?: string | null } & { couponCode?: string | null };
}) {
  ensureCheckoutCart(input.cart);
  const client = getClient();

  const customerEmail = input.customer?.email
    ? input.customer.email
    : (input.checkout.email?.trim() || `guest-${Date.now()}@uag.store`);

  const { data, error } = await (client as any).rpc(
    "create_commerce_checkout_order",
    {
      p_customer_id: input.customer?.id ?? null,
      p_customer_email: customerEmail,
      p_customer_name: input.checkout.fullName,
      p_customer_phone: input.checkout.phone,
      p_shipping_address: addressJson(input.checkout),
      p_payment_method: input.checkout.paymentMethod,
      p_items: input.cart.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      p_coupon_code: input.checkout.couponCode || null,
      p_notes: input.checkout.notes || null,
      p_currency: input.cart.currency,
      p_save_address: Boolean(input.checkout.saveAddress),
    }
  );

  if (error) {
    throw new Error(error.message || "Could not place your order.");
  }

  const created = Array.isArray(data) ? data[0] : data;

  if (!created?.order_id) {
    throw new Error("Could not create order.");
  }

  if (created.payment_method === "cod") {
    return { orderId: created.order_id as string, paymentMethod: "cod" as const };
  }

  const razorpayOrder = await createRazorpayOrder({
    amountCents: Number(created.total_cents),
    currency: String(created.currency ?? input.cart.currency),
    receipt: String(created.order_number),
    notes: {
      orderId: String(created.order_id),
      orderNumber: String(created.order_number),
    },
  });

  const [{ error: orderUpdateError }, { error: paymentUpdateError }] =
    await Promise.all([
      (client as any)
        .from("commerce_orders")
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq("id", created.order_id),
      (client as any)
        .from("commerce_payments")
        .update({ provider_order_id: razorpayOrder.id })
        .eq("order_id", created.order_id)
        .eq("provider", "razorpay"),
    ]);

  if (orderUpdateError || paymentUpdateError) {
    await (client as any)
      .from("commerce_orders")
      .update({ status: "payment_failed", payment_status: "failed" })
      .eq("id", created.order_id);
    throw new Error("Could not initialize online payment.");
  }

  return { orderId: created.order_id as string, paymentMethod: "razorpay" as const };
}

export async function readCustomerOrders(customerId: string): Promise<OrderDto[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const itemsMap = await readOrderItems(
    client,
    rows.map((row: any) => row.id)
  );

  return rows.map((row: any) => mapOrder(row, itemsMap.get(row.id) ?? []));
}

export async function readCustomerOrderForPayment(
  orderId: string,
  customerId: string
): Promise<OrderDto | null> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!data) return null;

  const itemsMap = await readOrderItems(client, [data.id]);
  return mapOrder(data, itemsMap.get(data.id) ?? []);
}

export async function readCustomerOrderById(
  orderId: string,
  customerId: string
): Promise<OrderDto | null> {
  return readCustomerOrderForPayment(orderId, customerId);
}

export async function readOrderEvents(orderId: string): Promise<OrderEventDto[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => mapOrderEvent(row));
}

export async function readCustomerAddresses(
  customerId: string
): Promise<CustomerAddressDto[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => mapAddress(row));
}

export async function upsertCustomerAddress(
  customerId: string,
  input: CustomerAddressInput
): Promise<CustomerAddressDto> {
  const client = getClient();
  const isDefault = Boolean(input.isDefault);

  if (isDefault) {
    await (client as any)
      .from("commerce_customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", customerId);
  }

  const row = {
    customer_id: customerId,
    full_name: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || null,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    country: input.country || "IN",
    is_default: isDefault,
  };

  const query = input.id
    ? (client as any)
        .from("commerce_customer_addresses")
        .update(row)
        .eq("id", input.id)
        .eq("customer_id", customerId)
        .select("*")
        .single()
    : (client as any)
        .from("commerce_customer_addresses")
        .insert(row)
        .select("*")
        .single();

  const { data, error } = await query;

  if (error || !data) throw new Error("Could not save address.");
  return mapAddress(data);
}

export async function setDefaultCustomerAddress(
  customerId: string,
  addressId: string
) {
  const client = getClient();
  const { data: address } = await (client as any)
    .from("commerce_customer_addresses")
    .select("id")
    .eq("id", addressId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!address) throw new Error("Address not found.");

  await (client as any)
    .from("commerce_customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", customerId);

  const { error } = await (client as any)
    .from("commerce_customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("customer_id", customerId);

  if (error) throw new Error("Could not update default address.");
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string
) {
  const client = getClient();
  const { error } = await (client as any)
    .from("commerce_customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", customerId);

  if (error) throw new Error("Could not delete address.");
}

export async function cancelCustomerOrder(input: {
  orderId: string;
  customerId: string;
  reason?: string;
}) {
  const client = getClient();
  const { error } = await (client as any).rpc("cancel_commerce_order", {
    p_order_id: input.orderId,
    p_customer_id: input.customerId,
    p_actor_id: input.customerId,
    p_actor_role: "customer",
    p_reason: input.reason || "Cancelled by customer.",
  });

  if (error) throw new Error(error.message || "Could not cancel order.");
}

async function hydrateServiceRequests(
  client: AnyClient,
  rows: any[]
): Promise<ServiceRequestDto[]> {
  if (rows.length === 0) return [];

  const orderIds = [...new Set(rows.map((row) => row.order_id))];
  const itemIds = [
    ...new Set(rows.map((row) => row.order_item_id).filter(Boolean)),
  ];

  const [{ data: orders }, { data: items }] = await Promise.all([
    (client as any)
      .from("commerce_orders")
      .select("id,order_number,customer_name,customer_email")
      .in("id", orderIds),
    itemIds.length
      ? (client as any)
          .from("commerce_order_items")
          .select("id,product_name")
          .in("id", itemIds)
      : Promise.resolve({ data: [] }),
  ]);

  const orderMap = new Map((orders ?? []).map((order: any) => [order.id, order]));
  const itemMap = new Map((items ?? []).map((item: any) => [item.id, item]));

  return rows.map((row) =>
    mapServiceRequest(row, orderMap.get(row.order_id), itemMap.get(row.order_item_id))
  );
}

export async function readCustomerServiceRequestsForOrder(
  customerId: string,
  orderId: string
): Promise<ServiceRequestDto[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_service_requests")
    .select("*")
    .eq("customer_id", customerId)
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  return hydrateServiceRequests(client, data ?? []);
}

export async function createCustomerServiceRequest(
  customerId: string,
  input: OrderServiceRequestInput
) {
  const client = getClient();
  const order = await readCustomerOrderById(input.orderId, customerId);

  if (!order) throw new Error("Order not found.");
  if (order.status !== "delivered") {
    throw new Error("Returns and replacements open after delivery.");
  }

  const item =
    order.items.find((candidate) => candidate.id === input.orderItemId) ??
    order.items[0];

  if (!item) throw new Error("Order item not found.");
  if (input.quantity > item.quantity) {
    throw new Error("Request quantity cannot exceed ordered quantity.");
  }

  const { data, error } = await (client as any)
    .from("commerce_service_requests")
    .insert({
      order_id: order.id,
      order_item_id: item.id,
      customer_id: customerId,
      request_type: input.requestType,
      quantity: input.quantity,
      reason: input.reason,
      details: input.details,
      customer_note: input.details,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error("Could not submit request.");

  await (client as any).from("commerce_order_events").insert({
    order_id: order.id,
    event_type:
      input.requestType === "return"
        ? "return_requested"
        : "replacement_requested",
    new_status: order.status,
    message: `${input.requestType === "return" ? "Return" : "Replacement"} requested.`,
    actor_id: customerId,
    actor_role: "customer",
    metadata: { requestId: data.id },
  });

  return mapServiceRequest(data, {
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
  }, { product_name: item.productName });
}

export async function readAdminOrders(query = ""): Promise<OrderDto[]> {
  const client = getClient();
  const normalized = query.trim().toLowerCase();
  const { data } = await (client as any)
    .from("commerce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  const itemsMap = await readOrderItems(
    client,
    rows.map((row: any) => row.id)
  );

  const orders: OrderDto[] = rows.map((row: any) =>
    mapOrder(row, itemsMap.get(row.id) ?? [])
  );

  if (!normalized) return orders;

  return orders.filter((order) =>
    [
      order.id,
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.status,
      order.paymentStatus,
      order.items.map((item) => item.productName).join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export async function updateAdminOrderStatus(input: {
  orderId: string;
  status: Extract<OrderStatus, "booked" | "processing" | "shipped" | "delivered" | "cancelled">;
  adminId: string;
  note?: string;
  trackingNumber?: string;
}) {
  const client = getClient();
  const { error } = await (client as any).rpc("update_commerce_order_status", {
    p_order_id: input.orderId,
    p_status: input.status,
    p_actor_id: input.adminId,
    p_note: input.note || null,
    p_tracking_number: input.trackingNumber || null,
  });

  if (error) throw new Error(error.message || "Could not update order status.");
}

export async function readAdminServiceRequests(
  query = ""
): Promise<ServiceRequestDto[]> {
  const client = getClient();
  const normalized = query.trim().toLowerCase();
  const { data } = await (client as any)
    .from("commerce_service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const requests: ServiceRequestDto[] = await hydrateServiceRequests(
    client,
    data ?? []
  );

  if (!normalized) return requests;

  return requests.filter((request) =>
    [
      request.id,
      request.requestNumber,
      request.orderNumber ?? "",
      request.productName ?? "",
      request.customerName ?? "",
      request.customerEmail ?? "",
      request.requestType,
      request.status,
      request.reason,
      request.details ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export async function updateAdminServiceRequestStatus(input: {
  requestId: string;
  status: ServiceRequestStatus;
  adminId: string;
  adminNote?: string;
}) {
  const client = getClient();
  const { data: current, error: readError } = await (client as any)
    .from("commerce_service_requests")
    .select("id,order_id,status")
    .eq("id", input.requestId)
    .maybeSingle();

  if (readError || !current) throw new Error("Request not found.");

  const { error } = await (client as any)
    .from("commerce_service_requests")
    .update({
      status: input.status,
      admin_note: input.adminNote || null,
      reviewed_by: input.adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.requestId);

  if (error) throw new Error("Could not update request.");

  await (client as any).from("commerce_order_events").insert({
    order_id: current.order_id,
    event_type: "service_request_updated",
    message: `Service request moved from ${current.status} to ${input.status}.`,
    actor_id: input.adminId,
    actor_role: "admin",
    metadata: {
      requestId: input.requestId,
      status: input.status,
    },
  });
}

export async function readAdminCustomers(query = ""): Promise<AdminCustomerDto[]> {
  const client = getClient();
  const { data: profiles } = await (client as any)
    .from("profiles")
    .select("id,email,display_name,created_at")
    .order("created_at", { ascending: false });

  const { data: orders } = await (client as any)
    .from("commerce_orders")
    .select("customer_id,total_cents,created_at");

  const aggregates = new Map<
    string,
    { totalOrders: number; totalSpentCents: number; lastOrderAt: string | null }
  >();

  (orders ?? []).forEach((order: any) => {
    if (!order.customer_id) return;
    const current = aggregates.get(order.customer_id) ?? {
      totalOrders: 0,
      totalSpentCents: 0,
      lastOrderAt: null,
    };
    current.totalOrders += 1;
    current.totalSpentCents += order.total_cents ?? 0;
    current.lastOrderAt =
      !current.lastOrderAt || order.created_at > current.lastOrderAt
        ? order.created_at
        : current.lastOrderAt;
    aggregates.set(order.customer_id, current);
  });

  const customers: AdminCustomerDto[] = (profiles ?? []).map((profile: any) => {
    const aggregate = aggregates.get(profile.id);
    return {
      id: profile.id,
      name: profile.display_name ?? "Customer",
      email: profile.email,
      totalOrders: aggregate?.totalOrders ?? 0,
      totalItems: 0,
      totalSpentCents: aggregate?.totalSpentCents ?? 0,
      lastOrderAt: aggregate?.lastOrderAt ?? null,
    };
  });

  if (!query.trim()) return customers;
  const needle = query.trim().toLowerCase();
  return customers.filter((customer) =>
    [customer.id, customer.name, customer.email, customer.lastOrderAt ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

export async function readAdminReviews(query = ""): Promise<AdminReviewDto[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_product_reviews")
    .select("id,rating,comment,status,updated_at,product_id,customer_id")
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = data ?? [];
  const productIds = [...new Set(rows.map((row: any) => row.product_id))];
  const customerIds = [...new Set(rows.map((row: any) => row.customer_id).filter(Boolean))];

  const [{ data: products }, { data: profiles }] = await Promise.all([
    productIds.length
      ? (client as any).from("catalog_products").select("id,name").in("id", productIds)
      : Promise.resolve({ data: [] }),
    customerIds.length
      ? (client as any).from("profiles").select("id,email,display_name").in("id", customerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map((products ?? []).map((p: any) => [p.id, p.name]));
  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p.display_name ?? p.email])
  );

  const reviews: AdminReviewDto[] = rows.map((row: any) => ({
    id: row.id,
    productName: productMap.get(row.product_id) ?? "Unknown product",
    reviewer: row.customer_id
      ? profileMap.get(row.customer_id) ?? "Customer"
      : "Customer",
    rating: row.rating,
    comment: row.comment,
    status: row.status,
    updatedAt: row.updated_at,
  }));

  if (!query.trim()) return reviews;
  const needle = query.trim().toLowerCase();
  return reviews.filter((review) =>
    [review.id, review.productName, review.reviewer, review.comment, review.status]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

export async function markOrderPaid(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  rawPayload?: Record<string, unknown>;
}) {
  const client = getClient();
  const order = await readOrderById(client, input.orderId);
  if (!order) throw new Error("Order not found.");
  if (order.razorpayOrderId !== input.razorpayOrderId) {
    throw new Error("Payment order mismatch.");
  }
  if (order.paymentStatus === "paid") return order;

  const { error } = await (client as any).rpc("mark_commerce_razorpay_paid", {
    p_order_id: input.orderId,
    p_razorpay_order_id: input.razorpayOrderId,
    p_razorpay_payment_id: input.razorpayPaymentId,
    p_raw_payload: input.rawPayload ?? {},
  });

  if (error) {
    throw new Error(error.message || "Could not mark order as paid.");
  }

  return (await readOrderById(client, input.orderId)) ?? order;
}

export async function markOrderPaidByRazorpayOrderId(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  rawPayload?: Record<string, unknown>;
}) {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_orders")
    .select("id")
    .eq("razorpay_order_id", input.razorpayOrderId)
    .maybeSingle();

  if (!data) throw new Error("Order not found.");

  return markOrderPaid({
    orderId: data.id,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    rawPayload: input.rawPayload,
  });
}

export async function readOrderById(
  client: AnyClient,
  orderId: string
): Promise<OrderDto | null> {
  const { data } = await (client as any)
    .from("commerce_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!data) return null;
  const itemsMap = await readOrderItems(client, [data.id]);
  return mapOrder(data, itemsMap.get(data.id) ?? []);
}

export async function lookupOrderByTracking(input: {
  identifier?: string;
  orderNumber?: string;
  customerPhone: string;
}): Promise<OrderDto | null> {
  const client = getClient();
  const normalized = (input.identifier ?? input.orderNumber ?? "").trim();
  const normalizedPhone = input.customerPhone.trim();

  if (!normalized || !normalizedPhone) return null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let request = (client as any)
    .from("commerce_orders")
    .select("*")
    .limit(1);

  request = uuidRegex.test(normalized)
    ? request.eq("id", normalized)
    : request.eq("order_number", normalized);

  const { data } = await request;
  if (!data || data.length === 0) return null;

  const row = data[0];
  if (phoneDigits(row.customer_phone) !== phoneDigits(normalizedPhone)) {
    return null;
  }

  const itemsMap = await readOrderItems(client, [row.id]);
  return mapOrder(row, itemsMap.get(row.id) ?? []);
}

export async function listActiveCoupons(): Promise<Coupon[]> {
  const client = getClient();
  const { data } = await (client as any)
    .from("commerce_coupons")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row: any) => mapCoupon(row));
}

export async function createCoupon(input: {
  code: string;
  description?: string | null;
  percentOff: number;
  minCents?: number;
  maxDiscountCents?: number | null;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string | null;
}): Promise<Coupon> {
  const client = getClient();
  const { data, error } = await (client as any)
    .from("commerce_coupons")
    .insert({
      code: input.code.toUpperCase(),
      description: input.description ?? null,
      percent_off: input.percentOff,
      min_cents: input.minCents ?? 0,
      max_discount_cents: input.maxDiscountCents ?? null,
      is_active: input.isActive ?? true,
      starts_at: input.startsAt ?? new Date().toISOString(),
      expires_at: input.expiresAt ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error("Could not create coupon.");
  return mapCoupon(data);
}

export async function updateCoupon(
  id: string,
  input: Partial<{
    code: string;
    description: string | null;
    percentOff: number;
    minCents: number;
    maxDiscountCents: number | null;
    isActive: boolean;
    expiresAt: string | null;
  }>
): Promise<Coupon> {
  const client = getClient();
  const patch: Record<string, unknown> = {};

  if (input.code !== undefined) patch.code = input.code.toUpperCase();
  if (input.description !== undefined) patch.description = input.description;
  if (input.percentOff !== undefined) patch.percent_off = input.percentOff;
  if (input.minCents !== undefined) patch.min_cents = input.minCents;
  if (input.maxDiscountCents !== undefined) patch.max_discount_cents = input.maxDiscountCents;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.expiresAt !== undefined) patch.expires_at = input.expiresAt;
  patch.updated_at = new Date().toISOString();

  const { data, error } = await (client as any)
    .from("commerce_coupons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error("Could not update coupon.");
  return mapCoupon(data);
}

export async function deleteCoupon(id: string): Promise<void> {
  const client = getClient();
  const { error } = await (client as any)
    .from("commerce_coupons")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Could not delete coupon.");
}

export async function lookupCouponByCode(code: string): Promise<Coupon | null> {
  const client = getClient();
  const normalized = code.trim().toUpperCase();

  const { data } = await (client as any)
    .from("commerce_coupons")
    .select("*")
    .eq("code", normalized)
    .eq("is_active", true)
    .limit(1);

  if (!data || data.length === 0) return null;

  const row = data[0];
  const now = new Date();
  const startsAt = new Date(row.starts_at);
  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;

  if (now < startsAt) return null;
  if (expiresAt && now > expiresAt) return null;

  return mapCoupon(row);
}

export function calculateCouponDiscount(
  coupon: Coupon,
  subtotalCents: number
): number {
  if (subtotalCents < coupon.minCents) return 0;
  const raw = Math.round((coupon.percentOff / 100) * subtotalCents);
  if (coupon.maxDiscountCents !== null && coupon.maxDiscountCents !== undefined) {
    return Math.min(raw, coupon.maxDiscountCents);
  }
  return raw;
}

export function validateCouponForCart(
  coupon: Coupon | null,
  subtotalCents: number
): CouponValidationResult {
  if (!coupon) {
    return { valid: false, coupon: null, discountCents: 0, error: "Coupon not found." };
  }

  if (!coupon.isActive) {
    return { valid: false, coupon, discountCents: 0, error: "Coupon is not active." };
  }

  const now = new Date();
  if (now < new Date(coupon.startsAt)) {
    return { valid: false, coupon, discountCents: 0, error: "Coupon is not yet valid." };
  }

  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    return { valid: false, coupon, discountCents: 0, error: "Coupon has expired." };
  }

  if (subtotalCents < coupon.minCents) {
    return {
      valid: false,
      coupon,
      discountCents: 0,
      error: `Minimum order amount is ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(coupon.minCents / 100)}.`,
    };
  }

  const discountCents = calculateCouponDiscount(coupon, subtotalCents);
  return { valid: true, coupon, discountCents };
}

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    description: row.description ? String(row.description) : null,
    percentOff: Number(row.percent_off),
    minCents: Number(row.min_cents),
    maxDiscountCents: row.max_discount_cents !== null && row.max_discount_cents !== undefined ? Number(row.max_discount_cents) : null,
    isActive: Boolean(row.is_active),
    startsAt: String(row.starts_at),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createProductReview(input: {
  customerId: string;
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  const client = getClient();
  const { error } = await (client as any)
    .from("commerce_product_reviews")
    .insert({
      customer_id: input.customerId,
      product_id: input.productId,
      order_id: input.orderId,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment,
    });

  if (error) throw new Error(error.message);
}
