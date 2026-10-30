import { useState } from 'react';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Edit3,
  MapPin,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ListingPhotoGallery } from '@/components/listings/ListingPhotoGallery';
import { RoomDetailModal } from '@/components/listings/RoomDetailModal';
import { LocationMapView } from '@/components/maps/LocationMapView';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/api/client';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { activarUnidad, desactivarUnidad } from '@/services/alojamientosApi';
import {
  fromAlojamientoDetalle,
  toWizardData,
  type DetailListing,
} from '@/services/listings';
import type { RoomType } from '@/services/roomTypes';
import { iconForService } from '@/utils/serviceIcons';

interface HotelListingDetailPageProps {
  listing: DetailListing;
  listingId: string;
  onListingUpdated?: (listing: DetailListing) => void;
  onRefresh?: () => void;
}

function statusClass(status: DetailListing['status']): string {
  if (status === 'Publicado') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Activo') return 'bg-teal-50 text-teal-700';
  if (status === 'En revisión') return 'bg-amber-50 text-amber-700';
  if (status === 'Rechazado') return 'bg-rose-50 text-rose-700';
  if (status === 'Borrador') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-100 text-slate-600';
}

/** Estado de la habitación según su propio ciclo de publicación. */
function roomUnitStatus(unitStatus: string): RoomType['status'] {
  const value = unitStatus.toUpperCase();
  if (value === 'PUBLICADO' || value === 'ACTIVA') return 'Publicado';
  if (value === 'DESACTIVADO' || value === 'PAUSADO' || value === 'INACTIVA') return 'Desactivada';
  if (value === 'SUSPENDIDO') return 'Suspendida';
  if (value === 'EN_REVISION') return 'En revisión';
  if (value === 'RECHAZADO') return 'Rechazado';
  if (value === 'BORRADOR') return 'Borrador';
  return 'Borrador';
}

function roomStatusClass(status: RoomType['status']): string {
  if (status === 'Activa' || status === 'Publicado') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Activo') return 'bg-teal-50 text-teal-700';
  if (status === 'En revisión') return 'bg-amber-50 text-amber-700';
  if (status === 'Rechazado' || status === 'Suspendida') return 'bg-rose-50 text-rose-700';
  if (status === 'Borrador') return 'bg-sky-50 text-sky-700';
  if (status === 'Desactivada' || status === 'Pausada') return 'bg-slate-100 text-slate-600';
  return 'bg-slate-100 text-slate-600';
}

function canToggleRoomPublication(status: RoomType['status']): boolean {
  return status === 'Publicado' || status === 'Activa' || status === 'Desactivada' || status === 'Pausada';
}

function unitsFromApi(listing: DetailListing): RoomType[] {
  return (listing.units ?? []).map((unit) => ({
    id: unit.id,
    name: unit.name,
    units: unit.inventory || 1,
    capacity: unit.capacity,
    beds: `${unit.beds} ${unit.beds === 1 ? 'cama' : 'camas'}`,
    bathrooms: unit.bathrooms,
    price: unit.price,
    status: roomUnitStatus(unit.status),
    photo: unit.photo,
    description: unit.description,
  }));
}

