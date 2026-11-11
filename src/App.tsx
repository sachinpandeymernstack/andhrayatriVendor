import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { VendorAuthProvider } from '@/context/VendorAuthContext';
import { VendorNotificationProvider } from '@/context/VendorNotificationContext';
import { VendorOnboardingProvider } from '@/context/VendorOnboardingContext';
import { VendorDashboardPage } from '@/pages/VendorDashboardPage';
import { VendorLoginPage } from '@/pages/VendorLoginPage';
import { VendorSignupPage } from '@/pages/VendorSignupPage';

export function createVendorQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

const defaultQueryClient = createVendorQueryClient();

export function VendorAppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<VendorLoginPage />} />
      <Route path="/login" element={<VendorLoginPage />} />
      <Route path="/vendor" element={<VendorLoginPage />} />

      <Route path="/signup" element={<VendorSignupPage />} />
      <Route path="/register" element={<VendorSignupPage />} />
      <Route path="/vendor-signup" element={<VendorSignupPage />} />

      <Route path="/dashboard" element={<VendorDashboardPage />} />
      <Route path="/dashboard/:category" element={<VendorDashboardPage />} />
      <Route path="/dashboard/category/:category" element={<VendorDashboardPage />} />
      <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
      <Route path="/vendor-dashboard/:category" element={<VendorDashboardPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function VendorAppProviders({
  children,
  queryClient = defaultQueryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <VendorNotificationProvider>
          <VendorAuthProvider>
            <VendorOnboardingProvider>
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center bg-[#FAF8FC] text-sm font-semibold text-primary">
                    Loading Andhra Yatri Vendor Hub...
                  </div>
                }
              >
                {children}
              </Suspense>
            </VendorOnboardingProvider>
          </VendorAuthProvider>
        </VendorNotificationProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <VendorAppProviders>
      <BrowserRouter>
        <VendorAppRoutes />
      </BrowserRouter>
    </VendorAppProviders>
  );
}

