"use server";

import "server-only";

import { z } from "zod";
import { lookupOrderByTracking, readOrderById } from "@/server/repositories/commerce-repository";
import type { OrderDto } from "@/server/repositories/commerce-repository";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const trackOrderSchema = z.object({
  identifier: z.string().min(1, "Order number or ID is required."),
  phone: z.string().trim().min(7, "Phone number is required.").max(20),
});

export interface TrackOrderState {
  order: OrderDto | null;
  notFound: boolean;
  fieldErrors?: {
    identifier?: string[];
    phone?: string[];
  };
  message?: string;
}

function isUuid(value: string): boolean {
  return uuidRegex.test(value.trim());
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "") || value.trim();
}

export async function trackOrderAction(
  _previousState: TrackOrderState,
  formData: FormData
): Promise<TrackOrderState> {
  const identifier = formData.get("identifier");
  const phone = formData.get("phone");

  const parsed = trackOrderSchema.safeParse({ identifier, phone });

  if (!parsed.success) {
    return {
      order: null,
      notFound: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    let order: OrderDto | null = null;
    const normalizedId = parsed.data.identifier.trim();

    if (isUuid(normalizedId)) {
      const client = createSupabaseServiceRoleClient();
      if (client) {
        order = await readOrderById(client, normalizedId);
      }
    } else {
      order = await lookupOrderByTracking({
        identifier: normalizedId,
        customerPhone: parsed.data.phone,
      });
    }

    if (
      order &&
      phoneDigits(order.customerPhone) !== phoneDigits(parsed.data.phone)
    ) {
      order = null;
    }

    return {
      order,
      notFound: !order,
    };
  } catch {
    return {
      order: null,
      notFound: true,
      message: "Unable to look up your order. Please try again.",
    };
  }
}
