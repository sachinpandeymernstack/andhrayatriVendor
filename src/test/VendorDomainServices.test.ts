import { describe, expect, it } from 'vitest';
import {
  getVendorDashboardPath,
  normalizeVendorCategory,
  normalizeVendorStatus,
} from '@/lib/vendorSession';
import {
  computeDiscountPercent,
  getLowStockProducts,
  hasChildCategories,
  slugifyCategory,
  wouldCreateCategoryCycle,
} from '@/components/workspaces/shopping/shoppingService';
import {
  validateExperiencePayload,
  validateGuidePayload,
} from '@/components/workspaces/activities/activityValidators';

describe('Vendor domain helpers', () => {
  it('normalizes vendor statuses and category routes cleanly', () => {
    expect(normalizeVendorStatus('active')).toBe('approved');
    expect(normalizeVendorStatus('under verification')).toBe('under_verification');
    expect(normalizeVendorStatus('DECLINED')).toBe('rejected');

    expect(normalizeVendorCategory('Hotels & Stays')).toBe('hotels');
    expect(normalizeVendorCategory('eat')).toBe('restaurants');
    expect(normalizeVendorCategory('crafts & shop')).toBe('shopping');
    expect(getVendorDashboardPath({ category: 'activities' })).toBe('/dashboard/activities');
  });

  it('guards category tree mutations against cycles and orphan deletions', () => {
    const categories = [
      { id: 'c1', name: 'Crafts', slug: 'crafts', parentId: null, active: true },
      { id: 'c2', name: 'Toys', slug: 'toys', parentId: 'c1', active: true },
      { id: 'c3', name: 'Wood', slug: 'wood', parentId: 'c2', active: true },
    ];

    expect(slugifyCategory('GI Crafts & Handlooms!')).toBe('gi-crafts-handlooms');
    expect(wouldCreateCategoryCycle(categories, 'c1', 'c3')).toBe(true);
    expect(wouldCreateCategoryCycle(categories, 'c3', 'c1')).toBe(false);
    expect(hasChildCategories(categories, 'c1')).toBe(true);
    expect(hasChildCategories(categories, 'c3')).toBe(false);
    expect(computeDiscountPercent(540, 650)).toBe(17);
    expect(
      getLowStockProducts([
        {
          id: '1',
          sku: 'A1',
          name: 'Coffee',
          category: 'Araku',
          price: 100,
          stock: 3,
          lowStockThreshold: 5,
          isActive: true,
        },
        {
          id: '2',
          sku: 'A2',
          name: 'Silk',
          category: 'Handloom',
          price: 900,
          stock: 20,
          lowStockThreshold: 5,
          isActive: true,
        },
      ]),
    ).toHaveLength(1);
  });

  it('validates experience & guide creation forms', () => {
    expect(
      validateExperiencePayload({
        title: 'Araku Cave Trek',
        duration: '3 Hours',
        pricePerPerson: 1200,
        maxGroupSize: 15,
      }).valid,
    ).toBe(true);

    expect(
      validateExperiencePayload({
        title: 'No',
        duration: '',
        pricePerPerson: 0,
        maxGroupSize: 200,
      }).valid,
    ).toBe(false);

    expect(
      validateGuidePayload({
        name: 'Ravi Teja',
        phone: '+91 9848011223',
        specialty: 'Eco Trails',
      }).valid,
    ).toBe(true);
  });
});

