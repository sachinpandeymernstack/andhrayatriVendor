import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Headphones, Printer, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVendorDashboardPath } from '@/lib/vendorSession';
import type { VendorRecord } from '@/types/vendor';

interface SignupSuccessReceiptProps {
  vendor: VendorRecord;
  onOpenSupport: () => void;
}

export function SignupSuccessReceipt({ vendor, onOpenSupport }: SignupSuccessReceiptProps) {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !navigator.userAgent?.toLowerCase().includes('jsdom')) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
      }
    } catch {
      // Ignore canvas unavailability in headless tests.
    }
  }, []);

  const refCode = String(vendor.id || vendor._id || `AYV-${Date.now().toString().slice(-6)}`);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      <Card className="border-emerald-200/90 bg-white shadow-xl shadow-slate-900/5">
        <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-br from-emerald-50/70 via-white to-violet-50/50 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-xs">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <Badge variant="success" className="mx-auto font-bold px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Application Submitted Successfully
          </Badge>
          <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
            Welcome aboard, {vendor.businessName || vendor.ownerName || 'Partner'}!
          </CardTitle>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your vendor registration has been queued with the Andhra Yatri Admin Verification Team.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid gap-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Application ID</p>
              <p className="font-mono text-base font-extrabold text-primary">{refCode}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Status</p>
              <p className="font-bold text-amber-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Admin Verification
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</p>
              <p className="font-semibold capitalize text-slate-900">
                {String(vendor.category || vendor.categoryId || 'Partner')}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Email</p>
              <p className="truncate font-semibold text-slate-900">{vendor.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onOpenSupport}>
                <Headphones className="h-4 w-4" /> Need Help?
              </Button>
            </div>

            <Button size="lg" className="font-bold" onClick={() => navigate(getVendorDashboardPath(vendor))}>
              Open Partner Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
