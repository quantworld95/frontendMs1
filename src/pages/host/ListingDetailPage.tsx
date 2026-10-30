import {
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  Check,
  Coffee,
  ConciergeBell,
  Edit3,
  Fan,
  ForkKnife,
  Loader2,
  MapPin,
  Microwave,
  PawPrint,
  RefreshCw,
  Sparkles,
  Users,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { ListingPhotoGallery } from '@/components/listings/ListingPhotoGallery';
import { LocationMapView } from '@/components/maps/LocationMapView';
import { Button } from '@/components/ui/Button';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { obtenerAlojamiento } from '@/services/alojamientosApi';
import {
  fromAlojamientoDetalle,
  toWizardData,
  type DetailListing,
} from '@/services/listings';
import HotelListingDetailPage from '@/pages/host/HotelListingDetailPage';

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '');
}

const amenityIcons: Record<string, LucideIcon> = {
  wifi: Wifi,
  aireacondicionado: Fan,
  cocina: Microwave,
  cocinaequipada: Microwave,
  estacionamiento: Car,
  lavanderia: WashingMachine,
  lavadora: WashingMachine,
  piscina: Waves,
  desayuno: Coffee,
  recepcion: ConciergeBell,
  restaurante: ForkKnife,
  admitemascotas: PawPrint,
};

function iconForAmenity(name: string): LucideIcon {
  return amenityIcons[normalizeLabel(name)] ?? Check;
}

