import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorAppProviders, VendorAppRoutes } from '@/App';
import { VENDOR_SESSION_KEY, saveLocalVendor } from '@/lib/vendorSession';

function renderAtRoute(initialRoute = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <VendorAppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <VendorAppRoutes />
      </MemoryRouter>
    </VendorAppProviders>,
  );
}

describe('VendorLoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('validates invalid email & missing password before sending requests', async () => {
    const user = userEvent.setup();
    renderAtRoute('/login');

    const submitBtn = screen.getByRole('button', { name: /^Login$/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/valid business email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it('redirects pending approval logins to Vendor Activity Timeline with local fallback session', async () => {
    const user = userEvent.setup();
    saveLocalVendor({
      email: 'pendinghotel@example.com',
      businessName: 'Coastal Horizon Stay',
      category: 'hotels',
      status: 'Pending',
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Account is waiting for admin approval' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderAtRoute('/login');

    await user.type(screen.getByPlaceholderText('business@example.com'), 'pendinghotel@example.com');
    await user.type(screen.getByPlaceholderText('Enter password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /^Login$/i }));

    expect(await screen.findByText('Application Under Review')).toBeInTheDocument();
    expect(screen.getByText('Vendor Activity Timeline')).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(VENDOR_SESSION_KEY) || '{}');
    expect(stored.token).toBe('pending-local-session');
    expect(stored.vendor?.status).toBe('Pending');
  });

  it('logs approved partners directly into their category workspace', async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          token: 'live-jwt-token',
          vendor: {
            id: 'v-hotel-1',
            email: 'hotel@example.com',
            businessName: 'Haritha Bay Resort',
            category: 'hotels',
            status: 'Approved',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderAtRoute('/login');

    await user.type(screen.getByPlaceholderText('business@example.com'), 'hotel@example.com');
    await user.type(screen.getByPlaceholderText('Enter password'), 'Pass@123');
    await user.click(screen.getByRole('button', { name: /^Login$/i }));

    expect(await screen.findByText('Hotel Partner Suite')).toBeInTheDocument();
  });
});
