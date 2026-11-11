import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VendorAppProviders, VendorAppRoutes } from '@/App';
import { saveVendorSession } from '@/lib/vendorSession';
import type { VendorRecord } from '@/types/vendor';

function renderDashboard(route = '/dashboard') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <VendorAppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <VendorAppRoutes />
      </MemoryRouter>
    </VendorAppProviders>,
  );
}

function seedVendor(vendor: Partial<VendorRecord>) {
  saveVendorSession({
    token: 'pending-local-session',
    vendor: {
      id: 'v-100',
      email: 'partner@andhrayatri.com',
      businessName: 'Andhra Heritage Co',
      category: 'shopping',
      ...vendor,
    },
  });
}

describe('VendorDashboardPage gating & workspace dispatch', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects unauthenticated requests back to login', async () => {
    renderDashboard('/dashboard/hotels');
    expect(await screen.findByText('Vendor Partner Login')).toBeInTheDocument();
  });

  it('renders Pending review gate for unapproved applications', async () => {
    seedVendor({ status: 'Pending', category: 'hotels' });
    renderDashboard('/dashboard/hotels');
    expect(await screen.findByText('Application Under Review')).toBeInTheDocument();
    expect(screen.getByText('Vendor Activity Timeline')).toBeInTheDocument();
  });

  it('renders Rejected gate with reviewer feedback', async () => {
    seedVendor({ status: 'Rejected', rejectionReason: 'GST certificate blurred' });
    renderDashboard('/dashboard/shopping');
    expect(await screen.findByText('Application Requires Corrections')).toBeInTheDocument();
    expect(screen.getByText('GST certificate blurred')).toBeInTheDocument();
  });

  it('renders Expired gate with renewal callout', async () => {
    seedVendor({ status: 'Expired' });
    renderDashboard('/dashboard/shopping');
    expect(await screen.findByText('Partner Validity Period Ended')).toBeInTheDocument();
  });

  it('renders Suspended gate with trust and safety reason', async () => {
    seedVendor({ status: 'Suspended', suspensionReason: 'Policy audit underway' });
    renderDashboard('/dashboard/shopping');
    expect(await screen.findByText('Partner Storefront Temporarily Suspended')).toBeInTheDocument();
    expect(screen.getByText('Policy audit underway')).toBeInTheDocument();
  });

  it('dispatches approved vendors to each specialized category workspace', async () => {
    seedVendor({ status: 'Approved', category: 'restaurants' });
    const restRender = renderDashboard('/dashboard/restaurants');
    expect(await screen.findByText('Kitchen & Dining Command')).toBeInTheDocument();
    restRender.unmount();

    seedVendor({ status: 'Approved', category: 'shopping' });
    const shopRender = renderDashboard('/dashboard/shopping');
    expect(await screen.findByText('Shopping & Crafts Studio')).toBeInTheDocument();
    shopRender.unmount();

    seedVendor({ status: 'Approved', category: 'activities' });
    renderDashboard('/dashboard/activities');
    expect(await screen.findByText('Activities & Adventures Hub')).toBeInTheDocument();
  });
});
