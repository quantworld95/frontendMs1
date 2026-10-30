import { useEffect, useState } from 'react';
import { Bath, BedDouble, Image as ImageIcon, Loader2, Users, X } from 'lucide-react';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { obtenerUnidad } from '@/services/alojamientosApi';
import type { UnidadAlojamiento } from '@/types/alojamientos';
import { iconForService } from '@/utils/serviceIcons';

interface RoomDetailModalProps {
  open: boolean;
  listingId: string;
  roomId: string | null;
  loggedIn: boolean;
  listingStatusLabel?: string;
  onClose: () => void;
}

export function RoomDetailModal({
  open,
  listingId,
  roomId,
  loggedIn,
  listingStatusLabel,
  onClose,
}: RoomDetailModalProps) {
  const [unidad, setUnidad] = useState<UnidadAlojamiento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  useEffect(() => {
    if (!open || !roomId || !loggedIn) {
      setUnidad(null);
      setError('');
      setShowAllServices(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    void obtenerUnidad(listingId, roomId)
      .then((data) => {
        if (!cancelled) setUnidad(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setUnidad(null);
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudo cargar el detalle de la habitación.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, listingId, roomId, loggedIn]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const fotos = [...(unidad?.fotografias ?? [])].sort((a, b) => a.orden - b.orden);
  const hero = fotos[0]?.url;
  const extras = fotos.slice(1, 3);
  const servicios = unidad?.servicios ?? [];
  const visibleServices = showAllServices ? servicios : servicios.slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-detail-title"
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-ink-secondary">Detalle de habitación</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-ink-secondary transition hover:bg-surface-secondary hover:text-ink-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
              Cargando habitación…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : unidad ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="space-y-2">
                {hero ? (
                  <img
                    src={hero}
                    alt={unidad.nombre}
                    referrerPolicy="no-referrer"
                    className="aspect-[16/10] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-line bg-surface-secondary/70 text-ink-secondary">
                    <ImageIcon className="h-8 w-8 text-brand-primary" />
                  </div>
                )}
                {extras.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {extras.map((foto) => (
                      <img
                        key={foto.id}
                        src={foto.url}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] w-full rounded-xl object-cover"
                      />
                    ))}
                    {extras.length === 1 ? (
                      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-surface-secondary text-xs font-semibold text-ink-secondary">
                        {fotos.length} foto{fotos.length === 1 ? '' : 's'}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2
                    id="room-detail-title"
                    className="text-2xl font-bold tracking-tight text-ink-primary"
                  >
                    {unidad.nombre}
                  </h2>
                  {listingStatusLabel ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {listingStatusLabel}
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-ink-secondary">
                  {unidad.cantidadCamas} {unidad.cantidadCamas === 1 ? 'cama' : 'camas'} ·{' '}
                  {unidad.capacidadHuespedes} huéspedes · {unidad.inventarioTotal}{' '}
                  {unidad.inventarioTotal === 1 ? 'unidad' : 'unidades'}
                </p>

                {unidad.descripcion ? (
                  <p className="mt-4 text-sm leading-6 text-ink-secondary">{unidad.descripcion}</p>
                ) : null}

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-line p-3">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                      Capacidad
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-primary">
                      {unidad.capacidadHuespedes} huéspedes
                    </p>
                  </div>
                  <div className="rounded-xl border border-line p-3">
                    <BedDouble className="h-4 w-4 text-brand-primary" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                      Camas
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-primary">{unidad.cantidadCamas}</p>
                  </div>
                  <div className="rounded-xl border border-line p-3">
                    <Bath className="h-4 w-4 text-brand-primary" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                      Baños
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink-primary">
                      {Number(unidad.cantidadBanos)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-line pt-5">
                  <h3 className="font-bold text-ink-primary">Lo que ofrece esta habitación</h3>
                  {servicios.length ? (
                    <>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {visibleServices.map((servicio) => {
                          const Icon = iconForService(servicio.nombre);
                          return (
                            <span
                              key={servicio.id}
                              className="inline-flex items-center gap-3 text-sm text-ink-secondary"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light/60 text-brand-primary">
                                <Icon className="h-4 w-4" />
                              </span>
                              {servicio.nombre}
                            </span>
                          );
                        })}
                      </div>
                      {servicios.length > 6 ? (
                        <button
                          type="button"
                          onClick={() => setShowAllServices((value) => !value)}
                          className="mt-4 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-primary transition hover:bg-surface-secondary"
                        >
                          {showAllServices
                            ? 'Mostrar menos'
                            : `Mostrar las ${servicios.length} comodidades`}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-line bg-surface-secondary/50 px-4 py-3 text-sm text-ink-secondary">
                      Esta habitación no tiene servicios propios. Al crear o editar el tipo,
                      selecciónalos en el paso de características (wifi, aire, TV, etc.).
                    </p>
                  )}
                </div>

                <div className="mt-auto border-t border-line pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                    Precio por noche
                  </p>
                  <p className="mt-1 text-2xl font-bold text-ink-primary">
                    Bs {unidad.precioNoche}{' '}
                    <span className="text-sm font-normal text-ink-secondary">/ noche</span>
                  </p>
                  <Button type="button" className="mt-4 w-full" onClick={onClose}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
