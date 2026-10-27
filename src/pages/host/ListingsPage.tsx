import { Link, useNavigate } from 'react-router-dom';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/utils/cn';
import { staticListings, type DetailListing } from '@/services/listings';
import {
  BedDouble,
  Building2,
  Home,
  MapPin,
  Plus,
  Star,
} from 'lucide-react';

export default function ListingsPage() {
  const { session, logout } = useDemoAuth();
  const navigate = useNavigate();
  const { reset, savedListing } = useListingWizard();
  const visibleListings: DetailListing[] = Object.values(staticListings).map((listing) => {
    if (savedListing && listing.id === savedListing.id) {
      const base = staticListings[listing.id];
      const typeLabel = base.category === 'Casa' ? 'Casa completa' : base.category === 'Departamento' ? 'Departamento completo' : base.category;
      return { ...listing, ...{
        name: savedListing.data.name || listing.name, description: savedListing.data.description, location: savedListing.data.neighborhood ? `${savedListing.data.neighborhood}, ${savedListing.data.city}` : savedListing.data.city, city: savedListing.data.city, neighborhood: savedListing.data.neighborhood, address: savedListing.data.address, guests: savedListing.data.guests, beds: savedListing.data.beds, bathrooms: savedListing.data.bathrooms, bedrooms: savedListing.data.bedrooms, price: savedListing.data.nightlyPrice, weeklyDiscount: savedListing.data.weeklyDiscount, monthlyDiscount: savedListing.data.monthlyDiscount, minimumStay: savedListing.data.minimumStay, checkIn: savedListing.data.checkIn, checkOut: savedListing.data.checkOut, cancellation: savedListing.data.cancellation, amenities: savedListing.data.amenities, status: 'Pendiente', type: typeLabel,
      }};
    }
    return listing;
  });

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
              Gestiona tus casas, departamentos, hoteles y hostales.
            </p>
          </div>
          <Link to="/host/listings/new/step-1" onClick={() => reset()} className="btn-primary w-full shrink-0 sm:w-auto">
            <Plus className="h-4 w-4" />
            Registrar alojamiento
          </Link>
        </div>

        {visibleListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleListings.map((listing) => (
              <article
                key={listing.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/host/listings/${listing.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') navigate(`/host/listings/${listing.id}`);
                }}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface-base shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              >
                <div className="relative aspect-[1.8/1] overflow-hidden bg-surface-secondary">
                  <img
                    src={listing.photos[0]}
                    alt={listing.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-bold text-ink-primary sm:text-base">{listing.name}</h2>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold',
                        listing.status === 'Publicado'
                          ? 'bg-emerald-50 text-emerald-700'
                          : listing.status === 'Pendiente'
                            ? 'bg-amber-50 text-amber-700'
                            : listing.status === 'Rechazado'
                              ? 'bg-rose-50 text-rose-700'
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
                        {listing.category === 'Casa' ? <Home className="h-3.5 w-3.5 text-brand-primary" /> : <Star className="h-3.5 w-3.5 text-brand-primary" />}
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
            <h2 className="mt-3 font-semibold">No hay alojamientos en esta categoría</h2>
            <p className="mt-1 text-sm text-ink-secondary">Prueba con otro filtro para ver tus propiedades.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
