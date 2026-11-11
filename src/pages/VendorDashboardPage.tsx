import React, { lazy, Suspense, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { VendorStatusGate } from '@/components/dashboard/VendorStatusGate';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorProfileSyncQuery } from '@/hooks/queries/useVendorQueries';
import {
  getVendorDashboardConfig,
  isVendorApproved,
  normalizeVendorCategory,
} from '@/lib/vendorSession';

const HotelWorkspace = lazy(() =>
  import('@/components/workspaces/hotels/HotelWorkspace').then((m) => ({
    default: m.HotelWorkspace,
  })),
);
const RestaurantWorkspace = lazy(() =>
  import('@/components/workspaces/restaurants/RestaurantWorkspace').then((m) => ({
    default: m.RestaurantWorkspace,
  })),
);
const ShoppingWorkspace = lazy(() =>
  import('@/components/workspaces/shopping/ShoppingWorkspace').then((m) => ({
    default: m.ShoppingWorkspace,
  })),
);
const ActivitiesWorkspace = lazy(() =>
  import('@/components/workspaces/activities/ActivitiesWorkspace').then((m) => ({
    default: m.ActivitiesWorkspace,
  })),
);
const AttractionsGeneralWorkspace = lazy(() =>
  import('@/components/workspaces/attractions/AttractionsGeneralWorkspace').then((m) => ({
    default: m.AttractionsGeneralWorkspace,
  })),
);

function WorkspaceFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8FC] text-sm font-semibold text-primary">
      Initializing Partner Workspace...
    </div>
  );
}

export function VendorDashboardPage() {
  const { category: categoryParam } = useParams<{ category?: string }>();
  const {
    session,
    vendor,
    token,
    normalizedStatus,
    category,
    dashboardConfig,
    updateVendor,
    logout,
  } = useVendorAuth();

  const vendorId = String(vendor?._id || vendor?.id || '');
  const canPollRemote = Boolean(vendorId && token && token !== 'pending-local-session');

  const profileQuery = useVendorProfileSyncQuery(vendorId, token, canPollRemote);

  useEffect(() => {
    if (profileQuery.data) {
      updateVendor(profileQuery.data);
    }
  }, [profileQuery.data, updateVendor]);

  if (!session || !vendor) {
    return <Navigate to="/login" replace />;
  }

  if (!isVendorApproved(vendor.status)) {
    return (
      <VendorStatusGate
        vendor={vendor}
        normalizedStatus={normalizedStatus}
        dashboardConfig={dashboardConfig}
        isSyncing={profileQuery.isFetching}
        onRefreshStatus={() => void profileQuery.refetch()}
        onLogout={logout}
      />
    );
  }

  const effectiveCategory = normalizeVendorCategory(categoryParam || category);
  const effectiveConfig = getVendorDashboardConfig(effectiveCategory);

  return (
    <Suspense fallback={<WorkspaceFallback />}>
      {effectiveCategory === 'hotels' ? (
        <HotelWorkspace />
      ) : effectiveCategory === 'restaurants' ? (
        <RestaurantWorkspace />
      ) : effectiveCategory === 'shopping' ? (
        <ShoppingWorkspace />
      ) : effectiveCategory === 'activities' ? (
        <ActivitiesWorkspace />
      ) : (
        <AttractionsGeneralWorkspace dashboardConfig={effectiveConfig} />
      )}
    </Suspense>
  );
}
