import { MapPin } from 'lucide-react';
import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { Input } from '@/components/ui/Input';

const cities = ['Santa Cruz de la Sierra', 'La Paz', 'Cochabamba', 'Sucre', 'Tarija', 'Trinidad', 'Oruro', 'Potosí', 'Cobija'];

export default function LocationPage() {
  const { data, updateData } = useListingWizard();
  return (
    <ListingWizardLayout step={3} title="¿Dónde se encuentra tu alojamiento?" subtitle="Indica la ubicación para que los viajeros puedan encontrarte.">
      <div className="space-y-5">
        <Input label="Dirección" name="address" required value={data.address} onChange={(event) => updateData('address', event.target.value)} placeholder="Ej. Av. San Martín 1234" leftIcon={<MapPin className="h-4 w-4" />} />
        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-line bg-[#e8f0ee]">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(32deg, transparent 44%, #d3dfdb 45%, #d3dfdb 47%, transparent 48%), linear-gradient(118deg, transparent 44%, #cbd9d5 45%, #cbd9d5 47%, transparent 48%)', backgroundSize: '110px 80px' }} />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-8 ring-brand-primary/20"><MapPin className="h-6 w-6" /></span>
          <span className="absolute bottom-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-ink-primary shadow-sm">Ajustar ubicación en el mapa</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="country" className="label">País <span className="text-brand-primary">*</span></label><select id="country" className="input" value={data.country} disabled><option>Bolivia</option></select></div>
          <div><label htmlFor="city" className="label">Ciudad <span className="text-brand-primary">*</span></label><select id="city" className="input" value={data.city} onChange={(event) => updateData('city', event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></div>
        </div>
        <Input label="Barrio o zona" name="neighborhood" value={data.neighborhood} onChange={(event) => updateData('neighborhood', event.target.value)} placeholder="Ej. Equipetrol" hint="Opcional" />
      </div>
    </ListingWizardLayout>
  );
}
