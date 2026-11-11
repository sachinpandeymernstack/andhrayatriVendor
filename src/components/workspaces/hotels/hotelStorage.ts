export type HotelBookingStatus = 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled';

export interface HotelRoomType {
  id: string;
  name: string;
  capacity: number;
  baseRate: number;
  weekendRate: number;
  totalInventory: number;
  availableToday: number;
  amenities: string[];
  active: boolean;
}

export interface HotelBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pay at Hotel' | 'Refunded';
  status: HotelBookingStatus;
  specialRequests?: string;
}

export interface HotelReview {
  id: string;
  guestName: string;
  rating: number;
  roomType: string;
  date: string;
  comment: string;
  reply?: string;
}

export const HOTEL_BOOKINGS_STORAGE_KEY = 'hotelDashboard:v1:bookings';

export const DEFAULT_HOTEL_ROOMS: HotelRoomType[] = [
  {
    id: 'rm-dlx',
    name: 'Oceanfront Deluxe Room',
    capacity: 2,
    baseRate: 4200,
    weekendRate: 5100,
    totalInventory: 18,
    availableToday: 5,
    amenities: ['Sea Balcony', 'Breakfast Included', 'Free Wi-Fi', 'AC'],
    active: true,
  },
  {
    id: 'rm-exec',
    name: 'Executive Heritage Suite',
    capacity: 3,
    baseRate: 6800,
    weekendRate: 7900,
    totalInventory: 8,
    availableToday: 3,
    amenities: ['Private Lounge', 'Bathtub', 'Airport Shuttle', 'Breakfast'],
    active: true,
  },
  {
    id: 'rm-fam',
    name: 'Konaseema Family Villa',
    capacity: 4,
    baseRate: 9200,
    weekendRate: 10800,
    totalInventory: 4,
    availableToday: 2,
    amenities: ['Private Plunge', 'Kitchenette', 'Garden Patio', 'EV Charging'],
    active: true,
  },
];

export const DEFAULT_HOTEL_BOOKINGS: HotelBooking[] = [
  {
    id: 'AYH-9041',
    guestName: 'Karthikeya Sharma',
    guestEmail: 'karthik.sharma@example.com',
    guestPhone: '+91 98480 11223',
    roomType: 'Oceanfront Deluxe Room',
    roomNumber: '204',
    checkIn: '2026-11-11',
    checkOut: '2026-11-13',
    nights: 2,
    guestsCount: 2,
    totalAmount: 8400,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    specialRequests: 'High floor sea view room requested',
  },
  {
    id: 'AYH-9042',
    guestName: 'Ananya Reddy',
    guestEmail: 'ananya.reddy@example.com',
    guestPhone: '+91 99123 44556',
    roomType: 'Executive Heritage Suite',
    roomNumber: '301',
    checkIn: '2026-11-11',
    checkOut: '2026-11-14',
    nights: 3,
    guestsCount: 3,
    totalAmount: 20400,
    paymentStatus: 'Paid',
    status: 'Confirmed',
    specialRequests: 'Early breakfast hamper at 7 AM',
  },
  {
    id: 'AYH-9043',
    guestName: 'Srinivas Rao',
    guestEmail: 'srinivas.rao@example.com',
    guestPhone: '+91 97011 88776',
    roomType: 'Konaseema Family Villa',
    roomNumber: 'V-02',
    checkIn: '2026-11-12',
    checkOut: '2026-11-15',
    nights: 3,
    guestsCount: 4,
    totalAmount: 27600,
    paymentStatus: 'Pay at Hotel',
    status: 'Confirmed',
  },
  {
    id: 'AYH-9038',
    guestName: 'Meenakshi Iyer',
    guestEmail: 'meenakshi@example.com',
    guestPhone: '+91 94401 33445',
    roomType: 'Oceanfront Deluxe Room',
    roomNumber: '108',
    checkIn: '2026-11-08',
    checkOut: '2026-11-10',
    nights: 2,
    guestsCount: 2,
    totalAmount: 8400,
    paymentStatus: 'Paid',
    status: 'Checked-Out',
  },
];

export const DEFAULT_HOTEL_REVIEWS: HotelReview[] = [
  {
    id: 'rev-1',
    guestName: 'Harsha Vardhan',
    rating: 5,
    roomType: 'Oceanfront Deluxe Room',
    date: '2026-11-09',
    comment: 'Spotless rooms, warm Andhra hospitality, and sunrise views right from the balcony!',
    reply: 'Thank you Harsha! We look forward to hosting you again in Visakhapatnam.',
  },
  {
    id: 'rev-2',
    guestName: 'Divya Nair',
    rating: 4,
    roomType: 'Executive Heritage Suite',
    date: '2026-11-07',
    comment: 'Great Pesarattu & Upma breakfast buffet and quick check-in desk.',
  },
];

export function loadHotelBookings(): HotelBooking[] {
  try {
    const raw = window.localStorage.getItem(HOTEL_BOOKINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_HOTEL_BOOKINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as HotelBooking[]) : DEFAULT_HOTEL_BOOKINGS;
  } catch {
    return DEFAULT_HOTEL_BOOKINGS;
  }
}

export function saveHotelBookings(bookings: HotelBooking[]): void {
  try {
    window.localStorage.setItem(HOTEL_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore quota limits
  }
}

