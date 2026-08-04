import { NextRequest, NextResponse } from "next/server";
import { CART_COOKIE_NAME } from "@/lib/cart-cookies";
import {
  CHECKOUT_ORDER_ACCESS_COOKIE,
  getCheckoutOrderAccessCookieOptions,
} from "@/lib/checkout-order-cookies";
import { markOrderPaid } from "@/server/repositories/commerce-repository";
import { verifyRazorpayPaymentSignature } from "@/server/payments/razorpay";
import { razorpayVerifySchema } from "@/server/validators/commerce";
import { createGuestOrderAccessToken } from "@/server/security/guest-order-access";
import { enforceRateLimit } from "@/server/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    await enforceRateLimit("payment:verify", 20, 60 * 10);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = razorpayVerifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });
  }

  const isValid = verifyRazorpayPaymentSignature({
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  try {
    const paidOrder = await markOrderPaid({
      orderId: parsed.data.orderId,
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      rawPayload: parsed.data,
    });

    const redirectTo = paidOrder.customerId
      ? `/account/orders?paid=${parsed.data.orderId}`
      : `/checkout/confirmation/${parsed.data.orderId}`;

    const response = NextResponse.json({
      ok: true,
      redirectTo,
    });
    response.cookies.set(
      CHECKOUT_ORDER_ACCESS_COOKIE,
      createGuestOrderAccessToken(parsed.data.orderId, 60 * 60 * 24),
      getCheckoutOrderAccessCookieOptions()
    );
    response.cookies.delete(CART_COOKIE_NAME);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment was verified but order update failed.",
      },
      { status: 500 }
    );
  }
}