export default function HotelListingDetailPage({
  listing,
  listingId,
  onListingUpdated,
  onRefresh,
}: HotelListingDetailPageProps) {
  const navigate = useNavigate();
  const { session, logout } = useDemoAuth();
  const { startEditing } = useListingWizard();
  const [activeTab, setActiveTab] = useState('Habitaciones');
  const [detailRoomId, setDetailRoomId] = useState<string | null>(null);
  const [stateRoom, setStateRoom] = useState<RoomType | null>(null);
  const [stateBusy, setStateBusy] = useState(false);
  const [stateError, setStateError] = useState('');

  const roomTypes = unitsFromApi(listing);

  const establishmentLabel = listing.category === 'Hostal' ? 'hostal' : 'hotel';
  const tabs = ['Información', 'Habitaciones', 'Servicios', 'Ubicación', 'Reglas'];
  const locationLabel =
    [listing.address, listing.city, listing.departamento || listing.neighborhood]
      .filter(Boolean)
      .join(', ') || listing.location;

  const closeStateModal = () => {
    if (stateBusy) return;
    setStateRoom(null);
    setStateError('');
  };

  const confirmRoomStateChange = async () => {
    if (!stateRoom) return;
    if (!session) {
      setStateError('Falta la sesión del anfitrión.');
      return;
    }
    const desactivar =
      stateRoom.status === 'Publicado' || stateRoom.status === 'Activa';
    setStateBusy(true);
    setStateError('');
    try {
      const detalle = desactivar
        ? await desactivarUnidad(listingId, stateRoom.id)
        : await activarUnidad(listingId, stateRoom.id);
      onListingUpdated?.(fromAlojamientoDetalle(detalle));
      onRefresh?.();
      setStateRoom(null);
    } catch (err) {
      setStateError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cambiar el estado de la habitación.',
      );
    } finally {
      setStateBusy(false);
    }
  };

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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<Edit3 className="h-4 w-4" />}
              onClick={() => {
                startEditing(listingId, toWizardData(listing));
                navigate('/host/listings/new/step-2');
              }}
            >
              Editar establecimiento
            </Button>
            <button
              type="button"
              aria-label="Más opciones"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink-secondary hover:bg-surface-secondary"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ListingPhotoGallery photos={listing.photos} name={listing.name} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
              {listing.name}
            </h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(listing.status)}`}
            >
              {listing.status}
              {listing.estadoApi ? ` · ${listing.estadoApi}` : ''}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
            <MapPin className="h-4 w-4 text-brand-primary" />
            {locationLabel}
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
                  <h2 className="font-bold text-ink-primary">Datos del establecimiento</h2>
                  <div className="mt-4 grid gap-3 text-sm text-ink-secondary">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                      {listing.address || locationLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-primary" />
                      {listing.type}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-brand-primary" />
                      {roomTypes.length} tipos de habitación
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Habitaciones' && (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-ink-primary">
                      Tipos de habitación ({roomTypes.length})
                    </h2>
                    <p className="mt-1 text-sm text-ink-secondary">
                      Gestiona los tipos de habitación de tu {establishmentLabel}.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => navigate(`/host/listings/${listingId}/rooms/new`)}
                  >
                    Agregar tipo de habitación
                  </Button>
                </div>

                {roomTypes.length === 0 ? (
                  <div className="mt-6 rounded-xl border border-dashed border-line bg-surface-secondary/50 px-6 py-12 text-center">
                    <BedDouble className="mx-auto h-10 w-10 text-brand-primary" />
                    <h3 className="mt-3 font-bold text-ink-primary">
                      Aún no tienes tipos de habitación
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-ink-secondary">
                      Registra el primer tipo de habitación para que tu establecimiento pueda recibir
                      reservas.
                    </p>
                    <Button
                      type="button"
                      className="mt-5"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={() => navigate(`/host/listings/${listingId}/rooms/new`)}
                    >
                      Registrar primera habitación
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {roomTypes.map((room) => (
                      <article
                        key={room.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetailRoomId(room.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setDetailRoomId(room.id);
                          }
                        }}
                        className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-primary/40 hover:bg-surface-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
                      >
                        {room.photo ? (
                          <img
                            src={room.photo}
                            alt={room.name}
                            referrerPolicy="no-referrer"
                            className="h-48 w-full shrink-0 rounded-xl object-cover sm:h-auto sm:min-h-[10.5rem] sm:w-56 md:w-64"
                          />
                        ) : (
                          <div className="flex h-48 w-full shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-secondary/70 text-ink-secondary sm:min-h-[10.5rem] sm:w-56 md:w-64">
                            <BedDouble className="h-8 w-8 text-brand-primary" />
                            <span className="mt-2 text-xs font-semibold">Sin foto de habitación</span>
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h3 className="text-lg font-bold text-ink-primary">{room.name}</h3>
                              <span
                                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${roomStatusClass(room.status)}`}
                              >
                                {room.status}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-secondary">
                              <span>{room.units} unidades</span>
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-brand-primary" />
                                Hasta {room.capacity} huéspedes
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <BedDouble className="h-4 w-4 text-brand-primary" />
                                {room.beds}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Bath className="h-4 w-4 text-brand-primary" />
                                {room.bathrooms} baños
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-lg font-bold text-ink-primary">
                              Bs {room.price}{' '}
                              <span className="text-sm font-normal text-ink-secondary">/ noche</span>
                            </span>
                            <div className="flex items-center gap-2">
                              {canToggleRoomPublication(room.status) ? (
                                <button
                                  type="button"
                                  aria-label={
                                    room.status === 'Desactivada' || room.status === 'Pausada'
                                      ? `Activar ${room.name}`
                                      : `Desactivar ${room.name}`
                                  }
                                  title={
                                    room.status === 'Desactivada' || room.status === 'Pausada'
                                      ? 'Activar habitación'
                                      : 'Desactivar habitación'
                                  }
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setStateError('');
                                    setStateRoom(room);
                                  }}
                                  className="rounded-lg border border-line p-2 text-ink-secondary hover:bg-amber-50 hover:text-amber-800"
                                >
                                  {room.status === 'Desactivada' || room.status === 'Pausada' ? (
                                    <Power className="h-4 w-4" />
                                  ) : (
                                    <PowerOff className="h-4 w-4" />
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Servicios' && (
              <div>
                <h2 className="font-bold text-ink-primary">Servicios y comodidades</h2>
                {listing.amenities.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {listing.amenities.map((amenity) => {
                      const AmenityIcon = iconForService(amenity);
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
            )}

            {activeTab === 'Ubicación' && (
              <div>
                <h2 className="font-bold text-ink-primary">Ubicación del establecimiento</h2>
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

            {activeTab === 'Reglas' && (
              <div className="grid gap-8 sm:grid-cols-2">
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
                <div>
                  <h2 className="font-bold text-ink-primary">Cancelación</h2>
                  <p className="mt-4 text-sm text-ink-secondary">
                    <span className="font-semibold text-ink-primary">{listing.cancellation}</span>
                  </p>
                </div>
                <div className="sm:col-span-2 border-t border-line pt-8">
                  <h2 className="font-bold text-ink-primary">Políticas y condiciones</h2>
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

      <RoomDetailModal
        open={!!detailRoomId}
        listingId={listingId}
        roomId={detailRoomId}
        loggedIn={!!session}
        listingStatusLabel={listing.status}
        onClose={() => setDetailRoomId(null)}
      />

      {stateRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-state-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="room-state-title" className="text-lg font-bold text-ink-primary">
                  {stateRoom.status === 'Desactivada' || stateRoom.status === 'Pausada'
                    ? '¿Activar esta habitación?'
                    : '¿Desactivar esta habitación?'}
                </h2>
                <p className="mt-2 text-sm text-ink-secondary">
                  {stateRoom.status === 'Desactivada' || stateRoom.status === 'Pausada'
                    ? `La habitación “${stateRoom.name}” volverá a estar publicada y visible en el catálogo.`
                    : `La habitación “${stateRoom.name}” dejará de mostrarse en el catálogo hasta que la actives de nuevo.`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeStateModal}
                aria-label="Cerrar"
                disabled={stateBusy}
                className="rounded-lg p-2 text-ink-secondary hover:bg-surface-secondary disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {stateError ? (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{stateError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeStateModal} disabled={stateBusy}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => void confirmRoomStateChange()} disabled={stateBusy}>
                {stateBusy
                  ? 'Guardando…'
                  : stateRoom.status === 'Desactivada' || stateRoom.status === 'Pausada'
                    ? 'Sí, activar'
                    : 'Sí, desactivar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
