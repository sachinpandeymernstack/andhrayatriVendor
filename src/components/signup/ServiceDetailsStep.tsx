import React from 'react';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/ui/select';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { cn } from '@/lib/utils';
import {
  ACCESSIBILITY_OPTIONS,
  HOTEL_AMENITIES,
  HOTEL_ROOM_TYPES,
  RESTAURANT_CUISINES,
  RESTAURANT_SERVICE_MODES,
  SHOPPING_CATEGORIES,
  SIGNUP_CATEGORIES,
  WORKING_DAYS,
} from './signupConstants';

function MultiChipSelector({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="text-xs font-bold text-slate-700">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                active
                  ? 'border-primary bg-primary text-white shadow-xs shadow-primary/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-slate-50',
              )}
            >
              {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ServiceDetailsStep() {
  const { draft, updateServiceDetails, updatePricingInfo, setActiveStep } = useVendorOnboarding();
  const svc = draft.serviceDetails;
  const pricing = draft.pricingInfo;
  const category = draft.selectedCategory || 'shopping';
  const categoryMeta = SIGNUP_CATEGORIES.find((c) => c.id === category) || SIGNUP_CATEGORIES[0];

  const toggleArrayField = (key: keyof typeof svc, value: string) => {
    const current = Array.isArray(svc[key]) ? ((svc[key] as unknown) as string[]) : [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateServiceDetails({ [key]: next });
  };

  return (
    <Card className="mx-auto max-w-5xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-1.5 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
            2
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 2 of 4</span>
        </div>
        <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
          {categoryMeta.title} — Services &amp; Operating Hours
        </CardTitle>
        <CardDescription>
          Tailor capacity, pricing tiers, service modes, and weekly operating windows for your category.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="svc-subcategory">Primary Subcategory</Label>
            <SelectField
              id="svc-subcategory"
              value={svc.subcategory || categoryMeta.subcategories[0]}
              onChange={(e) => updateServiceDetails({ subcategory: e.target.value })}
            >
              {categoryMeta.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-price-range">Price Range Tier</Label>
            <SelectField
              id="svc-price-range"
              value={pricing.priceRange || 'mid-range'}
              onChange={(e) => updatePricingInfo({ priceRange: e.target.value })}
            >
              <option value="budget">Budget Friendly (₹)</option>
              <option value="mid-range">Mid-Range (₹₹)</option>
              <option value="premium">Premium / Boutique (₹₹₹)</option>
              <option value="luxury">Luxury Heritage (₹₹₹₹)</option>
            </SelectField>
          </div>

          {/* Hotels specific */}
          {category === 'hotels' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="svc-total-rooms">Total Rooms / Units</Label>
                <Input
                  id="svc-total-rooms"
                  type="number"
                  placeholder="e.g. 18"
                  value={svc.hotelTotalRooms || ''}
                  onChange={(e) => updateServiceDetails({ hotelTotalRooms: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-starting-tariff">Starting Tariff (₹ / Night)</Label>
                <Input
                  id="svc-starting-tariff"
                  type="number"
                  placeholder="e.g. 2500"
                  value={svc.hotelBasePricePerNight || ''}
                  onChange={(e) => updateServiceDetails({ hotelBasePricePerNight: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-checkin">Standard Check-In Time</Label>
                <Input
                  id="svc-checkin"
                  type="time"
                  value={svc.hotelCheckInTime || '12:00'}
                  onChange={(e) => updateServiceDetails({ hotelCheckInTime: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-checkout">Standard Check-Out Time</Label>
                <Input
                  id="svc-checkout"
                  type="time"
                  value={svc.hotelCheckOutTime || '11:00'}
                  onChange={(e) => updateServiceDetails({ hotelCheckOutTime: e.target.value })}
                />
              </div>
              <MultiChipSelector
                label="Room Types Available"
                options={HOTEL_ROOM_TYPES}
                selected={svc.hotelRoomTypes || []}
                onToggle={(item) => toggleArrayField('hotelRoomTypes', item)}
              />
              <MultiChipSelector
                label="Property Amenities"
                options={HOTEL_AMENITIES}
                selected={svc.hotelAmenities || []}
                onToggle={(item) => toggleArrayField('hotelAmenities', item)}
              />
            </>
          )}

          {/* Restaurants specific */}
          {category === 'restaurants' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="svc-seating">Seating Capacity (Covers)</Label>
                <Input
                  id="svc-seating"
                  type="number"
                  placeholder="e.g. 60"
                  value={svc.restaurantSeatingCapacity || ''}
                  onChange={(e) => updateServiceDetails({ restaurantSeatingCapacity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-avg-meal">Average Cost for Two (₹)</Label>
                <Input
                  id="svc-avg-meal"
                  type="number"
                  placeholder="e.g. 800"
                  value={svc.restaurantAvgCostForTwo || ''}
                  onChange={(e) => updateServiceDetails({ restaurantAvgCostForTwo: e.target.value })}
                />
              </div>
              <MultiChipSelector
                label="Specialty Cuisines"
                options={RESTAURANT_CUISINES}
                selected={svc.restaurantCuisineTypes || []}
                onToggle={(item) => toggleArrayField('restaurantCuisineTypes', item)}
              />
              <MultiChipSelector
                label="Service Modes"
                options={RESTAURANT_SERVICE_MODES}
                selected={svc.restaurantServiceType || []}
                onToggle={(item) => toggleArrayField('restaurantServiceType', item)}
              />
            </>
          )}

          {/* Shopping specific */}
          {category === 'shopping' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="svc-shopping-shipping">Shipping / Dispatch Radius</Label>
                <SelectField
                  id="svc-shopping-shipping"
                  value={String(svc.shoppingDeliveryAvailable || 'Yes')}
                  onChange={(e) => updateServiceDetails({ shoppingDeliveryAvailable: e.target.value })}
                >
                  <option value="Yes">Courier Shipping Available</option>
                  <option value="No">Storefront Pickup Only</option>
                </SelectField>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-min-order">Minimum Order for Free Delivery (₹)</Label>
                <Input
                  id="svc-min-order"
                  type="number"
                  placeholder="e.g. 999"
                  value={svc.shoppingMinOrderValue || ''}
                  onChange={(e) => updateServiceDetails({ shoppingMinOrderValue: e.target.value })}
                />
              </div>
              <MultiChipSelector
                label="Product Catalog Categories"
                options={SHOPPING_CATEGORIES}
                selected={svc.shoppingProductCategories || []}
                onToggle={(item) => toggleArrayField('shoppingProductCategories', item)}
              />
            </>
          )}

          <MultiChipSelector
            label="Accessibility & Guest Convenience"
            options={ACCESSIBILITY_OPTIONS}
            selected={svc.attractionAccessibility || []}
            onToggle={(item) => toggleArrayField('attractionAccessibility', item)}
          />
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operating Hours &amp; Weekly Schedule</h3>
              <p className="text-xs text-slate-500">Travelers see live Open / Closed indicators based on this schedule.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="svc-open">Opening Time</Label>
              <Input
                id="svc-open"
                type="time"
                value={svc.openingTime || '09:00'}
                onChange={(e) => updateServiceDetails({ openingTime: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-close">Closing Time</Label>
              <Input
                id="svc-close"
                type="time"
                value={svc.closingTime || '21:00'}
                onChange={(e) => updateServiceDetails({ closingTime: e.target.value })}
              />
            </div>
            <MultiChipSelector
              label="Active Working Days"
              options={WORKING_DAYS}
              selected={svc.workingDays || WORKING_DAYS}
              onToggle={(day) => toggleArrayField('workingDays', day)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={() => setActiveStep(1)}>
            <ArrowLeft className="h-4 w-4" /> Previous Step
          </Button>
          <Button type="button" size="lg" onClick={() => setActiveStep(3)}>
            Next Step <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
