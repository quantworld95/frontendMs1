import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { ServiceCatalogPicker } from '@/components/listings/ServiceCatalogPicker';

export default function HotelServicesPage() {
  const { data } = useListingWizard();
  const establishmentLabel = data.type === 'Hostal' ? 'hostal' : 'hotel';

  return (
    <ListingWizardLayout
      step={4}
      title={`¿Qué servicios ofrece tu ${establishmentLabel}?`}
      subtitle="Selecciona las comodidades del catálogo de Aloja-Te."
    >
      <ServiceCatalogPicker footer="Los servicios se guardan con los ids del catálogo de ms-01." />
    </ListingWizardLayout>
  );
}
