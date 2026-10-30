import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/client';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/utils/cn';
import { listarMisAlojamientos } from '@/services/alojamientosApi';
import { fromAlojamientoResumen, type DetailListing } from '@/services/listings';
import {
  BedDouble,
  Building2,
  Home,
  Loader2,
  MapPin,
  Plus,
  Star,
} from 'lucide-react';

export default function ListingsPage() {
  const { session, logout } = useDemoAuth();
  const navigate = useNavigate();
  const { reset } = useListingWizard();
  const loggedIn = !!session;

  const [listings, setListings] = useState<DetailListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadListings = useCallback(async () => {
    if (!loggedIn) {
      setListings([]);
      setError('Inicia sesión para ver tus alojamientos.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const resumenes = await listarMisAlojamientos();
      const mapped = (Array.isArray(resumenes) ? resumenes : []).map(fromAlojamientoResumen);
      // Más recientes primero
      mapped.sort((a, b) => b.id.localeCompare(a.id));
      setListings(mapped);
    } catch (err) {
      setListings([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof TypeError
            ? 'No se pudo conectar con ms-01. ¿Está el backend encendido?'
            : 'No se pudieron cargar tus alojamientos.',
      );
    } finally {
      setLoading(false);
    }
  }, [loggedIn, session]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  return (
    <AppLayout hostName={session?.name} onLogout={logout}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-primary">
              <Building2 className="h-4 w-4" />
              <span>Panel de anfitrión</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mis alojamientos</h1>
            <p className="mt-1 text-sm text-ink-secondary sm:text-base">
              Se cargan desde ms-01 con GET /alojamientos.
            </p>
          </div>
          <Link
            to="/host/listings/new/step-1"
            onClick={() => reset()}
            className="btn-primary w-full shrink-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Registrar alojamiento
          </Link>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading && listings.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando alojamientos…
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/host/listings/${listing.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    navigate(`/host/listings/${listing.id}`);
                  }
                }}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-line bg-surface-base shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[1.8/1] overflow-hidden bg-surface-secondary">
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt={listing.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
                      Sin fotos
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-bold text-ink-primary sm:text-base">{listing.name}</h2>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold',
                        listing.status === 'Publicado'
                          ? 'bg-emerald-50 text-emerald-700'
                          : listing.status === 'Activo'
                            ? 'bg-teal-50 text-teal-700'
                            : listing.status === 'En revisión'
                              ? 'bg-amber-50 text-amber-700'
                              : listing.status === 'Rechazado'
                                ? 'bg-rose-50 text-rose-700'
                                : listing.status === 'Borrador'
                                  ? 'bg-sky-50 text-sky-700'
                                  : 'bg-slate-100 text-slate-600',
                      )}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-ink-secondary">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="inline-flex items-center gap-2">
                        <BedDouble className="h-3.5 w-3.5 text-brand-primary" />
                        {listing.roomsLabel}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        {listing.category === 'Casa' ? (
                          <Home className="h-3.5 w-3.5 text-brand-primary" />
                        ) : (
                          <Star className="h-3.5 w-3.5 text-brand-primary" />
                        )}
                        {listing.ratingLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-surface-base px-6 py-14 text-center">
            <Building2 className="mx-auto h-8 w-8 text-ink-secondary/60" />
            <h2 className="mt-3 font-semibold">Aún no tienes alojamientos</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Registra el primero para verlo aquí desde la API.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
