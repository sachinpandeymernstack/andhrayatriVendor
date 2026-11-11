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
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  History,
  IndianRupee,
  LayoutDashboard,
  Package,
  Plus,
  Printer,
  Settings,
  Trash2,
  Utensils,
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
import { Textarea } from '@/components/ui/textarea';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { formatCurrency } from '@/lib/utils';
import type { VendorProduct } from '@/types/vendor';
import {
  useRestaurantWorkspace,
  type KitchenOrderStatus,
  type RestaurantOrder,
} from './useRestaurantWorkspace';

const HOURLY_COVERS_SERIES = [
  { slot: '12 PM', covers: 28 },
  { slot: '1 PM', covers: 46 },
  { slot: '2 PM', covers: 39 },
  { slot: '7 PM', covers: 41 },
  { slot: '8 PM', covers: 58 },
  { slot: '9 PM', covers: 52 },
];

export function RestaurantWorkspace() {
  const {
    vendor,
    logout,
    kitchenOpen,
    setKitchenOpen,
    menuItems,
    orders,
    metrics,
    updateOrderStatus,
    saveDish,
    deleteDish,
    simulateIncomingOrder,
  } = useRestaurantWorkspace();

  const kpiRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<VendorProduct | null>(null);
  const [kotOrder, setKotOrder] = useState<RestaurantOrder | null>(null);
  const [inventory, setInventory] = useState([
    { id: 'inv-1', item: 'Sona Masoori Rice (Aged)', unit: 'kg', stock: 42, reorderAt: 15 },
    { id: 'inv-2', item: 'Guntur Mirchi Powder', unit: 'kg', stock: 6, reorderAt: 8 },
    { id: 'inv-3', item: 'Coastal Murrel Catch', unit: 'kg', stock: 18, reorderAt: 10 },
    { id: 'inv-4', item: 'Cold-pressed Groundnut Oil', unit: 'L', stock: 24, reorderAt: 12 },
  ]);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Coastal Mains',
    price: '',
    dietary: 'Veg',
    description: '',
  });

  useGsapStaggerReveal(kpiRef, '.ay-kpi-card', [activeTab]);

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Kitchen Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Live KOT Board', icon: ChefHat, badge: metrics.activeCount },
    { id: 'menu', label: 'Digital Menu', icon: Utensils, badge: menuItems.length },
    { id: 'inventory', label: 'Pantry & Stock', icon: Package },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'settings', label: 'Outlet Settings', icon: Settings },
  ];

  const activeOrders = useMemo(
    () => orders.filter((o) => !['completed', 'cancelled'].includes(o.status)),
    [orders],
  );
  const historicalOrders = useMemo(
    () => orders.filter((o) => ['completed', 'cancelled'].includes(o.status)),
    [orders],
  );

  const openDishModal = (dish?: VendorProduct) => {
    setEditingDish(dish || null);
    setDishForm({
      name: dish?.name || '',
      category: dish?.category || 'Coastal Mains',
      price: String(dish?.price ?? ''),
      dietary: String(dish?.dietary || 'Veg'),
      description: dish?.description || '',
    });
    setDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim()) return;
    await saveDish({
      editingId: editingDish ? String(editingDish._id || editingDish.id) : undefined,
      dish: {
        name: dishForm.name.trim(),
        category: dishForm.category,
        price: Number(dishForm.price || 0),
        dietary: dishForm.dietary,
        description: dishForm.description.trim(),
        isActive: true,
      },
    });
    setDishModalOpen(false);
  };

  const nextActionForStatus = (status: KitchenOrderStatus): { label: string; next: KitchenOrderStatus } | null => {
    if (status === 'pending') return { label: 'Accept & Fire KOT', next: 'preparing' };
    if (status === 'accepted' || status === 'preparing') return { label: 'Mark Ready for Pickup', next: 'ready' };
    if (status === 'ready') return { label: 'Complete & Serve', next: 'completed' };
    return null;
  };

  return (
    <VendorWorkspaceLayout
      vendor={vendor}
      portalTitle="Kitchen & Dining Command"
      portalSubtitle="Restaurants & Cafes"
      accentHex="#ea580c"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      unreadNotifications={metrics.pendingCount}
      headerRight={
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 sm:flex">
            <span className="text-xs font-bold text-slate-700">
              {kitchenOpen ? 'Kitchen Open' : 'Kitchen Paused'}
            </span>
            <Switch checked={kitchenOpen} onCheckedChange={setKitchenOpen} />
          </div>
          <Button size="sm" variant="outline" onClick={simulateIncomingOrder}>
            <BellRing className="h-3.5 w-3.5" /> Simulate Order
          </Button>
          <Button size="sm" onClick={() => openDishModal()}>
            <Plus className="h-4 w-4" /> Add Dish
          </Button>
        </div>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div ref={kpiRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiMetricCard
              title="Today Kitchen Sales"
              value={formatCurrency(metrics.todayRevenue)}
              subtitle="Live KOT order volume"
              trend="+12.6%"
              icon={IndianRupee}
              accentClassName="bg-orange-50 text-orange-600"
            />
            <KpiMetricCard
              title="Active Kitchen Tickets"
              value={metrics.activeCount}
              subtitle={`${metrics.pendingCount} waiting acceptance`}
              icon={Flame}
              accentClassName="bg-rose-50 text-rose-600"
            />
            <KpiMetricCard
              title="Avg Prep SLA"
              value={`${metrics.avgPrepMinutes} min`}
              subtitle="Peak lunch & dinner average"
              icon={Clock}
              accentClassName="bg-sky-50 text-sky-600"
            />
            <KpiMetricCard
              title="Published Dishes"
              value={menuItems.length}
              subtitle="Live on Andhra Yatri Eat"
              icon={Utensils}
              accentClassName="bg-emerald-50 text-emerald-700"
            />
          </div>

          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="font-display text-xl font-extrabold text-slate-950">Peak Dining Covers by Hour</CardTitle>
              <CardDescription>Real-time table &amp; takeaway throughput velocity across lunch and dinner shifts.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220}>
                <BarChart data={HOURLY_COVERS_SERIES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="slot" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '0.875rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Bar dataKey="covers" fill="#ea580c" radius={[8, 8, 0, 0]} name="Guest Covers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeOrders.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="space-y-3 p-10 text-center">
                <p className="text-sm text-slate-600">No active kitchen tickets right now.</p>
                <Button variant="outline" onClick={simulateIncomingOrder}>Simulate Test Order</Button>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => {
              const nextAction = nextActionForStatus(order.status);
              return (
                <Card key={order.id} className="border-orange-200/70 bg-white">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="font-mono text-base font-extrabold text-primary">
                        {order.orderNumber}
                      </CardTitle>
                      <CardDescription>{order.customerName} · {order.tableOrMode}</CardDescription>
                    </div>
                    <Badge variant={order.status === 'pending' ? 'warning' : order.status === 'ready' ? 'success' : 'info'}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between font-medium">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatCurrency(item.quantity * item.price)}</span>
                        </li>
                      ))}
                    </ul>
                    {order.notes && <p className="text-xs font-medium text-amber-800">Note: {order.notes}</p>}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm font-extrabold">{formatCurrency(order.totalAmount)}</span>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setKotOrder(order)}>
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        {nextAction && (
                          <Button size="sm" onClick={() => updateOrderStatus(order.id, nextAction.next)}>
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((dish) => {
            const dishId = String(dish._id || dish.id);
            const isVeg = String(dish.dietary || 'Veg').toLowerCase().includes('veg') && !String(dish.dietary || '').toLowerCase().includes('non');
            return (
              <Card key={dishId} className="bg-white">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant={isVeg ? 'success' : 'danger'} className="mb-1.5">
                        {isVeg ? 'Pure Veg' : 'Non-Veg'}
                      </Badge>
                      <h3 className="font-bold text-slate-900">{dish.name}</h3>
                      <p className="text-xs text-slate-500">{dish.category}</p>
                    </div>
                    <span className="text-sm font-extrabold text-primary">{formatCurrency(Number(dish.price || 0))}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-600">{dish.description}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <Button size="sm" variant="outline" onClick={() => openDishModal(dish)}>
                      Edit Dish
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteDish(dishId)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Pantry &amp; Raw Materials</CardTitle>
            <CardDescription>Auto-alert thresholds trigger yellow stock badges before service rushes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventory.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{row.item}</p>
                  <p className="text-xs text-slate-500">Reorder level: {row.reorderAt} {row.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={row.stock <= row.reorderAt ? 'warning' : 'success'}>
                    {row.stock} {row.unit}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setInventory((prev) =>
                        prev.map((i) => (i.id === row.id ? { ...i, stock: i.stock + 10 } : i)),
                      )
                    }
                  >
                    + Restock 10
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Completed &amp; Closed Kitchen Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {historicalOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No completed tickets yet in this session.</p>
            ) : (
              historicalOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border p-3.5 text-sm">
                  <div>
                    <p className="font-bold">{o.orderNumber} · {o.customerName}</p>
                    <p className="text-xs text-slate-500">{o.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" /> {o.status}
                    </Badge>
                    <span className="font-bold">{formatCurrency(o.totalAmount)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && <VendorSettingsHub />}

      {/* Add / Edit Dish Modal */}
      <Dialog open={dishModalOpen} onOpenChange={setDishModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDish ? 'Edit Dish' : 'Add Menu Dish'}</DialogTitle>
            <DialogDescription>Configure dish pricing, cuisine category &amp; dietary classification.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDish} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dish-name">Dish Name</Label>
              <Input
                id="dish-name"
                required
                placeholder="e.g. Konaseema Royyala Iguru"
                value={dishForm.name}
                onChange={(e) => setDishForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dish-cat">Category</Label>
                <Input
                  id="dish-cat"
                  value={dishForm.category}
                  onChange={(e) => setDishForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dish-diet">Dietary</Label>
                <SelectField
                  id="dish-diet"
                  value={dishForm.dietary}
                  onChange={(e) => setDishForm((f) => ({ ...f, dietary: e.target.value }))}
                >
                  <option value="Veg">Pure Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </SelectField>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dish-price">Price (INR)</Label>
                <Input
                  id="dish-price"
                  type="number"
                  required
                  value={dishForm.price}
                  onChange={(e) => setDishForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dish-desc">Description</Label>
              <Textarea
                id="dish-desc"
                rows={3}
                value={dishForm.description}
                onChange={(e) => setDishForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDishModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Menu Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* KOT Print Modal */}
      <Dialog open={Boolean(kotOrder)} onOpenChange={(o) => !o && setKotOrder(null)}>
        <DialogContent className="max-w-md">
          {kotOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono">KOT · {kotOrder.orderNumber}</DialogTitle>
                <DialogDescription>{kotOrder.tableOrMode} · {kotOrder.customerName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 font-mono text-xs">
                {kotOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity} x {it.name}</span>
                    <span>{formatCurrency(it.quantity * it.price)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-300 pt-2 text-right font-bold">
                  TOTAL: {formatCurrency(kotOrder.totalAmount)}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print KOT Slip
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </VendorWorkspaceLayout>
  );
}

