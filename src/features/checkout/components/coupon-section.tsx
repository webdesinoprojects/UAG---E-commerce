"use client";

import { useState } from "react";
import { Tag, TicketPercent, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateDiscount } from "@/features/commerce/coupons";
import type { Coupon } from "@/features/commerce/types";

export function CouponSection({
  subtotalCents,
  coupons,
  appliedCode,
  onApply,
}: {
  subtotalCents: number;
  coupons: Coupon[];
  appliedCode: string;
  onApply: (code: string) => void;
}) {
  const [selectedCode, setSelectedCode] = useState("");
  const [error, setError] = useState("");
  const appliedCoupon = appliedCode
    ? coupons.find((coupon) => coupon.code === appliedCode)
    : null;
  const discount = appliedCoupon
    ? calculateDiscount(appliedCoupon, subtotalCents).discountCents
    : 0;

  function apply() {
    setError("");
    const coupon = coupons.find((item) => item.code === selectedCode);

    if (!coupon) return;

    const result = calculateDiscount(coupon, subtotalCents);
    if (result.error) {
      setError(result.error);
      return;
    }

    onApply(selectedCode);
    setSelectedCode("");
  }

  function remove() {
    onApply("");
    setSelectedCode("");
    setError("");
  }

  return (
    <div className="mt-5 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <TicketPercent className="h-4 w-4" />
        Coupon
      </div>

      {appliedCode ? (
        <div className="mt-3 flex items-center justify-between rounded-md bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {appliedCode}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {appliedCoupon?.percentOff}% off - Rs. {(discount / 100).toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={remove}
            className="h-7 w-7 text-emerald-900 dark:text-emerald-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <Select value={selectedCode} onValueChange={setSelectedCode}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select a coupon" />
            </SelectTrigger>
            <SelectContent>
              {coupons.length === 0 ? (
                <SelectItem value="none" disabled>
                  No coupons available
                </SelectItem>
              ) : null}
              {coupons.map((coupon) => (
                <SelectItem key={coupon.id} value={coupon.code}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{coupon.code}</span>
                    <span className="text-xs text-zinc-500">
                      {coupon.percentOff}% off
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <Button
            type="button"
            size="sm"
            className="w-full bg-zinc-900 text-white"
            onClick={apply}
            disabled={!selectedCode || selectedCode === "none"}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
