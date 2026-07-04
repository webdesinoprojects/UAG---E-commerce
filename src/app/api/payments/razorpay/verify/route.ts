import { NextRequest, NextResponse } from "next/server";
import { CART_COOKIE_NAME } from "@/lib/cart-cookies";
import {
  CHECKOUT_ORDER_ACCESS_COOKIE,
  getCheckoutOrderAccessCookieOptions,
} from "@/lib/checkout-order-cookies";
import { markOrderPaid } from "@/server/repositories/commerce-repository";
import { verifyRazorpayPaymentSignature } from "@/server/payments/razorpay";
import { razorpayVerifySchema } from "@/server/validators/commerce";

export async function POST(request: NextRequest) {
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
      parsed.data.orderId,
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
