import { useCallback, useMemo, useState } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { useVendorToast } from '@/context/VendorNotificationContext';
import type { ActivityBooking, ActivityExperience, ActivityGuide } from './activityValidators';

const INITIAL_EXPERIENCES: ActivityExperience[] = [
  {
    id: 'exp-1',
    title: 'Borra Caves & Katiki Waterfalls Trek',
    category: 'Eco Trek',
    location: 'Araku Valley',
    duration: '4 Hours',
    difficulty: 'Moderate',
    pricePerPerson: 1450,
    maxGroupSize: 16,
    minAge: 10,
    safetyGear: ['Helmet', 'First Aid Kit', 'Trekking Poles'],
    highlights: 'Guided limestone cavern exploration followed by Jeep trail to Katiki Falls.',
    active: true,
  },
  {
    id: 'exp-2',
    title: 'Rushikonda Dawn Sea Kayaking',
    category: 'Water Sports',
    location: 'Visakhapatnam Coast',
    duration: '90 Minutes',
    difficulty: 'Easy',
    pricePerPerson: 950,
    maxGroupSize: 12,
    minAge: 12,
    safetyGear: ['Life Jacket', 'Rescue Whistle', 'Dry Pouch'],
    highlights: 'Sunrise paddle along Bay of Bengal reef line with certified lifeguard.',
    active: true,
  },
];

const INITIAL_GUIDES: ActivityGuide[] = [
  {
    id: 'gd-1',
    name: 'Surya Prakash Naidu',
    phone: '+91 98481 77665',
    specialty: 'Eastern Ghats Trekking & Wilderness',
    languages: ['Telugu', 'English', 'Hindi'],
    experienceYears: 7,
    certified: true,
    onDuty: true,
  },
  {
    id: 'gd-2',
    name: 'Kavya Srikanth',
    phone: '+91 99490 55443',
    specialty: 'Open Water Sports & Coastal Safety',
    languages: ['Telugu', 'English'],
    experienceYears: 5,
    certified: true,
    onDuty: true,
  },
];

const INITIAL_BOOKINGS: ActivityBooking[] = [
  {
    id: 'ab-1',
    reference: 'AYA-7812',
    experienceTitle: 'Borra Caves & Katiki Waterfalls Trek',
    leadTraveler: 'Rohan Kulkarni',
    participants: 4,
    slotDate: '2026-11-12',
    slotTime: '06:30 AM',
    assignedGuide: 'Surya Prakash Naidu',
    totalAmount: 5800,
    status: 'Confirmed',
  },
  {
    id: 'ab-2',
    reference: 'AYA-7809',
    experienceTitle: 'Rushikonda Dawn Sea Kayaking',
    leadTraveler: 'Sneha Chatterjee',
    participants: 2,
    slotDate: '2026-11-11',
    slotTime: '05:45 AM',
    assignedGuide: 'Kavya Srikanth',
    totalAmount: 1900,
    status: 'Checked-In',
  },
];

export function useActivitiesWorkspace() {
  const { vendor, logout } = useVendorAuth();
  const { showToast } = useVendorToast();

  const [isOnline, setIsOnline] = useState(true);
  const [experiences, setExperiences] = useState<ActivityExperience[]>(INITIAL_EXPERIENCES);
  const [guides, setGuides] = useState<ActivityGuide[]>(INITIAL_GUIDES);
  const [bookings, setBookings] = useState<ActivityBooking[]>(INITIAL_BOOKINGS);

  const metrics = useMemo(() => {
    const grossRevenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const participantsCount = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.participants, 0);
    return {
      grossRevenue,
      participantsCount,
      activeExperiences: experiences.filter((e) => e.active).length,
      onDutyGuides: guides.filter((g) => g.onDuty).length,
    };
  }, [bookings, experiences, guides]);

  const saveExperience = useCallback(
    (payload: Omit<ActivityExperience, 'id'>, editingId?: string) => {
      if (editingId) {
        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? { ...payload, id: editingId } : e)),
        );
        showToast('Experience itinerary updated.', 'success');
      } else {
        setExperiences((prev) => [{ ...payload, id: `exp-${Date.now()}` }, ...prev]);
        showToast('New experience published!', 'success');
      }
    },
    [showToast],
  );

  const toggleExperienceActive = useCallback((id: string) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)));
  }, []);

  const addGuide = useCallback(
    (guide: Omit<ActivityGuide, 'id'>) => {
      setGuides((prev) => [...prev, { ...guide, id: `gd-${Date.now()}` }]);
      showToast(`Guide ${guide.name} added to active roster.`, 'success');
    },
    [showToast],
  );

  const toggleGuideDuty = useCallback((id: string) => {
    setGuides((prev) => prev.map((g) => (g.id === id ? { ...g, onDuty: !g.onDuty } : g)));
  }, []);

  const updateBookingStatus = useCallback(
    (bookingId: string, status: ActivityBooking['status']) => {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      showToast(`Booking ${bookingId} updated to ${status}.`, 'success');
    },
    [showToast],
  );

  return {
    vendor,
    logout,
    isOnline,
    setIsOnline,
    experiences,
    guides,
    bookings,
    metrics,
    saveExperience,
    toggleExperienceActive,
    addGuide,
    toggleGuideDuty,
    updateBookingStatus,
  };
}

