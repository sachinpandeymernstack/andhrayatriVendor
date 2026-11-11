import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/mediaUtils';
import { cn } from '@/lib/utils';
import type { VendorRecord } from '@/types/vendor';

export interface WorkspaceNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface VendorWorkspaceLayoutProps {
  vendor: VendorRecord | null;
  portalTitle: string;
  portalSubtitle: string;
  accentHex?: string;
  navItems: WorkspaceNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  unreadNotifications?: number;
  onToggleNotifications?: () => void;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

const MAIN_SITE_URL = (import.meta.env.VITE_MAIN_SITE_URL || 'https://andhrayatri.com').replace(
  /\/+$/,
  '',
);

export function VendorWorkspaceLayout({
  vendor,
  portalTitle,
  portalSubtitle,
  accentHex = '#6C36A2',
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  unreadNotifications = 0,
  onToggleNotifications,
  headerRight,
  children,
}: VendorWorkspaceLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const businessName =
    vendor?.businessName || vendor?.business_name || vendor?.ownerName || 'Partner Studio';
  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'AY';
  const logoSrc = resolveMediaUrl(String(vendor?.logoUrl || vendor?.logo || ''));
  const activeItem = navItems.find((item) => item.id === activeTab);

  const renderNavList = (isMobile = false) => (
    <nav className="flex-1 space-y-1 px-3 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeTab;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onTabChange(item.id);
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={cn(
              'group flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150',
              isActive
                ? 'bg-primary text-white shadow-sm shadow-primary/25 font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              sidebarCollapsed && !isMobile && 'justify-center px-2',
            )}
          >
            <span className="flex items-center gap-3 overflow-hidden">
              <Icon
                className={cn(
                  'h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary',
                )}
              />
              {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </span>
            {(!sidebarCollapsed || isMobile) && item.badge !== undefined && Number(item.badge) > 0 && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-bold shadow-2xs',
                  isActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900',
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-slate-200/90 bg-white transition-all duration-200 lg:flex',
          sidebarCollapsed ? 'w-20' : 'w-72',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200/90 px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src={logoImg} alt="Andhra Yatri" className="h-8.5 w-8.5 shrink-0 object-contain" />
            {!sidebarCollapsed && (
              <div className="truncate">
                <p className="truncate font-display text-sm font-extrabold text-slate-950">
                  {portalTitle}
                </p>
                <p className="truncate text-[11px] font-semibold text-slate-500">{portalSubtitle}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="mx-3 mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-amber-50/40 p-3.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-violet-200 shadow-2xs">
                {logoSrc && <AvatarImage src={logoSrc} alt={businessName} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{businessName}</p>
                <Badge variant="success" className="mt-1 px-2 py-0 text-[10px] font-bold">
                  <Sparkles className="h-2.5 w-2.5 text-emerald-600" /> Verified Partner
                </Badge>
              </div>
            </div>
          </div>
        )}

        {renderNavList(false)}

        <div className="border-t border-slate-200/90 p-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onLogout}
            className={cn(
              'w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold',
              sidebarCollapsed && 'justify-center px-0',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 text-rose-500" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative flex h-full w-72 flex-col bg-white shadow-2xl"
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                <div className="flex items-center gap-2.5">
                  <img src={logoImg} alt="Andhra Yatri" className="h-8 w-8 object-contain" />
                  <div>
                    <p className="font-display text-sm font-extrabold text-slate-950">{portalTitle}</p>
                    <p className="text-[11px] text-slate-500">{businessName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {renderNavList(true)}
              <div className="border-t border-slate-200 p-3">
                <Button type="button" variant="destructive" className="w-full font-bold" onClick={onLogout}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full ring-2 ring-primary/20"
                  style={{ backgroundColor: accentHex }}
                />
                <h1 className="font-display text-base font-extrabold text-slate-950 sm:text-lg">
                  {activeItem?.label || portalTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Storefront
                </span>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                {businessName} · {vendor?.location?.city || 'Andhra Pradesh'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
            >
              andhrayatri.com
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </a>

            {headerRight}

            {onToggleNotifications && (
              <button
                type="button"
                aria-label="Toggle alerts"
                onClick={onToggleNotifications}
                className="relative cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-primary shadow-2xs"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-2xs">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
