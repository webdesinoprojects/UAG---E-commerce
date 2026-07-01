/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import type { CustomerSession } from "@/server/auth/customer";
import type { CartSummary } from "@/features/cart/types";
import type { CheckoutInput } from "@/server/validators/commerce";
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
  totalCents: number;
  currency: string;
  razorpayOrderId: string | null;
  createdAt: string;
  shippingAddress: OrderShippingAddressDto | null;
  items: OrderItemDto[];
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

async function decrementStockForItems(client: AnyClient, items: OrderItemDto[]) {
  for (const item of items) {
    if (!item.productId) continue;
    const { error } = await (client as any).rpc("decrement_catalog_product_stock", {
      product_id: item.productId,
      quantity: item.quantity,
    });
    if (error) throw new Error(`Insufficient stock for ${item.productName}.`);
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
    totalCents: row.total_cents,
    currency: row.currency,
    razorpayOrderId: row.razorpay_order_id,
    createdAt: row.created_at,
    shippingAddress,
    items,
  };
}

export async function createCheckoutOrder(input: {
  customer: CustomerSession | null;
  cart: CartSummary;
  checkout: CheckoutInput & { email?: string } & { couponCode?: string | null };
}) {
  ensureCheckoutCart(input.cart);
  const client = getClient();
  const shippingCents = 0;

  let discountCents = 0;
  let couponCode: string | null = null;

  if (input.checkout.couponCode) {
    const coupon = await lookupCouponByCode(input.checkout.couponCode);
    if (coupon) {
      discountCents = calculateCouponDiscount(coupon, input.cart.subtotalCents);
      couponCode = coupon.code;
    }
  }

  const totalCents = Math.max(input.cart.subtotalCents + shippingCents - discountCents, 0);
  const isCod = input.checkout.paymentMethod === "cod";

  const customerEmail = input.customer?.email
    ? input.customer.email
    : (input.checkout.email?.trim() || `guest-${Date.now()}@uag.store`);

  const { data: order, error: orderError } = await (client as any)
    .from("commerce_orders")
    .insert({
      customer_id: input.customer?.id ?? null,
      customer_email: customerEmail,
      customer_name: input.checkout.fullName,
      customer_phone: input.checkout.phone,
      shipping_address: addressJson(input.checkout),
      status: isCod ? "booked" : "pending_payment",
      payment_status: isCod ? "cod" : "pending",
      payment_method: input.checkout.paymentMethod,
      subtotal_cents: input.cart.subtotalCents,
      shipping_cents: shippingCents,
      discount_cents: discountCents,
      total_cents: totalCents,
      currency: input.cart.currency,
      coupon_code: couponCode,
      notes: input.checkout.notes || null,
    })
    .select("*")
    .single();

  if (orderError || !order) throw new Error("Could not create order.");

  const itemRows = input.cart.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_slug: item.slug,
    image_url: item.image,
    unit_price_cents: item.priceCents,
    quantity: item.quantity,
    line_total_cents: item.lineTotalCents,
    currency: item.currency,
  }));

  const { error: itemError } = await (client as any)
    .from("commerce_order_items")
    .insert(itemRows);

  if (itemError) throw new Error("Could not save order items.");

  const items = itemRows.map((row, index) => ({
    id: `${order.id}-${index}`,
    productId: row.product_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    imageUrl: row.image_url,
    sku: null,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    lineTotalCents: row.line_total_cents,
    currency: row.currency,
  }));

  if (isCod) {
    await decrementStockForItems(client, items);
    await (client as any).from("commerce_payments").insert({
      order_id: order.id,
      provider: "cod",
      status: "cod",
      amount_cents: totalCents,
      currency: input.cart.currency,
    });
    return { orderId: order.id, paymentMethod: "cod" as const };
  }

  const razorpayOrder = await createRazorpayOrder({
    amountCents: totalCents,
    currency: input.cart.currency,
    receipt: order.order_number,
    notes: { orderId: order.id, orderNumber: order.order_number },
  });

  await (client as any)
    .from("commerce_orders")
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq("id", order.id);

  await (client as any).from("commerce_payments").insert({
    order_id: order.id,
    provider: "razorpay",
    provider_order_id: razorpayOrder.id,
    status: "pending",
    amount_cents: totalCents,
    currency: input.cart.currency,
  });

  return { orderId: order.id, paymentMethod: "razorpay" as const };
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

export async function readAdminOrders(query = ""): Promise<OrderDto[]> {
  const client = getClient();
  const normalized = query.trim();
  let request = (client as any)
    .from("commerce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (normalized) {
    request = request.or(
      `order_number.ilike.%${normalized}%,customer_email.ilike.%${normalized}%,customer_name.ilike.%${normalized}%,status.ilike.%${normalized}%`
    );
  }

  const { data } = await request;
  const rows = data ?? [];
  const itemsMap = await readOrderItems(
    client,
    rows.map((row: any) => row.id)
  );

  return rows.map((row: any) => mapOrder(row, itemsMap.get(row.id) ?? []));
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

  await decrementStockForItems(client, order.items);
  await (client as any)
    .from("commerce_orders")
    .update({ status: "booked", payment_status: "paid" })
    .eq("id", input.orderId);

  await (client as any)
    .from("commerce_payments")
    .update({
      provider_payment_id: input.razorpayPaymentId,
      status: "paid",
      raw_payload: input.rawPayload ?? {},
    })
    .eq("order_id", input.orderId)
    .eq("provider", "razorpay");

  return order;
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
  orderNumber: string;
  customerPhone?: string;
}): Promise<OrderDto | null> {
  const client = getClient();
  const normalized = input.orderNumber.trim();

  const request = (client as any)
    .from("commerce_orders")
    .select("*")
    .eq("order_number", normalized)
    .limit(1);

  const { data } = await request;
  if (!data || data.length === 0) return null;

  const row = data[0];
  if (input.customerPhone) {
    const normalizedPhone = input.customerPhone.trim();
    if (row.customer_phone !== normalizedPhone) return null;
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
