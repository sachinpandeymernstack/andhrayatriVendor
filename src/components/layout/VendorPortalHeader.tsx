import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Headphones,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import aptdcLogo from '@/assets/aptdc-logo.png';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { cn } from '@/lib/utils';

const MAIN_SITE_URL = (import.meta.env.VITE_MAIN_SITE_URL || 'https://andhrayatri.com').replace(
  /\/+$/,
  '',
);

interface VendorPortalHeaderProps {
  onOpenSupport?: () => void;
}

export function VendorPortalHeader({ onOpenSupport }: VendorPortalHeaderProps) {
  const { isAuthenticated, vendor, dashboardConfig, normalizedStatus, logout } = useVendorAuth();
  const location = useLocation();
  const isSignup = location.pathname.includes('signup') || location.pathname.includes('register');
  const isLogin = location.pathname.includes('login');
  const [internalSupportOpen, setInternalSupportOpen] = useState(false);

  const handleSupportClick = () => {
    if (onOpenSupport) {
      onOpenSupport();
    } else {
      setInternalSupportOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-90 shrink-0"
            >
              <img src={logoImg} alt="Andhra Yatri" className="h-8 sm:h-9 w-auto object-contain" />
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-sm sm:text-base font-extrabold tracking-tight text-slate-950">
                    Andhra Yatri
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50/90 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Vendor Hub
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] font-medium text-slate-500">vendor.andhrayatri.com</p>
              </div>
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 md:block" />
            <img
              src={aptdcLogo}
              alt="APTDC Official Partner"
              className="hidden h-7 w-auto object-contain opacity-90 md:block"
            />
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950 md:inline-flex"
            >
              andhrayatri.com
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </a>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSupportClick}
              className="h-8.5 px-2 text-slate-600 hover:bg-violet-50 hover:text-primary sm:px-3"
              aria-label="Partner Support"
            >
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">Partner Support</span>
            </Button>

            {isAuthenticated && vendor ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="max-w-[120px] truncate text-xs font-bold text-slate-900">
                      {vendor.businessName || vendor.ownerName || 'Partner Account'}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {dashboardConfig.label}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={logout} className="h-8.5 px-2.5 sm:px-3">
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {isSignup ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8.5 border-primary/25 bg-white font-bold text-primary hover:bg-violet-50 px-3"
                  >
                    <Link to="/login">Partner Login</Link>
                  </Button>
                ) : isLogin ? (
                  <Button asChild size="sm" variant="gold" className="h-8.5 font-bold px-3">
                    <Link to="/signup">
                      <Sparkles className="h-3.5 w-3.5" />
                      Become a Partner
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm" className="h-8.5 px-2.5 sm:px-3 text-slate-700">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm" variant="gold" className="h-8.5 font-bold px-2.5 sm:px-3">
                      <Link to="/signup">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Become a Partner</span>
                        <span className="sm:hidden">Join</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Internal Support Modal Fallback */}
      <Dialog open={internalSupportOpen} onOpenChange={setInternalSupportOpen}>
        <DialogContent className="max-w-md w-[92vw] sm:w-full rounded-2xl">
          <DialogHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Headphones className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">APTDC Partner Help Desk</DialogTitle>
            <DialogDescription>
              Direct assistance for vendor onboarding, catalog verification, and daily operations across
              Andhra Pradesh.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <a
              href="tel:180042545454"
              className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-3.5 transition hover:border-primary/40 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Toll-Free Helpline</p>
                <p className="text-sm font-bold text-slate-900">1800-425-45454</p>
                <p className="text-[11px] text-slate-500">Mon - Sat · 8:00 AM to 8:00 PM IST</p>
              </div>
            </a>
            <a
              href="mailto:partners@andhrayatri.com"
              className="flex items-center gap-3.5 rounded-xl border border-slate-200 p-3.5 transition hover:border-primary/40 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Email Verification Desk</p>
                <p className="text-sm font-bold text-slate-900">partners@andhrayatri.com</p>
                <p className="text-[11px] text-slate-500">Guaranteed 24-hr resolution</p>
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
