import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { Input } from '@/components/ui/Input';
import HotelPhotosPage from '@/pages/host/listing-wizard/HotelPhotosPage';

export default function PricingPage() {
  const { data, updateData } = useListingWizard();
  if (data.type === 'Hotel' || data.type === 'Hostal') return <HotelPhotosPage />;

  return (
    <ListingWizardLayout
      step={6}
      title="Define el precio y las condiciones"
      subtitle="Al continuar se guarda en ms-01 solo lo que soporta la API."
    >
      <div className="space-y-5">
        <Input
          label="Precio por noche (Bs.)"
          name="nightly-price"
          required
          type="number"
          min="1"
          value={data.nightlyPrice}
          onChange={(event) => updateData('nightlyPrice', event.target.value)}
          placeholder="350"
        />

        <div className="rounded-xl border border-line p-4">
          <p className="text-sm font-semibold text-ink-primary">
            Descuentos <span className="font-normal text-ink-secondary">(opcional · solo local)</span>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              label="Semanal (7 noches o más)"
              name="weekly-discount"
              type="number"
              min="0"
              max="100"
              value={data.weeklyDiscount}
              onChange={(event) => updateData('weeklyDiscount', event.target.value)}
              placeholder="10"
            />
            <Input
              label="Mensual (28 noches o más)"
              name="monthly-discount"
              type="number"
              min="0"
              max="100"
              value={data.monthlyDiscount}
              onChange={(event) => updateData('monthlyDiscount', event.target.value)}
              placeholder="20"
            />
          </div>
          <p className="mt-3 text-xs text-ink-secondary">
            Estos descuentos y la estadía mínima se muestran aquí, pero no se envían a ms-01 todavía.
          </p>
        </div>

        <div>
          <p className="label">
            Estadía mínima <span className="text-brand-primary">*</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateData('minimumStay', Math.max(1, data.minimumStay - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line"
            >
              −
            </button>
            <span className="flex h-9 min-w-12 items-center justify-center rounded-lg border border-line font-semibold">
              {data.minimumStay}
            </span>
            <button
              type="button"
              onClick={() => updateData('minimumStay', data.minimumStay + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line"
            >
              +
            </button>
            <span className="text-sm text-ink-secondary">noches</span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="check-in" className="label">
              Hora de entrada
            </label>
            <select
              id="check-in"
              className="input"
              value={data.checkIn}
              onChange={(event) => updateData('checkIn', event.target.value)}
            >
              {['14:00', '15:00', '16:00', '17:00'].map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="check-out" className="label">
              Hora de salida
            </label>
            <select
              id="check-out"
              className="input"
              value={data.checkOut}
              onChange={(event) => updateData('checkOut', event.target.value)}
            >
              {['10:00', '11:00', '12:00'].map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="cancellation" className="label">
            Política de cancelación
          </label>
          <select
            id="cancellation"
            className="input"
            value={data.cancellation}
            onChange={(event) =>
              updateData('cancellation', event.target.value as typeof data.cancellation)
            }
          >
            <option>Flexible</option>
            <option>Moderada</option>
            <option>Estricta</option>
          </select>
        </div>

        <div>
          <label htmlFor="stay-conditions" className="label">
            Condiciones adicionales
          </label>
          <textarea
            id="stay-conditions"
            maxLength={500}
            value={data.stayConditions}
            onChange={(event) => updateData('stayConditions', event.target.value)}
            placeholder="Ej. No se permiten fiestas. Se requiere documento de identidad."
            className="input min-h-28 resize-y"
          />
          <p className="mt-1.5 text-right text-xs text-ink-secondary">
            {data.stayConditions.length}/500
          </p>
        </div>
      </div>
    </ListingWizardLayout>
  );
}
