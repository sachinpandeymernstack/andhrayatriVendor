import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Compass,
  Landmark,
  ShoppingBag,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useVendorOnboarding } from '@/context/VendorOnboardingContext';
import { useGsapStaggerReveal } from '@/hooks/useGsapAnimations';
import { cn } from '@/lib/utils';
import type { VendorCategoryType } from '@/types/vendor';
import { SIGNUP_CATEGORIES } from './signupConstants';

const CATEGORY_ICONS: Record<VendorCategoryType, React.ComponentType<{ className?: string }>> = {
  hotels: Building2,
  restaurants: Utensils,
  activities: Compass,
  attractions: Landmark,
  shopping: ShoppingBag,
};

export function CategorySelectStage() {
  const { draft, setSelectedCategory, setActiveStep, setShowWizard } = useVendorOnboarding();
  const [error, setError] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  useGsapStaggerReveal(gridRef, '.ay-category-card', []);

  const handleNext = () => {
    if (!draft.selectedCategory) {
      setError('Please select a business category to continue.');
      return;
    }
    setError('');
    setActiveStep(1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2 text-center">
        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-primary">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Partner Category Selection
        </Badge>
        <h2 className="font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">
          Select your business category
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
          Your dashboard tools, compliance checklist, and live booking workflows adapt automatically to your category.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-xs"
        >
          {error}
        </div>
      )}

      <div ref={gridRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SIGNUP_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const isSelected = draft.selectedCategory === category.id;
          return (
            <motion.button
              key={category.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                setSelectedCategory(category.id);
                setError('');
              }}
              aria-pressed={isSelected}
              className="ay-category-card cursor-pointer text-left focus:outline-none"
            >
              <Card
                className={cn(
                  'h-full border-2 transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-violet-50/40 shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                    : 'border-slate-200/90 bg-white hover:border-violet-300 hover:shadow-md',
                )}
              >
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                          category.gradient,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          {category.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-extrabold text-slate-950">
                        {category.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-primary">{category.tagline}</p>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600">{category.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                    {category.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub}
                        className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => setShowWizard(false)}>
          <ArrowLeft className="h-4 w-4" /> Edit Account Info
        </Button>
        <Button type="button" size="lg" onClick={handleNext}>
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
