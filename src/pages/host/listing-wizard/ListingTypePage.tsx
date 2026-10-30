import { Building2, Home, Hotel, Loader2, RefreshCw, Warehouse } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard, type ListingType } from '@/hooks/useListingWizard';

function mapCatalogNameToType(nombre: string): ListingType | null {
  const n = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  // Cabaña ya no es una opción válida del producto.
  if (n.includes('caba')) return null;
  if (n.includes('casa')) return 'Casa';
  if (n.includes('departamento')) return 'Departamento';
  if (n.includes('hotel')) return 'Hotel';
  if (n.includes('hostal')) return 'Hostal';
  // Habitación usa flujo de establecimiento por ahora
  if (n.includes('habitacion')) return 'Hotel';
  return null;
}

function iconForType(type: ListingType) {
  if (type === 'Casa') return Home;
  if (type === 'Departamento') return Building2;
  if (type === 'Hotel') return Hotel;
  return Warehouse;
}

function descriptionForType(type: ListingType, nombreCatalogo: string): string {
  if (type === 'Casa') return 'Todo el espacio para tus huéspedes';
  if (type === 'Departamento') return 'Un departamento completo para tus huéspedes';
  if (type === 'Hotel') {
    const n = nombreCatalogo
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
    if (n.includes('habitacion')) {
      return 'Una habitación dentro de un establecimiento';
    }
    return 'Varias habitaciones para tus huéspedes';
  }
  return 'Habitaciones privadas o compartidas';
}

export default function ListingTypePage() {
  const { session } = useDemoAuth();
  const {
    data,
    selectTipoPropiedad,
    catalogos,
    catalogosLoading,
    error,
    loadCatalogos,
  } = useListingWizard();

  const options =
    catalogos?.tiposPropiedad
      .map((item) => {
        const type = mapCatalogNameToType(item.nombre);
        if (!type) return null;
        return {
          catalogId: item.id,
          type,
          title: item.nombre,
          description: descriptionForType(type, item.nombre),
          icon: iconForType(type),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null) ?? [];

  const loggedIn = !!session;

  return (
    <ListingWizardLayout
      step={1}
      title="¿Qué tipo de alojamiento vas a ofrecer?"
      subtitle="Los tipos se cargan desde el catálogo de Aloja-Te (ms-01)."
    >
      {!loggedIn && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Inicia sesión para cargar los tipos de alojamiento.
        </div>
      )}

      {catalogosLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando tipos de propiedad desde la API…
        </div>
      )}

      {!catalogosLoading && loggedIn && error && !catalogos && (
        <div className="mb-4 space-y-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadCatalogos()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      )}

      {!catalogosLoading && catalogos && options.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          El catálogo respondió vacío o sin tipos reconocibles.
        </div>
      )}

      {catalogos && options.length > 0 && (
        <p className="mb-3 text-xs text-ink-secondary">
          {options.length} tipo(s) desde <code>/catalogos-alojamiento</code>
        </p>
      )}

      <div className="grid gap-3">
        {options.map(({ catalogId, type, title, description, icon: Icon }) => {
          const selected = data.tipoPropiedadId === catalogId;
          return (
            <button
              key={catalogId}
              type="button"
              onClick={() => selectTipoPropiedad(catalogId, type)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
                selected
                  ? 'border-brand-primary bg-brand-light/60 ring-1 ring-brand-primary'
                  : 'border-line bg-white hover:border-brand-primary/50',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  selected ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-brand-primary',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-ink-primary">{title}</span>
                <span className="mt-1 block text-sm text-ink-secondary">{description}</span>
              </span>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  selected ? 'border-brand-primary' : 'border-[#b5c3d6]',
                )}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
              </span>
            </button>
          );
        })}
      </div>
    </ListingWizardLayout>
  );
}
