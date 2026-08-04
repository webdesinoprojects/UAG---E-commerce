"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactAction } from "@/features/support/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, { success: false, message: "" });
  return (
    <form action={action} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="text-sm font-semibold" htmlFor="name">Name</label><Input required id="name" name="name" className="mt-2" placeholder="Your name" /></div>
        <div><label className="text-sm font-semibold" htmlFor="email">Email</label><Input required id="email" name="email" type="email" className="mt-2" placeholder="you@example.com" /></div>
      </div>
      <div className="mt-4"><label className="text-sm font-semibold" htmlFor="subject">Subject</label><Input required id="subject" name="subject" className="mt-2" placeholder="How can we help?" /></div>
      <div className="mt-4"><label className="text-sm font-semibold" htmlFor="message">Message</label><Textarea required minLength={10} id="message" name="message" className="mt-2 min-h-36" placeholder="Share the details..." /></div>
      {state.message ? <p className={`mt-4 text-sm ${state.success ? "text-emerald-600" : "text-red-600"}`} role="status">{state.message}</p> : null}
      <Button type="submit" disabled={pending} className="mt-6"><Send className="h-4 w-4" aria-hidden="true" />{pending ? "Sending..." : "Send Message"}</Button>
    </form>
  );
}
