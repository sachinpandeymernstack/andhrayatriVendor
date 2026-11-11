import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { VENDOR_SIGNUP_DRAFT_KEY } from '../lib/vendorSession';
import type {
  VendorAccountInfo,
  VendorBusinessInfo,
  VendorCategoryType,
  VendorPricingInfo,
  VendorServiceDetails,
} from '../types/vendor';

export interface UploadedDocumentMeta {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export interface VendorDocumentsDraft {
  aadhaarCard: UploadedDocumentMeta | null;
  aadhaarNumber: string;
  panCard: UploadedDocumentMeta | null;
  panNumber: string;
  gstCertificate: UploadedDocumentMeta | null;
  gstNumber: string;
  businessLicense: UploadedDocumentMeta | null;
  businessLicenseType: string;
  fssaiCertificate: UploadedDocumentMeta | null;
  fssaiNumber: string;
  businessLogo: UploadedDocumentMeta | null;
  galleryPhotos: Array<UploadedDocumentMeta & { id: string }>;
}

export interface VendorLocationDraft {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: string;
  longitude: string;
  mapLink: string;
}

export interface VendorOnboardingDraftState {
  account: VendorAccountInfo;
  showWizard: boolean;
  activeStep: number;
  selectedCategory: VendorCategoryType | '';
  businessInfo: Omit<VendorBusinessInfo, 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pincode' | 'country'> & {
    location: VendorLocationDraft;
  };
  serviceDetails: VendorServiceDetails;
  pricingInfo: VendorPricingInfo;
  documents: VendorDocumentsDraft;
  agreedToTerms: boolean;
}

const DEFAULT_ACCOUNT: VendorAccountInfo = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const DEFAULT_BUSINESS_INFO: VendorOnboardingDraftState['businessInfo'] = {
  businessName: '',
  ownerName: '',
  phone: '',
  email: '',
  alternateNumber: '',
  website: '',
  serviceAreas: '',
  description: '',
  bannerUrl: '',
  location: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
    country: 'India',
    latitude: '',
    longitude: '',
    mapLink: '',
  },
};

const DEFAULT_SERVICE_DETAILS: VendorServiceDetails = {
  categoryName: '',
  subcategory: '',
  openingTime: '09:00',
  closingTime: '18:00',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  hotelPropertyType: '',
  hotelStarCategory: '',
  hotelTotalRooms: '',
  hotelAvailableRooms: '',
  hotelBasePricePerNight: '',
  hotelRoomTypes: [],
  hotelAmenities: [],
  hotelCheckInTime: '14:00',
  hotelCheckOutTime: '11:00',
  hotelCancellationPolicy: 'Free cancellation up to 24 hours before check-in',
  restaurantCuisineTypes: [],
  restaurantFoodType: 'Both (Veg & Non-Veg)',
  restaurantServiceType: ['Dine-in', 'Takeaway'],
  restaurantSeatingCapacity: '',
  restaurantAvgCostForTwo: '',
  restaurantDeliveryRadius: '',
  restaurantMinOrderValue: '',
  activityType: '',
  activityDuration: '',
  activityDifficulty: 'Moderate',
  activityPricePerPerson: '',
  activityMaxGroupSize: '',
  activityIncludes: '',
  activitySafetyGear: 'Yes',
  activityAgeLimit: 'All Ages',
  attractionType: '',
  attractionTicketRequired: 'Yes',
  attractionEntryFeeAdult: '',
  attractionEntryFeeChild: '',
  attractionAvgVisitDuration: '',
  attractionBestTimeToVisit: '',
  attractionAccessibility: [],
  shoppingStoreType: '',
  shoppingProductCategories: [],
  shoppingDeliveryAvailable: 'Yes',
  shoppingReturnPolicy: '7 Days Easy Return',
  shoppingMinOrderValue: '',
};

const DEFAULT_PRICING_INFO: VendorPricingInfo = {
  priceRange: '₹500 – ₹5,000',
  startingPrice: '',
  paymentModes: 'UPI, Cards, Cash',
  offers: '',
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
};

const DEFAULT_DOCUMENTS: VendorDocumentsDraft = {
  aadhaarCard: null,
  aadhaarNumber: '',
  panCard: null,
  panNumber: '',
  gstCertificate: null,
  gstNumber: '',
  businessLicense: null,
  businessLicenseType: 'Shop & Establishment License',
  fssaiCertificate: null,
  fssaiNumber: '',
  businessLogo: null,
  galleryPhotos: [],
};

const INITIAL_DRAFT: VendorOnboardingDraftState = {
  account: DEFAULT_ACCOUNT,
  showWizard: false,
  activeStep: 1,
  selectedCategory: '',
  businessInfo: DEFAULT_BUSINESS_INFO,
  serviceDetails: DEFAULT_SERVICE_DETAILS,
  pricingInfo: DEFAULT_PRICING_INFO,
  documents: DEFAULT_DOCUMENTS,
  agreedToTerms: false,
};

