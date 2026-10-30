import { useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { iconForService } from '@/utils/serviceIcons';
import { useDemoAuth } from '@/hooks/useDemoAuth';
import { useListingWizard } from '@/hooks/useListingWizard';
import type { ServicioCatalogo } from '@/types/alojamientos';

interface ServiceCatalogPickerProps {
  footer?: string;
}

export function ServiceCatalogPicker({ footer }: ServiceCatalogPickerProps) {
  const { session } = useDemoAuth();
  const {
    data,
    toggleServicio,
    catalogos,
    catalogosLoading,
    error,
    loadCatalogos,
  } = useListingWizard();

  const loggedIn = !!session;
  const servicios: ServicioCatalogo[] = catalogos?.servicios ?? [];

  useEffect(() => {
    if (!loggedIn || catalogos || catalogosLoading) return;
    void loadCatalogos();
  }, [loggedIn, catalogos, catalogosLoading, loadCatalogos]);

  return (
    <div className="space-y-4">
      {!loggedIn && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Inicia sesión para cargar el catálogo de servicios.
        </div>
      )}

      {catalogosLoading && (
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando servicios desde la API…
        </div>
      )}

      {!catalogosLoading && loggedIn && error && !catalogos && (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      {catalogos && servicios.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          El catálogo de servicios respondió vacío.
        </div>
      )}

      {servicios.length > 0 && (
        <>
          <p className="text-xs text-ink-secondary">
            {servicios.length} servicio(s) desde <code>/catalogos-alojamiento</code>
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio) => {
              const selected = data.servicioIds.includes(servicio.id);
              const Icon = iconForService(servicio.nombre);
              return (
                <button
                  type="button"
                  key={servicio.id}
                  onClick={() => toggleServicio(servicio.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3.5 text-left transition',
                    selected
                      ? 'border-brand-primary bg-brand-light/60'
                      : 'border-line hover:border-brand-primary/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      selected
                        ? 'bg-brand-primary text-white'
                        : 'bg-surface-secondary text-ink-secondary',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-primary">{servicio.nombre}</span>
                    {servicio.categoria ? (
                      <span className="block text-xs text-ink-secondary">{servicio.categoria}</span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white',
                      selected ? 'border-brand-primary bg-brand-primary' : 'border-[#bdc9d8]',
                    )}
                  >
                    {selected && <span className="text-xs">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
          {footer ? <p className="text-xs text-ink-secondary">{footer}</p> : null}
        </>
      )}
    </div>
  );
}
