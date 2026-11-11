import React, { useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BellRing,
  Copy,
  FolderTree,
  History,
  IndianRupee,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { KpiMetricCard } from '@/components/layout/KpiMetricCard';
import { VendorWorkspaceLayout, type WorkspaceNavItem } from '@/components/layout/VendorWorkspaceLayout';
import { VendorSettingsHub } from '@/components/settings/VendorSettingsHub';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { formatCurrency } from '@/lib/utils';
import { computeDiscountPercent, type ShoppingOrder, type ShoppingProduct } from './shoppingService';
import { useShoppingWorkspace } from './useShoppingWorkspace';

const SALES_BY_CATEGORY_SERIES = [
  { category: 'GI Crafts', revenue: 42500 },
  { category: 'Handlooms', revenue: 58900 },
  { category: 'Araku Coffee', revenue: 31200 },
  { category: 'Spices', revenue: 19400 },
];

export function ShoppingWorkspace() {
  const {
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
  } = useShoppingWorkspace();

  const kpiRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [skuDialogOpen, setSkuDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<ShoppingProduct | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<ShoppingOrder | null>(null);
  const [dispatchForm, setDispatchForm] = useState({ courier: 'DTDC Air Express', trackingId: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState('');
  const [skuForm, setSkuForm] = useState({
    sku: '',
    name: '',
    category: categories[0]?.name || 'GI Crafts & Toys',
    price: '',
    compareAtPrice: '',
    stock: '15',
    lowStockThreshold: '5',
    description: '',
  });

  useGsapStaggerReveal(kpiRef, '.ay-kpi-card', [activeTab]);

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
    { id: 'products', label: 'SKU Catalog', icon: ShoppingBag, badge: products.length },
    { id: 'categories', label: 'Category Tree', icon: FolderTree, badge: categories.length },
    { id: 'orders', label: 'Live Fulfillment', icon: Truck, badge: metrics.activeOrders },
    { id: 'history', label: 'Delivered Ledger', icon: History },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [products, searchQuery],
  );

  const openSkuDialog = (item?: ShoppingProduct) => {
    setEditingSku(item || null);
    setSkuForm({
      sku: item?.sku || `AY-${Math.floor(100 + Math.random() * 900)}`,
      name: item?.name || '',
      category: item?.category || categories[0]?.name || 'GI Crafts & Toys',
      price: String(item?.price ?? ''),
      compareAtPrice: String(item?.compareAtPrice ?? ''),
      stock: String(item?.stock ?? '15'),
      lowStockThreshold: String(item?.lowStockThreshold ?? '5'),
      description: item?.description || '',
    });
    setSkuDialogOpen(true);
  };

  const submitSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuForm.name.trim()) return;
    saveProduct(
      {
        sku: skuForm.sku.trim(),
        name: skuForm.name.trim(),
        category: skuForm.category,
        price: Number(skuForm.price || 0),
        compareAtPrice: skuForm.compareAtPrice ? Number(skuForm.compareAtPrice) : undefined,
        stock: Number(skuForm.stock || 0),
        lowStockThreshold: Number(skuForm.lowStockThreshold || 5),
        isActive: editingSku?.isActive ?? true,
        description: skuForm.description.trim(),
      },
      editingSku?.id,
    );
    setSkuDialogOpen(false);
  };

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const closedOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));

  return (
    <VendorWorkspaceLayout
      vendor={vendor}
      portalTitle="Shopping & Crafts Studio"
      portalSubtitle="Retail & Souvenirs"
      accentHex="#c026d3"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      unreadNotifications={lowStockProducts.length}
      headerRight={
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 sm:flex">
            <span className="text-xs font-bold">{storeOpen ? 'Store Online' : 'Vacation Mode'}</span>
            <Switch checked={storeOpen} onCheckedChange={setStoreOpen} />
          </div>
          <Button size="sm" variant="outline" onClick={simulateOrder}>
            <BellRing className="h-3.5 w-3.5" /> Test Order
          </Button>
          <Button size="sm" onClick={() => openSkuDialog()}>
            <Plus className="h-4 w-4" /> Add Product SKU
          </Button>
        </div>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div ref={kpiRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiMetricCard
              title="Storefront GMV"
              value={formatCurrency(metrics.gmv)}
              subtitle="Direct craft orders"
              trend="+21.5%"
              icon={IndianRupee}
              accentClassName="bg-fuchsia-50 text-fuchsia-700"
            />
            <KpiMetricCard
              title="Orders To Dispatch"
              value={metrics.activeOrders}
              subtitle="Pending pack or courier"
              icon={Truck}
              accentClassName="bg-sky-50 text-sky-700"
            />
            <KpiMetricCard
              title="Catalog SKUs"
              value={metrics.totalSkus}
              subtitle={`${categories.length} category collections`}
              icon={Package}
              accentClassName="bg-emerald-50 text-emerald-700"
            />
            <KpiMetricCard
              title="Low Stock Alerts"
              value={metrics.lowStockCount}
              subtitle="SKUs below threshold"
              icon={AlertTriangle}
              accentClassName="bg-amber-50 text-amber-700"
            />
          </div>

          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="font-display text-xl font-extrabold text-slate-950">Category Revenue Mix</CardTitle>
              <CardDescription>Sales attribution across GI crafts, handlooms, and regional Andhra produce.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220}>
                <BarChart data={SALES_BY_CATEGORY_SERIES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.875rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    formatter={(val) => [formatCurrency(Number(val)), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#c026d3" radius={[8, 8, 0, 0]} name="Revenue (INR)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="bg-white pl-9"
              placeholder="Search SKU code, title, collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((item) => {
              const discount = computeDiscountPercent(item.price, item.compareAtPrice);
              const isLow = item.stock <= item.lowStockThreshold;
              return (
                <Card key={item.id} className="bg-white">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[11px] font-bold text-slate-400">{item.sku}</p>
                        <h3 className="font-bold text-slate-900">{item.name}</h3>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <Switch checked={item.isActive} onCheckedChange={() => toggleProductActive(item.id)} />
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-primary">{formatCurrency(item.price)}</span>
                      {discount > 0 && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(item.compareAtPrice || 0)}
                          </span>
                          <Badge variant="success">{discount}% OFF</Badge>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <Badge variant={isLow ? 'warning' : 'secondary'}>
                        Stock: {item.stock} units {isLow && '(Low)'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => duplicateProduct(item)} title="Duplicate SKU">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openSkuDialog(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteProduct(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Add Collection Node</CardTitle>
              <CardDescription>Organize merchandise hierarchically with cycle protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-cat-name">Category Name</Label>
                <Input
                  id="new-cat-name"
                  placeholder="e.g. Kondapalli Miniatures"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-cat-parent">Parent Collection (Optional)</Label>
                <SelectField
                  id="new-cat-parent"
                  value={newCategoryParent}
                  onChange={(e) => setNewCategoryParent(e.target.value)}
                >
                  <option value="">Top-Level Collection</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </SelectField>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (!newCategoryName.trim()) return;
                  addCategory(newCategoryName, newCategoryParent || null);
                  setNewCategoryName('');
                }}
              >
                <Plus className="h-4 w-4" /> Create Collection
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Active Category Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {categories.map((cat) => {
                const parent = categories.find((p) => p.id === cat.parentId);
                return (
                  <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border p-3.5">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {parent ? `${parent.name} → ` : ''}
                        {cat.name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">/{cat.slug}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeOrders.map((order) => (
            <Card key={order.id} className="bg-white">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="font-mono text-base font-extrabold text-primary">{order.orderNumber}</CardTitle>
                  <CardDescription>{order.customerName} · {order.city}</CardDescription>
                </div>
                <Badge variant={order.status === 'shipped' ? 'info' : order.status === 'packed' ? 'success' : 'warning'}>
                  {order.status.toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs">
                  {order.items.map((it) => (
                    <li key={it.sku} className="flex justify-between font-medium">
                      <span>{it.qty}x {it.name}</span>
                      <span>{formatCurrency(it.qty * it.price)}</span>
                    </li>
                  ))}
                </ul>
                {order.trackingId && (
                  <p className="text-xs font-semibold text-sky-700">
                    AWB: {order.trackingCourier} · {order.trackingId}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="font-extrabold">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex gap-1.5">
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => updateOrderStage(order.id, 'packed')}>Mark Packed</Button>
                    )}
                    {order.status === 'packed' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setDispatchOrder(order);
                          setDispatchForm({ courier: 'DTDC Air Express', trackingId: `AWB${Date.now().toString().slice(-6)}` });
                        }}
                      >
                        Dispatch Courier
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button size="sm" variant="outline" onClick={() => updateOrderStage(order.id, 'delivered')}>
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader><CardTitle>Fulfilled Order Ledger</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {closedOrders.length === 0 ? (
              <p className="text-sm text-slate-500">Completed deliveries appear here once confirmed.</p>
            ) : (
              closedOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-bold">{o.orderNumber} · {o.customerName}</p>
                    <p className="text-xs text-slate-500">{o.trackingCourier} {o.trackingId}</p>
                  </div>
                  <Badge variant="success">{o.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && <VendorSettingsHub />}

      {/* Add/Edit SKU Modal */}
      <Dialog open={skuDialogOpen} onOpenChange={setSkuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSku ? 'Edit Retail SKU' : 'New Retail SKU'}</DialogTitle>
            <DialogDescription>Set SKU code, MRP comparison pricing, and stock alert threshold.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSku} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku-code">SKU Code</Label>
                <Input id="sku-code" value={skuForm.sku} onChange={(e) => setSkuForm((s) => ({ ...s, sku: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku-cat">Collection</Label>
                <SelectField id="sku-cat" value={skuForm.category} onChange={(e) => setSkuForm((s) => ({ ...s, category: e.target.value }))}>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </SelectField>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku-name">Product Name</Label>
              <Input id="sku-name" required value={skuForm.name} onChange={(e) => setSkuForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="sku-price">Price</Label>
                <Input id="sku-price" type="number" required value={skuForm.price} onChange={(e) => setSkuForm((s) => ({ ...s, price: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku-mrp">MRP</Label>
                <Input id="sku-mrp" type="number" value={skuForm.compareAtPrice} onChange={(e) => setSkuForm((s) => ({ ...s, compareAtPrice: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku-stock">Stock</Label>
                <Input id="sku-stock" type="number" value={skuForm.stock} onChange={(e) => setSkuForm((s) => ({ ...s, stock: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku-thresh">Alert At</Label>
                <Input id="sku-thresh" type="number" value={skuForm.lowStockThreshold} onChange={(e) => setSkuForm((s) => ({ ...s, lowStockThreshold: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSkuDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save SKU</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courier Dispatch Modal */}
      <Dialog open={Boolean(dispatchOrder)} onOpenChange={(o) => !o && setDispatchOrder(null)}>
        <DialogContent className="max-w-md">
          {dispatchOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Dispatch Order {dispatchOrder.orderNumber}</DialogTitle>
                <DialogDescription>Assign shipping carrier and tracking AWB to notify buyer.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="courier-name">Courier Partner</Label>
                  <Input
                    id="courier-name"
                    value={dispatchForm.courier}
                    onChange={(e) => setDispatchForm((d) => ({ ...d, courier: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="courier-awb">AWB / Tracking ID</Label>
                  <Input
                    id="courier-awb"
                    value={dispatchForm.trackingId}
                    onChange={(e) => setDispatchForm((d) => ({ ...d, trackingId: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDispatchOrder(null)}>Cancel</Button>
                <Button
                  onClick={() => {
                    updateOrderStage(dispatchOrder.id, 'shipped', dispatchForm);
                    setDispatchOrder(null);
                  }}
                >
                  Confirm Shipment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </VendorWorkspaceLayout>
  );
}

