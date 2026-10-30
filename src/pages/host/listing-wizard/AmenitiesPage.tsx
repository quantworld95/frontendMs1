import { useListingWizard } from '@/hooks/useListingWizard';
import { ListingWizardLayout } from '@/components/listings/ListingWizardLayout';
import { ServiceCatalogPicker } from '@/components/listings/ServiceCatalogPicker';
import HotelServicesPage from '@/pages/host/listing-wizard/HotelServicesPage';

export default function AmenitiesPage() {
  const { data } = useListingWizard();
  if (data.type === 'Hotel' || data.type === 'Hostal') return <HotelServicesPage />;

  return (
    <ListingWizardLayout
      step={4}
      title="¿Qué servicios incluye tu alojamiento?"
      subtitle="Selecciona las comodidades del catálogo de Aloja-Te."
    >
      <ServiceCatalogPicker footer="Al continuar se envían los ids seleccionados con el id del alojamiento." />
    </ListingWizardLayout>
  );
}
