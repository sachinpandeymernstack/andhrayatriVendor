import { API_ROOT, apiRequest, productApi } from './vendorClient';
import type { VendorProduct } from '../types/vendor';

const VENDOR_BASE = `${API_ROOT}/vendor`;

export interface RestaurantMetrics {
  todayRevenue: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averagePreparationTime: number;
  topSellingItems: Array<{ name: string; count: number; revenue?: number }>;
  recentOrders: unknown[];
}

export const restaurantApi = {
  fetchOrders(vendorId?: string) {
    const query = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : '';
    return apiRequest<unknown[] | { orders?: unknown[]; data?: unknown[] }>(
      `${VENDOR_BASE}/orders${query}`,
    );
  },

  fetchDashboardMetrics(vendorId?: string) {
    const query = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : '';
    return apiRequest<RestaurantMetrics>(`${VENDOR_BASE}/dashboard-metrics${query}`);
  },

  updateOrderStatus(orderId: string, status: string, extraPayload: Record<string, unknown> = {}) {
    return apiRequest(`${API_ROOT}/ride-order/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extraPayload }),
    });
  },

  fetchMenuItems(vendorId: string) {
    return productApi.getByVendor(vendorId);
  },

  saveMenuItem(vendorId: string, itemData: Partial<VendorProduct>, editingId = '') {
    if (editingId) {
      return productApi.updateProduct(editingId, {
        ...itemData,
        name: itemData.name,
        price: Number(itemData.price),
      });
    }

    return productApi.addProduct({
      ...itemData,
      vendorId,
      name: itemData.name,
      category: 'eat',
      price: Number(itemData.price),
      isActive: itemData.isActive !== undefined ? itemData.isActive : true,
    });
  },

  deleteMenuItem(itemId: string) {
    return productApi.deleteProduct(itemId);
  },
};

export const restaurantMenuService = {
  async fetch(vendorId?: string): Promise<VendorProduct[]> {
    if (!vendorId) return [];
    const response = await restaurantApi.fetchMenuItems(vendorId);
    const rec = response as {
      products?: VendorProduct[];
      data?: VendorProduct[] | { products?: VendorProduct[] };
      items?: VendorProduct[];
      results?: VendorProduct[];
    };
    const source =
      rec?.products ||
      (rec?.data && !Array.isArray(rec.data) ? rec.data.products : rec?.data) ||
      rec?.items ||
      rec?.results ||
      response;
    return Array.isArray(source) ? source : [];
  },

  async save(vendorId: string, itemData: Partial<VendorProduct>, editingId = '') {
    if (!vendorId) throw new Error('Vendor ID is required to save menu item.');
    return restaurantApi.saveMenuItem(vendorId, itemData, editingId);
  },

  async delete(itemId: string) {
    if (!itemId) throw new Error('Item ID is required to delete menu item.');
    return restaurantApi.deleteMenuItem(itemId);
  },

  async toggle(itemId: string, currentActive: boolean) {
    if (!itemId) throw new Error('Item ID is required to toggle menu item.');
    return restaurantApi.saveMenuItem('', { isActive: !currentActive }, itemId);
  },
};

