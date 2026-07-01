"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActiveCoupons, calculateDiscount } from "@/features/commerce/coupons";
import { TicketPercent, Tag, X } from "lucide-react";
import type { Coupon } from "@/features/commerce/types";

export function CouponSection({ subtotalCents }: { subtotalCents: number }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [applied, setApplied] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveCoupons();
        setCoupons(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setCouponInput(code: string) {
    const el = document.getElementById("coupon-code-input") as HTMLInputElement | null;
    if (el) el.value = code;
  }

  function apply() {
    setError("");
    const coupon = coupons.find((c) => c.code === selectedCode);
    if (!coupon) return;

    if (subtotalCents < coupon.minCents) {
      setError(`Minimum order ₹${(coupon.minCents / 100).toFixed(2)} required.`);
      return;
    }

    const result = calculateDiscount(coupon, subtotalCents);
    if (result.error) {
      setError(result.error);
      return;
    }

    setApplied(selectedCode);
    setSelectedCode("");
    setCouponInput(selectedCode);
  }

  function remove() {
    setApplied("");
    setError("");
    setCouponInput("");
  }

  const appliedCoupon = applied ? coupons.find((c) => c.code === applied) : null;
  const discount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotalCents).discountCents : 0;

  return (
    <div className="mt-5 rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
        <TicketPercent className="h-4 w-4" />
        Coupon
      </div>

      {applied ? (
        <div className="mt-3 flex items-center justify-between rounded-md bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-700" />
            <div>
              <p className="text-sm font-bold text-emerald-900">{applied}</p>
              <p className="text-xs text-emerald-700">
                {appliedCoupon?.percentOff}% off · -₹{(discount / 100).toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={remove}
            className="h-7 w-7 text-emerald-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-xs text-zinc-500">Loading coupons...</p>
          ) : (
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select a coupon" />
              </SelectTrigger>
              <SelectContent>
                {coupons.length === 0 && (
                  <SelectItem value="none" disabled>
                    No coupons available
                  </SelectItem>
                )}
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
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button
            type="button"
            size="sm"
            className="w-full bg-zinc-900 text-white"
            onClick={apply}
            disabled={!selectedCode}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
