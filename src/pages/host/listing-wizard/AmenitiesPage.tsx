import { Bath, Car, Fan, Laptop, Microwave, Refrigerator, Tv, WashingMachine, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import HotelServicesPage from '@/pages/host/listing-wizard/HotelServicesPage';

const amenities = [
  ['Wi-Fi', Wifi], ['Aire acondicionado', Fan], ['Cocina equipada', Microwave], ['Estacionamiento', Car],
  ['Lavadora', WashingMachine], ['Secadora', Refrigerator], ['TV', Tv], ['Espacio de trabajo', Laptop], ['Baño privado', Bath],
] as const;

export default function AmenitiesPage() {
  const { data, toggleAmenity } = useListingWizard();
  if (data.type === 'Hotel' || data.type === 'Hostal') return <HotelServicesPage />;
  return (
    <ListingWizardLayout step={4} title="¿Qué servicios incluye tu alojamiento?" subtitle="Selecciona las comodidades que ofreces a tus huéspedes.">
      <div className="grid gap-3 sm:grid-cols-2">
        {amenities.map(([name, Icon]) => {
          const selected = data.amenities.includes(name);
          return <button type="button" key={name} onClick={() => toggleAmenity(name)} className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition', selected ? 'border-brand-primary bg-brand-light/60' : 'border-line hover:border-brand-primary/50')}>
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', selected ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-ink-secondary')}><Icon className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-semibold text-ink-primary">{name}</span>
            <span className={cn('flex h-5 w-5 items-center justify-center rounded border text-white', selected ? 'border-brand-primary bg-brand-primary' : 'border-[#bdc9d8')}>
              {selected && <span className="text-xs">✓</span>}
            </span>
          </button>;
        })}
      </div>
      <button type="button" className="mt-5 text-sm font-semibold text-brand-primary hover:underline">+ Agregar otros servicios</button>
    </ListingWizardLayout>
  );
}
