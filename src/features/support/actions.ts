"use server";

import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { enforceRateLimit } from "@/server/security/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});

export type ContactState = { success: boolean; message: string };

export async function submitContactAction(
  _state: ContactState,
  formData: FormData
): Promise<ContactState> {
  try {
    await enforceRateLimit("contact:submit", 5, 60 * 15);
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Too many requests." };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, message: "Please complete every field with valid information." };
  }

  const client = createSupabaseServiceRoleClient();
  if (!client) return { success: false, message: "Support is temporarily unavailable." };
  const { error } = await client.from("contact_submissions").insert(parsed.data);
  if (error) return { success: false, message: "Could not send your message. Please try again." };
  return { success: true, message: "Message sent. Our support team will contact you soon." };
}
