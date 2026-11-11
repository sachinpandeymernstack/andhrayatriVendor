import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, type Resolver } from 'react-hook-form';
import {
  ArrowRight,
  Building2,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
} from 'lucide-react';
import partnerShowcaseImg from '@/assets/vendor_partner_dashboard.png';
import { VendorPortalHeader } from '@/components/layout/VendorPortalHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorLoginMutation } from '@/hooks/queries/useVendorQueries';
import { useGsapFloat, useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { mapZodErrors, vendorLoginSchema } from '@/lib/validation';
import { getVendorDashboardPath } from '@/lib/vendorSession';

interface LoginFormValues {
  email: string;
  password: string;
}

const loginResolver: Resolver<LoginFormValues> = async (values) => {
  const result = mapZodErrors(vendorLoginSchema, values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }
  const errors: Record<string, { type: string; message: string }> = {};
  for (const [key, message] of Object.entries(result.errors)) {
    errors[key] = { type: 'validation', message };
  }
  return { values: {}, errors };
};

const PARTNER_PILLARS = [
  {
    icon: Building2,
    title: 'Hotels & Resorts',
    desc: 'Room inventory, tariffs, weekend pricing & guest check-ins',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    icon: Utensils,
    title: 'Restaurants & Cafes',
    desc: 'Real-time kitchen orders (KOT), digital menu & tables',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: ShoppingBag,
    title: 'Shopping & Crafts',
    desc: 'Kondapalli toys, Lepakshi crafts, SKUs & courier dispatch',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: Compass,
    title: 'Activities & Tours',
    desc: 'Araku trekking, temple trails, slots & guide allocation',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
];

export function VendorLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, dashboardPath, vendor } = useVendorAuth();
  const loginMutation = useVendorLoginMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const heroContainerRef = useRef<HTMLDivElement>(null);
  const floatingPreviewRef = useRef<HTMLDivElement>(null);
  useGsapStaggerReveal(heroContainerRef, '.ay-login-reveal', []);
  useGsapFloat(floatingPreviewRef);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: loginResolver,
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');
    try {
      const result = await loginMutation.mutateAsync(values);
      const nextPath = getVendorDashboardPath(result.vendor);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to log into the vendor portal.');
    }
  };

  const fillQuickDemo = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError('');
  };

  return (
    <div className="ay-portal-bg min-h-screen text-slate-900">
      <VendorPortalHeader />

      <main className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
        {/* Left showcase */}
        <section ref={heroContainerRef} className="space-y-8 lg:col-span-7">
          <div className="ay-login-reveal inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Official Andhra Pradesh Tourism Partner Network
          </div>

          <div className="ay-login-reveal space-y-4">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.15]">
              Manage your{' '}
              <span className="bg-gradient-to-r from-primary via-purple-700 to-amber-500 bg-clip-text text-transparent">
                Andhra Yatri
              </span>{' '}
              business from one portal
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Sign in with your verified business credentials to launch your specialized category workspace,
              track verification milestones, update listings, and process traveler bookings in real time.
            </p>
          </div>

          {/* Category Pillar Cards */}
          <div className="ay-login-reveal grid gap-3.5 sm:grid-cols-2">
            {PARTNER_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] backdrop-blur-xs transition hover:border-violet-200 hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${pillar.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-900">{pillar.title}</p>
                    <p className="text-xs text-slate-500 leading-snug">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Preview Card */}
          <div
            ref={floatingPreviewRef}
            className="ay-login-reveal hidden overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xl shadow-primary/5 sm:block"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={partnerShowcaseImg}
                alt="Andhra Yatri Vendor Partner Studio Preview"
                className="h-56 w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-semibold text-amber-300">Live Operating Command</p>
                  <p className="text-sm font-bold">Smart Inventory, Tariffs, KOT & Payouts</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold backdrop-blur-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live Sync
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right login card */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="lg:col-span-5"
        >
          <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5">
            <CardHeader className="space-y-2 pb-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-violet-200 bg-violet-50 text-primary">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Partner Access
                </Badge>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  256-bit TLS Encrypted
                </span>
              </div>
              <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
                Vendor Partner Login
              </CardTitle>
              <CardDescription>
                Enter your registered partner email and password to access your dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {isAuthenticated && vendor && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Active Session Detected
                    </p>
                    <p className="truncate text-sm font-bold text-emerald-950">
                      {vendor.businessName || vendor.email}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate(dashboardPath)}>
                    Resume
                  </Button>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
                >
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vendor-login-email">Business Email Address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="vendor-login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="business@example.com"
                      className="pl-10"
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-semibold text-rose-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vendor-login-password">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="vendor-login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      className="pr-10 pl-10"
                      aria-invalid={Boolean(errors.password)}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-semibold text-rose-600">{errors.password.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-bold"
                  disabled={isSubmitting || loginMutation.isPending}
                >
                  {isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Login'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/50 via-white to-amber-50/40 p-4 text-center">
                <p className="text-xs font-medium text-slate-600">
                  New tourism partner across Andhra Pradesh?
                </p>
                <Link
                  to="/signup"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition"
                >
                  Create Partner Account & Complete KYC
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}
