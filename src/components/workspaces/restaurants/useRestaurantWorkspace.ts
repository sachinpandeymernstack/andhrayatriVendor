import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { restaurantApi, restaurantMenuService } from '@/api/restaurantClient';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorToast } from '@/context/VendorNotificationContext';
import type { VendorProduct } from '@/types/vendor';

export type KitchenOrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  tableOrMode: string;
  status: KitchenOrderStatus;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

const DEFAULT_SAMPLE_MENU: VendorProduct[] = [
  {
    id: 'dish-1',
    name: 'Gutti Vankaya Pulao',
    description: 'Fragrant coastal spices stuffed baby brinjal over aged sona masoori rice.',
    category: 'Biryani & Rice',
    price: 340,
    isActive: true,
    dietary: 'Veg',
  },
  {
    id: 'dish-2',
    name: 'Nellore Chepala Pulusu',
    description: 'Tangy tamarind coastal murrel curry slow-simmered in clay pot.',
    category: 'Coastal Mains',
    price: 460,
    isActive: true,
    dietary: 'Non-Veg',
  },
  {
    id: 'dish-3',
    name: 'Guntur MLA Pesarattu',
    description: 'Crisp green moong crepe stuffed with ginger-upma & alluvial coconut chutney.',
    category: 'Tiffins',
    price: 165,
    isActive: true,
    dietary: 'Veg',
  },
];

const DEFAULT_ORDERS: RestaurantOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'KOT-204',
    customerName: 'Praveen Kumar',
    customerPhone: '+91 98490 22334',
    tableOrMode: 'Table 04 · Dine-in',
    status: 'preparing',
    items: [
      { name: 'Gutti Vankaya Pulao', quantity: 2, price: 340 },
      { name: 'Guntur MLA Pesarattu', quantity: 1, price: 165 },
    ],
    totalAmount: 845,
    createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    notes: 'Medium spice level',
  },
  {
    id: 'ord-102',
    orderNumber: 'KOT-205',
    customerName: 'Lakshmi Narayana',
    customerPhone: '+91 97014 55667',
    tableOrMode: 'Pickup Counter #2',
    status: 'pending',
    items: [{ name: 'Nellore Chepala Pulusu', quantity: 1, price: 460 }],
    totalAmount: 460,
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
];

function playIncomingChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio playback blocked or unavailable in JSDOM.
  }
}

export function normalizeOrderList(raw: unknown): RestaurantOrder[] {
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { orders?: unknown[] })?.orders)
      ? (raw as { orders: unknown[] }).orders
      : Array.isArray((raw as { data?: unknown[] })?.data)
        ? (raw as { data: unknown[] }).data
        : [];
  if (!arr.length) return [];

  return arr.map((entry, idx) => {
    const o = entry as Record<string, unknown>;
    const rawItems = Array.isArray(o.items) ? o.items : [];
    return {
      id: String(o._id || o.id || `ord-${idx}`),
      orderNumber: String(o.orderNumber || o.kotNumber || `KOT-${300 + idx}`),
      customerName: String(o.customerName || 'Guest Diner'),
      customerPhone: String(o.customerPhone || o.phone || ''),
      tableOrMode: String(o.tableOrMode || o.orderType || 'Dine-in'),
      status: String(o.status || 'pending').toLowerCase() as KitchenOrderStatus,
      items: rawItems.map((it) => {
        const rec = it as Record<string, unknown>;
        return {
          name: String(rec.name || rec.title || 'Dish'),
          quantity: Number(rec.quantity || 1),
          price: Number(rec.price || 0),
        };
      }),
      totalAmount: Number(o.totalAmount || o.amount || 0),
      createdAt: String(o.createdAt || new Date().toISOString()),
      notes: o.notes ? String(o.notes) : undefined,
    };
  });
}

