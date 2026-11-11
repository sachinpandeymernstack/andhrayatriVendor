import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Crosshair,
  ExternalLink,
  ImagePlus,
  MapPin,
  Building2,
  Navigation,
  Sparkles,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Globe,
  Compass,
  Phone,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectField } from '@/components/ui/select';
import { useVendorToast } from '@/context/VendorNotificationContext';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { mapZodErrors, vendorBusinessInfoSchema } from '@/lib/validation';
import {
  getIndianStates,
  getCitiesForState,
  findStateCodeByName,
  lookupPostalPincode,
  reverseGeocodeCoordinates,
} from '@/api/geoClient';

// Famous travel hubs in Andhra Pradesh for quick 1-click test placement
const ANDHRA_TRAVEL_HUBS = [
  { name: '🏖️ Vizag RK Beach', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.7126, lng: 83.3197, pin: '530002' },
  { name: '🛕 Tirupati Temple Hub', city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192, pin: '517501' },
  { name: '🏛️ Vijayawada Benz Circle', city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, pin: '520010' },
  { name: '🛶 Rajahmundry Godavari', city: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040, pin: '533101' },
];

export function BusinessLocationStep() {
  const { draft, updateBusinessInfo, updateLocation, setActiveStep } = useVendorOnboarding();
  const { showToast } = useVendorToast();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [suggestedAreas, setSuggestedAreas] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [, startTransition] = useTransition();

  const info = draft.businessInfo;
  const loc = info.location;

  // Selected state ISO code (defaults to AP for Andhra Pradesh)
  const [selectedStateCode, setSelectedStateCode] = useState<string>(() =>
    findStateCodeByName(loc.state || 'Andhra Pradesh'),
  );

  // States list using country-state-city
  const indianStates = useMemo(() => getIndianStates(), []);

  // Cities list dynamically fetched based on chosen state
  const availableCities = useMemo(
    () => getCitiesForState(selectedStateCode),
    [selectedStateCode],
  );

  // Sync state code if loc.state changes from outside
  useEffect(() => {
    if (loc.state) {
      const code = findStateCodeByName(loc.state);
      if (code !== selectedStateCode) {
        setSelectedStateCode(code);
      }
    }
  }, [loc.state, selectedStateCode]);

  // Handle State Dropdown Change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedStateCode(code);
    const matchedState = indianStates.find((s) => s.isoCode === code);
    const stateName = matchedState ? matchedState.name : 'Andhra Pradesh';

    updateLocation({
      state: stateName,
      // If previous city doesn't exist in new state, reset city
      city: '',
    });

    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: '' }));
    }
  };

  // Handle City Dropdown Change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    const cityObj = availableCities.find((c) => c.name === cityName);

    const updatePayload: Record<string, string> = { city: cityName };

    // Auto-suggest latitude and longitude if coordinates are not set
    if (cityObj?.latitude && cityObj?.longitude && (!loc.latitude || !loc.longitude)) {
      const lat = parseFloat(cityObj.latitude).toFixed(6);
      const lng = parseFloat(cityObj.longitude).toFixed(6);
      updatePayload.latitude = lat;
      updatePayload.longitude = lng;
      updatePayload.mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    updateLocation(updatePayload);

    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: '' }));
    }
  };

  // Smart PIN Code Lookup: Auto-fetches Area, City, and State when 6 digits are typed
  const handlePincodeChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    updateLocation({ pincode: clean });

    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: '' }));
    }

    if (clean.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus('Searching postal registry...');

      try {
        const res = await lookupPostalPincode(clean);
        if (res && res.success) {
          const matchedCode = res.state_code || findStateCodeByName(res.state);
          setSelectedStateCode(matchedCode);

          const updates: Record<string, string> = {
            state: res.state,
            city: res.city,
            pincode: clean,
          };

          // If coordinates are currently empty, auto-fill with postal coordinates
          if ((!loc.latitude || !loc.longitude) && res.latitude && res.longitude) {
            const latStr = res.latitude.toFixed(6);
            const lngStr = res.longitude.toFixed(6);
            updates.latitude = latStr;
            updates.longitude = lngStr;
            updates.mapLink = `https://www.google.com/maps?q=${latStr},${lngStr}`;
          }

          updateLocation(updates);

          if (res.areas && res.areas.length > 0) {
            setSuggestedAreas(res.areas);
          } else {
            setSuggestedAreas([]);
          }

          setPincodeStatus(`✓ ${res.city}, ${res.state}`);
          showToast(`PIN Code verified: ${res.city}, ${res.state}`, 'success');
        } else {
          setPincodeStatus(null);
        }
      } catch (err) {
        console.warn('Pincode lookup failed:', err);
        setPincodeStatus('Valid 6-digit format');
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeStatus(null);
      setSuggestedAreas([]);
    }
  };

  // High Accuracy GPS Geolocation via Browser
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
          const geoData = await reverseGeocodeCoordinates(
            pos.coords.latitude,
            pos.coords.longitude,
          );

          if (geoData && geoData.success) {
            const updates: Record<string, string> = {
              latitude: lat,
              longitude: lng,
              mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
            };

            if (geoData.address_line1 && !loc.addressLine1) {
              updates.addressLine1 = geoData.address_line1;
            }
            if (geoData.city) {
              updates.city = geoData.city;
            }
            if (geoData.state) {
              updates.state = geoData.state;
              setSelectedStateCode(findStateCodeByName(geoData.state));
            }
            if (geoData.pincode && geoData.pincode.length === 6) {
              updates.pincode = geoData.pincode;
            }

            updateLocation(updates);
          }
        } catch {
          // Keep GPS coordinates even if reverse lookup fails
        } finally {
          setLocating(false);
          showToast(`Exact GPS pinned: ${lat}, ${lng}`, 'success');
        }
      },
      () => {
        setLocating(false);
        showToast('Unable to detect GPS. Please select location on map or enter coordinates.', 'error');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  // Copy Google Maps link to clipboard
  const handleCopyMapLink = () => {
    const link =
      loc.mapLink ||
      (loc.latitude && loc.longitude
        ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
        : '');

    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showToast('Google Maps coordinates link copied to clipboard.', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Storefront cover banner upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Cover photo must be under 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateBusinessInfo({ bannerUrl: reader.result });
        showToast('Storefront cover photo uploaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation & Proceed to Step 2
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
    };

    const validation = mapZodErrors(vendorBusinessInfoSchema, payload);
    if (!validation.success) {
      setErrors(validation.errors);
      showToast('Please complete all highlighted mandatory fields.', 'error');

      // Scroll to the first error smoothly
      const firstErrorKey = Object.keys(validation.errors)[0];
      const el = document.getElementById(
        firstErrorKey === 'addressLine1' ? 'loc-addr1' : `biz-${firstErrorKey}`,
      );
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    startTransition(() => {
      setActiveStep(2);
    });
  };

  // Coordinates preview query for Google Maps embed
  const currentLat = parseFloat(loc.latitude) || 17.6868;
  const currentLng = parseFloat(loc.longitude) || 83.2185;
  const hasCoordinates = Boolean(loc.latitude && loc.longitude);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Step Wizard Header */}
      <Card className="border-slate-200/80 bg-white/95 backdrop-blur shadow-xl shadow-slate-900/5 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500" />
        <CardHeader className="space-y-2 border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-xs font-black text-white shadow-md shadow-violet-500/20">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 1 of 4 • Business Setup
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 text-[11px] font-bold text-violet-700">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
              Official Andhra Yatri Partner Registry
            </div>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Storefront Identity &amp; Smart Geolocation
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Register your official business storefront, enter your 6-digit PIN code for instant postal auto-fill, and pin exact Google Maps coordinates for Andhra Yatri travelers.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* SECTION 1: BUSINESS IDENTITY & OWNER CONTACT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Business &amp; Proprietor Identity
                </h3>
                <p className="text-xs text-slate-500">
                  Official trade name and primary contact details for guest correspondence
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Business Name */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-businessName" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Legal / Trade Business Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="biz-businessName"
                  placeholder="e.g. Vizag Seafront Residency & Suites"
                  value={info.businessName}
                  aria-invalid={Boolean(errors.businessName)}
                  onChange={(e) => {
                    updateBusinessInfo({ businessName: e.target.value });
                    if (errors.businessName) setErrors((p) => ({ ...p, businessName: '' }));
                  }}
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
                {errors.businessName && (
                  <p className="text-xs font-semibold text-rose-600">{errors.businessName}</p>
                )}
              </div>

              {/* Owner / Proprietor Name */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-ownerName" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Owner / Proprietor Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="biz-ownerName"
                  placeholder="Full name as per Aadhaar / PAN"
                  value={info.ownerName}
                  aria-invalid={Boolean(errors.ownerName)}
                  onChange={(e) => {
                    updateBusinessInfo({ ownerName: e.target.value });
                    if (errors.ownerName) setErrors((p) => ({ ...p, ownerName: '' }));
                  }}
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
                {errors.ownerName && (
                  <p className="text-xs font-semibold text-rose-600">{errors.ownerName}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-phone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Registered Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative flex rounded-xl border border-input bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition">
                  <span className="flex items-center pl-3.5 pr-2.5 font-mono text-xs font-bold text-slate-500 border-r border-slate-200">
                    +91
                  </span>
                  <input
                    id="biz-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={info.phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateBusinessInfo({ phone: clean });
                      if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm font-mono font-medium focus:outline-none"
                  />
                </div>
                {errors.phone && <p className="text-xs font-semibold text-rose-600">{errors.phone}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Business Email Address <span className="text-rose-500">*</span>
                </Label>
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
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
                {errors.email && <p className="text-xs font-semibold text-rose-600">{errors.email}</p>}
              </div>

              {/* Alternate Mobile */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-alternateNumber" className="text-xs font-bold text-slate-700">
                  Alternate Phone / Front Desk (Optional)
                </Label>
                <Input
                  id="biz-alternateNumber"
                  type="tel"
                  placeholder="e.g. 0891-2500000 or 98480xxxxx"
                  value={info.alternateNumber || ''}
                  onChange={(e) => updateBusinessInfo({ alternateNumber: e.target.value })}
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="biz-website" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Website / Google Business URL (Optional)
                </Label>
                <Input
                  id="biz-website"
                  type="url"
                  placeholder="https://www.yourstorefront.com"
                  value={info.website || ''}
                  onChange={(e) => updateBusinessInfo({ website: e.target.value })}
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
              </div>

              {/* Service Areas */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-serviceAreas" className="text-xs font-bold text-slate-700">
                  Service Corridors / Popular Nearby Landmarks
                </Label>
                <Input
                  id="biz-serviceAreas"
                  placeholder="e.g. RK Beach, Rushikonda, Simhachalam Foothills, Bheemili Highway"
                  value={info.serviceAreas || ''}
                  onChange={(e) => updateBusinessInfo({ serviceAreas: e.target.value })}
                  className="bg-slate-50/50 focus:bg-white text-sm font-medium"
                />
              </div>

              {/* About description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="biz-description" className="text-xs font-bold text-slate-700">
                  Storefront Highlights &amp; Introduction
                </Label>
                <Textarea
                  id="biz-description"
                  rows={2}
                  placeholder="Tell travelers what makes your property, dining specialty, handcrafted tour, or boutique authentic..."
                  value={info.description || ''}
                  onChange={(e) => updateBusinessInfo({ description: e.target.value })}
                  className="bg-slate-50/50 focus:bg-white text-sm leading-relaxed"
                />
              </div>

              {/* Cover Banner Upload */}
              <div className="space-y-2 sm:col-span-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <Label htmlFor="biz-banner" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4 text-violet-600" />
                  Storefront Cover Photo / Exterior Banner
                </Label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-violet-400 bg-violet-50/60 px-4 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition shadow-2xs">
                    <ImagePlus className="h-4 w-4 text-violet-600" />
                    Upload Storefront Photo
                    <input id="biz-banner" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                  {info.bannerUrl ? (
                    <div className="relative">
                      <img
                        src={info.bannerUrl}
                        alt="Storefront Banner Preview"
                        className="h-16 w-32 rounded-xl border border-slate-200 object-cover shadow-sm"
                      />
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] text-white font-bold shadow">
                        ✓
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Recommended: High-resolution exterior banner (PNG/JPG, max 5MB)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: SMART ADDRESS & POSTAL REGION DROPDOWNS */}
          <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 to-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Postal Address &amp; Region
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      <Sparkles className="h-3 w-3" /> Auto-Fetch PIN Code
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Type your 6-digit PIN code to automatically populate State, City, and Local Area
                  </p>
                </div>
              </div>

              {pincodeStatus && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {pincodeStatus}
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* PINCODE FIELD (Hero input with auto-fetch) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="loc-pincode" className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Postal PIN Code <span className="text-rose-500">*</span></span>
                  {pincodeLoading && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600">
                      <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="loc-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 530001"
                    value={loc.pincode}
                    aria-invalid={Boolean(errors.pincode)}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="font-mono text-base tracking-widest font-bold bg-white border-violet-200 focus:border-violet-500 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    {pincodeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
                {errors.pincode ? (
                  <p className="text-xs font-semibold text-rose-600">{errors.pincode}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Entering 6 digits instantly verifies region and areas
                  </p>
                )}
              </div>

              {/* STATE DROPDOWN (country-state-city) */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-state" className="text-xs font-bold text-slate-800">
                  State / Union Territory <span className="text-rose-500">*</span>
                </Label>
                <SelectField
                  id="loc-state"
                  value={selectedStateCode}
                  onChange={handleStateChange}
                  className="font-medium bg-white"
                >
                  {indianStates.map((st) => (
                    <option key={st.isoCode} value={st.isoCode}>
                      {st.name} {st.isoCode === 'AP' ? '★ (Andhra Pradesh)' : ''}
                    </option>
                  ))}
                </SelectField>
                {errors.state && <p className="text-xs font-semibold text-rose-600">{errors.state}</p>}
              </div>

              {/* CITY DROPDOWN (country-state-city dynamic) */}
              <div className="space-y-1.5">
                <Label htmlFor="loc-city" className="text-xs font-bold text-slate-800">
                  City / District <span className="text-rose-500">*</span>
                </Label>
                <SelectField
                  id="loc-city"
                  value={loc.city}
                  onChange={handleCityChange}
                  className="font-medium bg-white"
                >
                  <option value="">-- Select City ({availableCities.length} available) --</option>
                  {availableCities.map((ct) => (
                    <option key={`${ct.name}-${ct.latitude}`} value={ct.name}>
                      {ct.name}
                    </option>
                  ))}
                  {/* Keep current city if not in predefined list */}
                  {loc.city && !availableCities.some((c) => c.name === loc.city) && (
                    <option value={loc.city}>{loc.city}</option>
                  )}
                </SelectField>
                {errors.city && <p className="text-xs font-semibold text-rose-600">{errors.city}</p>}
              </div>

              {/* Suggested Locality / Area Pills */}
              <AnimatePresence>
                {suggestedAreas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="sm:col-span-2 lg:col-span-3 rounded-xl bg-violet-50/70 border border-violet-200/80 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                      <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                      Postal Localities in {loc.pincode} (Click to set as Area/Landmark):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedAreas.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            updateLocation({ addressLine2: area });
                            showToast(`Selected area: ${area}`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-violet-800 hover:bg-violet-600 hover:text-white border border-violet-200 shadow-2xs transition cursor-pointer"
                        >
                          + {area}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Street Address Line 1 */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="loc-addr1" className="text-xs font-bold text-slate-800">
                  Building No., Street, Floor &amp; Door Address <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="loc-addr1"
                  placeholder="e.g. Door No. 48-12-5/A, Beach Road, Near Harbour View"
                  value={loc.addressLine1}
                  aria-invalid={Boolean(errors.addressLine1)}
                  onChange={(e) => {
                    updateLocation({ addressLine1: e.target.value });
                    if (errors.addressLine1) setErrors((p) => ({ ...p, addressLine1: '' }));
                  }}
                  className="bg-white font-medium"
                />
                {errors.addressLine1 && (
                  <p className="text-xs font-semibold text-rose-600">{errors.addressLine1}</p>
                )}
              </div>

              {/* Landmark Address Line 2 */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="loc-addr2" className="text-xs font-bold text-slate-800">
                  Landmark / Neighborhood / Sector
                </Label>
                <Input
                  id="loc-addr2"
                  placeholder="e.g. Opposite Novotel / Near Collectorate"
                  value={loc.addressLine2}
                  onChange={(e) => updateLocation({ addressLine2: e.target.value })}
                  className="bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: GOOGLE MAPS & GPS GEOLOCATION STUDIO */}
          <div className="space-y-5 rounded-2xl border border-slate-200/90 bg-slate-900 text-white p-5 sm:p-7 shadow-xl overflow-hidden relative">
            {/* Background Map glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/40">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Google Maps &amp; High-Precision Geolocation
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      Live Pinned
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Provides exact turn-by-turn navigation for tourists and Andhra Yatri fleet drivers
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeolocate}
                  disabled={locating}
                  className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 font-bold transition flex items-center gap-1.5"
                >
                  <Crosshair className={`h-4 w-4 text-emerald-400 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? 'Acquiring Satellites...' : 'Detect Exact GPS'}
                </Button>

                {hasCoordinates && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyMapLink}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? 'Copied' : 'Copy Coordinates'}
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Hub Presets */}
            <div className="relative z-10 space-y-2">
              <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                Quick Hub Shortcuts (Click to Pin Landmark):
              </span>
              <div className="flex flex-wrap gap-2">
                {ANDHRA_TRAVEL_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => {
                      updateLocation({
                        latitude: hub.lat.toString(),
                        longitude: hub.lng.toString(),
                        city: hub.city,
                        state: hub.state,
                        pincode: hub.pin,
                        mapLink: `https://www.google.com/maps?q=${hub.lat},${hub.lng}`,
                      });
                      setSelectedStateCode('AP');
                      showToast(`Pinned ${hub.name}`, 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-violet-600/30 hover:border-violet-500 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Live Google Maps Preview Card */}
            <div className="relative z-10 grid gap-5 lg:grid-cols-3">
              {/* Map Iframe */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner h-64 sm:h-72 relative">
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
                  src={`https://maps.google.com/maps?q=${currentLat},${currentLng}&hl=en&z=15&output=embed`}
                />
                <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Lat: {currentLat.toFixed(4)}, Lng: {currentLng.toFixed(4)}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-3 right-3 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Coordinates Inputs */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="loc-lat" className="text-xs font-bold text-slate-300">
                      Latitude Coordinate
                    </Label>
                    <Input
                      id="loc-lat"
                      type="number"
                      step="any"
                      placeholder="e.g. 17.6868"
                      value={loc.latitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocation({
                          latitude: val,
                          mapLink: `https://www.google.com/maps?q=${val},${loc.longitude || '83.2185'}`,
                        });
                      }}
                      className="bg-slate-950/70 border-slate-700 text-white font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="loc-lng" className="text-xs font-bold text-slate-300">
                      Longitude Coordinate
                    </Label>
                    <Input
                      id="loc-lng"
                      type="number"
                      step="any"
                      placeholder="e.g. 83.2185"
                      value={loc.longitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateLocation({
                          longitude: val,
                          mapLink: `https://www.google.com/maps?q=${loc.latitude || '17.6868'},${val}`,
                        });
                      }}
                      className="bg-slate-950/70 border-slate-700 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Navigation className="h-3.5 w-3.5" />
                    Turn-by-Turn Routing Ready
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once verified, travelers on the Andhra Yatri mobile app can navigate directly to your storefront via Google Maps &amp; Apple Maps.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wizard Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep(0)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Change Category
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              className="bg-violet-600 hover:bg-violet-500 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-violet-600/25 transition flex items-center gap-2"
            >
              Next: Services &amp; Inventory <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BusinessLocationStep;