function loadDraftFromStorage(): VendorOnboardingDraftState {
  if (typeof window === 'undefined') return INITIAL_DRAFT;
  try {
    const raw = window.localStorage.getItem(VENDOR_SIGNUP_DRAFT_KEY);
    if (!raw) return INITIAL_DRAFT;
    const parsed = JSON.parse(raw) as Partial<VendorOnboardingDraftState>;
    return {
      ...INITIAL_DRAFT,
      ...parsed,
      account: { ...DEFAULT_ACCOUNT, ...(parsed.account || {}), password: '', confirmPassword: '' },
      businessInfo: {
        ...DEFAULT_BUSINESS_INFO,
        ...(parsed.businessInfo || {}),
        location: { ...DEFAULT_BUSINESS_INFO.location, ...(parsed.businessInfo?.location || {}) },
      },
      serviceDetails: { ...DEFAULT_SERVICE_DETAILS, ...(parsed.serviceDetails || {}) },
      pricingInfo: { ...DEFAULT_PRICING_INFO, ...(parsed.pricingInfo || {}) },
      documents: { ...DEFAULT_DOCUMENTS, ...(parsed.documents || {}), galleryPhotos: [] },
    };
  } catch {
    return INITIAL_DRAFT;
  }
}

interface VendorOnboardingContextValue {
  draft: VendorOnboardingDraftState;
  setAccount: (updater: Partial<VendorAccountInfo>) => void;
  setShowWizard: (show: boolean) => void;
  setActiveStep: (step: number) => void;
  setSelectedCategory: (category: VendorCategoryType | '') => void;
  updateBusinessInfo: (patch: Partial<VendorOnboardingDraftState['businessInfo']>) => void;
  updateLocation: (patch: Partial<VendorLocationDraft>) => void;
  updateServiceDetails: (patch: Partial<VendorServiceDetails>) => void;
  updatePricingInfo: (patch: Partial<VendorPricingInfo>) => void;
  updateDocuments: (patch: Partial<VendorDocumentsDraft>) => void;
  setAgreedToTerms: (agreed: boolean) => void;
  resetDraft: () => void;
}

const VendorOnboardingContext = createContext<VendorOnboardingContextValue | undefined>(undefined);

export function VendorOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<VendorOnboardingDraftState>(loadDraftFromStorage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const serializableDraft = {
        ...draft,
        account: {
          fullName: draft.account.fullName,
          email: draft.account.email,
        },
      };
      window.localStorage.setItem(VENDOR_SIGNUP_DRAFT_KEY, JSON.stringify(serializableDraft));
    } catch {
      // Ignore quota exceeded for large data URLs.
    }
  }, [draft]);

  const setAccount = useCallback((updater: Partial<VendorAccountInfo>) => {
    setDraft((prev) => ({ ...prev, account: { ...prev.account, ...updater } }));
  }, []);

  const setShowWizard = useCallback((showWizard: boolean) => {
    setDraft((prev) => ({ ...prev, showWizard }));
  }, []);

  const setActiveStep = useCallback((activeStep: number) => {
    setDraft((prev) => ({ ...prev, activeStep }));
  }, []);

  const setSelectedCategory = useCallback((selectedCategory: VendorCategoryType | '') => {
    setDraft((prev) => ({
      ...prev,
      selectedCategory,
      serviceDetails: {
        ...prev.serviceDetails,
        categoryName: selectedCategory || '',
      },
    }));
  }, []);

  const updateBusinessInfo = useCallback(
    (patch: Partial<VendorOnboardingDraftState['businessInfo']>) => {
      setDraft((prev) => ({ ...prev, businessInfo: { ...prev.businessInfo, ...patch } }));
    },
    [],
  );

  const updateLocation = useCallback((patch: Partial<VendorLocationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        location: { ...prev.businessInfo.location, ...patch },
      },
    }));
  }, []);

  const updateServiceDetails = useCallback((patch: Partial<VendorServiceDetails>) => {
    setDraft((prev) => ({ ...prev, serviceDetails: { ...prev.serviceDetails, ...patch } }));
  }, []);

  const updatePricingInfo = useCallback((patch: Partial<VendorPricingInfo>) => {
    setDraft((prev) => ({ ...prev, pricingInfo: { ...prev.pricingInfo, ...patch } }));
  }, []);

  const updateDocuments = useCallback((patch: Partial<VendorDocumentsDraft>) => {
    setDraft((prev) => ({ ...prev, documents: { ...prev.documents, ...patch } }));
  }, []);

  const setAgreedToTerms = useCallback((agreedToTerms: boolean) => {
    setDraft((prev) => ({ ...prev, agreedToTerms }));
  }, []);

  const resetDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(VENDOR_SIGNUP_DRAFT_KEY);
    }
    setDraft(INITIAL_DRAFT);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setAccount,
      setShowWizard,
      setActiveStep,
      setSelectedCategory,
      updateBusinessInfo,
      updateLocation,
      updateServiceDetails,
      updatePricingInfo,
      updateDocuments,
      setAgreedToTerms,
      resetDraft,
    }),
    [
      draft,
      setAccount,
      setShowWizard,
      setActiveStep,
      setSelectedCategory,
      updateBusinessInfo,
      updateLocation,
      updateServiceDetails,
      updatePricingInfo,
      updateDocuments,
      setAgreedToTerms,
      resetDraft,
    ],
  );

  return (
    <VendorOnboardingContext.Provider value={value}>{children}</VendorOnboardingContext.Provider>
  );
}

export function useVendorOnboarding() {
  const ctx = useContext(VendorOnboardingContext);
  if (!ctx) {
    throw new Error('useVendorOnboarding must be used within VendorOnboardingProvider');
  }
  return ctx;
}

