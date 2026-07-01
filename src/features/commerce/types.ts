export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  percentOff: number;
  minCents: number;
  maxDiscountCents: number | null;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon | null;
  discountCents: number;
  error?: string;
}
