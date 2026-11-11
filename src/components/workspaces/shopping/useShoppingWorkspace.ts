import { useCallback, useMemo, useState } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorToast } from '@/context/VendorNotificationContext';
import {
  getLowStockProducts,
  hasChildCategories,
  slugifyCategory,
  wouldCreateCategoryCycle,
  type ShopOrderStage,
  type ShoppingCategoryNode,
  type ShoppingOrder,
  type ShoppingProduct,
} from './shoppingService';

const INITIAL_CATEGORIES: ShoppingCategoryNode[] = [
  { id: 'cat-crafts', name: 'GI Crafts & Toys', slug: 'gi-crafts-toys', parentId: null, active: true },
  { id: 'cat-eti', name: 'Etikoppaka Lacquer', slug: 'etikoppaka-lacquer', parentId: 'cat-crafts', active: true },
  { id: 'cat-silk', name: 'Mangalagiri & Kalamkari', slug: 'mangalagiri-kalamkari', parentId: null, active: true },
  { id: 'cat-araku', name: 'Araku Coffee & Honey', slug: 'araku-coffee-honey', parentId: null, active: true },
];

const INITIAL_PRODUCTS: ShoppingProduct[] = [
  {
    id: 'sku-1',
    sku: 'AY-ETI-101',
    name: 'Etikoppaka Lacquer Toy Chess Set',
    category: 'GI Crafts & Toys',
    price: 1250,
    compareAtPrice: 1599,
    stock: 14,
    lowStockThreshold: 5,
    weightGrams: 650,
    isActive: true,
    description: 'Hand-turned ankudu wood glazed with organic vegetable dyes.',
  },
  {
    id: 'sku-2',
    sku: 'AY-ARA-204',
    name: 'Araku Valley Shade-Grown Arabica (500g)',
    category: 'Araku Coffee & Honey',
    price: 540,
    compareAtPrice: 650,
    stock: 3,
    lowStockThreshold: 8,
    weightGrams: 500,
    isActive: true,
    description: 'Medium-dark roast single-estate tribal Arabica from Paderu.',
  },
  {
    id: 'sku-3',
    sku: 'AY-MAN-312',
    name: 'Mangalagiri Pure Cotton Handloom Stole',
    category: 'Mangalagiri & Kalamkari',
    price: 890,
    stock: 22,
    lowStockThreshold: 6,
    weightGrams: 220,
    isActive: true,
    description: 'Authentic zari nizam border handwoven in Guntur district.',
  },
];

const INITIAL_ORDERS: ShoppingOrder[] = [
  {
    id: 'shop-1',
    orderNumber: 'AYS-4410',
    customerName: 'Niharika Verma',
    city: 'Hyderabad',
    status: 'pending',
    items: [{ sku: 'AY-ETI-101', name: 'Etikoppaka Lacquer Toy Chess Set', qty: 1, price: 1250 }],
    totalAmount: 1250,
    createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
  },
  {
    id: 'shop-2',
    orderNumber: 'AYS-4409',
    customerName: 'Raghavendra Babu',
    city: 'Vijayawada',
    status: 'packed',
    items: [{ sku: 'AY-ARA-204', name: 'Araku Valley Shade-Grown Arabica (500g)', qty: 2, price: 540 }],
    totalAmount: 1080,
    createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  },
];

export function useShoppingWorkspace() {
  const { vendor, logout } = useVendorAuth();
  const { showToast } = useVendorToast();

  const [storeOpen, setStoreOpen] = useState(true);
  const [products, setProducts] = useState<ShoppingProduct[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ShoppingCategoryNode[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<ShoppingOrder[]>(INITIAL_ORDERS);

  const lowStockProducts = useMemo(() => getLowStockProducts(products), [products]);

  const metrics = useMemo(() => {
    const gmv = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
    return {
      gmv,
      activeOrders,
      totalSkus: products.length,
      lowStockCount: lowStockProducts.length,
    };
  }, [orders, products, lowStockProducts]);

  const saveProduct = useCallback(
    (payload: Omit<ShoppingProduct, 'id'>, editingId?: string) => {
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...payload, id: editingId } : p)));
        showToast('SKU updated successfully.', 'success');
      } else {
        setProducts((prev) => [{ ...payload, id: `sku-${Date.now()}` }, ...prev]);
        showToast('New SKU added to store catalog.', 'success');
      }
    },
    [showToast],
  );

  const duplicateProduct = useCallback(
    (item: ShoppingProduct) => {
      setProducts((prev) => [
        {
          ...item,
          id: `sku-${Date.now()}`,
          sku: `${item.sku}-COPY`,
          name: `${item.name} (Copy)`,
        },
        ...prev,
      ]);
      showToast(`Duplicated "${item.name}".`, 'info');
    },
    [showToast],
  );

  const toggleProductActive = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  }, []);

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('SKU removed from catalog.', 'info');
    },
    [showToast],
  );

  const addCategory = useCallback(
    (name: string, parentId: string | null) => {
      const slug = slugifyCategory(name);
      if (!slug) return;
      const newCat: ShoppingCategoryNode = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug,
        parentId: parentId || null,
        active: true,
      };
      if (wouldCreateCategoryCycle([...categories, newCat], newCat.id, parentId)) {
        showToast('Invalid parent category selection (cycle detected).', 'error');
        return;
      }
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${name}" created.`, 'success');
    },
    [categories, showToast],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      if (hasChildCategories(categories, id)) {
        showToast('Remove child subcategories before deleting a parent category.', 'warning');
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category deleted.', 'info');
    },
    [categories, showToast],
  );

  const updateOrderStage = useCallback(
    (orderId: string, nextStatus: ShopOrderStage, tracking?: { courier: string; trackingId: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                trackingCourier: tracking?.courier || o.trackingCourier,
                trackingId: tracking?.trackingId || o.trackingId,
              }
            : o,
        ),
      );
      showToast(`Order ${orderId} updated to ${nextStatus.toUpperCase()}`, 'success');
    },
    [showToast],
  );

  const simulateOrder = useCallback(() => {
    const newOrder: ShoppingOrder = {
      id: `shop-${Date.now()}`,
      orderNumber: `AYS-${Math.floor(4500 + Math.random() * 499)}`,
      customerName: 'Madhuri Devi',
      city: 'Tirupati',
      status: 'pending',
      items: [{ sku: 'AY-MAN-312', name: 'Mangalagiri Pure Cotton Handloom Stole', qty: 2, price: 890 }],
      totalAmount: 1780,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`New retail order ${newOrder.orderNumber} arrived!`, 'info');
  }, [showToast]);

  return {
    vendor,
    logout,
    storeOpen,
    setStoreOpen,
    products,
    categories,
    orders,
    lowStockProducts,
    metrics,
    saveProduct,
    duplicateProduct,
    toggleProductActive,
    deleteProduct,
    addCategory,
    deleteCategory,
    updateOrderStage,
    simulateOrder,
  };
}

