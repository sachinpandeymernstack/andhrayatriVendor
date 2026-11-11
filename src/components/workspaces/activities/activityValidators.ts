export type ExperienceDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export interface ActivityExperience {
  id: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  difficulty: ExperienceDifficulty;
  pricePerPerson: number;
  maxGroupSize: number;
  minAge: number;
  safetyGear: string[];
  highlights: string;
  active: boolean;
}

export interface ActivityGuide {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  languages: string[];
  experienceYears: number;
  certified: boolean;
  onDuty: boolean;
}

export interface ActivityBooking {
  id: string;
  reference: string;
  experienceTitle: string;
  leadTraveler: string;
  participants: number;
  slotDate: string;
  slotTime: string;
  assignedGuide: string;
  totalAmount: number;
  status: 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled';
}

export function validateExperiencePayload(input: {
  title: string;
  duration: string;
  pricePerPerson: number;
  maxGroupSize: number;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.title || input.title.trim().length < 3) {
    errors.title = 'Experience title must be at least 3 characters.';
  }
  if (!input.duration || !input.duration.trim()) {
    errors.duration = 'Duration is required (e.g. 3 Hours).';
  }
  if (!Number.isFinite(input.pricePerPerson) || input.pricePerPerson <= 0) {
    errors.pricePerPerson = 'Price per person must be greater than zero.';
  }
  if (!Number.isFinite(input.maxGroupSize) || input.maxGroupSize < 1 || input.maxGroupSize > 100) {
    errors.maxGroupSize = 'Group capacity must be between 1 and 100.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateGuidePayload(input: {
  name: string;
  phone: string;
  specialty: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Guide name is required.';
  }
  if (!/^[+\d\s-]{10,15}$/.test(input.phone.trim())) {
    errors.phone = 'Valid contact number is required.';
  }
  if (!input.specialty || !input.specialty.trim()) {
    errors.specialty = 'Primary specialty is required.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

