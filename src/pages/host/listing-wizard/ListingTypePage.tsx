import { Building2, Home, Hotel, Warehouse } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { useListingWizard, type ListingType } from '@/hooks/useListingWizard';

const options: { type: ListingType; title: string; description: string; icon: typeof Home; available: boolean }[] = [
  { type: 'Casa', title: 'Casa completa', description: 'Todo el espacio para tus huéspedes', icon: Home, available: true },
  { type: 'Departamento', title: 'Departamento completo', description: 'Un departamento completo para tus huéspedes', icon: Building2, available: true },
  { type: 'Hotel', title: 'Hotel', description: 'Varias habitaciones para tus huéspedes', icon: Hotel, available: true },
  { type: 'Hostal', title: 'Hostal', description: 'Habitaciones privadas o compartidas', icon: Warehouse, available: true },
];

export default function ListingTypePage() {
  const { data, updateData } = useListingWizard();
  return (
    <ListingWizardLayout step={1} title="¿Qué tipo de alojamiento vas a ofrecer?" subtitle="Selecciona el tipo de alojamiento que mejor describe tu espacio.">
      <div className="grid gap-3">
        {options.map(({ type, title, description, icon: Icon, available }) => {
          const selected = data.type === type;
          return (
            <button
              key={type}
              type="button"
              disabled={!available}
              onClick={() => updateData('type', type)}
              className={cn(
                'flex items-center gap-4 rounded-xl border p-4 text-left transition sm:p-5',
                selected ? 'border-brand-primary bg-brand-light/60 ring-1 ring-brand-primary' : 'border-line bg-white hover:border-brand-primary/50',
                !available && 'cursor-not-allowed opacity-60',
              )}
            >
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-brand-primary text-white' : 'bg-surface-secondary text-brand-primary')}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold text-ink-primary">
                  {title}
                  {!available && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">Próximamente</span>}
                </span>
                <span className="mt-1 block text-sm text-ink-secondary">{description}</span>
              </span>
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-brand-primary' : 'border-[#b5c3d6]')}>
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
              </span>
            </button>
          );
        })}
      </div>
    </ListingWizardLayout>
  );
}
