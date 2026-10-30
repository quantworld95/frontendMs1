import { createContext } from 'react';
import type { ReactNode } from 'react';
import type { AlojamientoDetalle, CatalogosAlojamiento } from '@/types/alojamientos';

export type ListingType = 'Casa' | 'Departamento' | 'Hotel' | 'Hostal';
export type CancellationPolicy = 'Flexible' | 'Moderada' | 'Estricta';
export type ListingStatus =
  | 'Borrador'
  | 'Activo'
  | 'En revisión'
  | 'Publicado'
  | 'Rechazado'
  | 'Pausado';

export interface ListingPhoto {
  id: string;
  name: string;
  url: string;
  /** Archivo original para upload a la API (Phase 2+). */
  file?: File;
}

export interface ListingWizardData {
  type: ListingType | '';
  /** ID real del catálogo ms-01 (`tiposPropiedad`). Fuente de verdad al crear borrador. */
  tipoPropiedadId: number | null;
  name: string;
  description: string;
  country: 'Bolivia';
  city: string;
  address: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  /** Ids del catálogo `servicios` (fuente de verdad para PUT /servicios). */
  servicioIds: number[];
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
  persisting: boolean;
  /** ID remoto del borrador en ms-01. */
  remoteAlojamientoId: string | null;
  catalogos: CatalogosAlojamiento | null;
  catalogosLoading: boolean;
  updateData: <K extends keyof ListingWizardData>(key: K, value: ListingWizardData[K]) => void;
  selectTipoPropiedad: (tipoPropiedadId: number, type: ListingType) => void;
  toggleServicio: (servicioId: number) => void;
  addPhotos: (files: FileList) => void;
  removePhoto: (id: string) => void;
  setCoverPhoto: (id: string) => void;
  validateStep: (step: number) => boolean;
  clearError: () => void;
  setWizardError: (message: string) => void;
  reset: () => void;
  savedListing: SavedListing | null;
  editingListingId: string | null;
  startEditing: (listingId: string, listing: ListingWizardData) => void;
  /** Snapshot local tras guardar; el listado/detalle se leen desde la API. */
  saveListing: (overrideId?: string) => string;
  /** Carga catálogos del backend (requiere sesión autenticada). */
  loadCatalogos: () => Promise<CatalogosAlojamiento | null>;
  /**
   * Persiste el paso actual vía API.
   * Requiere sesión. Devuelve el detalle remoto o null si falla.
   */
  persistStep: (step: number) => Promise<AlojamientoDetalle | null>;
}

export const ListingWizardContext = createContext<ListingWizardContextValue | undefined>(undefined);
export type ListingWizardProviderProps = { children: ReactNode };
