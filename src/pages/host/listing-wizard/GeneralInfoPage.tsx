import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { Input } from '@/components/ui/Input';

export default function GeneralInfoPage() {
  const { data, updateData } = useListingWizard();
  return (
    <ListingWizardLayout step={2} title="Cuéntanos sobre tu alojamiento" subtitle="Esta información ayudará a los viajeros a conocerte mejor.">
      <div className="space-y-5">
        <Input
          label="Título del anuncio"
          name="listing-name"
          required
          maxLength={100}
          value={data.name}
          onChange={(event) => updateData('name', event.target.value)}
          placeholder="Ej. Casa moderna con jardín en Equipetrol"
          hint={`${data.name.length}/100`}
        />
        <div>
          <label htmlFor="listing-description" className="label">Descripción <span className="text-brand-primary">*</span></label>
          <textarea
            id="listing-description"
            required
            maxLength={500}
            value={data.description}
            onChange={(event) => updateData('description', event.target.value)}
            placeholder="Describe tu alojamiento, lo que lo hace especial y para qué tipo de viajeros es ideal."
            className="input min-h-32 resize-y"
          />
          <p className="mt-1.5 text-right text-xs text-ink-secondary">{data.description.length}/500</p>
        </div>
      </div>
    </ListingWizardLayout>
  );
}
