import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearVendorSession,
  findLocalVendor,
  getVendorDashboardConfig,
  getVendorDashboardPath,
  getVendorSession,
  normalizeVendorCategory,
  normalizeVendorStatus,
  onVendorSessionChange,
  saveLocalVendor,
  saveVendorSession,
  type VendorDashboardConfig,
} from '../lib/vendorSession';
import type { VendorCategoryType, VendorRecord, VendorSession } from '../types/vendor';

interface VendorAuthContextValue {
  session: VendorSession | null;
  vendor: VendorRecord | null;
  token: string;
  isAuthenticated: boolean;
  normalizedStatus: string;
  category: VendorCategoryType;
  dashboardConfig: VendorDashboardConfig;
  dashboardPath: string;
  setSession: (nextSession: VendorSession) => void;
  updateVendor: (patchOrVendor: Partial<VendorRecord>) => void;
  registerLocalVendor: (vendor: VendorRecord, sessionToken?: string) => VendorSession;
  findLocalMatch: (email: string, password?: string) => VendorRecord | null;
  logout: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextValue | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<VendorSession | null>(() => getVendorSession());

  useEffect(() => {
    return onVendorSessionChange((nextSession) => {
      setSessionState(nextSession);
    });
  }, []);

  const setSession = useCallback((nextSession: VendorSession) => {
    saveVendorSession(nextSession);
    setSessionState(nextSession);
  }, []);

  const updateVendor = useCallback((patchOrVendor: Partial<VendorRecord>) => {
    const current = getVendorSession();
    if (!current) return;
    const mergedVendor: VendorRecord = {
      ...current.vendor,
      ...patchOrVendor,
    };
    const nextSession: VendorSession = {
      ...current,
      vendor: mergedVendor,
    };
    saveVendorSession(nextSession);
    if (mergedVendor.email) {
      saveLocalVendor({ ...mergedVendor, password: current.vendor?.password });
    }
    setSessionState(nextSession);
  }, []);

  const registerLocalVendor = useCallback(
    (vendorRecord: VendorRecord, sessionToken = 'pending-local-session') => {
      saveLocalVendor(vendorRecord);
      const nextSession: VendorSession = {
        token: sessionToken,
        vendor: vendorRecord,
        loggedInAt: new Date().toISOString(),
      };
      saveVendorSession(nextSession);
      setSessionState(nextSession);
      return nextSession;
    },
    [],
  );

  const findLocalMatch = useCallback((email: string, password?: string) => {
    return findLocalVendor(email, password);
  }, []);

  const logout = useCallback(() => {
    clearVendorSession();
    setSessionState(null);
  }, []);

  const vendor = session?.vendor || null;
  const token = session?.token || '';
  const isAuthenticated = Boolean(session?.vendor);
  const normalizedStatus = normalizeVendorStatus(vendor?.status);
  const category = normalizeVendorCategory(
    String(vendor?.category || vendor?.categoryId || vendor?.subcategory || 'shopping'),
  );
  const dashboardConfig = getVendorDashboardConfig(category);
  const dashboardPath = getVendorDashboardPath(vendor);

  const value = useMemo<VendorAuthContextValue>(
    () => ({
      session,
      vendor,
      token,
      isAuthenticated,
      normalizedStatus,
      category,
      dashboardConfig,
      dashboardPath,
      setSession,
      updateVendor,
      registerLocalVendor,
      findLocalMatch,
      logout,
    }),
    [
      session,
      vendor,
      token,
      isAuthenticated,
      normalizedStatus,
      category,
      dashboardConfig,
      dashboardPath,
      setSession,
      updateVendor,
      registerLocalVendor,
      findLocalMatch,
      logout,
    ],
  );

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>;
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return ctx;
}

