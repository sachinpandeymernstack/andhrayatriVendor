import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileEdit,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { VendorPortalHeader } from '@/components/layout/VendorPortalHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VendorDashboardConfig } from '@/lib/vendorSession';
import { cn } from '@/lib/utils';
import type { VendorRecord } from '@/types/vendor';

interface VendorStatusGateProps {
  vendor: VendorRecord;
  normalizedStatus: string;
  dashboardConfig: VendorDashboardConfig;
  isSyncing: boolean;
  onRefreshStatus: () => void;
  onLogout: () => void;
}

export function VendorStatusGate({
  vendor,
  normalizedStatus,
  dashboardConfig,
  isSyncing,
  onRefreshStatus,
  onLogout,
}: VendorStatusGateProps) {
  const navigate = useNavigate();

  const businessName = vendor.businessName || vendor.business_name || vendor.ownerName || 'Partner Account';
  const reason =
    vendor.rejectionReason ||
    vendor.rejection_reason ||
    vendor.rejectedReason ||
    vendor.suspensionReason ||
    vendor.suspendedReason ||
    vendor.suspension_reason ||
    vendor.statusReason ||
    vendor.reason ||
    '';

  const isRejected = normalizedStatus === 'rejected';
  const isExpired = normalizedStatus === 'expired';
  const isSuspended = normalizedStatus === 'suspended';

  const timelineSteps = [
    {
      title: 'Partner Account Registered',
      detail: `Created for ${vendor.email || 'your business email'}`,
      done: true,
    },
    {
      title: 'Category & KYC Profile Submitted',
      detail: `${dashboardConfig.label} onboarding dossier recorded`,
      done: normalizedStatus !== 'draft',
    },
    {
      title: 'APTDC & Compliance Review',
      detail: isRejected
        ? 'Action required — review feedback below and resubmit'
        : isSuspended
          ? 'Compliance desk placed account on hold'
          : isExpired
            ? 'Partner validity lapsed — renewal required'
            : 'Our team verifies GST/KYC and storefront coordinates (24–48 hrs)',
      done: false,
      active: !isRejected && !isSuspended && !isExpired,
    },
    {
      title: 'Live Dashboard Activation',
      detail: `Unlocks full ${dashboardConfig.badge} tools`,
      done: false,
    },
  ];

  const headerConfig = isRejected
    ? {
        icon: AlertTriangle,
        badge: 'Application Returned',
        badgeVariant: 'danger' as const,
        title: 'Application Requires Corrections',
        subtitle:
          'Some verification documents or business details did not pass our compliance check. Review the note below and resubmit.',
      }
    : isSuspended
      ? {
          icon: Ban,
          badge: 'Account Suspended',
          badgeVariant: 'danger' as const,
          title: 'Partner Storefront Temporarily Suspended',
          subtitle:
            'Your storefront access is currently paused by the Trust & Safety team. Contact partner support for reinstatement.',
        }
      : isExpired
        ? {
            icon: CalendarClock,
            badge: 'Membership Expired',
            badgeVariant: 'warning' as const,
            title: 'Partner Validity Period Ended',
            subtitle: `Your annual Andhra Yatri partner listing expired${
              vendor.expiryDate ? ` on ${new Date(vendor.expiryDate).toLocaleDateString('en-IN')}` : ''
            }. Renew to restore live traveler bookings.`,
          }
        : {
            icon: Clock,
            badge: 'Verification In Progress',
            badgeVariant: 'warning' as const,
            title: 'Application Under Review',
            subtitle:
              'Thank you for applying to Andhra Yatri. While admin approval is pending, we automatically check your status every 30 seconds.',
          };

  const StatusIcon = headerConfig.icon;

  return (
    <div className="ay-portal-bg min-h-screen text-slate-900">
      <VendorPortalHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <Card className="overflow-hidden border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-slate-50/80 via-white to-violet-50/50 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant={headerConfig.badgeVariant} className="font-bold px-3 py-1">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {headerConfig.badge}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {dashboardConfig.label}
                </span>
              </div>
              <CardTitle className="mt-3 font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">
                {headerConfig.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {headerConfig.subtitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6 sm:p-8">
              {reason && (isRejected || isSuspended) && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4.5 text-sm text-rose-900 shadow-xs">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-bold">Reviewer Note</p>
                    <p className="mt-0.5 text-rose-800 leading-relaxed">{reason}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Business Name</p>
                  <p className="mt-0.5 font-bold text-slate-900">{businessName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{dashboardConfig.label}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Partner Email</p>
                  <p className="mt-0.5 truncate font-semibold text-slate-800">{vendor.email}</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <h2 className="font-display text-base font-extrabold text-slate-900">
                  Vendor Activity Timeline
                </h2>
                <ol className="space-y-3">
                  {timelineSteps.map((step, index) => (
                    <li
                      key={step.title}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border p-3.5 transition',
                        step.done
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : step.active
                            ? 'border-amber-200 bg-amber-50/60 shadow-xs ring-1 ring-amber-200/50'
                            : 'border-slate-200/80 bg-white opacity-70',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold',
                          step.done
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : step.active
                              ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                              : 'bg-slate-200 text-slate-600',
                        )}
                      >
                        {step.done ? <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" /> : index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{step.title}</p>
                        <p className="text-xs text-slate-600 leading-snug">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRefreshStatus}
                    disabled={isSyncing}
                    className="border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin text-primary')} />
                    {isSyncing ? 'Checking Status...' : 'Check Live Status'}
                  </Button>

                  {(isRejected || isExpired) && (
                    <Button type="button" onClick={() => navigate('/signup')} className="font-bold">
                      <FileEdit className="h-4 w-4" />
                      {isExpired ? 'Renew Membership' : 'Update & Resubmit Application'}
                    </Button>
                  )}
                </div>

                <Button type="button" variant="ghost" onClick={onLogout} className="text-rose-600 hover:bg-rose-50">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
