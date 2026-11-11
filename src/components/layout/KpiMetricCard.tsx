import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KpiMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  accentClassName?: string;
  className?: string;
}

export function KpiMetricCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'up',
  icon: Icon,
  accentClassName = 'bg-primary/10 text-primary border-primary/20',
  className,
}: KpiMetricCardProps) {
  return (
    <Card
      className={cn(
        'ay-kpi-card group rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(108,54,162,0.08)] hover:border-violet-200',
        className,
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
            <p className="font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              {value}
            </p>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 shadow-2xs',
              accentClassName,
            )}
          >
            <Icon className="h-5.5 w-5.5" />
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
            <span className="truncate font-medium text-slate-500">{subtitle}</span>
            {trend && (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold shadow-2xs',
                  trendDirection === 'up' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                  trendDirection === 'down' && 'border-rose-200 bg-rose-50 text-rose-800',
                  trendDirection === 'neutral' && 'border-slate-200 bg-slate-100 text-slate-700',
                )}
              >
                {trendDirection === 'up' && <TrendingUp className="h-3 w-3 stroke-[2.5]" />}
                {trendDirection === 'down' && <TrendingDown className="h-3 w-3 stroke-[2.5]" />}
                {trend}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
