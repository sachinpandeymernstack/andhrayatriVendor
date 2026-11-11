export type VendorCategoryType =
  | 'restaurants'
  | 'hotels'
  | 'activities'
  | 'attractions'
  | 'shopping';

export type VendorStatus =
  | 'draft'
  | 'submitted'
  | 'pending'
  | 'pending_review'
  | 'under_verification'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired';

export interface VendorAccountInfo {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface VendorBusinessInfo {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  alternateNumber?: string;
  website?: string;
  serviceAreas?: string;
  description?: string;
  bannerUrl?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface VendorLocationInfo {
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  mapLink?: string;
}

export interface VendorServiceDetails {
  categoryName?: string;
  subcategory: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  hotelPropertyType?: string;
  hotelStarCategory?: string;
  hotelTotalRooms?: string;
  hotelAvailableRooms?: string;
  hotelBasePricePerNight?: string;
  hotelRoomTypes?: string[];
  hotelAmenities?: string[];
  hotelCheckInTime?: string;
  hotelCheckOutTime?: string;
  hotelCancellationPolicy?: string;
  restaurantCuisineTypes?: string[];
  restaurantFoodType?: string;
  restaurantServiceType?: string[];
  restaurantSeatingCapacity?: string;
  restaurantAvgCostForTwo?: string;
  restaurantDeliveryRadius?: string;
  restaurantMinOrderValue?: string;
  activityType?: string;
  activityDuration?: string;
  activityDifficulty?: string;
  activityPricePerPerson?: string;
  activityMaxGroupSize?: string;
  activityIncludes?: string;
  activitySafetyGear?: string;
  activityAgeLimit?: string;
  attractionType?: string;
  attractionTicketRequired?: string;
  attractionEntryFeeAdult?: string;
  attractionEntryFeeChild?: string;
  attractionAvgVisitDuration?: string;
  attractionBestTimeToVisit?: string;
  attractionAccessibility?: string[];
  shoppingStoreType?: string;
  shoppingProductCategories?: string[];
  shoppingDeliveryAvailable?: string;
  shoppingReturnPolicy?: string;
  shoppingMinOrderValue?: string;
  [key: string]: unknown;
}

export interface VendorPricingInfo {
  priceRange?: string;
  startingPrice?: string | number;
  paymentModes?: string;
  offers?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  ifscCode?: string;
}

export interface VendorGalleryItem {
  id: string;
  name: string;
  preview: string;
}

export interface VendorDocumentInfo {
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  fssaiNumber?: string;
  gstin?: string;
  logoPreview?: string;
  galleryImages?: VendorGalleryItem[];
  [key: string]: unknown;
}

export interface VendorRecord {
  id?: string;
  _id?: string;
  name?: string;
  ownerName?: string;
  owner_name?: string;
  businessName?: string;
  business_name?: string;
  email?: string;
  businessEmail?: string;
  business_email?: string;
  password?: string;
  mobile?: string;
  phone?: string;
  alternateNumber?: string;
  serviceAreas?: string;
  website?: string;
  description?: string;
  bannerUrl?: string;
  logo?: string;
  logoUrl?: string;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  subCategory?: string;
  businessSubcategory?: string;
  businessType?: string;
  status?: string;
  rejectionReason?: string;
  rejection_reason?: string;
  rejectedReason?: string;
  suspensionReason?: string;
  suspendedReason?: string;
  suspension_reason?: string;
  statusReason?: string;
  reason?: string;
  expiryDate?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: VendorLocationInfo;
  documents?: VendorDocumentInfo;
  bank_details?: {
    accountHolderName?: string;
    bankName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    priceRange?: string;
    startingPrice?: number | string;
    paymentModes?: string;
    offers?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
  };
  category_details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface VendorSession {
  token: string;
  vendor: VendorRecord;
  loggedInAt?: string;
}

export interface VendorSignupSubmission {
  account: VendorAccountInfo;
  category: VendorCategoryType;
  business: VendorBusinessInfo;
  location: VendorLocationInfo;
  services: VendorServiceDetails;
  pricing: VendorPricingInfo;
  documents: VendorDocumentInfo;
}

export interface VendorProduct {
  id?: string;
  _id?: string;
  vendorId?: string;
  vendorName?: string;
  name: string;
  title?: string;
  description?: string;
  category: string;
  categoryId?: string;
  location?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

