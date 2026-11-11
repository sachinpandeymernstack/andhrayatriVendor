import React, { useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BedDouble,
  Building2,
  CalendarCheck,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Printer,
  Send,
  Settings,
  Star,
  TrendingUp,
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorToast } from '@/context/VendorNotificationContext';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { cn, formatCurrency } from '@/lib/utils';
import {
  DEFAULT_HOTEL_REVIEWS,
  DEFAULT_HOTEL_ROOMS,
  loadHotelBookings,
  saveHotelBookings,
  type HotelBooking,
  type HotelBookingStatus,
  type HotelReview,
  type HotelRoomType,
} from './hotelStorage';

const MONTHLY_REVENUE_SERIES = [
  { month: 'Jun', revenue: 312000, occupancy: 64 },
  { month: 'Jul', revenue: 358000, occupancy: 71 },
  { month: 'Aug', revenue: 389000, occupancy: 76 },
  { month: 'Sep', revenue: 344000, occupancy: 69 },
  { month: 'Oct', revenue: 432000, occupancy: 83 },
  { month: 'Nov', revenue: 486000, occupancy: 88 },
];

export function HotelWorkspace() {
  const { vendor, logout } = useVendorAuth();
  const { showToast } = useVendorToast();
  const kpiRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState<HotelRoomType[]>(DEFAULT_HOTEL_ROOMS);
  const [bookings, setBookings] = useState<HotelBooking[]>(loadHotelBookings);
  const [reviews, setReviews] = useState<HotelReview[]>(DEFAULT_HOTEL_REVIEWS);
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<HotelBooking | null>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: '2', baseRate: '4500', totalInventory: '6' });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'Guest · Ananya Reddy', text: 'Could we request an airport pickup from VTZ around 11 AM?', time: '10:15 AM', outgoing: false },
    { id: 'm2', sender: 'Front Desk', text: 'Yes Ananya, our Innova chauffeur is scheduled for 10:50 AM.', time: '10:22 AM', outgoing: true },
  ]);
  const [messageInput, setMessageInput] = useState('');

  useGsapStaggerReveal(kpiRef, '.ay-kpi-card', [activeTab]);

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Property Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms & Tariffs', icon: BedDouble, badge: rooms.length },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: bookings.filter((b) => b.status === 'Confirmed').length },
    { id: 'analytics', label: 'Occupancy Analytics', icon: TrendingUp },
    { id: 'reviews', label: 'Guest Reviews', icon: Star },
    { id: 'financials', label: 'Financials & Payouts', icon: CreditCard },
    { id: 'messages', label: 'Guest Messages', icon: MessageSquare },
    { id: 'settings', label: 'Property Settings', icon: Settings },
  ];

  const metrics = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status !== 'Cancelled');
    const revenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalRooms = rooms.reduce((sum, r) => sum + r.totalInventory, 0);
    const occupiedRooms = rooms.reduce((sum, r) => sum + Math.max(0, r.totalInventory - r.availableToday), 0);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)).toFixed(1);
    return { revenue, occupancyRate, totalRooms, occupiedRooms, avgRating };
  }, [bookings, rooms, reviews]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = bookingSearch.toLowerCase();
      const textOk =
        b.guestName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.roomType.toLowerCase().includes(q);
      const statusOk = statusFilter === 'All' || b.status === statusFilter;
      return textOk && statusOk;
    });
  }, [bookings, bookingSearch, statusFilter]);

  const updateBookingStatus = (bookingId: string, nextStatus: HotelBookingStatus) => {
    const previous = bookings;
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b));
    setBookings(updated);
    saveHotelBookings(updated);
    setSelectedBooking((curr) => (curr?.id === bookingId ? { ...curr, status: nextStatus } : curr));
    showToast(`Reservation ${bookingId} marked as ${nextStatus}`, 'success', {
      actionLabel: 'Undo',
      onAction: () => {
        setBookings(previous);
        saveHotelBookings(previous);
      },
    });
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    const rate = Number(newRoom.baseRate || 3500);
    const inv = Number(newRoom.totalInventory || 4);
    setRooms((prev) => [
      ...prev,
      {
        id: `rm-${Date.now()}`,
        name: newRoom.name.trim(),
        capacity: Number(newRoom.capacity || 2),
        baseRate: rate,
        weekendRate: Math.round(rate * 1.18),
        totalInventory: inv,
        availableToday: inv,
        amenities: ['Free Wi-Fi', 'Breakfast Included', 'AC'],
        active: true,
      },
    ]);
    setRoomModalOpen(false);
    setNewRoom({ name: '', capacity: '2', baseRate: '4500', totalInventory: '6' });
    showToast('New room category added to live inventory.', 'success');
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, sender: 'Front Desk', text: messageInput.trim(), time: 'Just now', outgoing: true },
    ]);
    setMessageInput('');
  };

  return (
    <VendorWorkspaceLayout
      vendor={vendor}
      portalTitle="Hotel Partner Suite"
      portalSubtitle="Hospitality & Stays"
      accentHex="#6C36A2"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      headerRight={
        <Button size="sm" onClick={() => setRoomModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Room Type
        </Button>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div ref={kpiRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiMetricCard
              title="Confirmed Stay Revenue"
              value={formatCurrency(metrics.revenue)}
              subtitle="Across active reservations"
              trend="+18.4%"
              icon={IndianRupee}
            />
            <KpiMetricCard
              title="Tonight Occupancy"
              value={`${metrics.occupancyRate}%`}
              subtitle={`${metrics.occupiedRooms} of ${metrics.totalRooms} rooms occupied`}
              trend="+6.0%"
              icon={Building2}
              accentClassName="bg-emerald-50 text-emerald-700"
            />
            <KpiMetricCard
              title="Arrivals Queue"
              value={bookings.filter((b) => b.status === 'Confirmed').length}
              subtitle="Pending front-desk check-in"
              icon={CalendarCheck}
              accentClassName="bg-amber-50 text-amber-700"
            />
            <KpiMetricCard
              title="Guest Rating"
              value={`${metrics.avgRating} / 5.0`}
              subtitle={`${reviews.length} verified stays`}
              icon={Star}
              accentClassName="bg-sky-50 text-sky-700"
            />
          </div>

            <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="font-display text-xl font-extrabold text-slate-950">6-Month Revenue Trajectory</CardTitle>
                <CardDescription>Combined room tariffs &amp; weekend premium occupancy trend across Andhra Yatri.</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-6">
                <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
                  <AreaChart data={MONTHLY_REVENUE_SERIES}>
                    <defs>
                      <linearGradient id="hotelRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C36A2" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6C36A2" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
                    <Area type="monotone" dataKey="revenue" stroke="#6C36A2" strokeWidth={2.5} fill="url(#hotelRevGrad)" name="Revenue (INR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="bg-white">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <CardDescription>Max {room.capacity} Guests · {room.totalInventory} Units</CardDescription>
                </div>
                <Switch
                  checked={room.active}
                  onCheckedChange={(checked) =>
                    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, active: checked } : r)))
                  }
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Weekday Tariff</p>
                    <p className="text-sm font-extrabold text-slate-900">{formatCurrency(room.baseRate)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Weekend Tariff</p>
                    <p className="text-sm font-extrabold text-primary">{formatCurrency(room.weekendRate)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[11px]">{a}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold">
                  <span>Available Tonight:</span>
                  <span className="text-emerald-700">{room.availableToday} / {room.totalInventory}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              className="max-w-xs bg-white"
              placeholder="Search booking ID, guest or room..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs',
                    statusFilter === s
                      ? 'border-primary bg-primary text-white shadow-xs shadow-primary/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-slate-50',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room Category</TableHead>
                  <TableHead>Stay Dates</TableHead>
                  <TableHead>Tariff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono font-bold text-primary">{b.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{b.guestName}</div>
                      <div className="text-xs text-slate-500">{b.guestPhone}</div>
                    </TableCell>
                    <TableCell>{b.roomType}</TableCell>
                    <TableCell className="text-xs">{b.checkIn} → {b.checkOut}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(b.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          b.status === 'Checked-In'
                            ? 'success'
                            : b.status === 'Confirmed'
                              ? 'info'
                              : b.status === 'Cancelled'
                                ? 'danger'
                                : 'secondary'
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setSelectedBooking(b)}>
                          Manage
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setInvoiceBooking(b)}>
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="font-display text-xl font-extrabold text-slate-950">Monthly Occupancy % Performance</CardTitle>
            <CardDescription>Benchmark occupancy efficiency vs target 80% peak season threshold.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={240}>
              <BarChart data={MONTHLY_REVENUE_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.875rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(val) => [`${val}%`, 'Occupancy']}
                />
                <Bar dataKey="occupancy" fill="#F5A623" radius={[8, 8, 0, 0]} name="Occupancy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{rev.guestName}</p>
                    <p className="text-xs text-slate-500">{rev.roomType} · {rev.date}</p>
                  </div>
                  <Badge variant="warning">{rev.rating}.0 ★</Badge>
                </div>
                <p className="text-sm text-slate-700">{rev.comment}</p>
                {rev.reply ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                    <strong className="text-primary">Management Reply:</strong> {rev.reply}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a warm management response..."
                      value={replyDrafts[rev.id] || ''}
                      onChange={(e) => setReplyDrafts((p) => ({ ...p, [rev.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const text = replyDrafts[rev.id]?.trim();
                        if (!text) return;
                        setReviews((prev) => prev.map((r) => (r.id === rev.id ? { ...r, reply: text } : r)));
                        showToast('Reply published to guest review.', 'success');
                      }}
                    >
                      Post Reply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'financials' && (
        <Card>
          <CardHeader>
            <CardTitle>Settlement Ledger &amp; NEFT Payouts</CardTitle>
            <CardDescription>10% platform facilitation fee deducted transparently prior to settlement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-slate-500">Gross Stay Volume</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{formatCurrency(metrics.revenue)}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs font-semibold text-slate-500">Platform Commission (10%)</p>
                <p className="mt-1 text-xl font-extrabold text-amber-700">{formatCurrency(metrics.revenue * 0.1)}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-xs font-semibold text-emerald-700">Net Settled Balance</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-900">{formatCurrency(metrics.revenue * 0.9)}</p>
              </div>
            </div>
            <Button onClick={() => showToast('NEFT payout transfer initiated for settled stays.', 'success')}>
              Request Instant Payout
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'messages' && (
        <Card className="flex h-[480px] flex-col">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Guest Concierge Inbox</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-md rounded-2xl p-3.5 text-sm ${
                  m.outgoing ? 'ml-auto bg-primary text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-[11px] font-bold opacity-80">{m.sender} · {m.time}</p>
                <p className="mt-1">{m.text}</p>
              </div>
            ))}
          </CardContent>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-4">
            <Input
              placeholder="Reply to guest inquiry..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Button type="submit">
              <Send className="h-4 w-4" /> Send
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'settings' && <VendorSettingsHub />}

      {/* Booking Details Modal */}
      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Reservation {selectedBooking.id}</DialogTitle>
                <DialogDescription>
                  {selectedBooking.guestName} · {selectedBooking.roomType} (Room {selectedBooking.roomNumber})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p><strong>Check-in:</strong> {selectedBooking.checkIn}</p>
                  <p><strong>Check-out:</strong> {selectedBooking.checkOut} ({selectedBooking.nights} nights)</p>
                  <p><strong>Total Tariff:</strong> {formatCurrency(selectedBooking.totalAmount)}</p>
                  {selectedBooking.specialRequests && (
                    <p><strong>Guest Note:</strong> {selectedBooking.specialRequests}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => updateBookingStatus(selectedBooking.id, 'Checked-In')}>
                    Check In Guest
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateBookingStatus(selectedBooking.id, 'Checked-Out')}>
                    Complete Check-Out
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(selectedBooking.id, 'Cancelled')}>
                    Cancel Booking
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={Boolean(invoiceBooking)} onOpenChange={(open) => !open && setInvoiceBooking(null)}>
        <DialogContent>
          {invoiceBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Tax Invoice · {invoiceBooking.id}</DialogTitle>
                <DialogDescription>GST Compliant Stay Receipt</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm">
                <p><strong>Guest:</strong> {invoiceBooking.guestName}</p>
                <p><strong>Room:</strong> {invoiceBooking.roomType}</p>
                <p><strong>Base Tariff:</strong> {formatCurrency(Math.round(invoiceBooking.totalAmount / 1.12))}</p>
                <p><strong>GST (12%):</strong> {formatCurrency(invoiceBooking.totalAmount - Math.round(invoiceBooking.totalAmount / 1.12))}</p>
                <p className="border-t pt-2 text-base font-extrabold text-primary">
                  Grand Total: {formatCurrency(invoiceBooking.totalAmount)}
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Print Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room Category</DialogTitle>
            <DialogDescription>Define room inventory and nightly tariffs.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="room-name">Room Title</Label>
              <Input
                id="room-name"
                required
                placeholder="e.g. Araku Valley Mist Cottage"
                value={newRoom.name}
                onChange={(e) => setNewRoom((r) => ({ ...r, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="room-cap">Guests</Label>
                <Input
                  id="room-cap"
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom((r) => ({ ...r, capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-rate">Nightly Rate</Label>
                <Input
                  id="room-rate"
                  type="number"
                  value={newRoom.baseRate}
                  onChange={(e) => setNewRoom((r) => ({ ...r, baseRate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-inv">Rooms Count</Label>
                <Input
                  id="room-inv"
                  type="number"
                  value={newRoom.totalInventory}
                  onChange={(e) => setNewRoom((r) => ({ ...r, totalInventory: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRoomModalOpen(false)}>Cancel</Button>
              <Button type="submit">Publish Room Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </VendorWorkspaceLayout>
  );
}
