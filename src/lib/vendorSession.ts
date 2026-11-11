import type { VendorCategoryType, VendorRecord, VendorSession } from '../types/vendor';

export const VENDOR_SESSION_KEY = 'andhraYatriVendorSession';
export const LOCAL_VENDORS_KEY = 'andhraYatriLocalVendors';
export const VENDOR_SIGNUP_DRAFT_KEY = 'andhraYatriVendorSignupDraft';
export const VENDOR_SESSION_EVENT = 'andhra-yatri-vendor-auth-change';

const safeWindow = () => (typeof window !== 'undefined' ? window : null);

function dispatchSessionChange() {
  const win = safeWindow();
  if (win) {
    win.dispatchEvent(new Event(VENDOR_SESSION_EVENT));
  }
}

export function getVendorSession(): VendorSession | null {
  try {
    const win = safeWindow();
    if (!win) return null;
    const raw = win.localStorage.getItem(VENDOR_SESSION_KEY);
    return raw ? (JSON.parse(raw) as VendorSession) : null;
  } catch {
    return null;
  }
}

export function saveVendorSession(session: VendorSession): void {
  const win = safeWindow();
  if (!win) return;
  win.localStorage.setItem(VENDOR_SESSION_KEY, JSON.stringify(session));
  dispatchSessionChange();
}

export function clearVendorSession(): void {
  const win = safeWindow();
  if (!win) return;
  win.localStorage.removeItem(VENDOR_SESSION_KEY);
  dispatchSessionChange();
}

export function onVendorSessionChange(callback: (session: VendorSession | null) => void): () => void {
  const win = safeWindow();
  if (!win) return () => {};
  const handle = () => callback(getVendorSession());
  win.addEventListener('storage', handle);
  win.addEventListener(VENDOR_SESSION_EVENT, handle);
  return () => {
    win.removeEventListener('storage', handle);
    win.removeEventListener(VENDOR_SESSION_EVENT, handle);
  };
}

