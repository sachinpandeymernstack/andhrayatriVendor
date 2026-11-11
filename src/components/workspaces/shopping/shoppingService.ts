export interface ShoppingCategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  active: boolean;
}

export interface ShoppingProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weightGrams?: number;
  isActive: boolean;
  description?: string;
}

export type ShopOrderStage = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface ShoppingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  status: ShopOrderStage;
  items: Array<{ sku: string; name: string; qty: number; price: number }>;
  totalAmount: number;
  trackingCourier?: string;
  trackingId?: string;
  createdAt: string;
}

export function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function wouldCreateCategoryCycle(
  categories: ShoppingCategoryNode[],
  targetId: string,
  proposedParentId: string | null,
): boolean {
  if (!proposedParentId) return false;
  if (proposedParentId === targetId) return true;

  let cursor: string | null = proposedParentId;
  const visited = new Set<string>([targetId]);
  while (cursor) {
    if (visited.has(cursor)) return true;
    visited.add(cursor);
    const parent = categories.find((c) => c.id === cursor);
    cursor = parent?.parentId || null;
  }
  return false;
}

export function hasChildCategories(categories: ShoppingCategoryNode[], categoryId: string): boolean {
  return categories.some((c) => c.parentId === categoryId);
}

export function computeDiscountPercent(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price || compareAtPrice <= 0) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

export function getLowStockProducts(products: ShoppingProduct[]): ShoppingProduct[] {
  return products.filter((p) => p.stock <= p.lowStockThreshold);
}

