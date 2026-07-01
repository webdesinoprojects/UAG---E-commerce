import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { getCurrentAdmin } from "@/server/auth/admin";
import { z } from "zod";

const client = createSupabaseServiceRoleClient();

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters.")
    .max(30, "Code must be at most 30 characters.")
    .regex(/^[A-Z0-9]+$/, "Use uppercase letters and numbers only."),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  percentOff: z.coerce.number().min(0).max(100),
  minCents: z.coerce.number().min(0).optional().default(0),
  maxDiscountCents: z.coerce.number().min(0).optional().nullable(),
  isActive: z.coerce.boolean().optional().default(true),
  startsAt: z.string().datetime().optional().default(() => new Date().toISOString()),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const admin = url.searchParams.get("admin") === "1";

  if (!client) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  if (admin) {
    const adminUser = await getCurrentAdmin();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
      .from("commerce_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupons: data ?? [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from("commerce_coupons")
    .select("*")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from("commerce_coupons")
    .insert({
      code: parsed.data.code.toUpperCase(),
      description: parsed.data.description || null,
      percent_off: parsed.data.percentOff,
      min_cents: parsed.data.minCents ?? 0,
      max_discount_cents: parsed.data.maxDiscountCents,
      is_active: parsed.data.isActive,
      starts_at: parsed.data.startsAt,
      expires_at: parsed.data.expiresAt,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const patchSchema = z.object({
    id: z.string().uuid(),
    code: z.string().trim().min(2).max(30).regex(/^[A-Z0-9]+$/).optional(),
    description: z.string().trim().max(240).optional().or(z.literal("")).nullable(),
    percentOff: z.coerce.number().min(0).max(100).optional(),
    minCents: z.coerce.number().min(0).optional(),
    maxDiscountCents: z.coerce.number().min(0).optional().nullable(),
    isActive: z.coerce.boolean().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
  });

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { id, ...rest } = parsed.data;
  const patch: Record<string, unknown> = {};
  if (rest.code !== undefined) patch.code = rest.code.toUpperCase();
  if (rest.description !== undefined) patch.description = rest.description || null;
  if (rest.percentOff !== undefined) patch.percent_off = rest.percentOff;
  if (rest.minCents !== undefined) patch.min_cents = rest.minCents;
  if (rest.maxDiscountCents !== undefined) patch.max_discount_cents = rest.maxDiscountCents;
  if (rest.isActive !== undefined) patch.is_active = rest.isActive;
  if (rest.expiresAt !== undefined) patch.expires_at = rest.expiresAt;
  patch.updated_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client as any)
    .from("commerce_coupons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}

export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const deleteSchema = z.object({ id: z.string().uuid() });
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon id." }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any)
    .from("commerce_coupons")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
