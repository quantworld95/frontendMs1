import { Minus, Plus } from 'lucide-react';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import HotelConditionsPage from '@/pages/host/listing-wizard/HotelConditionsPage';

interface CounterProps { label: string; value: number; unit: string; onChange: (value: number) => void; required?: boolean; }
function Counter({ label, value, unit, onChange, required }: CounterProps) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-line p-4"><div><p className="text-sm font-semibold text-ink-primary">{label} {required && <span className="text-brand-primary">*</span>}</p><p className="mt-1 text-xs text-ink-secondary">{unit}</p></div><div className="flex items-center gap-3"><button type="button" aria-label={`Reducir ${label}`} onClick={() => onChange(Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"><Minus className="h-4 w-4" /></button><span className="w-6 text-center font-bold text-ink-primary">{value}</span><button type="button" aria-label={`Aumentar ${label}`} onClick={() => onChange(value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-surface-secondary"><Plus className="h-4 w-4" /></button></div></div>;
}

export default function FeaturesPage() {
  const { data, updateData } = useListingWizard();
  if (data.type === 'Hotel' || data.type === 'Hostal') return <HotelConditionsPage />;
  return <ListingWizardLayout step={5} title="Cuéntanos más sobre tu alojamiento" subtitle="Indica las características principales.">
    <div className="space-y-3">
      <Counter label="Capacidad máxima de huéspedes" value={data.guests} unit="personas" required onChange={(value) => updateData('guests', value)} />
      <Counter label="Número de dormitorios" value={data.bedrooms} unit="habitaciones" required onChange={(value) => updateData('bedrooms', value)} />
      <Counter label="Número de camas" value={data.beds} unit="camas" required onChange={(value) => updateData('beds', value)} />
      <Counter label="Número de baños" value={data.bathrooms} unit="baños" required onChange={(value) => updateData('bathrooms', value)} />
    </div>
  </ListingWizardLayout>;
}
