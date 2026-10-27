import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';

const checkInTimes = ['14:00', '15:00', '16:00', '17:00'];
const checkOutTimes = ['10:00', '11:00', '12:00'];

export default function HotelConditionsPage() {
  const { data, updateData } = useListingWizard();
  const establishmentLabel = data.type === 'Hostal' ? 'hostal' : 'hotel';

  return <ListingWizardLayout step={5} title={`Define las políticas de tu ${establishmentLabel}`} subtitle="Estas condiciones aplicarán a todas las habitaciones del establecimiento.">
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="hotel-check-in" className="label">Hora de entrada (check-in) <span className="text-brand-primary">*</span></label><select id="hotel-check-in" className="input" value={data.checkIn} onChange={(event) => updateData('checkIn', event.target.value)}>{checkInTimes.map((time) => <option key={time}>{time}</option>)}</select></div>
        <div><label htmlFor="hotel-check-out" className="label">Hora de salida (check-out) <span className="text-brand-primary">*</span></label><select id="hotel-check-out" className="input" value={data.checkOut} onChange={(event) => updateData('checkOut', event.target.value)}>{checkOutTimes.map((time) => <option key={time}>{time}</option>)}</select></div>
      </div>
      <div><label htmlFor="hotel-cancellation" className="label">Política de cancelación <span className="text-brand-primary">*</span></label><select id="hotel-cancellation" className="input" value={data.cancellation} onChange={(event) => updateData('cancellation', event.target.value as typeof data.cancellation)}><option>Flexible</option><option>Moderada</option><option>Estricta</option></select></div>
      <div><label htmlFor="hotel-stay-conditions" className="label">Condiciones generales de estadía <span className="text-brand-primary">*</span></label><textarea id="hotel-stay-conditions" required maxLength={500} value={data.stayConditions} onChange={(event) => updateData('stayConditions', event.target.value)} placeholder="Ej. No se permiten fiestas. Se requiere documento de identidad al registrarse." className="input min-h-32 resize-y" /><p className="mt-1.5 text-right text-xs text-ink-secondary">{data.stayConditions.length}/500</p></div>
      <p className="rounded-lg bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">El precio y las condiciones específicas de cada habitación se configurarán después de crear el establecimiento.</p>
    </div>
  </ListingWizardLayout>;
}
