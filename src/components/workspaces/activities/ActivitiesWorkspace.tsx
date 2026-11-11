import React, { useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarCheck,
  Compass,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  Plus,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserPlus,
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
import { SelectField } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { formatCurrency } from '@/lib/utils';
import {
  validateExperiencePayload,
  validateGuidePayload,
  type ActivityExperience,
  type ExperienceDifficulty,
} from './activityValidators';
import { useActivitiesWorkspace } from './useActivitiesWorkspace';

const WEEKLY_DEMAND = [
  { week: 'Wk 1', bookings: 18 },
  { week: 'Wk 2', bookings: 24 },
  { week: 'Wk 3', bookings: 29 },
  { week: 'Wk 4', bookings: 37 },
];

export function ActivitiesWorkspace() {
  const {
    vendor,
    logout,
    isOnline,
    setIsOnline,
    experiences,
    guides,
    bookings,
    metrics,
    saveExperience,
    toggleExperienceActive,
    addGuide,
    toggleGuideDuty,
    updateBookingStatus,
  } = useActivitiesWorkspace();

  const kpiRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [offlineConfirmOpen, setOfflineConfirmOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ActivityExperience | null>(null);
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});
  const [guideErrors, setGuideErrors] = useState<Record<string, string>>({});

  const [expForm, setExpForm] = useState({
    title: '',
    category: 'Eco Trek',
    location: 'Araku Valley',
    duration: '3 Hours',
    difficulty: 'Moderate' as ExperienceDifficulty,
    pricePerPerson: '1200',
    maxGroupSize: '12',
    minAge: '10',
    safetyGear: 'Helmet, Life Jacket, First Aid Kit',
    highlights: '',
  });

  const [guideForm, setGuideForm] = useState({
    name: '',
    phone: '',
    specialty: '',
    languages: 'Telugu, English',
    experienceYears: '3',
  });

  useGsapStaggerReveal(kpiRef, '.ay-kpi-card', [activeTab]);

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Operator Overview', icon: LayoutDashboard },
    { id: 'experiences', label: 'Experiences & Trails', icon: Compass, badge: experiences.length },
    { id: 'bookings', label: 'Batch Bookings', icon: CalendarCheck, badge: bookings.filter((b) => b.status === 'Confirmed').length },
    { id: 'guides', label: 'Certified Guides', icon: Users, badge: guides.length },
    { id: 'insights', label: 'Slot Insights', icon: TrendingUp },
    { id: 'settings', label: 'Operator Settings', icon: Settings },
  ];

  const openExperienceModal = (exp?: ActivityExperience) => {
    setEditingExp(exp || null);
    setExpErrors({});
    setExpForm({
      title: exp?.title || '',
      category: exp?.category || 'Eco Trek',
      location: exp?.location || 'Araku Valley',
      duration: exp?.duration || '3 Hours',
      difficulty: exp?.difficulty || 'Moderate',
      pricePerPerson: String(exp?.pricePerPerson ?? '1200'),
      maxGroupSize: String(exp?.maxGroupSize ?? '12'),
      minAge: String(exp?.minAge ?? '10'),
      safetyGear: exp?.safetyGear.join(', ') || 'Helmet, First Aid Kit',
      highlights: exp?.highlights || '',
    });
    setExpModalOpen(true);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateExperiencePayload({
      title: expForm.title,
      duration: expForm.duration,
      pricePerPerson: Number(expForm.pricePerPerson),
      maxGroupSize: Number(expForm.maxGroupSize),
    });
    if (!validation.valid) {
      setExpErrors(validation.errors);
      return;
    }

    saveExperience(
      {
        title: expForm.title.trim(),
        category: expForm.category,
        location: expForm.location.trim(),
        duration: expForm.duration.trim(),
        difficulty: expForm.difficulty,
        pricePerPerson: Number(expForm.pricePerPerson),
        maxGroupSize: Number(expForm.maxGroupSize),
        minAge: Number(expForm.minAge || 0),
        safetyGear: expForm.safetyGear.split(',').map((s) => s.trim()).filter(Boolean),
        highlights: expForm.highlights.trim(),
        active: editingExp?.active ?? true,
      },
      editingExp?.id,
    );
    setExpModalOpen(false);
  };

  const handleAddGuide = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateGuidePayload({
      name: guideForm.name,
      phone: guideForm.phone,
      specialty: guideForm.specialty,
    });
    if (!validation.valid) {
      setGuideErrors(validation.errors);
      return;
    }

    addGuide({
      name: guideForm.name.trim(),
      phone: guideForm.phone.trim(),
      specialty: guideForm.specialty.trim(),
      languages: guideForm.languages.split(',').map((s) => s.trim()).filter(Boolean),
      experienceYears: Number(guideForm.experienceYears || 2),
      certified: true,
      onDuty: true,
    });
    setGuideModalOpen(false);
    setGuideForm({ name: '', phone: '', specialty: '', languages: 'Telugu, English', experienceYears: '3' });
  };

  const handleToggleOnline = (nextOnline: boolean) => {
    if (!nextOnline) {
      setOfflineConfirmOpen(true);
      return;
    }
    setIsOnline(true);
  };

  return (
    <VendorWorkspaceLayout
      vendor={vendor}
      portalTitle="Activities & Adventures Hub"
      portalSubtitle="Experiences & Guides"
      accentHex="#059669"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={logout}
      headerRight={
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-1.5 sm:flex">
            <span className="text-xs font-bold">{isOnline ? 'Accepting Slots' : 'Offline Mode'}</span>
            <Switch checked={isOnline} onCheckedChange={handleToggleOnline} />
          </div>
          <Button size="sm" onClick={() => openExperienceModal()}>
            <Plus className="h-4 w-4" /> New Experience
          </Button>
        </div>
      }
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div ref={kpiRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiMetricCard
              title="Experience Bookings"
              value={formatCurrency(metrics.grossRevenue)}
              subtitle="Across active trails"
              trend="+19.2%"
              icon={IndianRupee}
              accentClassName="bg-emerald-50 text-emerald-700"
            />
            <KpiMetricCard
              title="Scheduled Explorers"
              value={metrics.participantsCount}
              subtitle="Confirmed slot guests"
              icon={Users}
              accentClassName="bg-sky-50 text-sky-700"
            />
            <KpiMetricCard
              title="Live Experiences"
              value={metrics.activeExperiences}
              subtitle="Safety audited listings"
              icon={Compass}
              accentClassName="bg-violet-50 text-primary"
            />
            <KpiMetricCard
              title="Guides On Duty"
              value={metrics.onDutyGuides}
              subtitle="Certified field leads"
              icon={ShieldCheck}
              accentClassName="bg-amber-50 text-amber-700"
            />
          </div>

          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="font-display text-xl font-extrabold text-slate-950">Weekly Batch Participation Trend</CardTitle>
              <CardDescription>Participant demand trajectory across Araku, Vizag &amp; coastal activity slots.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220}>
                <AreaChart data={WEEKLY_DEMAND}>
                  <defs>
                    <linearGradient id="actDemGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
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
                  <Area type="monotone" dataKey="bookings" stroke="#059669" strokeWidth={2.5} fill="url(#actDemGrad)" name="Bookings" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'experiences' && (
        <div className="grid gap-4 md:grid-cols-2">
          {experiences.map((exp) => (
            <Card key={exp.id} className="bg-white">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <Badge variant="outline" className="mb-1.5">{exp.category} · {exp.difficulty}</Badge>
                  <CardTitle className="text-lg">{exp.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {exp.location} · {exp.duration}
                  </CardDescription>
                </div>
                <Switch checked={exp.active} onCheckedChange={() => toggleExperienceActive(exp.id)} />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs leading-relaxed text-slate-600">{exp.highlights}</p>
                <div className="flex flex-wrap gap-1.5">
                  {exp.safetyGear.map((gear) => (
                    <Badge key={gear} variant="success" className="text-[11px]">{gear}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-base font-extrabold text-primary">{formatCurrency(exp.pricePerPerson)}</span>
                    <span className="text-xs text-slate-500"> / person · Max {exp.maxGroupSize}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openExperienceModal(exp)}>
                    Edit Itinerary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="bg-white">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-mono text-xs font-bold text-primary">{b.reference} · {b.slotDate} ({b.slotTime})</p>
                  <h3 className="font-bold text-slate-900">{b.experienceTitle}</h3>
                  <p className="text-xs text-slate-500">
                    Lead: {b.leadTraveler} ({b.participants} guests) · Guide: {b.assignedGuide}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={b.status === 'Checked-In' ? 'success' : b.status === 'Cancelled' ? 'danger' : 'info'}>
                    {b.status}
                  </Badge>
                  <span className="font-extrabold">{formatCurrency(b.totalAmount)}</span>
                  {b.status === 'Confirmed' && (
                    <Button size="sm" onClick={() => updateBookingStatus(b.id, 'Checked-In')}>Check In Group</Button>
                  )}
                  {b.status === 'Checked-In' && (
                    <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'Completed')}>Complete</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setGuideErrors({}); setGuideModalOpen(true); }}>
              <UserPlus className="h-4 w-4" /> Add Certified Guide
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((g) => (
              <Card key={g.id} className="bg-white">
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900">{g.name}</h3>
                    <p className="text-xs font-semibold text-primary">{g.specialty}</p>
                    <p className="text-xs text-slate-500">{g.phone} · {g.experienceYears} yrs exp</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {g.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-[11px]">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={g.onDuty ? 'success' : 'outline'}>{g.onDuty ? 'On Duty' : 'Off Duty'}</Badge>
                    <Switch checked={g.onDuty} onCheckedChange={() => toggleGuideDuty(g.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <Card>
          <CardHeader>
            <CardTitle>Experience Capacity &amp; Guide Readiness</CardTitle>
            <CardDescription>Real-time batch utilization health check across published trails.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="rounded-xl border border-border p-4">
                <p className="font-bold text-slate-900">{exp.title}</p>
                <p className="mt-1 text-xs text-slate-500">Group cap: {exp.maxGroupSize} guests</p>
                <p className="mt-2 text-lg font-extrabold text-emerald-700">{formatCurrency(exp.pricePerPerson)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && <VendorSettingsHub />}

      {/* Experience Modal */}
      <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExp ? 'Edit Activity Experience' : 'Create Activity Experience'}</DialogTitle>
            <DialogDescription>Configure itinerary highlights, safety gear, and participant limits.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveExperience} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exp-title">Experience Title</Label>
              <Input
                id="exp-title"
                value={expForm.title}
                onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))}
              />
              {expErrors.title && <p className="text-xs font-semibold text-rose-600">{expErrors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-loc">Location</Label>
                <Input id="exp-loc" value={expForm.location} onChange={(e) => setExpForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-dur">Duration</Label>
                <Input id="exp-dur" value={expForm.duration} onChange={(e) => setExpForm((f) => ({ ...f, duration: e.target.value }))} />
                {expErrors.duration && <p className="text-xs font-semibold text-rose-600">{expErrors.duration}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-diff">Difficulty</Label>
                <SelectField
                  id="exp-diff"
                  value={expForm.difficulty}
                  onChange={(e) => setExpForm((f) => ({ ...f, difficulty: e.target.value as ExperienceDifficulty }))}
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Challenging">Challenging</option>
                </SelectField>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-price">Price / Guest</Label>
                <Input id="exp-price" type="number" value={expForm.pricePerPerson} onChange={(e) => setExpForm((f) => ({ ...f, pricePerPerson: e.target.value }))} />
                {expErrors.pricePerPerson && <p className="text-xs font-semibold text-rose-600">{expErrors.pricePerPerson}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-group">Max Group</Label>
                <Input id="exp-group" type="number" value={expForm.maxGroupSize} onChange={(e) => setExpForm((f) => ({ ...f, maxGroupSize: e.target.value }))} />
                {expErrors.maxGroupSize && <p className="text-xs font-semibold text-rose-600">{expErrors.maxGroupSize}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-gear">Safety Equipment (comma separated)</Label>
              <Input id="exp-gear" value={expForm.safetyGear} onChange={(e) => setExpForm((f) => ({ ...f, safetyGear: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-desc">Experience Highlights</Label>
              <Textarea id="exp-desc" rows={3} value={expForm.highlights} onChange={(e) => setExpForm((f) => ({ ...f, highlights: e.target.value }))} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setExpModalOpen(false)}>Cancel</Button>
              <Button type="submit">Publish Experience</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Guide Modal */}
      <Dialog open={guideModalOpen} onOpenChange={setGuideModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Certified Guide</DialogTitle>
            <DialogDescription>Add an experienced trek lead or water-safety instructor to dispatch.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGuide} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="guide-name">Full Name</Label>
              <Input id="guide-name" value={guideForm.name} onChange={(e) => setGuideForm((g) => ({ ...g, name: e.target.value }))} />
              {guideErrors.name && <p className="text-xs font-semibold text-rose-600">{guideErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guide-phone">Contact Phone</Label>
              <Input id="guide-phone" value={guideForm.phone} onChange={(e) => setGuideForm((g) => ({ ...g, phone: e.target.value }))} />
              {guideErrors.phone && <p className="text-xs font-semibold text-rose-600">{guideErrors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="guide-spec">Specialty</Label>
              <Input id="guide-spec" value={guideForm.specialty} onChange={(e) => setGuideForm((g) => ({ ...g, specialty: e.target.value }))} />
              {guideErrors.specialty && <p className="text-xs font-semibold text-rose-600">{guideErrors.specialty}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGuideModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Guide</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Offline Confirmation Dialog */}
      <Dialog open={offlineConfirmOpen} onOpenChange={setOfflineConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pause Activity Bookings?</DialogTitle>
            <DialogDescription>
              Switching to Offline Mode hides upcoming time slots from new traveler checkouts until you resume.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfflineConfirmOpen(false)}>Keep Online</Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsOnline(false);
                setOfflineConfirmOpen(false);
              }}
            >
              Confirm Go Offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </VendorWorkspaceLayout>
  );
}

