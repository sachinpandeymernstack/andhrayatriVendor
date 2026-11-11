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
  Compass,
  Edit3,
  Landmark,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Ticket,
  Trash2,
  Users,
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
import { Textarea } from '@/components/ui/textarea';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorProductMutations, useVendorProductsQuery } from '@/hooks/queries/useVendorQueries';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { formatCurrency } from '@/lib/utils';
import type { VendorDashboardConfig } from '@/lib/vendorSession';
import type { VendorProduct } from '@/types/vendor';

interface AttractionsGeneralWorkspaceProps {
  dashboardConfig: VendorDashboardConfig;
}

const WEEKLY_VISITOR_TREND = [
  { day: 'Mon', visitors: 145, revenue: 21750 },
  { day: 'Tue', visitors: 182, revenue: 27300 },
  { day: 'Wed', visitors: 210, revenue: 31500 },
  { day: 'Thu', visitors: 196, revenue: 29400 },
  { day: 'Fri', visitors: 274, revenue: 41100 },
  { day: 'Sat', visitors: 420, revenue: 63000 },
  { day: 'Sun', visitors: 468, revenue: 70200 },
];

export function AttractionsGeneralWorkspace({ dashboardConfig }: AttractionsGeneralWorkspaceProps) {
  const { vendor, logout } = useVendorAuth();
  const vendorId = String(vendor?._id || vendor?.id || '');
  const { data: items = [], isLoading } = useVendorProductsQuery(vendorId);
  const { saveProduct, deleteProduct } = useVendorProductMutations(vendorId);

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VendorProduct | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    price: '',
    stock: '250',
    location: String(vendor?.location?.city || 'Visakhapatnam'),
    imageUrl: '',
  });

  const kpiRef = useRef<HTMLDivElement>(null);
  useGsapStaggerReveal(kpiRef, '.ay-kpi-card', [activeTab]);

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Overview & Footfall', icon: LayoutDashboard },
    { id: 'listings', label: dashboardConfig.itemPlural, icon: Ticket, badge: items.length },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = `${item.name || ''} ${item.description || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const filterMatch =
        quickFilter === 'All' ||
        `${item.description || ''} ${item.name || ''}`.toLowerCase().includes(quickFilter.toLowerCase());
      return nameMatch && filterMatch;
    });
  }, [items, searchTerm, quickFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState({
      name: '',
      description: '',
      price: '',
      stock: '250',
      location: String(vendor?.location?.city || 'Visakhapatnam'),
      imageUrl: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: VendorProduct) => {
    setEditingItem(item);
    setFormState({
      name: item.name || item.title || '',
      description: item.description || '',
      price: String(item.price ?? ''),
      stock: String(item.stock ?? '250'),
      location: item.location || String(vendor?.location?.city || ''),
      imageUrl: item.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;
    await saveProduct.mutateAsync({
      editingId: editingItem?._id || editingItem?.id,
      payload: {
        name: formState.name.trim(),
        description: formState.description.trim(),
        price: Number(formState.price || 0),
        stock: Number(formState.stock || 0),
        location: formState.location.trim(),
        imageUrl: formState.imageUrl.trim(),
        category: dashboardConfig.apiCategory,
      },
    });
    setModalOpen(false);
  };

  const totalWeeklyRevenue = WEEKLY_VISITOR_TREND.reduce((sum, d) => sum + d.revenue, 0);
  const totalWeeklyVisitors = WEEKLY_VISITOR_TREND.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <VendorWorkspaceLayout
      vendor={vendor}
      portalTitle={dashboardConfig.badge}
      portalSubtitle={dashboardConfig.label}
      accentHex={dashboardConfig.accent}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      headerRight={
        <Button size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" /> Add {dashboardConfig.itemLabel}
        </Button>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div ref={kpiRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiMetricCard
              title="Weekly Gate Revenue"
              value={formatCurrency(totalWeeklyRevenue)}
              subtitle="Across digital entry passes"
              trend="+14.2%"
              icon={Landmark}
            />
            <KpiMetricCard
              title="Weekly Visitor Check-ins"
              value={totalWeeklyVisitors.toLocaleString('en-IN')}
              subtitle="QR validated gate scans"
              trend="+9.8%"
              icon={Users}
              accentClassName="bg-sky-50 text-sky-700"
            />
            <KpiMetricCard
              title={`Published ${dashboardConfig.itemPlural}`}
              value={items.length}
              subtitle="Visible on Andhra Yatri"
              icon={Ticket}
              accentClassName="bg-emerald-50 text-emerald-700"
            />
            <KpiMetricCard
              title="Avg Pass Value"
              value={formatCurrency(Math.round(totalWeeklyRevenue / totalWeeklyVisitors))}
              subtitle="Adult + Family Bundles"
              icon={Compass}
              accentClassName="bg-amber-50 text-amber-700"
            />
          </div>

          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="font-display text-xl font-extrabold text-slate-950">7-Day Visitor Footfall &amp; Ticket Revenue</CardTitle>
              <CardDescription>{dashboardConfig.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220}>
                <BarChart data={WEEKLY_VISITOR_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
                  <Bar dataKey="visitors" name="Visitors" fill="#6C36A2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={`Search ${dashboardConfig.itemPlural.toLowerCase()}...`}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {dashboardConfig.quickFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQuickFilter(filter)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition ${
                    quickFilter === filter
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-slate-500">
                Loading {dashboardConfig.itemPlural.toLowerCase()}...
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="space-y-4 p-10 text-center">
                <p className="text-sm text-slate-600">{dashboardConfig.emptyMessage}</p>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4" /> Create First {dashboardConfig.itemLabel}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const id = String(item._id || item.id);
                return (
                  <Card key={id} className="overflow-hidden bg-white">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{item.name || item.title}</h3>
                          <p className="text-xs text-slate-500">{item.location || 'Andhra Pradesh'}</p>
                        </div>
                        <Badge variant="success">{formatCurrency(Number(item.price || 0))}</Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-slate-600">{item.description || 'Verified visitor pass'}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {dashboardConfig.stockLabel}: {item.stock ?? 'Unlimited'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button type="button" size="sm" variant="ghost" onClick={() => openEditModal(item)}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteProduct.mutate(id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && <VendorSettingsHub />}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${dashboardConfig.itemLabel}` : `New ${dashboardConfig.itemLabel}`}
            </DialogTitle>
            <DialogDescription>
              Published entries sync directly with traveler discovery on andhrayatri.com.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="attr-item-name">{dashboardConfig.itemLabel} Title</Label>
              <Input
                id="attr-item-name"
                required
                placeholder={dashboardConfig.itemPlaceholder}
                value={formState.name}
                onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="attr-item-price">{dashboardConfig.priceLabel}</Label>
                <Input
                  id="attr-item-price"
                  type="number"
                  min="0"
                  required
                  value={formState.price}
                  onChange={(e) => setFormState((s) => ({ ...s, price: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attr-item-stock">{dashboardConfig.stockLabel}</Label>
                <Input
                  id="attr-item-stock"
                  type="number"
                  min="0"
                  value={formState.stock}
                  onChange={(e) => setFormState((s) => ({ ...s, stock: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attr-item-location">Venue / Gate Location</Label>
              <Input
                id="attr-item-location"
                value={formState.location}
                onChange={(e) => setFormState((s) => ({ ...s, location: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attr-item-desc">Description</Label>
              <Textarea
                id="attr-item-desc"
                rows={3}
                placeholder={dashboardConfig.descriptionPlaceholder}
                value={formState.description}
                onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveProduct.isPending}>
                {saveProduct.isPending ? 'Saving...' : 'Save Pass'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </VendorWorkspaceLayout>
  );
}

