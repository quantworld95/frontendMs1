import { Car, Coffee, ConciergeBell, Dumbbell, ForkKnife, ParkingSquare, Waves, WashingMachine, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';

const services = [
  ['Wi-Fi', Wifi],
  ['Recepción 24 horas', ConciergeBell],
  ['Restaurante', ForkKnife],
  ['Estacionamiento', ParkingSquare],
  ['Piscina', Waves],
  ['Lavandería', WashingMachine],
  ['Desayuno incluido', Coffee],
  ['Gimnasio', Dumbbell],
  ['Traslado al aeropuerto', Car],
] as const;

export default function HotelServicesPage() {
  const { data, toggleAmenity } = useListingWizard();
  const establishmentLabel = data.type === 'Hostal' ? 'hostal' : 'hotel';

  return (
    <ListingWizardLayout step={4} title={`¿Qué servicios ofrece tu ${establishmentLabel}?`} subtitle="Selecciona las comodidades disponibles para tus huéspedes.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(([name, Icon]) => {
          const selected = data.amenities.includes(name);
          return <button type="button" key={name} onClick={() => toggleAmenity(name)} className={cn('flex items-center gap-3 rounded-xl border p-4 text-left transition', selected ? 'border-brand-primary bg-brand-light/60' : 'border-line hover:border-brand-primary/50')}>
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-ink-secondary')}><Icon className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-semibold text-ink-primary">{name}</span>
            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white', selected ? 'border-brand-primary bg-brand-primary' : 'border-[#bdc9d8]')}>{selected && <span className="text-xs">✓</span>}</span>
          </button>;
        })}
      </div>
      <p className="mt-5 text-xs text-ink-secondary">Puedes agregar otros servicios generales después de crear el establecimiento.</p>
    </ListingWizardLayout>
  );
}
