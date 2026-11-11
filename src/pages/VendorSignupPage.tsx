import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Headphones, Mail, Phone } from 'lucide-react';
import { VendorPortalHeader } from '@/components/layout/VendorPortalHeader';
import { AccountCreationStage } from '@/components/signup/AccountCreationStage';
import { BusinessLocationStep } from '@/components/signup/BusinessLocationStep';
import { CategorySelectStage } from '@/components/signup/CategorySelectStage';
import { DocumentsKycStep } from '@/components/signup/DocumentsKycStep';
import { ReviewSubmitStep } from '@/components/signup/ReviewSubmitStep';
import { ServiceDetailsStep } from '@/components/signup/ServiceDetailsStep';
import { SignupSuccessReceipt } from '@/components/signup/SignupSuccessReceipt';
import { WIZARD_STEPS } from '@/components/signup/signupConstants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { cn } from '@/lib/utils';
import type { VendorRecord } from '@/types/vendor';

export function VendorSignupPage() {
  const { draft, setActiveStep, resetDraft } = useVendorOnboarding();
  const [submittedVendor, setSubmittedVendor] = useState<VendorRecord | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleSubmissionComplete = (createdVendor: VendorRecord) => {
    setSubmittedVendor(createdVendor);
    resetDraft();
  };

  return (
    <div className="ay-portal-bg min-h-screen text-slate-900">
      <VendorPortalHeader onOpenSupport={() => setSupportOpen(true)} />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8 lg:py-12">
        {submittedVendor ? (
          <SignupSuccessReceipt
            vendor={submittedVendor}
            onOpenSupport={() => setSupportOpen(true)}
          />
        ) : !draft.showWizard ? (
          <AccountCreationStage />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Step Progress Rail when inside Steps 1..4 */}
            {draft.activeStep >= 1 && (
              <div className="mx-auto max-w-4xl">
                {/* Mobile Stepper (< sm): Clean connected nodes + Active Stage Title to avoid overlapping text */}
                <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xs backdrop-blur-xs sm:hidden">
                  <div className="flex items-center justify-between text-xs font-bold pb-3">
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-white">
                        {draft.activeStep}
                      </span>
                      Step {draft.activeStep} of 4
                    </span>
                    <span className="text-slate-600 font-bold truncate max-w-[180px]">
                      {WIZARD_STEPS.find((s) => s.step === draft.activeStep)?.title}
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between px-3 pt-1">
                    <div className="absolute left-7 right-7 top-1/2 -translate-y-1/2 h-1 bg-slate-100">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((draft.activeStep - 1) / 3) * 100}%` }}
                      />
                    </div>
                    {WIZARD_STEPS.map((item) => {
                      const completed = draft.activeStep > item.step;
                      const active = draft.activeStep === item.step;
                      return (
                        <button
                          key={item.step}
                          type="button"
                          onClick={() => {
                            if (item.step <= draft.activeStep) setActiveStep(item.step);
                          }}
                          aria-label={`Step ${item.step}: ${item.title}`}
                          className={cn(
                            'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-all cursor-pointer',
                            active && 'bg-primary text-white shadow-md shadow-primary/30 ring-4 ring-violet-100 scale-110',
                            completed && 'bg-emerald-600 text-white shadow-xs',
                            !active && !completed && 'bg-slate-100 text-slate-400 border border-slate-200',
                          )}
                        >
                          {completed ? <Check className="h-4 w-4 stroke-[3]" /> : item.step}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tablet & Desktop Stepper (>= sm) */}
                <div className="hidden rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xs backdrop-blur-xs sm:block">
                  <ol className="grid grid-cols-4 gap-2 sm:gap-3">
                    {WIZARD_STEPS.map((item) => {
                      const completed = draft.activeStep > item.step;
                      const active = draft.activeStep === item.step;
                      return (
                        <li key={item.step}>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.step <= draft.activeStep) setActiveStep(item.step);
                            }}
                            className={cn(
                              'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                              active && 'border-primary bg-violet-50/60 shadow-xs ring-1 ring-primary/20',
                              completed && 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50',
                              !active && !completed && 'border-slate-200/80 bg-slate-50/50 opacity-60 hover:opacity-80',
                            )}
                          >
                            <span
                              className={cn(
                                'flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors',
                                active && 'bg-primary text-white shadow-xs shadow-primary/30',
                                completed && 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30',
                                !active && !completed && 'bg-slate-200 text-slate-600',
                              )}
                            >
                              {completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : item.step}
                            </span>
                            <div className="min-w-0">
                              <span className="truncate text-xs font-bold text-slate-900 block">
                                {item.title}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${draft.activeStep}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {draft.activeStep === 0 && <CategorySelectStage />}
                {draft.activeStep === 1 && <BusinessLocationStep />}
                {draft.activeStep === 2 && <ServiceDetailsStep />}
                {draft.activeStep === 3 && <DocumentsKycStep />}
                {draft.activeStep === 4 && (
                  <ReviewSubmitStep onSuccess={handleSubmissionComplete} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent className="w-[92vw] sm:w-full rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" /> Partner Onboarding Support Desk
            </DialogTitle>
            <DialogDescription>
              Need assistance verifying GST, FSSAI, or property KYC documents? Reach our partner helpdesk directly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="font-bold text-slate-900">APTDC Partner Helpline</p>
                <p className="text-xs text-slate-500">+91 1800-425-45454 (Mon–Sat, 9 AM – 7 PM)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="font-bold text-slate-900">Onboarding Verification Team</p>
                <p className="text-xs text-slate-500">partners@andhrayatri.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
