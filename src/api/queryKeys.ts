export const queryKeys = {
  vendor: {
    all: ['vendor'] as const,
    profile: (vendorId?: string) => ['vendor', 'profile', vendorId] as const,
    products: (vendorId?: string) => ['vendor', 'products', vendorId] as const,
    orders: (vendorId?: string) => ['vendor', 'orders', vendorId] as const,
    restaurantMetrics: (vendorId?: string) => ['vendor', 'restaurant-metrics', vendorId] as const,
    restaurantMenu: (vendorId?: string) => ['vendor', 'restaurant-menu', vendorId] as const,
    restaurantOrders: (vendorId?: string) => ['vendor', 'restaurant-orders', vendorId] as const,
  },
};

