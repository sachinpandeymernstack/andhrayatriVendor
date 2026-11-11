import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  ExternalLink,
  ImagePlus,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVendorToast } from '@/context/VendorNotificationContext';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { mapZodErrors, vendorBusinessInfoSchema } from '@/lib/validation';

export function BusinessLocationStep() {
  const { draft, updateBusinessInfo, updateLocation, setActiveStep } = useVendorOnboarding();
  const { showToast } = useVendorToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);

  const info = draft.businessInfo;
  const loc = info.location;

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      showToast('Browser geolocation is unavailable. Enter coordinates manually.', 'warning');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        updateLocation({
          latitude: lat,
          longitude: lng,
          mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
        });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          if (res.ok) {
            const data = (await res.json()) as {
              address?: {
                road?: string;
                suburb?: string;
                city?: string;
                town?: string;
                village?: string;
                state?: string;
                postcode?: string;
                country?: string;
              };
            };
            const addr = data.address;
            if (addr) {
              updateLocation({
                addressLine1: addr.road || addr.suburb || loc.addressLine1,
                city: addr.city || addr.town || addr.village || loc.city,
                state: addr.state || loc.state || 'Andhra Pradesh',
                pincode: addr.postcode || loc.pincode,
                country: addr.country || 'India',
              });
            }
          }
        } catch {
          // Coordinates already captured even if reverse geocode lookup is offline.
        } finally {
          setLocating(false);
          showToast('GPS location captured successfully.', 'success');
        }
      },
      () => {
        setLocating(false);
        showToast('Unable to retrieve device location. Please enter address manually.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateBusinessInfo({ bannerUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    const payload = {
      businessName: info.businessName,
      ownerName: info.ownerName,
      phone: info.phone,
      email: info.email,
      addressLine1: loc.addressLine1,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      country: loc.country,
    };

    const validation = mapZodErrors(vendorBusinessInfoSchema, payload);
    if (!validation.success) {
      setErrors(validation.errors);
      showToast('Please correct highlighted fields before proceeding.', 'error');
      return;
    }

    setErrors({});
    setActiveStep(2);
  };

  return (
    <Card className="mx-auto max-w-4xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-1.5 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
            1
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 1 of 4</span>
        </div>
        <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
          Business Information &amp; Location
        </CardTitle>
        <CardDescription>
          Enter your legal business details, storefront address, and pin exact GPS coordinates for travelers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="biz-name">Business Name</Label>
            <Input
              id="biz-name"
              placeholder="e.g. Vizag Seafront Residency"
              value={info.businessName}
              aria-invalid={Boolean(errors.businessName)}
              onChange={(e) => {
                updateBusinessInfo({ businessName: e.target.value });
                if (errors.businessName) setErrors((p) => ({ ...p, businessName: '' }));
              }}
            />
            {errors.businessName && <p className="text-xs font-semibold text-rose-600">{errors.businessName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner-name">Owner Name</Label>
            <Input
              id="owner-name"
              placeholder="Full name of proprietor / director"
              value={info.ownerName}
              aria-invalid={Boolean(errors.ownerName)}
              onChange={(e) => {
                updateBusinessInfo({ ownerName: e.target.value });
                if (errors.ownerName) setErrors((p) => ({ ...p, ownerName: '' }));
              }}
            />
            {errors.ownerName && <p className="text-xs font-semibold text-rose-600">{errors.ownerName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biz-mobile">Mobile Number</Label>
            <Input
              id="biz-mobile"
              placeholder="10-digit mobile number"
              value={info.phone}
              aria-invalid={Boolean(errors.phone)}
              onChange={(e) => {
                updateBusinessInfo({ phone: e.target.value });
                if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
              }}
            />
            {errors.phone && <p className="text-xs font-semibold text-rose-600">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biz-email">Email Address</Label>
            <Input
              id="biz-email"
              type="email"
              placeholder="contact@yourbusiness.com"
              value={info.email}
              aria-invalid={Boolean(errors.email)}
              onChange={(e) => {
                updateBusinessInfo({ email: e.target.value });
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
              }}
            />
            {errors.email && <p className="text-xs font-semibold text-rose-600">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biz-alt-mobile">Alternate Mobile / Reception Desk</Label>
            <Input
              id="biz-alt-mobile"
              placeholder="Optional backup phone"
              value={info.alternateNumber || ''}
              onChange={(e) => updateBusinessInfo({ alternateNumber: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="biz-website">Website or Social Link</Label>
            <Input
              id="biz-website"
              placeholder="https://..."
              value={info.website || ''}
              onChange={(e) => updateBusinessInfo({ website: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="biz-areas">Service Areas / Nearby Landmarks</Label>
            <Input
              id="biz-areas"
              placeholder="e.g. RK Beach, Rushikonda, Bheemili Coastal Corridor"
              value={info.serviceAreas || ''}
              onChange={(e) => updateBusinessInfo({ serviceAreas: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="biz-description">About Your Business</Label>
            <Textarea
              id="biz-description"
              rows={3}
              placeholder="Share what makes your property, dining, craft, or tour memorable for Andhra Yatri guests..."
              value={info.description || ''}
              onChange={(e) => updateBusinessInfo({ description: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="biz-banner">Cover Banner Image</Label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition">
                <ImagePlus className="h-4 w-4" />
                Upload Storefront Banner
                <input id="biz-banner" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              </label>
              {info.bannerUrl && (
                <div className="relative">
                  <img
                    src={info.bannerUrl}
                    alt="Cover preview"
                    className="h-14 w-28 rounded-xl border border-slate-200 object-cover shadow-2xs"
                  />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Address &amp; Geolocation</h3>
                <p className="text-xs text-slate-500">Auto-fill via browser GPS or type coordinates manually</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGeolocate}
              disabled={locating}
              className="border-primary/20 bg-white font-bold text-primary hover:bg-violet-50"
            >
              <Crosshair className="h-4 w-4" />
              {locating ? 'Detecting GPS...' : 'Use Current Location'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-addr1">Address Line 1</Label>
              <Input
                id="loc-addr1"
                placeholder="Building number, street, locality"
                value={loc.addressLine1}
                aria-invalid={Boolean(errors.addressLine1)}
                onChange={(e) => {
                  updateLocation({ addressLine1: e.target.value });
                  if (errors.addressLine1) setErrors((p) => ({ ...p, addressLine1: '' }));
                }}
              />
              {errors.addressLine1 && <p className="text-xs font-semibold text-rose-600">{errors.addressLine1}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="loc-addr2">Address Line 2 (Landmark / Floor)</Label>
              <Input
                id="loc-addr2"
                placeholder="Optional landmark"
                value={loc.addressLine2}
                onChange={(e) => updateLocation({ addressLine2: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-city">City</Label>
              <Input
                id="loc-city"
                placeholder="e.g. Visakhapatnam"
                value={loc.city}
                aria-invalid={Boolean(errors.city)}
                onChange={(e) => {
                  updateLocation({ city: e.target.value });
                  if (errors.city) setErrors((p) => ({ ...p, city: '' }));
                }}
              />
              {errors.city && <p className="text-xs font-semibold text-rose-600">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-state">State / Province</Label>
              <Input
                id="loc-state"
                placeholder="Andhra Pradesh"
                value={loc.state}
                aria-invalid={Boolean(errors.state)}
                onChange={(e) => {
                  updateLocation({ state: e.target.value });
                  if (errors.state) setErrors((p) => ({ ...p, state: '' }));
                }}
              />
              {errors.state && <p className="text-xs font-semibold text-rose-600">{errors.state}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-pincode">Pincode / ZIP</Label>
              <Input
                id="loc-pincode"
                placeholder="6-digit PIN code"
                value={loc.pincode}
                aria-invalid={Boolean(errors.pincode)}
                onChange={(e) => {
                  updateLocation({ pincode: e.target.value });
                  if (errors.pincode) setErrors((p) => ({ ...p, pincode: '' }));
                }}
              />
              {errors.pincode && <p className="text-xs font-semibold text-rose-600">{errors.pincode}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-country">Country</Label>
              <Input
                id="loc-country"
                value={loc.country}
                onChange={(e) => updateLocation({ country: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-lat">Latitude</Label>
              <Input
                id="loc-lat"
                placeholder="17.6868"
                value={loc.latitude}
                onChange={(e) => updateLocation({ latitude: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-lng">Longitude</Label>
              <Input
                id="loc-lng"
                placeholder="83.2185"
                value={loc.longitude}
                onChange={(e) => updateLocation({ longitude: e.target.value })}
              />
            </div>
          </div>

          {loc.latitude && loc.longitude && (
            <a
              href={loc.mapLink || `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Verify pinned coordinates on Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={() => setActiveStep(0)}>
            <ArrowLeft className="h-4 w-4" /> Change Category
          </Button>
          <Button type="button" size="lg" onClick={handleNext}>
            Next Step <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
