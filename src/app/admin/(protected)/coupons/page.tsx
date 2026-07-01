"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, TicketPercent } from "lucide-react";
import type { Coupon } from "@/features/commerce/types";
import { getAdminCoupons, createCoupon, updateCoupon, deleteCouponApi } from "@/features/commerce/coupons";

function CouponForm({
  coupon,
  onClose,
}: {
  coupon?: Coupon | null;
  onClose: () => void;
}) {
  const isEdit = !!coupon;

  const [code, setCode] = useState(coupon?.code ?? "");
  const [description, setDescription] = useState(coupon?.description ?? "");
  const [percentOff, setPercentOff] = useState(coupon?.percentOff ?? 10);
  const [minCents, setMinCents] = useState(coupon?.minCents ?? 0);
  const [maxDiscountCents, setMaxDiscountCents] = useState(
    coupon?.maxDiscountCents ?? ""
  );
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [expiresAt, setExpiresAt] = useState(
    coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : ""
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        code,
        description: description || null,
        percentOff,
        minCents,
        maxDiscountCents: maxDiscountCents === "" ? null : Number(maxDiscountCents),
        isActive,
        expiresAt: expiresAt || null,
      };

      setSaving(true);
      if (isEdit && coupon) {
        await updateCoupon(coupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            required
          />
        </div>
        <div>
          <Label htmlFor="percentOff">Discount %</Label>
          <Input
            id="percentOff"
            type="number"
            min="0"
            max="100"
            value={percentOff}
            onChange={(e) => setPercentOff(Number(e.target.value))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Flat 20% off on all products"
          rows={2}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="minCents">Minimum cart value (₹)</Label>
          <Input
            id="minCents"
            type="number"
            min="0"
            value={minCents}
            onChange={(e) => setMinCents(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="maxDiscountCents">Max discount (₹, optional)</Label>
          <Input
            id="maxDiscountCents"
            type="number"
            min="0"
            value={maxDiscountCents}
            onChange={(e) => setMaxDiscountCents(e.target.value)}
            placeholder="No cap"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="expiresAt">Expiry Date</Label>
          <Input
            id="expiresAt"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <span className="text-sm text-zinc-600">Active</span>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {isEdit ? "Update" : "Create"} Coupon
        </Button>
      </div>
    </form>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const data = await getAdminCoupons();
        if (!cancelled) setCoupons(data);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setRemovingId(id);
    try {
      await deleteCouponApi(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // handle error
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Coupons</h1>
          <p className="text-sm text-zinc-500">Manage discount codes for customers.</p>
        </div>
        <Dialog open={open && !editing} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-900 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
            </DialogHeader>
            <CouponForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-sm text-zinc-500">Loading coupons...</p>}

      {!loading && coupons.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center">
          <TicketPercent className="mx-auto h-10 w-10 text-zinc-400" />
          <p className="mt-3 text-sm text-zinc-500">No coupons yet. Create one to get started.</p>
        </div>
      )}

      {coupons.length > 0 && (
        <div className="rounded-lg border border-zinc-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min cart</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                  <TableCell>{coupon.percentOff}% off</TableCell>
                  <TableCell>₹{(coupon.minCents / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        coupon.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : "No expiry"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(coupon);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                        disabled={removingId === coupon.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <CouponForm coupon={editing} onClose={() => setEditing(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