function statusClass(status: DetailListing['status']): string {
  if (status === 'Publicado') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Activo') return 'bg-teal-50 text-teal-700';
  if (status === 'En revisión') return 'bg-amber-50 text-amber-700';
  if (status === 'Rechazado') return 'bg-rose-50 text-rose-700';
  if (status === 'Borrador') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default function ListingDetailPage() {
  const { listingId = '' } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { session, logout } = useDemoAuth();
  const { startEditing } = useListingWizard();
  const [activeTab, setActiveTab] = useState('Información');
  const [listing, setListing] = useState<DetailListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tabs = ['Información', 'Ubicación', 'Precio y condiciones'];
  const loggedIn = !!session;

  const loadFromApi = useCallback(async () => {
    if (listingId === 'new' || listingId === 'created-listing') {
      setListing(null);
      setError('Ese enlace no es un alojamiento. Vuelve a Mis alojamientos e inicia el registro desde el paso 1.');
      return null;
    }
    if (!listingId || !loggedIn || !looksLikeUuid(listingId)) {
      setListing(null);
      setError(
        !looksLikeUuid(listingId)
          ? 'Este alojamiento no existe en la API.'
          : 'Inicia sesión para cargar el detalle.',
      );
      return null;
    }
    setLoading(true);
    setError('');
    try {
      const detalle = await obtenerAlojamiento(listingId);
      const mapped = fromAlojamientoDetalle(detalle);
      setListing(mapped);
      return mapped;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof TypeError
            ? 'No se pudo conectar con ms-01. ¿Está el backend encendido?'
            : 'No se pudo cargar el alojamiento.';
      setError(message);
      setListing(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loggedIn, listingId]);

  useEffect(() => {
    void loadFromApi();
  }, [loadFromApi]);

  if (loading && !listing) {
    return (
      <AppLayout hostName={session?.name} onLogout={logout}>
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando detalle desde la API…
        </div>
      </AppLayout>
    );
  }

  if (!listing) {
    return (
      <AppLayout hostName={session?.name} onLogout={logout}>
        <div className="space-y-4 py-16 text-center">
          <h1 className="text-xl font-bold">No encontramos este alojamiento</h1>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {looksLikeUuid(listingId) && loggedIn ? (
            <button
              type="button"
              onClick={() => void loadFromApi()}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-primary hover:bg-surface-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          ) : null}
          <div>
            <Link to="/host/listings" className="inline-flex text-sm font-semibold text-brand-primary">
              Volver a mis alojamientos
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (listing.category === 'Hotel' || listing.category === 'Hostal') {
    return (
      <HotelListingDetailPage
        listing={listing}
        listingId={listingId || ''}
        onListingUpdated={(next) => setListing(next)}
        onRefresh={() => void loadFromApi()}
      />
    );
  }

  const locationLabel =
    [listing.address, listing.city, listing.departamento || listing.neighborhood]
      .filter(Boolean)
      .join(', ') || listing.location;

  return (
    <AppLayout hostName={session?.name} onLogout={logout}>
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/host/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Mis alojamientos
          </Link>
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Edit3 className="h-4 w-4" />}
            onClick={() => {
              startEditing(listingId || 'created-listing', toWizardData(listing));
              navigate('/host/listings/new/step-2');
            }}
          >
            Editar alojamiento
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <ListingPhotoGallery photos={listing.photos} name={listing.name} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
              {listing.name}
            </h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(listing.status)}`}>
              {listing.status}
              {listing.estadoApi ? ` · ${listing.estadoApi}` : ''}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
            <MapPin className="h-4 w-4 text-brand-primary" />
            {locationLabel}
          </p>
          <p className="mt-3 text-sm text-ink-secondary">
            {listing.guests || '—'} huéspedes · {listing.bedrooms || '—'} dormitorios ·{' '}
            {listing.beds || '—'} camas · {listing.bathrooms || '—'} baños
          </p>
          <p className="mt-1 text-xs text-ink-secondary">Tipo: {listing.type}</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex gap-5 overflow-x-auto border-b border-line px-5 sm:px-7">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-7">
            {activeTab === 'Información' && (
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-bold text-ink-primary">Descripción</h2>
                  <p className="mt-3 text-sm leading-6 text-ink-secondary">
                    {listing.description || 'Sin descripción en la API.'}
                  </p>
                </div>
                <div>
                  <h2 className="font-bold text-ink-primary">Características</h2>
                  <div className="mt-4 grid gap-3 text-sm text-ink-secondary">
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-primary" />
                      {listing.guests || '—'} huéspedes
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-brand-primary" />
                      {listing.bedrooms || '—'} dormitorios y {listing.beds || '—'} camas
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Bath className="h-4 w-4 text-brand-primary" />
                      {listing.bathrooms || '—'} baños
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-primary" />
                      {listing.type}
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2 border-t border-line pt-8">
                  <h2 className="font-bold text-ink-primary">Servicios y comodidades</h2>
                  {listing.amenities.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {listing.amenities.map((amenity) => {
                        const AmenityIcon = iconForAmenity(amenity);
                        return (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-3 text-sm text-ink-secondary"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light/60 text-brand-primary">
                              <AmenityIcon className="h-4 w-4" />
                            </span>
                            {amenity}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink-secondary">
                      No se han registrado servicios en la API.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Ubicación' && (
              <div>
                <h2 className="font-bold text-ink-primary">Ubicación del alojamiento</h2>
                <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                        Dirección
                      </p>
                      <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-ink-primary">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                        {listing.address || 'No se indicó una dirección.'}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-line p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                          País
                        </p>
                        <p className="mt-2 text-sm font-semibold text-ink-primary">
                          {listing.country || 'Bolivia'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-line p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                          Ciudad
                        </p>
                        <p className="mt-2 text-sm font-semibold text-ink-primary">
                          {listing.city || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-line p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                        Departamento
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink-primary">
                        {listing.departamento || listing.neighborhood || 'No especificado'}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-line p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                          Latitud
                        </p>
                        <p className="mt-2 text-sm font-semibold text-ink-primary">
                          {listing.latitude != null ? Number(listing.latitude) : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-line p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                          Longitud
                        </p>
                        <p className="mt-2 text-sm font-semibold text-ink-primary">
                          {listing.longitude != null ? Number(listing.longitude) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <LocationMapView
                    className="min-h-[320px] lg:min-h-full"
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    city={listing.city}
                    label={locationLabel}
                  />
                </div>
              </div>
            )}

            {activeTab === 'Precio y condiciones' && (
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-bold text-ink-primary">Precio</h2>
                  <div className="mt-4 grid gap-3 text-sm text-ink-secondary">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-semibold text-ink-primary">
                        Bs. {listing.price || '—'}
                      </span>{' '}
                      por noche
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-ink-primary">Horarios</h2>
                  <div className="mt-4 grid gap-3 text-sm text-ink-secondary">
                    <span>
                      Entrada:{' '}
                      <span className="font-semibold text-ink-primary">{listing.checkIn}</span>
                    </span>
                    <span>
                      Salida:{' '}
                      <span className="font-semibold text-ink-primary">{listing.checkOut}</span>
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2 border-t border-line pt-8">
                  <h2 className="font-bold text-ink-primary">Políticas y condiciones</h2>
                  <p className="mt-2 text-sm text-ink-secondary">
                    Cancelación:{' '}
                    <span className="font-semibold text-ink-primary">{listing.cancellation}</span>
                  </p>
                  <p className="mt-4 rounded-xl bg-surface-secondary p-4 text-sm leading-6 text-ink-secondary">
                    {listing.politicas ||
                      listing.stayConditions ||
                      'Sin políticas registradas en la API.'}
                  </p>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
    </AppLayout>
  );
}
