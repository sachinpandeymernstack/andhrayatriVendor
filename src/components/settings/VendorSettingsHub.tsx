import React, { useState } from 'react';
import { Bell, Building2, Landmark, LogOut, Save, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useUpdateVendorProfileMutation } from '@/hooks/queries/useVendorQueries';
import { resolveMediaUrl } from '@/lib/mediaUtils';

export function VendorSettingsHub() {
  const { vendor, logout } = useVendorAuth();
  const updateProfileMutation = useUpdateVendorProfileMutation();

  const [formState, setFormState] = useState({
    businessName: String(vendor?.businessName || vendor?.business_name || ''),
    ownerName: String(vendor?.ownerName || vendor?.owner_name || ''),
    email: String(vendor?.email || vendor?.businessEmail || ''),
    mobile: String(vendor?.mobile || vendor?.phone || ''),
    alternateNumber: String(vendor?.alternateNumber || ''),
    website: String(vendor?.website || ''),
    serviceAreas: String(vendor?.serviceAreas || ''),
    description: String(vendor?.description || ''),
    addressLine1: String(vendor?.location?.addressLine1 || vendor?.location?.street || ''),
    city: String(vendor?.location?.city || ''),
    state: String(vendor?.location?.state || 'Andhra Pradesh'),
    postalCode: String(vendor?.location?.postalCode || ''),
    gstNumber: String(vendor?.documents?.gstNumber || vendor?.documents?.gstin || ''),
    fssaiNumber: String(vendor?.documents?.fssaiNumber || ''),
    panNumber: String(vendor?.documents?.panNumber || ''),
    accountHolderName: String(vendor?.bank_details?.accountHolderName || vendor?.bankDetails?.accountHolderName || ''),
    bankName: String(vendor?.bank_details?.bankName || vendor?.bankDetails?.bankName || ''),
    bankAccountNumber: String(vendor?.bank_details?.bankAccountNumber || vendor?.bankDetails?.accountNumber || ''),
    ifscCode: String(vendor?.bank_details?.ifscCode || vendor?.bankDetails?.ifsc || ''),
  });

  const [prefs, setPrefs] = useState({
    orderAlerts: true,
    smsNotifications: true,
    payoutDigests: true,
    promotionalOptIn: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      businessName: formState.businessName,
      ownerName: formState.ownerName,
      email: formState.email,
      mobile: formState.mobile,
      phone: formState.mobile,
      alternateNumber: formState.alternateNumber,
      website: formState.website,
      serviceAreas: formState.serviceAreas,
      description: formState.description,
      location: {
        ...(vendor?.location || {}),
        addressLine1: formState.addressLine1,
        city: formState.city,
        state: formState.state,
        postalCode: formState.postalCode,
        country: vendor?.location?.country || 'India',
      },
      documents: {
        ...(vendor?.documents || {}),
        gstNumber: formState.gstNumber,
        fssaiNumber: formState.fssaiNumber,
        panNumber: formState.panNumber,
      },
      bank_details: {
        ...(vendor?.bank_details || {}),
        accountHolderName: formState.accountHolderName,
        bankName: formState.bankName,
        bankAccountNumber: formState.bankAccountNumber,
        ifscCode: formState.ifscCode.toUpperCase(),
      },
    });
  };

  const logoPreview = resolveMediaUrl(String(vendor?.logoUrl || vendor?.logo || ''));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-2xl shadow-2xs">
          <TabsTrigger value="profile" className="rounded-xl font-bold">
            <Building2 className="h-4 w-4" /> Business & Bank Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl font-bold">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl font-bold">
            <ShieldCheck className="h-4 w-4" /> Account & Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="font-display text-xl font-extrabold text-slate-950">
                  Business Identity &amp; Location
                </CardTitle>
                <CardDescription>
                  Keep your storefront contact info and Andhra Pradesh address accurate for travelers.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
                {logoPreview && (
                  <div className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 md:col-span-2">
                    <img
                      src={logoPreview}
                      alt={formState.businessName}
                      className="h-14 w-14 rounded-xl border border-violet-200 object-cover shadow-2xs"
                    />
                    <div className="text-xs text-slate-500">
                      <p className="font-bold text-slate-900">Active Brand Logo</p>
                      <p>Managed via onboarding media &amp; verified partner profile</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="settings-business-name">Business Name</Label>
                  <Input
                    id="settings-business-name"
                    value={formState.businessName}
                    onChange={(e) => setFormState((s) => ({ ...s, businessName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-owner-name">Owner Name</Label>
                  <Input
                    id="settings-owner-name"
                    value={formState.ownerName}
                    onChange={(e) => setFormState((s) => ({ ...s, ownerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-email">Business Email</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-mobile">Mobile Number</Label>
                  <Input
                    id="settings-mobile"
                    value={formState.mobile}
                    onChange={(e) => setFormState((s) => ({ ...s, mobile: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-website">Website / Booking URL</Label>
                  <Input
                    id="settings-website"
                    value={formState.website}
                    onChange={(e) => setFormState((s) => ({ ...s, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-areas">Service Areas</Label>
                  <Input
                    id="settings-areas"
                    value={formState.serviceAreas}
                    onChange={(e) => setFormState((s) => ({ ...s, serviceAreas: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="settings-desc">Business Description</Label>
                  <Textarea
                    id="settings-desc"
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="settings-address">Street Address</Label>
                  <Input
                    id="settings-address"
                    value={formState.addressLine1}
                    onChange={(e) => setFormState((s) => ({ ...s, addressLine1: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-city">City</Label>
                  <Input
                    id="settings-city"
                    value={formState.city}
                    onChange={(e) => setFormState((s) => ({ ...s, city: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-state">State</Label>
                    <Input
                      id="settings-state"
                      value={formState.state}
                      onChange={(e) => setFormState((s) => ({ ...s, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-zip">Postal Code</Label>
                    <Input
                      id="settings-zip"
                      value={formState.postalCode}
                      onChange={(e) => setFormState((s) => ({ ...s, postalCode: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="flex items-center gap-2 font-display text-xl font-extrabold text-slate-950">
                  <Landmark className="h-5 w-5 text-primary" /> Compliance &amp; Settlement Bank Details
                </CardTitle>
                <CardDescription>
                  Tax identifiers and NEFT/IMPS payout destination synced with Andhra Yatri Finance.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-gst">GSTIN</Label>
                  <Input
                    id="settings-gst"
                    value={formState.gstNumber}
                    onChange={(e) => setFormState((s) => ({ ...s, gstNumber: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-pan">PAN Number</Label>
                  <Input
                    id="settings-pan"
                    value={formState.panNumber}
                    onChange={(e) => setFormState((s) => ({ ...s, panNumber: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-fssai">FSSAI License (if Food/Hospitality)</Label>
                  <Input
                    id="settings-fssai"
                    value={formState.fssaiNumber}
                    onChange={(e) => setFormState((s) => ({ ...s, fssaiNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-holder">Account Holder Name</Label>
                  <Input
                    id="settings-holder"
                    value={formState.accountHolderName}
                    onChange={(e) => setFormState((s) => ({ ...s, accountHolderName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-bank">Bank Name</Label>
                  <Input
                    id="settings-bank"
                    value={formState.bankName}
                    onChange={(e) => setFormState((s) => ({ ...s, bankName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-acc">Account No.</Label>
                    <Input
                      id="settings-acc"
                      value={formState.bankAccountNumber}
                      onChange={(e) => setFormState((s) => ({ ...s, bankAccountNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-ifsc">IFSC</Label>
                    <Input
                      id="settings-ifsc"
                      value={formState.ifscCode}
                      onChange={(e) => setFormState((s) => ({ ...s, ifscCode: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 md:col-span-3 border-t border-slate-100">
                  <Button type="submit" size="lg" className="font-bold px-6" disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Partner Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="font-display text-xl font-extrabold text-slate-950">
                Alert &amp; Digest Preferences
              </CardTitle>
              <CardDescription>Choose how booking, order, and settlement alerts reach your desk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {[
                {
                  key: 'orderAlerts' as const,
                  title: 'Instant Booking & Order Alerts',
                  desc: 'Play real-time browser sound and badge alerts when a new customer order arrives.',
                },
                {
                  key: 'smsNotifications' as const,
                  title: 'SMS Confirmation Dispatches',
                  desc: 'Send backup SMS alerts to the primary registered vendor mobile number.',
                },
                {
                  key: 'payoutDigests' as const,
                  title: 'Daily Settlement Summaries',
                  desc: 'Receive an end-of-day GST invoice & NEFT settlement summary by email.',
                },
                {
                  key: 'promotionalOptIn' as const,
                  title: 'APTDC Festival Spotlight Campaigns',
                  desc: 'Receive early invites to state tourism promotional bundles and seasonal banners.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:bg-slate-50"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [item.key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="pt-4">
          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="flex items-center gap-2 font-display text-xl font-extrabold text-slate-950">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Partner Session &amp; Verification
              </CardTitle>
              <CardDescription>
                Active vendor ID: <span className="font-mono font-bold text-primary">{String(vendor?._id || vendor?.id || 'LOCAL-PARTNER')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Sign out of Vendor Portal</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clears your local session token and returns to vendor.andhrayatri.com/login.
                </p>
              </div>
              <Button type="button" variant="destructive" className="font-bold" onClick={logout}>
                <LogOut className="h-4 w-4" /> Logout Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
