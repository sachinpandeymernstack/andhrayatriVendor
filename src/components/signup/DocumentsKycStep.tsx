import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, Landmark, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVendorToast } from '@/context/VendorNotificationContext';
import { useVendorOnboarding, type UploadedDocumentMeta } from '@/context/VendorOnboardingContext';

function readMetaFile(file: File, includePreview = false): Promise<UploadedDocumentMeta> {
  return new Promise((resolve) => {
    if (!includePreview) {
      resolve({ name: file.name, size: file.size, type: file.type });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: typeof reader.result === 'string' ? reader.result : undefined,
      });
    };
    reader.readAsDataURL(file);
  });
}

export function DocumentsKycStep() {
  const { draft, updateDocuments, updatePricingInfo, setActiveStep } = useVendorOnboarding();
  const { showToast } = useVendorToast();
  const [error, setError] = useState('');

  const docs = draft.documents;
  const pricing = draft.pricingInfo;
  const isFood = draft.selectedCategory === 'restaurants';

  const handleFileUpload = async (
    field: 'aadhaarCard' | 'panCard' | 'gstCertificate' | 'businessLicense' | 'fssaiCertificate' | 'businessLogo',
    e: React.ChangeEvent<HTMLInputElement>,
    includePreview = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const meta = await readMetaFile(file, includePreview);
    updateDocuments({ [field]: meta });
    showToast(`${file.name} uploaded.`, 'success');
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    if (!files.length) return;
    const metas = await Promise.all(files.map((f) => readMetaFile(f, true)));
    const stamped = metas.map((m, idx) => ({
      ...m,
      id: `gal-${Date.now()}-${idx}`,
    }));
    updateDocuments({ galleryPhotos: [...docs.galleryPhotos, ...stamped].slice(0, 8) });
    showToast(`${files.length} gallery photos added.`, 'success');
  };

  const handleNext = () => {
    if (
      pricing.accountNumber &&
      pricing.confirmAccountNumber &&
      pricing.accountNumber !== pricing.confirmAccountNumber
    ) {
      setError('Bank Account Number and Confirm Account Number must match.');
      showToast('Account numbers do not match.', 'error');
      return;
    }
    setError('');
    setActiveStep(4);
  };

  const setQuickBank = (bankName: string, ifscPrefix: string) => {
    updatePricingInfo({
      bankName,
      ifscCode: pricing.ifscCode || ifscPrefix,
    });
  };

  return (
    <Card className="mx-auto max-w-5xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
      <CardHeader className="space-y-1.5 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-extrabold text-primary">
            3
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 3 of 4</span>
        </div>
        <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
          KYC Verification, Brand Media &amp; Bank Settlements
        </CardTitle>
        <CardDescription>
          Upload business verification identifiers and settlement bank details. You can update KYC docs later from Settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-xs"
          >
            {error}
          </div>
        )}

        {/* KYC Identifiers */}
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tax &amp; Identity Verification</h3>
              <p className="text-xs text-slate-500">Provide legal identification numbers and supporting documents.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-gst">GSTIN Number</Label>
              <Input
                id="doc-gst"
                placeholder="15-character GSTIN (e.g. 37AAAAA0000A1Z5)"
                maxLength={15}
                value={docs.gstNumber || ''}
                onChange={(e) => updateDocuments({ gstNumber: e.target.value.toUpperCase() })}
              />
              <p className="text-[11px] text-slate-500">State code 37 applies to Andhra Pradesh registrations.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-pan">Business / Proprietor PAN</Label>
              <Input
                id="doc-pan"
                placeholder="10-digit PAN (e.g. ABCDE1234F)"
                maxLength={10}
                value={docs.panNumber || ''}
                onChange={(e) => updateDocuments({ panNumber: e.target.value.toUpperCase() })}
              />
            </div>

            {isFood && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="doc-fssai">FSSAI Food License Number</Label>
                <Input
                  id="doc-fssai"
                  placeholder="14-digit FSSAI Registration number"
                  maxLength={14}
                  value={docs.fssaiNumber || ''}
                  onChange={(e) => updateDocuments({ fssaiNumber: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {[
              { key: 'gstCertificate', label: 'GST Certificate (PDF/IMG)', file: docs.gstCertificate },
              { key: 'panCard', label: 'PAN Card Copy', file: docs.panCard },
              { key: 'businessLicense', label: 'Trade License / Grama Panchayat', file: docs.businessLicense },
            ].map((slot) => (
              <label
                key={slot.key}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center transition hover:border-primary hover:bg-violet-50/30"
              >
                <UploadCloud className="h-6 w-6 text-slate-400" />
                <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                {slot.file ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> {slot.file.name.slice(0, 18)}...
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Click to upload file</span>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(
                      slot.key as 'gstCertificate' | 'panCard' | 'businessLicense',
                      e,
                    )
                  }
                />
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-3.5 transition hover:border-primary hover:bg-violet-50/20">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Storefront &amp; Property Gallery Photos</p>
                  <p className="text-[11px] text-slate-500">Upload up to 6 high-resolution showcase photos ({docs.galleryPhotos.length} uploaded)</p>
                </div>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                Browse Files
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
            </label>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct Bank Settlements</h3>
                <p className="text-xs text-slate-500">Booking payouts are transferred directly to this verified bank account.</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuickBank('State Bank of India', 'SBIN00')}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                SBI
              </button>
              <button
                type="button"
                onClick={() => setQuickBank('Union Bank of India (Andhra Bank)', 'UBIN08')}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Union / Andhra
              </button>
              <button
                type="button"
                onClick={() => setQuickBank('HDFC Bank', 'HDFC00')}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                HDFC
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bank-acc-holder">Account Holder Name</Label>
              <Input
                id="bank-acc-holder"
                placeholder="Name as registered with the bank"
                value={pricing.accountHolderName || ''}
                onChange={(e) => updatePricingInfo({ accountHolderName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="e.g. State Bank of India / HDFC Bank"
                value={pricing.bankName || ''}
                onChange={(e) => updatePricingInfo({ bankName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-acc">Bank Account Number</Label>
              <Input
                id="bank-acc"
                placeholder="Enter account number"
                value={pricing.accountNumber || ''}
                onChange={(e) => updatePricingInfo({ accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-acc-confirm">Confirm Account Number</Label>
              <Input
                id="bank-acc-confirm"
                placeholder="Re-enter account number"
                value={pricing.confirmAccountNumber || ''}
                onChange={(e) => updatePricingInfo({ confirmAccountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-ifsc">IFSC Code</Label>
              <Input
                id="bank-ifsc"
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                value={pricing.ifscCode || ''}
                onChange={(e) => updatePricingInfo({ ifscCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pricing-range">Typical Ticket / Tariff Range</Label>
              <Input
                id="pricing-range"
                placeholder="e.g. ₹800 – ₹4,500"
                value={pricing.priceRange || ''}
                onChange={(e) => updatePricingInfo({ priceRange: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <Button type="button" variant="outline" onClick={() => setActiveStep(2)}>
            <ArrowLeft className="h-4 w-4" /> Previous Step
          </Button>
          <Button type="button" size="lg" onClick={handleNext}>
            Review Application <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
