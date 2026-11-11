import type { VendorCategoryType } from '@/types/vendor';

export interface SignupCategoryOption {
  id: VendorCategoryType;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  subcategories: string[];
  gradient: string;
}

export const SIGNUP_CATEGORIES: SignupCategoryOption[] = [
  {
    id: 'hotels',
    title: 'Hotels & Stays',
    tagline: 'Resorts, boutiques, APTDC properties & homestays',
    description: 'Manage room tariffs, occupancy calendars, direct traveler bookings and guest reviews.',
    badge: 'Hospitality',
    subcategories: ['Luxury Resort', 'Business Hotel', 'Boutique Stay', 'APTDC Haritha Resort', 'Heritage Homestay', 'Eco Lodge'],
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'restaurants',
    title: 'Restaurants & Dining',
    tagline: 'Authentic Andhra kitchens, cafes & family dining',
    description: 'Publish digital menus, accept dine-in/takeaway orders with KOT receipts and track prep times.',
    badge: 'Food & Dining',
    subcategories: ['Andhra Traditional Meals', 'Multi-Cuisine Restaurant', 'Coastal Seafood Kitchen', 'Cafe & Bakery', 'Biryani House', 'Sweet Shop & Mithai'],
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'activities',
    title: 'Activities & Experiences',
    tagline: 'Treks, water sports, heritage walks & cultural shows',
    description: 'Schedule daily activity slots, assign certified guides, manage safety gear and group caps.',
    badge: 'Experiences',
    subcategories: ['Trekking & Eco Trails', 'Water Sports & Boating', 'Temple Heritage Walk', 'Kuchipudi Cultural Evening', 'Food & Craft Trail', 'Cycle & Jeep Safari'],
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'attractions',
    title: 'Attractions & Sightseeing',
    tagline: 'Museums, eco parks, caves, forts & theme zones',
    description: 'Publish visitor entry fees, peak-hour slots, accessibility info and guided audio tickets.',
    badge: 'Landmarks',
    subcategories: ['Botanical / Eco Park', 'Heritage Fort / Museum', 'Adventure Theme Park', 'Botanical Sanctuary', 'Cultural Amphitheater', 'Observatory & Pier'],
    gradient: 'from-sky-600 to-blue-600',
  },
  {
    id: 'shopping',
    title: 'Shopping & Local Stores',
    tagline: 'Handlooms, Kalamkari, Etikoppaka & Araku coffee',
    description: 'List regional crafts & GI-tagged souvenirs, control SKU stock, pack orders and dispatch couriers.',
    badge: 'Retail & Crafts',
    subcategories: ['Mangalagiri / Dharmavaram Silk', 'Kondapalli & Etikoppaka Toys', 'Kalamkari Studio', 'Araku Organic Coffee & Honey', 'Bobbili & Wood Crafts', 'Travel Gear & Essentials'],
    gradient: 'from-fuchsia-600 to-purple-600',
  },
];

export const WIZARD_STEPS = [
  { step: 1, title: 'Business & Location', short: 'Business' },
  { step: 2, title: 'Services & Operations', short: 'Services' },
  { step: 3, title: 'Documents & Banking', short: 'KYC & Bank' },
  { step: 4, title: 'Review & Submit', short: 'Review' },
] as const;

export const WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const HOTEL_ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Executive Suite',
  'Family Villa',
  'Cottage / Tent',
];

export const HOTEL_AMENITIES = [
  'Free Wi-Fi',
  'Breakfast Included',
  'Swimming Pool',
  'Air Conditioning',
  '24x7 Front Desk',
  'Airport Shuttle',
  'EV Charging',
  'Spa & Wellness',
];

export const RESTAURANT_CUISINES = [
  'Authentic Andhra',
  'Rayalaseema Spice',
  'Coastal Konaseema',
  'Hyderabadi Biryani',
  'South Indian Tiffins',
  'North Indian',
  'Chinese & Pan-Asian',
  'Cafe & Desserts',
];

export const RESTAURANT_SERVICE_MODES = ['Dine-in', 'Takeaway', 'Delivery', 'Table Reservation'];

export const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Accessible',
  'Stroller Friendly',
  'Audio Guide Available',
  'Senior Citizen Priority',
  'First Aid Station',
];

export const SHOPPING_CATEGORIES = [
  'Handloom Sarees',
  'Artisan Toys & Woodcraft',
  'Kalamkari & Textiles',
  'Spices & Araku Coffee',
  'Jewellery & Brassware',
  'Ayurveda & Wellness',
];

