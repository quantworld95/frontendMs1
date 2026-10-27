import { createContext } from 'react';
import type { ReactNode } from 'react';

export type ListingType = 'Casa' | 'Departamento' | 'Hotel' | 'Hostal';
export type CancellationPolicy = 'Flexible' | 'Moderada' | 'Estricta';
export type ListingStatus = 'Pendiente' | 'Publicado' | 'Rechazado' | 'Pausado';

export interface ListingPhoto {
  id: string;
  name: string;
  url: string;
}

export interface ListingWizardData {
  type: ListingType | '';
  name: string;
  description: string;
  country: 'Bolivia';
  city: string;
  address: string;
  neighborhood: string;
  amenities: string[];
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  bathroomType: string;
  bedTypes: string[];
  nightlyPrice: string;
  weeklyDiscount: string;
  monthlyDiscount: string;
  minimumStay: number;
  checkIn: string;
  checkOut: string;
  cancellation: CancellationPolicy;
  stayConditions: string;
  photos: ListingPhoto[];
  coverPhotoId: string;
}

export interface SavedListing {
  id: string;
  status: ListingStatus;
  data: ListingWizardData;
}

export interface ListingWizardContextValue {
  data: ListingWizardData;
  error: string;
  dirty: boolean;
  updateData: <K extends keyof ListingWizardData>(key: K, value: ListingWizardData[K]) => void;
  toggleAmenity: (amenity: string) => void;
  addPhotos: (files: FileList) => void;
  removePhoto: (id: string) => void;
  setCoverPhoto: (id: string) => void;
  validateStep: (step: number) => boolean;
  clearError: () => void;
  reset: () => void;
  savedListing: SavedListing | null;
  editingListingId: string | null;
  startEditing: (listingId: string, listing: ListingWizardData) => void;
  saveListing: () => string;
}

export const ListingWizardContext = createContext<ListingWizardContextValue | undefined>(undefined);
export type ListingWizardProviderProps = { children: ReactNode };
