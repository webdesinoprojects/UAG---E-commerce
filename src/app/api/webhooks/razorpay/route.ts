import { NextRequest, NextResponse } from "next/server";
import { markOrderPaidByRazorpayOrderId } from "@/server/repositories/commerce-repository";
import { verifyRazorpayWebhookSignature } from "@/server/payments/razorpay";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature({ body, signature })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
        };
      };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;

  if (
    event.event === "payment.captured" &&
    payment?.order_id &&
    payment.id
  ) {
    await markOrderPaidByRazorpayOrderId({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      rawPayload: event as Record<string, unknown>,
    });
  }

  return NextResponse.json({ ok: true });
}
