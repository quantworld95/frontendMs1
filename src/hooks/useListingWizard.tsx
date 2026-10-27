import { useCallback, useContext, useMemo, useState } from 'react';
import { ListingWizardContext, type ListingWizardContextValue, type ListingWizardData, type ListingWizardProviderProps, type SavedListing } from '@/hooks/listingWizardContext';

export type { CancellationPolicy, ListingPhoto, ListingStatus, ListingType, ListingWizardData, SavedListing } from '@/hooks/listingWizardContext';
const initialData: ListingWizardData = {
  type: '',
  name: '',
  description: '',
  country: 'Bolivia',
  city: 'Santa Cruz de la Sierra',
  address: '',
  neighborhood: '',
  amenities: [],
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  bathroomType: 'Privado',
  bedTypes: ['Cama matrimonial'],
  nightlyPrice: '',
  weeklyDiscount: '',
  monthlyDiscount: '',
  minimumStay: 1,
  checkIn: '15:00',
  checkOut: '11:00',
  cancellation: 'Moderada',
  stayConditions: '',
  photos: [],
  coverPhotoId: '',
};

export function ListingWizardProvider({ children }: ListingWizardProviderProps) {
  const [data, setData] = useState<ListingWizardData>(initialData);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [savedListing, setSavedListing] = useState<SavedListing | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  const updateData = useCallback(<K extends keyof ListingWizardData>(key: K, value: ListingWizardData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setError('');
  }, []);

  const toggleAmenity = useCallback((amenity: string) => {
    setData((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
    setDirty(true);
  }, []);

  const addPhotos = useCallback((files: FileList) => {
    const nextPhotos = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setData((current) => ({
      ...current,
      photos: [...current.photos, ...nextPhotos],
      coverPhotoId: current.coverPhotoId || nextPhotos[0]?.id || '',
    }));
    setDirty(true);
    setError('');
  }, []);

  const removePhoto = useCallback((id: string) => {
    setData((current) => {
      const photos = current.photos.filter((photo) => photo.id !== id);
      return { ...current, photos, coverPhotoId: current.coverPhotoId === id ? photos[0]?.id || '' : current.coverPhotoId };
    });
    setDirty(true);
  }, []);

  const setCoverPhoto = useCallback((id: string) => {
    setData((current) => ({ ...current, coverPhotoId: id }));
    setDirty(true);
  }, []);

  const validateStep = useCallback((step: number) => {
    let message = '';
    if (step === 1 && !data.type) message = 'Selecciona el tipo de alojamiento para continuar.';
    if (step === 2 && !data.name.trim()) message = 'Escribe un nombre para tu alojamiento.';
    if (step === 2 && data.description.trim().length < 20) message = 'La descripción debe tener al menos 20 caracteres.';
    if (step === 3 && !data.address.trim()) message = 'Indica la dirección del alojamiento.';
    if (step === 3 && !data.city) message = 'Selecciona una ciudad de Bolivia.';
    const isEstablishment = data.type === 'Hotel' || data.type === 'Hostal';
    if (isEstablishment && step === 5 && data.stayConditions.trim().length < 10) message = 'Describe las condiciones generales de estadía.';
    if (!isEstablishment && step === 5 && data.guests < 1) message = 'La capacidad debe ser de al menos un huésped.';
    if (!isEstablishment && step === 6 && (!data.nightlyPrice || Number(data.nightlyPrice) <= 0)) message = 'Indica un precio por noche mayor que cero.';
    if ((isEstablishment && step === 6) || (!isEstablishment && step === 7)) {
      if (data.photos.length === 0) message = 'Agrega al menos una fotografía.';
    }
    setError(message);
    return !message;
  }, [data]);

  const startEditing = useCallback((listingId: string, listing: ListingWizardData) => {
    setData({ ...listing, photos: [...listing.photos] });
    setEditingListingId(listingId);
    setDirty(false);
    setError('');
  }, []);

  const saveListing = useCallback(() => {
    const id = editingListingId || 'created-listing';
    setSavedListing({ id, status: 'Pendiente', data: { ...data, photos: [...data.photos] } });
    setDirty(false);
    setError('');
    setEditingListingId(id);
    return id;
  }, [data, editingListingId]);

  const clearError = useCallback(() => setError(''), []);
  const reset = useCallback(() => {
    data.photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setData(initialData);
    setError('');
    setDirty(false);
    setEditingListingId(null);
  }, [data.photos]);

  const value = useMemo(() => ({
    data, error, dirty, updateData, toggleAmenity, addPhotos, removePhoto, setCoverPhoto, validateStep, clearError, reset, savedListing, editingListingId, startEditing, saveListing,
  }), [data, error, dirty, updateData, toggleAmenity, addPhotos, removePhoto, setCoverPhoto, validateStep, clearError, reset, savedListing, editingListingId, startEditing, saveListing]);

  return <ListingWizardContext.Provider value={value}>{children}</ListingWizardContext.Provider>;
}

export function useListingWizard(): ListingWizardContextValue {
  const context = useContext(ListingWizardContext);
  if (!context) throw new Error('useListingWizard debe usarse dentro de ListingWizardProvider');
  return context;
}
