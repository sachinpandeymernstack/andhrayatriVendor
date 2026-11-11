import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { mapZodErrors, vendorAccountSchema } from '@/lib/validation';

export function AccountCreationStage() {
  const { draft, setAccount, updateBusinessInfo, setShowWizard, setActiveStep } = useVendorOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = mapZodErrors(vendorAccountSchema, draft.account);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    updateBusinessInfo({
      ownerName: draft.businessInfo.ownerName || validation.data.fullName,
      email: draft.businessInfo.email || validation.data.email,
    });
    setActiveStep(0);
    setShowWizard(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-12"
    >
      <div className="space-y-6 lg:col-span-6">
        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-primary">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Partner Onboarding · Step 0 of 4
        </Badge>
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Launch your business across{' '}
            <span className="bg-gradient-to-r from-primary via-purple-700 to-amber-500 bg-clip-text text-transparent">
              Andhra Pradesh
            </span>
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Join verified hotels, Andhra kitchens, artisan stores, adventure hosts, and sightseeing venues
            reaching lakhs of travelers through Andhra Yatri.
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          {[
            {
              title: 'Category-Tailored Workspace',
              desc: 'Dedicated suites for Hotels, Dining, Crafts, Activities & Attractions',
            },
            {
              title: 'Autosaved Registration & Live GPS',
              desc: 'Never lose draft progress with browser-cached state & reverse-geocoding',
            },
            {
              title: 'Direct Bank Settlements',
              desc: 'Automated GST-compliant invoicing and next-day payout clearing',
            },
            {
              title: 'APTDC Official Partner Desk',
              desc: 'Fast-track document audit within 24–48 hours by tourism officers',
            },
          ].map((point) => (
            <div key={point.title} className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-3 shadow-2xs backdrop-blur-xs">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">{point.title}</p>
                <p className="text-xs text-slate-500">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 lg:col-span-6">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="font-display text-2xl font-extrabold text-slate-950">
            Create Partner Account
          </CardTitle>
          <CardDescription>
            Start with your primary partner login credentials to unlock the onboarding wizard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-full-name">Full Name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signup-full-name"
                  placeholder="Enter your full legal name"
                  className="pl-10"
                  aria-invalid={Boolean(errors.fullName)}
                  value={draft.account.fullName}
                  onChange={(e) => {
                    setAccount({ fullName: e.target.value });
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                />
              </div>
              {errors.fullName && <p className="text-xs font-semibold text-rose-600">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Email ID</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="business@example.com"
                  className="pl-10"
                  aria-invalid={Boolean(errors.email)}
                  value={draft.account.email}
                  onChange={(e) => {
                    setAccount({ email: e.target.value });
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-rose-600">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className="pr-10 pl-10"
                  aria-invalid={Boolean(errors.password)}
                  value={draft.account.password}
                  onChange={(e) => {
                    setAccount({ password: e.target.value });
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-rose-600">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="pl-10"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  value={draft.account.confirmPassword || ''}
                  onChange={(e) => {
                    setAccount({ confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full text-base font-bold">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign in to existing partner account
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
