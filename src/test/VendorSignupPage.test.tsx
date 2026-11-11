import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorAppProviders, VendorAppRoutes } from '@/App';
import { VENDOR_SESSION_KEY } from '@/lib/vendorSession';

function renderSignup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <VendorAppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={['/signup']}>
        <VendorAppRoutes />
      </MemoryRouter>
    </VendorAppProviders>,
  );
}

describe('VendorSignupPage onboarding wizard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('walks through account creation, category selection, business location, KYC & submission receipt', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          token: 'pending-signup-token',
          vendor: {
            id: 'AYV-884120',
            businessName: 'RK Beach Boutique Stay',
            email: 'owner@rkstay.in',
            category: 'hotels',
            status: 'Pending',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderSignup();

    // Stage 0: Account creation
    await user.type(screen.getByLabelText('Full Name'), 'Satyam Prasad');
    await user.type(screen.getByLabelText('Email ID'), 'owner@rkstay.in');
    await user.type(screen.getByLabelText('Password'), 'StrongPass123');
    await user.type(screen.getByLabelText('Confirm Password'), 'StrongPass123');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    // Category Stage
    expect(await screen.findByText('Select your business category')).toBeInTheDocument();
    await user.click(screen.getByText('Hotels & Stays'));
    await user.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 1: Business Info & Location
    expect(await screen.findByText(/Business Information & Location/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Business Name'), 'RK Beach Boutique Stay');
    await user.type(screen.getByLabelText('Mobile Number'), '9848012345');
    await user.type(screen.getByLabelText('Address Line 1'), '14 Beach Road, Pandurangapuram');
    await user.type(screen.getByLabelText('City'), 'Visakhapatnam');
    await user.type(screen.getByLabelText('Pincode / ZIP'), '530003');
    await user.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 2: Services
    expect(await screen.findByText(/Services & Operating Hours/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3: Documents & Banking
    expect(await screen.findByText(/KYC Verification, Brand Media & Bank Settlements/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Review Application/i }));

    // Step 4: Review & Terms -> Submit
    expect(await screen.findByText('Final Application Review')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    await user.click(screen.getByRole('button', { name: /Submit Application/i }));

    // Receipt stage
    expect(await screen.findByText('Application Submitted Successfully')).toBeInTheDocument();
    expect(screen.getByText('AYV-884120')).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(VENDOR_SESSION_KEY) || '{}');
    expect(stored.vendor?.businessName).toBe('RK Beach Boutique Stay');
  });
});

