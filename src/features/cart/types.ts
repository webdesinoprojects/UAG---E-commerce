export interface CartCookieItem {
  productId: string;
  quantity: number;
}

export interface CartLineItem {
  productId: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  stockQuantity: number;
  quantity: number;
  lineTotalCents: number;
}

export interface CartSummary {
  items: CartLineItem[];
  itemCount: number;
  subtotalCents: number;
  currency: string;
}
