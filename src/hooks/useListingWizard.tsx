import { useCallback, useContext, useMemo, useState } from 'react';
import { ApiError } from '@/api/client';
import {
  ListingWizardContext,
  type ListingStatus,
  type ListingType,
  type ListingWizardContextValue,
  type ListingWizardData,
  type ListingWizardProviderProps,
  type SavedListing,
} from '@/hooks/listingWizardContext';
import { getCatalogosAlojamiento } from '@/services/catalogosApi';
import { persistWizardStep } from '@/services/listingPersistence';
import type { AlojamientoDetalle, CatalogosAlojamiento } from '@/types/alojamientos';

export type {
  CancellationPolicy,
  ListingPhoto,
  ListingStatus,
  ListingType,
  ListingWizardData,
  SavedListing,
} from '@/hooks/listingWizardContext';

const initialData: ListingWizardData = {
  type: '',
  tipoPropiedadId: null,
  name: '',
  description: '',
  country: 'Bolivia',
  city: 'Santa Cruz de la Sierra',
  address: '',
  neighborhood: '',
  latitude: null,
  longitude: null,
  servicioIds: [],
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
  const [persisting, setPersisting] = useState(false);
  const [savedListing, setSavedListing] = useState<SavedListing | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [remoteAlojamientoId, setRemoteAlojamientoId] = useState<string | null>(null);
  const [catalogos, setCatalogos] = useState<CatalogosAlojamiento | null>(null);
  const [catalogosLoading, setCatalogosLoading] = useState(false);

  const updateData = useCallback(<K extends keyof ListingWizardData>(key: K, value: ListingWizardData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setError('');
  }, []);

  const selectTipoPropiedad = useCallback((tipoPropiedadId: number, type: ListingType) => {
    setData((current) => ({ ...current, tipoPropiedadId, type }));
    setDirty(true);
    setError('');
  }, []);

  const toggleServicio = useCallback((servicioId: number) => {
    setData((current) => ({
      ...current,
      servicioIds: current.servicioIds.includes(servicioId)
        ? current.servicioIds.filter((id) => id !== servicioId)
        : [...current.servicioIds, servicioId],
    }));
    setDirty(true);
  }, []);

  const addPhotos = useCallback((files: FileList) => {
    const nextPhotos = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
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
      const removed = current.photos.find((photo) => photo.id === id);
      if (removed?.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      const photos = current.photos.filter((photo) => photo.id !== id);
      return {
        ...current,
        photos,
        coverPhotoId: current.coverPhotoId === id ? photos[0]?.id || '' : current.coverPhotoId,
      };
    });
    setDirty(true);
  }, []);

  const setCoverPhoto = useCallback((id: string) => {
    setData((current) => ({ ...current, coverPhotoId: id }));
    setDirty(true);
  }, []);

  const validateStep = useCallback(
    (step: number) => {
      let message = '';
      if (step === 1 && (!data.type || data.tipoPropiedadId == null)) {
        message = 'Selecciona el tipo de alojamiento para continuar.';
      }
      if (step === 2 && !data.name.trim()) message = 'Escribe un nombre para tu alojamiento.';
      if (step === 2 && data.description.trim().length < 20) {
        message = 'La descripción debe tener al menos 20 caracteres.';
      }
      if (step === 3 && !data.address.trim()) message = 'Indica la dirección del alojamiento.';
      if (step === 3 && !data.city) message = 'Selecciona una ciudad de Bolivia.';
      const isEstablishment = data.type === 'Hotel' || data.type === 'Hostal';
      if (isEstablishment && step === 5 && data.stayConditions.trim().length < 10) {
        message = 'Describe las condiciones generales de estadía.';
      }
      if (!isEstablishment && step === 5 && data.guests < 1) {
        message = 'La capacidad debe ser de al menos un huésped.';
      }
      if (!isEstablishment && step === 6 && (!data.nightlyPrice || Number(data.nightlyPrice) <= 0)) {
        message = 'Indica un precio por noche mayor que cero.';
      }
      if ((isEstablishment && step === 6) || (!isEstablishment && step === 7)) {
        if (data.photos.length === 0) message = 'Agrega al menos una fotografía.';
      }
      setError(message);
      return !message;
    },
    [data],
  );

  const startEditing = useCallback((listingId: string, listing: ListingWizardData) => {
    setData({ ...listing, photos: [...listing.photos] });
    setEditingListingId(listingId);
    setRemoteAlojamientoId(listingId);
    setDirty(false);
    setError('');
  }, []);

  const saveListing = useCallback((overrideId?: string) => {
    const id = overrideId || editingListingId || remoteAlojamientoId || 'created-listing';
    const isEstablishment = data.type === 'Hotel' || data.type === 'Hostal';
    const status: ListingStatus = isEstablishment ? 'Activo' : 'En revisión';
    setSavedListing({ id, status, data: { ...data, photos: [...data.photos] } });
    setDirty(false);
    setError('');
    // En alta vía API no activamos modo edición del layout; solo guardamos el id remoto.
    if (!overrideId && !remoteAlojamientoId) {
      setEditingListingId(id);
    }
    return id;
  }, [data, editingListingId, remoteAlojamientoId]);

  const clearError = useCallback(() => setError(''), []);
  const setWizardError = useCallback((message: string) => setError(message), []);

  const reset = useCallback(() => {
    data.photos.forEach((photo) => {
      if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url);
    });
    setData(initialData);
    setError('');
    setDirty(false);
    setPersisting(false);
    setEditingListingId(null);
    setRemoteAlojamientoId(null);
  }, [data.photos]);

  const loadCatalogos = useCallback(async () => {
    setCatalogosLoading(true);
    setError('');
    try {
      const result = await getCatalogosAlojamiento();
      setCatalogos(result);
      return result;
    } catch (err) {
      setCatalogos(null);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof TypeError
            ? 'No se pudo conectar con ms-01 (http://localhost:8081). ¿Está el backend encendido?'
            : 'No se pudieron cargar los catálogos.';
      setError(message);
      return null;
    } finally {
      setCatalogosLoading(false);
    }
  }, []);

  const persistStep = useCallback(
    async (step: number): Promise<AlojamientoDetalle | null> => {
      setPersisting(true);
      setError('');
      try {
        const detalle = await persistWizardStep(step, {
          data,
          alojamientoId: remoteAlojamientoId,
          catalogos: catalogos ?? undefined,
        });
        // Solo ID remoto: no usar editingListingId aquí (eso cambia la UI a modo edición).
        setRemoteAlojamientoId(detalle.id);
        setDirty(false);
        return detalle;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'No se pudo guardar el paso en la API.';
        setError(message);
        return null;
      } finally {
        setPersisting(false);
      }
    },
    [catalogos, data, remoteAlojamientoId],
  );

  const value = useMemo(
    () => ({
      data,
      error,
      dirty,
      persisting,
      remoteAlojamientoId,
      catalogos,
      catalogosLoading,
      updateData,
      selectTipoPropiedad,
      toggleServicio,
      addPhotos,
      removePhoto,
      setCoverPhoto,
      validateStep,
      clearError,
      setWizardError,
      reset,
      savedListing,
      editingListingId,
      startEditing,
      saveListing,
      loadCatalogos,
      persistStep,
    }),
    [
      data,
      error,
      dirty,
      persisting,
      remoteAlojamientoId,
      catalogos,
      catalogosLoading,
      updateData,
      selectTipoPropiedad,
      toggleServicio,
      addPhotos,
      removePhoto,
      setCoverPhoto,
      validateStep,
      clearError,
      setWizardError,
      reset,
      savedListing,
      editingListingId,
      startEditing,
      saveListing,
      loadCatalogos,
      persistStep,
    ],
  );

  return <ListingWizardContext.Provider value={value}>{children}</ListingWizardContext.Provider>;
}

export function useListingWizard(): ListingWizardContextValue {
  const context = useContext(ListingWizardContext);
  if (!context) throw new Error('useListingWizard debe usarse dentro de ListingWizardProvider');
  return context;
}
