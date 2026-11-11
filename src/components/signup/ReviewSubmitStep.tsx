import React from 'react';
import { ArrowLeft, CheckCircle2, Edit3, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorToast } from '@/context/VendorNotificationContext';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { useVendorSignupMutation } from '@/hooks/queries/useVendorQueries';
import type { VendorRecord } from '@/types/vendor';
import { SIGNUP_CATEGORIES } from './signupConstants';

interface ReviewSubmitStepProps {
  onSuccess: (createdVendor: VendorRecord) => void;
}

export function ReviewSubmitStep({ onSuccess }: ReviewSubmitStepProps) {
  const { draft, setActiveStep, setAgreedToTerms } = useVendorOnboarding();
  const { showToast } = useVendorToast();
  const signupMutation = useVendorSignupMutation();

  const categoryMeta =
    SIGNUP_CATEGORIES.find((c) => c.id === draft.selectedCategory) || SIGNUP_CATEGORIES[0];
  const loc = draft.businessInfo.location;

  const handleSubmit = async () => {
    if (!draft.agreedToTerms) {
      showToast('Please accept the Andhra Yatri Partner Terms to submit your application.', 'warning');
      return;
    }

    const created = await signupMutation.mutateAsync({
      account: draft.account,
      category: (draft.selectedCategory || 'shopping') as typeof categoryMeta.id,
      business: {
        ...draft.businessInfo,
        addressLine1: loc.addressLine1,
        addressLine2: loc.addressLine2,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        country: loc.country,
      },
      location: {
        addressLine1: loc.addressLine1,
        addressLine2: loc.addressLine2,
        street: loc.addressLine1,
        city: loc.city,
        state: loc.state,
        postalCode: loc.pincode,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        mapLink: loc.mapLink,
      },
      services: draft.serviceDetails,
      pricing: draft.pricingInfo,
      documents: {
        aadhaarNumber: draft.documents.aadhaarNumber,
        panNumber: draft.documents.panNumber,
        gstNumber: draft.documents.gstNumber,
        fssaiNumber: draft.documents.fssaiNumber,
        logoPreview: draft.documents.businessLogo?.preview,
        galleryImages: draft.documents.galleryPhotos.map((p) => ({
          id: p.id,
          name: p.name,
          preview: p.preview || '',
        })),
      },
    });

    onSuccess(created);
  };

  return (
    <Card className="mx-auto max-w-5xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-1.5 border-b border-slate-100 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
                4
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 4 of 4</span>
            </div>
            <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
              Final Application Review
            </CardTitle>
            <CardDescription>
              Verify your partner profile before submitting to the Andhra Yatri verification desk.
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-primary text-white font-bold px-3 py-1">
            {categoryMeta.title}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Business &amp; Contact</h3>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-primary hover:bg-violet-50 transition"
              >
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            </div>
            <dl className="space-y-1.5 text-xs text-slate-600">
              <div><strong className="text-slate-900 font-semibold">Business:</strong> {draft.businessInfo.businessName}</div>
              <div><strong className="text-slate-900 font-semibold">Owner:</strong> {draft.businessInfo.ownerName}</div>
              <div><strong className="text-slate-900 font-semibold">Phone:</strong> {draft.businessInfo.phone}</div>
              <div><strong className="text-slate-900 font-semibold">Email:</strong> {draft.businessInfo.email}</div>
              <div>
                <strong className="text-slate-900 font-semibold">Address:</strong>{' '}
                {[loc.addressLine1, loc.city, loc.state, loc.pincode].filter(Boolean).join(', ')}
              </div>
            </dl>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Services &amp; Schedule</h3>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-primary hover:bg-violet-50 transition"
              >
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            </div>
            <dl className="space-y-1.5 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 font-semibold">Subcategory:</strong>{' '}
                {draft.serviceDetails.subcategory || categoryMeta.subcategories[0]}
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Timings:</strong>{' '}
                {draft.serviceDetails.openingTime || '09:00'} – {draft.serviceDetails.closingTime || '21:00'}
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Working Days:</strong>{' '}
                {(draft.serviceDetails.workingDays || []).length} days/week
              </div>
              <div>
                <strong className="text-slate-900 font-semibold">Price Range:</strong>{' '}
                {draft.pricingInfo.priceRange || 'Standard'}
              </div>
            </dl>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">KYC &amp; Bank Summary</h3>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-primary hover:bg-violet-50 transition"
              >
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
              <div><strong className="text-slate-900 font-semibold">PAN:</strong> {draft.documents.panNumber || 'Submitted later'}</div>
              <div><strong className="text-slate-900 font-semibold">GSTIN:</strong> {draft.documents.gstNumber || 'Unregistered / Optional'}</div>
              <div>
                <strong className="text-slate-900 font-semibold">Settlement Bank:</strong>{' '}
                {draft.pricingInfo.bankName ? `${draft.pricingInfo.bankName} (${draft.pricingInfo.ifscCode})` : 'Configure in dashboard'}
              </div>
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-slate-800 transition hover:bg-violet-50">
          <input
            type="checkbox"
            checked={draft.agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-primary accent-primary"
          />
          <span>
            I confirm that all business details, compliance numbers, and pricing information submitted
            are authentic and agree to the{' '}
            <strong className="text-primary font-bold">Andhra Yatri Partner Onboarding Agreement</strong>.
          </span>
        </label>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={() => setActiveStep(3)}>
            <ArrowLeft className="h-4 w-4" /> Previous Step
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={signupMutation.isPending}
            className="font-bold text-base px-6"
          >
            {signupMutation.isPending ? (
              'Submitting Application...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Application
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