export function getLocalVendors(): VendorRecord[] {
  try {
    const win = safeWindow();
    if (!win) return [];
    const raw = win.localStorage.getItem(LOCAL_VENDORS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as VendorRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalVendor(vendor: VendorRecord): void {
  const win = safeWindow();
  if (!win) return;
  const email = (vendor.email || '').trim().toLowerCase();
  const vendors = getLocalVendors().filter(
    (entry) => (entry.email || '').trim().toLowerCase() !== email,
  );
  vendors.unshift(vendor);
  win.localStorage.setItem(LOCAL_VENDORS_KEY, JSON.stringify(vendors));
}

export const DEFAULT_DEMO_VENDORS: VendorRecord[] = [
  {
    id: 'demo-hotel-vendor',
    _id: 'demo-hotel-vendor',
    businessName: 'Grand Haritha Beach Resort & Convention',
    ownerName: 'Raghavendra Rao',
    email: 'hotel@example.com',
    password: 'Pass@123',
    phone: '+91 98480 22338',
    category: 'hotels',
    categoryId: 'hotels',
    status: 'Approved',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530003',
    description: 'Premier seaside luxury resort overlooking Rushikonda Beach with 64 executive sea-view rooms and multi-cuisine dining.',
  },
  {
    id: 'demo-restaurant-vendor',
    _id: 'demo-restaurant-vendor',
    businessName: 'Konaseema Ruchulu Grand Kitchen',
    ownerName: 'Sita Devi Varma',
    email: 'restaurant@example.com',
    password: 'Pass@123',
    phone: '+91 98491 55421',
    category: 'restaurants',
    categoryId: 'restaurants',
    status: 'Approved',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    pincode: '533101',
    description: 'Authentic Godavari riverbed flavors, Natu Kodi biryani, Potlam biryani, and regional coastal Andhra thalis.',
  },
  {
    id: 'demo-shopping-vendor',
    _id: 'demo-shopping-vendor',
    businessName: 'Lepakshi Heritage Weaves & Handicrafts',
    ownerName: 'Venkata Subbaiah',
    email: 'shopping@example.com',
    password: 'Pass@123',
    phone: '+91 94401 88732',
    category: 'shopping',
    categoryId: 'shopping',
    status: 'Approved',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '520002',
    description: 'Master handloom Uppada silk sarees, GI-tagged Kondapalli softwood toys, and handcrafted brass artifacts.',
  },
  {
    id: 'demo-activities-vendor',
    _id: 'demo-activities-vendor',
    businessName: 'Araku Adventure Trails & Tribal Expeditions',
    ownerName: 'Kishore Varma',
    email: 'activities@example.com',
    password: 'Pass@123',
    phone: '+91 94402 33411',
    category: 'activities',
    categoryId: 'activities',
    status: 'Approved',
    city: 'Araku Valley',
    state: 'Andhra Pradesh',
    pincode: '531149',
    description: 'Guided Borra Caves treks, Katiki waterfalls trails, and Eastern Ghats camping experiences.',
  },
  {
    id: 'demo-attractions-vendor',
    _id: 'demo-attractions-vendor',
    businessName: 'Amaravati Heritage Museum & Cultural Center',
    ownerName: 'Dr. Madhava Rao',
    email: 'attractions@example.com',
    password: 'Pass@123',
    phone: '+91 98485 77622',
    category: 'attractions',
    categoryId: 'attractions',
    status: 'Approved',
    city: 'Amaravati',
    state: 'Andhra Pradesh',
    pincode: '522020',
    description: 'Historic Buddhist stūpa exhibitions, sound & light shows, and archeological heritage galleries.',
  },
  {
    id: 'demo-pending-hotel-vendor',
    _id: 'demo-pending-hotel-vendor',
    businessName: 'Coastal Horizon Stay',
    ownerName: 'Bhanu Murthy',
    email: 'pendinghotel@example.com',
    password: 'Pass@123',
    phone: '+91 98482 11990',
    category: 'hotels',
    categoryId: 'hotels',
    status: 'Pending',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530017',
    description: 'Boutique stay pending AP Tourism accreditation and document verification.',
  },
];

export function findLocalVendor(email?: string, password?: string): VendorRecord | null {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;

  // 1. Check user-created vendors from localStorage
  const localMatch = getLocalVendors().find((entry) => {
    const sameEmail = (entry.email || '').trim().toLowerCase() === normalizedEmail;
    if (!sameEmail) return false;
    if (password === undefined) return true;
    return entry.password === password;
  });
  if (localMatch) return localMatch;

  // 2. Fall back to pre-seeded demo partner vendor accounts
  const demoMatch = DEFAULT_DEMO_VENDORS.find((entry) => {
    const sameEmail = (entry.email || '').trim().toLowerCase() === normalizedEmail;
    if (!sameEmail) return false;
    if (password === undefined) return true;
    return entry.password === password;
  });
  return demoMatch || null;
}

export function normalizeVendorStatus(status?: string | null): string {
  const normalized = String(status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (['approved', 'active', 'verified', 'live'].includes(normalized)) {
    return 'approved';
  }
  if (['rejected', 'declined', 'denied'].includes(normalized)) {
    return 'rejected';
  }
  if (['expired', 'lapsed', 'renewal_required', 'renewal_due'].includes(normalized)) {
    return 'expired';
  }
  if (['suspended', 'blocked', 'banned', 'disabled', 'paused', 'deactivated'].includes(normalized)) {
    return 'suspended';
  }
  if (normalized === 'draft') {
    return 'draft';
  }
  if (normalized === 'submitted') {
    return 'submitted';
  }
  if (normalized === 'pending_review') {
    return 'pending_review';
  }
  if (normalized === 'under_verification') {
    return 'under_verification';
  }
  return 'pending';
}

export function isVendorApproved(status?: string | null): boolean {
  return normalizeVendorStatus(status) === 'approved';
}

export interface VendorDashboardConfig {
  category: VendorCategoryType;
  label: string;
  badge: string;
  headline: string;
  subtitle: string;
  itemLabel: string;
  itemPlural: string;
  apiCategory: string;
  accent: string;
  itemPlaceholder: string;
  descriptionPlaceholder: string;
  priceLabel: string;
  stockLabel: string;
  quickFilters: string[];
  emptyMessage: string;
}

const VENDOR_CATEGORY_CONFIG: Record<VendorCategoryType, VendorDashboardConfig> = {
  restaurants: {
    category: 'restaurants',
    label: 'Restaurants & Dining',
    badge: 'Restaurant Partner Workspace',
    headline: 'Manage dishes, combos, pricing & table availability',
    subtitle: 'Publish signature Andhra meals, update daily specials and track customer menu inquiries.',
    itemLabel: 'Menu Item',
    itemPlural: 'Menu Items',
    apiCategory: 'eat',
    accent: '#ea580c',
    itemPlaceholder: 'e.g. Gutti Vankaya Biryani Combo',
    descriptionPlaceholder: 'Describe portion size, spice profile, ingredients and serving time...',
    priceLabel: 'Item Price (INR)',
    stockLabel: 'Daily Portions Available',
    quickFilters: ['All', 'Tiffins', 'Meals', 'Biryani', 'Sweets', 'Beverages'],
    emptyMessage: 'No menu items added yet. Publish your signature dishes to start receiving diner interest.',
  },
  hotels: {
    category: 'hotels',
    label: 'Hotels & Stays',
    badge: 'Hotel Partner Workspace',
    headline: 'Manage rooms, packages, tariffs & stay inventory',
    subtitle: 'Keep room availability, seasonal stay tariffs and property amenities updated for travellers.',
    itemLabel: 'Room / Package',
    itemPlural: 'Rooms & Packages',
    apiCategory: 'stay',
    accent: '#2563eb',
    itemPlaceholder: 'e.g. Executive Sea-View Suite',
    descriptionPlaceholder: 'Mention bed count, AC/Wi-Fi, breakfast inclusion and check-in perks...',
    priceLabel: 'Nightly Tariff (INR)',
    stockLabel: 'Available Rooms / Units',
    quickFilters: ['All', 'Deluxe Room', 'Family Suite', 'Villa', 'Weekend Package'],
    emptyMessage: 'No room categories listed yet. Add your first room or stay package to appear to travellers.',
  },
  shopping: {
    category: 'shopping',
    label: 'Shopping & Handicrafts',
    badge: 'Shopping Partner Workspace',
    headline: 'Manage store catalog, stock count & order fulfillment',
    subtitle: 'List handloom weaves, Kondapalli crafts and local specialties while tracking incoming customer orders.',
    itemLabel: 'Store Product',
    itemPlural: 'Store Products',
    apiCategory: 'shop',
    accent: '#db2777',
    itemPlaceholder: 'e.g. Handwoven Uppada Silk Saree',
    descriptionPlaceholder: 'Describe craft origin, material, dimensions, care notes and packaging...',
    priceLabel: 'Selling Price (INR)',
    stockLabel: 'Units in Stock',
    quickFilters: ['All', 'Handlooms', 'Handicrafts', 'Spices & Coffee', 'Gifts'],
    emptyMessage: 'No store products published yet. Add your first craft or retail product below.',
  },
  activities: {
    category: 'activities',
    label: 'Activities & Tours',
    badge: 'Activities Partner Workspace',
    headline: 'Manage experiences, departure slots & group capacity',
    subtitle: 'Set up curated guided trails, boating trips and cultural workshops with clear pricing and slots.',
    itemLabel: 'Activity Slot',
    itemPlural: 'Activity Slots',
    apiCategory: 'activity',
    accent: '#0d9488',
    itemPlaceholder: 'e.g. Sunrise Kayaking & Mangrove Trail',
    descriptionPlaceholder: 'Share meeting point, duration, included safety gear and guide notes...',
    priceLabel: 'Ticket Price (INR)',
    stockLabel: 'Slots Available',
    quickFilters: ['All', 'Guided Tour', 'Water Sport', 'Trek', 'Workshop'],
    emptyMessage: 'No activity experiences created yet. Add your first tour or experience slot.',
  },
  attractions: {
    category: 'attractions',
    label: 'Attractions & Venues',
    badge: 'Attractions Partner Workspace',
    headline: 'Manage entry passes, guided access & visitor slots',
    subtitle: 'Coordinate museum tickets, heritage passes, darshan shuttles and seasonal attraction timing.',
    itemLabel: 'Attraction Pass',
    itemPlural: 'Attraction Passes',
    apiCategory: 'attraction',
    accent: '#7c3aed',
    itemPlaceholder: 'e.g. Heritage Museum Full-Day Pass',
    descriptionPlaceholder: 'Highlight entry timings, guided audio access, camera rules and age concessions...',
    priceLabel: 'Pass Price (INR)',
    stockLabel: 'Daily Passes Available',
    quickFilters: ['All', 'Entry Pass', 'VIP Access', 'Family Bundle', 'Evening Show'],
    emptyMessage: 'No attraction passes added yet. Create your first pass or visitor slot.',
  },
};

const CATEGORY_ALIASES: Record<string, VendorCategoryType> = {
  restaurant: 'restaurants',
  restaurants: 'restaurants',
  eat: 'restaurants',
  food: 'restaurants',
  dining: 'restaurants',
  'food-dining': 'restaurants',
  hotel: 'hotels',
  hotels: 'hotels',
  stay: 'hotels',
  stays: 'hotels',
  resort: 'hotels',
  resorts: 'hotels',
  shopping: 'shopping',
  shop: 'shopping',
  retail: 'shopping',
  store: 'shopping',
  activities: 'activities',
  activity: 'activities',
  adventure: 'activities',
  adventures: 'activities',
  tour: 'activities',
  tours: 'activities',
  attractions: 'attractions',
  attraction: 'attractions',
  venue: 'attractions',
  venues: 'attractions',
  heritage: 'attractions',
};

export function normalizeVendorCategory(categoryValue?: string | null): VendorCategoryType {
  const cleaned = String(categoryValue || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (CATEGORY_ALIASES[cleaned]) {
    return CATEGORY_ALIASES[cleaned];
  }

  for (const [alias, normalized] of Object.entries(CATEGORY_ALIASES)) {
    if (cleaned.includes(alias)) {
      return normalized;
    }
  }

  return 'shopping';
}

export function getVendorDashboardConfig(categoryValue?: string | null): VendorDashboardConfig {
  const key = normalizeVendorCategory(categoryValue);
  return VENDOR_CATEGORY_CONFIG[key] || VENDOR_CATEGORY_CONFIG.shopping;
}

export function resolveVendorCategorySource(vendorOrCategory?: VendorRecord | string | null): string {
  if (!vendorOrCategory) return '';
  if (typeof vendorOrCategory === 'string') return vendorOrCategory;
  return String(
    vendorOrCategory.category ||
      vendorOrCategory.categoryId ||
      vendorOrCategory.category_details?.categoryName ||
      vendorOrCategory.subcategory ||
      '',
  );
}

export function getVendorDashboardPath(vendorOrCategory?: VendorRecord | string | null): string {
  const rawCategory = resolveVendorCategorySource(vendorOrCategory);
  if (!rawCategory) {
    return '/dashboard';
  }
  return `/dashboard/${normalizeVendorCategory(rawCategory)}`;
}