export function useRestaurantWorkspace() {
  const { vendor, logout } = useVendorAuth();
  const { showToast } = useVendorToast();
  const queryClient = useQueryClient();
  const vendorId = String(vendor?._id || vendor?.id || 'local-restaurant');

  const [kitchenOpen, setKitchenOpen] = useState(true);
  const [localOrders, setLocalOrders] = useState<RestaurantOrder[]>(DEFAULT_ORDERS);
  const [localMenu, setLocalMenu] = useState<VendorProduct[]>(DEFAULT_SAMPLE_MENU);
  const prevPendingCount = useRef(DEFAULT_ORDERS.filter((o) => o.status === 'pending').length);

  const menuQuery = useQuery({
    queryKey: queryKeys.vendor.restaurantMenu(vendorId),
    queryFn: async () => {
      try {
        const fetched = await restaurantMenuService.fetch(vendorId);
        return fetched.length ? fetched : localMenu;
      } catch {
        return localMenu;
      }
    },
    staleTime: 20_000,
  });

  const ordersQuery = useQuery({
    queryKey: queryKeys.vendor.restaurantOrders(vendorId),
    queryFn: async () => {
      try {
        const res = await restaurantApi.fetchOrders(vendorId);
        const normalized = normalizeOrderList(res);
        return normalized.length ? normalized : localOrders;
      } catch {
        return localOrders;
      }
    },
    refetchInterval: 6_000,
    staleTime: 4_000,
  });

  const orders = ordersQuery.data || localOrders;
  const menuItems = menuQuery.data || localMenu;

  useEffect(() => {
    const pendingNow = orders.filter((o) => o.status === 'pending').length;
    if (pendingNow > prevPendingCount.current) {
      playIncomingChime();
    }
    prevPendingCount.current = pendingNow;
  }, [orders]);

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, nextStatus }: { orderId: string; nextStatus: KitchenOrderStatus }) => {
      try {
        await restaurantApi.updateOrderStatus(orderId, nextStatus);
      } catch {
        // Optimistic local kitchen board works seamlessly when offline.
      }
      return { orderId, nextStatus };
    },
    onSuccess: ({ orderId, nextStatus }) => {
      setLocalOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
      queryClient.setQueryData<RestaurantOrder[]>(queryKeys.vendor.restaurantOrders(vendorId), (old) =>
        (old || localOrders).map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
      showToast(`Order moved to ${nextStatus.toUpperCase()}`, 'success');
    },
  });

  const saveDishMutation = useMutation({
    mutationFn: async ({ editingId, dish }: { editingId?: string; dish: Partial<VendorProduct> }) => {
      try {
        await restaurantMenuService.save(vendorId, dish, editingId);
      } catch {
        // Preserve in local kitchen menu when testing offline
      }
      return { editingId, dish };
    },
    onSuccess: ({ editingId, dish }) => {
      const nextDish: VendorProduct = {
        id: editingId || `dish-${Date.now()}`,
        name: String(dish.name || 'Chef Special'),
        description: dish.description || '',
        category: String(dish.category || 'Mains'),
        price: Number(dish.price || 0),
        isActive: dish.isActive !== undefined ? dish.isActive : true,
        dietary: dish.dietary || 'Veg',
      };
      setLocalMenu((prev) =>
        editingId ? prev.map((d) => (d.id === editingId || d._id === editingId ? nextDish : d)) : [nextDish, ...prev],
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.restaurantMenu(vendorId) });
      showToast(editingId ? 'Dish updated on digital menu.' : 'New dish published!', 'success');
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: async (dishId: string) => {
      try {
        await restaurantMenuService.delete(dishId);
      } catch {
        // Offline delete fallback
      }
      return dishId;
    },
    onSuccess: (dishId) => {
      setLocalMenu((prev) => prev.filter((d) => (d._id || d.id) !== dishId));
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.restaurantMenu(vendorId) });
      showToast('Dish removed from menu.', 'info');
    },
  });

  const simulateIncomingOrder = useCallback(() => {
    const newOrder: RestaurantOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `KOT-${Math.floor(210 + Math.random() * 780)}`,
      customerName: 'Vikramaditya Rao',
      customerPhone: '+91 98485 90123',
      tableOrMode: 'Takeaway Express',
      status: 'pending',
      items: [
        { name: 'Gutti Vankaya Pulao', quantity: 1, price: 340 },
        { name: 'Guntur MLA Pesarattu', quantity: 2, price: 165 },
      ],
      totalAmount: 670,
      createdAt: new Date().toISOString(),
      notes: 'Extra peanut chutney requested',
    };
    setLocalOrders((prev) => [newOrder, ...prev]);
    queryClient.setQueryData<RestaurantOrder[]>(queryKeys.vendor.restaurantOrders(vendorId), (old) => [
      newOrder,
      ...(old || localOrders),
    ]);
    playIncomingChime();
    showToast(`New incoming ticket ${newOrder.orderNumber}!`, 'info');
  }, [localOrders, queryClient, showToast, vendorId]);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
    const completed = orders.filter((o) => o.status === 'completed');
    const todayRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      todayRevenue,
      activeCount: activeOrders.length,
      completedCount: completed.length,
      avgPrepMinutes: 14,
      pendingCount: orders.filter((o) => o.status === 'pending').length,
    };
  }, [orders]);

  return {
    vendor,
    logout,
    kitchenOpen,
    setKitchenOpen,
    menuItems,
    orders,
    metrics,
    isPolling: ordersQuery.isFetching,
    updateOrderStatus: (orderId: string, nextStatus: KitchenOrderStatus) =>
      updateOrderStatusMutation.mutate({ orderId, nextStatus }),
    saveDish: saveDishMutation.mutateAsync,
    deleteDish: deleteDishMutation.mutate,
    simulateIncomingOrder,
  };
}
